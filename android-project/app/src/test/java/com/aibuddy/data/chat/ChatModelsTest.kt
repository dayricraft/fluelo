package com.aibuddy.data.chat

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Test

class ChatModelsTest {

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    @Test
    fun testGeminiRequestSerialization() {
        val request = GeminiRequest(
            system_instruction = GeminiSystemInstruction(
                parts = listOf(GeminiPart("You are Buddy."))
            ),
            contents = listOf(
                GeminiContent(
                    role = "user",
                    parts = listOf(GeminiPart("Explain present tense"))
                )
            )
        )

        val serialized = json.encodeToString(request)
        assertTrue(serialized.contains("\"role\":\"user\""))
        assertTrue(serialized.contains("\"text\":\"Explain present tense\""))
        assertTrue(serialized.contains("\"system_instruction\""))
        assertTrue(serialized.contains("\"text\":\"You are Buddy.\""))
    }

    @Test
    fun testGeminiResponseDeserialization() {
        val responseJson = """
            {
              "candidates": [
                {
                  "content": {
                    "role": "model",
                    "parts": [
                      {
                        "text": "Present tense is used for habitual actions."
                      }
                    ]
                  }
                }
              ]
            }
        """.trimIndent()

        val parsed = json.decodeFromString<GeminiResponse>(responseJson)
        assertNotNull(parsed.candidates)
        assertEquals(1, parsed.candidates?.size)
        val reply = parsed.candidates?.first()?.content?.parts?.first()?.text
        assertEquals("Present tense is used for habitual actions.", reply)
    }

    @Test
    fun testChatMessageCreation() {
        val msg = ChatMessage(text = "Hello Buddy", isUser = true)
        assertEquals("Hello Buddy", msg.text)
        assertTrue(msg.isUser)
        assertNotNull(msg.id)
        assertTrue(msg.timestamp > 0)
    }
}
