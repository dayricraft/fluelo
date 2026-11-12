package com.aibuddy.audio

import android.annotation.SuppressLint
import android.media.AudioRecord
import android.media.MediaRecorder
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.sqrt

/**
 * Captures microphone audio using 16kHz 16-bit mono PCM.
 * Uses VOICE_COMMUNICATION to enable hardware Acoustic Echo Cancellation (AEC).
 */
class AudioCaptureService : IAudioCaptureService {

    private var audioRecord: AudioRecord? = null
    private val isRecording = AtomicBoolean(false)
    private var captureJob: Job? = null

    private val _amplitude = MutableStateFlow(0f)
    override val amplitude: StateFlow<Float> = _amplitude.asStateFlow()

    private val _isMuted = MutableStateFlow(false)
    override val isMuted: StateFlow<Boolean> = _isMuted.asStateFlow()

    private val isBuddySpeaking = AtomicBoolean(false)

    override fun setMuted(muted: Boolean) {
        _isMuted.value = muted
    }

    override fun setIsBuddySpeaking(speaking: Boolean) {
        isBuddySpeaking.set(speaking)
    }

    @SuppressLint("MissingPermission")
    override fun startCapture(
        scope: CoroutineScope,
        onSpeechStateChanged: (Boolean) -> Unit,
        onAudioChunk: (ByteArray) -> Unit
    ): Boolean {
        if (isRecording.get()) return true

        val minBufferSize = AudioRecord.getMinBufferSize(
            AudioConfig.INPUT_SAMPLE_RATE,
            AudioConfig.INPUT_CHANNEL_CONFIG,
            AudioConfig.AUDIO_FORMAT
        )

        if (minBufferSize == AudioRecord.ERROR || minBufferSize == AudioRecord.ERROR_BAD_VALUE) {
            return false
        }

        val bufferSize = maxOf(minBufferSize * 2, AudioConfig.CHUNK_SIZE_BYTES * 2)

        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                AudioConfig.INPUT_SAMPLE_RATE,
                AudioConfig.INPUT_CHANNEL_CONFIG,
                AudioConfig.AUDIO_FORMAT,
                bufferSize
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                android.util.Log.e("AudioCapture", "AudioRecord failed to initialize, state: ${audioRecord?.state}")
                audioRecord?.release()
                audioRecord = null
                return false
            }

            audioRecord?.startRecording()
            isRecording.set(true)
            android.util.Log.d("AudioCapture", "AudioRecord initialized and recording started")

            captureJob = scope.launch(Dispatchers.IO) {
                val buffer = ByteArray(AudioConfig.CHUNK_SIZE_BYTES)
                var isUserSpeaking = false
                var silenceChunksCount = 0
                val speechThreshold = 0.03f
                val silenceChunksLimit = 7 // 700ms silence = end of turn

                while (isActive && isRecording.get()) {
                    val readBytes = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (readBytes > 0) {
                        val rms = calculateRms(buffer, readBytes)
                        val amp = (rms / 32767f).coerceIn(0f, 1f)
                        _amplitude.value = amp

                        if (!_isMuted.value) {
                            val chunk = buffer.copyOf(readBytes)

                            // Acoustic Echo Suppression:
                            // When Buddy is speaking through the speaker, suppress mic streaming
                            // unless amplitude exceeds intentional barge-in threshold (0.12f).
                            // This stops phone speaker output from echoing into mic and triggering false barge-ins.
                            val isSpeakerEcho = isBuddySpeaking.get() && amp < 0.12f

                            if (!isSpeakerEcho) {
                                onAudioChunk(chunk)

                                // Client-side VAD detection
                                val effectiveThreshold = if (isBuddySpeaking.get()) 0.12f else speechThreshold
                                if (amp >= effectiveThreshold) {
                                    silenceChunksCount = 0
                                    if (!isUserSpeaking) {
                                        isUserSpeaking = true
                                        onSpeechStateChanged(true)
                                    }
                                } else {
                                    if (isUserSpeaking) {
                                        silenceChunksCount++
                                        if (silenceChunksCount >= silenceChunksLimit) {
                                            isUserSpeaking = false
                                            silenceChunksCount = 0
                                            onSpeechStateChanged(false)
                                        }
                                    }
                                }
                            }
                        }
                    } else if (readBytes < 0) {
                        android.util.Log.w("AudioCapture", "AudioRecord read error: $readBytes")
                    }
                }
            }
            return true
        } catch (e: Exception) {
            android.util.Log.e("AudioCapture", "Exception in startCapture", e)
            stopCapture()
            return false
        }
    }

    override fun stopCapture() {
        isRecording.set(false)
        captureJob?.cancel()
        captureJob = null
        try {
            if (audioRecord?.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                audioRecord?.stop()
            }
            audioRecord?.release()
        } catch (_: Exception) {}
        audioRecord = null
        _amplitude.value = 0f
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
