"use client";

import type {
  LessonContent,
  LessonPractice,
  PracticeType,
} from "@/lib/course-content/types";
import type { SpeakingMission } from "@/lib/speaking-missions";
import { Icon, type IconName } from "./icon";

interface LessonMaterialProps {
  content: LessonContent;
  kindLabel: string;
  lessonTitle: string;
  mission: SpeakingMission;
  missionAttempts: number;
  missionBestBand?: number;
  missionBestScore?: number;
  onBack: () => void;
  onStartMission: () => void;
  onStartPractice: () => void;
}

const PRACTICE_META: Record<
  PracticeType,
  { label: string; icon: IconName; className: string }
> = {
  "multiple-choice": {
    label: "Pilihan ganda",
    icon: "check",
    className: "bg-violet-50 text-violet-700",
  },
  "vocabulary-match": {
    label: "Cocokkan kosakata",
    icon: "repeat",
    className: "bg-emerald-50 text-emerald-700",
  },
  "word-order": {
    label: "Susun kata",
    icon: "sparkles",
    className: "bg-sky-50 text-sky-700",
  },
  "verb-fill": {
    label: "Isi verb",
    icon: "lightbulb",
    className: "bg-amber-50 text-amber-800",
  },
  "listen-speak": {
    label: "Listen / Speak",
    icon: "headphones",
    className: "bg-rose-50 text-rose-700",
  },
};

function practicePreview(practice: LessonPractice) {
  switch (practice.type) {
    case "multiple-choice":
      return practice.prompt;
    case "vocabulary-match":
      return `${practice.pairs.length} pasangan kata dan arti telah disiapkan.`;
    case "word-order":
      return practice.prompt;
    case "verb-fill":
      return practice.sentence;
    case "listen-speak":
      return practice.prompt;
  }
}

export function LessonMaterial({
  content,
  kindLabel,
  lessonTitle,
  mission,
  missionAttempts,
  missionBestBand,
  missionBestScore,
  onBack,
  onStartMission,
  onStartPractice,
}: LessonMaterialProps) {
  const vocabularyPreview = mission.targetVocabulary.slice(0, 4);
  const grammarPreview = mission.grammarTargets.slice(0, 2).map((target) =>
    target.split(":", 1)[0]?.trim() || target,
  );
  const bestResult = missionBestScore !== undefined
    ? `${missionBestScore}/100`
    : missionBestBand !== undefined
      ? `Band ${missionBestBand.toFixed(1)}/6`
      : "Belum ada";

  return (
    <aside
      aria-labelledby="lesson-material-title"
      className="animate-rise overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm"
    >
      <header className="relative overflow-hidden bg-[#172440] p-6 text-white sm:p-7">
        <div className="absolute -right-8 -top-12 size-36 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 size-32 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/15 hover:text-white"
            onClick={onBack}
            type="button"
          >
            <Icon className="size-3.5 rotate-180" name="arrow-right" />
            Kembali ke unit
          </button>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#8ee8ce] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#17372f]">
              Materi tersedia
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
              {kindLabel}
            </span>
          </div>
          <h2
            className="mt-3 scroll-mt-24 text-2xl font-black tracking-[-0.04em] outline-none"
            id="lesson-material-title"
            tabIndex={-1}
          >
            {lessonTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{content.objective}</p>
        </div>
      </header>

      <div className="space-y-7 p-5 sm:p-7">
        <section className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-sky-700 shadow-sm">
              <Icon className="size-4" name="play" />
            </span>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-sky-800">
                Pemanasan
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{content.warmup}</p>
            </div>
          </div>
        </section>

        {content.vocabulary.length > 0 && (
          <section>
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-emerald-600" name="book-open" />
              <h3 className="text-sm font-black text-slate-900">Kosakata inti</h3>
              <span className="ml-auto text-[10px] font-bold text-slate-400">
                {content.vocabulary.length} kata
              </span>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {content.vocabulary.map((item) => (
                <article
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"
                  key={`${item.term}-${item.meaning}`}
                >
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
                    <p className="text-sm font-black text-slate-900">{item.term}</p>
                    <p className="text-xs font-bold text-emerald-700">{item.meaning}</p>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                    {item.example}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-400">
                    {item.exampleMeaning}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {content.teachingPoints.length > 0 && (
          <section>
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-violet-600" name="lightbulb" />
              <h3 className="text-sm font-black text-slate-900">Inti materi</h3>
            </div>
            <div className="mt-3 space-y-3">
              {content.teachingPoints.map((point) => (
                <article
                  className="rounded-2xl border border-violet-100 bg-violet-50/55 p-4"
                  key={point.title}
                >
                  <h4 className="text-sm font-black text-violet-950">{point.title}</h4>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600">{point.explanation}</p>
                  {point.pattern && (
                    <p className="mt-3 rounded-xl bg-white px-3 py-2 font-mono text-xs font-bold text-violet-700 shadow-sm">
                      {point.pattern}
                    </p>
                  )}
                  <div className="mt-3 space-y-2">
                    {point.examples.map((example) => (
                      <div className="rounded-xl bg-white p-3 shadow-sm" key={example.english}>
                        <p className="text-xs font-extrabold text-slate-800">{example.english}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{example.indonesian}</p>
                        {example.note && (
                          <p className="mt-1.5 text-[10px] font-semibold leading-4 text-violet-600">
                            {example.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {point.tip && (
                    <p className="mt-3 text-[10px] font-bold leading-4 text-violet-700">
                      Tip: {point.tip}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-amber-600" name="target" />
            <h3 className="text-sm font-black text-slate-900">Isi sesi latihan</h3>
            <span className="ml-auto text-xs font-bold text-slate-400">
              {content.practice.length} contoh
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            Mulai sesi untuk menjawab contoh berikut satu per satu dan mendapat hasil sementara.
          </p>
          <div className="mt-3 space-y-2.5">
            {content.practice.map((practice) => {
              const meta = PRACTICE_META[practice.type];
              return (
                <article
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3.5"
                  key={practice.id}
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${meta.className}`}>
                    <Icon className="size-4" name={meta.icon} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
                      {meta.label}
                    </p>
                    <p className="mt-1 text-xs font-extrabold leading-5 text-slate-700">
                      {practicePreview(practice)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {practice.instruction}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
            <Icon className="size-4" name="check" />
            Target kemampuan lesson
          </div>
          <ul className="mt-3 space-y-2">
            {content.recap.map((item) => (
              <li className="flex items-start gap-2 text-xs leading-5 text-emerald-900/75" key={item}>
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Icon className="size-4" name="sparkles" />
          </span>
          <div>
            <p className="text-xs font-black text-amber-950">Catatan Emma</p>
            <p className="mt-1 text-xs leading-5 text-amber-800">{content.coachTip}</p>
          </div>
        </section>

        <section
          aria-labelledby={`speaking-mission-title-${mission.lessonId}`}
          className="relative overflow-hidden rounded-[1.4rem] border border-violet-200 bg-gradient-to-br from-[#f1edff] via-white to-emerald-50 p-5 shadow-sm sm:p-6"
        >
          <div className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-violet-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-14 left-1/3 size-28 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#6e55df] text-white shadow-lg shadow-violet-200">
                  <Icon className="size-5" name="mic" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6e55df]">
                    Speaking Mission bersama Emma
                  </p>
                  <h3
                    className="mt-1 scroll-mt-24 text-base font-black text-slate-900 outline-none"
                    id={`speaking-mission-title-${mission.lessonId}`}
                    tabIndex={-1}
                  >
                    Pakai materi ini dalam percakapan
                  </h3>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-violet-700 shadow-sm">
                <Icon className="size-3.5" name="clock" />
                2–3 menit
              </span>
            </div>

            <p className="mt-4 text-sm font-bold leading-6 text-slate-800">
              {mission.scenario}
            </p>
            <div className="mt-3 rounded-2xl border border-white bg-white/80 p-3.5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Tugasmu
              </p>
              <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-600">
                {mission.learnerTask}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Target lesson: {mission.objective}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/75 p-3.5">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-800">
                  <Icon className="size-3.5" name="book-open" />
                  Kosakata target
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {vocabularyPreview.length > 0 ? vocabularyPreview.map((word) => (
                    <span
                      className="rounded-lg bg-white px-2 py-1 text-[10px] font-extrabold text-emerald-700 shadow-sm"
                      key={word}
                    >
                      {word}
                    </span>
                  )) : (
                    <span className="text-[11px] font-semibold text-emerald-800/70">
                      Ungkapan utama lesson
                    </span>
                  )}
                  {mission.targetVocabulary.length > vocabularyPreview.length && (
                    <span className="rounded-lg px-1.5 py-1 text-[10px] font-black text-emerald-700">
                      +{mission.targetVocabulary.length - vocabularyPreview.length}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/75 p-3.5">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-violet-800">
                  <Icon className="size-3.5" name="lightbulb" />
                  Fokus bahasa
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {grammarPreview.length > 0 ? grammarPreview.map((target) => (
                    <li className="flex items-start gap-2 text-[11px] font-semibold leading-4 text-violet-900/75" key={target}>
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-violet-500" />
                      {target}
                    </li>
                  )) : (
                    <li className="text-[11px] font-semibold text-violet-900/70">
                      Gunakan kalimat yang lengkap dan relevan.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-sky-800">
                <Icon className="size-3.5" name="target" />
                Misi dianggap berhasil jika
              </p>
              <ul className="mt-2.5 space-y-2">
                {mission.successCriteria.map((criterion) => (
                  <li className="flex items-start gap-2 text-[11px] leading-4 text-slate-600" key={criterion}>
                    <Icon className="mt-0.5 size-3 shrink-0 text-sky-600" name="check" />
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-100 bg-white/80 px-3.5 py-3 text-[11px]">
              <span className="font-semibold text-slate-500">
                Percobaan <strong className="font-black text-slate-800">{missionAttempts}</strong>
              </span>
              <span aria-hidden="true" className="hidden h-4 w-px bg-slate-200 sm:block" />
              <span className="font-semibold text-slate-500">
                Hasil terbaik <strong className="font-black text-slate-800">{bestResult}</strong>
              </span>
            </div>

            <button
              aria-label={`Mulai Speaking Mission ${lessonTitle} bersama Emma`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6e55df] px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-[#5d44cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
              id={`speaking-mission-trigger-${mission.lessonId}`}
              onClick={onStartMission}
              type="button"
            >
              <Icon className="size-4" name="mic" />
              Mulai Speaking Mission
            </button>
          </div>
        </section>

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#172440] px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-[#22365e]"
          onClick={onStartPractice}
          type="button"
        >
          <Icon className="size-4" name="play" />
          Mulai latihan · {content.practice.length} soal
        </button>
      </div>
    </aside>
  );
}
