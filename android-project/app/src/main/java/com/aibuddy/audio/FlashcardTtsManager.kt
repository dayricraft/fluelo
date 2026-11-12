package com.aibuddy.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.aibuddy.live.AudioSessionState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

class FlashcardTtsManager(
    private val context: Context,
    private val getCurrentSessionState: () -> AudioSessionState = { AudioSessionState.IDLE }
) : TextToSpeech.OnInitListener, ITtsManager {

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var textToSpeech: TextToSpeech? = null

    private val _isReady = MutableStateFlow(false)
    override val isReady: StateFlow<Boolean> = _isReady.asStateFlow()

    private val _isSpeaking = MutableStateFlow(false)
    override val isSpeaking: StateFlow<Boolean> = _isSpeaking.asStateFlow()

    private var audioFocusRequest: AudioFocusRequest? = null

    init {
        textToSpeech = TextToSpeech(context.applicationContext, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = textToSpeech?.setLanguage(Locale.US)
            val isSupported = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED
            _isReady.value = isSupported

            textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    _isSpeaking.value = true
                }

                override fun onDone(utteranceId: String?) {
                    _isSpeaking.value = false
                    releaseAudioFocus()
                }

                override fun onError(utteranceId: String?) {
                    _isSpeaking.value = false
                    releaseAudioFocus()
                }
            })
        } else {
            _isReady.value = false
        }
    }

    /**
     * Speaks the target English text.
     * Safely guards against active Gemini Live calls so speech does not corrupt low-latency audio stream.
     */
    override fun speak(text: String, onBlockedByCall: () -> Unit): Boolean {
        if (getCurrentSessionState() != AudioSessionState.IDLE) {
            onBlockedByCall()
            return false
        }

        if (!_isReady.value || textToSpeech == null) {
            return false
        }

        requestAudioFocus()
        val utteranceId = "flashcard_${System.currentTimeMillis()}"
        val result = textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
        return result == TextToSpeech.SUCCESS
    }

    override fun stop() {
        textToSpeech?.stop()
        _isSpeaking.value = false
        releaseAudioFocus()
    }

    override fun release() {
        stop()
        textToSpeech?.shutdown()
        textToSpeech = null
        _isReady.value = false
    }

    private fun requestAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val playbackAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build()

            val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(playbackAttributes)
                .setAcceptsDelayedFocusGain(false)
                .setOnAudioFocusChangeListener { focusChange ->
                    if (focusChange == AudioManager.AUDIOFOCUS_LOSS ||
                        focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT
                    ) {
                        stop()
                    }
                }
                .build()

            audioFocusRequest = request
            audioManager.requestAudioFocus(request)
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(
                { focusChange ->
                    if (focusChange == AudioManager.AUDIOFOCUS_LOSS ||
                        focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT
                    ) {
                        stop()
                    }
                },
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
            )
        }
    }

    private fun releaseAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
            audioFocusRequest = null
        } else {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus(null)
        }
    }
}
