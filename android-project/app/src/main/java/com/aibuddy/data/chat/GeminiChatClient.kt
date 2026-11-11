package com.aibuddy.data.chat

import com.aibuddy.BuildConfig
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

class GeminiChatClient(
    private val apiKey: String = BuildConfig.GEMINI_API_KEY,
    private val primaryModel: String = "gemini-3.5-flash",
    private val fallbackModels: List<String> = listOf("gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-2.5-flash"),
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
) {
    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        isLenient = true
    }

    private val mediaType = "application/json; charset=utf-8".toMediaType()

    private val systemInstructionText = """
        You are Buddy, a friendly, encouraging, and intelligent personal bilingual English tutor and speaking companion for Indonesian learners.
        Your single identity is Buddy, an empathetic, supportive, and knowledgeable mentor. Do not roleplay as a cat, do not use animal or cat sounds like "meow", and do not refer to yourself as a cat.
        
        Your mission:
        1. Help the user master English naturally through conversation, grammar explanations, vocabulary enrichment, and practical examples.
        2. Bilingual approach:
           - If the user asks in Indonesian about English (grammar, tenses, translation, word nuances), explain clearly and concisely in Indonesian with English examples.
           - If the user chats in English, respond in natural English. If the user makes a grammatical mistake or awkward phrasing, add a friendly "💡 Quick Tip" at the end of your response showing the correct/natural phrasing.
           - If the user asks for corrections, analyze their sentence, explain why, and offer natural alternatives.
        3. Personality & Tone:
           - Warm, curious, friendly, and encouraging.
           - Keep explanations concise, practical, and formatted cleanly with Markdown (bold terms with **word**, bullet points with * item, or numbered steps with 1. step). Avoid overwhelming walls of text.
    """.trimIndent()

    suspend fun sendMessage(
        history: List<ChatMessage>,
        userMessage: String,
        sessionModeState: com.aibuddy.data.mode.SessionModeState = com.aibuddy.data.mode.SessionModeState()
    ): Result<String> = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext Result.failure(
                IllegalStateException("GEMINI_API_KEY is not configured in local.properties")
            )
        }

        try {
            // Build conversation contents
            val contents = mutableListOf<GeminiContent>()

            // Add previous history (skip empty/error messages)
            for (msg in history) {
                if (msg.text.isNotBlank()) {
                    contents.add(
                        GeminiContent(
                            role = if (msg.isUser) "user" else "model",
                            parts = listOf(GeminiPart(text = msg.text))
                        )
                    )
                }
            }

            // Append current user message
            contents.add(
                GeminiContent(
                    role = "user",
                    parts = listOf(GeminiPart(text = userMessage))
                )
            )

            val promptText = com.aibuddy.data.prompt.BuddyPrompts.buildChatSystemPrompt(sessionModeState)
            val requestBodyObj = GeminiRequest(
                system_instruction = GeminiSystemInstruction(
                    parts = listOf(GeminiPart(text = promptText))
                ),
                contents = contents
            )

            val requestJson = json.encodeToString(requestBodyObj)
            val candidateModels = listOf(primaryModel) + fallbackModels
            var lastError: Exception? = null

            for (currentModel in candidateModels) {
                try {
                    val url = "https://generativelanguage.googleapis.com/v1beta/models/$currentModel:generateContent?key=$apiKey"
                    val httpRequest = Request.Builder()
                        .url(url)
                        .post(requestJson.toRequestBody(mediaType))
                        .build()

                    val (success, resultOrError) = client.newCall(httpRequest).execute().use { response ->
                        val bodyString = response.body?.string() ?: ""

                        if (!response.isSuccessful) {
                            val errorMsg = try {
                                val parsed = json.decodeFromString<GeminiResponse>(bodyString)
                                parsed.error?.message ?: "HTTP ${response.code}: $bodyString"
                            } catch (e: Exception) {
                                "HTTP ${response.code}: $bodyString"
                            }

                            // If rate-limited (429), not found (404), or temporarily overloaded (503), record and attempt next model
                            if (response.code == 429 || response.code == 404 || response.code == 503) {
                                lastError = IOException("Model $currentModel: $errorMsg")
                                return@use Pair(false, errorMsg)
                            } else {
                                return@withContext Result.failure(IOException(errorMsg))
                            }
                        }

                        val geminiResponse = json.decodeFromString<GeminiResponse>(bodyString)
                        val replyText = geminiResponse.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text

                        if (!replyText.isNullOrBlank()) {
                            return@withContext Result.success(replyText.trim())
                        } else {
                            Pair(false, "Empty response from $currentModel")
                        }
                    }

                    if (success) {
                        return@withContext Result.success(resultOrError)
                    }
                } catch (e: Exception) {
                    lastError = e
                }
            }

            Result.failure(lastError ?: IOException("Semua model Gemini sedang sibuk atau kehabisan kuota."))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
