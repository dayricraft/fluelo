package com.aibuddy.data.flashcard.model

import androidx.room.Embedded
import androidx.room.Relation

/**
 * Domain and UI representation uniting dictionary entry with user learning progress.
 */
data class FlashcardItem(
    @Embedded
    val progress: VocabularyProgress,

    @Relation(
        parentColumn = "vocabularyEntryId",
        entityColumn = "id"
    )
    val entry: VocabularyEntry
)
