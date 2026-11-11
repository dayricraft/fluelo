package com.aibuddy.data.chat

import kotlinx.serialization.Serializable
import java.util.UUID

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

@Serializable
data class GeminiRequest(
    val system_instruction: GeminiSystemInstruction? = null,
    val contents: List<GeminiContent>,
    val generationConfig: GeminiGenerationConfig? = null
)

@Serializable
data class GeminiGenerationConfig(
    val response_mime_type: String? = null,
    val temperature: Float? = null
)

@Serializable
data class GeminiSystemInstruction(
    val parts: List<GeminiPart>
)

@Serializable
data class GeminiContent(
    val role: String,
    val parts: List<GeminiPart>
)

@Serializable
data class GeminiPart(
    val text: String
)

@Serializable
data class GeminiResponse(
    val candidates: List<GeminiCandidate>? = null,
    val error: GeminiApiError? = null
)

@Serializable
data class GeminiCandidate(
    val content: GeminiContent? = null
)

@Serializable
data class GeminiApiError(
    val code: Int? = null,
    val message: String? = null
)
