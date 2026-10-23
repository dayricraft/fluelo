"use client";

import Image from "next/image";

interface FlueloLogoIconProps {
  size?: number;
  className?: string;
}

/**
 * Fluelo Logo Icon (Book with speech-bubble tail mark)
 * Extracted directly from public/fluelo-logo.jpg.
 */
export function FlueloLogoIcon({ size = 36, className = "" }: FlueloLogoIconProps) {
  const height = Math.round((size * 208) / 248);
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height }}
    >
      <Image
        src="/fluelo-mark-transparent.png"
        alt="Fluelo Logo"
        width={size}
        height={height}
        className="size-full object-contain"
        priority
        unoptimized
      />
    </span>
  );
}

interface FlueloBrandProps {
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark" | "navy";
  showTagline?: boolean;
  className?: string;
}

/**
 * Fluelo Official Brand Logo (Mark + Wordmark)
 * Extracted directly from public/fluelo-logo.jpg.
 */
export function FlueloBrand({
  size = "md",
  theme = "navy",
  showTagline = false,
  className = "",
}: FlueloBrandProps) {
  const dimensions = {
    sm: { width: 92, height: 28, heightClass: "h-7" },
    md: { width: 118, height: 36, heightClass: "h-9" },
    lg: { width: 144, height: 44, heightClass: "h-11" },
  }[size];

  // fluelo-logo-transparent.png works on navy, dark, and transparent backgrounds.
  const src = theme === "navy" ? "/fluelo-logo-navy.png" : "/fluelo-logo-transparent.png";

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <Image
        src={src}
        alt="Fluelo"
        width={dimensions.width}
        height={dimensions.height}
        className={`${dimensions.heightClass} w-auto object-contain shrink-0`}
        priority
        unoptimized
      />
      {showTagline && (
        <span className="hidden xl:inline-block pl-2 border-l border-white/20 text-[10px] font-extrabold tracking-wider text-teal-300 uppercase whitespace-nowrap">
          English Voice Coach
        </span>
      )}
    </div>
  );
}
