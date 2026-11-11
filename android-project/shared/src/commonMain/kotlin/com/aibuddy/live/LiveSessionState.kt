package com.aibuddy.live

import com.aibuddy.util.currentTimeEpochMillis
import com.aibuddy.util.randomUuidString

enum class AudioSessionState {
    IDLE,
    CONNECTING,
    CONNECTED,
    LISTENING,
    USER_SPEAKING,
    PROCESSING,
    BUDDY_SPEAKING,
    INTERRUPTED,
    RECONNECTING,
    ERROR
}

data class LiveSessionMetrics(
    val connectionLatencyMs: Long = 0,
    val timeToFirstAudioMs: Long = 0,
    val chunksSent: Long = 0,
    val chunksReceived: Long = 0,
    val lastPingMs: Long = 0
)

data class LiveTranscriptEntry(
    val id: String = randomUuidString(),
    val sender: String, // "You" or "Buddy"
    val text: String,
    val timestamp: Long = currentTimeEpochMillis(),
    val isFinal: Boolean = true
)

