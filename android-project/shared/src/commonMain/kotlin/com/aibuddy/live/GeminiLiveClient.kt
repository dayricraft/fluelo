package com.aibuddy.live

import com.aibuddy.data.network.GeminiLiveWebSocketListener
import com.aibuddy.data.network.GeminiLiveWebSocketTransport
import com.aibuddy.data.network.createDefaultWebSocketTransport
import com.aibuddy.util.Base64Util
import com.aibuddy.util.currentTimeEpochMillis
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Multiplatform Gemini Live Client running identically on Android and iOS.
 * Handles WebSocket communication, bidi streaming, auto-reconnect,
 * transcript buffering, and dynamic activity steering.
 */
class GeminiLiveClient(
    private val scope: CoroutineScope,
    private val transport: GeminiLiveWebSocketTransport = createDefaultWebSocketTransport(),
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

    @kotlin.concurrent.Volatile
    private var isConnected = false
    @kotlin.concurrent.Volatile
    private var isConnectingOrConnected = false
    @kotlin.concurrent.Volatile
    private var isReadyForAudio = false
    @kotlin.concurrent.Volatile
    private var isManualDisconnect = false

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

    fun isReady(): Boolean = isConnected && isReadyForAudio

    fun connect(apiKey: String, voiceName: String = "Puck") {
        currentApiKey = apiKey
        currentVoiceName = voiceName
        isManualDisconnect = false
        reconnectAttempts = 0
        connectInternal(apiKey, voiceName, isReconnect = false)
    }

    private fun connectInternal(apiKey: String, voiceName: String, isReconnect: Boolean) {
        if (apiKey.isBlank()) {
            _sessionState.value = AudioSessionState.ERROR
            _errorMessage.value = "Gemini API Key is empty. Configure it in Settings."
            println("[$TAG] API Key is empty!")
            return
        }

        if (isConnectingOrConnected) {
            println("[$TAG] connect() ignored: already connecting or connected")
            return
        }
        isConnectingOrConnected = true

        _sessionState.value = if (isReconnect) AudioSessionState.RECONNECTING else AudioSessionState.CONNECTING
        if (!isReconnect) {
            _errorMessage.value = null
        }
        isReadyForAudio = false
        connectionStartTime = currentTimeEpochMillis()

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
        println("[$TAG] Connecting to Gemini Live WebSocket endpoint (isReconnect=$isReconnect)...")

        transport.connect(url, object : GeminiLiveWebSocketListener {
            override fun onOpen() {
                isConnected = true
                val connectDuration = currentTimeEpochMillis() - connectionStartTime
                _metrics.value = _metrics.value.copy(connectionLatencyMs = connectDuration)
                println("[$TAG] WebSocket opened in ${connectDuration}ms. Sending setup frame...")

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
                            println("[$TAG] Resuming session with token: $it")
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
                transport.send(setupJson)
                println("[$TAG] Setup frame sent, awaiting setupComplete...")
            }

            override fun onMessage(text: String) {
                incomingMessageChannel.trySend(text)
            }

            override fun onBinaryMessage(bytes: ByteArray) {
                incomingMessageChannel.trySend(bytes.decodeToString())
            }

            override fun onClosing(code: Int, reason: String) {
                println("[$TAG] WebSocket closing: code=$code, reason=$reason")
                isConnected = false
                isConnectingOrConnected = false
                isReadyForAudio = false
                if (code != 1000 && !isManualDisconnect) {
                    triggerAutoReconnect("Kode $code: $reason")
                } else {
                    _sessionState.value = AudioSessionState.IDLE
                }
            }

            override fun onFailure(throwable: Throwable, response: String?) {
                println("[$TAG] WebSocket failure: ${throwable.message}")
                isConnected = false
                isConnectingOrConnected = false
                isReadyForAudio = false
                val errReason = "${throwable.message ?: "Gangguan koneksi"}${response ?: ""}"
                if (!isManualDisconnect) {
                    triggerAutoReconnect(errReason)
                } else {
                    _sessionState.value = AudioSessionState.ERROR
                    _errorMessage.value = "WebSocket error: $errReason"
                }
            }
        })
    }

    private fun triggerAutoReconnect(reason: String) {
        if (isManualDisconnect) return
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            _sessionState.value = AudioSessionState.ERROR
            _errorMessage.value = "Koneksi terputus ($reason). Silakan ketuk tombol mikrofon untuk menghubungkan ulang."
            println("[$TAG] Max reconnect attempts reached ($MAX_RECONNECT_ATTEMPTS). Stopping retry.")
            return
        }

        reconnectAttempts++
        _sessionState.value = AudioSessionState.RECONNECTING
        _errorMessage.value = "Koneksi terganggu. Menghubungkan ulang ($reconnectAttempts/$MAX_RECONNECT_ATTEMPTS)..."
        println("[$TAG] Auto-reconnect attempt $reconnectAttempts/$MAX_RECONNECT_ATTEMPTS in progress (cause: $reason)")

        reconnectJob?.cancel()
        reconnectJob = scope.launch(Dispatchers.Default) {
            val backoffMs = (1000L * reconnectAttempts).coerceAtMost(4000L)
            delay(backoffMs)
            if (!isActive || isManualDisconnect) return@launch

            isConnected = false
            isConnectingOrConnected = false
            isReadyForAudio = false

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
                println("[$TAG] $err")
                if (!isManualDisconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
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
                    println("[$TAG] Saved session resumption handle: ${update.newHandle}")
                }
            }

            // Check for setupComplete
            if (message.setupComplete != null) {
                println("[$TAG] Received setupComplete from server! Ready for live conversation.")
                isReadyForAudio = true
                _sessionState.value = AudioSessionState.LISTENING
                reconnectAttempts = 0
                _errorMessage.value = null

                if (!isReconnect) {
                    sendGreetingPrompt()
                } else {
                    println("[$TAG] Resumed existing session without re-greeting.")
                }
                return
            }

            // Check for server voice activity signals
            message.voiceActivity?.type?.let { type ->
                println("[$TAG] Server voiceActivity event: $type")
                if (type == "ACTIVITY_START") {
                    if (_sessionState.value == AudioSessionState.BUDDY_SPEAKING) {
                        println("[$TAG] Server detected user speech during Buddy turn -> barge-in")
                        onInterrupted()
                        isBuddyTurnActive = false
                    }
                    _sessionState.value = AudioSessionState.USER_SPEAKING
                } else if (type == "ACTIVITY_END") {
                    _sessionState.value = AudioSessionState.PROCESSING
                    lastUserTurnEndTimestamp = currentTimeEpochMillis()
                    isAwaitingFirstAudio = true
                    isUserTurnActive = false
                }
            }

            val content = message.serverContent ?: return

            // 1. Interruption handling (User barge-in detected by server)
            if (content.interrupted == true) {
                println("[$TAG] Server detected barge-in interruption!")
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
                            val ttfa = currentTimeEpochMillis() - lastUserTurnEndTimestamp
                            _metrics.value = _metrics.value.copy(timeToFirstAudioMs = ttfa)
                            println("[$TAG] Time to First Audio (TTFA): ${ttfa}ms")
                            isAwaitingFirstAudio = false
                        }

                        val pcmBytes = Base64Util.decode(base64Data)
                        _metrics.value = _metrics.value.copy(
                            chunksReceived = _metrics.value.chunksReceived + 1
                        )
                        _sessionState.value = AudioSessionState.BUDDY_SPEAKING
                        onAudioReceived(pcmBytes)
                    }
                }
            }

            // 3. Transcription handling
            content.inputTranscription?.text?.let { userText ->
                if (userText.isNotBlank()) {
                    println("[$TAG] User input transcript: $userText")
                    appendTranscript("You", userText)
                }
            }

            content.outputTranscription?.text?.let { buddyText ->
                if (buddyText.isNotBlank()) {
                    println("[$TAG] Buddy output transcript: $buddyText")
                    appendTranscript("Buddy", buddyText)
                }
            }

            // 4. Turn complete
            if (content.turnComplete == true) {
                println("[$TAG] Turn complete. Session listening for next input.")
                _sessionState.value = AudioSessionState.LISTENING
                isAwaitingFirstAudio = false
                isBuddyTurnActive = false

                val current = _transcripts.value.toMutableList()
                if (current.isNotEmpty() && !current.last().isFinal) {
                    val lastIdx = current.lastIndex
                    current[lastIdx] = current[lastIdx].copy(isFinal = true)
                    _transcripts.value = current
                }
            }
        } catch (e: Exception) {
            println("[$TAG] Error parsing server message: ${e.message}")
        }
    }

    fun sendTextMessage(text: String): Boolean {
        val trimmed = text.trim()
        if (trimmed.isBlank() || !isConnected || !isReadyForAudio) {
            println("[$TAG] sendTextMessage ignored: session not ready or text blank")
            return false
        }

        try {
            notifyAudioStreamEnd()

            val current = _transcripts.value.toMutableList()
            current.add(LiveTranscriptEntry(sender = "You", text = trimmed, isFinal = true))
            _transcripts.value = current
            isUserTurnActive = false
            isBuddyTurnActive = false

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
            transport.send(jsonStr)
            println("[$TAG] Sent user text turn to Gemini Live: $trimmed")

            _sessionState.value = AudioSessionState.PROCESSING
            lastUserTurnEndTimestamp = currentTimeEpochMillis()
            isAwaitingFirstAudio = true
            return true
        } catch (e: Exception) {
            println("[$TAG] Failed to send text message: ${e.message}")
            return false
        }
    }

    fun sendSystemSteeringMessage(directive: String): Boolean {
        if (!isConnected || !isReadyForAudio) {
            println("[$TAG] sendSystemSteeringMessage ignored: session not ready")
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
            transport.send(jsonStr)
            println("[$TAG] Sent system steering directive: $directive")
            _sessionState.value = AudioSessionState.PROCESSING
            lastUserTurnEndTimestamp = currentTimeEpochMillis()
            isAwaitingFirstAudio = true
            return true
        } catch (e: Exception) {
            println("[$TAG] Failed to send steering directive: ${e.message}")
            return false
        }
    }

    private fun sendGreetingPrompt() {
        if (!isConnected) return

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
            transport.send(jsonStr)
            println("[$TAG] Sent greeting prompt to activate Buddy's voice.")
            isAwaitingFirstAudio = true
            lastUserTurnEndTimestamp = currentTimeEpochMillis()
        } catch (e: Exception) {
            println("[$TAG] Failed to send greeting prompt: ${e.message}")
        }
    }

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
        if (!isConnected || !isReadyForAudio) return

        if (isSpeaking) {
            if (_sessionState.value == AudioSessionState.LISTENING || _sessionState.value == AudioSessionState.INTERRUPTED) {
                _sessionState.value = AudioSessionState.USER_SPEAKING
            }
        } else {
            if (_sessionState.value == AudioSessionState.USER_SPEAKING) {
                println("[$TAG] Client VAD: User finished speaking -> sending audioStreamEnd")
                _sessionState.value = AudioSessionState.PROCESSING
                lastUserTurnEndTimestamp = currentTimeEpochMillis()
                isAwaitingFirstAudio = true
                isUserTurnActive = false
                notifyAudioStreamEnd()
            }
        }
    }

    fun notifyAudioStreamEnd() {
        if (!isConnected || !isReadyForAudio) return

        try {
            val streamEndInput = LiveRealtimeInput(
                realtimeInput = LiveRealtimeInputPayload(
                    audioStreamEnd = true
                )
            )
            val jsonStr = json.encodeToString(streamEndInput)
            transport.send(jsonStr)
            println("[$TAG] Sent audioStreamEnd signal")
        } catch (e: Exception) {
            println("[$TAG] Failed to send audioStreamEnd: ${e.message}")
        }
    }

    fun sendAudioChunk(pcmChunk: ByteArray) {
        if (!isConnected || !isReadyForAudio) {
            return
        }

        val base64 = Base64Util.encode(pcmChunk)
        val blob = LiveBlob(data = base64)
        val realtimeInput = LiveRealtimeInput(
            realtimeInput = LiveRealtimeInputPayload(
                audio = blob
            )
        )

        val inputJson = json.encodeToString(realtimeInput)
        transport.send(inputJson)

        _metrics.value = _metrics.value.copy(
            chunksSent = _metrics.value.chunksSent + 1
        )
    }

    fun manualBargeIn() {
        println("[$TAG] Manual barge-in triggered")
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
        isManualDisconnect = true
        reconnectJob?.cancel()
        reconnectJob = null
        resumptionHandle = null
        reconnectAttempts = 0
        isConnected = false
        isConnectingOrConnected = false
        isReadyForAudio = false
        messageProcessingJob?.cancel()
        messageProcessingJob = null
        while (incomingMessageChannel.tryReceive().isSuccess) {}
        try {
            transport.close(1000, "User disconnected")
        } catch (e: Exception) {
            println("[$TAG] Error closing transport: ${e.message}")
        }
        _sessionState.value = AudioSessionState.IDLE
        _errorMessage.value = null
        println("[$TAG] Session disconnected")
    }
}
