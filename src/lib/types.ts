/** Shared types for sessions, transcripts, and AI feedback. */
import type { CefrLevel } from "./levels";

export type SessionMode =
  | "practice"
  | "placement"
  | "toefl-interview"
  | "listen-repeat"
  | "speaking-mission";

export interface TranscriptTurn {
  role: "user" | "model";
  text: string;
}

export type CriterionName = "fluency" | "pronunciation" | "grammar" | "vocabulary" | "coherence";

export interface CriterionScore {
  name: CriterionName;
  /** TOEFL-style band, 1.0–6.0 in 0.5 steps. */
  band: number;
  /** Short explanation in Indonesian. */
  comment: string;
}

export interface Correction {
  original: string;
  corrected: string;
  /** Explanation in Indonesian. */
  explanation: string;
}

export interface VocabularyUpgrade {
  used: string;
  better: string;
  example: string;
}

export type MissionCriterionStatus = "achieved" | "partial" | "not-shown";

export interface MissionCriterionResult {
  /** Canonical learner-facing criterion copied from the trusted lesson mission. */
  criterion: string;
  status: MissionCriterionStatus;
  /** Short evidence-based explanation in Indonesian. */
  evidence: string;
}

export interface MissionAssessment {
  /** Mission-specific score, independent from the TOEFL-style speaking band. */
  score: number;
  passed: boolean;
  criteria: MissionCriterionResult[];
  targetVocabularyUsed: string[];
  grammarUsed: string[];
  /** Short, actionable mission recap in Indonesian. */
  summary: string;
}

export interface Feedback {
  overallBand: number;
  cefr: CefrLevel;
  criteria: CriterionScore[];
  summary: string;
  strengths: string[];
  improvements: string[];
  corrections: Correction[];
  vocabularyUpgrades: VocabularyUpgrade[];
  fillerWords: { word: string; count: number }[];
  nextFocus: string;
  /** Whether pronunciation was judged from real audio (vs. transcript only). */
  pronunciationFromAudio: boolean;
  /** Present only for a lesson-grounded Speaking Mission. */
  missionAssessment?: MissionAssessment;
}

export interface ListenRepeatItemResult {
  target: string;
  heard: string;
  accuracy: number;
  missedWords: string[];
  pronunciationIssues: { word: string; issue: string }[];
  tip: string;
}

export interface SessionRecord {
  id: string;
  mode: SessionMode;
  level: CefrLevel;
  topicId?: string;
  /** Canonical curriculum lesson for a Speaking Mission. */
  lessonId?: string;
  topicTitle: string;
  startedAt: string;
  durationSec: number;
  transcript: TranscriptTurn[];
  feedback?: Feedback;
  listenRepeat?: ListenRepeatItemResult[];
}

export const CRITERION_LABELS: Record<CriterionName, string> = {
  fluency: "Kelancaran",
  pronunciation: "Pengucapan",
  grammar: "Tata Bahasa",
  vocabulary: "Kosakata",
  coherence: "Koherensi",
};

export const MODE_LABELS: Record<SessionMode, string> = {
  practice: "Free Talk",
  placement: "Placement Test",
  "toefl-interview": "TOEFL · Take an Interview",
  "listen-repeat": "TOEFL · Listen & Repeat",
  "speaking-mission": "Speaking Mission",
};
