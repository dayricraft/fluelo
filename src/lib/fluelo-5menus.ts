"use client";

import { useSyncExternalStore } from "react";
import type { CefrLevel } from "./levels";

export type MenuId = 0 | 1 | 2 | 3 | 4 | 5;

export interface FlueloMenuMeta {
  id: MenuId;
  shortLabel: string;
  pillLabel: string;
  title: string;
  subtitle: string;
  bannerHtml: string;
  badgeColor: string;
}

export const FLUELO_MENUS: Record<MenuId, FlueloMenuMeta> = {
  0: {
    id: 0,
    shortLabel: "Dashboard",
    pillLabel: "Dashboard",
    title: "Dashboard",
    subtitle: "Kurikulum Fokus 5 Menu Harian Fluelo",
    bannerHtml:
      "Kurikulum Fokus 5 Menu Harian Fluelo",
    badgeColor: "#6C5CE7",
  },
  1: {
    id: 1,
    shortLabel: "CEFR",
    pillLabel: "CEFR",
    title: "Uji Level",
    subtitle: "Common European Framework of Reference for Languages (Standar Internasional Pemetaan Kemahiran Bahasa)",
    bannerHtml:
      "Tentukan target level kemampuanmu atau ikuti alur tes penempatan di bawah ini",
    badgeColor: "#555CE0",
  },
  2: {
    id: 2,
    shortLabel: "Kosakata",
    pillLabel: "Kosakata",
    title: "Ayo Berlatih",
    subtitle: "",
    bannerHtml:
      "Pilih kategori percakapan untuk menguji kosakata dan melatih pelafalan interaktif",
    badgeColor: "#E28739",
  },
  3: {
    id: 3,
    shortLabel: "Tenses",
    pillLabel: "Tenses",
    title: "3 Tenses Utama",
    subtitle: "Simple Present, Simple Past, dan Simple Future untuk Komunikasi Kantor",
    bannerHtml:
      "Kuasai Simple Present, Simple Past, dan Simple Future untuk kebutuhan komunikasi kantor",
    badgeColor: "#755FE2",
  },
  4: {
    id: 4,
    shortLabel: "Shadowing",
    pillLabel: "Shadowing",
    title: "Shadowing & Comprehensible Input",
    subtitle: "Dengarkan Audio 15 Menit Sehari dan Tirukan Pengucapannya Secara Langsung",
    bannerHtml:
      "Dengarkan audio bahasa Inggris 15 menit sehari dan tirukan pengucapannya secara langsung",
    badgeColor: "#D97706",
  },
  5: {
    id: 5,
    shortLabel: "Talk to AI",
    pillLabel: "Talk to AI",
    title: "Latihan Bicara 1-on-1 AI",
    subtitle: "Praktik Bicara Dua Arah Real-Time bersama Emma, Sarah, dan Partner AI Selevel",
    bannerHtml:
      "Latihan one-to-one speaking real-time bersama Emma, Sarah, dan partner AI sesuai level CEFR kamu",
    badgeColor: "#4F46E5",
  },
};

/* ============================================================================
 * MENU 1: CEFR DIAGNOSTIC QUIZ (COMPLEMENTS 1-ON-1 AI VOICE PLACEMENT TEST)
 * ========================================================================== */

export interface CefrDiagnosticQuestion {
  id: string;
  targetLevel: CefrLevel;
  context: string;
  question: string;
  options: readonly string[];
  answer: string;
  explanation: string;
}

export const CEFR_DIAGNOSTIC_QUESTIONS: readonly CefrDiagnosticQuestion[] = [
  {
    id: "diag-1",
    targetLevel: "A1",
    context: "Perkenalan hari pertama di divisi operasional",
    question: "Hello, I ___ Ahmad from the operations team. Nice to meet you.",
    options: ["am", "is", "are", "be"],
    answer: "am",
    explanation: "Subjek 'I' pada Simple Present selalu berpasangan dengan to-be 'am'.",
  },
  {
    id: "diag-2",
    targetLevel: "A1",
    context: "Menyampaikan jam operasional kerja harian",
    question: "Our office hours ___ at 9:00 AM every Monday to Friday.",
    options: ["start", "starts", "starting", "started"],
    answer: "start",
    explanation: "Subjek jamak ('office hours') menggunakan kata kerja bentuk dasar 'start' pada Simple Present.",
  },
  {
    id: "diag-3",
    targetLevel: "A2",
    context: "Melaporkan pengiriman laporan kerja kemarin",
    question: "Yesterday afternoon, our team ___ the weekly progress report to the manager.",
    options: ["sent", "send", "sending", "sends"],
    answer: "sent",
    explanation: "Keterangan waktu lampau ('Yesterday afternoon') memerlukan Simple Past (Verb 2: sent).",
  },
  {
    id: "diag-4",
    targetLevel: "A2",
    context: "Mengirim berkas invoice melalui email",
    question: "Please find the invoice ___ to this email for your review.",
    options: ["attached", "attach", "attaching", "attachment"],
    answer: "attached",
    explanation: "Frasa standar korespondensi email kantor adalah 'Please find ... attached' (participle adjective).",
  },
  {
    id: "diag-5",
    targetLevel: "B1",
    context: "Menyampaikan rencana follow-up setelah meeting",
    question: "I will ___ up with the client tomorrow morning regarding the contract details.",
    options: ["follow", "followed", "following", "follows"],
    answer: "follow",
    explanation: "Setelah modal verb 'will' (Simple Future), selalu gunakan kata kerja bentuk pertama 'follow' (follow up).",
  },
  {
    id: "diag-6",
    targetLevel: "B1",
    context: "Mengonfirmasi ketersediaan jadwal meeting sinkronisasi",
    question: "Are you ___ for a quick 15-minute sync meeting this Thursday at 2 PM?",
    options: ["available", "capable", "possible", "visible"],
    answer: "available",
    explanation: "'Available' adalah kata sifat profesional yang umum digunakan untuk menanyakan ketersediaan waktu rekan kerja.",
  },
  {
    id: "diag-7",
    targetLevel: "B2",
    context: "Menjelaskan kendala teknis dan memundurkan tenggat waktu",
    question: "Could we ___ the project deadline by two days to ensure accurate data validation?",
    options: ["extend", "expand", "enlarge", "increase"],
    answer: "extend",
    explanation: "Kolokasi bisnis yang tepat untuk memundurkan tenggat waktu adalah 'extend the deadline'.",
  },
  {
    id: "diag-8",
    targetLevel: "B2",
    context: "Mempresentasikan pencapaian kuartal tim kepada pimpinan",
    question: "Our team has ___ all quarterly targets despite the tight turnaround schedule.",
    options: ["exceeded", "overflowed", "overloaded", "exaggerated"],
    answer: "exceeded",
    explanation: "Dalam konteks performa bisnis, 'exceed targets' adalah kolokasi baku untuk melampaui target yang ditetapkan.",
  },
  {
    id: "diag-9",
    targetLevel: "C1",
    context: "Sinkronisasi strategi dan roadmap lintas divisi",
    question: "To eliminate delivery bottlenecks, we need to ___ our Q4 deliverables with engineering.",
    options: ["align", "attach", "adjust", "assign"],
    answer: "align",
    explanation: "'Align deliverables with...' adalah istilah kepemimpinan operasional untuk menyelaraskan target output kerja.",
  },
  {
    id: "diag-10",
    targetLevel: "C2",
    context: "Evaluasi risiko skala strategis tingkat eksekutif",
    question: "While user adoption looks promising, executive leadership must ___ operational risks before scaling nationwide.",
    options: ["mitigate", "diminish", "soften", "relieve"],
    answer: "mitigate",
    explanation: "'Mitigate risks' adalah kolokasi manajerial tingkat mahir (C2) untuk menganalisis dan menanggulangi dampak risiko bisnis.",
  },
];

/* ============================================================================
 * MENU 2: KOSAKATA (1000 KOSAKATA: KANTOR & SEHARI-HARI)
 * ========================================================================== */

import {
  VOCAB_CATEGORIES,
  ACTIVE_VOCAB_ITEMS,
  ACTIVE_VOCAB_500,
  type VocabCategory,
  type ActiveVocabItem,
} from "./fluelo-vocab-data";

export {
  VOCAB_CATEGORIES,
  ACTIVE_VOCAB_ITEMS,
  ACTIVE_VOCAB_500,
  type VocabCategory,
  type ActiveVocabItem,
};

/* ============================================================================
 * MENU 3: 3 CORE TENSES FOR OFFICE COMMUNICATION
 * ========================================================================== */

export interface OfficeTenseDrill {
  id: string;
  promptId: string;
  sentenceWithBlank: string;
  options: readonly string[];
  answer: string;
  explanation: string;
  context?: string;
  before?: string;
  after?: string;
  tip?: string;
}

export interface TenseFormulaItem {
  type: string;
  cls: "pos" | "neg" | "ask";
  pattern: string;
  sample: string;
}

export interface TenseExampleItem {
  tag: string;
  english: string;
  indonesian: string;
}

export interface TenseDrillItem {
  id: string;
  context: string;
  before: string;
  after: string;
  options: readonly string[];
  answer: string;
  tip: string;
}

export interface CategoryTenseData {
  id: "simple-present" | "simple-past" | "simple-future";
  name: string;
  usage: string;
  badge: string;
  color: string;
  accentColor: string;
  keywords: readonly string[];
  formulas: readonly TenseFormulaItem[];
  examples: readonly TenseExampleItem[];
  quizzes: readonly TenseDrillItem[];
  aiSpeakingTopicId: string;
}

export const DAILY_CORE_TENSES: readonly CategoryTenseData[] = [
  {
    id: "simple-present",
    name: "Simple Present Tense",
    usage: "Fakta, Kebiasaan & Rutinitas Sehari-hari",
    badge: "Rutinitas & Hobi",
    color: "#E8FBF0",
    accentColor: "#10B981",
    keywords: ["Kebiasaan Pagi", "Hobi Santai", "Jadwal Harian"],
    formulas: [
      { type: "+ Positif", cls: "pos", pattern: "S + V1 (s/es)", sample: "I drink green tea every morning." },
      { type: "- Negatif", cls: "neg", pattern: "S + do/does not + V1", sample: "He does not eat spicy food." },
      { type: "? Tanya", cls: "ask", pattern: "Do/Does + S + V1?", sample: "Do you exercise every day?" },
    ],
    examples: [
      { tag: "Rutinitas Pagi", english: "I wake up at 6 AM and make breakfast every day.", indonesian: "Saya bangun jam 6 pagi dan membuat sarapan setiap hari." },
      { tag: "Kebiasaan & Hobi", english: "My sister reads novels before going to sleep.", indonesian: "Adik perempuan saya membaca novel sebelum tidur." },
      { tag: "Preferensi Pribadi", english: "He does not like crowded places on weekends.", indonesian: "Dia tidak suka tempat yang ramai pada akhir pekan." },
      { tag: "Aktivitas Mingguan", english: "Do you usually go jogging around the park on Sundays?", indonesian: "Apakah kamu biasanya joging keliling taman tiap hari Minggu?" },
    ],
    quizzes: [
      {
        id: "daily-sp-1",
        context: "Latihan 1 • Rutinitas Pagi",
        before: "Every morning, my brother",
        after: "two glasses of fresh water before breakfast.",
        options: ["drink", "drinks", "drank", "drinking"],
        answer: "drinks",
        tip: "Subjek tunggal 'my brother' (he) menggunakan Verb 1 + s ('drinks').",
      },
      {
        id: "daily-sp-2",
        context: "Latihan 2 • Kebiasaan Santai",
        before: "We",
        after: "watch television during family dinner.",
        options: ["do not", "does not", "are not", "is not"],
        answer: "do not",
        tip: "Subjek 'We' menggunakan kata bantu negatif 'do not' (don't) pada Simple Present.",
      },
      {
        id: "daily-sp-3",
        context: "Latihan 3 • Tanya Jadwal Masak",
        before: "",
        after: "your mother usually cook dinner for the family?",
        options: ["Do", "Does", "Is", "Are"],
        answer: "Does",
        tip: "Subjek tunggal 'your mother' (she) diawali kata bantu tanya 'Does'.",
      },
      {
        id: "daily-sp-4",
        context: "Latihan 4 • Hobi Akhir Pekan",
        before: "On weekends, Sarah always",
        after: "badminton with her friends.",
        options: ["play", "plays", "played", "playing"],
        answer: "plays",
        tip: "Subjek tunggal 'Sarah' (she) membutuhkan Verb 1 + s ('plays') untuk rutinitas.",
      },
    ],
    aiSpeakingTopicId: "daily",
  },
  {
    id: "simple-past",
    name: "Simple Past Tense",
    usage: "Cerita Kemarin & Pengalaman Pribadi",
    badge: "Cerita & Pengalaman",
    color: "#EFEAFF",
    accentColor: "#6C5CE7",
    keywords: ["Akhir Pekan", "Cerita Kemarin", "Liburan"],
    formulas: [
      { type: "+ Positif", cls: "pos", pattern: "S + Verb 2", sample: "I watched a great movie yesterday." },
      { type: "- Negatif", cls: "neg", pattern: "S + did not + V1", sample: "We didn't go out last night." },
      { type: "? Tanya", cls: "ask", pattern: "Did + S + V1?", sample: "Did you sleep well last night?" },
    ],
    examples: [
      { tag: "Akhir Pekan", english: "Last Saturday, I visited my grandparents in the countryside.", indonesian: "Sabtu lalu, saya mengunjungi kakek-nenek saya di pedesaan." },
      { tag: "Kegiatan Kemarin", english: "We cooked homemade spaghetti together last evening.", indonesian: "Kami memasak spageti buatan sendiri bersama-sama kemarin malam." },
      { tag: "Kendala Lalu", english: "I did not hear my alarm clock this morning because of tiredness.", indonesian: "Saya tidak mendengar bunyi jam beker tadi pagi karena kelelahan." },
      { tag: "Tanya Pengalaman", english: "Did you enjoy your vacation in Bali last month?", indonesian: "Apakah kamu menikmati liburanmu di Bali bulan lalu?" },
    ],
    quizzes: [
      {
        id: "daily-past-1",
        context: "Latihan 1 • Belanja Kemarin",
        before: "Yesterday afternoon, I",
        after: "a new pair of running shoes at the mall.",
        options: ["buy", "buys", "bought", "buying"],
        answer: "bought",
        tip: "Bentuk Verb 2 (lampau) dari kata kerja tidak beraturan 'buy' adalah 'bought'.",
      },
      {
        id: "daily-past-2",
        context: "Latihan 2 • Liburan yang Batal",
        before: "We did not",
        after: "to the beach yesterday because it was raining heavily.",
        options: ["go", "went", "goes", "going"],
        answer: "go",
        tip: "Setelah kata bantu 'did not', kata kerja selalu kembali ke bentuk dasar Verb 1 ('go').",
      },
      {
        id: "daily-past-3",
        context: "Latihan 3 • Temu Teman Lama",
        before: "",
        after: "you meet your high school friends at the cafe yesterday?",
        options: ["Do", "Does", "Did", "Were"],
        answer: "Did",
        tip: "Kalimat tanya lampau dengan kata kerja aksi 'meet' diawali 'Did'.",
      },
      {
        id: "daily-past-4",
        context: "Latihan 4 • Makan Malam",
        before: "Two days ago, my family",
        after: "dinner at an authentic Italian restaurant.",
        options: ["have", "has", "had", "having"],
        answer: "had",
        tip: "Bentuk lampau dari 'have/has' adalah 'had'.",
      },
    ],
    aiSpeakingTopicId: "daily",
  },
  {
    id: "simple-future",
    name: "Simple Future Tense",
    usage: "Rencana Mendatang & Niat Pribadi",
    badge: "Rencana & Janji",
    color: "#FDF3E7",
    accentColor: "#E28739",
    keywords: ["Rencana Besok", "Janji Temu", "Niat Pribadi"],
    formulas: [
      { type: "+ Positif", cls: "pos", pattern: "S + will + V1", sample: "I will cook dinner tonight." },
      { type: "- Negatif", cls: "neg", pattern: "S + will not + V1", sample: "I won't stay up late tonight." },
      { type: "? Tanya", cls: "ask", pattern: "Will + S + V1?", sample: "Will you come to my party?" },
    ],
    examples: [
      { tag: "Rencana Besok", english: "Tomorrow morning, I will start reading my new psychology book.", indonesian: "Besok pagi, saya akan mulai membaca buku psikologi baru saya." },
      { tag: "Janji Temu", english: "We are going to visit our favorite coffee shop this Saturday afternoon.", indonesian: "Kami akan mengunjungi kedai kopi favorit kami Sabtu sore ini." },
      { tag: "Niat / Resolusi", english: "I will not eat sweet snacks after 8 PM tonight.", indonesian: "Saya tidak akan makan camilan manis setelah jam 8 malam nanti." },
      { tag: "Ajakan / Tanya", english: "Will you join us for a movie marathon this weekend?", indonesian: "Apakah kamu mau ikut marathon film bersama kami akhir pekan ini?" },
    ],
    quizzes: [
      {
        id: "daily-fut-1",
        context: "Latihan 1 • Janji Spontan",
        before: "Don't worry about lunch, I",
        after: "make chicken sandwiches for both of us.",
        options: ["will", "am", "did", "was"],
        answer: "will",
        tip: "Gunakan modal 'will' untuk janji spontan atau tawaran yang akan dilakukan.",
      },
      {
        id: "daily-fut-2",
        context: "Latihan 2 • Acara Keluarga",
        before: "Tomorrow evening, we will",
        after: "my sister's birthday party at home.",
        options: ["celebrate", "celebrates", "celebrated", "celebrating"],
        answer: "celebrate",
        tip: "Setelah kata 'will', kata kerja selalu dalam bentuk dasar murni ('celebrate').",
      },
      {
        id: "daily-fut-3",
        context: "Latihan 3 • Niat Malam Ini",
        before: "I am tired, so I",
        after: "stay up late playing video games tonight.",
        options: ["will not", "did not", "does not", "am not"],
        answer: "will not",
        tip: "Untuk keputusan tentang nanti malam ('tonight'), gunakan 'will not' (won't).",
      },
      {
        id: "daily-fut-4",
        context: "Latihan 4 • Rencana Olahraga",
        before: "",
        after: "you join the community cycling event next Sunday?",
        options: ["Do", "Did", "Will", "Are"],
        answer: "Will",
        tip: "Pertanyaan tentang rencana hari Minggu depan ('next Sunday') diawali 'Will'.",
      },
    ],
    aiSpeakingTopicId: "daily",
  },
];

export const PROFESSIONAL_CORE_TENSES: readonly CategoryTenseData[] = [
  {
    id: "simple-present",
    name: "Simple Present Tense",
    usage: "Fakta, Peran & Rutinitas Kantor",
    badge: "Rutinitas & SOP",
    color: "#E8FBF0",
    accentColor: "#10B981",
    keywords: ["Daily Standup", "Peran Kerja", "Jadwal Rutin"],
    formulas: [
      { type: "+ Positif", cls: "pos", pattern: "S + V1 (s/es)", sample: "She leads the design team." },
      { type: "- Negatif", cls: "neg", pattern: "S + do/does not + V1", sample: "We do not deploy on Friday." },
      { type: "? Tanya", cls: "ask", pattern: "Do/Does + S + V1?", sample: "Does the client approve it?" },
    ],
    examples: [
      { tag: "Tanggung Jawab", english: "I coordinate with the product and design teams every morning.", indonesian: "Saya berkoordinasi dengan tim produk dan desain setiap pagi." },
      { tag: "Prosedur (SOP)", english: "Our system sends an automated invoice after the client approves the quote.", indonesian: "Sistem kami mengirimkan faktur otomatis setelah klien menyetujui penawaran." },
      { tag: "Daily Standup", english: "We currently have three high-priority tickets in the queue.", indonesian: "Saat ini kita memiliki tiga tiket prioritas tinggi di dalam antrean." },
      { tag: "Jadwal Rutin", english: "Does the finance team review reimbursement requests on Wednesdays?", indonesian: "Apakah tim keuangan meninjau permintaan reimbursement setiap hari Rabu?" },
    ],
    quizzes: [
      {
        id: "sp-drill-1",
        context: "Latihan 1 • Rutinitas Standup Pagi",
        before: "Every morning at 9 AM, our squad",
        after: "a 15-minute standup call.",
        options: ["hold", "holds", "held", "holding"],
        answer: "holds",
        tip: "Subjek tunggal 'our squad' menggunakan Verb 1 + s (holds).",
      },
      {
        id: "sp-drill-2",
        context: "Latihan 2 • Kebijakan Tim Teknis",
        before: "Our engineering team",
        after: "push new updates on Fridays.",
        options: ["do not", "does not", "are not", "did not"],
        answer: "does not",
        tip: "Subjek tunggal 'team' pada kalimat negatif menggunakan 'does not'.",
      },
      {
        id: "sp-drill-3",
        context: "Latihan 3 • Konfirmasi ke Klien",
        before: "",
        after: "this dashboard show the real-time conversion metrics?",
        options: ["Do", "Does", "Is", "Did"],
        answer: "Does",
        tip: "Pertanyaan untuk subjek tunggal 'this dashboard' diawali 'Does'.",
      },
      {
        id: "sp-drill-4",
        context: "Latihan 4 • Peran Account Manager",
        before: "Our account manager",
        after: "all enterprise contracts before signing.",
        options: ["review", "reviews", "reviewed", "reviewing"],
        answer: "reviews",
        tip: "Subjek tunggal 'account manager' menggunakan 'reviews'.",
      },
    ],
    aiSpeakingTopicId: "work",
  },
  {
    id: "simple-past",
    name: "Simple Past Tense",
    usage: "Laporan Kemarin & Tugas Selesai",
    badge: "Laporan & Evaluasi",
    color: "#EFEAFF",
    accentColor: "#6C5CE7",
    keywords: ["Progres Kemarin", "Hasil Rapat", "Tugas Selesai"],
    formulas: [
      { type: "+ Positif", cls: "pos", pattern: "S + Verb 2", sample: "We launched the beta yesterday." },
      { type: "- Negatif", cls: "neg", pattern: "S + did not + V1", sample: "They did not join the call." },
      { type: "? Tanya", cls: "ask", pattern: "Did + S + V1?", sample: "Did you send the proposal?" },
    ],
    examples: [
      { tag: "Update Kemarin", english: "Yesterday, I resolved two payment gateway bugs.", indonesian: "Kemarin saya menyelesaikan dua bug pembayaran." },
      { tag: "Hasil Rapat", english: "The client approved our Q4 roadmap last afternoon.", indonesian: "Klien menyetujui roadmap Q4 kami kemarin sore." },
      { tag: "Evaluasi", english: "We did not hit the target because of server downtime.", indonesian: "Kami tidak mencapai target karena kendala server." },
      { tag: "Konfirmasi", english: "Did the vendor sign the NDA document last week?", indonesian: "Apakah vendor menandatangani NDA minggu lalu?" },
    ],
    quizzes: [
      {
        id: "past-drill-1",
        context: "Latihan 1 • Laporan Kemarin",
        before: "Yesterday afternoon, our team",
        after: "the final UI prototype to the client.",
        options: ["present", "presents", "presented", "presenting"],
        answer: "presented",
        tip: "Keterangan 'Yesterday' menggunakan Verb 2 (presented).",
      },
      {
        id: "past-drill-2",
        context: "Latihan 2 • Evaluasi Sprint Lalu",
        before: "We",
        after: "experience any server outage during the campaign.",
        options: ["do not", "does not", "did not", "were not"],
        answer: "did not",
        tip: "Kalimat negatif masa lampau menggunakan 'did not + V1'.",
      },
      {
        id: "past-drill-3",
        context: "Latihan 3 • Tindak Lanjut Rapat",
        before: "",
        after: "the stakeholders agree with the new timeline?",
        options: ["Do", "Does", "Did", "Were"],
        answer: "Did",
        tip: "Pertanyaan lampau dengan kata kerja 'agree' menggunakan 'Did'.",
      },
      {
        id: "past-drill-4",
        context: "Latihan 4 • Penyelesaian Tiket",
        before: "The QA engineer",
        after: "all critical bugs before the release.",
        options: ["verify", "verifies", "verified", "verifying"],
        answer: "verified",
        tip: "Bentuk lampau dari 'verify' adalah 'verified'.",
      },
    ],
    aiSpeakingTopicId: "work",
  },
  {
    id: "simple-future",
    name: "Simple Future Tense",
    usage: "Rencana Kerja, Janji & Deadline",
    badge: "Rencana & Target",
    color: "#FDF3E7",
    accentColor: "#E28739",
    keywords: ["Action Items", "Komitmen", "Deadline"],
    formulas: [
      { type: "+ Positif", cls: "pos", pattern: "S + will + V1", sample: "I will send the report at 4 PM." },
      { type: "- Negatif", cls: "neg", pattern: "S + will not + V1", sample: "We won't delay the launch." },
      { type: "? Tanya", cls: "ask", pattern: "Will + S + V1?", sample: "Will you join the townhall?" },
    ],
    examples: [
      { tag: "Action Item", english: "I will share the meeting minutes in 10 minutes.", indonesian: "Saya akan membagikan notulensi rapat dalam 10 menit." },
      { tag: "Komitmen", english: "Our team will deliver the first draft by Thursday.", indonesian: "Tim kami akan mengirimkan draf pertama hari Kamis." },
      { tag: "Antisipasi", english: "The migration will not affect active users.", indonesian: "Migrasi ini tidak akan berdampak pada pengguna aktif." },
      { tag: "Koordinasi", english: "Will the finance director attend tomorrow's pitch?", indonesian: "Apakah direktur keuangan akan hadir besok?" },
    ],
    quizzes: [
      {
        id: "fut-drill-1",
        context: "Latihan 1 • Komitmen ke Klien",
        before: "I",
        after: "send you the revised quotation before 5 PM today.",
        options: ["will", "am", "did", "was"],
        answer: "will",
        tip: "Gunakan 'will + V1' untuk komitmen yang akan dilakukan.",
      },
      {
        id: "fut-drill-2",
        context: "Latihan 2 • Kepastian Jadwal",
        before: "The maintenance",
        after: "take more than 30 minutes tonight.",
        options: ["will not", "did not", "does not", "is not"],
        answer: "will not",
        tip: "Untuk kejadian nanti malam ('tonight'), gunakan 'will not'.",
      },
      {
        id: "fut-drill-3",
        context: "Latihan 3 • Koordinasi Tim",
        before: "",
        after: "you lead the product demo session tomorrow morning?",
        options: ["Do", "Did", "Will", "Are"],
        answer: "Will",
        tip: "Gunakan 'Will' untuk menanyakan rencana besok pagi.",
      },
      {
        id: "fut-drill-4",
        context: "Latihan 4 • Target Kuartal Depan",
        before: "Next month, we will",
        after: "the new onboarding flow for users.",
        options: ["launch", "launches", "launched", "launching"],
        answer: "launch",
        tip: "Setelah kata 'will', selalu gunakan Verb 1 dasar ('launch').",
      },
    ],
    aiSpeakingTopicId: "tech",
  },
];

export interface CoreTenseModule {
  id: "simple-present" | "simple-past" | "simple-future";
  number: 1 | 2 | 3;
  title: string;
  subtitleId: string;
  badge: string;
  color: string;
  accentColor: string;
  whenToUseId: string;
  formulas: {
    positive: string;
    negative: string;
    question: string;
  };
  timeSignals: readonly string[];
  officeExamples: readonly {
    scenario: string;
    english: string;
    indonesian: string;
  }[];
  drills: readonly OfficeTenseDrill[];
  aiSpeakingTopicId: string;
}

export const THREE_CORE_TENSES: readonly CoreTenseModule[] = [
  {
    id: "simple-present",
    number: 1,
    title: "Simple Present Tense",
    subtitleId: "Rutinitas Kantor, Tanggung Jawab Kerja, SOP & Fakta Saat Ini",
    badge: "Rutinitas & SOP",
    color: "#F4F5FF",
    accentColor: "#555CE0",
    whenToUseId:
      "Gunakan Simple Present saat menjelaskan peran kerjamu, rutinitas harian di kantor, jadwal tetap, prosedur (SOP), atau status proyek saat ini.",
    formulas: {
      positive: "Subject + Verb 1 (s/es untuk He/She/It) atau Subject + am/is/are + Complement",
      negative: "Subject + do/does not + Verb 1 atau Subject + am/is/are not + Complement",
      question: "Do/Does + Subject + Verb 1? atau Am/Is/Are + Subject + Complement?",
    },
    timeSignals: [
      "every morning",
      "every Friday",
      "usually",
      "currently",
      "on Mondays",
      "as part of our SOP",
    ],
    officeExamples: [
      {
        scenario: "Menjelaskan tanggung jawab kerja",
        english: "I coordinate with the product and design teams every morning.",
        indonesian: "Saya berkoordinasi dengan tim produk dan desain setiap pagi.",
      },
      {
        scenario: "Menjelaskan prosedur standar (SOP)",
        english: "Our system sends an automated invoice after the client approves the quote.",
        indonesian: "Sistem kami mengirimkan faktur otomatis setelah klien menyetujui penawaran.",
      },
      {
        scenario: "Melaporkan kondisi saat ini di Daily Standup",
        english: "We currently have three high-priority tickets in the queue.",
        indonesian: "Saat ini kita memiliki tiga tiket prioritas tinggi di dalam antrean.",
      },
      {
        scenario: "Bertanya jadwal rutin rekan kerja",
        english: "Does the finance team review reimbursement requests on Wednesdays?",
        indonesian: "Apakah tim keuangan meninjau permintaan reimbursement setiap hari Rabu?",
      },
    ],
    drills: [
      {
        id: "sp-drill-1",
        promptId: "Lengkapi kalimat untuk menceritakan rutinitas standup pagi:",
        sentenceWithBlank: "Every morning at 9 AM, our squad ___ a 15-minute standup call.",
        options: ["hold", "holds", "held", "holding"],
        answer: "holds",
        explanation: "'Our squad' adalah subjek tunggal (it), sehingga kata kerja menggunakan akhiran -s ('holds').",
      },
      {
        id: "sp-drill-2",
        promptId: "Pilih bentuk negatif yang tepat untuk menjelaskan prosedur kantor:",
        sentenceWithBlank: "We ___ deploy code to production on Friday afternoons.",
        options: ["do not", "does not", "are not", "did not"],
        answer: "do not",
        explanation: "Untuk subjek 'We' diikuti kata kerja dasar ('deploy'), gunakan 'do not' (don't).",
      },
      {
        id: "sp-drill-3",
        promptId: "Lengkapi pertanyaan konfirmasi kepada klien:",
        sentenceWithBlank: "___ this dashboard show the real-time conversion metrics?",
        options: ["Do", "Does", "Is", "Did"],
        answer: "Does",
        explanation: "'This dashboard' adalah subjek tunggal dan diikuti Verb 1 ('show'), sehingga kalimat tanya memakai 'Does'.",
      },
      {
        id: "sp-drill-4",
        promptId: "Pilih kata kerja operasional yang tepat untuk subjek tunggal:",
        sentenceWithBlank: "Our account manager ___ all enterprise contracts before signing.",
        options: ["review", "reviews", "reviewed", "reviewing"],
        answer: "reviews",
        explanation: "'Our account manager' (she/he) membutuhkan Verb 1 + s ('reviews') pada Simple Present.",
      },
    ],
    aiSpeakingTopicId: "daily",
  },
  {
    id: "simple-past",
    number: 2,
    title: "Simple Past Tense",
    subtitleId: "Laporan Progres Kemarin, Hasil Rapat & Tugas yang Sudah Selesai",
    badge: "Laporan & Evaluasi",
    color: "#EFEAFF",
    accentColor: "#755FE2",
    whenToUseId:
      "Gunakan Simple Past saat melaporkan apa yang sudah kamu selesaikan kemarin di Daily Standup, menceritakan hasil rapat, atau menjelaskan insiden yang sudah lewat.",
    formulas: {
      positive: "Subject + Verb 2 (Regular -ed / Irregular) atau Subject + was/were + Complement",
      negative: "Subject + did not (didn't) + Verb 1 (kembali ke bentuk dasar)",
      question: "Did + Subject + Verb 1? atau Was/Were + Subject + Complement?",
    },
    timeSignals: [
      "yesterday",
      "last week",
      "two hours ago",
      "in Q3",
      "yesterday afternoon",
      "during Monday's call",
    ],
    officeExamples: [
      {
        scenario: "Update standup tentang pekerjaan kemarin",
        english: "Yesterday, I finalized the UI wireframes and shared them with the developers.",
        indonesian: "Kemarin, saya merampungkan kerangka UI dan membagikannya kepada para developer.",
      },
      {
        scenario: "Melaporkan masalah yang sudah teratasi",
        english: "We identified the payment bug last night and resolved it within an hour.",
        indonesian: "Kami mengidentifikasi bug pembayaran tadi malam dan menyelesaikannya dalam satu jam.",
      },
      {
        scenario: "Menjelaskan alasan belum selesainya tugas (Negatif)",
        english: "The vendor did not send the revised contract yesterday.",
        indonesian: "Vendor tersebut tidak mengirimkan revisi kontrak kemarin (perhatikan: 'did not send', bukan 'did not sent').",
      },
      {
        scenario: "Memastikan hasil rapat sebelumnya",
        english: "Did the client approve the new timeline during yesterday's pitch?",
        indonesian: "Apakah klien menyetujui jadwal baru saat presentasi kemarin?",
      },
    ],
    drills: [
      {
        id: "past-drill-1",
        promptId: "Laporkan tugas yang selesai kemarin sore:",
        sentenceWithBlank: "Yesterday afternoon, I ___ the updated financial report to the director.",
        options: ["submit", "submitted", "submits", "submitting"],
        answer: "submitted",
        explanation: "'Yesterday afternoon' menandakan masa lampau, sehingga gunakan Verb 2 ('submitted').",
      },
      {
        id: "past-drill-2",
        promptId: "Hati-hati jebakan umum! Pilih kalimat negatif lampau yang benar:",
        sentenceWithBlank: "We did not ___ any server downtime during the migration last night.",
        options: ["experience", "experienced", "experiencing", "experiences"],
        answer: "experience",
        explanation: "Setelah 'did not', kata kerja WAJIB kembali ke Verb 1 ('experience'), bukan Verb 2.",
      },
      {
        id: "past-drill-3",
        promptId: "Pilih bentuk lampau tak beraturan (irregular verb) yang tepat:",
        sentenceWithBlank: "Last Tuesday, our CEO ___ with the new partners in Singapore.",
        options: ["meet", "meets", "met", "meeting"],
        answer: "met",
        explanation: "Bentuk Verb 2 (Simple Past) dari 'meet' adalah 'met'.",
      },
      {
        id: "past-drill-4",
        promptId: "Buat pertanyaan evaluasi proyek minggu lalu:",
        sentenceWithBlank: "How many support tickets ___ the team close last week?",
        options: ["do", "does", "did", "were"],
        answer: "did",
        explanation: "Pertanyaan di waktu lampau ('last week') dengan kata kerja 'close' menggunakan kata bantu 'did'.",
      },
    ],
    aiSpeakingTopicId: "work",
  },
  {
    id: "simple-future",
    number: 3,
    title: "Simple Future Tense",
    subtitleId: "Rencana Kerja Hari Ini, Komitmen Action Items, Janji & Deadline",
    badge: "Rencana & Komitmen",
    color: "#FDF3E7",
    accentColor: "#E28739",
    whenToUseId:
      "Gunakan Simple Future ('will' atau 'be going to') saat menyampaikan komitmen tindak lanjut (action items), membuat janji kepada klien/rekan, atau menjelaskan rencana kerja berikutnya.",
    formulas: {
      positive: "Subject + will + Verb 1 atau Subject + am/is/are going to + Verb 1",
      negative: "Subject + will not (won't) + Verb 1",
      question: "Will + Subject + Verb 1? atau When will + Subject + Verb 1?",
    },
    timeSignals: [
      "tomorrow",
      "by EOD today",
      "next week",
      "in 30 minutes",
      "after this call",
      "next quarter",
    ],
    officeExamples: [
      {
        scenario: "Komitmen tindak lanjut seusai rapat",
        english: "I will send the meeting minutes and action items by 4 PM today.",
        indonesian: "Saya akan mengirimkan notulensi rapat dan daftar tindakan sebelum jam 4 sore hari ini.",
      },
      {
        scenario: "Menyampaikan rencana kerja yang sudah terjadwal",
        english: "We are going to roll out the new dashboard to all users next Monday.",
        indonesian: "Kami akan merilis dashboard baru ini kepada seluruh pengguna pada hari Senin depan.",
      },
      {
        scenario: "Memberikan jaminan kepada klien (Negatif)",
        english: "This maintenance update will not affect your active transactions.",
        indonesian: "Pembaruan pemeliharaan ini tidak akan memengaruhi transaksi aktif Anda.",
      },
      {
        scenario: "Menanyakan kepastian tenggat waktu",
        english: "Will the legal team finish reviewing the NDA before tomorrow's call?",
        indonesian: "Apakah tim legal akan selesai meninjau NDA sebelum panggilan besok?",
      },
    ],
    drills: [
      {
        id: "fut-drill-1",
        promptId: "Sampaikan komitmen tindak lanjut cepat di akhir rapat:",
        sentenceWithBlank: "Right after this call, I ___ follow up with the vendor via email.",
        options: ["will", "am", "did", "was"],
        answer: "will",
        explanation: "Untuk komitmen langsung di masa depan diikuti Verb 1 ('follow up'), gunakan 'will'.",
      },
      {
        id: "fut-drill-2",
        promptId: "Pilih kata kerja yang tepat setelah 'will':",
        sentenceWithBlank: "Our team will ___ the Q4 budget proposal tomorrow morning.",
        options: ["present", "presents", "presented", "presenting"],
        answer: "present",
        explanation: "Setelah modal 'will', kata kerja selalu dalam bentuk dasar murni (Verb 1: 'present').",
      },
      {
        id: "fut-drill-3",
        promptId: "Lengkapi kalimat rencana terjadwal dengan 'going to':",
        sentenceWithBlank: "We are ___ onboard five new analysts next month.",
        options: ["go to", "going to", "gone to", "will to"],
        answer: "going to",
        explanation: "Struktur rencana terencana adalah 'am/is/are + going to + Verb 1'.",
      },
      {
        id: "fut-drill-4",
        promptId: "Pilih bentuk negatif untuk memastikan tidak ada keterlambatan:",
        sentenceWithBlank: "Don't worry, the minor UI adjustment ___ delay our Friday launch.",
        options: ["will not", "did not", "does not", "is not"],
        answer: "will not",
        explanation: "Untuk menyatakan sesuatu tidak akan terjadi di masa depan ('Friday launch'), gunakan 'will not' (won't).",
      },
    ],
    aiSpeakingTopicId: "tech",
  },
];

/* ============================================================================
 * MENU 4: COMPREHENSIBLE INPUT & SHADOWING (15-MINUTE DAILY AUDIO)
 * ========================================================================== */

export interface ShadowingSegment {
  id: string;
  speaker: string;
  english: string;
  indonesian: string;
  stressTip: string;
}

export interface ShadowingTrack {
  id: string;
  title: string;
  subtitle: string;
  cefr: CefrLevel;
  durationMin: number;
  category: string;
  keyVocab: readonly string[];
  segments: readonly ShadowingSegment[];
}

export const SHADOWING_TRACKS: readonly ShadowingTrack[] = [
  {
    id: "shadow-standup-a2",
    title: "Daily Standup Update",
    subtitle: "Menggabungkan Past, Present, dan Future dalam update 2 menit yang natural",
    cefr: "A2",
    durationMin: 5,
    category: "Daily Standup",
    keyVocab: ["wrapped up", "working on", "blocked by", "follow up"],
    segments: [
      {
        id: "seg-1",
        speaker: "Liam (Product Designer)",
        english: "Good morning everyone. Yesterday, I wrapped up the mobile checkout wireframes.",
        indonesian: "Selamat pagi semuanya. Kemarin, saya telah menyelesaikan kerangka layar pembayaran ponsel.",
        stressTip: "Tekankan kata 'wrapped UP' dan 'checkout WIREframes' dengan intonasi turun di akhir kalimat.",
      },
      {
        id: "seg-2",
        speaker: "Liam (Product Designer)",
        english: "Today, I am working on the interactive prototype for our Friday usability test.",
        indonesian: "Hari ini, saya sedang mengerjakan purwarupa interaktif untuk uji kegunaan hari Jumat kita.",
        stressTip: "Sambungkan pengucapan 'working_on' dan tekankan 'interACTIVE PROtotype'.",
      },
      {
        id: "seg-3",
        speaker: "Liam (Product Designer)",
        english: "Right now, I am not blocked by anything, and everything is on track.",
        indonesian: "Saat ini, saya tidak terhambat oleh apa pun, dan semuanya berjalan sesuai jadwal.",
        stressTip: "Ucapkan 'on TRACK' dengan tegas dan jelas untuk menunjukkan kepercayaan diri.",
      },
      {
        id: "seg-4",
        speaker: "Liam (Product Designer)",
        english: "After lunch, I will sync up with the frontend team to review the icon assets.",
        indonesian: "Setelah makan siang, saya akan berkoordinasi singkat dengan tim frontend untuk meninjau aset ikon.",
        stressTip: "Jeda tipis setelah 'After lunch,' lalu ucapkan 'sync UP' dengan ritme mengalir.",
      },
    ],
  },
  {
    id: "shadow-client-b1",
    title: "Aligning Deadlines & Client Expectations",
    subtitle: "Cara sopan bernegosiasi jadwal dan memberikan kepastian tindak lanjut",
    cefr: "B1",
    durationMin: 5,
    category: "Client Communication",
    keyVocab: ["align", "extend the deadline", "verify", "keep you posted"],
    segments: [
      {
        id: "seg-b1-1",
        speaker: "Emma (Account Lead)",
        english: "Thank you for sharing the updated requirements during our call this morning.",
        indonesian: "Terima kasih telah membagikan pembaruan kebutuhan selama panggilan kita pagi ini.",
        stressTip: "Tekankan 'THANK you' dan 'UPdated reQUIREments' dengan nada ramah dan hangat.",
      },
      {
        id: "seg-b1-2",
        speaker: "Emma (Account Lead)",
        english: "To make sure we deliver accurate data, could we extend the deadline to Thursday?",
        indonesian: "Untuk memastikan kami menyerahkan data yang akurat, bolehkah kita memperpanjang tenggat ke hari Kamis?",
        stressTip: "Gunakan intonasi sedikit naik yang sopan pada 'could we exTEND the DEADline to THURSday?'",
      },
      {
        id: "seg-b1-3",
        speaker: "Emma (Account Lead)",
        english: "Our engineering team validated the core numbers yesterday, and they look very promising.",
        indonesian: "Tim engineering kami telah memvalidasi angka-angka inti kemarin, dan hasilnya tampak sangat menjanjikan.",
        stressTip: "Perjelas akhiran -ed pada 'valiDATED' (/ɪd/) dan tekankan 'VERY PROmising'.",
      },
      {
        id: "seg-b1-4",
        speaker: "Emma (Account Lead)",
        english: "I will send the preliminary draft by 3 PM tomorrow and keep you posted.",
        indonesian: "Saya akan mengirimkan draf awal sebelum jam 3 sore besok dan terus mengabari Anda.",
        stressTip: "Tekankan waktu komitmen 'by THREE PM toMORrow' agar terdengar dapat diandalkan.",
      },
    ],
  },
  {
    id: "shadow-problem-b2",
    title: "Escalating an Issue & Workaround",
    subtitle: "Komunikasi tenang dan solutif saat menghadapi kendala teknis di kantor",
    cefr: "B2",
    durationMin: 5,
    category: "Problem Solving",
    keyVocab: ["identified", "root cause", "workaround", "mitigate"],
    segments: [
      {
        id: "seg-b2-1",
        speaker: "Raka (Operations Lead)",
        english: "I want to flag a minor issue we noticed in the automated reporting pipeline.",
        indonesian: "Saya ingin menandai satu masalah kecil yang kami temukan pada jalur pelaporan otomatis.",
        stressTip: "Gunakan nada tenang dan terukur; tekankan 'FLAG a MInor ISsue'.",
      },
      {
        id: "seg-b2-2",
        speaker: "Raka (Operations Lead)",
        english: "We already identified the root cause and deployed a temporary workaround.",
        indonesian: "Kami sudah mengidentifikasi akar masalahnya dan menerapkan solusi sementara.",
        stressTip: "Tekankan 'ROOT cause' dan 'TEMporary WORKaround' agar fokus pada solusi.",
      },
      {
        id: "seg-b2-3",
        speaker: "Raka (Operations Lead)",
        english: "Client data remains completely safe, and this glitch does not affect live transactions.",
        indonesian: "Data klien tetap sepenuhnya aman, dan gangguan kecil ini tidak memengaruhi transaksi langsung.",
        stressTip: "Berikan penekanan meyakinkan pada 'comPLETEly SAFE' dan 'does NOT afFECT'.",
      },
      {
        id: "seg-b2-4",
        speaker: "Raka (Operations Lead)",
        english: "We will implement the permanent fix tonight to mitigate any future downtime.",
        indonesian: "Kami akan menerapkan perbaikan permanen malam ini untuk memitigasi risiko waktu henti ke depan.",
        stressTip: "Ucapkan 'PERmanent FIX' dan 'MItigate' dengan artikulasi konsonan yang bersih.",
      },
    ],
  },
];

/* ============================================================================
 * MENU 5: AI SPEAKING PARTNERS & PEER ECOSYSTEM METADATA
 * ========================================================================== */

export {
  AI_SPEAKING_PARTNERS,
  findSpeakingPartner,
  type SpeakingPartnerProfile,
} from "./speaking-partners";

/* ============================================================================
 * PERSISTENT STATE FOR THE 5-MENU LEARNING PATH (LOCALSTORAGE + SYNC STORE)
 * ========================================================================== */

export interface ScheduleItem {
  id: string;
  menuId: MenuId;
  emoji: string;
  title: string;
  time: string;
  completed: boolean;
}

export interface FiveMenuProgressState {
  /** IDs of mastered vocabulary items out of the 500 active catalog. */
  masteredVocabIds: string[];
  /** Baseline pre-mastered count so new users see realistic initial progress or can toggle it. */
  baselineVocabCount: number;
  /** Completed drill IDs across the 3 Core Tenses. */
  completedTenseDrillIds: string[];
  /** Completed shadowing segment IDs. */
  completedShadowingSegmentIds: string[];
  /** Minutes of Comprehensible Input & Shadowing completed today (target: 15m). */
  shadowingMinutesToday: number;
  /** Last date (YYYY-MM-DD) shadowing minutes were logged. */
  lastShadowingDate: string;
  /** Diagnostic quiz completed status & last score. */
  diagnosticScore: number | null;
  /** Personal daily schedule items shown in the Middle Bento Column. */
  schedule: ScheduleItem[];
}

const FIVE_MENU_STORAGE_KEY = "fluelo:5menus:v1";

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: "sched-1",
    menuId: 4,
    emoji: "🎧",
    title: "Comprehensible Input & Shadowing",
    time: "09:30",
    completed: false,
  },
  {
    id: "sched-2",
    menuId: 5,
    emoji: "🗣️",
    title: "Praktik Bicara 2 Arah (Office)",
    time: "10:30",
    completed: false,
  },
];

const LEGACY_DUMMY_VOCAB_IDS = [
  "vocab-1",
  "vocab-2",
  "vocab-3",
  "vocab-51",
  "vocab-101",
  "vocab-151",
];

const LEGACY_DUMMY_DRILL_IDS = [
  "sp-drill-1",
  "sp-drill-2",
  "sp-drill-3",
  "sp-drill-4",
  "past-drill-1",
  "past-drill-2",
  "past-drill-3",
  "past-drill-4",
  "fut-drill-1",
  "fut-drill-2",
];

const DEFAULT_FIVE_MENU_STATE: FiveMenuProgressState = {
  masteredVocabIds: [],
  baselineVocabCount: 0,
  completedTenseDrillIds: [],
  completedShadowingSegmentIds: [],
  shadowingMinutesToday: 0,
  lastShadowingDate: todayKey(),
  diagnosticScore: null,
  schedule: DEFAULT_SCHEDULE,
};

let fiveMenuCache: FiveMenuProgressState | null = null;
const fiveMenuListeners = new Set<() => void>();

function normalizeFiveMenuState(raw: unknown): FiveMenuProgressState {
  if (!raw || typeof raw !== "object") return DEFAULT_FIVE_MENU_STATE;
  const obj = raw as Record<string, unknown>;

  let masteredVocabIds = Array.isArray(obj.masteredVocabIds)
    ? obj.masteredVocabIds.filter((x): x is string => typeof x === "string")
    : DEFAULT_FIVE_MENU_STATE.masteredVocabIds;
  // Clear legacy mock vocab list if untouched
  if (
    masteredVocabIds.length === LEGACY_DUMMY_VOCAB_IDS.length &&
    LEGACY_DUMMY_VOCAB_IDS.every((id) => masteredVocabIds.includes(id))
  ) {
    masteredVocabIds = [];
  }

  let baselineVocabCount =
    typeof obj.baselineVocabCount === "number" && Number.isFinite(obj.baselineVocabCount)
      ? Math.max(0, Math.min(500, Math.round(obj.baselineVocabCount)))
      : 0;
  // Clear legacy mock baseline 306
  if (baselineVocabCount === 306) {
    baselineVocabCount = 0;
  }

  let completedTenseDrillIds = Array.isArray(obj.completedTenseDrillIds)
    ? obj.completedTenseDrillIds.filter((x): x is string => typeof x === "string")
    : DEFAULT_FIVE_MENU_STATE.completedTenseDrillIds;
  // Clear legacy mock 10 drill IDs if untouched
  if (
    completedTenseDrillIds.length === LEGACY_DUMMY_DRILL_IDS.length &&
    LEGACY_DUMMY_DRILL_IDS.every((id) => completedTenseDrillIds.includes(id))
  ) {
    completedTenseDrillIds = [];
  }

  const completedShadowingSegmentIds = Array.isArray(obj.completedShadowingSegmentIds)
    ? obj.completedShadowingSegmentIds.filter((x): x is string => typeof x === "string")
    : DEFAULT_FIVE_MENU_STATE.completedShadowingSegmentIds;

  const today = todayKey();
  let shadowingMinutesToday =
    typeof obj.shadowingMinutesToday === "number" && Number.isFinite(obj.shadowingMinutesToday)
      ? Math.max(0, Math.min(180, Math.round(obj.shadowingMinutesToday)))
      : 0;

  let lastShadowingDate =
    typeof obj.lastShadowingDate === "string"
      ? obj.lastShadowingDate
      : today;

  if (lastShadowingDate !== today) {
    shadowingMinutesToday = 0;
    lastShadowingDate = today;
  }

  const diagnosticScore =
    typeof obj.diagnosticScore === "number" && Number.isFinite(obj.diagnosticScore)
      ? obj.diagnosticScore
      : null;

  const schedule = Array.isArray(obj.schedule) && obj.schedule.length > 0
    ? obj.schedule
        .map((item): ScheduleItem | null => {
          if (!item || typeof item !== "object") return null;
          const rec = item as Record<string, unknown>;
          if (typeof rec.id !== "string" || typeof rec.title !== "string") return null;
          const menuId = [0, 1, 2, 3, 4, 5].includes(Number(rec.menuId))
            ? (Number(rec.menuId) as MenuId)
            : 4;
          return {
            id: rec.id,
            menuId,
            emoji: typeof rec.emoji === "string" ? rec.emoji : "📌",
            title: rec.title,
            time: typeof rec.time === "string" ? rec.time : "09:30",
            completed: Boolean(rec.completed),
          };
        })
        .filter((x): x is ScheduleItem => x !== null)
    : DEFAULT_SCHEDULE;

  return {
    masteredVocabIds: [...new Set(masteredVocabIds)],
    baselineVocabCount,
    completedTenseDrillIds: [...new Set(completedTenseDrillIds)],
    completedShadowingSegmentIds: [...new Set(completedShadowingSegmentIds)],
    shadowingMinutesToday,
    lastShadowingDate,
    diagnosticScore,
    schedule,
  };
}

function readFiveMenuState(): FiveMenuProgressState {
  if (fiveMenuCache) return fiveMenuCache;
  if (typeof window === "undefined") return DEFAULT_FIVE_MENU_STATE;
  try {
    const raw = window.localStorage.getItem(FIVE_MENU_STORAGE_KEY);
    fiveMenuCache = raw
      ? normalizeFiveMenuState(JSON.parse(raw) as unknown)
      : DEFAULT_FIVE_MENU_STATE;
  } catch {
    fiveMenuCache = DEFAULT_FIVE_MENU_STATE;
  }
  return fiveMenuCache;
}

function writeFiveMenuState(next: FiveMenuProgressState): void {
  const normalized = normalizeFiveMenuState(next);
  fiveMenuCache = normalized;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(FIVE_MENU_STORAGE_KEY, JSON.stringify(normalized));
    } catch (err) {
      console.error("Gagal menyimpan progres 5 menu:", err);
    }
  }
  fiveMenuListeners.forEach((listener) => listener());
}

function subscribeFiveMenu(listener: () => void) {
  fiveMenuListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === FIVE_MENU_STORAGE_KEY) {
      fiveMenuCache = null;
      listener();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    fiveMenuListeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export interface VocabCategoryProgress {
  categoryId: string;
  categoryTitle: string;
  total: number;
  mastered: number;
  percent: number;
}

export interface TenseModuleProgress {
  tenseId: "simple-present" | "simple-past" | "simple-future";
  title: string;
  totalDrills: number;
  completedDrills: number;
  percent: number;
}

export function useFiveMenuProgress() {
  const state = useSyncExternalStore(
    subscribeFiveMenu,
    readFiveMenuState,
    () => DEFAULT_FIVE_MENU_STATE,
  );

  const totalVocabCatalog = Math.max(1, ACTIVE_VOCAB_ITEMS.length);
  const totalVocabMastered = Math.min(
    totalVocabCatalog,
    state.baselineVocabCount + state.masteredVocabIds.length,
  );
  const vocabPercent = Math.min(
    100,
    Math.round((totalVocabMastered / totalVocabCatalog) * 100),
  );

  // Compute breakdown per category for 8 Categories (1000 items)
  const vocabCategoryProgress: VocabCategoryProgress[] = VOCAB_CATEGORIES.map(
    (cat) => {
      const categoryItems = ACTIVE_VOCAB_ITEMS.filter((item) => item.categoryId === cat.id);
      const total = categoryItems.length || 1;
      const mastered = categoryItems.filter((item) =>
        state.masteredVocabIds.includes(item.id),
      ).length;
      const percent = Math.min(100, Math.round((mastered / total) * 100));
      return {
        categoryId: cat.id,
        categoryTitle: cat.title,
        total,
        mastered,
        percent,
      };
    },
  );

  // Sparkline points: 8 category performance scores + overall vocabPercent at the end
  const vocabSparklinePoints: number[] = [
    ...vocabCategoryProgress.map((c) => c.percent),
    vocabPercent,
  ];

  // Compute breakdown per module for 3 Tenses Utama
  const totalDrills = THREE_CORE_TENSES.reduce((acc, t) => acc + t.drills.length, 0);
  const completedDrills = state.completedTenseDrillIds.length;
  const tensesRatio = Number(((completedDrills / Math.max(1, totalDrills)) * 3).toFixed(1));
  const tensesPercent = Math.round((completedDrills / Math.max(1, totalDrills)) * 100);

  const tenseModuleProgress: TenseModuleProgress[] = THREE_CORE_TENSES.map((tense) => {
    const drillIds = tense.drills.map((d) => d.id);
    const completed = drillIds.filter((id) =>
      state.completedTenseDrillIds.includes(id),
    ).length;
    const percent = Math.min(
      100,
      Math.round((completed / Math.max(1, drillIds.length)) * 100),
    );
    return {
      tenseId: tense.id,
      title: tense.title,
      totalDrills: drillIds.length,
      completedDrills: completed,
      percent,
    };
  });

  const presentPct = tenseModuleProgress[0]?.percent ?? 0;
  const pastPct = tenseModuleProgress[1]?.percent ?? 0;
  const futurePct = tenseModuleProgress[2]?.percent ?? 0;

  // 8 points: smooth progression across Present -> Past -> Future -> Overall
  const tensesSparklinePoints: number[] = [
    presentPct,
    Math.round((presentPct * 2 + pastPct) / 3),
    Math.round((presentPct + pastPct * 2) / 3),
    pastPct,
    Math.round((pastPct * 2 + futurePct) / 3),
    Math.round((pastPct + futurePct * 2) / 3),
    futurePct,
    tensesPercent,
  ];

  return {
    ...state,
    totalVocabMastered,
    vocabPercent,
    vocabCategoryProgress,
    vocabSparklinePoints,
    tensesRatio,
    tensesPercent,
    tenseModuleProgress,
    tensesSparklinePoints,
  };
}

export function toggleVocabMastered(vocabId: string): void {
  const current = readFiveMenuState();
  const exists = current.masteredVocabIds.includes(vocabId);
  const nextIds = exists
    ? current.masteredVocabIds.filter((id) => id !== vocabId)
    : [...current.masteredVocabIds, vocabId];
  writeFiveMenuState({ ...current, masteredVocabIds: nextIds });
}

export function markTenseDrillCompleted(drillId: string): void {
  const current = readFiveMenuState();
  if (current.completedTenseDrillIds.includes(drillId)) return;
  writeFiveMenuState({
    ...current,
    completedTenseDrillIds: [...current.completedTenseDrillIds, drillId],
  });
}

export function markShadowingSegmentCompleted(segmentId: string, addMinutes = 2): void {
  const current = readFiveMenuState();
  const hasSegment = current.completedShadowingSegmentIds.includes(segmentId);
  const nextSegments = hasSegment
    ? current.completedShadowingSegmentIds
    : [...current.completedShadowingSegmentIds, segmentId];
  const nextMinutes = Math.min(60, current.shadowingMinutesToday + (hasSegment ? 1 : addMinutes));
  writeFiveMenuState({
    ...current,
    completedShadowingSegmentIds: nextSegments,
    shadowingMinutesToday: nextMinutes,
    lastShadowingDate: todayKey(),
  });
}

export function recordDiagnosticScore(score: number): void {
  const current = readFiveMenuState();
  writeFiveMenuState({
    ...current,
    diagnosticScore: score,
  });
}

export function addScheduleItem(item: Omit<ScheduleItem, "id" | "completed">): void {
  const current = readFiveMenuState();
  const newItem: ScheduleItem = {
    ...item,
    id: `sched-${Date.now()}`,
    completed: false,
  };
  writeFiveMenuState({
    ...current,
    schedule: [...current.schedule, newItem],
  });
}

export function toggleScheduleItem(id: string): void {
  const current = readFiveMenuState();
  writeFiveMenuState({
    ...current,
    schedule: current.schedule.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    ),
  });
}

export function resetFiveMenuProgress(): void {
  writeFiveMenuState({
    ...DEFAULT_FIVE_MENU_STATE,
    lastShadowingDate: todayKey(),
  });
}

