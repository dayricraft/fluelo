package com.aibuddy.audio

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.StateFlow

/**
 * Common contract for audio playback across Android and iOS.
 * Plays 24kHz 16-bit mono Linear PCM chunks streamed from Gemini Live.
 * Supports instant buffer flushing for user barge-in / interruption.
 */
interface IAudioPlaybackService {
    val amplitude: StateFlow<Float>
    val isSpeaking: StateFlow<Boolean>

    fun startPlayback(scope: CoroutineScope): Boolean
    fun enqueueAudio(pcmChunk: ByteArray)
    fun clearAndInterrupt()
    fun stopPlayback()
}
