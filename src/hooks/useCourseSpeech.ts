"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CourseSpeechStatus =
  | "idle"
  | "speaking"
  | "listening"
  | "complete"
  | "error";

export interface UseCourseSpeechResult {
  /** True when both playback and speech recognition are available. */
  supported: boolean;
  canSpeak: boolean;
  canListen: boolean;
  status: CourseSpeechStatus;
  transcript: string;
  error: string | null;
  speak: (text: string) => boolean;
  startListening: () => boolean;
  stopListening: () => boolean;
  reset: () => void;
}

interface CourseSpeechRecognitionAlternative {
  readonly transcript: string;
}

interface CourseSpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: CourseSpeechRecognitionAlternative;
}

interface CourseSpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: CourseSpeechRecognitionResult;
}

interface CourseSpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: CourseSpeechRecognitionResultList;
}

interface CourseSpeechRecognitionErrorEvent {
  readonly error: string;
  readonly message?: string;
}

interface CourseSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: CourseSpeechRecognitionEvent) => void) | null;
  onerror: ((event: CourseSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface CourseSpeechRecognitionConstructor {
  new (): CourseSpeechRecognition;
}

type CourseSpeechWindow = Window & {
  SpeechRecognition?: CourseSpeechRecognitionConstructor;
  webkitSpeechRecognition?: CourseSpeechRecognitionConstructor;
};

const RECOGNITION_UNSUPPORTED =
  "Browser ini belum mendukung pengenalan suara. Gunakan Chrome atau Edge terbaru, atau isi jawaban secara manual.";

const PLAYBACK_UNSUPPORTED =
  "Browser ini belum mendukung pemutaran suara. Gunakan teks yang tersedia dan isi jawaban secara manual.";

const SPEECH_UNSUPPORTED =
  "Browser ini belum mendukung pemutaran dan pengenalan suara. Gunakan Chrome atau Edge terbaru, atau isi jawaban secara manual.";

function normalizeTranscript(parts: string[]): string {
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function recognitionErrorMessage(error: string, detail?: string): string {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Izin mikrofon ditolak. Izinkan akses mikrofon di browser, lalu coba lagi.";
    case "audio-capture":
      return "Mikrofon tidak ditemukan atau tidak dapat digunakan. Periksa perangkat mikrofon, lalu coba lagi.";
    case "no-speech":
      return "Suara belum terdengar. Dekatkan mikrofon dan coba ucapkan jawaban lagi.";
    case "network":
      return "Pengenalan suara terganggu oleh jaringan. Periksa koneksi internet, lalu coba lagi.";
    case "language-not-supported":
      return "Pengenalan suara bahasa Inggris belum didukung oleh browser ini.";
    case "aborted":
      return "Pengenalan suara dihentikan sebelum selesai. Silakan coba lagi.";
    default:
      return detail?.trim()
        ? `Pengenalan suara gagal: ${detail.trim()}`
        : "Pengenalan suara gagal. Silakan coba lagi atau isi jawaban secara manual.";
  }
}

function playbackErrorMessage(error: string): string {
  if (error === "not-allowed") {
    return "Pemutaran suara diblokir oleh browser. Klik tombol audio, lalu coba lagi.";
  }
  if (error === "language-unavailable" || error === "voice-unavailable") {
    return "Suara bahasa Inggris tidak tersedia di perangkat ini. Gunakan teks yang ditampilkan.";
  }
  return "Audio tidak dapat diputar. Gunakan teks yang ditampilkan, lalu coba lagi.";
}

function clearRecognitionHandlers(recognition: CourseSpeechRecognition): void {
  recognition.onstart = null;
  recognition.onresult = null;
  recognition.onerror = null;
  recognition.onend = null;
}

function clearUtteranceHandlers(utterance: SpeechSynthesisUtterance): void {
  utterance.onstart = null;
  utterance.onend = null;
  utterance.onerror = null;
}

export function useCourseSpeech(): UseCourseSpeechResult {
  const [supported, setSupported] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const [status, setStatus] = useState<CourseSpeechStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(false);
  const operationRef = useRef(0);
  const canSpeakRef = useRef(false);
  const canListenRef = useRef(false);
  const recognitionActiveRef = useRef(false);
  const recognitionConstructorRef = useRef<CourseSpeechRecognitionConstructor | null>(null);
  const utteranceConstructorRef = useRef<typeof SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<CourseSpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const finalTranscriptRef = useRef("");
  const latestTranscriptRef = useRef("");

  const cancelSpeech = useCallback(() => {
    const utterance = utteranceRef.current;
    utteranceRef.current = null;
    if (!utterance) return;

    clearUtteranceHandlers(utterance);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const abortRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognitionActiveRef.current = false;
    if (!recognition) return;

    clearRecognitionHandlers(recognition);
    try {
      recognition.abort();
    } catch {
      // Some browser implementations throw when an inactive recognizer is aborted.
    }
  }, []);

  const speak = useCallback(
    (text: string): boolean => {
      const content = text.trim();
      if (!content) {
        setStatus("error");
        setError("Teks yang akan dibacakan masih kosong.");
        return false;
      }

      if (
        !mountedRef.current ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        !utteranceConstructorRef.current
      ) {
        setStatus("error");
        setError(PLAYBACK_UNSUPPORTED);
        return false;
      }

      const operation = operationRef.current + 1;
      operationRef.current = operation;
      abortRecognition();
      cancelSpeech();

      const utterance = new utteranceConstructorRef.current(content);
      const englishVoice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.lang.toLowerCase() === "en-us");

      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      if (englishVoice) utterance.voice = englishVoice;

      utterance.onstart = () => {
        if (!mountedRef.current || operationRef.current !== operation) return;
        setStatus("speaking");
      };

      utterance.onend = () => {
        if (!mountedRef.current || operationRef.current !== operation) return;
        clearUtteranceHandlers(utterance);
        if (utteranceRef.current === utterance) utteranceRef.current = null;
        setStatus("complete");
      };

      utterance.onerror = (event) => {
        if (!mountedRef.current || operationRef.current !== operation) return;
        clearUtteranceHandlers(utterance);
        if (utteranceRef.current === utterance) utteranceRef.current = null;
        setError(playbackErrorMessage(event.error));
        setStatus("error");
      };

      utteranceRef.current = utterance;
      setError(null);
      setStatus("speaking");

      try {
        window.speechSynthesis.speak(utterance);
        return true;
      } catch {
        clearUtteranceHandlers(utterance);
        if (utteranceRef.current === utterance) utteranceRef.current = null;
        setError("Audio tidak dapat dimulai. Gunakan teks yang ditampilkan, lalu coba lagi.");
        setStatus("error");
        return false;
      }
    },
    [abortRecognition, cancelSpeech],
  );

  const startListening = useCallback((): boolean => {
    if (recognitionActiveRef.current) return false;

    const Recognition = recognitionConstructorRef.current;
    if (!mountedRef.current || !Recognition) {
      setStatus("error");
      setError(RECOGNITION_UNSUPPORTED);
      return false;
    }

    const operation = operationRef.current + 1;
    operationRef.current = operation;
    cancelSpeech();
    abortRecognition();

    const recognition = new Recognition();
    let recognitionFailed = false;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (!mountedRef.current || operationRef.current !== operation) return;
      setStatus("listening");
    };

    recognition.onresult = (event) => {
      if (!mountedRef.current || operationRef.current !== operation) return;

      const finalParts: string[] = [];
      const interimParts: string[] = [];
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const part = result?.[0]?.transcript?.trim();
        if (!part) continue;
        if (result.isFinal) finalParts.push(part);
        else interimParts.push(part);
      }

      const finalText = normalizeTranscript(finalParts);
      const liveText = normalizeTranscript([...finalParts, ...interimParts]);
      finalTranscriptRef.current = finalText;
      latestTranscriptRef.current = liveText;
      setTranscript(liveText);
    };

    recognition.onerror = (event) => {
      if (!mountedRef.current || operationRef.current !== operation) return;
      recognitionFailed = true;
      recognitionActiveRef.current = false;
      setError(recognitionErrorMessage(event.error, event.message));
      setStatus("error");
    };

    recognition.onend = () => {
      if (!mountedRef.current || operationRef.current !== operation) return;

      recognitionActiveRef.current = false;
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      clearRecognitionHandlers(recognition);

      if (recognitionFailed) return;
      const completedTranscript = finalTranscriptRef.current || latestTranscriptRef.current;
      setTranscript(completedTranscript);
      setStatus("complete");
    };

    finalTranscriptRef.current = "";
    latestTranscriptRef.current = "";
    recognitionRef.current = recognition;
    recognitionActiveRef.current = true;
    setTranscript("");
    setError(null);
    setStatus("listening");

    try {
      recognition.start();
      return true;
    } catch {
      recognitionActiveRef.current = false;
      recognitionRef.current = null;
      clearRecognitionHandlers(recognition);
      setError("Mikrofon tidak dapat dimulai. Periksa izin browser, lalu coba lagi.");
      setStatus("error");
      return false;
    }
  }, [abortRecognition, cancelSpeech]);

  const stopListening = useCallback((): boolean => {
    const recognition = recognitionRef.current;
    if (!recognition || !recognitionActiveRef.current) return false;

    try {
      recognition.stop();
      return true;
    } catch {
      const operation = operationRef.current + 1;
      operationRef.current = operation;
      abortRecognition();
      setError("Pengenalan suara tidak dapat dihentikan dengan benar. Silakan coba lagi.");
      setStatus("error");
      return false;
    }
  }, [abortRecognition]);

  const reset = useCallback(() => {
    operationRef.current += 1;
    abortRecognition();
    cancelSpeech();
    finalTranscriptRef.current = "";
    latestTranscriptRef.current = "";
    setTranscript("");

    if (canSpeakRef.current || canListenRef.current) {
      setError(null);
      setStatus("idle");
    } else {
      setError(SPEECH_UNSUPPORTED);
      setStatus("error");
    }
  }, [abortRecognition, cancelSpeech]);

  useEffect(() => {
    mountedRef.current = true;

    const browserWindow = window as CourseSpeechWindow;
    const Recognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
    const Utterance =
      typeof SpeechSynthesisUtterance !== "undefined" ? SpeechSynthesisUtterance : null;
    const canListen = Recognition !== null;
    const canSpeak = "speechSynthesis" in browserWindow && Utterance !== null;
    const hasFullSupport = canListen && canSpeak;

    recognitionConstructorRef.current = Recognition;
    utteranceConstructorRef.current = Utterance;
    canSpeakRef.current = canSpeak;
    canListenRef.current = canListen;
    const unsupportedMessage = canListen
      ? PLAYBACK_UNSUPPORTED
      : canSpeak
        ? RECOGNITION_UNSUPPORTED
        : SPEECH_UNSUPPORTED;
    const supportUpdateId = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setSupported(hasFullSupport);
      setCanSpeak(canSpeak);
      setCanListen(canListen);
      if (!hasFullSupport) {
        setError(unsupportedMessage);
        setStatus("error");
      }
    }, 0);

    return () => {
      window.clearTimeout(supportUpdateId);
      mountedRef.current = false;
      operationRef.current += 1;
      abortRecognition();
      cancelSpeech();
      recognitionConstructorRef.current = null;
      utteranceConstructorRef.current = null;
      canSpeakRef.current = false;
      canListenRef.current = false;
    };
  }, [abortRecognition, cancelSpeech]);

  return {
    supported,
    canSpeak,
    canListen,
    status,
    transcript,
    error,
    speak,
    startListening,
    stopListening,
    reset,
  };
}
