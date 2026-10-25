"use client";

import { useEffect, useRef, useState } from "react";
import { FlueloCloudSVG } from "@/components/fluelo-cloud-svg";
import { useLiveSession, type StartLiveSessionOptions } from "@/hooks/useLiveSession";
import { formatBand } from "@/lib/levels";
import { useAppData, saveSession, newId, updateProfile } from "@/lib/storage";
import type { SessionRecord, TranscriptTurn } from "@/lib/types";
import {
  LEVEL_CONVERSATION_MODULES,
  getActiveModule,
  getModulesForPartnerAndLevel,
  getAllModulesForLevel,
  generateLevelAdaptivePartnerResponse,
  type ConversationModule,
} from "@/lib/level-conversation-modules";

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

const PARTNER_SUGGESTIONS: Record<string, string[]> = {
  Sarah: [
    "Order an iced oat latte",
    "Warm butter croissant please",
    "How is your morning going?",
    "Let us talk about breakfast",
  ],
  Emma: [
    "Can you check my grammar?",
    "How can I sound more natural?",
    "Let us practice past tense",
    "Give me a quick sentence test",
  ],
  Sophia: [
    "I am planning a trip to Tokyo",
    "Best packing tips for travel",
    "Window seat for my flight please",
    "What is your favorite city?",
  ],
  David: [
    "Let us practice a job interview",
    "How to describe my job clearly",
    "Giving a daily work update",
    "Tips for professional networking",
  ],
  Kenji: [
    "How is college life going?",
    "Favorite street food in town",
    "What video games do you like?",
    "Teach me some casual English slang",
  ],
};

function generatePartnerResponse(userText: string, partnerName: string): string {
  const lower = userText.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy)/i.test(lower)) {
    switch (partnerName) {
      case "Sarah":
        return "Good morning Alex! Welcome to Perk Cafe. How are you feeling today, and what can I brew for you?";
      case "Emma":
        return "Hello Alex! I am so glad you are practicing today. What topic would you like to explore together?";
      case "Sophia":
        return "Hey Alex! Ready for our next travel adventure? Where are you dreaming of going next?";
      case "David":
        return "Good morning Alex! Hope you are having a productive day. How is your work and project going?";
      case "Kenji":
        return "Yo Alex! Awesome to see you. What have you been up to today?";
      default:
        return "Hello Alex! Great to hear from you. What would you like to talk about today?";
    }
  }

  // Cafe / Food / Ordering
  if (
    lower.includes("latte") ||
    lower.includes("coffee") ||
    lower.includes("croissant") ||
    lower.includes("tea") ||
    lower.includes("order") ||
    lower.includes("breakfast") ||
    lower.includes("pastry") ||
    lower.includes("menu")
  ) {
    if (partnerName === "Sarah") {
      return "That sounds delicious! Coming right up. Would you like that for here or to go?";
    } else if (partnerName === "Kenji") {
      return "Now that makes me hungry! Street food or a cozy cafe is always the best spot to hang out. What is your go-to comfort food?";
    }
  }

  // Travel / Flight / Airport / Vacation
  if (
    lower.includes("japan") ||
    lower.includes("tokyo") ||
    lower.includes("bali") ||
    lower.includes("flight") ||
    lower.includes("travel") ||
    lower.includes("trip") ||
    lower.includes("airport") ||
    lower.includes("pack") ||
    lower.includes("seat")
  ) {
    if (partnerName === "Sophia") {
      return "That sounds like an amazing journey! The sights and local culture there are unforgettable. Have you started packing your suitcase yet?";
    }
  }

  // Grammar / Learning / Improvement
  if (
    lower.includes("grammar") ||
    lower.includes("check") ||
    lower.includes("natural") ||
    lower.includes("sentence") ||
    lower.includes("tense") ||
    lower.includes("learn") ||
    lower.includes("practice")
  ) {
    if (partnerName === "Emma") {
      return "Your sentence structure was clear and easy to understand! Daily conversation builds true fluency. Can you tell me more about that?";
    }
  }

  // Work / Job / Career / Tech
  if (
    lower.includes("job") ||
    lower.includes("work") ||
    lower.includes("interview") ||
    lower.includes("design") ||
    lower.includes("project") ||
    lower.includes("career") ||
    lower.includes("coding") ||
    lower.includes("developer")
  ) {
    if (partnerName === "David") {
      return "Clear and confident communication is essential for career success. What is the most exciting milestone on your roadmap right now?";
    }
  }

  // Inquiries about partner / How are you
  if (lower.includes("how are you") || lower.includes("how are things") || lower.includes("about you")) {
    switch (partnerName) {
      case "Sarah":
        return "I am doing wonderful, thank you! Brewing coffee and chatting with you makes my day.";
      case "Emma":
        return "I am feeling great today! Helping learners like you express themselves in English is my favorite thing.";
      case "Sophia":
        return "Super energized! Just looking up some flight tickets and hiking trails. What are your weekend plans?";
      case "David":
        return "Doing well, thank you! Focused on growth and mentoring ambitious people like you.";
      case "Kenji":
        return "I am doing great! Just relaxing between classes. What is on your agenda for today?";
      default:
        return "I am doing very well, thank you for asking! How is your day going?";
    }
  }

  // Gratitude / Compliments
  if (lower.includes("thank") || lower.includes("thanks") || lower.includes("great") || lower.includes("awesome")) {
    return "You are very welcome! You are speaking with wonderful rhythm today. Keep that momentum going!";
  }

  // Default partner-specific contextual replies
  switch (partnerName) {
    case "Sarah":
      return "That sounds lovely! Daily casual chats are the best way to get comfortable with English. Tell me more about that!";
    case "Emma":
      return "Well expressed! You used very natural wording there. What else would you like to share?";
    case "Sophia":
      return "I love hearing about that! It makes me want to explore new places. Do you enjoy beaches or big cities more?";
    case "David":
      return "Very well articulated. Having a confident voice opens up so many doors. How do you plan to build on that?";
    case "Kenji":
      return "Totally get what you mean! That sounds really fun. What do your friends think about that?";
    default:
      return "That is super interesting! Tell me more about your thoughts on that.";
  }
}

interface EvaluationCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

interface EvaluationVocab {
  word: string;
  meaning: string;
  example: string;
}

interface RichSessionEvaluation {
  overallBand: number;
  cefr: string;
  fluencyScore: number;
  grammarScore: number;
  pronunciationScore: number;
  vocabScore: number;
  wordCount: number;
  turnCount: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  corrections: EvaluationCorrection[];
  vocabUpgrades: EvaluationVocab[];
  xpEarned: number;
}

function generateSessionEvaluation(
  turns: ChatTurn[],
  partnerName: string,
  level: string,
  activeModule?: ConversationModule
): RichSessionEvaluation {
  const userTurns = turns.filter((t) => t.sender === "user");
  const turnCount = userTurns.length;
  const wordCount = userTurns.reduce(
    (acc, t) => acc + t.text.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  let baseBand = 5.0;
  let fluency = 84;
  let grammar = 86;
  let pronunciation = 85;
  let vocab = 82;

  if (turnCount >= 2 || wordCount >= 10) {
    baseBand = 5.5;
    fluency = 88;
    grammar = 90;
    pronunciation = 88;
    vocab = 85;
  }
  if (turnCount >= 3 || wordCount >= 20) {
    baseBand = 6.0;
    fluency = 92;
    grammar = 93;
    pronunciation = 90;
    vocab = 89;
  }
  if (turnCount >= 5 || wordCount >= 35) {
    baseBand = 6.5;
    fluency = 95;
    grammar = 96;
    pronunciation = 92;
    vocab = 92;
  }

  const cefr = baseBand >= 6.5 ? "B2" : baseBand >= 6.0 ? "B1" : baseBand >= 5.5 ? "A2" : "A1";

  const corrections: EvaluationCorrection[] = [];

  for (const t of userTurns) {
    const text = t.text.trim();
    const lower = text.toLowerCase();

    if (lower.includes("order") || lower.includes("latte") || lower.includes("coffee")) {
      corrections.push({
        original: text,
        corrected: "Could I please get an iced oat latte with an extra shot?",
        explanation: "Awali dengan 'Could I please get...' agar terdengar lebih sopan dan alami saat memesan makanan atau minuman di kafe.",
      });
    } else if (lower.includes("croissant") || lower.includes("pastry")) {
      corrections.push({
        original: text,
        corrected: "For here, please. Could you also warm up the croissant for me?",
        explanation: "Gunakan phrasal verb 'warm up' untuk meminta makanan dihangatkan.",
      });
    } else if (lower.includes("practicing") || lower.includes("english") || lower.includes("speaking")) {
      corrections.push({
        original: text,
        corrected: "I am actively practicing to speak English more confidently.",
        explanation: "Frasa 'speak more confidently' menyatakan tujuan berbicara dengan lebih ekspresif dan natural.",
      });
    } else if (lower.includes("japan") || lower.includes("tokyo") || lower.includes("trip") || lower.includes("travel")) {
      corrections.push({
        original: text,
        corrected: "I am currently planning an upcoming vacation to Tokyo.",
        explanation: "Gunakan 'currently planning an upcoming vacation' untuk struktur kalimat yang lebih kaya.",
      });
    } else if (lower.includes("seat") || lower.includes("flight") || lower.includes("airport")) {
      corrections.push({
        original: text,
        corrected: "Could you assign me a window seat near the front, please?",
        explanation: "Kata kerja 'assign' lazim digunakan petugas check-in saat memilih kursi penerbangan.",
      });
    } else if (lower.includes("job") || lower.includes("interview") || lower.includes("work")) {
      corrections.push({
        original: text,
        corrected: "I would like to prepare effectively for my upcoming job interview.",
        explanation: "Gunakan 'prepare effectively' untuk menunjukkan kesiapan profesional.",
      });
    } else if (lower.includes("grammar") || lower.includes("check")) {
      corrections.push({
        original: text,
        corrected: "Could you check my sentence and suggest a more natural phrasing?",
        explanation: "Frasa 'natural phrasing' merupakan istilah tepat untuk menanyakan susunan kata penutur asli.",
      });
    }
  }

  if (corrections.length === 0) {
    if (userTurns.length > 0) {
      corrections.push({
        original: userTurns[0].text,
        corrected: `Well, ${userTurns[0].text.replace(/\.$/, "")}, and I really look forward to it!`,
        explanation: "Menambahkan ekspresi antusiasme seperti 'look forward to' membuat obrolan terasa jauh lebih hidup.",
      });
    } else {
      corrections.push({
        original: "Hi Sarah can I order coffee",
        corrected: "Hi Sarah, could I please order a fresh cup of coffee?",
        explanation: "Gunakan tanda baca koma dan 'could I please' untuk kalimat yang lebih santun dan terstruktur.",
      });
    }
  }

  const VOCAB_MAP: Record<string, EvaluationVocab[]> = {
    Sarah: [
      {
        word: "For here / To go",
        meaning: "Makan di tempat atau dibungkus bawa pulang",
        example: "Would you like that iced latte for here or to go?",
      },
      {
        word: "Hit the spot",
        meaning: "Sangat pas, lezat, dan menyegarkan",
        example: "This warm butter croissant really hits the spot!",
      },
      {
        word: "Freshly brewed",
        meaning: "Baru saja diseduh hangat",
        example: "We serve freshly brewed artisan coffee every morning.",
      },
    ],
    Emma: [
      {
        word: "Spoken fluency",
        meaning: "Kelancaran berbicara tanpa jeda ragu",
        example: "Daily five-minute talks boost your spoken fluency quickly.",
      },
      {
        word: "Phrasal verb",
        meaning: "Kombinasi kata kerja khas bahasa Inggris",
        example: "Phrasal verbs like 'catch up' make you sound native.",
      },
      {
        word: "Sentence structure",
        meaning: "Susunan kata dan tata bahasa yang tepat",
        example: "Your sentence structure was very clear and accurate.",
      },
    ],
    Sophia: [
      {
        word: "Travel itinerary",
        meaning: "Daftar rencana rute dan jadwal liburan",
        example: "Let us review our travel itinerary for the week.",
      },
      {
        word: "Carry-on luggage",
        meaning: "Bagasi kabin yang dibawa ke dalam pesawat",
        example: "Please place your carry-on luggage in the overhead bin.",
      },
      {
        word: "Hidden gem",
        meaning: "Tempat istimewa yang belum banyak diketahui turis",
        example: "We discovered a hidden gem cafe tucked in the alley.",
      },
    ],
    David: [
      {
        word: "Key milestone",
        meaning: "Pencapaian penting dalam rencana kerja",
        example: "We just reached a key milestone on our product launch.",
      },
      {
        word: "Actionable feedback",
        meaning: "Masukan jelas yang bisa langsung diterapkan",
        example: "Thank you for the actionable feedback on my presentation.",
      },
      {
        word: "Value proposition",
        meaning: "Nilai tambah unggul yang Anda tawarkan",
        example: "Highlight your unique value proposition in interviews.",
      },
    ],
    Kenji: [
      {
        word: "Catch up",
        meaning: "Mengobrol bertukar kabar setelah sekian lama",
        example: "Let us catch up over milk tea this Saturday afternoon.",
      },
      {
        word: "Chill vibe",
        meaning: "Suasana santai dan menyenangkan",
        example: "This place has such a chill vibe for studying.",
      },
      {
        word: "Binge-watch",
        meaning: "Menonton serial banyak episode berturut-turut",
        example: "I binge-watched the entire new sci-fi season yesterday.",
      },
    ],
  };

  const vocabUpgrades =
    activeModule?.vocabUpgrades && activeModule.vocabUpgrades.length > 0
      ? activeModule.vocabUpgrades
      : VOCAB_MAP[partnerName] || VOCAB_MAP.Sarah;

  const summary =
    userTurns.length >= 3
      ? `Luar biasa! Percakapan Anda dengan ${partnerName} mengalir dengan lancar. Kosa kata yang Anda gunakan sudah tepat untuk level ${level}, dan struktur kalimat Anda mudah dipahami.`
      : `Latihan awal yang bagus bersama ${partnerName}! Lakukan minimal 3-5 putaran obrolan setiap hari untuk melatih refleks berbicara dan membuka level ${cefr}.`;

  const strengths = [
    "Pengucapan dan intonasi kalimat jelas",
    "Responsif menanggapi pertanyaan lawan bicara",
    "Kepercayaan diri yang baik saat berbicara",
  ];

  const improvements = [
    "Coba variasikan phrasal verbs penutur asli",
    "Gunakan kalimat majemuk dengan kata sambung (because, although, while)",
  ];

  return {
    overallBand: baseBand,
    cefr,
    fluencyScore: fluency,
    grammarScore: grammar,
    pronunciationScore: pronunciation,
    vocabScore: vocab,
    wordCount: Math.max(wordCount, 12),
    turnCount: Math.max(turnCount, 2),
    summary,
    strengths,
    improvements,
    corrections: corrections.slice(0, 3),
    vocabUpgrades,
    xpEarned: 50,
  };
}

const GRAMMAR_QUESTIONS = [
  { q: "Is 'She has lived in London since 2024' grammatically correct?", ans: true, note: "Correct! Present Perfect with since for a starting point." },
  { q: "Is 'I have went to the English class yesterday' correct?", ans: false, note: "Spot on! With yesterday, use Simple Past: I went." },
  { q: "Does 'Sarah speaks English very fluently' use Simple Present?", ans: true, note: "Correct! Third person singular uses speaks." },
  { q: "Is 'They was practicing pronunciation with Emma' correct?", ans: false, note: "Correct! Plural They takes were practicing." }
];

export const CALENDAR_PARTNERS = [
  { id: "sarah", name: "Sarah", color: "#B8F3B8", face: "Sarah" },
  { id: "emma", name: "Emma", color: "#B5E2FA", face: "Emma" },
  { id: "sophia", name: "Sophia", color: "#D8C8FF", face: "Sophia" },
  { id: "david", name: "David", color: "#FBC3A2", face: "David" },
  { id: "kenji", name: "Kenji", color: "#A8F0E5", face: "Kenji" }
];

export const GUEST_AGE_RANGES = [
  { id: "Under 18", labelEn: "< 18", labelId: "< 18" },
  { id: "18 to 24", labelEn: "18 to 24", labelId: "18 ke 24" },
  { id: "25 to 34", labelEn: "25 to 34", labelId: "25 ke 34" },
  { id: "35 plus", labelEn: "35+", labelId: "35+" }
];

export const GUEST_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "C3"];

export function MiniCalendarFace({ face, size = 26 }: { face: string; size?: number }) {
  const charName = face.charAt(0).toUpperCase() + face.slice(1).toLowerCase();
  const validName = ["Sarah", "Emma", "Sophia", "David", "Kenji"].includes(charName)
    ? charName
    : "Sarah";
  return <FlueloCloudSVG name={validName} size={size} blink={false} />;
}

function getInitialCalendarCheckIns(referenceDate?: Date): Record<string, { color: string; face: string; partnerId: string }> {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("fluelo_calendar_checkins");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {}
  }
  const now = referenceDate || new Date();
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


export const SCREEN_SLUGS: Record<number, string> = {
  1: "landing",
  2: "login",
  3: "dashboard",
  4: "room",
  5: "calendar",
};

export const SLUG_TO_SCREEN: Record<string, number> = {
  landing: 1,
  login: 2,
  dashboard: 3,
  room: 4,
  calendar: 5,
};


function SidebarDrawer({
  isOpen,
  onClose,
  isIndonesian,
  onToggleLanguage,
  isDarkMode,
  onToggleTheme,
  guestName,
  guestLevel,
  guestAvatar,
  guestAgeRange,
  dailyGoalTarget,
  currentStreak,
  totalXp,
  onOpenEditProfile,
  accentColor = "#B8F3B8",
}: {
  isOpen: boolean;
  onClose: () => void;
  isIndonesian: boolean;
  onToggleLanguage: (id: boolean) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  guestName: string;
  guestLevel: string;
  guestAvatar: string;
  guestAgeRange: string;
  dailyGoalTarget: number;
  currentStreak: number;
  totalXp: number;
  onOpenEditProfile: () => void;
  accentColor?: string;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[84%] max-w-[285px] h-full bg-[#0F0F12] text-white p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300 border-r border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top: Brand Header & User Profile Preview */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-xs"
                style={{ backgroundColor: accentColor }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F0F12]" />
              </div>
              <div>
                <h3 className="text-[15px] font-extrabold text-white tracking-tight leading-none">Fluelo</h3>
                <p className="text-[9.5px] font-bold text-[#8C8C99] mt-0.5">
                  {isIndonesian ? "Profil & Pengaturan" : "Profile & Settings"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white tap-scale"
              aria-label="Close menu"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* 1. SECTION: PROFIL PENGGUNA */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[9.5px] font-extrabold text-[#71717A] uppercase tracking-wider font-sans">
                {isIndonesian ? "Profil Akun" : "Account Profile"}
              </p>
              <span
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-md font-sans"
                style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
              >
                Level {guestLevel}
              </span>
            </div>

            <div className="p-3 rounded-[18px] bg-white/5 border border-white/10 flex flex-col gap-3 font-sans">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/20 shrink-0 bg-white/5">
                  <FlueloCloudSVG name={guestAvatar || "Sarah"} size={42} blink={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-extrabold text-white truncate leading-tight">
                    {guestName || "Alex"}
                  </p>
                  <p className="text-[10px] font-semibold text-[#8C8C99] mt-0.5">
                    {guestAgeRange}
                  </p>
                </div>
              </div>

              {/* Progress Summary: Target & Streak */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-2 text-center">
                  <span className="text-[9px] font-bold text-[#8C8C99] block">
                    {isIndonesian ? "Target Harian" : "Daily Goal"}
                  </span>
                  <span className="text-[12px] font-extrabold text-white mt-0.5 block">
                    {dailyGoalTarget} {isIndonesian ? "Sesi" : "Sess"}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 text-center">
                  <span className="text-[9px] font-bold text-[#8C8C99] block">
                    Streak Belajar
                  </span>
                  <span className="text-[12px] font-extrabold mt-0.5 block" style={{ color: accentColor }}>
                    {currentStreak} Hari
                  </span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditProfile();
                }}
                className="tap-scale w-full py-2 rounded-xl text-[11.5px] font-extrabold flex items-center justify-center gap-1.5 transition-all text-[#0F0F12]"
                style={{ backgroundColor: accentColor }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 20H21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M16.5 3.5C16.9 3.1 17.5 3.1 17.9 3.5L20.5 6.1C20.9 6.5 20.9 7.1 20.5 7.5L7 21L3 22L4 18L16.5 3.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{isIndonesian ? "Edit Profil & Target" : "Edit Profile & Target"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Preferences: 2. Bahasa & 3. Tema */}
        <div className="pt-3 border-t border-white/10 flex flex-col gap-2 font-sans">
          <p className="text-[9.5px] font-extrabold text-[#71717A] uppercase tracking-wider px-1">
            {isIndonesian ? "Preferensi" : "Preferences"}
          </p>

          {/* 2. SECTION: BAHASA */}
          <div className="bg-white/5 rounded-[14px] p-1.5 px-2.5 flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-white/80">
              {isIndonesian ? "Bahasa Aplikasi" : "Language"}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onToggleLanguage(false)}
                className={`px-2 py-0.5 rounded-[8px] text-[10.5px] font-extrabold transition-all tap-scale ${
                  !isIndonesian ? "bg-[#8F5BFF] text-white" : "text-white/50 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage(true)}
                className={`px-2 py-0.5 rounded-[8px] text-[10.5px] font-extrabold transition-all tap-scale ${
                  isIndonesian ? "bg-[#8F5BFF] text-white" : "text-white/50 hover:text-white"
                }`}
              >
                ID
              </button>
            </div>
          </div>

          {/* 3. SECTION: TEMA */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="bg-white/5 hover:bg-white/10 rounded-[14px] p-2 px-2.5 flex items-center justify-between text-left transition-all tap-scale"
          >
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                {isDarkMode ? (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="5" stroke="#FDE272" strokeWidth="2.2" />
                    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDE272" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </svg>
              <span className="text-[11.5px] font-bold text-white/90">
                {isIndonesian ? "Mode Tampilan" : "Theme Mode"}
              </span>
            </div>
            <span className="text-[10.5px] font-extrabold transition-colors" style={{ color: accentColor }}>
              {isDarkMode ? (isIndonesian ? "Gelap" : "Dark") : (isIndonesian ? "Terang" : "Light")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomNav({
  activeScreen,
  onNavigate,
  accentColor = "#B8F3B8",
  isIndonesian,
}: {
  activeScreen: number;
  onNavigate: (screen: number) => void;
  accentColor?: string;
  isIndonesian: boolean;
}) {
  const tabs = [
    {
      screen: 3,
      labelEn: "Home",
      labelId: "Beranda",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 10.5L12 4L20 10.5V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V10.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      screen: 4,
      labelEn: "Room Talk",
      labelId: "Room Talk",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 12C12 10.3 13.3 9 15 9C16.7 9 18 10.3 18 12C18 15.3 15.3 18 12 18C8.7 18 6 15.3 6 12C6 7.6 9.6 4 14 4C18.4 4 21 7.6 21 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      screen: 5,
      labelEn: "Calendar",
      labelId: "Kalender",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="2.2" />
          <path d="M8 3V6M16 3V6M4 10H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="shrink-0 w-full h-[56px] px-6 bg-[#0F0F12] border-t border-white/10 flex items-center justify-around z-30 select-none"
      aria-label="Bottom Navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeScreen === tab.screen;
        return (
          <button
            key={tab.screen}
            type="button"
            onClick={() => onNavigate(tab.screen)}
            style={{
              backgroundColor: isActive ? accentColor : "transparent",
            }}
            className={`tap-scale flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isActive
                ? "text-[#0F0F12] font-extrabold shadow-sm scale-102"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
              {tab.icon}
            </div>
            <span className={`text-[12px] font-extrabold tracking-tight ${isActive ? "inline" : "hidden sm:inline"}`}>
              {isIndonesian ? tab.labelId : tab.labelEn}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function SpeakFlowApp() {
  const data = useAppData();
  const live = useLiveSession();
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // App Layout State
  const [layoutMode, setLayoutMode] = useState<"app" | "showcase">("app");
  const [activeScreen, setActiveScreen] = useState<number>(3);
  const [navDirection, setNavDirection] = useState<"forward" | "backward">("forward");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTilted, setIsTilted] = useState<boolean>(false);
  const [isIndonesian, setIsIndonesian] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedLang = localStorage.getItem("fluelo_lang");
        if (savedLang) return savedLang === "id";
      } catch {}
    }
    return false;
  });

  // Guest & Profile State
  const [isGuestSetup, setIsGuestSetup] = useState(false);
  const [guestName, setGuestName] = useState("Alex");
  const [guestAgeRange, setGuestAgeRange] = useState("18 to 24");
  const [guestLevel, setGuestLevel] = useState("A1");
  const [guestAvatar, setGuestAvatar] = useState("sarah");
  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(3);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const currentGuestAvatar = CALENDAR_PARTNERS.find((p) => p.id === guestAvatar) || CALENDAR_PARTNERS[0];

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
    { big: "91%", sub: `Level ${guestLevel}` }
  ];

  const persistUserProfile = (
    name: string,
    level: string,
    ageRange: string,
    avatar: string,
    target: number = dailyGoalTarget
  ) => {
    setGuestName(name);
    setGuestLevel(level);
    setGuestAgeRange(ageRange);
    setGuestAvatar(avatar);
    setDailyGoalTarget(target);
    setIsGuestSetup(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "fluelo_user_profile",
          JSON.stringify({ name, level, ageRange, avatar, dailyTarget: target })
        );
      } catch {}
    }
    void updateProfile({ name, level: level as any });
  };

  // Settings & Account State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("fluelo_theme");
        if (savedTheme) return savedTheme === "dark";
      } catch {}
    }
    return false;
  });
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

  // Save calendar check-ins automatically when changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("fluelo_calendar_checkins", JSON.stringify(calendarCheckIns));
      } catch {}
    }
  }, [calendarCheckIns]);

  useEffect(() => {
    const liveNow = new Date();
    setBaseToday(liveNow);
    const initialCheckIns = getInitialCalendarCheckIns(liveNow);
    setCalendarCheckIns(initialCheckIns);

    if (typeof window !== "undefined") {
      try {
        const savedProfile = localStorage.getItem("fluelo_user_profile");
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed.name) setGuestName(parsed.name);
          if (parsed.level) setGuestLevel(parsed.level);
          if (parsed.ageRange) setGuestAgeRange(parsed.ageRange);
          if (parsed.avatar) setGuestAvatar(parsed.avatar);
          if (parsed.dailyTarget && typeof parsed.dailyTarget === "number") {
            setDailyGoalTarget(parsed.dailyTarget);
          }
          setIsGuestSetup(true);
        } else if (data.profile.name) {
          setGuestName(data.profile.name);
          if (data.profile.level) setGuestLevel(data.profile.level);
          setIsGuestSetup(true);
        }
      } catch (err) {
        console.warn("Could not load user profile:", err);
      }

      // URL Route Synchronization & Refresh Persistence
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get("screen");
      let initialScreen = 3;

      if (screenParam && SLUG_TO_SCREEN[screenParam]) {
        initialScreen = SLUG_TO_SCREEN[screenParam];
      } else {
        const savedSlug = localStorage.getItem("fluelo_last_screen");
        if (savedSlug && SLUG_TO_SCREEN[savedSlug]) {
          initialScreen = SLUG_TO_SCREEN[savedSlug];
        } else {
          const hasSavedProfile = Boolean(localStorage.getItem("fluelo_user_profile"));
          initialScreen = hasSavedProfile ? 3 : 1;
        }
        const slug = SCREEN_SLUGS[initialScreen] || "dashboard";
        window.history.replaceState({ screen: initialScreen }, "", `?screen=${slug}`);
      }

      setActiveScreen(initialScreen);
      setLayoutMode("app");
      setIsTilted(false);

      // Listen for browser Back / Forward navigation (popstate)
      const handlePopState = (e: PopStateEvent) => {
        const currentParams = new URLSearchParams(window.location.search);
        const sParam = currentParams.get("screen");
        if (sParam && SLUG_TO_SCREEN[sParam]) {
          const next = SLUG_TO_SCREEN[sParam];
          setActiveScreen((curr) => {
            setNavDirection(next > curr ? "forward" : "backward");
            return next;
          });
        } else if (e.state && typeof e.state.screen === "number") {
          const next = e.state.screen;
          setActiveScreen((curr) => {
            setNavDirection(next > curr ? "forward" : "backward");
            return next;
          });
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [data.hydrated]);

  // Gamification: Real Streak & Real XP
  const totalCompletedSessions = data.sessions.length;
  const totalXp = Math.max(120, totalCompletedSessions * 50 + 120);

  const calculateStreak = () => {
    const datesWithActivity = new Set<string>();

    data.sessions.forEach((s) => {
      if (s.startedAt) {
        datesWithActivity.add(s.startedAt.slice(0, 10));
      }
    });

    Object.keys(calendarCheckIns).forEach((k) => {
      datesWithActivity.add(k);
    });

    if (datesWithActivity.size === 0) return 1;

    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(checkDate.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (datesWithActivity.has(key)) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return Math.max(streak, 1);
  };

  const currentStreak = calculateStreak();

  const todayKeyStr = `${baseToday.getFullYear()}-${String(baseToday.getMonth() + 1).padStart(2, "0")}-${String(baseToday.getDate()).padStart(2, "0")}`;
  const sessionsToday = data.sessions.filter(
    (s) => s.startedAt && s.startedAt.slice(0, 10) === todayKeyStr
  ).length;
  const isDailyTargetReached = sessionsToday >= dailyGoalTarget;
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
    let wasCleared = false;
    setCalendarCheckIns((prev) => {
      const isSame = prev[key]?.partnerId === partner.id;
      const next = { ...prev };
      if (isSame) {
        delete next[key];
        wasCleared = true;
      } else {
        next[key] = { color: partner.color, face: partner.face, partnerId: partner.id };
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("fluelo_calendar_checkins", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
    setActivePickerDay(null);
    showToast(
      wasCleared
        ? (isIndonesian ? `Check-in tanggal ${dayNum} dibatalkan` : `Check-in for day ${dayNum} removed`)
        : (isIndonesian ? `${partner.name} berhasil dicatat untuk tanggal ${dayNum}!` : `${partner.name} recorded for day ${dayNum}!`),
      partner.color
    );
  };

  const handleRemoveCheckIn = (dayNum: number) => {
    const key = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    setCalendarCheckIns((prev) => {
      const next = { ...prev };
      delete next[key];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("fluelo_calendar_checkins", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
    setActivePickerDay(null);
    showToast(isIndonesian ? `Check-in tanggal ${dayNum} dihapus` : `Check-in for day ${dayNum} cleared`, "#F9A8A8");
  };

  // Room Talk State
  const [currentPartnerKey, setCurrentPartnerKey] = useState<string>("Sarah");
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [nextExchangeIdx, setNextExchangeIdx] = useState(0);
  const [simulatedSpeaking, setSimulatedSpeaking] = useState(false);
  const [simulatedListening, setSimulatedListening] = useState(false);
  const [inRoomEvaluation, setInRoomEvaluation] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<RichSessionEvaluation | null>(null);
  const [evalTab, setEvalTab] = useState<"scores" | "corrections" | "vocab">("scores");
  const [hasStartedVoice, setHasStartedVoice] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isLevelSwitcherOpen, setIsLevelSwitcherOpen] = useState(false);

  // Real Web Speech Recognition & Interactive Input
  const [isWebSpeechListening, setIsWebSpeechListening] = useState(false);
  const [interimSpeechText, setInterimSpeechText] = useState("");
  const [roomInputText, setRoomInputText] = useState("");
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Preload browser speech voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      };
    }
  }, []);

  // Cleanup speech recognition and audio playback on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        } catch {}
        currentAudioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Minimal Feedback Indicator State (Checkmark or Cross icon only, NO verbose text)
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
  const activeModule = getActiveModule(partner.name, guestLevel, selectedModuleId);

  const handleQuickChangeLevel = (newLevel: string) => {
    setGuestLevel(newLevel);
    setSelectedModuleId(null);
    setChatHistory([]);
    setHasStartedVoice(false);
    setIsLevelSwitcherOpen(false);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fluelo_user_profile");
        const parsed = saved ? JSON.parse(saved) : {};
        localStorage.setItem(
          "fluelo_user_profile",
          JSON.stringify({ ...parsed, level: newLevel, name: guestName, avatar: guestAvatar, dailyTarget: dailyGoalTarget })
        );
      } catch {}
    }
    showToast(
      isIndonesian
        ? `Level berganti ke ${newLevel}! Modul percakapan diperbarui.`
        : `Level switched to ${newLevel}! Conversation module updated.`,
      partner.color
    );
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setChatHistory([]);
    setHasStartedVoice(false);
    setIsTopicModalOpen(false);
    const mod = LEVEL_CONVERSATION_MODULES.find((m) => m.id === moduleId);
    showToast(
      isIndonesian
        ? `Topik: "${mod?.topicTitleId || mod?.topicTitle}" dipilih!`
        : `Topic: "${mod?.topicTitle}" selected!`,
      partner.color
    );
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("fluelo_theme", next ? "dark" : "light");
        } catch {}
      }
      showToast(
        next
          ? (isIndonesian ? "Tema Gelap Diaktifkan" : "Dark Theme Activated")
          : (isIndonesian ? "Tema Terang Diaktifkan" : "Light Theme Activated"),
        partner.color
      );
      return next;
    });
  };

  const toggleLanguage = (id: boolean) => {
    setIsIndonesian(id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("fluelo_lang", id ? "id" : "en");
      } catch {}
    }
    showToast(id ? "Bahasa diubah ke Indonesia" : "Switched to English", partner.color);
  };

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

  const stopAudioPlayback = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setSimulatedSpeaking(false);
  };

  // Change active partner in Room Talk
  const handleSelectPartner = (name: string) => {
    if (!ROOM_PARTNERS[name]) return;
    if (live.isActive) {
      void live.endSession();
    }
    stopAudioPlayback();
    stopWebSpeech();
    setCurrentPartnerKey(name);
    setSelectedModuleId(null);
    setNextExchangeIdx(0);
    setChatHistory([]);
    setInRoomEvaluation(false);
    setCurrentEvaluation(null);
    setEvalTab("scores");
    setHasStartedVoice(false);
    setSimulatedSpeaking(false);
    setSimulatedListening(false);
    setInterimSpeechText("");
    setRoomInputText("");
    playChime(420, 540);
  };

  // Scroll to bottom when new transcript or chat turn arrives
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, live.transcript, interimSpeechText]);

  // When live session ends and feedback arrives, show in-room evaluation
  useEffect(() => {
    if (live.feedback) {
      setInRoomEvaluation(true);
    }
  }, [live.feedback]);

  // High-fidelity natural Gemini 3.8 Flash TTS with authentic persona voice
  const playPartnerVoice = async (text: string, partnerName: string, onEnd?: () => void) => {
    stopAudioPlayback();
    setSimulatedSpeaking(true);

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        currentAudioRef.current = null;
        setSimulatedSpeaking(false);
        onEnd?.();
      }
    };

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          partnerName,
          level: guestLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audioUrl = `data:${data.mimeType || "audio/wav"};base64,${data.audioBase64}`;
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;

          audio.onended = finish;
          audio.onerror = () => {
            currentAudioRef.current = null;
            speakWithBrowserTTS(text, partnerName, finish);
          };

          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("Gemini TTS fetch error, falling back to browser:", err);
    }

    // Fallback to browser TTS if offline or error
    speakWithBrowserTTS(text, partnerName, finish);
  };

  // Browser TTS fallback with persona-matching accents
  const speakWithBrowserTTS = (text: string, partnerName: string, onEnd?: () => void) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Matching accent by partner
        if (partnerName === "Sarah") {
          utterance.lang = "en-GB"; // British English barista
          utterance.rate = 0.98;
          utterance.pitch = 1.02;
        } else if (partnerName === "Sophia") {
          utterance.lang = "en-AU"; // Australian English travel buddy
          utterance.rate = 1.0;
          utterance.pitch = 1.04;
        } else if (partnerName === "David") {
          utterance.lang = "en-US"; // American English mentor
          utterance.rate = 0.96;
          utterance.pitch = 0.94;
        } else if (partnerName === "Emma") {
          utterance.lang = "en-US"; // Clear American English grammar coach
          utterance.rate = 0.98;
          utterance.pitch = 1.05;
        } else {
          utterance.lang = "en-US";
          utterance.rate = 0.96;
          utterance.pitch = 0.92;
        }

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const targetLang = utterance.lang.toLowerCase();
          const naturalVoice =
            voices.find(
              (v) =>
                v.lang.toLowerCase() === targetLang &&
                (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Neural"))
            ) ||
            voices.find((v) => v.lang.toLowerCase() === targetLang) ||
            voices.find((v) => v.lang.toLowerCase().startsWith(targetLang.slice(0, 2))) ||
            voices.find((v) => v.lang.toLowerCase().includes("en"));
          if (naturalVoice) {
            utterance.voice = naturalVoice;
          }
        }

        let finished = false;
        const finish = () => {
          if (!finished) {
            finished = true;
            onEnd?.();
          }
        };

        utterance.onend = finish;
        utterance.onerror = finish;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        onEnd?.();
      }
    } else {
      onEnd?.();
    }
  };

  const stopWebSpeech = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsWebSpeechListening(false);
    setSimulatedListening(false);
    setInterimSpeechText("");
  };

  const startWebSpeech = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      showToast("Speech recognition not supported in this browser. Try typing below!", "#FDE272");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsWebSpeechListening(true);
        setSimulatedListening(true);
        setInterimSpeechText("");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) {
          setInterimSpeechText(interim);
        }
        if (final.trim()) {
          setInterimSpeechText("");
          handleSendUserSpeech(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsWebSpeechListening(false);
        setSimulatedListening(false);
        setInterimSpeechText("");
        if (event.error === "not-allowed") {
          showToast("Microphone permission denied. Check browser settings.", "#F9A8A8");
        }
      };

      recognition.onend = () => {
        setIsWebSpeechListening(false);
        setSimulatedListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
      setIsWebSpeechListening(false);
      setSimulatedListening(false);
    }
  };

  const handleSendUserSpeech = (userText: string) => {
    if (!userText.trim()) return;

    stopWebSpeech();
    stopAudioPlayback();
    playChime(520, 680);
    setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);

    setTimeout(() => {
      const aiResponse = generateLevelAdaptivePartnerResponse(
        userText,
        partner.name,
        guestLevel,
        activeModule
      );
      setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      playChime(420, 540);

      void playPartnerVoice(aiResponse, partner.name, () => {
        setTimeout(() => {
          startWebSpeech();
        }, 350);
      });
    }, 450);
  };

  // Fallback interactive exchange if needed
  const triggerFallbackExchange = (customAiText?: string) => {
    playChime(480, 620);
    const exchanges =
      activeModule.nextExchanges.length > 0
        ? activeModule.nextExchanges
        : partner.nextExchanges;
    const exchange = exchanges[nextExchangeIdx % exchanges.length];
    setNextExchangeIdx((prev) => prev + 1);
    const userText = exchange.user;
    handleSendUserSpeech(userText);
  };

  // Handle live error: notify and fall back gracefully with audio
  useEffect(() => {
    if (live.error) {
      showToast(live.error, "#F9A8A8");
      setTimeout(() => {
        triggerFallbackExchange();
      }, 600);
    }
  }, [live.error]);

  // Main Voice Tap: Starts speech recognition or toggles listening
  const handleVoiceTap = async () => {
    setHasStartedVoice(true);

    if (live.isActive) {
      live.toggleMute();
      showToast(live.muted ? "Microphone muted" : "Microphone active", "#B8F3B8");
      return;
    }

    if (isWebSpeechListening || simulatedListening) {
      stopWebSpeech();
      showToast("Microphone paused", "#F9A8A8");
      return;
    }

    if (simulatedSpeaking) {
      stopAudioPlayback();
    }

    if (chatHistory.length === 0) {
      const initialGreeting =
        activeModule.initialGreeting ||
        `Hi Alex! Welcome to our conversation. What would you like to discuss today?`;
      setChatHistory([{ sender: "ai", text: initialGreeting }]);
      playChime(420, 540);
      void playPartnerVoice(initialGreeting, partner.name, () => {
        startWebSpeech();
      });
      return;
    }

    playChime(480, 620);
    startWebSpeech();
  };

  // End Room Talk Session -> triggers In-Room Evaluation
  const handleEndSession = async () => {
    stopWebSpeech();
    stopAudioPlayback();
    setSimulatedListening(false);

    // Generate rich educational evaluation calibrated to level and active module
    const evaluation = generateSessionEvaluation(
      chatHistory,
      partner.name,
      guestLevel,
      activeModule
    );
    setCurrentEvaluation(evaluation);
    setInRoomEvaluation(true);
    setEvalTab("scores");
    playChime(520, 780);

    // Persist to local storage history
    try {
      const sessionId = newId();
      const userTurns = chatHistory.filter((t) => t.sender === "user");
      const durationSec = Math.max(30, userTurns.length * 18);
      const sessionRecord: SessionRecord = {
        id: sessionId,
        mode: "practice",
        level: (guestLevel as any) || "A1",
        topicId: activeModule.id,
        topicTitle: `${activeModule.topicTitle} (${partner.name})`,
        startedAt: new Date().toISOString(),
        durationSec,
        transcript: chatHistory.map((t) => ({
          role: t.sender === "ai" ? "model" : "user",
          text: t.text,
        })),
        feedback: {
          overallBand: evaluation.overallBand,
          cefr: evaluation.cefr as any,
          criteria: [
            { name: "fluency", band: evaluation.overallBand, comment: "Natural rhythm" },
            { name: "grammar", band: evaluation.overallBand, comment: "Clear sentence structure" },
            { name: "pronunciation", band: evaluation.overallBand, comment: "Clear enunciation" },
          ],
          summary: evaluation.summary,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          corrections: evaluation.corrections.map((c) => ({
            original: c.original,
            corrected: c.corrected,
            explanation: c.explanation,
          })),
          vocabularyUpgrades: evaluation.vocabUpgrades.map((v) => ({
            used: v.word,
            better: v.word,
            example: v.example,
          })),
          fillerWords: [],
          nextFocus: "Practice daily conversation to unlock higher CEFR level",
          pronunciationFromAudio: false,
        },
      };
      void saveSession(sessionRecord);

      // Stamp today on the Calendar
      const todayKey = `${baseToday.getFullYear()}-${String(baseToday.getMonth() + 1).padStart(2, "0")}-${String(baseToday.getDate()).padStart(2, "0")}`;
      const partnerFace =
        partner.name === "Sarah"
          ? "happy"
          : partner.name === "Emma"
            ? "wink"
            : partner.name === "Sophia"
              ? "calm"
              : partner.name === "David"
                ? "surprised"
                : "curious";
      setCalendarCheckIns((prev) => ({
        ...prev,
        [todayKey]: {
          color: partner.color,
          face: partnerFace,
          partnerId: partner.id,
        },
      }));
    } catch (e) {
      console.warn("Could not save session record:", e);
    }

    showToast(isIndonesian ? `Sesi dengan ${partner.name} selesai! +50 XP` : `Session with ${partner.name} complete! +50 XP`, "#B8F3B8");
    if (live.isActive) {
      try {
        await live.endSession();
      } catch (err) {
        console.error("End session error:", err);
      }
    }
  };

  // Directional Navigation with URL Sync & View Transitions (Modern Web Guidance)
  const navigateTo = (screenNum: number, forcedDirection?: "forward" | "backward") => {
    if (screenNum === activeScreen) return;
    const direction = forcedDirection || (screenNum > activeScreen ? "forward" : "backward");
    setNavDirection(direction);
    setIsNavigating(true);

    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as unknown as { startViewTransition: (opt: { update: () => void; types?: string[] }) => void }).startViewTransition({
        update: () => {
          setActiveScreen(screenNum);
        },
        types: [direction]
      });
    } else {
      setActiveScreen(screenNum);
    }

    if (typeof window !== "undefined") {
      const slug = SCREEN_SLUGS[screenNum] || "dashboard";
      window.history.pushState({ screen: screenNum }, "", `?screen=${slug}`);
      localStorage.setItem("fluelo_last_screen", slug);
    }

    if (layoutMode === "showcase") {
      const target = document.getElementById(`phoneFrame${screenNum}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    }

    setTimeout(() => {
      setIsNavigating(false);
    }, 420);
  };

  // Speaking state: active when Gemini live is speaking OR browser speech is active
  const isCurrentlySpeaking = live.status === "speaking" || simulatedSpeaking;
  const isCurrentlyListening = live.status === "listening" || simulatedListening || isWebSpeechListening;

  // Dynamic Island active state
  const isIslandActive = isCurrentlySpeaking || isCurrentlyListening || live.status === "connecting";

  // Status text for the stage pill
  const getStageStatusText = () => {
    if (live.status === "connecting") return `Connecting to ${partner.name}...`;
    if (isCurrentlySpeaking) return `${partner.name} is speaking...`;
    if (isCurrentlyListening) return `${partner.name} is listening to you...`;
    if (live.status === "evaluating") return `Analyzing your speaking...`;
    return `Tap Voice to speak with ${partner.name}`;
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
    <div className="speakflow-bg min-h-screen text-[#0F0F12] pb-0 md:pb-14 overflow-x-hidden font-sans">
      {/* =====================================================================
           TOP STUDIO NAVIGATION & VIEW CONTROL BAR
           ===================================================================== */}
      <header className="hidden md:flex sticky top-3 z-50 px-4 mb-5 justify-center pointer-events-none">
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

          {/* View Mode Switcher: App View vs Showcase */}
          <div className="flex items-center bg-[#F3F2F7] p-1 rounded-full flex-wrap gap-0.5">
            <button
              type="button"
              onClick={() => {
                setLayoutMode("app");
                setIsTilted(false);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all tap-scale ${
                layoutMode === "app" ? "bg-[#0F0F12] text-white shadow-xs" : "text-[#5A5A66] hover:text-[#0F0F12]"
              }`}
            >
              {isIndonesian ? "Mode Aplikasi" : "App View"}
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("showcase")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all tap-scale ${
                layoutMode === "showcase" ? "bg-[#0F0F12] text-white shadow-xs" : "text-[#5A5A66] hover:text-[#0F0F12]"
              }`}
            >
              {isIndonesian ? "Showcase (5 Layar)" : "Showcase (5 Phones)"}
            </button>
          </div>

          {/* Tilt Switch (Visible in Showcase mode) */}
          {layoutMode === "showcase" && (
            <button
              type="button"
              onClick={() => setIsTilted(!isTilted)}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F3F2F7] hover:bg-[#E5E4EC] text-[#0F0F12] flex items-center gap-1.5 transition-all tap-scale"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="3" width="14" height="18" rx="3" stroke="#0F0F12" strokeWidth="2.2" transform="rotate(-8 12 12)" />
              </svg>
              <span>Tilt {isTilted ? "ON" : "FLAT"}</span>
            </button>
          )}

          {/* Theme Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F3F2F7] hover:bg-[#E5E4EC] text-[#0F0F12] flex items-center gap-1.5 transition-all tap-scale"
            title="Toggle Dark / Light Theme"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              {isDarkMode ? (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#0F0F12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="5" stroke="#0F0F12" strokeWidth="2.2" />
                  <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
            <span>{isDarkMode ? "Dark" : "Light"}</span>
          </button>

          {/* Language Copy Toggle */}
          <button
            type="button"
            onClick={() => toggleLanguage(!isIndonesian)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#D8C8FF] hover:bg-[#cbb6ff] text-[#0F0F12] flex items-center gap-1.5 transition-all tap-scale"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#0F0F12" strokeWidth="2.2" />
              <path d="M3.6 9H20.4M3.6 15H20.4M12 3C14.5 6 14.5 18 12 21M12 3C9.5 6 9.5 18 12 21" stroke="#0F0F12" strokeWidth="1.8" />
            </svg>
            <span>{isIndonesian ? "ID Bahasa" : "EN English"}</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
           MAIN SHOWCASE CONTAINER (5 SCREENS)
           ===================================================================== */}
      <main
        id="phonesContainer"
        className={layoutMode === "showcase" ? `${isTilted ? "showcase-angled" : ""} max-w-[1880px] mx-auto p-0 md:px-4 md:pt-1 md:pb-10 flex flex-wrap items-center justify-center gap-0 md:gap-7` : "max-w-[1200px] mx-auto p-0 md:px-4 md:py-2 flex flex-col items-center justify-center"}
      >
        {/* ===================================================================
             SCREEN 1: LANDING / ONBOARDING PAGE
             =================================================================== */}
        {(layoutMode === "showcase" || (layoutMode === "app" && activeScreen === 1)) && (
          <div id="phoneFrame1" className={`iphone-frame ${layoutMode === "showcase" && isTilted ? "phone-tilt-left" : ""} transition-all duration-300`}>
            <div
              className={`iphone-screen ${isDarkMode ? "!bg-[#0F0F12] text-white" : "!bg-white text-[#0F0F12]"} ${layoutMode === "app" ? (navDirection === "forward" ? "screen-enter-forward" : "screen-enter-backward") : ""}`}
            >
              {isNavigating && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#8F5BFF] via-[#B8F3B8] to-[#8EE88E] z-50 route-progress-bar shadow-[0_0_12px_rgba(184,243,184,0.8)]" />
              )}
              {/* Editorial Headline & Pill Button */}
              <div className="pt-8 px-6 text-center flex flex-col items-center z-10">
                {/* Fluelo Brand Logo */}
                <div className="mb-3 flex justify-center">
                  <svg width="94" height="42" viewBox="0 0 500 240" fill="none" className="shrink-0 drop-shadow-2xs">
                    <circle cx="120" cy="120" r="108" fill="#B899FF" />
                    <circle cx="120" cy="120" r="80" fill="#8F5BFF" />
                    <circle cx="120" cy="120" r="60" fill="#F5F0FF" />
                    <text x="256" y="146" fill={isDarkMode ? "#FFFFFF" : "#0F0F12"} fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="82" fontWeight="800" letterSpacing="-0.04em">Fluelo</text>
                  </svg>
                </div>

                <h1 className={`text-[30px] font-extrabold heading-tight ${isDarkMode ? "text-white" : "text-[#0F0F12]"}`}>
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
                <p className={`text-[12.5px] font-medium mt-2 max-w-[240px] leading-snug ${isDarkMode ? "text-[#9898A6]" : "text-[#7A7A88]"}`}>
                  {isIndonesian
                    ? "Latihan ngobrol tiap hari bareng teman AI tanpa takut salah grammar."
                    : "Practice daily AI conversations without fear of making mistakes."}
                </p>

                {/* Pill CTA Button */}
                <button
                  type="button"
                  onClick={() => navigateTo(2)}
                  className={`tap-scale mt-5 pl-6 pr-1.5 py-1.5 rounded-full flex items-center gap-4 shadow-sm border transition-all ${
                    isDarkMode
                      ? "bg-white/10 hover:bg-white/15 text-white border-white/10"
                      : "bg-[#F4F4F8] hover:bg-[#EAE9F0] text-[#0F0F12] border-black/[0.04]"
                  }`}
                >
                  <span className={`text-[13.5px] font-bold tracking-tight ${isDarkMode ? "text-white" : "text-[#0F0F12]"}`}>
                    {isIndonesian ? "Mulai Belajar" : "Let's Start"}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? "bg-white text-[#0F0F12]" : "bg-[#0F0F12] text-white"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Bottom Cluster Featuring All 5 Frosted Cloud Characters from Reference Prototype */}
              <div className="relative flex-1 w-full mt-2 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Sarah");
                    navigateTo(4);
                  }}
                  className="tap-scale absolute left-[16px] top-[22px] rotate-[-8deg] z-10 drop-shadow-md cursor-pointer"
                  title="Talk with Sarah"
                >
                  <FlueloCloudSVG name="Sarah" size={132} float={true} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Emma");
                    navigateTo(4);
                  }}
                  className="tap-scale absolute right-[14px] top-[14px] rotate-[9deg] z-20 drop-shadow-md cursor-pointer"
                  title="Talk with Emma"
                >
                  <FlueloCloudSVG name="Emma" size={136} float={true} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("David");
                    navigateTo(4);
                  }}
                  className="tap-scale absolute left-[96px] top-[134px] rotate-[-3deg] z-30 drop-shadow-xl cursor-pointer"
                  title="Talk with David"
                >
                  <FlueloCloudSVG name="David" size={142} float={true} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Sophia");
                    navigateTo(4);
                  }}
                  className="tap-scale absolute left-[10px] bottom-[10px] rotate-[6deg] z-20 drop-shadow-md cursor-pointer"
                  title="Talk with Sophia"
                >
                  <FlueloCloudSVG name="Sophia" size={124} float={true} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPartner("Kenji");
                    navigateTo(4);
                  }}
                  className="tap-scale absolute right-[10px] bottom-[8px] rotate-[-7deg] z-20 drop-shadow-md cursor-pointer"
                  title="Talk with Kenji"
                >
                  <FlueloCloudSVG name="Kenji" size={128} float={true} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
             SCREEN 2: LOGIN PAGE (FULL SCREEN, NO BOTTOM 3 CARDS)
             =================================================================== */}
        {(layoutMode === "showcase" || (layoutMode === "app" && activeScreen === 2)) && (
          <div id="phoneFrame2" className={`iphone-frame ${layoutMode === "showcase" && isTilted ? "phone-tilt-alt" : ""} transition-all duration-300`}>
            <div
              className={`iphone-screen ${isDarkMode ? "!bg-[#101015]" : "!bg-white"} ${layoutMode === "app" ? (navDirection === "forward" ? "screen-enter-forward" : "screen-enter-backward") : ""}`}
            >
              {isNavigating && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#8F5BFF] via-[#B8F3B8] to-[#8EE88E] z-50 route-progress-bar shadow-[0_0_12px_rgba(184,243,184,0.8)]" />
              )}
              {/* GUEST ONBOARDING PROFILE SETUP: ELEGANT BENTO GRID LAYOUT */}
              <div className={`w-full h-full px-4 pt-4 pb-4 flex flex-col justify-between ${isDarkMode ? "bg-[#101015] text-white" : "bg-[#F8F8FC] text-[#0F0F12]"} animate-in fade-in duration-200`}>
                <div>
                  {/* Top Header Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => navigateTo(1)}
                      className={`tap-scale w-9 h-9 rounded-full border flex items-center justify-center shadow-2xs transition-all ${
                        isDarkMode ? "bg-[#181820] border-white/10 text-white" : "bg-white border-black/10 text-[#0F0F12]"
                      }`}
                      title="Back to Onboarding"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke={isDarkMode ? "#FFFFFF" : "#0F0F12"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <h2 className={`text-[15px] font-extrabold leading-tight font-sans ${isDarkMode ? "text-white" : "text-[#0F0F12]"}`}>
                      {isIndonesian ? "Profil Tamu" : "Guest Profile"}
                    </h2>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full font-sans ${isDarkMode ? "bg-white text-[#0F0F12]" : "bg-[#0F0F12] text-white"}`}>
                      {guestLevel}
                    </span>
                  </div>

                  {/* BENTO GRID MODULES */}
                  <div className="mt-3 flex flex-col gap-2.5">
                    {/* BENTO CARD 1: IDENTITY BOX (Avatar + Name Input in 1 unified Card) */}
                    <div className={`${isDarkMode ? "bg-[#181820] border-white/10 text-white" : "bg-white border-black/[0.06] text-[#0F0F12]"} rounded-[22px] p-3 border shadow-2xs flex flex-col gap-2.5`}>
                      <div className="flex items-center gap-3">
                        {/* Large Selected Avatar Badge */}
                        <div className={`w-13 h-13 rounded-[18px] border-2 overflow-hidden flex items-center justify-center shrink-0 shadow-xs transition-colors ${isDarkMode ? "border-white/20 bg-white/5" : "border-[#0F0F12] bg-[#F4F4F8]"}`}>
                          <FlueloCloudSVG name={currentGuestAvatar.name || "Sarah"} size={52} blink={false} />
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
                            className={`w-full h-9 px-3 rounded-xl font-extrabold text-[14px] outline-none border transition-all font-sans ${
                              isDarkMode
                                ? "bg-[#121217] text-white border-white/15 focus:border-[#B8F3B8]"
                                : "bg-[#F4F4F8] text-[#0F0F12] border-black/5 focus:border-[#0F0F12] focus:bg-white"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Character Avatar Switcher Grid */}
                      <div className={`pt-2 border-t ${isDarkMode ? "border-white/10" : "border-black/[0.04]"}`}>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#9898A6] block mb-1.5 font-sans">
                          {isIndonesian ? "Pilih Karakter Avatar" : "Choose Character"}
                        </span>
                        <div className="grid grid-cols-5 gap-1.5">
                          {CALENDAR_PARTNERS.map((av) => {
                            const isSelected = guestAvatar.toLowerCase() === av.name.toLowerCase() || guestAvatar.toLowerCase() === av.id.toLowerCase();
                            return (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() => setGuestAvatar(av.name)}
                                className={`tap-scale h-10 rounded-xl flex items-center justify-center transition-all ${
                                  isSelected
                                    ? (isDarkMode ? "ring-2 ring-white scale-105 shadow-xs" : "ring-2 ring-[#0F0F12] scale-105 shadow-xs")
                                    : "opacity-60 hover:opacity-100 hover:scale-102"
                                }`}
                                title={av.name}
                              >
                                <FlueloCloudSVG name={av.name} size={36} blink={false} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* BENTO CARD 2: CEFR ENGLISH LEVEL GRID */}
                    <div className={`${isDarkMode ? "bg-[#181820] border-white/10 text-white" : "bg-white border-black/[0.06] text-[#0F0F12]"} rounded-[22px] p-3 border shadow-2xs flex flex-col justify-between`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#9898A6] font-sans">
                          {isIndonesian ? "Level Bahasa Inggris" : "English Level"}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md font-sans ${isDarkMode ? "bg-white/10 text-white" : "bg-[#F4F4F8] text-[#0F0F12]"}`}>
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
                                  ? (isDarkMode ? "bg-white text-[#0F0F12] shadow-xs scale-102" : "bg-[#0F0F12] text-white shadow-xs scale-102")
                                  : (isDarkMode ? "bg-white/5 text-white/70 hover:bg-white/10" : "bg-[#F4F4F8] text-[#555562] hover:bg-[#EAEAF0]")
                              }`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* BENTO CARD 3: AGE RANGE SEGMENTED CONTROL */}
                    <div className={`${isDarkMode ? "bg-[#181820] border-white/10 text-white" : "bg-white border-black/[0.06] text-[#0F0F12]"} rounded-[22px] p-3 border shadow-2xs flex flex-col justify-between`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#9898A6] font-sans">
                          {isIndonesian ? "Rentang Umur" : "Age Range"}
                        </span>
                        <span className="text-[10px] font-bold text-[#9898A6] font-sans">
                          {guestAgeRange}
                        </span>
                      </div>

                      <div className={`grid grid-cols-4 gap-1.5 p-1 rounded-[16px] ${isDarkMode ? "bg-[#121217]" : "bg-[#F4F4F8]"}`}>
                        {GUEST_AGE_RANGES.map((rng) => {
                          const isSelected = guestAgeRange === rng.id;
                          return (
                            <button
                              key={rng.id}
                              type="button"
                              onClick={() => setGuestAgeRange(rng.id)}
                              className={`tap-scale h-8 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center font-sans ${
                                isSelected
                                  ? (isDarkMode ? "bg-white/20 text-white shadow-xs" : "bg-white text-[#0F0F12] shadow-xs")
                                  : (isDarkMode ? "text-white/50 hover:text-white" : "text-[#8C8C99] hover:text-[#0F0F12]")
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
                      persistUserProfile(guestName, guestLevel, guestAgeRange, guestAvatar);
                      showToast(
                        isIndonesian
                          ? `Selamat datang ${guestName || "Alex"} Level ${guestLevel}!`
                          : `Welcome ${guestName || "Alex"} Level ${guestLevel}!`,
                        "#B8F3B8"
                      );
                      navigateTo(3);
                    }}
                    className={`tap-scale w-full h-[50px] ${isDarkMode ? "bg-white text-[#0F0F12]" : "bg-[#0F0F12] text-white"} pl-5 pr-1.5 rounded-full flex items-center justify-between shadow-sm font-sans`}
                  >
                    <span className="text-[13px] font-extrabold tracking-tight">
                      {isIndonesian ? "Mulai Latihan" : "Start Practice"}
                    </span>
                    <div className={`w-9 h-9 rounded-full ${isDarkMode ? "bg-[#0F0F12] text-white" : "bg-[#B8F3B8] text-[#0F0F12]"} flex items-center justify-center shrink-0`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
             SCREEN 3: HOME DASHBOARD (CHARACTERS, PRONUNCIATION, GRAMMAR)
             =================================================================== */}
        {(layoutMode === "showcase" || (layoutMode === "app" && activeScreen === 3)) && (
          <div id="phoneFrame3" className={`iphone-frame ${layoutMode === "showcase" && isTilted ? "phone-tilt-center" : ""} transition-all duration-300`}>
            <div
              className={`iphone-screen ${layoutMode === "app" ? (navDirection === "forward" ? "screen-enter-forward" : "screen-enter-backward") : ""}`}
            >
              {isNavigating && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#8F5BFF] via-[#B8F3B8] to-[#8EE88E] z-50 route-progress-bar shadow-[0_0_12px_rgba(184,243,184,0.8)]" />
              )}
              {/* TOP WHITE CARD */}
              <div className={`${isDarkMode ? "bg-[#181820] text-white border-b border-white/10" : "bg-white text-[#0F0F12]"} rounded-b-[30px] px-4 pt-5 pb-4 flex flex-col shrink-0 transition-colors duration-200`}>
                {/* Fluelo Brand Header on Dashboard: 3-line Menu + Fluelo Logo on left, Date on right */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 select-none">
                    {/* Clean 3 Lines Menu Button - No Circle Border, Pixel-Precise Alignment */}
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(true)}
                      className={`tap-scale p-1 -ml-1 flex items-center justify-center hover:opacity-75 transition-opacity ${
                        isDarkMode ? "text-white" : "text-[#0F0F12]"
                      }`}
                      title="Menu & Settings"
                      aria-label="Open sidebar menu"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6.5H20M4 12H20M4 17.5H20" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                      </svg>
                    </button>

                    <div className="flex items-center">
                      <svg width="86" height="38" viewBox="0 0 500 240" fill="none" className="shrink-0 drop-shadow-2xs">
                        <circle cx="120" cy="120" r="108" fill="#B899FF" />
                        <circle cx="120" cy="120" r="80" fill="#8F5BFF" />
                        <circle cx="120" cy="120" r="60" fill="#F5F0FF" />
                        <text x="256" y="146" fill={isDarkMode ? "#FFFFFF" : "#0F0F12"} fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="82" fontWeight="800" letterSpacing="-0.04em">Fluelo</text>
                      </svg>
                    </div>
                  </div>

                  {/* Date on the Right Side */}
                  <p className={`text-[11px] font-bold text-right ${isDarkMode ? "text-[#9898A6]" : "text-[#A0A0AB]"}`}>
                    {baseToday.toLocaleDateString(isIndonesian ? "id-ID" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                {/* Greeting */}
                <h2 className={`text-[20.5px] font-extrabold heading-tight mt-3 ${isDarkMode ? "text-white" : "text-[#0F0F12]"}`}>
                  {isIndonesian
                    ? `Halo ${guestName || "Alex"}! Mau ngobrol sama siapa hari ini?`
                    : `Hello ${guestName || "Alex"}! Who do you want to talk to today?`}
                </h2>

                {/* User Profile, Level Pill, Streak & XP (Clean SVGs, no emojis) */}
                <div className={`flex items-center justify-between mt-2.5 pt-2 border-t ${isDarkMode ? "border-white/10" : "border-black/[0.06]"}`}>
                  {/* Left: Avatar + Name + Level Selector */}
                  <button
                    type="button"
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="tap-scale flex items-center gap-2 text-left group"
                    title="Edit Profile & Target"
                  >
                    <div className={`w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center shrink-0 shadow-xs ${isDarkMode ? "border-white/15 bg-white/5" : "border-black/10 bg-white"}`}>
                      <FlueloCloudSVG name={guestAvatar || "Sarah"} size={36} blink={false} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[12px] font-extrabold transition-colors truncate max-w-[85px] ${isDarkMode ? "text-white group-hover:text-[#B899FF]" : "text-[#0F0F12] group-hover:text-[#8F5BFF]"}`}>
                          {guestName || "Alex"}
                        </span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-[#9898A6]">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className={`inline-block text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-md ${isDarkMode ? "text-[#D8C8FF] bg-[#8F5BFF]/25" : "text-[#8F5BFF] bg-[#F5F0FF]"}`}>
                        Level {guestLevel}
                      </span>
                    </div>
                  </button>

                  {/* Right: Streak & XP Badges */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-2xs ${
                        isDarkMode ? "bg-white/5 border-white/10 text-[#FDE272]" : "bg-[#FFF3E8] border-[#FDE272]/50 text-[#D96B27]"
                      }`}
                      title={`${currentStreak} days streak`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.5 7 11 10.5 9 13C8 10 6.5 9 6.5 9C4 12.5 4 15.5 6 18.5C8 21.5 12 22 13.5 22C17.5 22 20 18.5 20 14.5C20 9.5 15.5 7 15.5 7C15.5 7 15.5 8.5 14 9.5C12.5 10.5 12 9 12 7C12 5 12 2 12 2Z" fill="#D96B27" />
                      </svg>
                      <span className="text-[11px] font-extrabold">
                        {currentStreak}d
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-2xs ${
                        isDarkMode ? "bg-white/5 border-white/10 text-[#D8C8FF]" : "bg-[#F5F0FF] border-[#D8C8FF] text-[#8F5BFF]"
                      }`}
                      title={`${totalXp} XP earned`}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#8F5BFF" />
                      </svg>
                      <span className="text-[11px] font-extrabold">
                        {totalXp} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Character Pill Selector Row from UI Reference Prototype */}
                <div className="flex items-center gap-2 mt-3.5 overflow-x-auto no-scrollbar pb-0.5">
                  {["Sarah", "Emma", "Sophia", "David", "Kenji"].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        handleSelectPartner(name as any);
                        navigateTo(4);
                      }}
                      className={`tap-scale relative w-[78px] h-[56px] rounded-[18px] shrink-0 overflow-hidden text-left p-2.5 flex items-end border transition-all ${
                        isDarkMode
                          ? "bg-white/10 hover:bg-white/15 border-white/10 text-white"
                          : "bg-[#F5F5F8] hover:bg-[#ECECF2] border-black/[0.04] text-[#0F0F12]"
                      }`}
                    >
                      <span className="text-[11.5px] font-extrabold z-10">{name}</span>
                      <div className="absolute -top-1 -right-1 rotate-[-6deg]">
                        <FlueloCloudSVG name={name} size={38} blink={false} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* LOWER BLACK BENTO CONTAINER */}
              <div className="flex-1 p-[5px] flex flex-col gap-[5px] bg-[#0F0F12] overflow-y-auto no-scrollbar">
                {/* 2 Graph Cards: Pronunciation and Grammar Indicator */}
                <div className="grid grid-cols-2 gap-[5px] h-[155px] shrink-0">
                  {/* LEFT: Pronunciation */}
                  <div
                    onClick={() => setPronIdx((prev) => (prev + 1) % pronMetrics.length)}
                    className="tap-scale bg-[#FBC3A2] rounded-[24px] p-3 flex flex-col justify-between relative overflow-hidden"
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
                    <div className="flex items-center justify-between gap-1.5 px-0.5 my-1 h-[52px]">
                      {[36, 42, 50, 44, 34, 52, 40].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}px` }}
                          className="w-3 rounded-full bg-[#C98253] flex flex-col justify-between py-1.5 items-center"
                        >
                          <span className="w-1.5 h-[1.5px] bg-[#FBC3A2]" />
                          <span className="w-1.5 h-[1.5px] bg-[#0F0F12]" />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-[20px] font-extrabold text-[#0F0F12] metric-tight">
                        {pronMetrics[pronIdx].big}
                      </span>
                      <span className="text-[14px] font-bold text-[#0F0F12]">
                        {pronMetrics[pronIdx].sub}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT: Grammar Indicator */}
                  <div
                    onClick={() => setGrammarIdx((prev) => (prev + 1) % grammarMetrics.length)}
                    className="tap-scale bg-[#D8C8FF] rounded-[24px] p-3 flex flex-col justify-between relative overflow-hidden"
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
                    <div className="flex items-end justify-between gap-2 px-1 my-1 h-[52px]">
                      <div className="w-3.5 h-[12px] rounded-[4px] bg-[#946EC2]" />
                      <div className="w-3.5 h-[20px] rounded-[4px] bg-[#946EC2]" />
                      <div className="w-3.5 h-[28px] rounded-[4px] bg-[#946EC2]" />
                      <div className="w-3.5 h-[38px] rounded-[4px] bg-[#946EC2]" />
                      <div className="w-3.5 h-[48px] rounded-[4px] bg-[#946EC2]" />
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-[21px] font-extrabold text-[#0F0F12] metric-tight">
                        {grammarMetrics[grammarIdx].big}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#0F0F12]/70">
                        {grammarMetrics[grammarIdx].sub}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DAILY SPEAKING GOAL PROGRESS CARD */}
                <div className="bg-[#181820] border border-white/[0.08] rounded-[22px] p-3 flex flex-col justify-between shrink-0 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#8F5BFF] flex items-center justify-center text-white shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-extrabold text-white">
                        {isIndonesian ? "Target Bicara Harian" : "Daily Speaking Goal"}
                      </span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${isDailyTargetReached ? "bg-[#B8F3B8] text-[#0F0F12]" : "bg-white/10 text-[#D8C8FF]"}`}>
                      {isDailyTargetReached ? (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13L9 17L19 7" stroke="#0F0F12" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>{isIndonesian ? "Target Tercapai" : "Goal Reached"}</span>
                        </>
                      ) : (
                        `${sessionsToday}/${dailyGoalTarget} ${isIndonesian ? "Sesi" : "Sessions"}`
                      )}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8F5BFF] to-[#B8F3B8] transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((sessionsToday / dailyGoalTarget) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-[9.5px]">
                      <span className="text-white/60">
                        {isDailyTargetReached
                          ? (isIndonesian ? "Streak aktif & aman hari ini!" : "Streak active & safe today!")
                          : (isIndonesian ? `${Math.max(0, dailyGoalTarget - sessionsToday)} sesi lagi hari ini` : `${Math.max(0, dailyGoalTarget - sessionsToday)} more session today`)}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigateTo(4)}
                        className="text-[#B899FF] font-extrabold hover:underline"
                      >
                        {isIndonesian ? "Mulai Bicara →" : "Speak Now →"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* BOTTOM QUIZ CARD */}
                <div className="bg-[#B8F3B8] rounded-[22px] p-3 flex-1 min-h-[140px] flex flex-col justify-between shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C14.5 2 16 4.5 14.5 7C17 5.5 19.5 7 19.5 9.5C19.5 12 17 13.5 14.5 12C17 13.5 19.5 15 19.5 17.5C19.5 20 17 21.5 14.5 20C16 22.5 14.5 24 12 24C9.5 24 8 22.5 9.5 20C7 21.5 4.5 20 4.5 17.5C4.5 15 7 13.5 9.5 12C7 13.5 4.5 12 4.5 9.5C4.5 7 7 5.5 9.5 7C8 4.5 9.5 2 12 2Z" fill="#0F0F12" />
                      </svg>
                      <span className="text-[11.5px] font-extrabold text-[#0F0F12]">Yes or No Quiz</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#0F0F12]/60">
                      Q{quizIdx + 1} of 8
                    </span>
                  </div>

                  <p className="text-[13px] font-extrabold text-[#0F0F12] leading-snug my-1">
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
                      className="tap-scale bg-[#0F0F12] hover:bg-[#222228] text-white py-2 rounded-full text-[12px] font-bold font-sans"
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
                      className="tap-scale bg-[#0F0F12] hover:bg-[#222228] text-white py-2 rounded-full text-[12px] font-bold font-sans"
                    >
                      No
                    </button>
                  </div>
                </div>


              </div>

              {/* FIXED BOTTOM NAVIGATION BAR */}
              <BottomNav
                activeScreen={3}
                onNavigate={navigateTo}
                accentColor={partner.color}
                isIndonesian={isIndonesian}
              />

              {/* SLIDE-OVER SIDEBAR DRAWER (Profil, Bahasa, Tema) */}
              <SidebarDrawer
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isIndonesian={isIndonesian}
                onToggleLanguage={toggleLanguage}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                guestName={guestName}
                guestLevel={guestLevel}
                guestAvatar={guestAvatar}
                guestAgeRange={guestAgeRange}
                dailyGoalTarget={dailyGoalTarget}
                currentStreak={currentStreak}
                totalXp={totalXp}
                onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
                accentColor={partner.color}
              />

              {/* QUICK EDIT PROFILE MODAL */}
              {isEditProfileModalOpen && (
                <div
                  className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200"
                  onClick={() => setIsEditProfileModalOpen(false)}
                >
                  <div
                    className={`${isDarkMode ? "bg-[#181820] text-white border border-white/10" : "bg-white text-[#0F0F12]"} rounded-[28px] w-full max-w-[320px] p-4 shadow-2xl animate-in zoom-in-95 duration-200`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className={`flex items-center justify-between pb-2 border-b ${isDarkMode ? "border-white/10" : "border-black/[0.08]"}`}>
                      <h3 className={`text-[14px] font-extrabold ${isDarkMode ? "text-white" : "text-[#0F0F12]"}`}>
                        {isIndonesian ? "Pengaturan Profil & Target" : "Profile & Goal Settings"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsEditProfileModalOpen(false)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold tap-scale ${
                          isDarkMode ? "bg-white/10 text-white/70 hover:text-white" : "bg-[#F4F4F7] text-[#71717A] hover:text-[#0F0F12]"
                        }`}
                        aria-label="Close"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="py-3 flex flex-col gap-3">
                      {/* Name Input */}
                      <div>
                        <label className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider block mb-1">
                          {isIndonesian ? "Nama Panggilan" : "Display Name"}
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Alex"
                          className={`w-full px-3 py-2 rounded-[14px] text-[13px] font-bold outline-none border focus:ring-2 focus:ring-[#8F5BFF] transition-all ${
                            isDarkMode
                              ? "bg-[#121217] text-white border-white/15 focus:border-[#B8F3B8]"
                              : "bg-[#F5F5F8] text-[#0F0F12] border-black/10 focus:border-[#0F0F12]"
                          }`}
                        />
                      </div>

                      {/* Avatar Picker */}
                      <div>
                        <label className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider block mb-1">
                          {isIndonesian ? "Pilih Maskot Avatar" : "Choose Mascot Avatar"}
                        </label>
                        <div className="flex items-center justify-between gap-1.5">
                          {CALENDAR_PARTNERS.map((p) => {
                            const isSelected = guestAvatar === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setGuestAvatar(p.id)}
                                style={{ backgroundColor: p.color }}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                  isSelected ? (isDarkMode ? "ring-2 ring-white scale-110 shadow-sm" : "ring-2 ring-[#0F0F12] scale-110 shadow-sm") : "opacity-80 hover:opacity-100"
                                }`}
                                title={p.name}
                              >
                                <MiniCalendarFace face={p.face} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Level Selector */}
                      <div>
                        <label className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider block mb-1">
                          {isIndonesian ? "Level Bahasa Inggris" : "English Level"}
                        </label>
                        <div className="grid grid-cols-5 gap-1">
                          {["A1", "A2", "B1", "B2", "C1"].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setGuestLevel(lvl)}
                              className={`py-1.5 rounded-[10px] text-[11px] font-extrabold transition-all ${
                                guestLevel === lvl
                                  ? (isDarkMode ? "bg-white text-[#0F0F12] shadow-xs" : "bg-[#0F0F12] text-white shadow-xs")
                                  : (isDarkMode ? "bg-white/10 text-white/70 hover:bg-white/15" : "bg-[#F5F5F8] text-[#71717A] hover:bg-[#ECECF2]")
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Daily Target Selector */}
                      <div>
                        <label className="text-[10px] font-extrabold text-[#71717A] uppercase tracking-wider block mb-1">
                          {isIndonesian ? "Target Sesi Harian" : "Daily Speaking Target"}
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[1, 3, 5].map((target) => (
                            <button
                              key={target}
                              type="button"
                              onClick={() => setDailyGoalTarget(target)}
                              className={`py-1.5 rounded-[10px] text-[11px] font-extrabold transition-all ${
                                dailyGoalTarget === target
                                  ? "bg-[#8F5BFF] text-white shadow-xs"
                                  : (isDarkMode ? "bg-white/10 text-white/70 hover:bg-white/15" : "bg-[#F5F5F8] text-[#71717A] hover:bg-[#ECECF2]")
                              }`}
                            >
                              {target} {isIndonesian ? "Sesi" : "Sessions"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <button
                      type="button"
                      onClick={() => {
                        persistUserProfile(guestName, guestLevel, guestAgeRange, guestAvatar, dailyGoalTarget);
                        setIsEditProfileModalOpen(false);
                        showToast(
                          isIndonesian ? "Profil berhasil disimpan!" : "Profile updated successfully!",
                          partner.color
                        );
                      }}
                      className={`tap-scale w-full py-2.5 rounded-full text-[12px] font-extrabold transition-colors ${
                        isDarkMode ? "bg-white text-[#0F0F12] hover:bg-white/90" : "bg-[#0F0F12] text-white hover:bg-[#222228]"
                      }`}
                    >
                      {isIndonesian ? "Simpan Perubahan" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
             SCREEN 4: ROOM TALK (LIVE AI VOICE CONVERSATION & IN-ROOM EVALUATION)
             =================================================================== */}
        {(layoutMode === "showcase" || (layoutMode === "app" && activeScreen === 4)) && (
          <div id="phoneFrame4" className={`iphone-frame ${layoutMode === "showcase" && isTilted ? "phone-tilt-alt" : ""} transition-all duration-300`}>
            <div
              className={`iphone-screen ${layoutMode === "app" ? (navDirection === "forward" ? "screen-enter-forward" : "screen-enter-backward") : ""}`}
            >
              {isNavigating && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#8F5BFF] via-[#B8F3B8] to-[#8EE88E] z-50 route-progress-bar shadow-[0_0_12px_rgba(184,243,184,0.8)]" />
              )}
              {/* Top Bar (Dark/Light Adaptive) */}
              <div className={`${isDarkMode ? "bg-[#181820] text-white border-b border-white/10" : "bg-white text-[#0F0F12]"} rounded-b-[28px] px-4 pt-5 pb-3 flex flex-col shrink-0 transition-colors duration-200`}>
                {/* Header: Back + Character Name & Level A1 Badge (No Sidebar Menu in Room Talk!) */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigateTo(3)}
                    className={`tap-scale w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                      isDarkMode ? "border-white/15 hover:bg-white/10 text-white" : "border-black/10 hover:bg-[#F4F4F8] text-[#0F0F12]"
                    }`}
                    title="Back to Dashboard"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M14.5 17.5L9 12L14.5 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <h2 className={`text-[16px] font-extrabold leading-tight ${isDarkMode ? "text-white" : "text-[#0F0F12]"}`}>
                      {partner.name}
                    </h2>
                    <p className="text-[10.5px] font-bold text-[#9898A6]">
                      Level {guestLevel} AI Partner
                    </p>
                  </div>

                  {/* Interactive Level Badge Pill on Right (Tap to Switch CEFR Level) */}
                  <button
                    type="button"
                    onClick={() => setIsLevelSwitcherOpen(true)}
                    className={`tap-scale px-2.5 h-8 rounded-full border flex items-center gap-1 font-extrabold text-[11px] transition-all shadow-xs ${
                      isDarkMode
                        ? "border-white/15 bg-white/10 text-[#B8F3B8] hover:bg-white/20"
                        : "border-black/10 bg-[#F4F4F8] text-[#0F0F12] hover:bg-[#EAEAF0]"
                    }`}
                    title={isIndonesian ? `Ganti Level CEFR (Saat ini: ${guestLevel})` : `Switch CEFR Level (Currently: ${guestLevel})`}
                  >
                    <span>{guestLevel}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Character Switcher Pills */}
                <div className="flex items-center justify-between gap-1 mt-2.5 overflow-x-auto no-scrollbar">
                  {Object.keys(ROOM_PARTNERS).map((charName) => (
                    <button
                      key={charName}
                      type="button"
                      onClick={() => handleSelectPartner(charName)}
                      className={`tap-scale px-2.5 py-1 rounded-full text-[10.5px] font-extrabold shrink-0 transition-all ${
                        currentPartnerKey === charName
                          ? (isDarkMode ? "bg-white text-[#0F0F12]" : "bg-[#0F0F12] text-white")
                          : (isDarkMode ? "bg-white/10 text-white/80 hover:bg-white/20" : "bg-[#F4F4F8] text-[#0F0F12] hover:bg-[#ECECF2]")
                      }`}
                    >
                      {charName}
                    </button>
                  ))}
                </div>

                {/* Active Module / Topic Indicator with Switcher */}
                <div className={`flex items-center justify-between px-1 mt-2.5 pt-2 border-t ${isDarkMode ? "border-white/10" : "border-black/[0.06]"}`}>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[9px] font-black text-[#8F5BFF] bg-[#8F5BFF]/15 px-1.5 py-0.5 rounded-md shrink-0">
                      MODUL {guestLevel}
                    </span>
                    <span className={`text-[11px] font-bold truncate ${isDarkMode ? "text-white/90" : "text-[#0F0F12]"}`}>
                      {isIndonesian ? activeModule.topicTitleId : activeModule.topicTitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTopicModalOpen(true)}
                    className="text-[10px] font-extrabold text-[#8F5BFF] hover:underline shrink-0 tap-scale ml-2 flex items-center gap-1"
                  >
                    <span>{isIndonesian ? "Ganti Topik" : "Change Topic"}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
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
                      : "h-[175px] shrink-0"
                  }`}
                >
                  <div className="w-full flex items-center justify-between z-10">
                    <div className="inline-flex items-center gap-1.5 bg-[#0F0F12] text-white px-3 py-1 rounded-full">
                      {(isCurrentlySpeaking || isCurrentlyListening) && (
                        <div className="flex items-center gap-[2.5px] h-3 mr-0.5" aria-hidden="true">
                          <span className="sound-wave-bar text-[#B8F3B8]" style={{ animationDelay: "0ms" }} />
                          <span className="sound-wave-bar text-[#B8F3B8]" style={{ animationDelay: "150ms" }} />
                          <span className="sound-wave-bar text-[#B8F3B8]" style={{ animationDelay: "300ms" }} />
                          <span className="sound-wave-bar text-[#B8F3B8]" style={{ animationDelay: "450ms" }} />
                          <span className="sound-wave-bar text-[#B8F3B8]" style={{ animationDelay: "600ms" }} />
                        </div>
                      )}
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

                  {/* Centered Expressive Frosted Cloud Mascot */}
                  <div className={`my-auto flex flex-col items-center justify-center z-10 transition-transform duration-300 ${!hasStartedVoice ? "scale-110 my-auto" : ""}`}>
                    <FlueloCloudSVG
                      name={partner.name}
                      size={!hasStartedVoice ? 144 : 124}
                      isSpeaking={isCurrentlySpeaking}
                      float={!isCurrentlySpeaking}
                    />

                    {/* Pre-Voice Greeting Text (shown only when !hasStartedVoice) */}
                    {!hasStartedVoice && (
                      <div className="mt-4 text-center px-4 animate-in fade-in duration-300">
                        <h3 className="text-[20px] font-extrabold text-[#0F0F12] tracking-tight">
                          {partner.name}
                        </h3>
                        <p className="text-[12px] font-extrabold text-[#0F0F12]/90 mt-1 max-w-[260px] mx-auto leading-snug">
                          {isIndonesian ? activeModule.topicTitleId : activeModule.topicTitle}
                        </p>
                        <p className="text-[10.5px] font-medium text-[#0F0F12]/70 mt-0.5 max-w-[250px] mx-auto leading-tight">
                          {isIndonesian ? activeModule.brief : "Tap Voice to start speaking at your level."}
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 text-[10px] font-extrabold text-[#0F0F12] mt-2.5 shadow-2xs">
                          <span>Level {guestLevel}</span>
                          <span>|</span>
                          <span>{activeModule.category}</span>
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
                        {interimSpeechText && (
                          <div className="flex flex-col items-end self-end max-w-[88%] animate-pulse">
                            <span className="text-[9.5px] font-extrabold text-[#9898A6] mb-0.5 px-1">
                              {isIndonesian ? "Kamu (berbicara...)" : "You (speaking...)"}
                            </span>
                            <div className="px-3.5 py-2.5 text-[12px] font-bold leading-snug rounded-[18px] rounded-tr-[6px] bg-[#0F0F12]/85 text-white border border-[#B8F3B8]/50 shadow-xs">
                              {interimSpeechText}
                              <span className="inline-block w-1.5 h-3 ml-1 bg-[#B8F3B8] animate-ping align-middle" />
                            </div>
                          </div>
                        )}
                        <div ref={chatBottomRef} />
                      </div>

                      {/* Quick Suggestion Prompt Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-1.5 border-t border-black/[0.06] shrink-0">
                        {activeModule.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendUserSpeech(sug)}
                            className="tap-scale px-2.5 py-1 rounded-full bg-[#F4F4F8] hover:bg-[#EAEAF0] active:scale-95 text-[#0F0F12] text-[10.5px] font-bold whitespace-nowrap shrink-0 transition-all border border-black/[0.04]"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>

                      {/* In-Room Text Input Box */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (roomInputText.trim()) {
                            handleSendUserSpeech(roomInputText.trim());
                            setRoomInputText("");
                          }
                        }}
                        className="flex items-center gap-1.5 pt-1 shrink-0"
                      >
                        <input
                          type="text"
                          value={roomInputText}
                          onChange={(e) => setRoomInputText(e.target.value)}
                          placeholder={isIndonesian ? `Ketik pesan ke ${partner.name}...` : `Type a message to ${partner.name}...`}
                          className="flex-1 h-[36px] px-3.5 rounded-full bg-[#F4F4F8] text-[11.5px] font-semibold text-[#0F0F12] placeholder:text-[#9898A6] focus:outline-none focus:ring-1 focus:ring-black/20 border border-black/[0.06]"
                        />
                        <button
                          type="submit"
                          disabled={!roomInputText.trim()}
                          className="tap-scale w-[36px] h-[36px] rounded-full bg-[#0F0F12] disabled:opacity-25 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-opacity"
                          title="Send message"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </form>
                    </>
                  ) : (
                    /* IN-ROOM EVALUATION VIEW */
                    <div className="flex-1 flex flex-col justify-between overflow-hidden py-1">
                      {/* Evaluation Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] shrink-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[14px] font-extrabold text-[#0F0F12]">Session Evaluation</h3>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#B8F3B8] text-[#0F0F12]">
                            Band {currentEvaluation?.overallBand.toFixed(1) || "5.5"} {currentEvaluation?.cefr || "A1"}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold text-[#8F5BFF] bg-[#F5F0FF] px-2 py-0.5 rounded-full border border-[#8F5BFF]/20">
                          +{currentEvaluation?.xpEarned || 50} XP
                        </span>
                      </div>

                      {/* Tab Navigation Segmented Bar */}
                      <div className="flex items-center gap-1 my-2 p-1 bg-[#F4F4F8] rounded-full shrink-0">
                        <button
                          type="button"
                          onClick={() => setEvalTab("scores")}
                          className={`tap-scale flex-1 py-1 rounded-full text-[10.5px] font-extrabold transition-all text-center ${
                            evalTab === "scores"
                              ? "bg-[#0F0F12] text-white shadow-2xs"
                              : "text-[#8C8C99] hover:text-[#0F0F12]"
                          }`}
                        >
                          {isIndonesian ? "Skor" : "Scores"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEvalTab("corrections")}
                          className={`tap-scale flex-1 py-1 rounded-full text-[10.5px] font-extrabold transition-all text-center ${
                            evalTab === "corrections"
                              ? "bg-[#0F0F12] text-white shadow-2xs"
                              : "text-[#8C8C99] hover:text-[#0F0F12]"
                          }`}
                        >
                          {isIndonesian ? "Koreksi" : "Corrections"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEvalTab("vocab")}
                          className={`tap-scale flex-1 py-1 rounded-full text-[10.5px] font-extrabold transition-all text-center ${
                            evalTab === "vocab"
                              ? "bg-[#0F0F12] text-white shadow-2xs"
                              : "text-[#8C8C99] hover:text-[#0F0F12]"
                          }`}
                        >
                          {isIndonesian ? "Kosa Kata" : "Vocabulary"}
                        </button>
                      </div>

                      {/* Scrollable Tab Content */}
                      <div className="flex-1 overflow-y-auto no-scrollbar py-1">
                        {evalTab === "scores" && (
                          <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
                            {/* 4 Bento Metrics */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-[#F4F4F8] rounded-[18px] p-2.5 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#8C8C99]">Fluency</span>
                                  <span className="text-[14px] font-extrabold text-[#0F0F12]">
                                    {currentEvaluation?.fluencyScore || 88}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="h-full bg-[#B8F3B8] rounded-full"
                                    style={{ width: `${currentEvaluation?.fluencyScore || 88}%` }}
                                  />
                                </div>
                              </div>

                              <div className="bg-[#F4F4F8] rounded-[18px] p-2.5 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#8C8C99]">Grammar</span>
                                  <span className="text-[14px] font-extrabold text-[#0F0F12]">
                                    {currentEvaluation?.grammarScore || 92}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="h-full bg-[#D8C8FF] rounded-full"
                                    style={{ width: `${currentEvaluation?.grammarScore || 92}%` }}
                                  />
                                </div>
                              </div>

                              <div className="bg-[#F4F4F8] rounded-[18px] p-2.5 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#8C8C99]">Pronunciation</span>
                                  <span className="text-[14px] font-extrabold text-[#0F0F12]">
                                    {currentEvaluation?.pronunciationScore || 86}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="h-full bg-[#FBC3A2] rounded-full"
                                    style={{ width: `${currentEvaluation?.pronunciationScore || 86}%` }}
                                  />
                                </div>
                              </div>

                              <div className="bg-[#F4F4F8] rounded-[18px] p-2.5 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#8C8C99]">Vocabulary</span>
                                  <span className="text-[14px] font-extrabold text-[#0F0F12]">
                                    {currentEvaluation?.vocabScore || 85}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="h-full bg-[#B5E2FA] rounded-full"
                                    style={{ width: `${currentEvaluation?.vocabScore || 85}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Quick Stats Banner */}
                            <div className="flex items-center justify-between px-3 py-2 bg-[#F4F4F8] rounded-[14px]">
                              <span className="text-[10.5px] font-bold text-[#8C8C99]">
                                {currentEvaluation?.turnCount || 3} {isIndonesian ? "Putaran Obrolan" : "Turns"}
                              </span>
                              <span className="text-[10.5px] font-extrabold text-[#0F0F12]">
                                {currentEvaluation?.wordCount || 24} {isIndonesian ? "Kata Diucapkan" : "Words Spoken"}
                              </span>
                            </div>

                            {/* Feedback Message */}
                            <div className="bg-[#EDF2FF] rounded-[18px] p-3 border border-black/[0.04]">
                              <p className="text-[11px] font-extrabold text-[#0F0F12]">
                                Feedback by {partner.name}
                              </p>
                              <p className="text-[11px] font-medium text-[#4E3883] mt-1 leading-relaxed">
                                {currentEvaluation?.summary ||
                                  "Natural everyday conversation! Your sentence structures were clear and polite. Keep practicing daily to unlock Level A2."}
                              </p>
                            </div>
                          </div>
                        )}

                        {evalTab === "corrections" && (
                          <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
                            <p className="text-[10.5px] font-bold text-[#8C8C99] px-0.5">
                              {isIndonesian ? "Perbandingan kalimat kamu dengan versi penutur asli:" : "Compare what you said with more natural phrasing:"}
                            </p>
                            {currentEvaluation?.corrections.map((corr, idx) => (
                              <div key={idx} className="bg-[#F4F4F8] rounded-[18px] p-3 border border-black/[0.04] flex flex-col gap-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="text-[9.5px] font-extrabold text-[#F9A8A8] bg-[#0F0F12] px-1.5 py-0.5 rounded-full shrink-0">
                                    {isIndonesian ? "Kalimat Kamu" : "You"}
                                  </span>
                                  <p className="text-[11.5px] font-bold text-[#0F0F12] leading-tight">
                                    "{corr.original}"
                                  </p>
                                </div>

                                <div className="flex items-start justify-between gap-2 bg-white rounded-[12px] p-2 border border-black/[0.04]">
                                  <div>
                                    <span className="text-[9.5px] font-extrabold text-[#2E7D32] bg-[#B8F3B8] px-1.5 py-0.5 rounded-full">
                                      {isIndonesian ? "Lebih Alami" : "Better"}
                                    </span>
                                    <p className="text-[11.5px] font-extrabold text-[#0F0F12] mt-1 leading-tight">
                                      "{corr.corrected}"
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void playPartnerVoice(corr.corrected, partner.name)}
                                    className="tap-scale w-7 h-7 rounded-full bg-[#F4F4F8] hover:bg-[#EAEAF0] flex items-center justify-center shrink-0 text-[#0F0F12]"
                                    title="Dengarkan pengucapan"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </button>
                                </div>

                                <p className="text-[10px] font-medium text-[#7A7A88] leading-snug px-0.5 flex items-start gap-1.5">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 text-[#8F5BFF]">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 21h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                                  </svg>
                                  <span>{corr.explanation}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {evalTab === "vocab" && (
                          <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
                            <p className="text-[10.5px] font-bold text-[#8C8C99] px-0.5">
                              {isIndonesian ? "Kosa kata & frasa emas untuk obrolan berikutnya:" : "Key vocabulary and idioms for your next talk:"}
                            </p>
                            {currentEvaluation?.vocabUpgrades.map((item, idx) => (
                              <div key={idx} className="bg-[#F4F4F8] rounded-[18px] p-3 border border-black/[0.04] flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-[13px] font-extrabold text-[#0F0F12]">
                                      {item.word}
                                    </span>
                                    <p className="text-[10.5px] font-bold text-[#8C8C99]">
                                      {item.meaning}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void playPartnerVoice(item.example, partner.name)}
                                    className="tap-scale w-7 h-7 rounded-full bg-white hover:bg-[#EAEAF0] flex items-center justify-center shrink-0 text-[#0F0F12] border border-black/[0.06]"
                                    title="Dengarkan contoh kalimat"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </button>
                                </div>

                                <div className="bg-white rounded-[12px] p-2 border border-black/[0.04]">
                                  <p className="text-[11px] font-semibold text-[#4E3883] italic leading-snug">
                                    "{item.example}"
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Dual Buttons */}
                      <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-black/[0.06] shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setInRoomEvaluation(false);
                            setCurrentEvaluation(null);
                            setChatHistory([]);
                            setHasStartedVoice(false);
                            stopWebSpeech();
                            stopAudioPlayback();
                          }}
                          className="tap-scale h-[40px] px-3 bg-[#F4F4F8] hover:bg-[#EAEAF0] text-[#0F0F12] rounded-full text-[12px] font-extrabold tracking-tight flex items-center justify-center transition-colors font-sans"
                        >
                          {isIndonesian ? "Latihan Lagi" : "Practice Again"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInRoomEvaluation(false);
                            navigateTo(3);
                            showToast(isIndonesian ? "Sesi tersimpan! +50 XP" : "Session saved! +50 XP", "#B8F3B8");
                          }}
                          className="tap-scale h-[40px] px-3 bg-[#0F0F12] hover:bg-black/85 text-white rounded-full text-[12px] font-extrabold tracking-tight flex items-center justify-center transition-colors font-sans"
                        >
                          {isIndonesian ? "Simpan & Keluar" : "Save & Exit"}
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
                          ? (isIndonesian ? "Mendengarkan..." : "Listening...")
                          : isCurrentlySpeaking
                            ? (isIndonesian ? "Bicara..." : "Speaking...")
                            : (isIndonesian ? "Bicara (Mic)" : "Tap to Speak")}
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
            </div>
          </div>
        )}

        {/* ===================================================================
             SCREEN 5: CHECK-IN CALENDAR, LEVEL A1 & SPEAKING 14/20 SESSIONS
             =================================================================== */}
        {(layoutMode === "showcase" || (layoutMode === "app" && activeScreen === 5)) && (
          <div id="phoneFrame5" className={`iphone-frame ${layoutMode === "showcase" && isTilted ? "phone-tilt-right" : ""} relative transition-all duration-300`}>
            
              {/* SLIDE-OVER SIDEBAR DRAWER (Profil, Bahasa, Tema) */}
              <SidebarDrawer
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isIndonesian={isIndonesian}
                onToggleLanguage={toggleLanguage}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                guestName={guestName}
                guestLevel={guestLevel}
                guestAvatar={guestAvatar}
                guestAgeRange={guestAgeRange}
                dailyGoalTarget={dailyGoalTarget}
                currentStreak={currentStreak}
                totalXp={totalXp}
                onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
                accentColor={partner.color}
              />
            <div
              className={`iphone-screen ${layoutMode === "app" ? (navDirection === "forward" ? "screen-enter-forward" : "screen-enter-backward") : ""}`}
            >
              {isNavigating && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#8F5BFF] via-[#B8F3B8] to-[#8EE88E] z-50 route-progress-bar shadow-[0_0_12px_rgba(184,243,184,0.8)]" />
              )}
              {/* TOP WHITE CARD (Calendar) */}
              <div className={`${isDarkMode ? "bg-[#181820] text-white border-b border-white/10" : "bg-white text-[#0F0F12]"} rounded-b-[30px] px-4 pt-5 pb-4 flex flex-col shrink-0 relative z-30 transition-colors duration-200`}>
                {/* Calendar Header Row */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigateTo(3)}
                    className={`tap-scale w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                      isDarkMode ? "border-white/15 text-white hover:bg-white/10" : "border-black/10 text-[#0F0F12] hover:bg-[#F4F4F8]"
                    }`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M14.5 17.5L9 12L14.5 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <h2 className={`text-[15.5px] font-extrabold leading-tight ${isDarkMode ? "text-white" : "text-[#0F0F12]"}`}>
                      {isIndonesian ? "Kalender Belajar" : "Study Calendar"}
                    </h2>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${isDarkMode ? "text-white/60 hover:text-white" : "text-[#9898A6] hover:text-[#0F0F12]"} tap-scale`}
                        title="Previous Month"
                      >
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                          <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <p className={`text-[10.5px] font-bold min-w-[84px] text-center ${isDarkMode ? "text-white/70" : "text-[#9898A6]"}`}>
                        {calendarMonthLabel}
                      </p>
                      <button
                        type="button"
                        onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${isDarkMode ? "text-white/60 hover:text-white" : "text-[#9898A6] hover:text-[#0F0F12]"} tap-scale`}
                        title="Next Month"
                      >
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                          <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCalendarMonthOffset(0);
                        setActivePickerDay(baseToday.getDate());
                      }}
                      className={`tap-scale w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        isDarkMode ? "border-white/15 text-white hover:bg-white/10" : "border-black/10 text-[#0F0F12] hover:bg-[#F4F4F8]"
                      }`}
                      title="Check In Today"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 3V6M16 3V6M9.5 13L11.5 15L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(true)}
                      className={`tap-scale p-1 flex items-center justify-center hover:opacity-75 transition-opacity ${
                        isDarkMode ? "text-white" : "text-[#0F0F12]"
                      }`}
                      title="Menu & Settings"
                      aria-label="Open sidebar menu"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6.5H20M4 12H20M4 17.5H20" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1.5 text-center mt-3 mb-1 px-0.5">
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-white/50" : "text-[#A0A0AB]"}`}>{isIndonesian ? "Min" : "Sun"}</span>
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-white/50" : "text-[#A0A0AB]"}`}>{isIndonesian ? "Sen" : "Mon"}</span>
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-white/50" : "text-[#A0A0AB]"}`}>{isIndonesian ? "Sel" : "Tue"}</span>
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-white/50" : "text-[#A0A0AB]"}`}>{isIndonesian ? "Rab" : "Wed"}</span>
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-white/50" : "text-[#A0A0AB]"}`}>{isIndonesian ? "Kam" : "Thu"}</span>
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-white/50" : "text-[#A0A0AB]"}`}>{isIndonesian ? "Jum" : "Fri"}</span>
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-white/50" : "text-[#A0A0AB]"}`}>{isIndonesian ? "Sab" : "Sat"}</span>
                </div>

                {/* Real-Time Dynamic Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5 px-0.5">
                  {/* Empty pre-padding cells */}
                  {Array.from({ length: calendarFirstDay }, (_, i) => (
                    <div key={`empty-pre-${i}`} className={`aspect-square rounded-[10px] pointer-events-none ${isDarkMode ? "bg-white/5" : "bg-[#F4F4F7]/40"}`} />
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
                        style={{ backgroundColor: checkIn ? checkIn.color : (isDarkMode ? "#252530" : "#F4F4F7") }}
                        className={`tap-scale aspect-square rounded-[10px] flex flex-col items-center justify-between p-1 relative shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)] transition-all ${
                          isSelected
                            ? "ring-2 ring-[#6C5CE7] scale-105 z-10"
                            : isToday
                            ? (isDarkMode ? "ring-2 ring-white" : "ring-2 ring-[#0F0F12]")
                            : ""
                        }`}
                      >
                        <span
                          className={`text-[9px] leading-none font-bold ${
                            checkIn
                              ? "text-[#0F0F12]/80 font-extrabold"
                              : isToday
                              ? (isDarkMode ? "text-white font-extrabold" : "text-[#0F0F12] font-extrabold")
                              : (isDarkMode ? "text-white/60" : "text-[#71717A]")
                          }`}
                        >
                          {dayNum}
                        </span>
                        <div className="flex-1 flex items-center justify-center">
                          {checkIn && <MiniCalendarFace face={checkIn.face} size={22} />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Empty post-padding cells */}
                  {Array.from(
                    { length: (7 - ((calendarFirstDay + calendarDaysInMonth) % 7)) % 7 },
                    (_, i) => (
                      <div key={`empty-post-${i}`} className={`aspect-square rounded-[10px] pointer-events-none ${isDarkMode ? "bg-white/5" : "bg-[#F4F4F7]/40"}`} />
                    )
                  )}
                </div>

                {/* Character Color Picker: Clean, Responsive & Accessible */}
                {activePickerDay !== null && (
                  <div
                    className={`mt-2.5 pt-2 border-t flex flex-col gap-1.5 animate-in fade-in duration-150 ${isDarkMode ? "border-white/10" : "border-black/5"}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className={`text-[10px] font-extrabold ${isDarkMode ? "text-white/70" : "text-[#71717A]"}`}>
                        {isIndonesian ? `Isi Tanggal ${activePickerDay}:` : `Check-in Day ${activePickerDay}:`}
                      </span>
                      <div className="flex items-center gap-2">
                        {calendarCheckIns[`${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(activePickerDay).padStart(2, "0")}`] && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCheckIn(activePickerDay)}
                            className="text-[9.5px] font-bold text-[#FF6B6B] hover:underline tap-scale"
                          >
                            {isIndonesian ? "Hapus" : "Clear"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActivePickerDay(null)}
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isDarkMode ? "text-white/40 hover:text-white" : "text-[#9898A6] hover:text-[#0F0F12]"} tap-scale`}
                          title="Tutup picker"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2.5 py-0.5">
                      {CALENDAR_PARTNERS.map((p) => {
                        const activeKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(activePickerDay).padStart(2, "0")}`;
                        const isCurrentPartner = calendarCheckIns[activeKey]?.partnerId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPartnerColor(activePickerDay, p)}
                            style={{ backgroundColor: p.color }}
                            className={`tap-scale w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-transform ${
                              isCurrentPartner ? (isDarkMode ? "ring-2 ring-white scale-110" : "ring-2 ring-[#0F0F12] scale-110") : "hover:scale-105 opacity-90 hover:opacity-100"
                            }`}
                            title={p.name}
                          >
                            <MiniCalendarFace face={p.face} size={24} />
                          </button>
                        );
                      })}
                    </div>
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
                        {currentStreak} {isIndonesian ? "Hari Streak" : "Days Streak"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10.5px] font-semibold text-[#0F0F12]/75 max-w-[186px] leading-snug z-10">
                    {isIndonesian
                      ? "Penutur Percaya Diri! Terus pertahankan rentetan belajar harian Anda!"
                      : "Elementary Speaker You are calm and confident Keep up the daily streak!"}
                  </p>

                  {/* Giant Smiling Face on Right Edge */}
                  <div className="absolute -right-2 bottom-1 pointer-events-none">
                    <FlueloCloudSVG
                      name={guestAvatar ? (guestAvatar.charAt(0).toUpperCase() + guestAvatar.slice(1).toLowerCase()) : "Sarah"}
                      size={102}
                      float={true}
                      blink={true}
                    />
                  </div>
                </div>

                {/* BOTTOM 3 WHITE METRIC CARDS (Speaking 14/20 is Clickable to open history!) */}
                <div className="grid grid-cols-3 gap-[5px] h-[106px]">
                  <div className="bg-white rounded-[22px] p-3 flex flex-col justify-between">
                    <span className="text-[10.5px] font-bold text-[#0F0F12]">Weekly Streak</span>
                    <div>
                      <p className="text-[18px] font-extrabold text-[#0F0F12] metric-tight">
                        {Math.min(7, currentStreak)} of 7
                      </p>
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

              </div>

              {/* FIXED BOTTOM NAVIGATION BAR */}
              <BottomNav
                activeScreen={5}
                onNavigate={navigateTo}
                accentColor={partner.color}
                isIndonesian={isIndonesian}
              />
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
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
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

      {/* QUICK LEVEL SWITCHER MODAL */}
      {isLevelSwitcherOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-2xl relative border border-black/10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <h3 className="text-[17px] font-extrabold text-[#0F0F12]">
                  {isIndonesian ? "Pilih Level Bahasa" : "Choose English Level"}
                </h3>
                <p className="text-[11px] font-bold text-[#8C8C99]">
                  {isIndonesian ? "Modul & respons AI akan otomatis beradaptasi" : "Modules & AI difficulty will adapt instantly"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLevelSwitcherOpen(false)}
                className="tap-scale w-8 h-8 rounded-full bg-[#F4F4F8] flex items-center justify-center text-[#0F0F12] font-bold"
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2">
              {[
                { code: "A1", titleEn: "Beginner", titleId: "Pemula", descId: "500 kata dasar, kalimat 3-7 kata, pesan kafe & perkenalan sederhana.", band: "TOEFL 1.0 - 1.5" },
                { code: "A2", titleEn: "Elementary", titleId: "Dasar", descId: "Rutinitas harian, liburan lampau, hobi & petunjuk arah santai.", band: "TOEFL 2.0 - 2.5" },
                { code: "B1", titleEn: "Intermediate", titleId: "Menengah", descId: "Opini, alasan, phrasal verbs, persiapan interview & studi.", band: "TOEFL 3.0 - 3.5" },
                { code: "B2", titleEn: "Upper-Intermediate", titleId: "Menengah Atas", descId: "Negosiasi bisnis, debat pro-kontra, komparasi strategi & analisis kerja.", band: "TOEFL 4.0 - 4.5" },
                { code: "C1", titleEn: "Advanced", titleId: "Mahir", descId: "Retorika diplomasi, etika teknologi & AI, kepemimpinan eksekutif berbobot.", band: "TOEFL 5.0 - 5.5" },
              ].map((lvl) => {
                const isSelected = guestLevel === lvl.code;
                return (
                  <button
                    key={lvl.code}
                    type="button"
                    onClick={() => handleQuickChangeLevel(lvl.code)}
                    className={`w-full text-left p-3 rounded-[20px] border transition-all tap-scale flex items-start justify-between gap-3 ${
                      isSelected
                        ? "bg-[#F5F0FF] border-[#8F5BFF] ring-2 ring-[#8F5BFF]/30 shadow-xs"
                        : "bg-[#F8F8FC] border-black/[0.06] hover:bg-[#F2F2F8]"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                          isSelected ? "bg-[#8F5BFF] text-white" : "bg-black/10 text-[#0F0F12]"
                        }`}>
                          {lvl.code}
                        </span>
                        <span className="text-[13px] font-extrabold text-[#0F0F12]">
                          {isIndonesian ? lvl.titleId : lvl.titleEn}
                        </span>
                        <span className="text-[9.5px] font-bold text-[#8C8C99]">
                          {lvl.band}
                        </span>
                      </div>
                      <p className="text-[10.5px] font-medium text-[#71717A] mt-1 leading-snug">
                        {lvl.descId}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#8F5BFF] flex items-center justify-center text-white shrink-0 mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TOPIC & MODULE SELECTION MODAL */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl relative border border-black/10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#8F5BFF] text-white">
                    Level {guestLevel}
                  </span>
                  <h3 className="text-[17px] font-extrabold text-[#0F0F12]">
                    {isIndonesian ? `Pilih Topik (${partner.name})` : `Select Topic (${partner.name})`}
                  </h3>
                </div>
                <p className="text-[11px] font-bold text-[#8C8C99] mt-0.5">
                  {isIndonesian ? "Modul percakapan khusus yang sesuai level Anda" : "Conversation modules tailored for your current level"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="tap-scale w-8 h-8 rounded-full bg-[#F4F4F8] flex items-center justify-center text-[#0F0F12] font-bold"
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2.5">
              {getModulesForPartnerAndLevel(partner.name, guestLevel).map((mod) => {
                const isSelected = activeModule.id === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleSelectModule(mod.id)}
                    className={`w-full text-left p-3.5 rounded-[22px] border transition-all tap-scale flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-[#F5F0FF] border-[#8F5BFF] ring-2 ring-[#8F5BFF]/30 shadow-xs"
                        : "bg-[#F8F8FC] border-black/[0.06] hover:bg-[#F2F2F8]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-white text-[#8F5BFF] shadow-2xs">
                        {mod.category}
                      </span>
                      {isSelected && (
                        <span className="text-[9.5px] font-black text-[#8F5BFF] flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>Aktif</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-[13px] font-extrabold text-[#0F0F12] leading-tight mt-0.5">
                      {isIndonesian ? mod.topicTitleId : mod.topicTitle}
                    </h4>

                    <p className="text-[10.5px] font-medium text-[#71717A] leading-snug">
                      {mod.brief}
                    </p>

                    <div className="mt-1 pt-1.5 border-t border-black/[0.04] flex items-center gap-1.5 text-[10px] text-[#4E3883] italic">
                      <span className="font-bold text-[#8F5BFF] shrink-0">Opening:</span>
                      <span className="truncate">"{mod.initialGreeting}"</span>
                    </div>
                  </button>
                );
              })}
            </div>
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
