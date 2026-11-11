package com.aibuddy.data.history.summary

import com.aibuddy.data.history.model.ConversationMessageEntity
import com.aibuddy.data.history.model.ConversationSessionEntity
import com.aibuddy.data.history.model.StructuredCorrectionEntity
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Test

class SessionSummaryGeneratorTest {

    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun testSummaryGenerationWithTenseCorrections() {
        val session = ConversationSessionEntity(
            sessionId = "test_session_1",
            startTimeEpochMs = 1000L,
            endTimeEpochMs = 120000L,
            durationSeconds = 119,
            primaryMode = "GRAMMAR",
            modality = "VOICE",
            title = "Tata Bahasa (Grammar)",
            turnCount = 4,
            userTurnCount = 2,
            isCompleted = true
        )

        val messages = listOf(
            ConversationMessageEntity(
                messageId = "m1",
                sessionId = "test_session_1",
                sender = "USER",
                modality = "VOICE",
                content = "Yesterday I go to market and buy some apples.",
                timestampEpochMs = 2000L,
                sequenceOrder = 1
            ),
            ConversationMessageEntity(
                messageId = "m2",
                sessionId = "test_session_1",
                sender = "BUDDY",
                modality = "VOICE",
                content = "That sounds great! What else did you buy?",
                timestampEpochMs = 4000L,
                sequenceOrder = 2
            )
        )

        val corrections = listOf(
            StructuredCorrectionEntity(
                correctionId = "c1",
                sessionId = "test_session_1",
                messageId = "m1",
                originalUtterance = "Yesterday I go to market",
                correctedExpression = "Yesterday I went to the market",
                explanation = "Gunakan past tense 'went' untuk kejadian lampau.",
                category = "TENSE",
                severity = "MODERATE",
                timestampEpochMs = 2500L
            )
        )

        val summary = SessionSummaryGenerator.generateSummary(session, messages, corrections)

        assertEquals("test_session_1", summary.sessionId)
        assertFalse(summary.isAiGenerated)

        val topics = json.decodeFromString<List<String>>(summary.topicsDiscussedJson)
        assertTrue(topics.any { it.contains("Tata Bahasa") })

        val highlights = json.decodeFromString<List<String>>(summary.grammarHighlightsJson)
        assertEquals(1, highlights.size)
        assertTrue(highlights[0].contains("TENSE"))
        assertTrue(highlights[0].contains("went"))

        // Focus suggestion for TENSE
        assertNotNull(summary.suggestedFocusArea)
        assertTrue(summary.suggestedFocusArea!!.contains("bentuk waktu") || summary.suggestedFocusArea!!.contains("Past"))
    }

    @Test
    fun testSummaryGenerationForEmptyOrBriefSession() {
        val session = ConversationSessionEntity(
            sessionId = "empty_session",
            startTimeEpochMs = 1000L,
            endTimeEpochMs = 2000L,
            durationSeconds = 1,
            primaryMode = "FREE_CONVERSATION",
            modality = "VOICE",
            title = "Panggilan Suara",
            turnCount = 0,
            userTurnCount = 0,
            isCompleted = true
        )

        val summary = SessionSummaryGenerator.generateSummary(
            session = session,
            messages = emptyList(),
            corrections = emptyList()
        )

        val highlights = json.decodeFromString<List<String>>(summary.grammarHighlightsJson)
        assertTrue(highlights.isEmpty())

        val vocab = json.decodeFromString<List<String>>(summary.vocabularyPracticedJson)
        assertTrue(vocab.isEmpty())

        assertNotNull(summary.suggestedFocusArea)
        assertTrue(summary.suggestedFocusArea!!.contains("singkat") || summary.suggestedFocusArea!!.contains("rutin"))
    }

    @Test
    fun testVocabularyExtractionExcludesStopWords() {
        val session = ConversationSessionEntity(
            sessionId = "vocab_session",
            startTimeEpochMs = 1000L,
            endTimeEpochMs = 60000L,
            durationSeconds = 59,
            primaryMode = "VOCABULARY",
            modality = "CHAT",
            title = "Latihan Kosakata",
            turnCount = 2,
            userTurnCount = 1,
            isCompleted = true
        )

        val messages = listOf(
            ConversationMessageEntity(
                messageId = "m1",
                sessionId = "vocab_session",
                sender = "USER",
                modality = "TEXT",
                content = "I want to celebrate my achievement and graduation with confidence.",
                timestampEpochMs = 2000L,
                sequenceOrder = 1
            )
        )

        val summary = SessionSummaryGenerator.generateSummary(session, messages, emptyList())
        val vocab = json.decodeFromString<List<String>>(summary.vocabularyPracticedJson)

        assertTrue("celebrate" in vocab)
        assertTrue("achievement" in vocab)
        assertTrue("graduation" in vocab)
        assertTrue("confidence" in vocab)
        assertFalse("this" in vocab)
        assertFalse("want" in vocab)
    }
}

