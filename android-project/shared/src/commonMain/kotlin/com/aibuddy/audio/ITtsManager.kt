package com.aibuddy.audio

import kotlinx.coroutines.flow.StateFlow

/**
 * Common contract for Text-To-Speech (TTS) pronunciation across Android and iOS.
 * Used primarily for flashcard vocabulary learning with mutual exclusion against live audio calls.
 */
interface ITtsManager {
    val isReady: StateFlow<Boolean>
    val isSpeaking: StateFlow<Boolean>

    fun speak(text: String, onBlockedByCall: () -> Unit = {}): Boolean
    fun stop()
    fun release()
}
