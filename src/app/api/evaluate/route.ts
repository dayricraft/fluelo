import { CEFR_LEVELS, type CefrLevel } from "@/lib/levels";
import { buildEvaluationPrompt } from "@/lib/prompts";
import { errorResponse, generateJson } from "@/lib/server/gemini";
import { FEEDBACK_SCHEMA, MISSION_FEEDBACK_SCHEMA } from "@/lib/server/schemas";
import { getSpeakingMission, type SpeakingMission } from "@/lib/speaking-missions";
import type {
  Feedback,
  MissionCriterionResult,
  MissionCriterionStatus,
  SessionMode,
} from "@/lib/types";

const SESSION_MODES: readonly SessionMode[] = [
  "practice",
  "placement",
  "toefl-interview",
  "listen-repeat",
  "speaking-mission",
];

const MAX_TOPIC_TITLE_LENGTH = 200;
const MAX_LESSON_ID_LENGTH = 200;
const MAX_TRANSCRIPT_LENGTH = 100_000;
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_REQUEST_BYTES = 22 * 1024 * 1024;
const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;

class ValidationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSessionMode(value: unknown): value is SessionMode {
  return (
    typeof value === "string" &&
    SESSION_MODES.includes(value as SessionMode)
  );
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

const MISSION_CRITERION_STATUSES: readonly MissionCriterionStatus[] = [
  "achieved",
  "partial",
  "not-shown",
];

function canonicalList(
  values: readonly string[],
  allowed: readonly string[],
): string[] {
  const allowedByLowercase = new Map(
    allowed.map((value) => [value.toLocaleLowerCase("en"), value]),
  );
  const result = new Set<string>();
  for (const value of values) {
    const canonical = allowedByLowercase.get(value.trim().toLocaleLowerCase("en"));
    if (canonical) result.add(canonical);
  }
  return [...result];
}

function learnerSpeechAmount(transcript: string): {
  turns: number;
  words: number;
} {
  const learnerLines = transcript
    .split(/\r?\n/)
    .filter((line) => /^\s*LEARNER\s*:/i.test(line));
  const learnerText = learnerLines
    .map((line) => line.replace(/^\s*LEARNER\s*:/i, ""))
    .join(" ")
    .trim();
  const words = learnerText ? learnerText.split(/\s+/u).length : 0;
  return { turns: learnerLines.length, words };
}

function normalizeMissionFeedback(
  feedback: Feedback,
  mission: SpeakingMission,
  transcript: string,
): Feedback {
  const assessment = feedback.missionAssessment;
  if (!assessment) {
    throw new Error("Model tidak mengembalikan penilaian Speaking Mission.");
  }

  const rawCriteria = Array.isArray(assessment.criteria)
    ? assessment.criteria
    : [];
  const criteria: MissionCriterionResult[] = mission.successCriteria.map(
    (criterion, index) => {
      const candidate =
        rawCriteria.find((item) => item?.criterion === criterion) ??
        rawCriteria[index];
      const evidence =
        typeof candidate?.evidence === "string" && candidate.evidence.trim()
          ? candidate.evidence.trim()
          : "Tidak ada bukti dari ucapan learner.";
      const hasEvidence =
        typeof candidate?.evidence === "string" &&
        candidate.evidence.trim().length > 0;
      const status =
        hasEvidence && MISSION_CRITERION_STATUSES.includes(candidate?.status)
          ? candidate.status
          : "not-shown";
      return { criterion, status, evidence };
    },
  );

  const requestedScore = Number.isFinite(assessment.score)
    ? Math.round(assessment.score)
    : 0;
  const criterionScore = criteria.length === 0
    ? 0
    : Math.round(
        (criteria.reduce(
          (total, item) =>
            total + (item.status === "achieved" ? 1 : item.status === "partial" ? 0.5 : 0),
          0,
        ) /
          criteria.length) *
          100,
      );
  const speech = learnerSpeechAmount(transcript);
  const hasEnoughSpeech = speech.turns >= 2 && speech.words >= 20;
  const score = Math.max(
    0,
    Math.min(hasEnoughSpeech ? 100 : 69, requestedScore, criterionScore),
  );

  return {
    ...feedback,
    missionAssessment: {
      score,
      passed: hasEnoughSpeech && score >= 70,
      criteria,
      targetVocabularyUsed: canonicalList(
        Array.isArray(assessment.targetVocabularyUsed)
          ? assessment.targetVocabularyUsed
          : [],
        mission.targetVocabulary,
      ),
      grammarUsed: canonicalList(
        Array.isArray(assessment.grammarUsed) ? assessment.grammarUsed : [],
        mission.grammarTargets,
      ),
      summary:
        typeof assessment.summary === "string" && assessment.summary.trim()
          ? assessment.summary.trim()
          : "Coba ulangi misi dan berikan jawaban yang lebih lengkap.",
    },
  };
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

/** Evaluate a completed speaking session, optionally using its WAV recording. */
export async function POST(request: Request) {
  try {
    const body = await readBody(request);

    if (!isSessionMode(body.mode)) {
      throw new ValidationError(
        "mode harus salah satu dari practice, placement, toefl-interview, listen-repeat, atau speaking-mission.",
      );
    }

    let level: CefrLevel;
    let topicTitle: string;
    let mission: SpeakingMission | undefined;

    if (body.mode === "speaking-mission") {
      const lessonId = requiredString(
        body.lessonId,
        "lessonId",
        MAX_LESSON_ID_LENGTH,
      );
      mission = getSpeakingMission(lessonId);
      if (!mission) {
        throw new ValidationError("Speaking Mission tidak ditemukan untuk lesson tersebut.");
      }

      // Never trust level, title, criteria, or targets supplied by the client.
      level = mission.level;
      topicTitle = mission.lessonTitle;
    } else {
      if (!isCefrLevel(body.level)) {
        throw new ValidationError("level harus salah satu dari A1, A2, B1, B2, C1, atau C2.");
      }
      level = body.level;
      topicTitle = requiredString(
        body.topicTitle,
        "topicTitle",
        MAX_TOPIC_TITLE_LENGTH,
      );
    }

    const transcript = requiredString(
      body.transcript,
      "transcript",
      MAX_TRANSCRIPT_LENGTH,
    );
    const audioWavBase64 = Object.hasOwn(body, "audioWavBase64")
      ? wavBase64(body.audioWavBase64)
      : undefined;

    const prompt = buildEvaluationPrompt({
      mode: body.mode,
      level,
      topicTitle,
      transcript,
      hasAudio: audioWavBase64 !== undefined,
      mission,
    });

    const input: string | Array<Record<string, unknown>> = audioWavBase64
      ? [
          { type: "text", text: prompt },
          {
            type: "audio",
            data: audioWavBase64,
            mime_type: "audio/wav",
          },
        ]
      : prompt;

    const generatedFeedback = await generateJson<Feedback>({
      input,
      schema: mission ? MISSION_FEEDBACK_SCHEMA : FEEDBACK_SCHEMA,
    });
    const feedback = mission
      ? normalizeMissionFeedback(generatedFeedback, mission, transcript)
      : generatedFeedback;

    return Response.json(feedback);
  } catch (error) {
    return errorResponse(error, error instanceof ValidationError ? 400 : 500);
  }
}
