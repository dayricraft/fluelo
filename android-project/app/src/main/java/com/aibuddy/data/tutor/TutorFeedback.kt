package com.aibuddy.data.tutor

import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
enum class FeedbackCategory {
    GRAMMAR,
    TENSE,
    PREPOSITION,
    SUBJECT_VERB_AGREEMENT,
    VOCABULARY,
    NATURAL_PHRASING,
    GENERAL;

    companion object {
        fun fromString(value: String?): FeedbackCategory {
            if (value.isNullOrBlank()) return GENERAL
            return entries.firstOrNull { it.name.equals(value.trim(), ignoreCase = true) } ?: GENERAL
        }
    }
}

@Serializable
enum class FeedbackSeverity {
    MINOR,
    MODERATE,
    MAJOR;

    companion object {
        fun fromString(value: String?): FeedbackSeverity {
            if (value.isNullOrBlank()) return MODERATE
            return entries.firstOrNull { it.name.equals(value.trim(), ignoreCase = true) } ?: MODERATE
        }
    }
}

@Serializable
data class TutorFeedback(
    val id: String = UUID.randomUUID().toString(),
    val turnId: String,
    val originalText: String,
    val correctedText: String,
    val explanation: String,
    val category: FeedbackCategory = FeedbackCategory.GRAMMAR,
    val severity: FeedbackSeverity = FeedbackSeverity.MODERATE,
    val spokenNote: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

@Serializable
data class TutorAnalysisResponse(
    val needsCorrection: Boolean = false,
    val originalText: String? = null,
    val correctedText: String? = null,
    val explanation: String? = null,
    val category: String? = null,
    val severity: String? = null,
    val spokenNote: String? = null
)
