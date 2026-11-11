package com.aibuddy.domain.router

import com.aibuddy.data.mode.CorrectionPolicy
import com.aibuddy.data.mode.ExerciseDirection
import com.aibuddy.data.mode.ExerciseProgress
import com.aibuddy.data.mode.LearningMode
import com.aibuddy.data.mode.SessionModeState
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class ModeRouterTest {

    private lateinit var router: ModeRouter
    private val defaultState = SessionModeState(activeMode = LearningMode.FREE_CONVERSATION)

    @BeforeTest
    fun setUp() {
        router = ModeRouter()
    }

    @Test
    fun testIndonesianExplicitVocabSwitch() {
        val result = router.route("Sekarang kita latihan vocab", defaultState)
        assertTrue(result is ModeRoutingResult.ModeSwitch)
        val switch = result as ModeRoutingResult.ModeSwitch
        assertEquals(LearningMode.VOCABULARY, switch.targetMode)
        assertNotNull(switch.targetExercise)
    }

    @Test
    fun testEnglishExplicitGrammarSwitch() {
        val result = router.route("Let's practice grammar", defaultState)
        assertTrue(result is ModeRoutingResult.ModeSwitch)
        val switch = result as ModeRoutingResult.ModeSwitch
        assertEquals(LearningMode.GRAMMAR, switch.targetMode)
    }

    @Test
    fun testMixedRoleplayJobInterviewSwitch() {
        val result = router.route("Buddy, ayo roleplay job interview. You be the interviewer.", defaultState)
        assertTrue(result is ModeRoutingResult.ModeSwitch)
        val switch = result as ModeRoutingResult.ModeSwitch
        assertEquals(LearningMode.ROLEPLAY, switch.targetMode)
        assertEquals("Job Interview", switch.targetExercise?.roleplayScenario?.title)
        assertEquals("Hiring Manager / Interviewer", switch.targetExercise?.roleplayScenario?.buddyRole)
    }

    @Test
    fun testVocabWithCustomCountAndDirection() {
        val input = "Buddy, sebutin sepuluh kata bahasa Indonesia nanti aku jawab bahasa Inggrisnya"
        val result = router.route(input, defaultState)
        assertTrue(result is ModeRoutingResult.ModeSwitch)
        val switch = result as ModeRoutingResult.ModeSwitch
        assertEquals(LearningMode.VOCABULARY, switch.targetMode)
        assertEquals(10, switch.targetExercise?.totalQuestions)
        assertEquals(ExerciseDirection.ID_TO_EN, switch.targetExercise?.direction)
    }

    @Test
    fun testGrammarWithSpecificTopic() {
        val input = "Buddy, ajarin aku present perfect tense dari awal"
        val result = router.route(input, defaultState)
        assertTrue(result is ModeRoutingResult.ModeSwitch)
        val switch = result as ModeRoutingResult.ModeSwitch
        assertEquals(LearningMode.GRAMMAR, switch.targetMode)
        assertEquals("Present Perfect Tense", switch.targetExercise?.topicOrTitle)
    }

    @Test
    fun testTemporaryQuestionDoesNotChangeMode() {
        val vocabState = SessionModeState(
            activeMode = LearningMode.VOCABULARY,
            activeExercise = ExerciseProgress(
                mode = LearningMode.VOCABULARY,
                topicOrTitle = "Kosakata Umum",
                currentQuestionIndex = 3,
                totalQuestions = 10
            )
        )

        val result = router.route("Apa bedanya improve sama increase?", vocabState)
        assertTrue(result is ModeRoutingResult.TemporaryQuestion)
        val temp = result as ModeRoutingResult.TemporaryQuestion
        assertTrue(temp.question.contains("improve"))
    }

    @Test
    fun testTemporaryQuestionInEnglishDoesNotChangeMode() {
        val grammarState = SessionModeState(activeMode = LearningMode.GRAMMAR)
        val result = router.route("What is the difference between make and do?", grammarState)
        assertTrue(result is ModeRoutingResult.TemporaryQuestion)
    }

    @Test
    fun testResumePreviousExercise() {
        val previousVocab = ExerciseProgress(
            mode = LearningMode.VOCABULARY,
            topicOrTitle = "Kosakata Bisnis",
            currentQuestionIndex = 4,
            totalQuestions = 10
        )
        val state = SessionModeState(
            activeMode = LearningMode.FREE_CONVERSATION,
            previousExercise = previousVocab
        )

        val result = router.route("Oke, balik ke soal vocab tadi", state)
        assertTrue(result is ModeRoutingResult.ResumePrevious)
        val resume = result as ModeRoutingResult.ResumePrevious
        assertEquals("Kosakata Bisnis", resume.exercise.topicOrTitle)
        assertEquals(4, resume.exercise.currentQuestionIndex)
    }

    @Test
    fun testCorrectionPolicyOffIndependentOfMode() {
        val vocabState = SessionModeState(
            activeMode = LearningMode.VOCABULARY,
            activeExercise = ExerciseProgress(
                mode = LearningMode.VOCABULARY,
                topicOrTitle = "Kosakata",
                currentQuestionIndex = 2,
                totalQuestions = 10
            )
        )

        val result = router.route("Jangan koreksi grammar dulu, aku mau fokus jawab vocab", vocabState)
        assertTrue(result is ModeRoutingResult.CorrectionPolicyUpdate)
        val update = result as ModeRoutingResult.CorrectionPolicyUpdate
        assertEquals(CorrectionPolicy.OFF, update.policy)
    }

    @Test
    fun testCorrectionPolicyIntensive() {
        val result = router.route("Tolong koreksi lebih ketat ya", defaultState)
        assertTrue(result is ModeRoutingResult.CorrectionPolicyUpdate)
        val update = result as ModeRoutingResult.CorrectionPolicyUpdate
        assertEquals(CorrectionPolicy.INTENSIVE, update.policy)
    }

    @Test
    fun testExerciseSkipAction() {
        val activeVocab = SessionModeState(
            activeMode = LearningMode.VOCABULARY,
            activeExercise = ExerciseProgress(
                mode = LearningMode.VOCABULARY,
                topicOrTitle = "Kosakata",
                currentQuestionIndex = 2,
                totalQuestions = 10
            )
        )
        val result = router.route("Lewati", activeVocab)
        assertTrue(result is ModeRoutingResult.ExerciseAction)
        assertEquals(ExerciseControlAction.SKIP, (result as ModeRoutingResult.ExerciseAction).action)
    }

    @Test
    fun testExerciseRepeatAction() {
        val activeVocab = SessionModeState(
            activeMode = LearningMode.VOCABULARY,
            activeExercise = ExerciseProgress(
                mode = LearningMode.VOCABULARY,
                topicOrTitle = "Kosakata",
                currentQuestionIndex = 2,
                totalQuestions = 10
            )
        )
        val result = router.route("Ulangi soalnya", activeVocab)
        assertTrue(result is ModeRoutingResult.ExerciseAction)
        assertEquals(ExerciseControlAction.REPEAT, (result as ModeRoutingResult.ExerciseAction).action)
    }

    @Test
    fun testAmbiguousModeChangeRequiresClarification() {
        val result = router.route("Coba yang lain", defaultState)
        assertTrue(result is ModeRoutingResult.ClarificationNeeded)
    }

    @Test
    fun testFreeConversationSwitch() {
        val result = router.route("Kita ngobrol bebas aja", SessionModeState(activeMode = LearningMode.VOCABULARY))
        assertTrue(result is ModeRoutingResult.ModeSwitch)
        assertEquals(LearningMode.FREE_CONVERSATION, (result as ModeRoutingResult.ModeSwitch).targetMode)
    }

    @Test
    fun testNormalInModeAnswer() {
        val activeVocab = SessionModeState(
            activeMode = LearningMode.VOCABULARY,
            activeExercise = ExerciseProgress(
                mode = LearningMode.VOCABULARY,
                topicOrTitle = "Kosakata",
                currentQuestionIndex = 2,
                totalQuestions = 10
            )
        )
        val result = router.route("Artinya adalah meningkatkan atau improve", activeVocab)
        assertTrue(result is ModeRoutingResult.InModeUtterance)
    }

    @Test
    fun testNarrationSentenceBySentenceSwitch() {
        val input = "hari ini kita akan belajar narasi yaitu mengartikan kalimat per kalimat pendek"
        val result = router.route(input, defaultState)
        assertTrue(result is ModeRoutingResult.ModeSwitch)
        val switch = result as ModeRoutingResult.ModeSwitch
        assertEquals(LearningMode.VOCABULARY, switch.targetMode)
        assertEquals(ExerciseDirection.NARRATION_DICTATION, switch.targetExercise?.direction)
        assertEquals("Dikte & Narasi Kalimat", switch.targetExercise?.topicOrTitle)
    }
}
