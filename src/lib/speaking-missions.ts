// Explicit TypeScript extensions keep this pure module directly testable by
// Node's native TypeScript loader as well as consumable by Next.js.
// @ts-expect-error -- TypeScript extensions are intentional in this no-emit project.
import { FOUNDATION_UNITS } from "./curriculum.ts";
// @ts-expect-error -- TypeScript extensions are intentional in this no-emit project.
import { DAILY_ROUTINE_CONTENT } from "./course-content/daily-routine.ts";
// @ts-expect-error -- TypeScript extensions are intentional in this no-emit project.
import { INTRODUCE_YOURSELF_CONTENT } from "./course-content/introduce-yourself.ts";
// @ts-expect-error -- TypeScript extensions are intentional in this no-emit project.
import { PAST_ACTIVITIES_CONTENT } from "./course-content/past-activities.ts";
import type { FoundationLevel, LessonKind } from "./curriculum";
import type { LessonContent, UnitContent } from "./course-content/types";

const MAX_TARGET_VOCABULARY = 6;
const MAX_LANGUAGE_TARGETS = 6;
const MAX_SAMPLE_RESPONSES = 3;

export interface SpeakingMission {
  id: string;
  lessonId: string;
  unitId: string;
  level: FoundationLevel;
  lessonKind: LessonKind;
  lessonTitle: string;
  unitTitle: string;
  objective: string;
  scenario: string;
  learnerRole: string;
  emmaRole: string;
  learnerTask: string;
  openingLine: string;
  targetVocabulary: readonly string[];
  grammarTargets: readonly string[];
  successCriteria: readonly string[];
  sampleResponses: readonly string[];
}

interface MissionContext {
  lesson: LessonContent;
  lessonTitle: string;
  unitTitle: string;
  targetVocabulary: readonly string[];
  sampleResponses: readonly string[];
}

interface KindTemplate {
  scenario: (context: MissionContext) => string;
  learnerRole: string;
  emmaRole: string;
  learnerTask: (context: MissionContext) => string;
  openingLine: (context: MissionContext) => string;
  successCriteria: (context: MissionContext) => readonly string[];
}

function requiredVocabularyCount(context: MissionContext, preferred: number): number {
  return Math.min(preferred, context.targetVocabulary.length);
}

const KIND_TEMPLATES: Record<LessonKind, KindTemplate> = {
  vocabulary: {
    scenario: ({ unitTitle }) =>
      `Percakapan santai tentang ${unitTitle} untuk memakai kosakata baru dalam konteks nyata.`,
    learnerRole: "Diri sendiri yang sedang berbagi informasi dengan partner latihan.",
    emmaRole: "Partner percakapan yang bertanya, menanggapi, dan memancing kosakata target.",
    learnerTask: ({ lessonTitle }) =>
      `Gunakan kosakata dari “${lessonTitle}” untuk menjawab Emma dan ajukan satu pertanyaan balik.`,
    openingLine: ({ unitTitle, sampleResponses }) =>
      `Hi! Let's talk about ${unitTitle}. Here's one example: ${sampleResponses[0]} What about you?`,
    successCriteria: (context) => {
      const count = requiredVocabularyCount(context, 3);
      return [
        count > 0
          ? `Gunakan sedikitnya ${count} kosakata target secara alami.`
          : "Gunakan ungkapan utama dari lesson secara alami.",
        "Jawab sedikitnya dua pertanyaan Emma dengan informasi yang relevan.",
        "Ajukan sedikitnya satu pertanyaan balik untuk menjaga percakapan.",
      ];
    },
  },
  grammar: {
    scenario: ({ unitTitle }) =>
      `Latihan tanya-jawab tentang ${unitTitle} dengan fokus pada pola grammar lesson.`,
    learnerRole: "Pembelajar yang membuat contoh pribadi dengan pola grammar target.",
    emmaRole: "Coach yang memberi pertanyaan singkat dan petunjuk koreksi bila diperlukan.",
    learnerTask: ({ lessonTitle }) =>
      `Jawab dan buat contoh sendiri dengan pola dari “${lessonTitle}”.`,
    openingLine: ({ lessonTitle, sampleResponses }) =>
      `Let's practice ${lessonTitle}. Here's a model: ${sampleResponses[0]} Can you make a similar sentence?`,
    successCriteria: () => [
      "Gunakan sedikitnya dua konsep grammar target dalam konteks yang tepat.",
      "Berikan sedikitnya tiga jawaban dalam kalimat lengkap.",
      "Perbaiki atau ulangi satu kalimat bila Emma memberi petunjuk.",
    ],
  },
  "sentence-builder": {
    scenario: ({ unitTitle }) =>
      `Menyusun jawaban lisan yang runtut tentang ${unitTitle}, satu gagasan demi satu gagasan.`,
    learnerRole: "Pencerita yang menghubungkan beberapa kalimat menjadi jawaban utuh.",
    emmaRole: "Partner yang meminta detail dan membantu menjaga urutan jawaban.",
    learnerTask: ({ lessonTitle }) =>
      `Bangun jawaban dari “${lessonTitle}” menjadi sedikitnya tiga kalimat yang saling terhubung.`,
    openingLine: ({ unitTitle }) =>
      `Let's build a clear answer about ${unitTitle}. What would you say first?`,
    successCriteria: () => [
      "Sampaikan tiga sampai empat kalimat yang saling terhubung.",
      "Gunakan penanda urutan atau penghubung yang sesuai dengan lesson.",
      "Tambahkan satu detail saat Emma mengajukan pertanyaan lanjutan.",
    ],
  },
  listening: {
    scenario: ({ unitTitle }) =>
      `Mendengarkan informasi lisan tentang ${unitTitle}, lalu merespons detail pentingnya.`,
    learnerRole: "Pendengar aktif yang menangkap informasi utama dan meresponsnya.",
    emmaRole: "Pembicara yang memberi informasi pendek dengan kecepatan ramah pemula.",
    learnerTask: ({ lessonTitle }) =>
      `Dengarkan bagian dari “${lessonTitle}”, sebutkan detail yang kamu tangkap, lalu beri respons singkat.`,
    openingLine: ({ sampleResponses }) =>
      `Listen carefully: ${sampleResponses[0]} What key detail did you hear?`,
    successCriteria: () => [
      "Sebutkan sedikitnya dua detail yang benar dari ucapan Emma.",
      "Minta pengulangan atau klarifikasi dalam bahasa Inggris bila diperlukan.",
      "Berikan satu respons yang relevan dalam kalimat lengkap.",
    ],
  },
  pronunciation: {
    scenario: ({ unitTitle }) =>
      `Latihan menirukan lalu memakai ungkapan tentang ${unitTitle} dengan ucapan yang jelas.`,
    learnerRole: "Pembicara yang meniru model lalu mengucapkan versi milik sendiri.",
    emmaRole: "Coach pelafalan yang memberi model pendek dan umpan balik suportif.",
    learnerTask: ({ lessonTitle }) =>
      `Tirukan model dari “${lessonTitle}”, lalu gunakan ritme atau bunyi yang sama pada contohmu sendiri.`,
    openingLine: ({ sampleResponses }) =>
      `Listen to this model: ${sampleResponses[0]} Now say it in your own voice.`,
    successCriteria: () => [
      "Ulangi model Emma dengan kata-kata yang lengkap dan jelas.",
      "Terapkan fokus bunyi, tekanan, atau ritme lesson pada satu contoh baru.",
      "Ucapkan ulang bagian yang sulit setelah menerima satu petunjuk.",
    ],
  },
  checkpoint: {
    scenario: ({ unitTitle }) =>
      `Simulasi percakapan terpadu untuk menuntaskan tantangan unit ${unitTitle}.`,
    learnerRole: "Pengguna bahasa Inggris yang menyelesaikan skenario tanpa membaca naskah.",
    emmaRole: "Partner role-play yang menjaga skenario tetap alami dan menilai ketercapaian misi.",
    learnerTask: ({ lessonTitle }) =>
      `Selesaikan tantangan “${lessonTitle}” dengan menggabungkan kosakata dan pola dari unit.`,
    openingLine: ({ unitTitle }) =>
      `Welcome to your ${unitTitle} challenge. I'll be your conversation partner. Let's begin!`,
    successCriteria: (context) => {
      const count = requiredVocabularyCount(context, 2);
      return [
        "Pertahankan sedikitnya empat giliran dan sampaikan sekitar lima kalimat (30–45 kata).",
        count > 0
          ? `Gunakan sedikitnya ${count} kosakata target dan satu pola grammar target.`
          : "Gunakan sedikitnya satu pola grammar target dari unit.",
        "Selesaikan tujuan lesson dan tutup percakapan secara alami.",
      ];
    },
  },
};

const ACTIVE_CONTENT: readonly UnitContent[] = [
  INTRODUCE_YOURSELF_CONTENT,
  DAILY_ROUTINE_CONTENT,
  PAST_ACTIVITIES_CONTENT,
];

function uniqueNonEmpty(values: readonly (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

function collectSampleResponses(
  lesson: LessonContent,
  lessonTitle: string,
): readonly string[] {
  const listenSpeak = lesson.practice.filter(
    (practice) => practice.type === "listen-speak",
  );
  const guidedPractices = listenSpeak
    .filter((practice) => practice.mode === "guided-speaking")
  const repeatPractices = listenSpeak.filter(
    (practice) => practice.mode === "listen-and-repeat",
  );
  const guidedModels = guidedPractices.map((practice) => practice.modelAnswer);
  const repeatModels = repeatPractices.map(
    (practice) => practice.modelAnswer || practice.audioText,
  );
  const teachingExamples = lesson.teachingPoints.flatMap((point) =>
    point.examples.map((example) => example.english),
  );
  const vocabularyExamples = lesson.vocabulary.map((item) => item.example);

  const samples = uniqueNonEmpty([
    ...guidedModels,
    ...repeatModels,
    ...teachingExamples,
    ...vocabularyExamples,
  ]).slice(0, MAX_SAMPLE_RESPONSES);

  return Object.freeze(
    samples.length > 0
      ? samples
      : [`I am ready to practice ${lessonTitle}.`],
  );
}

function createMission(
  unitContent: UnitContent,
  lesson: LessonContent,
): SpeakingMission {
  const unit = FOUNDATION_UNITS.find((candidate) => candidate.id === unitContent.unitId);
  if (!unit) {
    throw new Error(`Missing curriculum metadata for unit: ${unitContent.unitId}`);
  }

  const lessonMetadata = unit.lessons.find(
    (candidate) => candidate.id === lesson.lessonId,
  );
  if (!lessonMetadata) {
    throw new Error(`Missing curriculum metadata for lesson: ${lesson.lessonId}`);
  }

  if (lesson.teachingPoints.length > MAX_LANGUAGE_TARGETS) {
    throw new Error(
      `Too many language targets for speaking mission: ${lesson.lessonId}`,
    );
  }

  const targetVocabulary = Object.freeze(
    uniqueNonEmpty(lesson.vocabulary.map((item) => item.term)).slice(
      0,
      MAX_TARGET_VOCABULARY,
    ),
  );
  const grammarTargets = Object.freeze(
    lesson.teachingPoints.map((point) => {
      const pattern = point.pattern?.trim();
      return `${point.title.trim()}: ${point.explanation.trim()}${
        pattern ? ` Pola: ${pattern}` : ""
      }`;
    }),
  );
  const sampleResponses = collectSampleResponses(lesson, lessonMetadata.title);
  const context: MissionContext = {
    lesson,
    lessonTitle: lessonMetadata.title,
    unitTitle: unit.title,
    targetVocabulary,
    sampleResponses,
  };
  const template = KIND_TEMPLATES[lessonMetadata.kind];

  return Object.freeze({
    id: `mission-${lesson.lessonId}`,
    lessonId: lesson.lessonId,
    unitId: unit.id,
    level: unit.level,
    lessonKind: lessonMetadata.kind,
    lessonTitle: lessonMetadata.title,
    unitTitle: unit.title,
    objective: lesson.objective,
    scenario: template.scenario(context),
    learnerRole: template.learnerRole,
    emmaRole: template.emmaRole,
    learnerTask: template.learnerTask(context),
    openingLine: template.openingLine(context),
    targetVocabulary,
    grammarTargets,
    successCriteria: Object.freeze([...template.successCriteria(context)]),
    sampleResponses,
  });
}

const speakingMissions = ACTIVE_CONTENT.flatMap((unit) =>
  unit.lessons.map((lesson) => createMission(unit, lesson)),
);

const missionByLessonId = new Map<string, SpeakingMission>();
for (const mission of speakingMissions) {
  if (missionByLessonId.has(mission.lessonId)) {
    throw new Error(`Duplicate speaking mission lesson ID: ${mission.lessonId}`);
  }
  missionByLessonId.set(mission.lessonId, mission);
}

export const SPEAKING_MISSIONS: readonly SpeakingMission[] =
  Object.freeze(speakingMissions);

export function getSpeakingMission(
  lessonId: string,
): SpeakingMission | undefined {
  return missionByLessonId.get(lessonId);
}

export function getAllSpeakingMissions(): readonly SpeakingMission[] {
  return SPEAKING_MISSIONS;
}

export const listSpeakingMissions = getAllSpeakingMissions;
