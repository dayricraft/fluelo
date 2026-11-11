package com.aibuddy.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.aibuddy.BuildConfig
import com.aibuddy.data.history.PracticeHistoryRepository
import com.aibuddy.data.history.PracticeSession
import com.aibuddy.data.history.SessionModality
import com.aibuddy.data.repository.LiveSessionRepository
import com.aibuddy.live.AudioSessionState
import com.aibuddy.live.LiveSessionMetrics
import com.aibuddy.live.LiveTranscriptEntry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class TranscriptSheetState {
    HIDDEN,
    PEEK,
    EXPANDED
}

class LiveSessionViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = LiveSessionRepository(
        context = application.applicationContext,
        scope = viewModelScope
    )

    private val conversationRepository = com.aibuddy.data.repository.ConversationRepository.getInstance()
    private val practiceHistoryRepository = PracticeHistoryRepository.getInstance(application)
    private val sessionHistoryRepository = com.aibuddy.data.history.SessionHistoryRepository.getInstance(application)
    private val tutorCorrectionEngine = com.aibuddy.data.tutor.TutorCorrectionEngine()

    private var currentSessionId: String? = null
    private var sequenceOrderCounter = 0

    val sessionState: StateFlow<AudioSessionState> = repository.sessionState
    val metrics: StateFlow<LiveSessionMetrics> = repository.metrics
    val transcripts: StateFlow<List<LiveTranscriptEntry>> = repository.transcripts
    val errorMessage: StateFlow<String?> = repository.errorMessage
    val micAmplitude: StateFlow<Float> = repository.micAmplitude
    val speakerAmplitude: StateFlow<Float> = repository.speakerAmplitude
    val isMuted: StateFlow<Boolean> = repository.isMuted
    val feedbacks: StateFlow<Map<String, com.aibuddy.data.tutor.TutorFeedback>> = conversationRepository.feedbacks
    val sessionModeState: StateFlow<com.aibuddy.data.mode.SessionModeState> = conversationRepository.sessionModeState

    private val modeRouter = com.aibuddy.domain.router.ModeRouter()

    private val _transcriptSheetState = MutableStateFlow(TranscriptSheetState.HIDDEN)
    val transcriptSheetState: StateFlow<TranscriptSheetState> = _transcriptSheetState.asStateFlow()

    private val _isTranscriptExpanded = MutableStateFlow(false)
    val isTranscriptExpanded: StateFlow<Boolean> = _isTranscriptExpanded.asStateFlow()

    private val analyzedTurnIds = mutableSetOf<String>()
    private val activeCorrectionJobs = mutableMapOf<String, kotlinx.coroutines.Job>()

    init {
        // Synchronize live session transcripts with the unified ConversationRepository
        viewModelScope.launch {
            var lastSyncedCount = 0
            repository.transcripts.collect { entries ->
                if (entries.size > lastSyncedCount) {
                    for (i in lastSyncedCount until entries.size) {
                        val e = entries[i]
                        val sender = if (e.sender == "You") com.aibuddy.data.repository.TurnSender.USER else com.aibuddy.data.repository.TurnSender.BUDDY
                        conversationRepository.addTurn(
                            id = e.id,
                            sender = sender,
                            text = e.text,
                            modality = com.aibuddy.data.repository.TurnModality.VOICE,
                            isFinal = e.isFinal
                        )
                        if (e.isFinal) {
                            val sessionId = currentSessionId ?: "voice_session_${System.currentTimeMillis()}".also { currentSessionId = it }
                            sequenceOrderCounter++
                            val seq = sequenceOrderCounter
                            viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
                                sessionHistoryRepository.saveMessage(
                                    sessionId = sessionId,
                                    messageId = e.id,
                                    sender = sender,
                                    modality = com.aibuddy.data.repository.TurnModality.VOICE,
                                    content = e.text,
                                    sequenceOrder = seq,
                                    isInterrupted = false
                                )
                            }
                        }
                        if (e.sender == "You" && e.isFinal) {
                            handleUserTurnFinalized(e.id, e.text)
                        } else if (e.sender == "Buddy" && e.isFinal) {
                            handleBuddyTurnFinalized()
                        }
                    }
                    lastSyncedCount = entries.size
                } else if (entries.isNotEmpty()) {
                    val last = entries.last()
                    conversationRepository.updateLatestTurn(last.text, last.isFinal)
                    if (last.sender == "You" && last.isFinal) {
                        handleUserTurnFinalized(last.id, last.text)
                    }
                }
            }
        }
    }

    private fun handleUserTurnFinalized(turnId: String, text: String) {
        val routing = modeRouter.route(text, sessionModeState.value)
        when (routing) {
            is com.aibuddy.domain.router.ModeRoutingResult.ModeSwitch -> {
                conversationRepository.setLearningMode(routing.targetMode)
                routing.targetExercise?.let { exercise ->
                    conversationRepository.startExercise(exercise)
                }
                repository.sendSystemSteeringMessage(routing.announcementPrompt)
            }
            is com.aibuddy.domain.router.ModeRoutingResult.ResumePrevious -> {
                conversationRepository.resumePreviousExercise()
                repository.sendSystemSteeringMessage(routing.announcementPrompt)
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
                repository.sendSystemSteeringMessage(routing.feedbackMessage)
            }
            is com.aibuddy.domain.router.ModeRoutingResult.TemporaryQuestion -> {
                conversationRepository.pauseCurrentExercise()
            }
            is com.aibuddy.domain.router.ModeRoutingResult.ClarificationNeeded -> {
                repository.sendSystemSteeringMessage("Minta klarifikasi singkat ke user: ${routing.clarificationPrompt}")
            }
            is com.aibuddy.domain.router.ModeRoutingResult.InModeUtterance -> {
                // Conversational answer within current mode
            }
        }

        triggerCorrectionIfEligible(turnId, "You", text, isFinal = true)
    }

    private fun handleBuddyTurnFinalized() {
        val exercise = sessionModeState.value.activeExercise
        if (exercise != null && !exercise.isPaused && !exercise.isCompleted) {
            val nextIndex = exercise.currentQuestionIndex + 1
            if (nextIndex <= exercise.totalQuestions) {
                conversationRepository.updateExerciseProgress(
                    exercise.copy(currentQuestionIndex = nextIndex)
                )
            } else {
                conversationRepository.completeCurrentExercise()
                if (exercise.mode == com.aibuddy.data.mode.LearningMode.VOCABULARY) {
                    repository.sendSystemSteeringMessage(
                        "Latihan ${exercise.topicOrTitle} selesai (${exercise.totalQuestions} kata/kalimat). Berikan evaluasi review singkat yang ramah, apresiasi usaha user, dan rangkuman tips."
                    )
                }
            }
        }
    }

    private fun triggerCorrectionIfEligible(turnId: String, sender: String, text: String, isFinal: Boolean) {
        if (sender != "You" || !isFinal) return
        val activeExercise = sessionModeState.value.activeExercise
        if (activeExercise != null && !activeExercise.isCompleted &&
            activeExercise.mode == com.aibuddy.data.mode.LearningMode.VOCABULARY
        ) {
            // Defer feedback until the entire vocabulary / narration drill is completed
            return
        }
        val currentPolicy = sessionModeState.value.correctionPolicy
        if (currentPolicy == com.aibuddy.data.mode.CorrectionPolicy.OFF) return
        if (currentPolicy == com.aibuddy.data.mode.CorrectionPolicy.REQUEST_ONLY &&
            !text.contains("koreksi", ignoreCase = true) &&
            !text.contains("correct", ignoreCase = true)
        ) {
            return
        }

        val trimmed = text.trim()
        if (trimmed.length < 3 || turnId in analyzedTurnIds) return
        analyzedTurnIds.add(turnId)

        val job = viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            val result = tutorCorrectionEngine.analyzeUtterance(turnId, trimmed)
            result.getOrNull()?.let { feedback ->
                conversationRepository.attachFeedback(turnId, feedback)
                currentSessionId?.let { sId ->
                    sessionHistoryRepository.saveCorrection(sId, turnId, feedback)
                }
            }
            activeCorrectionJobs.remove(turnId)
        }
        activeCorrectionJobs[turnId] = job
    }

    fun setLearningMode(mode: com.aibuddy.data.mode.LearningMode) {
        conversationRepository.setLearningMode(mode)
        repository.sendSystemSteeringMessage("Mode belajar beralih ke: ${mode.displayNameId}. Ajak user berinteraksi sesuai mode ini.")
    }

    fun skipCurrentQuestion() {
        val active = sessionModeState.value.activeExercise ?: return
        val nextIdx = active.currentQuestionIndex + 1
        if (nextIdx <= active.totalQuestions) {
            conversationRepository.updateExerciseProgress(active.copy(currentQuestionIndex = nextIdx))
            repository.sendSystemSteeringMessage("User memilih lewati soal. Langsung berikan pertanyaan nomor $nextIdx.")
        } else {
            conversationRepository.completeCurrentExercise()
            repository.sendSystemSteeringMessage("Latihan telah selesai seluruhnya. Berikan kesimpulan singkat dan apresiasi.")
        }
    }

    fun repeatCurrentQuestion() {
        val active = sessionModeState.value.activeExercise ?: return
        repository.sendSystemSteeringMessage("User meminta mengulang soal nomor ${active.currentQuestionIndex}. Tolong ulangi pertanyaannya dengan ramah.")
    }

    fun stopCurrentExercise() {
        conversationRepository.resetToFreeConversation()
        repository.sendSystemSteeringMessage("Latihan dihentikan atas permintaan user. Mari kembali ke percakapan santai.")
    }

    fun resumePreviousExercise() {
        val resumed = conversationRepository.resumePreviousExercise()
        if (resumed != null) {
            repository.sendSystemSteeringMessage("Melanjutkan latihan ${resumed.topicOrTitle}. Lanjut dari soal nomor ${resumed.currentQuestionIndex} dari ${resumed.totalQuestions}.")
        }
    }

    fun setTranscriptSheetState(state: TranscriptSheetState) {
        _transcriptSheetState.value = state
        _isTranscriptExpanded.value = (state == TranscriptSheetState.EXPANDED)
    }

    fun toggleTranscript() {
        val next = when (_transcriptSheetState.value) {
            TranscriptSheetState.HIDDEN -> TranscriptSheetState.PEEK
            TranscriptSheetState.PEEK -> TranscriptSheetState.EXPANDED
            TranscriptSheetState.EXPANDED -> TranscriptSheetState.HIDDEN
        }
        setTranscriptSheetState(next)
    }

    fun setTranscriptExpanded(expanded: Boolean) {
        setTranscriptSheetState(if (expanded) TranscriptSheetState.EXPANDED else TranscriptSheetState.HIDDEN)
    }

    fun sendTextMessage(text: String): Boolean {
        val trimmed = text.trim()
        if (trimmed.isBlank()) return false
        val success = repository.sendTextMessage(trimmed)
        if (success) {
            val latestUserEntry = transcripts.value.lastOrNull { it.sender == "You" }
            val turnId = latestUserEntry?.id ?: java.util.UUID.randomUUID().toString()
            conversationRepository.addTurn(
                id = turnId,
                sender = com.aibuddy.data.repository.TurnSender.USER,
                text = trimmed,
                modality = com.aibuddy.data.repository.TurnModality.TEXT,
                isFinal = true
            )
            val sId = currentSessionId ?: "voice_session_${System.currentTimeMillis()}".also { currentSessionId = it }
            sequenceOrderCounter++
            val seq = sequenceOrderCounter
            viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
                sessionHistoryRepository.saveMessage(
                    sessionId = sId,
                    messageId = turnId,
                    sender = com.aibuddy.data.repository.TurnSender.USER,
                    modality = com.aibuddy.data.repository.TurnModality.TEXT,
                    content = trimmed,
                    sequenceOrder = seq,
                    isInterrupted = false
                )
            }
            handleUserTurnFinalized(turnId, trimmed)
        }
        return success
    }

    fun startSession(voiceName: String = "Puck") {
        val sId = "voice_session_${System.currentTimeMillis()}"
        currentSessionId = sId
        sequenceOrderCounter = 0
        viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            sessionHistoryRepository.createOrGetSession(
                sessionId = sId,
                modality = "VOICE",
                primaryMode = sessionModeState.value.activeMode.name,
                title = "Panggilan Suara dengan Buddy"
            )
        }
        repository.startSession(
            apiKey = BuildConfig.GEMINI_API_KEY,
            voiceName = voiceName
        )
    }

    fun stopSession() {
        val sId = currentSessionId
        if (sId != null) {
            viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
                sessionHistoryRepository.finalizeSession(sId, isCompleted = true)
            }
            currentSessionId = null
        }
        repository.stopSession()
    }

    fun toggleCall(voiceName: String = "Puck") {
        val state = sessionState.value
        if (state == AudioSessionState.IDLE || state == AudioSessionState.ERROR) {
            startSession(voiceName)
        } else {
            stopSession()
        }
    }

    fun toggleMute() {
        repository.setMuted(!isMuted.value)
    }

    fun manualBargeIn() {
        repository.manualBargeIn()
    }

    override fun onCleared() {
        super.onCleared()
        stopSession()
    }
}
