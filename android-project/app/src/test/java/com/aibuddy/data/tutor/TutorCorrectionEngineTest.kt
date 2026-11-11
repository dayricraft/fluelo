package com.aibuddy.data.tutor

import org.junit.Assert.*
import org.junit.Test

class TutorCorrectionEngineTest {

    private val engine = TutorCorrectionEngine(apiKey = "dummy_test_key")

    @Test
    fun parseAnalysisResponse_needsCorrectionTrue_returnsTutorFeedback() {
        val sampleJson = """
            {
              "needsCorrection": true,
              "originalText": "I go to market yesterday",
              "correctedText": "I went to the market yesterday.",
              "explanation": "Gunakan kata kerja bentuk lampau (verb 2) 'went' karena kejadiannya sudah berlangsung kemarin (yesterday).",
              "category": "TENSE",
              "severity": "MODERATE",
              "spokenNote": "Gunakan 'went' untuk kejadian kemarin ya"
            }
        """.trimIndent()

        val result = engine.parseAnalysisResponse(
            turnId = "turn_123",
            originalUtterance = "I go to market yesterday",
            jsonText = sampleJson
        )

        assertTrue(result.isSuccess)
        val feedback = result.getOrNull()
        assertNotNull(feedback)
        assertEquals("turn_123", feedback?.turnId)
        assertEquals("I go to market yesterday", feedback?.originalText)
        assertEquals("I went to the market yesterday.", feedback?.correctedText)
        assertEquals(FeedbackCategory.TENSE, feedback?.category)
        assertEquals(FeedbackSeverity.MODERATE, feedback?.severity)
        assertEquals("Gunakan 'went' untuk kejadian kemarin ya", feedback?.spokenNote)
        assertTrue(feedback?.explanation?.contains("went") == true)
    }

    @Test
    fun parseAnalysisResponse_needsCorrectionFalse_returnsNull() {
        val sampleJson = """
            {
              "needsCorrection": false
            }
        """.trimIndent()

        val result = engine.parseAnalysisResponse(
            turnId = "turn_456",
            originalUtterance = "I love learning English with you",
            jsonText = sampleJson
        )

        assertTrue(result.isSuccess)
        assertNull(result.getOrNull())
    }

    @Test
    fun parseAnalysisResponse_invalidJson_recoversSafelyWithNull() {
        val invalidJson = "This is not valid JSON string"

        val result = engine.parseAnalysisResponse(
            turnId = "turn_789",
            originalUtterance = "Broken response",
            jsonText = invalidJson
        )

        assertTrue(result.isSuccess)
        assertNull(result.getOrNull())
    }

    @Test
    fun feedbackCategory_fromString_handlesCaseInsensitiveAndFallback() {
        assertEquals(FeedbackCategory.PREPOSITION, FeedbackCategory.fromString("preposition"))
        assertEquals(FeedbackCategory.SUBJECT_VERB_AGREEMENT, FeedbackCategory.fromString("subject_verb_agreement"))
        assertEquals(FeedbackCategory.GENERAL, FeedbackCategory.fromString("unknown_category"))
        assertEquals(FeedbackCategory.GENERAL, FeedbackCategory.fromString(null))
    }

    @Test
    fun feedbackSeverity_fromString_handlesCaseInsensitiveAndFallback() {
        assertEquals(FeedbackSeverity.MINOR, FeedbackSeverity.fromString("minor"))
        assertEquals(FeedbackSeverity.MAJOR, FeedbackSeverity.fromString("MAJOR"))
        assertEquals(FeedbackSeverity.MODERATE, FeedbackSeverity.fromString("unknown_severity"))
        assertEquals(FeedbackSeverity.MODERATE, FeedbackSeverity.fromString(null))
    }
}
