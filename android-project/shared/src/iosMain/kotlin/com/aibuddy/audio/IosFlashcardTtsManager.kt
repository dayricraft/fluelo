package com.aibuddy.audio

import com.aibuddy.live.AudioSessionState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import platform.AVFAudio.*
import platform.AVFoundation.*
import platform.Foundation.*

/**
 * iOS Native Text-to-Speech manager implementing ITtsManager.
 * Uses AVSpeechSynthesizer for flashcard vocabulary pronunciation with English (en-US) voice.
 * Prevents interference with active Gemini Live sessions.
 */
class IosFlashcardTtsManager(
    private val getCurrentSessionState: () -> AudioSessionState = { AudioSessionState.IDLE }
) : ITtsManager {

    private val synthesizer = AVSpeechSynthesizer()

    private val _isReady = MutableStateFlow(true)
    override val isReady: StateFlow<Boolean> = _isReady.asStateFlow()

    private val _isSpeaking = MutableStateFlow(false)
    override val isSpeaking: StateFlow<Boolean> = _isSpeaking.asStateFlow()

    override fun speak(text: String, onBlockedByCall: () -> Unit): Boolean {
        if (getCurrentSessionState() != AudioSessionState.IDLE) {
            onBlockedByCall()
            return false
        }

        if (text.isBlank()) return false

        try {
            stop()

            val utterance = AVSpeechUtterance(string = text)
            utterance.voice = AVSpeechSynthesisVoice.voiceWithLanguage("en-US")
            utterance.rate = AVSpeechUtteranceDefaultSpeechRate

            synthesizer.speakUtterance(utterance)
            _isSpeaking.value = true
            return true
        } catch (e: Exception) {
            println("[IosTts] Error speaking: ${e.message}")
            _isSpeaking.value = false
            return false
        }
    }

    override fun stop() {
        try {
            if (synthesizer.speaking) {
                synthesizer.stopSpeakingAtBoundary(AVSpeechBoundary.AVSpeechBoundaryImmediate)
            }
        } catch (_: Exception) {}
        _isSpeaking.value = false
    }

    override fun release() {
        stop()
    }
}

