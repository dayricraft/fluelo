"use client";

import { useEffect, useRef, useState } from "react";

import { getLessonContent, getUnitContent } from "@/lib/course-content";
import {
  FOUNDATION_UNITS,
  LESSON_KIND_LABELS,
  type FoundationLevel,
  type FoundationUnit,
} from "@/lib/curriculum";
import {
  getDueReviewItems,
  summarizeUnitProgress,
  type LearningProgress,
  type PracticeProgressInput,
} from "@/lib/learning-progress";
import type { CefrLevel } from "@/lib/levels";
import {
  getSpeakingMission,
  type SpeakingMission,
} from "@/lib/speaking-missions";
import {
  recordLessonAttempt,
  recordReviewAttempt,
  type StoredLearningAttemptResult,
} from "@/lib/storage";
import type { SessionRecord } from "@/lib/types";
import { Icon, type IconName } from "./icon";
import { LessonMaterial } from "./lesson-material";
import { PracticeSession } from "./practice-session";

interface LearningPathProps {
  activeLevel: CefrLevel;
  initialLessonId?: string;
  learning: LearningProgress;
  onStartMission: (mission: SpeakingMission) => void;
  sessions: SessionRecord[];
}

type LessonKind = FoundationUnit["lessons"][number]["kind"];

interface AccentStyle {
  border: string;
  chip: string;
  glow: string;
  hero: string;
  node: string;
  soft: string;
  text: string;
}

const LEVEL_COPY: Record<FoundationLevel, { label: string; subtitle: string }> = {
  A1: {
    label: "Mulai dari nol",
    subtitle: "Bangun kalimat pertama dan kosakata sehari-hari.",
  },
  A2: {
    label: "Perkuat dasar",
    subtitle: "Kembangkan rutinitas, cerita lampau, dan respons praktis.",
  },
};

const LESSON_ICONS: Record<LessonKind, IconName> = {
  vocabulary: "book-open",
  grammar: "lightbulb",
  "sentence-builder": "repeat",
  listening: "headphones",
  pronunciation: "mic",
  checkpoint: "target",
};

const ACCENTS: Record<string, AccentStyle> = {
  emerald: {
    border: "border-emerald-200",
    chip: "bg-emerald-100 text-emerald-800",
    glow: "bg-emerald-300/30",
    hero: "from-emerald-500 to-teal-600",
    node: "bg-emerald-500 text-white shadow-emerald-200",
    soft: "bg-emerald-50 text-emerald-700",
    text: "text-emerald-700",
  },
  sky: {
    border: "border-sky-200",
    chip: "bg-sky-100 text-sky-800",
    glow: "bg-sky-300/30",
    hero: "from-sky-500 to-blue-600",
    node: "bg-sky-500 text-white shadow-sky-200",
    soft: "bg-sky-50 text-sky-700",
    text: "text-sky-700",
  },
  violet: {
    border: "border-violet-200",
    chip: "bg-violet-100 text-violet-800",
    glow: "bg-violet-300/30",
    hero: "from-violet-500 to-indigo-600",
    node: "bg-violet-500 text-white shadow-violet-200",
    soft: "bg-violet-50 text-violet-700",
    text: "text-violet-700",
  },
  amber: {
    border: "border-amber-200",
    chip: "bg-amber-100 text-amber-900",
    glow: "bg-amber-300/30",
    hero: "from-amber-400 to-orange-500",
    node: "bg-amber-400 text-amber-950 shadow-amber-200",
    soft: "bg-amber-50 text-amber-700",
    text: "text-amber-700",
  },
  rose: {
    border: "border-rose-200",
    chip: "bg-rose-100 text-rose-800",
    glow: "bg-rose-300/30",
    hero: "from-rose-500 to-pink-600",
    node: "bg-rose-500 text-white shadow-rose-200",
    soft: "bg-rose-50 text-rose-700",
    text: "text-rose-700",
  },
  indigo: {
    border: "border-indigo-200",
    chip: "bg-indigo-100 text-indigo-800",
    glow: "bg-indigo-300/30",
    hero: "from-indigo-500 to-violet-600",
    node: "bg-indigo-500 text-white shadow-indigo-200",
    soft: "bg-indigo-50 text-indigo-700",
    text: "text-indigo-700",
  },
};

const DEFAULT_ACCENT = ACCENTS.violet;

function accentFor(unit: FoundationUnit): AccentStyle {
  return ACCENTS[unit.accent] ?? DEFAULT_ACCENT;
}

function levelFor(activeLevel: CefrLevel): FoundationLevel {
  return activeLevel === "A1" ? "A1" : "A2";
}

function unitsFor(level: FoundationLevel) {
  return FOUNDATION_UNITS.filter((unit) => unit.level === level).sort(
    (first, second) => first.order - second.order,
  );
}

function unitDuration(unit: FoundationUnit) {
  return unit.lessons.reduce((total, lesson) => total + lesson.durationMin, 0);
}

function activeLessonIds(unit: FoundationUnit) {
  return unit.lessons
    .filter((lesson) => Boolean(getLessonContent(lesson.id)))
    .map((lesson) => lesson.id);
}

export function LearningPath({
  activeLevel,
  initialLessonId,
  learning,
  onStartMission,
  sessions,
}: LearningPathProps) {
  const initialMission = initialLessonId
    ? getSpeakingMission(initialLessonId)
    : undefined;
  const initialLevel = initialMission?.level ?? levelFor(activeLevel);
  const [selectedLevelOverride, setSelectedLevelOverride] = useState<FoundationLevel | null>(
    () => initialMission?.level ?? null,
  );
  const [selectedUnitId, setSelectedUnitId] = useState(
    () => initialMission?.unitId ?? unitsFor(initialLevel)[0]?.id ?? "",
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    () => initialMission?.lessonId ?? null,
  );
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [reviewPracticeIds, setReviewPracticeIds] = useState<readonly string[] | undefined>();
  const [focusRequest, setFocusRequest] = useState(0);
  const focusTargetRef = useRef<string | null>(
    initialMission ? `speaking-mission-trigger-${initialMission.lessonId}` : null,
  );
  const focusScrollRef = useRef<"always" | "mobile" | "never">(
    initialMission ? "always" : "never",
  );

  const selectedLevel = selectedLevelOverride ?? levelFor(activeLevel);
  const units = unitsFor(selectedLevel);
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId) ?? units[0];
  const selectedUnitContent = selectedUnit ? getUnitContent(selectedUnit.id) : undefined;
  const selectedLesson = selectedUnit?.lessons.find(
    (lesson) => lesson.id === selectedLessonId,
  );
  const selectedLessonContent = selectedLesson
    ? getLessonContent(selectedLesson.id)
    : undefined;
  const selectedMission = selectedLesson
    ? getSpeakingMission(selectedLesson.id)
    : undefined;
  const selectedMissionSessions = selectedMission
    ? sessions.filter(
        (session) =>
          session.mode === "speaking-mission" &&
          session.lessonId === selectedMission.lessonId,
      )
    : [];
  const selectedMissionScores = selectedMissionSessions.flatMap((session) =>
    session.feedback?.missionAssessment
      ? [session.feedback.missionAssessment.score]
      : [],
  );
  const selectedMissionBestScore = selectedMissionScores.length > 0
    ? Math.max(...selectedMissionScores)
    : undefined;
  const selectedMissionBands = selectedMissionSessions.flatMap((session) =>
    session.feedback ? [session.feedback.overallBand] : [],
  );
  const selectedMissionBestBand =
    selectedMissionBestScore === undefined && selectedMissionBands.length > 0
      ? Math.max(...selectedMissionBands)
      : undefined;
  const selectedUnitActiveLessonIds = selectedUnit ? activeLessonIds(selectedUnit) : [];
  const selectedUnitProgress = selectedUnit
    ? summarizeUnitProgress(learning, selectedUnit.id, selectedUnitActiveLessonIds)
    : null;
  const allActiveLessonIds = FOUNDATION_UNITS.flatMap(activeLessonIds);
  const completedLessonCount = allActiveLessonIds.filter(
    (lessonId) => learning.lessons[lessonId]?.completed,
  ).length;
  const overallMastery = allActiveLessonIds.length === 0
    ? 0
    : Math.round(
        allActiveLessonIds.reduce(
          (total, lessonId) => total + (learning.lessons[lessonId]?.mastery ?? 0),
          0,
        ) / allActiveLessonIds.length,
      );
  const dueReviewItems = getDueReviewItems(learning);
  const scheduledReviewCount = learning.reviewQueue.length - dueReviewItems.length;
  const reviewGroups = dueReviewItems.reduce<
    Array<{ lessonId: string; practiceIds: string[] }>
  >((groups, item) => {
    const group = groups.find((candidate) => candidate.lessonId === item.lessonId);
    if (group) group.practiceIds.push(item.practiceId);
    else groups.push({ lessonId: item.lessonId, practiceIds: [item.practiceId] });
    return groups;
  }, []);

  useEffect(() => {
    const targetId = focusTargetRef.current;
    if (!targetId) return;

    focusTargetRef.current = null;
    const target = document.getElementById(targetId);
    if (!target) return;

    target.focus({ preventScroll: true });
    const scrollMode = focusScrollRef.current;
    const shouldScroll =
      scrollMode === "always" ||
      (scrollMode === "mobile" && window.matchMedia("(max-width: 1279px)").matches);

    if (shouldScroll) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [focusRequest]);

  const requestFocus = (
    targetId: string,
    scrollMode: "always" | "mobile" | "never",
  ) => {
    focusTargetRef.current = targetId;
    focusScrollRef.current = scrollMode;
    setFocusRequest((request) => request + 1);
  };

  const chooseLevel = (level: FoundationLevel) => {
    setSelectedLevelOverride(level);
    const firstUnitId = unitsFor(level)[0]?.id ?? "";
    setSelectedUnitId(firstUnitId);
    setSelectedLessonId(null);
    setPracticeOpen(false);
    setReviewPracticeIds(undefined);
    requestFocus("unit-detail-title", "mobile");
  };

  const openLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setPracticeOpen(false);
    setReviewPracticeIds(undefined);
    requestFocus("lesson-material-title", "always");
  };

  const closeLesson = () => {
    const lessonId = selectedLessonId;
    setPracticeOpen(false);
    setReviewPracticeIds(undefined);
    setSelectedLessonId(null);
    if (lessonId) requestFocus(`lesson-trigger-${lessonId}`, "always");
  };

  const startPractice = () => {
    setReviewPracticeIds(undefined);
    setPracticeOpen(true);
    requestFocus("practice-question-title", "always");
  };

  const closePractice = () => {
    setPracticeOpen(false);
    setReviewPracticeIds(undefined);
    requestFocus("lesson-material-title", "always");
  };

  const startReview = (lessonId: string, practiceIds: readonly string[]) => {
    const unit = FOUNDATION_UNITS.find((candidate) =>
      candidate.lessons.some((lesson) => lesson.id === lessonId),
    );
    if (!unit || !getLessonContent(lessonId) || practiceIds.length === 0) return;
    setSelectedLevelOverride(unit.level);
    setSelectedUnitId(unit.id);
    setSelectedLessonId(lessonId);
    setReviewPracticeIds(practiceIds);
    setPracticeOpen(true);
    requestFocus("practice-question-title", "always");
  };

  const completePractice = (
    practiceResults: readonly PracticeProgressInput[],
    review: boolean,
  ): Promise<StoredLearningAttemptResult> => {
    if (!selectedLesson) throw new Error("Lesson aktif tidak ditemukan.");
    return review
      ? recordReviewAttempt({ lessonId: selectedLesson.id, practiceResults })
      : recordLessonAttempt({ lessonId: selectedLesson.id, practiceResults });
  };

  const chooseUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setSelectedLessonId(null);
    setPracticeOpen(false);
    setReviewPracticeIds(undefined);
    requestFocus("unit-detail-title", "mobile");
  };

  return (
    <section className="animate-rise">
      <header className="dot-grid relative overflow-hidden rounded-[2rem] bg-[#172440] px-6 py-7 text-white shadow-[0_20px_55px_rgba(23,36,64,.2)] sm:px-8 sm:py-9">
        <div className="absolute -right-16 -top-20 size-64 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-extrabold text-[#8ee8ce]">
              <Icon className="size-3.5" name="book-open" />
              Learning Path A1–A2
            </span>
            <h1 className="mt-5 text-3xl font-black leading-tight tracking-[-0.05em] sm:text-4xl">
              Belajar dari dasar,
              <span className="block text-[#8ee8ce]">satu unit dalam satu waktu.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Lihat urutan materi kosakata, grammar, listening, dan pronunciation yang akan menjadi fondasi latihan interaktif FluentPath.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm lg:max-w-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
              Level profilmu
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-sm font-black text-[#5d44cb]">
                {activeLevel}
              </span>
              <p className="text-xs leading-5 text-slate-300">
                {activeLevel === "A1" || activeLevel === "A2"
                  ? `Kurikulum ${activeLevel} dipilih sebagai titik awal.`
                  : "Gunakan jalur A2 untuk menguatkan kembali fondasi."}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 rounded-[1.6rem] border border-slate-200/80 bg-white p-2 shadow-sm">
        <div
          aria-label="Pilih level fondasi"
          className="grid gap-2 sm:grid-cols-2"
          role="group"
        >
          {(["A1", "A2"] as const).map((level) => {
            const selected = selectedLevel === level;
            const readyUnits = unitsFor(level).filter((unit) => getUnitContent(unit.id)).length;
            return (
              <button
                aria-pressed={selected}
                className={`flex items-center gap-4 rounded-[1.15rem] px-4 py-4 text-left transition sm:px-5 ${
                  selected
                    ? "bg-[#eeeaff] text-[#4f39b7] shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                key={level}
                onClick={() => chooseLevel(level)}
                type="button"
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-black ${
                    selected ? "bg-[#6e55df] text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {level}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black">{LEVEL_COPY[level].label}</span>
                  <span className={`mt-0.5 block text-xs ${selected ? "text-violet-600" : "text-slate-400"}`}>
                    {LEVEL_COPY[level].subtitle}
                  </span>
                  {readyUnits > 0 && (
                    <span className="mt-1.5 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700">
                      {readyUnits} unit berisi materi
                    </span>
                  )}
                </span>
                {selected && <span className="ml-auto size-2 shrink-0 rounded-full bg-[#55cbaa]" />}
              </button>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="course-progress-title" className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6e55df]">
              Progres tersimpan di perangkat
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900" id="course-progress-title">
              Ringkasan jalur aktif
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400">
            {allActiveLessonIds.length} lesson tersedia
          </p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total XP", value: learning.totalXp, note: "reward unik" },
            { label: "Lesson selesai", value: `${completedLessonCount}/${allActiveLessonIds.length}`, note: "konten aktif" },
            { label: "Mastery", value: `${overallMastery}%`, note: "rata-rata jalur" },
            { label: "Review sekarang", value: dueReviewItems.length, note: scheduledReviewCount > 0 ? `${scheduledReviewCount} terjadwal` : "soal jatuh tempo" },
          ].map((item) => (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm" key={item.label}>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">{item.value}</p>
              <p className="mt-1 text-[10px] font-bold text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {!practiceOpen && (
        <section
          aria-labelledby="review-queue-title"
          className="mt-6 rounded-[1.6rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm sm:p-6"
        >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
            <Icon className="size-5" name="repeat" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
              Review pintar
            </p>
            <h2 className="mt-1 text-base font-black text-slate-900" id="review-queue-title">
              {dueReviewItems.length > 0
                ? `${dueReviewItems.length} soal siap direview`
                : scheduledReviewCount > 0
                  ? `${scheduledReviewCount} soal sudah dijadwalkan`
                  : "Antrean review masih kosong"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {dueReviewItems.length > 0
                ? "Ulangi hanya soal dengan skor di bawah 80%. Jawaban yang membaik akan langsung keluar dari antrean."
                : scheduledReviewCount > 0
                  ? "Belum ada review yang jatuh tempo. Soal dengan skor mendekati target akan tersedia dalam 24 jam."
                  : "Soal yang masih lemah akan muncul di sini setelah kamu menuntaskan sebuah lesson."}
            </p>
          </div>
        </div>
        {reviewGroups.length > 0 && (
          <div className="mt-4 grid gap-2.5 lg:grid-cols-2">
            {reviewGroups.map((group) => {
              const unit = FOUNDATION_UNITS.find((candidate) =>
                candidate.lessons.some((lesson) => lesson.id === group.lessonId),
              );
              const lesson = unit?.lessons.find((candidate) => candidate.id === group.lessonId);
              if (!unit || !lesson) return null;
              return (
                <div className="flex flex-col gap-3 rounded-2xl border border-violet-100 bg-white p-4 sm:flex-row sm:items-center" key={group.lessonId}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-slate-800">{lesson.title}</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      {unit.title} · {group.practiceIds.length} soal
                    </p>
                  </div>
                  <button
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#6e55df] px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#6047d4]"
                    onClick={() => startReview(group.lessonId, group.practiceIds)}
                    type="button"
                  >
                    Review sekarang
                    <Icon className="size-3.5" name="arrow-right" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        </section>
      )}

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)]">
        <div
          className={`rounded-[1.8rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7 ${
            practiceOpen ? "hidden" : ""
          }`}
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6e55df]">
                Jalur fondasi {selectedLevel}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">
                Pilih unit untuk melihat isinya
              </h2>
            </div>
            <span className="self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 sm:self-auto">
              {units.length} unit direncanakan
            </span>
          </div>

          {units.length > 0 ? (
            <ol className="relative mt-7 space-y-4 before:absolute before:bottom-7 before:left-6 before:top-7 before:w-px before:bg-gradient-to-b before:from-violet-300 before:via-slate-200 before:to-emerald-200 sm:before:left-7">
              {units.map((unit) => {
                const selected = selectedUnit?.id === unit.id;
                const accent = accentFor(unit);
                const contentAvailable = Boolean(getUnitContent(unit.id));
                const lessonIds = activeLessonIds(unit);
                const unitProgress = summarizeUnitProgress(learning, unit.id, lessonIds);
                return (
                  <li className="relative pl-14 sm:pl-16" key={unit.id}>
                    <span
                      className={`absolute left-0 top-5 z-10 grid size-12 place-items-center rounded-2xl text-sm font-black shadow-lg sm:size-14 ${
                        selected ? accent.node : "border border-slate-200 bg-white text-slate-400 shadow-slate-100"
                      }`}
                    >
                      {contentAvailable && unitProgress.completedLessons === unitProgress.totalLessons
                        ? <Icon className="size-5" name="check" />
                        : unit.order}
                    </span>
                    <button
                      aria-current={selected ? "step" : undefined}
                      className={`group w-full rounded-2xl border p-4 text-left transition sm:p-5 ${
                        selected
                          ? `${accent.border} bg-slate-50/80 shadow-md`
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                      }`}
                      onClick={() => chooseUnit(unit.id)}
                      type="button"
                    >
                      <span className="flex items-start gap-4">
                        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl text-2xl ${accent.soft}`}>
                          {unit.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-base font-black text-slate-900">{unit.title}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                              contentAvailable ? "bg-emerald-100 text-emerald-800" : accent.chip
                            }`}>
                              {contentAvailable
                                ? `${unitProgress.completedLessons}/${unitProgress.totalLessons} selesai`
                                : `${unit.lessons.length} pratinjau`}
                            </span>
                          </span>
                          <span className="mt-1.5 block text-sm leading-6 text-slate-500">{unit.description}</span>
                          {contentAvailable && (
                            <span className="mt-3 block">
                              <span className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400">
                                <span>Mastery {unitProgress.mastery}%</span>
                                <span>{unitProgress.totalXp} XP</span>
                              </span>
                              <span
                                aria-label={`Progres ${unit.title}: ${unitProgress.completedLessons} dari ${unitProgress.totalLessons} lesson selesai`}
                                aria-valuemax={unitProgress.totalLessons}
                                aria-valuemin={0}
                                aria-valuenow={unitProgress.completedLessons}
                                className="block h-1.5 overflow-hidden rounded-full bg-slate-200"
                                role="progressbar"
                              >
                                <span
                                  className="block h-full rounded-full bg-emerald-500 transition-[width] duration-500"
                                  style={{ width: `${unitProgress.completion * 100}%` }}
                                />
                              </span>
                            </span>
                          )}
                          <span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-slate-400">
                            <span className="inline-flex items-center gap-1.5">
                              <Icon className="size-3.5" name="clock" />
                              ±{unitDuration(unit)} menit
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Icon className="size-3.5" name="book-open" />
                              {unit.vocabularyFocus.length} fokus kosakata
                            </span>
                            <span className={`ml-auto inline-flex items-center gap-1 font-extrabold ${accent.text}`}>
                              Lihat unit
                              <Icon className="size-3.5 transition group-hover:translate-x-0.5" name="arrow-right" />
                            </span>
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Icon className="mx-auto size-7 text-slate-300" name="book-open" />
              <p className="mt-3 text-sm font-bold text-slate-600">Kurikulum level ini sedang disiapkan.</p>
            </div>
          )}
        </div>

        {practiceOpen && selectedUnit && selectedLesson && selectedLessonContent ? (
          <div className="xl:col-span-2">
            <PracticeSession
              content={selectedLessonContent}
              key={`${selectedLesson.id}:${reviewPracticeIds?.join(",") ?? "full"}`}
              lessonTitle={selectedLesson.title}
              onBack={closePractice}
              onComplete={completePractice}
              reviewPracticeIds={reviewPracticeIds}
            />
          </div>
        ) : selectedUnit && selectedLesson && selectedLessonContent && selectedMission ? (
          <LessonMaterial
            content={selectedLessonContent}
            kindLabel={LESSON_KIND_LABELS[selectedLesson.kind]}
            lessonTitle={selectedLesson.title}
            mission={selectedMission}
            missionAttempts={selectedMissionSessions.length}
            missionBestBand={selectedMissionBestBand}
            missionBestScore={selectedMissionBestScore}
            onBack={closeLesson}
            onStartMission={() => onStartMission(selectedMission)}
            onStartPractice={startPractice}
          />
        ) : selectedUnit ? (
          <aside
            className="overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm xl:sticky xl:top-24"
          >
            <div className={`relative overflow-hidden bg-gradient-to-br p-6 text-white sm:p-7 ${accentFor(selectedUnit).hero}`}>
              <div className={`absolute -right-8 -top-10 size-32 rounded-full blur-2xl ${accentFor(selectedUnit).glow}`} />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-14 place-items-center rounded-2xl bg-white/15 text-3xl shadow-inner backdrop-blur-sm">
                    {selectedUnit.emoji}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em]">
                    {selectedUnitContent
                      ? `${selectedUnitProgress?.completedLessons ?? 0}/${selectedUnitProgress?.totalLessons ?? 0} lesson selesai`
                      : `Pratinjau unit ${selectedUnit.order}`}
                  </span>
                </div>
                <h2
                  className="mt-5 scroll-mt-24 text-2xl font-black tracking-[-0.04em] outline-none"
                  id="unit-detail-title"
                  tabIndex={-1}
                >
                  {selectedUnit.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/80">{selectedUnit.description}</p>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                    <Icon className="size-4" name="book-open" />
                    Fokus kosakata
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedUnit.vocabularyFocus.map((focus) => (
                      <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-emerald-700 shadow-sm" key={focus}>
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-violet-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-black text-violet-800">
                    <Icon className="size-4" name="lightbulb" />
                    Fokus grammar
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedUnit.grammarFocus.map((focus) => (
                      <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-violet-700 shadow-sm" key={focus}>
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedUnitContent && (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-xs leading-5 text-emerald-950/75">
                    {selectedUnitContent.overview}
                  </p>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-800">
                    Target akhir unit
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {selectedUnitContent.outcomes.map((outcome) => (
                      <li className="flex items-start gap-2 text-[11px] leading-5 text-emerald-900/75" key={outcome}>
                        <Icon className="mt-0.5 size-3.5 shrink-0 text-emerald-600" name="check" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Isi unit</p>
                  <h3 className="mt-1 text-base font-black text-slate-900">Urutan lesson</h3>
                </div>
                <span className="text-xs font-bold text-slate-400">±{unitDuration(selectedUnit)} menit</span>
              </div>

              <ol className="mt-4 space-y-2.5">
                {selectedUnit.lessons.map((lesson, index) => {
                  const materialAvailable = Boolean(getLessonContent(lesson.id));
                  const lessonProgress = learning.lessons[lesson.id];
                  const lessonReviewCount = dueReviewItems.filter(
                    (item) => item.lessonId === lesson.id,
                  ).length;
                  return (
                    <li key={lesson.id}>
                      <button
                        className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                          materialAvailable
                            ? lessonProgress?.completed
                              ? "border-emerald-300 bg-emerald-50 hover:-translate-y-0.5 hover:shadow-sm"
                              : "border-emerald-100 bg-emerald-50/45 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"
                            : "cursor-default border-slate-100 bg-slate-50/70"
                        }`}
                        disabled={!materialAvailable}
                        id={`lesson-trigger-${lesson.id}`}
                        onClick={() => openLesson(lesson.id)}
                        type="button"
                      >
                        <span className={`grid size-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm ${
                          materialAvailable ? "text-emerald-700" : "text-[#6950d5]"
                        }`}>
                          <Icon
                            className="size-4"
                            name={lessonProgress?.completed ? "check" : LESSON_ICONS[lesson.kind]}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-800">{index + 1}. {lesson.title}</span>
                            <span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-400">
                              {LESSON_KIND_LABELS[lesson.kind]}
                            </span>
                            {lessonProgress?.completed && (
                              <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                                Selesai · {lessonProgress.mastery}%
                              </span>
                            )}
                            {lessonReviewCount > 0 && (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-800">
                                {lessonReviewCount} review
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">{lesson.description}</span>
                          <span className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400">
                            <span>{lesson.durationMin} menit</span>
                            <span>
                              {lessonProgress?.xpAwarded
                                ? `${lessonProgress.xpAwarded} XP diperoleh`
                                : `Target +${lesson.xp} XP`}
                            </span>
                            <span className={`ml-auto inline-flex items-center gap-1 font-extrabold ${
                              materialAvailable ? "text-emerald-700" : "text-slate-400"
                            }`}>
                              {materialAvailable
                                ? lessonProgress?.completed
                                  ? "Latih lagi"
                                  : "Buka materi"
                                : "Pratinjau"}
                              {materialAvailable && <Icon className="size-3" name="arrow-right" />}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className={`mt-5 rounded-2xl border p-4 ${
                selectedUnitContent
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}>
                <div className="flex items-start gap-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                    selectedUnitContent
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    <Icon className="size-4" name={selectedUnitContent ? "book-open" : "sparkles"} />
                  </span>
                  <div>
                    <p className={`text-xs font-black ${selectedUnitContent ? "text-emerald-950" : "text-amber-950"}`}>
                      {selectedUnitContent ? "Materi dan latihan tersedia" : "Pratinjau kurikulum"}
                    </p>
                    <p className={`mt-1 text-xs leading-5 ${selectedUnitContent ? "text-emerald-800" : "text-amber-800"}`}>
                      {selectedUnitContent
                        ? `${selectedUnitContent.lessons.length} lesson dapat dibaca dan dilatih. Pilih “Buka materi” untuk mempelajari kosakata dan grammar, lalu kerjakan latihan interaktifnya.`
                        : "Lesson belum dapat dibaca dan belum mencatat progres atau XP. Konten unit akan ditambahkan secara bertahap."}
                    </p>
                  </div>
                </div>
              </div>

              {!selectedUnitContent && (
                <button
                  className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-400"
                  disabled
                  type="button"
                >
                  <Icon className="size-4" name="lock" />
                  Materi segera hadir
                </button>
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
