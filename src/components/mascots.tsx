"use client";

import React from "react";

export type MascotState = "idle" | "listening" | "speaking" | "celebrating" | "thinking";

interface LueloMascotProps {
  state?: MascotState;
  size?: number | string;
  className?: string;
  showAura?: boolean;
}

/**
 * Luelo - The friendly talking-book AI voice coach mascot.
 * Derived from the Fluelo logo (open book + speech bubble) with Khan Academy-style
 * expressive, warm, and playful cartoon face.
 */
export function LueloMascot({
  state = "idle",
  size = 120,
  className = "",
  showAura = false,
}: LueloMascotProps) {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isCelebrating = state === "celebrating";
  const isThinking = state === "thinking";

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Fluelo Mascot: Luelo (${state})`}
    >
      {/* Background Soft Glow (Clean & restrained) */}
      {showAura && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 pointer-events-none ${
            isSpeaking
              ? "bg-indigo-400/20 scale-125 animate-pulse"
              : isListening
              ? "bg-teal-400/20 scale-110"
              : "bg-blue-400/10 scale-100"
          }`}
        />
      )}

      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300"
      >
        <defs>
          <linearGradient id="luelo-left-wing" x1="20" y1="30" x2="75" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="luelo-right-wing" x1="85" y1="30" x2="140" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="60%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="luelo-spine-tail" x1="70" y1="110" x2="90" y2="146" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <filter id="cheek-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Back layered pages */}
        <path
          d="M24 40C24 35.58 27.58 32 32 32H74C76.2 32 78 33.8 78 36V118C78 120.2 76.2 122 74 122H32C27.58 122 24 118.42 24 114V40Z"
          fill="#06b6d4"
          opacity="0.3"
        />
        <path
          d="M136 40C136 35.58 132.42 32 128 32H86C83.8 32 82 33.8 82 36V118C82 120.2 83.8 122 86 122H128C132.42 122 136 118.42 136 114V40Z"
          fill="#7c3aed"
          opacity="0.3"
        />

        {/* Left Book Wing (Teal) */}
        <path
          d="M30 36C30 30.48 34.48 26 40 26H72C76.42 26 80 29.58 80 34V116C80 120.42 76.42 124 72 124H40C34.48 124 30 119.52 30 114V36Z"
          fill="url(#luelo-left-wing)"
        />

        {/* Right Book Wing (Indigo) */}
        <path
          d="M130 36C130 30.48 125.52 26 120 26H88C83.58 26 80 29.58 80 34V116C80 120.42 83.58 124 88 124H120C125.52 124 130 119.52 130 114V36Z"
          fill="url(#luelo-right-wing)"
        />

        {/* Speech Bubble Tail at bottom center */}
        <path
          d="M72 118L80 144L88 118Z"
          fill="url(#luelo-spine-tail)"
        />

        {/* Gentle spine divider */}
        <path
          d="M80 28V122"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Cute Listening Headphone or Soundwave Accent */}
        {isListening && (
          <g className="animate-pulse">
            <path
              d="M20 74C16 70 16 62 20 58M14 78C8 72 8 60 14 54"
              stroke="#0d9488"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M140 74C144 70 144 62 140 58M146 78C152 72 152 60 146 54"
              stroke="#6366f1"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Celebrating Confetti Stars */}
        {isCelebrating && (
          <g>
            <path d="M22 28L25 34L31 35L26 39L28 45L22 41L16 45L18 39L13 35L19 34Z" fill="#fbbf24" />
            <path d="M138 24L140 29L145 30L141 33L142 38L138 35L134 38L135 33L131 30L136 29Z" fill="#f43f5e" />
            <circle cx="80" cy="14" r="3.5" fill="#34d399" />
            <circle cx="28" cy="18" r="2.5" fill="#60a5fa" />
            <circle cx="132" cy="16" r="3" fill="#fbbf24" />
          </g>
        )}

        {/* Soft Rosy Cheeks */}
        <ellipse cx="48" cy="84" rx="8" ry="5" fill="#f472b6" opacity={isCelebrating ? 0.7 : 0.45} filter="url(#cheek-blur)" />
        <ellipse cx="112" cy="84" rx="8" ry="5" fill="#f472b6" opacity={isCelebrating ? 0.7 : 0.45} filter="url(#cheek-blur)" />

        {/* EYES */}
        {isCelebrating ? (
          // Joyful arched eyes (^ ^)
          <g stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" fill="none">
            <path d="M48 68C52 62 62 62 66 68" />
            <path d="M94 68C98 62 108 62 112 68" />
          </g>
        ) : isThinking ? (
          // Inquisitive eyes looking upward
          <g>
            {/* Left Eye */}
            <circle cx="56" cy="66" r="14" fill="#ffffff" />
            <circle cx="59" cy="62" r="7" fill="#0f172a" />
            <circle cx="61" cy="60" r="2.5" fill="#ffffff" />

            {/* Right Eye */}
            <circle cx="104" cy="66" r="14" fill="#ffffff" />
            <circle cx="107" cy="62" r="7" fill="#0f172a" />
            <circle cx="109" cy="60" r="2.5" fill="#ffffff" />
          </g>
        ) : (
          // Big, friendly cartoon eyes with bright pupils
          <g>
            {/* Left Eye */}
            <circle cx="56" cy="68" r="15" fill="#ffffff" />
            <circle cx={isListening ? "58" : "56"} cy={isListening ? "66" : "68"} r="8" fill="#0f172a" />
            <circle cx={isListening ? "60" : "59"} cy={isListening ? "64" : "65"} r="3" fill="#ffffff" />

            {/* Right Eye */}
            <circle cx="104" cy="68" r="15" fill="#ffffff" />
            <circle cx={isListening ? "102" : "104"} cy={isListening ? "66" : "68"} r="8" fill="#0f172a" />
            <circle cx={isListening ? "100" : "102"} cy={isListening ? "64" : "65"} r="3" fill="#ffffff" />
          </g>
        )}

        {/* MOUTH */}
        {isSpeaking ? (
          // Animated talking open mouth
          <g className="animate-talk">
            <path
              d="M70 82C70 94 90 94 90 82Z"
              fill="#0f172a"
            />
            <path
              d="M74 88C76 93 84 93 86 88Z"
              fill="#fb7185"
            />
            {/* Upper teeth sparkle */}
            <path
              d="M72 82C74 85 86 85 88 82"
              fill="#ffffff"
            />
          </g>
        ) : isCelebrating ? (
          // Big joyous open smile
          <g>
            <path
              d="M68 80C68 96 92 96 92 80Z"
              fill="#0f172a"
            />
            <path
              d="M72 87C75 94 85 94 88 87Z"
              fill="#fb7185"
            />
          </g>
        ) : isListening ? (
          // Attentive gentle 'O' mouth
          <ellipse cx="80" cy="85" rx="5" ry="6" fill="#0f172a" />
        ) : (
          // Warm friendly curve smile
          <path
            d="M71 82C75 88 85 88 89 82"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}

interface PentaMascotProps {
  state?: "idle" | "waving" | "celebrating" | "studying";
  size?: number | string;
  className?: string;
}

/**
 * Penta - The cheerful geometric mascot inspired by Khan Academy's friendly polygon.
 * Features a friendly rounded hexagonal shape with expressive cartoon eyes and playful posture.
 */
export function PentaMascot({
  state = "idle",
  size = 110,
  className = "",
}: PentaMascotProps) {
  const isCelebrating = state === "celebrating";
  const isWaving = state === "waving";

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Fluelo Companion Mascot: Penta (${state})`}
    >
      <svg
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="penta-body" x1="25" y1="20" x2="115" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <filter id="penta-blush" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Celebrating little stars */}
        {isCelebrating && (
          <g>
            <path d="M20 22L22 26L27 27L23 30L24 35L20 32L16 35L17 30L13 27L18 26Z" fill="#fbbf24" />
            <path d="M120 18L122 22L127 23L123 26L124 31L120 28L116 31L117 26L113 23L118 22Z" fill="#34d399" />
          </g>
        )}

        {/* Waving Hand */}
        {isWaving && (
          <path
            d="M108 50C116 42 126 38 130 44C134 50 126 60 118 64"
            fill="#3b82f6"
            stroke="#1d4ed8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Main Hexagonal / Polygon Body */}
        <path
          d="M70 16L114 42V98L70 124L26 98V42L70 16Z"
          fill="url(#penta-body)"
          stroke="#1e40af"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Cute highlight contour */}
        <path
          d="M70 24L106 46V92"
          stroke="#93c5fd"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="46" cy="80" rx="7" ry="4.5" fill="#f472b6" opacity="0.6" filter="url(#penta-blush)" />
        <ellipse cx="94" cy="80" rx="7" ry="4.5" fill="#f472b6" opacity="0.6" filter="url(#penta-blush)" />

        {/* Big Cartoon Eyes */}
        {isCelebrating ? (
          <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M44 64C48 58 56 58 60 64" />
            <path d="M80 64C84 58 92 58 96 64" />
          </g>
        ) : (
          <g>
            {/* Left Eye */}
            <circle cx="52" cy="64" r="13" fill="#ffffff" />
            <circle cx="53" cy="64" r="7" fill="#0f172a" />
            <circle cx="56" cy="62" r="2.5" fill="#ffffff" />

            {/* Right Eye */}
            <circle cx="88" cy="64" r="13" fill="#ffffff" />
            <circle cx="87" cy="64" r="7" fill="#0f172a" />
            <circle cx="90" cy="62" r="2.5" fill="#ffffff" />
          </g>
        )}

        {/* Cute Smile */}
        <path
          d="M62 78C66 84 74 84 78 78"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

interface SparkyFlameProps {
  size?: number | string;
  streak?: number;
  className?: string;
}

/**
 * Sparky - The friendly daily streak flame mascot.
 */
export function SparkyFlame({ size = 32, streak, className = "" }: SparkyFlameProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 font-bold select-none ${className}`}
      aria-label={`Daily Streak: ${streak ?? 0} days`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="flame-outer" x1="18" y1="4" x2="18" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="flame-inner" x1="18" y1="14" x2="18" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Outer Flame */}
        <path
          d="M18 3C18 3 10 11 10 20C10 25.52 14.48 31 20 31C24.42 31 28 27.87 28 23.5C28 17.5 22 14.5 22 14.5C22 14.5 24 18 21 19.5C18 21 16 19 17 15C17.6 12.6 20 9 18 3Z"
          fill="url(#flame-outer)"
        />

        {/* Inner Core Flame */}
        <path
          d="M18 16C18 16 14 20 14 24C14 26.76 16.24 29 19 29C21.76 29 23 27 23 25C23 22 20 20 20 20C20 20 21 21.5 19.5 22C18 22.5 17 21 18 16Z"
          fill="url(#flame-inner)"
        />

        {/* Mascot Eyes */}
        <circle cx="16" cy="22" r="1.5" fill="#451a03" />
        <circle cx="21" cy="22" r="1.5" fill="#451a03" />
        {/* Mascot Smile */}
        <path d="M17.5 24.5C18.2 25.2 19.8 25.2 20.5 24.5" stroke="#451a03" strokeWidth="1" strokeLinecap="round" />
      </svg>
      {typeof streak === "number" && (
        <span className="text-amber-600 font-black tracking-tight">{streak}</span>
      )}
    </div>
  );
}

/**
 * Khan Academy-style Achievement Badge Prop (Crown, Gem, Book, Star, Trophy)
 */
export function MascotBadge({
  kind,
  size = 32,
  className = "",
}: {
  kind: "crown" | "gem" | "pencil" | "apple" | "trophy" | "star";
  size?: number | string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {kind === "crown" && (
        <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" fill="#bbf7d0" />
        </svg>
      )}
      {kind === "gem" && (
        <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="#fbcfe8" />
        </svg>
      )}
      {kind === "pencil" && (
        <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" fill="#bae6fd" />
        </svg>
      )}
      {kind === "trophy" && (
        <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34M7 4h10v6a5 5 0 0 1-10 0V4z" fill="#fef08a" />
        </svg>
      )}
      {kind === "star" && (
        <svg viewBox="0 0 24 24" fill="#fde047" stroke="#ca8a04" strokeWidth="2" className="w-3/5 h-3/5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
      {kind === "apple" && (
        <svg viewBox="0 0 24 24" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" className="w-3/5 h-3/5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
          <path d="M10 2c1 .5 2 2 2 5" />
        </svg>
      )}
    </div>
  );
}

export interface HumanCoachMascotProps {
  state?: MascotState;
  partnerName?: string;
  size?: number | string;
  className?: string;
  showAura?: boolean;
}

/**
 * HumanCoachMascot - Friendly human AI coach character in the exact flat-vector,
 * soft-pastel mascot style as the dashboard cards (red glasses, bowtie, suspenders, pointer stick).
 */
export function HumanCoachMascot({
  state = "idle",
  partnerName = "Emma",
  size = 145,
  className = "",
  showAura = true,
}: HumanCoachMascotProps) {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isCelebrating = state === "celebrating";
  const isThinking = state === "thinking";

  // Customize aesthetics per partner (defaulting to Emma, the primary coach)
  const isMale = partnerName === "David" || partnerName === "Kenji";
  const hairColor =
    partnerName === "Kenji"
      ? "#1F2937"
      : partnerName === "Sarah"
      ? "#D97706"
      : partnerName === "Sofia"
      ? "#371B28"
      : partnerName === "David"
      ? "#3B271E"
      : "#6D4C41"; // Emma

  const glassesColor =
    partnerName === "Kenji"
      ? "#3B82F6"
      : partnerName === "Sarah"
      ? "#059669"
      : partnerName === "Sofia"
      ? "#8B5CF6"
      : partnerName === "David"
      ? "#475569"
      : "#E74C3C"; // Emma's iconic red frames

  const bowtieColor =
    partnerName === "Kenji"
      ? "#10B981"
      : partnerName === "Sarah"
      ? "#EC4899"
      : partnerName === "Sofia"
      ? "#8B5CF6"
      : partnerName === "David"
      ? "#EF4444"
      : "#546DE5";

  const vestColor =
    partnerName === "Kenji"
      ? "#3B82F6"
      : partnerName === "Sarah"
      ? "#10B981"
      : partnerName === "Sofia"
      ? "#EC4899"
      : partnerName === "David"
      ? "#475569"
      : "#F39C12"; // Emma's warm yellow/mustard vest

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label={`AI Coach: ${partnerName} (${state})`}
    >
      {/* Soft Animated Aura Glow */}
      {showAura && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 pointer-events-none ${
            isSpeaking
              ? "bg-[#6C5CE7]/15 scale-125 animate-pulse"
              : isListening
              ? "bg-[#20BF6B]/15 scale-115"
              : isThinking
              ? "bg-[#755FE2]/10 scale-105"
              : "bg-[#F39C12]/10 scale-100"
          }`}
        />
      )}

      <svg
        viewBox="0 0 200 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-300"
      >
        {/* Thinking sparkles */}
        {isThinking && (
          <g className="animate-pulse">
            <circle cx="152" cy="40" r="3" fill="#6C5CE7" opacity="0.6" />
            <circle cx="162" cy="30" r="4.5" fill="#6C5CE7" opacity="0.8" />
            <circle cx="174" cy="18" r="6" fill="#6C5CE7" />
          </g>
        )}

        {/* Celebrating confetti */}
        {isCelebrating && (
          <g>
            <path d="M26 30L29 36L35 37L30 41L32 47L26 43L20 47L22 41L17 37L23 36Z" fill="#FBBF24" />
            <path d="M174 26L176 31L181 32L177 35L178 40L174 37L170 40L171 35L167 32L172 31Z" fill="#F43F5E" />
            <circle cx="98" cy="12" r="3.5" fill="#34D399" />
            <circle cx="34" cy="18" r="2.5" fill="#60A5FA" />
            <circle cx="166" cy="16" r="3" fill="#FBBF24" />
          </g>
        )}

        {/* Speaking sound waves from the pointer / coach */}
        {isSpeaking && (
          <g stroke="#6C5CE7" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M174 88 C179 84 179 76 174 72" />
            <path d="M181 94 C189 87 189 73 181 66" />
          </g>
        )}

        {/* Ears with clean human shape */}
        <circle cx="56" cy="94" r="10.5" fill="#F5C49B" />
        <circle cx="56" cy="94" r="5.5" fill="#E8B087" />
        <circle cx="144" cy="94" r="10.5" fill="#F5C49B" />
        <circle cx="144" cy="94" r="5.5" fill="#E8B087" />

        {/* Head Base (Friendly rounded shape) */}
        <rect x="62" y="48" width="76" height="92" rx="36" fill="#FCD7B0" />

        {/* Hair - Stylish coach hairstyle */}
        {isMale ? (
          // Neat modern short hair
          <path
            d="M58 84 C56 50 72 34 100 34 C128 34 144 50 142 84 C140 60 130 46 100 46 C70 46 60 60 58 84 Z"
            fill={hairColor}
          />
        ) : (
          // Chic coach bob with top hair volume and side bangs (Emma / female coach)
          <g>
            {/* Top hair bun / volume */}
            <circle cx="100" cy="30" r="17" fill={hairColor} />
            <circle cx="100" cy="30" r="6" fill="#FCD7B0" opacity="0.3" />

            {/* Hair frame */}
            <path
              d="M54 94 C50 50 68 34 100 34 C132 34 150 50 146 94 C144 64 134 46 100 46 C66 46 56 64 54 94 Z"
              fill={hairColor}
            />

            {/* Side bangs */}
            <path
              d="M62 48 C76 42 90 52 98 56 C84 56 70 54 62 48 Z"
              fill={hairColor}
            />
            <path
              d="M138 48 C124 42 110 52 102 56 C116 56 130 54 138 48 Z"
              fill={hairColor}
            />
          </g>
        )}

        {/* Red Glasses (Signature from dashboard mascot) */}
        <g>
          {/* Left Frame */}
          <rect
            x="68"
            y="78"
            width="28"
            height="20"
            rx="5.5"
            stroke={glassesColor}
            strokeWidth="3.5"
            fill="#FFFFFF"
            fillOpacity="0.45"
          />
          {/* Right Frame */}
          <rect
            x="104"
            y="78"
            width="28"
            height="20"
            rx="5.5"
            stroke={glassesColor}
            strokeWidth="3.5"
            fill="#FFFFFF"
            fillOpacity="0.45"
          />
          {/* Bridge */}
          <line x1="96" y1="87" x2="104" y2="87" stroke={glassesColor} strokeWidth="3.5" strokeLinecap="round" />
          {/* Temples to ears */}
          <line x1="58" y1="86" x2="68" y2="86" stroke={glassesColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="132" y1="86" x2="142" y2="86" stroke={glassesColor} strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Eyes inside glasses */}
        {isCelebrating ? (
          // Joyful arched eyes (^ ^)
          <g stroke="#3D271D" strokeWidth="2.8" strokeLinecap="round" fill="none">
            <path d="M75 88 Q82 82 89 88" />
            <path d="M111 88 Q118 82 125 88" />
          </g>
        ) : isThinking ? (
          // Inquisitive eyes looking up
          <g>
            <circle cx="82" cy="85" r="4.5" fill="#2C1810" />
            <circle cx="83.5" cy="83.5" r="1.5" fill="#FFFFFF" />
            <circle cx="118" cy="85" r="4.5" fill="#2C1810" />
            <circle cx="119.5" cy="83.5" r="1.5" fill="#FFFFFF" />
          </g>
        ) : isSpeaking ? (
          // Expressive smiling eyes during speech
          <g stroke="#3D271D" strokeWidth="2.8" strokeLinecap="round" fill="none">
            <path d="M76 88 Q82 83 88 88" />
            <path d="M112 88 Q118 83 124 88" />
          </g>
        ) : isListening ? (
          // Attentive listening eyes with bright pupil shine
          <g>
            <circle cx="82" cy="88" r="4.8" fill="#2C1810" />
            <circle cx="84" cy="86" r="1.8" fill="#FFFFFF" />
            <circle cx="118" cy="88" r="4.8" fill="#2C1810" />
            <circle cx="120" cy="86" r="1.8" fill="#FFFFFF" />
          </g>
        ) : (
          // Friendly gentle eyes
          <g>
            <circle cx="82" cy="88" r="4.5" fill="#2C1810" />
            <circle cx="83.5" cy="86.5" r="1.5" fill="#FFFFFF" />
            <circle cx="118" cy="88" r="4.5" fill="#2C1810" />
            <circle cx="119.5" cy="86.5" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Rosy Cheeks */}
        <ellipse cx="67" cy="101" rx="7" ry="4.5" fill="#F472B6" opacity="0.6" />
        <ellipse cx="133" cy="101" rx="7" ry="4.5" fill="#F472B6" opacity="0.6" />

        {/* Cute Human Nose */}
        <path d="M98 96 Q100 98 102 96" stroke="#C98B68" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Mouth with reactive states */}
        {isSpeaking ? (
          // Cheerful open speaking mouth with pink tongue
          <g>
            <path d="M92 105 C92 116 108 116 108 105 Z" fill="#2C1810" />
            <path d="M95 110 C97 115 103 115 105 110 Z" fill="#FB7185" />
          </g>
        ) : isListening ? (
          // Attentive gentle smile
          <path d="M94 106 Q100 110 106 106" stroke="#3D271D" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        ) : isCelebrating ? (
          // Big joyous grin
          <g>
            <path d="M90 104 C90 117 110 117 110 104 Z" fill="#2C1810" />
            <path d="M93 111 C96 116 104 116 107 111 Z" fill="#FB7185" />
          </g>
        ) : (
          // Warm welcoming smile
          <path d="M93 105 Q100 111 107 105" stroke="#3D271D" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        )}

        {/* Headset for Coach (Listening/Live Coach indicator) */}
        {isListening && (
          <g>
            <rect x="46" y="86" width="9" height="18" rx="4.5" fill="#6C5CE7" />
            <path d="M51 86 C51 44 149 44 149 86" stroke="#6C5CE7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M55 98 C64 104 74 108 84 106" stroke="#6C5CE7" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <circle cx="85" cy="106" r="3" fill="#6C5CE7" />
          </g>
        )}

        {/* Neck */}
        <rect x="92" y="132" width="16" height="14" fill="#F5C49B" />

        {/* White Shirt Collar */}
        <polygon points="90,140 100,150 96,155 84,144" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <polygon points="110,140 100,150 104,155 116,144" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

        {/* Suspenders & Vest (Dashboard mascot style) */}
        <path d="M64 152 Q100 159 136 152 L144 200 L56 200 Z" fill={vestColor} />
        {/* Dark suspender straps */}
        <line x1="78" y1="146" x2="78" y2="200" stroke="#4A3C44" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="122" y1="146" x2="122" y2="200" stroke="#4A3C44" strokeWidth="5.5" strokeLinecap="round" />

        {/* Blue Bowtie (Signature mascot design) */}
        <polygon points="87,144 100,150 87,156" fill={bowtieColor} />
        <polygon points="113,144 100,150 113,156" fill={bowtieColor} />
        <circle cx="100" cy="150" r="3.5" fill="#3DC1D3" />

        {/* Coach Pointer Stick & Hand (Dashboard mascot style) */}
        <g>
          {/* Pointer stick */}
          <line x1="138" y1="156" x2="168" y2="108" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
          <circle cx="168" cy="108" r="3.5" fill="#E74C3C" />
          {/* Cute hand holding the stick */}
          <circle cx="138" cy="158" r="7" fill="#FCD7B0" />
        </g>
      </svg>
    </div>
  );
}

