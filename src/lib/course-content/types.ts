export const PRACTICE_TYPES = [
  "multiple-choice",
  "vocabulary-match",
  "word-order",
  "verb-fill",
  "listen-speak",
] as const;

export type PracticeType = (typeof PRACTICE_TYPES)[number];

export interface VocabularyItem {
  term: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

export interface ReferenceExample {
  english: string;
  indonesian: string;
  note?: string;
}

export interface TeachingPoint {
  title: string;
  explanation: string;
  pattern?: string;
  examples: readonly ReferenceExample[];
  tip?: string;
}

interface PracticeBase {
  id: string;
  type: PracticeType;
  instruction: string;
}

export interface MultipleChoicePractice extends PracticeBase {
  type: "multiple-choice";
  prompt: string;
  options: readonly string[];
  answer: string;
  explanation: string;
}

export interface VocabularyMatchPractice extends PracticeBase {
  type: "vocabulary-match";
  pairs: ReadonlyArray<{
    id: string;
    term: string;
    match: string;
  }>;
}

export interface WordOrderPractice extends PracticeBase {
  type: "word-order";
  prompt: string;
  words: readonly string[];
  answer: string;
  translation: string;
}

export interface VerbFillPractice extends PracticeBase {
  type: "verb-fill";
  sentence: string;
  baseVerb: string;
  answer: string;
  acceptedAnswers?: readonly string[];
  translation: string;
  explanation: string;
}

export type ListenSpeakMode =
  | "listen-and-choose"
  | "listen-and-repeat"
  | "guided-speaking";

interface ListenSpeakBase extends PracticeBase {
  type: "listen-speak";
  audioText: string;
  prompt: string;
  translation?: string;
  focus?: string;
}

export interface ListenAndChoosePractice extends ListenSpeakBase {
  mode: "listen-and-choose";
  options: readonly string[];
  answer: string;
  modelAnswer?: never;
}

export interface ListenAndRepeatPractice extends ListenSpeakBase {
  mode: "listen-and-repeat";
  options?: never;
  answer?: never;
  modelAnswer?: string;
}

export interface GuidedSpeakingPractice extends ListenSpeakBase {
  mode: "guided-speaking";
  options?: never;
  answer?: never;
  modelAnswer: string;
}

export type ListenSpeakPractice =
  | ListenAndChoosePractice
  | ListenAndRepeatPractice
  | GuidedSpeakingPractice;

export type LessonPractice =
  | MultipleChoicePractice
  | VocabularyMatchPractice
  | WordOrderPractice
  | VerbFillPractice
  | ListenSpeakPractice;

export interface LessonContent {
  lessonId: string;
  objective: string;
  warmup: string;
  vocabulary: readonly VocabularyItem[];
  teachingPoints: readonly TeachingPoint[];
  practice: readonly LessonPractice[];
  recap: readonly string[];
  coachTip: string;
}

export interface UnitContent {
  unitId: string;
  overview: string;
  outcomes: readonly string[];
  lessons: readonly LessonContent[];
}
