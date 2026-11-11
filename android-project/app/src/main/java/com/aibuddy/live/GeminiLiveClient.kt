package com.aibuddy.live

import android.util.Base64
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.*
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

class GeminiLiveClient(
    private val scope: CoroutineScope,
    private val onAudioReceived: (ByteArray) -> Unit,
    private val onInterrupted: () -> Unit
) {
    companion object {
        private const val TAG = "GeminiLive"
    }

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .pingInterval(30, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    private var webSocket: WebSocket? = null
    private val isConnected = AtomicBoolean(false)
    private val isConnectingOrConnected = AtomicBoolean(false)
    private val isReadyForAudio = AtomicBoolean(false)
    private val isManualDisconnect = AtomicBoolean(false)

    private var resumptionHandle: String? = null
    private var reconnectAttempts = 0
    private val MAX_RECONNECT_ATTEMPTS = 5
    private var reconnectJob: Job? = null
    private var currentApiKey: String = ""
    private var currentVoiceName: String = "Puck"

    private val _sessionState = MutableStateFlow(AudioSessionState.IDLE)
    val sessionState: StateFlow<AudioSessionState> = _sessionState.asStateFlow()

    private val _metrics = MutableStateFlow(LiveSessionMetrics())
    val metrics: StateFlow<LiveSessionMetrics> = _metrics.asStateFlow()

    private val _transcripts = MutableStateFlow<List<LiveTranscriptEntry>>(emptyList())
    val transcripts: StateFlow<List<LiveTranscriptEntry>> = _transcripts.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private var connectionStartTime = 0L
    private var lastUserTurnEndTimestamp = 0L
    private var isAwaitingFirstAudio = false

    // Sequential message queue to guarantee FIFO order across frames
    private var messageProcessingJob: Job? = null
    private var incomingMessageChannel = Channel<String>(Channel.UNLIMITED)

    // Turn tracking for coherent sentence-level transcript grouping
    private var isBuddyTurnActive = false
    private var isUserTurnActive = false

    fun isReady(): Boolean = isConnected.get() && isReadyForAudio.get()

    fun connect(apiKey: String, voiceName: String = "Puck") {
        currentApiKey = apiKey
        currentVoiceName = voiceName
        isManualDisconnect.set(false)
        reconnectAttempts = 0
        connectInternal(apiKey, voiceName, isReconnect = false)
    }

    private fun connectInternal(apiKey: String, voiceName: String, isReconnect: Boolean) {
        if (apiKey.isBlank()) {
            _sessionState.value = AudioSessionState.ERROR
            _errorMessage.value = "Gemini API Key is empty. Configure GEMINI_API_KEY in local.properties."
            Log.e(TAG, "API Key is empty!")
            return
        }

        if (!isConnectingOrConnected.compareAndSet(false, true)) {
            Log.w(TAG, "connect() ignored: already connecting or connected")
            return
        }

        _sessionState.value = if (isReconnect) AudioSessionState.RECONNECTING else AudioSessionState.CONNECTING
        if (!isReconnect) {
            _errorMessage.value = null
        }
        isReadyForAudio.set(false)
        connectionStartTime = System.currentTimeMillis()

        // Initialize single FIFO reader for strictly ordered message handling
        messageProcessingJob?.cancel()
        incomingMessageChannel = Channel(Channel.UNLIMITED)
        isBuddyTurnActive = false
        isUserTurnActive = false

        messageProcessingJob = scope.launch(Dispatchers.Default) {
            for (text in incomingMessageChannel) {
                if (!isActive) break
                handleServerMessage(text, isReconnect)
            }
        }

        val url = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=$apiKey"
        Log.d(TAG, "Connecting to Gemini Live WebSocket endpoint (isReconnect=$isReconnect)...")
        val request = Request.Builder().url(url).build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                isConnected.set(true)
                val connectDuration = System.currentTimeMillis() - connectionStartTime
                _metrics.value = _metrics.value.copy(connectionLatencyMs = connectDuration)
                Log.d(TAG, "WebSocket opened in ${connectDuration}ms. Sending setup frame...")

                // Send setup frame with session resumption handle if available
                val setupMessage = LiveClientSetup(
                    setup = LiveSetupConfig(
                        model = "models/gemini-3.8-live",
                        generationConfig = LiveGenerationConfig(
                            responseModalities = listOf("AUDIO"),
                            speechConfig = LiveSpeechConfig(
                                voiceConfig = LiveVoiceConfig(
                                    prebuiltVoiceConfig = LivePrebuiltVoiceConfig(voiceName = voiceName)
                                )
                            )
                        ),
                        inputAudioTranscription = LiveAudioTranscriptionConfig(),
                        outputAudioTranscription = LiveAudioTranscriptionConfig(),
                        sessionResumption = resumptionHandle?.let {
                            Log.d(TAG, "Resuming session with token: $it")
                            LiveSessionResumptionConfig(handle = it)
                        } ?: LiveSessionResumptionConfig(),
                        systemInstruction = LiveContent(
                            parts = listOf(
                                LiveTextPart(
                                    text = com.aibuddy.data.prompt.BuddyPrompts.MASTER_LIVE_SYSTEM_INSTRUCTION
                                )
                            )
                        )
                    )
                )

                val setupJson = json.encodeToString(setupMessage)
                ws.send(setupJson)
                Log.d(TAG, "Setup frame sent, awaiting setupComplete...")
            }

            override fun onMessage(ws: WebSocket, text: String) {
                incomingMessageChannel.trySend(text)
            }

            override fun onMessage(ws: WebSocket, bytes: okio.ByteString) {
                incomingMessageChannel.trySend(bytes.utf8())
            }

            override fun onClosing(ws: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closing: code=$code, reason=$reason")
                isConnected.set(false)
                isConnectingOrConnected.set(false)
                isReadyForAudio.set(false)
                if (code != 1000 && !isManualDisconnect.get()) {
                    triggerAutoReconnect("Kode $code: $reason")
                } else {
                    _sessionState.value = AudioSessionState.IDLE
                }
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket failure: ${t.message}", t)
                isConnected.set(false)
                isConnectingOrConnected.set(false)
                isReadyForAudio.set(false)
                val httpDetail = response?.let { " (HTTP ${it.code}: ${it.message})" } ?: ""
                val errReason = "${t.localizedMessage ?: "Gangguan koneksi"}$httpDetail"
                if (!isManualDisconnect.get()) {
                    triggerAutoReconnect(errReason)
                } else {
                    _sessionState.value = AudioSessionState.ERROR
                    _errorMessage.value = "WebSocket error: $errReason"
                }
            }
        })
    }

    private fun triggerAutoReconnect(reason: String) {
        if (isManualDisconnect.get()) return
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            _sessionState.value = AudioSessionState.ERROR
            _errorMessage.value = "Koneksi terputus ($reason). Silakan ketuk tombol panggilan untuk menghubungkan ulang."
            Log.e(TAG, "Max reconnect attempts reached ($MAX_RECONNECT_ATTEMPTS). Stopping retry.")
            return
        }

        reconnectAttempts++
        _sessionState.value = AudioSessionState.RECONNECTING
        _errorMessage.value = "Koneksi terganggu. Menghubungkan ulang ($reconnectAttempts/$MAX_RECONNECT_ATTEMPTS)..."
        Log.w(TAG, "Auto-reconnect attempt $reconnectAttempts/$MAX_RECONNECT_ATTEMPTS in progress (cause: $reason)")

        reconnectJob?.cancel()
        reconnectJob = scope.launch(Dispatchers.IO) {
            val backoffMs = (1000L * reconnectAttempts).coerceAtMost(4000L)
            delay(backoffMs)
            if (!isActive || isManualDisconnect.get()) return@launch

            // Reset connection flags before reconnecting
            isConnected.set(false)
            isConnectingOrConnected.set(false)
            isReadyForAudio.set(false)

            connectInternal(currentApiKey, currentVoiceName, isReconnect = true)
        }
    }

    private fun handleServerMessage(text: String, isReconnect: Boolean) {
        try {
            val message = json.decodeFromString<LiveServerMessage>(text)

            // Check for server error
            val serverError = message.error
            if (serverError != null) {
                val err = "Server error ${serverError.code ?: ""}: ${serverError.message ?: "Unknown"}"
                Log.e(TAG, err)
                if (!isManualDisconnect.get() && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    triggerAutoReconnect(err)
                } else {
                    _errorMessage.value = err
                    _sessionState.value = AudioSessionState.ERROR
                }
                return
            }

            // Check for sessionResumptionUpdate
            message.sessionResumptionUpdate?.let { update ->
                if (!update.newHandle.isNullOrBlank()) {
                    resumptionHandle = update.newHandle
                    Log.d(TAG, "Saved session resumption handle: ${update.newHandle}")
                }
            }

            // Check for setupComplete
            if (message.setupComplete != null) {
                Log.d(TAG, "Received setupComplete from server! Ready for live conversation.")
                isReadyForAudio.set(true)
                _sessionState.value = AudioSessionState.LISTENING
                reconnectAttempts = 0
                _errorMessage.value = null

                if (!isReconnect) {
                    // Trigger Buddy to greet the user with spoken voice
                    sendGreetingPrompt()
                } else {
                    Log.d(TAG, "Resumed existing session without re-greeting.")
                }
                return
            }

            // Check for server voice activity signals
            message.voiceActivity?.type?.let { type ->
                Log.d(TAG, "Server voiceActivity event: $type")
                if (type == "ACTIVITY_START") {
                    if (_sessionState.value == AudioSessionState.BUDDY_SPEAKING) {
                        Log.d(TAG, "Server detected user speech during Buddy turn -> barge-in")
                        onInterrupted()
                        isBuddyTurnActive = false
                    }
                    _sessionState.value = AudioSessionState.USER_SPEAKING
                } else if (type == "ACTIVITY_END") {
                    _sessionState.value = AudioSessionState.PROCESSING
                    lastUserTurnEndTimestamp = System.currentTimeMillis()
                    isAwaitingFirstAudio = true
                    isUserTurnActive = false
                }
            }

            val content = message.serverContent ?: return

            // 1. Interruption handling (User barge-in detected by server)
            if (content.interrupted == true) {
                Log.d(TAG, "Server detected barge-in interruption!")
                _sessionState.value = AudioSessionState.INTERRUPTED
                isAwaitingFirstAudio = false
                isBuddyTurnActive = false
                isUserTurnActive = false
                val current = _transcripts.value.toMutableList()
                if (current.isNotEmpty() && !current.last().isFinal) {
                    val lastIdx = current.lastIndex
                    current[lastIdx] = current[lastIdx].copy(isFinal = true)
                    _transcripts.value = current
                }
                onInterrupted()
                return
            }

            // 2. Incoming Audio Output
            val parts = content.modelTurn?.parts
            if (!parts.isNullOrEmpty()) {
                for (part in parts) {
                    val base64Data = part.inlineData?.data
                    if (!base64Data.isNullOrBlank()) {
                        if (isAwaitingFirstAudio && lastUserTurnEndTimestamp > 0) {
                            val ttfa = System.currentTimeMillis() - lastUserTurnEndTimestamp
                            _metrics.value = _metrics.value.copy(timeToFirstAudioMs = ttfa)
                            Log.d(TAG, "Time to First Audio (TTFA): ${ttfa}ms")
                            isAwaitingFirstAudio = false
                        }

                        val pcmBytes = Base64.decode(base64Data, Base64.NO_WRAP)
                        _metrics.value = _metrics.value.copy(
                            chunksReceived = _metrics.value.chunksReceived + 1
                        )
                        _sessionState.value = AudioSessionState.BUDDY_SPEAKING
                        onAudioReceived(pcmBytes)
                    }
                }
            }

            // 3. Transcription handling (Turn-based accumulation into single bubbles)
            content.inputTranscription?.text?.let { userText ->
                if (userText.isNotBlank()) {
                    Log.d(TAG, "User input transcript: $userText")
                    appendTranscript("You", userText)
                }
            }

            content.outputTranscription?.text?.let { buddyText ->
                if (buddyText.isNotBlank()) {
                    Log.d(TAG, "Buddy output transcript: $buddyText")
                    appendTranscript("Buddy", buddyText)
                }
            }

            // 4. Turn complete
            if (content.turnComplete == true) {
                Log.d(TAG, "Turn complete. Session listening for next input.")
                _sessionState.value = AudioSessionState.LISTENING
                isAwaitingFirstAudio = false
                isBuddyTurnActive = false

                // Finalize latest transcript entry if present
                val current = _transcripts.value.toMutableList()
                if (current.isNotEmpty() && !current.last().isFinal) {
                    val lastIdx = current.lastIndex
                    current[lastIdx] = current[lastIdx].copy(isFinal = true)
                    _transcripts.value = current
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error parsing server message: ${e.message}", e)
        }
    }

    /**
     * Sends a text message directly through the active Gemini Live WebSocket session.
     * Buddy will process the text and respond with spoken audio + output transcript in the same session.
     */
    fun sendTextMessage(text: String): Boolean {
        val trimmed = text.trim()
        if (trimmed.isBlank() || !isConnected.get() || !isReadyForAudio.get() || webSocket == null) {
            Log.w(TAG, "sendTextMessage ignored: session not ready or text blank")
            return false
        }

        try {
            // Signal audio stream end if mic was previously active
            notifyAudioStreamEnd()

            // Record user message into transcripts as a finalized turn
            val current = _transcripts.value.toMutableList()
            current.add(LiveTranscriptEntry(sender = "You", text = trimmed, isFinal = true))
            _transcripts.value = current
            isUserTurnActive = false
            isBuddyTurnActive = false

            // Send LiveClientContentMessage over active WebSocket
            val textMsg = LiveClientContentMessage(
                clientContent = LiveClientContent(
                    turns = listOf(
                        LiveClientTurn(
                            role = "user",
                            parts = listOf(LiveTextPart(text = trimmed))
                        )
                    ),
                    turnComplete = true
                )
            )
            val jsonStr = json.encodeToString(textMsg)
            webSocket?.send(jsonStr)
            Log.d(TAG, "Sent user text turn to Gemini Live: $trimmed")

            _sessionState.value = AudioSessionState.PROCESSING
            lastUserTurnEndTimestamp = System.currentTimeMillis()
            isAwaitingFirstAudio = true
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send text message", e)
            return false
        }
    }

    /**
     * Sends an in-call mode or exercise steering instruction directly over the active WebSocket,
     * guiding Buddy to immediately adapt to mode transitions without reconnecting.
     */
    fun sendSystemSteeringMessage(directive: String): Boolean {
        if (!isConnected.get() || !isReadyForAudio.get() || webSocket == null) {
            Log.w(TAG, "sendSystemSteeringMessage ignored: session not ready")
            return false
        }

        try {
            notifyAudioStreamEnd()
            val steeringMsg = LiveClientContentMessage(
                clientContent = LiveClientContent(
                    turns = listOf(
                        LiveClientTurn(
                            role = "user",
                            parts = listOf(LiveTextPart(text = "[SISTEM: $directive]"))
                        )
                    ),
                    turnComplete = true
                )
            )
            val jsonStr = json.encodeToString(steeringMsg)
            webSocket?.send(jsonStr)
            Log.d(TAG, "Sent system steering directive to Gemini Live: $directive")
            _sessionState.value = AudioSessionState.PROCESSING
            lastUserTurnEndTimestamp = System.currentTimeMillis()
            isAwaitingFirstAudio = true
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send steering directive", e)
            return false
        }
    }

    /**
     * Sends an initial turn to prompt Buddy to greet the user concisely upon connecting.
     */
    private fun sendGreetingPrompt() {
        if (!isConnected.get() || webSocket == null) return

        try {
            val greetingMsg = LiveClientContentMessage(
                clientContent = LiveClientContent(
                    turns = listOf(
                        LiveClientTurn(
                            role = "user",
                            parts = listOf(
                                LiveTextPart(
                                    text = "[SISTEM: Sapa user dengan SANGAT SINGKAT (1 kalimat santai saja, maksimal 5-7 kata), misalnya: 'Halo! Mau belajar atau ngobrol apa hari ini?' atau 'Hi! What would you like to practice today?'. Jangan buat pidato pembuka panjang.]"
                                )
                            )
                        )
                    ),
                    turnComplete = true
                )
            )
            val jsonStr = json.encodeToString(greetingMsg)
            webSocket?.send(jsonStr)
            Log.d(TAG, "Sent greeting prompt to activate Buddy's voice.")
            isAwaitingFirstAudio = true
            lastUserTurnEndTimestamp = System.currentTimeMillis()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send greeting prompt", e)
        }
    }

    /**
     * Appends streaming transcription chunks to the current turn's bubble,
     * creating a new bubble only when the speaker changes or a new conversational turn starts.
     */
    private fun appendTranscript(sender: String, text: String) {
        val current = _transcripts.value.toMutableList()
        val isSameTurn = if (sender == "Buddy") isBuddyTurnActive else isUserTurnActive

        if (isSameTurn && current.isNotEmpty() && current.last().sender == sender) {
            val lastIndex = current.lastIndex
            val updatedText = current[lastIndex].text + text
            current[lastIndex] = current[lastIndex].copy(text = updatedText, isFinal = false)
        } else {
            if (sender == "Buddy") {
                val lastUserIndex = current.indexOfLast { it.sender == "You" }
                if (lastUserIndex != -1 && !current[lastUserIndex].isFinal) {
                    current[lastUserIndex] = current[lastUserIndex].copy(isFinal = true)
                }
                isBuddyTurnActive = true
                isUserTurnActive = false
            } else {
                isUserTurnActive = true
                isBuddyTurnActive = false
            }
            current.add(LiveTranscriptEntry(sender = sender, text = text, isFinal = false))
        }
        _transcripts.value = current
    }

    fun onSpeechStateChanged(isSpeaking: Boolean) {
        if (!isConnected.get() || !isReadyForAudio.get()) return

        if (isSpeaking) {
            // Avoid self-interruption from speaker acoustic leakage when Buddy is speaking.
            // Let Google server-side VAD (interrupted == true) or manual barge-in button handle it.
            if (_sessionState.value == AudioSessionState.LISTENING || _sessionState.value == AudioSessionState.INTERRUPTED) {
                _sessionState.value = AudioSessionState.USER_SPEAKING
            }
        } else {
            if (_sessionState.value == AudioSessionState.USER_SPEAKING) {
                Log.d(TAG, "Client VAD: User finished speaking -> sending audioStreamEnd")
                _sessionState.value = AudioSessionState.PROCESSING
                lastUserTurnEndTimestamp = System.currentTimeMillis()
                isAwaitingFirstAudio = true
                isUserTurnActive = false
                notifyAudioStreamEnd()
            }
        }
    }

    fun notifyAudioStreamEnd() {
        if (!isConnected.get() || !isReadyForAudio.get() || webSocket == null) return

        try {
            val streamEndInput = LiveRealtimeInput(
                realtimeInput = LiveRealtimeInputPayload(
                    audioStreamEnd = true
                )
            )
            val jsonStr = json.encodeToString(streamEndInput)
            webSocket?.send(jsonStr)
            Log.d(TAG, "Sent audioStreamEnd signal to Gemini Live")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to send audioStreamEnd", e)
        }
    }

    fun sendAudioChunk(pcmChunk: ByteArray) {
        if (!isConnected.get() || !isReadyForAudio.get() || webSocket == null) {
            return
        }

        val base64 = Base64.encodeToString(pcmChunk, Base64.NO_WRAP)
        val blob = LiveBlob(data = base64)
        val realtimeInput = LiveRealtimeInput(
            realtimeInput = LiveRealtimeInputPayload(
                audio = blob
            )
        )

        val inputJson = json.encodeToString(realtimeInput)
        webSocket?.send(inputJson)

        _metrics.value = _metrics.value.copy(
            chunksSent = _metrics.value.chunksSent + 1
        )
    }

    fun manualBargeIn() {
        Log.d(TAG, "Manual barge-in triggered")
        isBuddyTurnActive = false
        isUserTurnActive = false
        val current = _transcripts.value.toMutableList()
        if (current.isNotEmpty() && !current.last().isFinal) {
            val lastIdx = current.lastIndex
            current[lastIdx] = current[lastIdx].copy(isFinal = true)
            _transcripts.value = current
        }
        onInterrupted()
        _sessionState.value = AudioSessionState.INTERRUPTED
    }

    fun disconnect() {
        isManualDisconnect.set(true)
        reconnectJob?.cancel()
        reconnectJob = null
        resumptionHandle = null
        reconnectAttempts = 0
        isConnected.set(false)
        isConnectingOrConnected.set(false)
        isReadyForAudio.set(false)
        messageProcessingJob?.cancel()
        messageProcessingJob = null
        while (incomingMessageChannel.tryReceive().isSuccess) {}
        try {
            webSocket?.close(1000, "User disconnected")
        } catch (e: Exception) {
            Log.w(TAG, "Error closing websocket", e)
        }
        webSocket = null
        _sessionState.value = AudioSessionState.IDLE
        _errorMessage.value = null
        Log.d(TAG, "Session disconnected")
    }
}

