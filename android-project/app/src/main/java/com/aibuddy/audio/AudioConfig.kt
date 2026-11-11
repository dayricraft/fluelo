package com.aibuddy.audio

import android.media.AudioFormat

object AudioConfig {
    const val INPUT_SAMPLE_RATE = 16000 // 16kHz for Gemini Live API input
    const val OUTPUT_SAMPLE_RATE = 24000 // 24kHz for Gemini Live API output
    const val INPUT_CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
    const val OUTPUT_CHANNEL_CONFIG = AudioFormat.CHANNEL_OUT_MONO
    const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT

    // 100ms chunk for 16kHz 16-bit mono: 16000 * 2 bytes * 0.1s = 3200 bytes
    const val CHUNK_SIZE_BYTES = 3200
}
