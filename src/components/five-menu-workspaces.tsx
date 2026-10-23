"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Check,
  Clock,
  Compass,
  Globe,
  Headphones,
  History,
  Key,
  Layers,
  Lightbulb,
  MessageSquare,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Target,
  Users,
  Volume2,
  X,
} from "lucide-react";
import type { LiveSessionMode } from "@/hooks/useLiveSession";
import { useCourseSpeech } from "@/hooks/useCourseSpeech";
import { HumanCoachMascot } from "./mascots";
import {
  ACTIVE_VOCAB_ITEMS,
  AI_SPEAKING_PARTNERS,
  CEFR_DIAGNOSTIC_QUESTIONS,
  DAILY_CORE_TENSES,
  FLUELO_MENUS,
  PROFESSIONAL_CORE_TENSES,
  SHADOWING_TRACKS,
  VOCAB_CATEGORIES,
  markShadowingSegmentCompleted,
  markTenseDrillCompleted,
  recordDiagnosticScore,
  toggleVocabMastered,
  useFiveMenuProgress,
  type ActiveVocabItem,
  type MenuId,
  type SpeakingPartnerProfile,
} from "@/lib/fluelo-5menus";
import { CEFR_LEVELS, LEVELS, formatBand, type CefrLevel } from "@/lib/levels";
import { normalizeAnswer, wordSimilarity } from "@/lib/practice-engine";
import {
  getRandomPraise,
  playAffirmationSound,
  playRejectSound,
} from "@/lib/sound-effects";
import { SPEAKING_MISSIONS, type SpeakingMission } from "@/lib/speaking-missions";
import { updateProfile } from "@/lib/storage";
import { PRACTICE_TOPICS, TOEFL_INTERVIEW_TOPICS, type Topic } from "@/lib/topics";
import { MODE_LABELS, type SessionRecord } from "@/lib/types";


interface CategoryVisualProps {
  categoryId: string;
  size?: "sm" | "lg";
}

const CATEGORY_CARD_THEMES: Record<
  string,
  {
    headerBg: string;
    cardShadow: string;
    hoverShadow: string;
    tagLabel: string;
    accentColor: string;
  }
> = {
  // 1. Obrolan Santai & Hangout: Warm Coral / Tangerine
  "cat-daily-social": {
    headerBg: "bg-gradient-to-br from-[#FF7A59] to-[#FF5238]",
    cardShadow: "shadow-[0_12px_32px_rgba(255,82,56,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
    hoverShadow: "hover:shadow-[0_22px_44px_rgba(255,82,56,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
    tagLabel: "Daily Conversation",
    accentColor: "#FF5238",
  },
  // 2. Kuliner, Kafe & Belanja: Golden Honey / Warm Amber
  "cat-daily-dining": {
    headerBg: "bg-gradient-to-br from-[#FBBF24] to-[#F59E0B]",
    cardShadow: "shadow-[0_12px_32px_rgba(245,158,11,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
    hoverShadow: "hover:shadow-[0_22px_44px_rgba(245,158,11,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
    tagLabel: "Daily Conversation",
    accentColor: "#F59E0B",
  },
  // 3. Transportasi & Perjalanan: Vibrant Sky Blue
  "cat-daily-travel": {
    headerBg: "bg-gradient-to-br from-[#4FA1FD] to-[#2563EB]",
    cardShadow: "shadow-[0_12px_32px_rgba(37,99,235,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
    hoverShadow: "hover:shadow-[0_22px_44px_rgba(37,99,235,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
    tagLabel: "Daily Conversation",
    accentColor: "#2563EB",
  },
  // 4. Hobi, Kebiasaan & Waktu Luang: Royal Amethyst / Purple
  "cat-daily-lifestyle": {
    headerBg: "bg-gradient-to-br from-[#A78BFA] to-[#7C3AED]",
    cardShadow: "shadow-[0_12px_32px_rgba(124,58,237,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
    hoverShadow: "hover:shadow-[0_22px_44px_rgba(124,58,237,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
    tagLabel: "Daily Conversation",
    accentColor: "#7C3AED",
  },
  // 5. Aktivitas & Operasional Kerja: Fresh Emerald / Mint Green
  "cat-office-ops": {
    headerBg: "bg-gradient-to-br from-[#34D399] to-[#059669]",
    cardShadow: "shadow-[0_12px_32px_rgba(5,150,105,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
    hoverShadow: "hover:shadow-[0_22px_44px_rgba(5,150,105,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
    tagLabel: "Professional Workplace",
    accentColor: "#059669",
  },
  // 6. Rapat & Kolaborasi Tim: Deep Royal Indigo
  "cat-office-collab": {
    headerBg: "bg-gradient-to-br from-[#818CF8] to-[#4F46E5]",
    cardShadow: "shadow-[0_12px_32px_rgba(79,70,229,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
    hoverShadow: "hover:shadow-[0_22px_44px_rgba(79,70,229,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
    tagLabel: "Professional Workplace",
    accentColor: "#4F46E5",
  },
  // 7. Email, Klien & Negosiasi: Vibrant Rose / Crimson
  "cat-office-client": {
    headerBg: "bg-gradient-to-br from-[#FB7185] to-[#E11D48]",
    cardShadow: "shadow-[0_12px_32px_rgba(225,29,72,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
    hoverShadow: "hover:shadow-[0_22px_44px_rgba(225,29,72,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
    tagLabel: "Professional Workplace",
    accentColor: "#E11D48",
  },
  // 8. Manajemen Proyek & Solusi: Electric Cyan / Ocean Teal
  "cat-office-project": {
    headerBg: "bg-gradient-to-br from-[#38BDF8] to-[#0284C7]",
    cardShadow: "shadow-[0_12px_32px_rgba(2,132,199,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
    hoverShadow: "hover:shadow-[0_22px_44px_rgba(2,132,199,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
    tagLabel: "Professional Workplace",
    accentColor: "#0284C7",
  },
};

function CategoryVisual({ categoryId, size = "lg" }: CategoryVisualProps) {
  const isLg = size === "lg";
  const svgSize = isLg ? 62 : 20;

  function renderVectorSvg() {
    switch (categoryId) {
      case "cat-daily-social":
        // Obrolan Santai & Hangout: Bold white dual speech bubbles with dark strokes, chat dots & golden sparkle
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Back bubble */}
            <path
              d="M16 12H36C40.4 12 44 15.6 44 20C44 24.4 40.4 28 36 28H28L21 33V28H16C11.6 28 8 24.4 8 20C8 15.6 11.6 12 16 12Z"
              fill="#FFFFFF"
              fillOpacity="0.82"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Front bubble */}
            <path
              d="M24 22H42C46.4 22 50 25.6 50 30C50 34.4 46.4 38 42 38H39V43L32 38H24C19.6 38 16 34.4 16 30C16 25.6 19.6 22 24 22Z"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 3 chat dots */}
            <circle cx="27" cy="30" r="2" fill="#181823" />
            <circle cx="33" cy="30" r="2" fill="#181823" />
            <circle cx="39" cy="30" r="2" fill="#181823" />
            {/* Golden Sparkle Star */}
            <path
              d="M47 8L48.2 12L52 13L48.2 14.2L47 18L45.8 14.2L42 13L45.8 12L47 8Z"
              fill="#FDE047"
              stroke="#181823"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="10" r="1.5" fill="#FFFFFF" />
          </svg>
        );

      case "cat-daily-dining":
        // Kuliner, Kafe & Belanja: Ceramic cafe mug with latte foam & boutique shopping bag
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shopping bag behind */}
            <rect
              x="31"
              y="22"
              width="18"
              height="23"
              rx="4"
              fill="#FFFFFF"
              fillOpacity="0.85"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M36 22V17C36 14.8 37.8 13 40 13C42.2 13 44 14.8 44 17V22"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Ceramic Cafe Mug in front */}
            <rect
              x="8"
              y="24"
              width="23"
              height="21"
              rx="6"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M31 28C35.5 28 37.5 30.5 37.5 34C37.5 37.5 35.5 40 31 40"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Rim & latte foam */}
            <ellipse cx="19.5" cy="24" rx="11.5" ry="3.5" fill="#F8FAFC" stroke="#181823" strokeWidth="2.5" />
            <path
              d="M19.5 23.5C18.7 22.5 17.5 22.8 17.5 23.7C17.5 24.6 19.5 25.8 19.5 25.8C19.5 25.8 21.5 24.6 21.5 23.7C21.5 22.8 20.3 22.5 19.5 23.5Z"
              fill="#F59E0B"
              stroke="#181823"
              strokeWidth="1.2"
            />
            {/* Steam */}
            <path
              d="M15 17C14 14 16 12 15 9"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M22 16C21 13 23 11 22 8"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Golden star */}
            <path
              d="M47 7L48 9.5L51 10.5L48 11.5L47 14L46 11.5L43 10.5L46 9.5L47 7Z"
              fill="#FDE047"
              stroke="#181823"
              strokeWidth="1.2"
            />
          </svg>
        );

      case "cat-daily-travel":
        // Transportasi & Perjalanan: Soaring origami paper airplane with compass disc & destination pin
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Travel compass disc */}
            <circle
              cx="28"
              cy="30"
              r="18"
              fill="#FFFFFF"
              fillOpacity="0.25"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <line x1="28" y1="14" x2="28" y2="17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="43" x2="28" y2="46" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="30" x2="15" y2="30" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="41" y1="30" x2="44" y2="30" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            {/* Dashed flight trail */}
            <path
              d="M9 44C9 38 15 36 21 33"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
            {/* Soaring paper airplane */}
            <polygon
              points="47,9 19,23 28,28"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <polygon
              points="47,9 28,28 35,34"
              fill="#E2E8F0"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <line x1="47" y1="9" x2="28" y2="28" stroke="#181823" strokeWidth="2.5" />
            {/* Destination waypoint pin */}
            <circle cx="48" cy="22" r="3.5" fill="#EF4444" stroke="#181823" strokeWidth="2" />
            <path d="M48 25.5L48 29" stroke="#181823" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case "cat-daily-lifestyle":
        // Hobi, Kebiasaan & Waktu Luang: Amethyst headphones with gold music note & sparkle
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Headphone Band */}
            <path
              d="M12 30V24C12 15.16 19.16 8 28 8C36.84 8 44 15.16 44 24V30"
              stroke="#181823"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Left ear cup */}
            <rect
              x="8"
              y="26"
              width="9"
              height="18"
              rx="4.5"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.5"
            />
            <line x1="12.5" y1="31" x2="12.5" y2="39" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            {/* Right ear cup */}
            <rect
              x="39"
              y="26"
              width="9"
              height="18"
              rx="4.5"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.5"
            />
            <line x1="43.5" y1="31" x2="43.5" y2="39" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            {/* Musical note */}
            <path
              d="M26 19V32M26 22C29 20 33 22 34 24V19Z"
              fill="#FDE047"
              stroke="#181823"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx="23" cy="32" r="3.5" fill="#FDE047" stroke="#181823" strokeWidth="2" />
            {/* Playful sparkle star */}
            <path
              d="M31 35L32 38L35 39L32 40L31 43L30 40L27 39L30 38Z"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="1.5"
            />
            <circle cx="16" cy="14" r="2" fill="#FDE047" />
          </svg>
        );

      case "cat-office-ops":
        // Aktivitas & Operasional Kerja: Executive briefcase with verified task badge
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Briefcase handle */}
            <path
              d="M21 16V11C21 9.9 21.9 9 23 9H33C34.1 9 35 9.9 35 11V16"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Briefcase body */}
            <rect
              x="8"
              y="16"
              width="40"
              height="28"
              rx="7"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.5"
            />
            {/* Horizontal divider */}
            <line x1="8" y1="24" x2="48" y2="24" stroke="#181823" strokeWidth="2.5" strokeLinecap="round" />
            {/* Brass lock */}
            <rect
              x="25"
              y="21"
              width="6"
              height="7"
              rx="1.5"
              fill="#FDE047"
              stroke="#181823"
              strokeWidth="1.5"
            />
            {/* Corner details */}
            <path d="M8 38C8 41 11 44 14 44" stroke="#181823" strokeWidth="2" strokeLinecap="round" />
            <path d="M48 38C48 41 45 44 42 44" stroke="#181823" strokeWidth="2" strokeLinecap="round" />
            {/* Floating Verified Task Badge */}
            <circle cx="42" cy="40" r="9" fill="#FFFFFF" stroke="#181823" strokeWidth="2.5" />
            <path
              d="M38 40L41 43L46 37"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case "cat-office-collab":
        // Rapat & Kolaborasi Tim: 3 stylized collaboration figures with central synergy spark
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left Teammate */}
            <circle cx="16" cy="20" r="5" fill="#FFFFFF" fillOpacity="0.85" stroke="#181823" strokeWidth="2.5" />
            <path
              d="M8 38C8 32.5 11.5 28 16 28C18.5 28 20.7 29.2 22 31"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Right Teammate */}
            <circle cx="40" cy="20" r="5" fill="#FFFFFF" fillOpacity="0.85" stroke="#181823" strokeWidth="2.5" />
            <path
              d="M48 38C48 32.5 44.5 28 40 28C37.5 28 35.3 29.2 34 31"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Center Lead Teammate */}
            <circle cx="28" cy="18" r="6" fill="#FFFFFF" stroke="#181823" strokeWidth="2.5" />
            <path
              d="M18 42C18 36.5 22.5 32 28 32C33.5 32 38 36.5 38 42"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.5"
            />
            {/* Collaboration Synergy Spark */}
            <path
              d="M28 3L29.5 7L33 8L29.5 9L28 13L26.5 9L23 8L26.5 7Z"
              fill="#FDE047"
              stroke="#181823"
              strokeWidth="1.5"
            />
          </svg>
        );

      case "cat-office-client":
        // Email, Klien & Negosiasi: Formal proposal letter & envelope with golden wax seal
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Letter sheet */}
            <rect
              x="15"
              y="9"
              width="26"
              height="24"
              rx="4"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.2"
            />
            <line x1="20" y1="15" x2="33" y2="15" stroke="#181823" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="20" x2="36" y2="20" stroke="#181823" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="25" x2="28" y2="25" stroke="#181823" strokeWidth="2" strokeLinecap="round" />
            {/* Envelope body */}
            <rect
              x="8"
              y="21"
              width="40"
              height="26"
              rx="6"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.5"
            />
            {/* Flap fold */}
            <path
              d="M8 22L28 35L48 22"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="8" y1="46" x2="21" y2="34" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="48" y1="46" x2="35" y2="34" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            {/* Golden Wax Seal */}
            <circle cx="28" cy="35" r="6" fill="#FDE047" stroke="#181823" strokeWidth="1.5" />
            <path
              d="M26 35L27.5 36.5L30.5 33.5"
              stroke="#181823"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case "cat-office-project":
        // Manajemen Proyek & Solusi: Ascending solution slabs & summit milestone flag
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 3 Tiered Solution Slabs */}
            <rect
              x="8"
              y="36"
              width="40"
              height="10"
              rx="3"
              fill="#FFFFFF"
              fillOpacity="0.75"
              stroke="#181823"
              strokeWidth="2.5"
            />
            <rect
              x="14"
              y="26"
              width="34"
              height="10"
              rx="3"
              fill="#FFFFFF"
              fillOpacity="0.88"
              stroke="#181823"
              strokeWidth="2.5"
            />
            <rect
              x="22"
              y="16"
              width="26"
              height="10"
              rx="3"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="2.5"
            />
            {/* Milestone Flag at peak */}
            <line x1="38" y1="7" x2="38" y2="16" stroke="#181823" strokeWidth="2.5" strokeLinecap="round" />
            <path
              d="M38 7H47L43 11L47 15H38Z"
              fill="#FDE047"
              stroke="#181823"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Golden star */}
            <path
              d="M14 8L15.5 12L19 13L15.5 14L14 18L12.5 14L9 13L12.5 12Z"
              fill="#FFFFFF"
              stroke="#181823"
              strokeWidth="1.5"
            />
          </svg>
        );

      default:
        return <Globe className={isLg ? "size-10 text-white" : "size-4 text-white"} />;
    }
  }

  if (size === "sm") {
    const theme = CATEGORY_CARD_THEMES[categoryId];
    return (
      <div
        className={`size-8 rounded-xl flex items-center justify-center shadow-xs ${theme?.headerBg ?? "bg-[#6C5CE7]"}`}
      >
        {renderVectorSvg()}
      </div>
    );
  }

  return renderVectorSvg();
}


function renderTopicIcon(topicId: string) {
  switch (topicId) {
    case "work":
    case "interview-career":
      return <Briefcase className="size-4 text-[#6C5CE7]" aria-hidden="true" />;
    case "tech":
    case "interview-technology":
      return <Layers className="size-4 text-[#6C5CE7]" aria-hidden="true" />;
    case "study":
    case "interview-campus":
      return <BookOpen className="size-4 text-[#6C5CE7]" aria-hidden="true" />;
    case "travel":
    case "culture":
      return <Globe className="size-4 text-[#6C5CE7]" aria-hidden="true" />;
    case "daily":
    case "interview-lifestyle":
      return <Clock className="size-4 text-[#6C5CE7]" aria-hidden="true" />;
    default:
      return <MessageSquare className="size-4 text-[#6C5CE7]" aria-hidden="true" />;
  }
}

interface WorkspaceHeaderProps {
  menuId: Exclude<MenuId, 0>;
}

function WorkspaceHeader({ menuId }: WorkspaceHeaderProps) {
  const meta = FLUELO_MENUS[menuId];
  const menuIcon =
    menuId === 1 ? (
      <Compass className="size-5 text-white" aria-hidden="true" />
    ) : menuId === 2 ? (
      <BookOpen className="size-5 text-white" aria-hidden="true" />
    ) : menuId === 3 ? (
      <Layers className="size-5 text-white" aria-hidden="true" />
    ) : menuId === 4 ? (
      <Headphones className="size-5 text-white" aria-hidden="true" />
    ) : (
      <Mic className="size-5 text-white" aria-hidden="true" />
    );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#ECEEF5] bg-[#FAFAFE] p-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs"
          style={{ backgroundColor: meta.badgeColor }}
        >
          {menuIcon}
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#181823]">
            {meta.title}
          </h2>
          {meta.bannerHtml ? (
            <p className="mt-0.5 text-xs font-medium text-[#7E8190]">{meta.bannerHtml}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * MENU 1: UJI LEVEL AWAL (PLACEMENT TEST CEFR A1 KE C2)
 * ========================================================================== */

interface Menu1Props {
  currentLevel: CefrLevel;
  placementDone: boolean;
  onStartVoicePlacement: () => void;
}

export function Menu1CefrWorkspace({
  currentLevel,
  placementDone,
  onStartVoicePlacement,
}: Menu1Props) {
  const progress = useFiveMenuProgress();
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [inspectLevel, setInspectLevel] = useState<CefrLevel | null>(null);

  const scoreCount = useMemo(() => {
    return CEFR_DIAGNOSTIC_QUESTIONS.reduce((acc, q) => {
      return acc + (answers[q.id] === q.answer ? 1 : 0);
    }, 0);
  }, [answers]);

  const recommendedLevel: CefrLevel = useMemo(() => {
    if (scoreCount >= 9) return "C2";
    if (scoreCount >= 8) return "C1";
    if (scoreCount >= 6) return "B2";
    if (scoreCount >= 4) return "B1";
    if (scoreCount >= 2) return "A2";
    return "A1";
  }, [scoreCount]);

  const currentQ = CEFR_DIAGNOSTIC_QUESTIONS[cardIndex] ?? CEFR_DIAGNOSTIC_QUESTIONS[0];
  const currentPicked = answers[currentQ.id];

  const handleSelectOption = (opt: string) => {
    if (currentPicked) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }));
    setTimeout(() => {
      setIsFlipped(true);
    }, 280);
  };

  const handleNextCard = () => {
    if (cardIndex < CEFR_DIAGNOSTIC_QUESTIONS.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCardIndex((prev) => prev + 1);
      }, 200);
    } else {
      setQuizFinished(true);
      recordDiagnosticScore(scoreCount);
    }
  };

  const handleRestartQuiz = () => {
    setAnswers({});
    setCardIndex(0);
    setIsFlipped(false);
    setQuizFinished(false);
  };

  const handleApplyAndStartVoice = () => {
    void updateProfile({ level: recommendedLevel });
    setFlashcardOpen(false);
    setIsFlipped(false);
    onStartVoicePlacement();
  };

  const handleApplyLevelOnly = () => {
    void updateProfile({ level: recommendedLevel });
    setFlashcardOpen(false);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-5">
      <WorkspaceHeader menuId={1} />

      {flashcardOpen ? (
        /* INTERACTIVE 3D FLASHCARD DECK STUDIO (NO POPUP / NO BLUR) */
        <div className="rounded-[32px] border border-[#ECEEF5] bg-gradient-to-b from-[#FAF8FF] via-white to-white p-6 sm:p-8 shadow-xs">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#ECEEF5]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setFlashcardOpen(false);
                  setIsFlipped(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#ECEEF5] bg-white px-3.5 py-1.5 text-xs font-bold text-[#181823] transition hover:bg-[#F7F8FC] shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                <span>Kembali</span>
              </button>

              <span className="rounded-full bg-[#EFEAFF] px-3 py-1 text-xs font-extrabold text-[#6C5CE7]">
                Tahap 1: Flashcard Diagnostik
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-[#181823]">
                Soal {cardIndex + 1} dari {CEFR_DIAGNOSTIC_QUESTIONS.length}
              </span>
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7E8190] hover:text-[#6C5CE7] transition cursor-pointer"
                title="Ulangi dari soal 1"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* 10 Step Progress Bar */}
          <div className="my-5 flex items-center justify-between gap-1.5">
            {CEFR_DIAGNOSTIC_QUESTIONS.map((q, idx) => {
              const isCurrent = idx === cardIndex;
              const isAnswered = answers[q.id] !== undefined;
              const isCorrect = answers[q.id] === q.answer;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCardIndex(idx);
                    setIsFlipped(answers[q.id] !== undefined);
                  }}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? "bg-[#6C5CE7] ring-2 ring-[#6C5CE7]/30 scale-y-125"
                      : isAnswered
                        ? isCorrect
                          ? "bg-emerald-500"
                          : "bg-amber-400"
                        : "bg-[#ECEEF5] hover:bg-[#DCDFE8]"
                  }`}
                  title={`Soal ${idx + 1} (${q.targetLevel})`}
                />
              );
            })}
          </div>

          {!quizFinished ? (
            /* 3D FLIP CARD STAGE */
            <div className="mx-auto max-w-2xl py-2">
              <div className="perspective-1000 w-full min-h-[390px] sm:min-h-[420px]">
                <div
                  className={`relative w-full h-full min-h-[390px] sm:min-h-[420px] rounded-[28px] transition-transform duration-700 ease-out transform-style-preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 flex flex-col justify-between rounded-[28px] border-2 border-[#ECEEF5] bg-white p-6 sm:p-8 shadow-sm backface-hidden">
                    <div>
                      {/* Meta Tags */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="rounded-lg bg-[#F4F5FF] px-2.5 py-1 text-xs font-black text-[#555CE0]">
                          Target Level {currentQ.targetLevel}
                        </span>
                        <span className="text-[11px] font-semibold text-[#7E8190] bg-[#FAFAFE] px-2.5 py-1 rounded-md border border-[#ECEEF5]">
                          💼 {currentQ.context}
                        </span>
                      </div>

                      {/* Question */}
                      <h3 className="mt-4 text-base sm:text-lg font-bold text-[#181823] leading-relaxed">
                        {currentQ.question}
                      </h3>
                    </div>

                    {/* 4 Choices */}
                    <div className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQ.options.map((opt, oIdx) => {
                        const picked = currentPicked === opt;
                        const optLetter = String.fromCharCode(65 + oIdx);
                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={currentPicked !== undefined}
                            onClick={() => handleSelectOption(opt)}
                            className={`group flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-bold transition-all shadow-2xs cursor-pointer ${
                              picked
                                ? "border-[#6C5CE7] bg-[#F4F5FF] text-[#6C5CE7] ring-2 ring-[#6C5CE7]/20"
                                : "border-[#ECEEF5] bg-white text-[#181823] hover:border-[#6C5CE7] hover:bg-[#FAF8FF] hover:-translate-y-0.5"
                            }`}
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold transition ${
                                picked
                                  ? "bg-[#6C5CE7] text-white"
                                  : "bg-[#F7F8FC] text-[#7E8190] group-hover:bg-[#6C5CE7] group-hover:text-white"
                              }`}
                            >
                              {optLetter}
                            </span>
                            <span className="truncate">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer / Hint */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F8] text-[11px] text-[#7E8190]">
                      <span>Pilih salah satu jawaban untuk membalik kartu</span>
                      {currentPicked !== undefined && (
                        <button
                          type="button"
                          onClick={() => setIsFlipped(true)}
                          className="inline-flex items-center gap-1.5 font-bold text-[#6C5CE7] hover:underline cursor-pointer"
                        >
                          <span>Balik Kartu</span>
                          <RotateCcw className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className="absolute inset-0 flex flex-col justify-between rounded-[28px] border-2 border-[#E5E2FF] bg-gradient-to-b from-[#FDFDFF] via-[#F8F6FF] to-white p-6 sm:p-8 shadow-sm rotate-y-180 backface-hidden">
                    <div>
                      {/* Result Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#ECEEF5]">
                        <div className="flex items-center gap-2">
                          {currentPicked === currentQ.answer ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-extrabold text-emerald-800">
                              <Check className="size-3.5" />
                              Jawaban Tepat! 🎉
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-extrabold text-amber-800">
                              <X className="size-3.5" />
                              Jawaban Belum Tepat
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-extrabold text-[#6C5CE7]">
                          Kunci: {currentQ.answer}
                        </span>
                      </div>

                      {/* Full Sentence */}
                      <div className="mt-4 rounded-2xl bg-white p-4 border border-[#EBE8FC] shadow-2xs">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7E8190]">
                          Kalimat Lengkap:
                        </span>
                        <p className="mt-1 text-sm font-semibold text-[#181823]">
                          {currentQ.question.replace("___", `[ ${currentQ.answer} ]`)}
                        </p>
                      </div>

                      {/* Grammar Explanation */}
                      <div className="mt-3.5 rounded-2xl bg-[#F4F5FF] p-4 border border-[#ECEAFE]">
                        <span className="text-xs font-extrabold text-[#555CE0] flex items-center gap-1.5">
                          <Sparkles className="size-3.5" /> Penjelasan Tata Bahasa & Konteks:
                        </span>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#333544]">
                          {currentQ.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Back Footer Actions */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#ECEEF5]">
                      <button
                        type="button"
                        onClick={() => setIsFlipped(false)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#DCDFE8] bg-white px-4 py-2.5 text-xs font-bold text-[#181823] transition hover:bg-[#F7F8FC] cursor-pointer"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Lihat Soal</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextCard}
                        className="inline-flex items-center gap-2 rounded-full bg-[#6C5CE7] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#5A4AD1] shadow-xs cursor-pointer"
                      >
                        <span>
                          {cardIndex < CEFR_DIAGNOSTIC_QUESTIONS.length - 1
                            ? "Soal Berikutnya"
                            : "Lihat Hasil & Rekomendasi"}
                        </span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* RESULTS SCREEN */
            <div className="mx-auto max-w-lg py-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="rounded-[32px] border-2 border-[#E5E2FF] bg-gradient-to-b from-[#F7F5FF] to-white p-8 shadow-sm">
                <div className="flex justify-center mb-4">
                  <HumanCoachMascot partnerName="Emma" state="speaking" size={120} showAura={true} />
                </div>

                <span className="rounded-full bg-[#6C5CE7] px-3.5 py-1 text-xs font-extrabold text-white">
                  Tes Flashcard Diagnostik Selesai!
                </span>

                <h3 className="mt-3 text-2xl font-black text-[#181823]">
                  {scoreCount} dari {CEFR_DIAGNOSTIC_QUESTIONS.length} Soal Benar
                </h3>

                <div className="my-5 rounded-2xl bg-white p-5 border border-[#ECEEF5] shadow-2xs">
                  <span className="text-xs font-bold text-[#7E8190]">
                    Rekomendasi Level Penempatan:
                  </span>
                  <div className="mt-2 flex items-center justify-center gap-2.5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6C5CE7] text-lg font-black text-white shadow-xs">
                      {recommendedLevel}
                    </span>
                    <div className="text-left">
                      <h4 className="text-base font-extrabold text-[#181823]">
                        {LEVELS[recommendedLevel].name} ({LEVELS[recommendedLevel].nameId})
                      </h4>
                      <p className="text-[11px] font-bold text-[#555CE0]">
                        Estimasi TOEFL iBT: Band {LEVELS[recommendedLevel].toeflBandMin.toFixed(1)}–{LEVELS[recommendedLevel].toeflBandMax.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#5A5C69] border-t border-[#F3F4F8] pt-3">
                    {LEVELS[recommendedLevel].descriptionId}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleApplyAndStartVoice}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#6C5CE7] py-3 text-xs font-extrabold text-white transition hover:bg-[#5A4AD1] shadow-sm cursor-pointer"
                  >
                    <Mic className="size-4" />
                    <span>Gunakan Level {recommendedLevel} & Lanjut ke Tes Bicara AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyLevelOnly}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#DCDFE8] bg-white py-2.5 text-xs font-bold text-[#181823] transition hover:bg-[#F7F8FC] cursor-pointer"
                  >
                    <span>Gunakan Level {recommendedLevel} Saja</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestartQuiz}
                    className="inline-flex items-center gap-1.5 pt-2 text-xs font-bold text-[#7E8190] hover:text-[#6C5CE7] transition cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Ulangi Flashcard 10 Soal</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* REGULAR OVERVIEW (TARGET LEVEL BAR + 2 CARDS) */
        <>
          {/* Target Level Selector Bar */}
          <div className="rounded-[22px] border border-[#ECEEF5] bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#181823]">
                  Pilih Target Level:
                </span>
                <span className="text-[11px] text-[#7E8190]">
                  (Klik untuk melihat penjelasan & konversi skor)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectLevel(currentLevel)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F5FF] px-3 py-1 text-xs font-bold text-[#555CE0] hover:bg-[#EAEBFC] transition cursor-pointer"
                  title="Klik untuk detail level aktif"
                >
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  <span>Aktif: {currentLevel} • {LEVELS[currentLevel].name}</span>
                </button>
                {placementDone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                    <Check className="size-3" aria-hidden="true" />
                    Tes Bicara Selesai
                  </span>
                )}
              </div>
            </div>

            {/* 6 Clean Level Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {CEFR_LEVELS.map((lvl) => {
                const active = lvl === currentLevel;
                const info = LEVELS[lvl];
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setInspectLevel(lvl)}
                    className={`group flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
                      active
                        ? "border-[#6C5CE7] bg-[#6C5CE7] text-white shadow-xs"
                        : "border-[#ECEEF5] bg-[#FAFAFE] text-[#181823] hover:border-[#6C5CE7] hover:bg-[#F4F5FF]"
                    }`}
                  >
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                        active ? "bg-white/20 text-white" : "bg-[#ECEEF5] text-[#6C5CE7]"
                      }`}
                    >
                      {lvl}
                    </span>
                    <span className="truncate">{info.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 Featured Placement Stage Cards (Dashboard Card Style) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Card 1: Tahap 1 - Flashcard Diagnostic */}
            <div className="study-craft-card flex flex-col justify-between rounded-[32px] p-6 border border-[#F3F1D5] bg-gradient-to-b from-[#FDF9EA] via-[#FCFBE9] to-white relative overflow-hidden shadow-xs">
              {/* Top Bar */}
              <div className="study-top-bar">
                <div>
                  <span className="rounded-full bg-[#1B1A22] px-3 py-1 text-[11px] font-extrabold text-white">
                    Tahap 1
                  </span>
                  <h3 className="mt-1.5 text-xl font-bold text-[#181823]">
                    Diagnostik Cepat
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F1CE]/80 border border-white text-[#6B572A] shadow-xs">
                  <Sparkles className="size-4" aria-hidden="true" />
                </div>
              </div>

              {/* Mascot Stage */}
              <div className="mascot-stage my-2 relative flex min-h-[220px] items-center justify-center">
                {/* Floating Left Icons */}
                <div className="floating-left-icons">
                  <div className="float-circle orange text-[#D97706]" title="Kosakata & Grammar">
                    <BookOpen className="size-5" aria-hidden="true" />
                  </div>
                  <div className="float-circle purple text-[#6C5CE7]" title="10 Soal Adaptif">
                    <Layers className="size-5" aria-hidden="true" />
                  </div>
                </div>

                {/* Human Mascot */}
                <div className="animate-float-gentle">
                  <HumanCoachMascot
                    partnerName="Emma"
                    state="idle"
                    size={170}
                    showAura={false}
                  />
                </div>
              </div>

              {/* Info Row & Action Button */}
              <div className="mt-2">
                <div className="study-info-row">
                  <h4 className="text-xl font-bold text-[#181823] flex items-center gap-2">
                    Pilihan Ganda <span className="text-base">📝</span>
                  </h4>
                </div>

                <p className="study-desc text-xs text-[#6E707E] leading-relaxed mb-4">
                  Uji pemahaman tata bahasa dan kosakata dasar kerja dari level A1 hingga C2 dalam 10 flashcard interaktif 3D.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setCardIndex(0);
                    setIsFlipped(false);
                    setQuizFinished(false);
                    setFlashcardOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1B1A22] py-3.5 text-xs font-bold text-white transition hover:opacity-90 shadow-sm cursor-pointer"
                >
                  <span>{progress.diagnosticScore !== null ? "Ulangi Flashcard" : "Buka Soal Flashcard"}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Card 2: Tahap 2 - AI Voice Placement */}
            <div className="study-craft-card flex flex-col justify-between rounded-[32px] p-6 border border-[#E9E4FC] bg-gradient-to-b from-[#F4F1FF] via-[#FAF8FF] to-white relative overflow-hidden shadow-xs">
              {/* Top Bar */}
              <div className="study-top-bar">
                <div>
                  <span className="rounded-full bg-[#6C5CE7] px-3 py-1 text-[11px] font-extrabold text-white">
                    Tahap 2
                  </span>
                  <h3 className="mt-1.5 text-xl font-bold text-[#181823]">
                    Tes Bicara AI
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFEAFF] border border-white text-[#6C5CE7] shadow-xs">
                  <Mic className="size-4" aria-hidden="true" />
                </div>
              </div>

              {/* Mascot Stage */}
              <div className="mascot-stage my-2 relative flex min-h-[220px] items-center justify-center">
                {/* Floating Left Icons */}
                <div className="floating-left-icons">
                  <div className="float-circle purple text-[#6C5CE7]" title="One-to-One Voice">
                    <Mic className="size-5" aria-hidden="true" />
                  </div>
                  <div className="float-circle orange text-[#D97706]" title="Listening & Speaking">
                    <Headphones className="size-5" aria-hidden="true" />
                  </div>
                </div>

                {/* Human Mascot Speaking */}
                <div className="animate-float-gentle">
                  <HumanCoachMascot
                    partnerName="Emma"
                    state="speaking"
                    size={170}
                    showAura={true}
                  />
                </div>
              </div>

              {/* Info Row & Action Button */}
              <div className="mt-2">
                <div className="study-info-row">
                  <h4 className="text-xl font-bold text-[#181823] flex items-center gap-2">
                    Live AI Voice <span className="text-base">🎙️</span>
                  </h4>
                </div>

                <p className="study-desc text-xs text-[#6E707E] leading-relaxed mb-4">
                  Latihan percakapan suara langsung bersama Emma. AI menyesuaikan level otomatis dan menilai kelancaran bicaramu.
                </p>

                <button
                  type="button"
                  onClick={onStartVoicePlacement}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#6C5CE7] py-3.5 text-xs font-bold text-white transition hover:bg-[#5A4AD1] shadow-sm cursor-pointer"
                >
                  <Mic className="size-4" aria-hidden="true" />
                  <span>{placementDone ? "Uji Bicara Ulang" : "Mulai Tes Bicara"}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Level Explanation Pop-up Modal */}
      {inspectLevel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-md rounded-[26px] border border-[#ECEEF5] bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#ECEEF5]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C5CE7] text-sm font-extrabold text-white">
                  {inspectLevel}
                </span>
                <div>
                  <h4 className="text-base font-extrabold text-[#181823]">
                    {LEVELS[inspectLevel].name}
                  </h4>
                  <p className="text-[11px] font-semibold text-[#7E8190]">
                    {LEVELS[inspectLevel].nameId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectLevel(null)}
                className="rounded-full bg-[#F7F8FC] p-2 text-[#7E8190] hover:text-[#181823] hover:bg-[#ECEEF5] transition cursor-pointer"
                aria-label="Tutup"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="my-4 space-y-3.5">
              <div className="flex items-center justify-between rounded-xl bg-[#F4F5FF] p-3 text-xs">
                <span className="font-bold text-[#555CE0]">Konversi Estimasi TOEFL iBT:</span>
                <span className="font-extrabold text-[#181823] bg-white px-2 py-0.5 rounded-md border border-[#DCDFE8]">
                  Band {LEVELS[inspectLevel].toeflBandMin.toFixed(1)} – {LEVELS[inspectLevel].toeflBandMax.toFixed(1)}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-[#181823]">
                  Deskripsi Kemampuan:
                </span>
                <p className="mt-1 text-xs leading-relaxed text-[#5A5C69] bg-[#FAFAFE] p-3 rounded-xl border border-[#ECEEF5]">
                  {LEVELS[inspectLevel].descriptionId}
                </p>
              </div>

              <div className="text-[11px] text-[#7E8190]">
                {inspectLevel === currentLevel ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="size-3.5" /> Ini adalah level aktif Anda saat ini.
                  </span>
                ) : (
                  <span>Anda dapat mengatur level ini langsung, atau ikuti 2 tahap tes penempatan di bawah.</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  void updateProfile({ level: inspectLevel });
                  setInspectLevel(null);
                }}
                className="flex-1 rounded-full bg-[#6C5CE7] py-2.5 text-xs font-bold text-white transition hover:bg-[#5A4AD1] shadow-xs cursor-pointer"
              >
                {inspectLevel === currentLevel ? "Tetap di Level Ini" : "Gunakan Level Ini"}
              </button>
              <button
                type="button"
                onClick={() => setInspectLevel(null)}
                className="flex-1 rounded-full border border-[#DCDFE8] bg-white py-2.5 text-xs font-bold text-[#181823] transition hover:bg-[#F7F8FC] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * MENU 2: KOSAKATA (PERCAKAPAN KANTOR & SEHARI-HARI)
 * ========================================================================== */

interface Menu2Props {
  searchQuery: string;
  onStartVoicePractice?: () => void;
}

export function Menu2VocabWorkspace({
  searchQuery,
}: Menu2Props) {
  const progress = useFiveMenuProgress();
  const speech = useCourseSpeech();

  // Active category: null means showing the 8 category cards
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Flashcard state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<string | null>(null);
  const [quizPraise, setQuizPraise] = useState<string | null>(null);

  // In-card voice practice state
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<{
    type: "success" | "retry" | "error";
    message: string;
    heard?: string;
  } | null>(null);

  // Active category meta
  const activeCategory = useMemo(() => {
    return VOCAB_CATEGORIES.find((c) => c.id === activeCategoryId) ?? null;
  }, [activeCategoryId]);

  // Items in active category filtered by optional search query
  const categoryItems = useMemo(() => {
    if (!activeCategoryId) return [];
    const q = searchQuery.trim().toLowerCase();
    const items = ACTIVE_VOCAB_ITEMS.filter((item) => item.categoryId === activeCategoryId);
    if (!q) return items;
    return items.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.meaningId.toLowerCase().includes(q) ||
        item.exampleEn.toLowerCase().includes(q),
    );
  }, [activeCategoryId, searchQuery]);

  const currentItem: ActiveVocabItem | undefined =
    categoryItems.length > 0 ? categoryItems[currentIndex % categoryItems.length] : undefined;

  const handleNext = () => {
    if (categoryItems.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % categoryItems.length);
    setSelectedQuizChoice(null);
    setQuizPraise(null);
    setVoiceFeedback(null);
    setIsListening(false);
  };

  const handlePrev = () => {
    if (categoryItems.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + categoryItems.length) % categoryItems.length);
    setSelectedQuizChoice(null);
    setQuizPraise(null);
    setVoiceFeedback(null);
    setIsListening(false);
  };

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setCurrentIndex(0);
    setSelectedQuizChoice(null);
    setQuizPraise(null);
    setVoiceFeedback(null);
    setIsListening(false);
  };

  const handleQuizSelect = (opt: string) => {
    if (!currentItem || selectedQuizChoice !== null) return;
    setSelectedQuizChoice(opt);
    if (opt === currentItem.meaningId) {
      playAffirmationSound();
      setQuizPraise(getRandomPraise());
      if (!progress.masteredVocabIds.includes(currentItem.id)) {
        toggleVocabMastered(currentItem.id);
      }
    } else {
      playRejectSound();
      setQuizPraise(null);
    }
  };

  // In-card voice practice using SpeechRecognition
  const handleStartVoicePractice = () => {
    if (typeof window === "undefined" || !currentItem) return;

    interface ExtendedWindow extends Window {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }

    interface SpeechRecognitionInstance {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: (event: { results: Array<Array<{ transcript: string }>> }) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    }

    const extWindow = window as unknown as ExtendedWindow;
    const SpeechRecognitionClass = extWindow.SpeechRecognition || extWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceFeedback({
        type: "error",
        message: "Browser ini belum mendukung Speech Recognition. Gunakan Google Chrome.",
      });
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setVoiceFeedback(null);

      recognition.onresult = (event) => {
        const heard = event.results[0]?.[0]?.transcript ?? "";
        const target = currentItem.term;
        const normalizedTarget = normalizeAnswer(target);
        const normalizedHeard = normalizeAnswer(heard);
        const sim = wordSimilarity(normalizedTarget, normalizedHeard);
        const contains =
          normalizedHeard.includes(normalizedTarget) ||
          normalizedTarget.includes(normalizedHeard);

        if (sim >= 0.65 || contains) {
          playAffirmationSound();
          setVoiceFeedback({
            type: "success",
            message: getRandomPraise(),
            heard,
          });
        } else {
          playRejectSound();
          setVoiceFeedback({
            type: "retry",
            message: "Pelafalan belum pas. Coba ucapkan lagi!",
            heard,
          });
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceFeedback({
          type: "error",
          message: "Tidak dapat mendeteksi suara. Pastikan izin mikrofon aktif.",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // 4 Quiz options for dropdown test
  const quizOptions = useMemo(() => {
    if (!currentItem || categoryItems.length === 0) return [];
    const otherItems = categoryItems.filter((x) => x.id !== currentItem.id);
    const offset = (currentItem.number * 7) % Math.max(1, otherItems.length - 3);
    const distractors = otherItems.slice(offset, offset + 3).map((x) => x.meaningId);
    const all = [currentItem.meaningId, ...distractors];
    return all.sort((a, b) => {
      const hashA = (a.charCodeAt(0) + currentItem.number) % 10;
      const hashB = (b.charCodeAt(0) + currentItem.number) % 10;
      return hashA - hashB || a.localeCompare(b);
    });
  }, [currentItem, categoryItems]);

  const dailyCategories = useMemo(
    () => VOCAB_CATEGORIES.filter((c) => c.scope === "daily"),
    [],
  );

  const officeCategories = useMemo(
    () => VOCAB_CATEGORIES.filter((c) => c.scope === "office"),
    [],
  );

  return (
    <div className="space-y-6">
      {!activeCategory && <WorkspaceHeader menuId={2} />}

      {/* Main View: 8 Category Cards (Daily on Top, Professional Below) */}
      {!activeCategory ? (
        <div className="space-y-6">
          {/* Section 1: Daily (4 Kategori) - ON TOP */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-[#FEF9E7] text-[#E28739]">
                <MessageSquare className="size-3.5" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#181823]">
                Daily
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {dailyCategories.map((cat) => {
                const theme = CATEGORY_CARD_THEMES[cat.id] ?? {
                  headerBg: "bg-gradient-to-br from-[#FF7A59] to-[#FF5238]",
                  cardShadow: "shadow-[0_12px_32px_rgba(255,82,56,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
                  hoverShadow: "hover:shadow-[0_22px_44px_rgba(255,82,56,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
                  tagLabel: "Daily Conversation",
                  accentColor: "#FF5238",
                };
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelectCategory(cat.id);
                      }
                    }}
                    className={`group relative flex flex-col overflow-hidden rounded-[26px] bg-white text-left transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${theme.cardShadow} ${theme.hoverShadow}`}
                  >
                    {/* Top Hero Colored Block */}
                    <div
                      className={`relative flex h-40 w-full flex-col justify-between p-4.5 ${theme.headerBg} overflow-hidden`}
                    >
                      {/* Mini Window Controls (Pill & Dots from reference image) */}
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-7 rounded-full bg-white/90 shadow-2xs" />
                        <span className="size-2 rounded-full bg-white/70" />
                        <span className="size-2 rounded-full bg-white/50" />
                      </div>

                      {/* Center Illustration with smooth hover scale */}
                      <div className="flex flex-1 items-center justify-center py-2 transition-transform duration-300 group-hover:scale-110">
                        <CategoryVisual categoryId={cat.id} size="lg" />
                      </div>
                    </div>

                    {/* Bottom Title Area */}
                    <div className="flex flex-col justify-center p-5 pt-4 bg-white">
                      <h4 className="text-[15px] font-extrabold text-[#181823] transition-colors group-hover:text-[#6C5CE7] leading-snug">
                        {cat.title}
                      </h4>
                      <p className="mt-1 text-[11px] font-bold text-[#8C90A4] uppercase tracking-wider">
                        {theme.tagLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Professional (4 Kategori) - BELOW */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-[#EFEAFF] text-[#555CE0]">
                <Briefcase className="size-3.5" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#181823]">
                Professional
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {officeCategories.map((cat) => {
                const theme = CATEGORY_CARD_THEMES[cat.id] ?? {
                  headerBg: "bg-gradient-to-br from-[#34D399] to-[#059669]",
                  cardShadow: "shadow-[0_12px_32px_rgba(5,150,105,0.12),0_4px_12px_rgba(20,20,35,0.04)]",
                  hoverShadow: "hover:shadow-[0_22px_44px_rgba(5,150,105,0.22),0_8px_20px_rgba(20,20,35,0.06)]",
                  tagLabel: "Professional Workplace",
                  accentColor: "#059669",
                };
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelectCategory(cat.id);
                      }
                    }}
                    className={`group relative flex flex-col overflow-hidden rounded-[26px] bg-white text-left transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${theme.cardShadow} ${theme.hoverShadow}`}
                  >
                    {/* Top Hero Colored Block */}
                    <div
                      className={`relative flex h-40 w-full flex-col justify-between p-4.5 ${theme.headerBg} overflow-hidden`}
                    >
                      {/* Mini Window Controls (Pill & Dots from reference image) */}
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-7 rounded-full bg-white/90 shadow-2xs" />
                        <span className="size-2 rounded-full bg-white/70" />
                        <span className="size-2 rounded-full bg-white/50" />
                      </div>

                      {/* Center Illustration with smooth hover scale */}
                      <div className="flex flex-1 items-center justify-center py-2 transition-transform duration-300 group-hover:scale-110">
                        <CategoryVisual categoryId={cat.id} size="lg" />
                      </div>
                    </div>

                    {/* Bottom Title Area */}
                    <div className="flex flex-col justify-center p-5 pt-4 bg-white">
                      <h4 className="text-[15px] font-extrabold text-[#181823] transition-colors group-hover:text-[#6C5CE7] leading-snug">
                        {cat.title}
                      </h4>
                      <p className="mt-1 text-[11px] font-bold text-[#8C90A4] uppercase tracking-wider">
                        {theme.tagLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Flashcard Studio: Compact, Elegant, Zero Scroll & Tactile Grid Tiles (Tanpa Outline) */
        (() => {
          const catTheme = CATEGORY_CARD_THEMES[activeCategory.id];
          return (
            <div className="mx-auto max-w-2xl space-y-3.5">
              {/* Sleek Top Navigation Bar */}
              <div className="flex items-center justify-between gap-3 rounded-[22px] bg-white p-2.5 px-4 shadow-[0_4px_20px_rgba(20,20,35,0.04)]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategoryId(null);
                    setIsListening(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F7FB] px-3.5 py-1.5 text-xs font-bold text-[#181823] transition hover:bg-[#EFEAFF] hover:text-[#6C5CE7] cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  <span>Semua Kategori</span>
                </button>

                <div className="flex items-center gap-2">
                  <CategoryVisual categoryId={activeCategory.id} size="sm" />
                  <span className="text-xs sm:text-sm font-extrabold text-[#181823]">
                    {activeCategory.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Kosakata Sebelumnya"
                    className="flex size-7 items-center justify-center rounded-full bg-[#F6F7FB] text-[#181823] transition hover:bg-[#EFEAFF] hover:text-[#6C5CE7] cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                  </button>
                  <span className="text-[11px] font-extrabold text-[#7E8190] px-1 min-w-[46px] text-center">
                    {currentIndex + 1} / {categoryItems.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Kosakata Berikutnya"
                    className="flex size-7 items-center justify-center rounded-full bg-[#F6F7FB] text-[#181823] transition hover:bg-[#EFEAFF] hover:text-[#6C5CE7] cursor-pointer"
                  >
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Flashcard Card: Compact, Elevated, Tangible Shapes, No Outline */}
              {currentItem && (
                <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_14px_40px_rgba(20,20,35,0.08)] transition-all">
                  {/* Card Header Ribbon with Category Theme & Mini Controls */}
                  <div
                    className={`relative flex items-center justify-between px-5 py-3 text-white ${
                      catTheme?.headerBg ?? "bg-gradient-to-r from-indigo-500 to-purple-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-6 rounded-full bg-white/90 shadow-2xs" />
                      <span className="size-2 rounded-full bg-white/70" />
                      <span className="size-2 rounded-full bg-white/50" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                        CEFR {currentItem.cefr}
                      </span>
                      <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        {currentItem.kind}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Compact Height, Zero Scroll */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Word & Context Section */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#181823]">
                        {currentItem.term}
                      </h3>

                      <div className="mx-auto max-w-lg rounded-2xl bg-[#F6F7FB] px-4 py-2 text-center">
                        <p className="text-xs sm:text-sm font-medium italic text-[#4B5563]">
                          &ldquo;{currentItem.exampleEn}&rdquo;
                        </p>
                      </div>

                      {/* Compact Audio & Voice Action Buttons */}
                      <div className="flex items-center justify-center gap-2.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            speech.speak(`${currentItem.term}. ${currentItem.exampleEn}`)
                          }
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#1B1A22] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:scale-102 hover:bg-[#2C2B36] cursor-pointer"
                        >
                          <Volume2 className="size-3.5 text-[#F3E2CE]" aria-hidden="true" />
                          <span>Dengar</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleStartVoicePractice}
                          disabled={isListening}
                          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                            isListening
                              ? "bg-rose-50 text-rose-700 animate-pulse"
                              : "bg-[#F4F5FF] text-[#555CE0] hover:bg-[#EDE9FE]"
                          }`}
                        >
                          <Mic
                            className={`size-3.5 ${
                              isListening ? "text-rose-600 animate-bounce" : "text-[#555CE0]"
                            }`}
                            aria-hidden="true"
                          />
                          <span>{isListening ? "Mendengarkan..." : "Praktik Suara"}</span>
                        </button>
                      </div>

                      {/* In-Card Voice Feedback */}
                      {isListening && (
                        <div className="text-xs font-bold text-rose-600 animate-pulse pt-0.5">
                          🎙️ Ucapkan: &ldquo;{currentItem.term}&rdquo; sekarang...
                        </div>
                      )}
                      {voiceFeedback && !isListening && (
                        <div
                          className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                            voiceFeedback.type === "success"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-amber-50 text-amber-900"
                          }`}
                        >
                          {voiceFeedback.type === "success" ? "✨ " : "💡 "}
                          {voiceFeedback.message}
                        </div>
                      )}
                    </div>

                    {/* 2x2 Option Grid: Tangible Shapes, Letter Badges, NO OUTLINES */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-extrabold text-[#7E8190]">
                        <span>PILIH ARTI YANG PALING TEPAT:</span>
                        <span className="text-[11px] font-semibold text-[#A0A3BD]">
                          Kuis Cepat
                        </span>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {quizOptions.map((opt, optIdx) => {
                          const letter = ["A", "B", "C", "D"][optIdx];
                          const isPicked = selectedQuizChoice === opt;
                          const isCorrect = opt === currentItem.meaningId;
                          const isAnswered = selectedQuizChoice !== null;

                          let tileClass =
                            "bg-[#F6F7FB] text-[#181823] hover:bg-[#EDE9FE] hover:scale-[1.01] active:scale-[0.99] shadow-2xs";
                          let badgeClass = "bg-white text-[#6C5CE7] shadow-2xs";

                          if (isAnswered) {
                            if (isCorrect) {
                              tileClass =
                                "bg-emerald-500 text-white shadow-md shadow-emerald-200/50 scale-[1.01]";
                              badgeClass = "bg-white text-emerald-600";
                            } else if (isPicked) {
                              tileClass =
                                "bg-rose-500 text-white shadow-md shadow-rose-200/50";
                              badgeClass = "bg-white text-rose-600";
                            } else {
                              tileClass =
                                "bg-[#F6F7FB] text-[#181823] opacity-35 pointer-events-none";
                            }
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => handleQuizSelect(opt)}
                              className={`group flex items-center gap-3 rounded-[18px] p-3 text-left transition-all duration-200 cursor-pointer ${tileClass}`}
                            >
                              <span
                                className={`flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold transition-colors ${badgeClass}`}
                              >
                                {isAnswered && isCorrect ? (
                                  <Check className="size-4 stroke-[3]" />
                                ) : isAnswered && isPicked ? (
                                  <X className="size-4 stroke-[3]" />
                                ) : (
                                  letter
                                )}
                              </span>
                              <span className="text-xs font-bold leading-snug line-clamp-2">
                                {opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Post-Answer Result & Next Action (Compact, No Vertical Expansion) */}
                    {selectedQuizChoice !== null ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-[#FAF5FF] p-3 px-4 animate-in fade-in duration-150">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-xl text-white ${
                              selectedQuizChoice === currentItem.meaningId
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          >
                            {selectedQuizChoice === currentItem.meaningId ? (
                              <Check className="size-4 stroke-[3]" />
                            ) : (
                              <X className="size-4 stroke-[3]" />
                            )}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-[#181823]">
                                {currentItem.meaningId}
                              </span>
                              {quizPraise && selectedQuizChoice === currentItem.meaningId && (
                                <span className="text-[11px] font-extrabold text-emerald-600">
                                  • {quizPraise}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-[#7E8190] italic">
                              &ldquo;{currentItem.exampleId}&rdquo;
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#6C5CE7] px-5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#5A4AD1] hover:scale-102 cursor-pointer ml-auto"
                        >
                          <span>Lanjut</span>
                          <ArrowRight className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Clean Footer Navigation when not answered yet */
                      <div className="flex items-center justify-between pt-0.5 text-[11px] font-bold text-[#8E92A4]">
                        <button
                          type="button"
                          onClick={handlePrev}
                          className="inline-flex items-center gap-1 hover:text-[#181823] transition cursor-pointer"
                        >
                          <ArrowLeft className="size-3" />
                          <span>Sebelumnya</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const randIdx = Math.floor(Math.random() * categoryItems.length);
                            setCurrentIndex(randIdx);
                            setSelectedQuizChoice(null);
                            setQuizPraise(null);
                            setVoiceFeedback(null);
                            setIsListening(false);
                          }}
                          className="inline-flex items-center gap-1 text-[#7E8190] hover:text-[#181823] transition cursor-pointer"
                        >
                          <RotateCcw className="size-3" />
                          <span>Acak</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-1 hover:text-[#181823] transition cursor-pointer"
                        >
                          <span>Lewati</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}

/* ============================================================================
 * MENU 3: PAHAMI 3 TENSES UTAMA (PRESENT, PAST, FUTURE FOR OFFICE)
 * ========================================================================== */

interface Menu3Props {
  onStartTenseVoice: (topicId: string) => void;
}

export function Menu3TensesWorkspace({ onStartTenseVoice }: Menu3Props) {
  const progress = useFiveMenuProgress();
  const speech = useCourseSpeech();
  const [category, setCategory] = useState<"daily" | "professional">("daily");
  const [selectedTenseId, setSelectedTenseId] = useState<
    "simple-present" | "simple-past" | "simple-future" | null
  >(null);
  const [activeQuizIndex, setActiveQuizIndex] = useState<number>(0);
  const [drillChoices, setDrillChoices] = useState<Record<string, string>>({});
  const [activeFormulaType, setActiveFormulaType] = useState<"pos" | "neg" | "ask">("pos");

  const tensesList = category === "daily" ? DAILY_CORE_TENSES : PROFESSIONAL_CORE_TENSES;
  const activeTense =
    tensesList.find((t) => t.id === selectedTenseId) ?? tensesList[0];
  const currentQuiz =
    activeTense.quizzes[activeQuizIndex] ?? activeTense.quizzes[0];

  const completedInMode = tensesList.reduce((acc, t) => {
    return (
      acc +
      t.quizzes.filter((q) => progress.completedTenseDrillIds.includes(q.id)).length
    );
  }, 0);
  const totalInMode = tensesList.reduce((acc, t) => acc + t.quizzes.length, 0);

  const pickedAnswer = drillChoices[currentQuiz.id];
  const isAnswered = Boolean(pickedAnswer);
  const isCorrect = pickedAnswer === currentQuiz.answer;

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setDrillChoices((prev) => ({ ...prev, [currentQuiz.id]: opt }));
    if (opt === currentQuiz.answer) {
      playAffirmationSound();
      markTenseDrillCompleted(currentQuiz.id);
    } else {
      playRejectSound();
    }
  };

  const nextQuestion = () => {
    setActiveQuizIndex((prev) => (prev + 1) % activeTense.quizzes.length);
  };

  const prevQuestion = () => {
    setActiveQuizIndex(
      (prev) => (prev - 1 + activeTense.quizzes.length) % activeTense.quizzes.length,
    );
  };

  /* =========================================================================
   * VIEW 1: 3 CARDS OVERVIEW (CARD HUB - BEBAS DARI KESAN OVERWHELMED / PUSING)
   * DESAIN IDENTIK DENGAN KARTU LANDING PAGE FLUELO (PASTEL, ELEGAN, INTERAKTIF)
   * ========================================================================= */
  if (!selectedTenseId) {
    const TENSE_CARDS_META = [
      {
        id: "simple-present" as const,
        stepLabel: category === "daily" ? "TENSE #1 • RUTINITAS HARIAN" : "TENSE #1 • STANDUP & SOP",
        title: "Simple Present\nTense",
        formula: "S + V1 (s/es)",
        desc:
          category === "daily"
            ? "Untuk fakta, kebiasaan berulang, dan rutinitas harianmu."
            : "Untuk peran kerja, update standup, jadwal rutin, dan SOP kantor.",
        bgVar: "#86EFAC", // Mint pastel signature Fluelo
        boxVar: "rgba(21, 128, 61, 0.16)",
        baseRot: -2,
        illustration: (
          <svg width="120" height="110" viewBox="0 0 120 110" fill="none" aria-hidden="true">
            {/* Clock Dial */}
            <circle
              cx="60"
              cy="55"
              r="38"
              fill="#FFFFFF"
              fillOpacity="0.38"
              stroke="#181823"
              strokeWidth="2.5"
            />
            {/* Clock center & hands */}
            <circle cx="60" cy="55" r="5" fill="#181823" />
            <line
              x1="60"
              y1="55"
              x2="60"
              y2="29"
              stroke="#181823"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="60"
              y1="55"
              x2="78"
              y2="55"
              stroke="#181823"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* 4 Quarter Dots */}
            <circle cx="60" cy="24" r="2.5" fill="#181823" />
            <circle cx="91" cy="55" r="2.5" fill="#181823" />
            <circle cx="60" cy="86" r="2.5" fill="#181823" />
            <circle cx="29" cy="55" r="2.5" fill="#181823" />
            {/* Repeating Routine Cycle Arrow */}
            <path
              d="M96 38 A 43 43 0 0 0 38 18"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <polygon points="98,30 102,42 90,40" fill="#181823" />
            <circle cx="34" cy="76" r="4.5" fill="#181823" />
          </svg>
        ),
      },
      {
        id: "simple-past" as const,
        stepLabel: category === "daily" ? "TENSE #2 • KEJADIAN LAMPAU" : "TENSE #2 • LAPORAN & HASIL",
        title: "Simple Past\nTense",
        formula: "S + V2 / Did",
        desc:
          category === "daily"
            ? "Untuk cerita masa lalu, pengalaman, dan hal yang sudah tuntas."
            : "Untuk evaluasi, progres kemarin, dan task yang telah selesai.",
        bgVar: "#C4B5FD", // Lavender purple signature Fluelo
        boxVar: "rgba(91, 33, 182, 0.16)",
        baseRot: 1.5,
        illustration: (
          <svg width="120" height="110" viewBox="0 0 120 110" fill="none" aria-hidden="true">
            {/* Calendar page */}
            <rect
              x="25"
              y="22"
              width="70"
              height="66"
              rx="8"
              fill="#FFFFFF"
              fillOpacity="0.38"
              stroke="#181823"
              strokeWidth="2.5"
            />
            {/* Header bar */}
            <rect x="25" y="22" width="70" height="18" rx="8" fill="#181823" />
            {/* Binder rings */}
            <rect x="38" y="14" width="6" height="14" rx="3" fill="#181823" />
            <rect x="76" y="14" width="6" height="14" rx="3" fill="#181823" />
            {/* Bold checkmark for finished past action */}
            <path
              d="M42 58 L54 70 L78 46"
              stroke="#181823"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Event dots */}
            <circle cx="38" cy="80" r="3.5" fill="#181823" />
            <circle cx="82" cy="80" r="3.5" fill="#181823" />
          </svg>
        ),
      },
      {
        id: "simple-future" as const,
        stepLabel: category === "daily" ? "TENSE #3 • RENCANA ESOK" : "TENSE #3 • TARGET & PROYEK",
        title: "Simple Future\nTense",
        formula: "S + will / be going to",
        desc:
          category === "daily"
            ? "Untuk janji temu, prediksi, dan rencana aktivitas esok hari."
            : "Untuk timeline proyek baru, komitmen deadline, dan sasaran kuartal.",
        bgVar: "#FDE047", // Sunny yellow signature Fluelo
        boxVar: "rgba(161, 98, 7, 0.16)",
        baseRot: -1,
        illustration: (
          <svg width="120" height="110" viewBox="0 0 120 110" fill="none" aria-hidden="true">
            {/* Ascending milestone blocks */}
            <rect x="22" y="58" width="18" height="34" rx="4" fill="#181823" />
            <rect x="46" y="42" width="18" height="50" rx="4" fill="#181823" />
            <rect
              x="70"
              y="22"
              width="26"
              height="70"
              rx="6"
              fill="#FFFFFF"
              fillOpacity="0.55"
              stroke="#181823"
              strokeWidth="2.5"
            />
            {/* Star badge on future target */}
            <path
              d="M83 33 L85 39 L91 41 L85 43 L83 49 L81 43 L75 41 L81 39 Z"
              fill="#181823"
            />
            {/* Forward trajectory dashed curve */}
            <path
              d="M26 44 Q 50 16 83 16"
              stroke="#181823"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="3 3"
              fill="none"
            />
            <circle cx="31" cy="74" r="3" fill="#FFFFFF" />
            <circle cx="55" cy="66" r="3" fill="#FFFFFF" />
          </svg>
        ),
      },
    ];

    return (
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-[#ECEEF5] bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#8075FF] text-white shadow-sm">
              <Layers className="size-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-[#181823]">
                  3 Tenses Utama
                </h1>
                <span className="rounded-full bg-[#EFEAFF] px-2.5 py-0.5 text-[11px] font-extrabold text-[#6C5CE7]">
                  {category === "daily" ? "Daily" : "Professional"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#686A7C]">
                {category === "daily"
                  ? "Tenses untuk rutinitas dan rencana harian."
                  : "Tenses untuk meeting, progres, dan komitmen kantor."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mode Switcher Pills (Tanpa Emoji) */}
            <div className="flex items-center rounded-full bg-[#F6F7FB] p-1 border border-[#ECEEF5]">
              <button
                type="button"
                onClick={() => {
                  setCategory("daily");
                  setActiveQuizIndex(0);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                  category === "daily"
                    ? "bg-[#6C5CE7] text-white shadow-xs"
                    : "text-[#686A7C] hover:text-[#181823]"
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory("professional");
                  setActiveQuizIndex(0);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                  category === "professional"
                    ? "bg-[#6C5CE7] text-white shadow-xs"
                    : "text-[#686A7C] hover:text-[#181823]"
                }`}
              >
                Professional
              </button>
            </div>

            <span className="rounded-full bg-[#EFEAFF] px-3.5 py-1.5 text-xs font-extrabold text-[#6C5CE7]">
              Total Selesai: {completedInMode}/{totalInMode} Drill
            </span>
          </div>
        </div>

        {/* Section Heading & Handwritten Caveat Hint */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
          <div>
            <h2 className="text-lg font-black tracking-tight text-[#181823]">
              Pilih Kartu Tense
            </h2>
            <p className="text-xs font-medium text-[#686A7C]">
              Sentuh kartu di bawah untuk membuka penjelasan rumus, contoh percakapan, dan latihan kuis interaktif.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 select-none">
            <span className="font-caveat text-[21px] font-bold text-[#E11D48] -rotate-3 leading-none">
              Sentuh kartu untuk mulai belajar!
            </span>
            <svg
              className="text-[#181823]"
              width="46"
              height="24"
              viewBox="0 0 68 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M62 4 C44 2, 24 10, 6 28"
                stroke="#181823"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* 3 INTERACTIVE TENSES CARDS DECK (IDENTIK DENGAN LANDING PAGE) */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-4 sm:py-6">
          {TENSE_CARDS_META.map((cardMeta) => {
            const tenseData = tensesList.find((t) => t.id === cardMeta.id) ?? tensesList[0];
            const completedInTense = tenseData.quizzes.filter((q) =>
              progress.completedTenseDrillIds.includes(q.id),
            ).length;

            return (
              <article
                key={cardMeta.id}
                onClick={() => {
                  setSelectedTenseId(cardMeta.id);
                  setActiveQuizIndex(0);
                }}
                style={{
                  backgroundColor: cardMeta.bgVar,
                }}
                className={`group relative flex h-[380px] w-full max-w-[280px] cursor-pointer flex-col justify-between rounded-[24px] border-2 border-white/50 p-5 text-left transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] select-none shadow-[0_18px_38px_rgba(24,24,35,0.12),0_2px_6px_rgba(24,24,35,0.06)] hover:shadow-[0_28px_55px_rgba(24,24,35,0.22)] hover:-translate-y-2 hover:scale-[1.03] ${
                  cardMeta.baseRot < 0
                    ? "-rotate-1 sm:-rotate-2 hover:rotate-0"
                    : cardMeta.baseRot > 0
                      ? "rotate-1 sm:rotate-2 hover:rotate-0"
                      : "rotate-0"
                }`}
              >
                {/* Bagian Atas: Label Tense */}
                <div className="text-center text-[12.5px] font-extrabold tracking-tight text-[#181823]">
                  {cardMeta.stepLabel}
                </div>

                {/* Bagian Tengah: Ilustrasi Vektor Kontras Tinggi Khas Fluelo */}
                <div className="flex flex-1 items-center justify-center py-2 transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-108 group-hover:-translate-y-1">
                  {cardMeta.illustration}
                </div>

                {/* Bagian Bawah: Judul & Kotak Formula / Deskripsi */}
                <div className="flex flex-col gap-2.5">
                  <h2 className="text-[22px] font-extrabold leading-[1.08] tracking-tight text-[#181823] whitespace-pre-line">
                    {cardMeta.title}
                  </h2>
                  <div
                    style={{ backgroundColor: cardMeta.boxVar }}
                    className="rounded-[12px] p-2.5 px-3 text-[11px] font-semibold leading-[1.42] text-[#181823]"
                  >
                    <div className="font-extrabold text-[11px] opacity-90 mb-0.5">
                      Rumus: {cardMeta.formula}
                    </div>
                    <div>{cardMeta.desc}</div>
                  </div>

                  {/* Drill Completion Badge & CTA Link */}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-extrabold text-[#181823] shadow-2xs backdrop-blur-xs">
                      ⚡ {completedInTense}/4 Drill
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-[#181823] transition-transform group-hover:translate-x-1">
                      Buka Tense <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  /* =========================================================================
   * VIEW 2: FOCUSED TENSE SECTION / STUDIO (HANYA MUNCUL SETELAH CARD DIKLIK)
   * DESAIN IDENTIK DENGAN FLASHCARD KOSAKATA: ELEVANSI TINGGI, BANNER RIBBON,
   * ZERO OUTLINE, DAN POLA RUMUS INTERAKTIF INTUITIF (MUDAH DIPAHAMI)
   * ========================================================================= */
  const completedInActiveTense = activeTense.quizzes.filter((q) =>
    progress.completedTenseDrillIds.includes(q.id),
  ).length;

  const TENSE_DETAIL_THEMES = {
    "simple-present": {
      ribbonRumus: "bg-gradient-to-r from-[#10B981] to-[#059669]",
      ribbonContoh: "bg-gradient-to-r from-[#059669] to-[#047857]",
      ribbonKuis: "bg-gradient-to-r from-[#10B981] to-[#0D9488]",
      activeTabBg: "bg-[#059669] text-white shadow-xs",
      accentColor: "#10B981",
      activeStepper: "bg-[#10B981]",
    },
    "simple-past": {
      ribbonRumus: "bg-gradient-to-r from-[#8B5CF6] to-[#6C5CE7]",
      ribbonContoh: "bg-gradient-to-r from-[#6C5CE7] to-[#4F46E5]",
      ribbonKuis: "bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]",
      activeTabBg: "bg-[#6C5CE7] text-white shadow-xs",
      accentColor: "#6C5CE7",
      activeStepper: "bg-[#6C5CE7]",
    },
    "simple-future": {
      ribbonRumus: "bg-gradient-to-r from-[#F59E0B] to-[#D97706]",
      ribbonContoh: "bg-gradient-to-r from-[#D97706] to-[#B45309]",
      ribbonKuis: "bg-gradient-to-r from-[#EA580C] to-[#C2410C]",
      activeTabBg: "bg-[#D97706] text-white shadow-xs",
      accentColor: "#E28739",
      activeStepper: "bg-[#E28739]",
    },
  };

  const currentTheme =
    TENSE_DETAIL_THEMES[activeTense.id as keyof typeof TENSE_DETAIL_THEMES] ??
    TENSE_DETAIL_THEMES["simple-present"];

  /* Kumpulan Panduan Rumus Super Intuitif & Visual (Anti Bingung) */
  const INTUITIVE_FORMULA_GUIDES: Record<
    "simple-present" | "simple-past" | "simple-future",
    Record<
      "pos" | "neg" | "ask",
      {
        title: string;
        blocks: { label: string; sub: string; color: string }[];
        groups: {
          label: string;
          badge: string;
          badgeColor: string;
          rule: string;
          sampleEn: string;
          sampleId: string;
        }[];
        goldenTip: string;
      }
    >
  > = {
    "simple-present": {
      pos: {
        title: "Kalimat Positif (Menyatakan Kebiasaan & Fakta)",
        blocks: [
          { label: "👤 SUBJEK", sub: "Pelaku kalimat", color: "bg-[#EFF6FF] text-[#1D4ED8]" },
          { label: "⚡ KATA KERJA (V1)", sub: "Tambah -s/-es untuk Dia", color: "bg-[#ECFDF5] text-[#047857]" },
          { label: "📦 PELENGKAP", sub: "Rutinitas (every day)", color: "bg-[#F5F3FF] text-[#6D28D9]" },
        ],
        groups: [
          {
            label: "Grup A: I, You, We, They (Jamak & Saya)",
            badge: "Kata Kerja Asli Polos",
            badgeColor: "bg-blue-100 text-blue-800",
            rule: "Gunakan kata kerja bentuk asli tanpa akhiran apa pun (drink, work, study).",
            sampleEn: "I drink green tea every morning.",
            sampleId: "Saya minum teh hijau setiap pagi.",
          },
          {
            label: "Grup B: He, She, It (Tunggal / Dia)",
            badge: "Wajib Tambah +s / +es",
            badgeColor: "bg-emerald-100 text-emerald-800",
            rule: "Kata kerja wajib ditambah akhiran -s atau -es (drinks, works, watches).",
            sampleEn: "She drinks green tea every morning.",
            sampleId: "Dia minum teh hijau setiap pagi (drink + s).",
          },
        ],
        goldenTip:
          "Huruf 'S' hanya ditempelkan ke kata kerja untuk 'Dia' (He, She, It) pada kalimat positif. Untuk I/You/We/They kata kerjanya tetap asli polos!",
      },
      neg: {
        title: "Kalimat Negatif (Menolak / Menyatakan 'Tidak')",
        blocks: [
          { label: "👤 SUBJEK", sub: "Pelaku kalimat", color: "bg-[#EFF6FF] text-[#1D4ED8]" },
          { label: "⛔ don't / doesn't", sub: "Kata bantu penolak", color: "bg-[#FFF1F2] text-[#BE123C]" },
          { label: "⚡ KATA KERJA ASLI", sub: "WAJIB kembali polos tanpa -s!", color: "bg-[#ECFDF5] text-[#047857]" },
          { label: "📦 PELENGKAP", sub: "Objek / Keterangan", color: "bg-[#F5F3FF] text-[#6D28D9]" },
        ],
        groups: [
          {
            label: "Grup A: I, You, We, They",
            badge: "Gunakan don't (do not)",
            badgeColor: "bg-rose-100 text-rose-800",
            rule: "Gunakan don't diikuti kata kerja bentuk asli tanpa perubahan.",
            sampleEn: "We don't drink coffee after 8 PM.",
            sampleId: "Kami tidak minum kopi setelah jam 8 malam.",
          },
          {
            label: "Grup B: He, She, It",
            badge: "Gunakan doesn't (does not)",
            badgeColor: "bg-rose-100 text-rose-800",
            rule: "Gunakan doesn't, lalu kata kerja KEMBALI POLOS tanpa huruf 's'!",
            sampleEn: "He doesn't eat spicy food.",
            sampleId: "Dia tidak makan makanan pedas (eat, bukan eats!).",
          },
        ],
        goldenTip:
          "Begitu ada kata 'doesn't', huruf 'S' sudah diserap ke dalam kata 'does'. Jadi kata kerjanya kembali ke bentuk dasar polos (He doesn't eat, bukan He doesn't eats)!",
      },
      ask: {
        title: "Kalimat Tanya (Menanyakan Jadwal & Kebiasaan)",
        blocks: [
          { label: "❓ Do / Does", sub: "Pindah ke paling depan", color: "bg-[#FEF9E7] text-[#B45309]" },
          { label: "👤 SUBJEK", sub: "Pelaku kalimat", color: "bg-[#EFF6FF] text-[#1D4ED8]" },
          { label: "⚡ KATA KERJA ASLI?", sub: "Bentuk dasar polos?", color: "bg-[#ECFDF5] text-[#047857]" },
          { label: "📦 PELENGKAP?", sub: "Objek & Waktu?", color: "bg-[#F5F3FF] text-[#6D28D9]" },
        ],
        groups: [
          {
            label: "Grup A: Untuk I, You, We, They",
            badge: "Awali dengan 'Do'",
            badgeColor: "bg-amber-100 text-amber-800",
            rule: "Awali pertanyaan dengan kata 'Do ...?' lalu subjek dan kata kerja asli.",
            sampleEn: "Do you exercise every day?",
            sampleId: "Apakah kamu berolahraga setiap hari?",
          },
          {
            label: "Grup B: Untuk He, She, It",
            badge: "Awali dengan 'Does'",
            badgeColor: "bg-amber-100 text-amber-800",
            rule: "Awali pertanyaan dengan kata 'Does ...?' lalu subjek dan kata kerja polos.",
            sampleEn: "Does she exercise every day?",
            sampleId: "Apakah dia berolahraga setiap hari? (exercise kembali polos).",
          },
        ],
        goldenTip:
          "Cukup letakkan 'Do' atau 'Does' di awal kalimat tanya. Kata kerja di belakang subjek selalu kembali ke bentuk dasar murni!",
      },
    },
    "simple-past": {
      pos: {
        title: "Kalimat Positif (Kejadian yang Telah Selesai di Masa Lampau)",
        blocks: [
          { label: "👤 SEMUA SUBJEK", sub: "I, You, He, She, We, They", color: "bg-[#EFF6FF] text-[#1D4ED8]" },
          { label: "⏳ KATA KERJA LAMPAU (V2)", sub: "Bentuk ke-2 (launched, went)", color: "bg-[#F5F3FF] text-[#6D28D9]" },
          { label: "📦 WAKTU LAMPAU", sub: "yesterday, last week", color: "bg-[#ECFDF5] text-[#047857]" },
        ],
        groups: [
          {
            label: "Satu Aturan untuk SEMUA Subjek!",
            badge: "Semua Pakai Verb 2",
            badgeColor: "bg-purple-100 text-purple-800",
            rule: "Tidak ada beda antara He/She atau I/They. Semuanya memakai bentuk Verb 2 yang sama persis.",
            sampleEn: "Yesterday, we launched the beta and the client approved it.",
            sampleId: "Kemarin kami meluncurkan versi beta dan klien menyetujuinya.",
          },
        ],
        goldenTip:
          "Di Simple Past, semua subjek memakai Verb 2 (V2). Contoh: launch ➔ launched, see ➔ saw, buy ➔ bought.",
      },
      neg: {
        title: "Kalimat Negatif (Hal yang Tidak Terjadi di Masa Lalu)",
        blocks: [
          { label: "👤 SEMUA SUBJEK", sub: "I, You, He, She, We, They", color: "bg-[#EFF6FF] text-[#1D4ED8]" },
          { label: "⛔ did not (didn't)", sub: "Kata bantu penolak lampau", color: "bg-[#FFF1F2] text-[#BE123C]" },
          { label: "⚡ KATA KERJA ASLI (V1)", sub: "WAJIB kembali ke bentuk asli dasar!", color: "bg-[#ECFDF5] text-[#047857]" },
          { label: "📦 WAKTU LAMPAU", sub: "last afternoon, yesterday", color: "bg-[#F5F3FF] text-[#6D28D9]" },
        ],
        groups: [
          {
            label: "Aturan Kalimat Negatif Lampau",
            badge: "didn't + Verb 1 Asli",
            badgeColor: "bg-rose-100 text-rose-800",
            rule: "Gunakan 'did not' atau disingkat 'didn't', lalu kata kerja WAJIB kembali ke bentuk asli (V1).",
            sampleEn: "They didn't join the call yesterday.",
            sampleId: "Mereka tidak bergabung ke panggilan kemarin (join, bukan joined!).",
          },
        ],
        goldenTip:
          "Karena kata 'did' sudah mewakili masa lampau, kata kerjanya WAJIB kembali ke bentuk asli dasar (V1). Jangan pernah mengatakan 'didn't joined'!",
      },
      ask: {
        title: "Kalimat Tanya (Menanyakan Kejadian di Waktu Lalu)",
        blocks: [
          { label: "❓ Did", sub: "Pindah ke paling depan", color: "bg-[#FEF9E7] text-[#B45309]" },
          { label: "👤 SEMUA SUBJEK", sub: "you, they, he, she, dll.", color: "bg-[#EFF6FF] text-[#1D4ED8]" },
          { label: "⚡ KATA KERJA ASLI (V1)?", sub: "Bentuk dasar polos?", color: "bg-[#ECFDF5] text-[#047857]" },
          { label: "📦 WAKTU LAMPAU?", sub: "yesterday?, last week?", color: "bg-[#F5F3FF] text-[#6D28D9]" },
        ],
        groups: [
          {
            label: "Aturan Pertanyaan Lampau",
            badge: "Awali dengan 'Did'",
            badgeColor: "bg-amber-100 text-amber-800",
            rule: "Awali dengan 'Did', lalu sebutkan subjek dan kata kerja kembali ke bentuk dasar (V1).",
            sampleEn: "Did you send the proposal yesterday?",
            sampleId: "Apakah kamu mengirim proposal kemarin? (send, bukan sent!).",
          },
        ],
        goldenTip:
          "Sama seperti kalimat negatif, karena sudah diawali 'Did', kata kerja utama selalu dalam bentuk asli dasar (V1)!",
      },
    },
    "simple-future": {
      pos: {
        title: "Kalimat Positif (Rencana, Prediksi & Komitmen Esok)",
        blocks: [
          { label: "👤 SEMUA SUBJEK", sub: "I, You, He, She, We, They", color: "bg-[#EFF6FF] text-[#1D4ED8]" },
          { label: "🚀 will (akan)", sub: "Modal penunjuk masa depan", color: "bg-[#FEF9E7] text-[#B45309]" },
          { label: "⚡ KATA KERJA ASLI (V1)", sub: "Bentuk dasar tanpa tambahan", color: "bg-[#ECFDF5] text-[#047857]" },
          { label: "📦 WAKTU ESOK", sub: "tomorrow, next month", color: "bg-[#F5F3FF] text-[#6D28D9]" },
        ],
        groups: [
          {
            label: "Aturan Kalimat Positif Masa Depan",
            badge: "will + Verb 1 Asli",
            badgeColor: "bg-amber-100 text-amber-800",
            rule: "Cukup pasang kata 'will' di depan kata kerja asli dasar apa pun tanpa perubahan.",
            sampleEn: "Next month, our squad will launch the new onboarding flow.",
            sampleId: "Bulan depan, tim kami akan meluncurkan alur onboarding baru.",
          },
        ],
        goldenTip:
          "Simple Future sangat mudah! Cukup pasang kata 'will' di depan kata kerja dasar asli. Tidak perlu menambahkan -s, -ed, atau -ing!",
      },
      neg: {
        title: "Kalimat Negatif (Menyatakan 'Tidak Akan' Terjadi)",
        blocks: [
          { label: "👤 SEMUA SUBJEK", sub: "I, You, He, She, We, They", color: "bg-[#EFF6FF] text-[#1D4ED8]" },
          { label: "⛔ will not (won't)", sub: "Biasa disingkat won't", color: "bg-[#FFF1F2] text-[#BE123C]" },
          { label: "⚡ KATA KERJA ASLI (V1)", sub: "Bentuk dasar polos", color: "bg-[#ECFDF5] text-[#047857]" },
          { label: "📦 WAKTU ESOK", sub: "tonight, tomorrow", color: "bg-[#F5F3FF] text-[#6D28D9]" },
        ],
        groups: [
          {
            label: "Aturan Kalimat Negatif Masa Depan",
            badge: "won't (will not) + Verb 1",
            badgeColor: "bg-rose-100 text-rose-800",
            rule: "Gunakan 'will not' atau singkatan populernya 'won't' diikuti kata kerja dasar asli.",
            sampleEn: "The maintenance will not take more than 30 minutes tonight.",
            sampleId: "Pemeliharaan tidak akan memakan waktu lebih dari 30 menit malam ini.",
          },
        ],
        goldenTip:
          "'will not' sering disingkat menjadi 'won't' dalam percakapan sehari-hari. Artinya tetap sama: 'tidak akan'.",
      },
      ask: {
        title: "Kalimat Tanya (Menanyakan Rencana Masa Depan)",
        blocks: [
          { label: "❓ Will", sub: "Pindah ke paling depan", color: "bg-[#FEF9E7] text-[#B45309]" },
          { label: "👤 SEMUA SUBJEK", sub: "you, they, he, she, dll.", color: "bg-[#EFF6FF] text-[#1D4ED8]" },
          { label: "⚡ KATA KERJA ASLI (V1)?", sub: "Bentuk dasar polos?", color: "bg-[#ECFDF5] text-[#047857]" },
          { label: "📦 WAKTU ESOK?", sub: "tomorrow morning?", color: "bg-[#F5F3FF] text-[#6D28D9]" },
        ],
        groups: [
          {
            label: "Aturan Pertanyaan Masa Depan",
            badge: "Awali dengan 'Will'",
            badgeColor: "bg-amber-100 text-amber-800",
            rule: "Awali pertanyaan dengan kata 'Will', lalu subjek dan kata kerja dasar asli.",
            sampleEn: "Will you lead the product demo session tomorrow morning?",
            sampleId: "Apakah kamu akan memimpin sesi demo produk besok pagi?",
          },
        ],
        goldenTip:
          "Awali dengan 'Will', lalu sebutkan orangnya dan aktivitasnya. Pola ini juga digunakan untuk mengajak atau meminta tolong secara sopan!",
      },
    },
  };

  const currentFormulaGuide =
    INTUITIVE_FORMULA_GUIDES[activeTense.id as keyof typeof INTUITIVE_FORMULA_GUIDES][
      activeFormulaType
    ];

  return (
    <div className="space-y-5">
      {/* Sleek Top Navigation Bar: Flashcard Pill Style (Tanpa Outline) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white p-3.5 px-5 shadow-[0_10px_30px_rgba(20,20,35,0.06)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedTenseId(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F7FB] px-3.5 py-1.5 text-xs font-extrabold text-[#181823] transition hover:bg-[#EDE9FE] hover:text-[#6C5CE7] cursor-pointer"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Semua Tenses</span>
          </button>

          <div className="h-4 w-px bg-[#ECEEF5]" aria-hidden="true" />

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight text-[#181823]">
              {activeTense.name}
            </h2>
            <span className="rounded-full bg-[#EFEAFF] px-2.5 py-0.5 text-[11px] font-extrabold text-[#6C5CE7]">
              {category === "daily" ? "Daily" : "Professional"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Mode Switcher (Tanpa Emoji) */}
          <div className="flex items-center rounded-full bg-[#F6F7FB] p-1">
            <button
              type="button"
              onClick={() => {
                setCategory("daily");
                setActiveQuizIndex(0);
              }}
              className={`rounded-full px-3 py-1 text-xs font-extrabold transition cursor-pointer ${
                category === "daily"
                  ? "bg-[#6C5CE7] text-white shadow-xs"
                  : "text-[#686A7C] hover:text-[#181823]"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => {
                setCategory("professional");
                setActiveQuizIndex(0);
              }}
              className={`rounded-full px-3 py-1 text-xs font-extrabold transition cursor-pointer ${
                category === "professional"
                  ? "bg-[#6C5CE7] text-white shadow-xs"
                  : "text-[#686A7C] hover:text-[#181823]"
              }`}
            >
              Professional
            </button>
          </div>

          <span className="rounded-full bg-[#F6F7FB] px-3 py-1 text-xs font-extrabold text-[#181823]">
            ⚡ {completedInActiveTense}/{activeTense.quizzes.length} Selesai
          </span>

          <button
            type="button"
            onClick={() => onStartTenseVoice(activeTense.aiSpeakingTopicId)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1B1A22] px-4 py-1.5 text-xs font-extrabold text-white transition hover:bg-[#6C5CE7] shadow-xs cursor-pointer"
          >
            <Mic className="size-3.5" aria-hidden="true" />
            <span>Latih dengan AI</span>
          </button>
        </div>
      </div>

      {/* Workspace Bento Grid: Kolom Kiri (Rumus Intuitif + Contoh Audio) & Kolom Kanan (Simulasi Drill) */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] grid-cols-1 items-start w-full min-w-0">
        {/* KOLOM KIRI */}
        <div className="min-w-0 w-full space-y-5 flex flex-col">
          {/* CARD 1: POLA RUMUS INTUITIF & VISUAL (GAYA KOSAKATA FLASHCARD) */}
          <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_14px_40px_rgba(20,20,35,0.08)] transition-all">
            {/* Top Ribbon Banner with Mini Window Controls */}
            <div
              className={`relative flex items-center justify-between px-5 py-3 text-white ${currentTheme.ribbonRumus}`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-6 rounded-full bg-white/90 shadow-2xs" />
                <span className="size-2 rounded-full bg-white/70" />
                <span className="size-2 rounded-full bg-white/50" />
                <span className="text-xs sm:text-[13px] font-black tracking-tight text-white ml-1">
                  Pola Rumus Visual & Intuitif
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                  {activeTense.usage}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Type Switcher Tabs (Positif, Negatif, Tanya) */}
              <div className="flex items-center rounded-2xl bg-[#F6F7FB] p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveFormulaType("pos")}
                  className={`flex-1 rounded-xl py-2 px-3 text-xs font-extrabold transition cursor-pointer ${
                    activeFormulaType === "pos"
                      ? currentTheme.activeTabBg
                      : "text-[#686A7C] hover:text-[#181823]"
                  }`}
                >
                  + Kalimat Positif
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormulaType("neg")}
                  className={`flex-1 rounded-xl py-2 px-3 text-xs font-extrabold transition cursor-pointer ${
                    activeFormulaType === "neg"
                      ? "bg-[#BE123C] text-white shadow-xs"
                      : "text-[#686A7C] hover:text-[#181823]"
                  }`}
                >
                  - Kalimat Negatif
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormulaType("ask")}
                  className={`flex-1 rounded-xl py-2 px-3 text-xs font-extrabold transition cursor-pointer ${
                    activeFormulaType === "ask"
                      ? "bg-[#0284C7] text-white shadow-xs"
                      : "text-[#686A7C] hover:text-[#181823]"
                  }`}
                >
                  ? Kalimat Tanya
                </button>
              </div>

              {/* Sub-header Judul Tipe Kalimat */}
              <div className="flex items-center justify-between pt-1">
                <h3 className="text-sm font-extrabold text-[#181823]">
                  {currentFormulaGuide.title}
                </h3>
                <span className="text-[11px] font-bold text-[#8C90A4]">
                  Lego Blok Kalimat
                </span>
              </div>

              {/* Visual Sentence Builder (Blok Lego Berwarna - Super Jelas) */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#F8F9FD]">
                {currentFormulaGuide.blocks.map((block, idx) => (
                  <div key={block.label} className="flex items-center gap-2">
                    <div
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 px-3.5 text-center shadow-2xs ${block.color}`}
                    >
                      <span className="text-[12px] font-black tracking-tight">
                        {block.label}
                      </span>
                      <span className="text-[10px] font-bold opacity-80 mt-0.5">
                        {block.sub}
                      </span>
                    </div>
                    {idx < currentFormulaGuide.blocks.length - 1 && (
                      <span className="text-sm font-black text-[#A0A3B1] select-none">
                        +
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Aturan Subjek & Contoh Nyata (Tanpa Truncate & Adaptif Full-Width) */}
              <div
                className={`grid gap-3 pt-1 ${
                  currentFormulaGuide.groups.length === 1
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {currentFormulaGuide.groups.map((group) => (
                  <div
                    key={group.label}
                    className="flex flex-col justify-between rounded-2xl bg-[#F7F8FC] p-3.5 shadow-2xs space-y-2.5 min-w-0"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 pb-1">
                        <span className="text-xs font-extrabold text-[#181823]">
                          {group.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${group.badgeColor}`}
                        >
                          {group.badge}
                        </span>
                      </div>
                      <p className="text-[11.5px] font-medium text-[#686A7C] leading-snug">
                        {group.rule}
                      </p>
                    </div>

                    {/* Live Sentence Sample with Audio (Teks Penuh, Tidak Terpotong) */}
                    <div className="rounded-xl bg-white p-3 shadow-2xs flex items-start justify-between gap-3 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-[13px] font-extrabold text-[#181823] leading-snug break-words">
                          &ldquo;{group.sampleEn}&rdquo;
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-[#8C90A4] leading-normal break-words">
                          {group.sampleId}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speech.speak(group.sampleEn)}
                        aria-label="Dengar Contoh"
                        className="flex size-7.5 items-center justify-center rounded-full bg-[#1B1A22] text-[#F3E2CE] hover:bg-[#6C5CE7] hover:text-white transition cursor-pointer shrink-0 mt-0.5 shadow-2xs"
                      >
                        <Volume2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kunci Emas Anti Bingung (Cheat Sheet Callout) */}
              <div className="rounded-2xl bg-[#FEF9E7] p-3 px-4 shadow-2xs flex items-start gap-2.5">
                <span className="text-sm select-none">💡</span>
                <p className="text-[11.5px] font-semibold text-[#92400E] leading-relaxed">
                  {currentFormulaGuide.goldenTip}
                </p>
              </div>
            </div>
          </div>

          {/* CARD 2: KARTU KALIMAT PERCAKAPAN BER-AUDIO (GAYA KOSAKATA FLASHCARD) */}
          <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_14px_40px_rgba(20,20,35,0.08)] flex-1 flex flex-col justify-between">
            {/* Top Ribbon Banner with Mini Window Controls */}
            <div
              className={`relative flex items-center justify-between px-5 py-3 text-white ${currentTheme.ribbonContoh}`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-6 rounded-full bg-white/90 shadow-2xs" />
                <span className="size-2 rounded-full bg-white/70" />
                <span className="size-2 rounded-full bg-white/50" />
                <span className="text-xs sm:text-[13px] font-black tracking-tight text-white ml-1">
                  {category === "daily"
                    ? "Kartu Kalimat Percakapan Sehari-hari"
                    : "Kartu Kalimat Komunikasi Kantor"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                  4 Kalimat Ber-Audio
                </span>
              </div>
            </div>

            {/* Grid 2x2 Kartu Kalimat (Zero Outlines, Elevated Tiles, Full Text) */}
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
              {activeTense.examples.map((ex) => (
                <div
                  key={ex.english}
                  className="flex flex-col justify-between gap-3 rounded-[20px] bg-[#F7F8FC] hover:bg-[#F0F2FD] p-4 transition-all duration-200 shadow-2xs min-w-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#EFEAFF] px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#6C5CE7]">
                      {ex.tag}
                    </span>
                    <button
                      type="button"
                      onClick={() => speech.speak(ex.english)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#1B1A22] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:scale-102 hover:bg-[#6C5CE7] cursor-pointer"
                    >
                      <Volume2 className="size-3 text-[#F3E2CE]" aria-hidden="true" />
                      <span>Dengar</span>
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold leading-snug text-[#181823] break-words">
                      &ldquo;{ex.english}&rdquo;
                    </p>
                    <p className="mt-1.5 text-xs font-medium leading-normal text-[#686A7C] break-words">
                      {ex.indonesian}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: CARD 3 - SIMULASI KALIMAT (DRILL STEPPER GAYA KOSAKATA) */}
        <div className="min-w-0 w-full overflow-hidden rounded-[26px] bg-white shadow-[0_14px_40px_rgba(20,20,35,0.08)] flex flex-col justify-between">
          {/* Top Ribbon Banner with Mini Window Controls */}
          <div
            className={`relative flex items-center justify-between px-5 py-3 text-white ${currentTheme.ribbonKuis}`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 rounded-full bg-white/90 shadow-2xs" />
              <span className="size-2 rounded-full bg-white/70" />
              <span className="size-2 rounded-full bg-white/50" />
              <span className="text-xs sm:text-[13px] font-black tracking-tight text-white ml-1">
                {category === "daily" ? "Simulasi Kalimat Harian" : "Simulasi Kalimat Kantor"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                Soal {activeQuizIndex + 1} dari {activeTense.quizzes.length}
              </span>
            </div>
          </div>

          {/* Stepper Progress & Soal Interaktif */}
          <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between min-w-0">
            <div className="space-y-4 min-w-0">
              {/* Stepper Dots Indicator */}
              <div className="flex items-center gap-1.5">
                {activeTense.quizzes.map((q, idx) => {
                  const isActive = idx === activeQuizIndex;
                  const isSolved = progress.completedTenseDrillIds.includes(q.id);
                  return (
                    <span
                      key={q.id}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? `w-9 ${currentTheme.activeStepper}`
                          : isSolved
                            ? "w-6 bg-[#10B981]"
                            : "w-6 bg-[#E4E7F0]"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Question Box with Blank Slot */}
              <div className="rounded-[20px] bg-[#F7F8FC] p-4 shadow-2xs min-w-0">
                <span className="text-[11.5px] font-bold text-[#686A7C]">
                  {currentQuiz.context}
                </span>
                <p className="mt-2 text-base font-extrabold leading-relaxed text-[#181823] break-words">
                  {currentQuiz.before && <span>{currentQuiz.before} </span>}
                  <span
                    className={`inline-block min-w-[76px] px-2.5 py-0.5 mx-1 rounded-xl text-center font-extrabold transition-all shadow-2xs ${
                      isAnswered
                        ? isCorrect
                          ? "bg-[#E8FBF0] text-[#065F46]"
                          : "bg-[#FCEBF2] text-[#9F1239]"
                        : "bg-[#EFEAFF] text-[#6C5CE7]"
                    }`}
                  >
                    {isAnswered ? pickedAnswer : "___"}
                  </span>
                  {currentQuiz.after && <span> {currentQuiz.after}</span>}
                </p>
              </div>

              {/* 4 Options Grid (Tactile Cards, Tanpa Outline) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 min-w-0">
                {currentQuiz.options.map((opt, optIdx) => {
                  const letterBadge = ["A", "B", "C", "D"][optIdx] ?? "";
                  const isThisPicked = pickedAnswer === opt;
                  const isCorrectOpt = opt === currentQuiz.answer;

                  let btnStyle =
                    "bg-[#F7F8FC] text-[#181823] hover:bg-[#EFEAFF] hover:text-[#6C5CE7]";

                  if (isAnswered) {
                    if (isThisPicked && isCorrect) {
                      btnStyle = "bg-[#E8FBF0] text-[#065F46] ring-2 ring-emerald-500 shadow-xs";
                    } else if (isThisPicked && !isCorrect) {
                      btnStyle = "bg-[#FCEBF2] text-[#9F1239] ring-2 ring-rose-500";
                    } else if (isCorrectOpt) {
                      btnStyle = "bg-[#E8FBF0] text-[#065F46]";
                    } else {
                      btnStyle = "bg-[#F7F8FC] text-[#989AA9] opacity-50";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswered}
                      className={`flex items-center justify-between rounded-[18px] p-3 font-extrabold text-sm transition-all duration-200 cursor-pointer shadow-2xs min-w-0 ${btnStyle}`}
                    >
                      <span className="flex size-7 items-center justify-center rounded-xl bg-white text-[#181823] text-xs font-black shadow-2xs shrink-0">
                        {letterBadge}
                      </span>
                      <span className="flex-1 text-center font-bold px-1.5 break-words">{opt}</span>
                      {isAnswered && isCorrectOpt && (
                        <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                      )}
                      {isAnswered && isThisPicked && !isCorrect && (
                        <X className="size-4 text-rose-600 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback & Nav Controls (Responsive, Anti Terpotong) */}
            <div className="pt-3 flex flex-col gap-3 min-w-0">
              <div className="text-xs font-bold leading-normal">
                {!isAnswered ? (
                  <span className="text-[#686A7C]">
                    Pilih 1 kata kerja yang paling sesuai dengan rumus
                  </span>
                ) : isCorrect ? (
                  <div className="rounded-xl bg-emerald-50 p-2.5 px-3 text-emerald-800 shadow-2xs break-words">
                    ✓ <strong>Tepat Sekali!</strong> {currentQuiz.tip}
                  </div>
                ) : (
                  <div className="rounded-xl bg-rose-50 p-2.5 px-3 text-rose-800 shadow-2xs break-words">
                    ✕ <strong>Perlu diingat:</strong> {currentQuiz.tip}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#ECEEF5]/60">
                <button
                  type="button"
                  onClick={prevQuestion}
                  className="rounded-full bg-[#F6F7FB] px-4 py-2 text-xs font-extrabold text-[#181823] transition hover:bg-[#EFEAFF] cursor-pointer shrink-0"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="rounded-full bg-[#6C5CE7] px-5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#5b4cd1] cursor-pointer shrink-0"
                >
                  {isAnswered ? "Lanjut" : "Soal Berikutnya"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * MENU 4: COMPREHENSIBLE INPUT & SHADOWING (15 MENIT SEHARI)
 * ========================================================================== */

interface Menu4Props {
  onStartAiListenRepeat: () => void;
}

export function Menu4ShadowingWorkspace({
  onStartAiListenRepeat,
}: Menu4Props) {
  const progress = useFiveMenuProgress();
  const speech = useCourseSpeech();
  const [selectedTrackId, setSelectedTrackId] = useState<string>(SHADOWING_TRACKS[0].id);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [manualShadowText, setManualShadowText] = useState<string>("");

  const activeTrack =
    SHADOWING_TRACKS.find((t) => t.id === selectedTrackId) ?? SHADOWING_TRACKS[0];

  const playSegment = (segmentId: string, text: string) => {
    setActiveSegmentId(segmentId);
    speech.speak(text);
  };

  return (
    <div className="space-y-5">
      <WorkspaceHeader menuId={4} />

      {/* Top Cream-Yellow Banner Matching Shadowing Craft */}
      <div className="grid gap-4 rounded-[26px] border border-[#F3F1D5] bg-gradient-to-r from-[#FBF9D8] via-[#FCFBE9] to-white p-6 sm:grid-cols-[1.3fr_1fr] items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F2CE] px-3 py-1 text-xs font-extrabold text-[#5C4B28]">
              <Award className="size-3.5" aria-hidden="true" />
              Metode Aktif
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#5C4B28] border border-[#EBE9C8]">
              Target {progress.shadowingMinutesToday}/15 Menit Hari Ini
            </span>
          </div>
          <h3 className="mt-2 text-xl font-extrabold text-[#181823]">
            Comprehensible Input & Direct Shadowing Studio
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#6E707E]">
            Dengarkan dialog konteks kerja yang dapat dipahami (<em>Comprehensible Input</em>), perhatikan intonasi, lalu tirukan pengucapannya secara langsung tanpa jeda (<em>Shadowing</em>).
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onStartAiListenRepeat}
            className="inline-flex items-center gap-2 rounded-full bg-[#1B1A22] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:scale-[1.02]"
          >
            <Mic className="size-4" aria-hidden="true" />
            Buka AI Pronunciation Scoring (7 Kalimat)
          </button>
        </div>
      </div>

      {/* Track Selector Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {SHADOWING_TRACKS.map((track) => {
          const isSelected = track.id === activeTrack.id;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                setSelectedTrackId(track.id);
                setActiveSegmentId(null);
              }}
              className={`rounded-[22px] border p-4 text-left transition ${
                isSelected
                  ? "border-[#E58E3C] bg-[#FDF3E7] shadow-xs"
                  : "border-[#ECEEF5] bg-white hover:bg-[#FAFAFE]"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[#6B4722]">
                  CEFR {track.cefr}: {track.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[#7E8190]">
                  <Clock className="size-3" aria-hidden="true" />
                  {track.durationMin}m
                </span>
              </div>
              <h4 className="mt-2 text-sm font-extrabold text-[#181823]">{track.title}</h4>
              <p className="mt-1 text-[11px] text-[#7E8190]">{track.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Segments List with Audio & Direct Imitation */}
      <div className="rounded-[24px] border border-[#ECEEF5] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECEEF5] pb-4">
          <div>
            <h4 className="text-base font-extrabold text-[#181823]">{activeTrack.title}</h4>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {activeTrack.keyVocab.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded-full bg-[#F4F5FF] px-2.5 py-0.5 text-[11px] font-bold text-[#555CE0]"
                >
                  <Key className="size-3" aria-hidden="true" />
                  {v}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              speech.speak(activeTrack.segments.map((s) => s.english).join(" "))
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-[#6C5CE7] px-4 py-2 text-xs font-bold text-white"
          >
            <Play className="size-3.5 fill-current" aria-hidden="true" />
            Putar Seluruh Dialog
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          {activeTrack.segments.map((seg, idx) => {
            const isDone = progress.completedShadowingSegmentIds.includes(seg.id);
            const isCurrent = activeSegmentId === seg.id;
            const sim =
              isCurrent && (speech.transcript || manualShadowText)
                ? Math.round(
                    wordSimilarity(
                      seg.english,
                      speech.transcript || manualShadowText,
                    ) * 100,
                  )
                : null;

            return (
              <div
                key={seg.id}
                className={`rounded-[20px] border p-4 transition ${
                  isDone
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-[#F1F2F8] bg-[#FAFAFE]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#6C5CE7]">
                    Bagian {idx + 1}: {seg.speaker}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playSegment(seg.id, seg.english)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#DCDFE8] px-3.5 py-1.5 text-xs font-bold text-[#181823] hover:bg-[#F7F8FC]"
                    >
                      <Volume2 className="size-3.5" aria-hidden="true" />
                      Dengarkan Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSegmentId(seg.id);
                        setManualShadowText("");
                        if (speech.canListen) {
                          if (speech.status === "listening") {
                            speech.stopListening();
                            markShadowingSegmentCompleted(seg.id, 3);
                          } else {
                            speech.startListening();
                          }
                        } else {
                          markShadowingSegmentCompleted(seg.id, 3);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#1B1A22] px-3.5 py-1.5 text-xs font-bold text-white"
                    >
                      {isCurrent && speech.status === "listening" ? (
                        <>
                          <Square className="size-3 fill-current" aria-hidden="true" />
                          Selesai Menirukan
                        </>
                      ) : isDone ? (
                        <>
                          <Check className="size-3.5" aria-hidden="true" />
                          Sudah Ditirukan (+3m)
                        </>
                      ) : (
                        <>
                          <Mic className="size-3.5" aria-hidden="true" />
                          Tirukan Langsung (Shadow)
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="mt-2.5 text-sm font-extrabold text-[#181823]">
                  &ldquo;{seg.english}&rdquo;
                </p>
                <p className="mt-1 text-xs text-[#7E8190]">{seg.indonesian}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-[#6B4722]">
                  <Lightbulb className="size-3.5 shrink-0 text-[#E28739]" aria-hidden="true" />
                  <span>Tips Intonasi: {seg.stressTip}</span>
                </p>

                {isCurrent && (
                  <div className="mt-3 rounded-xl border border-[#ECEEF5] bg-white p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#181823]">
                        Cek Kemiripan Shadowing Kamu:
                      </span>
                      {sim !== null && (
                        <span className="rounded-full bg-[#EFEAFF] px-2.5 py-0.5 font-extrabold text-[#4E3883]">
                          Kemiripan Kata: {sim}%
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={speech.transcript || manualShadowText}
                      onChange={(e) => setManualShadowText(e.target.value)}
                      placeholder="Ucapkan dengan mikrofon atau ketik kalimat yang kamu tirukan di sini..."
                      className="mt-2 w-full rounded-xl border border-[#ECEEF5] bg-[#FAFAFE] px-3 py-2 text-xs text-[#181823] outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * MENU 5: PRAKTIK BERBICARA KOMUNIKASI DUA ARAH (1-ON-1 SPEAKING DENGAN AI)
 * ========================================================================== */

interface Menu5Props {
  currentLevel: CefrLevel;
  sessions: SessionRecord[];
  onStartVoice: (
    mode: LiveSessionMode,
    topic?: Topic,
    partner?: SpeakingPartnerProfile,
  ) => void;
  onStartMission: (mission: SpeakingMission) => void;
  onOpenSessionReport: (session: SessionRecord) => void;
  activeTab?: "partners" | "interview" | "missions" | "history";
  onTabChange?: (tab: "partners" | "interview" | "missions" | "history") => void;
  selectedPartnerId?: string;
  onSelectPartnerId?: (id: string) => void;
  searchQuery?: string;
}

export function Menu5SpeakingWorkspace({
  currentLevel,
  sessions,
  onStartVoice,
  onStartMission,
  onOpenSessionReport,
  activeTab: controlledTab,
  onTabChange,
  selectedPartnerId: controlledPartnerId,
  onSelectPartnerId,
  searchQuery = "",
}: Menu5Props) {
  const [internalTab, setInternalTab] = useState<"partners" | "interview" | "missions" | "history">("partners");
  const tab = controlledTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  const [internalPartnerId, setInternalPartnerId] = useState<string>("partner-emma");
  const selectedPartnerId = controlledPartnerId ?? internalPartnerId;
  const setSelectedPartnerId = onSelectPartnerId ?? setInternalPartnerId;

  const selectedPartner =
    AI_SPEAKING_PARTNERS.find((p) => p.id === selectedPartnerId) ?? AI_SPEAKING_PARTNERS[0];

  const query = searchQuery.trim().toLowerCase();

  const displayedPartners = query
    ? AI_SPEAKING_PARTNERS.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.role.toLowerCase().includes(query) ||
          p.specialty.toLowerCase().includes(query),
      )
    : AI_SPEAKING_PARTNERS;

  const displayedTopics = query
    ? PRACTICE_TOPICS.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.titleId.toLowerCase().includes(query) ||
          t.brief.toLowerCase().includes(query),
      )
    : PRACTICE_TOPICS;

  const displayedInterviews = query
    ? TOEFL_INTERVIEW_TOPICS.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.titleId.toLowerCase().includes(query) ||
          t.brief.toLowerCase().includes(query),
      )
    : TOEFL_INTERVIEW_TOPICS;

  const displayedMissions = query
    ? SPEAKING_MISSIONS.filter(
        (m) =>
          m.lessonTitle.toLowerCase().includes(query) ||
          m.unitTitle.toLowerCase().includes(query) ||
          m.learnerTask.toLowerCase().includes(query) ||
          m.targetVocabulary.some((v) => v.toLowerCase().includes(query)),
      )
    : SPEAKING_MISSIONS;

  return (
    <div className="space-y-5">
      <WorkspaceHeader menuId={5} />

      {/* Top Feature Card */}
      <div className="rounded-[26px] bg-[#EDF2FF] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C5CE7] px-3.5 py-1 text-xs font-bold text-white">
                <Sparkles className="size-3.5" aria-hidden="true" />
                One-to-One Speaking Real-Time
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#555CE0]">
                Backend Gemini Live Aktif
              </span>
            </div>
            <h3 className="mt-2.5 text-2xl font-extrabold text-[#181823]">
              Ekosistem Praktik Bicara Komunikasi Dua Arah
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#4E3883]">
              Pilih partner simulasi atau topik percakapan di bawah. Kamu akan terhubung langsung secara <strong>suara 2 arah real-time</strong> dengan AI, lengkap dengan transkrip langsung dan laporan evaluasi tata bahasa, kosakata, serta skor CEFR/TOEFL di akhir sesi.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartVoice(
                "practice",
                PRACTICE_TOPICS.find((t) => t.id === selectedPartner.defaultTopicId) ??
                  PRACTICE_TOPICS[0],
                selectedPartner,
              )
            }
            className="inline-flex items-center gap-2 rounded-full bg-[#1B1A22] px-6 py-3.5 text-xs font-bold text-white shadow-md transition hover:scale-[1.02]"
          >
            <Mic className="size-4" aria-hidden="true" />
            Mulai Bicara bersama {selectedPartner.name}
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("partners")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === "partners"
                ? "bg-[#1B1A22] text-white"
                : "bg-white text-[#181823] hover:bg-[#F4F5FF]"
            }`}
          >
            <Users className="size-3.5" aria-hidden="true" />
            Lawan Bicara & Topik Harian
          </button>
          <button
            type="button"
            onClick={() => setTab("interview")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === "interview"
                ? "bg-[#1B1A22] text-white"
                : "bg-white text-[#181823] hover:bg-[#F4F5FF]"
            }`}
          >
            <Clock className="size-3.5" aria-hidden="true" />
            Simulasi Interview (Timer 45d)
          </button>
          <button
            type="button"
            onClick={() => setTab("missions")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === "missions"
                ? "bg-[#1B1A22] text-white"
                : "bg-white text-[#181823] hover:bg-[#F4F5FF]"
            }`}
          >
            <Target className="size-3.5" aria-hidden="true" />
            18 Roleplay Speaking Missions
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === "history"
                ? "bg-[#1B1A22] text-white"
                : "bg-white text-[#181823] hover:bg-[#F4F5FF]"
            }`}
          >
            <History className="size-3.5" aria-hidden="true" />
            Riwayat & Evaluasi ({sessions.length})
          </button>
        </div>
      </div>

      {tab === "partners" && (
        <div className="space-y-5">
          {/* 5 Partner Profiles matching the Avatar Stack */}
          <div>
            <h4 className="text-sm font-extrabold text-[#181823]">
              Pilih Partner Bicara Selevel (Emma, Sarah, David, Sofia, Kenji)
            </h4>
            <div className="mt-3 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
              {displayedPartners.map((partner) => {
                const topic =
                  PRACTICE_TOPICS.find((t) => t.id === partner.defaultTopicId) ??
                  PRACTICE_TOPICS[0];
                const isSelected = partner.id === selectedPartnerId;
                return (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedPartnerId(partner.id)}
                    className={`flex flex-col justify-between rounded-[22px] border p-4 shadow-2xs transition cursor-pointer ${
                      isSelected
                        ? "border-[#6C5CE7] bg-[#F7F6FF] ring-2 ring-[#6C5CE7]"
                        : "border-[#ECEEF5] bg-white hover:border-[#C4C7E8]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white"
                          style={{ backgroundColor: partner.avatarBg }}
                        >
                          {partner.initial}
                        </div>
                        <span className="rounded-full bg-[#F4F5FF] px-2.5 py-0.5 text-[11px] font-bold text-[#555CE0]">
                          CEFR {partner.level}
                        </span>
                      </div>
                      <h5 className="mt-3 text-sm font-extrabold text-[#181823]">
                        {partner.name}
                      </h5>
                      <p className="text-[11px] font-bold text-[#6C5CE7]">{partner.role}</p>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-[#7E8190]">
                        {partner.specialty}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPartnerId(partner.id);
                        onStartVoice("practice", topic, partner);
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#1B1A22] py-2 text-xs font-bold text-white transition hover:opacity-90"
                    >
                      <Mic className="size-3.5" aria-hidden="true" />
                      Bicara dengan {partner.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All 12 Free Talk Topics */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-extrabold text-[#181823]">
                Semua Topik Free Talk 2 Arah (Level Aktif: {currentLevel})
              </h4>
              <span className="text-xs font-semibold text-[#7E8190]">
                Partner aktif: <strong className="text-[#6C5CE7]">{selectedPartner.name}</strong>
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {displayedTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onStartVoice("practice", topic, selectedPartner)}
                  className="flex items-start justify-between gap-3 rounded-[20px] border border-[#ECEEF5] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#7A82EB] hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4F5FF]">
                        {renderTopicIcon(topic.id)}
                      </div>
                      <span className="text-sm font-extrabold text-[#181823]">
                        {topic.title}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-[#7E8190]">
                      {topic.titleId}
                    </p>
                    <p className="mt-1 text-[11px] text-[#A0A3B1]">{topic.brief}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#F4F5FF] px-2.5 py-1 text-[11px] font-bold text-[#555CE0]">
                    {topic.minLevel}+
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "interview" && (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {displayedInterviews.map((topic) => (
            <div
              key={topic.id}
              className="flex flex-col justify-between rounded-[22px] border border-[#ECEEF5] bg-white p-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4F5FF]">
                    {renderTopicIcon(topic.id)}
                  </div>
                  <span className="rounded-full bg-[#EFEAFF] px-2.5 py-0.5 text-[11px] font-bold text-[#4D3782]">
                    4 Soal × 45d
                  </span>
                </div>
                <h5 className="mt-3 text-sm font-extrabold text-[#181823]">
                  {topic.title}
                </h5>
                <p className="text-xs font-semibold text-[#7E8190]">{topic.titleId}</p>
                <p className="mt-2 text-[11px] text-[#A0A3B1]">{topic.brief}</p>
              </div>
              <button
                type="button"
                onClick={() => onStartVoice("toefl-interview", topic)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#6C5CE7] py-2 text-xs font-bold text-white"
              >
                <Mic className="size-3.5" aria-hidden="true" />
                Mulai Simulasi Interview
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "missions" && (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedMissions.map((mission) => (
            <div
              key={mission.id}
              className="flex flex-col justify-between rounded-[22px] border border-[#ECEEF5] bg-white p-4"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="rounded-full bg-[#FDF3E7] px-2.5 py-0.5 text-[#E28739]">
                    {mission.unitTitle}
                  </span>
                  <span className="rounded-full bg-[#F4F5FF] px-2.5 py-0.5 text-[#555CE0]">
                    CEFR {mission.level}
                  </span>
                </div>
                <h5 className="mt-2.5 text-sm font-extrabold text-[#181823]">
                  {mission.lessonTitle}
                </h5>
                <p className="mt-1 text-xs text-[#7E8190]">{mission.learnerTask}</p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {mission.targetVocabulary.slice(0, 4).map((w) => (
                    <span
                      key={w}
                      className="rounded-full bg-[#F7F8FC] px-2 py-0.5 text-[10px] font-bold text-[#181823]"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onStartMission(mission)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#1B1A22] py-2 text-xs font-bold text-white"
              >
                <Mic className="size-3.5" aria-hidden="true" />
                Jalankan Roleplay Misi
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "history" && (
        <div className="rounded-[24px] border border-[#ECEEF5] bg-white p-5">
          {sessions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-bold text-[#181823]">
                Belum ada riwayat sesi berbicara 1-on-1.
              </p>
              <p className="mt-1 text-xs text-[#7E8190]">
                Pilih salah satu partner atau topik di atas untuk memulai percakapan pertamamu dengan AI!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#F1F2F8] bg-[#FAFAFE] p-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="rounded-full bg-[#EFEAFF] px-2.5 py-0.5 text-[#4E3883]">
                        {MODE_LABELS[s.mode]}
                      </span>
                      <span className="text-[#7E8190]">
                        {new Date(s.startedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h5 className="mt-1 text-sm font-extrabold text-[#181823]">
                      {s.topicTitle}
                    </h5>
                  </div>

                  <div className="flex items-center gap-3">
                    {s.feedback && (
                      <span className="rounded-full bg-[#F4F5FF] px-3 py-1 text-xs font-extrabold text-[#555CE0]">
                        Band {formatBand(s.feedback.overallBand)} (CEFR {s.feedback.cefr})
                      </span>
                    )}
                    {s.feedback && (
                      <button
                        type="button"
                        onClick={() => onOpenSessionReport(s)}
                        className="rounded-full bg-[#1B1A22] px-4 py-2 text-xs font-bold text-white"
                      >
                        Buka Evaluasi
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
