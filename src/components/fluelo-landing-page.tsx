"use client";

import { useState } from "react";
import Image from "next/image";
import type { MenuId } from "@/lib/fluelo-5menus";

interface FlueloLandingPageProps {
  onStartLearning: () => void;
  onSelectPartner?: (partnerId: string) => void;
  onSelectPath?: (menuId: MenuId) => void;
}

interface CardMeta {
  partnerId: string;
  menuId: MenuId;
  stepLabel: string;
  title: string;
  desc: string;
  bgVar: string;
  boxVar: string;
  baseRot: number;
  baseY: number;
}

const CARDS_DATA: CardMeta[] = [
  {
    partnerId: "partner-emma",
    menuId: 5,
    stepLabel: "Partner #1 • CEFR A2",
    title: "Emma\nDaily Casual",
    desc: "Teman bicara santai untuk obrolan harian, liburan, dan hobi tanpa rasa takut salah.",
    bgVar: "#67E8F9",
    boxVar: "rgba(14, 116, 144, 0.14)",
    baseRot: -5,
    baseY: 8,
  },
  {
    partnerId: "partner-sarah",
    menuId: 5,
    stepLabel: "Partner #2 • CEFR B1",
    title: "Sarah\nWorkplace & Meet",
    desc: "Latihan standup meeting, update progres kerja mingguan, dan komunikasi kantor.",
    bgVar: "#F497DA",
    boxVar: "rgba(157, 23, 77, 0.14)",
    baseRot: 3.5,
    baseY: -6,
  },
  {
    partnerId: "partner-david",
    menuId: 5,
    stepLabel: "Partner #3 • CEFR B2",
    title: "David\nInterview & Career",
    desc: "Simulasi wawancara kerja terstruktur dan persiapan tes TOEFL dengan timer respons 45d.",
    bgVar: "#FDE047",
    boxVar: "rgba(161, 98, 7, 0.14)",
    baseRot: -3,
    baseY: 6,
  },
  {
    partnerId: "partner-sofia",
    menuId: 5,
    stepLabel: "Partner #4 • CEFR B2",
    title: "Sofia\nSlang & Coffee Chat",
    desc: "Kuasai bahasa gaul natural, idiom populer, humor, dan percakapan santai ala penutur asli.",
    bgVar: "#C4B5FD",
    boxVar: "rgba(91, 33, 182, 0.14)",
    baseRot: 4,
    baseY: -4,
  },
  {
    partnerId: "partner-kenji",
    menuId: 5,
    stepLabel: "Partner #5 • CEFR C1",
    title: "Kenji\nTech & Strategy",
    desc: "Diskusi tingkat lanjut seputar arsitektur teknologi, produk, dan strategi bisnis fasih.",
    bgVar: "#86EFAC",
    boxVar: "rgba(21, 128, 61, 0.14)",
    baseRot: -3.5,
    baseY: 8,
  },
];

export function FlueloLandingPage({
  onStartLearning,
  onSelectPartner,
  onSelectPath,
}: FlueloLandingPageProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [parallax, setParallax] = useState<{ x: number; y: number; rot: number }>({
    x: 0,
    y: 0,
    rot: 0,
  });

  const handleMouseMove = (
    e: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    if (activeIndex !== index) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({
      x: relX * 10,
      y: relY * 8,
      rot: relX * 8,
    });
  };

  const handleCardClick = (card: CardMeta) => {
    if (onSelectPartner && card.partnerId) {
      onSelectPartner(card.partnerId);
    } else if (onSelectPath) {
      onSelectPath(card.menuId);
    } else {
      onStartLearning();
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-[#DDE2FC] via-[#E8E6FF] to-[#D5DCFA] p-5 sm:p-7 md:p-8">
      {/* Shell Container */}
      <main className="relative flex min-h-[760px] w-full max-w-[1320px] flex-col justify-between overflow-hidden rounded-[36px] bg-white p-7 shadow-[0_28px_70px_rgba(72,79,150,0.14),0_4px_16px_rgba(72,79,150,0.05)] sm:p-10 md:p-12">
        {/* Ambient Pastel Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-[8%] h-[180px] w-[320px] rounded-full bg-[#F5D0FE] opacity-65 blur-[55px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-10 h-[220px] w-[360px] rounded-full bg-[#DDD6FE] opacity-65 blur-[55px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 left-[5%] h-[180px] w-[380px] rounded-full bg-[#BAE6FD] opacity-65 blur-[55px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 right-[10%] h-[180px] w-[360px] rounded-full bg-[#FBCFE8] opacity-65 blur-[55px]"
        />

        {/* TOP BAR: Fluelo di Kiri Atas */}
        <header className="relative z-10 mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-3 select-none">
            {/* Logo Fluelo Asli */}
            <div className="flex size-11 items-center justify-center rounded-[14px] bg-[#1B1A22] p-2 shadow-[0_8px_18px_rgba(27,26,34,0.18)] transition-transform duration-300 hover:scale-105 hover:-rotate-6">
              <Image
                src="/fluelo-mark-transparent.png"
                alt="Logo Fluelo"
                width={30}
                height={26}
                className="size-full object-contain"
                priority
                unoptimized
              />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#181823]">
              Fluelo
            </span>
          </div>

          <div className="rounded-full border-[1.5px] border-[#D8DCFF] bg-[#F4F5FF] px-4 py-2 text-xs font-bold text-[#6C5CE7] shadow-2xs">
            Talk to AI • Suara Real-Time 2 Arah
          </div>
        </header>

        {/* HERO TITLE: Selamat Datang di Fluelo */}
        <section className="relative z-10 mt-1.5 mb-7 flex flex-wrap items-start gap-7">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#181823] sm:text-5xl lg:text-[54px] leading-[1.08]">
            Selamat Datang di Fluelo
          </h1>

          {/* Catatan kecil bergaya tulisan tangan (Caveat font) */}
          <div className="relative -mt-1 flex flex-col items-start select-none">
            <span className="font-caveat text-[22px] font-bold text-[#E11D48] leading-none -rotate-6">
              Sentuh kartu untuk
              <br />
              memilih lawan bicaramu
            </span>
            <svg
              className="mt-1 ml-3 text-[#181823]"
              width="68"
              height="32"
              viewBox="0 0 68 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M62 4 C44 2, 24 10, 6 28"
                stroke="#181823"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </section>

        {/* 5 INTERACTIVE SPEAKING PARTNER CARDS DECK */}
        <section className="relative z-20 flex items-center justify-center px-3 py-6 sm:py-8">
          <div
            id="cardsDeck"
            onMouseLeave={() => {
              setActiveIndex(null);
              setParallax({ x: 0, y: 0, rot: 0 });
            }}
            className="flex w-full max-w-[1180px] flex-wrap items-center justify-center lg:flex-nowrap"
          >
            {CARDS_DATA.map((card, i) => {
              const isActive = activeIndex === i;
              const hasActive = activeIndex !== null;

              // Calculate dynamic transforms
              let transformStyle = `translate3d(0px, ${card.baseY}px, 0) scale(1) rotate(${card.baseRot}deg)`;
              let zIndex = i + 1;

              if (hasActive) {
                if (isActive) {
                  zIndex = 25;
                  const finalY = -22 + parallax.y;
                  const finalRot = card.baseRot * 0.35 + parallax.rot;
                  transformStyle = `translate3d(${parallax.x}px, ${finalY}px, 0) scale(1.06) rotate(${finalRot}deg)`;
                } else {
                  const distance = i - activeIndex;
                  const direction = distance < 0 ? -1 : 1;
                  const shiftX = direction * (46 + Math.abs(distance) * 8);
                  const tiltRot = card.baseRot + direction * 3.5;
                  zIndex = 10 - Math.abs(distance);
                  transformStyle = `translate3d(${shiftX}px, ${card.baseY + 4}px, 0) scale(0.98) rotate(${tiltRot}deg)`;
                }
              }

              return (
                <article
                  key={card.partnerId}
                  onClick={() => handleCardClick(card)}
                  onMouseEnter={() => {
                    setActiveIndex(i);
                    setParallax({ x: 0, y: 0, rot: 0 });
                  }}
                  onMouseMove={(e) => handleMouseMove(e, i)}
                  onTouchStart={() => setActiveIndex(i)}
                  style={{
                    backgroundColor: card.bgVar,
                    transform: transformStyle,
                    zIndex,
                    transformOrigin: "center bottom",
                  }}
                  className={`group relative flex h-[360px] w-[248px] cursor-pointer flex-col justify-between rounded-[24px] border-2 border-white/45 p-5 text-left transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] select-none will-change-transform ${
                    i > 0 ? "max-lg:mt-4 lg:-ml-7" : ""
                  } ${
                    isActive
                      ? "shadow-[0_28px_55px_rgba(24,24,35,0.22)]"
                      : "shadow-[0_18px_38px_rgba(24,24,35,0.12),0_2px_6px_rgba(24,24,35,0.06)]"
                  }`}
                >
                  {/* Bagian Atas Kartu: Label Partner & Level */}
                  <div className="text-center text-[13px] font-extrabold tracking-tight text-[#181823]">
                    {card.stepLabel}
                  </div>

                  {/* Bagian Tengah Kartu: Ilustrasi Vektor Kontras Tinggi */}
                  <div
                    className={`flex flex-1 items-center justify-center py-2 transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isActive ? "scale-108 -translate-y-1" : ""
                    }`}
                  >
                    {renderCardIllustration(card.partnerId)}
                  </div>

                  {/* Bagian Bawah Kartu: Judul & Kotak Deskripsi */}
                  <div className="flex flex-col gap-2">
                    <h2 className="text-[22px] font-extrabold leading-[1.08] tracking-tight text-[#181823] whitespace-pre-line">
                      {card.title}
                    </h2>
                    <div
                      style={{ backgroundColor: card.boxVar }}
                      className="rounded-[12px] p-2.5 px-3 text-[11px] font-semibold leading-[1.42] text-[#181823]"
                    >
                      {card.desc}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <footer className="relative z-10 mt-4 flex flex-col items-center justify-center gap-3.5 text-center">
          <p className="text-sm font-semibold text-[#5E6072]">
            Praktik bicara bahasa Inggris 1-on-1 suara real-time bersama AI kapan saja
          </p>
          <button
            type="button"
            onClick={onStartLearning}
            className="cursor-pointer rounded-full bg-[#1B1A22] px-9 py-4 text-base font-bold tracking-tight text-white shadow-[0_14px_30px_rgba(27,26,34,0.2)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-103 hover:bg-[#6C5CE7] hover:shadow-[0_18px_36px_rgba(108,92,231,0.32)] active:translate-y-0 active:scale-99"
          >
            Mulai Bicara Sekarang
          </button>
        </footer>
      </main>
    </div>
  );
}

function renderCardIllustration(partnerId: string) {
  switch (partnerId) {
    case "partner-emma":
      // Emma: Casual & Friendly Microphone with Heart & Audio Wave
      return (
        <svg width="120" height="115" viewBox="0 0 120 115" fill="none">
          <rect
            x="48"
            y="26"
            width="24"
            height="44"
            rx="12"
            fill="#181823"
          />
          <path
            d="M34 50 C34 66 46 76 60 76 C74 76 86 66 86 50"
            stroke="#181823"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line x1="60" y1="76" x2="60" y2="94" stroke="#181823" strokeWidth="4" strokeLinecap="round" />
          <line x1="42" y1="94" x2="78" y2="94" stroke="#181823" strokeWidth="4" strokeLinecap="round" />
          {/* Friendly Chat Bubble */}
          <rect
            x="72"
            y="18"
            width="32"
            height="24"
            rx="8"
            fill="#FFFFFF"
            fillOpacity="0.75"
            stroke="#181823"
            strokeWidth="2.5"
          />
          <path
            d="M80 30 C80 27 84 25 88 28 C92 25 96 27 96 30 C96 34 88 38 88 38 C88 38 80 34 80 30 Z"
            fill="#E11D48"
          />
        </svg>
      );

    case "partner-sarah":
      // Sarah: Workplace Briefcase & Meeting Waveform
      return (
        <svg width="120" height="115" viewBox="0 0 120 115" fill="none">
          {/* Briefcase */}
          <rect
            x="24"
            y="42"
            width="72"
            height="48"
            rx="8"
            fill="#181823"
          />
          <path
            d="M44 42 V32 C44 28 50 26 60 26 C70 26 76 28 76 32 V42"
            stroke="#181823"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line x1="24" y1="58" x2="96" y2="58" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.6" />
          <rect x="54" y="52" width="12" height="12" rx="3" fill="#F59E0B" />
          {/* Sound bars on top */}
          <line x1="40" y1="20" x2="40" y2="10" stroke="#181823" strokeWidth="3" strokeLinecap="round" />
          <line x1="48" y1="22" x2="48" y2="6" stroke="#181823" strokeWidth="3" strokeLinecap="round" />
          <line x1="56" y1="20" x2="56" y2="12" stroke="#181823" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "partner-david":
      // David: Interview Stopwatch Timer (45s) & Career Podium
      return (
        <svg width="120" height="115" viewBox="0 0 120 115" fill="none">
          {/* Timer Clock Ring */}
          <circle
            cx="60"
            cy="56"
            r="34"
            fill="#FFFFFF"
            fillOpacity="0.55"
            stroke="#181823"
            strokeWidth="4"
          />
          <line x1="60" y1="56" x2="60" y2="34" stroke="#181823" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="60" y1="56" x2="76" y2="56" stroke="#181823" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="60" cy="56" r="4.5" fill="#181823" />
          {/* Top Stop Button */}
          <line x1="60" y1="22" x2="60" y2="14" stroke="#181823" strokeWidth="4" strokeLinecap="round" />
          <line x1="52" y1="14" x2="68" y2="14" stroke="#181823" strokeWidth="3" strokeLinecap="round" />
          {/* 45s Badge */}
          <rect x="76" y="24" width="28" height="18" rx="6" fill="#181823" />
          <text x="90" y="37" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">45s</text>
        </svg>
      );

    case "partner-sofia":
      // Sofia: Cozy Coffee Mug & Slang Star Speech Bubble
      return (
        <svg width="120" height="115" viewBox="0 0 120 115" fill="none">
          {/* Coffee Mug */}
          <rect
            x="32"
            y="48"
            width="44"
            height="44"
            rx="10"
            fill="#181823"
          />
          {/* Mug Handle */}
          <path
            d="M76 56 C88 56 88 78 76 78"
            stroke="#181823"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Steam */}
          <path
            d="M42 38 Q46 30 42 22"
            stroke="#181823"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M54 38 Q58 28 54 18"
            stroke="#181823"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Slang Star Bubble */}
          <rect
            x="64"
            y="16"
            width="34"
            height="24"
            rx="7"
            fill="#FFFFFF"
            fillOpacity="0.75"
            stroke="#181823"
            strokeWidth="2.5"
          />
          <polygon
            points="81,22 83,26 87,27 84,30 85,34 81,32 77,34 78,30 75,27 79,26"
            fill="#8B5CF6"
          />
        </svg>
      );

    case "partner-kenji":
      // Kenji: Tech Terminal & Strategy Soundwaves
      return (
        <svg width="120" height="115" viewBox="0 0 120 115" fill="none">
          {/* Terminal Screen */}
          <rect
            x="24"
            y="26"
            width="72"
            height="52"
            rx="8"
            fill="#FFFFFF"
            fillOpacity="0.45"
            stroke="#181823"
            strokeWidth="3.5"
          />
          <line x1="24" y1="40" x2="96" y2="40" stroke="#181823" strokeWidth="2" />
          <circle cx="34" cy="33" r="2.5" fill="#181823" />
          <circle cx="42" cy="33" r="2.5" fill="#181823" />
          <circle cx="50" cy="33" r="2.5" fill="#181823" />
          {/* Code Prompt >_ */}
          <path d="M34 50 L42 56 L34 62" stroke="#181823" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="48" y1="62" x2="62" y2="62" stroke="#181823" strokeWidth="2.5" strokeLinecap="round" />
          {/* Stand */}
          <path d="M48 78 L42 94 H78 L72 78 Z" fill="#181823" />
        </svg>
      );

    default:
      return null;
  }
}

