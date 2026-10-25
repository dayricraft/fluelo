import { errorResponse, getEvalAI } from "@/lib/server/gemini";

interface TTSRequest {
  text: string;
  partnerName?: string;
  level?: string;
  style?: string;
}

// In-memory cache for fast replay of common greetings, tips, and responses
const audioCache = new Map<string, { audioBase64: string; mimeType: string }>();
const MAX_CACHE_SIZE = 100;

const PARTNER_VOICES: Record<string, { voice: string; style: string }> = {
  Sarah: {
    voice: "Aoede",
    style: "crisp, articulate, polished British accent, warm, professional, natural conversational flow",
  },
  Emma: {
    voice: "Kore",
    style: "warm, cheerful, encouraging American English coach, conversational and uplifting",
  },
  Sophia: {
    voice: "Leda",
    style: "gentle, friendly, melodic, adventurous, empathetic traveler tone",
  },
  David: {
    voice: "Fenrir",
    style: "pragmatic, confident, friendly American tech mentor, clear and engaging",
  },
  Kenji: {
    voice: "Charon",
    style: "calm, deep, reflective, relaxed, casual modern conversational flow",
  },
};

export async function POST(request: Request) {
  try {
    const body: TTSRequest = await request.json();
    const text = (body.text || "").trim();

    if (!text) {
      return Response.json({ error: "Text parameter is required." }, { status: 400 });
    }

    const partnerName = body.partnerName || "Sarah";
    const partnerConfig = PARTNER_VOICES[partnerName] || PARTNER_VOICES.Sarah;
    const voice = partnerConfig.voice;
    const style = body.style || partnerConfig.style;

    // Cache key based on voice, style, and text
    const cacheKey = `${voice}:::${text}`;
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      return Response.json(cached);
    }

    const ai = getEvalAI();
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash-tts",
      input: [
        {
          type: "user_input",
          content: [
            {
              type: "text",
              text,
              annotations: [
                {
                  type: "speech_metadata",
                  style,
                },
              ],
            },
          ],
        },
      ],
      response_format: { type: "audio" },
      generation_config: {
        speech_config: [{ voice }],
      },
      store: false,
    });

    const outputAudio = interaction.output_audio;
    if (!outputAudio || !outputAudio.data) {
      throw new Error("Gemini TTS did not return audio data.");
    }

    const result = {
      audioBase64: outputAudio.data,
      mimeType: outputAudio.mime_type || "audio/wav",
    };

    // Store in cache (evict oldest if full)
    if (audioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, result);

    return Response.json(result);
  } catch (err) {
    return errorResponse(err, 500);
  }
}
