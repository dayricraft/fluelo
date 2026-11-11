package com.aibuddy.data.mode

import kotlinx.serialization.Serializable
import com.aibuddy.util.randomUuidString

@Serializable
enum class ExerciseDirection {
    ID_TO_EN,
    EN_TO_ID,
    DEFINITION_TO_WORD,
    SENTENCE_BUILDING,
    NARRATION_DICTATION;

    val labelId: String
        get() = when (this) {
            ID_TO_EN -> "Indonesia ke Inggris"
            EN_TO_ID -> "Inggris ke Indonesia"
            DEFINITION_TO_WORD -> "Tebak Kata dari Arti"
            SENTENCE_BUILDING -> "Menyusun Kalimat"
            NARRATION_DICTATION -> "Dikte & Narasi Kalimat"
        }
}

@Serializable
data class RoleplayScenario(
    val title: String,
    val userRole: String,
    val buddyRole: String,
    val contextDescription: String
)

@Serializable
data class ExerciseProgress(
    val exerciseId: String = randomUuidString(),
    val mode: LearningMode,
    val topicOrTitle: String,
    val direction: ExerciseDirection = ExerciseDirection.ID_TO_EN,
    val currentQuestionIndex: Int = 1,
    val totalQuestions: Int = 5,
    val currentPrompt: String = "",
    val expectedAnswer: String = "",
    val correctCount: Int = 0,
    val incorrectCount: Int = 0,
    val isPaused: Boolean = false,
    val roleplayScenario: RoleplayScenario? = null
) {
    val isCompleted: Boolean
        get() = currentQuestionIndex > totalQuestions

    val completionRatio: Float
        get() = if (totalQuestions > 0) {
            (currentQuestionIndex.coerceAtMost(totalQuestions).toFloat() / totalQuestions.toFloat())
        } else 0f
}

@Serializable
data class SessionModeState(
    val activeMode: LearningMode = LearningMode.FREE_CONVERSATION,
    val previousMode: LearningMode? = null,
    val correctionPolicy: CorrectionPolicy = CorrectionPolicy.AFTER_SELECTIVE_HYBRID,
    val languagePreference: LanguagePreference = LanguagePreference.BILINGUAL,
    val activeExercise: ExerciseProgress? = null,
    val previousExercise: ExerciseProgress? = null
)

