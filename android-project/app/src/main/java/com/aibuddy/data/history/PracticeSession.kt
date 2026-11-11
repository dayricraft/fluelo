package com.aibuddy.data.history

import kotlinx.serialization.Serializable

@Serializable
enum class SessionModality {
    VOICE,
    CHAT
}

@Serializable
data class PracticeSession(
    val id: String,
    val title: String,
    val modality: SessionModality,
    val timestamp: Long = System.currentTimeMillis(),
    val turnCount: Int,
    val summarySnippet: String
)
