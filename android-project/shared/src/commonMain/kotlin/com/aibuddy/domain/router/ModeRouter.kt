package com.aibuddy.domain.router

import com.aibuddy.data.mode.CorrectionPolicy
import com.aibuddy.data.mode.ExerciseDirection
import com.aibuddy.data.mode.ExerciseProgress
import com.aibuddy.data.mode.LearningMode
import com.aibuddy.data.mode.RoleplayScenario
import com.aibuddy.data.mode.SessionModeState

sealed class ModeRoutingResult {
    data class ModeSwitch(
        val targetMode: LearningMode,
        val targetExercise: ExerciseProgress? = null,
        val announcementPrompt: String
    ) : ModeRoutingResult()

    data class ResumePrevious(
        val exercise: ExerciseProgress,
        val announcementPrompt: String
    ) : ModeRoutingResult()

    data class ExerciseAction(
        val action: ExerciseControlAction
    ) : ModeRoutingResult()

    data class CorrectionPolicyUpdate(
        val policy: CorrectionPolicy,
        val feedbackMessage: String
    ) : ModeRoutingResult()

    data class TemporaryQuestion(
        val question: String
    ) : ModeRoutingResult()

    data class ClarificationNeeded(
        val clarificationPrompt: String
    ) : ModeRoutingResult()

    data object InModeUtterance : ModeRoutingResult()
}

enum class ExerciseControlAction {
    SKIP,
    REPEAT,
    STOP
}

class ModeRouter {

    companion object {
        // Mode Switch Regex Patterns: allow natural intervening pronouns/counts
        private val NARRATION_SWITCH_REGEX = Regex(
            """(?i).*\b(narasi|dikte|cerita|kisah|kalimat\s+per\s+kalimat|kalimat\s+demi\s+kalimat|dikte\s+kalimat|story\s+telling|consecutive\s+translation)\b.*"""
        )

        private val VOCAB_SWITCH_REGEX = Regex(
            """(?i).*\b(latihan|belajar|tes|kuis|drill|practice|sebutin|sebutkan|kasih|tanya)\b.*?\b(vocab|kosakata|vocabulary|kata-kata|kata\s+baru|\d+\s+kata|sepuluh\s+kata|lima\s+kata|words?)\b.*"""
        )

        private val GRAMMAR_SWITCH_REGEX = Regex(
            """(?i).*\b(latihan|belajar|ajarin|bahas|jelasin|practice|teach|learn|explain)\b.*?\b(grammar|tense(s)?|tata\s+bahasa|rumus|present\s+perfect|past\s+tense|future\s+tense|passive\s+voice)\b.*"""
        )

        private val ROLEPLAY_SWITCH_REGEX = Regex(
            """(?i).*\b(roleplay|simulasi|pura-pura|skenario|scenario|pretend\s+you'?re|act\s+as|kamu\s+jadi)\b.*"""
        )

        private val FREE_CONVERSATION_SWITCH_REGEX = Regex(
            """(?i).*\b(ngobrol\s+bebas|bicara\s+santai|obrolan\s+biasa|free\s+(talk|conversation)|casual\s+chat|just\s+chat|stop\s+latihan|keluar\s+dari\s+latihan)\b.*"""
        )

        // Temporary Questions: should answer without leaving active mode
        private val TEMPORARY_QUESTION_REGEX = Regex(
            """(?i)^\s*(apa\s+(arti|artinya|maksud|beda|bedanya|perbedaan)|kenapa\s+harus|bagaimana\s+cara\s+bilang|contoh\s+kalimat|what('s| is) the difference|what does .* mean|why do we use|how do I say)\b.*"""
        )

        // Resume Previous Exercise
        private val RESUME_EXERCISE_REGEX = Regex(
            """(?i).*\b(balik\s+ke|kembali\s+ke|lanjut(kan)?)\s+(soal|latihan|quiz|drill|tadi|sebelumnya)\b.*"""
        )

        // Exercise Controls
        private val SKIP_REGEX = Regex(
            """(?i)^\s*(lewati|skip|lewat|next|soal\s+berikutnya|pertanyaan\s+selanjutnya)\s*${'$'}"""
        )

        private val REPEAT_REGEX = Regex(
            """(?i)^\s*(ulangi|repeat|ulang|sekali\s+lagi|coba\s+ulang)\s*(soalnya|pertanyaannya)?\s*${'$'}"""
        )

        // Correction Policy commands
        private val CORRECTION_OFF_REGEX = Regex(
            """(?i).*\b(jangan|stop|matiin|tidak\s+usah)\s+(koreksi|benerin|membetulkan)\b.*"""
        )

        private val CORRECTION_INTENSIVE_REGEX = Regex(
            """(?i).*\b(koreksi\s+(lebih\s+ketat|semua|ketat)|koreksi\s+setiap\s+kalimat|intensif)\b.*"""
        )

        // Ambiguous command patterns
        private val AMBIGUOUS_SWITCH_REGEX = Regex(
            """(?i)^\s*(ganti|ubah|coba\s+yang\s+lain|pindah\s+mode|ganti\s+aktivitas|switch\s+mode)\s*${'$'}"""
        )
    }

    fun route(
        utterance: String,
        currentState: SessionModeState
    ): ModeRoutingResult {
        val trimmed = utterance.trim()
        if (trimmed.isBlank()) {
            return ModeRoutingResult.InModeUtterance
        }

        // 1. Check for Correction Policy adjustments (Independent of active mode)
        if (CORRECTION_OFF_REGEX.matches(trimmed)) {
            return ModeRoutingResult.CorrectionPolicyUpdate(
                policy = CorrectionPolicy.OFF,
                feedbackMessage = "Oke, koreksi tutor dimatikan sementara. Silakan lanjut berbicara!"
            )
        }
        if (CORRECTION_INTENSIVE_REGEX.matches(trimmed)) {
            return ModeRoutingResult.CorrectionPolicyUpdate(
                policy = CorrectionPolicy.INTENSIVE,
                feedbackMessage = "Siap, aku akan berikan koreksi dan feedback lebih intensif."
            )
        }

        // 2. Check for Ambiguous Mode Changes
        if (AMBIGUOUS_SWITCH_REGEX.matches(trimmed)) {
            return ModeRoutingResult.ClarificationNeeded(
                clarificationPrompt = "Kamu ingin beralih ke latihan apa? Kita bisa latihan kosakata (vocab), tata bahasa (grammar), simulasi roleplay, atau percakapan bebas."
            )
        }

        // 3. Check for Exercise Controls (Skip, Repeat) when in an active exercise
        if (currentState.activeExercise != null && !currentState.activeExercise.isCompleted) {
            if (SKIP_REGEX.matches(trimmed)) {
                return ModeRoutingResult.ExerciseAction(ExerciseControlAction.SKIP)
            }
            if (REPEAT_REGEX.matches(trimmed)) {
                return ModeRoutingResult.ExerciseAction(ExerciseControlAction.REPEAT)
            }
        }

        // 4. Check for Resume Previous Exercise request
        if (RESUME_EXERCISE_REGEX.matches(trimmed)) {
            val resumable = currentState.previousExercise ?: currentState.activeExercise
            return if (resumable != null) {
                ModeRoutingResult.ResumePrevious(
                    exercise = resumable,
                    announcementPrompt = "Baik, ayo kita lanjutkan latihan ${resumable.topicOrTitle} tadi. Soal nomor ${resumable.currentQuestionIndex} dari ${resumable.totalQuestions}."
                )
            } else {
                ModeRoutingResult.InModeUtterance
            }
        }

        // 5. Check for Temporary Questions (DO NOT change mode)
        if (TEMPORARY_QUESTION_REGEX.matches(trimmed)) {
            return ModeRoutingResult.TemporaryQuestion(question = trimmed)
        }

        // 6. Check for Explicit Mode Switches

        // A. NARRATION Switch (Priority check before general vocab)
        if (NARRATION_SWITCH_REGEX.matches(trimmed)) {
            val totalSentences = extractQuestionCount(trimmed) ?: 6
            val exercise = ExerciseProgress(
                mode = LearningMode.VOCABULARY,
                topicOrTitle = "Dikte & Narasi Kalimat",
                direction = ExerciseDirection.NARRATION_DICTATION,
                totalQuestions = totalSentences
            )
            val prompt = "Siap! Kita mulai latihan dikte narasi kalimat per kalimat ($totalSentences bagian). Metodenya: sebutkan potongan kalimat pendek bahasa Indonesia, user akan mengartikan ke bahasa Inggris, lalu kamu langsung sambung ke potongan kalimat berikutnya sampai jadi satu narasi utuh. Tanpa kalimat pembuka bertele-tele atau nomor, langsung sebutkan potongan kalimat pertama dalam bahasa Indonesia:"
            return ModeRoutingResult.ModeSwitch(
                targetMode = LearningMode.VOCABULARY,
                targetExercise = exercise,
                announcementPrompt = prompt
            )
        }

        // B. VOCABULARY Switch (To-The-Point)
        if (VOCAB_SWITCH_REGEX.matches(trimmed)) {
            val totalQuestions = extractQuestionCount(trimmed) ?: 10
            val direction = extractExerciseDirection(trimmed)
            val exercise = ExerciseProgress(
                mode = LearningMode.VOCABULARY,
                topicOrTitle = "Kosakata Umum",
                direction = direction,
                totalQuestions = totalQuestions
            )
            val prompt = "Siap! Kita mulai drill kosakata to-the-point ($totalQuestions kata, ${direction.labelId}). Tanpa menyebut nomor atau kalimat pengantar, langsung sebutkan kata pertama saja dalam bahasa Indonesia:"
            return ModeRoutingResult.ModeSwitch(
                targetMode = LearningMode.VOCABULARY,
                targetExercise = exercise,
                announcementPrompt = prompt
            )
        }

        // B. GRAMMAR Switch
        if (GRAMMAR_SWITCH_REGEX.matches(trimmed)) {
            val topic = extractGrammarTopic(trimmed)
            val exercise = ExerciseProgress(
                mode = LearningMode.GRAMMAR,
                topicOrTitle = topic,
                totalQuestions = 5
            )
            val prompt = "Bagus! Mari kita pelajari topik grammar: $topic. Aku akan jelaskan konsep dasarnya dan kita coba latihan singkat setelahnya."
            return ModeRoutingResult.ModeSwitch(
                targetMode = LearningMode.GRAMMAR,
                targetExercise = exercise,
                announcementPrompt = prompt
            )
        }

        // C. ROLEPLAY Switch
        if (ROLEPLAY_SWITCH_REGEX.matches(trimmed)) {
            val scenario = extractRoleplayScenario(trimmed)
            val exercise = ExerciseProgress(
                mode = LearningMode.ROLEPLAY,
                topicOrTitle = scenario.title,
                roleplayScenario = scenario
            )
            val prompt = "Siap! Skenario kita: ${scenario.title}. Aku berperan sebagai ${scenario.buddyRole}, dan kamu sebagai ${scenario.userRole}. Mari kita mulai!"
            return ModeRoutingResult.ModeSwitch(
                targetMode = LearningMode.ROLEPLAY,
                targetExercise = exercise,
                announcementPrompt = prompt
            )
        }

        // D. FREE_CONVERSATION Switch
        if (FREE_CONVERSATION_SWITCH_REGEX.matches(trimmed)) {
            return ModeRoutingResult.ModeSwitch(
                targetMode = LearningMode.FREE_CONVERSATION,
                targetExercise = null,
                announcementPrompt = "Oke, kita kembali ke obrolan santai dan percakapan bebas. Apa yang ingin kamu bicarakan hari ini?"
            )
        }

        // 7. Default: In-mode utterance
        return ModeRoutingResult.InModeUtterance
    }

    private fun extractQuestionCount(text: String): Int? {
        val numberRegex = Regex("""(?i)\b(\d+)\s*(kata|soal|pertanyaan|words?|items?)\b""")
        numberRegex.find(text)?.let {
            return it.groupValues[1].toIntOrNull()
        }

        val wordNumbers = mapOf(
            "tiga" to 3, "three" to 3,
            "empat" to 4, "four" to 4,
            "lima" to 5, "five" to 5,
            "enam" to 6, "six" to 6,
            "tujuh" to 7, "seven" to 7,
            "delapan" to 8, "eight" to 8,
            "sembilan" to 9, "nine" to 9,
            "sepuluh" to 10, "ten" to 10,
            "lima belas" to 15, "fifteen" to 15,
            "dua puluh" to 20, "twenty" to 20
        )

        for ((word, count) in wordNumbers) {
            if (text.contains(word, ignoreCase = true)) {
                return count
            }
        }
        return null
    }

    private fun extractExerciseDirection(text: String): ExerciseDirection {
        val lower = text.lowercase()
        return when {
            lower.contains("narasi") || lower.contains("dikte") || lower.contains("kalimat per kalimat") -> ExerciseDirection.NARRATION_DICTATION
            lower.contains("indonesia nanti aku jawab inggris") ||
            lower.contains("indonesia ke inggris") ||
            lower.contains("id to en") -> ExerciseDirection.ID_TO_EN

            lower.contains("inggris ke indonesia") ||
            lower.contains("en to id") -> ExerciseDirection.EN_TO_ID

            lower.contains("sinonim") || lower.contains("synonym") -> ExerciseDirection.DEFINITION_TO_WORD
            lower.contains("buat kalimat") || lower.contains("sentence") -> ExerciseDirection.SENTENCE_BUILDING
            else -> ExerciseDirection.ID_TO_EN
        }
    }

    private fun extractGrammarTopic(text: String): String {
        val lower = text.lowercase()
        return when {
            lower.contains("present perfect") -> "Present Perfect Tense"
            lower.contains("past tense") || lower.contains("simple past") -> "Simple Past Tense"
            lower.contains("future") || lower.contains("will") -> "Future Tense"
            lower.contains("continuous") || lower.contains("ing") -> "Continuous Tense"
            lower.contains("passive") || lower.contains("pasif") -> "Passive Voice"
            lower.contains("conditional") || lower.contains("if clause") -> "Conditional Sentences"
            lower.contains("preposition") || lower.contains("in on at") -> "Prepositions (in, on, at)"
            lower.contains("modal") || lower.contains("can could should") -> "Modal Verbs"
            else -> "Tata Bahasa Umum"
        }
    }

    private fun extractRoleplayScenario(text: String): RoleplayScenario {
        val lower = text.lowercase()
        return when {
            lower.contains("interview") || lower.contains("wawancara") || lower.contains("pekerjaan") || lower.contains("job") -> {
                RoleplayScenario(
                    title = "Job Interview",
                    userRole = "Job Applicant",
                    buddyRole = "Hiring Manager / Interviewer",
                    contextDescription = "Formal job interview for a candidate position."
                )
            }
            lower.contains("kopi") || lower.contains("cafe") || lower.contains("coffee") || lower.contains("pesan makan") || lower.contains("restaurant") -> {
                RoleplayScenario(
                    title = "Ordering at a Cafe",
                    userRole = "Customer",
                    buddyRole = "Barista / Waiter",
                    contextDescription = "Casual conversation ordering coffee and food at a cafe."
                )
            }
            lower.contains("airport") || lower.contains("bandara") || lower.contains("imigrasi") || lower.contains("immigration") || lower.contains("flight") -> {
                RoleplayScenario(
                    title = "Airport & Immigration",
                    userRole = "International Traveler",
                    buddyRole = "Immigration Officer",
                    contextDescription = "Checking in, answering border control questions at the airport."
                )
            }
            lower.contains("hotel") || lower.contains("check in") -> {
                RoleplayScenario(
                    title = "Hotel Check-in",
                    userRole = "Hotel Guest",
                    buddyRole = "Front Desk Receptionist",
                    contextDescription = "Checking in and asking for amenities at a hotel."
                )
            }
            lower.contains("meeting") || lower.contains("rapat") || lower.contains("business") -> {
                RoleplayScenario(
                    title = "Business Meeting",
                    userRole = "Project Team Member",
                    buddyRole = "Project Lead",
                    contextDescription = "Discussing project progress and next steps in a team meeting."
                )
            }
            else -> {
                RoleplayScenario(
                    title = "Everyday Conversation",
                    userRole = "Friend",
                    buddyRole = "Friend",
                    contextDescription = "Catching up and talking about daily life."
                )
            }
        }
    }
}
