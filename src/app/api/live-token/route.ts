import { Modality } from "@google/genai";
import { CEFR_LEVELS, type CefrLevel } from "@/lib/levels";
import {
  buildPlacementPrompt,
  buildPracticePrompt,
  buildSpeakingMissionPrompt,
  buildToeflInterviewPrompt,
} from "@/lib/prompts";
import { getSpeakingMission } from "@/lib/speaking-missions";
import { findTopic, PRACTICE_TOPICS, TOEFL_INTERVIEW_TOPICS } from "@/lib/topics";
import { errorResponse, getGenAI, LIVE_MODEL, LIVE_VOICE } from "@/lib/server/gemini";
import { findSpeakingPartner } from "@/lib/speaking-partners";

interface TokenRequest {
  mode: "practice" | "placement" | "toefl-interview" | "speaking-mission";
  level?: CefrLevel;
  topicId?: string;
  lessonId?: string;
  partnerId?: string;
}

const TOKEN_MODES: readonly TokenRequest["mode"][] = [
  "practice",
  "placement",
  "toefl-interview",
  "speaking-mission",
];
const MAX_REQUEST_BYTES = 8 * 1024;

class ValidationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new ValidationError("Payload permintaan terlalu besar.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Body harus berupa JSON yang valid.");
  }
  if (!isRecord(body)) throw new ValidationError("Body JSON harus berupa object.");
  return body;
}

/**
 * Issues a short-lived, single-use ephemeral token for the Gemini Live API.
 * The system prompt and session config are locked into the token, so the
 * browser can stream audio directly to Gemini without ever seeing the API key.
 */
export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    if (
      typeof body.mode !== "string" ||
      !TOKEN_MODES.includes(body.mode as TokenRequest["mode"])
    ) {
      throw new ValidationError(
        "mode harus salah satu dari practice, placement, toefl-interview, atau speaking-mission.",
      );
    }
    const mode = body.mode as TokenRequest["mode"];

    let systemPrompt: string;
    let voiceName = LIVE_VOICE;
    if (mode === "speaking-mission") {
      if (
        typeof body.lessonId !== "string" ||
        body.lessonId.trim().length === 0 ||
        body.lessonId.length > 200
      ) {
        throw new ValidationError("lessonId wajib diisi untuk Speaking Mission.");
      }

      const mission = getSpeakingMission(body.lessonId.trim());
      if (!mission) {
        throw new ValidationError("Speaking Mission tidak ditemukan untuk lesson tersebut.");
      }

      // The catalog controls level, instructions, roles, and learning targets.
      // Any similarly named values supplied by a client are intentionally ignored.
      systemPrompt = buildSpeakingMissionPrompt(mission);
    } else {
      if (
        body.level !== undefined &&
        (typeof body.level !== "string" ||
          !CEFR_LEVELS.includes(body.level as CefrLevel))
      ) {
        throw new ValidationError("level harus salah satu dari A1, A2, B1, B2, C1, atau C2.");
      }
      const level: CefrLevel = (body.level as CefrLevel | undefined) ?? "B1";

      if (mode === "placement") {
        systemPrompt = buildPlacementPrompt();
      } else {
        const partner = findSpeakingPartner(
          typeof body.partnerId === "string" ? body.partnerId : undefined,
        );
        const resolvedTopicId =
          typeof body.topicId === "string" && body.topicId.trim().length > 0
            ? body.topicId.trim()
            : partner.defaultTopicId || (mode === "toefl-interview" ? "t-online-learning" : "intro");

        const topic = findTopic(resolvedTopicId);
        if (!topic) {
          throw new ValidationError("Topik tidak ditemukan untuk mode yang dipilih.");
        }
        if (mode === "toefl-interview") {
          systemPrompt = buildToeflInterviewPrompt(level, topic);
        } else {
          voiceName = partner.voiceName || LIVE_VOICE;
          systemPrompt = buildPracticePrompt(level, topic, partner);
        }
      }
    }

    const config = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    };

    const now = Date.now();
    const token = await getGenAI().authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        liveConnectConstraints: { model: LIVE_MODEL, config },
      },
    });

    if (!token.name) throw new Error("Gagal membuat token sesi.");
    return Response.json({ token: token.name, model: LIVE_MODEL });
  } catch (err) {
    return errorResponse(err, err instanceof ValidationError ? 400 : 500);
  }
}
