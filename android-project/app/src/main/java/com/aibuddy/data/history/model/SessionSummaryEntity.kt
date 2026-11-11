package com.aibuddy.data.history.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

/**
 * Entitas Room untuk ringkasan pembelajaran sesi (topics, grammar highlights, vocabulary, suggested focus).
 */
@Entity(
    tableName = "session_summaries",
    foreignKeys = [
        ForeignKey(
            entity = ConversationSessionEntity::class,
            parentColumns = ["sessionId"],
            childColumns = ["sessionId"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class SessionSummaryEntity(
    @PrimaryKey
    val sessionId: String,
    val topicsDiscussedJson: String, // JSON array of string topics
    val grammarHighlightsJson: String, // JSON array of key grammar notes
    val vocabularyPracticedJson: String, // JSON array of words practiced
    val suggestedFocusArea: String? = null,
    val generatedAtEpochMs: Long = System.currentTimeMillis(),
    val isAiGenerated: Boolean = false
)

