import type { LessonPractice } from "./course-content/types";

export type PracticeResponse =
  | { type: "multiple-choice"; answer: string }
  | {
      type: "vocabulary-match";
      /** Selected meaning, keyed by the source pair ID. */
      matches: Readonly<Record<string, string>>;
    }
  | { type: "word-order"; words: readonly string[] }
  | { type: "verb-fill"; answer: string }
  | {
      type: "listen-speak";
      /** Selected option for listening, or the captured transcript for speaking. */
      answer: string;
    };

export interface PracticeResult {
  /** A normalized score from 0 to 1. */
  score: number;
  correct: boolean;
  feedback: string;
  expectedAnswer?: string;
}

const LISTEN_REPEAT_THRESHOLD = 0.75;

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Normalize user-entered English without changing its word order or meaning.
 * Case, accents, surrounding punctuation, and repeated whitespace are ignored.
 */
export function normalizeAnswer(value: string): string {
  return value
    .replace(/[\u2018\u2019\u02bc\uff07]/g, "'")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CONTRACTIONS: Readonly<Record<string, string>> = {
  "i'm": "i am",
  "you're": "you are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "we're": "we are",
  "they're": "they are",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "can't": "can not",
  "cannot": "can not",
  "won't": "will not",
  "wouldn't": "would not",
  "i've": "i have",
  "you've": "you have",
  "we've": "we have",
  "they've": "they have",
};

function normalizedWords(value: string): string[] {
  const normalized = normalizeAnswer(value);
  if (!normalized) return [];

  return normalized
    .split(" ")
    .flatMap((word) => (CONTRACTIONS[word] ?? word).split(" "));
}

function characterSimilarity(left: string, right: string): number {
  if (left === right) return 1;
  if (!left || !right) return 0;

  const source = [...left];
  const target = [...right];
  let previous = Array.from({ length: target.length + 1 }, (_, index) => index);

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    const current = [sourceIndex];

    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitutionCost =
        source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;
      current[targetIndex] = Math.min(
        previous[targetIndex] + 1,
        current[targetIndex - 1] + 1,
        previous[targetIndex - 1] + substitutionCost,
      );
    }

    previous = current;
  }

  return clampScore(1 - previous[target.length] / Math.max(source.length, target.length));
}

/**
 * Compare two phrases with a word-level edit distance. Similar spelling within
 * a substituted word receives partial credit, while missing/extra words still
 * count as insertions or deletions.
 */
export function wordSimilarity(expected: string, actual: string): number {
  const expectedWords = normalizedWords(expected);
  const actualWords = normalizedWords(actual);

  if (expectedWords.length === 0 && actualWords.length === 0) return 1;
  if (expectedWords.length === 0 || actualWords.length === 0) return 0;

  let previous = Array.from(
    { length: actualWords.length + 1 },
    (_, index) => index,
  );

  for (
    let expectedIndex = 1;
    expectedIndex <= expectedWords.length;
    expectedIndex += 1
  ) {
    const current = [expectedIndex];

    for (
      let actualIndex = 1;
      actualIndex <= actualWords.length;
      actualIndex += 1
    ) {
      const substitutionCost =
        1 -
        characterSimilarity(
          expectedWords[expectedIndex - 1],
          actualWords[actualIndex - 1],
        );
      current[actualIndex] = Math.min(
        previous[actualIndex] + 1,
        current[actualIndex - 1] + 1,
        previous[actualIndex - 1] + substitutionCost,
      );
    }

    previous = current;
  }

  const distance = previous[actualWords.length];
  return clampScore(
    1 - distance / Math.max(expectedWords.length, actualWords.length),
  );
}

function hashSeed(seed: number | string): number {
  const source = String(seed);
  let hash = 2_166_136_261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

/** Deterministic Fisher-Yates shuffle that always leaves the input untouched. */
export function seededShuffle<T>(
  items: readonly T[],
  seed: number | string,
): T[] {
  const shuffled = [...items];
  let state = hashSeed(seed);

  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function invalidResponse(): PracticeResult {
  return {
    score: 0,
    correct: false,
    feedback: "Jenis atau isi jawaban tidak sesuai dengan latihan ini.",
  };
}

function exactResult(
  submitted: string,
  expected: string,
  successFeedback: string,
  retryFeedback: string,
): PracticeResult {
  const correct = normalizeAnswer(submitted) === normalizeAnswer(expected);

  return {
    score: correct ? 1 : 0,
    correct,
    feedback: correct ? successFeedback : retryFeedback,
    expectedAnswer: expected,
  };
}

function isStringRecord(value: unknown): value is Readonly<Record<string, string>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
}

function responseIsObject(response: PracticeResponse): boolean {
  return typeof response === "object" && response !== null;
}

/** Score one response without mutating either the exercise or response data. */
export function scorePractice(
  practice: LessonPractice,
  response: PracticeResponse,
): PracticeResult {
  if (!responseIsObject(response) || practice.type !== response.type) {
    return invalidResponse();
  }

  switch (practice.type) {
    case "multiple-choice": {
      if (response.type !== "multiple-choice" || typeof response.answer !== "string") {
        return invalidResponse();
      }

      return exactResult(
        response.answer,
        practice.answer,
        "Benar! Kamu memilih jawaban yang tepat.",
        "Belum tepat. Periksa lagi informasi pada soal.",
      );
    }

    case "vocabulary-match": {
      if (
        response.type !== "vocabulary-match" ||
        !isStringRecord(response.matches) ||
        practice.pairs.length === 0
      ) {
        return invalidResponse();
      }

      const correctCount = practice.pairs.reduce((total, pair) => {
        const selected = response.matches[pair.id];
        return total +
          (typeof selected === "string" &&
          normalizeAnswer(selected) === normalizeAnswer(pair.match)
            ? 1
            : 0);
      }, 0);
      const score = clampScore(correctCount / practice.pairs.length);
      const correct = correctCount === practice.pairs.length;

      return {
        score,
        correct,
        feedback: correct
          ? "Semua pasangan benar!"
          : `${correctCount} dari ${practice.pairs.length} pasangan sudah benar.`,
        expectedAnswer: practice.pairs
          .map((pair) => `${pair.term} = ${pair.match}`)
          .join("; "),
      };
    }

    case "word-order": {
      if (
        response.type !== "word-order" ||
        !Array.isArray(response.words) ||
        !response.words.every((word) => typeof word === "string")
      ) {
        return invalidResponse();
      }

      return exactResult(
        response.words.join(" "),
        practice.answer,
        "Urutannya benar!",
        "Urutannya belum tepat. Perhatikan posisi subject dan kata kerja.",
      );
    }

    case "verb-fill": {
      if (response.type !== "verb-fill" || typeof response.answer !== "string") {
        return invalidResponse();
      }

      const acceptedAnswers = [
        practice.answer,
        ...(practice.acceptedAnswers ?? []),
      ];
      const normalizedResponse = normalizeAnswer(response.answer);
      const correct = acceptedAnswers.some(
        (answer) => normalizeAnswer(answer) === normalizedResponse,
      );

      return {
        score: correct ? 1 : 0,
        correct,
        feedback: correct
          ? "Benar! Bentuk verb-nya sesuai."
          : practice.explanation,
        expectedAnswer: practice.answer,
      };
    }

    case "listen-speak": {
      if (response.type !== "listen-speak" || typeof response.answer !== "string") {
        return invalidResponse();
      }

      if (practice.mode === "listen-and-choose") {
        return exactResult(
          response.answer,
          practice.answer,
          "Benar! Kamu menangkap informasi utamanya.",
          "Belum tepat. Dengarkan kembali kata kuncinya.",
        );
      }

      if (practice.mode === "listen-and-repeat") {
        const expected = practice.modelAnswer ?? practice.audioText;
        const score = wordSimilarity(expected, response.answer);
        const correct = score >= LISTEN_REPEAT_THRESHOLD;

        return {
          score,
          correct,
          feedback: correct
            ? "Bagus! Transkrip jawabanmu sudah cukup dekat dengan kalimat contoh."
            : "Coba lagi dan pertahankan semua kata penting dari kalimat contoh.",
          expectedAnswer: expected,
        };
      }

      const submittedWordCount = normalizedWords(response.answer).length;
      const modelWordCount = normalizedWords(practice.modelAnswer).length;
      const minimumWordCount = Math.min(
        Math.max(1, modelWordCount),
        Math.max(5, Math.min(12, Math.ceil(modelWordCount * 0.4))),
      );
      const score = clampScore(submittedWordCount / minimumWordCount);
      const correct = submittedWordCount >= minimumWordCount;

      return {
        score,
        correct,
        feedback: correct
          ? `Jawaban terekam (${submittedWordCount} kata). Skor ini hanya menilai kelengkapan minimum, bukan grammar atau pengucapan.`
          : `Tambahkan sedikit detail lagi (${submittedWordCount}/${minimumWordCount} kata minimum). Grammar dan pengucapan belum dinilai otomatis.`,
        expectedAnswer: practice.modelAnswer,
      };
    }
  }
}
