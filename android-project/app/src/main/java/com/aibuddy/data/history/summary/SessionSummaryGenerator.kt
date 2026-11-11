package com.aibuddy.data.history.summary

import com.aibuddy.data.history.model.ConversationMessageEntity
import com.aibuddy.data.history.model.ConversationSessionEntity
import com.aibuddy.data.history.model.SessionSummaryEntity
import com.aibuddy.data.history.model.StructuredCorrectionEntity
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Generator ringkasan pembelajaran deterministik untuk sesi percakapan Fluelo.
 * 100% berbasis data riil sesi, beroperasi offline, dan nol panggilan API eksternal.
 */
object SessionSummaryGenerator {

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    fun generateSummary(
        session: ConversationSessionEntity,
        messages: List<ConversationMessageEntity>,
        corrections: List<StructuredCorrectionEntity>
    ): SessionSummaryEntity {
        val userMessages = messages.filter { it.sender == "USER" }

        // 1. Topics discussed berdasarkan mode & konten sesi
        val topics = mutableListOf<String>()
        when (session.primaryMode) {
            "FREE_CONVERSATION" -> topics.add("Percakapan Sehari-hari (Free Talk)")
            "VOCABULARY" -> topics.add("Latihan Kosakata (Vocabulary Drill)")
            "GRAMMAR" -> topics.add("Tata Bahasa & Struktur Kalimat (Grammar)")
            "ROLEPLAY" -> topics.add("Simulasi Peran Kontekstual (Roleplay)")
            else -> topics.add(session.title)
        }

        // 2. Grammar highlights dari koreksi M3 yang tersimpan
        val highlights = corrections.map { correction ->
            "${correction.category}: \"${correction.correctedExpression}\" (daripada \"${correction.originalUtterance}\")"
        }

        // 3. Vocabulary encountered/practiced
        val vocabularyPracticed = extractVocabularyPracticed(userMessages)

        // 4. Rekomendasi fokus berikutnya (rule-based dari kategori kesalahan terbanyak)
        val suggestedFocus = if (corrections.isNotEmpty()) {
            val mostFrequentCategory = corrections
                .groupBy { it.category }
                .maxByOrNull { it.value.size }
                ?.key ?: "GRAMMAR"

            when (mostFrequentCategory) {
                "TENSE" -> "Fokus latihan bentuk waktu (Past/Present/Future) dan kata kerja bentuk kedua/ketiga."
                "PREPOSITION" -> "Perhatikan penggunaan preposisi penunjuk tempat dan waktu (in, on, at, to, for)."
                "SUBJECT_VERB_AGREEMENT" -> "Perhatikan keselarasan subjek tunggal/jamak dengan kata kerja bantu (is/are, has/have, do/does)."
                "VOCABULARY", "NATURAL_PHRASING" -> "Eksplorasi pilihan kata yang lebih idiomatis dan perluas variasi sinonim."
                else -> "Pertahankan kelancaran berbicara dan perhatikan struktur dasar subjek + predikat."
            }
        } else if (userMessages.size >= 3) {
            "Kelancaran berbahasa Inggris sangat baik tanpa kesalahan tata bahasa yang signifikan. Terus tingkatkan variasi kosakata!"
        } else {
            "Sesi latihan singkat. Terus berlatih secara rutin untuk meningkatkan rasa percaya diri berbicara."
        }

        return SessionSummaryEntity(
            sessionId = session.sessionId,
            topicsDiscussedJson = json.encodeToString(topics),
            grammarHighlightsJson = json.encodeToString(highlights),
            vocabularyPracticedJson = json.encodeToString(vocabularyPracticed),
            suggestedFocusArea = suggestedFocus,
            generatedAtEpochMs = System.currentTimeMillis(),
            isAiGenerated = false
        )
    }

    private fun extractVocabularyPracticed(userMessages: List<ConversationMessageEntity>): List<String> {
        val wordRegex = Regex("[a-zA-Z]{4,}")
        return userMessages
            .flatMap { msg -> wordRegex.findAll(msg.content.lowercase()).map { it.value } }
            .filterNot { it in STOP_WORDS }
            .distinct()
            .take(10)
    }

    private val STOP_WORDS = setOf(
        "this", "that", "with", "have", "from", "they", "will", "would", "there",
        "their", "what", "about", "which", "when", "make", "like", "time", "just",
        "know", "take", "people", "into", "year", "your", "good", "some", "could",
        "them", "then", "now", "look", "only", "come", "over", "think", "also",
        "back", "after", "want", "because", "these", "give", "saya", "kamu", "aku",
        "bisa", "dengan", "untuk", "dari", "yang", "dan", "atau", "halo", "buddy"
    )
}

