package com.aibuddy.live

import kotlinx.serialization.Serializable

@Serializable
data class LiveClientSetup(
    val setup: LiveSetupConfig
)

@Serializable
data class LiveSetupConfig(
    val model: String = "models/gemini-3.8-live",
    val generationConfig: LiveGenerationConfig? = null,
    val systemInstruction: LiveContent? = null,
    val inputAudioTranscription: LiveAudioTranscriptionConfig? = null,
    val outputAudioTranscription: LiveAudioTranscriptionConfig? = null,
    val sessionResumption: LiveSessionResumptionConfig? = null
)

@Serializable
data class LiveSessionResumptionConfig(
    val handle: String? = null
)

@Serializable
class LiveAudioTranscriptionConfig

@Serializable
data class LiveGenerationConfig(
    val responseModalities: List<String> = listOf("AUDIO"),
    val speechConfig: LiveSpeechConfig? = null
)

@Serializable
data class LiveSpeechConfig(
    val voiceConfig: LiveVoiceConfig? = null
)

@Serializable
data class LiveVoiceConfig(
    val prebuiltVoiceConfig: LivePrebuiltVoiceConfig? = null
)

@Serializable
data class LivePrebuiltVoiceConfig(
    val voiceName: String = "Puck"
)

@Serializable
data class LiveContent(
    val parts: List<LiveTextPart>
)

@Serializable
data class LiveTextPart(
    val text: String
)

@Serializable
data class LiveClientContentMessage(
    val clientContent: LiveClientContent
)

@Serializable
data class LiveClientContent(
    val turns: List<LiveClientTurn>,
    val turnComplete: Boolean = true
)

@Serializable
data class LiveClientTurn(
    val role: String = "user",
    val parts: List<LiveTextPart>
)

@Serializable
data class LiveRealtimeInput(
    val realtimeInput: LiveRealtimeInputPayload
)

@Serializable
data class LiveRealtimeInputPayload(
    val audio: LiveBlob? = null,
    val audioStreamEnd: Boolean? = null,
    val text: String? = null
)

@Serializable
data class LiveBlob(
    val mimeType: String = "audio/pcm;rate=16000",
    val data: String // Base64 PCM data
)

@Serializable
data class LiveServerMessage(
    val serverContent: LiveServerContent? = null,
    val setupComplete: LiveSetupComplete? = null,
    val voiceActivity: LiveVoiceActivity? = null,
    val sessionResumptionUpdate: LiveSessionResumptionUpdate? = null,
    val goAway: LiveGoAway? = null,
    val error: LiveServerError? = null
)

@Serializable
data class LiveSessionResumptionUpdate(
    val newHandle: String? = null,
    val resumable: Boolean? = null
)

@Serializable
data class LiveGoAway(
    val timeRemaining: String? = null
)

@Serializable
class LiveSetupComplete

@Serializable
data class LiveVoiceActivity(
    val type: String? = null // "ACTIVITY_START" or "ACTIVITY_END"
)

@Serializable
data class LiveServerError(
    val code: Int? = null,
    val message: String? = null,
    val status: String? = null
)

@Serializable
data class LiveServerContent(
    val modelTurn: LiveModelTurn? = null,
    val inputTranscription: LiveTranscription? = null,
    val interimInputTranscription: LiveTranscription? = null,
    val outputTranscription: LiveTranscription? = null,
    val interrupted: Boolean? = null,
    val turnComplete: Boolean? = null,
    val waitingForInput: Boolean? = null
)

@Serializable
data class LiveModelTurn(
    val parts: List<LivePart>? = null
)

@Serializable
data class LivePart(
    val text: String? = null,
    val inlineData: LiveInlineData? = null
)

@Serializable
data class LiveInlineData(
    val mimeType: String? = null,
    val data: String? = null // Base64 PCM data
)

@Serializable
data class LiveTranscription(
    val text: String? = null
)


