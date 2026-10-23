"use client";

import { useEffect, useRef } from "react";

import type { SpeakingMission } from "@/lib/speaking-missions";
import type { TranscriptTurn } from "@/lib/types";
import { Icon } from "./icon";
import { HumanCoachMascot, type MascotState } from "./mascots";

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
  partnerName?: string;
  onToggleMute: () => void;
  onEnd: () => void;
}

function getStatusLabel(status: VoiceRoomStatus, partnerName = "Emma"): string {
  switch (status) {
    case "idle":
      return "Siap memulai sesi";
    case "connecting":
      return `Menghubungkan ${partnerName}...`;
    case "listening":
      return `${partnerName} sedang mendengarkan suaramu`;
    case "speaking":
      return `${partnerName} sedang berbicara...`;
    case "evaluating":
      return "Menyiapkan laporan evaluasi...";
    case "complete":
      return "Sesi selesai";
    case "error":
      return "Koneksi terhenti";
  }
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function waveHeight(index: number, level: number, active: boolean) {
  if (!active) return 6 + ((index * 5) % 12);
  const curve = 0.35 + Math.abs(Math.sin(index * 0.8)) * 0.65;
  return Math.max(8, Math.min(60, 10 + level * 140 * curve));
}

export function VoiceRoom({
  status,
  title,
  eyebrow,
  partnerName = "Emma",
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
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const active = status === "listening" || status === "speaking";
  const muteLocked = status === "connecting" || status === "evaluating";
  const questionNumber = interview?.questionNumber ?? 0;
  const countdown = interview?.answerRemainingSec ?? null;
  const countdownProgress =
    countdown === null ? 0 : Math.max(0, Math.min(100, (countdown / 45) * 100));
  const countdownLabel =
    countdown !== null
      ? `${countdown} detik`
      : status === "speaking"
        ? `Dengarkan ${partnerName}`
        : status === "evaluating" || status === "complete"
          ? "Sesi selesai"
          : status === "error"
            ? "Timer berhenti"
            : questionNumber > 0
              ? `Menunggu ${partnerName}`
              : "Segera dimulai";

  // Map status to Luelo Mascot State
  let mascotState: MascotState = "idle";
  if (status === "speaking") mascotState = "speaking";
  else if (status === "listening") mascotState = "listening";
  else if (status === "connecting" || status === "evaluating") mascotState = "thinking";
  else if (status === "complete") mascotState = "celebrating";

  return (
    <section className="h-full w-full flex flex-col overflow-hidden rounded-[26px] border border-[#ECEEF5] bg-white shadow-xl">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#ECEEF5] px-5 sm:px-6 bg-[#FAFAFE]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onEnd}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DCDFE8] bg-white px-3 py-1 text-xs font-bold text-[#5A5C69] hover:bg-[#F4F5FF] hover:text-[#6C5CE7] transition shrink-0"
            title="Keluar dari sesi"
          >
            <Icon name="arrow-left" className="size-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
          <div className="flex flex-col min-w-0">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#6C5CE7]">
              {eyebrow}
            </span>
            <h1
              className="truncate text-sm sm:text-base font-extrabold text-[#181823]"
              ref={titleRef}
              tabIndex={-1}
            >
              {title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E2E4ED] px-3 py-1 text-xs font-bold text-[#181823] shadow-2xs">
            <span
              className={`size-2 rounded-full ${
                active ? "animate-pulse bg-emerald-500" : "bg-slate-400"
              }`}
            />
            <span className="tabular-nums font-mono">{formatDuration(elapsedSec)}</span>
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="grid flex-1 min-h-0 gap-4 sm:gap-5 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr] overflow-hidden">
        {/* Left Stage: Human Coach Mascot & Interactive Prompts */}
        <div className="flex h-full min-h-0 flex-col items-center justify-between rounded-2xl border border-[#ECEEF5] bg-gradient-to-b from-[#F7F8FE] via-white to-[#F4F5FF] p-4 sm:p-5 text-center overflow-hidden">
          {/* Top/Mascot Area */}
          <div className="flex flex-col items-center justify-center my-auto w-full">
            <div className="relative grid place-items-center">
              <HumanCoachMascot
                partnerName={partnerName}
                state={mascotState}
                size={140}
                showAura
              />
            </div>

            <h2 aria-live="polite" className="mt-4 text-lg sm:text-xl font-extrabold text-[#181823]">
              {getStatusLabel(status, partnerName)}
            </h2>

            <p
              className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#7E8190] font-semibold"
              role={status === "error" ? "alert" : undefined}
            >
              {status === "listening" &&
                (interview
                  ? countdown !== null
                    ? `Jawab dengan jelas. Waktu tersisa ${countdown} detik.`
                    : `Tunggu pertanyaan ${partnerName} berikutnya.`
                  : mission
                    ? `Selesaikan tugas misi dengan jawabanmu sendiri. ${partnerName} akan mendampingimu.`
                    : `Bicaralah dengan natural. ${partnerName} akan mendengarkan sampai kamu selesai.`)}
              {status === "speaking" && `Dengarkan respons ${partnerName}, lalu lanjutkan bicaramu.`}
              {status === "connecting" && "Menyiapkan mikrofon dan sambungan suara yang aman."}
              {status === "evaluating" && "AI sedang menganalisis kelancaran, tata bahasa, dan kosakatamu."}
              {status === "error" && (error ?? "Terjadi kendala pada koneksi suara.")}
            </p>

            {/* TOEFL Interview Question Tracker */}
            {interview && (
              <div className="mt-3 w-full max-w-sm rounded-xl border border-indigo-100 bg-white p-3 text-left shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                      Simulasi TOEFL iBT Speaking
                    </p>
                    <p className="mt-0.5 text-xs font-extrabold text-[#181823]">
                      {questionNumber > 0 ? `Pertanyaan ${questionNumber} dari 4` : "Persiapan Soal"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tabular-nums ${
                      countdown !== null && countdown <= 10
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                    }`}
                  >
                    {countdownLabel}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  aria-label={countdown !== null ? `${countdown} detik tersisa` : countdownLabel}
                  aria-valuemax={45}
                  aria-valuemin={0}
                  aria-valuenow={countdown ?? 0}
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 border border-slate-200"
                  role="progressbar"
                >
                  <span
                    className={`block h-full rounded-full transition-all duration-300 ${
                      countdown !== null && countdown <= 10 ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${countdownProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Speaking Mission Card */}
            {mission && (
              <div className="mt-3 w-full max-w-sm rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-left shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                    Target Misi Pelajaran
                  </span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                    2–3 Menit
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-800 leading-snug">
                  {mission.learnerTask}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {mission.targetVocabulary.slice(0, 4).map((word) => (
                    <span
                      key={word}
                      className="rounded-md bg-white border border-teal-200 px-1.5 py-0.5 text-[10px] font-extrabold text-teal-900"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Waveform Indicator */}
          <div className="w-full shrink-0 pt-2">
            <div className="flex h-8 items-center justify-center gap-1.5" aria-hidden="true">
              {Array.from({ length: 22 }, (_, index) => (
                <span
                  key={index}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    status === "speaking"
                      ? "bg-[#6C5CE7]"
                      : status === "listening"
                      ? "bg-[#20BF6B]"
                      : "bg-[#DCDFE8]"
                  }`}
                  style={{ height: waveHeight(index, inputLevel, active) }}
                />
              ))}
            </div>

            {error && status !== "error" && (
              <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Real-time Transcript */}
        <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-[#ECEEF5] bg-[#FAFAFE] overflow-hidden">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#ECEEF5] px-4 bg-white">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#181823]">
              <Icon name="message-square" className="size-4 text-[#6C5CE7]" />
              Transkrip Percakapan
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
              Live
            </span>
          </div>

          <div className="flex flex-1 min-h-0 flex-col gap-2.5 overflow-y-auto p-4">
            {transcript.length === 0 ? (
              <div className="my-auto text-center py-6">
                <p className="text-xs font-semibold text-[#7E8190]">
                  Percakapan antara kamu dan {partnerName} akan muncul di sini secara langsung.
                </p>
              </div>
            ) : (
              transcript.map((turn, index) => {
                const isUser = turn.role === "user";
                return (
                  <div
                    key={`${turn.role}-${index}`}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] font-bold text-[#7E8190] mb-0.5 px-1">
                      {isUser ? "Kamu" : partnerName}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                        isUser
                          ? "bg-[#6C5CE7] text-white rounded-tr-xs"
                          : "bg-white border border-[#ECEEF5] text-[#181823] rounded-tl-xs"
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={transcriptEndRef} />
          </div>
        </aside>
      </div>

      {/* Bottom Controls Bar */}
      <footer className="flex h-16 shrink-0 items-center justify-center gap-3 border-t border-[#ECEEF5] px-5 sm:px-6 bg-[#FAFAFE]">
        <button
          type="button"
          onClick={onToggleMute}
          disabled={muteLocked}
          aria-label={muted ? "Aktifkan mikrofon" : "Matikan mikrofon"}
          aria-pressed={muted}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold transition shadow-2xs ${
            muted
              ? "bg-[#F59E0B] text-white hover:bg-[#D97706]"
              : "bg-white border border-[#DCDFE8] text-[#181823] hover:bg-[#F4F5FF] hover:border-[#6C5CE7]"
          }`}
        >
          <Icon name={muted ? "mic-off" : "mic"} className="size-3.5" />
          <span>{muted ? "Nyalakan Mikrofon" : "Bisukan Mikrofon"}</span>
        </button>

        <button
          type="button"
          onClick={onEnd}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF4D4D] px-6 py-2.5 text-xs font-extrabold text-white shadow-2xs hover:bg-[#E03E3E] transition"
        >
          <Icon name="phone-off" className="size-3.5" />
          <span>{status === "evaluating" ? "Kembali ke Learning Path" : "Akhiri Sesi Bicara"}</span>
        </button>
      </footer>
    </section>
  );
}
