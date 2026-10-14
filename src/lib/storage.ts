"use client";
/**
 * Local persistence (localStorage) for the learner profile and session history.
 * Simple on purpose for the MVP; can be swapped for Supabase later without
 * changing the components (they only use the functions/hook below).
 */
import { useSyncExternalStore } from "react";
import { getLessonContent } from "./course-content";
import { FOUNDATION_UNITS } from "./curriculum";
import {
  applyLessonAttempt,
  applyReviewAttempt,
  createEmptyLearningProgress,
  normalizeLearningProgress,
  type LearningCatalogLesson,
  type LearningProgress,
  type LessonAttemptResult,
  type PracticeProgressInput,
} from "./learning-progress";
import { CEFR_LEVELS, type CefrLevel } from "./levels";
import { getSpeakingMission, type SpeakingMission } from "./speaking-missions";
import type {
  Correction,
  CriterionName,
  CriterionScore,
  Feedback,
  ListenRepeatItemResult,
  MissionAssessment,
  SessionMode,
  SessionRecord,
  TranscriptTurn,
  VocabularyUpgrade,
} from "./types";

const KEY = "fluentpath:v1";
const WRITE_LOCK_KEY = `${KEY}:write-lock`;
const WRITE_LOCK_LEASE_MS = 5_000;
const WRITE_LOCK_TIMEOUT_MS = 10_000;

export interface Profile {
  name: string;
  level: CefrLevel | null;
  placementDone: boolean;
  /** Target TOEFL band on the 1–6 scale. */
  targetBand: number;
}

export interface AppData {
  profile: Profile;
  sessions: SessionRecord[];
  learning: LearningProgress;
}

const DEFAULT_DATA: AppData = {
  profile: { name: "", level: null, placementDone: false, targetBand: 4.5 },
  sessions: [],
  learning: createEmptyLearningProgress(),
};

const LEARNING_CATALOG: readonly LearningCatalogLesson[] = FOUNDATION_UNITS.flatMap(
  (unit) =>
    unit.lessons.flatMap((lesson) => {
      const content = getLessonContent(lesson.id);
      return content
        ? [{
            lessonId: lesson.id,
            unitId: unit.id,
            level: unit.level,
            xp: lesson.xp,
            practiceIds: content.practice.map((practice) => practice.id),
          }]
        : [];
    }),
);
const LEARNING_CATALOG_BY_LESSON = new Map(
  LEARNING_CATALOG.map((lesson) => [lesson.lessonId, lesson]),
);

const MAX_SESSIONS = 100;
const MAX_TRANSCRIPT_TURNS = 500;
const MAX_LISTEN_REPEAT_RESULTS = 20;
const SESSION_MODES: SessionMode[] = [
  "practice",
  "placement",
  "toefl-interview",
  "listen-repeat",
  "speaking-mission",
];
const CRITERION_NAMES: CriterionName[] = [
  "fluency",
  "pronunciation",
  "grammar",
  "vocabulary",
  "coherence",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, maxLength: number, trim = false): string | null {
  if (typeof value !== "string") return null;
  return (trim ? value.trim() : value).slice(0, maxLength);
}

function nonEmptyString(value: unknown, maxLength: number): string | null {
  const result = stringValue(value, maxLength, true);
  return result ? result : null;
}

function isCefrLevel(value: unknown): value is CefrLevel {
  return typeof value === "string" && CEFR_LEVELS.some((level) => level === value);
}

function isSessionMode(value: unknown): value is SessionMode {
  return typeof value === "string" && SESSION_MODES.some((mode) => mode === value);
}

function isCriterionName(value: unknown): value is CriterionName {
  return typeof value === "string" && CRITERION_NAMES.some((name) => name === value);
}

function bandValue(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > 6) return null;
  return Math.round(value * 2) / 2;
}

function stringList(value: unknown, maxItems: number, maxItemLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => nonEmptyString(item, maxItemLength))
    .filter((item): item is string => item !== null)
    .slice(0, maxItems);
}

function normalizeProfile(value: unknown): Profile {
  if (!isRecord(value)) return { ...DEFAULT_DATA.profile };
  return {
    name: stringValue(value.name, 40, true) ?? DEFAULT_DATA.profile.name,
    level: isCefrLevel(value.level) ? value.level : null,
    placementDone:
      typeof value.placementDone === "boolean"
        ? value.placementDone
        : DEFAULT_DATA.profile.placementDone,
    targetBand: bandValue(value.targetBand) ?? DEFAULT_DATA.profile.targetBand,
  };
}

function normalizeTranscript(value: unknown): TranscriptTurn[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): TranscriptTurn | null => {
      if (!isRecord(item) || (item.role !== "user" && item.role !== "model")) return null;
      const text = nonEmptyString(item.text, 8_000);
      return text ? { role: item.role, text } : null;
    })
    .filter((item): item is TranscriptTurn => item !== null)
    .slice(0, MAX_TRANSCRIPT_TURNS);
}

function normalizeCriterion(value: unknown): CriterionScore | null {
  if (!isRecord(value) || !isCriterionName(value.name)) return null;
  const band = bandValue(value.band);
  if (band === null) return null;
  return {
    name: value.name,
    band,
    comment: stringValue(value.comment, 2_000, true) ?? "",
  };
}

function normalizeCorrection(value: unknown): Correction | null {
  if (!isRecord(value)) return null;
  const original = nonEmptyString(value.original, 2_000);
  const corrected = nonEmptyString(value.corrected, 2_000);
  if (!original || !corrected) return null;
  return {
    original,
    corrected,
    explanation: stringValue(value.explanation, 2_000, true) ?? "",
  };
}

function normalizeVocabularyUpgrade(value: unknown): VocabularyUpgrade | null {
  if (!isRecord(value)) return null;
  const used = nonEmptyString(value.used, 500);
  const better = nonEmptyString(value.better, 500);
  if (!used || !better) return null;
  return {
    used,
    better,
    example: stringValue(value.example, 2_000, true) ?? "",
  };
}

function normalizeMissionAssessment(
  value: unknown,
  mission: SpeakingMission,
): MissionAssessment | undefined {
  if (
    !isRecord(value) ||
    typeof value.score !== "number" ||
    !Number.isFinite(value.score) ||
    typeof value.passed !== "boolean"
  ) {
    return undefined;
  }

  const allowedCriteria = new Set(mission.successCriteria);
  const seenCriteria = new Set<string>();
  const criteria = Array.isArray(value.criteria)
    ? value.criteria
        .map((item): MissionAssessment["criteria"][number] | null => {
          if (!isRecord(item)) return null;
          const criterion = nonEmptyString(item.criterion, 500);
          const evidence = nonEmptyString(item.evidence, 2_000);
          const status = item.status;
          if (
            !criterion ||
            !evidence ||
            (status !== "achieved" && status !== "partial" && status !== "not-shown") ||
            !allowedCriteria.has(criterion) ||
            seenCriteria.has(criterion)
          ) {
            return null;
          }
          seenCriteria.add(criterion);
          return { criterion, status, evidence };
        })
        .filter(
          (item): item is MissionAssessment["criteria"][number] => item !== null,
        )
        .slice(0, 12)
    : [];

  if (criteria.length !== mission.successCriteria.length) return undefined;

  const criteriaByName = new Map(criteria.map((item) => [item.criterion, item]));
  const canonicalCriteria = mission.successCriteria.map((criterion) =>
    criteriaByName.get(criterion),
  );
  if (canonicalCriteria.some((item) => item === undefined)) return undefined;

  const orderedCriteria = canonicalCriteria as MissionAssessment["criteria"];
  const criterionScore = Math.round(
    (orderedCriteria.reduce(
      (total, item) =>
        total + (item.status === "achieved" ? 1 : item.status === "partial" ? 0.5 : 0),
      0,
    ) /
      orderedCriteria.length) *
      100,
  );

  const canonicalDetected = (
    detected: unknown,
    allowed: readonly string[],
    maxItemLength: number,
  ): string[] => {
    const detectedLowercase = new Set(
      stringList(detected, 20, maxItemLength).map((item) =>
        item.toLocaleLowerCase("en"),
      ),
    );
    return allowed.filter((item) =>
      detectedLowercase.has(item.toLocaleLowerCase("en")),
    );
  };

  const score = Math.min(
    criterionScore,
    Math.min(100, Math.max(0, Math.round(value.score))),
  );
  return {
    score,
    passed: score >= 70,
    criteria: orderedCriteria,
    targetVocabularyUsed: canonicalDetected(
      value.targetVocabularyUsed,
      mission.targetVocabulary,
      200,
    ),
    grammarUsed: canonicalDetected(value.grammarUsed, mission.grammarTargets, 500),
    summary: stringValue(value.summary, 2_000, true) ?? "",
  };
}

function normalizeFeedback(
  value: unknown,
  fallbackLevel: CefrLevel,
  mission?: SpeakingMission,
): Feedback | undefined {
  if (!isRecord(value)) return undefined;
  const overallBand = bandValue(value.overallBand);
  if (overallBand === null) return undefined;

  const criteria = Array.isArray(value.criteria)
    ? value.criteria
        .map(normalizeCriterion)
        .filter((item): item is CriterionScore => item !== null)
        .filter((item, index, items) => items.findIndex((candidate) => candidate.name === item.name) === index)
        .slice(0, CRITERION_NAMES.length)
    : [];
  const corrections = Array.isArray(value.corrections)
    ? value.corrections
        .map(normalizeCorrection)
        .filter((item): item is Correction => item !== null)
        .slice(0, 20)
    : [];
  const vocabularyUpgrades = Array.isArray(value.vocabularyUpgrades)
    ? value.vocabularyUpgrades
        .map(normalizeVocabularyUpgrade)
        .filter((item): item is VocabularyUpgrade => item !== null)
        .slice(0, 20)
    : [];
  const fillerWords = Array.isArray(value.fillerWords)
    ? value.fillerWords
        .map((item): Feedback["fillerWords"][number] | null => {
          if (!isRecord(item)) return null;
          const word = nonEmptyString(item.word, 100);
          if (!word || typeof item.count !== "number" || !Number.isFinite(item.count)) return null;
          return { word, count: Math.min(10_000, Math.max(0, Math.floor(item.count))) };
        })
        .filter((item): item is Feedback["fillerWords"][number] => item !== null)
        .slice(0, 50)
    : [];

  const missionAssessment = mission
    ? normalizeMissionAssessment(value.missionAssessment, mission)
    : undefined;

  return {
    overallBand,
    cefr: isCefrLevel(value.cefr) ? value.cefr : fallbackLevel,
    criteria,
    summary: stringValue(value.summary, 4_000, true) ?? "",
    strengths: stringList(value.strengths, 20, 1_000),
    improvements: stringList(value.improvements, 20, 1_000),
    corrections,
    vocabularyUpgrades,
    fillerWords,
    nextFocus: stringValue(value.nextFocus, 2_000, true) ?? "",
    pronunciationFromAudio:
      typeof value.pronunciationFromAudio === "boolean" ? value.pronunciationFromAudio : false,
    ...(missionAssessment ? { missionAssessment } : {}),
  };
}

function normalizeListenRepeatResult(value: unknown): ListenRepeatItemResult | null {
  if (!isRecord(value)) return null;
  const target = nonEmptyString(value.target, 2_000);
  if (!target || typeof value.accuracy !== "number" || !Number.isFinite(value.accuracy)) return null;

  const pronunciationIssues = Array.isArray(value.pronunciationIssues)
    ? value.pronunciationIssues
        .map((item): ListenRepeatItemResult["pronunciationIssues"][number] | null => {
          if (!isRecord(item)) return null;
          const word = nonEmptyString(item.word, 200);
          const issue = nonEmptyString(item.issue, 1_000);
          return word && issue ? { word, issue } : null;
        })
        .filter(
          (item): item is ListenRepeatItemResult["pronunciationIssues"][number] => item !== null,
        )
        .slice(0, 100)
    : [];

  return {
    target,
    heard: stringValue(value.heard, 4_000, true) ?? "",
    accuracy: Math.min(100, Math.max(0, value.accuracy)),
    missedWords: stringList(value.missedWords, 100, 200),
    pronunciationIssues,
    tip: stringValue(value.tip, 2_000, true) ?? "",
  };
}

function normalizeSession(value: unknown): SessionRecord | null {
  if (!isRecord(value)) return null;
  const id = nonEmptyString(value.id, 128);
  const mode = isSessionMode(value.mode) ? value.mode : null;
  const level = isCefrLevel(value.level) ? value.level : null;
  const startedAtMs = typeof value.startedAt === "string" ? Date.parse(value.startedAt) : Number.NaN;
  if (!id || !mode || !level || !Number.isFinite(startedAtMs)) return null;

  const rawDuration =
    typeof value.durationSec === "number" && Number.isFinite(value.durationSec) ? value.durationSec : 0;
  const lessonId = nonEmptyString(value.lessonId, 128);
  const mission = mode === "speaking-mission" && lessonId
    ? getSpeakingMission(lessonId)
    : undefined;
  if (mode === "speaking-mission" && !mission) return null;

  const normalizedLevel = mission?.level ?? level;
  const feedback = normalizeFeedback(
    value.feedback,
    normalizedLevel,
    mission,
  );
  const listenRepeat = Array.isArray(value.listenRepeat)
    ? value.listenRepeat
        .map(normalizeListenRepeatResult)
        .filter((item): item is ListenRepeatItemResult => item !== null)
        .slice(0, MAX_LISTEN_REPEAT_RESULTS)
    : [];
  const topicId = nonEmptyString(value.topicId, 128);

  return {
    id,
    mode,
    level: normalizedLevel,
    ...(topicId ? { topicId } : {}),
    ...(mission ? { lessonId: mission.lessonId } : {}),
    topicTitle: mission?.lessonTitle ?? nonEmptyString(value.topicTitle, 300) ?? "Sesi latihan",
    startedAt: new Date(startedAtMs).toISOString(),
    durationSec: Math.min(86_400, Math.max(0, Math.floor(rawDuration))),
    transcript: normalizeTranscript(value.transcript),
    ...(feedback ? { feedback } : {}),
    ...(listenRepeat.length > 0 ? { listenRepeat } : {}),
  };
}

function normalizeAppData(value: unknown): AppData {
  if (!isRecord(value)) {
    return {
      profile: { ...DEFAULT_DATA.profile },
      sessions: [],
      learning: createEmptyLearningProgress(),
    };
  }

  const seenIds = new Set<string>();
  const sessions = (Array.isArray(value.sessions) ? value.sessions : [])
    .map(normalizeSession)
    .filter((session): session is SessionRecord => {
      if (!session || seenIds.has(session.id)) return false;
      seenIds.add(session.id);
      return true;
    })
    .slice(0, MAX_SESSIONS);

  return {
    profile: normalizeProfile(value.profile),
    sessions,
    learning: normalizeLearningProgress(value.learning, LEARNING_CATALOG),
  };
}

let cache: AppData | null = null;
const listeners = new Set<() => void>();

function read(): AppData {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? normalizeAppData(JSON.parse(raw) as unknown) : DEFAULT_DATA;
  } catch {
    cache = DEFAULT_DATA;
  }
  return cache;
}

/** Re-read before every mutation so another tab's newer fields are not lost. */
function readFresh(): AppData {
  if (typeof window === "undefined") return cache ?? DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? normalizeAppData(JSON.parse(raw) as unknown) : DEFAULT_DATA;
  } catch {
    cache ??= DEFAULT_DATA;
  }
  return cache;
}

function write(next: AppData): boolean {
  const safeNext = normalizeAppData(next);
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(safeNext));
    cache = safeNext;
  } catch (err) {
    console.error("Gagal menyimpan data:", err);
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** React hook: returns app data; `hydrated` is false during SSR / first paint. */
export function useAppData(): AppData & { hydrated: boolean } {
  const data = useSyncExternalStore(subscribe, read, () => DEFAULT_DATA);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return { ...data, hydrated };
}

export function getSession(id: string): SessionRecord | undefined {
  return read().sessions.find((s) => s.id === id);
}

export interface RecordLearningAttemptInput {
  lessonId: string;
  practiceResults: readonly PracticeProgressInput[];
  attemptedAt?: string;
}

export interface StoredLearningAttemptResult extends LessonAttemptResult {
  persisted: boolean;
}

function lockToken(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function parseLock(value: string | null): { token: string; expiresAt: number } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (
      !isRecord(parsed) ||
      typeof parsed.token !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      !Number.isFinite(parsed.expiresAt)
    ) {
      return null;
    }
    return { token: parsed.token, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

function lockDelay(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

async function withAppDataWriteLock<T>(operation: () => T): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request(`${KEY}:write`, operation);
  }
  if (typeof window === "undefined") return operation();

  const token = lockToken();
  const deadline = Date.now() + WRITE_LOCK_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const now = Date.now();
    const current = parseLock(window.localStorage.getItem(WRITE_LOCK_KEY));
    if (!current || current.expiresAt <= now) {
      window.localStorage.setItem(
        WRITE_LOCK_KEY,
        JSON.stringify({ token, expiresAt: now + WRITE_LOCK_LEASE_MS }),
      );
      await lockDelay(12 + Math.floor(Math.random() * 18));
      const confirmed = parseLock(window.localStorage.getItem(WRITE_LOCK_KEY));
      if (confirmed?.token === token) {
        try {
          return operation();
        } finally {
          if (parseLock(window.localStorage.getItem(WRITE_LOCK_KEY))?.token === token) {
            window.localStorage.removeItem(WRITE_LOCK_KEY);
          }
        }
      }
    }
    await lockDelay(18 + Math.floor(Math.random() * 32));
  }
  throw new Error("Penyimpanan sedang dipakai tab lain. Silakan coba lagi.");
}

export function updateProfile(patch: Partial<Profile>): Promise<boolean> {
  return withAppDataWriteLock(() => {
    const data = readFresh();
    return write({ ...data, profile: { ...data.profile, ...patch } });
  });
}

export function saveSession(session: SessionRecord): Promise<boolean> {
  return withAppDataWriteLock(() => {
    const data = readFresh();
    // Keep newest first; cap history to keep localStorage small.
    return write({
      ...data,
      sessions: [session, ...data.sessions.filter((item) => item.id !== session.id)].slice(
        0,
        MAX_SESSIONS,
      ),
    });
  });
}

function validateCatalogResults(
  input: RecordLearningAttemptInput,
  requireCompleteLesson: boolean,
): { catalogLesson: LearningCatalogLesson; results: PracticeProgressInput[] } {
  const catalogLesson = LEARNING_CATALOG_BY_LESSON.get(input.lessonId);
  if (!catalogLesson) {
    throw new Error("Lesson tidak ditemukan atau belum memiliki konten latihan.");
  }
  if (!Array.isArray(input.practiceResults) || input.practiceResults.length === 0) {
    throw new Error("Hasil latihan tidak boleh kosong.");
  }

  const expected = new Set(catalogLesson.practiceIds);
  const seen = new Set<string>();
  const results = input.practiceResults.map((result) => {
    if (
      typeof result.practiceId !== "string" ||
      !expected.has(result.practiceId) ||
      seen.has(result.practiceId)
    ) {
      throw new Error("Hasil latihan berisi ID yang asing atau duplikat.");
    }
    if (
      typeof result.score !== "number" ||
      !Number.isFinite(result.score) ||
      result.score < 0 ||
      result.score > 1
    ) {
      throw new Error("Skor latihan harus berada di antara 0 dan 1.");
    }
    seen.add(result.practiceId);
    return { practiceId: result.practiceId, score: result.score };
  });

  if (requireCompleteLesson && seen.size !== expected.size) {
    throw new Error("Penyelesaian lesson harus mencakup seluruh latihan.");
  }
  return { catalogLesson, results };
}

/** Records one complete lesson and grants its curriculum XP at most once. */
export async function recordLessonAttempt(
  input: RecordLearningAttemptInput,
): Promise<StoredLearningAttemptResult> {
  return withAppDataWriteLock(() => {
    const { catalogLesson, results } = validateCatalogResults(input, true);
    const data = readFresh();
    const outcome = applyLessonAttempt(data.learning, {
      lessonId: catalogLesson.lessonId,
      unitId: catalogLesson.unitId,
      level: catalogLesson.level,
      xp: catalogLesson.xp,
      practiceResults: results,
      ...(input.attemptedAt ? { attemptedAt: input.attemptedAt } : {}),
    });
    const persisted = write({ ...data, learning: outcome.progress });
    return { ...outcome, persisted };
  });
}

/** Records a known subset from an already-completed lesson without granting XP. */
export async function recordReviewAttempt(
  input: RecordLearningAttemptInput,
): Promise<StoredLearningAttemptResult> {
  return withAppDataWriteLock(() => {
    const { catalogLesson, results } = validateCatalogResults(input, false);
    const data = readFresh();
    const outcome = applyReviewAttempt(data.learning, {
      lessonId: catalogLesson.lessonId,
      unitId: catalogLesson.unitId,
      level: catalogLesson.level,
      practiceResults: results,
      ...(input.attemptedAt ? { attemptedAt: input.attemptedAt } : {}),
    });
    const persisted = write({ ...data, learning: outcome.progress });
    return { ...outcome, persisted };
  });
}

export function getLearningProgress(): LearningProgress {
  return read().learning;
}

export function getLessonProgress(lessonId: string) {
  return read().learning.lessons[lessonId];
}

export function resetAll(): Promise<boolean> {
  return withAppDataWriteLock(() =>
    write({
      profile: { ...DEFAULT_DATA.profile },
      sessions: [],
      learning: createEmptyLearningProgress(),
    }),
  );
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
