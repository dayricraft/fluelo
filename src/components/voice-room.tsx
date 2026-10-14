"use client";

import { useEffect, useRef } from "react";

import type { SpeakingMission } from "@/lib/speaking-missions";
import type { TranscriptTurn } from "@/lib/types";
import { Icon } from "./icon";

export type VoiceRoomStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "evaluating"
  | "complete"
  | "error";

interface VoiceRoomProps {
  status: VoiceRoomStatus;
  title: string;
  eyebrow: string;
  transcript: TranscriptTurn[];
  elapsedSec: number;
  inputLevel: number;
  interview?: {
    questionNumber: number;
    answerRemainingSec: number | null;
  };
  mission?: SpeakingMission;
  muted: boolean;
  error: string | null;
  onToggleMute: () => void;
  onEnd: () => void;
}

const STATUS_LABELS: Record<VoiceRoomStatus, string> = {
  idle: "Siap memulai",
  connecting: "Menghubungkan Emma…",
  listening: "Emma sedang mendengarkan",
  speaking: "Emma sedang berbicara",
  evaluating: "Menyiapkan laporan…",
  complete: "Sesi selesai",
  error: "Koneksi terhenti",
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function waveHeight(index: number, level: number, active: boolean) {
  if (!active) return 8 + ((index * 7) % 16);
  const curve = 0.35 + Math.abs(Math.sin(index * 0.8)) * 0.65;
  return Math.max(10, Math.min(66, 12 + level * 150 * curve));
}

export function VoiceRoom({
  status,
  title,
  eyebrow,
  transcript,
  elapsedSec,
  inputLevel,
  interview,
  mission,
  muted,
  error,
  onToggleMute,
  onEnd,
}: VoiceRoomProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const active = status === "listening" || status === "speaking";
  const recentTurns = transcript.slice(-6);
  const muteLocked = status === "connecting" || status === "evaluating";
  const questionNumber = interview?.questionNumber ?? 0;
  const countdown = interview?.answerRemainingSec ?? null;
  const countdownProgress =
    countdown === null ? 0 : Math.max(0, Math.min(100, (countdown / 45) * 100));
  const countdownLabel =
    countdown !== null
      ? `${countdown} detik`
      : status === "speaking"
        ? "Dengarkan Emma"
        : status === "evaluating" || status === "complete"
          ? "Sesi selesai"
          : status === "error"
            ? "Timer berhenti"
            : questionNumber > 0
              ? "Menunggu Emma"
              : "Segera dimulai";

  return (
    <section className="animate-rise min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2rem] bg-[#121f39] text-white shadow-[0_28px_80px_rgba(16,27,52,0.28)]">
      <div className="relative flex min-h-[calc(100vh-3rem)] flex-col overflow-hidden">
        <div className="voice-orb voice-orb-one absolute -left-36 top-32 size-80 rounded-full" />
        <div className="voice-orb voice-orb-two absolute -right-40 top-0 size-96 rounded-full" />

        <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a8f0d8]">{eyebrow}</p>
            <h1
              className="mt-1 truncate text-lg font-bold outline-none sm:text-xl"
              ref={titleRef}
              tabIndex={-1}
            >
              {title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-sm font-bold tabular-nums text-slate-200">
            <span className={`size-2 rounded-full ${active ? "animate-pulse bg-emerald-400" : "bg-slate-500"}`} />
            {formatDuration(elapsedSec)}
          </div>
        </header>

        <div className="relative z-10 grid flex-1 gap-5 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)]">
          <div className="flex min-h-[490px] flex-col items-center justify-center rounded-[1.8rem] border border-white/10 bg-white/[0.045] px-5 py-8 text-center backdrop-blur-xl">
            <div className="relative grid place-items-center">
              <div className={`absolute size-56 rounded-full border border-[#78e7c6]/20 ${active ? "animate-orbit-pulse" : ""}`} />
              <div className={`absolute size-44 rounded-full border border-white/10 ${status === "speaking" ? "animate-orbit-pulse-delayed" : ""}`} />
              <div className="emma-avatar relative grid size-32 place-items-center rounded-full shadow-[0_0_70px_rgba(86,214,181,0.25)]">
                <span className="text-4xl font-black tracking-[-0.07em] text-white">E</span>
                <span className="absolute bottom-2 right-2 size-5 rounded-full border-4 border-[#182641] bg-emerald-400" />
              </div>
            </div>

            <p aria-live="polite" className="mt-14 text-lg font-extrabold tracking-[-0.02em] sm:text-xl">
              {STATUS_LABELS[status]}
            </p>
            <p
              className="mt-2 max-w-md text-sm leading-6 text-slate-400"
              role={status === "error" ? "alert" : undefined}
            >
              {status === "listening" &&
                (interview
                  ? countdown !== null
                    ? `Jawab dengan jelas. Waktu tersisa ${countdown} detik.`
                    : "Tunggu pertanyaan Emma berikutnya."
                  : mission
                    ? "Selesaikan tugas misi dengan jawabanmu sendiri. Emma akan membantumu tetap di dalam skenario."
                    : "Bicaralah dengan natural. Emma akan menunggu sampai kamu selesai.")}
              {status === "speaking" && "Dengarkan respons Emma, lalu jawab pertanyaannya."}
              {status === "connecting" && "Menyiapkan mikrofon dan ruang percakapan yang aman."}
              {status === "evaluating" && "AI sedang menilai kelancaran, grammar, kosakata, dan pelafalanmu."}
              {status === "error" && (error ?? "Terjadi masalah pada sesi suara.")}
            </p>

            {interview && (
              <div className="mt-6 w-full max-w-md rounded-2xl border border-white/10 bg-[#0d172b]/70 p-4 text-left shadow-lg shadow-black/10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8ee8ce]">
                      TOEFL Interview
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-white">
                      {questionNumber > 0
                        ? `Pertanyaan ${questionNumber} dari 4`
                        : "Empat pertanyaan bertahap"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black tabular-nums ${
                      countdown !== null && countdown <= 10
                        ? "bg-rose-400/20 text-rose-200"
                        : "bg-white/10 text-slate-200"
                    }`}
                  >
                    {countdownLabel}
                  </span>
                </div>
                <div
                  aria-label={countdown !== null ? `${countdown} detik tersisa` : countdownLabel}
                  aria-valuemax={45}
                  aria-valuemin={0}
                  aria-valuenow={countdown ?? 0}
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                >
                  <span
                    className={`block h-full rounded-full transition-[width,background-color] duration-300 ${
                      countdown !== null && countdown <= 10 ? "bg-rose-400" : "bg-[#56d6b5]"
                    }`}
                    style={{ width: `${countdownProgress}%` }}
                  />
                </div>
                <div className="mt-3 flex gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      className={`h-1.5 flex-1 rounded-full ${
                        step < questionNumber
                          ? "bg-[#56d6b5]/55"
                          : step === questionNumber
                            ? "bg-[#a995ff]"
                            : "bg-white/10"
                      }`}
                      key={step}
                    />
                  ))}
                </div>
              </div>
            )}

            {mission && (
              <section
                aria-labelledby="live-mission-title"
                className="mt-6 w-full max-w-xl rounded-2xl border border-[#8ee8ce]/20 bg-[#0d172b]/70 p-4 text-left shadow-lg shadow-black/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2
                    className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8ee8ce]"
                    id="live-mission-title"
                  >
                    Target misi
                  </h2>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                    Disarankan 2–3 menit
                  </span>
                </div>
                <p className="mt-2 text-sm font-extrabold leading-5 text-white">
                  {mission.learnerTask}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {mission.targetVocabulary.slice(0, 5).map((word) => (
                    <span
                      className="rounded-lg bg-[#56d6b5]/12 px-2 py-1 text-[10px] font-bold text-emerald-100"
                      key={word}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[10px] leading-4 text-slate-400">
                  Tekan “Akhiri sesi” setelah percakapan selesai. Hasil misi tidak mengubah XP atau mastery lesson.
                </p>
              </section>
            )}

            <div className="mt-9 flex h-[74px] items-center justify-center gap-1.5" aria-hidden="true">
              {Array.from({ length: 25 }, (_, index) => (
                <span
                  className={`w-1.5 rounded-full transition-[height,background-color] duration-150 ${
                    status === "speaking" ? "bg-[#ad9af7]" : "bg-[#56d6b5]"
                  }`}
                  key={index}
                  style={{ height: waveHeight(index, inputLevel, active) }}
                />
              ))}
            </div>

            {error && status !== "error" && (
              <div className="mt-6 max-w-lg rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>
            )}
          </div>

          <aside className="flex min-h-[350px] flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.055] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <Icon name="book-open" className="size-4 text-[#8ee8ce]" />
                Live transcript
              </div>
              <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Live</span>
            </div>
            <div className="flex flex-1 flex-col justify-end gap-4 overflow-y-auto p-5">
              {recentTurns.length === 0 ? (
                <div className="my-auto text-center">
                  <Icon name="sparkles" className="mx-auto size-7 text-white/20" />
                  <p className="mt-3 text-sm leading-6 text-slate-500">Percakapan akan muncul di sini saat sesi dimulai.</p>
                </div>
              ) : (
                recentTurns.map((turn, index) => (
                  <div className={`flex gap-3 ${turn.role === "user" ? "flex-row-reverse" : ""}`} key={`${turn.role}-${index}-${turn.text.slice(0, 20)}`}>
                    <span className={`grid size-7 shrink-0 place-items-center rounded-lg text-[10px] font-black ${turn.role === "model" ? "bg-[#6650d2]" : "bg-[#238c73]"}`}>
                      {turn.role === "model" ? "E" : "You"}
                    </span>
                    <p className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-left text-sm leading-6 ${turn.role === "model" ? "rounded-tl-sm bg-white/8 text-slate-200" : "rounded-tr-sm bg-[#56d6b5]/15 text-emerald-50"}`}>
                      {turn.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>

        <footer className="relative z-10 flex flex-col items-center justify-center gap-3 border-t border-white/10 px-5 py-5 sm:flex-row">
          <button
            aria-label={muted ? "Aktifkan mikrofon" : "Matikan mikrofon"}
            aria-pressed={muted}
            className={`inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition ${muted ? "bg-amber-400 text-amber-950 hover:bg-amber-300" : "bg-white/10 text-white hover:bg-white/15"}`}
            disabled={muteLocked}
            onClick={onToggleMute}
            type="button"
          >
            <Icon name={muted ? "mic-off" : "mic"} className="size-5" />
            {muted ? "Nyalakan mic" : "Matikan mic"}
          </button>
          <button
            className="inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl bg-[#ef6672] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-950/25 transition hover:bg-[#e65563] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "evaluating"}
            onClick={onEnd}
            type="button"
          >
            <Icon name="phone-off" className="size-5" />
            Akhiri sesi
          </button>
        </footer>
      </div>
    </section>
  );
}
