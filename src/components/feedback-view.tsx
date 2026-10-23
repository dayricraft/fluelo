"use client";

import { CRITERION_LABELS, type Feedback } from "@/lib/types";
import { formatBand } from "@/lib/levels";
import { Icon } from "./icon";
import { LueloMascot } from "./mascots";

interface FeedbackViewProps {
  feedback: Feedback;
  topicTitle: string;
  onClose: () => void;
  closeLabel?: string;
  onPracticeAgain?: () => void;
  warning?: string | null;
  partnerName?: string;
}

function scoreColor(score: number) {
  if (score >= 5) return "#4f46e5";
  if (score >= 4) return "#0d9488";
  if (score >= 3) return "#d97706";
  return "#e11d48";
}

export function FeedbackView({
  feedback,
  topicTitle,
  onClose,
  closeLabel = "Selesai",
  onPracticeAgain,
  warning,
  partnerName,
}: FeedbackViewProps) {
  const color = scoreColor(feedback.overallBand);
  const progress = Math.max(0, Math.min(100, (feedback.overallBand / 6) * 100));
  const mission = feedback.missionAssessment;
  const isGoodScore = feedback.overallBand >= 4.0 || (mission && mission.passed);

  return (
    <section className="animate-rise overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-slate-900 px-6 py-8 text-white sm:px-8">
        <div className="relative flex items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <LueloMascot
              state={isGoodScore ? "celebrating" : "thinking"}
              size={70}
              className="shrink-0"
            />
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-teal-300">
                <Icon name="check" className="size-3.5" />
                {mission ? "Speaking Mission Selesai" : "Sesi Bicara Selesai"}
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                {mission ? "Hasil Misi Speaking Kamu" : "Laporan Evaluasi Suara"}
              </h2>
              <p className="mt-1 text-sm text-slate-300">{topicTitle}</p>
            </div>
          </div>
          <button
            aria-label="Tutup laporan"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <Icon name="x" className="size-5" />
          </button>
        </div>
      </div>

      {warning && (
        <div
          className="mx-6 mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
          role="alert"
        >
          {warning}
        </div>
      )}

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[260px_1fr]">
        {/* Left Sidebar: Score Summary */}
        <aside>
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50 p-6 text-center shadow-2xs">
            <div
              className="relative mx-auto grid size-44 place-items-center rounded-full"
              style={{
                background: `conic-gradient(${color} ${progress}%, #e2e8f0 ${progress}% 100%)`,
              }}
            >
              <div className="grid size-[8.8rem] place-items-center rounded-full bg-white shadow-xs">
                <div>
                  <div className="text-4xl font-black tracking-tight text-slate-900">
                    {formatBand(feedback.overallBand)}
                  </div>
                  <div className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Skor TOEFL (Maks 6.0)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="rounded-xl bg-indigo-100 px-3 py-1 text-sm font-black text-indigo-800">
                {feedback.cefr}
              </span>
              <span className="text-xs font-bold text-slate-600">Estimasi Level CEFR</span>
            </div>

            {mission && (
              <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                  Skor Misi Pelajaran
                </p>
                <p className="mt-1 text-3xl font-black text-indigo-950">
                  {mission.score}
                  <span className="text-sm font-bold text-indigo-400">/100</span>
                </p>
                <p
                  className={`mt-1.5 text-xs font-black ${
                    mission.passed ? "text-emerald-700" : "text-amber-800"
                  }`}
                >
                  {mission.passed ? "Target tercapai!" : "Belum tercapai: coba ulangi sekali lagi"}
                </p>
              </div>
            )}

            {!feedback.pronunciationFromAudio && (
              <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200/60 p-3 text-left text-xs leading-relaxed text-amber-800">
                Skor pelafalan diperkirakan dari transkrip ucapan karena data audio tidak terekam langsung.
              </p>
            )}
          </div>
        </aside>

        {/* Right Section: Detailed Breakdown */}
        <div className="min-w-0 space-y-7">
          {/* Mission Evidence Checklist */}
          {mission && (
            <section
              aria-labelledby="mission-assessment-title"
              className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white p-6 shadow-2xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    Bukti dari Ucapanmu
                  </p>
                  <h3
                    className="mt-0.5 text-base font-black text-slate-900"
                    id="mission-assessment-title"
                  >
                    Checklist Kriteria Speaking Mission
                  </h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    mission.passed
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {mission.criteria.filter((item) => item.status === "achieved").length} dari{" "}
                  {mission.criteria.length} kriteria terpenuhi
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {mission.criteria.map((item) => {
                  const achieved = item.status === "achieved";
                  const partial = item.status === "partial";
                  return (
                    <div
                      className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs"
                      key={item.criterion}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                            achieved
                              ? "bg-emerald-100 text-emerald-700"
                              : partial
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Icon className="size-3.5" name={achieved ? "check" : "target"} />
                        </span>
                        <div>
                          <p className="text-xs font-black leading-snug text-slate-800">
                            {item.criterion}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {item.evidence}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs font-bold leading-relaxed text-slate-700 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                {mission.summary}
              </p>

              {(mission.targetVocabularyUsed.length > 0 || mission.grammarUsed.length > 0) && (
                <div className="mt-5 border-t border-slate-100 pt-4 space-y-3">
                  {mission.targetVocabularyUsed.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Kosakata Target yang Berhasil Digunakan
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {mission.targetVocabularyUsed.map((item) => (
                          <span
                            className="rounded-lg bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 text-xs font-black text-emerald-800"
                            key={item}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {mission.grammarUsed.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Pola Tata Bahasa yang Terdeteksi
                      </p>
                      <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-600">
                        {mission.grammarUsed.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-indigo-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Criteria Scores */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Skor Berdasarkan 5 Kriteria TOEFL
            </h3>
            <div className="mt-4 space-y-4">
              {feedback.criteria.map((criterion) => {
                const criterionColor = scoreColor(criterion.band);
                return (
                  <div
                    key={criterion.name}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs"
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-black text-slate-800">
                        {CRITERION_LABELS[criterion.name]}
                      </span>
                      <span className="font-black text-slate-900">
                        {formatBand(criterion.band)} <span className="text-xs text-slate-400 font-bold">/ 6.0</span>
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          backgroundColor: criterionColor,
                          width: `${Math.max(5, (criterion.band / 6) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {criterion.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Coach Emma's Encouraging Summary */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
            <div className="flex items-center gap-2 font-black text-indigo-900 text-sm">
              <Icon name="message-square" className="size-4 text-indigo-600" />
              Catatan Ulasan dari {partnerName ?? "AI Coach"}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {feedback.summary}
            </p>
          </div>

          {/* Strengths & Next Steps */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <h4 className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wider">
                <span className="grid size-5 place-items-center rounded-full bg-emerald-600 text-white">
                  <Icon name="check" className="size-3" />
                </span>
                Kelebihan yang Terlihat
              </h4>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
                {feedback.strengths.map((item) => (
                  <li className="flex items-start gap-2" key={item}>
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
              <h4 className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                <span className="grid size-5 place-items-center rounded-full bg-amber-500 text-white">
                  <Icon name="target" className="size-3" />
                </span>
                Fokus Latihan Selanjutnya
              </h4>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
                {feedback.improvements.map((item) => (
                  <li className="flex items-start gap-2" key={item}>
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grammar Corrections */}
          {feedback.corrections.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-3">
                Koreksi Tata Bahasa Penting
              </h3>
              <div className="space-y-3">
                {feedback.corrections.map((item, index) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                    key={`${item.original}-${index}`}
                  >
                    <div className="grid gap-2 text-xs sm:grid-cols-2 sm:items-center">
                      <p className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 font-medium text-rose-800 line-through decoration-rose-400">
                        {item.original}
                      </p>
                      <p className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 font-extrabold text-emerald-800">
                        {item.corrected}
                      </p>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Upgrades */}
          {feedback.vocabularyUpgrades.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-3">
                Rekomendasi Pilihan Kosakata yang Lebih Baik
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {feedback.vocabularyUpgrades.map((item, index) => (
                  <div
                    className="rounded-2xl border border-slate-200/90 bg-slate-50 p-4"
                    key={`${item.used}-${index}`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-bold line-through">{item.used}</span>
                      <span className="text-slate-300 font-bold">/</span>
                      <span className="font-black text-indigo-700">{item.better}</span>
                    </div>
                    <p className="mt-2 text-xs italic text-slate-600">
                      &ldquo;{item.example}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Lesson Recommendation Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-amber-400">
                <Icon name="lightbulb" className="size-5" />
              </span>
              <div>
                <h4 className="text-sm font-black text-white">Saran Latihan Selanjutnya</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{feedback.nextFocus}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              className="rounded-2xl border border-slate-300 px-6 py-3.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition"
              onClick={onClose}
              type="button"
            >
              {closeLabel}
            </button>
            {onPracticeAgain && (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-xs font-black text-white shadow-xs hover:bg-indigo-700 transition"
                onClick={onPracticeAgain}
                type="button"
              >
                <Icon name="repeat" className="size-4" />
                Latihan Topik Ini Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
