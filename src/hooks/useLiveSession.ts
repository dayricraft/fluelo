"use client";

import type { LiveServerMessage, Session, Transcription } from "@google/genai";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  bytesToBase64,
  pcmChunksToWavBase64,
  PcmPlayer,
  startMicRecorder,
  type MicRecorder,
} from "@/lib/audio";
import type { CefrLevel } from "@/lib/levels";
import { SESSION_START, TIME_UP } from "@/lib/prompts";
import { newId, saveSession } from "@/lib/storage";
import type {
  Feedback,
  MissionAssessment,
  SessionMode,
  SessionRecord,
  TranscriptTurn,
} from "@/lib/types";

export type LiveSessionMode = Exclude<SessionMode, "listen-repeat">;

export type LiveSessionStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "evaluating"
  | "complete"
  | "error";

export interface StartLiveSessionOptions {
  mode: LiveSessionMode;
  level: CefrLevel;
  topicId?: string;
  lessonId?: string;
  topicTitle: string;
  partnerId?: string;
  partnerName?: string;
}

export interface UseLiveSessionResult {
  status: LiveSessionStatus;
  transcript: TranscriptTurn[];
  inputLevel: number;
  elapsedSec: number;
  questionNumber: number;
  answerRemainingSec: number | null;
  muted: boolean;
  feedback: Feedback | null;
  saveWarning: string | null;
  error: string | null;
  isActive: boolean;
  startSession: (options: StartLiveSessionOptions) => Promise<void>;
  endSession: () => Promise<void>;
  toggleMute: () => void;
  resetSession: () => void;
}

type TranscriptRole = TranscriptTurn["role"];

interface LiveRun {
  options: StartLiveSessionOptions;
  tokenAbort: AbortController;
  evaluationAbort: AbortController | null;
  cancelConnect?: () => void;
  session: Session | null;
  recorder: MicRecorder | null;
  player: PcmPlayer | null;
  timerId: number | null;
  answerTimerId: number | null;
  answerDeadline: number | null;
  questionNumber: number;
  modelTurnSerial: number;
  modelTurnOpen: boolean;
  pendingAnswerTurn: number | null;
  lastStartedAnswerTurn: number;
  startedAt: number | null;
  chunks: Int16Array[];
  transcript: TranscriptTurn[];
  draftIndexes: Partial<Record<TranscriptRole, number>>;
  muted: boolean;
  ending: boolean;
}

interface LiveTokenResponse {
  token: string;
  model: string;
}

class SessionCancelledError extends Error {
  override name = "AbortError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTokenResponse(value: unknown): value is LiveTokenResponse {
  return (
    isRecord(value) &&
    typeof value.token === "string" &&
    value.token.length > 0 &&
    typeof value.model === "string" &&
    value.model.length > 0
  );
}

function isMissionAssessment(value: unknown): value is MissionAssessment {
  return (
    isRecord(value) &&
    typeof value.score === "number" &&
    Number.isFinite(value.score) &&
    value.score >= 0 &&
    value.score <= 100 &&
    typeof value.passed === "boolean" &&
    Array.isArray(value.criteria) &&
    value.criteria.every(
      (item) =>
        isRecord(item) &&
        typeof item.criterion === "string" &&
        (item.status === "achieved" ||
          item.status === "partial" ||
          item.status === "not-shown") &&
        typeof item.evidence === "string",
    ) &&
    Array.isArray(value.targetVocabularyUsed) &&
    value.targetVocabularyUsed.every((item) => typeof item === "string") &&
    Array.isArray(value.grammarUsed) &&
    value.grammarUsed.every((item) => typeof item === "string") &&
    typeof value.summary === "string"
  );
}

function isFeedback(value: unknown, requireMissionAssessment = false): value is Feedback {
  const valid = (
    isRecord(value) &&
    typeof value.overallBand === "number" &&
    typeof value.cefr === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.criteria) &&
    Array.isArray(value.strengths) &&
    Array.isArray(value.improvements) &&
    Array.isArray(value.corrections) &&
    Array.isArray(value.vocabularyUpgrades) &&
    Array.isArray(value.fillerWords) &&
    typeof value.nextFocus === "string" &&
    typeof value.pronunciationFromAudio === "boolean"
  );
  return valid && (!requireMissionAssessment || isMissionAssessment(value.missionAssessment));
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (isRecord(error) && typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function isAbortError(error: unknown): boolean {
  return error instanceof SessionCancelledError || (isRecord(error) && error.name === "AbortError");
}

async function responseError(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (isRecord(body)) {
      if (typeof body.error === "string" && body.error.trim()) return body.error;
      if (isRecord(body.error) && typeof body.error.message === "string" && body.error.message.trim()) {
        return body.error.message;
      }
      if (typeof body.message === "string" && body.message.trim()) return body.message;
    }
  } catch {
    // The status text below is still more useful than a JSON parsing error.
  }

  return response.statusText ? `${fallback} (${response.status} ${response.statusText})` : fallback;
}

function normalizeTranscriptText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Supports both cumulative transcription updates and delta-style chunks. */
function mergeTranscriptText(current: string, incoming: string): string {
  if (!current) return incoming;
  if (!incoming) return current;

  const currentLower = current.toLocaleLowerCase();
  const incomingLower = incoming.toLocaleLowerCase();
  if (currentLower === incomingLower || currentLower.endsWith(incomingLower)) return current;
  if (incomingLower.startsWith(currentLower)) return incoming;
  if (currentLower.startsWith(incomingLower)) return current;

  const overlapLimit = Math.min(current.length, incoming.length);
  for (let overlap = overlapLimit; overlap > 1; overlap -= 1) {
    if (currentLower.endsWith(incomingLower.slice(0, overlap))) {
      return normalizeTranscriptText(current + incoming.slice(overlap));
    }
  }

  const needsSpace =
    !/[\s\-–—/([{]$/.test(current) && !/^[\s.,!?;:'’"\-–—/\])}]/.test(incoming);
  return normalizeTranscriptText(`${current}${needsSpace ? " " : ""}${incoming}`);
}

function applyTranscription(
  run: LiveRun,
  role: TranscriptRole,
  transcription: Transcription | undefined,
): boolean {
  if (!transcription) return false;

  const incoming = normalizeTranscriptText(transcription.text ?? "");
  let index = run.draftIndexes[role];
  let changed = false;

  if (incoming) {
    if (index === undefined || !run.transcript[index] || run.transcript[index].role !== role) {
      index = run.transcript.push({ role, text: incoming }) - 1;
      run.draftIndexes[role] = index;
      changed = true;
    } else {
      const merged = mergeTranscriptText(run.transcript[index].text, incoming);
      if (merged !== run.transcript[index].text) {
        run.transcript[index] = { role, text: merged };
        changed = true;
      }
    }
  }

  if (transcription.finished) delete run.draftIndexes[role];
  return changed;
}

function snapshotTranscript(run: LiveRun): TranscriptTurn[] {
  return run.transcript
    .map((turn) => ({ ...turn, text: normalizeTranscriptText(turn.text) }))
    .filter((turn) => turn.text.length > 0);
}

function transcriptForEvaluation(turns: TranscriptTurn[]): string {
  if (turns.length === 0) return "(No speech transcript was captured.)";
  return turns.map((turn) => `${turn.role === "user" ? "LEARNER" : "AI PARTNER"}: ${turn.text}`).join("\n");
}

function clearAnswerTimer(run: LiveRun): void {
  if (run.answerTimerId !== null) {
    window.clearInterval(run.answerTimerId);
    run.answerTimerId = null;
  }
  run.answerDeadline = null;
}

function stopTransport(run: LiveRun): void {
  run.tokenAbort.abort();
  run.cancelConnect?.();
  run.cancelConnect = undefined;

  if (run.timerId !== null) {
    window.clearInterval(run.timerId);
    run.timerId = null;
  }

  clearAnswerTimer(run);
  run.pendingAnswerTurn = null;
  run.modelTurnOpen = false;

  run.recorder?.stop();
  run.recorder = null;

  const session = run.session;
  run.session = null;
  if (session) {
    try {
      session.sendRealtimeInput({ audioStreamEnd: true });
    } catch {
      // A socket that has already closed cannot accept the end-of-stream marker.
    }
    try {
      session.close();
    } catch {
      // Closing an already-closed socket is harmless.
    }
  }

  run.player?.close();
  run.player = null;
}

function cancelRun(run: LiveRun): void {
  stopTransport(run);
  run.evaluationAbort?.abort();
  run.evaluationAbort = null;
}

function supportsLiveAudio(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    "AudioContext" in window &&
    "AudioWorkletNode" in window
  );
}

export function useLiveSession(): UseLiveSessionResult {
  const [status, setStatus] = useState<LiveSessionStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [inputLevel, setInputLevel] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [answerRemainingSec, setAnswerRemainingSec] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const runRef = useRef<LiveRun | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const run = runRef.current;
      if (!run) return;
      run.ending = true;
      cancelRun(run);
      runRef.current = null;
    };
  }, []);

  const failRun = useCallback((run: LiveRun, cause: unknown) => {
    if (runRef.current !== run || run.ending) return;

    run.ending = true;
    cancelRun(run);
    runRef.current = null;

    if (!mountedRef.current) return;
    setInputLevel(0);
    setAnswerRemainingSec(null);
    setMuted(false);
    setError(errorMessage(cause, "Sesi suara terhenti karena kesalahan yang tidak diketahui."));
    setStatus("error");
  }, []);

  const startSession = useCallback(
    async (options: StartLiveSessionOptions) => {
      if (runRef.current) return;

      setTranscript([]);
      setInputLevel(0);
      setElapsedSec(0);
      setQuestionNumber(0);
      setAnswerRemainingSec(null);
      setMuted(false);
      setFeedback(null);
      setSaveWarning(null);
      setError(null);

      if (!supportsLiveAudio()) {
        setError("Browser ini belum mendukung mikrofon dan Web Audio yang dibutuhkan untuk sesi Live.");
        setStatus("error");
        return;
      }

      const run: LiveRun = {
        options,
        tokenAbort: new AbortController(),
        evaluationAbort: null,
        session: null,
        recorder: null,
        player: null,
        timerId: null,
        answerTimerId: null,
        answerDeadline: null,
        questionNumber: 0,
        modelTurnSerial: 0,
        modelTurnOpen: false,
        pendingAnswerTurn: null,
        lastStartedAnswerTurn: 0,
        startedAt: null,
        chunks: [],
        transcript: [],
        draftIndexes: {},
        muted: false,
        ending: false,
      };
      runRef.current = run;
      setStatus("connecting");

      const stopAnswerCountdown = () => {
        clearAnswerTimer(run);
        if (mountedRef.current) setAnswerRemainingSec(null);
      };

      const beginAnswerCountdown = (modelTurn: number) => {
        if (
          options.mode !== "toefl-interview" ||
          runRef.current !== run ||
          run.ending ||
          modelTurn <= run.lastStartedAnswerTurn ||
          run.questionNumber >= 4
        ) {
          if (run.pendingAnswerTurn === modelTurn) run.pendingAnswerTurn = null;
          return;
        }

        clearAnswerTimer(run);
        run.pendingAnswerTurn = null;
        run.lastStartedAnswerTurn = modelTurn;
        run.questionNumber += 1;
        run.answerDeadline = Date.now() + 45_000;

        if (mountedRef.current) {
          setQuestionNumber(run.questionNumber);
          setAnswerRemainingSec(45);
        }

        run.answerTimerId = window.setInterval(() => {
          if (
            runRef.current !== run ||
            run.ending ||
            run.answerDeadline === null ||
            !mountedRef.current
          ) {
            return;
          }

          const remaining = Math.max(0, Math.ceil((run.answerDeadline - Date.now()) / 1000));
          setAnswerRemainingSec(remaining);
          if (remaining > 0) return;

          clearAnswerTimer(run);
          try {
            if (!run.session) throw new Error("Koneksi sesi tidak tersedia saat waktu menjawab habis.");
            run.session.sendClientContent({ turns: TIME_UP, turnComplete: true });
          } catch (sendError) {
            failRun(run, sendError);
          }
        }, 250);
      };

      const finishModelTurn = () => {
        if (options.mode !== "toefl-interview" || !run.modelTurnOpen) return;

        run.modelTurnOpen = false;
        const modelTurn = run.modelTurnSerial;
        if (run.questionNumber >= 4 || modelTurn <= run.lastStartedAnswerTurn) {
          run.pendingAnswerTurn = null;
          return;
        }

        run.pendingAnswerTurn = modelTurn;
        if (!run.player?.isPlaying) beginAnswerCountdown(modelTurn);
      };

      try {
        const player = new PcmPlayer();
        run.player = player;
        player.onPlayingChange = (playing) => {
          if (runRef.current !== run || run.ending || !mountedRef.current) return;
          if (playing) {
            stopAnswerCountdown();
            setStatus("speaking");
            return;
          }

          setStatus("listening");
          if (run.pendingAnswerTurn !== null) beginAnswerCountdown(run.pendingAnswerTurn);
        };
        await player.resume();

        if (runRef.current !== run || run.ending) return;

        const tokenResponse = await fetch("/api/live-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: options.mode,
            level: options.level,
            topicId: options.topicId,
            lessonId: options.lessonId,
            partnerId: options.partnerId,
          }),
          signal: run.tokenAbort.signal,
        });
        if (!tokenResponse.ok) {
          throw new Error(await responseError(tokenResponse, "Gagal meminta token sesi Live."));
        }

        const tokenBody: unknown = await tokenResponse.json();
        if (!isTokenResponse(tokenBody)) throw new Error("Respons token sesi Live tidak valid.");
        if (runRef.current !== run || run.ending) return;

        // Dynamic import keeps the browser-only Live transport out of SSR execution.
        const { GoogleGenAI } = await import("@google/genai");
        if (runRef.current !== run || run.ending) return;

        const ai = new GoogleGenAI({
          apiKey: tokenBody.token,
          httpOptions: { apiVersion: "v1alpha" },
        });

        let cancelConnect!: () => void;
        const connectionCancelled = new Promise<never>((_, reject) => {
          cancelConnect = () => reject(new SessionCancelledError("Koneksi sesi dibatalkan."));
        });
        run.cancelConnect = cancelConnect;

        const connectPromise = ai.live.connect({
          model: tokenBody.model,
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              if (runRef.current !== run || run.ending || !mountedRef.current) return;

              try {
                const content = message.serverContent;
                if (!content) return;

                // Output transcription is explicitly unordered relative to
                // modelTurn in the Live protocol, so only generated model
                // content may open/clear an interview question turn.
                if (options.mode === "toefl-interview" && content.modelTurn) {
                  if (!run.modelTurnOpen) {
                    run.modelTurnOpen = true;
                    run.modelTurnSerial += 1;
                  }
                  run.pendingAnswerTurn = null;
                  stopAnswerCountdown();
                }

                let transcriptChanged = false;
                transcriptChanged =
                  applyTranscription(
                    run,
                    "user",
                    content.inputTranscription ?? content.interimInputTranscription,
                  ) || transcriptChanged;
                transcriptChanged =
                  applyTranscription(run, "model", content.outputTranscription) || transcriptChanged;

                if (transcriptChanged) setTranscript(run.transcript.map((turn) => ({ ...turn })));

                if (content.interrupted) {
                  delete run.draftIndexes.model;
                  finishModelTurn();
                  run.player?.clear();
                  setStatus("listening");
                }

                for (const part of content.modelTurn?.parts ?? []) {
                  const inlineData = part.inlineData;
                  const mimeType = inlineData?.mimeType?.toLocaleLowerCase();
                  if (
                    inlineData?.data &&
                    (!mimeType || mimeType.startsWith("audio/pcm") || mimeType.startsWith("audio/l16"))
                  ) {
                    run.player?.enqueueBase64(inlineData.data);
                  }
                }

                if (content.turnComplete) {
                  run.draftIndexes = {};
                  finishModelTurn();
                  if (!run.player?.isPlaying) setStatus("listening");
                }
              } catch (messageError) {
                failRun(run, messageError);
              }
            },
            onerror: (event) => {
              failRun(run, event.error ?? event.message ?? "Koneksi Live mengalami kesalahan.");
            },
            onclose: (event) => {
              if (runRef.current !== run || run.ending) return;
              const detail = event.reason
                ? `Koneksi sesi berakhir: ${event.reason}`
                : `Koneksi sesi berakhir (kode ${event.code}).`;
              failRun(run, detail);
            },
          },
        });

        // If cancellation wins the race, close the SDK session whenever its
        // still-pending connect promise eventually resolves.
        void connectPromise
          .then((lateSession) => {
            if (runRef.current !== run || run.ending) lateSession.close();
          })
          .catch(() => undefined);

        const session = await Promise.race([connectPromise, connectionCancelled]);
        run.cancelConnect = undefined;
        if (runRef.current !== run || run.ending) {
          session.close();
          return;
        }
        run.session = session;

        const recorder = await startMicRecorder((pcm, level) => {
          if (runRef.current !== run || run.ending || run.muted) {
            if (runRef.current === run && run.muted && mountedRef.current) setInputLevel(0);
            return;
          }

          const ownedChunk = new Int16Array(pcm);
          run.chunks.push(ownedChunk);
          if (mountedRef.current) setInputLevel(Number.isFinite(level) ? Math.max(0, Math.min(1, level)) : 0);

          try {
            session.sendRealtimeInput({
              audio: {
                data: bytesToBase64(
                  new Uint8Array(ownedChunk.buffer, ownedChunk.byteOffset, ownedChunk.byteLength),
                ),
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } catch (sendError) {
            failRun(run, sendError);
          }
        });

        if (runRef.current !== run || run.ending) {
          recorder.stop();
          return;
        }
        run.recorder = recorder;
        run.startedAt = Date.now();

        setElapsedSec(0);
        setStatus("listening");
        run.timerId = window.setInterval(() => {
          if (runRef.current !== run || run.ending || run.startedAt === null || !mountedRef.current) return;
          setElapsedSec(Math.floor((Date.now() - run.startedAt) / 1000));
        }, 1000);

        // Every locked server prompt uses this control signal to make the AI
        // greet the learner and begin the selected exercise.
        session.sendClientContent({ turns: SESSION_START, turnComplete: true });
      } catch (startError) {
        if (runRef.current !== run || run.ending || isAbortError(startError)) return;
        failRun(run, startError);
      }
    },
    [failRun],
  );

  const endSession = useCallback(async () => {
    const run = runRef.current;
    if (!run || run.ending) return;

    run.ending = true;
    const startedAt = run.startedAt;

    if (startedAt === null) {
      cancelRun(run);
      runRef.current = null;
      if (mountedRef.current) {
        setInputLevel(0);
        setAnswerRemainingSec(null);
        setMuted(false);
        setStatus("idle");
      }
      return;
    }

    const durationSec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const transcriptSnapshot = snapshotTranscript(run);
    const baseRecord: SessionRecord = {
      id: newId(),
      mode: run.options.mode,
      level: run.options.level,
      topicId: run.options.topicId,
      lessonId: run.options.lessonId,
      topicTitle: run.options.topicTitle,
      startedAt: new Date(startedAt).toISOString(),
      durationSec,
      transcript: transcriptSnapshot,
    };

    stopTransport(run);
    if (mountedRef.current) {
      setInputLevel(0);
      setAnswerRemainingSec(null);
      setMuted(false);
      setElapsedSec(durationSec);
      setStatus("evaluating");
    }

    const evaluationAbort = new AbortController();
    run.evaluationAbort = evaluationAbort;

    try {
      let evaluationBody: Feedback;
      try {
        const audioWavBase64 = run.chunks.length > 0 ? pcmChunksToWavBase64(run.chunks) : undefined;
        const evaluationResponse = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: run.options.mode,
            level: run.options.level,
            topicTitle: run.options.topicTitle,
            lessonId: run.options.lessonId,
            transcript: transcriptForEvaluation(transcriptSnapshot),
            ...(audioWavBase64 ? { audioWavBase64 } : {}),
          }),
          signal: evaluationAbort.signal,
        });
        if (!evaluationResponse.ok) {
          throw new Error(await responseError(evaluationResponse, "Evaluasi sesi gagal."));
        }

        const responseBody: unknown = await evaluationResponse.json();
        if (!isFeedback(responseBody, run.options.mode === "speaking-mission")) {
          throw new Error("Respons evaluasi sesi tidak valid.");
        }
        evaluationBody = responseBody;
      } catch (evaluationError) {
        if (runRef.current !== run || !mountedRef.current || isAbortError(evaluationError)) return;

        // Preserve the conversation even if the evaluator is temporarily down.
        let rawSaved = false;
        try {
          rawSaved = await saveSession(baseRecord);
        } catch {
          // The evaluation error remains the primary failure shown to the learner.
        }
        runRef.current = null;
        const saveNote = rawSaved ? "" : " Percakapan juga belum dapat disimpan di browser.";
        setError(
          `Evaluasi gagal: ${errorMessage(
            evaluationError,
            "Terjadi kesalahan yang tidak diketahui.",
          )}${saveNote}`,
        );
        setStatus("error");
        return;
      }

      if (runRef.current !== run || !mountedRef.current) return;

      let saved = false;
      try {
        saved = await saveSession({ ...baseRecord, feedback: evaluationBody });
      } catch {
        saved = false;
      }
      runRef.current = null;
      setFeedback(evaluationBody);
      setSaveWarning(
        saved
          ? null
          : "Evaluasi berhasil, tetapi hasil belum tersimpan di browser. Periksa ruang penyimpanan lalu coba lagi.",
      );
      setError(null);
      setStatus("complete");
    } finally {
      if (run.evaluationAbort === evaluationAbort) run.evaluationAbort = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const run = runRef.current;
    if (!run || run.ending) return;

    run.muted = !run.muted;
    setMuted(run.muted);
    if (!run.muted) return;

    setInputLevel(0);
    try {
      run.session?.sendRealtimeInput({ audioStreamEnd: true });
    } catch (muteError) {
      failRun(run, muteError);
    }
  }, [failRun]);

  const resetSession = useCallback(() => {
    const run = runRef.current;
    if (run) {
      run.ending = true;
      cancelRun(run);
      runRef.current = null;
    }

    setStatus("idle");
    setTranscript([]);
    setInputLevel(0);
    setElapsedSec(0);
    setQuestionNumber(0);
    setAnswerRemainingSec(null);
    setMuted(false);
    setFeedback(null);
    setSaveWarning(null);
    setError(null);
  }, []);

  const isActive =
    status === "connecting" ||
    status === "listening" ||
    status === "speaking" ||
    status === "evaluating";

  return {
    status,
    transcript,
    inputLevel,
    elapsedSec,
    questionNumber,
    answerRemainingSec,
    muted,
    feedback,
    saveWarning,
    error,
    isActive,
    startSession,
    endSession,
    toggleMute,
    resetSession,
  };
}
