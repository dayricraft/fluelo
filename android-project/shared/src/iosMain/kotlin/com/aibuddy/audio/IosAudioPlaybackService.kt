package com.aibuddy.audio

import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.cinterop.*
import platform.AVFoundation.*
import platform.Foundation.*
import kotlin.math.sqrt

/**
 * iOS Native Audio Playback Service implementing IAudioPlaybackService.
 * Streams 24kHz 16-bit Mono Linear PCM responses from Gemini Live via AVAudioPlayerNode.
 * Provides instant buffer flushing on user barge-in.
 */
@OptIn(ExperimentalForeignApi::class)
class IosAudioPlaybackService : IAudioPlaybackService {

    private var audioEngine: AVAudioEngine? = null
    private var playerNode: AVAudioPlayerNode? = null
    private var playbackFormat: AVAudioFormat? = null

    private var isPlaying = false
    private var playbackJob: Job? = null
    private val audioChannel = Channel<ByteArray>(Channel.UNLIMITED)

    private val _amplitude = MutableStateFlow(0f)
    override val amplitude: StateFlow<Float> = _amplitude.asStateFlow()

    private val _isSpeaking = MutableStateFlow(false)
    override val isSpeaking: StateFlow<Boolean> = _isSpeaking.asStateFlow()

    override fun startPlayback(scope: CoroutineScope): Boolean {
        if (isPlaying) return true

        try {
            val session = AVAudioSession.sharedInstance()
            session.setCategory(
                category = AVAudioSessionCategoryPlayAndRecord,
                mode = AVAudioSessionModeVoiceChat,
                options = AVAudioSessionCategoryOptionDefaultToSpeaker or AVAudioSessionCategoryOptionAllowBluetooth,
                error = null
            )
            session.setActive(true, error = null)

            val engine = AVAudioEngine()
            val player = AVAudioPlayerNode()
            engine.attachNode(player)

            // 24kHz Mono Float32 format for AVAudioEngine mixing
            val format = AVAudioFormat(
                standardFormatWithSampleRate = AudioConstants.OUTPUT_SAMPLE_RATE.toDouble(),
                channels = 1u
            )
            playbackFormat = format

            engine.connect(player, to = engine.mainMixerNode, format = format)
            engine.prepare()
            val started = engine.startAndReturnError(null)
            if (!started) {
                println("[IosAudioPlayback] Failed to start AVAudioEngine")
                return false
            }

            player.play()
            audioEngine = engine
            playerNode = player
            isPlaying = true
            println("[IosAudioPlayback] Audio playback initialized at 24kHz")

            playbackJob = scope.launch(Dispatchers.Default) {
                while (isActive && isPlaying) {
                    val chunk = withTimeoutOrNull(350) {
                        audioChannel.receiveCatching().getOrNull()
                    }

                    if (chunk != null) {
                        _isSpeaking.value = true
                        val sampleCount = chunk.size / 2
                        if (sampleCount <= 0) continue

                        // Calculate RMS amplitude
                        var sum = 0.0
                        for (i in 0 until chunk.size - 1 step 2) {
                            val sample = (chunk[i].toInt() and 0xFF) or (chunk[i + 1].toInt() shl 8)
                            val shortSample = sample.toShort()
                            sum += shortSample * shortSample
                        }
                        val rms = sqrt(sum / sampleCount).toFloat()
                        _amplitude.value = (rms / 32767f).coerceIn(0f, 1f)

                        // Create AVAudioPCMBuffer
                        val currentFormat = playbackFormat ?: continue
                        val pcmBuffer = AVAudioPCMBuffer(
                            pcmFormat = currentFormat,
                            frameCapacity = sampleCount.toUInt()
                        )
                        pcmBuffer.frameLength = sampleCount.toUInt()

                        val floatData = pcmBuffer.floatChannelData ?: continue
                        val channel0 = floatData[0] ?: continue

                        for (i in 0 until sampleCount) {
                            val b0 = chunk[i * 2].toInt() and 0xFF
                            val b1 = chunk[i * 2 + 1].toInt() shl 8
                            val shortSample = (b0 or b1).toShort()
                            channel0[i] = shortSample.toFloat() / 32768.0f
                        }

                        val currentPlayer = playerNode
                        if (currentPlayer != null && isPlaying) {
                            if (!currentPlayer.isPlaying()) {
                                currentPlayer.play()
                            }
                            currentPlayer.scheduleBuffer(pcmBuffer, completionHandler = null)
                        }
                    } else {
                        // 350ms of silence = turn ended
                        if (_isSpeaking.value) {
                            _isSpeaking.value = false
                            _amplitude.value = 0f
                        }
                    }
                }
                _isSpeaking.value = false
                _amplitude.value = 0f
            }

            return true
        } catch (e: Exception) {
            println("[IosAudioPlayback] Exception starting playback: ${e.message}")
            stopPlayback()
            return false
        }
    }

    override fun enqueueAudio(pcmChunk: ByteArray) {
        if (isPlaying) {
            audioChannel.trySend(pcmChunk)
        }
    }

    override fun clearAndInterrupt() {
        while (audioChannel.tryReceive().isSuccess) {}

        try {
            playerNode?.stop()
            playerNode?.play()
            println("[IosAudioPlayback] clearAndInterrupt: flushed native buffers")
        } catch (e: Exception) {
            println("[IosAudioPlayback] Error in clearAndInterrupt: ${e.message}")
        }

        _isSpeaking.value = false
        _amplitude.value = 0f
    }

    override fun stopPlayback() {
        isPlaying = false
        playbackJob?.cancel()
        playbackJob = null

        while (audioChannel.tryReceive().isSuccess) {}

        try {
            playerNode?.stop()
            if (audioEngine?.isRunning() == true) {
                audioEngine?.stop()
            }
            audioEngine?.reset()
        } catch (e: Exception) {
            println("[IosAudioPlayback] Error stopping: ${e.message}")
        }

        playerNode = null
        audioEngine = null
        playbackFormat = null
        _isSpeaking.value = false
        _amplitude.value = 0f
    }
}
