"use client";

import { CRITERION_LABELS, type Feedback } from "@/lib/types";
import { formatBand } from "@/lib/levels";
import { Icon } from "./icon";

interface FeedbackViewProps {
  feedback: Feedback;
  topicTitle: string;
  onClose: () => void;
  closeLabel?: string;
  onPracticeAgain?: () => void;
  warning?: string | null;
}

function scoreColor(score: number) {
  if (score >= 5) return "#7459e8";
  if (score >= 4) return "#20b98b";
  if (score >= 3) return "#f0a44d";
  return "#ef6b78";
}

export function FeedbackView({
  feedback,
  topicTitle,
  onClose,
  closeLabel = "Kembali ke beranda",
  onPracticeAgain,
  warning,
}: FeedbackViewProps) {
  const color = scoreColor(feedback.overallBand);
  const progress = Math.max(0, Math.min(100, (feedback.overallBand / 6) * 100));
  const mission = feedback.missionAssessment;

  return (
    <section className="animate-rise overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(28,38,65,0.13)]">
      <div className="relative overflow-hidden bg-[#172440] px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="feedback-glow absolute -right-20 -top-24 size-64 rounded-full" />
        <div className="relative flex items-start justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85">
              <Icon name="sparkles" className="size-3.5" />
              {mission ? "Speaking Mission selesai" : "Evaluasi selesai"}
            </div>
            <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
              {mission ? "Hasil misi speaking kamu" : "Laporan speaking kamu"}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{topicTitle}</p>
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
          className="mx-5 mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 sm:mx-8"
          role="alert"
        >
          {warning}
        </div>
      )}

      <div className="grid gap-7 p-5 sm:p-8 lg:grid-cols-[230px_1fr]">
        <aside>
          <div className="rounded-3xl bg-slate-50 p-5 text-center">
            <div
              className="relative mx-auto grid size-40 place-items-center rounded-full"
              style={{ background: `conic-gradient(${color} ${progress}%, #e7eaf1 ${progress}% 100%)` }}
            >
              <div className="grid size-[8.3rem] place-items-center rounded-full bg-white shadow-inner">
                <div>
                  <div className="text-4xl font-extrabold tracking-[-0.05em] text-slate-900">
                    {formatBand(feedback.overallBand)}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">dari 6.0</div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="rounded-lg bg-[#e9e3ff] px-3 py-1 text-sm font-extrabold text-[#6047d4]">{feedback.cefr}</span>
              <span className="text-sm font-semibold text-slate-500">Estimasi CEFR</span>
            </div>
            {mission && (
              <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-violet-500">
                  Skor misi
                </p>
                <p className="mt-1 text-2xl font-black text-violet-800">
                  {mission.score}<span className="text-sm text-violet-400">/100</span>
                </p>
                <p className={`mt-1 text-xs font-extrabold ${mission.passed ? "text-emerald-700" : "text-amber-700"}`}>
                  {mission.passed ? "Target misi tercapai" : "Belum tercapai — coba sekali lagi"}
                </p>
              </div>
            )}
            {!feedback.pronunciationFromAudio && (
              <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-left text-xs leading-5 text-amber-800">
                Skor pelafalan diperkirakan dari transkrip karena audio tidak tersedia.
              </p>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-7">
          {mission && (
            <section
              aria-labelledby="mission-assessment-title"
              className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-500">
                    Evidence dari ucapanmu
                  </p>
                  <h3 className="mt-1 text-base font-black text-slate-900" id="mission-assessment-title">
                    Checklist target lesson
                  </h3>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-black ${mission.passed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {mission.criteria.filter((item) => item.status === "achieved").length}/{mission.criteria.length} tercapai
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {mission.criteria.map((item) => {
                  const achieved = item.status === "achieved";
                  const partial = item.status === "partial";
                  return (
                    <div className="rounded-xl border border-white bg-white/85 p-3 shadow-sm" key={item.criterion}>
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${achieved ? "bg-emerald-100 text-emerald-700" : partial ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}>
                          <Icon className="size-3.5" name={achieved ? "check" : "target"} />
                        </span>
                        <div>
                          <p className="text-xs font-extrabold leading-5 text-slate-800">{item.criterion}</p>
                          <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{item.evidence}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs font-semibold leading-5 text-violet-900/75">{mission.summary}</p>
              {(mission.targetVocabularyUsed.length > 0 || mission.grammarUsed.length > 0) && (
                <div className="mt-4 border-t border-violet-100 pt-4">
                  {mission.targetVocabularyUsed.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Kosakata target terdeteksi</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {mission.targetVocabularyUsed.map((item) => (
                          <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800" key={item}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {mission.grammarUsed.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Pola bahasa terdeteksi</p>
                      <ul className="mt-2 space-y-1 text-[11px] leading-5 text-slate-600">
                        {mission.grammarUsed.map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.13em] text-slate-400">Skor per kriteria</h3>
            <div className="mt-4 space-y-4">
              {feedback.criteria.map((criterion) => {
                const criterionColor = scoreColor(criterion.band);
                return (
                  <div key={criterion.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                      <span className="font-bold text-slate-700">{CRITERION_LABELS[criterion.name]}</span>
                      <span className="font-extrabold text-slate-900">{formatBand(criterion.band)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{ backgroundColor: criterionColor, width: `${Math.max(4, (criterion.band / 6) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">{criterion.comment}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#dcd4ff] bg-[#f6f3ff] p-5">
            <div className="flex items-center gap-2 font-extrabold text-[#5039bd]">
              <Icon name="sparkles" className="size-4" />
              Ringkasan Emma
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{feedback.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-emerald-800">
                <span className="grid size-6 place-items-center rounded-full bg-emerald-600 text-white"><Icon name="check" className="size-3.5" /></span>
                Yang sudah bagus
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-emerald-950/75">
                {feedback.strengths.map((item) => <li className="flex gap-2" key={item}><span>•</span><span>{item}</span></li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-amber-800">
                <span className="grid size-6 place-items-center rounded-full bg-amber-500 text-white"><Icon name="target" className="size-3.5" /></span>
                Fokus berikutnya
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-amber-950/75">
                {feedback.improvements.map((item) => <li className="flex gap-2" key={item}><span>•</span><span>{item}</span></li>)}
              </ul>
            </div>
          </div>

          {feedback.corrections.length > 0 && (
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Koreksi penting</h3>
              <div className="mt-3 space-y-3">
                {feedback.corrections.map((item, index) => (
                  <div className="rounded-2xl border border-slate-200 p-4" key={`${item.original}-${index}`}>
                    <div className="grid gap-2 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <p className="rounded-xl bg-rose-50 px-3 py-2 font-medium text-rose-800 line-through decoration-rose-300">{item.original}</p>
                      <Icon name="arrow-right" className="hidden size-4 text-slate-300 sm:block" />
                      <p className="rounded-xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-800">{item.corrected}</p>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedback.vocabularyUpgrades.length > 0 && (
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Upgrade kosakata</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {feedback.vocabularyUpgrades.map((item, index) => (
                  <div className="rounded-2xl bg-slate-50 p-4" key={`${item.used}-${index}`}>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-slate-400">{item.used}</span>
                      <Icon name="arrow-right" className="size-3.5 text-slate-300" />
                      <span className="font-extrabold text-[#6047d4]">{item.better}</span>
                    </div>
                    <p className="mt-2 text-xs italic leading-5 text-slate-500">“{item.example}”</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-[#172440] p-5 text-white">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10"><Icon name="lightbulb" className="size-5 text-[#ffd37d]" /></span>
              <div>
                <h3 className="text-sm font-extrabold">Latihan selanjutnya</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">{feedback.nextFocus}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100" onClick={onClose} type="button">
              {closeLabel}
            </button>
            {onPracticeAgain && (
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6e55df] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-[#6047d4]" onClick={onPracticeAgain} type="button">
                <Icon name="repeat" className="size-4" />
                Latihan lagi
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
