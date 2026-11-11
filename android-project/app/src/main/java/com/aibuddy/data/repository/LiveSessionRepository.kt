package com.aibuddy.data.repository

import android.content.Context
import com.aibuddy.audio.AudioCaptureService
import com.aibuddy.audio.AudioPlaybackService
import com.aibuddy.live.AudioSessionState
import com.aibuddy.live.GeminiLiveClient
import com.aibuddy.live.LiveSessionMetrics
import com.aibuddy.live.LiveTranscriptEntry
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.StateFlow

/**
 * Domain repository encapsulating microphone capture, speaker playback,
 * and Gemini Live WebSocket communication.
 */
class LiveSessionRepository(
    context: Context,
    private val scope: CoroutineScope
) {
    private val audioCapture = AudioCaptureService()
    private val audioPlayback = AudioPlaybackService(context.applicationContext)
    private val liveClient = GeminiLiveClient(
        scope = scope,
        onAudioReceived = { pcmChunk -> audioPlayback.enqueueAudio(pcmChunk) },
        onInterrupted = { audioPlayback.clearAndInterrupt() }
    )

    val sessionState: StateFlow<AudioSessionState> = liveClient.sessionState
    val metrics: StateFlow<LiveSessionMetrics> = liveClient.metrics
    val transcripts: StateFlow<List<LiveTranscriptEntry>> = liveClient.transcripts
    val errorMessage: StateFlow<String?> = liveClient.errorMessage
    val micAmplitude: StateFlow<Float> = audioCapture.amplitude
    val speakerAmplitude: StateFlow<Float> = audioPlayback.amplitude
    val isMuted: StateFlow<Boolean> = audioCapture.isMuted

    init {
        scope.launch {
            kotlinx.coroutines.flow.combine(
                audioPlayback.isSpeaking,
                liveClient.sessionState
            ) { isSpeaking, state ->
                isSpeaking || state == AudioSessionState.BUDDY_SPEAKING
            }.collect { isBuddySpeaking ->
                audioCapture.setIsBuddySpeaking(isBuddySpeaking)
            }
        }
    }

    fun startSession(apiKey: String, voiceName: String = "Puck") {
        audioPlayback.startPlayback(scope)
        audioCapture.startCapture(
            scope = scope,
            onSpeechStateChanged = { isSpeaking -> liveClient.onSpeechStateChanged(isSpeaking) },
            onAudioChunk = { pcmChunk -> liveClient.sendAudioChunk(pcmChunk) }
        )
        liveClient.connect(apiKey = apiKey, voiceName = voiceName)
    }

    fun stopSession() {
        liveClient.disconnect()
        audioCapture.stopCapture()
        audioPlayback.stopPlayback()
    }

    fun setMuted(muted: Boolean) {
        audioCapture.setMuted(muted)
    }

    fun manualBargeIn() {
        liveClient.manualBargeIn()
    }

    fun sendTextMessage(text: String): Boolean {
        return liveClient.sendTextMessage(text)
    }

    fun sendSystemSteeringMessage(directive: String): Boolean {
        return liveClient.sendSystemSteeringMessage(directive)
    }
}
