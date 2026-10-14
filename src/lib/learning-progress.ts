import type { FoundationLevel } from "./curriculum";

export const REVIEW_SCORE_THRESHOLD = 0.8;

const MAX_LESSON_RECORDS = 500;
const MAX_REVIEW_ITEMS = 1_000;
const MAX_ATTEMPTS = 100_000;
const MAX_XP_PER_LESSON = 100_000;
const DAY_MS = 24 * 60 * 60 * 1_000;

export interface PracticeProgressInput {
  practiceId: string;
  /** A normalized score from 0 to 1. */
  score: number;
}

/** Trusted metadata supplied by the storage adapter after a curriculum lookup. */
export interface LessonAttemptInput {
  lessonId: string;
  unitId: string;
  level: FoundationLevel;
  xp: number;
  practiceResults: readonly PracticeProgressInput[];
  attemptedAt?: string;
}

export interface ReviewAttemptInput {
  lessonId: string;
  unitId: string;
  level: FoundationLevel;
  practiceResults: readonly PracticeProgressInput[];
  attemptedAt?: string;
}

export interface LessonProgress {
  lessonId: string;
  unitId: string;
  level: FoundationLevel;
  attempts: number;
  completed: boolean;
  /** Best completed-session score from 0 to 1. */
  bestScore: number;
  /** Best score seen for each practice; used to calculate non-regressing mastery. */
  practiceScores: Record<string, number>;
  /** Average best practice score expressed as a percentage. */
  mastery: number;
  /** The one-time curriculum reward already granted for this lesson. */
  xpAwarded: number;
  firstCompletedAt: string | null;
  lastAttemptAt: string;
}

export interface ReviewItem {
  practiceId: string;
  lessonId: string;
  unitId: string;
  lastScore: number;
  attempts: number;
  dueAt: string;
  updatedAt: string;
}

export interface LearningProgress {
  totalXp: number;
  lessons: Record<string, LessonProgress>;
  reviewQueue: ReviewItem[];
}

export interface LearningCatalogLesson {
  lessonId: string;
  unitId: string;
  level: FoundationLevel;
  xp: number;
  practiceIds: readonly string[];
}

export interface LessonAttemptResult {
  progress: LearningProgress;
  lesson: LessonProgress;
  xpGained: number;
  addedReviewCount: number;
  resolvedReviewCount: number;
}

export interface UnitProgressSummary {
  unitId: string;
  totalLessons: number;
  completedLessons: number;
  /** Completed lessons divided by total lessons, from 0 to 1. */
  completion: number;
  /** Average lesson mastery, with unfinished lessons contributing zero. */
  mastery: number;
  totalXp: number;
}

export function createEmptyLearningProgress(): LearningProgress {
  return { totalXp: 0, lessons: {}, reviewQueue: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim();
  if (
    !id ||
    id.length > 128 ||
    id === "__proto__" ||
    id === "prototype" ||
    id === "constructor"
  ) {
    return null;
  }
  return id;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function clampScore(value: unknown): number | null {
  const number = finiteNumber(value);
  return number === null ? null : Math.min(1, Math.max(0, number));
}

function boundedInteger(value: unknown, maximum: number): number {
  const number = finiteNumber(value);
  return number === null
    ? 0
    : Math.min(maximum, Math.max(0, Math.floor(number)));
}

function timestamp(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  try {
    return new Date(parsed).toISOString();
  } catch {
    return null;
  }
}

function isFoundationLevel(value: unknown): value is FoundationLevel {
  return value === "A1" || value === "A2";
}

function totalAwardedXp(lessons: Record<string, LessonProgress>): number {
  return Object.values(lessons).reduce(
    (total, lesson) => total + lesson.xpAwarded,
    0,
  );
}

function compareReviewItems(a: ReviewItem, b: ReviewItem): number {
  return (
    Date.parse(a.dueAt) - Date.parse(b.dueAt) ||
    a.lastScore - b.lastScore ||
    Date.parse(a.updatedAt) - Date.parse(b.updatedAt) ||
    a.practiceId.localeCompare(b.practiceId)
  );
}

function catalogMap(
  catalog: readonly LearningCatalogLesson[] | undefined,
): Map<string, LearningCatalogLesson> | null {
  if (!catalog) return null;
  return new Map(catalog.map((lesson) => [lesson.lessonId, lesson]));
}

function normalizeLessonProgress(
  value: unknown,
  key: string,
  catalogLesson: LearningCatalogLesson | undefined,
): LessonProgress | null {
  if (!isRecord(value)) return null;
  const lessonId = safeId(value.lessonId) ?? safeId(key);
  if (!lessonId || (catalogLesson && lessonId !== catalogLesson.lessonId)) return null;

  const unitId = catalogLesson?.unitId ?? safeId(value.unitId);
  const level = catalogLesson?.level ?? value.level;
  const lastAttemptAt = timestamp(value.lastAttemptAt);
  if (!unitId || !isFoundationLevel(level) || !lastAttemptAt) return null;

  const bestScore = clampScore(value.bestScore) ?? 0;
  const practiceScores: Record<string, number> = {};
  const knownPracticeIds = catalogLesson
    ? new Set(catalogLesson.practiceIds)
    : null;
  if (isRecord(value.practiceScores)) {
    for (const [practiceKey, rawScore] of Object.entries(value.practiceScores)) {
      const practiceId = safeId(practiceKey);
      const practiceScore = clampScore(rawScore);
      if (
        !practiceId ||
        practiceScore === null ||
        (knownPracticeIds && !knownPracticeIds.has(practiceId))
      ) {
        continue;
      }
      practiceScores[practiceId] = practiceScore;
    }
  }
  const practiceScoreValues = catalogLesson
    ? catalogLesson.practiceIds.map((practiceId) => practiceScores[practiceId] ?? 0)
    : Object.values(practiceScores);
  const storedXp = boundedInteger(value.xpAwarded, MAX_XP_PER_LESSON);
  const storedFirstCompletedAt = timestamp(value.firstCompletedAt);
  const completed =
    value.completed === true || storedFirstCompletedAt !== null || storedXp > 0;
  const xpAwarded = completed
    ? catalogLesson
      ? Math.min(MAX_XP_PER_LESSON, Math.max(0, Math.floor(catalogLesson.xp)))
      : storedXp
    : 0;
  const firstCompletedAt = completed
    ? (storedFirstCompletedAt ?? lastAttemptAt)
    : null;

  return {
    lessonId,
    unitId,
    level,
    attempts: Math.max(completed ? 1 : 0, boundedInteger(value.attempts, MAX_ATTEMPTS)),
    completed,
    bestScore,
    practiceScores,
    mastery:
      practiceScoreValues.length === 0
        ? Math.round(bestScore * 100)
        : Math.round(
            (practiceScoreValues.reduce((total, score) => total + score, 0) /
              practiceScoreValues.length) *
              100,
          ),
    xpAwarded,
    firstCompletedAt,
    lastAttemptAt,
  };
}

function normalizeReviewItem(
  value: unknown,
  lessons: Record<string, LessonProgress>,
  catalog: Map<string, LearningCatalogLesson> | null,
): ReviewItem | null {
  if (!isRecord(value)) return null;
  const practiceId = safeId(value.practiceId);
  const lessonId = safeId(value.lessonId);
  const unitId = safeId(value.unitId);
  const lastScore = clampScore(value.lastScore);
  const dueAt = timestamp(value.dueAt);
  const updatedAt = timestamp(value.updatedAt);
  if (
    !practiceId ||
    !lessonId ||
    !unitId ||
    lastScore === null ||
    lastScore >= REVIEW_SCORE_THRESHOLD ||
    !dueAt ||
    !updatedAt ||
    !lessons[lessonId]?.completed ||
    lessons[lessonId].unitId !== unitId
  ) {
    return null;
  }

  const catalogLesson = catalog?.get(lessonId);
  if (catalog && (!catalogLesson || !catalogLesson.practiceIds.includes(practiceId))) {
    return null;
  }

  return {
    practiceId,
    lessonId,
    unitId,
    lastScore,
    attempts: Math.max(1, boundedInteger(value.attempts, MAX_ATTEMPTS)),
    dueAt,
    updatedAt,
  };
}

/**
 * Repairs persisted learning data. When a catalog is supplied, stale or forged
 * lesson/practice IDs are discarded and curriculum metadata wins over storage.
 */
export function normalizeLearningProgress(
  value: unknown,
  catalog?: readonly LearningCatalogLesson[],
): LearningProgress {
  if (!isRecord(value)) return createEmptyLearningProgress();
  const knownLessons = catalogMap(catalog);
  const lessons: Record<string, LessonProgress> = {};

  if (isRecord(value.lessons)) {
    for (const [key, candidate] of Object.entries(value.lessons).slice(0, MAX_LESSON_RECORDS)) {
      const keyId = safeId(key);
      if (!keyId) continue;
      const catalogLesson = knownLessons?.get(keyId);
      if (knownLessons && !catalogLesson) continue;
      const lesson = normalizeLessonProgress(candidate, keyId, catalogLesson);
      if (lesson) lessons[lesson.lessonId] = lesson;
    }
  }

  const reviewsByPractice = new Map<string, ReviewItem>();
  if (Array.isArray(value.reviewQueue)) {
    for (const candidate of value.reviewQueue.slice(0, MAX_REVIEW_ITEMS * 2)) {
      const item = normalizeReviewItem(candidate, lessons, knownLessons);
      if (!item) continue;
      const existing = reviewsByPractice.get(item.practiceId);
      if (!existing || Date.parse(item.updatedAt) > Date.parse(existing.updatedAt)) {
        reviewsByPractice.set(item.practiceId, item);
      }
    }
  }

  const reviewQueue = [...reviewsByPractice.values()]
    .sort(compareReviewItems)
    .slice(0, MAX_REVIEW_ITEMS);

  return {
    totalXp: totalAwardedXp(lessons),
    lessons,
    reviewQueue,
  };
}

function validateAttempt(input: LessonAttemptInput): {
  lessonId: string;
  unitId: string;
  attemptedAt: string;
  xp: number;
  results: PracticeProgressInput[];
} {
  const lessonId = safeId(input.lessonId);
  const unitId = safeId(input.unitId);
  if (!lessonId || !unitId || !isFoundationLevel(input.level)) {
    throw new Error("Metadata lesson tidak valid.");
  }
  if (!Array.isArray(input.practiceResults) || input.practiceResults.length === 0) {
    throw new Error("Hasil latihan tidak boleh kosong.");
  }

  const attemptedAt = input.attemptedAt
    ? timestamp(input.attemptedAt)
    : new Date().toISOString();
  if (!attemptedAt) throw new Error("Waktu latihan tidak valid.");

  const seen = new Set<string>();
  const results = input.practiceResults.map((result) => {
    const practiceId = safeId(result.practiceId);
    if (!practiceId || seen.has(practiceId)) {
      throw new Error("ID hasil latihan harus valid dan unik.");
    }
    if (
      typeof result.score !== "number" ||
      !Number.isFinite(result.score) ||
      result.score < 0 ||
      result.score > 1
    ) {
      throw new Error("Skor latihan harus berada di antara 0 dan 1.");
    }
    seen.add(practiceId);
    return { practiceId, score: result.score };
  });

  return {
    lessonId,
    unitId,
    attemptedAt,
    xp: Math.min(MAX_XP_PER_LESSON, Math.max(0, Math.floor(input.xp))),
    results,
  };
}

function mergeBestPracticeScores(
  current: Record<string, number> | undefined,
  results: readonly PracticeProgressInput[],
): Record<string, number> {
  const next = { ...(current ?? {}) };
  for (const result of results) {
    next[result.practiceId] = Math.max(next[result.practiceId] ?? 0, result.score);
  }
  return next;
}

function masteryForPracticeScores(scores: Record<string, number>): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return Math.round(
    (values.reduce((total, score) => total + score, 0) / values.length) * 100,
  );
}

function updateReviewQueue(
  queue: readonly ReviewItem[],
  results: readonly PracticeProgressInput[],
  metadata: { lessonId: string; unitId: string; attemptedAt: string },
): {
  reviewQueue: ReviewItem[];
  addedReviewCount: number;
  resolvedReviewCount: number;
} {
  const reviews = new Map(queue.map((item) => [item.practiceId, item]));
  let addedReviewCount = 0;
  let resolvedReviewCount = 0;

  for (const result of results) {
    const existing = reviews.get(result.practiceId);
    if (result.score >= REVIEW_SCORE_THRESHOLD) {
      if (existing) {
        reviews.delete(result.practiceId);
        resolvedReviewCount += 1;
      }
      continue;
    }

    if (!existing) addedReviewCount += 1;
    const dueAtMs =
      Date.parse(metadata.attemptedAt) + (result.score < 0.5 ? 0 : DAY_MS);
    reviews.set(result.practiceId, {
      practiceId: result.practiceId,
      lessonId: metadata.lessonId,
      unitId: metadata.unitId,
      lastScore: result.score,
      attempts: Math.min(MAX_ATTEMPTS, (existing?.attempts ?? 0) + 1),
      dueAt: new Date(dueAtMs).toISOString(),
      updatedAt: metadata.attemptedAt,
    });
  }

  return {
    reviewQueue: [...reviews.values()]
      .sort(compareReviewItems)
      .slice(0, MAX_REVIEW_ITEMS),
    addedReviewCount,
    resolvedReviewCount,
  };
}

/** Pure reducer for a fully completed lesson attempt. */
export function applyLessonAttempt(
  current: LearningProgress,
  input: LessonAttemptInput,
): LessonAttemptResult {
  const valid = validateAttempt(input);
  const safeCurrent = normalizeLearningProgress(current);
  const existingLesson = safeCurrent.lessons[valid.lessonId];
  const score =
    valid.results.reduce((total, result) => total + result.score, 0) /
    valid.results.length;
  const bestScore = Math.max(existingLesson?.bestScore ?? 0, score);
  const practiceScores = mergeBestPracticeScores(
    existingLesson?.practiceScores,
    valid.results,
  );
  const firstCompletion = !existingLesson?.completed;
  const xpGained = firstCompletion ? valid.xp : 0;
  const lesson: LessonProgress = {
    lessonId: valid.lessonId,
    unitId: valid.unitId,
    level: input.level,
    attempts: Math.min(MAX_ATTEMPTS, (existingLesson?.attempts ?? 0) + 1),
    completed: true,
    bestScore,
    practiceScores,
    mastery: masteryForPracticeScores(practiceScores),
    xpAwarded: (existingLesson?.xpAwarded ?? 0) + xpGained,
    firstCompletedAt: existingLesson?.firstCompletedAt ?? valid.attemptedAt,
    lastAttemptAt: valid.attemptedAt,
  };

  const reviewUpdate = updateReviewQueue(safeCurrent.reviewQueue, valid.results, {
    lessonId: valid.lessonId,
    unitId: valid.unitId,
    attemptedAt: valid.attemptedAt,
  });

  const lessons = { ...safeCurrent.lessons, [valid.lessonId]: lesson };
  const progress: LearningProgress = {
    totalXp: totalAwardedXp(lessons),
    lessons,
    reviewQueue: reviewUpdate.reviewQueue,
  };

  return {
    progress,
    lesson,
    xpGained,
    addedReviewCount: reviewUpdate.addedReviewCount,
    resolvedReviewCount: reviewUpdate.resolvedReviewCount,
  };
}

/**
 * Applies a subset review to an already completed lesson. It never grants XP
 * or increments the count of full lesson attempts.
 */
export function applyReviewAttempt(
  current: LearningProgress,
  input: ReviewAttemptInput,
): LessonAttemptResult {
  const valid = validateAttempt({ ...input, xp: 0 });
  const safeCurrent = normalizeLearningProgress(current);
  const existingLesson = safeCurrent.lessons[valid.lessonId];
  if (!existingLesson?.completed) {
    throw new Error("Lesson harus diselesaikan sebelum latihan review.");
  }

  const practiceScores = mergeBestPracticeScores(
    existingLesson.practiceScores,
    valid.results,
  );
  const lesson: LessonProgress = {
    ...existingLesson,
    unitId: valid.unitId,
    level: input.level,
    practiceScores,
    mastery: masteryForPracticeScores(practiceScores),
    lastAttemptAt: valid.attemptedAt,
  };
  const reviewUpdate = updateReviewQueue(safeCurrent.reviewQueue, valid.results, {
    lessonId: valid.lessonId,
    unitId: valid.unitId,
    attemptedAt: valid.attemptedAt,
  });
  const lessons = { ...safeCurrent.lessons, [valid.lessonId]: lesson };
  const progress: LearningProgress = {
    totalXp: totalAwardedXp(lessons),
    lessons,
    reviewQueue: reviewUpdate.reviewQueue,
  };

  return {
    progress,
    lesson,
    xpGained: 0,
    addedReviewCount: reviewUpdate.addedReviewCount,
    resolvedReviewCount: reviewUpdate.resolvedReviewCount,
  };
}

export function summarizeUnitProgress(
  progress: LearningProgress,
  unitId: string,
  lessonIds: readonly string[],
): UnitProgressSummary {
  const uniqueLessonIds = [...new Set(lessonIds)];
  const lessons = uniqueLessonIds
    .map((lessonId) => progress.lessons[lessonId])
    .filter((lesson): lesson is LessonProgress => lesson?.unitId === unitId);
  const totalLessons = uniqueLessonIds.length;
  const completedLessons = lessons.filter((lesson) => lesson.completed).length;

  return {
    unitId,
    totalLessons,
    completedLessons,
    completion: totalLessons === 0 ? 0 : completedLessons / totalLessons,
    mastery:
      totalLessons === 0
        ? 0
        : Math.round(
            lessons.reduce((total, lesson) => total + lesson.mastery, 0) /
              totalLessons,
          ),
    totalXp: lessons.reduce((total, lesson) => total + lesson.xpAwarded, 0),
  };
}

export function getDueReviewItems(
  progress: LearningProgress,
  now: string | Date = new Date(),
): ReviewItem[] {
  const nowMs = now instanceof Date ? now.getTime() : Date.parse(now);
  if (!Number.isFinite(nowMs)) return [];
  return progress.reviewQueue.filter((item) => Date.parse(item.dueAt) <= nowMs);
}
