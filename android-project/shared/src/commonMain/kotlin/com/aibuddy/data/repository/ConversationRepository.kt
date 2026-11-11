package com.aibuddy.data.repository

import com.aibuddy.data.mode.CorrectionPolicy
import com.aibuddy.data.mode.ExerciseProgress
import com.aibuddy.data.mode.LanguagePreference
import com.aibuddy.data.mode.LearningMode
import com.aibuddy.data.mode.SessionModeState
import com.aibuddy.data.tutor.TutorFeedback
import com.aibuddy.util.currentTimeEpochMillis
import com.aibuddy.util.randomUuidString
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.concurrent.Volatile

enum class TurnSender {
    USER,
    BUDDY
}

enum class TurnModality {
    VOICE,
    TEXT
}

data class ConversationTurn(
    val id: String = randomUuidString(),
    val sender: TurnSender,
    val text: String,
    val modality: TurnModality,
    val timestamp: Long = currentTimeEpochMillis(),
    val isFinal: Boolean = true,
    val feedback: TutorFeedback? = null
)

/**
 * Single source of truth for conversational history across voice and text modalities.
 * Keeps past turns bounded in memory to prevent heap leaks.
 */
class ConversationRepository private constructor() {

    private val _turns = MutableStateFlow<List<ConversationTurn>>(emptyList())
    val turns: StateFlow<List<ConversationTurn>> = _turns.asStateFlow()

    private val _feedbacks = MutableStateFlow<Map<String, TutorFeedback>>(emptyMap())
    val feedbacks: StateFlow<Map<String, TutorFeedback>> = _feedbacks.asStateFlow()

    private val _sessionModeState = MutableStateFlow(SessionModeState())
    val sessionModeState: StateFlow<SessionModeState> = _sessionModeState.asStateFlow()

    fun addTurn(
        id: String = randomUuidString(),
        sender: TurnSender,
        text: String,
        modality: TurnModality,
        isFinal: Boolean = true,
        feedback: TutorFeedback? = null
    ): ConversationTurn {
        val newTurn = ConversationTurn(
            id = id,
            sender = sender,
            text = text,
            modality = modality,
            isFinal = isFinal,
            feedback = feedback
        )
        val current = _turns.value.toMutableList()
        if (current.size >= MAX_HISTORY_TURNS) {
            val removed = current.removeAt(0)
            if (_feedbacks.value.containsKey(removed.id)) {
                _feedbacks.value = _feedbacks.value - removed.id
            }
        }
        current.add(newTurn)
        _turns.value = current
        if (feedback != null) {
            _feedbacks.value = _feedbacks.value + (newTurn.id to feedback)
        }
        return newTurn
    }

    fun attachFeedback(turnId: String, feedback: TutorFeedback) {
        val current = _turns.value.toMutableList()
        val index = current.indexOfFirst { it.id == turnId }
        if (index != -1) {
            current[index] = current[index].copy(feedback = feedback)
            _turns.value = current
            _feedbacks.value = _feedbacks.value + (turnId to feedback)
        }
    }

    fun getFeedbackForTurn(turnId: String): TutorFeedback? {
        return _feedbacks.value[turnId]
    }

    fun updateLatestTurn(text: String, isFinal: Boolean) {
        val current = _turns.value.toMutableList()
        if (current.isNotEmpty()) {
            val lastIdx = current.lastIndex
            current[lastIdx] = current[lastIdx].copy(text = text, isFinal = isFinal)
            _turns.value = current
        }
    }

    fun getRecentTurns(limit: Int = 10): List<ConversationTurn> {
        val current = _turns.value
        return if (current.size <= limit) current else current.takeLast(limit)
    }

    fun clearTurns() {
        _turns.value = emptyList()
    }

    fun setLearningMode(mode: LearningMode) {
        val current = _sessionModeState.value
        if (current.activeMode == mode) return
        _sessionModeState.value = current.copy(
            activeMode = mode,
            previousMode = current.activeMode,
            activeExercise = null,
            previousExercise = current.activeExercise?.copy(isPaused = true) ?: current.previousExercise
        )
    }

    fun setCorrectionPolicy(policy: CorrectionPolicy) {
        _sessionModeState.value = _sessionModeState.value.copy(correctionPolicy = policy)
    }

    fun setLanguagePreference(pref: LanguagePreference) {
        _sessionModeState.value = _sessionModeState.value.copy(languagePreference = pref)
    }

    fun startExercise(exercise: ExerciseProgress) {
        val current = _sessionModeState.value
        _sessionModeState.value = current.copy(
            activeMode = exercise.mode,
            previousMode = current.activeMode,
            activeExercise = exercise,
            previousExercise = current.activeExercise?.copy(isPaused = true) ?: current.previousExercise
        )
    }

    fun updateExerciseProgress(progress: ExerciseProgress) {
        _sessionModeState.value = _sessionModeState.value.copy(activeExercise = progress)
    }

    fun pauseCurrentExercise() {
        val current = _sessionModeState.value
        val active = current.activeExercise ?: return
        _sessionModeState.value = current.copy(
            activeExercise = active.copy(isPaused = true)
        )
    }

    fun resumePreviousExercise(): ExerciseProgress? {
        val current = _sessionModeState.value
        val toResume = current.previousExercise ?: current.activeExercise
        return if (toResume != null) {
            val resumed = toResume.copy(isPaused = false)
            _sessionModeState.value = current.copy(
                activeMode = resumed.mode,
                activeExercise = resumed
            )
            resumed
        } else {
            null
        }
    }

    fun completeCurrentExercise() {
        val current = _sessionModeState.value
        _sessionModeState.value = current.copy(
            activeExercise = null,
            previousExercise = current.activeExercise?.copy(isPaused = false)
        )
    }

    fun resetToFreeConversation() {
        val current = _sessionModeState.value
        _sessionModeState.value = current.copy(
            activeMode = LearningMode.FREE_CONVERSATION,
            previousMode = current.activeMode,
            activeExercise = null,
            previousExercise = current.activeExercise?.copy(isPaused = true) ?: current.previousExercise
        )
    }

    companion object {
        private const val MAX_HISTORY_TURNS = 100

        @Volatile
        private var instance: ConversationRepository? = null

        fun getInstance(): ConversationRepository {
            return instance ?: synchronized(this) {
                instance ?: ConversationRepository().also { instance = it }
            }
        }
    }
}
