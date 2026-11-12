package com.aibuddy.audio

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.StateFlow

/**
 * Common contract for microphone audio capture across Android and iOS.
 * Produces 16kHz 16-bit mono Linear PCM chunks suitable for Gemini Live.
 */
interface IAudioCaptureService {
    val amplitude: StateFlow<Float>
    val isMuted: StateFlow<Boolean>

    fun setMuted(muted: Boolean)
    fun setIsBuddySpeaking(speaking: Boolean)

    fun startCapture(
        scope: CoroutineScope,
        onSpeechStateChanged: (Boolean) -> Unit = {},
        onAudioChunk: (ByteArray) -> Unit
    ): Boolean

    fun stopCapture()
}
