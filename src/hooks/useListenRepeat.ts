"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { pcmChunksToWavBase64, startMicRecorder, type MicRecorder } from "@/lib/audio";
import type { CefrLevel } from "@/lib/levels";
import { newId, saveSession } from "@/lib/storage";
import type { ListenRepeatItemResult, SessionRecord, TranscriptTurn } from "@/lib/types";

const ITEM_COUNT = 7;

export type ListenRepeatStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "requesting-microphone"
  | "recording"
  | "scoring"
  | "completed"
  | "error";

export type SpeechSupport = "unknown" | "supported" | "unsupported";

export interface ListenRepeatSet {
  level: CefrLevel;
  scenario: string;
  speaker: string;
  sentences: string[];
}

export interface ListenRepeatCurrentItem {
  /** Zero-based index, useful for selecting an item programmatically. */
  index: number;
  /** One-based number, useful for display. */
  number: number;
  sentence: string;
  result: ListenRepeatItemResult | null;
}

export interface ListenRepeatProgress {
  current: number;
  total: number;
  completed: number;
  remaining: number;
  percent: number;
}

export interface UseListenRepeatOptions {
  level: CefrLevel | null;
  /** Load a fresh seven-item set when the hook mounts or `level` changes. */
  autoLoad?: boolean;
}

export interface UseListenRepeatResult {
  status: ListenRepeatStatus;
  error: string | null;
  notice: string | null;
  speechSupport: SpeechSupport;
  exercise: ListenRepeatSet | null;
  currentItem: ListenRepeatCurrentItem | null;
  currentIndex: number;
  results: Array<ListenRepeatItemResult | null>;
  progress: ListenRepeatProgress;
  micLevel: number;
  completedSession: SessionRecord | null;
  isBusy: boolean;
  canPlay: boolean;
  canRecord: boolean;
  canStopRecording: boolean;
  canNavigate: boolean;
  loadSet: () => Promise<boolean>;
  playCurrentSentence: () => boolean;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<ListenRepeatItemResult | null>;
  cancelRecording: () => boolean;
  selectItem: (index: number) => boolean;
  nextItem: () => boolean;
  previousItem: () => boolean;
  dismissMessage: () => void;
  reset: () => void;
}

interface JsonObject {
  [key: string]: unknown;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readResponseJson(response: Response): Promise<unknown> {
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      isJsonObject(payload) && typeof payload.error === "string"
        ? payload.error
        : `Permintaan gagal (${response.status}).`;
    throw new Error(detail);
  }

  return payload;
}

function parseSet(payload: unknown, level: CefrLevel): ListenRepeatSet {
  if (!isJsonObject(payload)) {
    throw new Error("Format set Listen & Repeat tidak valid.");
  }

  const scenario = typeof payload.scenario === "string" ? payload.scenario.trim() : "";
  const speaker = typeof payload.speaker === "string" ? payload.speaker.trim() : "";
  const sentences = Array.isArray(payload.sentences)
    ? payload.sentences.map((sentence) => (typeof sentence === "string" ? sentence.trim() : ""))
    : [];

  if (!scenario || !speaker || sentences.length !== ITEM_COUNT || sentences.some((sentence) => !sentence)) {
    throw new Error("Server tidak mengembalikan tujuh kalimat latihan yang valid.");
  }

  return { level, scenario, speaker, sentences };
}

function parseScore(payload: unknown, target: string): ListenRepeatItemResult {
  if (!isJsonObject(payload)) {
    throw new Error("Format hasil penilaian tidak valid.");
  }

  const pronunciationIssues = Array.isArray(payload.pronunciationIssues)
    ? payload.pronunciationIssues.map((item) => {
        if (!isJsonObject(item) || typeof item.word !== "string" || typeof item.issue !== "string") {
          return null;
        }
        return { word: item.word.trim(), issue: item.issue.trim() };
      })
    : [];

  if (
    typeof payload.heard !== "string" ||
    typeof payload.accuracy !== "number" ||
    !Number.isFinite(payload.accuracy) ||
    !Array.isArray(payload.missedWords) ||
    payload.missedWords.some((word) => typeof word !== "string") ||
    pronunciationIssues.some((issue) => issue === null) ||
    typeof payload.tip !== "string"
  ) {
    throw new Error("Server mengembalikan hasil penilaian yang tidak lengkap.");
  }

  return {
    target,
    heard: payload.heard.trim(),
    accuracy: Math.max(0, Math.min(100, Math.round(payload.accuracy))),
    missedWords: (payload.missedWords as string[]).map((word) => word.trim()).filter(Boolean),
    pronunciationIssues: pronunciationIssues.filter(
      (issue): issue is { word: string; issue: string } => issue !== null,
    ),
    tip: payload.tip.trim(),
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function microphoneErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "Izin mikrofon ditolak. Izinkan akses mikrofon di browser, lalu coba lagi.";
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return "Mikrofon tidak ditemukan. Sambungkan mikrofon, lalu coba lagi.";
    }
    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return "Mikrofon sedang dipakai aplikasi lain atau tidak dapat dibaca.";
    }
  }

  return errorMessage(error, "Mikrofon tidak dapat dimulai.");
}

function speechRate(level: CefrLevel): number {
  if (level.startsWith("A")) return 0.86;
  if (level.startsWith("B")) return 0.94;
  return 1;
}

/**
 * Client-side controller for one seven-item TOEFL Listen & Repeat session.
 *
 * The hook owns microphone/TTS/request cleanup. A session is persisted only
 * after all seven items have a score.
 */
export function useListenRepeat({
  level,
  autoLoad = true,
}: UseListenRepeatOptions): UseListenRepeatResult {
  const [status, setStatus] = useState<ListenRepeatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [speechSupport, setSpeechSupport] = useState<SpeechSupport>(() =>
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
      ? "supported"
      : "unsupported",
  );
  const [exercise, setExercise] = useState<ListenRepeatSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<ListenRepeatItemResult | null>>([]);
  const [micLevel, setMicLevel] = useState(0);
  const [completedSession, setCompletedSession] = useState<SessionRecord | null>(null);

  const mountedRef = useRef(true);
  const sessionVersionRef = useRef(0);
  const sessionIdRef = useRef("");
  const startedAtRef = useRef(0);
  const resultsRef = useRef<Array<ListenRepeatItemResult | null>>([]);
  const recorderRef = useRef<MicRecorder | null>(null);
  const recorderRequestRef = useRef(0);
  const recordingItemRef = useRef<{ index: number; target: string } | null>(null);
  const pcmChunksRef = useRef<Int16Array[]>([]);
  const loadControllerRef = useRef<AbortController | null>(null);
  const scoreControllerRef = useRef<AbortController | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechRequestRef = useRef(0);

  const stopRecorder = useCallback(() => {
    recorderRequestRef.current += 1;
    recordingItemRef.current = null;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder) recorder.stop();
  }, []);

  const cancelSpeech = useCallback(() => {
    speechRequestRef.current += 1;
    const utterance = utteranceRef.current;
    utteranceRef.current = null;
    if (utterance && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const resetActiveWork = useCallback(() => {
    sessionVersionRef.current += 1;
    loadControllerRef.current?.abort();
    loadControllerRef.current = null;
    scoreControllerRef.current?.abort();
    scoreControllerRef.current = null;
    stopRecorder();
    cancelSpeech();
    pcmChunksRef.current = [];
  }, [cancelSpeech, stopRecorder]);

  const loadSet = useCallback(async (): Promise<boolean> => {
    if (!level) {
      setError("Pilih level CEFR sebelum memulai Listen & Repeat.");
      setStatus("error");
      return false;
    }

    resetActiveWork();
    const version = sessionVersionRef.current;
    const controller = new AbortController();
    loadControllerRef.current = controller;

    setStatus("loading");
    setError(null);
    setNotice(null);
    setExercise(null);
    setCurrentIndex(0);
    resultsRef.current = [];
    setResults([]);
    setMicLevel(0);
    setCompletedSession(null);

    try {
      const response = await fetch(`/api/toefl/listen-repeat?level=${encodeURIComponent(level)}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const loadedSet = parseSet(await readResponseJson(response), level);

      if (!mountedRef.current || controller.signal.aborted || version !== sessionVersionRef.current) {
        return false;
      }

      const emptyResults = Array<ListenRepeatItemResult | null>(loadedSet.sentences.length).fill(null);
      sessionIdRef.current = newId();
      startedAtRef.current = Date.now();
      resultsRef.current = emptyResults;
      setExercise(loadedSet);
      setResults(emptyResults);
      setStatus("ready");
      return true;
    } catch (caught) {
      if (isAbortError(caught) || controller.signal.aborted || version !== sessionVersionRef.current) {
        return false;
      }
      if (mountedRef.current) {
        setError(errorMessage(caught, "Set latihan tidak dapat dimuat."));
        setStatus("error");
      }
      return false;
    } finally {
      if (loadControllerRef.current === controller) loadControllerRef.current = null;
    }
  }, [level, resetActiveWork]);

  const playCurrentSentence = useCallback((): boolean => {
    const sentence = exercise?.sentences[currentIndex];
    if (!sentence || !(status === "ready" || status === "error")) return false;

    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      setSpeechSupport("unsupported");
      setNotice("Browser ini tidak mendukung pemutaran suara. Gunakan teks kalimat yang tersedia.");
      return false;
    }

    cancelSpeech();
    const requestId = speechRequestRef.current;
    const utterance = new SpeechSynthesisUtterance(sentence);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((voice) => voice.lang.toLowerCase() === "en-us") ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

    utterance.lang = englishVoice?.lang ?? "en-US";
    if (englishVoice) utterance.voice = englishVoice;
    utterance.rate = speechRate(exercise.level);
    utterance.pitch = 1;
    utterance.volume = 1;
    utteranceRef.current = utterance;

    utterance.onend = () => {
      if (!mountedRef.current || requestId !== speechRequestRef.current) return;
      utteranceRef.current = null;
      setStatus("ready");
    };
    utterance.onerror = (event) => {
      if (!mountedRef.current || requestId !== speechRequestRef.current) return;
      utteranceRef.current = null;
      setStatus("ready");
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setNotice("Audio tidak dapat diputar. Kalimat tetap dapat dibaca sebagai teks.");
      }
    };

    setError(null);
    setNotice(null);
    setStatus("playing");
    try {
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (caught) {
      utteranceRef.current = null;
      setStatus("ready");
      setNotice(errorMessage(caught, "Audio tidak dapat diputar. Gunakan teks kalimat yang tersedia."));
      return false;
    }
  }, [cancelSpeech, currentIndex, exercise, status]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    const target = exercise?.sentences[currentIndex];
    if (!target || !(["ready", "error", "playing"] as ListenRepeatStatus[]).includes(status)) {
      return false;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      setError("Browser ini tidak mendukung perekaman mikrofon.");
      setStatus("error");
      return false;
    }

    cancelSpeech();
    stopRecorder();
    pcmChunksRef.current = [];
    setMicLevel(0);
    setError(null);
    setNotice(null);
    setStatus("requesting-microphone");

    const requestId = ++recorderRequestRef.current;
    const version = sessionVersionRef.current;

    try {
      const recorder = await startMicRecorder((pcm, levelValue) => {
        if (
          mountedRef.current &&
          requestId === recorderRequestRef.current &&
          version === sessionVersionRef.current
        ) {
          pcmChunksRef.current.push(pcm.slice());
          setMicLevel(levelValue);
        }
      });

      if (
        !mountedRef.current ||
        requestId !== recorderRequestRef.current ||
        version !== sessionVersionRef.current
      ) {
        recorder.stop();
        return false;
      }

      recorderRef.current = recorder;
      recordingItemRef.current = { index: currentIndex, target };
      setStatus("recording");
      return true;
    } catch (caught) {
      if (requestId !== recorderRequestRef.current || version !== sessionVersionRef.current) {
        return false;
      }
      if (mountedRef.current) {
        setMicLevel(0);
        setError(microphoneErrorMessage(caught));
        setStatus("error");
      }
      return false;
    }
  }, [cancelSpeech, currentIndex, exercise, status, stopRecorder]);

  const stopRecording = useCallback(async (): Promise<ListenRepeatItemResult | null> => {
    const recordingItem = recordingItemRef.current;
    const recorder = recorderRef.current;
    if (!recordingItem || !recorder) return null;

    recordingItemRef.current = null;
    recorderRef.current = null;
    recorderRequestRef.current += 1;
    recorder.stop();
    setMicLevel(0);

    let audioWavBase64: string;
    try {
      audioWavBase64 = pcmChunksToWavBase64(pcmChunksRef.current);
    } catch (caught) {
      setError(errorMessage(caught, "Rekaman tidak dapat diproses."));
      setStatus("error");
      return null;
    }

    const version = sessionVersionRef.current;
    const controller = new AbortController();
    scoreControllerRef.current?.abort();
    scoreControllerRef.current = controller;
    setError(null);
    setNotice(null);
    setStatus("scoring");

    try {
      const response = await fetch("/api/toefl/listen-repeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSentence: recordingItem.target,
          audioWavBase64,
        }),
        signal: controller.signal,
      });
      const result = parseScore(await readResponseJson(response), recordingItem.target);

      if (!mountedRef.current || controller.signal.aborted || version !== sessionVersionRef.current) {
        return null;
      }

      const nextResults = [...resultsRef.current];
      nextResults[recordingItem.index] = result;
      resultsRef.current = nextResults;
      setResults(nextResults);

      const finishedResults = nextResults.filter(
        (item): item is ListenRepeatItemResult => item !== null,
      );
      if (exercise && finishedResults.length === exercise.sentences.length) {
        const transcript: TranscriptTurn[] = finishedResults.flatMap((item) => [
          { role: "model", text: item.target },
          { role: "user", text: item.heard },
        ]);
        const session: SessionRecord = {
          id: sessionIdRef.current || newId(),
          mode: "listen-repeat",
          level: exercise.level,
          topicId: "listen-repeat",
          topicTitle: exercise.scenario || "TOEFL Listen & Repeat",
          startedAt: new Date(startedAtRef.current || Date.now()).toISOString(),
          durationSec: Math.max(0, Math.round((Date.now() - (startedAtRef.current || Date.now())) / 1000)),
          transcript,
          listenRepeat: finishedResults,
        };
        await saveSession(session);
        setCompletedSession(session);
        setStatus("completed");
      } else {
        setStatus("ready");
      }

      return result;
    } catch (caught) {
      if (isAbortError(caught) || controller.signal.aborted || version !== sessionVersionRef.current) {
        return null;
      }
      if (mountedRef.current) {
        setError(errorMessage(caught, "Rekaman tidak dapat dinilai."));
        setStatus("error");
      }
      return null;
    } finally {
      pcmChunksRef.current = [];
      if (scoreControllerRef.current === controller) scoreControllerRef.current = null;
    }
  }, [exercise]);

  const cancelRecording = useCallback((): boolean => {
    if (status !== "requesting-microphone" && status !== "recording") return false;
    stopRecorder();
    pcmChunksRef.current = [];
    setMicLevel(0);
    setError(null);
    setStatus(exercise ? "ready" : "idle");
    return true;
  }, [exercise, status, stopRecorder]);

  const canNavigate =
    Boolean(exercise) &&
    (status === "ready" || status === "playing" || status === "completed" || status === "error");

  const selectItem = useCallback(
    (index: number): boolean => {
      if (!exercise || !canNavigate || !Number.isInteger(index) || index < 0 || index >= exercise.sentences.length) {
        return false;
      }

      cancelSpeech();
      setCurrentIndex(index);
      setError(null);
      setNotice(null);
      if (status !== "completed") setStatus("ready");
      return true;
    },
    [canNavigate, cancelSpeech, exercise, status],
  );

  const nextItem = useCallback(
    (): boolean => selectItem(currentIndex + 1),
    [currentIndex, selectItem],
  );

  const previousItem = useCallback(
    (): boolean => selectItem(currentIndex - 1),
    [currentIndex, selectItem],
  );

  const dismissMessage = useCallback(() => {
    setError(null);
    setNotice(null);
    if (status === "error") setStatus(exercise ? "ready" : "idle");
  }, [exercise, status]);

  const reset = useCallback(() => {
    resetActiveWork();
    sessionIdRef.current = "";
    startedAtRef.current = 0;
    resultsRef.current = [];
    setStatus("idle");
    setError(null);
    setNotice(null);
    setExercise(null);
    setCurrentIndex(0);
    setResults([]);
    setMicLevel(0);
    setCompletedSession(null);
  }, [resetActiveWork]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      resetActiveWork();
    };
  }, [resetActiveWork]);

  useEffect(() => {
    if (!autoLoad || !level) return;
    const timeoutId = window.setTimeout(() => {
      void loadSet();
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      loadControllerRef.current?.abort();
    };
  }, [autoLoad, level, loadSet]);

  const currentItem = useMemo<ListenRepeatCurrentItem | null>(() => {
    const sentence = exercise?.sentences[currentIndex];
    if (!sentence) return null;
    return {
      index: currentIndex,
      number: currentIndex + 1,
      sentence,
      result: results[currentIndex] ?? null,
    };
  }, [currentIndex, exercise, results]);

  const progress = useMemo<ListenRepeatProgress>(() => {
    const total = exercise?.sentences.length ?? ITEM_COUNT;
    const completed = results.reduce((count, item) => count + (item ? 1 : 0), 0);
    return {
      current: exercise ? currentIndex + 1 : 0,
      total,
      completed,
      remaining: Math.max(0, total - completed),
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [currentIndex, exercise, results]);

  const canPlay = Boolean(currentItem) && (status === "ready" || status === "error");
  const canRecord =
    Boolean(currentItem) &&
    (status === "ready" || status === "playing" || status === "error") &&
    !completedSession;
  const isBusy =
    status === "loading" ||
    status === "playing" ||
    status === "requesting-microphone" ||
    status === "recording" ||
    status === "scoring";

  return {
    status,
    error,
    notice,
    speechSupport,
    exercise,
    currentItem,
    currentIndex,
    results,
    progress,
    micLevel,
    completedSession,
    isBusy,
    canPlay,
    canRecord,
    canStopRecording: status === "recording",
    canNavigate,
    loadSet,
    playCurrentSentence,
    startRecording,
    stopRecording,
    cancelRecording,
    selectItem,
    nextItem,
    previousItem,
    dismissMessage,
    reset,
  };
}
