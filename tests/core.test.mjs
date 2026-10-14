import assert from "node:assert/strict";
import test from "node:test";

import {
  CEFR_LEVELS,
  bandToCefr,
  formatBand,
  getLevelSuggestion,
  levelIndex,
  nextLevel,
  prevLevel,
} from "../src/lib/levels.ts";
import {
  INPUT_SAMPLE_RATE,
  OUTPUT_SAMPLE_RATE,
  base64ToBytes,
  bytesToBase64,
  pcmChunksToWavBase64,
} from "../src/lib/audio.ts";
import {
  FOUNDATION_UNITS,
  LESSON_KIND_LABELS,
} from "../src/lib/curriculum.ts";
import { DAILY_ROUTINE_CONTENT } from "../src/lib/course-content/daily-routine.ts";
import { INTRODUCE_YOURSELF_CONTENT } from "../src/lib/course-content/introduce-yourself.ts";
import { PAST_ACTIVITIES_CONTENT } from "../src/lib/course-content/past-activities.ts";
import { PRACTICE_TYPES } from "../src/lib/course-content/types.ts";
import {
  normalizeAnswer,
  scorePractice,
  seededShuffle,
  wordSimilarity,
} from "../src/lib/practice-engine.ts";
import {
  applyLessonAttempt,
  applyReviewAttempt,
  createEmptyLearningProgress,
  getDueReviewItems,
  normalizeLearningProgress,
  summarizeUnitProgress,
} from "../src/lib/learning-progress.ts";
import {
  SPEAKING_MISSIONS,
  getAllSpeakingMissions,
  getSpeakingMission,
} from "../src/lib/speaking-missions.ts";
import { MODE_LABELS } from "../src/lib/types.ts";

const FOUNDATION_CONTENT = [
  INTRODUCE_YOURSELF_CONTENT,
  DAILY_ROUTINE_CONTENT,
  PAST_ACTIVITIES_CONTENT,
];

test("CEFR navigation follows the declared level order", () => {
  assert.deepEqual(CEFR_LEVELS, ["A1", "A2", "B1", "B2", "C1", "C2"]);
  assert.equal(levelIndex("B2"), 3);
  assert.equal(nextLevel("A1"), "A2");
  assert.equal(nextLevel("C2"), null);
  assert.equal(prevLevel("C2"), "C1");
  assert.equal(prevLevel("A1"), null);
});

test("TOEFL bands map to CEFR levels at every boundary", () => {
  const cases = [
    [-2, "A1"],
    [1.999, "A1"],
    [2, "A2"],
    [2.999, "A2"],
    [3, "B1"],
    [3.999, "B1"],
    [4, "B2"],
    [4.999, "B2"],
    [5, "C1"],
    [5.999, "C1"],
    [6, "C2"],
    [8, "C2"],
  ];

  for (const [band, expected] of cases) {
    assert.equal(bandToCefr(band), expected, `band ${band}`);
  }
});

test("band formatting rounds to the nearest half point", () => {
  assert.equal(formatBand(1), "1.0");
  assert.equal(formatBand(3.24), "3.0");
  assert.equal(formatBand(3.25), "3.5");
  assert.equal(formatBand(5.76), "6.0");
});

test("level suggestions require three evaluated sessions", () => {
  assert.equal(getLevelSuggestion("B1", [4, 4]), null);
});

test("level suggestions move up when the recent average reaches the next band", () => {
  assert.deepEqual(getLevelSuggestion("B1", [4, 4.5, 3.5]), {
    direction: "up",
    to: "B2",
    averageBand: 4,
    basedOn: 3,
  });
});

test("level suggestions use at most the five most recent bands", () => {
  assert.deepEqual(getLevelSuggestion("B2", [5, 5, 5, 5, 5, 1]), {
    direction: "up",
    to: "C1",
    averageBand: 5,
    basedOn: 5,
  });
});

test("level suggestions move down only when clearly below the current band", () => {
  assert.deepEqual(getLevelSuggestion("B2", [3, 3, 3]), {
    direction: "down",
    to: "B1",
    averageBand: 3,
    basedOn: 3,
  });
  assert.equal(getLevelSuggestion("B2", [3.5, 3.5, 3.5]), null);
  assert.equal(getLevelSuggestion("A1", [0, 0, 0]), null);
  assert.equal(getLevelSuggestion("C2", [6, 6, 6]), null);
});

test("base64 helpers preserve arbitrary bytes, including chunked input", () => {
  const bytes = Uint8Array.from({ length: 65_537 }, (_, index) => index % 256);
  const encoded = bytesToBase64(bytes);
  assert.deepEqual(base64ToBytes(encoded), bytes);
  assert.equal(bytesToBase64(new Uint8Array()), "");
});

test("PCM chunks are encoded as a valid mono 16-bit WAV", () => {
  const chunks = [
    new Int16Array([-32_768, -1, 0]),
    new Int16Array([1, 32_767]),
  ];
  const bytes = base64ToBytes(pcmChunksToWavBase64(chunks));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (offset, length) =>
    String.fromCharCode(...bytes.subarray(offset, offset + length));

  assert.equal(ascii(0, 4), "RIFF");
  assert.equal(view.getUint32(4, true), 46);
  assert.equal(ascii(8, 4), "WAVE");
  assert.equal(ascii(12, 4), "fmt ");
  assert.equal(view.getUint32(16, true), 16);
  assert.equal(view.getUint16(20, true), 1);
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), INPUT_SAMPLE_RATE);
  assert.equal(view.getUint32(28, true), INPUT_SAMPLE_RATE * 2);
  assert.equal(view.getUint16(32, true), 2);
  assert.equal(view.getUint16(34, true), 16);
  assert.equal(ascii(36, 4), "data");
  assert.equal(view.getUint32(40, true), 10);
  assert.equal(bytes.byteLength, 54);
  assert.deepEqual(
    Array.from({ length: 5 }, (_, index) => view.getInt16(44 + index * 2, true)),
    [-32_768, -1, 0, 1, 32_767],
  );
});

test("WAV encoding supports an explicit sample rate and empty PCM", () => {
  const customRate = 8_000;
  const custom = base64ToBytes(
    pcmChunksToWavBase64([new Int16Array([123])], customRate),
  );
  const customView = new DataView(custom.buffer, custom.byteOffset, custom.byteLength);
  assert.equal(customView.getUint32(24, true), customRate);
  assert.equal(customView.getUint32(28, true), customRate * 2);

  const empty = base64ToBytes(pcmChunksToWavBase64([]));
  const emptyView = new DataView(empty.buffer, empty.byteOffset, empty.byteLength);
  assert.equal(empty.byteLength, 44);
  assert.equal(emptyView.getUint32(40, true), 0);
  assert.equal(OUTPUT_SAMPLE_RATE, 24_000);
});

test("foundation curriculum provides an ordered four-unit path for A1 and A2", () => {
  assert.equal(FOUNDATION_UNITS.length, 8);

  for (const level of ["A1", "A2"]) {
    const units = FOUNDATION_UNITS.filter((unit) => unit.level === level);
    assert.equal(units.length, 4, level);
    assert.deepEqual(units.map((unit) => unit.order), [1, 2, 3, 4]);
  }

  assert.deepEqual(
    FOUNDATION_UNITS.filter((unit) => unit.level === "A1")
      .slice(0, 3)
      .map((unit) => unit.title),
    ["Introduce Yourself", "Daily Routine", "Past Activities"],
  );
});

test("foundation curriculum IDs are unique and every unit has a valid lesson preview", () => {
  const unitIds = FOUNDATION_UNITS.map((unit) => unit.id);
  const lessons = FOUNDATION_UNITS.flatMap((unit) => unit.lessons);
  const lessonIds = lessons.map((lesson) => lesson.id);

  assert.equal(new Set(unitIds).size, unitIds.length);
  assert.equal(new Set(lessonIds).size, lessonIds.length);
  assert.equal(Object.keys(LESSON_KIND_LABELS).length, 6);

  for (const unit of FOUNDATION_UNITS) {
    assert.ok(unit.lessons.length >= 5 && unit.lessons.length <= 6, unit.id);
    assert.ok(unit.vocabularyFocus.length > 0, unit.id);
    assert.ok(unit.grammarFocus.length > 0, unit.id);
    assert.equal(unit.lessons.at(-1)?.kind, "checkpoint", unit.id);

    for (const lesson of unit.lessons) {
      assert.ok(lesson.durationMin > 0, lesson.id);
      assert.ok(lesson.xp > 0, lesson.id);
      assert.ok(LESSON_KIND_LABELS[lesson.kind], lesson.id);
    }
  }
});

test("the first three curriculum units have complete lesson content", () => {
  const expectedUnits = FOUNDATION_UNITS.filter((unit) => unit.level === "A1").slice(0, 3);

  assert.deepEqual(
    FOUNDATION_CONTENT.map((unit) => unit.unitId),
    expectedUnits.map((unit) => unit.id),
  );

  for (const [index, content] of FOUNDATION_CONTENT.entries()) {
    assert.deepEqual(
      content.lessons.map((lesson) => lesson.lessonId),
      expectedUnits[index].lessons.map((lesson) => lesson.id),
      content.unitId,
    );
    assert.ok(content.outcomes.length >= 3, content.unitId);

    for (const lesson of content.lessons) {
      assert.ok(lesson.objective.length > 0, lesson.lessonId);
      assert.ok(lesson.warmup.length > 0, lesson.lessonId);
      assert.ok(lesson.vocabulary.length >= 4, lesson.lessonId);
      assert.ok(lesson.teachingPoints.length >= 2, lesson.lessonId);
      assert.ok(lesson.practice.length >= 2 && lesson.practice.length <= 4, lesson.lessonId);
      assert.ok(lesson.recap.length >= 2, lesson.lessonId);
      assert.ok(lesson.coachTip.length > 0, lesson.lessonId);
    }
  }
});

test("lesson practice seeds cover all engine types and keep answers internally valid", () => {
  const practices = FOUNDATION_CONTENT.flatMap((unit) =>
    unit.lessons.flatMap((lesson) => lesson.practice),
  );
  const practiceIds = practices.map((practice) => practice.id);

  assert.equal(new Set(practiceIds).size, practiceIds.length);
  assert.deepEqual(
    [...new Set(practices.map((practice) => practice.type))].sort(),
    [...PRACTICE_TYPES].sort(),
  );

  for (const unit of FOUNDATION_CONTENT) {
    const unitTypes = new Set(
      unit.lessons.flatMap((lesson) => lesson.practice.map((practice) => practice.type)),
    );
    assert.deepEqual([...unitTypes].sort(), [...PRACTICE_TYPES].sort(), unit.unitId);
  }

  const normalizedTokens = (values) =>
    values
      .flatMap((value) => value.toLocaleLowerCase("en").match(/[a-z0-9']+/g) ?? [])
      .sort();

  for (const practice of practices) {
    switch (practice.type) {
      case "multiple-choice":
        assert.ok(practice.options.includes(practice.answer), practice.id);
        assert.equal(new Set(practice.options).size, practice.options.length, practice.id);
        break;
      case "vocabulary-match":
        assert.ok(practice.pairs.length >= 2, practice.id);
        assert.equal(
          new Set(practice.pairs.map((pair) => pair.id)).size,
          practice.pairs.length,
          practice.id,
        );
        break;
      case "word-order":
        assert.deepEqual(
          normalizedTokens(practice.words),
          normalizedTokens([practice.answer]),
          practice.id,
        );
        break;
      case "verb-fill":
        assert.ok(practice.sentence.includes("___"), practice.id);
        assert.ok(practice.answer.length > 0, practice.id);
        break;
      case "listen-speak":
        assert.ok(practice.audioText.length > 0, practice.id);
        if (practice.mode === "listen-and-choose") {
          assert.ok(practice.options?.includes(practice.answer), practice.id);
        }
        break;
    }
  }
});

test("practice answers normalize case, accents, punctuation, and whitespace", () => {
  assert.equal(normalizeAnswer("  CAFÉ,   please!  "), "cafe please");
  assert.equal(normalizeAnswer("I’m from Bali."), "i'm from bali");
  assert.equal(normalizeAnswer("Are-you ready?"), "are you ready");
});

test("seeded shuffle is deterministic and never mutates its input", () => {
  const input = Object.freeze(["one", "two", "three", "four", "five", "six"]);
  const original = [...input];
  const first = seededShuffle(input, "a1-u1-greetings");
  const second = seededShuffle(input, "a1-u1-greetings");

  assert.deepEqual(first, second);
  assert.deepEqual(input, original);
  assert.notStrictEqual(first, input);
  assert.deepEqual([...first].sort(), [...input].sort());
});

test("practice scoring safely rejects a mismatched response type", () => {
  const practice = {
    id: "test-choice-mismatch",
    type: "multiple-choice",
    instruction: "Pilih jawaban.",
    prompt: "Choose yes.",
    options: ["Yes", "No"],
    answer: "Yes",
    explanation: "Yes adalah jawaban yang benar.",
  };

  const result = scorePractice(practice, {
    type: "verb-fill",
    answer: "Yes",
  });

  assert.equal(result.score, 0);
  assert.equal(result.correct, false);
  assert.ok(result.feedback.length > 0);
});

test("multiple-choice scoring uses normalized exact answers", () => {
  const practice = {
    id: "test-choice",
    type: "multiple-choice",
    instruction: "Pilih jawaban.",
    prompt: "Choose the greeting.",
    options: ["Nice to meet you.", "Good night."],
    answer: "Nice to meet you.",
    explanation: "Gunakan sapaan yang sesuai.",
  };

  const correct = scorePractice(practice, {
    type: "multiple-choice",
    answer: "  NICE to meet you! ",
  });
  const incorrect = scorePractice(practice, {
    type: "multiple-choice",
    answer: "Good night.",
  });

  assert.equal(correct.score, 1);
  assert.equal(correct.correct, true);
  assert.equal(incorrect.score, 0);
  assert.equal(incorrect.correct, false);
  assert.equal(incorrect.expectedAnswer, practice.answer);
});

test("vocabulary matching awards partial credit by pair ID", () => {
  const practice = {
    id: "test-match",
    type: "vocabulary-match",
    instruction: "Pasangkan kata.",
    pairs: [
      { id: "wake", term: "wake up", match: "bangun tidur" },
      { id: "eat", term: "have breakfast", match: "sarapan" },
      { id: "sleep", term: "go to bed", match: "pergi tidur" },
    ],
  };

  const partial = scorePractice(practice, {
    type: "vocabulary-match",
    matches: {
      wake: "Bangun tidur!",
      eat: "makan malam",
      sleep: "pergi tidur",
      ignored: "nilai tambahan",
    },
  });
  const complete = scorePractice(practice, {
    type: "vocabulary-match",
    matches: {
      wake: "bangun tidur",
      eat: "sarapan",
      sleep: "pergi tidur",
    },
  });

  assert.equal(partial.score, 2 / 3);
  assert.equal(partial.correct, false);
  assert.equal(complete.score, 1);
  assert.equal(complete.correct, true);
});

test("word-order scoring requires the normalized exact sequence", () => {
  const practice = {
    id: "test-word-order",
    type: "word-order",
    instruction: "Susun kata.",
    prompt: "Perkenalkan nama.",
    words: ["Ayu.", "is", "name", "My"],
    answer: "My name is Ayu.",
    translation: "Nama saya Ayu.",
  };

  const correct = scorePractice(practice, {
    type: "word-order",
    words: ["My", "name", "is", "Ayu!"],
  });
  const incorrect = scorePractice(practice, {
    type: "word-order",
    words: ["Ayu", "is", "my", "name"],
  });

  assert.equal(correct.score, 1);
  assert.equal(correct.correct, true);
  assert.equal(incorrect.score, 0);
  assert.equal(incorrect.correct, false);
});

test("verb-fill scoring accepts the canonical and configured alternate answers", () => {
  const practice = {
    id: "test-verb",
    type: "verb-fill",
    instruction: "Isi verb.",
    sentence: "I ___ from Bandung.",
    baseVerb: "be",
    answer: "am",
    acceptedAnswers: ["'m"],
    translation: "Saya dari Bandung.",
    explanation: "Subject I memakai am.",
  };

  assert.equal(
    scorePractice(practice, { type: "verb-fill", answer: "AM!" }).correct,
    true,
  );
  assert.equal(
    scorePractice(practice, { type: "verb-fill", answer: "'m" }).correct,
    true,
  );
  assert.equal(
    scorePractice(practice, { type: "verb-fill", answer: "is" }).correct,
    false,
  );
});

test("listen-and-choose scoring uses the same normalized exact comparison", () => {
  const practice = {
    id: "test-listen-choice",
    type: "listen-speak",
    mode: "listen-and-choose",
    instruction: "Dengarkan dan pilih.",
    audioText: "I'm from Japan.",
    prompt: "Dari mana pembicara berasal?",
    options: ["Japan", "Korea"],
    answer: "Japan",
  };

  assert.equal(
    scorePractice(practice, { type: "listen-speak", answer: " japan. " }).score,
    1,
  );
  assert.equal(
    scorePractice(practice, { type: "listen-speak", answer: "Korea" }).score,
    0,
  );
});

test("listen-and-repeat uses token edit similarity with a 0.75 pass threshold", () => {
  const practice = {
    id: "test-repeat",
    type: "listen-speak",
    mode: "listen-and-repeat",
    instruction: "Dengarkan dan ulangi.",
    audioText: "I am from Bali.",
    prompt: "Ulangi kalimat.",
  };

  assert.equal(wordSimilarity("I'm from Bali.", "I am from Bali"), 1);

  const atThreshold = scorePractice(practice, {
    type: "listen-speak",
    answer: "I am Bali.",
  });
  const belowThreshold = scorePractice(practice, {
    type: "listen-speak",
    answer: "Bali.",
  });

  assert.equal(atThreshold.score, 0.75);
  assert.equal(atThreshold.correct, true);
  assert.ok(belowThreshold.score < 0.75);
  assert.equal(belowThreshold.correct, false);
  assert.equal(atThreshold.expectedAnswer, practice.audioText);
});

test("guided speaking scores minimum completion without claiming language accuracy", () => {
  const practice = {
    id: "test-guided",
    type: "listen-speak",
    mode: "guided-speaking",
    instruction: "Perkenalkan dirimu.",
    audioText: "Hi, I'm Rina. I'm from Bali and I like music.",
    prompt: "Sebutkan nama, asal, dan hobi.",
    modelAnswer: "Hi, I'm Rina. I'm from Bali and I like music.",
  };

  const complete = scorePractice(practice, {
    type: "listen-speak",
    answer: "Hello I am Dita from Jakarta",
  });
  const tooShort = scorePractice(practice, {
    type: "listen-speak",
    answer: "Hello I am Dita",
  });

  assert.equal(complete.score, 1);
  assert.equal(complete.correct, true);
  assert.match(complete.feedback, /bukan grammar atau pengucapan/i);
  assert.equal(complete.expectedAnswer, practice.modelAnswer);
  assert.ok(tooShort.score > 0 && tooShort.score < 1);
  assert.equal(tooShort.correct, false);
  assert.match(tooShort.feedback, /belum dinilai otomatis/i);
});

test("guided speaking never requires more words than a short model answer", () => {
  const practice = {
    id: "test-guided-short-model",
    type: "listen-speak",
    mode: "guided-speaking",
    instruction: "Jawab singkat.",
    audioText: "Good morning.",
    prompt: "Berikan salam pagi.",
    modelAnswer: "Good morning.",
  };

  const result = scorePractice(practice, {
    type: "listen-speak",
    answer: "Good morning.",
  });

  assert.equal(result.score, 1);
  assert.equal(result.correct, true);
});

const TEST_LEARNING_CATALOG = [
  {
    lessonId: "lesson-1",
    unitId: "unit-1",
    level: "A1",
    xp: 20,
    practiceIds: ["practice-1", "practice-2", "practice-3"],
  },
];

const FIRST_LESSON_ATTEMPT = {
  lessonId: "lesson-1",
  unitId: "unit-1",
  level: "A1",
  xp: 20,
  attemptedAt: "2026-10-13T08:00:00.000Z",
  practiceResults: [
    { practiceId: "practice-1", score: 1 },
    { practiceId: "practice-2", score: 0.5 },
    { practiceId: "practice-3", score: 0 },
  ],
};

test("first lesson completion awards XP once and queues weak practices", () => {
  const initial = createEmptyLearningProgress();
  const before = structuredClone(initial);
  const result = applyLessonAttempt(initial, FIRST_LESSON_ATTEMPT);

  assert.deepEqual(initial, before, "the reducer must not mutate its input");
  assert.equal(result.xpGained, 20);
  assert.equal(result.progress.totalXp, 20);
  assert.equal(result.lesson.completed, true);
  assert.equal(result.lesson.attempts, 1);
  assert.equal(result.lesson.bestScore, 0.5);
  assert.equal(result.lesson.mastery, 50);
  assert.deepEqual(result.lesson.practiceScores, {
    "practice-1": 1,
    "practice-2": 0.5,
    "practice-3": 0,
  });
  assert.deepEqual(
    result.progress.reviewQueue.map((item) => item.practiceId),
    ["practice-3", "practice-2"],
  );
  assert.equal(result.progress.reviewQueue[0].dueAt, FIRST_LESSON_ATTEMPT.attemptedAt);
  assert.equal(result.addedReviewCount, 2);
});

test("lesson retakes improve mastery without awarding duplicate XP", () => {
  const first = applyLessonAttempt(
    createEmptyLearningProgress(),
    FIRST_LESSON_ATTEMPT,
  );
  const second = applyLessonAttempt(first.progress, {
    ...FIRST_LESSON_ATTEMPT,
    attemptedAt: "2026-10-14T08:00:00.000Z",
    practiceResults: FIRST_LESSON_ATTEMPT.practiceResults.map((result) => ({
      ...result,
      score: 1,
    })),
  });

  assert.equal(second.xpGained, 0);
  assert.equal(second.progress.totalXp, 20);
  assert.equal(second.lesson.xpAwarded, 20);
  assert.equal(second.lesson.attempts, 2);
  assert.equal(second.lesson.bestScore, 1);
  assert.equal(second.lesson.mastery, 100);
  assert.equal(second.progress.reviewQueue.length, 0);
  assert.equal(second.resolvedReviewCount, 2);
});

test("subset review improves per-practice mastery without XP or full-attempt count", () => {
  const first = applyLessonAttempt(
    createEmptyLearningProgress(),
    FIRST_LESSON_ATTEMPT,
  );
  const review = applyReviewAttempt(first.progress, {
    lessonId: "lesson-1",
    unitId: "unit-1",
    level: "A1",
    attemptedAt: "2026-10-13T09:00:00.000Z",
    practiceResults: [{ practiceId: "practice-3", score: 1 }],
  });

  assert.equal(review.xpGained, 0);
  assert.equal(review.progress.totalXp, 20);
  assert.equal(review.lesson.attempts, 1);
  assert.equal(review.lesson.bestScore, 0.5);
  assert.equal(review.lesson.practiceScores["practice-3"], 1);
  assert.equal(review.lesson.mastery, 83);
  assert.deepEqual(
    review.progress.reviewQueue.map((item) => item.practiceId),
    ["practice-2"],
  );
  assert.equal(review.resolvedReviewCount, 1);
});

test("review requires a completed lesson and validates unique bounded results", () => {
  assert.throws(
    () =>
      applyReviewAttempt(createEmptyLearningProgress(), {
        lessonId: "lesson-1",
        unitId: "unit-1",
        level: "A1",
        practiceResults: [{ practiceId: "practice-1", score: 1 }],
      }),
    /diselesaikan/i,
  );
  assert.throws(
    () =>
      applyLessonAttempt(createEmptyLearningProgress(), {
        ...FIRST_LESSON_ATTEMPT,
        practiceResults: [
          { practiceId: "practice-1", score: 1 },
          { practiceId: "practice-1", score: 0 },
        ],
      }),
    /unik/i,
  );
  assert.throws(
    () =>
      applyLessonAttempt(createEmptyLearningProgress(), {
        ...FIRST_LESSON_ATTEMPT,
        practiceResults: [{ practiceId: "practice-1", score: 1.1 }],
      }),
    /antara 0 dan 1/i,
  );
});

test("learning progress normalization migrates safely and enforces the active catalog", () => {
  assert.deepEqual(
    normalizeLearningProgress(undefined, TEST_LEARNING_CATALOG),
    createEmptyLearningProgress(),
  );

  const normalized = normalizeLearningProgress(
    {
      totalXp: 999_999,
      lessons: {
        "lesson-1": {
          lessonId: "lesson-1",
          unitId: "forged-unit",
          level: "A2",
          attempts: 2.8,
          completed: true,
          bestScore: 0.9,
          practiceScores: { "practice-1": 1, forged: 1 },
          mastery: 100,
          xpAwarded: 999,
          firstCompletedAt: "2026-10-12T08:00:00Z",
          lastAttemptAt: "2026-10-13T08:00:00Z",
        },
        forged: {
          lessonId: "forged",
          unitId: "unit-1",
          level: "A1",
          completed: true,
          bestScore: 1,
          xpAwarded: 999,
          lastAttemptAt: "2026-10-13T08:00:00Z",
        },
      },
      reviewQueue: [
        {
          practiceId: "practice-2",
          lessonId: "lesson-1",
          unitId: "unit-1",
          lastScore: 0.4,
          attempts: 1,
          dueAt: "2026-10-13T08:00:00Z",
          updatedAt: "2026-10-13T08:00:00Z",
        },
        {
          practiceId: "forged",
          lessonId: "lesson-1",
          unitId: "unit-1",
          lastScore: 0,
          attempts: 1,
          dueAt: "2026-10-13T08:00:00Z",
          updatedAt: "2026-10-13T08:00:00Z",
        },
      ],
    },
    TEST_LEARNING_CATALOG,
  );

  assert.deepEqual(Object.keys(normalized.lessons), ["lesson-1"]);
  assert.equal(normalized.lessons["lesson-1"].unitId, "unit-1");
  assert.equal(normalized.lessons["lesson-1"].level, "A1");
  assert.equal(normalized.lessons["lesson-1"].xpAwarded, 20);
  assert.equal(normalized.totalXp, 20);
  assert.deepEqual(normalized.lessons["lesson-1"].practiceScores, {
    "practice-1": 1,
  });
  assert.equal(
    normalized.lessons["lesson-1"].mastery,
    33,
    "missing catalog practice scores must count as zero",
  );
  assert.deepEqual(
    normalized.reviewQueue.map((item) => item.practiceId),
    ["practice-2"],
  );
});

test("normalization repairs completed XP and drops review from incomplete lessons", () => {
  for (const storedXp of [0, 3]) {
    const repaired = normalizeLearningProgress(
      {
        lessons: {
          "lesson-1": {
            lessonId: "lesson-1",
            unitId: "unit-1",
            level: "A1",
            attempts: 1,
            completed: true,
            bestScore: 1,
            practiceScores: {
              "practice-1": 1,
              "practice-2": 1,
              "practice-3": 1,
            },
            xpAwarded: storedXp,
            firstCompletedAt: "2026-10-12T08:00:00Z",
            lastAttemptAt: "2026-10-13T08:00:00Z",
          },
        },
      },
      TEST_LEARNING_CATALOG,
    );
    assert.equal(repaired.lessons["lesson-1"].xpAwarded, 20);
    assert.equal(repaired.totalXp, 20);
  }

  const incomplete = normalizeLearningProgress(
    {
      lessons: {
        "lesson-1": {
          lessonId: "lesson-1",
          unitId: "unit-1",
          level: "A1",
          attempts: 0,
          completed: false,
          bestScore: 0,
          practiceScores: {},
          xpAwarded: 0,
          firstCompletedAt: null,
          lastAttemptAt: "2026-10-13T08:00:00Z",
        },
      },
      reviewQueue: [
        {
          practiceId: "practice-1",
          lessonId: "lesson-1",
          unitId: "unit-1",
          lastScore: 0,
          attempts: 1,
          dueAt: "2026-10-13T08:00:00Z",
          updatedAt: "2026-10-13T08:00:00Z",
        },
      ],
    },
    TEST_LEARNING_CATALOG,
  );
  assert.equal(incomplete.lessons["lesson-1"].completed, false);
  assert.deepEqual(incomplete.reviewQueue, []);
});

test("unit summaries and due-review filtering use deterministic progress data", () => {
  const result = applyLessonAttempt(
    createEmptyLearningProgress(),
    FIRST_LESSON_ATTEMPT,
  );
  const summary = summarizeUnitProgress(result.progress, "unit-1", [
    "lesson-1",
    "lesson-2",
  ]);

  assert.deepEqual(summary, {
    unitId: "unit-1",
    totalLessons: 2,
    completedLessons: 1,
    completion: 0.5,
    mastery: 25,
    totalXp: 20,
  });
  assert.deepEqual(
    getDueReviewItems(result.progress, FIRST_LESSON_ATTEMPT.attemptedAt).map(
      (item) => item.practiceId,
    ),
    ["practice-3"],
  );
  assert.deepEqual(getDueReviewItems(result.progress, "not-a-date"), []);
});

test("active foundation content caps one-time curriculum XP at 270", () => {
  const activeLessonIds = new Set(
    FOUNDATION_CONTENT.flatMap((unit) =>
      unit.lessons.map((lesson) => lesson.lessonId),
    ),
  );
  const activeXp = FOUNDATION_UNITS.flatMap((unit) => unit.lessons)
    .filter((lesson) => activeLessonIds.has(lesson.id))
    .reduce((total, lesson) => total + lesson.xp, 0);

  assert.equal(activeLessonIds.size, 18);
  assert.equal(activeXp, 270);
});

test("speaking missions cover exactly the 18 active content lessons", () => {
  const activeLessonIds = FOUNDATION_CONTENT.flatMap((unit) =>
    unit.lessons.map((lesson) => lesson.lessonId),
  );

  assert.equal(SPEAKING_MISSIONS.length, 18);
  assert.deepEqual(
    SPEAKING_MISSIONS.map((mission) => mission.lessonId),
    activeLessonIds,
  );
  assert.equal(
    new Set(SPEAKING_MISSIONS.map((mission) => mission.id)).size,
    SPEAKING_MISSIONS.length,
  );
  assert.equal(
    new Set(SPEAKING_MISSIONS.map((mission) => mission.lessonId)).size,
    SPEAKING_MISSIONS.length,
  );
  assert.strictEqual(getAllSpeakingMissions(), SPEAKING_MISSIONS);
});

test("speaking mission lookup rejects preview and unknown lessons", () => {
  const activeMission = SPEAKING_MISSIONS[0];

  assert.strictEqual(
    getSpeakingMission(activeMission.lessonId),
    activeMission,
  );
  assert.equal(getSpeakingMission("a1-u4-family-home-words"), undefined);
  assert.equal(getSpeakingMission("not-a-real-lesson"), undefined);
  assert.equal(getSpeakingMission(""), undefined);
});

test("speaking missions expose bounded, learner-facing canonical fields", () => {
  const requiredStringFields = [
    "id",
    "lessonId",
    "unitId",
    "level",
    "lessonKind",
    "lessonTitle",
    "unitTitle",
    "objective",
    "scenario",
    "learnerRole",
    "emmaRole",
    "learnerTask",
    "openingLine",
  ];

  for (const mission of SPEAKING_MISSIONS) {
    for (const field of requiredStringFields) {
      assert.equal(typeof mission[field], "string", `${mission.lessonId}.${field}`);
      assert.ok(mission[field].trim().length > 0, `${mission.lessonId}.${field}`);
    }

    assert.equal(Object.isFrozen(mission), true, mission.lessonId);
    assert.ok(
      mission.targetVocabulary.length >= 1 &&
        mission.targetVocabulary.length <= 6,
      mission.lessonId,
    );
    assert.ok(
      mission.grammarTargets.length >= 1 && mission.grammarTargets.length <= 6,
      mission.lessonId,
    );
    assert.equal(mission.successCriteria.length, 3, mission.lessonId);
    assert.ok(
      mission.sampleResponses.length >= 1 &&
        mission.sampleResponses.length <= 3,
      mission.lessonId,
    );

    for (const values of [
      mission.targetVocabulary,
      mission.grammarTargets,
      mission.successCriteria,
      mission.sampleResponses,
    ]) {
      assert.equal(Object.isFrozen(values), true, mission.lessonId);
      assert.equal(new Set(values).size, values.length, mission.lessonId);
      assert.ok(values.every((value) => value.trim().length > 0), mission.lessonId);
    }
  }
});

test("grammar missions retain every teaching point without truncation", () => {
  const grammarLessonIds = FOUNDATION_UNITS.flatMap((unit) =>
    unit.lessons
      .filter((lesson) => lesson.kind === "grammar")
      .map((lesson) => lesson.id),
  ).filter((lessonId) => getSpeakingMission(lessonId));

  for (const lessonId of grammarLessonIds) {
    const lessonContent = FOUNDATION_CONTENT.flatMap((unit) => unit.lessons).find(
      (lesson) => lesson.lessonId === lessonId,
    );
    const mission = getSpeakingMission(lessonId);

    assert.ok(lessonContent, lessonId);
    assert.ok(mission, lessonId);
    assert.deepEqual(
      mission.grammarTargets,
      lessonContent.teachingPoints.map((point) => {
        const pattern = point.pattern?.trim();
        return `${point.title.trim()}: ${point.explanation.trim()}${
          pattern ? ` Pola: ${pattern}` : ""
        }`;
      }),
      lessonId,
    );
  }

  assert.equal(
    getSpeakingMission("a1-u2-present-simple").grammarTargets.length,
    4,
    "the largest active grammar lesson must retain all four teaching points",
  );
});

test("each lesson kind has distinct success criteria for its speaking skill", () => {
  const expectedCriterion = {
    vocabulary: /kosakata target/i,
    grammar: /dua konsep grammar target/i,
    "sentence-builder": /tiga sampai empat kalimat/i,
    listening: /dua detail yang benar/i,
    pronunciation: /ulangi model Emma/i,
    checkpoint: /empat giliran.*30–45 kata/i,
  };
  const signatures = [];

  for (const [kind, pattern] of Object.entries(expectedCriterion)) {
    const mission = SPEAKING_MISSIONS.find(
      (candidate) => candidate.lessonKind === kind,
    );
    assert.ok(mission, kind);

    const criteria = mission.successCriteria.join(" ");
    assert.match(criteria, pattern, mission.lessonId);
    signatures.push(criteria);
  }

  assert.equal(new Set(signatures).size, Object.keys(expectedCriterion).length);

  for (const kind of ["grammar", "listening", "pronunciation"]) {
    const mission = SPEAKING_MISSIONS.find(
      (candidate) => candidate.lessonKind === kind,
    );
    assert.doesNotMatch(
      mission.successCriteria.join(" "),
      /gunakan sedikitnya \d+ kosakata target/i,
      `${kind} missions must not blindly require vocabulary quotas`,
    );
  }
});

test("speaking mission samples prefer guided answers and fall back to lesson examples", () => {
  const guidedMission = getSpeakingMission("a1-u1-build-introduction");
  const guidedLesson = INTRODUCE_YOURSELF_CONTENT.lessons.find(
    (lesson) => lesson.lessonId === "a1-u1-build-introduction",
  );
  const guidedPractice = guidedLesson.practice.find(
    (practice) =>
      practice.type === "listen-speak" && practice.mode === "guided-speaking",
  );

  assert.equal(guidedMission.sampleResponses[0], guidedPractice.modelAnswer);

  const fallbackMission = getSpeakingMission("a1-u1-greetings");
  const fallbackLesson = INTRODUCE_YOURSELF_CONTENT.lessons.find(
    (lesson) => lesson.lessonId === "a1-u1-greetings",
  );

  assert.equal(
    fallbackLesson.practice.some(
      (practice) =>
        practice.type === "listen-speak" && practice.mode === "guided-speaking",
    ),
    false,
  );
  assert.equal(
    fallbackMission.sampleResponses[0],
    fallbackLesson.teachingPoints[0].examples[0].english,
  );

  const repeatFallbackMission = getSpeakingMission("a1-u2-routine-verbs");
  const repeatFallbackLesson = DAILY_ROUTINE_CONTENT.lessons.find(
    (lesson) => lesson.lessonId === "a1-u2-routine-verbs",
  );
  const repeatWithoutModel = repeatFallbackLesson.practice.find(
    (practice) =>
      practice.type === "listen-speak" &&
      practice.mode === "listen-and-repeat" &&
      !practice.modelAnswer,
  );

  assert.equal(
    repeatFallbackMission.sampleResponses[0],
    repeatWithoutModel.audioText,
    "listen-and-repeat audio must be usable when modelAnswer is absent",
  );
});

test("speaking-mission has a stable learner-facing session label", () => {
  assert.equal(MODE_LABELS["speaking-mission"], "Speaking Mission");
});

test("speaking missions retain the canonical lesson level instead of the profile level", () => {
  const simulatedProfileLevel = "C1";
  const mission = getSpeakingMission("a1-u1-greetings");
  const unit = FOUNDATION_UNITS.find((candidate) => candidate.id === mission?.unitId);

  assert.ok(mission);
  assert.ok(unit);
  assert.equal(simulatedProfileLevel, "C1");
  assert.equal(mission.level, "A1");
  assert.equal(mission.level, unit.level);
  assert.notEqual(mission.level, simulatedProfileLevel);
});

test("canonical speaking-mission targets are safe to interpolate into prompts", () => {
  for (const mission of SPEAKING_MISSIONS) {
    const canonicalPromptValues = [
      mission.objective,
      mission.learnerTask,
      mission.openingLine,
      ...mission.targetVocabulary,
      ...mission.grammarTargets,
      ...mission.successCriteria,
    ];

    for (const value of canonicalPromptValues) {
      assert.equal(typeof value, "string", mission.lessonId);
      assert.doesNotMatch(value, /undefined|\[object Object\]/i, mission.lessonId);
    }
  }
});
