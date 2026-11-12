package com.aibuddy.audio

import com.aibuddy.live.AudioSessionState

actual fun createAudioCaptureService(): IAudioCaptureService = IosAudioCaptureService()
actual fun createAudioPlaybackService(): IAudioPlaybackService = IosAudioPlaybackService()
actual fun createFlashcardTtsManager(getCurrentSessionState: () -> AudioSessionState): ITtsManager = IosFlashcardTtsManager(getCurrentSessionState)
