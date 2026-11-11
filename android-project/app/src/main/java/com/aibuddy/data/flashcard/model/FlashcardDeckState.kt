package com.aibuddy.data.flashcard.model

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Singleton state storing deck cursor and active mode for the Flashcard Room.
 */
@Entity(tableName = "flashcard_deck_state")
data class FlashcardDeckState(
    @PrimaryKey
    val id: Int = 1,
    val datasetVersion: Int = 1,
    val currentExploreRank: Int = 1,
    val activeMode: String = "EXPLORE", // "EXPLORE" or "REVIEW"
    val reviewFilter: String = "ALL_SEEN", // "ALL_SEEN" or "BOOKMARKED"
    val isFirstPassCompleted: Boolean = false
)
