package com.aibuddy.data.flashcard.dao

import androidx.room.*
import com.aibuddy.data.flashcard.model.FlashcardDeckState
import kotlinx.coroutines.flow.Flow

@Dao
interface FlashcardDeckDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateDeckState(state: FlashcardDeckState)

    @Query("SELECT * FROM flashcard_deck_state WHERE id = 1")
    fun getDeckState(): Flow<FlashcardDeckState?>

    @Query("SELECT * FROM flashcard_deck_state WHERE id = 1")
    suspend fun getDeckStateSync(): FlashcardDeckState?

    @Query("UPDATE flashcard_deck_state SET currentExploreRank = :rank WHERE id = 1")
    suspend fun updateCurrentExploreRank(rank: Int)

    @Query("UPDATE flashcard_deck_state SET activeMode = :mode WHERE id = 1")
    suspend fun updateActiveMode(mode: String)

    @Query("UPDATE flashcard_deck_state SET reviewFilter = :filter WHERE id = 1")
    suspend fun updateReviewFilter(filter: String)

    @Query("UPDATE flashcard_deck_state SET isFirstPassCompleted = :isCompleted WHERE id = 1")
    suspend fun updateFirstPassCompleted(isCompleted: Boolean)
}
