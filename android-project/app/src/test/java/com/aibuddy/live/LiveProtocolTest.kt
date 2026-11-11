package com.aibuddy.live

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class LiveProtocolTest {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    @Test
    fun liveClientSetup_serializesCorrectly() {
        val setup = LiveClientSetup(
            setup = LiveSetupConfig(
                model = "models/gemini-3.8-live",
                generationConfig = LiveGenerationConfig(
                    responseModalities = listOf("AUDIO"),
                    speechConfig = LiveSpeechConfig(
                        voiceConfig = LiveVoiceConfig(
                            prebuiltVoiceConfig = LivePrebuiltVoiceConfig(voiceName = "Puck")
                        )
                    )
                ),
                systemInstruction = LiveContent(
                    parts = listOf(LiveTextPart(text = "You are Buddy"))
                )
            )
        )

        val jsonString = json.encodeToString(setup)
        assertTrue(jsonString.contains("models/gemini-3.8-live"))
        assertTrue(jsonString.contains("Puck"))
        assertTrue(jsonString.contains("You are Buddy"))
    }

    @Test
    fun liveRealtimeInput_audioStreamEnd_serializesCorrectly() {
        val streamEnd = LiveRealtimeInput(
            realtimeInput = LiveRealtimeInputPayload(
                audioStreamEnd = true
            )
        )

        val jsonString = json.encodeToString(streamEnd)
        assertTrue(jsonString.contains("\"audioStreamEnd\":true"))
    }

    @Test
    fun liveServerMessage_setupComplete_deserializesCorrectly() {
        val rawJson = """{"setupComplete": {}}"""
        val message = json.decodeFromString<LiveServerMessage>(rawJson)
        assertNotNull(message.setupComplete)
    }

    @Test
    fun liveServerMessage_interrupted_deserializesCorrectly() {
        val rawJson = """{"serverContent": {"interrupted": true}}"""
        val message = json.decodeFromString<LiveServerMessage>(rawJson)
        assertNotNull(message.serverContent)
        assertEquals(true, message.serverContent?.interrupted)
    }

    @Test
    fun liveClientContentMessage_textTurn_serializesCorrectly() {
        val textTurn = LiveClientContentMessage(
            clientContent = LiveClientContent(
                turns = listOf(
                    LiveClientTurn(
                        role = "user",
                        parts = listOf(LiveTextPart(text = "Hello Buddy, explain grammar"))
                    )
                ),
                turnComplete = true
            )
        )

        val jsonString = json.encodeToString(textTurn)
        assertTrue(jsonString.contains("Hello Buddy, explain grammar"))
        assertTrue(jsonString.contains("\"turnComplete\":true"))
        assertTrue(jsonString.contains("\"role\":\"user\""))
    }

    @Test
    fun liveTranscriptEntry_defaultIsFinal_isTrue() {
        val entry = LiveTranscriptEntry(sender = "You", text = "Test message")
        assertTrue(entry.isFinal)
        assertEquals("You", entry.sender)
        assertEquals("Test message", entry.text)
    }
}
