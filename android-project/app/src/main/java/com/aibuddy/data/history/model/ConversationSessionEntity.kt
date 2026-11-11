package com.aibuddy.data.history.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entitas Room untuk merepresentasikan satu sesi percakapan (Voice, Chat, atau Hybrid).
 */
@Entity(
    tableName = "conversation_sessions",
    indices = [
        Index(value = ["startTimeEpochMs"])
    ]
)
data class ConversationSessionEntity(
    @PrimaryKey
    val sessionId: String,
    val startTimeEpochMs: Long,
    val endTimeEpochMs: Long? = null,
    val durationSeconds: Int = 0,
    val primaryMode: String = "FREE_CONVERSATION",
    val modality: String = "VOICE", // "VOICE", "CHAT", "HYBRID"
    val title: String = "Percakapan dengan Buddy",
    val turnCount: Int = 0,
    val userTurnCount: Int = 0,
    val isCompleted: Boolean = false
)

