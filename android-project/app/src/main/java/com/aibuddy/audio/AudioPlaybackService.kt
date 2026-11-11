package com.aibuddy.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.sqrt

/**
 * Streams 24kHz 16-bit mono PCM audio from Gemini Live API.
 * Routes audio through communication speakerphone and supports zero-latency buffer flushing.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class AudioPlaybackService(private val context: Context) {

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var audioTrack: AudioTrack? = null
    private val isPlaying = AtomicBoolean(false)
    private var playbackJob: Job? = null
    private val audioChannel = Channel<ByteArray>(Channel.UNLIMITED)

    private val _amplitude = MutableStateFlow(0f)
    val amplitude: StateFlow<Float> = _amplitude.asStateFlow()

    private val _isSpeaking = MutableStateFlow(false)
    val isSpeaking: StateFlow<Boolean> = _isSpeaking.asStateFlow()

    fun startPlayback(scope: CoroutineScope): Boolean {
        if (isPlaying.get()) return true

        val minBufferSize = AudioTrack.getMinBufferSize(
            AudioConfig.OUTPUT_SAMPLE_RATE,
            AudioConfig.OUTPUT_CHANNEL_CONFIG,
            AudioConfig.AUDIO_FORMAT
        )

        if (minBufferSize == AudioTrack.ERROR || minBufferSize == AudioTrack.ERROR_BAD_VALUE) {
            Log.e("AudioPlayback", "Invalid AudioTrack minBufferSize: $minBufferSize")
            return false
        }

        try {
            setupSpeakerphoneRouting()

            audioTrack = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioConfig.AUDIO_FORMAT)
                        .setSampleRate(AudioConfig.OUTPUT_SAMPLE_RATE)
                        .setChannelMask(AudioConfig.OUTPUT_CHANNEL_CONFIG)
                        .build()
                )
                .setBufferSizeInBytes(minBufferSize * 4)
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()

            if (audioTrack?.state != AudioTrack.STATE_INITIALIZED) {
                Log.e("AudioPlayback", "AudioTrack failed to initialize, state: ${audioTrack?.state}")
                audioTrack?.release()
                audioTrack = null
                return false
            }

            isPlaying.set(true)
            Log.d("AudioPlayback", "AudioTrack initialized successfully in communication mode")

            playbackJob = scope.launch(Dispatchers.IO) {
                var bufferedInBurst = 0
                val prebufferThresholdBytes = 4800 // ~100ms at 24kHz 16-bit mono

                while (isActive && isPlaying.get()) {
                    val chunk = withTimeoutOrNull(350) {
                        audioChannel.receiveCatching().getOrNull()
                    }

                    if (chunk != null) {
                        _isSpeaking.value = true
                        val rms = calculateRms(chunk, chunk.size)
                        _amplitude.value = (rms / 32767f).coerceIn(0f, 1f)

                        val written = audioTrack?.write(chunk, 0, chunk.size, AudioTrack.WRITE_BLOCKING) ?: 0
                        if (written < 0) {
                            Log.w("AudioPlayback", "AudioTrack write error: $written")
                        } else {
                            bufferedInBurst += written
                        }

                        if (bufferedInBurst >= prebufferThresholdBytes || audioChannel.isEmpty) {
                            if (audioTrack?.playState != AudioTrack.PLAYSTATE_PLAYING) {
                                audioTrack?.play()
                            }
                        }
                    } else {
                        // 350ms with no audio chunks: turn paused or complete
                        if (_isSpeaking.value) {
                            _isSpeaking.value = false
                            _amplitude.value = 0f
                            bufferedInBurst = 0
                        }
                    }
                }
                _isSpeaking.value = false
                _amplitude.value = 0f
            }
            return true
        } catch (e: Exception) {
            Log.e("AudioPlayback", "Exception in startPlayback", e)
            stopPlayback()
            return false
        }
    }

    private fun setupSpeakerphoneRouting() {
        try {
            audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val speakerDevice = audioManager.availableCommunicationDevices.firstOrNull {
                    it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
                }
                if (speakerDevice != null) {
                    val success = audioManager.setCommunicationDevice(speakerDevice)
                    Log.d("AudioPlayback", "setCommunicationDevice(BUILTIN_SPEAKER): $success")
                } else {
                    @Suppress("DEPRECATION")
                    audioManager.isSpeakerphoneOn = true
                }
            } else {
                @Suppress("DEPRECATION")
                audioManager.isSpeakerphoneOn = true
            }
        } catch (e: Exception) {
            Log.w("AudioPlayback", "Failed to configure speakerphone routing", e)
        }
    }

    private fun resetSpeakerphoneRouting() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                audioManager.clearCommunicationDevice()
            } else {
                @Suppress("DEPRECATION")
                audioManager.isSpeakerphoneOn = false
            }
            audioManager.mode = AudioManager.MODE_NORMAL
            Log.d("AudioPlayback", "Reset speakerphone routing to normal")
        } catch (e: Exception) {
            Log.w("AudioPlayback", "Failed to reset speakerphone routing", e)
        }
    }

    /**
     * Enqueues incoming PCM chunk from Gemini Live API for playback.
     */
    fun enqueueAudio(pcmChunk: ByteArray) {
        if (isPlaying.get()) {
            audioChannel.trySend(pcmChunk)
        } else {
            Log.w("AudioPlayback", "Dropped audio chunk (${pcmChunk.size} bytes): not playing")
        }
    }

    /**
     * CRITICAL BARGE-IN: Stops playback immediately, flushes native buffer,
     * discards queued unplayed audio, and resets AudioTrack for the next turn.
     */
    fun clearAndInterrupt() {
        while (audioChannel.tryReceive().isSuccess) {}

        try {
            audioTrack?.pause()
            audioTrack?.flush()
            Log.d("AudioPlayback", "clearAndInterrupt: flushed audio buffer")
        } catch (e: Exception) {
            Log.w("AudioPlayback", "Error in clearAndInterrupt", e)
        }

        _isSpeaking.value = false
        _amplitude.value = 0f
    }

    fun stopPlayback() {
        isPlaying.set(false)
        playbackJob?.cancel()
        playbackJob = null

        while (audioChannel.tryReceive().isSuccess) {}

        try {
            if (audioTrack?.playState == AudioTrack.PLAYSTATE_PLAYING) {
                audioTrack?.pause()
                audioTrack?.flush()
                audioTrack?.stop()
            }
            audioTrack?.release()
        } catch (e: Exception) {
            Log.w("AudioPlayback", "Error releasing AudioTrack", e)
        }

        audioTrack = null
        resetSpeakerphoneRouting()
        _isSpeaking.value = false
        _amplitude.value = 0f
        Log.d("AudioPlayback", "Playback stopped")
    }

    private fun calculateRms(buffer: ByteArray, length: Int): Float {
        var sum = 0.0
        val sampleCount = length / 2
        if (sampleCount == 0) return 0f

        for (i in 0 until length - 1 step 2) {
            val sample = (buffer[i].toInt() and 0xFF) or (buffer[i + 1].toInt() shl 8)
            val shortSample = sample.toShort()
            sum += shortSample * shortSample
        }
        return sqrt(sum / sampleCount).toFloat()
    }
}

