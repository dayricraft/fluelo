package com.aibuddy.data.flashcard

import com.aibuddy.data.flashcard.model.FlashcardDeckState
import com.aibuddy.data.flashcard.model.VocabularyEntry
import com.aibuddy.data.flashcard.model.VocabularyProgress
import org.junit.Assert.*
import org.junit.Test
import java.util.Random

class FlashcardOrderEngineTest {

    @Test
    fun testOptionAShufflePermutationIsCompleteAndDeterministic() {
        val random1 = Random(42L)
        val ranks1 = (1..3000).toList().shuffled(random1)

        val random2 = Random(42L)
        val ranks2 = (1..3000).toList().shuffled(random2)

        // Deterministic reproduction
        assertEquals(ranks1, ranks2)

        // Exactly 3000 items
        assertEquals(3000, ranks1.size)

        // Contains all ranks 1..3000 without gaps or duplicates
        val uniqueRanks = ranks1.toSet()
        assertEquals(3000, uniqueRanks.size)
        assertTrue(uniqueRanks.contains(1))
        assertTrue(uniqueRanks.contains(3000))

        // Ensure not accidentally sorted alphabetically
        assertNotEquals((1..3000).toList(), ranks1)
    }

    @Test
    fun testRevealVsPresentInvariants() {
        val progress = VocabularyProgress(
            vocabularyEntryId = 1,
            orderRank = 1,
            revealedAt = null,
            lastVisitedAt = null
        )

        // Initial state: unrevealed
        assertNull(progress.revealedAt)
        assertNull(progress.lastVisitedAt)

        // Simulated card presented (front only): updates lastVisitedAt, revealedAt stays null
        val visitedTime = 1000L
        val visitedProgress = progress.copy(lastVisitedAt = visitedTime)
        assertNull(visitedProgress.revealedAt)
        assertEquals(visitedTime, visitedProgress.lastVisitedAt)

        // Simulated card revealed (flipped to back): sets revealedAt
        val revealTime = 2000L
        val revealedProgress = visitedProgress.copy(revealedAt = revealTime)
        assertEquals(revealTime, revealedProgress.revealedAt)

        // Second visit or swipe does not erase or overwrite revealedAt
        val secondVisitTime = 3000L
        val secondVisitProgress = revealedProgress.copy(lastVisitedAt = secondVisitTime)
        assertEquals(revealTime, secondVisitProgress.revealedAt)
        assertEquals(secondVisitTime, secondVisitProgress.lastVisitedAt)
    }

    @Test
    fun testDistinctSeenCountCalculation() {
        val cards = listOf(
            VocabularyProgress(vocabularyEntryId = 1, orderRank = 1, revealedAt = 100L),
            VocabularyProgress(vocabularyEntryId = 2, orderRank = 2, revealedAt = null), // skipped/unrevealed
            VocabularyProgress(vocabularyEntryId = 3, orderRank = 3, revealedAt = 200L),
            VocabularyProgress(vocabularyEntryId = 4, orderRank = 4, revealedAt = null)  // skipped/unrevealed
        )

        val seenCount = cards.count { it.revealedAt != null }
        assertEquals(2, seenCount)

        // Previous visit repetition does NOT increment count
        val simulatedRepeated = cards + cards[0] // duplicate visit to card 1
        val distinctSeen = simulatedRepeated.filter { it.revealedAt != null }
            .distinctBy { it.vocabularyEntryId }
            .size
        assertEquals(2, distinctSeen)
    }

    @Test
    fun testSkipReOfferingQueuePreservation() {
        // Deck of 5 words where 2 were skipped
        val progressList = mutableListOf(
            VocabularyProgress(vocabularyEntryId = 1, orderRank = 1, revealedAt = 100L),
            VocabularyProgress(vocabularyEntryId = 2, orderRank = 2, revealedAt = null), // Skip 1
            VocabularyProgress(vocabularyEntryId = 3, orderRank = 3, revealedAt = 300L),
            VocabularyProgress(vocabularyEntryId = 4, orderRank = 4, revealedAt = null), // Skip 2
            VocabularyProgress(vocabularyEntryId = 5, orderRank = 5, revealedAt = 500L)
        )

        // At end of first pass (rank 5), find unrevealed cards
        val unrevealed = progressList.filter { it.revealedAt == null }.sortedBy { it.orderRank }
        assertEquals(2, unrevealed.size)
        assertEquals(2, unrevealed[0].orderRank)
        assertEquals(4, unrevealed[1].orderRank)

        // Once those are revealed, first pass is 100% complete
        progressList[1] = progressList[1].copy(revealedAt = 600L)
        progressList[3] = progressList[3].copy(revealedAt = 700L)

        val remainingUnrevealed = progressList.filter { it.revealedAt == null }
        assertTrue(remainingUnrevealed.isEmpty())
        assertEquals(5, progressList.count { it.revealedAt != null })
    }

    @Test
    fun testBookmarkToggleState() {
        val progress = VocabularyProgress(
            vocabularyEntryId = 1,
            orderRank = 1,
            isBookmarked = false
        )

        val bookmarked = progress.copy(isBookmarked = true)
        assertTrue(bookmarked.isBookmarked)

        val unbookmarked = bookmarked.copy(isBookmarked = false)
        assertFalse(unbookmarked.isBookmarked)
    }

    @Test
    fun testDeckStateTransitions() {
        var state = FlashcardDeckState(
            id = 1,
            currentExploreRank = 1,
            activeMode = "EXPLORE",
            reviewFilter = "ALL_SEEN",
            isFirstPassCompleted = false
        )

        assertEquals(1, state.currentExploreRank)
        assertEquals("EXPLORE", state.activeMode)
        assertFalse(state.isFirstPassCompleted)

        // Advance to rank 500
        state = state.copy(currentExploreRank = 500)
        assertEquals(500, state.currentExploreRank)

        // Switch to Review mode
        state = state.copy(activeMode = "REVIEW", reviewFilter = "BOOKMARKED")
        assertEquals("REVIEW", state.activeMode)
        assertEquals("BOOKMARKED", state.reviewFilter)

        // Mark completed
        state = state.copy(isFirstPassCompleted = true)
        assertTrue(state.isFirstPassCompleted)
    }

    @Test
    fun testVocabularyEntryModelIntegrity() {
        val entry = VocabularyEntry(
            id = 42,
            headword = "abandon",
            normalizedKey = "abandon",
            partOfSpeech = "verb",
            meaningsId = "meninggalkan / mengabaikan",
            ipa = "/əˈbæn.dən/",
            pronunciationLocale = "en-US",
            exampleEn = "They had to abandon the sinking ship.",
            exampleId = "Mereka harus meninggalkan kapal yang tenggelam.",
            contentStatus = "ready",
            datasetVersion = 1
        )

        assertEquals(42, entry.id)
        assertEquals("abandon", entry.headword)
        assertEquals("verb", entry.partOfSpeech)
        assertTrue(entry.ipa.startsWith("/") && entry.ipa.endsWith("/"))
        assertEquals("en-US", entry.pronunciationLocale)
        assertEquals("ready", entry.contentStatus)
        assertEquals(1, entry.datasetVersion)
    }
}
