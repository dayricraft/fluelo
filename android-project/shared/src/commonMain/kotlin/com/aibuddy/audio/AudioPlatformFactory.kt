package com.aibuddy.audio

import com.aibuddy.live.AudioSessionState

expect fun createAudioCaptureService(): IAudioCaptureService
expect fun createAudioPlaybackService(): IAudioPlaybackService
expect fun createFlashcardTtsManager(getCurrentSessionState: () -> AudioSessionState = { AudioSessionState.IDLE }): ITtsManager

