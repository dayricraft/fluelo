/**
 * Static foundation curriculum metadata.
 *
 * The map includes active lessons and future previews. Only lessons backed by
 * course content can award XP or contribute to persisted learning progress.
 */

export type FoundationLevel = "A1" | "A2";

export type LessonKind =
  | "vocabulary"
  | "grammar"
  | "sentence-builder"
  | "listening"
  | "pronunciation"
  | "checkpoint";

export type UnitAccent = "emerald" | "sky" | "violet" | "amber" | "rose" | "indigo";

export interface FoundationLesson {
  id: string;
  kind: LessonKind;
  title: string;
  description: string;
  durationMin: number;
  /** One-time reward granted after every exercise in an active lesson is submitted. */
  xp: number;
}

export interface FoundationUnit {
  id: string;
  level: FoundationLevel;
  order: number;
  title: string;
  description: string;
  emoji: string;
  accent: UnitAccent;
  vocabularyFocus: string[];
  grammarFocus: string[];
  lessons: FoundationLesson[];
}

export const LESSON_KIND_LABELS: Record<LessonKind, string> = {
  vocabulary: "Kosakata",
  grammar: "Grammar",
  "sentence-builder": "Susun kalimat",
  listening: "Listening",
  pronunciation: "Pronunciation",
  checkpoint: "Checkpoint",
};

export const FOUNDATION_UNITS: FoundationUnit[] = [
  {
    id: "a1-introduce-yourself",
    level: "A1",
    order: 1,
    title: "Introduce Yourself",
    description: "Kenalkan nama, asal, pekerjaan, dan hal sederhana tentang dirimu.",
    emoji: "👋",
    accent: "emerald",
    vocabularyFocus: ["name & country", "jobs", "age", "greetings"],
    grammarFocus: ["I / you / he / she", "am / is / are", "simple questions"],
    lessons: [
      {
        id: "a1-u1-greetings",
        kind: "vocabulary",
        title: "Hello, I’m …",
        description: "Pelajari sapaan serta kata penting untuk identitas diri.",
        durationMin: 5,
        xp: 10,
      },
      {
        id: "a1-u1-pronouns-to-be",
        kind: "grammar",
        title: "Pronouns + to be",
        description: "Gunakan I am, you are, he is, dan she is dengan tepat.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u1-build-introduction",
        kind: "sentence-builder",
        title: "Build your introduction",
        description: "Susun perkenalan singkat dalam urutan yang alami.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u1-listen-new-friends",
        kind: "listening",
        title: "Meet two new friends",
        description: "Tangkap nama, negara, dan pekerjaan dari dialog pendek.",
        durationMin: 6,
        xp: 15,
      },
      {
        id: "a1-u1-say-your-name",
        kind: "pronunciation",
        title: "Say it clearly",
        description: "Latih ritme kalimat “My name is …” dan “I’m from …”.",
        durationMin: 5,
        xp: 15,
      },
      {
        id: "a1-u1-checkpoint",
        kind: "checkpoint",
        title: "Your 30-second intro",
        description: "Gabungkan kosakata dan grammar menjadi perkenalan utuh.",
        durationMin: 8,
        xp: 20,
      },
    ],
  },
  {
    id: "a1-daily-routine",
    level: "A1",
    order: 2,
    title: "Daily Routine",
    description: "Ceritakan kegiatan harian, waktu, dan kebiasaan sederhana.",
    emoji: "⏰",
    accent: "sky",
    vocabularyFocus: ["daily verbs", "telling time", "morning to night", "frequency"],
    grammarFocus: ["present simple", "do / does", "third-person -s"],
    lessons: [
      {
        id: "a1-u2-routine-verbs",
        kind: "vocabulary",
        title: "Wake up to go to bed",
        description: "Kenali kata kerja yang paling sering dipakai untuk rutinitas.",
        durationMin: 5,
        xp: 10,
      },
      {
        id: "a1-u2-present-simple",
        kind: "grammar",
        title: "Present simple",
        description: "Bedakan bentuk I work dan she works dalam kalimat positif.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u2-does-questions",
        kind: "grammar",
        title: "Do you? Does she?",
        description: "Buat pertanyaan dan jawaban pendek memakai do atau does.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u2-order-the-day",
        kind: "sentence-builder",
        title: "Put the day in order",
        description: "Rangkai aktivitas dari pagi hingga malam dengan keterangan waktu.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u2-listen-schedule",
        kind: "listening",
        title: "A busy weekday",
        description: "Dengarkan jadwal singkat dan pilih waktu yang benar.",
        durationMin: 6,
        xp: 15,
      },
      {
        id: "a1-u2-checkpoint",
        kind: "checkpoint",
        title: "Tell me about your day",
        description: "Jelaskan rutinitasmu dalam lima kalimat sederhana.",
        durationMin: 8,
        xp: 20,
      },
    ],
  },
  {
    id: "a1-past-activities",
    level: "A1",
    order: 3,
    title: "Past Activities",
    description: "Ceritakan apa yang kamu lakukan kemarin dengan bentuk lampau dasar.",
    emoji: "📸",
    accent: "violet",
    vocabularyFocus: ["weekend activities", "yesterday", "time expressions", "common verbs"],
    grammarFocus: ["was / were", "past simple", "common irregular verbs"],
    lessons: [
      {
        id: "a1-u3-weekend-words",
        kind: "vocabulary",
        title: "Yesterday and last weekend",
        description: "Pelajari aktivitas umum dan penanda waktu lampau.",
        durationMin: 5,
        xp: 10,
      },
      {
        id: "a1-u3-was-were",
        kind: "grammar",
        title: "Was and were",
        description: "Ceritakan keadaan atau lokasi di masa lalu dengan to be.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u3-past-verbs",
        kind: "grammar",
        title: "Played, went, had",
        description: "Kenali pola -ed dan kata kerja tidak beraturan yang paling umum.",
        durationMin: 8,
        xp: 15,
      },
      {
        id: "a1-u3-build-weekend-story",
        kind: "sentence-builder",
        title: "Build a weekend story",
        description: "Susun kejadian lampau menjadi cerita pendek yang runtut.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u3-listen-yesterday",
        kind: "listening",
        title: "What did they do?",
        description: "Temukan aktivitas utama dari tiga cerita mini.",
        durationMin: 6,
        xp: 15,
      },
      {
        id: "a1-u3-checkpoint",
        kind: "checkpoint",
        title: "My day yesterday",
        description: "Ceritakan tiga hal yang kamu lakukan kemarin.",
        durationMin: 8,
        xp: 20,
      },
    ],
  },
  {
    id: "a1-family-and-home",
    level: "A1",
    order: 4,
    title: "Family & Home",
    description: "Deskripsikan orang terdekat dan benda-benda di rumahmu.",
    emoji: "🏠",
    accent: "amber",
    vocabularyFocus: ["family members", "rooms", "home objects", "basic adjectives"],
    grammarFocus: ["have / has", "possessive adjectives", "this / that / these / those"],
    lessons: [
      {
        id: "a1-u4-family-home-words",
        kind: "vocabulary",
        title: "People and places at home",
        description: "Hubungkan anggota keluarga, ruangan, dan benda sehari-hari.",
        durationMin: 5,
        xp: 10,
      },
      {
        id: "a1-u4-have-has",
        kind: "grammar",
        title: "Have and has",
        description: "Nyatakan hubungan dan kepemilikan dengan bentuk yang sesuai.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u4-possessives",
        kind: "grammar",
        title: "My, your, his, her",
        description: "Pilih possessive adjective tanpa menerjemahkan kata per kata.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u4-describe-room",
        kind: "sentence-builder",
        title: "Describe a room",
        description: "Gabungkan this, that, dan adjective dalam deskripsi singkat.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a1-u4-pronounce-family",
        kind: "pronunciation",
        title: "Family word stress",
        description: "Latih tekanan kata pada mother, brother, dan family.",
        durationMin: 5,
        xp: 15,
      },
      {
        id: "a1-u4-checkpoint",
        kind: "checkpoint",
        title: "Meet my family",
        description: "Perkenalkan satu anggota keluarga dan tempat tinggalmu.",
        durationMin: 8,
        xp: 20,
      },
    ],
  },
  {
    id: "a2-food-and-shopping",
    level: "A2",
    order: 1,
    title: "Food & Shopping",
    description: "Pesan makanan, tanyakan harga, dan bicarakan jumlah dengan percaya diri.",
    emoji: "🛒",
    accent: "rose",
    vocabularyFocus: ["food & drinks", "prices", "containers", "shopping phrases"],
    grammarFocus: ["countable / uncountable", "some / any", "how much / how many"],
    lessons: [
      {
        id: "a2-u1-food-shopping-words",
        kind: "vocabulary",
        title: "At the café and market",
        description: "Pelajari menu, barang belanjaan, harga, dan satuan umum.",
        durationMin: 5,
        xp: 10,
      },
      {
        id: "a2-u1-countable",
        kind: "grammar",
        title: "An apple or some rice?",
        description: "Bedakan countable dan uncountable nouns dalam konteks nyata.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a2-u1-quantities",
        kind: "grammar",
        title: "Some, any, much, many",
        description: "Tanyakan dan jelaskan jumlah dengan quantifier dasar.",
        durationMin: 8,
        xp: 15,
      },
      {
        id: "a2-u1-build-an-order",
        kind: "sentence-builder",
        title: "Build an order",
        description: "Rangkai permintaan yang sopan dari salam hingga pembayaran.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a2-u1-listen-cafe",
        kind: "listening",
        title: "What did they order?",
        description: "Tangkap item, jumlah, dan harga dari percakapan di kafe.",
        durationMin: 6,
        xp: 15,
      },
      {
        id: "a2-u1-checkpoint",
        kind: "checkpoint",
        title: "Order for two",
        description: "Selesaikan simulasi memesan makanan untuk dua orang.",
        durationMin: 8,
        xp: 20,
      },
    ],
  },
  {
    id: "a2-plans-and-invitations",
    level: "A2",
    order: 2,
    title: "Plans & Invitations",
    description: "Bicarakan rencana dekat, buat ajakan, dan sepakati waktu bertemu.",
    emoji: "📅",
    accent: "indigo",
    vocabularyFocus: ["future time", "weekend plans", "events", "invitation phrases"],
    grammarFocus: ["be going to", "would you like to", "present continuous for plans"],
    lessons: [
      {
        id: "a2-u2-plan-words",
        kind: "vocabulary",
        title: "This weekend and next week",
        description: "Gunakan penanda waktu dan aktivitas untuk membahas agenda.",
        durationMin: 5,
        xp: 10,
      },
      {
        id: "a2-u2-going-to",
        kind: "grammar",
        title: "Be going to",
        description: "Nyatakan niat dan rencana yang sudah dipikirkan.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a2-u2-invitations",
        kind: "grammar",
        title: "Invite and respond",
        description: "Gunakan ajakan, penerimaan, dan penolakan yang ramah.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a2-u2-build-chat-plan",
        kind: "sentence-builder",
        title: "Plan it in a chat",
        description: "Susun percakapan ajakan sampai waktu dan tempatnya jelas.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a2-u2-pronounce-contractions",
        kind: "pronunciation",
        title: "Natural contractions",
        description: "Latih I’m, we’re, dan can’t agar terdengar lebih natural.",
        durationMin: 5,
        xp: 15,
      },
      {
        id: "a2-u2-checkpoint",
        kind: "checkpoint",
        title: "Make a weekend plan",
        description: "Undang teman dan sepakati sebuah rencana akhir pekan.",
        durationMin: 8,
        xp: 20,
      },
    ],
  },
  {
    id: "a2-around-town",
    level: "A2",
    order: 3,
    title: "Around Town & Travel",
    description: "Tanyakan arah, jelaskan lokasi, dan bandingkan pilihan perjalanan.",
    emoji: "🗺️",
    accent: "sky",
    vocabularyFocus: ["places in town", "directions", "transport", "travel adjectives"],
    grammarFocus: ["prepositions of place", "imperatives", "comparatives"],
    lessons: [
      {
        id: "a2-u3-town-travel-words",
        kind: "vocabulary",
        title: "Find your way",
        description: "Kenali tempat umum, transportasi, dan petunjuk arah.",
        durationMin: 5,
        xp: 10,
      },
      {
        id: "a2-u3-prepositions",
        kind: "grammar",
        title: "Next to, across from, between",
        description: "Jelaskan posisi tempat dengan preposition yang akurat.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a2-u3-comparatives",
        kind: "grammar",
        title: "Faster or cheaper?",
        description: "Bandingkan rute dan transportasi memakai comparative adjectives.",
        durationMin: 8,
        xp: 15,
      },
      {
        id: "a2-u3-build-directions",
        kind: "sentence-builder",
        title: "Give clear directions",
        description: "Rangkai petunjuk jalan langkah demi langkah.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a2-u3-listen-station",
        kind: "listening",
        title: "Which way to the station?",
        description: "Ikuti arah dari dialog dan tentukan lokasi tujuan.",
        durationMin: 6,
        xp: 15,
      },
      {
        id: "a2-u3-checkpoint",
        kind: "checkpoint",
        title: "Help a visitor",
        description: "Beri arah dan sarankan transportasi kepada seorang pengunjung.",
        durationMin: 8,
        xp: 20,
      },
    ],
  },
  {
    id: "a2-life-experiences",
    level: "A2",
    order: 4,
    title: "Life Experiences",
    description: "Bagikan pengalaman, detail kejadian, dan opini sederhana sebagai penutup A2.",
    emoji: "🌏",
    accent: "emerald",
    vocabularyFocus: ["travel experiences", "milestones", "feelings", "story connectors"],
    grammarFocus: ["present perfect", "ever / never", "present perfect vs past simple"],
    lessons: [
      {
        id: "a2-u4-experience-words",
        kind: "vocabulary",
        title: "Things you have done",
        description: "Pelajari kata untuk perjalanan, pencapaian, dan perasaan.",
        durationMin: 5,
        xp: 10,
      },
      {
        id: "a2-u4-present-perfect",
        kind: "grammar",
        title: "Have you ever …?",
        description: "Tanyakan pengalaman dengan present perfect dan ever atau never.",
        durationMin: 8,
        xp: 15,
      },
      {
        id: "a2-u4-perfect-vs-past",
        kind: "grammar",
        title: "Experience or finished time?",
        description: "Pilih present perfect atau past simple berdasarkan konteks waktu.",
        durationMin: 8,
        xp: 15,
      },
      {
        id: "a2-u4-build-experience-story",
        kind: "sentence-builder",
        title: "Add the details",
        description: "Mulai dari pengalaman umum lalu tambahkan kapan dan bagaimana.",
        durationMin: 7,
        xp: 15,
      },
      {
        id: "a2-u4-pronounce-connected",
        kind: "pronunciation",
        title: "Connected speech",
        description: "Latih have you dan I’ve agar terdengar lancar tanpa kehilangan kejelasan.",
        durationMin: 6,
        xp: 15,
      },
      {
        id: "a2-u4-checkpoint",
        kind: "checkpoint",
        title: "A2 foundation checkpoint",
        description: "Gabungkan pengalaman, detail lampau, dan opini dalam cerita singkat.",
        durationMin: 10,
        xp: 25,
      },
    ],
  },
];
