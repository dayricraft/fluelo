package com.aibuddy.data.history.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entitas Room untuk feedback koreksi terstruktur dari Tutor M3.
 */
@Entity(
    tableName = "structured_corrections",
    foreignKeys = [
        ForeignKey(
            entity = ConversationSessionEntity::class,
            parentColumns = ["sessionId"],
            childColumns = ["sessionId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = ConversationMessageEntity::class,
            parentColumns = ["messageId"],
            childColumns = ["messageId"],
            onDelete = ForeignKey.SET_NULL
        )
    ],
    indices = [
        Index(value = ["sessionId"]),
        Index(value = ["messageId"])
    ]
)
data class StructuredCorrectionEntity(
    @PrimaryKey
    val correctionId: String,
    val sessionId: String,
    val messageId: String? = null,
    val originalUtterance: String,
    val correctedExpression: String,
    val explanation: String,
    val category: String, // "GRAMMAR", "TENSE", "PREPOSITION", etc.
    val severity: String, // "MINOR", "MODERATE", "MAJOR"
    val spokenNote: String? = null,
    val timestampEpochMs: Long
)

