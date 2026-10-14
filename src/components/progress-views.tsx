"use client";

import { useMemo } from "react";

import { getLessonContent } from "@/lib/course-content";
import { FOUNDATION_UNITS } from "@/lib/curriculum";
import {
  getDueReviewItems,
  type LearningProgress,
} from "@/lib/learning-progress";
import { formatBand, type CefrLevel } from "@/lib/levels";
import { CRITERION_LABELS, MODE_LABELS, type CriterionName, type SessionRecord } from "@/lib/types";
import { Icon } from "./icon";

interface ProgressViewsProps {
  view: "progress" | "history";
  sessions: SessionRecord[];
  learning: LearningProgress;
  level: CefrLevel;
  targetBand: number;
  onOpenSession: (session: SessionRecord) => void;
  onOpenLearn: () => void;
  onStartPractice: () => void;
}

const CRITERIA: CriterionName[] = ["fluency", "pronunciation", "grammar", "vocabulary", "coherence"];
const ACTIVE_LESSON_IDS = FOUNDATION_UNITS.flatMap((unit) =>
  unit.lessons
    .filter((lesson) => Boolean(getLessonContent(lesson.id)))
    .map((lesson) => lesson.id),
);
const ACTIVE_LESSON_ID_SET = new Set(ACTIVE_LESSON_IDS);

function formatDate(value: string, withTime = false) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds} dtk`;
  return `${Math.max(1, Math.round(seconds / 60))} menit`;
}

function listenAverage(session: SessionRecord) {
  if (!session.listenRepeat?.length) return null;
  return Math.round(
    session.listenRepeat.reduce((total, result) => total + result.accuracy, 0) /
      session.listenRepeat.length,
  );
}

export function ProgressViews({
  view,
  sessions,
  learning,
  level,
  targetBand,
  onOpenSession,
  onOpenLearn,
  onStartPractice,
}: ProgressViewsProps) {
  const stats = useMemo(() => {
    const evaluated = sessions.filter((session) => session.feedback);
    const average =
      evaluated.length > 0
        ? evaluated.reduce((total, session) => total + (session.feedback?.overallBand ?? 0), 0) /
          evaluated.length
        : 0;
    const minutes = Math.round(sessions.reduce((total, session) => total + session.durationSec, 0) / 60);
    const criteria = CRITERIA.map((name) => {
      const values = evaluated
        .map((session) => session.feedback?.criteria.find((item) => item.name === name)?.band)
        .filter((band): band is number => typeof band === "number");
      const value = values.length > 0 ? values.reduce((total, band) => total + band, 0) / values.length : 0;
      return { name, value };
    });

    const now = new Date();
    const days = Array.from({ length: 7 }, (_, reverseIndex) => {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - reverseIndex));
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      const count = sessions.filter((session) => {
        const started = new Date(session.startedAt).getTime();
        return started >= date.getTime() && started < next.getTime();
      }).length;
      return {
        key: date.getTime(),
        label: new Intl.DateTimeFormat("id-ID", { weekday: "short" })
          .format(date)
          .replace(".", ""),
        count,
      };
    });
    return { average, minutes, criteria, days, evaluated: evaluated.length };
  }, [sessions]);

  const courseStats = useMemo(() => {
    const completedLessons = ACTIVE_LESSON_IDS.map(
      (lessonId) => learning.lessons[lessonId],
    ).filter((lesson) => lesson?.completed);
    const completed = completedLessons.length;
    const mastery =
      ACTIVE_LESSON_IDS.length === 0
        ? 0
        : Math.round(
            ACTIVE_LESSON_IDS.reduce(
              (total, lessonId) => total + (learning.lessons[lessonId]?.mastery ?? 0),
              0,
            ) / ACTIVE_LESSON_IDS.length,
          );
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
      mastery,
      reviewCount,
      scheduledReviewCount,
    };
  }, [learning]);

  if (view === "history") {
    return (
      <section className="animate-rise">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#6e55df]">Aktivitas</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-slate-900">Riwayat latihan</h1>
            <p className="mt-2 text-sm text-slate-500">Semua sesi tersimpan secara lokal di perangkat ini.</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#172440] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#223355]"
            onClick={onStartPractice}
            type="button"
          >
            <Icon name="mic" className="size-4" />
            Mulai sesi baru
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="mt-8 grid min-h-96 place-items-center rounded-[1.8rem] border border-dashed border-slate-300 bg-white text-center">
            <div className="max-w-sm p-8">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-50 text-violet-500">
                <Icon name="history" className="size-7" />
              </span>
              <h2 className="mt-5 text-lg font-black text-slate-900">Belum ada riwayat</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Selesaikan latihan pertamamu dan laporan akan muncul di sini.</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm">
            <div className="hidden grid-cols-[1.5fr_1fr_120px_100px_44px] gap-4 border-b border-slate-100 px-6 py-3 text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400 md:grid">
              <span>Sesi</span><span>Tanggal</span><span>Durasi</span><span>Hasil</span><span />
            </div>
            {sessions.map((session) => {
              const accuracy = listenAverage(session);
              const hasReport = Boolean(session.feedback);
              return (
                <button
                  className="grid w-full gap-3 border-b border-slate-100 px-5 py-5 text-left transition last:border-0 hover:bg-slate-50 md:grid-cols-[1.5fr_1fr_120px_100px_44px] md:items-center md:px-6"
                  disabled={!hasReport}
                  key={session.id}
                  onClick={() => onOpenSession(session)}
                  type="button"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                      session.mode === "listen-repeat"
                        ? "bg-amber-50 text-amber-600"
                        : session.mode === "speaking-mission"
                          ? "bg-emerald-50 text-emerald-600"
                        : session.mode === "toefl-interview"
                          ? "bg-violet-50 text-violet-600"
                          : "bg-emerald-50 text-emerald-600"
                    }`}>
                      <Icon name={session.mode === "listen-repeat" ? "repeat" : "mic"} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-slate-800">{session.topicTitle}</span>
                      <span className="mt-0.5 block text-xs text-slate-400">{MODE_LABELS[session.mode]} · {session.level}</span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{formatDate(session.startedAt, true)}</span>
                  <span className="text-xs font-semibold text-slate-500">{formatDuration(session.durationSec)}</span>
                  <span>
                    {session.feedback?.missionAssessment ? (
                      <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-black text-emerald-700">
                        {session.feedback.missionAssessment.score}% misi
                      </span>
                    ) : session.feedback ? (
                      <span className="inline-flex rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-black text-violet-700">
                        Band {formatBand(session.feedback.overallBand)}
                      </span>
                    ) : accuracy !== null ? (
                      <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-black text-emerald-700">
                        {accuracy}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Tanpa skor</span>
                    )}
                  </span>
                  <span className="hidden size-9 place-items-center rounded-full bg-slate-100 text-slate-400 md:grid">
                    <Icon name="arrow-right" className="size-4" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  const maxDay = Math.max(1, ...stats.days.map((day) => day.count));
  return (
    <section className="animate-rise">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#6e55df]">Analytics</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-slate-900">Perkembanganmu</h1>
        <p className="mt-2 text-sm text-slate-500">Pantau jalur belajar, konsistensi, dan area speaking yang perlu ditingkatkan.</p>
      </div>

      <section
        aria-labelledby="course-progress-title"
        className="mt-8 overflow-hidden rounded-[1.8rem] border border-emerald-200/80 bg-white shadow-sm"
      >
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-700">
              Progres jalur belajar
            </p>
            <h2
              className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-900"
              id="course-progress-title"
            >
              Fondasi A1–A2
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              XP diberikan satu kali saat lesson selesai; mastery meningkat dari skor terbaik setiap latihan.
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Total XP", value: learning.totalXp, color: "bg-amber-50 text-amber-800" },
                { label: "Lesson selesai", value: `${courseStats.completed}/${ACTIVE_LESSON_IDS.length}`, color: "bg-emerald-50 text-emerald-800" },
                { label: "Mastery jalur", value: `${courseStats.mastery}%`, color: "bg-sky-50 text-sky-800" },
                { label: "Review sekarang", value: courseStats.reviewCount, color: "bg-violet-50 text-violet-800" },
              ].map((item) => (
                <div className={`rounded-xl px-3 py-3 ${item.color}`} key={item.label}>
                  <dd className="text-lg font-black">{item.value}</dd>
                  <dt className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] opacity-70">{item.label}</dt>
                </div>
              ))}
            </dl>

            <div className="mt-5 max-w-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">Penyelesaian lesson aktif</span>
                <span className="font-black text-slate-800">{courseStats.completion}%</span>
              </div>
              <div
                aria-label={`${courseStats.completion} persen lesson aktif selesai`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={courseStats.completion}
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#32bc95] to-[#7157dc] transition-[width]"
                  style={{ width: `${courseStats.completion}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 lg:min-w-48">
            {courseStats.reviewCount > 0 && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-800">
                {courseStats.reviewCount} soal menunggu review
              </p>
            )}
            {courseStats.reviewCount === 0 && courseStats.scheduledReviewCount > 0 && (
              <p className="rounded-xl bg-violet-50 px-3 py-2 text-center text-xs font-bold text-violet-800">
                {courseStats.scheduledReviewCount} soal sudah dijadwalkan
              </p>
            )}
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#172440] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#223355]"
              onClick={onOpenLearn}
              type="button"
            >
              <Icon className="size-4" name="book-open" />
              {courseStats.reviewCount > 0 ? "Buka antrean review" : "Buka jalur belajar"}
            </button>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total sesi", value: sessions.length.toString(), detail: "Semua mode", icon: "history" as const, color: "bg-violet-50 text-violet-600" },
          { label: "Waktu bicara", value: `${stats.minutes}m`, detail: "Akumulasi", icon: "clock" as const, color: "bg-emerald-50 text-emerald-600" },
          { label: "Rata-rata band", value: stats.average ? formatBand(stats.average) : "—", detail: `${stats.evaluated} sesi dinilai`, icon: "bar-chart" as const, color: "bg-amber-50 text-amber-600" },
          { label: "Target", value: targetBand.toFixed(1), detail: `Level aktif ${level}`, icon: "target" as const, color: "bg-sky-50 text-sky-600" },
        ].map((item) => (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm" key={item.label}>
            <span className={`grid size-10 place-items-center rounded-xl ${item.color}`}><Icon name={item.icon} className="size-5" /></span>
            <div className="mt-5 text-3xl font-black tracking-[-0.05em] text-slate-900">{item.value}</div>
            <div className="mt-1 text-sm font-bold text-slate-700">{item.label}</div>
            <div className="mt-0.5 text-xs text-slate-400">{item.detail}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-[1.8rem] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Aktivitas 7 hari</h2>
              <p className="mt-1 text-xs text-slate-400">Jumlah sesi per hari</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
              {stats.days.reduce((total, day) => total + day.count, 0)} sesi
            </span>
          </div>
          <div className="mt-8 flex h-52 items-end justify-between gap-3">
            {stats.days.map((day) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={day.key}>
                <span className="text-[10px] font-bold text-slate-400">{day.count || ""}</span>
                <div className="flex h-36 w-full items-end justify-center rounded-xl bg-slate-50">
                  <div
                    className="w-[55%] min-w-3 rounded-t-lg bg-gradient-to-t from-[#5d45ca] to-[#8a75eb] transition-[height]"
                    style={{ height: day.count ? `${Math.max(14, (day.count / maxDay) * 100)}%` : "5%" }}
                  />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-black text-slate-900">Profil kemampuan</h2>
          <p className="mt-1 text-xs text-slate-400">Rata-rata dari seluruh laporan</p>
          <div className="mt-6 space-y-5">
            {stats.criteria.map((criterion) => (
              <div key={criterion.name}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">{CRITERION_LABELS[criterion.name]}</span>
                  <span className="font-black text-slate-900">{criterion.value ? formatBand(criterion.value) : "—"}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#32bc95] to-[#7157dc]"
                    style={{ width: `${criterion.value ? (criterion.value / 6) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {stats.evaluated === 0 && (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
              Selesaikan sesi Free Talk atau TOEFL Interview agar grafik kemampuan mulai terisi.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
