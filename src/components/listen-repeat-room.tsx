"use client";

import { useMemo } from "react";

import { useListenRepeat } from "@/hooks/useListenRepeat";
import type { CefrLevel } from "@/lib/levels";
import { Icon } from "./icon";
import { LueloMascot } from "./mascots";

interface ListenRepeatRoomProps {
  level: CefrLevel;
  onClose: () => void;
}

const STATUS_TEXT = {
  idle: "Menyiapkan latihan",
  loading: "Membuat set latihan...",
  ready: "Dengarkan lalu tirukan",
  playing: "Dengarkan baik-baik...",
  "requesting-microphone": "Meminta izin mikrofon...",
  recording: "Sedang merekam suaramu...",
  scoring: "Menilai pelafalan...",
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
      <section className="animate-rise min-h-[calc(100vh-3rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10 flex flex-col items-center justify-center text-center">
        <div className="max-w-xl mx-auto">
          <LueloMascot state="celebrating" size={130} className="mx-auto" />
          <span className="mt-4 inline-block rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-800">
            7 dari 7 Kalimat Selesai
          </span>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Luar biasa! Latihan selesai.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Kamu telah menyelesaikan satu set TOEFL Listen & Repeat. Hasil akurasi telah otomatis tersimpan di riwayat latihanmu.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-[180px_1fr] items-center text-left">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 text-center">
              <div className="text-5xl font-black text-indigo-700">{average}%</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Rata-rata Akurasi
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {session.results.map((item, index) => (
                <div className="flex flex-col items-center justify-center gap-1.5" key={index}>
                  <div
                    className={`grid size-9 place-items-center rounded-xl text-xs font-black ${
                      item && item.accuracy >= 75
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {item?.accuracy ?? 0}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition"
              onClick={onClose}
              type="button"
            >
              Selesai
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-xs font-black text-white hover:bg-indigo-700 transition shadow-xs"
              onClick={() => void session.loadSet()}
              type="button"
            >
              <Icon name="repeat" className="size-4" />
              Latihan Set Baru
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-rise min-h-[calc(100vh-3rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl flex flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 bg-slate-50">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">
            TOEFL Pronunciation Drill
          </p>
          <h1 className="mt-0.5 truncate text-lg font-black text-slate-900">
            {session.exercise?.scenario ?? "Latihan Kalimat Kampus"}
          </h1>
        </div>
        <button
          aria-label="Tutup latihan"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-200/80 text-slate-600 transition hover:bg-slate-300"
          onClick={onClose}
          type="button"
        >
          <Icon name="x" className="size-4" />
        </button>
      </header>

      <div className="mx-auto w-full max-w-5xl p-6 sm:p-8 flex-1 flex flex-col">
        {/* Progress header */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <div>
            <span className="font-black text-slate-900 text-sm">
              {session.progress.completed} dari {session.progress.total}
            </span>{" "}
            kalimat selesai
          </div>
          <span className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-black text-indigo-700">
            Level {level}
          </span>
        </div>

        {/* Step dots */}
        <div className="mt-3 flex gap-2">
          {Array.from({ length: session.progress.total }, (_, index) => {
            const itemResult = session.results[index];
            const selected = index === session.currentIndex;
            return (
              <button
                aria-label={"Buka kalimat " + (index + 1)}
                className={`h-2 flex-1 rounded-full transition-all ${
                  itemResult
                    ? "bg-emerald-500"
                    : selected
                    ? "bg-indigo-600 ring-2 ring-indigo-200"
                    : "bg-slate-200"
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
          <div className="grid flex-1 place-items-center text-center py-20">
            <div>
              <LueloMascot state="thinking" size={90} className="mx-auto" />
              <p className="mt-4 text-base font-black text-slate-900">{STATUS_TEXT[session.status]}</p>
              <p className="mt-1 text-xs text-slate-500">Menyiapkan tujuh kalimat kampus untukmu.</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Practice Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 text-center">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  Kalimat {session.currentItem?.number ?? 1}
                </span>
                <span className="font-bold text-slate-500">
                  {STATUS_TEXT[session.status]}
                </span>
              </div>

              <div className="my-auto py-8">
                {/* Audio Play Button */}
                <button
                  aria-label="Putar audio kalimat"
                  className="mx-auto grid size-20 place-items-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                  disabled={!session.canPlay}
                  onClick={session.playCurrentSentence}
                  type="button"
                >
                  <Icon
                    name={session.status === "playing" ? "volume" : "play"}
                    className="size-8"
                  />
                </button>

                <h2 className="mt-5 text-xl font-black text-slate-900">
                  Dengarkan baik-baik, lalu tirukan.
                </h2>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Perhatikan pelafalan kata, intonasi, dan ritme kalimat pembicara.
                </p>

                {/* Target Sentence Display */}
                {(result || session.speechSupport === "unsupported") && session.currentItem && (
                  <div className="mt-6 mx-auto max-w-lg rounded-2xl border border-indigo-100 bg-white p-4 shadow-xs text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Kalimat Target
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900 leading-relaxed">
                      &ldquo;{session.currentItem.sentence}&rdquo;
                    </p>
                  </div>
                )}

                {/* Mic Action */}
                <div className="mt-8">
                  {session.canStopRecording ? (
                    <button
                      className="inline-flex min-w-56 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-xs font-black text-white shadow-md shadow-rose-900/15 hover:bg-rose-700 transition"
                      onClick={() => void session.stopRecording()}
                      type="button"
                    >
                      <span className="size-2.5 rounded-sm bg-white animate-pulse" />
                      Selesai Merekam
                    </button>
                  ) : (
                    <button
                      className="inline-flex min-w-56 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-xs font-black text-white shadow-md shadow-amber-900/15 hover:bg-amber-600 transition disabled:opacity-50"
                      disabled={!session.canRecord}
                      onClick={() => void session.startRecording()}
                      type="button"
                    >
                      <Icon name="mic" className="size-4" />
                      {session.status === "scoring" ? "Menilai Ucapan..." : "Mulai Mengulang"}
                    </button>
                  )}
                </div>
              </div>

              {session.error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {session.error}
                </div>
              )}
            </div>

            {/* Result Sidebar */}
            <aside className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <h3 className="text-sm font-black text-slate-900">Hasil Kalimat Ini</h3>
                {result ? (
                  <div className="mt-5 space-y-4">
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                      <p className="text-3xl font-black text-indigo-700">{result.accuracy}%</p>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-0.5">
                        Tingkat Akurasi
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Yang Terdengar
                      </p>
                      <p className="mt-1 text-xs text-slate-700 italic">
                        &ldquo;{result.heard || "Tidak ada suara terdeteksi"}&rdquo;
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center py-6 text-slate-400">
                    <LueloMascot state="idle" size={80} className="mx-auto opacity-70" />
                    <p className="mt-3 text-xs font-bold">Hasil akurasi akan muncul setelah kamu selesai merekam.</p>
                  </div>
                )}
              </div>

              {session.canNavigate && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={session.previousItem}
                    disabled={session.currentIndex === 0}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={session.nextItem}
                    disabled={session.currentIndex >= session.progress.total - 1}
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-black text-white hover:bg-indigo-700 disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
