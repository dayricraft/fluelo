package com.aibuddy.data.history.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entitas Room untuk setiap giliran pesan (User atau Buddy) di dalam sesi percakapan.
 */
@Entity(
    tableName = "conversation_messages",
    foreignKeys = [
        ForeignKey(
            entity = ConversationSessionEntity::class,
            parentColumns = ["sessionId"],
            childColumns = ["sessionId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["sessionId", "sequenceOrder"]),
        Index(value = ["sessionId"])
    ]
)
data class ConversationMessageEntity(
    @PrimaryKey
    val messageId: String,
    val sessionId: String,
    val sender: String, // "USER" or "BUDDY"
    val modality: String, // "VOICE" or "TEXT"
    val content: String,
    val timestampEpochMs: Long,
    val sequenceOrder: Int,
    val isInterrupted: Boolean = false
)

