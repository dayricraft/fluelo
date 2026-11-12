package com.aibuddy.audio

import com.aibuddy.live.AudioSessionState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class NoOpAudioCaptureService : IAudioCaptureService {
    override val amplitude: StateFlow<Float> = MutableStateFlow(0f).asStateFlow()
    override val isMuted: StateFlow<Boolean> = MutableStateFlow(false).asStateFlow()
    override fun setMuted(muted: Boolean) {}
    override fun setIsBuddySpeaking(speaking: Boolean) {}
    override fun startCapture(
        scope: CoroutineScope,
        onSpeechStateChanged: (Boolean) -> Unit,
        onAudioChunk: (ByteArray) -> Unit
    ): Boolean = false
    override fun stopCapture() {}
}

class NoOpAudioPlaybackService : IAudioPlaybackService {
    override val amplitude: StateFlow<Float> = MutableStateFlow(0f).asStateFlow()
    override val isSpeaking: StateFlow<Boolean> = MutableStateFlow(false).asStateFlow()
    override fun startPlayback(scope: CoroutineScope): Boolean = false
    override fun enqueueAudio(pcmChunk: ByteArray) {}
    override fun clearAndInterrupt() {}
    override fun stopPlayback() {}
}

class NoOpTtsManager : ITtsManager {
    override val isReady: StateFlow<Boolean> = MutableStateFlow(false).asStateFlow()
    override val isSpeaking: StateFlow<Boolean> = MutableStateFlow(false).asStateFlow()
    override fun speak(text: String, onBlockedByCall: () -> Unit): Boolean = false
    override fun stop() {}
    override fun release() {}
}

actual fun createAudioCaptureService(): IAudioCaptureService = NoOpAudioCaptureService()
actual fun createAudioPlaybackService(): IAudioPlaybackService = NoOpAudioPlaybackService()
actual fun createFlashcardTtsManager(getCurrentSessionState: () -> AudioSessionState): ITtsManager = NoOpTtsManager()
