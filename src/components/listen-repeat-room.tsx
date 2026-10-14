"use client";

import { useMemo } from "react";

import { useListenRepeat } from "@/hooks/useListenRepeat";
import type { CefrLevel } from "@/lib/levels";
import { Icon } from "./icon";

interface ListenRepeatRoomProps {
  level: CefrLevel;
  onClose: () => void;
}

const STATUS_TEXT = {
  idle: "Menyiapkan latihan",
  loading: "Membuat set latihan…",
  ready: "Dengarkan lalu ulangi",
  playing: "Dengarkan baik-baik…",
  "requesting-microphone": "Meminta akses mikrofon…",
  recording: "Sedang merekam jawabanmu",
  scoring: "Menilai jawaban…",
  completed: "Latihan selesai",
  error: "Terjadi kendala",
} as const;

export function ListenRepeatRoom({ level, onClose }: ListenRepeatRoomProps) {
  const session = useListenRepeat({ level });
  const result = session.currentItem?.result ?? null;
  const average = useMemo(() => {
    const scored = session.results.filter((item) => item !== null);
    if (scored.length === 0) return 0;
    return Math.round(scored.reduce((total, item) => total + item.accuracy, 0) / scored.length);
  }, [session.results]);

  if (session.completedSession) {
    return (
      <section className="animate-rise min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2rem] bg-[#13213b] p-5 text-white shadow-[0_28px_80px_rgba(16,27,52,0.28)] sm:p-9">
        <div className="mx-auto flex min-h-[calc(100vh-7.5rem)] max-w-3xl flex-col items-center justify-center text-center">
          <div className="grid size-20 place-items-center rounded-3xl bg-emerald-400/15 text-emerald-300">
            <Icon name="check" className="size-10" />
          </div>
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-300">7 dari 7 selesai</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Nice work! Latihan selesai.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Kamu sudah menyelesaikan satu set TOEFL Listen & Repeat. Hasilnya otomatis tersimpan di riwayat.
          </p>

          <div className="mt-8 grid w-full gap-3 sm:grid-cols-[190px_1fr]">
            <div className="rounded-3xl bg-white/8 p-6">
              <div className="text-5xl font-black tracking-[-0.06em] text-[#72e1c3]">{average}%</div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Rata-rata akurasi</div>
            </div>
            <div className="grid grid-cols-7 gap-2 rounded-3xl bg-white/8 p-5">
              {session.results.map((item, index) => (
                <div className="flex flex-col items-center justify-center gap-2" key={index}>
                  <div
                    className="grid size-9 place-items-center rounded-xl text-xs font-extrabold"
                    style={{
                      backgroundColor: item && item.accuracy >= 75 ? "rgba(52,211,153,.18)" : "rgba(251,191,36,.16)",
                      color: item && item.accuracy >= 75 ? "#6ee7c5" : "#fcd06b",
                    }}
                  >
                    {item?.accuracy ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-500">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-bold transition hover:bg-white/15"
              onClick={onClose}
              type="button"
            >
              Kembali ke beranda
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6e55df] px-6 py-3.5 text-sm font-bold shadow-lg shadow-violet-950/30 transition hover:bg-[#7d65ec]"
              onClick={() => void session.loadSet()}
              type="button"
            >
              <Icon name="repeat" className="size-4" />
              Set baru
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-rise min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2rem] bg-[#13213b] text-white shadow-[0_28px_80px_rgba(16,27,52,0.28)]">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#81e5c8]">TOEFL · Listen & Repeat</p>
          <h1 className="mt-1 truncate text-lg font-bold">
            {session.exercise?.scenario ?? "Latihan kalimat kampus"}
          </h1>
        </div>
        <button
          aria-label="Tutup latihan"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white/75 transition hover:bg-white/15 hover:text-white"
          onClick={onClose}
          type="button"
        >
          <Icon name="x" className="size-5" />
        </button>
      </header>

      <div className="mx-auto max-w-5xl p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400">Progress sesi</p>
            <p className="mt-1 text-sm font-extrabold">
              {session.progress.completed} dari {session.progress.total} kalimat dinilai
            </p>
          </div>
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold text-slate-300">
            Level {level}
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: session.progress.total }, (_, index) => {
            const itemResult = session.results[index];
            const selected = index === session.currentIndex;
            return (
              <button
                aria-label={"Buka kalimat " + (index + 1)}
                className={`h-2 flex-1 rounded-full transition ${
                  itemResult ? "bg-emerald-400" : selected ? "bg-violet-400" : "bg-white/12"
                }`}
                disabled={!session.canNavigate}
                key={index}
                onClick={() => session.selectItem(index)}
                type="button"
              />
            );
          })}
        </div>

        {session.status === "loading" || session.status === "idle" ? (
          <div className="grid min-h-[480px] place-items-center text-center">
            <div>
              <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-white/8">
                <Icon name="repeat" className="size-9 animate-spin text-violet-300" />
              </div>
              <p className="mt-5 text-lg font-extrabold">{STATUS_TEXT[session.status]}</p>
              <p className="mt-2 text-sm text-slate-400">Emma sedang menyiapkan tujuh kalimat yang sesuai levelmu.</p>
            </div>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="flex min-h-[470px] flex-col rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-violet-300">
                    Kalimat {session.currentItem?.number ?? 1}
                  </span>
                  <p className="mt-1 text-sm text-slate-400">Speaker: {session.exercise?.speaker ?? "Campus staff"}</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  session.status === "recording"
                    ? "animate-pulse bg-rose-400/15 text-rose-300"
                    : "bg-white/8 text-slate-300"
                }`}>
                  {STATUS_TEXT[session.status]}
                </span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <button
                  aria-label="Putar kalimat"
                  className="group relative grid size-24 place-items-center rounded-full bg-[#6e55df] shadow-[0_0_55px_rgba(110,85,223,.35)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!session.canPlay}
                  onClick={session.playCurrentSentence}
                  type="button"
                >
                  <span className="absolute inset-[-12px] rounded-full border border-violet-300/20 transition group-hover:inset-[-17px]" />
                  <Icon name={session.status === "playing" ? "volume" : "play"} className="size-9" />
                </button>
                <h2 className="mt-7 text-xl font-black tracking-[-0.03em]">Dengarkan satu kali, lalu ulangi.</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Perhatikan setiap kata, tekanan, dan ritme pembicara. Tekan mikrofon saat siap.
                </p>

                {(result || session.speechSupport === "unsupported") && session.currentItem && (
                  <div className="mt-6 w-full max-w-xl rounded-2xl border border-white/10 bg-black/10 px-5 py-4 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Target sentence</p>
                    <p className="mt-2 text-base font-semibold leading-7 text-white">“{session.currentItem.sentence}”</p>
                  </div>
                )}

                <div className="mt-8 flex h-12 items-center justify-center gap-1" aria-hidden="true">
                  {Array.from({ length: 19 }, (_, index) => (
                    <span
                      className={`w-1.5 rounded-full transition-all ${
                        session.status === "recording" ? "bg-rose-400" : "bg-[#6edebe]"
                      }`}
                      key={index}
                      style={{
                        height:
                          session.status === "recording"
                            ? Math.max(7, 8 + session.micLevel * 110 * (0.35 + Math.abs(Math.sin(index))))
                            : 8 + ((index * 9) % 25),
                      }}
                    />
                  ))}
                </div>

                {session.canStopRecording ? (
                  <button
                    className="mt-5 inline-flex min-w-56 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-4 text-sm font-extrabold shadow-lg shadow-rose-950/25 transition hover:bg-rose-400"
                    onClick={() => void session.stopRecording()}
                    type="button"
                  >
                    <span className="size-3 rounded-sm bg-white" />
                    Selesai merekam
                  </button>
                ) : (
                  <button
                    className="mt-5 inline-flex min-w-56 items-center justify-center gap-2 rounded-2xl bg-[#38c49c] px-6 py-4 text-sm font-extrabold text-[#102d27] shadow-lg shadow-emerald-950/20 transition hover:bg-[#54d6b1] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!session.canRecord}
                    onClick={() => void session.startRecording()}
                    type="button"
                  >
                    <Icon name="mic" className="size-5" />
                    {session.status === "scoring" ? "Sedang menilai…" : "Mulai mengulang"}
                  </button>
                )}
              </div>

              {(session.error || session.notice) && (
                <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                  session.error
                    ? "border-rose-400/25 bg-rose-400/10 text-rose-100"
                    : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <span>{session.error ?? session.notice}</span>
                    <button aria-label="Tutup pesan" onClick={session.dismissMessage} type="button">
                      <Icon name="x" className="size-4" />
                    </button>
                  </div>
                  {session.error && !session.exercise && (
                    <button className="mt-3 text-xs font-extrabold underline" onClick={() => void session.loadSet()} type="button">
                      Coba lagi
                    </button>
                  )}
                </div>
              )}
            </div>

            <aside className="rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold">Hasil kalimat ini</h3>
                {result && (
                  <span className={`rounded-lg px-2.5 py-1 text-sm font-black ${
                    result.accuracy >= 75 ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-300/15 text-amber-200"
                  }`}>
                    {result.accuracy}%
                  </span>
                )}
              </div>

              {!result ? (
                <div className="grid min-h-72 place-items-center text-center">
                  <div>
                    <Icon name="bar-chart" className="mx-auto size-8 text-white/15" />
                    <p className="mt-3 text-sm leading-6 text-slate-500">Hasil dan tips pelafalan akan muncul setelah rekaman dinilai.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Yang terdengar</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">“{result.heard || "Tidak ada ucapan terdeteksi."}”</p>
                  </div>
                  {result.missedWords.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Kata terlewat</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.missedWords.map((word) => (
                          <span className="rounded-lg bg-rose-400/12 px-2 py-1 text-xs font-bold text-rose-200" key={word}>{word}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.pronunciationIssues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Pelafalan</p>
                      {result.pronunciationIssues.map((issue, index) => (
                        <div className="rounded-xl bg-white/6 p-3" key={index}>
                          <span className="text-xs font-extrabold text-violet-200">{issue.word}</span>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{issue.issue}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-2xl bg-[#6e55df]/15 p-4">
                    <p className="flex items-center gap-2 text-xs font-extrabold text-violet-200">
                      <Icon name="lightbulb" className="size-4" />
                      Tip Emma
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-300">{result.tip}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-2 border-t border-white/10 pt-5">
                <button
                  className="rounded-xl bg-white/8 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/12 disabled:opacity-30"
                  disabled={!session.canNavigate || session.currentIndex === 0}
                  onClick={session.previousItem}
                  type="button"
                >
                  Sebelumnya
                </button>
                <button
                  className="rounded-xl bg-white/8 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/12 disabled:opacity-30"
                  disabled={!session.canNavigate || session.currentIndex >= session.progress.total - 1}
                  onClick={session.nextItem}
                  type="button"
                >
                  Berikutnya
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
