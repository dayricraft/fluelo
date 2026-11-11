package com.aibuddy.util

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class Base64UtilTest {

    @Test
    fun testBase64RoundTrip() {
        val sampleBytes = byteArrayOf(0x00, 0x1A, 0x2B, 0x7F, -0x80, -0x01, 0x44)
        val encoded = Base64Util.encode(sampleBytes)
        val decoded = Base64Util.decode(encoded)

        assertEquals(sampleBytes.size, decoded.size)
        assertTrue(sampleBytes.contentEquals(decoded))
    }

    @Test
    fun testBase64PcmSampleFrame() {
        // 1600 bytes = 100ms of 16kHz 16-bit mono PCM
        val pcmFrame = ByteArray(1600) { it.toByte() }
        val encoded = Base64Util.encode(pcmFrame)
        val decoded = Base64Util.decode(encoded)

        assertEquals(1600, decoded.size)
        assertTrue(pcmFrame.contentEquals(decoded))
    }
}

