import "server-only";
import { CEFR_LEVELS } from "../levels";

/** JSON schemas for Gemini structured output. Must match types in lib/types.ts. */

export const FEEDBACK_SCHEMA = {
  type: "object",
  properties: {
    overallBand: { type: "number", description: "TOEFL band 1.0–6.0 in 0.5 steps" },
    cefr: { type: "string", enum: [...CEFR_LEVELS] },
    criteria: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", enum: ["fluency", "pronunciation", "grammar", "vocabulary", "coherence"] },
          band: { type: "number" },
          comment: { type: "string" },
        },
        required: ["name", "band", "comment"],
      },
    },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    corrections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original: { type: "string" },
          corrected: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["original", "corrected", "explanation"],
      },
    },
    vocabularyUpgrades: {
      type: "array",
      items: {
        type: "object",
        properties: {
          used: { type: "string" },
          better: { type: "string" },
          example: { type: "string" },
        },
        required: ["used", "better", "example"],
      },
    },
    fillerWords: {
      type: "array",
      items: {
        type: "object",
        properties: { word: { type: "string" }, count: { type: "integer" } },
        required: ["word", "count"],
      },
    },
    nextFocus: { type: "string" },
    pronunciationFromAudio: { type: "boolean" },
  },
  required: [
    "overallBand",
    "cefr",
    "criteria",
    "summary",
    "strengths",
    "improvements",
    "corrections",
    "vocabularyUpgrades",
    "fillerWords",
    "nextFocus",
    "pronunciationFromAudio",
  ],
} as const;

const MISSION_ASSESSMENT_SCHEMA = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      description: "Mission achievement score from 0 to 100",
    },
    passed: { type: "boolean" },
    criteria: {
      type: "array",
      items: {
        type: "object",
        properties: {
          criterion: { type: "string" },
          status: {
            type: "string",
            enum: ["achieved", "partial", "not-shown"],
          },
          evidence: { type: "string" },
        },
        required: ["criterion", "status", "evidence"],
      },
    },
    targetVocabularyUsed: { type: "array", items: { type: "string" } },
    grammarUsed: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
  },
  required: [
    "score",
    "passed",
    "criteria",
    "targetVocabularyUsed",
    "grammarUsed",
    "summary",
  ],
} as const;

/** Feedback schema used only for lesson-grounded Speaking Missions. */
export const MISSION_FEEDBACK_SCHEMA = {
  ...FEEDBACK_SCHEMA,
  properties: {
    ...FEEDBACK_SCHEMA.properties,
    missionAssessment: MISSION_ASSESSMENT_SCHEMA,
  },
  required: [...FEEDBACK_SCHEMA.required, "missionAssessment"],
} as const;

export const LISTEN_REPEAT_SET_SCHEMA = {
  type: "object",
  properties: {
    scenario: { type: "string" },
    speaker: { type: "string" },
    sentences: { type: "array", items: { type: "string" } },
  },
  required: ["scenario", "speaker", "sentences"],
} as const;

export const LISTEN_REPEAT_SCORE_SCHEMA = {
  type: "object",
  properties: {
    heard: { type: "string" },
    accuracy: { type: "integer" },
    missedWords: { type: "array", items: { type: "string" } },
    pronunciationIssues: {
      type: "array",
      items: {
        type: "object",
        properties: { word: { type: "string" }, issue: { type: "string" } },
        required: ["word", "issue"],
      },
    },
    tip: { type: "string" },
  },
  required: ["heard", "accuracy", "missedWords", "pronunciationIssues", "tip"],
} as const;
