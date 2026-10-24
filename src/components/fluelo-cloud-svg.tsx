"use client";

import React, { useId } from "react";

const CLOUD_PATH =
  "M 18 152 C 18 116 48 96 76 105 C 94 74 140 72 164 98 C 194 98 216 122 212 152 C 228 164 230 192 214 212 L 22 212 Z";

export interface FlueloCloudSVGProps {
  name: string; // 'Sarah' | 'Emma' | 'Sophia' | 'David' | 'Kenji'
  size?: number;
  isSpeaking?: boolean;
  float?: boolean;
  blink?: boolean;
  className?: string;
  staticId?: string;
}

export function FlueloCloudSVG({
  name,
  size = 160,
  isSpeaking = false,
  float = false,
  blink = true,
  className = "",
  staticId,
}: FlueloCloudSVGProps) {
  const reactId = useId().replace(/:/g, "_");
  const id = staticId || `${name.toLowerCase()}_${reactId}`;

  const animClass = isSpeaking
    ? "cloud-speaking"
    : float
    ? "cloud-float"
    : "";
  const blinkClass = blink ? "cloud-blink" : "";
  const combinedClass = [animClass, className].filter(Boolean).join(" ");

  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  if (normalized === "Sarah") {
    // 1. SARAH: Sunny Day Cloud (Blue-to-Lime squircle, yellow sun tucked top-left, warm orange glow, big round eyes)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <defs>
          <clipPath id={`sq_${id}`}>
            <rect x="16" y="16" width="208" height="208" rx="54" />
          </clipPath>
          <linearGradient id={`bg_${id}`} x1="20" y1="20" x2="215" y2="215" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0D99FF" />
            <stop offset="48%" stopColor="#7EE8B8" />
            <stop offset="100%" stopColor="#ECFA8C" />
          </linearGradient>
          <linearGradient id={`sun_${id}`} x1="40" y1="45" x2="115" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF147" />
            <stop offset="100%" stopColor="#FFAE19" />
          </linearGradient>
          <linearGradient id={`cloud_${id}`} x1="120" y1="78" x2="135" y2="224" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
            <stop offset="55%" stopColor="#E8F9C8" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#D4F5B4" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id={`eyeRim_${id}`} cx="45%" cy="40%" r="58%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="76%" stopColor="#F2F9FC" />
            <stop offset="100%" stopColor="#CBE4F0" />
          </radialGradient>
          <filter id={`glow_${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <g clipPath={`url(#sq_${id})`}>
          <rect x="16" y="16" width="208" height="208" fill={`url(#bg_${id})`} />
          <circle cx="72" cy="94" r="46" fill={`url(#sun_${id})`} />
          <path d={CLOUD_PATH} fill={`url(#cloud_${id})`} />
          <circle cx="76" cy="112" r="38" fill="#FFB82E" opacity="0.68" filter={`url(#glow_${id})`} />
          <circle cx="118" cy="166" r="44" fill="#9AE6B4" opacity="0.45" filter={`url(#glow_${id})`} />
          <path d={CLOUD_PATH} stroke="#FFFFFF" strokeOpacity="0.78" strokeWidth="3.5" fill="none" />
          <g className={blinkClass}>
            <circle cx="64" cy="162" r="24" fill={`url(#eyeRim_${id})`} />
            <circle cx="114" cy="162" r="24" fill={`url(#eyeRim_${id})`} />
            <circle cx="65" cy="162" r="12.5" fill="#0B0E14" />
            <circle cx="115" cy="162" r="12.5" fill="#0B0E14" />
          </g>
        </g>
      </svg>
    );
  }

  if (normalized === "Emma") {
    // 2. EMMA: Sky Visor Cloud (Vibrant Blue squircle, recessed dark-blue visor slot, angled cheek fold)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <defs>
          <clipPath id={`sq_${id}`}>
            <rect x="16" y="16" width="208" height="208" rx="54" />
          </clipPath>
          <clipPath id={`visorClip_${id}`}>
            <rect x="64" y="128" width="108" height="54" rx="27" transform="rotate(-5 118 155)" />
          </clipPath>
          <linearGradient id={`bg_${id}`} x1="25" y1="20" x2="210" y2="215" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0084FF" />
            <stop offset="100%" stopColor="#76B7FF" />
          </linearGradient>
          <linearGradient id={`cloud_${id}`} x1="120" y1="76" x2="120" y2="224" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
            <stop offset="48%" stopColor="#87C8FF" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#D6EDFF" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id={`cheek_${id}`} x1="90" y1="158" x2="180" y2="218" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6EB8FF" />
            <stop offset="55%" stopColor="#B5DDFF" />
            <stop offset="100%" stopColor="#E6F4FF" />
          </linearGradient>
          <filter id={`glow_${id}`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <g clipPath={`url(#sq_${id})`}>
          <rect x="16" y="16" width="208" height="208" fill={`url(#bg_${id})`} />
          <path d={CLOUD_PATH} fill={`url(#cloud_${id})`} />
          <ellipse cx="122" cy="142" rx="64" ry="36" fill="#4BA8FF" opacity="0.45" filter={`url(#glow_${id})`} />
          <path d={CLOUD_PATH} stroke="#FFFFFF" strokeOpacity="0.82" strokeWidth="3.5" fill="none" />
          <rect
            x="64"
            y="128"
            width="108"
            height="54"
            rx="27"
            transform="rotate(-5 118 155)"
            fill="#184B78"
            stroke="#85C7FF"
            strokeWidth="2.2"
          />
          <g clipPath={`url(#visorClip_${id})`} className={blinkClass}>
            <circle cx="93" cy="158" r="24" fill="#FFFFFF" />
            <circle cx="141" cy="154" r="22" fill="#FFFFFF" />
            <circle cx="94" cy="158" r="13.5" fill="#07090E" />
            <circle cx="140" cy="155" r="13" fill="#07090E" />
          </g>
          <path d="M 88 184 L 182 162 C 194 176 192 214 168 220 L 76 220 Z" fill={`url(#cheek_${id})`} />
          <path d="M 96 180 L 172 163" stroke="#BEE1FF" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (normalized === "Sophia") {
    // 3. SOPHIA: Night Crescent Cloud (Deep Cobalt-Navy squircle, pale lavender crescent moon top-left, icy glow)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <defs>
          <clipPath id={`sq_${id}`}>
            <rect x="16" y="16" width="208" height="208" rx="54" />
          </clipPath>
          <linearGradient id={`bg_${id}`} x1="20" y1="20" x2="220" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0077E6" />
            <stop offset="100%" stopColor="#022954" />
          </linearGradient>
          <linearGradient id={`cloud_${id}`} x1="120" y1="78" x2="128" y2="224" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DCEEFF" stopOpacity="0.92" />
            <stop offset="50%" stopColor="#4B88B8" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#6989A3" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id={`eyeRim_${id}`} cx="45%" cy="40%" r="58%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="76%" stopColor="#EDF6FC" />
            <stop offset="100%" stopColor="#B9D7EC" />
          </radialGradient>
          <filter id={`glow_${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
        </defs>
        <g clipPath={`url(#sq_${id})`}>
          <rect x="16" y="16" width="208" height="208" fill={`url(#bg_${id})`} />
          <path
            d="M 74 38 C 46 62 46 108 78 130 C 102 146 136 138 152 114 C 122 122 92 106 86 78 C 82 60 86 46 74 38 Z"
            fill="#EFE8FF"
          />
          <path d={CLOUD_PATH} fill={`url(#cloud_${id})`} />
          <path
            d="M 62 112 C 84 132 126 130 152 106"
            stroke="#A6D8FF"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.65"
            filter={`url(#glow_${id})`}
          />
          <path d={CLOUD_PATH} stroke="#E3F2FF" strokeOpacity="0.72" strokeWidth="3.2" fill="none" />
          <g className={blinkClass}>
            <circle cx="94" cy="162" r="24" fill={`url(#eyeRim_${id})`} />
            <circle cx="146" cy="162" r="24" fill={`url(#eyeRim_${id})`} />
            <circle cx="95" cy="163" r="12.5" fill="#07090E" />
            <circle cx="147" cy="163" r="12.5" fill="#07090E" />
          </g>
        </g>
      </svg>
    );
  }

  if (normalized === "David") {
    // 4. DAVID: Coral Star Cloud (Coral-to-Peach squircle, soft rounded star top-left, cocoa visor slot)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={combinedClass}
      >
        <defs>
          <clipPath id={`sq_${id}`}>
            <rect x="16" y="16" width="208" height="208" rx="54" />
          </clipPath>
          <clipPath id={`visorClip_${id}`}>
            <rect x="64" y="126" width="110" height="56" rx="28" transform="rotate(-4 119 154)" />
          </clipPath>
          <linearGradient id={`bg_${id}`} x1="20" y1="20" x2="215" y2="215" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF666E" />
            <stop offset="100%" stopColor="#FFA97A" />
          </linearGradient>
          <linearGradient id={`cloud_${id}`} x1="120" y1="78" x2="125" y2="224" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFDFB" stopOpacity="0.97" />
            <stop offset="52%" stopColor="#FFD0B5" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#FFE6D6" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id={`cheek_${id}`} x1="90" y1="158" x2="180" y2="218" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFA686" />
            <stop offset="55%" stopColor="#FFD2BA" />
            <stop offset="100%" stopColor="#FFF0E6" />
          </linearGradient>
          <filter id={`glow_${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
        </defs>
        <g clipPath={`url(#sq_${id})`}>
          <rect x="16" y="16" width="208" height="208" fill={`url(#bg_${id})`} />
          <path
            d="M 88 46 L 100 66 L 122 70 L 106 86 L 110 108 L 88 98 L 66 108 L 70 86 L 54 70 L 76 66 Z"
            fill="#FFF099"
            stroke="#FFE36E"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path d={CLOUD_PATH} fill={`url(#cloud_${id})`} />
          <circle cx="88" cy="100" r="30" fill="#FFE875" opacity="0.68" filter={`url(#glow_${id})`} />
          <path d={CLOUD_PATH} stroke="#FFFFFF" strokeOpacity="0.82" strokeWidth="3.5" fill="none" />
          <rect
            x="64"
            y="126"
            width="110"
            height="56"
            rx="28"
            transform="rotate(-4 119 154)"
            fill="#6E3F33"
            stroke="#FFC5A8"
            strokeWidth="2.2"
          />
          <g clipPath={`url(#visorClip_${id})`} className={blinkClass}>
            <circle cx="93" cy="156" r="24" fill="#FFFFFF" />
            <circle cx="142" cy="153" r="23" fill="#FFFFFF" />
            <circle cx="96" cy="154" r="12.5" fill="#0B090A" />
            <circle cx="89" cy="150" r="3.2" fill="#FFFFFF" />
            <circle cx="144" cy="152" r="12.5" fill="#0B090A" />
            <circle cx="137" cy="148" r="3.2" fill="#FFFFFF" />
          </g>
          <path d="M 88 184 L 182 162 C 194 176 192 214 168 220 L 76 220 Z" fill={`url(#cheek_${id})`} />
          <ellipse cx="126" cy="182" rx="22" ry="9" fill="#FF7E6B" opacity="0.45" filter={`url(#glow_${id})`} />
          <path d="M 96 180 L 172 163" stroke="#FFE3D3" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // 5. KENJI: Lavender-Mint Lightning Cloud (Purple-Lavender to Aqua-Mint squircle, yellow lightning bolt, slate visor)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={combinedClass}
    >
      <defs>
        <clipPath id={`sq_${id}`}>
          <rect x="16" y="16" width="208" height="208" rx="54" />
        </clipPath>
        <clipPath id={`visorClip_${id}`}>
          <rect x="64" y="128" width="108" height="54" rx="27" transform="rotate(-5 118 155)" />
        </clipPath>
        <linearGradient id={`bg_${id}`} x1="20" y1="30" x2="220" y2="205" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B892FF" />
          <stop offset="52%" stopColor="#8EC5FC" />
          <stop offset="100%" stopColor="#6EE7CF" />
        </linearGradient>
        <linearGradient id={`cloud_${id}`} x1="35" y1="90" x2="205" y2="215" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F6F2FF" stopOpacity="0.96" />
          <stop offset="48%" stopColor="#D7E6FF" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#9BF2DF" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`cheek_${id}`} x1="88" y1="160" x2="185" y2="215" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C8CCFF" />
          <stop offset="100%" stopColor="#A8F2E2" />
        </linearGradient>
        <filter id={`glow_${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <g clipPath={`url(#sq_${id})`}>
        <rect x="16" y="16" width="208" height="208" fill={`url(#bg_${id})`} />
        <path
          d="M 96 42 L 66 86 L 90 88 L 78 122 L 116 74 L 92 72 Z"
          fill="#FFEE82"
          stroke="#FFE66D"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d={CLOUD_PATH} fill={`url(#cloud_${id})`} />
        <circle cx="88" cy="102" r="24" fill="#FFF088" opacity="0.58" filter={`url(#glow_${id})`} />
        <path d={CLOUD_PATH} stroke="#FFFFFF" strokeOpacity="0.82" strokeWidth="3.5" fill="none" />
        <rect
          x="64"
          y="128"
          width="108"
          height="54"
          rx="27"
          transform="rotate(-5 118 155)"
          fill="#5E6E8C"
          stroke="#D7E8FF"
          strokeWidth="2.2"
        />
        <g clipPath={`url(#visorClip_${id})`} className={blinkClass}>
          <circle cx="93" cy="158" r="24" fill="#FFFFFF" />
          <circle cx="141" cy="154" r="22" fill="#FFFFFF" />
          <circle cx="94" cy="158" r="13.5" fill="#07090E" />
          <circle cx="140" cy="155" r="13" fill="#07090E" />
        </g>
        <path d="M 88 184 L 182 162 C 194 176 192 214 168 220 L 76 220 Z" fill={`url(#cheek_${id})`} />
        <path d="M 96 180 L 172 163" stroke="#E6F7FF" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
