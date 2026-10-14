"use client";

import { useEffect, useRef, useState } from "react";

import {
  useLiveSession,
  type LiveSessionMode,
  type StartLiveSessionOptions,
} from "@/hooks/useLiveSession";
import { LEVELS, type CefrLevel } from "@/lib/levels";
import {
  getSpeakingMission,
  type SpeakingMission,
} from "@/lib/speaking-missions";
import {
  updateProfile,
  useAppData,
} from "@/lib/storage";
import type { Topic } from "@/lib/topics";
import type { Feedback, SessionRecord } from "@/lib/types";
import { DashboardHome } from "./dashboard-home";
import { FeedbackView } from "./feedback-view";
import { Icon, type IconName } from "./icon";
import { LearningPath } from "./learning-path";
import { ListenRepeatRoom } from "./listen-repeat-room";
import { ProfileModal } from "./profile-modal";
import { ProgressViews } from "./progress-views";
import { VoiceRoom } from "./voice-room";

type AppScreen = "dashboard" | "voice" | "listen-repeat";
type DashboardView = "home" | "learn" | "progress" | "history";

const NAV_ITEMS: Array<{ view: DashboardView; label: string; icon: IconName }> = [
  { view: "home", label: "Beranda", icon: "home" },
  { view: "learn", label: "Belajar", icon: "book-open" },
  { view: "progress", label: "Progres", icon: "bar-chart" },
  { view: "history", label: "Riwayat", icon: "history" },
];

const VIEW_LABELS: Record<DashboardView, string> = {
  home: "Dashboard belajar",
  learn: "Jalur belajar A1–A2",
  progress: "Analisis performa",
  history: "Riwayat sesi",
};

function ShellLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f7fb]">
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#172440] text-xl font-black text-white shadow-xl">
          F<span className="text-[#63d5b5]">.</span>
        </div>
        <p className="mt-4 text-sm font-extrabold text-slate-700">Menyiapkan FluentPath</p>
        <div className="mx-auto mt-3 h-1.5 w-28 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#6e55df]" />
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-[0.9rem] bg-white text-lg font-black text-[#172440] shadow-sm">
        F<span className="text-[#34bd97]">.</span>
      </span>
      <span>
        <span className="block text-sm font-black tracking-[-0.03em] text-white">FluentPath</span>
        <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">AI Speaking Coach</span>
      </span>
    </div>
  );
}

export function FluentPathApp() {
  const data = useAppData();
  const live = useLiveSession();
  const [screen, setScreen] = useState<AppScreen>("dashboard");
  const [view, setView] = useState<DashboardView>("home");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDismissed, setProfileDismissed] = useState(false);
  const [activeSession, setActiveSession] = useState<StartLiveSessionOptions | null>(null);
  const [historyRecord, setHistoryRecord] = useState<SessionRecord | null>(null);
  const [returnLessonId, setReturnLessonId] = useState<string | undefined>();
  const appliedPlacementRef = useRef<Feedback | null>(null);

  const level: CefrLevel = data.profile.level ?? "B1";

  useEffect(() => {
    if (
      activeSession?.mode !== "placement" ||
      !live.feedback ||
      appliedPlacementRef.current === live.feedback
    ) {
      return;
    }
    appliedPlacementRef.current = live.feedback;
    void updateProfile({ level: live.feedback.cefr, placementDone: true }).catch((error) => {
      console.error("Gagal menyimpan level placement:", error);
    });
  }, [activeSession?.mode, live.feedback]);

  useEffect(() => {
    if (screen !== "dashboard" || view !== "learn" || !returnLessonId) return;

    // The child reads this value during its mount after a mission. Clear the
    // hand-off on the next frame so later visits follow the user's chosen path.
    const frame = window.requestAnimationFrame(() => setReturnLessonId(undefined));
    return () => window.cancelAnimationFrame(frame);
  }, [returnLessonId, screen, view]);

  if (!data.hydrated) return <ShellLoader />;

  const startVoice = (mode: LiveSessionMode, topic?: Topic) => {
    const options: StartLiveSessionOptions = {
      mode,
      level,
      topicId: topic?.id,
      topicTitle:
        mode === "placement" ? "Placement Test" : topic?.title ?? "Speaking Practice",
    };
    setHistoryRecord(null);
    setActiveSession(options);
    setScreen("voice");
    void live.startSession(options);
  };

  const startMission = (mission: SpeakingMission) => {
    const canonicalMission = getSpeakingMission(mission.lessonId);
    if (!canonicalMission) return;

    const options: StartLiveSessionOptions = {
      mode: "speaking-mission",
      level: canonicalMission.level,
      lessonId: canonicalMission.lessonId,
      topicTitle: canonicalMission.lessonTitle,
    };
    setHistoryRecord(null);
    setReturnLessonId(canonicalMission.lessonId);
    setActiveSession(options);
    setScreen("voice");
    void live.startSession(options);
  };

  const closeLive = () => {
    const returnToLesson = activeSession?.mode === "speaking-mission";
    live.resetSession();
    setActiveSession(null);
    setScreen("dashboard");
    setView(returnToLesson ? "learn" : "home");
  };

  const replayLive = () => {
    if (!activeSession || activeSession.mode === "placement") return;
    const options = activeSession;
    live.resetSession();
    void live.startSession(options);
  };

  const openSession = (session: SessionRecord) => {
    if (session.feedback) {
      setHistoryRecord(session);
      return;
    }
    setView("history");
  };

  if (screen === "listen-repeat") {
    return (
      <main className="min-h-screen bg-[#e9edf5] p-3 sm:p-6">
        <ListenRepeatRoom level={level} onClose={() => setScreen("dashboard")} />
      </main>
    );
  }

  if (screen === "voice") {
    const activeMission = activeSession?.lessonId
      ? getSpeakingMission(activeSession.lessonId)
      : undefined;
    if (live.feedback && activeSession) {
      return (
        <main className="min-h-screen bg-[#e9edf5] p-3 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <FeedbackView
              closeLabel={activeSession.mode === "speaking-mission" ? "Kembali ke lesson" : undefined}
              feedback={live.feedback}
              onClose={closeLive}
              onPracticeAgain={activeSession.mode === "placement" ? undefined : replayLive}
              topicTitle={activeSession.topicTitle}
              warning={live.saveWarning}
            />
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[#e9edf5] p-3 sm:p-6">
        <VoiceRoom
          elapsedSec={live.elapsedSec}
          error={live.error}
          eyebrow={
            activeSession?.mode === "placement"
              ? "Adaptive placement test"
              : activeSession?.mode === "toefl-interview"
                ? "TOEFL · Take an Interview"
                : activeSession?.mode === "speaking-mission"
                  ? "Lesson Speaking Mission"
                  : "Free Talk with Emma"
          }
          inputLevel={live.inputLevel}
          interview={
            activeSession?.mode === "toefl-interview"
              ? {
                  questionNumber: live.questionNumber,
                  answerRemainingSec: live.answerRemainingSec,
                }
              : undefined
          }
          mission={activeMission}
          muted={live.muted}
          onEnd={() => {
            if (
              live.status === "idle" ||
              live.status === "connecting" ||
              live.status === "error" ||
              live.status === "complete"
            ) {
              closeLive();
            }
            else void live.endSession();
          }}
          onToggleMute={live.toggleMute}
          status={live.status}
          title={activeSession?.topicTitle ?? "Speaking Session"}
          transcript={live.transcript}
        />
      </main>
    );
  }

  const report = historyRecord?.feedback;

  return (
    <div className="min-h-screen bg-[#f5f7fb] lg:flex">
      <aside className="hidden w-[244px] shrink-0 flex-col bg-[#172440] p-5 text-white lg:flex">
        <Brand />
        <nav className="mt-10 space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                view === item.view
                  ? "bg-white/11 text-white"
                  : "text-slate-400 hover:bg-white/6 hover:text-white"
              }`}
              key={item.view}
              onClick={() => {
                setHistoryRecord(null);
                setView(item.view);
              }}
              type="button"
            >
              <Icon name={item.icon} className="size-5" />
              {item.label}
              {view === item.view && <span className="ml-auto size-1.5 rounded-full bg-[#5fd7b5]" />}
            </button>
          ))}
        </nav>

        <div className="mt-8 border-t border-white/8 pt-6">
          <p className="px-3 text-[9px] font-extrabold uppercase tracking-[0.17em] text-slate-500">Akun</p>
          <button
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-400 transition hover:bg-white/6 hover:text-white"
            onClick={() => setProfileOpen(true)}
            type="button"
          >
            <Icon name="settings" className="size-5" />
            Pengaturan
          </button>
        </div>

        <div className="mt-auto rounded-2xl border border-white/8 bg-white/[0.045] p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Icon name="lock" className="size-3.5 text-[#63d5b5]" />
            Data tetap privat
          </div>
          <p className="mt-2 text-[10px] leading-4 text-slate-500">Profil, riwayat, XP, dan progres disimpan hanya di browser perangkat ini.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f5f7fb]/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-9">
          <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4">
            <div className="lg:hidden">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-[#172440] text-sm font-black text-white">
                  F<span className="text-[#5fd7b5]">.</span>
                </span>
                <span className="text-sm font-black text-slate-900">FluentPath</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-slate-400">{VIEW_LABELS[view]}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 min-[430px]:inline-flex">
                <Icon className="size-3.5" name="star" />
                {data.learning.totalXp} XP
              </span>
              <label className="relative hidden sm:block">
                <span className="sr-only">Pilih level</span>
                <select
                  className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-xs font-extrabold text-slate-700 outline-none transition hover:border-violet-300 focus:border-violet-400"
                  onChange={(event) => {
                    void updateProfile({ level: event.target.value as CefrLevel }).catch((error) => {
                      console.error("Gagal menyimpan level:", error);
                    });
                  }}
                  value={level}
                >
                  {Object.keys(LEVELS).map((item) => (
                    <option key={item} value={item}>{item} · {LEVELS[item as CefrLevel].nameId}</option>
                  ))}
                </select>
                <Icon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              </label>
              <button
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 transition hover:border-violet-300"
                onClick={() => setProfileOpen(true)}
                type="button"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#7960e6] to-[#42c6a1] text-xs font-black text-white">
                  {(data.profile.name || "L").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-28 truncate text-xs font-extrabold text-slate-800">{data.profile.name || "Learner"}</span>
                  <span className="block text-[9px] font-bold text-slate-400">CEFR {level}</span>
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1320px] px-4 pb-28 pt-6 sm:px-6 lg:px-9 lg:pb-12 lg:pt-8">
          {report && historyRecord ? (
            <FeedbackView
              closeLabel={view === "history" ? "Kembali ke riwayat" : "Kembali ke beranda"}
              feedback={report}
              onClose={() => setHistoryRecord(null)}
              topicTitle={historyRecord.topicTitle}
            />
          ) : view === "home" ? (
            <DashboardHome
              learning={data.learning}
              level={level}
              onOpenHistory={() => setView("history")}
              onOpenLearn={() => setView("learn")}
              onOpenSession={openSession}
              onStartListenRepeat={() => setScreen("listen-repeat")}
              onStartPlacement={() => startVoice("placement")}
              onStartVoice={startVoice}
              profile={data.profile}
              sessions={data.sessions}
            />
          ) : view === "learn" ? (
            <LearningPath
              activeLevel={level}
              initialLessonId={returnLessonId}
              key={level}
              learning={data.learning}
              onStartMission={startMission}
              sessions={data.sessions}
            />
          ) : (
            <ProgressViews
              learning={data.learning}
              level={level}
              onOpenLearn={() => setView("learn")}
              onOpenSession={openSession}
              onStartPractice={() => {
                setView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              sessions={data.sessions}
              targetBand={data.profile.targetBand}
              view={view}
            />
          )}
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-white/70 bg-[#172440]/95 p-2 shadow-[0_18px_50px_rgba(20,31,55,.3)] backdrop-blur-xl lg:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition ${
              view === item.view ? "bg-white/10 text-white" : "text-slate-400"
            }`}
            key={item.view}
            onClick={() => {
              setHistoryRecord(null);
              setView(item.view);
            }}
            type="button"
          >
            <Icon name={item.icon} className="size-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {(profileOpen || (!data.profile.name && !profileDismissed)) && (
        <ProfileModal
          onClose={() => {
            setProfileOpen(false);
            setProfileDismissed(true);
          }}
          profile={data.profile}
        />
      )}
    </div>
  );
}
