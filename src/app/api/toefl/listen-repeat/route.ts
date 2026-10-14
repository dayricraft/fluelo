import { CEFR_LEVELS, type CefrLevel } from "@/lib/levels";
import {
  buildListenRepeatGenerationPrompt,
  buildListenRepeatScoringPrompt,
} from "@/lib/prompts";
import { errorResponse, generateJson } from "@/lib/server/gemini";
import {
  LISTEN_REPEAT_SCORE_SCHEMA,
  LISTEN_REPEAT_SET_SCHEMA,
} from "@/lib/server/schemas";
import type { ListenRepeatItemResult } from "@/lib/types";

const MAX_TARGET_SENTENCE_LENGTH = 500;
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_REQUEST_BYTES = 22 * 1024 * 1024;
const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;

interface ListenRepeatSet {
  scenario: string;
  speaker: string;
  sentences: string[];
}

type ListenRepeatScore = Omit<ListenRepeatItemResult, "target">;

class ValidationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCefrLevel(value: unknown): value is CefrLevel {
  return (
    typeof value === "string" &&
    CEFR_LEVELS.includes(value as CefrLevel)
  );
}

function requiredString(
  value: unknown,
  field: string,
  maxLength: number,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} wajib berupa teks yang tidak kosong.`);
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new ValidationError(
      `${field} terlalu panjang (maksimal ${maxLength.toLocaleString("id-ID")} karakter).`,
    );
  }
  return normalized;
}

function wavBase64(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ValidationError("audioWavBase64 wajib berupa base64 WAV yang tidak kosong.");
  }
  if (value.length % 4 !== 0 || !BASE64_PATTERN.test(value)) {
    throw new ValidationError("audioWavBase64 bukan base64 yang valid.");
  }

  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  const decodedBytes = (value.length / 4) * 3 - padding;
  if (decodedBytes < 44) {
    throw new ValidationError("audioWavBase64 terlalu pendek untuk menjadi berkas WAV.");
  }
  if (decodedBytes > MAX_AUDIO_BYTES) {
    throw new ValidationError("Ukuran audio melebihi batas 15 MiB.");
  }

  try {
    const header = atob(value.slice(0, 16));
    if (header.slice(0, 4) !== "RIFF" || header.slice(8, 12) !== "WAVE") {
      throw new ValidationError("audioWavBase64 harus berisi audio berformat WAV.");
    }
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError("audioWavBase64 bukan base64 yang valid.");
  }

  return value;
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

  if (!isRecord(body)) {
    throw new ValidationError("Body JSON harus berupa object.");
  }
  return body;
}

function isListenRepeatSet(value: unknown): value is ListenRepeatSet {
  return (
    isRecord(value) &&
    typeof value.scenario === "string" &&
    value.scenario.trim().length > 0 &&
    typeof value.speaker === "string" &&
    value.speaker.trim().length > 0 &&
    Array.isArray(value.sentences) &&
    value.sentences.length === 7 &&
    value.sentences.every(
      (sentence) =>
        typeof sentence === "string" &&
        sentence.trim().length > 0 &&
        sentence.length <= MAX_TARGET_SENTENCE_LENGTH,
    )
  );
}

function isListenRepeatScore(value: unknown): value is ListenRepeatScore {
  return (
    isRecord(value) &&
    typeof value.heard === "string" &&
    Number.isInteger(value.accuracy) &&
    typeof value.accuracy === "number" &&
    value.accuracy >= 0 &&
    value.accuracy <= 100 &&
    Array.isArray(value.missedWords) &&
    value.missedWords.every((word) => typeof word === "string") &&
    Array.isArray(value.pronunciationIssues) &&
    value.pronunciationIssues.every(
      (issue) =>
        isRecord(issue) &&
        typeof issue.word === "string" &&
        typeof issue.issue === "string",
    ) &&
    typeof value.tip === "string"
  );
}

/** Generate a fresh seven-sentence Listen & Repeat exercise for a CEFR level. */
export async function GET(request: Request) {
  try {
    const level = new URL(request.url).searchParams.get("level");
    if (!isCefrLevel(level)) {
      throw new ValidationError(
        "Query level wajib diisi dengan A1, A2, B1, B2, C1, atau C2.",
      );
    }

    const result = await generateJson<unknown>({
      input: buildListenRepeatGenerationPrompt(level),
      schema: LISTEN_REPEAT_SET_SCHEMA,
    });
    if (!isListenRepeatSet(result)) {
      throw new Error("Model tidak mengembalikan tepat 7 kalimat Listen & Repeat yang valid.");
    }

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, error instanceof ValidationError ? 400 : 500);
  }
}

/** Score one spoken repetition against its target sentence. */
export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const targetSentence = requiredString(
      body.targetSentence,
      "targetSentence",
      MAX_TARGET_SENTENCE_LENGTH,
    );
    const audioWavBase64 = wavBase64(body.audioWavBase64);

    const result = await generateJson<unknown>({
      input: [
        {
          type: "text",
          text: buildListenRepeatScoringPrompt(targetSentence),
        },
        {
          type: "audio",
          data: audioWavBase64,
          mime_type: "audio/wav",
        },
      ],
      schema: LISTEN_REPEAT_SCORE_SCHEMA,
    });
    if (!isListenRepeatScore(result)) {
      throw new Error("Model tidak mengembalikan penilaian Listen & Repeat yang valid.");
    }

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, error instanceof ValidationError ? 400 : 500);
  }
}
