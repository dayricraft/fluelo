package com.aibuddy.data.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class ConversationRepositoryTest {

    private lateinit var repository: ConversationRepository

    @Before
    fun setUp() {
        repository = ConversationRepository.getInstance()
        repository.clearTurns()
    }

    @Test
    fun addTurn_voiceAndTextTurns_addedCorrectly() {
        val turn1 = repository.addTurn(
            sender = TurnSender.USER,
            text = "Halo Buddy",
            modality = TurnModality.VOICE,
            isFinal = true
        )

        val turn2 = repository.addTurn(
            sender = TurnSender.BUDDY,
            text = "Halo! Senang mengobrol denganmu.",
            modality = TurnModality.VOICE,
            isFinal = true
        )

        val turn3 = repository.addTurn(
            sender = TurnSender.USER,
            text = "Can you help me practice English?",
            modality = TurnModality.TEXT,
            isFinal = true
        )

        val turns = repository.turns.value
        assertEquals(3, turns.size)
        assertEquals("Halo Buddy", turns[0].text)
        assertEquals(TurnModality.VOICE, turns[0].modality)
        assertEquals(TurnSender.BUDDY, turns[1].sender)
        assertEquals(TurnModality.TEXT, turns[2].modality)
    }

    @Test
    fun updateLatestTurn_updatesTextAndFinalStatus() {
        repository.addTurn(
            sender = TurnSender.BUDDY,
            text = "I am explai",
            modality = TurnModality.VOICE,
            isFinal = false
        )

        assertEquals(false, repository.turns.value.last().isFinal)
        assertEquals("I am explai", repository.turns.value.last().text)

        repository.updateLatestTurn("I am explaining grammar now.", isFinal = true)

        val updated = repository.turns.value.last()
        assertEquals("I am explaining grammar now.", updated.text)
        assertEquals(true, updated.isFinal)
    }

    @Test
    fun getRecentTurns_respectsLimit() {
        for (i in 1..15) {
            repository.addTurn(
                sender = if (i % 2 == 1) TurnSender.USER else TurnSender.BUDDY,
                text = "Turn number $i",
                modality = TurnModality.VOICE,
                isFinal = true
            )
        }

        val recent5 = repository.getRecentTurns(limit = 5)
        assertEquals(5, recent5.size)
        assertEquals("Turn number 11", recent5.first().text)
        assertEquals("Turn number 15", recent5.last().text)
    }

    @Test
    fun clearTurns_resetsHistory() {
        repository.addTurn(
            sender = TurnSender.USER,
            text = "Sample",
            modality = TurnModality.TEXT,
            isFinal = true
        )
        assertEquals(1, repository.turns.value.size)

        repository.clearTurns()
        assertTrue(repository.turns.value.isEmpty())
    }

    @Test
    fun attachFeedback_associatesFeedbackWithTurn() {
        val turn = repository.addTurn(
            sender = TurnSender.USER,
            text = "I has a question",
            modality = TurnModality.VOICE,
            isFinal = true
        )

        val feedback = com.aibuddy.data.tutor.TutorFeedback(
            turnId = turn.id,
            originalText = "I has a question",
            correctedText = "I have a question.",
            explanation = "Gunakan 'have' untuk subjek 'I'.",
            category = com.aibuddy.data.tutor.FeedbackCategory.SUBJECT_VERB_AGREEMENT
        )

        repository.attachFeedback(turn.id, feedback)

        val retrieved = repository.getFeedbackForTurn(turn.id)
        org.junit.Assert.assertNotNull(retrieved)
        assertEquals("I have a question.", retrieved?.correctedText)
        assertEquals(com.aibuddy.data.tutor.FeedbackCategory.SUBJECT_VERB_AGREEMENT, retrieved?.category)

        val turnInList = repository.turns.value.first()
        assertEquals("I have a question.", turnInList.feedback?.correctedText)
    }

    @Test
    fun setLearningMode_updatesActiveAndPreviousMode() {
        repository.resetToFreeConversation()
        assertEquals(com.aibuddy.data.mode.LearningMode.FREE_CONVERSATION, repository.sessionModeState.value.activeMode)

        repository.setLearningMode(com.aibuddy.data.mode.LearningMode.GRAMMAR)
        assertEquals(com.aibuddy.data.mode.LearningMode.GRAMMAR, repository.sessionModeState.value.activeMode)
        assertEquals(com.aibuddy.data.mode.LearningMode.FREE_CONVERSATION, repository.sessionModeState.value.previousMode)
    }

    @Test
    fun startExercise_updatesActiveExerciseAndMode() {
        val exercise = com.aibuddy.data.mode.ExerciseProgress(
            mode = com.aibuddy.data.mode.LearningMode.VOCABULARY,
            topicOrTitle = "10 Kosakata Bisnis",
            totalQuestions = 10
        )
        repository.startExercise(exercise)

        val state = repository.sessionModeState.value
        assertEquals(com.aibuddy.data.mode.LearningMode.VOCABULARY, state.activeMode)
        assertEquals("10 Kosakata Bisnis", state.activeExercise?.topicOrTitle)
        assertEquals(10, state.activeExercise?.totalQuestions)
    }

    @Test
    fun pauseAndResumeExercise_preservesState() {
        val exercise = com.aibuddy.data.mode.ExerciseProgress(
            mode = com.aibuddy.data.mode.LearningMode.VOCABULARY,
            topicOrTitle = "Kosakata",
            currentQuestionIndex = 3,
            totalQuestions = 5
        )
        repository.startExercise(exercise)
        repository.pauseCurrentExercise()

        assertTrue(repository.sessionModeState.value.activeExercise?.isPaused == true)

        repository.setLearningMode(com.aibuddy.data.mode.LearningMode.FREE_CONVERSATION)
        assertEquals(com.aibuddy.data.mode.LearningMode.FREE_CONVERSATION, repository.sessionModeState.value.activeMode)
        org.junit.Assert.assertNull(repository.sessionModeState.value.activeExercise)
        org.junit.Assert.assertNotNull(repository.sessionModeState.value.previousExercise)

        val resumed = repository.resumePreviousExercise()
        org.junit.Assert.assertNotNull(resumed)
        assertEquals(com.aibuddy.data.mode.LearningMode.VOCABULARY, repository.sessionModeState.value.activeMode)
        assertEquals(3, resumed?.currentQuestionIndex)
        assertEquals(false, resumed?.isPaused)
    }

    @Test
    fun setCorrectionPolicy_independentOfMode() {
        val exercise = com.aibuddy.data.mode.ExerciseProgress(
            mode = com.aibuddy.data.mode.LearningMode.VOCABULARY,
            topicOrTitle = "Kosakata"
        )
        repository.startExercise(exercise)

        repository.setCorrectionPolicy(com.aibuddy.data.mode.CorrectionPolicy.OFF)

        val state = repository.sessionModeState.value
        assertEquals(com.aibuddy.data.mode.CorrectionPolicy.OFF, state.correctionPolicy)
        assertEquals(com.aibuddy.data.mode.LearningMode.VOCABULARY, state.activeMode)
        org.junit.Assert.assertNotNull(state.activeExercise)
    }
}

