package com.aibuddy.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.aibuddy.data.chat.ChatMessage
import com.aibuddy.data.chat.GeminiChatClient
import com.aibuddy.data.history.ChatHistoryRepository
import com.aibuddy.data.history.PracticeHistoryRepository
import com.aibuddy.data.history.PracticeSession
import com.aibuddy.data.history.SessionModality
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class ChatViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val client: GeminiChatClient = GeminiChatClient()
    private val tutorCorrectionEngine = com.aibuddy.data.tutor.TutorCorrectionEngine()
    private val chatHistoryRepository = ChatHistoryRepository.getInstance(application)
    private val practiceHistoryRepository = PracticeHistoryRepository.getInstance(application)
    private val sessionHistoryRepository = com.aibuddy.data.history.SessionHistoryRepository.getInstance(application)
    private val conversationRepository = com.aibuddy.data.repository.ConversationRepository.getInstance()

    private var currentChatSessionId: String? = null
    private var chatSequenceOrder = 0

    val feedbacks: StateFlow<Map<String, com.aibuddy.data.tutor.TutorFeedback>> = conversationRepository.feedbacks
    val sessionModeState: StateFlow<com.aibuddy.data.mode.SessionModeState> = conversationRepository.sessionModeState

    private val modeRouter = com.aibuddy.domain.router.ModeRouter()

    private val initialGreeting = ChatMessage(
        text = "Halo! Aku Buddy, tutor bahasa Inggris pribadimu.\n\nKamu bisa tanya seputar grammar, beda kosakata, minta koreksi kalimat, atau latihan percakapan bahasa Inggris langsung denganku!",
        isUser = false
    )

    private val _messages = MutableStateFlow<List<ChatMessage>>(
        chatHistoryRepository.loadMessages().ifEmpty { listOf(initialGreeting) }
    )
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    fun sendMessage(userText: String) {
        val trimmed = userText.trim()
        if (trimmed.isBlank() || _isLoading.value) return

        // 1. Evaluate natural language mode and activity routing
        val routing = modeRouter.route(trimmed, sessionModeState.value)
        when (routing) {
            is com.aibuddy.domain.router.ModeRoutingResult.ModeSwitch -> {
                conversationRepository.setLearningMode(routing.targetMode)
                routing.targetExercise?.let { exercise ->
                    conversationRepository.startExercise(exercise)
                }
            }
            is com.aibuddy.domain.router.ModeRoutingResult.ResumePrevious -> {
                conversationRepository.resumePreviousExercise()
            }
            is com.aibuddy.domain.router.ModeRoutingResult.ExerciseAction -> {
                when (routing.action) {
                    com.aibuddy.domain.router.ExerciseControlAction.SKIP -> skipCurrentQuestion()
                    com.aibuddy.domain.router.ExerciseControlAction.REPEAT -> repeatCurrentQuestion()
                    com.aibuddy.domain.router.ExerciseControlAction.STOP -> stopCurrentExercise()
                }
            }
            is com.aibuddy.domain.router.ModeRoutingResult.CorrectionPolicyUpdate -> {
                conversationRepository.setCorrectionPolicy(routing.policy)
            }
            is com.aibuddy.domain.router.ModeRoutingResult.TemporaryQuestion -> {
                conversationRepository.pauseCurrentExercise()
            }
            is com.aibuddy.domain.router.ModeRoutingResult.ClarificationNeeded,
            is com.aibuddy.domain.router.ModeRoutingResult.InModeUtterance -> {
                // Continue standard conversation
            }
        }

        val sId = currentChatSessionId ?: "chat_session_${System.currentTimeMillis()}".also { currentChatSessionId = it }
        chatSequenceOrder++
        val seq = chatSequenceOrder

        val userMessage = ChatMessage(text = trimmed, isUser = true)
        val currentHistory = _messages.value
        val updatedHistory = currentHistory + userMessage
        _messages.value = updatedHistory
        chatHistoryRepository.saveMessages(updatedHistory)
        _isLoading.value = true
        _errorMessage.value = null

        // Record user turn in shared repository with matching ID
        val userTurn = conversationRepository.addTurn(
            id = userMessage.id,
            sender = com.aibuddy.data.repository.TurnSender.USER,
            text = trimmed,
            modality = com.aibuddy.data.repository.TurnModality.TEXT,
            isFinal = true
        )

        viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            sessionHistoryRepository.createOrGetSession(
                sessionId = sId,
                modality = "CHAT",
                primaryMode = sessionModeState.value.activeMode.name,
                title = "Tutor Bahasa Inggris (${sessionModeState.value.activeMode.displayNameId})"
            )
            sessionHistoryRepository.saveMessage(
                sessionId = sId,
                messageId = userMessage.id,
                sender = com.aibuddy.data.repository.TurnSender.USER,
                modality = com.aibuddy.data.repository.TurnModality.TEXT,
                content = trimmed,
                sequenceOrder = seq,
                isInterrupted = false
            )
        }

        // Asynchronously analyze user utterance for structured tutor feedback if policy allows
        val currentPolicy = sessionModeState.value.correctionPolicy
        val shouldAnalyze = currentPolicy != com.aibuddy.data.mode.CorrectionPolicy.OFF &&
            (currentPolicy != com.aibuddy.data.mode.CorrectionPolicy.REQUEST_ONLY ||
                trimmed.contains("koreksi", ignoreCase = true) ||
                trimmed.contains("correct", ignoreCase = true))

        if (shouldAnalyze) {
            viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
                val feedbackResult = tutorCorrectionEngine.analyzeUtterance(userTurn.id, trimmed)
                feedbackResult.getOrNull()?.let { feedback ->
                    conversationRepository.attachFeedback(userTurn.id, feedback)
                    sessionHistoryRepository.saveCorrection(sId, userTurn.id, feedback)
                }
            }
        }

        viewModelScope.launch {
            // Build rich contextual history from both chat screen and shared voice turns
            val recentTurns = conversationRepository.getRecentTurns(limit = 12)
            val combinedHistory = if (recentTurns.isNotEmpty()) {
                recentTurns.dropLast(1).map { turn ->
                    ChatMessage(
                        text = turn.text,
                        isUser = turn.sender == com.aibuddy.data.repository.TurnSender.USER
                    )
                }
            } else {
                currentHistory.filter { it != initialGreeting }
            }

            val result = client.sendMessage(
                history = combinedHistory,
                userMessage = trimmed,
                sessionModeState = sessionModeState.value
            )

            result.onSuccess { replyText ->
                val replyId = java.util.UUID.randomUUID().toString()
                val newMessages = _messages.value + ChatMessage(id = replyId, text = replyText, isUser = false)
                _messages.value = newMessages
                chatHistoryRepository.saveMessages(newMessages)

                conversationRepository.addTurn(
                    id = replyId,
                    sender = com.aibuddy.data.repository.TurnSender.BUDDY,
                    text = replyText,
                    modality = com.aibuddy.data.repository.TurnModality.TEXT,
                    isFinal = true
                )

                chatSequenceOrder++
                val replySeq = chatSequenceOrder
                viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
                    sessionHistoryRepository.saveMessage(
                        sessionId = sId,
                        messageId = replyId,
                        sender = com.aibuddy.data.repository.TurnSender.BUDDY,
                        modality = com.aibuddy.data.repository.TurnModality.TEXT,
                        content = replyText,
                        sequenceOrder = replySeq,
                        isInterrupted = false
                    )
                    sessionHistoryRepository.finalizeSession(sId, isCompleted = true)
                }

                // Advance exercise question if inside an active exercise
                val exercise = sessionModeState.value.activeExercise
                if (exercise != null && !exercise.isPaused && !exercise.isCompleted) {
                    val nextIndex = exercise.currentQuestionIndex + 1
                    if (nextIndex <= exercise.totalQuestions) {
                        conversationRepository.updateExerciseProgress(exercise.copy(currentQuestionIndex = nextIndex))
                    } else {
                        conversationRepository.completeCurrentExercise()
                    }
                }

                _isLoading.value = false
            }.onFailure { error ->
                _errorMessage.value = error.localizedMessage ?: "Gagal menghubungi Gemini"
                val errMessages = _messages.value + ChatMessage(
                    text = "Maaf, terjadi kendala koneksi ke Gemini: ${error.localizedMessage ?: "Unknown error"}. Silakan periksa koneksi internet atau coba lagi.",
                    isUser = false
                )
                _messages.value = errMessages
                chatHistoryRepository.saveMessages(errMessages)
                _isLoading.value = false
            }
        }
    }

    fun setLearningMode(mode: com.aibuddy.data.mode.LearningMode) {
        conversationRepository.setLearningMode(mode)
    }

    fun skipCurrentQuestion() {
        val active = sessionModeState.value.activeExercise ?: return
        val nextIdx = active.currentQuestionIndex + 1
        if (nextIdx <= active.totalQuestions) {
            conversationRepository.updateExerciseProgress(active.copy(currentQuestionIndex = nextIdx))
        } else {
            conversationRepository.completeCurrentExercise()
        }
    }

    fun repeatCurrentQuestion() {
        // Handled naturally or by prompt
    }

    fun stopCurrentExercise() {
        conversationRepository.resetToFreeConversation()
    }

    fun resumePreviousExercise() {
        conversationRepository.resumePreviousExercise()
    }

    fun clearChat() {
        val reset = listOf(initialGreeting)
        _messages.value = reset
        chatHistoryRepository.clearHistory()
        currentChatSessionId = null
        chatSequenceOrder = 0
        _errorMessage.value = null
        _isLoading.value = false
    }
}
