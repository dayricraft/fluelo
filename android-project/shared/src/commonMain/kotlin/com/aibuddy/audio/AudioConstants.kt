package com.aibuddy.audio

object AudioConstants {
    const val INPUT_SAMPLE_RATE = 16000 // 16kHz for Gemini Live API input
    const val OUTPUT_SAMPLE_RATE = 24000 // 24kHz for Gemini Live API output
    const val CHANNELS_MONO = 1 // Mono channel
    const val BITS_PER_SAMPLE = 16 // 16-bit PCM

    // 100ms chunk for 16kHz 16-bit mono: 16000 * 2 bytes * 0.1s = 3200 bytes
    const val INPUT_CHUNK_SIZE_BYTES = 3200

    // ~100ms chunk for 24kHz 16-bit mono: 24000 * 2 bytes * 0.1s = 4800 bytes
    const val OUTPUT_PREBUFFER_BYTES = 4800
}
