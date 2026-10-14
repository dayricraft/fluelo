/**
 * CEFR level system (A/B/C, each with 2 sub-levels) and its mapping to the
 * TOEFL iBT 1–6 band scale (ETS aligned the new scale directly to CEFR).
 * Also defines how the AI partner should adapt its speech to each level.
 */

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export type LevelGroup = "A" | "B" | "C";

export interface LevelInfo {
  code: CefrLevel;
  group: LevelGroup;
  name: string;
  nameId: string;
  /** Lowest TOEFL band (1–6 scale) that maps to this level. */
  toeflBandMin: number;
  toeflBandMax: number;
  /** Instructions injected into the AI partner's system prompt. */
  aiBehavior: string;
  descriptionId: string;
}

export const LEVELS: Record<CefrLevel, LevelInfo> = {
  A1: {
    code: "A1",
    group: "A",
    name: "Beginner",
    nameId: "Pemula",
    toeflBandMin: 1,
    toeflBandMax: 1.5,
    aiBehavior:
      "Speak very slowly and clearly. Use only the most common 500 English words, present simple tense, and sentences of 3–7 words. Ask yes/no or very simple either/or questions. If the learner is stuck, offer two example answers they can choose from. You may give a single Indonesian word as a hint only if the learner is completely lost.",
    descriptionId: "Bisa memperkenalkan diri dan menjawab pertanyaan sangat sederhana.",
  },
  A2: {
    code: "A2",
    group: "A",
    name: "Elementary",
    nameId: "Dasar",
    toeflBandMin: 2,
    toeflBandMax: 2.5,
    aiBehavior:
      "Speak slowly and clearly. Use common everyday vocabulary (about 1,500 words), simple past/present/future, and short sentences. Ask simple wh-questions about daily life, routines, family, and past experiences. Rephrase with simpler words if the learner does not understand.",
    descriptionId: "Bisa bercerita tentang rutinitas, keluarga, dan pengalaman sederhana.",
  },
  B1: {
    code: "B1",
    group: "B",
    name: "Intermediate",
    nameId: "Menengah",
    toeflBandMin: 3,
    toeflBandMax: 3.5,
    aiBehavior:
      "Speak at a slightly slower than natural pace. Use everyday vocabulary plus some common phrasal verbs. Ask for reasons and simple opinions ('Why do you think so?', 'Can you give an example?'). Encourage the learner to connect ideas with because, so, however.",
    descriptionId: "Bisa menyampaikan opini sederhana dengan alasan dan contoh.",
  },
  B2: {
    code: "B2",
    group: "B",
    name: "Upper-Intermediate",
    nameId: "Menengah Atas",
    toeflBandMin: 4,
    toeflBandMax: 4.5,
    aiBehavior:
      "Speak at a natural pace. Use a wide range of vocabulary including common idioms and some academic words. Ask follow-up questions that require comparing, explaining advantages/disadvantages, and hypothesising ('What would happen if...?'). Push the learner to extend answers to 3–5 sentences.",
    descriptionId: "Bisa berdiskusi lancar tentang topik umum dan akademik ringan.",
  },
  C1: {
    code: "C1",
    group: "C",
    name: "Advanced",
    nameId: "Mahir",
    toeflBandMin: 5,
    toeflBandMax: 5.5,
    aiBehavior:
      "Speak naturally and fluently like an educated native speaker. Use academic and abstract vocabulary, idioms, and complex structures. Challenge the learner's arguments, play devil's advocate, and discuss abstract or academic topics (research, policy, ethics, technology). Expect well-organised, nuanced answers.",
    descriptionId: "Bisa berargumen secara terstruktur tentang topik akademik dan abstrak.",
  },
  C2: {
    code: "C2",
    group: "C",
    name: "Proficient",
    nameId: "Sangat Mahir",
    toeflBandMin: 6,
    toeflBandMax: 6,
    aiBehavior:
      "Speak exactly as you would with a highly educated native speaker, at full natural speed, with sophisticated vocabulary, idiomatic and nuanced language. Engage in deep debate on complex academic, philosophical, or professional topics and probe for precision and subtlety.",
    descriptionId: "Setara penutur asli terdidik; presisi dan nuansa tinggi.",
  },
};

export const LEVEL_GROUPS: Record<LevelGroup, { name: string; nameId: string; levels: CefrLevel[] }> = {
  A: { name: "Basic User", nameId: "Dasar", levels: ["A1", "A2"] },
  B: { name: "Independent User", nameId: "Mandiri", levels: ["B1", "B2"] },
  C: { name: "Proficient User", nameId: "Mahir", levels: ["C1", "C2"] },
};

export function levelIndex(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

export function nextLevel(level: CefrLevel): CefrLevel | null {
  const i = levelIndex(level);
  return i < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[i + 1] : null;
}

export function prevLevel(level: CefrLevel): CefrLevel | null {
  const i = levelIndex(level);
  return i > 0 ? CEFR_LEVELS[i - 1] : null;
}

/** Convert a TOEFL 1–6 band into the matching CEFR level. */
export function bandToCefr(band: number): CefrLevel {
  if (band >= 6) return "C2";
  if (band >= 5) return "C1";
  if (band >= 4) return "B2";
  if (band >= 3) return "B1";
  if (band >= 2) return "A2";
  return "A1";
}

export function formatBand(band: number): string {
  return (Math.round(band * 2) / 2).toFixed(1);
}

export interface LevelSuggestion {
  direction: "up" | "down";
  to: CefrLevel;
  averageBand: number;
  basedOn: number;
}

/**
 * Suggest moving up/down a level based on the average band of the most recent
 * evaluated sessions at the current level.
 *  - Up: at least 3 recent sessions, average band >= next level's minimum band.
 *  - Down: at least 3 recent sessions, average band clearly below current level.
 */
export function getLevelSuggestion(
  currentLevel: CefrLevel,
  recentBandsAtLevel: number[],
): LevelSuggestion | null {
  const recent = recentBandsAtLevel.slice(0, 5);
  if (recent.length < 3) return null;
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;

  const up = nextLevel(currentLevel);
  if (up && avg >= LEVELS[up].toeflBandMin) {
    return { direction: "up", to: up, averageBand: avg, basedOn: recent.length };
  }
  const down = prevLevel(currentLevel);
  if (down && avg < LEVELS[currentLevel].toeflBandMin - 0.5) {
    return { direction: "down", to: down, averageBand: avg, basedOn: recent.length };
  }
  return null;
}
