package com.aibuddy.data.flashcard.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Mutable device-local user learning progress for a specific vocabulary headword.
 */
@Entity(
    tableName = "vocabulary_progress",
    foreignKeys = [
        ForeignKey(
            entity = VocabularyEntry::class,
            parentColumns = ["id"],
            childColumns = ["vocabularyEntryId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["orderRank"], unique = true),
        Index(value = ["isBookmarked"]),
        Index(value = ["revealedAt"])
    ]
)
data class VocabularyProgress(
    @PrimaryKey
    val vocabularyEntryId: Int,
    val orderRank: Int,
    val revealedAt: Long? = null,
    val lastVisitedAt: Long? = null,
    val isBookmarked: Boolean = false,
    val reviewCount: Int = 0,
    val lastReviewedAt: Long? = null
)
