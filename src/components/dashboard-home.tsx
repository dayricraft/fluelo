"use client";

import { useMemo, useState } from "react";

import { getLessonContent } from "@/lib/course-content";
import { FOUNDATION_UNITS } from "@/lib/curriculum";
import {
  getDueReviewItems,
  type LearningProgress,
} from "@/lib/learning-progress";
import {
  formatBand,
  getLevelSuggestion,
  LEVELS,
  type CefrLevel,
} from "@/lib/levels";
import type { Profile } from "@/lib/storage";
import {
  PRACTICE_TOPICS,
  TOEFL_INTERVIEW_TOPICS,
  topicsForLevel,
  type Topic,
} from "@/lib/topics";
import { MODE_LABELS, type SessionRecord } from "@/lib/types";
import { Icon } from "./icon";
import { LueloMascot, PentaMascot, MascotBadge } from "./mascots";

interface DashboardHomeProps {
  profile: Profile;
  level: CefrLevel;
  sessions: SessionRecord[];
  learning: LearningProgress;
  onStartVoice: (mode: "practice" | "toefl-interview", topic?: Topic) => void;
  onStartListenRepeat: () => void;
  onStartPlacement: () => void;
  onOpenHistory: () => void;
  onOpenLearn: () => void;
  onOpenSession: (session: SessionRecord) => void;
}

const RECENT_WINDOW_START = Date.now() - 7 * 24 * 60 * 60 * 1000;

const ACTIVE_LESSON_IDS = FOUNDATION_UNITS.flatMap((unit) =>
  unit.lessons
    .filter((lesson) => Boolean(getLessonContent(lesson.id)))
    .map((lesson) => lesson.id),
);
const ACTIVE_LESSON_ID_SET = new Set(ACTIVE_LESSON_IDS);

function greetingText() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function DashboardHome({
  profile,
  level,
  sessions,
  learning,
  onStartVoice,
  onStartListenRepeat,
  onStartPlacement,
  onOpenHistory,
  onOpenLearn,
  onOpenSession,
}: DashboardHomeProps) {
  const [selectedPracticeId, setSelectedPracticeId] = useState(
    PRACTICE_TOPICS[0]?.id ?? "",
  );
  const [selectedInterviewId, setSelectedInterviewId] = useState(
    TOEFL_INTERVIEW_TOPICS[0]?.id ?? "",
  );
  const [showTopicPicker, setShowTopicPicker] = useState<"practice" | "toefl" | null>(null);

  const summary = useMemo(() => {
    const evaluated = sessions.filter((session) => session.feedback);
    const average =
      evaluated.length > 0
        ? evaluated.reduce(
            (total, session) => total + (session.feedback?.overallBand ?? 0),
            0,
          ) / evaluated.length
        : 0;
    const thisWeek = sessions.filter(
      (session) => new Date(session.startedAt).getTime() >= RECENT_WINDOW_START,
    ).length;
    const bandsAtLevel = evaluated
      .filter((session) => session.level === level)
      .map((session) => session.feedback?.overallBand)
      .filter((band): band is number => typeof band === "number");
    return {
      average,
      thisWeek,
      minutes: Math.round(
        sessions.reduce((total, session) => total + session.durationSec, 0) / 60,
      ),
      suggestion: getLevelSuggestion(level, bandsAtLevel),
    };
  }, [level, sessions]);

  const courseSummary = useMemo(() => {
    const completed = ACTIVE_LESSON_IDS.filter(
      (lessonId) => learning.lessons[lessonId]?.completed,
    ).length;
    const reviewCount = getDueReviewItems(learning).filter((item) =>
      ACTIVE_LESSON_ID_SET.has(item.lessonId),
    ).length;

    // Find next uncompleted lesson
    const nextLessonId = ACTIVE_LESSON_IDS.find(
      (id) => !learning.lessons[id]?.completed,
    ) ?? ACTIVE_LESSON_IDS[0];

    const nextLessonInfo = FOUNDATION_UNITS.flatMap((u) => u.lessons).find(
      (l) => l.id === nextLessonId,
    );

    return {
      completed,
      total: ACTIVE_LESSON_IDS.length,
      completion:
        ACTIVE_LESSON_IDS.length === 0
          ? 0
          : Math.round((completed / ACTIVE_LESSON_IDS.length) * 100),
      reviewCount,
      nextLesson: nextLessonInfo,
    };
  }, [learning]);

  const availablePracticeTopics = topicsForLevel(PRACTICE_TOPICS, level);
  const availableInterviewTopics = topicsForLevel(TOEFL_INTERVIEW_TOPICS, level);

  const selectedPracticeTopic =
    availablePracticeTopics.find((t) => t.id === selectedPracticeId) ??
    availablePracticeTopics[0];

  const selectedInterviewTopic =
    availableInterviewTopics.find((t) => t.id === selectedInterviewId) ??
    availableInterviewTopics[0];

  // Calculate mastery distribution across lessons
  const masteryStats = useMemo(() => {
    let mastered = 0;
    let proficient = 0;
    let familiar = 0;
    let attempted = 0;

    const lessonList = learning?.lessons ? Object.values(learning.lessons) : [];
    lessonList.forEach((l) => {
      if (l.mastery >= 90) mastered++;
      else if (l.mastery >= 70) proficient++;
      else if (l.mastery >= 40) familiar++;
      else attempted++;
    });

    const total = mastered + proficient + familiar + attempted || 1;
    return {
      mastered,
      proficient,
      familiar,
      attempted,
      total,
      masteredPct: Math.round((mastered / total) * 100),
      proficientPct: Math.round((proficient / total) * 100),
      familiarPct: Math.round((familiar / total) * 100),
      attemptedPct: Math.round((attempted / total) * 100),
    };
  }, [learning?.lessons]);

  return (
    <div className="animate-rise space-y-8">
      {/* 1. Welcoming Hero Banner (Fluelo Deep Navy Brand Aesthetic) */}
      <section className="relative overflow-hidden rounded-3xl border border-[#1b2575] bg-gradient-to-br from-[#070b3b] via-[#0b104c] to-[#121966] p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {greetingText()}, {profile.name || "Sobat Belajar"}.
              <span className="block text-teal-300 font-extrabold text-2xl sm:text-3xl mt-1">
                Latihan percakapan bahasa Inggris hari ini.
              </span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-300 max-w-xl">
              Pilih mode latihan terpandu untuk mengasah kelancaran berbicara, tata bahasa, dan pelafalanmu bersama AI voice coach.
            </p>

            {/* Next Action Priority Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!profile.placementDone && (
                <button
                  type="button"
                  onClick={onStartPlacement}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-md hover:bg-teal-300 transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Icon name="target" className="size-4" />
                  Tes Level CEFR (5 Menit)
                </button>
              )}

              {courseSummary.reviewCount > 0 ? (
                <button
                  type="button"
                  onClick={onOpenLearn}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-md hover:bg-amber-300 transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Icon name="repeat" className="size-4" />
                  Review {courseSummary.reviewCount} Kosakata
                </button>
              ) : courseSummary.nextLesson ? (
                <button
                  type="button"
                  onClick={onOpenLearn}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:bg-indigo-400 transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Icon name="play" className="size-4" />
                  Lanjut Belajar: {courseSummary.nextLesson.title}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLearn}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:bg-indigo-400 transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Icon name="book-open" className="size-4" />
                  Buka Jalur Belajar Fondasi
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (selectedPracticeTopic) onStartVoice("practice", selectedPracticeTopic);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition backdrop-blur-xs cursor-pointer"
              >
                <Icon name="mic" className="size-4 text-teal-300" />
                Percakapan Santai
              </button>
            </div>
          </div>

          {/* Luelo Mascot Interactive Hero Graphic */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative p-2">
              <LueloMascot state="idle" size={140} className="animate-float-gentle" />
              <div className="absolute -bottom-1 -right-1">
                <MascotBadge kind="star" size={32} />
              </div>
            </div>
            <span className="mt-2 text-xs font-black text-teal-200 bg-[#0f164d]/80 px-3 py-1 rounded-full border border-[#232e82]">
              Luelo, teman belajarmu
            </span>
          </div>
        </div>

        {/* Quick Credible Metrics Strip on Navy */}
        <div className="mt-8 pt-6 border-t border-[#1b2575]/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-2">
            <p className="text-2xl font-black text-white">{sessions.length}</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Sesi Selesai</p>
          </div>
          <div className="p-2 border-l border-[#1b2575]/60">
            <p className="text-2xl font-black text-teal-300">{summary.minutes} menit</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Waktu Latihan</p>
          </div>
          <div className="p-2 border-l border-[#1b2575]/60">
            <p className="text-2xl font-black text-amber-300">{learning.totalXp} XP</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Poin Belajar</p>
          </div>
          <div className="p-2 border-l border-[#1b2575]/60">
            <p className="text-2xl font-black text-indigo-300">
              {summary.average ? formatBand(summary.average) : "1.0"}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Rata-rata Skor TOEFL</p>
          </div>
        </div>
      </section>


      {/* 2. Tiga Pilihan Latihan Utama (Khan Academy Course / Activity Cards) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Pilih Cara Berlatih Hari Ini</h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Tiga mode latihan bersuara yang fokus mengasah kelancaran, akurasi, dan kesiapan ujian.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Card 1: Free Talk */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon name="mic" className="size-6" />
                </span>
                <span className="rounded-full bg-teal-100/70 px-2.5 py-1 text-[11px] font-extrabold text-teal-800">
                  Percakapan Bebas
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">Free Talk bersama Emma</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Bicara santai tentang topik sehari-hari. Emma akan mendengarkan, merespons secara alami, dan memberi koreksi hangat di akhir sesi.
              </p>
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">Topik aktif:</span>
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>{selectedPracticeTopic?.emoji}</span>
                  <span className="truncate max-w-[130px]">{selectedPracticeTopic?.titleId}</span>
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedPracticeTopic) onStartVoice("practice", selectedPracticeTopic);
                }}
                className="flex-1 rounded-2xl bg-teal-600 py-3 text-center text-xs font-black text-white hover:bg-teal-700 transition"
              >
                Mulai Bicara
              </button>
              <button
                type="button"
                onClick={() => setShowTopicPicker("practice")}
                className="rounded-2xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50 transition"
                title="Ganti Topik"
                aria-label="Pilih topik Free Talk"
              >
                <Icon name="filter" className="size-4" />
              </button>
            </div>
          </div>

          {/* Card 2: TOEFL Interview (Deep Navy Brand Highlight) */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#1b2575] bg-gradient-to-b from-[#070b3b] via-[#0b1150] to-[#0f175e] text-white p-6 shadow-sm hover:border-indigo-400 hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#141c5f] text-teal-300 border border-[#253291]">
                  <Icon name="headphones" className="size-6" />
                </span>
                <span className="rounded-full bg-[#18226e] px-2.5 py-1 text-[11px] font-black text-teal-200 border border-[#2a389f]">
                  Format TOEFL Baru
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-white">Take an Interview</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Simulasi wawancara resmi dengan 4 pertanyaan bertahap. Terdapat timer visual 45 detik untuk melatih ketepatan berpikir dalam bahasa Inggris.
              </p>
              <div className="mt-4 p-3 rounded-2xl bg-[#0f164d] border border-[#1e2a82] flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400">Tema soal:</span>
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <span>{selectedInterviewTopic?.emoji}</span>
                  <span className="truncate max-w-[130px]">{selectedInterviewTopic?.titleId}</span>
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#1b2575]/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedInterviewTopic) onStartVoice("toefl-interview", selectedInterviewTopic);
                }}
                className="flex-1 rounded-2xl bg-indigo-500 py-3 text-center text-xs font-black text-white hover:bg-indigo-400 transition"
              >
                Mulai Interview
              </button>
              <button
                type="button"
                onClick={() => setShowTopicPicker("toefl")}
                className="rounded-2xl border border-[#28358f] bg-[#121958] p-3 text-slate-300 hover:text-white transition"
                title="Ganti Tema Soal"
                aria-label="Pilih tema wawancara TOEFL"
              >
                <Icon name="filter" className="size-4" />
              </button>
            </div>
          </div>

          {/* Card 3: Listen & Repeat */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                  <Icon name="repeat" className="size-6" />
                </span>
                <span className="rounded-full bg-amber-100/70 px-2.5 py-1 text-[11px] font-extrabold text-amber-900">
                  Pronunciation Drill
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">Listen & Repeat</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Dengarkan 7 kalimat akademik kampus yang sering muncul dalam ujian, tirukan pelafalannya, dan lihat analisis akurasimu kata per kata.
              </p>
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">Jumlah kalimat:</span>
                <span className="font-extrabold text-slate-800">7 Kalimat Terurut</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onStartListenRepeat}
                className="w-full rounded-2xl bg-amber-500 py-3 text-center text-xs font-black text-white hover:bg-amber-600 transition"
              >
                Mulai Latihan Pelafalan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Topic Picker Modal / Drawer */}
      {showTopicPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  Pilih Topik {showTopicPicker === "practice" ? "Free Talk" : "TOEFL Interview"}
                </h3>
                <p className="text-xs text-slate-500">Topik disesuaikan dengan level CEFR {level} kamu.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTopicPicker(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <Icon name="x" className="size-5" />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-1">
              {(showTopicPicker === "practice" ? availablePracticeTopics : availableInterviewTopics).map(
                (topic) => {
                  const isSelected =
                    showTopicPicker === "practice"
                      ? topic.id === selectedPracticeId
                      : topic.id === selectedInterviewId;
                  return (
                    <button
                      type="button"
                      key={topic.id}
                      onClick={() => {
                        if (showTopicPicker === "practice") setSelectedPracticeId(topic.id);
                        else setSelectedInterviewId(topic.id);
                        setShowTopicPicker(null);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left border transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 font-black"
                          : "border-slate-100 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{topic.emoji}</span>
                        <div>
                          <p className="text-sm font-extrabold">{topic.titleId}</p>
                          <p className="text-xs text-slate-400">{topic.title}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {topic.minLevel}+
                      </span>
                    </button>
                  );
                },
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTopicPicker(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-xs font-extrabold text-white hover:bg-slate-800"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Ringkasan Jalur Belajar Fondasi A1-A2 & Skill Mastery (Khan Academy Pedagogical Style) */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Unit & Curriculum Path Snapshot (Deep Navy List Style) */}
        <div className="rounded-3xl border border-[#1b2575] bg-[#070b3b] text-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PentaMascot state="studying" size={48} />
              <div>
                <h3 className="text-lg font-black text-white">Jalur Belajar Fondasi A1-A2</h3>
                <p className="text-xs font-bold text-slate-400">Materi terstruktur: kosakata, tata bahasa, dan latihan bicara.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenLearn}
              className="text-xs font-black text-teal-300 hover:text-teal-200 transition cursor-pointer"
            >
              Lihat Jalur →
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {FOUNDATION_UNITS.slice(0, 3).map((unit, idx) => {
              const unitLessons = unit.lessons.map((l) => l.id);
              const doneCount = unitLessons.filter((id) => learning.lessons[id]?.completed).length;
              const pct = Math.round((doneCount / unitLessons.length) * 100);

              return (
                <div key={unit.id} className="p-3.5 rounded-2xl bg-[#0f164d] border border-[#1e2a82]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-teal-200">
                      Unit {idx + 1}: {unit.title}
                    </span>
                    <span className="font-bold text-slate-400">
                      {doneCount}/{unitLessons.length} Lesson ({pct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#17216a]">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onOpenLearn}
            className="mt-5 w-full rounded-2xl border border-[#283696] bg-[#131b5c] py-3 text-center text-xs font-black text-teal-200 hover:bg-[#1a257a] hover:text-white transition cursor-pointer"
          >
            Buka Pelajaran & Speaking Mission Emma
          </button>
        </div>

        {/* Skill Mastery Breakdown (Khan Academy Style) */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Tingkat Penguasaan Materi</h3>
              <p className="text-xs font-bold text-slate-500">
                Setiap latihan yang kamu kerjakan dihitung secara nyata.
              </p>
            </div>
            <MascotBadge kind="trophy" size={40} />
          </div>

          {/* Mastery Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
              <span>Status Penguasaan</span>
              <span className="font-black text-slate-800">{masteryStats.mastered} Menguasai Penuh</span>
            </div>
            <div className="flex h-3.5 overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/60">
              <div
                className="bg-emerald-500 rounded-l-full transition-all"
                style={{ width: `${masteryStats.masteredPct}%` }}
                title={`Mastered: ${masteryStats.mastered}`}
              />
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${masteryStats.proficientPct}%` }}
                title={`Proficient: ${masteryStats.proficient}`}
              />
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${masteryStats.familiarPct}%` }}
                title={`Familiar: ${masteryStats.familiar}`}
              />
              <div
                className="bg-slate-300 rounded-r-full transition-all"
                style={{ width: `${masteryStats.attemptedPct}%` }}
                title={`Attempted: ${masteryStats.attempted}`}
              />
            </div>
          </div>

          {/* Legend Table (Khan Academy Screenshot 5 Style) */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="size-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
              <span className="font-extrabold text-emerald-900">Mastered</span>
              <p className="text-sm font-black text-emerald-700 mt-1">{masteryStats.mastered}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
              <span className="size-2 rounded-full bg-blue-500 inline-block mr-1.5" />
              <span className="font-extrabold text-blue-900">Proficient</span>
              <p className="text-sm font-black text-blue-700 mt-1">{masteryStats.proficient}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
              <span className="size-2 rounded-full bg-amber-400 inline-block mr-1.5" />
              <span className="font-extrabold text-amber-900">Familiar</span>
              <p className="text-sm font-black text-amber-700 mt-1">{masteryStats.familiar}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="size-2 rounded-full bg-slate-400 inline-block mr-1.5" />
              <span className="font-extrabold text-slate-800">Attempted</span>
              <p className="text-sm font-black text-slate-600 mt-1">{masteryStats.attempted}</p>
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Level CEFR Saat Ini:</span>
            <span className="font-extrabold text-slate-900 px-2.5 py-1 rounded-lg bg-white border border-slate-200">
              {level} · {LEVELS[level].nameId}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Riwayat Sesi Terakhir */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Riwayat Latihan Terakhir</h3>
            <p className="text-xs font-bold text-slate-500">Lihat rekaman sesi dan umpan balik evaluasi.</p>
          </div>
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition"
            >
              Lihat Semua ({sessions.length}) →
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
            <PentaMascot state="waving" size={80} className="mx-auto" />
            <p className="mt-3 text-sm font-extrabold text-slate-800">Belum ada sesi latihan yang tercatat</p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Mulai sesi Free Talk pertamamu hari ini untuk mendapatkan evaluasi kelancaran dan perbaikan kosakata.
            </p>
            <button
              type="button"
              onClick={() => {
                if (selectedPracticeTopic) onStartVoice("practice", selectedPracticeTopic);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white hover:bg-indigo-700 transition"
            >
              <Icon name="mic" className="size-4" />
              Mulai Percakapan Sekarang
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                onClick={() => onOpenSession(session)}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl cursor-pointer transition"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onOpenSession(session);
                }}
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700 text-sm font-black">
                    {session.feedback ? formatBand(session.feedback.overallBand) : "—"}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {session.topicTitle || MODE_LABELS[session.mode]}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatSessionDate(session.startedAt)} · {Math.round(session.durationSec / 60)} menit · {MODE_LABELS[session.mode]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 hover:underline">
                    Detail Evaluasi
                  </span>
                  <Icon name="arrow-right" className="size-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
