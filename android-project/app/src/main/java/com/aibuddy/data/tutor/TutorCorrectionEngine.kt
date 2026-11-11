package com.aibuddy.data.tutor

import android.util.Log
import com.aibuddy.BuildConfig
import com.aibuddy.data.chat.GeminiCandidate
import com.aibuddy.data.chat.GeminiContent
import com.aibuddy.data.chat.GeminiGenerationConfig
import com.aibuddy.data.chat.GeminiPart
import com.aibuddy.data.chat.GeminiRequest
import com.aibuddy.data.chat.GeminiResponse
import com.aibuddy.data.chat.GeminiSystemInstruction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

class TutorCorrectionEngine(
    private val apiKey: String = BuildConfig.GEMINI_API_KEY,
    private val model: String = "gemini-3.5-flash",
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()
) {
    companion object {
        private const val TAG = "TutorCorrectionEngine"
    }

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        isLenient = true
    }

    private val mediaType = "application/json; charset=utf-8".toMediaType()

    private val systemPrompt = """
        You are an expert, encouraging English tutor and linguistic analyzer for Indonesian learners.
        Your task is to analyze a single user turn from an English speaking or text practice session.
        
        Guidelines:
        1. If the user utterance is:
           - Entirely in Indonesian (e.g. "Halo Buddy", "Apa kabar", "Beda in dan on apa ya?")
           - An intentional code-switch where the English part is natural (e.g. "Aku tadi lunch sama teman")
           - A direct grammar question or vocabulary lookup
           - Already grammatically correct and natural English (e.g. "I love learning English", "How are you doing today?")
           - Too short to evaluate (< 3 words) or an acknowledgement ("yes", "okay", "thank you")
           Then respond with:
           {
             "needsCorrection": false
           }
           
        2. If the user makes a clear English grammar mistake, tense slip, preposition error, subject-verb agreement issue, or awkward unidiomatic phrasing:
           Then respond with:
           {
             "needsCorrection": true,
             "originalText": "<exact phrase or sentence that had the error>",
             "correctedText": "<natural, correct English sentence>",
             "explanation": "<friendly, clear bilingual explanation in Indonesian explaining why, with the relevant rule>",
             "category": "<GRAMMAR | TENSE | PREPOSITION | SUBJECT_VERB_AGREEMENT | VOCABULARY | NATURAL_PHRASING>",
             "severity": "<MINOR | MODERATE | MAJOR>",
             "spokenNote": "<very short, encouraging spoken tip in Indonesian or English, e.g. 'Gunakan went untuk masa lampau ya'>"
           }
           
        3. Rules:
           - Do not invent mistakes if the sentence is natural.
           - Be warm, encouraging, and constructive.
           - Do not use em dash characters (—) in any explanation or text; use commas, colons, or parentheses instead.
           - Respond strictly in JSON format matching the schema.
    """.trimIndent()

    suspend fun analyzeUtterance(
        turnId: String,
        utterance: String
    ): Result<TutorFeedback?> = withContext(Dispatchers.IO) {
        val trimmed = utterance.trim()
        if (trimmed.length < 3 || apiKey.isBlank()) {
            return@withContext Result.success(null)
        }

        try {
            val requestBodyObj = GeminiRequest(
                system_instruction = GeminiSystemInstruction(
                    parts = listOf(GeminiPart(text = systemPrompt))
                ),
                contents = listOf(
                    GeminiContent(
                        role = "user",
                        parts = listOf(GeminiPart(text = trimmed))
                    )
                ),
                generationConfig = GeminiGenerationConfig(
                    response_mime_type = "application/json",
                    temperature = 0.2f
                )
            )

            val requestJson = json.encodeToString(requestBodyObj)
            val url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"

            val httpRequest = Request.Builder()
                .url(url)
                .post(requestJson.toRequestBody(mediaType))
                .build()

            client.newCall(httpRequest).execute().use { response ->
                val bodyString = response.body?.string() ?: ""

                if (!response.isSuccessful) {
                    val errorMsg = "HTTP ${response.code}: $bodyString"
                    Log.w(TAG, "Tutor correction API error: $errorMsg")
                    return@withContext Result.failure(IOException(errorMsg))
                }

                val geminiResponse = json.decodeFromString<GeminiResponse>(bodyString)
                val replyJsonText = geminiResponse.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text

                if (replyJsonText.isNullOrBlank()) {
                    return@withContext Result.success(null)
                }

                parseAnalysisResponse(turnId, trimmed, replyJsonText)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Exception during utterance analysis: ${e.message}", e)
            Result.failure(e)
        }
    }

    private fun safeLogWarning(msg: String, t: Throwable? = null) {
        try {
            Log.w(TAG, msg, t)
        } catch (_: Throwable) {
            // Ignored in headless JVM unit tests
        }
    }

    internal fun parseAnalysisResponse(
        turnId: String,
        originalUtterance: String,
        jsonText: String
    ): Result<TutorFeedback?> {
        return try {
            val analysis = json.decodeFromString<TutorAnalysisResponse>(jsonText)
            val corrected = analysis.correctedText
            if (!analysis.needsCorrection || corrected.isNullOrBlank()) {
                Result.success(null)
            } else {
                val feedback = TutorFeedback(
                    turnId = turnId,
                    originalText = analysis.originalText?.ifBlank { originalUtterance } ?: originalUtterance,
                    correctedText = corrected.trim(),
                    explanation = analysis.explanation?.trim() ?: "Perhatikan penggunaan kalimat ini agar lebih natural.",
                    category = FeedbackCategory.fromString(analysis.category),
                    severity = FeedbackSeverity.fromString(analysis.severity),
                    spokenNote = analysis.spokenNote?.trim()
                )
                Result.success(feedback)
            }
        } catch (e: Exception) {
            safeLogWarning("Failed to parse analysis JSON: $jsonText", e)
            Result.success(null)
        }
    }
}
