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
import { Icon, type IconName } from "./icon";

type PracticeMode = "practice" | "toefl-interview" | "listen-repeat";

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

const MODE_CARDS: Array<{
  mode: PracticeMode;
  title: string;
  description: string;
  eyebrow: string;
  icon: IconName;
  accent: string;
  iconClass: string;
}> = [
  {
    mode: "practice",
    title: "Free Talk",
    description: "Percakapan santai dengan Emma yang menyesuaikan level dan topik favoritmu.",
    eyebrow: "Percakapan natural",
    icon: "mic",
    accent: "border-emerald-300 bg-emerald-50/50",
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    mode: "toefl-interview",
    title: "Take an Interview",
    description: "Empat pertanyaan bertahap dengan format speaking TOEFL yang baru.",
    eyebrow: "Simulasi TOEFL",
    icon: "headphones",
    accent: "border-violet-300 bg-violet-50/55",
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    mode: "listen-repeat",
    title: "Listen & Repeat",
    description: "Dengarkan tujuh kalimat kampus, ulangi, lalu dapatkan skor akurasi.",
    eyebrow: "Pronunciation drill",
    icon: "repeat",
    accent: "border-amber-300 bg-amber-50/60",
    iconClass: "bg-amber-100 text-amber-700",
  },
];

const RECENT_WINDOW_START = Date.now() - 7 * 24 * 60 * 60 * 1000;

const ACTIVE_LESSON_IDS = FOUNDATION_UNITS.flatMap((unit) =>
  unit.lessons
    .filter((lesson) => Boolean(getLessonContent(lesson.id)))
    .map((lesson) => lesson.id),
);
const ACTIVE_LESSON_ID_SET = new Set(ACTIVE_LESSON_IDS);

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(value));
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
  const [mode, setMode] = useState<PracticeMode>("practice");
  const [selectedPracticeId, setSelectedPracticeId] = useState(PRACTICE_TOPICS[0]?.id ?? "");
  const [selectedInterviewId, setSelectedInterviewId] = useState(TOEFL_INTERVIEW_TOPICS[0]?.id ?? "");

  const summary = useMemo(() => {
    const evaluated = sessions.filter((session) => session.feedback);
    const average =
      evaluated.length > 0
        ? evaluated.reduce((total, session) => total + (session.feedback?.overallBand ?? 0), 0) /
          evaluated.length
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
      minutes: Math.round(sessions.reduce((total, session) => total + session.durationSec, 0) / 60),
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
    const scheduledReviewCount = learning.reviewQueue.filter((item) =>
      ACTIVE_LESSON_ID_SET.has(item.lessonId),
    ).length - reviewCount;

    return {
      completed,
      completion:
        ACTIVE_LESSON_IDS.length === 0
          ? 0
          : Math.round((completed / ACTIVE_LESSON_IDS.length) * 100),
      reviewCount,
      scheduledReviewCount,
    };
  }, [learning]);

  const topicSource = mode === "toefl-interview" ? TOEFL_INTERVIEW_TOPICS : PRACTICE_TOPICS;
  const availableTopics = mode === "listen-repeat" ? [] : topicsForLevel(topicSource, level);
  const selectedId = mode === "toefl-interview" ? selectedInterviewId : selectedPracticeId;
  const selectedTopic = availableTopics.find((topic) => topic.id === selectedId) ?? availableTopics[0];

  const chooseTopic = (topicId: string) => {
    if (mode === "toefl-interview") setSelectedInterviewId(topicId);
    else setSelectedPracticeId(topicId);
  };

  const startSelected = () => {
    if (mode === "listen-repeat") {
      onStartListenRepeat();
      return;
    }
    if (!selectedTopic) return;
    onStartVoice(mode, selectedTopic);
  };

  const targetProgress = Math.min(100, Math.max(0, ((summary.average || LEVELS[level].toeflBandMin) / profile.targetBand) * 100));

  return (
    <div className="animate-rise">
      <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="dot-grid relative overflow-hidden rounded-[2rem] bg-[#182641] p-6 text-white shadow-[0_18px_55px_rgba(24,38,65,.18)] sm:p-8">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-[#6e55df]/25 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="relative z-10 flex h-full min-h-64 flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-bold text-slate-200">
                <Icon name="sparkles" className="size-3.5 text-[#8ee8ce]" />
                AI speaking partner kamu siap
              </span>
              <h1 className="mt-5 max-w-2xl text-3xl font-black leading-[1.08] tracking-[-0.05em] sm:text-4xl">
                {greeting()}, {profile.name || "Learner"}.
                <span className="block text-[#8ee8ce]">Let’s make your English flow.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                Latihan beberapa menit setiap hari lebih efektif daripada menunggu sampai merasa siap.
              </p>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#55d2af] px-5 py-3.5 text-sm font-extrabold text-[#102e28] shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-[#72dfc0]"
                onClick={() => {
                  setMode("practice");
                  const first = topicsForLevel(PRACTICE_TOPICS, level)[0];
                  if (first) onStartVoice("practice", first);
                }}
                type="button"
              >
                <Icon name="mic" className="size-5" />
                Mulai bicara sekarang
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/14"
                onClick={onOpenHistory}
                type="button"
              >
                <Icon name="history" className="size-4" />
                Lihat riwayat
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Level saat ini</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="grid size-14 place-items-center rounded-2xl bg-[#ebe6ff] text-xl font-black text-[#5d44cb]">{level}</span>
                <div>
                  <p className="font-black text-slate-900">{LEVELS[level].nameId}</p>
                  <p className="mt-0.5 text-xs text-slate-400">CEFR · Band {formatBand(LEVELS[level].toeflBandMin)}–{formatBand(LEVELS[level].toeflBandMax)}</p>
                </div>
              </div>
            </div>
            <Icon name="trending-up" className="size-5 text-emerald-500" />
          </div>
          <div className="mt-6">
            <div className="flex items-end justify-between text-xs">
              <span className="font-bold text-slate-500">Menuju target {profile.targetBand.toFixed(1)}</span>
              <span className="font-black text-slate-800">{summary.average ? formatBand(summary.average) : formatBand(LEVELS[level].toeflBandMin)}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-[#55cbaa] to-[#7459e8]" style={{ width: `${targetProgress}%` }} />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
            <div><p className="text-xl font-black text-slate-900">{summary.thisWeek}</p><p className="mt-1 text-[10px] font-bold uppercase text-slate-400">Minggu ini</p></div>
            <div><p className="text-xl font-black text-slate-900">{sessions.length}</p><p className="mt-1 text-[10px] font-bold uppercase text-slate-400">Total sesi</p></div>
            <div><p className="text-xl font-black text-slate-900">{summary.minutes}</p><p className="mt-1 text-[10px] font-bold uppercase text-slate-400">Menit</p></div>
          </div>
        </aside>
      </section>

      {!profile.placementDone && (
        <section className="mt-5 flex flex-col items-start justify-between gap-4 rounded-[1.6rem] border border-violet-200 bg-gradient-to-r from-[#f3efff] to-[#edfbf7] p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#6e55df] text-white shadow-lg shadow-violet-200">
              <Icon name="target" className="size-5" />
            </span>
            <div>
              <h2 className="font-black text-slate-900">Belum yakin dengan levelmu?</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Ikuti placement test adaptif sekitar 5 menit agar Emma menentukan level awalmu.</p>
            </div>
          </div>
          <button
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#6e55df] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#6047d4]"
            onClick={onStartPlacement}
            type="button"
          >
            Mulai placement test
            <Icon name="arrow-right" className="size-4" />
          </button>
        </section>
      )}

      {summary.suggestion && (
        <section className="mt-5 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white"><Icon name="trending-up" className="size-5" /></span>
          <p className="text-sm leading-6 text-emerald-950">
            Performa {summary.suggestion.basedOn} sesi terakhirmu menunjukkan kesiapan untuk level <strong>{summary.suggestion.to}</strong>.
          </p>
        </section>
      )}

      <section className="mt-5 overflow-hidden rounded-[1.8rem] border border-emerald-200/80 bg-white shadow-sm">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Icon name="book-open" className="size-6" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-700">Jalur belajar terstruktur</p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-900">Lanjutkan pondasi bahasa Inggrismu</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {courseSummary.completed} dari {ACTIVE_LESSON_IDS.length} lesson aktif sudah selesai. Status penyimpanan lokal ditampilkan setelah setiap lesson selesai.
              </p>
              <div className="mt-4 grid max-w-xl grid-cols-3 gap-2">
                <div className="rounded-xl bg-amber-50 px-3 py-2.5">
                  <p className="text-base font-black text-amber-800">{learning.totalXp}</p>
                  <p className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-amber-600">Total XP</p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-2.5">
                  <p className="text-base font-black text-emerald-800">{courseSummary.completed}/{ACTIVE_LESSON_IDS.length}</p>
                  <p className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-emerald-600">Lesson selesai</p>
                </div>
                <div className="rounded-xl bg-violet-50 px-3 py-2.5">
                  <p className="text-base font-black text-violet-800">{courseSummary.reviewCount}</p>
                  <p className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-violet-600">Review sekarang</p>
                </div>
              </div>
              {courseSummary.scheduledReviewCount > 0 && (
                <p className="mt-2 text-[10px] font-bold text-violet-500">
                  {courseSummary.scheduledReviewCount} soal review lain sudah dijadwalkan.
                </p>
              )}
              <div className="mt-4 max-w-xl">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>Penyelesaian lesson</span>
                  <span>{courseSummary.completion}%</span>
                </div>
                <div
                  aria-label={`${courseSummary.completion} persen lesson aktif selesai`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={courseSummary.completion}
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#6e55df] transition-[width]"
                    style={{ width: `${courseSummary.completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#172440] px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#223355]"
            onClick={onOpenLearn}
            type="button"
          >
            {courseSummary.reviewCount > 0
              ? `Belajar & review ${courseSummary.reviewCount} soal`
              : courseSummary.completed > 0
                ? "Lanjutkan belajar"
                : "Mulai lesson pertama"}
            <Icon name="arrow-right" className="size-4" />
          </button>
        </div>
      </section>

      <section className="mt-9">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#6e55df]">Pilih jalur latihan</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">Apa yang ingin kamu latih hari ini?</h2>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {MODE_CARDS.map((card) => {
            const selected = mode === card.mode;
            return (
              <button
                className={`group rounded-[1.6rem] border-2 p-5 text-left transition hover:-translate-y-1 hover:shadow-lg ${
                  selected ? `${card.accent} shadow-md` : "border-transparent bg-white shadow-sm"
                }`}
                key={card.mode}
                onClick={() => setMode(card.mode)}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid size-12 place-items-center rounded-2xl ${card.iconClass}`}><Icon name={card.icon} className="size-6" /></span>
                  <span className={`grid size-6 place-items-center rounded-full border-2 ${selected ? "border-[#6e55df] bg-[#6e55df] text-white" : "border-slate-200 text-transparent"}`}>
                    <Icon name="check" className="size-3.5" />
                  </span>
                </div>
                <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{card.eyebrow}</p>
                <h3 className="mt-1 text-lg font-black text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-9 rounded-[1.8rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
              {mode === "listen-repeat" ? "Set latihan otomatis" : "Pilih topik"}
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              {mode === "practice" ? "Topik Free Talk" : mode === "toefl-interview" ? "Topik TOEFL Interview" : "7 kalimat kampus bertahap"}
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">Disesuaikan untuk {level}</span>
        </div>

        {mode === "listen-repeat" ? (
          <div className="mt-6 grid gap-5 rounded-3xl bg-[#172440] p-6 text-white md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-amber-300"><Icon name="repeat" className="size-6" /></span>
              <div>
                <h3 className="font-black">Campus Listen & Repeat</h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-300">
                  Gemini membuat set baru, browser membacakan setiap kalimat, lalu rekamanmu dinilai kata per kata.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  <span className="rounded-lg bg-white/8 px-2 py-1">7 items</span>
                  <span className="rounded-lg bg-white/8 px-2 py-1">Instant score</span>
                  <span className="rounded-lg bg-white/8 px-2 py-1">Pronunciation tips</span>
                </div>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-extrabold text-amber-950 transition hover:bg-amber-200"
              onClick={startSelected}
              type="button"
            >
              Mulai set
              <Icon name="arrow-right" className="size-4" />
            </button>
          </div>
        ) : availableTopics.length > 0 ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {availableTopics.map((topic) => {
                const selected = selectedTopic?.id === topic.id;
                return (
                  <button
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-[#7b61e7] bg-[#f5f2ff] shadow-sm"
                        : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
                    }`}
                    key={topic.id}
                    onClick={() => chooseTopic(topic.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{topic.emoji}</span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-1 text-[9px] font-black text-slate-400">{topic.minLevel}+</span>
                    </div>
                    <h3 className="mt-3 text-sm font-extrabold text-slate-800">{topic.titleId}</h3>
                    <p className="mt-1 text-xs text-slate-400">{topic.title}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs text-slate-400">Topik terpilih</p>
                <p className="mt-1 text-sm font-extrabold text-slate-800">{selectedTopic?.titleId ?? "Pilih sebuah topik"}</p>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#172440] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#223355] disabled:opacity-40"
                disabled={!selectedTopic}
                onClick={startSelected}
                type="button"
              >
                <Icon name="mic" className="size-4" />
                Mulai {mode === "practice" ? "Free Talk" : "Interview"}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center">
            <Icon name="lock" className="mx-auto size-6 text-amber-600" />
            <p className="mt-3 text-sm font-extrabold text-amber-900">Topik Interview dibuka mulai level A2</p>
            <p className="mt-1 text-xs text-amber-700">Lanjutkan Free Talk atau placement test untuk menyesuaikan levelmu.</p>
          </div>
        )}
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#6e55df]">Aktivitas terakhir</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Riwayat sesi</h2>
          </div>
          {sessions.length > 0 && (
            <button className="text-xs font-extrabold text-[#6047d4] hover:underline" onClick={onOpenHistory} type="button">
              Lihat semua
            </button>
          )}
        </div>
        {sessions.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-[1.6rem] border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <Icon name="history" className="size-7 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">Sesi pertamamu menunggu</p>
            <p className="mt-1 text-xs text-slate-400">Pilih mode di atas untuk mulai membangun progres.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sessions.slice(0, 4).map((session) => (
              <button
                className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                key={session.id}
                onClick={() => onOpenSession(session)}
                type="button"
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                  session.mode === "listen-repeat" ? "bg-amber-50 text-amber-600" : "bg-violet-50 text-violet-600"
                }`}>
                  <Icon name={session.mode === "listen-repeat" ? "repeat" : "mic"} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-slate-800">{session.topicTitle}</span>
                  <span className="mt-1 block text-xs text-slate-400">{MODE_LABELS[session.mode]} · {formatSessionDate(session.startedAt)}</span>
                </span>
                {session.feedback?.missionAssessment ? (
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-black text-emerald-700">
                    {session.feedback.missionAssessment.score}% misi
                  </span>
                ) : session.feedback ? (
                  <span className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-black text-violet-700">{formatBand(session.feedback.overallBand)}</span>
                ) : null}
                <Icon name="arrow-right" className="size-4 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
