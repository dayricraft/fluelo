"use client";

import { useEffect, useRef, useState } from "react";
import { useLiveSession, type StartLiveSessionOptions } from "@/hooks/useLiveSession";
import { formatBand } from "@/lib/levels";
import { useAppData } from "@/lib/storage";
import type { SessionRecord, TranscriptTurn } from "@/lib/types";

interface ChatTurn {
  sender: "ai" | "user";
  text: string;
}

interface PartnerConfig {
  id: string;
  name: string;
  trait: string;
  color: string;
  darkColor: string;
  avatarBg: string;
  initialChat: ChatTurn[];
  nextExchanges: { user: string; ai: string }[];
}

const ROOM_PARTNERS: Record<string, PartnerConfig> = {
  Sarah: {
    id: "partner-sarah",
    name: "Sarah",
    trait: "Daily Talk",
    color: "#B8F3B8",
    darkColor: "#8EE88E",
    avatarBg: "#B8F3B8",
    initialChat: [
      { sender: "ai", text: "Hi Alex! Welcome to Perk Cafe. What would you like to order this morning?" },
      { sender: "user", text: "Hi Sarah! Can I get an iced oat latte, please?" },
      { sender: "ai", text: "Sure thing! Would you like that for here or to go?" }
    ],
    nextExchanges: [
      {
        user: "For here, please. I also want a butter croissant.",
        ai: "Great choice! I will warm up the croissant for you. What are your plans for today?"
      },
      {
        user: "I am practicing my English speaking skills this morning.",
        ai: "You are doing awesome! Your sentences sound super natural."
      },
      {
        user: "Thank you Sarah! I really enjoy our morning talks.",
        ai: "Me too, Alex! See you again tomorrow for another quick chat."
      }
    ]
  },
  Emma: {
    id: "partner-emma",
    name: "Emma",
    trait: "Grammar Coach",
    color: "#FBC3A2",
    darkColor: "#F5A678",
    avatarBg: "#FBC3A2",
    initialChat: [
      { sender: "ai", text: "Hello Alex! Have you ever visited another country or city recently?" },
      { sender: "user", text: "Yes, I visited Bali with my family last year." },
      { sender: "ai", text: "Lovely! What was your favorite place in Bali?" }
    ],
    nextExchanges: [
      {
        user: "I really enjoyed the beach in Uluwatu and the local food.",
        ai: "That sounds wonderful! How long did you stay there?"
      },
      {
        user: "We stayed there for five days.",
        ai: "Perfect past tense! Keep it up, Alex."
      }
    ]
  },
  Sophia: {
    id: "partner-sofia",
    name: "Sophia",
    trait: "Travel Buddy",
    color: "#B5E2FA",
    darkColor: "#87C8FA",
    avatarBg: "#B5E2FA",
    initialChat: [
      { sender: "ai", text: "Hey Alex! Welcome to the airport check in desk. Where are you flying today?" },
      { sender: "user", text: "Hi Sophia! I am flying to Tokyo today." },
      { sender: "ai", text: "Exciting! Would you prefer a window seat or an aisle seat?" }
    ],
    nextExchanges: [
      {
        user: "Could I have a window seat, please?",
        ai: "Here is your boarding pass for seat 14A. Boarding starts at gate 7!"
      },
      {
        user: "Thank you so much for your help!",
        ai: "You are welcome! Have a safe and pleasant flight!"
      }
    ]
  },
  David: {
    id: "partner-david",
    name: "David",
    trait: "Career Mentor",
    color: "#FDE272",
    darkColor: "#F7D147",
    avatarBg: "#FDE272",
    initialChat: [
      { sender: "ai", text: "Good morning Alex! Tell me a little bit about what you do." },
      { sender: "user", text: "Good morning David! I am a UI UX designer working on mobile apps." },
      { sender: "ai", text: "That is awesome! What project are you working on right now?" }
    ],
    nextExchanges: [
      {
        user: "I am designing an AI English learning app right now.",
        ai: "Impressive! What is your favorite feature in the app?"
      },
      {
        user: "I love the clean voice conversation room with AI characters.",
        ai: "Great answer! Clear and confident communication."
      }
    ]
  },
  Kenji: {
    id: "partner-kenji",
    name: "Kenji",
    trait: "Casual and Hobbies",
    color: "#F9A8A8",
    darkColor: "#FF8598",
    avatarBg: "#F9A8A8",
    initialChat: [
      { sender: "ai", text: "Yo Alex! The weekend is almost here. Any fun plans for Saturday?" },
      { sender: "user", text: "Hey Kenji! I am going to watch a movie with my friends." },
      { sender: "ai", text: "Nice! What kind of movies do you usually enjoy watching?" }
    ],
    nextExchanges: [
      {
        user: "I really like sci fi and animated adventure movies.",
        ai: "Same here! Nothing beats a good sci fi movie with popcorn."
      },
      {
        user: "Totally agree! What about you, Kenji?",
        ai: "I am going to play some music and practice guitar all weekend!"
      }
    ]
  }
};

const GRAMMAR_QUESTIONS = [
  { q: "Is 'She has lived in London since 2024' grammatically correct?", ans: true, note: "Correct! Present Perfect with since for a starting point." },
  { q: "Is 'I have went to the English class yesterday' correct?", ans: false, note: "Spot on! With yesterday, use Simple Past: I went." },
  { q: "Does 'Sarah speaks English very fluently' use Simple Present?", ans: true, note: "Correct! Third person singular uses speaks." },
  { q: "Is 'They was practicing pronunciation with Emma' correct?", ans: false, note: "Correct! Plural They takes were practicing." }
];

export const CALENDAR_PARTNERS = [
  { id: "sarah", name: "Sarah", color: "#B8F3B8", face: "happy" },
  { id: "emma", name: "Emma", color: "#FBC3A2", face: "wink" },
  { id: "sophia", name: "Sophia", color: "#B5E2FA", face: "calm" },
  { id: "david", name: "David", color: "#D8C8FF", face: "surprised" },
  { id: "kenji", name: "Kenji", color: "#FDE272", face: "curious" }
];

export const GUEST_AGE_RANGES = [
  { id: "Under 18", labelEn: "< 18", labelId: "< 18" },
  { id: "18 to 24", labelEn: "18 to 24", labelId: "18 ke 24" },
  { id: "25 to 34", labelEn: "25 to 34", labelId: "25 ke 34" },
  { id: "35 plus", labelEn: "35+", labelId: "35+" }
];

export const GUEST_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "C3"];

export function MiniCalendarFace({ face }: { face: string }) {
  if (face === "happy") {
    return (
      <svg width="15" height="11" viewBox="0 0 16 12" fill="none">
        <path d="M2.5 4C3.8 2.2 6.2 2.2 7.5 4" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.5 4C9.8 2.2 12.2 2.2 13.5 4" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 8C6 10.5 10 10.5 12 8" stroke="#0F0F12" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (face === "wink") {
    return (
      <svg width="15" height="11" viewBox="0 0 16 12" fill="none">
        <path d="M2.5 4C3.8 2.2 6.2 2.2 7.5 4" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9 4.5H13" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 8C6 10.5 10 10.5 12 8" stroke="#0F0F12" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (face === "calm") {
    return (
      <svg width="15" height="11" viewBox="0 0 16 12" fill="none">
        <circle cx="5" cy="4" r="1.2" fill="#0F0F12" />
        <circle cx="11" cy="4" r="1.2" fill="#0F0F12" />
        <path d="M5.5 8.5C7 9.8 9 9.8 10.5 8.5" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (face === "surprised") {
    return (
      <svg width="15" height="11" viewBox="0 0 16 12" fill="none">
        <circle cx="5" cy="4" r="1.2" fill="#0F0F12" />
        <circle cx="11" cy="4" r="1.2" fill="#0F0F12" />
        <circle cx="8" cy="8.2" r="1.8" stroke="#0F0F12" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg width="15" height="11" viewBox="0 0 16 12" fill="none">
      <circle cx="5" cy="4" r="1.2" fill="#0F0F12" />
      <path d="M9.5 3.5C10.8 2.5 12.2 2.5 13.5 4" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 8.5C7 10.2 9.5 10.2 11.5 8.5" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function getInitialCalendarCheckIns(referenceDate?: Date): Record<string, { color: string; face: string; partnerId: string }> {
  const now = referenceDate || new Date("2026-10-24T00:00:00Z");
  const year = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, "0");
  const todayNum = now.getDate();

  const record: Record<string, { color: string; face: string; partnerId: string }> = {};
  const sampleDays = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24];

  sampleDays.forEach((d) => {
    if (d <= todayNum) {
      const p = CALENDAR_PARTNERS[d % CALENDAR_PARTNERS.length];
      const key = `${year}-${monthStr}-${String(d).padStart(2, "0")}`;
      record[key] = { color: p.color, face: p.face, partnerId: p.id };
    }
  });

  return record;
}

export function SpeakFlowApp() {
  const data = useAppData();
  const live = useLiveSession();
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // App Layout State
  const [layoutMode, setLayoutMode] = useState<"all5" | "core3" | "roomOnly" | "ref3">("all5");
  const [activeScreen, setActiveScreen] = useState<number>(3); // 1: Landing, 2: Login, 3: Home, 4: Room Talk, 5: Calendar
  const [isTilted, setIsTilted] = useState<boolean>(true);
  const [isIndonesian, setIsIndonesian] = useState<boolean>(false);

  // Home State
  const [pronIdx, setPronIdx] = useState(0);
  const pronMetrics = [
    { big: "86%", sub: "Clear" },
    { big: "92%", sub: "Fluent" },
    { big: "89%", sub: "Natural" }
  ];

  const [grammarIdx, setGrammarIdx] = useState(0);
  const grammarMetrics = [
    { big: "94%", sub: "Good" },
    { big: "Solid", sub: "12 of 16" },
    { big: "91%", sub: "Level A1" }
  ];

  // Guest & Profile State
  const [isGuestSetup, setIsGuestSetup] = useState(false);
  const [guestName, setGuestName] = useState("Alex");
  const [guestAgeRange, setGuestAgeRange] = useState("18 to 24");
  const [guestLevel, setGuestLevel] = useState("A1");
  const [guestAvatar, setGuestAvatar] = useState("sarah");
  const currentGuestAvatar = CALENDAR_PARTNERS.find((p) => p.id === guestAvatar) || CALENDAR_PARTNERS[0];

  // Settings & Account State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isGoogleVerified, setIsGoogleVerified] = useState<boolean>(true);
  const [googlePassword, setGooglePassword] = useState<string>("speakflow2026");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [quizIdx, setQuizIdx] = useState(0);

  // Calendar Real-Time State
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(0);
  const [activePickerDay, setActivePickerDay] = useState<number | null>(null);
  const [calendarCheckIns, setCalendarCheckIns] = useState<Record<string, { color: string; face: string; partnerId: string }>>(
    () => getInitialCalendarCheckIns()
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedPastSession, setSelectedPastSession] = useState<SessionRecord | null>(null);

  const [baseToday, setBaseToday] = useState<Date>(() => new Date("2026-10-24T00:00:00Z"));
  useEffect(() => {
    const liveNow = new Date();
    setBaseToday(liveNow);
    setCalendarCheckIns(getInitialCalendarCheckIns(liveNow));
  }, []);
  const calendarViewDate = new Date(baseToday.getFullYear(), baseToday.getMonth() + calendarMonthOffset, 1);
  const calendarYear = calendarViewDate.getFullYear();
  const calendarMonth = calendarViewDate.getMonth();
  const calendarDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const calendarFirstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarMonthLabel = calendarViewDate.toLocaleDateString(isIndonesian ? "id-ID" : "en-US", {
    month: "long",
    year: "numeric"
  });

  const handleTileClick = (dayNum: number) => {
    setActivePickerDay((prev) => (prev === dayNum ? null : dayNum));
  };

  const handleSelectPartnerColor = (dayNum: number, partner: typeof CALENDAR_PARTNERS[number]) => {
    const key = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    setCalendarCheckIns((prev) => {
      if (prev[key]?.partnerId === partner.id) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: { color: partner.color, face: partner.face, partnerId: partner.id }
      };
    });
    setActivePickerDay(null);
  };

  // Room Talk State
  const [currentPartnerKey, setCurrentPartnerKey] = useState<string>("Sarah");
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [nextExchangeIdx, setNextExchangeIdx] = useState(0);
  const [simulatedSpeaking, setSimulatedSpeaking] = useState(false);
  const [simulatedListening, setSimulatedListening] = useState(false);
  const [inRoomEvaluation, setInRoomEvaluation] = useState(false);
  const [hasStartedVoice, setHasStartedVoice] = useState(false);

  // Minimal Feedback Indicator State (Checkmark ✓ or Cross ✕ only, NO verbose text)
  const [feedbackStatus, setFeedbackStatus] = useState<"check" | "cross" | null>(null);

  const triggerFeedback = (status: "check" | "cross") => {
    setFeedbackStatus(status);
    setTimeout(() => {
      setFeedbackStatus((curr) => (curr === status ? null : curr));
    }, 1200);
  };

  const showToast = (message?: string, color = "#B8F3B8") => {
    const isError =
      color === "#F9A8A8" ||
      color === "#FBC3A2" ||
      color === "#FF8598" ||
      message?.toLowerCase().includes("error") ||
      message?.toLowerCase().includes("keep");
    triggerFeedback(isError ? "cross" : "check");
  };

  const partner = ROOM_PARTNERS[currentPartnerKey] ?? ROOM_PARTNERS.Sarah;

  // Sound chime using Web Audio API
  const playChime = (startF = 440, endF = 580) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(startF, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endF, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  };

  // Change active partner in Room Talk
  const handleSelectPartner = (name: string) => {
    if (!ROOM_PARTNERS[name]) return;
    if (live.isActive) {
      void live.endSession();
    }
    setCurrentPartnerKey(name);
    setNextExchangeIdx(0);
    setChatHistory([]);
    setInRoomEvaluation(false);
    setHasStartedVoice(false);
    playChime(420, 540);
  };

  // Scroll to bottom when new transcript or chat turn arrives
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, live.transcript]);

  // When live session ends and feedback arrives, show in-room evaluation
  useEffect(() => {
    if (live.feedback) {
      setInRoomEvaluation(true);
    }
  }, [live.feedback]);

  // Web Speech API fallback text-to-speech so AI speaks out loud even without Live stream
  const speakWithBrowserTTS = (text: string, onEnd?: () => void) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.onend = () => {
          onEnd?.();
        };
        utterance.onerror = () => {
          onEnd?.();
        };
        window.speechSynthesis.speak(utterance);
      } catch {
        onEnd?.();
      }
    } else {
      onEnd?.();
    }
  };

  // Fallback interactive speech turn (when offline, mic blocked, or browser speech)
  const triggerFallbackExchange = (customAiText?: string) => {
    playChime(480, 620);
    setSimulatedListening(true);
    setSimulatedSpeaking(false);

    const exchange = partner.nextExchanges[nextExchangeIdx % partner.nextExchanges.length];
    setNextExchangeIdx((prev) => prev + 1);

    const userText = exchange.user;
    const aiText = customAiText || exchange.ai;

    setTimeout(() => {
      setSimulatedListening(false);
      setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);

      setTimeout(() => {
        setChatHistory((prev) => [...prev, { sender: "ai", text: aiText }]);
        setSimulatedSpeaking(true);
        playChime(420, 540);

        speakWithBrowserTTS(aiText, () => {
          setSimulatedSpeaking(false);
        });
      }, 500);
    }, 1200);
  };

  // Handle live error: notify and fall back gracefully with audible voice
  useEffect(() => {
    if (live.error) {
      showToast(live.error, "#F9A8A8");
      // Seamlessly fall back to interactive voice exchange with audio voice so user is never left hanging
      setTimeout(() => {
        triggerFallbackExchange();
      }, 600);
    }
  }, [live.error]);

  // Main Voice Tap: Starts real Gemini Live audio streaming session, or simulation
  const handleVoiceTap = async () => {
    setHasStartedVoice(true);
    // If live session is already active: toggle mute
    if (live.isActive) {
      live.toggleMute();
      showToast(live.muted ? "Microphone muted" : "Microphone active", "#B8F3B8");
      return;
    }

    // Try starting real Live Gemini session
    try {
      playChime(480, 620);
      setInRoomEvaluation(false);
      showToast(`Connecting to ${partner.name}...`, "#B8F3B8");

      const partnerTopicId =
        partner.id === "partner-sarah"
          ? "daily"
          : partner.id === "partner-sofia"
            ? "travel"
            : partner.id === "partner-david"
              ? "tech"
              : partner.id === "partner-kenji"
                ? "campus"
                : "intro";

      const options: StartLiveSessionOptions = {
        mode: "practice",
        level: "A1",
        topicId: partnerTopicId,
        topicTitle: `Daily Talk with ${partner.name}`,
        partnerId: partner.id,
        partnerName: partner.name,
      };

      live.resetSession();
      await live.startSession(options);
    } catch (err) {
      console.error("Live session could not start, falling back to interactive speech:", err);
      triggerFallbackExchange();
    }
  };

  // End Room Talk Session -> triggers In-Room Evaluation
  const handleEndSession = async () => {
    if (live.isActive) {
      showToast(`Ending session with ${partner.name}...`, "#F9A8A8");
      setInRoomEvaluation(true);
      try {
        await live.endSession();
      } catch (err) {
        console.error("End session error:", err);
      }
    } else {
      setInRoomEvaluation(true);
      showToast(`Room Talk with ${partner.name} ended`, "#F9A8A8");
    }
  };

  // Navigation Helper
  const navigateTo = (screenNum: number) => {
    setActiveScreen(screenNum);
    const target = document.getElementById(`phoneFrame${screenNum}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  };

  // Speaking state: active when Gemini live is speaking OR simulated speech is active
  const isCurrentlySpeaking = live.status === "speaking" || simulatedSpeaking;
  const isCurrentlyListening = live.status === "listening" || simulatedListening;

  // Dynamic Island active state
  const isIslandActive = isCurrentlySpeaking || isCurrentlyListening || live.status === "connecting";

  // Status text for the stage pill
  const getStageStatusText = () => {
    if (live.status === "connecting") return `Connecting to ${partner.name}...`;
    if (isCurrentlySpeaking) return `${partner.name} is speaking`;
    if (isCurrentlyListening) return `${partner.name} is listening to you`;
    if (live.status === "evaluating") return `Analyzing your speaking...`;
    return `Tap Voice to talk with ${partner.name}`;
  };

  // Get displayed chat turns: prefer real live session transcripts if any
  const displayedTurns: { sender: "ai" | "user"; text: string }[] =
    live.transcript.length > 0
      ? live.transcript.map((t: TranscriptTurn) => ({
          sender: t.role === "model" ? ("ai" as const) : ("user" as const),
          text: t.text,
        }))
      : chatHistory;

  return (
    <div className="speakflow-bg min-h-screen text-[#0F0F12] pb-14 overflow-x-hidden font-sans">
      {/* =====================================================================
           TOP STUDIO NAVIGATION & VIEW CONTROL BAR
           ===================================================================== */}
      <header className="sticky top-3 z-50 px-4 mb-5 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-black/10 shadow-lg rounded-full px-3 py-2 flex flex-wrap items-center gap-2">
          {/* Brand Identity */}
          <div className="flex items-center gap-2 pl-2 pr-2.5 border-r border-black/10 select-none">
            <svg width="22" height="22" viewBox="0 0 240 240" fill="none" className="shrink-0">
              <circle cx="120" cy="120" r="108" fill="#B899FF" />
              <circle cx="120" cy="120" r="80" fill="#8F5BFF" />
              <circle cx="120" cy="120" r="60" fill="#F5F0FF" />
            </svg>
            <span className="text-xs font-extrabold tracking-tight text-[#0F0F12]">Fluelo</span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#F3F2F7] p-1 rounded-full flex-wrap gap-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode("all5")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                layoutMode === "all5" ? "bg-[#0F0F12] text-white" : "text-[#5A5A66] hover:text-[#0F0F12]"
              }`}
            >
              All 5 Screens
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("core3")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                layoutMode === "core3" ? "bg-[#0F0F12] text-white" : "text-[#5A5A66] hover:text-[#0F0F12]"
              }`}
            >
              Home, Room Talk, Calendar
            </button>
            <button
              type="button"
              onClick={() => {
                setLayoutMode("roomOnly");
                setActiveScreen(4);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                layoutMode === "roomOnly" ? "bg-[#0F0F12] text-white" : "text-[#5A5A66] hover:text-[#0F0F12]"
              }`}
            >
              Focus Room Talk
            </button>
          </div>

          {/* Tilt Switch */}
          <button
            type="button"
            onClick={() => setIsTilted(!isTilted)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F3F2F7] hover:bg-[#E5E4EC] text-[#0F0F12] flex items-center gap-1.5 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="3" width="14" height="18" rx="3" stroke="#0F0F12" strokeWidth="2.2" transform="rotate(-8 12 12)" />
            </svg>
            <span>Tilt {isTilted ? "ON" : "FLAT"}</span>
          </button>

          {/* Language Copy Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsIndonesian(!isIndonesian);
              showToast(isIndonesian ? "Switched to English UI" : "Bahasa diubah ke Indonesia", "#D8C8FF");
            }}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#D8C8FF] hover:bg-[#cbb6ff] text-[#0F0F12] flex items-center gap-1.5 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#0F0F12" strokeWidth="2.2" />
              <path d="M3.6 9H20.4M3.6 15H20.4M12 3C14.5 6 14.5 18 12 21M12 3C9.5 6 9.5 18 12 21" stroke="#0F0F12" strokeWidth="1.8" />
            </svg>
            <span>{isIndonesian ? "ID Bahasa" : "EN English"}</span>
          </button>
        </div>
      </header>

      {/* SINGLE SCREEN NAVIGATION PILLS (When in roomOnly mode) */}
      {layoutMode === "roomOnly" && (
        <div className="flex justify-center gap-2 mb-5 px-4 flex-wrap">
          {[
            { num: 1, label: "1 Landing Page" },
            { num: 2, label: "2 Login" },
            { num: 3, label: "3 Home Dashboard" },
            { num: 4, label: "4 Room Talk AI" },
            { num: 5, label: "5 Calendar and Stats" },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => setActiveScreen(item.num)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border border-black/10 ${
                activeScreen === item.num ? "bg-[#0F0F12] text-white" : "bg-white text-[#0F0F12]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* =====================================================================
           MAIN SHOWCASE CONTAINER (5 SCREENS)
           ===================================================================== */}
      <main
        id="phonesContainer"
        className={`${isTilted ? "showcase-angled" : ""} max-w-[1880px] mx-auto px-4 pt-1 pb-10 flex flex-wrap items-center justify-center gap-7`}
      >
        {/* ===================================================================
             SCREEN 1: LANDING / ONBOARDING PAGE
             =================================================================== */}
        {(layoutMode === "all5" || (layoutMode === "roomOnly" && activeScreen === 1)) && (
          <div id="phoneFrame1" className="iphone-frame phone-tilt-left">
            <div className="iphone-screen !bg-white">
              {/* Status Bar */}
              <div className="w-full pt-3 pb-1 px-6 flex items-center justify-between bg-white z-20 shrink-0">
                <span className="text-[13px] font-bold tracking-tight text-[#0F0F12] w-12">9:41</span>
                <div className="dynamic-island" />
                <div className="flex items-center gap-1.5 w-14 justify-end">
                  <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                    <rect x="1" y="7" width="2.5" height="4" rx="1" fill="#0F0F12" />
                    <rect x="4.8" y="5" width="2.5" height="6" rx="1" fill="#0F0F12" />
                    <rect x="8.6" y="2.8" width="2.5" height="8.2" rx="1" fill="#0F0F12" />
                    <rect x="12.4" y="0.5" width="2.5" height="10.5" rx="1" fill="#0F0F12" />
                  </svg>
                  <svg width="14" height="11" viewBox="0 0 15 11" fill="none">
                    <path d="M1.5 3.6C4.9 0.8 10.1 0.8 13.5 3.6" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M3.8 6.2C6 4.4 9 4.4 11.2 6.2" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="7.5" cy="9.1" r="1.4" fill="#0F0F12" />
                  </svg>
                  <svg width="22" height="11" viewBox="0 0 23 11" fill="none">
                    <rect x="0.7" y="1" width="18.6" height="9" rx="2.6" stroke="#0F0F12" strokeWidth="1.2" />
                    <rect x="2.4" y="2.6" width="15.2" height="5.8" rx="1.4" fill="#0F0F12" />
                    <path d="M20.8 3.8V7.2" stroke="#0F0F12" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Editorial Headline & Pill Button */}
              <div className="pt-4 px-6 text-center flex flex-col items-center z-10">
                {/* Fluelo Brand Logo */}
                <div className="mb-3 flex justify-center">
                  <svg width="94" height="42" viewBox="0 0 500 240" fill="none" className="shrink-0 drop-shadow-2xs">
                    <circle cx="120" cy="120" r="108" fill="#B899FF" />
                    <circle cx="120" cy="120" r="80" fill="#8F5BFF" />
                    <circle cx="120" cy="120" r="60" fill="#F5F0FF" />
                    <text x="256" y="146" fill="#0F0F12" font-family="'Plus Jakarta Sans', sans-serif" font-size="82" font-weight="800" letter-spacing="-0.04em">Fluelo</text>
                  </svg>
                </div>

                <h1 className="text-[30px] font-extrabold text-[#0F0F12] heading-tight">
                  {isIndonesian ? (
                    <>
                      Siap Lancar Ngobrol
                      <br />
                      Bahasa Inggris?
                    </>
                  ) : (
                    <>
                      Ready to Speak
                      <br />
                      Fluent English?
                    </>
                  )}
                </h1>
                <p className="text-[12.5px] font-medium text-[#7A7A88] mt-2 max-w-[240px] leading-snug">
                  {isIndonesian
                    ? "Latihan ngobrol tiap hari bareng teman AI tanpa takut salah grammar."
                    : "Practice daily AI conversations without fear of making mistakes."}
                </p>

                {/* Pill CTA Button */}
                <button
                  type="button"
                  onClick={() => navigateTo(2)}
                  className="tap-scale mt-5 bg-[#F4F4F8] hover:bg-[#EAE9F0] pl-6 pr-1.5 py-1.5 rounded-full flex items-center gap-4 shadow-sm border border-black/[0.04]"
                >
                  <span className="text-[13.5px] font-bold text-[#0F0F12] tracking-tight">
                    {isIndonesian ? "Mulai Belajar" : "Let's Start"}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#0F0F12] flex items-center justify-center text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Bottom Geometric Characters Cluster */}
              <div className="relative flex-1 w-full mt-2 overflow-hidden">
                {/* 1. Sarah Mint Circle */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Sarah");
                    navigateTo(4);
                  }}
                  style={{ transform: "rotate(-10deg)" }}
                  className="mascot-float tap-scale absolute left-[24px] top-[34px] w-[142px] h-[142px] rounded-full bg-[#B8F3B8] flex items-center justify-center z-10 shadow-sm"
                  title="Talk with Sarah"
                >
                  <svg width="92" height="68" viewBox="0 0 92 68" fill="none">
                    <path d="M12 24C17 15 27 15 32 24" stroke="#0F0F12" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M60 24C65 15 75 15 80 24" stroke="#0F0F12" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M20 42C33 58 59 58 72 42" stroke="#0F0F12" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </button>

                {/* 2. Sophia Lavender Circle */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Sophia");
                    navigateTo(4);
                  }}
                  style={{ transform: "rotate(14deg)" }}
                  className="mascot-float-delayed tap-scale absolute right-[10px] top-[6px] w-[134px] h-[134px] rounded-full bg-[#D8C8FF] flex items-center justify-center z-10"
                  title="Talk with Sophia"
                >
                  <div className="w-[104px] h-[104px] rounded-full border-[11px] border-[#C1A8FA] bg-[#F4EEFF] flex items-center justify-center">
                    <svg width="68" height="62" viewBox="0 0 68 62" fill="none">
                      <circle cx="20" cy="24" r="6.5" fill="#0F0F12" />
                      <circle cx="18" cy="22" r="2" fill="#FFFFFF" />
                      <circle cx="48" cy="22" r="6.5" fill="#0F0F12" />
                      <circle cx="46" cy="20" r="2" fill="#FFFFFF" />
                      <path d="M12 12C16 8 23 8 27 11" stroke="#0F0F12" strokeWidth="3.2" strokeLinecap="round" />
                      <path d="M41 10C45 7 52 7 56 11" stroke="#0F0F12" strokeWidth="3.2" strokeLinecap="round" />
                      <ellipse cx="35" cy="43" rx="7.5" ry="6" fill="#0F0F12" />
                    </svg>
                  </div>
                </button>

                {/* 3. Sophia Lilac Pink Scallop */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Sophia");
                    navigateTo(4);
                  }}
                  style={{ transform: "rotate(6deg)" }}
                  className="mascot-float tap-scale absolute -left-[22px] top-[168px] w-[124px] h-[124px] z-10 flex items-center justify-center"
                >
                  <svg width="124" height="124" viewBox="0 0 124 124" fill="none">
                    <path d="M62 4C73 4 82 12 91 18C100 24 114 29 118 40C122 51 115 64 115 76C115 88 120 101 112 110C104 119 90 116 78 119C66 122 54 122 42 118C30 114 16 116 9 106C2 96 8 82 7 70C6 58 2 44 9 34C16 24 30 22 40 15C50 8 51 4 62 4Z" fill="#F7B8D8" />
                    <ellipse cx="48" cy="48" rx="9" ry="12" fill="#FFFFFF" />
                    <circle cx="50" cy="43" r="5.5" fill="#0F0F12" />
                    <ellipse cx="78" cy="52" rx="9" ry="12" fill="#FFFFFF" />
                    <circle cx="79" cy="47" r="5.5" fill="#0F0F12" />
                    <path d="M44 79C56 75 72 76 84 82" stroke="#0F0F12" strokeWidth="4.8" strokeLinecap="round" />
                  </svg>
                </button>

                {/* 4. David Butter Yellow Lightning */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("David");
                    navigateTo(4);
                  }}
                  style={{ transform: "rotate(-4deg)" }}
                  className="mascot-float-delayed tap-scale absolute left-[84px] top-[150px] w-[135px] h-[196px] z-20 flex items-center justify-center"
                  title="Talk with David"
                >
                  <svg width="135" height="196" viewBox="0 0 135 196" fill="none">
                    <path d="M44 12L108 4L88 68L124 66L66 188L32 186L56 116L20 118L44 12Z" fill="#FDE272" stroke="#FDE272" strokeWidth="10" strokeLinejoin="round" />
                    <path d="M35 68C42 57 53 58 58 68" stroke="#0F0F12" strokeWidth="4.4" strokeLinecap="round" />
                    <path d="M77 64C84 53 95 54 100 64" stroke="#0F0F12" strokeWidth="4.4" strokeLinecap="round" />
                    <path d="M48 89C59 100 76 99 86 87" stroke="#0F0F12" strokeWidth="4.6" strokeLinecap="round" />
                  </svg>
                </button>

                {/* 5. Emma Warm Peach Rounded Square */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Emma");
                    navigateTo(4);
                  }}
                  style={{ transform: "rotate(-14deg)" }}
                  className="mascot-float tap-scale absolute -right-[16px] top-[134px] w-[126px] h-[126px] rounded-[28px] bg-[#FBC3A2] flex items-center justify-center z-10"
                  title="Talk with Emma"
                >
                  <svg width="86" height="74" viewBox="0 0 86 74" fill="none">
                    <path d="M12 18L34 25" stroke="#0F0F12" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M74 18L52 25" stroke="#0F0F12" strokeWidth="4.5" strokeLinecap="round" />
                    <ellipse cx="24" cy="30" rx="8.5" ry="6.5" fill="#FFFFFF" />
                    <circle cx="25" cy="30" r="4.5" fill="#0F0F12" />
                    <ellipse cx="62" cy="30" rx="8.5" ry="6.5" fill="#FFFFFF" />
                    <circle cx="61" cy="30" r="4.5" fill="#0F0F12" />
                    <path d="M28 55C39 48 51 48 62 54" stroke="#0F0F12" strokeWidth="4.8" strokeLinecap="round" />
                  </svg>
                </button>

                {/* 6. Sophia Sky Blue Arch */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Sophia");
                    navigateTo(4);
                  }}
                  style={{ transform: "rotate(-5deg)" }}
                  className="mascot-float-delayed tap-scale absolute -left-[6px] -bottom-[14px] w-[134px] h-[116px] rounded-t-[68px] rounded-b-[28px] bg-[#B5E2FA] flex items-center justify-center z-20"
                  title="Talk with Sophia"
                >
                  <svg width="84" height="64" viewBox="0 0 84 64" fill="none">
                    <path d="M18 22C23 17 30 17 35 22" stroke="#0F0F12" strokeWidth="4" strokeLinecap="round" />
                    <path d="M51 22C56 17 63 17 68 22" stroke="#0F0F12" strokeWidth="4" strokeLinecap="round" />
                    <ellipse cx="26" cy="30" rx="7" ry="4.5" fill="#FFFFFF" />
                    <circle cx="26" cy="30" r="3.5" fill="#0F0F12" />
                    <ellipse cx="59" cy="30" rx="7" ry="4.5" fill="#FFFFFF" />
                    <circle cx="59" cy="30" r="3.5" fill="#0F0F12" />
                    <ellipse cx="43" cy="47" rx="7" ry="4.2" stroke="#0F0F12" strokeWidth="3.8" />
                  </svg>
                </button>

                {/* 7. Kenji Coral Pink Triangle */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Kenji");
                    navigateTo(4);
                  }}
                  style={{ transform: "rotate(4deg)" }}
                  className="mascot-float tap-scale absolute -right-[8px] -bottom-[16px] w-[166px] h-[148px] z-20 flex items-center justify-center"
                  title="Talk with Kenji"
                >
                  <svg width="166" height="148" viewBox="0 0 166 148" fill="none">
                    <path d="M72 18C78 7 94 7 100 18L154 118C160 129 152 142 140 142H32C20 142 12 129 18 118L72 18Z" fill="#F9A8A8" />
                    <path d="M54 68L68 76L54 84" stroke="#0F0F12" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M114 68L100 76L114 84" stroke="#0F0F12" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M58 106C72 96 96 96 110 106" stroke="#0F0F12" strokeWidth="4.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Home Indicator */}
              <div className="w-full py-2 bg-transparent flex justify-center z-30">
                <div className="w-32 h-1.5 rounded-full bg-[#0F0F12]" />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
             SCREEN 2: LOGIN PAGE (FULL SCREEN, NO BOTTOM 3 CARDS)
             =================================================================== */}
        {(layoutMode === "all5" || (layoutMode === "roomOnly" && activeScreen === 2)) && (
          <div id="phoneFrame2" className="iphone-frame phone-tilt-alt">
            <div className="iphone-screen !bg-white">
              {!isGuestSetup ? (
                /* Full-Height Clean White Login Container */
                <div className="w-full h-full px-5 pt-3 pb-5 flex flex-col justify-between">
                  <div>
                    {/* Status Bar */}
                    <div className="w-full pb-2 flex items-center justify-between">
                      <span className="text-[13px] font-bold tracking-tight text-[#0F0F12] w-12">9:41</span>
                      <div className="dynamic-island" />
                      <div className="flex items-center gap-1.5 w-14 justify-end">
                        <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                          <rect x="1" y="7" width="2.5" height="4" rx="1" fill="#0F0F12" />
                          <rect x="4.8" y="5" width="2.5" height="6" rx="1" fill="#0F0F12" />
                          <rect x="8.6" y="2.8" width="2.5" height="8.2" rx="1" fill="#0F0F12" />
                          <rect x="12.4" y="0.5" width="2.5" height="10.5" rx="1" fill="#0F0F12" />
                        </svg>
                        <svg width="14" height="11" viewBox="0 0 15 11" fill="none">
                          <path d="M1.5 3.6C4.9 0.8 10.1 0.8 13.5 3.6" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="M3.8 6.2C6 4.4 9 4.4 11.2 6.2" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                          <circle cx="7.5" cy="9.1" r="1.4" fill="#0F0F12" />
                        </svg>
                        <svg width="22" height="11" viewBox="0 0 23 11" fill="none">
                          <rect x="0.7" y="1" width="18.6" height="9" rx="2.6" stroke="#0F0F12" strokeWidth="1.2" />
                          <rect x="2.4" y="2.6" width="15.2" height="5.8" rx="1.4" fill="#0F0F12" />
                          <path d="M20.8 3.8V7.2" stroke="#0F0F12" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Top Back and Step Pill */}
                    <div className="flex items-center justify-between mt-1">
                      <button
                        type="button"
                        onClick={() => navigateTo(1)}
                        className="tap-scale w-9 h-9 rounded-full border border-black/10 flex items-center justify-center"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#F4F4F8] text-[#6E6E7A]">
                        Account Sync
                      </span>
                    </div>

                    <div className="mt-4">
                      <h2 className="text-[25px] font-extrabold text-[#0F0F12] heading-tight font-sans">
                        {isIndonesian ? "Selamat Datang di Fluelo" : "Welcome to Fluelo"}
                      </h2>
                      <p className="text-[12px] font-medium text-[#8C8C99] mt-1.5 leading-relaxed font-sans">
                        {isIndonesian
                          ? "Masuk dengan Google atau mulai langsung sebagai tamu untuk membuka sesi Room Talk AI."
                          : "Sign in with Google or continue as a guest to unlock Room Talk AI."}
                      </p>
                    </div>

                    {/* Feature Preview Card (Clean aesthetic illustration and badges) */}
                    <div className="mt-7 bg-[#F8F8FC] rounded-[24px] p-5 border border-black/[0.05] flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-full bg-[#B8F3B8] border border-black/10 flex items-center justify-center shadow-xs mb-3">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <path d="M5 10C6.5 8 8.5 8 10 10" stroke="#0F0F12" strokeWidth="2.3" strokeLinecap="round" />
                          <path d="M14 10C15.5 8 17.5 8 19 10" stroke="#0F0F12" strokeWidth="2.3" strokeLinecap="round" />
                          <path d="M7.5 15.5C9.8 18 14.2 18 16.5 15.5" stroke="#0F0F12" strokeWidth="2.3" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-[14px] font-extrabold text-[#0F0F12] tracking-tight font-sans">
                        {isIndonesian ? "5 Partner Bicara AI Siap" : "5 AI Speaking Partners Ready"}
                      </p>
                      <p className="text-[11.5px] font-medium text-[#8C8C99] mt-1 max-w-[230px] leading-relaxed font-sans">
                        {isIndonesian
                          ? "Latihan percakapan audio dua arah setiap hari dengan evaluasi grammar & fluency instan."
                          : "Practice daily two-way English voice talk with instant grammar and fluency feedback."}
                      </p>
                      <div className="flex items-center gap-1.5 mt-3.5">
                        <span className="w-7 h-7 rounded-full bg-[#B8F3B8] border border-black/10 flex items-center justify-center text-[10.5px] font-extrabold text-[#0F0F12] font-sans">S</span>
                        <span className="w-7 h-7 rounded-full bg-[#FBC3A2] border border-black/10 flex items-center justify-center text-[10.5px] font-extrabold text-[#0F0F12] font-sans">E</span>
                        <span className="w-7 h-7 rounded-full bg-[#B5E2FA] border border-black/10 flex items-center justify-center text-[10.5px] font-extrabold text-[#0F0F12] font-sans">S</span>
                        <span className="w-7 h-7 rounded-full bg-[#D8C8FF] border border-black/10 flex items-center justify-center text-[10.5px] font-extrabold text-[#0F0F12] font-sans">D</span>
                        <span className="w-7 h-7 rounded-full bg-[#FDE272] border border-black/10 flex items-center justify-center text-[10.5px] font-extrabold text-[#0F0F12] font-sans">K</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom 2 Action Choices */}
                  <div>
                    {/* Choice 1: Continue with Google */}
                    <button
                      type="button"
                      onClick={() => {
                        showToast(isIndonesian ? "Berhasil masuk dengan Google!" : "Signed in with Google! Welcome back.", "#B8F3B8");
                        navigateTo(3);
                      }}
                      className="tap-scale w-full h-[50px] bg-[#F4F4F8] hover:bg-[#EAEAF0] border border-black/10 px-4 rounded-full flex items-center justify-center gap-2.5 shadow-2xs font-sans"
                    >
                      <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span className="text-[13px] font-extrabold text-[#0F0F12]">
                        {isIndonesian ? "Masuk dengan Google" : "Continue with Google"}
                      </span>
                    </button>

                    {/* Clean Divider */}
                    <div className="flex items-center gap-3 my-3">
                      <div className="h-[1px] flex-1 bg-black/10" />
                      <span className="text-[10px] font-extrabold text-[#9A9AA6] uppercase tracking-wider font-sans">
                        {isIndonesian ? "atau" : "or"}
                      </span>
                      <div className="h-[1px] flex-1 bg-black/10" />
                    </div>

                    {/* Choice 2: Continue as Guest */}
                    <button
                      type="button"
                      onClick={() => setIsGuestSetup(true)}
                      className="tap-scale w-full h-[50px] bg-[#0F0F12] text-white pl-5 pr-1.5 rounded-full flex items-center justify-between shadow-sm font-sans"
                    >
                      <span className="text-[13px] font-bold tracking-tight">
                        {isIndonesian ? "Masuk sebagai Tamu (Guest)" : "Continue as Guest"}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-[#B8F3B8] flex items-center justify-center text-[#0F0F12] shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#0F0F12" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>

                    {/* Home Indicator */}
                    <div className="w-full pt-4 pb-1 bg-transparent flex justify-center">
                      <div className="w-32 h-1.5 rounded-full bg-[#0F0F12]" />
                    </div>
                  </div>
                </div>
              ) : (
                /* GUEST ONBOARDING PROFILE SETUP: ELEGANT BENTO GRID LAYOUT */
                <div className="w-full h-full px-4 pt-3 pb-4 flex flex-col justify-between bg-[#F8F8FC] animate-in fade-in duration-200">
                  <div>
                    {/* Status Bar */}
                    <div className="w-full pb-2 flex items-center justify-between">
                      <span className="text-[13px] font-bold tracking-tight text-[#0F0F12] w-12">9:41</span>
                      <div className="dynamic-island" />
                      <div className="flex items-center gap-1.5 w-14 justify-end">
                        <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                          <rect x="1" y="7" width="2.5" height="4" rx="1" fill="#0F0F12" />
                          <rect x="4.8" y="5" width="2.5" height="6" rx="1" fill="#0F0F12" />
                          <rect x="8.6" y="2.8" width="2.5" height="8.2" rx="1" fill="#0F0F12" />
                          <rect x="12.4" y="0.5" width="2.5" height="10.5" rx="1" fill="#0F0F12" />
                        </svg>
                        <svg width="14" height="11" viewBox="0 0 15 11" fill="none">
                          <path d="M1.5 3.6C4.9 0.8 10.1 0.8 13.5 3.6" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="M3.8 6.2C6 4.4 9 4.4 11.2 6.2" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                          <circle cx="7.5" cy="9.1" r="1.4" fill="#0F0F12" />
                        </svg>
                        <svg width="22" height="11" viewBox="0 0 23 11" fill="none">
                          <rect x="0.7" y="1" width="18.6" height="9" rx="2.6" stroke="#0F0F12" strokeWidth="1.2" />
                          <rect x="2.4" y="2.6" width="15.2" height="5.8" rx="1.4" fill="#0F0F12" />
                          <path d="M20.8 3.8V7.2" stroke="#0F0F12" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Top Header Bar */}
                    <div className="flex items-center justify-between mt-1">
                      <button
                        type="button"
                        onClick={() => setIsGuestSetup(false)}
                        className="tap-scale w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-2xs"
                        title="Back"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <h2 className="text-[15px] font-extrabold text-[#0F0F12] leading-tight font-sans">
                        {isIndonesian ? "Profil Tamu" : "Guest Profile"}
                      </h2>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#0F0F12] text-white font-sans">
                        {guestLevel}
                      </span>
                    </div>

                    {/* BENTO GRID MODULES */}
                    <div className="mt-3 flex flex-col gap-2.5">
                      {/* BENTO CARD 1: IDENTITY BOX (Avatar + Name Input in 1 unified Card) */}
                      <div className="bg-white rounded-[22px] p-3 border border-black/[0.06] shadow-2xs flex flex-col gap-2.5">
                        <div className="flex items-center gap-3">
                          {/* Large Selected Avatar Badge */}
                          <div
                            style={{ backgroundColor: currentGuestAvatar.color }}
                            className="w-13 h-13 rounded-[18px] border-2 border-[#0F0F12] flex items-center justify-center shrink-0 shadow-xs transition-colors"
                          >
                            <div className="scale-125">
                              <MiniCalendarFace face={currentGuestAvatar.face} />
                            </div>
                          </div>

                          {/* Name Input */}
                          <div className="flex-1 min-w-0">
                            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#9898A6] block mb-0.5 font-sans">
                              {isIndonesian ? "Nama Kamu" : "Your Name"}
                            </span>
                            <input
                              type="text"
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              placeholder={isIndonesian ? "Ketik nama kamu" : "Enter your name"}
                              className="w-full h-9 px-3 rounded-xl bg-[#F4F4F8] text-[#0F0F12] font-extrabold text-[14px] outline-none border border-black/5 focus:border-[#0F0F12] focus:bg-white transition-all font-sans"
                            />
                          </div>
                        </div>

                        {/* Character Avatar Switcher Grid */}
                        <div className="pt-2 border-t border-black/[0.04]">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#9898A6] block mb-1.5 font-sans">
                            {isIndonesian ? "Pilih Karakter Avatar" : "Choose Character"}
                          </span>
                          <div className="grid grid-cols-5 gap-1.5">
                            {CALENDAR_PARTNERS.map((av) => {
                              const isSelected = guestAvatar === av.id;
                              return (
                                <button
                                  key={av.id}
                                  type="button"
                                  onClick={() => setGuestAvatar(av.id)}
                                  style={{ backgroundColor: av.color }}
                                  className={`tap-scale h-9 rounded-xl flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "ring-2 ring-[#0F0F12] scale-105 shadow-xs"
                                      : "opacity-60 hover:opacity-100 hover:scale-102"
                                  }`}
                                  title={av.name}
                                >
                                  <MiniCalendarFace face={av.face} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* BENTO CARD 2: CEFR ENGLISH LEVEL GRID */}
                      <div className="bg-white rounded-[22px] p-3 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#9898A6] font-sans">
                            {isIndonesian ? "Level Bahasa Inggris" : "English Level"}
                          </span>
                          <span className="text-[10px] font-extrabold text-[#0F0F12] bg-[#F4F4F8] px-2 py-0.5 rounded-md font-sans">
                            {guestLevel === "A1"
                              ? "Beginner"
                              : guestLevel === "A2"
                              ? "Elementary"
                              : guestLevel.startsWith("B")
                              ? "Intermediate"
                              : "Advanced"}
                          </span>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {GUEST_LEVELS.map((lvl) => {
                            const isSelected = guestLevel === lvl;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setGuestLevel(lvl)}
                                className={`tap-scale h-9 rounded-xl flex items-center justify-center text-[12px] font-extrabold transition-all font-sans ${
                                  isSelected
                                    ? "bg-[#0F0F12] text-white shadow-xs scale-102"
                                    : "bg-[#F4F4F8] text-[#555562] hover:bg-[#EAEAF0]"
                                }`}
                              >
                                {lvl}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* BENTO CARD 3: AGE RANGE SEGMENTED CONTROL */}
                      <div className="bg-white rounded-[22px] p-3 border border-black/[0.06] shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#9898A6] font-sans">
                            {isIndonesian ? "Rentang Umur" : "Age Range"}
                          </span>
                          <span className="text-[10px] font-bold text-[#9898A6] font-sans">
                            {guestAgeRange}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F4F4F8] rounded-[16px]">
                          {GUEST_AGE_RANGES.map((rng) => {
                            const isSelected = guestAgeRange === rng.id;
                            return (
                              <button
                                key={rng.id}
                                type="button"
                                onClick={() => setGuestAgeRange(rng.id)}
                                className={`tap-scale h-8 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center font-sans ${
                                  isSelected
                                    ? "bg-white text-[#0F0F12] shadow-xs"
                                    : "text-[#8C8C99] hover:text-[#0F0F12]"
                                }`}
                              >
                                {isIndonesian ? rng.labelId : rng.labelEn}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        showToast(
                          isIndonesian
                            ? `Selamat datang ${guestName || "Alex"} Level ${guestLevel}!`
                            : `Welcome ${guestName || "Alex"} Level ${guestLevel}!`,
                          "#B8F3B8"
                        );
                        navigateTo(3);
                      }}
                      className="tap-scale w-full h-[50px] bg-[#0F0F12] text-white pl-5 pr-1.5 rounded-full flex items-center justify-between shadow-sm font-sans"
                    >
                      <span className="text-[13px] font-extrabold tracking-tight">
                        {isIndonesian ? "Mulai Latihan" : "Start Practice"}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-[#B8F3B8] flex items-center justify-center text-[#0F0F12] shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#0F0F12" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>

                    {/* Home Indicator */}
                    <div className="w-full pt-3 pb-1 bg-transparent flex justify-center">
                      <div className="w-32 h-1.5 rounded-full bg-[#0F0F12]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
             SCREEN 3: HOME DASHBOARD (CHARACTERS, PRONUNCIATION, GRAMMAR)
             =================================================================== */}
        {(layoutMode === "all5" || layoutMode === "core3" || (layoutMode === "roomOnly" && activeScreen === 3)) && (
          <div id="phoneFrame3" className="iphone-frame phone-tilt-center">
            <div className="iphone-screen">
              {/* TOP WHITE CARD */}
              <div className="bg-white rounded-b-[30px] px-4 pt-3 pb-4 flex flex-col shrink-0">
                {/* Status Bar */}
                <div className="w-full pb-2 px-1 flex items-center justify-between">
                  <span className="text-[13px] font-bold tracking-tight text-[#0F0F12] w-12">9:41</span>
                  <div className="dynamic-island" />
                  <div className="flex items-center gap-1.5 w-14 justify-end">
                    <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                      <rect x="1" y="7" width="2.5" height="4" rx="1" fill="#0F0F12" />
                      <rect x="4.8" y="5" width="2.5" height="6" rx="1" fill="#0F0F12" />
                      <rect x="8.6" y="2.8" width="2.5" height="8.2" rx="1" fill="#0F0F12" />
                      <rect x="12.4" y="0.5" width="2.5" height="10.5" rx="1" fill="#0F0F12" />
                    </svg>
                    <svg width="14" height="11" viewBox="0 0 15 11" fill="none">
                      <path d="M1.5 3.6C4.9 0.8 10.1 0.8 13.5 3.6" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M3.8 6.2C6 4.4 9 4.4 11.2 6.2" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                      <circle cx="7.5" cy="9.1" r="1.4" fill="#0F0F12" />
                    </svg>
                    <svg width="22" height="11" viewBox="0 0 23 11" fill="none">
                      <rect x="0.7" y="1" width="18.6" height="9" rx="2.6" stroke="#0F0F12" strokeWidth="1.2" />
                      <rect x="2.4" y="2.6" width="15.2" height="5.8" rx="1.4" fill="#0F0F12" />
                      <path d="M20.8 3.8V7.2" stroke="#0F0F12" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Fluelo Brand Header on Dashboard */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center select-none">
                    <svg width="86" height="38" viewBox="0 0 500 240" fill="none" className="shrink-0 drop-shadow-2xs">
                      <circle cx="120" cy="120" r="108" fill="#B899FF" />
                      <circle cx="120" cy="120" r="80" fill="#8F5BFF" />
                      <circle cx="120" cy="120" r="60" fill="#F5F0FF" />
                      <text x="256" y="146" fill="#0F0F12" font-family="'Plus Jakarta Sans', sans-serif" font-size="82" font-weight="800" letter-spacing="-0.04em">Fluelo</text>
                    </svg>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo(4)}
                    className="tap-scale w-9 h-9 rounded-full border border-black/10 flex items-center justify-center"
                    title="Open Room Talk"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M5 9H19M5 15H19" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Date and Greeting */}
                <p className="text-[10.5px] font-semibold text-[#A0A0AB] mt-3">
                  {baseToday.toLocaleDateString(isIndonesian ? "id-ID" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <h2 className="text-[20.5px] font-extrabold text-[#0F0F12] heading-tight mt-0.5">
                  {isIndonesian
                    ? `Halo ${guestName || "Alex"}! Mau ngobrol sama siapa hari ini?`
                    : `Hello ${guestName || "Alex"}! Who do you want to talk to today?`}
                </h2>

                {/* Character Pill Selector Row */}
                <div className="flex items-center gap-2 mt-3.5 overflow-x-auto no-scrollbar pb-0.5">
                  {/* Sarah */}
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectPartner("Sarah");
                      navigateTo(4);
                    }}
                    className="tap-scale relative w-[74px] h-[52px] rounded-[16px] bg-[#F5F5F8] hover:bg-[#ECECF2] shrink-0 overflow-hidden text-left p-2.5 flex items-end border border-black/[0.04]"
                  >
                    <span className="text-[11.5px] font-extrabold text-[#0F0F12] z-10">Sarah</span>
                    <div className="absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#B8F3B8] rotate-[-10deg] flex items-center justify-center shadow-sm">
                      <svg width="20" height="16" viewBox="0 0 24 18" fill="none">
                        <path d="M3 7C5 4 8 4 10 7" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round" />
                        <path d="M14 7C16 4 19 4 21 7" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round" />
                        <path d="M6 12C9.5 16 14.5 16 18 12" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </button>

                  {/* Emma */}
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectPartner("Emma");
                      navigateTo(4);
                    }}
                    className="tap-scale relative w-[74px] h-[52px] rounded-[16px] bg-[#F5F5F8] hover:bg-[#ECECF2] shrink-0 overflow-hidden text-left p-2.5 flex items-end border border-black/[0.04]"
                  >
                    <span className="text-[11.5px] font-extrabold text-[#0F0F12] z-10">Emma</span>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-[9px] bg-[#FBC3A2] rotate-[12deg] flex items-center justify-center shadow-sm">
                      <svg width="20" height="16" viewBox="0 0 24 18" fill="none">
                        <circle cx="7" cy="7" r="2" fill="#0F0F12" />
                        <circle cx="17" cy="7" r="2" fill="#0F0F12" />
                        <path d="M7 13C10 10.5 14 10.5 17 13" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </button>

                  {/* Sophia */}
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectPartner("Sophia");
                      navigateTo(4);
                    }}
                    className="tap-scale relative w-[76px] h-[52px] rounded-[16px] bg-[#F5F5F8] hover:bg-[#ECECF2] shrink-0 overflow-hidden text-left p-2.5 flex items-end border border-black/[0.04]"
                  >
                    <span className="text-[11.5px] font-extrabold text-[#0F0F12] z-10">Sophia</span>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-t-[16px] rounded-b-[7px] bg-[#B5E2FA] rotate-[-8deg] flex items-center justify-center shadow-sm">
                      <svg width="20" height="16" viewBox="0 0 24 18" fill="none">
                        <circle cx="7.5" cy="7" r="2" fill="#0F0F12" />
                        <circle cx="16.5" cy="7" r="2" fill="#0F0F12" />
                        <ellipse cx="12" cy="12.5" rx="2.6" ry="2" fill="#0F0F12" />
                      </svg>
                    </div>
                  </button>

                  {/* David */}
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectPartner("David");
                      navigateTo(4);
                    }}
                    className="tap-scale relative w-[72px] h-[52px] rounded-[16px] bg-[#F5F5F8] hover:bg-[#ECECF2] shrink-0 overflow-hidden text-left p-2.5 flex items-end border border-black/[0.04]"
                  >
                    <span className="text-[11.5px] font-extrabold text-[#0F0F12] z-10">David</span>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-[10px] bg-[#FDE272] rotate-[10deg] flex items-center justify-center shadow-sm">
                      <svg width="20" height="16" viewBox="0 0 24 18" fill="none">
                        <path d="M5 6.5C6.5 5 8.5 5 10 6.5" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round" />
                        <path d="M14 6.5C15.5 5 17.5 5 19 6.5" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 12.5H16" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </button>

                  {/* Kenji */}
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectPartner("Kenji");
                      navigateTo(4);
                    }}
                    className="tap-scale relative w-[72px] h-[52px] rounded-[16px] bg-[#F5F5F8] hover:bg-[#ECECF2] shrink-0 overflow-hidden text-left p-2.5 flex items-end border border-black/[0.04]"
                  >
                    <span className="text-[11.5px] font-extrabold text-[#0F0F12] z-10">Kenji</span>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-[10px] bg-[#F9A8A8] rotate-[-12deg] flex items-center justify-center shadow-sm">
                      <svg width="20" height="16" viewBox="0 0 24 18" fill="none">
                        <path d="M4 6L9 8L4 10" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="16.5" cy="8" r="2" fill="#0F0F12" />
                        <path d="M7 13.5C10 15.5 14 15.5 17 13.5" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              {/* LOWER BLACK BENTO CONTAINER */}
              <div className="flex-1 p-[5px] flex flex-col gap-[5px] bg-[#0F0F12]">
                {/* 2 Graph Cards: Pronunciation and Grammar Indicator */}
                <div className="grid grid-cols-2 gap-[5px] h-[176px]">
                  {/* LEFT: Pronunciation */}
                  <div
                    onClick={() => setPronIdx((prev) => (prev + 1) % pronMetrics.length)}
                    className="tap-scale bg-[#FBC3A2] rounded-[26px] p-3.5 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <rect x="3" y="10" width="3.2" height="7" rx="1.6" fill="#0F0F12" />
                        <rect x="8.2" y="5" width="3.2" height="15" rx="1.6" fill="#0F0F12" />
                        <rect x="13.4" y="8" width="3.2" height="10" rx="1.6" fill="#0F0F12" />
                        <rect x="18.6" y="11" width="3.2" height="5" rx="1.6" fill="#0F0F12" />
                      </svg>
                      <span className="text-[11.5px] font-extrabold text-[#0F0F12] tracking-tight truncate">
                        Pronunciation
                      </span>
                    </div>

                    {/* 7 Striped Capsule Bars */}
                    <div className="flex items-center justify-between gap-1.5 px-0.5 my-1 h-[62px]">
                      {[42, 48, 56, 50, 38, 58, 46].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}px` }}
                          className="w-3.5 rounded-full bg-[#C98253] flex flex-col justify-between py-1.5 items-center"
                        >
                          <span className="w-2 h-[1.5px] bg-[#FBC3A2]" />
                          <span className="w-2 h-[1.5px] bg-[#0F0F12]" />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-[22px] font-extrabold text-[#0F0F12] metric-tight">
                        {pronMetrics[pronIdx].big}
                      </span>
                      <span className="text-[15px] font-bold text-[#0F0F12]">
                        {pronMetrics[pronIdx].sub}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT: Grammar Indicator (Replaced Tenses Graph as requested!) */}
                  <div
                    onClick={() => setGrammarIdx((prev) => (prev + 1) % grammarMetrics.length)}
                    className="tap-scale bg-[#D8C8FF] rounded-[26px] p-3.5 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <circle cx="12" cy="12" r="9" fill="#0F0F12" />
                        <path d="M12 7.5V12L15 14" stroke="#D8C8FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[11.5px] font-extrabold text-[#0F0F12] tracking-tight truncate">
                        Grammar Indicator
                      </span>
                    </div>

                    {/* 5 Ascending Purple Bars */}
                    <div className="flex items-end justify-between gap-2 px-1 my-1 h-[62px]">
                      <div className="w-4 h-[14px] rounded-[4px] bg-[#946EC2]" />
                      <div className="w-4 h-[24px] rounded-[4px] bg-[#946EC2]" />
                      <div className="w-4 h-[32px] rounded-[4px] bg-[#946EC2]" />
                      <div className="w-4 h-[44px] rounded-[4px] bg-[#946EC2]" />
                      <div className="w-4 h-[56px] rounded-[4px] bg-[#946EC2]" />
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-[23px] font-extrabold text-[#0F0F12] metric-tight">
                        {grammarMetrics[grammarIdx].big}
                      </span>
                      <span className="text-[10.5px] font-extrabold text-[#0F0F12]/70">
                        {grammarMetrics[grammarIdx].sub}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTTOM QUIZ CARD */}
                <div className="bg-[#B8F3B8] rounded-[26px] p-3.5 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C14.5 2 16 4.5 14.5 7C17 5.5 19.5 7 19.5 9.5C19.5 12 17 13.5 14.5 12C17 13.5 19.5 15 19.5 17.5C19.5 20 17 21.5 14.5 20C16 22.5 14.5 24 12 24C9.5 24 8 22.5 9.5 20C7 21.5 4.5 20 4.5 17.5C4.5 15 7 13.5 9.5 12C7 13.5 4.5 12 4.5 9.5C4.5 7 7 5.5 9.5 7C8 4.5 9.5 2 12 2Z" fill="#0F0F12" />
                      </svg>
                      <span className="text-[11.5px] font-extrabold text-[#0F0F12]">Yes or No Quiz</span>
                    </div>
                    <span className="text-[10.5px] font-bold text-[#0F0F12]/60">
                      Question {quizIdx + 1} of 8
                    </span>
                  </div>

                  <p className="text-[14px] font-extrabold text-[#0F0F12] leading-snug my-1">
                    {GRAMMAR_QUESTIONS[quizIdx].q}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const q = GRAMMAR_QUESTIONS[quizIdx];
                        triggerFeedback(q.ans ? "check" : "cross");
                        setQuizIdx((prev) => (prev + 1) % GRAMMAR_QUESTIONS.length);
                      }}
                      className="tap-scale bg-[#0F0F12] hover:bg-[#222228] text-white py-2.5 rounded-full text-[12px] font-bold font-sans"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const q = GRAMMAR_QUESTIONS[quizIdx];
                        triggerFeedback(!q.ans ? "check" : "cross");
                        setQuizIdx((prev) => (prev + 1) % GRAMMAR_QUESTIONS.length);
                      }}
                      className="tap-scale bg-[#0F0F12] hover:bg-[#222228] text-white py-2.5 rounded-full text-[12px] font-bold font-sans"
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* BOTTOM NAVIGATION DOCK */}
                <div className="h-[52px] px-4 flex items-center justify-between bg-[#0F0F12]">
                  <button
                    type="button"
                    onClick={() => navigateTo(3)}
                    className="tap-scale bg-white text-[#0F0F12] px-4 py-2 rounded-full flex items-center justify-center"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M4 10.5L12 4L20 10.5V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V10.5Z" stroke="#0F0F12" strokeWidth="2.2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(4)}
                    className="tap-scale text-white/65 hover:text-white p-2 rounded-full flex items-center justify-center"
                    title="Open Room Talk"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12C12 10.3 13.3 9 15 9C16.7 9 18 10.3 18 12C18 15.3 15.3 18 12 18C8.7 18 6 15.3 6 12C6 7.6 9.6 4 14 4C18.4 4 21 7.6 21 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(5)}
                    className="tap-scale text-white/65 hover:text-white p-2 rounded-full flex items-center justify-center"
                    title="Check-In Calendar"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="2.2" />
                      <path d="M8 3V6M16 3V6M4 10H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(2)}
                    className="tap-scale text-white/65 hover:text-white p-2 rounded-full flex items-center justify-center"
                    title="Account"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <circle cx="7.5" cy="7.5" r="2" fill="currentColor" />
                      <circle cx="16.5" cy="7.5" r="2" fill="currentColor" />
                      <circle cx="7.5" cy="16.5" r="2" fill="currentColor" />
                      <circle cx="16.5" cy="16.5" r="2" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="w-full pb-2 bg-[#0F0F12] flex justify-center">
                <div className="w-32 h-1.5 rounded-full bg-white/90" />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
             SCREEN 4: ROOM TALK (LIVE AI VOICE CONVERSATION & IN-ROOM EVALUATION)
             =================================================================== */}
        {(layoutMode === "all5" || layoutMode === "core3" || (layoutMode === "roomOnly" && activeScreen === 4)) && (
          <div id="phoneFrame4" className="iphone-frame phone-tilt-alt">
            <div className="iphone-screen">
              {/* Top White Bar */}
              <div className="bg-white rounded-b-[28px] px-4 pt-3 pb-3 flex flex-col shrink-0">
                {/* Status Bar */}
                <div className="w-full pb-1.5 px-1 flex items-center justify-between">
                  <span className="text-[13px] font-bold tracking-tight text-[#0F0F12] w-12">9:41</span>
                  <div className={`dynamic-island ${isIslandActive ? "island-active" : ""}`} />
                  <div className="flex items-center gap-1.5 w-14 justify-end">
                    <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                      <rect x="1" y="7" width="2.5" height="4" rx="1" fill="#0F0F12" />
                      <rect x="4.8" y="5" width="2.5" height="6" rx="1" fill="#0F0F12" />
                      <rect x="8.6" y="2.8" width="2.5" height="8.2" rx="1" fill="#0F0F12" />
                      <rect x="12.4" y="0.5" width="2.5" height="10.5" rx="1" fill="#0F0F12" />
                    </svg>
                    <svg width="14" height="11" viewBox="0 0 15 11" fill="none">
                      <path d="M1.5 3.6C4.9 0.8 10.1 0.8 13.5 3.6" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M3.8 6.2C6 4.4 9 4.4 11.2 6.2" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                      <circle cx="7.5" cy="9.1" r="1.4" fill="#0F0F12" />
                    </svg>
                    <svg width="22" height="11" viewBox="0 0 23 11" fill="none">
                      <rect x="0.7" y="1" width="18.6" height="9" rx="2.6" stroke="#0F0F12" strokeWidth="1.2" />
                      <rect x="2.4" y="2.6" width="15.2" height="5.8" rx="1.4" fill="#0F0F12" />
                      <path d="M20.8 3.8V7.2" stroke="#0F0F12" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Header: Back + Character Name & Level Badge (NO DOTS!) */}
                <div className="flex items-center justify-between mt-0.5">
                  <button
                    type="button"
                    onClick={() => navigateTo(3)}
                    className="tap-scale w-9 h-9 rounded-full border border-black/10 flex items-center justify-center"
                    title="Back to Dashboard"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M14.5 17.5L9 12L14.5 6.5" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <h2 className="text-[16px] font-extrabold text-[#0F0F12] leading-tight">
                      {partner.name}
                    </h2>
                    <p className="text-[10.5px] font-bold text-[#9898A6]">
                      Level A1 AI Partner
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-[#F4F4F8] text-[10.5px] font-extrabold text-[#0F0F12]">
                    A1
                  </span>
                </div>

                {/* Character Switcher Pills */}
                <div className="flex items-center justify-between gap-1 mt-2.5 overflow-x-auto no-scrollbar">
                  {Object.keys(ROOM_PARTNERS).map((charName) => (
                    <button
                      key={charName}
                      type="button"
                      onClick={() => handleSelectPartner(charName)}
                      className={`tap-scale px-2.5 py-1 rounded-full text-[10.5px] font-extrabold shrink-0 transition-all ${
                        currentPartnerKey === charName ? "bg-[#0F0F12] text-white" : "bg-[#F4F4F8] text-[#0F0F12]"
                      }`}
                    >
                      {charName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lower Black Bento Container */}
              <div className="flex-1 p-[5px] flex flex-col gap-[5px] bg-[#0F0F12] overflow-hidden">
                {/* ACTIVE CHARACTER STAGE CARD */}
                <div
                  style={{ backgroundColor: partner.color }}
                  onClick={!hasStartedVoice ? handleVoiceTap : undefined}
                  className={`rounded-[28px] p-4 relative overflow-hidden flex flex-col items-center justify-between transition-all duration-300 ${
                    !hasStartedVoice
                      ? "flex-1 cursor-pointer py-6"
                      : "h-[195px] shrink-0"
                  }`}
                >
                  <div className="w-full flex items-center justify-between z-10">
                    <div className="inline-flex items-center bg-[#0F0F12] text-white px-3 py-1 rounded-full">
                      <span className="text-[10.5px] font-extrabold tracking-tight">
                        {!hasStartedVoice
                          ? (isIndonesian ? `Tekan Voice untuk bicara dengan ${partner.name}` : `Tap Voice to talk with ${partner.name}`)
                          : getStageStatusText()}
                      </span>
                    </div>

                    <span className="text-[10.5px] font-extrabold text-[#0F0F12]/75 bg-white/70 px-2.5 py-1 rounded-full">
                      {partner.trait}
                    </span>
                  </div>

                  {/* Centered Expressive Vector Mascot with Moving Mouth & Blinking Eyes */}
                  <div className={`my-auto flex flex-col items-center justify-center z-10 transition-transform duration-300 ${!hasStartedVoice ? "scale-115 my-auto" : ""}`}>
                    {currentPartnerKey === "Sarah" && (
                      <div
                        style={{ transform: "rotate(-6deg)" }}
                        className="mascot-float w-[122px] h-[122px] rounded-full bg-[#8EE88E] border-[3px] border-[#0F0F12] flex items-center justify-center shadow-sm"
                      >
                        <svg width="78" height="60" viewBox="0 0 78 60" fill="none">
                          <g className="blinking-eyes">
                            <path d="M12 20C16 12 25 12 29 20" stroke="#0F0F12" strokeWidth="4.2" strokeLinecap="round" />
                            <path d="M49 20C53 12 62 12 66 20" stroke="#0F0F12" strokeWidth="4.2" strokeLinecap="round" />
                          </g>
                          <g className={isCurrentlySpeaking ? "speaking-mouth" : ""}>
                            <path d="M20 36C30 48 48 48 58 36" stroke="#0F0F12" strokeWidth="4.6" strokeLinecap="round" />
                          </g>
                        </svg>
                      </div>
                    )}
                    {currentPartnerKey === "Emma" && (
                      <div
                        style={{ transform: "rotate(8deg)" }}
                        className="mascot-float w-[116px] h-[116px] rounded-[28px] bg-[#F5A678] border-[3px] border-[#0F0F12] flex items-center justify-center shadow-sm"
                      >
                        <svg width="74" height="60" viewBox="0 0 74 60" fill="none">
                          <g className="blinking-eyes">
                            <path d="M12 15L28 20" stroke="#0F0F12" strokeWidth="4" strokeLinecap="round" />
                            <path d="M62 15L46 20" stroke="#0F0F12" strokeWidth="4" strokeLinecap="round" />
                            <circle cx="21" cy="26" r="5" fill="#0F0F12" />
                            <circle cx="53" cy="26" r="5" fill="#0F0F12" />
                          </g>
                          <g className={isCurrentlySpeaking ? "speaking-mouth" : ""}>
                            <path d="M24 44C33 38 41 38 50 44" stroke="#0F0F12" strokeWidth="4.4" strokeLinecap="round" />
                          </g>
                        </svg>
                      </div>
                    )}
                    {currentPartnerKey === "Sophia" && (
                      <div
                        style={{ transform: "rotate(-5deg)" }}
                        className="mascot-float w-[122px] h-[114px] rounded-t-[60px] rounded-b-[26px] bg-[#87C8FA] border-[3px] border-[#0F0F12] flex items-center justify-center shadow-sm"
                      >
                        <svg width="72" height="56" viewBox="0 0 72 56" fill="none">
                          <g className="blinking-eyes">
                            <circle cx="22" cy="22" r="5.5" fill="#0F0F12" />
                            <circle cx="20.5" cy="20.5" r="1.8" fill="#FFFFFF" />
                            <circle cx="50" cy="22" r="5.5" fill="#0F0F12" />
                            <circle cx="48.5" cy="20.5" r="1.8" fill="#FFFFFF" />
                          </g>
                          <g className={isCurrentlySpeaking ? "speaking-mouth" : ""}>
                            <ellipse cx="36" cy="39" rx="7.5" ry="5" fill="#0F0F12" />
                          </g>
                        </svg>
                      </div>
                    )}
                    {currentPartnerKey === "David" && (
                      <div
                        style={{ transform: "rotate(-6deg)" }}
                        className="mascot-float w-[116px] h-[116px] rounded-[28px] bg-[#F7D147] border-[3px] border-[#0F0F12] flex items-center justify-center shadow-sm"
                      >
                        <svg width="72" height="56" viewBox="0 0 72 56" fill="none">
                          <g className="blinking-eyes">
                            <path d="M14 20C19 13 26 13 30 20" stroke="#0F0F12" strokeWidth="4" strokeLinecap="round" />
                            <path d="M42 20C46 13 53 13 58 20" stroke="#0F0F12" strokeWidth="4" strokeLinecap="round" />
                          </g>
                          <g className={isCurrentlySpeaking ? "speaking-mouth" : ""}>
                            <path d="M22 37C31 46 41 46 50 37" stroke="#0F0F12" strokeWidth="4.4" strokeLinecap="round" />
                          </g>
                        </svg>
                      </div>
                    )}
                    {currentPartnerKey === "Kenji" && (
                      <div
                        style={{ transform: "rotate(5deg)" }}
                        className="mascot-float w-[124px] h-[114px] flex items-center justify-center"
                      >
                        <svg width="124" height="114" viewBox="0 0 166 148" fill="none">
                          <path d="M72 18C78 7 94 7 100 18L154 118C160 129 152 142 140 142H32C20 142 12 129 18 118L72 18Z" fill="#FF8598" stroke="#0F0F12" strokeWidth="4" />
                          <g className="blinking-eyes">
                            <path d="M54 68L68 76L54 84" stroke="#0F0F12" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M114 68L100 76L114 84" stroke="#0F0F12" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
                          </g>
                          <g className={isCurrentlySpeaking ? "speaking-mouth" : ""}>
                            <path d="M58 106C72 96 96 96 110 106" stroke="#0F0F12" strokeWidth="5" strokeLinecap="round" />
                          </g>
                        </svg>
                      </div>
                    )}

                    {/* Pre-Voice Greeting Text (shown only when !hasStartedVoice) */}
                    {!hasStartedVoice && (
                      <div className="mt-5 text-center px-4 animate-in fade-in duration-300">
                        <h3 className="text-[20px] font-extrabold text-[#0F0F12] tracking-tight">
                          {partner.name}
                        </h3>
                        <p className="text-[12px] font-semibold text-[#0F0F12]/80 mt-1 max-w-[240px] mx-auto leading-snug">
                          {isIndonesian
                            ? `Siap mengobrol santai bersama ${partner.name}? Tekan tombol Voice di bawah untuk mulai.`
                            : `Ready to practice speaking? Tap Voice below to start talking.`}
                        </p>
                        <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/70 text-[10.5px] font-extrabold text-[#0F0F12] mt-3 shadow-2xs">
                          <span>Level {guestLevel} {partner.trait}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CHAT SECTION CARD OR IN-ROOM EVALUATION (shown ONLY after voice is tapped) */}
                {hasStartedVoice && (
                  <div className="bg-white rounded-[28px] p-4 flex-1 flex flex-col overflow-hidden relative animate-in fade-in duration-300">
                  {!inRoomEvaluation ? (
                    <>
                      {/* Strictly Labeled "Chat" */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] shrink-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-extrabold text-[#0F0F12] tracking-tight">Chat</h3>
                          {live.isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B8F3B8] text-[10px] font-extrabold text-[#0F0F12]">
                              Live Audio
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] font-semibold text-[#9898A6]">
                          {isCurrentlyListening
                            ? "Listening to you..."
                            : isCurrentlySpeaking
                              ? `${partner.name} speaking...`
                              : "Tap Voice to start speaking"}
                        </span>
                      </div>

                      {/* Scrollable Dialogue Turns */}
                      <div className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-2.5">
                        {displayedTurns.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 my-auto select-none">
                            <div className="w-10 h-10 rounded-full bg-[#F4F4F8] flex items-center justify-center mb-2.5 text-[#9898A6]">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30493 11.1801 2.99656 12.5 3H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#9898A6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-[12px] font-bold text-[#9898A6]">
                              {isIndonesian ? "Transkrip percakapan akan muncul di sini" : "Your transcript will show here"}
                            </p>
                            <p className="text-[10.5px] font-medium text-[#B0B0BD] mt-0.5">
                              {isCurrentlyListening
                                ? (isIndonesian ? "Sedang mendengarkan suaramu..." : "Listening to your voice...")
                                : (isIndonesian ? "Mulai berbicara dengan mikrofon kamu" : "Speak into your microphone to start")}
                            </p>
                          </div>
                        ) : (
                          displayedTurns.map((msg, i) => (
                            <div
                              key={i}
                              className={`flex flex-col ${
                                msg.sender === "ai" ? "items-start max-w-[88%]" : "items-end self-end max-w-[88%]"
                              }`}
                            >
                              <span className="text-[9.5px] font-extrabold text-[#9898A6] mb-0.5 px-1">
                                {msg.sender === "ai" ? partner.name : "You"}
                              </span>
                              <div
                                className={`px-3.5 py-2.5 text-[12px] font-bold leading-snug border ${
                                  msg.sender === "ai"
                                    ? "bg-[#F4F4F8] text-[#0F0F12] rounded-[18px] rounded-tl-[6px] border-black/[0.04]"
                                    : "bg-[#0F0F12] text-white rounded-[18px] rounded-tr-[6px] border-transparent"
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={chatBottomRef} />
                      </div>
                    </>
                  ) : (
                    /* IN-ROOM EVALUATION VIEW */
                    <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar py-1">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                          <h3 className="text-[14px] font-extrabold text-[#0F0F12]">Session Evaluation</h3>
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#B8F3B8] text-[#0F0F12]">
                            {live.feedback ? `Band ${formatBand(live.feedback.overallBand)} ${live.feedback.cefr}` : `Band 5.5 Level ${guestLevel}`}
                          </span>
                        </div>

                        {live.status === "evaluating" && !live.feedback ? (
                          <div className="py-8 text-center">
                            <div className="w-8 h-8 rounded-full border-2 border-black/20 border-t-[#0F0F12] animate-spin mx-auto mb-2" />
                            <p className="text-xs font-bold text-[#0F0F12]">AI is preparing your speaking evaluation...</p>
                            <p className="text-[10.5px] text-[#8C8C99] mt-1">Analyzing pronunciation, grammar, and fluency.</p>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-3 gap-2 my-3">
                              <div className="bg-[#F4F4F8] rounded-[16px] p-2.5 text-center">
                                <p className="text-[10px] font-bold text-[#8C8C99]">Fluency</p>
                                <p className="text-[16px] font-extrabold text-[#0F0F12] metric-tight">
                                  {live.feedback ? `${Math.round(live.feedback.overallBand * 16)}%` : "88%"}
                                </p>
                              </div>
                              <div className="bg-[#F4F4F8] rounded-[16px] p-2.5 text-center">
                                <p className="text-[10px] font-bold text-[#8C8C99]">Grammar</p>
                                <p className="text-[16px] font-extrabold text-[#0F0F12] metric-tight">
                                  {live.feedback ? `${Math.min(98, Math.round(live.feedback.overallBand * 17))}%` : "92%"}
                                </p>
                              </div>
                              <div className="bg-[#F4F4F8] rounded-[16px] p-2.5 text-center">
                                <p className="text-[10px] font-bold text-[#8C8C99]">Pronunciation</p>
                                <p className="text-[16px] font-extrabold text-[#0F0F12] metric-tight">
                                  {live.feedback ? `${Math.min(96, Math.round(live.feedback.overallBand * 16))}%` : "86%"}
                                </p>
                              </div>
                            </div>

                            <div className="bg-[#EDF2FF] rounded-[18px] p-3 border border-black/[0.04]">
                              <p className="text-[11px] font-extrabold text-[#0F0F12]">
                                Feedback by {partner.name}
                              </p>
                              <p className="text-[11px] font-medium text-[#4E3883] mt-1 leading-relaxed">
                                {live.feedback?.summary ||
                                  "Natural everyday conversation! Your sentence structures were clear and polite. Keep practicing daily to unlock Level A2."}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setInRoomEvaluation(false);
                            void handleVoiceTap();
                          }}
                          className="tap-scale h-[40px] px-3 bg-[#F4F4F8] hover:bg-[#EAEAF0] text-[#0F0F12] rounded-full text-[12px] font-extrabold tracking-tight flex items-center justify-center transition-colors font-sans"
                        >
                          Practice Again
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInRoomEvaluation(false);
                            navigateTo(3);
                          }}
                          className="tap-scale h-[40px] px-3 bg-[#0F0F12] hover:bg-black/85 text-white rounded-full text-[12px] font-extrabold tracking-tight flex items-center justify-center transition-colors font-sans"
                        >
                          Exit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BOTTOM ACTION CONTROLS (VOICE BUTTON AND END BUTTON) */}
              {!hasStartedVoice ? (
                <div className="h-[62px] px-2 pt-1 flex items-center gap-2 bg-[#0F0F12] shrink-0">
                  <button
                    type="button"
                    onClick={handleVoiceTap}
                    className="tap-scale relative flex-1 h-[48px] bg-[#B8F3B8] hover:bg-[#a3eca3] text-[#0F0F12] rounded-full flex items-center justify-center gap-2 shadow-sm font-sans"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="2" width="6" height="11" rx="3" stroke="#0F0F12" strokeWidth="2.3" />
                      <path d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke="#0F0F12" strokeWidth="2.3" strokeLinecap="round" />
                      <path d="M12 18V22M8 22H16" stroke="#0F0F12" strokeWidth="2.3" strokeLinecap="round" />
                    </svg>
                    <span className="text-[13px] font-extrabold tracking-tight">
                      {isIndonesian ? "Mulai Bicara (Voice)" : "Voice"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo(3)}
                    className="tap-scale w-[114px] h-[48px] bg-white/10 hover:bg-white/15 text-white rounded-full flex items-center justify-center gap-1.5 shadow-sm font-sans"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M14.5 17.5L9 12L14.5 6.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[13px] font-bold tracking-tight">Exit</span>
                  </button>
                </div>
              ) : (
                <div className="h-[62px] px-2 pt-1 flex items-center gap-2 bg-[#0F0F12] shrink-0 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={handleVoiceTap}
                    className={`tap-scale relative flex-1 h-[48px] bg-[#B8F3B8] hover:bg-[#a3eca3] text-[#0F0F12] rounded-full flex items-center justify-center gap-2 shadow-sm font-sans ${
                      isCurrentlyListening ? "mic-recording-ring" : ""
                    }`}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="2" width="6" height="11" rx="3" stroke="#0F0F12" strokeWidth="2.3" />
                      <path d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke="#0F0F12" strokeWidth="2.3" strokeLinecap="round" />
                      <path d="M12 18V22M8 22H16" stroke="#0F0F12" strokeWidth="2.3" strokeLinecap="round" />
                    </svg>
                    <span className="text-[13px] font-extrabold tracking-tight">
                      {live.status === "connecting"
                        ? "Connecting..."
                        : isCurrentlyListening
                          ? "Listening"
                          : isCurrentlySpeaking
                            ? "Speaking"
                            : "Voice"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEndSession}
                    className="tap-scale w-[114px] h-[48px] bg-[#F9A8A8] hover:bg-[#f79494] text-[#0F0F12] rounded-full flex items-center justify-center gap-2 shadow-sm font-sans"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M3 15.5C6.5 11.5 17.5 11.5 21 15.5" stroke="#0F0F12" strokeWidth="2.4" strokeLinecap="round" />
                      <path d="M5.5 14L4 17.5M18.5 14L20 17.5" stroke="#0F0F12" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    <span className="text-[13px] font-extrabold tracking-tight">End</span>
                  </button>
                </div>
              )}
              </div>

              <div className="w-full pb-2 bg-[#0F0F12] flex justify-center">
                <div className="w-32 h-1.5 rounded-full bg-white/90" />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
             SCREEN 5: CHECK-IN CALENDAR, LEVEL A1 & SPEAKING 14/20 SESSIONS
             =================================================================== */}
        {(layoutMode === "all5" || layoutMode === "core3" || (layoutMode === "roomOnly" && activeScreen === 5)) && (
          <div id="phoneFrame5" className="iphone-frame phone-tilt-right relative">
            {/* Click-anywhere-to-close dismiss backdrop */}
            {activePickerDay !== null && (
              <div
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setActivePickerDay(null)}
              />
            )}
            <div className="iphone-screen">
              {/* TOP WHITE CARD (Calendar) */}
              <div className="bg-white rounded-b-[30px] px-4 pt-3 pb-4 flex flex-col shrink-0 relative z-30">
                {/* Status Bar */}
                <div className="w-full pb-2 px-1 flex items-center justify-between">
                  <span className="text-[13px] font-bold tracking-tight text-[#0F0F12] w-12">9:41</span>
                  <div className="dynamic-island" />
                  <div className="flex items-center gap-1.5 w-14 justify-end">
                    <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
                      <rect x="1" y="7" width="2.5" height="4" rx="1" fill="#0F0F12" />
                      <rect x="4.8" y="5" width="2.5" height="6" rx="1" fill="#0F0F12" />
                      <rect x="8.6" y="2.8" width="2.5" height="8.2" rx="1" fill="#0F0F12" />
                      <rect x="12.4" y="0.5" width="2.5" height="10.5" rx="1" fill="#0F0F12" />
                    </svg>
                    <svg width="14" height="11" viewBox="0 0 15 11" fill="none">
                      <path d="M1.5 3.6C4.9 0.8 10.1 0.8 13.5 3.6" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M3.8 6.2C6 4.4 9 4.4 11.2 6.2" stroke="#0F0F12" strokeWidth="1.6" strokeLinecap="round" />
                      <circle cx="7.5" cy="9.1" r="1.4" fill="#0F0F12" />
                    </svg>
                    <svg width="22" height="11" viewBox="0 0 23 11" fill="none">
                      <rect x="0.7" y="1" width="18.6" height="9" rx="2.6" stroke="#0F0F12" strokeWidth="1.2" />
                      <rect x="2.4" y="2.6" width="15.2" height="5.8" rx="1.4" fill="#0F0F12" />
                      <path d="M20.8 3.8V7.2" stroke="#0F0F12" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Calendar Header Row */}
                <div className="flex items-center justify-between mt-1">
                  <button
                    type="button"
                    onClick={() => navigateTo(3)}
                    className="tap-scale w-9 h-9 rounded-full border border-black/10 flex items-center justify-center"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M14.5 17.5L9 12L14.5 6.5" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <h2 className="text-[15.5px] font-extrabold text-[#0F0F12] leading-tight">
                      {isIndonesian ? "Kalender Belajar" : "Study Calendar"}
                    </h2>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[#9898A6] hover:text-[#0F0F12] tap-scale"
                        title="Previous Month"
                      >
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                          <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <p className="text-[10.5px] font-bold text-[#9898A6] min-w-[84px] text-center">
                        {calendarMonthLabel}
                      </p>
                      <button
                        type="button"
                        onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[#9898A6] hover:text-[#0F0F12] tap-scale"
                        title="Next Month"
                      >
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                          <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCalendarMonthOffset(0);
                      setActivePickerDay(baseToday.getDate());
                    }}
                    className="tap-scale w-9 h-9 rounded-full border border-black/10 flex items-center justify-center"
                    title="Check In Today"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="5" width="16" height="15" rx="3" stroke="#0F0F12" strokeWidth="2" />
                      <path d="M8 3V6M16 3V6M9.5 13L11.5 15L15 11" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1.5 text-center mt-3 mb-1 px-0.5">
                  <span className="text-[10px] font-semibold text-[#A0A0AB]">{isIndonesian ? "Min" : "Sun"}</span>
                  <span className="text-[10px] font-semibold text-[#A0A0AB]">{isIndonesian ? "Sen" : "Mon"}</span>
                  <span className="text-[10px] font-semibold text-[#A0A0AB]">{isIndonesian ? "Sel" : "Tue"}</span>
                  <span className="text-[10px] font-semibold text-[#A0A0AB]">{isIndonesian ? "Rab" : "Wed"}</span>
                  <span className="text-[10px] font-semibold text-[#A0A0AB]">{isIndonesian ? "Kam" : "Thu"}</span>
                  <span className="text-[10px] font-semibold text-[#A0A0AB]">{isIndonesian ? "Jum" : "Fri"}</span>
                  <span className="text-[10px] font-semibold text-[#A0A0AB]">{isIndonesian ? "Sab" : "Sat"}</span>
                </div>

                {/* Real-Time Dynamic Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5 px-0.5">
                  {/* Empty pre-padding cells */}
                  {Array.from({ length: calendarFirstDay }, (_, i) => (
                    <div key={`empty-pre-${i}`} className="aspect-square rounded-[10px] bg-[#F4F4F7]/40 pointer-events-none" />
                  ))}

                  {/* Real-time Day Tiles with Day Numbers */}
                  {Array.from({ length: calendarDaysInMonth }, (_, idx) => {
                    const dayNum = idx + 1;
                    const key = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                    const isToday =
                      dayNum === baseToday.getDate() &&
                      calendarMonth === baseToday.getMonth() &&
                      calendarYear === baseToday.getFullYear();
                    const isSelected = activePickerDay === dayNum;
                    const checkIn = calendarCheckIns[key];

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleTileClick(dayNum)}
                        style={{ backgroundColor: checkIn ? checkIn.color : "#F4F4F7" }}
                        className={`tap-scale aspect-square rounded-[10px] flex flex-col items-center justify-between p-1 relative shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)] transition-all ${
                          isSelected
                            ? "ring-2 ring-[#6C5CE7] scale-105 z-10"
                            : isToday
                            ? "ring-2 ring-[#0F0F12]"
                            : ""
                        }`}
                      >
                        <span
                          className={`text-[9px] leading-none font-bold ${
                            checkIn
                              ? "text-[#0F0F12]/80 font-extrabold"
                              : isToday
                              ? "text-[#0F0F12] font-extrabold"
                              : "text-[#71717A]"
                          }`}
                        >
                          {dayNum}
                        </span>
                        <div className="flex-1 flex items-center justify-center">
                          {checkIn && <MiniCalendarFace face={checkIn.face} />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Empty post-padding cells */}
                  {Array.from(
                    { length: (7 - ((calendarFirstDay + calendarDaysInMonth) % 7)) % 7 },
                    (_, i) => (
                      <div key={`empty-post-${i}`} className="aspect-square rounded-[10px] bg-[#F4F4F7]/40 pointer-events-none" />
                    )
                  )}
                </div>

                {/* Character Color Picker: Clean Minimal Pill without verbose text and no extra button */}
                {activePickerDay !== null && (
                  <div
                    className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-center gap-3 animate-in fade-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {CALENDAR_PARTNERS.map((p) => {
                      const activeKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(activePickerDay).padStart(2, "0")}`;
                      const isCurrentPartner = calendarCheckIns[activeKey]?.partnerId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPartnerColor(activePickerDay, p)}
                          style={{ backgroundColor: p.color }}
                          className={`tap-scale w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-transform ${
                            isCurrentPartner ? "ring-2 ring-[#0F0F12] scale-110" : "hover:scale-105"
                          }`}
                          title={p.name}
                        >
                          <MiniCalendarFace face={p.face} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* LOWER BLACK BENTO CONTAINER */}
              <div className="flex-1 p-[5px] flex flex-col gap-[5px] bg-[#0F0F12]">
                {/* MIDDLE MINT GREEN SUMMARY CARD: LEVEL A1 */}
                <div className="tap-scale bg-[#B8F3B8] rounded-[26px] p-4 relative overflow-hidden flex-1 flex flex-col justify-between">
                  <div className="z-10">
                    <span className="text-[11px] font-bold text-[#0F0F12]/75">
                      English Level and Streak
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="text-[28px] font-extrabold text-[#0F0F12] metric-tight">
                        Level {guestLevel}
                      </h3>
                      <span className="text-[10px] font-extrabold bg-[#0F0F12] text-[#B8F3B8] px-2.5 py-0.5 rounded-full">
                        7 Days Streak
                      </span>
                    </div>
                  </div>

                  <p className="text-[10.5px] font-semibold text-[#0F0F12]/75 max-w-[186px] leading-snug z-10">
                    Elementary Speaker You are calm and confident Keep up the daily streak!
                  </p>

                  {/* Giant Smiling Face on Right Edge */}
                  <svg className="absolute -right-3 top-3 w-[124px] h-[112px] pointer-events-none" viewBox="0 0 124 112" fill="none">
                    <path d="M18 38C28 48 44 48 54 36" stroke="#0F0F12" strokeWidth="7.5" strokeLinecap="round" />
                    <path d="M88 30C98 40 114 40 124 28" stroke="#0F0F12" strokeWidth="7.5" strokeLinecap="round" />
                    <path d="M36 74C62 92 98 86 120 64" stroke="#0F0F12" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* BOTTOM 3 WHITE METRIC CARDS (Speaking 14/20 is Clickable to open history!) */}
                <div className="grid grid-cols-3 gap-[5px] h-[106px]">
                  <div className="bg-white rounded-[22px] p-3 flex flex-col justify-between">
                    <span className="text-[10.5px] font-bold text-[#0F0F12]">Weekly Streak</span>
                    <div>
                      <p className="text-[18px] font-extrabold text-[#0F0F12] metric-tight">7 of 7</p>
                      <p className="text-[9.5px] font-semibold text-[#9898A6] mt-1">Days active</p>
                    </div>
                  </div>

                  {/* CLICKABLE Speaking 14/20 Sessions Card -> Opens History */}
                  <button
                    type="button"
                    onClick={() => setHistoryOpen(true)}
                    className="tap-scale bg-white hover:bg-[#F7F6FF] rounded-[22px] p-3 flex flex-col justify-between text-left border border-transparent hover:border-[#D8C8FF] transition-all"
                    title="Click to view conversation history"
                  >
                    <span className="text-[10.5px] font-bold text-[#0F0F12] flex items-center justify-between">
                      <span>Speaking</span>
                      <span className="text-[9px] text-[#6C5CE7] font-extrabold">View</span>
                    </span>
                    <div>
                      <p className="text-[18px] font-extrabold text-[#0F0F12] metric-tight">
                        {data.sessions.length > 0 ? `${data.sessions.length} of 20` : "14 of 20"}
                      </p>
                      <p className="text-[9.5px] font-semibold text-[#6C5CE7] mt-1">Tap for History</p>
                    </div>
                  </button>

                  <div className="bg-white rounded-[22px] p-3 flex flex-col justify-between">
                    <span className="text-[10.5px] font-bold text-[#0F0F12]">Level Progress</span>
                    <div>
                      <p className="text-[18px] font-extrabold text-[#0F0F12] metric-tight">88%</p>
                      <p className="text-[9.5px] font-semibold text-[#9898A6] mt-1">To Level A2</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation Dock */}
                <div className="h-[52px] px-4 flex items-center justify-between bg-[#0F0F12]">
                  <button
                    type="button"
                    onClick={() => navigateTo(3)}
                    className="tap-scale text-white/60 hover:text-white p-2 rounded-full flex items-center justify-center"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M4 10.5L12 4L20 10.5V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V10.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(4)}
                    className="tap-scale text-white/60 hover:text-white p-2 rounded-full flex items-center justify-center"
                    title="Open Room Talk"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12C12 10.3 13.3 9 15 9C16.7 9 18 10.3 18 12C18 15.3 15.3 18 12 18C8.7 18 6 15.3 6 12C6 7.6 9.6 4 14 4C18.4 4 21 7.6 21 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(5)}
                    className="tap-scale bg-white text-[#0F0F12] px-4 py-2 rounded-full flex items-center justify-center"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="5" width="16" height="15" rx="3" stroke="#0F0F12" strokeWidth="2.2" />
                      <path d="M8 3V6M16 3V6M4 10H20" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(2)}
                    className="tap-scale text-white/60 hover:text-white p-2 rounded-full flex items-center justify-center"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <circle cx="7.5" cy="7.5" r="2" fill="currentColor" />
                      <circle cx="16.5" cy="7.5" r="2" fill="currentColor" />
                      <circle cx="7.5" cy="16.5" r="2" fill="currentColor" />
                      <circle cx="16.5" cy="16.5" r="2" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="w-full pb-2 bg-[#0F0F12] flex justify-center">
                <div className="w-32 h-1.5 rounded-full bg-white/90" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =====================================================================
           CONVERSATION HISTORY MODAL (Triggered by Speaking 14/20 Sessions Card)
           ===================================================================== */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl relative border border-black/10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <h3 className="text-[18px] font-extrabold text-[#0F0F12]">Speaking History</h3>
                <p className="text-[11px] font-bold text-[#8C8C99]">
                  {data.sessions.length > 0 ? `${data.sessions.length} Sessions Recorded` : "14 of 20 Sessions Completed"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="tap-scale w-8 h-8 rounded-full bg-[#F4F4F8] flex items-center justify-center text-[#0F0F12] font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3">
              {data.sessions.length > 0 ? (
                data.sessions.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-[20px] p-3.5 bg-[#F8F8FC] border border-black/[0.05] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#B8F3B8] flex items-center justify-center text-xs font-black text-[#0F0F12]">
                        {rec.topicTitle ? rec.topicTitle[0] : "S"}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#0F0F12]">{rec.topicTitle}</p>
                        <p className="text-[10px] font-bold text-[#8C8C99] mt-0.5">
                          {new Date(rec.startedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {rec.feedback && (
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-white shadow-2xs text-[#0F0F12]">
                        Band {formatBand(rec.feedback.overallBand)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                [
                  { name: "Sarah", topic: "Perk Cafe Morning Coffee Order", date: "Today 09:15", score: "Band 5.5", color: "#B8F3B8" },
                  { name: "Emma", topic: "Vacation in Bali Holiday Memories", date: "Yesterday 16:30", score: "Band 5.0", color: "#FBC3A2" },
                  { name: "Sophia", topic: "Airport Check In and Boarding Pass", date: "Sep 22 14:00", score: "Band 5.5", color: "#B5E2FA" },
                  { name: "David", topic: "Mobile App Designer Roleplay", date: "Sep 20 10:20", score: "Band 5.0", color: "#FDE272" },
                  { name: "Kenji", topic: "Sci Fi Movies and Weekend Plans", date: "Sep 18 19:40", score: "Band 6.0", color: "#F9A8A8" },
                ].map((rec, idx) => (
                  <div
                    key={idx}
                    className="rounded-[20px] p-3.5 bg-[#F8F8FC] border border-black/[0.05] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: rec.color }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-[#0F0F12]"
                      >
                        {rec.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#0F0F12]">{rec.topic}</p>
                        <p className="text-[10px] font-bold text-[#8C8C99] mt-0.5">{rec.date} with {rec.name}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-white shadow-2xs text-[#0F0F12]">
                      {rec.score}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setHistoryOpen(false);
                navigateTo(4);
              }}
              className="tap-scale mt-3 w-full bg-[#0F0F12] text-white py-3 rounded-full text-xs font-bold text-center"
            >
              Start New Room Talk Session
            </button>
          </div>
        </div>
      )}

      {/* MINIMALIST FLOATING FEEDBACK BADGE (CHECKMARK OR CROSS ONLY, NO TEXT) */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out ${
          feedbackStatus !== null
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-75 translate-y-3"
        }`}
      >
        {feedbackStatus === "check" && (
          <div className="w-12 h-12 rounded-full bg-[#0F0F12] border border-white/20 shadow-2xl flex items-center justify-center text-[#B8F3B8]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 12.5L9.5 17.5L19.5 6.5"
                stroke="#B8F3B8"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        {feedbackStatus === "cross" && (
          <div className="w-12 h-12 rounded-full bg-[#0F0F12] border border-white/20 shadow-2xl flex items-center justify-center text-[#FF8598]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#FF8598"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
