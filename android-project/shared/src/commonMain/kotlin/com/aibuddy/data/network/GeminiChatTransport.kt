package com.aibuddy.data.network

import com.aibuddy.data.chat.GeminiRequest

interface GeminiChatTransport {
    suspend fun generateContent(
        model: String,
        apiKey: String,
        request: GeminiRequest
    ): Result<String>
}

