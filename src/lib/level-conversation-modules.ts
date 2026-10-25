export interface ChatTurn {
  sender: "ai" | "user";
  text: string;
}

export interface ModuleVocab {
  word: string;
  meaning: string;
  example: string;
}

export interface ModuleCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface ConversationModule {
  id: string;
  partnerName: "Sarah" | "Emma" | "Sophia" | "David" | "Kenji";
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  topicTitle: string;
  topicTitleId: string;
  category: string;
  brief: string;
  initialGreeting: string;
  initialChat: ChatTurn[];
  nextExchanges: { user: string; ai: string }[];
  suggestions: string[];
  vocabUpgrades: ModuleVocab[];
  recommendedCorrections: ModuleCorrection[];
}

export const LEVEL_CONVERSATION_MODULES: ConversationModule[] = [
  // ==========================================
  // SARAH (Daily & Professional Talk / Cafe & Business)
  // ==========================================
  // A1 - Sarah
  {
    id: "sarah-a1-cafe",
    partnerName: "Sarah",
    level: "A1",
    topicTitle: "Morning Coffee & Breakfast at Perk Cafe",
    topicTitleId: "Pesan Kopi & Sarapan Pagi di Kafe",
    category: "Daily Talk",
    brief: "Pesan minuman hangat dan sarapan sederhana dengan kalimat pendek.",
    initialGreeting: "Hi Alex! Welcome to Perk Cafe. What would you like to drink this morning?",
    initialChat: [
      { sender: "ai", text: "Hi Alex! Welcome to Perk Cafe. What would you like to drink this morning?" },
      { sender: "user", text: "Hi Sarah! Can I get an iced latte, please?" },
      { sender: "ai", text: "Sure thing! Would you like that for here or to go?" }
    ],
    nextExchanges: [
      {
        user: "For here, please. I also want a fresh croissant.",
        ai: "Great choice! I will warm it up for you. How is your morning going?"
      },
      {
        user: "It is going well, thank you. The weather is very nice today.",
        ai: "I agree! It is a lovely sunny day. Enjoy your coffee, Alex!"
      }
    ],
    suggestions: [
      "Can I get an iced latte, please?",
      "Do you have fresh croissants?",
      "How much is a cup of coffee?",
      "Just a bottle of water for me"
    ],
    vocabUpgrades: [
      { word: "For here / To go", meaning: "Minum di tempat atau dibawa pulang", example: "I would like an iced tea to go, please." },
      { word: "Warm up", meaning: "Menghangatkan makanan", example: "Could you warm up this muffin for me?" },
      { word: "Iced latte", meaning: "Kopi susu dengan es batu", example: "An iced latte with oat milk is my favorite drink." }
    ],
    recommendedCorrections: [
      { original: "Can I coffee", corrected: "Could I please get a cup of coffee?", explanation: "Gunakan 'Could I please get...' agar terdengar sopan saat memesan di kasir." }
    ]
  },
  {
    id: "sarah-a1-lunch",
    partnerName: "Sarah",
    level: "A1",
    topicTitle: "Ordering a Quick Sandwich Lunch",
    topicTitleId: "Memesan Menu Roti Sandwich Siang",
    category: "Daily Talk",
    brief: "Memilih roti, isian, dan saus favorit untuk makan siang santai.",
    initialGreeting: "Hello Alex! Are you ready for lunch? What kind of sandwich do you like?",
    initialChat: [
      { sender: "ai", text: "Hello Alex! Are you ready for lunch? What kind of sandwich do you like?" },
      { sender: "user", text: "Hi Sarah! I like chicken and cheese sandwich." },
      { sender: "ai", text: "Yummy! Would you like white bread or wheat bread?" }
    ],
    nextExchanges: [
      {
        user: "Wheat bread, please. With extra tomatoes.",
        ai: "Coming right up! Would you like some potato chips on the side?"
      },
      {
        user: "Yes, please. That sounds very good.",
        ai: "Perfect! Your sandwich will be ready in two minutes."
      }
    ],
    suggestions: [
      "Chicken and cheese sandwich, please",
      "Do you have vegetable soup today?",
      "Can I have wheat bread, please?",
      "How much is the lunch set?"
    ],
    vocabUpgrades: [
      { word: "On the side", meaning: "Sebagai makanan pendamping", example: "Can I have some salad on the side?" },
      { word: "Wheat bread", meaning: "Roti gandum", example: "I prefer wheat bread for my toast." }
    ],
    recommendedCorrections: [
      { original: "I want sandwich", corrected: "I would like a sandwich, please.", explanation: "Gunakan 'I would like...' untuk meminta pesanan dengan ramah." }
    ]
  },

  // A2 - Sarah
  {
    id: "sarah-a2-brunch",
    partnerName: "Sarah",
    level: "A2",
    topicTitle: "Weekend Brunch with Friends",
    topicTitleId: "Brunch Akhir Pekan Bersama Teman",
    category: "Food & Social",
    brief: "Menjelaskan preferensi makanan, meja santai, dan rencana akhir pekan.",
    initialGreeting: "Hey Alex! Table for two by the sunny window today? What are you in the mood to eat?",
    initialChat: [
      { sender: "ai", text: "Hey Alex! Table for two by the sunny window today? What are you in the mood to eat?" },
      { sender: "user", text: "Hi Sarah! I am craving pancakes with fresh strawberries and honey." },
      { sender: "ai", text: "That is our bestseller on weekends! Are your friends joining you soon?" }
    ],
    nextExchanges: [
      {
        user: "Yes, they will arrive in ten minutes. Can we also sit outside on the patio?",
        ai: "Of course! The breeze outside is fantastic today. I will hold table five for you."
      },
      {
        user: "Thank you so much! We are planning to visit the bookstore after brunch.",
        ai: "Sounds like a wonderful Saturday plan. Let me grab your menus right away!"
      }
    ],
    suggestions: [
      "I am craving pancakes with fresh strawberries",
      "Can we sit outside on the patio?",
      "What do you recommend for brunch today?",
      "We will order some fresh orange juice too"
    ],
    vocabUpgrades: [
      { word: "Craving", meaning: "Sangat ingin menyantap sesuatu", example: "I was craving hot noodle soup on this rainy afternoon." },
      { word: "Patio", meaning: "Area teras santai di luar ruangan", example: "Sitting on the patio is so refreshing." }
    ],
    recommendedCorrections: [
      { original: "We want sit outside", corrected: "Could we please sit outside on the patio?", explanation: "Gunakan 'Could we please sit...' untuk menanyakan ketersediaan tempat duduk." }
    ]
  },

  // B1 - Sarah
  {
    id: "sarah-b1-productivity",
    partnerName: "Sarah",
    level: "B1",
    topicTitle: "Cafe Work Culture & Remote Productivity",
    topicTitleId: "Bekerja di Kafe & Produktivitas Remote",
    category: "Lifestyle & Work",
    brief: "Menyampaikan opini tentang kenyamanan kerja dari kafe vs kerja di rumah.",
    initialGreeting: "Hey Alex! Many people are working on their laptops here today. Do you find cafes or your home quieter for focused study?",
    initialChat: [
      { sender: "ai", text: "Hey Alex! Many people are working on their laptops here today. Do you find cafes or your home quieter for focused study?" },
      { sender: "user", text: "Personally, I find the gentle background hum in cafes keeps me energized and prevents me from getting distracted." },
      { sender: "ai", text: "I totally agree! The ambiance makes a big difference. How do you manage your screen breaks when working for long hours?" }
    ],
    nextExchanges: [
      {
        user: "I usually follow the Pomodoro technique, taking a five-minute walk every half hour to clear my head.",
        ai: "That is a smart habit! Physical movement really boosts cognitive stamina. Do you ever collaborate with peers while remote?"
      },
      {
        user: "We hop on quick video syncs in the morning, then work asynchronously for the rest of the day.",
        ai: "Asynchronous communication is such a game changer for modern workflows!"
      }
    ],
    suggestions: [
      "The background ambiance keeps me energized",
      "Working from home saves two hours of traffic daily",
      "I take short breaks to prevent screen fatigue",
      "Asynchronous collaboration gives me deeper focus"
    ],
    vocabUpgrades: [
      { word: "Ambiance", meaning: "Suasana atau atmosfer tempat", example: "The cozy ambiance makes it easy to concentrate." },
      { word: "Asynchronous", meaning: "Komunikasi tanpa harus bersamaan waktunya", example: "Our team relies on asynchronous updates via chat." }
    ],
    recommendedCorrections: [
      { original: "Home have many noise", corrected: "There are too many distractions at home.", explanation: "Gunakan 'There are too many distractions...' daripada terjemahan harfiah 'home have many noise'." }
    ]
  },

  // B2 - Sarah
  {
    id: "sarah-b2-negotiation",
    partnerName: "Sarah",
    level: "B2",
    topicTitle: "Client Pitch & Pricing Negotiation",
    topicTitleId: "Pitching Klien & Negosiasi Nilai Proyek",
    category: "Professional & Business",
    brief: "Mendiskusikan strategi penawaran proposal, menetapkan nilai, dan mengatasi keberatan klien.",
    initialGreeting: "Good morning Alex! Our agency is finalizing a major enterprise pitch today. How do you approach negotiating project scope when a client pushes for budget discounts?",
    initialChat: [
      { sender: "ai", text: "Good morning Alex! Our agency is finalizing a major enterprise pitch today. How do you approach negotiating project scope when a client pushes for budget discounts?" },
      { sender: "user", text: "Rather than simply slashing our rates, I prefer offering tiered scope options so they clearly see the trade-offs involved." },
      { sender: "ai", text: "Spot on! That anchors the perceived value of your expertise. What is your go-to strategy when clients ask for unrealistic turnaround deadlines?" }
    ],
    nextExchanges: [
      {
        user: "I map out the critical dependencies on a visual timeline, showing that compressing QA testing directly jeopardizes product stability.",
        ai: "Transparent risk communication is the hallmark of a mature partner. How do you ensure the stakeholder signs off on those parameters?"
      },
      {
        user: "We formalize an explicit Statement of Work with predefined milestone acceptance criteria before initiating sprint development.",
        ai: "Excellent governance. That completely eliminates scope creep down the line."
      }
    ],
    suggestions: [
      "I offer tiered scope options instead of discounting rates",
      "Transparent timeline mapping prevents unrealistic client expectations",
      "A formalized Statement of Work prevents scope creep",
      "We emphasize long-term ROI over short-term price cuts"
    ],
    vocabUpgrades: [
      { word: "Scope creep", meaning: "Pelebaran cakupan kerja tanpa penyesuaian biaya/waktu", example: "Clear milestone definitions protect the team against scope creep." },
      { word: "Anchor value", meaning: "Menetapkan patokan nilai standar sejak awal", example: "We anchored our value proposition around measurable user engagement." }
    ],
    recommendedCorrections: [
      { original: "We must lower price to win client", corrected: "We should articulate our distinct value proposition instead of entering a price war.", explanation: "Dalam konteks profesional B2, gunakan frasa 'articulate our value proposition' daripada sekadar menurunkan harga." }
    ]
  },

  // C1 - Sarah
  {
    id: "sarah-c1-strategy",
    partnerName: "Sarah",
    level: "C1",
    topicTitle: "Corporate Brand Restructuring & Crisis PR",
    topicTitleId: "Restrukturisasi Brand Korporat & Manajemen Krisis",
    category: "Executive Strategy",
    brief: "Menganalisis krisis reputasi korporat, transparansi stakeholder, dan resiliensi brand.",
    initialGreeting: "Welcome Alex. In today's volatile digital sphere, corporate reputation hinges on crisis agility. How should executive leadership address stakeholder skepticism during a high-stakes brand restructuring?",
    initialChat: [
      { sender: "ai", text: "Welcome Alex. In today's volatile digital sphere, corporate reputation hinges on crisis agility. How should executive leadership address stakeholder skepticism during a high-stakes brand restructuring?" },
      { sender: "user", text: "Radical transparency is paramount. Leadership must candidly acknowledge past operational misalignments rather than relying on sanitized corporate spin." },
      { sender: "ai", text: "A compelling thesis. Yet, unvarnished disclosure occasionally triggers acute panic among institutional investors. How do you calibrate that tension?" }
    ],
    nextExchanges: [
      {
        user: "By pairing transparent post-mortems with definitive, measurable remediation milestones, you replace speculative anxiety with disciplined predictability.",
        ai: "Precisely. Predictability reconstructs institutional confidence far more effectively than rhetorical optimism. What role does internal organizational culture play here?"
      },
      {
        user: "If internal frontline employees are not genuinely aligned with the narrative, external public relations inevitably collapse under scrutiny.",
        ai: "Incontrovertible insight. Authentic brand equity is invariably an inside-out phenomenon."
      }
    ],
    suggestions: [
      "Radical transparency mitigates reputational erosion",
      "Authentic accountability supersedes sanitized PR spin",
      "Pairing post-mortems with concrete remediation milestones reassures investors",
      "Internal cultural alignment must precede external messaging campaigns"
    ],
    vocabUpgrades: [
      { word: "Remediation", meaning: "Tindakan terstruktur untuk memperbaiki kesalahan", example: "The executive team outlined an exhaustive remediation roadmap." },
      { word: "Unvarnished", meaning: "Jujur apa adanya tanpa dibungkus pemanis kata", example: "Stakeholders appreciated their unvarnished assessment of the deficit." }
    ],
    recommendedCorrections: [
      { original: "Boss must tell truth to everyone", corrected: "Executive leadership must champion proactive transparency to preserve brand equity.", explanation: "Di tingkat C1, gunakan terminologi 'executive leadership' dan 'brand equity' untuk mengekspresikan wacana manajerial tingkat tinggi." }
    ]
  },

  // ==========================================
  // EMMA (Grammar & Language Coach / Bubble Pop Cloud)
  // ==========================================
  // A1 - Emma
  {
    id: "emma-a1-family",
    partnerName: "Emma",
    level: "A1",
    topicTitle: "Simple Present: My Family & Daily Habits",
    topicTitleId: "Simple Present: Keluarga & Kebiasaan Sehari-hari",
    category: "Grammar Foundation",
    brief: "Latihan pola kalimat dasar Simple Present tense dengan kosa kata keluarga.",
    initialGreeting: "Hello Alex! Let's practice simple sentences. Do you live with your family or friends in the city?",
    initialChat: [
      { sender: "ai", text: "Hello Alex! Let's practice simple sentences. Do you live with your family or friends in the city?" },
      { sender: "user", text: "I live with my parents and my younger brother." },
      { sender: "ai", text: "That is wonderful! Does your brother also study English?" }
    ],
    nextExchanges: [
      {
        user: "Yes, he studies English at school every morning.",
        ai: "Perfect third-person singular! You said 'he studies' correctly. Good job!"
      },
      {
        user: "Thank you Emma! We often speak English at home together.",
        ai: "Speaking together at home is the best practice. Keep it up!"
      }
    ],
    suggestions: [
      "I live with my parents and younger brother",
      "My brother studies English every morning",
      "We often practice speaking at home",
      "I like to read English books on Sunday"
    ],
    vocabUpgrades: [
      { word: "Younger brother", meaning: "Adik laki-laki", example: "My younger brother is ten years old." },
      { word: "Every morning", meaning: "Setiap pagi (kebiasaan rutin)", example: "I drink warm water every morning." }
    ],
    recommendedCorrections: [
      { original: "He study English", corrected: "He studies English every day.", explanation: "Untuk subjek orang ketiga tunggal (he/she/it), tambahkan -s atau -es pada kata kerja: 'He studies'." }
    ]
  },

  // A2 - Emma
  {
    id: "emma-a2-past-trip",
    partnerName: "Emma",
    level: "A2",
    topicTitle: "Past Tense: Vacation in Bali & Memorable Trips",
    topicTitleId: "Past Tense: Liburan ke Bali & Wisata Berkesan",
    category: "Grammar & Stories",
    brief: "Menceritakan pengalaman liburan masa lalu menggunakan Simple Past Tense.",
    initialGreeting: "Hello Alex! Did you travel anywhere memorable during your last vacation?",
    initialChat: [
      { sender: "ai", text: "Hello Alex! Did you travel anywhere memorable during your last vacation?" },
      { sender: "user", text: "Yes, I visited Bali with my friends last summer." },
      { sender: "ai", text: "Lovely! What was your favorite memory from that trip?" }
    ],
    nextExchanges: [
      {
        user: "We watched the sunset at Uluwatu Temple and ate seafood on the beach.",
        ai: "That sounds magical! Did you take many photographs there?"
      },
      {
        user: "Yes, I took more than a hundred photos on my camera.",
        ai: "Excellent use of the irregular past tense 'took'! Your storytelling is improving rapidly."
      }
    ],
    suggestions: [
      "I visited Bali with my friends last summer",
      "We watched the sunset at Uluwatu Temple",
      "I tasted authentic traditional seafood dishes",
      "The local people were very warm and friendly"
    ],
    vocabUpgrades: [
      { word: "Memorable", meaning: "Sangat berkesan dan tak terlupakan", example: "It was a truly memorable journey." },
      { word: "Breathtaking", meaning: "Sangat indah menakjubkan", example: "The sunset view was breathtaking." }
    ],
    recommendedCorrections: [
      { original: "We go to beach yesterday", corrected: "We went to the beach yesterday.", explanation: "Untuk peristiwa lampau, gunakan bentuk kedua dari 'go' yaitu 'went'." }
    ]
  },

  // B1 - Emma
  {
    id: "emma-b1-phrasal-verbs",
    partnerName: "Emma",
    level: "B1",
    topicTitle: "Phrasal Verbs & Giving Practical Advice",
    topicTitleId: "Phrasal Verbs & Memberikan Solusi Praktis",
    category: "Conversational Flow",
    brief: "Menggunakan phrasal verbs alami penutur asli untuk menceritakan problem solving.",
    initialGreeting: "Hi Alex! Let's master natural phrasal verbs today. What do you do when you run into an unexpected problem at work or school?",
    initialChat: [
      { sender: "ai", text: "Hi Alex! Let's master natural phrasal verbs today. What do you do when you run into an unexpected problem at work or school?" },
      { sender: "user", text: "When I run into a roadblock, I usually step back, break the problem down into manageable chunks, and figure it out step by step." },
      { sender: "ai", text: "Brilliant! You naturally integrated 'run into', 'step back', 'break down', and 'figure out'. Who do you turn to when you get stuck?" }
    ],
    nextExchanges: [
      {
        user: "I usually reach out to a trusted mentor or look up how others resolved similar hurdles.",
        ai: "Reaching out proactively demonstrates great resourcefulness. How do you keep from burning out?"
      },
      {
        user: "I make sure to wind down in the evenings by putting away my phone and going for a jog.",
        ai: "Winding down without digital screens is essential for cognitive recovery. Fantastic phrasing!"
      }
    ],
    suggestions: [
      "I step back and break the problem down",
      "I reach out to an experienced mentor for guidance",
      "I wind down in the evening without checking screens",
      "I figure out solutions by testing different approaches"
    ],
    vocabUpgrades: [
      { word: "Figure out", meaning: "Menemukan solusi setelah berpikir seksama", example: "We finally figured out the bug in the software." },
      { word: "Wind down", meaning: "Rileks beristirahat setelah hari yang sibuk", example: "A warm cup of herbal tea helps me wind down." }
    ],
    recommendedCorrections: [
      { original: "I search solution in google", corrected: "I looked up the solution online.", explanation: "Gunakan phrasal verb 'look up' untuk mencari informasi di internet atau kamus." }
    ]
  },

  // B2 - Emma
  {
    id: "emma-b2-remote-debate",
    partnerName: "Emma",
    level: "B2",
    topicTitle: "Debating Pros & Cons: Remote Work vs Office Culture",
    topicTitleId: "Debat Kelebihan & Kekurangan: WFH vs Budaya Kantor",
    category: "Nuanced Debate",
    brief: "Menimbang argumen fleksibilitas kerja jarak jauh versus kolaborasi tatap muka.",
    initialGreeting: "Welcome Alex! Multinational corporations are fiercely debating mandatory office return policies. What are the key advantages and drawbacks in your view?",
    initialChat: [
      { sender: "ai", text: "Welcome Alex! Multinational corporations are fiercely debating mandatory office return policies. What are the key advantages and drawbacks in your view?" },
      { sender: "user", text: "While remote work significantly alleviates commuting fatigue and enhances individual focus, it often comes at the expense of spontaneous creative synergy." },
      { sender: "ai", text: "You articulated that counter-balance effectively! How should enterprise leadership address the erosion of mentorship for junior team members?" }
    ],
    nextExchanges: [
      {
        user: "Organizations ought to designate specific on-site collaboration days dedicated entirely to peer workshops rather than solitary desk tasks.",
        ai: "An intentional hybrid model! What metrics would you track to confirm team cohesion remains robust?"
      },
      {
        user: "Quarterly employee engagement sentiments alongside project cross-functional velocity provide a comprehensive baseline.",
        ai: "Sophisticated synthesis. Your command of transitional adverbs and analytical vocabulary is stellar."
      }
    ],
    suggestions: [
      "Remote work alleviates commuting fatigue and boosts focus",
      "Spontaneous creative synergy is difficult to replicate over video calls",
      "Designating intentional on-site workshop days balances both worlds",
      "Junior mentorship requires structured peer shadow sessions"
    ],
    vocabUpgrades: [
      { word: "At the expense of", meaning: "Dengan mengorbankan hal lain", example: "Rapid delivery should not come at the expense of quality." },
      { word: "Synergy", meaning: "Kolaborasi yang menghasilkan efek berlipat ganda", example: "In-person brainstorms generate exceptional creative synergy." }
    ],
    recommendedCorrections: [
      { original: "Office is good but home is more relax", corrected: "While office environments foster spontaneous collaboration, working remotely affords greater autonomy and work-life balance.", explanation: "Gunakan klausa konsesif 'While...' untuk membandingkan dua sudut pandang secara profesional di level B2." }
    ]
  },

  // C1 - Emma
  {
    id: "emma-c1-diplomacy",
    partnerName: "Emma",
    level: "C1",
    topicTitle: "Nuanced Rhetoric, Tone & Cultural Diplomacy",
    topicTitleId: "Retorika Nuansa, Nada Bicara & Diplomasi Budaya",
    category: "Advanced Linguistic Precision",
    brief: "Menelaah kepekaan bahasa tidak langsung, diplomasi lintas budaya, dan etika komunikasi.",
    initialGreeting: "Good day Alex. Linguistic nuance is paramount in cross-cultural diplomacy. How do you calibrate indirect speech when navigating sensitive disagreements without compromising your core objectives?",
    initialChat: [
      { sender: "ai", text: "Good day Alex. Linguistic nuance is paramount in cross-cultural diplomacy. How do you calibrate indirect speech when navigating sensitive disagreements without compromising your core objectives?" },
      { sender: "user", text: "I employ conditional framing and strategic hedging, allowing the counter-party to evaluate divergent perspectives without feeling adversarial pressure." },
      { sender: "ai", text: "Masterful application of epistemic modality. However, does excessive hedging risk being perceived as evasive or equivocal in low-context cultures?" }
    ],
    nextExchanges: [
      {
        user: "Undoubtedly. That is precisely why cultural contextual literacy must guide the degree of directness; one must remain uncompromising on substance while remaining impeccably diplomatic in tone.",
        ai: "A quintessential distinction between substantive firmness and rhetorical grace. How do you cultivate such contextual fluency across diverse global cohorts?"
      },
      {
        user: "By cultivating deep sociolinguistic awareness and actively debriefing interactions with native cross-cultural advisors.",
        ai: "Flawless oratorical elegance. Your synthesis of complex communicative theories is exceptional."
      }
    ],
    suggestions: [
      "Conditional framing depersonalizes contentious disagreements",
      "Sociolinguistic literacy dictates the optimal degree of directness",
      "Firmness on substantive principles must accompany rhetorical grace",
      "Excessive hedging risks perceived ambiguity in low-context cultures"
    ],
    vocabUpgrades: [
      { word: "Equivocal", meaning: "Bermakna ganda atau tidak tegas secara sengaja", example: "His equivocal response left stakeholders uncertain." },
      { word: "Hedging", meaning: "Strategi bahasa untuk melembutkan ketegasan klaim", example: "Hedging devices like 'it appears that' foster diplomatic rapport." }
    ],
    recommendedCorrections: [
      { original: "We must speak soft so they not angry", corrected: "We should leverage diplomatic hedging to de-escalate friction while asserting our core stance.", explanation: "Pada tingkat C1, gunakan terminologi 'diplomatic hedging' dan 'asserting our core stance'." }
    ]
  },

  // ==========================================
  // SOPHIA (Travel & Culture Buddy / Breezy Cloud)
  // ==========================================
  // A1 - Sophia
  {
    id: "sophia-a1-airport",
    partnerName: "Sophia",
    level: "A1",
    topicTitle: "Airport Check-in Desk: Passport & Tickets",
    topicTitleId: "Check-in Bandara: Paspor & Tiket Penerbangan",
    category: "Travel Basics",
    brief: "Percakapan dasar di bandara untuk pemeriksaan paspor dan pemilihan kursi.",
    initialGreeting: "Hi Alex! Welcome to the airport check-in desk. Where are you flying today?",
    initialChat: [
      { sender: "ai", text: "Hi Alex! Welcome to the airport check-in desk. Where are you flying today?" },
      { sender: "user", text: "Hi Sophia! I am flying to Tokyo today." },
      { sender: "ai", text: "Exciting! May I see your passport and flight booking, please?" }
    ],
    nextExchanges: [
      {
        user: "Here is my passport. Could I have a window seat, please?",
        ai: "Certainly! Seat 14A is available. Do you have any luggage to check in?"
      },
      {
        user: "Just one suitcase, thank you. What time is boarding?",
        ai: "Boarding begins at 10:30 AM at gate 7. Have a wonderful flight!"
      }
    ],
    suggestions: [
      "I am flying to Tokyo today",
      "Here is my passport and ticket",
      "Could I have a window seat, please?",
      "Where is the boarding gate?"
    ],
    vocabUpgrades: [
      { word: "Boarding gate", meaning: "Pintu masuk menuju pesawat", example: "Please proceed to gate 12 immediately." },
      { word: "Window seat", meaning: "Kursi pesawat di dekat jendela", example: "I love looking at clouds from the window seat." }
    ],
    recommendedCorrections: [
      { original: "Give me window seat", corrected: "Could I have a window seat, please?", explanation: "Gunakan 'Could I have...' agar terdengar sopan kepada petugas bandara." }
    ]
  },

  // A2 - Sophia
  {
    id: "sophia-a2-hotel",
    partnerName: "Sophia",
    level: "A2",
    topicTitle: "Hotel Booking & Asking for City Directions",
    topicTitleId: "Check-in Hotel & Menanyakan Arah Jalan Kota",
    category: "Travel & Exploration",
    brief: "Check-in di resepsionis hotel dan menanyakan transportasi ke tempat wisata.",
    initialGreeting: "Hey Alex! Welcome to our boutique hotel. Are you checking in today?",
    initialChat: [
      { sender: "ai", text: "Hey Alex! Welcome to our boutique hotel. Are you checking in today?" },
      { sender: "user", text: "Yes, I have a reservation under the name Alex for three nights." },
      { sender: "ai", text: "Found your reservation! Here is your electronic key card for room 304. Breakfast is served on the rooftop." }
    ],
    nextExchanges: [
      {
        user: "Thank you! Could you tell me the fastest way to get to the Art Museum?",
        ai: "It is just a ten-minute walk down Maple Street, or you can take subway line two."
      },
      {
        user: "A walk sounds lovely since the weather is pleasant. Is it safe in the evening?",
        ai: "Very safe and well-lit! There are lively artisan bakeries and cafes all along that street."
      }
    ],
    suggestions: [
      "I have a reservation under the name Alex",
      "What time is breakfast served in the morning?",
      "Could you tell me the fastest way to the museum?",
      "Can I leave my bags here before check-in?"
    ],
    vocabUpgrades: [
      { word: "Reservation", meaning: "Pemesanan kamar hotel terlebih dahulu", example: "I confirmed my reservation online yesterday." },
      { word: "Within walking distance", meaning: "Dapat dicapai hanya dengan berjalan kaki", example: "The museum is within walking distance of the hotel." }
    ],
    recommendedCorrections: [
      { original: "Where is way museum?", corrected: "Excuse me, which way is the Art Museum?", explanation: "Gunakan 'Excuse me, which way is...' saat menanyakan rute perjalanan." }
    ]
  },

  // B1 - Sophia
  {
    id: "sophia-b1-backpacking",
    partnerName: "Sophia",
    level: "B1",
    topicTitle: "Solo Backpacking vs Guided Tour Adventures",
    topicTitleId: "Solo Backpacking vs Tur Terorganisir",
    category: "Travel Choices",
    brief: "Membandingkan keuntungan bepergian mandiri dengan kemudahan tur rombongan.",
    initialGreeting: "Hey Alex! Exploring new cultures is my greatest passion. Would you rather backpack solo on a flexible itinerary, or book a guided package tour?",
    initialChat: [
      { sender: "ai", text: "Hey Alex! Exploring new cultures is my greatest passion. Would you rather backpack solo on a flexible itinerary, or book a guided package tour?" },
      { sender: "user", text: "I definitely gravitate toward solo backpacking because it allows me to pivot my plans whenever I discover an off-the-beaten-path village." },
      { sender: "ai", text: "I love that adventurous spirit! How do you handle language barriers when you venture outside tourist hubs?" }
    ],
    nextExchanges: [
      {
        user: "Learning a few local pleasantries like 'thank you' and using translation apps helps bridge the gap with heartwarming friendliness.",
        ai: "Local communities truly appreciate travelers who make an earnest effort to speak their tongue. Have you ever stayed in a traditional homestay?"
      },
      {
        user: "Yes, staying with a host family in Kyoto was the absolute highlight of my journey; sharing home-cooked meals felt so authentic.",
        ai: "Those unscripted human connections are why we travel in the first place!"
      }
    ],
    suggestions: [
      "Solo travel gives you complete freedom of your schedule",
      "Guided tours take all the logistical headache away",
      "Staying with local host families creates indelible memories",
      "Learning simple greetings bridges any language barrier"
    ],
    vocabUpgrades: [
      { word: "Off-the-beaten-path", meaning: "Tempat unik yang jarang dikunjungi turis umum", example: "We found an off-the-beaten-path cafe tucked in the alley." },
      { word: "Gravitate toward", meaning: "Cenderung lebih memilih suatu opsi", example: "I gravitate toward historical destinations over modern resorts." }
    ],
    recommendedCorrections: [
      { original: "I like travel alone more better", corrected: "I prefer traveling solo because it offers greater spontaneity.", explanation: "Hindari 'more better'. Gunakan 'I prefer traveling solo...' untuk struktur kalimat B1 yang matang." }
    ]
  },

  // B2 - Sophia
  {
    id: "sophia-b2-ecotourism",
    partnerName: "Sophia",
    level: "B2",
    topicTitle: "Sustainable Ecotourism & Cultural Preservation",
    topicTitleId: "Ekowisata Berkelanjutan & Pelestarian Budaya",
    category: "Environmental Stewardship",
    brief: "Mendiskusikan dampak over-tourism, etika berwisata, dan pemberdayaan ekonomi lokal.",
    initialGreeting: "Hello Alex! Over-tourism is placing severe environmental strain on fragile ecosystems and heritage sites. How can global travelers explore responsibly without degrading local communities?",
    initialChat: [
      { sender: "ai", text: "Hello Alex! Over-tourism is placing severe environmental strain on fragile ecosystems and heritage sites. How can global travelers explore responsibly without degrading local communities?" },
      { sender: "user", text: "Travelers should intentionally patronize locally owned enterprises rather than foreign resort conglomerates, ensuring economic capital recirculates within the community." },
      { sender: "ai", text: "An essential economic point! What role should municipal governments play in restricting foot traffic at endangered historical monuments?" }
    ],
    nextExchanges: [
      {
        user: "Implementing dynamic daily visitor quotas paired with conservation tariffs directly funds infrastructure restoration while safeguarding ecological integrity.",
        ai: "Venice and Machu Picchu are proving that tiered pricing and reservation caps are effective. How should travel influencers adjust their portrayal of fragile spots?"
      },
      {
        user: "Geotagging vulnerable wilderness spots often triggers destructive viral surges; creators must advocate for respectful stewardship rather than vanity clicks.",
        ai: "Spot on. Mindful curation must replace careless geotagging."
      }
    ],
    suggestions: [
      "Patronizing locally owned businesses empowers the community",
      "Dynamic visitor quotas protect fragile archaeological monuments",
      "Irresponsible geotagging accelerates environmental degradation",
      "Conservation tariffs directly subsidize ecological restoration"
    ],
    vocabUpgrades: [
      { word: "Patronize", meaning: "Menjadi pelanggan setia bisnis lokal", example: "We made an effort to patronize family-run eateries." },
      { word: "Ecosystem degradation", meaning: "Penurunan mutu atau kerusakan lingkungan alami", example: "Heavy foot traffic leads to rapid ecosystem degradation." }
    ],
    recommendedCorrections: [
      { original: "Tourist must not throw garbage in beach", corrected: "Travelers must uphold rigorous environmental stewardship to prevent coastal pollution.", explanation: "Gunakan 'uphold environmental stewardship' untuk artikulasi B2 yang elegan." }
    ]
  },

  // C1 - Sophia
  {
    id: "sophia-c1-geopolitics",
    partnerName: "Sophia",
    level: "C1",
    topicTitle: "Geopolitics of Global Tourism & Heritage Economics",
    topicTitleId: "Geopolitik Pariwisata Global & Ekonomi Warisan Budaya",
    category: "Global Policy & Ethics",
    brief: "Analisis paradoks monokultur pariwisata, gentrifikasi destinasi, dan kedaulatan masyarakat adat.",
    initialGreeting: "Greetings Alex. Developing tourist economies frequently confront the paradox between foreign exchange dependence and socio-cultural commodification. Where should sovereign policy draw the line?",
    initialChat: [
      { sender: "ai", text: "Greetings Alex. Developing tourist economies frequently confront the paradox between foreign exchange dependence and socio-cultural commodification. Where should sovereign policy draw the line?" },
      { sender: "user", text: "Over-reliance on tourism breeds extreme vulnerability to macro shocks, while unfettered capital inflows inevitably trigger hyper-gentrification that displaces indigenous populations." },
      { sender: "ai", text: "Incisive diagnosis. Yet, without tourism revenues, many agrarian economies lack the capital reserves to underwrite conservation. How is that equilibrium brokered?" }
    ],
    nextExchanges: [
      {
        user: "Through legally mandated community land trusts and sovereign heritage dividends, vesting indigenous councils with veto power over commercial developments.",
        ai: "Vesting governance power within the indigenous populace shifts the dynamic from exploitation to co-ownership. Does this model withstand developer lobbying?"
      },
      {
        user: "Only when codified into constitutional statute, insulating conservation frameworks from transient political cycles.",
        ai: "A profoundly astute governance blueprint. Your geopolitical fluency is impeccable."
      }
    ],
    suggestions: [
      "Over-reliance on tourism creates systemic vulnerability to global shocks",
      "Hyper-gentrification alienates and displaces indigenous heritage communities",
      "Community land trusts ensure conservation dividends remain localized",
      "Statutory protections insulate conservation policies from political expediency"
    ],
    vocabUpgrades: [
      { word: "Commodification", meaning: "Perubahan nilai budaya menjadi komoditas dagang semata", example: "Unchecked tourism leads to the commodification of sacred rituals." },
      { word: "Gentrification", meaning: "Perubahan kawasan yang menaikkan biaya hidup hingga menyingkirkan warga asli", example: "Short-term rentals fueled unprecedented urban gentrification." }
    ],
    recommendedCorrections: [
      { original: "Tourism makes everything expensive for local", corrected: "Unregulated tourist inflows catalyze severe economic gentrification, pricing out the indigenous population.", explanation: "Gunakan 'catalyze economic gentrification' dan 'pricing out indigenous populations' pada level C1." }
    ]
  },

  // ==========================================
  // DAVID (Career Mentor & Tech Lead / Thunder Cloud)
  // ==========================================
  // A1 - David
  {
    id: "david-a1-job",
    partnerName: "David",
    level: "A1",
    topicTitle: "Simple Job & Daily Study Introductions",
    topicTitleId: "Perkenalan Profesi & Jadwal Belajar Harian",
    category: "Career Basics",
    brief: "Menjelaskan profesi, hobi digital, dan jadwal kegiatan belajar harian.",
    initialGreeting: "Good morning Alex! Tell me: what do you do every day for work or school?",
    initialChat: [
      { sender: "ai", text: "Good morning Alex! Tell me: what do you do every day for work or school?" },
      { sender: "user", text: "I am a designer. I create user interfaces for mobile apps." },
      { sender: "ai", text: "That is awesome! Do you enjoy designing apps?" }
    ],
    nextExchanges: [
      {
        user: "Yes, I really love making colorful and user-friendly designs.",
        ai: "Creativity in technology is so rewarding! What software do you use most?"
      },
      {
        user: "I use Figma every day on my computer.",
        ai: "Figma is an industry favorite! Clear and confident introduction, Alex."
      }
    ],
    suggestions: [
      "I am a designer creating mobile apps",
      "I study English from Monday to Friday",
      "I love solving creative design puzzles",
      "I use computer software every day"
    ],
    vocabUpgrades: [
      { word: "User-friendly", meaning: "Mudah dan nyaman digunakan", example: "This app has a very user-friendly interface." },
      { word: "Rewarding", meaning: "Memberi kepuasan batin yang bermakna", example: "Helping others learn is so rewarding." }
    ],
    recommendedCorrections: [
      { original: "I work designer", corrected: "I work as a UI designer.", explanation: "Gunakan preposisi 'as': 'I work as a designer'." }
    ]
  },

  // A2 - David
  {
    id: "david-a2-standup",
    partnerName: "David",
    level: "A2",
    topicTitle: "Daily Standup Update & Office Routine",
    topicTitleId: "Update Standup Harian & Rutinitas Kantor",
    category: "Workplace Routine",
    brief: "Memberikan laporan singkat tugas kemarin, rencana hari ini, dan kendala kerja.",
    initialGreeting: "Hey Alex! Time for our morning standup. What tasks did you finish yesterday and what are you working on today?",
    initialChat: [
      { sender: "ai", text: "Hey Alex! Time for our morning standup. What tasks did you finish yesterday and what are you working on today?" },
      { sender: "user", text: "Yesterday I completed the checkout flow wireframes. Today I am conducting user testing on the prototype." },
      { sender: "ai", text: "Great progress! Are there any blockers or technical issues slowing you down?" }
    ],
    nextExchanges: [
      {
        user: "No blockers currently, but I will need design feedback from the engineers this afternoon.",
        ai: "Sounds solid! I will tag the engineering team in Slack so you can sync up at 2 PM."
      },
      {
        user: "Thanks David! That will keep the sprint on track.",
        ai: "Keep up the momentum. Let's build a fantastic product!"
      }
    ],
    suggestions: [
      "Yesterday I completed the wireframe mockups",
      "Today I am testing the interactive prototype",
      "No blockers on my end today",
      "I need a quick design review this afternoon"
    ],
    vocabUpgrades: [
      { word: "Blocker", meaning: "Kendala atau hambatan yang menghalangi pekerjaan", example: "We cleared the technical blocker before lunch." },
      { word: "On track", meaning: "Sesuai jadwal dan target yang direncanakan", example: "The sprint milestones remain on track." }
    ],
    recommendedCorrections: [
      { original: "I have no problem today", corrected: "There are no blockers on my end today.", explanation: "Dalam standup agile profesional, istilah baku untuk hambatan kerja adalah 'blockers'." }
    ]
  },

  // B1 - David
  {
    id: "david-b1-interview",
    partnerName: "David",
    level: "B1",
    topicTitle: "Job Interview Practice & Overcoming Challenges",
    topicTitleId: "Latihan Wawancara Kerja & Menghadapi Tantangan",
    category: "Professional Growth",
    brief: "Menjawab pertanyaan interview perilaku (behavioral) menggunakan metode STAR.",
    initialGreeting: "Good morning Alex! Tell me about a time you faced a difficult challenge on a project, and how you managed to resolve it.",
    initialChat: [
      { sender: "ai", text: "Good morning Alex! Tell me about a time you faced a difficult challenge on a project, and how you managed to resolve it." },
      { sender: "user", text: "When our team faced an abrupt deadline shift last quarter, I immediately organized a triage session to reprioritize high-impact deliverables." },
      { sender: "ai", text: "That demonstrates clear composure under pressure. How did you communicate the revised scope to key stakeholders?" }
    ],
    nextExchanges: [
      {
        user: "I presented a concise roadmap highlighting what features remained in the immediate release versus the subsequent update.",
        ai: "Transparency reassures executive stakeholders tremendously. What was the ultimate outcome?"
      },
      {
        user: "We launched on schedule with zero critical bugs, and user satisfaction scores actually surpassed our initial target.",
        ai: "An outstanding STAR story! Clear situation, action, and measurable results."
      }
    ],
    suggestions: [
      "I organized a triage session to reprioritize deliverables",
      "I communicated transparently with cross-functional stakeholders",
      "We launched on schedule with zero critical bugs",
      "That experience taught me adaptability and composure"
    ],
    vocabUpgrades: [
      { word: "Triage session", meaning: "Pertemuan cepat untuk memilah prioritas darurat", example: "We ran a triage session to categorize bug severity." },
      { word: "Composure", meaning: "Ketenangan sikap dalam menghadapi situasi sulit", example: "She maintained remarkable composure during the outage." }
    ],
    recommendedCorrections: [
      { original: "We have deadline very fast", corrected: "We were confronted with an exceptionally tight deadline.", explanation: "Gunakan 'confronted with a tight deadline' untuk mendeskripsikan situasi kerja di level B1." }
    ]
  },

  // B2 - David
  {
    id: "david-b2-tech-architecture",
    partnerName: "David",
    level: "B2",
    topicTitle: "Agile Sprints, Tech Architecture & Tradeoffs",
    topicTitleId: "Sprint Agile, Arsitektur Teknologi & Tradeoff",
    category: "Tech Leadership",
    brief: "Memilih antara merilis fitur cepat versus mengurangi technical debt dalam software engineering.",
    initialGreeting: "Hey Alex. We are currently torn between shipping an MVP feature set to capture early market share or dedicating the next sprint to refactoring legacy technical debt. What is your recommendation?",
    initialChat: [
      { sender: "ai", text: "Hey Alex. We are currently torn between shipping an MVP feature set to capture early market share or dedicating the next sprint to refactoring legacy technical debt. What is your recommendation?" },
      { sender: "user", text: "I advocate for a phased release strategy: ship a tightly scoped MVP behind feature flags while reserving 20% of sprint bandwidth for critical architectural refactoring." },
      { sender: "ai", text: "A balanced compromise! Feature flags give us rollback capability without halting user acquisition. How would you handle potential latency degradation?" }
    ],
    nextExchanges: [
      {
        user: "We should implement strict observability benchmarks and set up automated alerts whenever API response latencies breach the 200-millisecond threshold.",
        ai: "Robust observability is non-negotiable at our current scale. What if product managers resist allocating 20% bandwidth to tech debt?"
      },
      {
        user: "I demonstrate how unaddressed technical debt exponentially inflates future bug remediation costs, framing refactoring as risk mitigation rather than overhead.",
        ai: "Framing engineering quality in terms of business risk mitigation is executive-level communication."
      }
    ],
    suggestions: [
      "A phased release strategy behind feature flags minimizes exposure",
      "Allocating 20% of sprint bandwidth keeps technical debt manageable",
      "Observability benchmarks provide quantifiable latency data",
      "Refactoring should be framed as business risk mitigation"
    ],
    vocabUpgrades: [
      { word: "Technical debt", meaning: "Beban perbaikan kode di masa depan akibat shortcut rilis cepat", example: "Neglecting tests accumulated unsustainable technical debt." },
      { word: "Observability", meaning: "Kemampuan memantau kesehatan internal sistem secara real-time", example: "Telemetry and logs form the foundation of cloud observability." }
    ],
    recommendedCorrections: [
      { original: "Code is messy so we must rewrite", corrected: "Accumulated technical debt is degrading system maintainability and necessitates structured refactoring.", explanation: "Gunakan terminologi teknis 'accumulated technical debt' dan 'necessitates structured refactoring'." }
    ]
  },

  // C1 - David
  {
    id: "david-c1-ai-ethics",
    partnerName: "David",
    level: "C1",
    topicTitle: "Engineering Leadership, Ethics of Autonomous Systems & AI",
    topicTitleId: "Kepemimpinan Rekayasa, Etika Sistem Otonom & AI",
    category: "Strategic Technology Policy",
    brief: "Menelaah tata kelola kecerdasan buatan, akuntabilitas hukum algoritma, dan keamanan model otonom.",
    initialGreeting: "Good morning Alex. As autonomous generative AI models integrate deeper into mission-critical infrastructure, where does corporate fiduciary liability begin and algorithmic autonomy end?",
    initialChat: [
      { sender: "ai", text: "Good morning Alex. As autonomous generative AI models integrate deeper into mission-critical infrastructure, where does corporate fiduciary liability begin and algorithmic autonomy end?" },
      { sender: "user", text: "Corporate liability must remain strictly deterministic. The deployment of stochastic black-box models does not absolve executive leadership of systemic negligence." },
      { sender: "ai", text: "A rigorous stance. Yet, when agentic systems exhibit emergent decision-making beyond anticipated training parameters, can classical negligence statutes adequately adjudicate fault?" }
    ],
    nextExchanges: [
      {
        user: "Traditional tort law must evolve toward strict enterprise liability, necessitating cryptographically verifiable audit trails for every autonomous inference.",
        ai: "Cryptographic traceability turns intangible algorithmic choices into forensic evidence. Does this regulatory threshold stifle nascent open-source innovation?"
      },
      {
        user: "It introduces compliance friction, certainly, but unchecked deployment of unconstrained agentic architectures poses existential risks that dwarf regulatory inconvenience.",
        ai: "Profundity and technical rigor coalesce in your argument. Remarkable command of specialized discourse."
      }
    ],
    suggestions: [
      "Corporate liability must remain deterministic regardless of algorithmic complexity",
      "Deploying stochastic models does not absolve executives of negligence",
      "Cryptographic audit trails establish verifiable forensic accountability",
      "Existential systemic risks dwarf transient compliance friction"
    ],
    vocabUpgrades: [
      { word: "Stochastic", meaning: "Bersifat probabilistik atau acak dalam pola statistik", example: "Generative models produce stochastic outputs based on weights." },
      { word: "Deterministic", meaning: "Pasti dan dapat diprediksi dengan aturan baku", example: "Safety-critical flight controls require strictly deterministic logic." }
    ],
    recommendedCorrections: [
      { original: "If AI makes mistake company must pay", corrected: "Enterprises deploying autonomous systems must bear strict vicarious liability for emergent algorithmic harms.", explanation: "Di ranah C1, gunakan konsep hukum 'strict vicarious liability' dan 'emergent algorithmic harms'." }
    ]
  },

  // ==========================================
  // KENJI (Casual Life & Cultural Trends / Electric Cloud)
  // ==========================================
  // A1 - Kenji
  {
    id: "kenji-a1-movies",
    partnerName: "Kenji",
    level: "A1",
    topicTitle: "Weekend Movie & Snack Chat",
    topicTitleId: "Ngobrol Film Akhir Pekan & Camilan Santai",
    category: "Casual Hobbies",
    brief: "Mengobrol santai tentang film favorit, camilan popcorn, dan rencana libur.",
    initialGreeting: "Yo Alex! The weekend is finally here. Do you like watching movies with popcorn at home?",
    initialChat: [
      { sender: "ai", text: "Yo Alex! The weekend is finally here. Do you like watching movies with popcorn at home?" },
      { sender: "user", text: "Yes! I love watching action and animated movies on Saturday night." },
      { sender: "ai", text: "Action movies are the best! What is your all-time favorite movie?" }
    ],
    nextExchanges: [
      {
        user: "I really like Spider-Man because it is very exciting and fun.",
        ai: "Spider-Man is legendary! Do you like sweet popcorn or salty popcorn?"
      },
      {
        user: "Salty popcorn with butter is my absolute favorite.",
        ai: "Same here! Nothing beats butter popcorn and a great superhero movie."
      }
    ],
    suggestions: [
      "I love watching action and animated movies",
      "Spider-Man is my all-time favorite movie",
      "Salty popcorn with butter is the best",
      "I plan to relax and sleep in this weekend"
    ],
    vocabUpgrades: [
      { word: "Sleep in", meaning: "Tidur lebih lama dari biasanya di hari libur", example: "I love to sleep in on Sunday mornings." },
      { word: "Action movie", meaning: "Film laga penuh aksi seru", example: "We watched an exciting action movie." }
    ],
    recommendedCorrections: [
      { original: "I like watch movie", corrected: "I like watching movies on weekends.", explanation: "Setelah kata kerja 'like', gunakan bentuk gerund: 'I like watching movies'." }
    ]
  },

  // A2 - Kenji
  {
    id: "kenji-a2-music-sports",
    partnerName: "Kenji",
    level: "A2",
    topicTitle: "Sports, Music & Weekend Hangouts",
    topicTitleId: "Olahraga, Musik & Kumpul Bersama Sahabat",
    category: "Weekend Activities",
    brief: "Menceritakan hobi bermain musik atau berolahraga bersama teman di akhir pekan.",
    initialGreeting: "Hey Alex! What hobbies do you enjoy when you have free time on the weekend?",
    initialChat: [
      { sender: "ai", text: "Hey Alex! What hobbies do you enjoy when you have free time on the weekend?" },
      { sender: "user", text: "I enjoy playing acoustic guitar and playing badminton with my friends on Sunday mornings." },
      { sender: "ai", text: "Badminton is such a great workout! How long have you been playing guitar?" }
    ],
    nextExchanges: [
      {
        user: "I started learning guitar two years ago by watching online tutorials.",
        ai: "Self-taught musicians are so cool! Can you sing while playing songs?"
      },
      {
        user: "Only simple pop songs for now, but my friends love singing along.",
        ai: "Acoustic jam sessions with friends create the happiest memories!"
      }
    ],
    suggestions: [
      "I play acoustic guitar and practice new songs",
      "We play badminton every Sunday morning",
      "I taught myself guitar with online videos",
      "Singing along with friends is so relaxing"
    ],
    vocabUpgrades: [
      { word: "Self-taught", meaning: "Belajar sendiri secara otodidak", example: "He is a self-taught digital illustrator." },
      { word: "Jam session", meaning: "Bermain musik bersama secara santai tanpa persiapan rumit", example: "We had a fun jam session in the garage." }
    ],
    recommendedCorrections: [
      { original: "I play badminton in Sunday", corrected: "I play badminton on Sundays.", explanation: "Gunakan preposisi 'on' untuk nama hari: 'on Sundays'." }
    ]
  },

  // B1 - Kenji
  {
    id: "kenji-b1-creator-culture",
    partnerName: "Kenji",
    level: "B1",
    topicTitle: "Social Media Trends, Gaming & Creator Culture",
    topicTitleId: "Tren Medsos, Gaming & Budaya Konten Kreator",
    category: "Youth Culture & Media",
    brief: "Mendiskusikan fenomena video pendek, algoritma medsos, dan tren streaming game.",
    initialGreeting: "What's up Alex! A lot of people our age are building online communities through short-form video. Have you ever considered creating digital content?",
    initialChat: [
      { sender: "ai", text: "What's up Alex! A lot of people our age are building online communities through short-form video. Have you ever considered creating digital content?" },
      { sender: "user", text: "I have thought about sharing daily UI design tips, but the pressure to constantly feed the algorithm feels a bit overwhelming." },
      { sender: "ai", text: "I hear you! Creator burnout is super real. How do you strike a balance between staying informed and avoiding endless doomscrolling?" }
    ],
    nextExchanges: [
      {
        user: "I set strict daily app timers and curate my feeds so I only see constructive, educational creators.",
        ai: "Curating your digital diet is a superpower these days. Do you follow any gaming or tech streaming channels?"
      },
      {
        user: "I watch casual gameplay commentary while cooking; it helps me decompress after intense work sessions.",
        ai: "Background streams are the modern equivalent of cozy radio. Love that!"
      }
    ],
    suggestions: [
      "Creator burnout happens when you constantly chase views",
      "I set strict screen-time limits to avoid doomscrolling",
      "Curating an educational feed keeps social media valuable",
      "Gaming communities foster genuine global camaraderie"
    ],
    vocabUpgrades: [
      { word: "Doomscrolling", meaning: "Kebiasaan menggulir medsos terus-menerus melihat kabar buruk", example: "I stopped doomscrolling before bedtime to improve my sleep." },
      { word: "Curate", meaning: "Memilih dan menyaring konten secara selektif", example: "Curating your following list protects your mental peace." }
    ],
    recommendedCorrections: [
      { original: "Social media makes me stress", corrected: "Endless social media feeds induce noticeable anxiety.", explanation: "Gunakan 'induce noticeable anxiety' atau 'make me feel stressed' untuk tata bahasa B1 yang luwes." }
    ]
  },

  // B2 - Kenji
  {
    id: "kenji-b2-ai-music",
    partnerName: "Kenji",
    level: "B2",
    topicTitle: "AI's Impact on Modern Music & Creative Arts",
    topicTitleId: "Dampak AI pada Musik Modern & Industri Kreatif",
    category: "Creative Technology",
    brief: "Mendiskusikan apakah generator AI mendemokratisasi kreativitas atau mengikis orisinalitas musisi.",
    initialGreeting: "Yo Alex! AI vocal cloning and algorithmic composition software are shaking up the indie music scene. Do you think AI empowers aspiring artists or devalues genuine human artistry?",
    initialChat: [
      { sender: "ai", text: "Yo Alex! AI vocal cloning and algorithmic composition software are shaking up the indie music scene. Do you think AI empowers aspiring artists or devalues genuine human artistry?" },
      { sender: "user", text: "In my view, AI acts as an unprecedented brainstorming co-pilot, but human lived vulnerability remains irreplaceable in touching an audience's soul." },
      { sender: "ai", text: "Eloquent point! Technical proficiency can be synthesized, but raw emotion cannot. How should copyright frameworks adapt to uncredited training datasets?" }
    ],
    nextExchanges: [
      {
        user: "Legislators must enforce transparent dataset disclosures and implement micro-royalty mechanisms whenever an artist's signature timbre or stems are parsed.",
        ai: "Micro-royalties could protect foundational creators while allowing generative tools to flourish. Will audiences ultimately pay to see AI virtual avatars perform live?"
      },
      {
        user: "People may attend holographic spectacles for the novelty, but the visceral communal energy of a live human band can never be replicated by a synthetic avatar.",
        ai: "Visceral communal energy! You hit the nail right on the head."
      }
    ],
    suggestions: [
      "AI functions as an unprecedented brainstorming co-pilot",
      "Raw human vulnerability remains impossible to synthesize",
      "Micro-royalty mechanisms must compensate artists for training data",
      "The visceral communal connection of live music is irreproducible"
    ],
    vocabUpgrades: [
      { word: "Visceral", meaning: "Dirasakan mendalam secara naluriah dan emosional", example: "Live concerts evoke a visceral emotional resonance." },
      { word: "Co-pilot", meaning: "Mitra pendamping yang mempercepat proses kerja", example: "AI serves as a creative co-pilot rather than a replacement." }
    ],
    recommendedCorrections: [
      { original: "Computer cannot feel love like human", corrected: "Algorithmic synthesizers lack the lived emotional vulnerability inherent to authentic human songwriting.", explanation: "Di tingkat B2, gunakan 'lack the lived emotional vulnerability' untuk argumen estetika yang matang." }
    ]
  },

  // C1 - Kenji
  {
    id: "kenji-c1-digital-detachment",
    partnerName: "Kenji",
    level: "C1",
    topicTitle: "Philosophical Perspectives on Digital Detachment & Identity",
    topicTitleId: "Perspektif Filosofis tentang Detasemen Digital & Identitas",
    category: "Philosophy of Mind",
    brief: "Eksplorasi fragmentasi perhatian, krisis kesunyian otentik, dan otonomi kognitif di era algoritma.",
    initialGreeting: "Hey Alex. Hyper-connected algorithmic feeds have arguably fragmented human presence and commodified solitude. Do you believe intentional digital detachment is becoming an existential discipline?",
    initialChat: [
      { sender: "ai", text: "Hey Alex. Hyper-connected algorithmic feeds have arguably fragmented human presence and commodified solitude. Do you believe intentional digital detachment is becoming an existential discipline?" },
      { sender: "user", text: "Indisputably. When every contemplative lull is colonized by algorithmic notifications, we forfeit the psychological gestation period required for idiosyncratic original thought." },
      { sender: "ai", text: "A trenchant critique. Solitude is indeed the crucible of authentic selfhood. Yet, how does one practice radical detachment in an economy that penalizes latency in responsiveness?" }
    ],
    nextExchanges: [
      {
        user: "By intentionally renegotiating social contracts around availability: cultivating asynchronous boundaries and rejecting the pervasive tyranny of the immediate.",
        ai: "The tyranny of the immediate! What an exquisite turn of phrase. Does digital detachment risk intellectual isolationism?"
      },
      {
        user: "Far from it; selective detachment filters out ephemeral ephemeral noise to foster profound, unhurried dialectical engagement with timeless ideas.",
        ai: "A tour de force of philosophical articulation. Your linguistic and conceptual depth is breathtaking."
      }
    ],
    suggestions: [
      "Algorithmic colonization of solitude impairs original thought",
      "Intentional detachment reclaims cognitive sovereignty",
      "Rejecting the tyranny of the immediate restores profound presence",
      "Selective unplugging filters out ephemeral noise in favor of timeless depth"
    ],
    vocabUpgrades: [
      { word: "Crucible", meaning: "Kancah ujian berat tempat terbentuknya sesuatu yang murni", example: "Solitude serves as the crucible of authentic identity." },
      { word: "Idiosyncratic", meaning: "Khas, unik, dan berkarakter pribadi yang orisinal", example: "Her writing displays an idiosyncratic stylistic brilliance." }
    ],
    recommendedCorrections: [
      { original: "Too much phone makes brain broken", corrected: "Unchecked hyper-connectivity induces cognitive fragmentation and erodes reflective contemplation.", explanation: "Gunakan 'induces cognitive fragmentation' dan 'erodes reflective contemplation' untuk level C1." }
    ]
  }
];

export function getModulesForPartnerAndLevel(
  partnerName: string,
  level: string
): ConversationModule[] {
  const normLevel = (level || "A1").toUpperCase();
  const validLevel = ["A1", "A2", "B1", "B2", "C1"].includes(normLevel) ? normLevel : "A1";

  const matches = LEVEL_CONVERSATION_MODULES.filter(
    (m) => m.partnerName.toLowerCase() === partnerName.toLowerCase() && m.level === validLevel
  );

  if (matches.length > 0) return matches;

  // Fallback to same partner at A1 or first module
  const partnerFallback = LEVEL_CONVERSATION_MODULES.filter(
    (m) => m.partnerName.toLowerCase() === partnerName.toLowerCase()
  );
  return partnerFallback.length > 0 ? partnerFallback : [LEVEL_CONVERSATION_MODULES[0]];
}

export function getActiveModule(
  partnerName: string,
  level: string,
  moduleId?: string | null
): ConversationModule {
  const available = getModulesForPartnerAndLevel(partnerName, level);
  if (moduleId) {
    const found = available.find((m) => m.id === moduleId);
    if (found) return found;
  }
  return available[0];
}

export function getAllModulesForLevel(level: string): ConversationModule[] {
  const normLevel = (level || "A1").toUpperCase();
  const validLevel = ["A1", "A2", "B1", "B2", "C1"].includes(normLevel) ? normLevel : "A1";
  return LEVEL_CONVERSATION_MODULES.filter((m) => m.level === validLevel);
}

export function generateLevelAdaptivePartnerResponse(
  userText: string,
  partnerName: string,
  level: string,
  activeModule: ConversationModule
): string {
  const lower = userText.toLowerCase().trim();
  const normLevel = (level || "A1").toUpperCase();

  // 1. Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy)/i.test(lower)) {
    if (normLevel === "A1") {
      return `Hello Alex! Welcome! I am ${partnerName}. Let's talk about ${activeModule.topicTitle}. How are you today?`;
    }
    if (normLevel === "A2") {
      return `Hey Alex! Glad you are here. Today we are exploring "${activeModule.topicTitle}". How was your day so far?`;
    }
    if (normLevel === "B1") {
      return `Good to see you, Alex! In our session today on "${activeModule.topicTitle}", I would love to hear your thoughts. Where should we begin?`;
    }
    if (normLevel === "B2") {
      return `Welcome, Alex! Our topic today is "${activeModule.topicTitle}". What is your initial stance or experience regarding this?`;
    }
    return `Greetings, Alex. Delighted to engage with you on "${activeModule.topicTitle}". How do you perceive the primary dynamics at play here?`;
  }

  // 2. Questions about partner / "how are you"
  if (lower.includes("how are you") || lower.includes("how are things") || lower.includes("what about you")) {
    if (normLevel === "A1") {
      return "I am doing great, thank you! I love practicing English with you. What do you think about our topic today?";
    }
    if (normLevel === "A2") {
      return "I am feeling wonderful today! Exploring these ideas with you is so enjoyable. Could you tell me more about your experience?";
    }
    if (normLevel === "B1") {
      return "I am doing very well, thank you for asking! I really appreciate your perspective. How did you come to that conclusion?";
    }
    if (normLevel === "B2") {
      return "I am doing excellently! Your point touches on a crucial nuance. How would you weigh that against the competing arguments?";
    }
    return "I am in top form, thank you. Your inquiry highlights a thoughtful conversational cadence. How might we synthesize those observations further?";
  }

  // 3. Gratitude / Affirmation
  if (lower.includes("thank") || lower.includes("thanks") || lower.includes("appreciate")) {
    if (normLevel === "A1") {
      return "You are very welcome, Alex! You speak so clearly. Keep going!";
    }
    if (normLevel === "A2") {
      return "My pleasure! Your sentences sound very natural today. What else would you like to add?";
    }
    if (normLevel === "B1") {
      return "You are most welcome! Your fluency is visibly gaining momentum. What example comes to mind next?";
    }
    if (normLevel === "B2") {
      return "Delighted to collaborate with you! You are articulating complex notions with commendable precision. How do you envision the next step?";
    }
    return "The pleasure is mutual. Engaging with such articulated insights elevates our dialogue immensely. Where does your analysis lead us next?";
  }

  // 4. Partner-Specific & Level-Calibrated Contextual Responses
  switch (partnerName) {
    case "Sarah":
      if (normLevel === "A1") {
        return "That sounds delicious and very nice! In a morning cafe chat, simple and cheerful sentences are perfect. What else do you like for breakfast?";
      }
      if (normLevel === "A2") {
        return "That sounds like a wonderful weekend plan! Food and social gatherings bring people together. What kind of cafe atmosphere do you prefer?";
      }
      if (normLevel === "B1") {
        return "You made a very practical point about productivity! Balancing environment with daily focus is key. How do you protect your deep work time from distractions?";
      }
      if (normLevel === "B2") {
        return "That is a shrewd commercial strategy. Demonstrating tangible client ROI almost always de-escalates price resistance. How do you measure success after implementation?";
      }
      return "A compelling strategic postulation. Rebuilding institutional credibility demands precisely that level of transparent governance. How would you counter defensive pushback from internal factions?";

    case "Emma":
      if (normLevel === "A1") {
        return "Very nice sentence! You used clear simple words that are easy to understand. Can you tell me one more thing about that?";
      }
      if (normLevel === "A2") {
        return "Spot-on storytelling! Your past tense verb choices connected the sequence smoothly. What was the most surprising moment of that experience?";
      }
      if (normLevel === "B1") {
        return "I love how you phrased that! Using phrasal verbs naturally makes your English flow like a native speaker. How would you explain that to a colleague?";
      }
      if (normLevel === "B2") {
        return "A nuanced comparison of opposing viewpoints! You balanced the pros and cons analytically. What hybrid compromise would you advocate for?";
      }
      return "Exquisitely formulated. Your command of rhetorical calibration and syntactic nuance conveys intellectual rigor. How does this perspective translate into bilateral treaty frameworks?";

    case "Sophia":
      if (normLevel === "A1") {
        return "Traveling is so exciting! Your airport and city phrases are clear and polite. Do you like flying by plane or taking the train?";
      }
      if (normLevel === "A2") {
        return "Exploring local neighborhoods on foot is the best way to discover hidden gems! What tourist attraction is on the top of your list?";
      }
      if (normLevel === "B1") {
        return "That captures the authentic backpacking spirit! Freedom and spontaneous discoveries make travel transformative. What is your top packing rule?";
      }
      if (normLevel === "B2") {
        return "You highlighted an essential ethical tension in sustainable tourism. Balancing economic empowerment with ecological quotas is tricky. How should local communities be involved?";
      }
      return "An incisive geopolitical critique. Decoupling heritage preservation from predatory commercial commodification is an urgent policy dilemma. Which sovereign models offer the best precedent?";

    case "David":
      if (normLevel === "A1") {
        return "Clear and confident job description! Designers and tech builders do great work. What is your favorite computer tool to use?";
      }
      if (normLevel === "A2") {
        return "A solid morning standup update! Clear priorities and proactive communication keep engineering teams agile. What is your primary milestone today?";
      }
      if (normLevel === "B1") {
        return "That is a textbook STAR methodology interview response! You defined the challenge and highlighted your collaborative action. What did that teach you about leadership?";
      }
      if (normLevel === "B2") {
        return "Spot on. Treating technical debt refactoring as risk mitigation rather than overhead resonates strongly with executive stakeholders. How do you define your rollback strategy?";
      }
      return "A formidable analytical breakdown of algorithmic governance. Delineating strict vicarious enterprise liability establishes critical legal certainty. How would you operationalize this audit trail in production?";

    case "Kenji":
      if (normLevel === "A1") {
        return "Totally agree! Movies and good snacks make the best weekend. Who do you usually watch movies with?";
      }
      if (normLevel === "A2") {
        return "Jamming on instruments and playing sports keep life energized! How often do you get together with your friends for that?";
      }
      if (normLevel === "B1") {
        return "That is such a relatable view on modern digital culture! Setting boundaries with notifications protects mental bandwidth. What creator inspired you recently?";
      }
      if (normLevel === "B2") {
        return "You nailed the distinction between generative convenience and visceral artistic soul. Audiences can sense when human vulnerability is missing. Where is creative tech heading next?";
      }
      return "A trenchant philosophical reflection. Reclaiming attentional sovereignty in an era of algorithmic saturation is indeed an existential discipline. How do you safeguard unhurried contemplation in your own routine?";

    default:
      if (normLevel === "A1") {
        return "That is very interesting, Alex! Keep speaking with that confidence. What else do you like to do?";
      }
      if (normLevel === "B2") {
        return "A thoroughly reasoned perspective! How would you address the countervailing arguments from your peers?";
      }
      return "A sophisticated and well-grounded thesis. How might that paradigm evolve over the coming decade?";
  }
}
