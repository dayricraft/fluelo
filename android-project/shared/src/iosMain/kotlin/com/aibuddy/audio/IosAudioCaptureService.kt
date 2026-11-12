package com.aibuddy.audio

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.cinterop.*
import platform.AVFAudio.*
import platform.AVFoundation.*
import platform.Foundation.*
import kotlin.math.sqrt

/**
 * iOS Native Audio Capture Service implementing IAudioCaptureService.
 * Uses AVAudioEngine and AVAudioSession in VoiceChat mode to capture microphone audio
 * and emits 16kHz 16-bit Mono Linear PCM chunks for Gemini Live.
 */
@OptIn(ExperimentalForeignApi::class)
class IosAudioCaptureService : IAudioCaptureService {

    private var audioEngine: AVAudioEngine? = null
    private var isRecording = false

    private val _amplitude = MutableStateFlow(0f)
    override val amplitude: StateFlow<Float> = _amplitude.asStateFlow()

    private val _isMuted = MutableStateFlow(false)
    override val isMuted: StateFlow<Boolean> = _isMuted.asStateFlow()

    private var isBuddySpeaking = false

    override fun setMuted(muted: Boolean) {
        _isMuted.value = muted
    }

    override fun setIsBuddySpeaking(speaking: Boolean) {
        isBuddySpeaking = speaking
    }

    override fun startCapture(
        scope: CoroutineScope,
        onSpeechStateChanged: (Boolean) -> Unit,
        onAudioChunk: (ByteArray) -> Unit
    ): Boolean {
        if (isRecording) return true

        val session = AVAudioSession.sharedInstance()
        try {
            // Configure audio session for voice chat (echo cancellation & speakerphone routing)
            session.setCategory(
                category = AVAudioSessionCategoryPlayAndRecord,
                mode = AVAudioSessionModeVoiceChat,
                options = AVAudioSessionCategoryOptionDefaultToSpeaker or AVAudioSessionCategoryOptionAllowBluetooth,
                error = null
            )
            session.setActive(true, error = null)
        } catch (e: Exception) {
            println("[IosAudioCapture] Failed to configure AVAudioSession: ${e.message}")
        }

        try {
            val engine = AVAudioEngine()
            audioEngine = engine
            val inputNode = engine.inputNode

            // Enable Voice Processing if available on device (Hardware Echo Cancellation)
            try {
                inputNode.setVoiceProcessingEnabled(true, error = null)
            } catch (_: Exception) {}

            val inputFormat = inputNode.outputFormatForBus(0u)
            val sampleRate = inputFormat.sampleRate
            val channels = inputFormat.channelCount.toInt()

            println("[IosAudioCapture] Hardware input format: sampleRate=$sampleRate, channels=$channels")

            var isUserSpeaking = false
            var silenceChunksCount = 0
            val speechThreshold = 0.03f
            val silenceChunksLimit = 7 // 700ms silence = end of turn
            val pcmAccumulator = ArrayList<Byte>(AudioConstants.INPUT_CHUNK_SIZE_BYTES * 2)

            inputNode.installTapOnBus(
                bus = 0u,
                bufferSize = 1024u,
                format = inputFormat
            ) { buffer, _ ->
                if (buffer == null || !isRecording || _isMuted.value) return@installTapOnBus

                val frameLength = buffer.frameLength.toInt()
                if (frameLength <= 0) return@installTapOnBus

                val floatChannelData = buffer.floatChannelData ?: return@installTapOnBus
                val channelData = floatChannelData[0] ?: return@installTapOnBus

                // Calculate RMS amplitude from Float32 samples
                var sum = 0.0
                for (i in 0 until frameLength) {
                    val sample = channelData[i]
                    sum += sample * sample
                }
                val rms = sqrt(sum / frameLength).toFloat()
                val amp = rms.coerceIn(0f, 1f)
                _amplitude.value = amp

                // Acoustic Echo Suppression: suppress when Buddy is speaking unless user barges in
                val isSpeakerEcho = isBuddySpeaking && amp < 0.12f
                if (isSpeakerEcho) return@installTapOnBus

                // Resample and convert to 16kHz 16-bit Linear PCM Little-Endian
                val effectiveRate = if (sampleRate > 8000.0) sampleRate else 48000.0
                val step = effectiveRate / AudioConstants.INPUT_SAMPLE_RATE.toDouble()
                var srcIdx = 0.0
                while (srcIdx < frameLength) {
                    val idx = srcIdx.toInt().coerceAtMost(frameLength - 1)
                    val floatSample = channelData[idx].coerceIn(-1.0f, 1.0f)
                    val shortSample = (floatSample * 32767.0f).toInt().toShort()

                    // Little-endian bytes
                    val b0 = (shortSample.toInt() and 0xFF).toByte()
                    val b1 = ((shortSample.toInt() shr 8) and 0xFF).toByte()
                    pcmAccumulator.add(b0)
                    pcmAccumulator.add(b1)

                    if (pcmAccumulator.size >= AudioConstants.INPUT_CHUNK_SIZE_BYTES) {
                        val chunk = ByteArray(AudioConstants.INPUT_CHUNK_SIZE_BYTES)
                        for (j in 0 until AudioConstants.INPUT_CHUNK_SIZE_BYTES) {
                            chunk[j] = pcmAccumulator[j]
                        }
                        // Remove transferred chunk
                        for (j in 0 until AudioConstants.INPUT_CHUNK_SIZE_BYTES) {
                            pcmAccumulator.removeAt(0)
                        }

                        onAudioChunk(chunk)

                        // VAD turn tracking
                        val effectiveThreshold = if (isBuddySpeaking) 0.12f else speechThreshold
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

                    srcIdx += step
                }
            }

            engine.prepare()
            val started = engine.startAndReturnError(null)
            if (!started) {
                println("[IosAudioCapture] Failed to start AVAudioEngine")
                return false
            }

            isRecording = true
            println("[IosAudioCapture] Started successfully")
            return true
        } catch (e: Exception) {
            println("[IosAudioCapture] Exception starting capture: ${e.message}")
            stopCapture()
            return false
        }
    }

    override fun stopCapture() {
        isRecording = false
        try {
            audioEngine?.inputNode?.removeTapOnBus(0u)
            if (audioEngine?.running == true) {
                audioEngine?.stop()
            }
            audioEngine?.reset()
        } catch (e: Exception) {
            println("[IosAudioCapture] Error stopping capture: ${e.message}")
        }
        audioEngine = null
        _amplitude.value = 0f
    }
}

