package com.aibuddy.data.mode

import kotlinx.serialization.Serializable

@Serializable
enum class LearningMode {
    FREE_CONVERSATION,
    VOCABULARY,
    GRAMMAR,
    ROLEPLAY;

    val displayNameId: String
        get() = when (this) {
            FREE_CONVERSATION -> "Percakapan Bebas"
            VOCABULARY -> "Latihan Kosakata"
            GRAMMAR -> "Tata Bahasa (Grammar)"
            ROLEPLAY -> "Simulasi Roleplay"
        }

    val displayNameEn: String
        get() = when (this) {
            FREE_CONVERSATION -> "Free Conversation"
            VOCABULARY -> "Vocabulary Practice"
            GRAMMAR -> "Grammar Practice"
            ROLEPLAY -> "Roleplay Simulation"
        }

    val shortLabelId: String
        get() = when (this) {
            FREE_CONVERSATION -> "Bebas"
            VOCABULARY -> "Kosakata"
            GRAMMAR -> "Grammar"
            ROLEPLAY -> "Roleplay"
        }

    val shortLabelEn: String
        get() = when (this) {
            FREE_CONVERSATION -> "Free"
            VOCABULARY -> "Vocab"
            GRAMMAR -> "Grammar"
            ROLEPLAY -> "Roleplay"
        }
}

@Serializable
enum class CorrectionPolicy {
    AFTER_SELECTIVE_HYBRID,
    OFF,
    REQUEST_ONLY,
    INTENSIVE;

    val labelId: String
        get() = when (this) {
            AFTER_SELECTIVE_HYBRID -> "Selektif (Default)"
            OFF -> "Nonaktif"
            REQUEST_ONLY -> "Hanya Saat Diminta"
            INTENSIVE -> "Intensif"
        }
}

@Serializable
enum class LanguagePreference {
    BILINGUAL,
    ENGLISH_IMMERSION,
    INDONESIAN_EXPLANATION;

    val labelId: String
        get() = when (this) {
            BILINGUAL -> "Bilingual (ID & EN)"
            ENGLISH_IMMERSION -> "Full English"
            INDONESIAN_EXPLANATION -> "Penjelasan Bahasa Indonesia"
        }
}

