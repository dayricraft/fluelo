package com.aibuddy.data.flashcard.dao

import androidx.room.*
import com.aibuddy.data.flashcard.model.FlashcardItem
import com.aibuddy.data.flashcard.model.VocabularyEntry
import com.aibuddy.data.flashcard.model.VocabularyProgress
import kotlinx.coroutines.flow.Flow

@Dao
interface VocabularyDao {

    // --- Vocabulary Entries (Lexical Content) ---

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllEntries(entries: List<VocabularyEntry>)

    @Query("SELECT COUNT(*) FROM vocabulary_entries")
    suspend fun getEntriesCount(): Int

    @Query("SELECT * FROM vocabulary_entries WHERE id = :id")
    suspend fun getEntryById(id: Int): VocabularyEntry?

    // --- Vocabulary Progress (Learning State) ---

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAllProgress(progress: List<VocabularyProgress>)

    @Query("SELECT COUNT(*) FROM vocabulary_progress")
    suspend fun getProgressCount(): Int

    @Query("SELECT * FROM vocabulary_progress WHERE vocabularyEntryId = :entryId")
    suspend fun getProgress(entryId: Int): VocabularyProgress?

    @Query("SELECT * FROM vocabulary_progress WHERE orderRank = :rank")
    suspend fun getProgressByRank(rank: Int): VocabularyProgress?

    @Query("UPDATE vocabulary_progress SET revealedAt = :timestamp WHERE vocabularyEntryId = :entryId AND revealedAt IS NULL")
    suspend fun markRevealed(entryId: Int, timestamp: Long)

    @Query("UPDATE vocabulary_progress SET lastVisitedAt = :timestamp WHERE vocabularyEntryId = :entryId")
    suspend fun updateLastVisited(entryId: Int, timestamp: Long)

    @Query("UPDATE vocabulary_progress SET isBookmarked = :isBookmarked WHERE vocabularyEntryId = :entryId")
    suspend fun setBookmark(entryId: Int, isBookmarked: Boolean)

    @Query("UPDATE vocabulary_progress SET reviewCount = reviewCount + 1, lastReviewedAt = :timestamp WHERE vocabularyEntryId = :entryId")
    suspend fun incrementReviewCount(entryId: Int, timestamp: Long)

    // --- Metrics Queries (Reactive Flows) ---

    @Query("SELECT COUNT(DISTINCT vocabularyEntryId) FROM vocabulary_progress WHERE revealedAt IS NOT NULL")
    fun getDistinctRevealedCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM vocabulary_entries")
    fun getTotalWordsCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM vocabulary_progress WHERE isBookmarked = 1")
    fun getBookmarkedCount(): Flow<Int>

    // --- Composite Card Queries ---

    @Transaction
    @Query("SELECT * FROM vocabulary_progress WHERE orderRank = :rank")
    fun getFlashcardByRank(rank: Int): Flow<FlashcardItem?>

    @Transaction
    @Query("SELECT * FROM vocabulary_progress WHERE revealedAt IS NOT NULL ORDER BY COALESCE(lastVisitedAt, revealedAt) DESC")
    fun getAllSeenFlashcards(): Flow<List<FlashcardItem>>

    @Transaction
    @Query("SELECT * FROM vocabulary_progress WHERE isBookmarked = 1 ORDER BY COALESCE(lastVisitedAt, revealedAt) DESC")
    fun getBookmarkedFlashcards(): Flow<List<FlashcardItem>>

    @Transaction
    @Query("SELECT * FROM vocabulary_progress WHERE revealedAt IS NULL ORDER BY orderRank ASC")
    suspend fun getUnrevealedProgress(): List<VocabularyProgress>
}
