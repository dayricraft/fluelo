package com.aibuddy.data.flashcard

import android.content.Context
import com.aibuddy.data.db.FlueloDatabase
import com.aibuddy.data.flashcard.model.FlashcardDeckState
import com.aibuddy.data.flashcard.model.FlashcardItem
import com.aibuddy.data.flashcard.model.VocabularyEntry
import com.aibuddy.data.flashcard.model.VocabularyProgress
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.util.Random

class FlashcardRepository private constructor(
    private val context: Context,
    private val database: FlueloDatabase
) {
    private val vocabularyDao = database.vocabularyDao()
    private val flashcardDeckDao = database.flashcardDeckDao()

    val seenCount: Flow<Int> = vocabularyDao.getDistinctRevealedCount()
    val totalCount: Flow<Int> = vocabularyDao.getTotalWordsCount()
    val bookmarkedCount: Flow<Int> = vocabularyDao.getBookmarkedCount()
    val deckState: Flow<FlashcardDeckState?> = flashcardDeckDao.getDeckState()
    val allSeenCards: Flow<List<FlashcardItem>> = vocabularyDao.getAllSeenFlashcards()
    val bookmarkedCards: Flow<List<FlashcardItem>> = vocabularyDao.getBookmarkedFlashcards()

    private val jsonParser = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    /**
     * Initializes and seeds the database idempotently from assets if not already populated.
     * Guaranteed Option A: Shuffles exactly once with a fixed seed (42), persists orderRank 1..3000.
     */
    suspend fun ensureDatabaseSeeded(): Boolean = withContext(Dispatchers.IO) {
        val entryCount = vocabularyDao.getEntriesCount()
        val progressCount = vocabularyDao.getProgressCount()

        if (entryCount < 3000) {
            val assetJsonString = context.assets.open("vocabulary/fluelo_vocabulary_v1.json")
                .bufferedReader()
                .use { it.readText() }

            val entries: List<VocabularyEntry> = jsonParser.decodeFromString(assetJsonString)
            vocabularyDao.insertAllEntries(entries)
        }

        if (progressCount < 3000) {
            val random = Random(42L)
            val ranks = (1..3000).toList().shuffled(random)

            val progressList = (1..3000).map { entryId ->
                VocabularyProgress(
                    vocabularyEntryId = entryId,
                    orderRank = ranks[entryId - 1],
                    revealedAt = null,
                    lastVisitedAt = null,
                    isBookmarked = false,
                    reviewCount = 0,
                    lastReviewedAt = null
                )
            }
            vocabularyDao.insertAllProgress(progressList)
        }

        if (flashcardDeckDao.getDeckStateSync() == null) {
            flashcardDeckDao.insertOrUpdateDeckState(
                FlashcardDeckState(
                    id = 1,
                    datasetVersion = 1,
                    currentExploreRank = 1,
                    activeMode = "EXPLORE",
                    reviewFilter = "ALL_SEEN",
                    isFirstPassCompleted = false
                )
            )
        }

        true
    }

    fun getFlashcardByRank(rank: Int): Flow<FlashcardItem?> {
        return vocabularyDao.getFlashcardByRank(rank)
    }

    suspend fun markCardRevealed(entryId: Int) = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        vocabularyDao.markRevealed(entryId, now)
        vocabularyDao.updateLastVisited(entryId, now)
    }

    suspend fun updateCardVisited(entryId: Int) = withContext(Dispatchers.IO) {
        vocabularyDao.updateLastVisited(entryId, System.currentTimeMillis())
    }

    suspend fun toggleBookmark(entryId: Int, isBookmarked: Boolean) = withContext(Dispatchers.IO) {
        vocabularyDao.setBookmark(entryId, isBookmarked)
    }

    suspend fun recordReview(entryId: Int) = withContext(Dispatchers.IO) {
        vocabularyDao.incrementReviewCount(entryId, System.currentTimeMillis())
    }

    suspend fun nextExploreCard() = withContext(Dispatchers.IO) {
        val state = flashcardDeckDao.getDeckStateSync() ?: return@withContext
        val nextRank = state.currentExploreRank + 1

        if (nextRank <= 3000) {
            flashcardDeckDao.updateCurrentExploreRank(nextRank)
        } else {
            // First pass reached 3000, check unrevealed cards
            val unrevealed = vocabularyDao.getUnrevealedProgress()
            if (unrevealed.isEmpty()) {
                flashcardDeckDao.updateFirstPassCompleted(true)
            } else {
                flashcardDeckDao.updateCurrentExploreRank(unrevealed.first().orderRank)
            }
        }
    }

    suspend fun previousExploreCard() = withContext(Dispatchers.IO) {
        val state = flashcardDeckDao.getDeckStateSync() ?: return@withContext
        val prevRank = maxOf(1, state.currentExploreRank - 1)
        flashcardDeckDao.updateCurrentExploreRank(prevRank)
    }

    suspend fun setExploreRank(rank: Int) = withContext(Dispatchers.IO) {
        val boundedRank = rank.coerceIn(1, 3000)
        flashcardDeckDao.updateCurrentExploreRank(boundedRank)
    }

    suspend fun setActiveMode(mode: String) = withContext(Dispatchers.IO) {
        flashcardDeckDao.updateActiveMode(mode)
    }

    suspend fun setReviewFilter(filter: String) = withContext(Dispatchers.IO) {
        flashcardDeckDao.updateReviewFilter(filter)
    }

    companion object {
        @Volatile
        private var INSTANCE: FlashcardRepository? = null

        fun getInstance(context: Context): FlashcardRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: FlashcardRepository(
                    context.applicationContext,
                    FlueloDatabase.getInstance(context)
                ).also { INSTANCE = it }
            }
        }
    }
}
