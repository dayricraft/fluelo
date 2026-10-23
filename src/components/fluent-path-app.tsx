"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Clock,
  History,
  Home,
  Mic,
  Search,
  Target,
  Users,
} from "lucide-react";

import {
  useLiveSession,
  type LiveSessionMode,
  type StartLiveSessionOptions,
} from "@/hooks/useLiveSession";
import {
  AI_SPEAKING_PARTNERS,
  type SpeakingPartnerProfile,
} from "@/lib/fluelo-5menus";
import { formatBand, type CefrLevel } from "@/lib/levels";
import {
  getSpeakingMission,
  type SpeakingMission,
} from "@/lib/speaking-missions";
import {
  updateProfile,
  useAppData,
} from "@/lib/storage";
import { PRACTICE_TOPICS, type Topic } from "@/lib/topics";
import type { Feedback, SessionRecord } from "@/lib/types";
import { FeedbackView } from "./feedback-view";
import { Menu5SpeakingWorkspace } from "./five-menu-workspaces";
import { FlueloBrand, FlueloLogoIcon } from "./fluelo-brand";
import { FlueloLandingPage } from "./fluelo-landing-page";
import { LueloMascot } from "./mascots";
import { ProfileModal } from "./profile-modal";
import { VoiceRoom } from "./voice-room";

type AppScreen = "landing" | "dashboard" | "voice";
type TalkToAiTab = "partners" | "interview" | "missions" | "history";

function ShellLoader() {
  return (
    <div className="fluelo-outer-wrap">
      <div className="rounded-[34px] bg-white p-10 text-center shadow-xl">
        <LueloMascot state="thinking" size={96} className="mx-auto" />
        <div className="mt-4 flex items-center justify-center">
          <FlueloBrand size="md" theme="light" showTagline={false} />
        </div>
        <p className="mt-2 text-xs font-extrabold text-[#7E8190]">
          Menyiapkan Fluelo Talk to AI Studio...
        </p>
      </div>
    </div>
  );
}

export function FluentPathApp() {
  const data = useAppData();
  const live = useLiveSession();

  const [screen, setScreen] = useState<AppScreen>("landing");
  const [talkTab, setTalkTab] = useState<TalkToAiTab>("partners");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("partner-emma");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<StartLiveSessionOptions | null>(null);
  const [historyRecord, setHistoryRecord] = useState<SessionRecord | null>(null);
  const appliedPlacementRef = useRef<Feedback | null>(null);

  const level: CefrLevel = data.profile.level ?? "B1";
  const rawName = data.profile.name?.trim();
  const displayName =
    !rawName || rawName === "Liam" || rawName === "Hariri" || rawName.includes("Tamu")
      ? "Ahmad Hariri"
      : rawName;

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

  if (!data.hydrated) return <ShellLoader />;

  const startVoice = (
    mode: LiveSessionMode,
    topic?: Topic,
    partner?: SpeakingPartnerProfile,
  ) => {
    const defaultTopic =
      PRACTICE_TOPICS.find((t) => t.id === "work") ?? PRACTICE_TOPICS[0];
    const chosenTopic = topic ?? defaultTopic;
    const chosenPartner =
      partner ??
      AI_SPEAKING_PARTNERS.find((p) => p.id === selectedPartnerId) ??
      AI_SPEAKING_PARTNERS[0];

    const options: StartLiveSessionOptions = {
      mode,
      level,
      topicId: mode === "placement" ? undefined : chosenTopic.id,
      topicTitle:
        mode === "placement"
          ? "Placement Test (CEFR A1 ke C2)"
          : chosenTopic.title,
      partnerId: mode === "practice" ? chosenPartner.id : undefined,
      partnerName: mode === "practice" ? chosenPartner.name : "Emma",
    };
    live.resetSession();
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
    live.resetSession();
    setHistoryRecord(null);
    setActiveSession(options);
    setScreen("voice");
    void live.startSession(options);
  };

  const closeLive = () => {
    live.resetSession();
    setActiveSession(null);
    setScreen("dashboard");
  };

  const replayLive = () => {
    if (!activeSession || activeSession.mode === "placement") return;
    const options = activeSession;
    live.resetSession();
    setScreen("voice");
    void live.startSession(options);
  };

  /* ================= LANDING PAGE SCREEN ================= */
  if (screen === "landing") {
    return (
      <FlueloLandingPage
        onStartLearning={() => {
          setTalkTab("partners");
          setScreen("dashboard");
        }}
        onSelectPartner={(partnerId) => {
          setSelectedPartnerId(partnerId);
          setTalkTab("partners");
          setScreen("dashboard");
        }}
        onSelectPath={() => {
          setTalkTab("partners");
          setScreen("dashboard");
        }}
      />
    );
  }

  /* ================= FULLSCREEN VOICE ROOM ================= */
  if (screen === "voice") {
    const activeMission = activeSession?.lessonId
      ? getSpeakingMission(activeSession.lessonId)
      : undefined;

    if (live.feedback && activeSession) {
      return (
        <main className="fluelo-outer-wrap">
          <div className="mx-auto w-full max-w-6xl p-6">
            <FeedbackView
              closeLabel="Selesai"
              feedback={live.feedback}
              onClose={closeLive}
              onPracticeAgain={activeSession.mode === "placement" ? undefined : replayLive}
              topicTitle={activeSession.topicTitle}
              warning={live.saveWarning}
              partnerName={activeSession.partnerName ?? "Emma"}
            />
          </div>
        </main>
      );
    }

    return (
      <main className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-[#F6F7FB] p-2.5 sm:p-4 flex flex-col justify-center items-center">
        <div className="w-full h-full max-w-6xl flex flex-col min-h-0">
          <VoiceRoom
            elapsedSec={live.elapsedSec}
            error={live.error}
            partnerName={activeSession?.partnerName ?? "Emma"}
            eyebrow={
              activeSession?.mode === "placement"
                ? "CEFR Adaptive Placement Test"
                : activeSession?.mode === "toefl-interview"
                  ? "Talk to AI: TOEFL Interview Simulation"
                  : activeSession?.mode === "speaking-mission"
                    ? "Talk to AI: Roleplay Speaking Mission"
                    : `Talk to AI bersama ${activeSession?.partnerName ?? "Emma"}`
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
              } else {
                void live.endSession();
                setScreen("dashboard");
              }
            }}
            onToggleMute={live.toggleMute}
            status={live.status}
            title={activeSession?.topicTitle ?? "Speaking Session"}
            transcript={live.transcript}
          />
        </div>
      </main>
    );
  }

  const report = historyRecord?.feedback;
  const currentPartner =
    AI_SPEAKING_PARTNERS.find((p) => p.id === selectedPartnerId) ?? AI_SPEAKING_PARTNERS[0];

  return (
    <div className="fluelo-outer-wrap">
      <div className="app-layout">
        {/* ================= SIDEBAR KIRI (FOKUS TALK TO AI) ================= */}
        <aside className="sidebar" aria-label="Navigasi Talk to AI Fluelo">
          <div>
            {/* Top Brand Header */}
            <button
              type="button"
              onClick={() => {
                setHistoryRecord(null);
                setScreen("landing");
              }}
              className="sidebar-brand border-none bg-transparent p-0 text-left cursor-pointer transition-transform hover:scale-102 w-full flex items-center gap-3"
              title="Kembali ke Landing Page Fluelo"
              aria-label="Kembali ke Landing Page Fluelo"
            >
              <div className="brand-icon-box">
                <FlueloLogoIcon size={24} />
              </div>
              <span className="brand-title-text">Fluelo</span>
            </button>

            {/* Nav Group: Talk to AI Studio */}
            <div className="nav-group">
              <span className="nav-label">Talk to AI Studio</span>
              <button
                type="button"
                className={`sidebar-nav-btn ${talkTab === "partners" ? "active" : ""}`}
                onClick={() => {
                  setHistoryRecord(null);
                  setTalkTab("partners");
                }}
              >
                <Users className="size-4 shrink-0" aria-hidden="true" />
                <span>Mitra Bicara & Topik</span>
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${talkTab === "interview" ? "active" : ""}`}
                onClick={() => {
                  setHistoryRecord(null);
                  setTalkTab("interview");
                }}
              >
                <Clock className="size-4 shrink-0" aria-hidden="true" />
                <span>Simulasi Interview</span>
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${talkTab === "missions" ? "active" : ""}`}
                onClick={() => {
                  setHistoryRecord(null);
                  setTalkTab("missions");
                }}
              >
                <Target className="size-4 shrink-0" aria-hidden="true" />
                <span>18 Misi Roleplay</span>
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${talkTab === "history" ? "active" : ""}`}
                onClick={() => {
                  setHistoryRecord(null);
                  setTalkTab("history");
                }}
              >
                <History className="size-4 shrink-0" aria-hidden="true" />
                <span>Riwayat & Evaluasi</span>
              </button>
            </div>

            {/* Nav Group: Navigasi */}
            <div className="nav-group">
              <span className="nav-label">Navigasi</span>
              <button
                type="button"
                className="sidebar-nav-btn cursor-pointer"
                onClick={() => {
                  setHistoryRecord(null);
                  setScreen("landing");
                }}
                title="Kembali ke Landing Page"
              >
                <Home className="size-4 shrink-0 text-[#A6A5B8]" aria-hidden="true" />
                <span>Landing Page</span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer: Target Bicara Harian */}
          <div className="sidebar-footer">
            <span>Target Harian</span>
            <strong>⚡ 15 Menit Suara</strong>
          </div>
        </aside>

        {/* ================= AREA KONTEN UTAMA ================= */}
        <main className="main-area">
          {/* SUB-HEADER: Dynamic Title + Search + Quick Start + Profile Pill */}
          <div className="sub-header">
            <div className="title-and-tabs">
              <div className="flex items-center gap-2">
                <h1 className="page-title">
                  {talkTab === "partners"
                    ? "Mitra Bicara & Topik Harian"
                    : talkTab === "interview"
                      ? "Simulasi Interview (Timer 45d)"
                      : talkTab === "missions"
                        ? "18 Roleplay Speaking Missions"
                        : "Riwayat Sesi & Evaluasi AI"}
                </h1>
                <span className="rounded-full bg-[#EFEAFF] px-2.5 py-0.5 text-[11px] font-extrabold text-[#6C5CE7]">
                  Talk to AI
                </span>
              </div>
              <p className="text-xs font-semibold text-[#7E8190]">
                {talkTab === "partners"
                  ? "Pilih partner AI selevel (Emma, Sarah, David, Sofia, Kenji) dan mulai percakapan suara 2 arah real-time"
                  : talkTab === "interview"
                    ? "Latihan menjawab pertanyaan wawancara kerja dan TOEFL dengan timer respons 45 detik"
                    : talkTab === "missions"
                      ? "Selesaikan skenario percakapan nyata dengan target kosakata terstruktur"
                      : "Laporan skor CEFR & TOEFL, akurasi tata bahasa, dan analisis percakapan kamu"}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <search className="search-row">
                <div className="search-box">
                  <Search className="size-4 shrink-0" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Cari partner bicara, topik, atau misi"
                    placeholder="Cari partner, topik, misi..."
                  />
                </div>
              </search>

              <button
                type="button"
                onClick={() => {
                  const topic =
                    PRACTICE_TOPICS.find((t) => t.id === currentPartner.defaultTopicId) ??
                    PRACTICE_TOPICS[0];
                  startVoice("practice", topic, currentPartner);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6C5CE7] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#5848DE] cursor-pointer"
                title={`Mulai bicara langsung dengan ${currentPartner.name}`}
              >
                <Mic className="size-3.5" aria-hidden="true" />
                <span>Bicara ({currentPartner.name})</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="profile-pill cursor-pointer hover:border-[#6C5CE7] transition"
                title="Pengaturan Profil"
                aria-label="Buka Pengaturan Profil"
              >
                <span className="px-1.5 text-xs font-extrabold text-[#181823]">
                  {displayName}
                </span>
                <div className="avatar-img">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              </button>
            </div>
          </div>

          {/* NON-BLOCKING BACKGROUND AI EVALUATION BANNER */}
          {live.status === "evaluating" && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E2FF] bg-[#F4F5FF] px-4 py-3 text-xs font-bold text-[#181823]"
            >
              <div className="flex items-center gap-2.5">
                <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-[#6C5CE7]" />
                <span>
                  Evaluasi AI untuk sesi{" "}
                  <strong className="text-[#6C5CE7]">
                    {activeSession?.topicTitle ?? "Speaking"}
                  </strong>{" "}
                  sedang diproses di latar belakang.
                </span>
              </div>
              <button
                type="button"
                onClick={closeLive}
                className="rounded-full border border-[#DCDFE8] bg-white px-3.5 py-1.5 text-[11px] font-bold text-[#7E8190] transition hover:text-[#181823]"
              >
                Lewati Evaluasi
              </button>
            </div>
          )}

          {live.status === "complete" && live.feedback && activeSession && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs font-bold text-[#181823]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  <Check className="size-3" aria-hidden="true" />
                  Evaluasi Selesai
                </span>
                <span>
                  {activeSession.topicTitle}: Skor TOEFL{" "}
                  <strong className="text-emerald-800">
                    Band {formatBand(live.feedback.overallBand)}
                  </strong>{" "}
                  (CEFR {live.feedback.cefr})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScreen("voice")}
                  className="rounded-full bg-[#1B1A22] px-4 py-1.5 text-[11px] font-bold text-white transition hover:opacity-90"
                >
                  Lihat Laporan Evaluasi
                </button>
                <button
                  type="button"
                  onClick={closeLive}
                  className="rounded-full border border-emerald-300 bg-white px-3.5 py-1.5 text-[11px] font-bold text-emerald-900"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {live.status === "error" && live.error && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800"
            >
              <span>{live.error}</span>
              <button
                type="button"
                onClick={closeLive}
                className="rounded-full border border-rose-300 bg-white px-3.5 py-1.5 text-[11px] font-bold text-rose-800"
              >
                Tutup
              </button>
            </div>
          )}

          {/* BODY CONTENT: Session Feedback Report OR Talk to AI Studio */}
          {report && historyRecord ? (
            <FeedbackView
              closeLabel="Tutup Evaluasi"
              feedback={report}
              onClose={() => setHistoryRecord(null)}
              topicTitle={historyRecord.topicTitle}
            />
          ) : (
            <Menu5SpeakingWorkspace
              currentLevel={level}
              sessions={data.sessions}
              onStartVoice={startVoice}
              onStartMission={startMission}
              onOpenSessionReport={(session) => setHistoryRecord(session)}
              activeTab={talkTab}
              onTabChange={setTalkTab}
              selectedPartnerId={selectedPartnerId}
              onSelectPartnerId={setSelectedPartnerId}
              searchQuery={searchQuery}
            />
          )}
        </main>
      </div>

      {profileOpen && (
        <ProfileModal
          profile={data.profile}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
