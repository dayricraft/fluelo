"use client";

import { useRef, useState } from "react";

import { useCourseSpeech } from "@/hooks/useCourseSpeech";
import type {
  LessonContent,
  LessonPractice,
  PracticeType,
} from "@/lib/course-content/types";
import {
  scorePractice,
  seededShuffle,
  type PracticeResponse,
  type PracticeResult,
} from "@/lib/practice-engine";
import type { PracticeProgressInput } from "@/lib/learning-progress";
import type { StoredLearningAttemptResult } from "@/lib/storage";
import { Icon, type IconName } from "./icon";

interface PracticeSessionProps {
  content: LessonContent;
  lessonTitle: string;
  onBack: () => void;
  onComplete: (
    practiceResults: readonly PracticeProgressInput[],
    review: boolean,
  ) => Promise<StoredLearningAttemptResult>;
  reviewPracticeIds?: readonly string[];
}

const PRACTICE_META: Record<
  PracticeType,
  { label: string; eyebrow: string; icon: IconName; className: string }
> = {
  "multiple-choice": {
    label: "Pilihan ganda",
    eyebrow: "Pilih satu jawaban",
    icon: "check",
    className: "bg-violet-100 text-violet-700",
  },
  "vocabulary-match": {
    label: "Cocokkan kosakata",
    eyebrow: "Hubungkan semua pasangan",
    icon: "repeat",
    className: "bg-emerald-100 text-emerald-700",
  },
  "word-order": {
    label: "Susun kata",
    eyebrow: "Bangun kalimat yang benar",
    icon: "sparkles",
    className: "bg-sky-100 text-sky-700",
  },
  "verb-fill": {
    label: "Isi verb",
    eyebrow: "Lengkapi bagian kosong",
    icon: "lightbulb",
    className: "bg-amber-100 text-amber-800",
  },
  "listen-speak": {
    label: "Listen / Speak",
    eyebrow: "Dengarkan dengan saksama",
    icon: "headphones",
    className: "bg-rose-100 text-rose-700",
  },
};

function formatScore(value: number) {
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function focusElement(id: string) {
  window.requestAnimationFrame(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById(id)?.focus({ preventScroll: true });
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  });
}

export function PracticeSession({
  content,
  lessonTitle,
  onBack,
  onComplete,
  reviewPracticeIds,
}: PracticeSessionProps) {
  const speech = useCourseSpeech();
  const completionCommittedRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [submittedResult, setSubmittedResult] = useState<PracticeResult | null>(null);
  const [finished, setFinished] = useState(false);
  const [completionReceipt, setCompletionReceipt] =
    useState<StoredLearningAttemptResult | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completionSaving, setCompletionSaving] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const [selectedWordIndexes, setSelectedWordIndexes] = useState<number[]>([]);
  const [verbAnswer, setVerbAnswer] = useState("");
  const [manualSpeechAnswer, setManualSpeechAnswer] = useState("");
  const [manualSpeechEdited, setManualSpeechEdited] = useState(false);
  const [speechAction, setSpeechAction] = useState<"audio" | "mic" | null>(null);

  const reviewMode = reviewPracticeIds !== undefined;
  const reviewIdSet = reviewMode ? new Set(reviewPracticeIds) : null;
  const practices = reviewIdSet
    ? content.practice.filter((item) => reviewIdSet.has(item.id))
    : content.practice;
  const practice = practices[currentIndex];
  const totalScore = results.reduce((total, result) => total + result.score, 0);
  const spokenAnswer = manualSpeechEdited
    ? manualSpeechAnswer
    : speech.transcript;

  const clearAnswer = () => {
    setSelectedOption("");
    setMatches({});
    setActiveTermId(null);
    setSelectedWordIndexes([]);
    setVerbAnswer("");
    setManualSpeechAnswer("");
    setManualSpeechEdited(false);
    setSpeechAction(null);
    setSubmittedResult(null);
    speech.stopListening();
    speech.reset();
  };

  const handleBack = () => {
    speech.stopListening();
    speech.reset();
    onBack();
  };

  const responseFor = (current: LessonPractice): PracticeResponse | null => {
    switch (current.type) {
      case "multiple-choice":
        return selectedOption
          ? { type: "multiple-choice", answer: selectedOption }
          : null;
      case "vocabulary-match":
        return Object.keys(matches).length === current.pairs.length
          ? { type: "vocabulary-match", matches }
          : null;
      case "word-order":
        return selectedWordIndexes.length === current.words.length
          ? {
              type: "word-order",
              words: selectedWordIndexes.map((index) => current.words[index]),
            }
          : null;
      case "verb-fill": {
        const answer = verbAnswer.trim();
        return answer ? { type: "verb-fill", answer } : null;
      }
      case "listen-speak": {
        const answer =
          current.mode === "listen-and-choose"
            ? selectedOption
            : spokenAnswer.trim();
        return answer ? { type: "listen-speak", answer } : null;
      }
    }
  };

  const response = practice ? responseFor(practice) : null;

  const submitAnswer = () => {
    if (!practice || !response || submittedResult) return;
    if (
      practice.type === "listen-speak" &&
      practice.mode !== "listen-and-choose" &&
      speech.status === "listening"
    ) {
      return;
    }
    speech.stopListening();
    const result = scorePractice(practice, response);
    setSubmittedResult(result);
    setResults((current) => [...current, result]);
    focusElement("practice-feedback");
  };

  const commitCompletion = async () => {
    if (completionCommittedRef.current) return;
    completionCommittedRef.current = true;
    setCompletionSaving(true);
    try {
      const receipt = await onComplete(
        results.map((result, index) => ({
          practiceId: practices[index].id,
          score: result.score,
        })),
        reviewMode,
      );
      setCompletionReceipt(receipt);
      setCompletionError(null);
      if (!receipt.persisted) completionCommittedRef.current = false;
    } catch (error) {
      completionCommittedRef.current = false;
      setCompletionError(
        error instanceof Error
          ? error.message
          : "Progres belum dapat diproses. Silakan coba lagi.",
      );
    } finally {
      setCompletionSaving(false);
    }
  };

  const continueSession = async () => {
    if (!submittedResult) return;
    if (currentIndex >= practices.length - 1) {
      if (completionCommittedRef.current) return;
      await commitCompletion();
      speech.reset();
      setFinished(true);
      focusElement("practice-summary-title");
      return;
    }

    clearAnswer();
    setCurrentIndex((index) => index + 1);
    focusElement("practice-question-title");
  };

  const restartSession = () => {
    speech.stopListening();
    speech.reset();
    setCurrentIndex(0);
    setResults([]);
    setFinished(false);
    completionCommittedRef.current = false;
    setCompletionReceipt(null);
    setCompletionError(null);
    setCompletionSaving(false);
    setSelectedOption("");
    setMatches({});
    setActiveTermId(null);
    setSelectedWordIndexes([]);
    setVerbAnswer("");
    setManualSpeechAnswer("");
    setManualSpeechEdited(false);
    setSpeechAction(null);
    setSubmittedResult(null);
    focusElement("practice-question-title");
  };

  const chooseMatch = (match: string) => {
    if (!activeTermId || submittedResult) return;
    setMatches((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(
          ([termId, currentMatch]) =>
            termId !== activeTermId && currentMatch !== match,
        ),
      );
      next[activeTermId] = match;
      return next;
    });
    setActiveTermId(null);
  };

  const toggleListening = () => {
    setSpeechAction("mic");
    if (speech.status === "listening") {
      speech.stopListening();
      return;
    }
    setManualSpeechAnswer("");
    setManualSpeechEdited(false);
    speech.reset();
    speech.startListening();
  };

  const renderOptions = (options: readonly string[], answer: string, seed: string) => {
    const shuffled = seededShuffle(options, seed);
    return (
      <div className="mt-5 grid gap-2.5">
        {shuffled.map((option, index) => {
          const selected = selectedOption === option;
          const correctAfterSubmit = Boolean(submittedResult) && option === answer;
          const wrongAfterSubmit = Boolean(submittedResult) && selected && option !== answer;
          return (
            <button
              aria-pressed={selected}
              className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                correctAfterSubmit
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : wrongAfterSubmit
                    ? "border-rose-300 bg-rose-50 text-rose-900"
                    : selected
                      ? "border-violet-400 bg-violet-50 text-violet-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/40"
              } disabled:cursor-default`}
              disabled={Boolean(submittedResult)}
              key={`${option}-${index}`}
              onClick={() => setSelectedOption(option)}
              type="button"
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-xl text-xs font-black ${
                  correctAfterSubmit
                    ? "bg-emerald-600 text-white"
                    : wrongAfterSubmit
                      ? "bg-rose-500 text-white"
                      : selected
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-500"
                }`}
              >
                {correctAfterSubmit ? (
                  <Icon className="size-4" name="check" />
                ) : wrongAfterSubmit ? (
                  <Icon className="size-4" name="x" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>
              <span className="min-w-0 flex-1">{option}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderPractice = (current: LessonPractice) => {
    switch (current.type) {
      case "multiple-choice":
        return (
          <div>
            <p className="mt-5 text-lg font-black leading-7 text-slate-900">
              {current.prompt}
            </p>
            {renderOptions(
              current.options,
              current.answer,
              `${current.id}:options`,
            )}
          </div>
        );

      case "vocabulary-match": {
        const shuffledTerms = seededShuffle(
          current.pairs,
          `${current.id}:terms`,
        );
        const shuffledMeanings = seededShuffle(
          current.pairs.map((pair) => ({ id: pair.id, match: pair.match })),
          `${current.id}:meanings`,
        );
        return (
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold leading-5 text-slate-500">
                Pilih kata di kiri, lalu pilih artinya di kanan.
              </p>
              {Object.keys(matches).length > 0 && !submittedResult && (
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-slate-500 transition hover:bg-slate-100"
                  onClick={() => {
                    setMatches({});
                    setActiveTermId(null);
                  }}
                  type="button"
                >
                  <Icon className="size-3.5" name="rotate" />
                  Reset pasangan
                </button>
              )}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2" aria-label="Daftar kosakata">
                {shuffledTerms.map((pair, index) => {
                  const active = activeTermId === pair.id;
                  const matched = matches[pair.id];
                  return (
                    <button
                      aria-pressed={active}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                        active
                          ? "border-violet-400 bg-violet-50 shadow-sm"
                          : matched
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-violet-200"
                      }`}
                      disabled={Boolean(submittedResult)}
                      key={pair.id}
                      onClick={() => setActiveTermId(pair.id)}
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`grid size-6 shrink-0 place-items-center rounded-lg text-[10px] font-black ${
                          active
                            ? "bg-violet-600 text-white"
                            : matched
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500"
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {pair.term}
                        </span>
                      </span>
                      {matched && (
                        <span className="mt-1.5 block truncate pl-8 text-[10px] font-bold text-emerald-700">
                          → {matched}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2" aria-label="Daftar arti">
                {shuffledMeanings.map((item, index) => {
                  const usedBy = Object.entries(matches).find(
                    ([, match]) => match === item.match,
                  )?.[0];
                  return (
                    <button
                      className={`flex min-h-12 w-full items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-bold transition ${
                        usedBy
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : activeTermId
                            ? "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                            : "border-slate-100 bg-slate-50 text-slate-400"
                      }`}
                      disabled={Boolean(submittedResult) || !activeTermId}
                      key={item.id}
                      onClick={() => chooseMatch(item.match)}
                      type="button"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-white text-[10px] font-black text-slate-400 shadow-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {item.match}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] font-bold text-slate-400">
              {Object.keys(matches).length} dari {current.pairs.length} pasangan terhubung
            </p>
          </div>
        );
      }

      case "word-order": {
        const tokens = current.words.map((word, index) => ({ index, word }));
        const shuffledTokens = seededShuffle(tokens, `${current.id}:words`);
        const selectedTokens = selectedWordIndexes.map((index) => ({
          index,
          word: current.words[index],
        }));
        return (
          <div className="mt-5">
            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-sky-800">
                {current.prompt}
              </p>
              <div className="mt-3 min-h-16 rounded-xl border border-dashed border-sky-200 bg-white p-3">
                {selectedTokens.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTokens.map((token, position) => (
                      <button
                        aria-label={`Hapus kata ${token.word} dari posisi ${position + 1}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#172440] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#263858]"
                        disabled={Boolean(submittedResult)}
                        key={token.index}
                        onClick={() =>
                          setSelectedWordIndexes((currentIndexes) =>
                            currentIndexes.filter((index) => index !== token.index),
                          )
                        }
                        type="button"
                      >
                        <span className="text-[9px] font-black text-slate-400">
                          {position + 1}
                        </span>
                        {token.word}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-2 text-center text-xs text-slate-400">
                    Pilih kata untuk mulai menyusun kalimat.
                  </p>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {shuffledTokens.map((token) => {
                  const used = selectedWordIndexes.includes(token.index);
                  return (
                    <button
                      className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-400 disabled:cursor-default disabled:opacity-25"
                      disabled={used || Boolean(submittedResult)}
                      key={token.index}
                      onClick={() =>
                        setSelectedWordIndexes((currentIndexes) => [
                          ...currentIndexes,
                          token.index,
                        ])
                      }
                      type="button"
                    >
                      {token.word}
                    </button>
                  );
                })}
              </div>
            </div>
            {!submittedResult && (
              <div className="mt-3 flex justify-end gap-2">
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                  disabled={selectedWordIndexes.length === 0}
                  onClick={() =>
                    setSelectedWordIndexes((currentIndexes) =>
                      currentIndexes.slice(0, -1),
                    )
                  }
                  type="button"
                >
                  <Icon className="size-3.5 rotate-180" name="arrow-right" />
                  Urungkan
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                  disabled={selectedWordIndexes.length === 0}
                  onClick={() => setSelectedWordIndexes([])}
                  type="button"
                >
                  <Icon className="size-3.5" name="rotate" />
                  Reset
                </button>
              </div>
            )}
          </div>
        );
      }

      case "verb-fill":
        return (
          <div className="mt-5">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-800">
                  Lengkapi kalimat
                </span>
                <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-amber-700 shadow-sm">
                  Base verb: {current.baseVerb}
                </span>
              </div>
              <p className="mt-4 text-lg font-black leading-8 text-slate-900">
                {current.sentence}
              </p>
              <label className="mt-4 block">
                <span className="text-xs font-bold text-slate-600">Jawabanmu</span>
                <input
                  autoComplete="off"
                  className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base font-bold text-slate-900 outline-none transition focus:ring-4 ${
                    submittedResult
                      ? submittedResult.correct
                        ? "border-emerald-400 focus:ring-emerald-100"
                        : "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                  disabled={Boolean(submittedResult)}
                  onChange={(event) => setVerbAnswer(event.target.value)}
                  placeholder={`Bentuk yang tepat dari “${current.baseVerb}”`}
                  spellCheck={false}
                  value={verbAnswer}
                />
              </label>
            </div>
          </div>
        );

      case "listen-speak": {
        const choosing = current.mode === "listen-and-choose";
        return (
          <div className="mt-5">
            <div className="rounded-2xl bg-[#172440] p-4 text-white sm:p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#8ee8ce]">
                    <Icon
                      className={`size-5 ${speech.status === "speaking" ? "animate-pulse" : ""}`}
                      name="volume"
                    />
                  </span>
                  <div>
                    <p className="text-xs font-black">
                      {speech.status === "speaking" ? "Audio sedang diputar" : "Dengarkan audio"}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                      Kamu boleh memutarnya lebih dari sekali.
                    </p>
                  </div>
                </div>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8ee8ce] px-4 py-2.5 text-xs font-black text-[#17372f] transition hover:bg-[#a7f0dc] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!speech.canSpeak || speech.status === "listening"}
                  onClick={() => {
                    setSpeechAction("audio");
                    speech.speak(current.audioText);
                  }}
                  type="button"
                >
                  <Icon className="size-4" name="play" />
                  {speech.status === "speaking" ? "Putar ulang" : "Putar audio"}
                </button>
              </div>
              {((!speech.canSpeak && Boolean(speech.error)) ||
                (speechAction === "audio" && Boolean(speech.error))) && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/8 p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-300">
                    Audio tidak tersedia · gunakan teks
                  </p>
                  <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-200">
                    {current.audioText}
                  </p>
                </div>
              )}
              {speechAction === "audio" && speech.error && (
                <p className="mt-3 text-[11px] font-semibold leading-5 text-rose-300" role="alert">
                  {speech.error}
                </p>
              )}
            </div>

            <p className="mt-4 text-base font-black leading-7 text-slate-900">
              {current.prompt}
            </p>

            {choosing ? (
              renderOptions(
                current.options,
                current.answer,
                `${current.id}:listen-options`,
              )
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-800">
                      Rekam atau ketik jawaban
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">
                      Transkrip dapat diedit sebelum diperiksa.
                    </p>
                  </div>
                  <button
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      speech.status === "listening"
                        ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                    }`}
                    disabled={!speech.canListen || Boolean(submittedResult)}
                    onClick={toggleListening}
                    type="button"
                  >
                    <Icon
                      className={`size-4 ${speech.status === "listening" ? "animate-pulse" : ""}`}
                      name={speech.status === "listening" ? "mic-off" : "mic"}
                    />
                    {speech.status === "listening" ? "Hentikan rekaman" : "Gunakan mikrofon"}
                  </button>
                </div>

                {!speech.canListen && Boolean(speech.error) && (
                  <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-800">
                    Pengenalan suara tidak tersedia di browser ini. Kamu tetap dapat mengetik jawaban secara manual.
                  </p>
                )}

                <label className="mt-4 block">
                  <span className="text-xs font-bold text-slate-600">
                    {speech.status === "listening" ? "Sedang mendengarkan…" : "Jawaban atau transkrip"}
                  </span>
                  <textarea
                    className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100"
                    disabled={Boolean(submittedResult)}
                    onChange={(event) => {
                      setManualSpeechEdited(true);
                      setManualSpeechAnswer(event.target.value);
                    }}
                    placeholder={
                      current.mode === "guided-speaking"
                        ? "Tulis atau ucapkan jawabanmu dengan kalimat lengkap…"
                        : "Transkrip ucapanmu akan muncul di sini…"
                    }
                    value={spokenAnswer}
                  />
                </label>
                {speechAction === "mic" && speech.error && (
                  <p className="mt-2 text-[11px] font-semibold leading-5 text-rose-600" role="alert">
                    {speech.error}
                  </p>
                )}
                {spokenAnswer && !submittedResult && (
                  <button
                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 hover:text-slate-800"
                    onClick={() => {
                      speech.reset();
                      setManualSpeechAnswer("");
                      setManualSpeechEdited(false);
                    }}
                    type="button"
                  >
                    <Icon className="size-3.5" name="rotate" />
                    Hapus dan coba lagi
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }
    }
  };

  if (practices.length === 0) {
    return (
      <section className="rounded-[1.8rem] border border-slate-200/80 bg-white p-7 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon className="size-7" name="target" />
        </span>
        <h2 className="mt-4 text-xl font-black text-slate-900">Belum ada latihan</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Materi ini belum memiliki bank latihan yang dapat dijalankan.
        </p>
        <button
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#172440] px-4 py-3 text-sm font-bold text-white"
          onClick={handleBack}
          type="button"
        >
          <Icon className="size-4 rotate-180" name="arrow-right" />
          Kembali ke materi
        </button>
      </section>
    );
  }

  if (finished) {
    const percentage = Math.round((totalScore / practices.length) * 100);
    const criteriaMetCount = results.filter((result) => result.correct).length;
    return (
      <section
        aria-labelledby="practice-summary-title"
        className="animate-rise overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm"
      >
        <div className="relative overflow-hidden bg-[#172440] p-6 text-white sm:p-8">
          <div className="absolute -right-14 -top-16 size-48 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 size-44 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#8ee8ce] text-[#17372f] shadow-xl shadow-black/15">
              <Icon className="size-8" name="star" />
            </span>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8ee8ce]">
              Sesi latihan selesai
            </p>
            <h2
              className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl"
              id="practice-summary-title"
              tabIndex={-1}
            >
              Kerja bagus!
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
              {reviewMode
                ? `Kamu telah menyelesaikan review terarah untuk ${lessonTitle}.`
                : `Kamu telah menyelesaikan semua latihan untuk ${lessonTitle}.`}
            </p>
            <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/8 p-3">
                <p className="text-xl font-black">{formatScore(totalScore)}</p>
                <p className="mt-1 text-[9px] font-bold uppercase text-slate-400">dari {practices.length}</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-3">
                <p className="text-xl font-black">{percentage}%</p>
                <p className="mt-1 text-[9px] font-bold uppercase text-slate-400">skor</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-3">
                <p className="text-xl font-black">{criteriaMetCount}</p>
                <p className="mt-1 text-[9px] font-bold uppercase text-slate-400">sesuai kriteria</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <h3 className="text-sm font-black text-slate-900">Ringkasan jawaban</h3>
          <ol className="mt-3 space-y-2">
            {results.map((result, index) => (
              <li
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"
                key={`${practices[index]?.id ?? "practice"}-${index}`}
              >
                <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${
                  result.correct
                    ? "bg-emerald-100 text-emerald-700"
                    : result.score > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                }`}>
                  <Icon className="size-4" name={result.correct ? "check" : "x"} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black text-slate-800">
                      {index + 1}. {PRACTICE_META[practices[index].type].label}
                    </p>
                    <span className="shrink-0 text-xs font-black text-slate-500">
                      {formatScore(result.score)} / 1
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {result.feedback}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div
            aria-live="polite"
            className={`mt-5 rounded-2xl border p-4 ${
              completionError || completionReceipt?.persisted === false
                ? "border-amber-200 bg-amber-50"
                : "border-violet-200 bg-violet-50"
            }`}
            role="status"
          >
            <div className="flex items-start gap-3">
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                completionError || completionReceipt?.persisted === false
                  ? "bg-amber-100 text-amber-700"
                  : "bg-violet-100 text-violet-700"
              }`}>
                <Icon
                  className="size-4"
                  name={completionError || completionReceipt?.persisted === false ? "lightbulb" : "sparkles"}
                />
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-black ${
                  completionError || completionReceipt?.persisted === false
                    ? "text-amber-950"
                    : "text-violet-950"
                }`}>
                  {completionError || completionReceipt?.persisted === false
                    ? "Progres belum tersimpan"
                    : reviewMode
                      ? "Review tersimpan"
                      : completionReceipt?.xpGained
                        ? `+${completionReceipt.xpGained} XP diperoleh`
                        : "Lesson selesai · XP sudah pernah diperoleh"}
                </p>
                <p className={`mt-1 text-xs leading-5 ${
                  completionError || completionReceipt?.persisted === false
                    ? "text-amber-800"
                    : "text-violet-800"
                }`}>
                  {completionError
                    ? completionError
                    : completionReceipt?.persisted === false
                      ? "Browser menolak penyimpanan. Hasil sesi ini tidak diklaim tersimpan; periksa izin atau ruang penyimpanan lalu coba simpan lagi."
                      : completionReceipt
                        ? `Mastery latihan kini ${completionReceipt.lesson.mastery}%. ${completionReceipt.addedReviewCount > 0 ? `${completionReceipt.addedReviewCount} soal masuk antrean review.` : "Tidak ada soal baru yang perlu direview."}${completionReceipt.resolvedReviewCount > 0 ? ` ${completionReceipt.resolvedReviewCount} soal review terselesaikan.` : ""}`
                        : "Hasil sedang diproses."
                  }
                </p>
                {completionReceipt?.persisted && (
                  <p className="mt-2 text-[10px] leading-4 text-violet-600">
                    Mastery berasal dari skor latihan ini; respons speaking terpandu belum menilai grammar atau pelafalan secara mendalam.
                  </p>
                )}
                {(completionError || completionReceipt?.persisted === false) && (
                  <button
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-3 py-2 text-[11px] font-extrabold text-white transition hover:bg-amber-800 disabled:opacity-60"
                    disabled={completionSaving}
                    onClick={() => void commitCompletion()}
                    type="button"
                  >
                    <Icon className="size-3.5" name="rotate" />
                    {completionSaving ? "Menyimpan…" : "Coba simpan lagi"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
              onClick={restartSession}
              type="button"
            >
              <Icon className="size-4" name="rotate" />
              Ulangi latihan
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#172440] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#263858]"
              onClick={handleBack}
              type="button"
            >
              <Icon className="size-4" name="book-open" />
              Kembali ke materi
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!practice) return null;

  const meta = PRACTICE_META[practice.type];
  const progress = (results.length / practices.length) * 100;
  const guidedSpeechResponse =
    practice.type === "listen-speak" &&
    practice.mode === "guided-speaking";
  const repeatSpeechResponse =
    practice.type === "listen-speak" &&
    practice.mode === "listen-and-repeat";
  const openSpeechResponse = guidedSpeechResponse || repeatSpeechResponse;

  return (
    <section
      aria-labelledby="practice-question-title"
      className="animate-rise overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm"
    >
      <header className="border-b border-slate-100 bg-[#172440] p-5 text-white sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/15 hover:text-white"
            onClick={handleBack}
            type="button"
          >
            <Icon className="size-3.5 rotate-180" name="arrow-right" />
            Kembali ke materi
          </button>
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8ee8ce]">
            {reviewMode ? "Mode review" : "Disimpan saat selesai"}
          </span>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-400">{lessonTitle}</p>
            <p className="mt-1 text-sm font-black">
              Latihan {currentIndex + 1} dari {practices.length}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-black text-[#8ee8ce]">{formatScore(totalScore)}</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">skor sementara</p>
          </div>
        </div>
        <div
          aria-label={`${Math.round(progress)} persen sesi selesai`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress)}
          className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#55cbaa] to-[#8ee8ce] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <form
        className="p-5 sm:p-7"
        onSubmit={(event) => {
          event.preventDefault();
          submitAnswer();
        }}
      >
        <div className="flex items-start gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${meta.className}`}>
            <Icon className="size-5" name={meta.icon} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
              {meta.eyebrow}
            </p>
            <h2
              className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-900"
              id="practice-question-title"
              tabIndex={-1}
            >
              {meta.label}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{practice.instruction}</p>
          </div>
        </div>

        {renderPractice(practice)}

        {submittedResult ? (
          <div
            className={`mt-6 rounded-2xl border p-4 outline-none ${
              submittedResult.correct
                ? "border-emerald-200 bg-emerald-50"
                : submittedResult.score > 0
                  ? "border-amber-200 bg-amber-50"
                  : "border-rose-200 bg-rose-50"
            }`}
            id="practice-feedback"
            role="status"
            tabIndex={-1}
          >
            <div className="flex items-start gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                submittedResult.correct
                  ? "bg-emerald-600 text-white"
                  : submittedResult.score > 0
                    ? "bg-amber-500 text-white"
                    : "bg-rose-500 text-white"
              }`}>
                <Icon className="size-5" name={submittedResult.correct ? "check" : "x"} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-sm font-black ${
                    submittedResult.correct
                      ? "text-emerald-950"
                      : submittedResult.score > 0
                        ? "text-amber-950"
                        : "text-rose-950"
                  }`}>
                    {guidedSpeechResponse
                      ? submittedResult.correct
                        ? "Jawaban cukup lengkap"
                        : submittedResult.score > 0
                          ? "Jawaban perlu sedikit tambahan"
                          : "Jawaban perlu dilengkapi"
                      : repeatSpeechResponse
                        ? submittedResult.correct
                          ? "Transkrip cukup mirip"
                          : submittedResult.score > 0
                            ? "Transkrip belum cukup mirip"
                            : "Belum ada kecocokan"
                      : submittedResult.correct
                        ? "Tepat!"
                        : submittedResult.score > 0
                          ? "Hampir tepat"
                          : "Coba pelajari kembali"}
                  </p>
                  <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-slate-700 shadow-sm">
                    +{formatScore(submittedResult.score)} skor
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-700">
                  {submittedResult.feedback}
                </p>
                {submittedResult.expectedAnswer && (
                  <div className="mt-3 rounded-xl bg-white/80 p-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                      Jawaban acuan
                    </p>
                    <p className="mt-1 text-xs font-extrabold leading-5 text-slate-800">
                      {submittedResult.expectedAnswer}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#172440] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#263858]"
              disabled={completionSaving}
              onClick={continueSession}
              type="button"
            >
              {currentIndex === practices.length - 1
                ? completionSaving
                  ? "Menyimpan progres…"
                  : "Lihat ringkasan"
                : "Lanjutkan"}
              <Icon className="size-4" name="arrow-right" />
            </button>
          </div>
        ) : (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6e55df] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:bg-[#6047d4] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              disabled={
                !response ||
                (openSpeechResponse && speech.status === "listening")
              }
              type="submit"
            >
              Periksa jawaban
              <Icon className="size-4" name="check" />
            </button>
            {(!response ||
              (openSpeechResponse && speech.status === "listening")) && (
              <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">
                {openSpeechResponse && speech.status === "listening"
                  ? "Hentikan rekaman agar transkrip final dapat diperiksa."
                  : "Lengkapi jawaban sebelum diperiksa."}
              </p>
            )}
          </div>
        )}
      </form>
    </section>
  );
}
