import type { UnitContent } from "./types";

export const PAST_ACTIVITIES_CONTENT = {
  unitId: "a1-past-activities",
  overview:
    "Belajar menceritakan kegiatan dan keadaan yang sudah terjadi dengan penanda waktu lampau, was/were, serta kata kerja bentuk kedua yang umum.",
  outcomes: [
    "Mengenali kosakata aktivitas dan penanda waktu lampau yang umum.",
    "Menggunakan was dan were untuk menjelaskan keadaan atau lokasi di masa lalu.",
    "Membedakan kata kerja lampau beraturan dan tidak beraturan yang sering dipakai.",
    "Menyusun cerita singkat tentang kegiatan kemarin secara runtut.",
    "Memahami inti cerita pendek dan menceritakan kembali pengalaman sederhana.",
  ],
  lessons: [
    {
      lessonId: "a1-u3-weekend-words",
      objective:
        "Mengenali dan memakai kosakata dasar untuk menyebut waktu serta aktivitas yang sudah berlalu.",
      warmup:
        "Ingat kembali akhir pekanmu. Pilih satu kegiatan yang kamu lakukan, misalnya belajar, menonton film, atau mengunjungi keluarga.",
      vocabulary: [
        {
          term: "yesterday",
          meaning: "kemarin",
          example: "I studied English yesterday.",
          exampleMeaning: "Saya belajar bahasa Inggris kemarin.",
        },
        {
          term: "last night",
          meaning: "tadi malam",
          example: "We watched a movie last night.",
          exampleMeaning: "Kami menonton film tadi malam.",
        },
        {
          term: "last weekend",
          meaning: "akhir pekan lalu",
          example: "I visited my aunt last weekend.",
          exampleMeaning: "Saya mengunjungi bibi saya akhir pekan lalu.",
        },
        {
          term: "visited",
          meaning: "mengunjungi",
          example: "She visited her grandmother.",
          exampleMeaning: "Dia mengunjungi neneknya.",
        },
        {
          term: "watched",
          meaning: "menonton",
          example: "They watched television after dinner.",
          exampleMeaning: "Mereka menonton televisi setelah makan malam.",
        },
        {
          term: "played",
          meaning: "bermain",
          example: "We played football yesterday.",
          exampleMeaning: "Kami bermain sepak bola kemarin.",
        },
        {
          term: "went",
          meaning: "pergi",
          example: "He went to the park.",
          exampleMeaning: "Dia pergi ke taman.",
        },
        {
          term: "stayed home",
          meaning: "tetap di rumah",
          example: "I stayed home last Sunday.",
          exampleMeaning: "Saya tetap di rumah hari Minggu lalu.",
        },
      ],
      teachingPoints: [
        {
          title: "Penanda waktu lampau",
          explanation:
            "Yesterday, last night, dan last weekend memberi tahu pendengar bahwa suatu kegiatan sudah selesai.",
          pattern: "Subject + past verb + past time expression",
          examples: [
            {
              english: "I played badminton yesterday.",
              indonesian: "Saya bermain bulu tangkis kemarin.",
            },
            {
              english: "We watched a movie last night.",
              indonesian: "Kami menonton film tadi malam.",
            },
          ],
          tip: "Kamu dapat menaruh penanda waktu di awal atau akhir kalimat.",
        },
        {
          title: "Aktivitas yang sudah selesai",
          explanation:
            "Saat bercerita tentang masa lalu, gunakan bentuk lampau dari kata kerja. Untuk saat ini, hafalkan bentuk yang sering muncul sebagai satu frasa.",
          examples: [
            {
              english: "She visited her aunt.",
              indonesian: "Dia mengunjungi bibinya.",
            },
            {
              english: "They went to the market.",
              indonesian: "Mereka pergi ke pasar.",
              note: "Went adalah bentuk lampau dari go.",
            },
          ],
        },
      ],
      practice: [
        {
          id: "a1-u3-l1-vocabulary-match",
          type: "vocabulary-match",
          instruction: "Pasangkan frasa bahasa Inggris dengan artinya.",
          pairs: [
            { id: "u3-l1-pair-1", term: "yesterday", match: "kemarin" },
            {
              id: "u3-l1-pair-2",
              term: "last weekend",
              match: "akhir pekan lalu",
            },
            { id: "u3-l1-pair-3", term: "visited", match: "mengunjungi" },
            {
              id: "u3-l1-pair-4",
              term: "stayed home",
              match: "tetap di rumah",
            },
          ],
        },
        {
          id: "a1-u3-l1-multiple-choice",
          type: "multiple-choice",
          instruction: "Pilih kalimat yang membicarakan masa lalu.",
          prompt: "Kalimat mana yang berarti ‘Kami menonton film tadi malam’ ?",
          options: [
            "We watch a movie every night.",
            "We watched a movie last night.",
            "We are watching a movie now.",
          ],
          answer: "We watched a movie last night.",
          explanation:
            "Watched dan last night menunjukkan kegiatan yang sudah selesai tadi malam.",
        },
        {
          id: "a1-u3-l1-listen-choose",
          type: "listen-speak",
          mode: "listen-and-choose",
          instruction: "Dengarkan, lalu pilih kegiatan Maya.",
          audioText: "Last weekend, Maya visited her grandmother.",
          prompt: "What did Maya do last weekend?",
          translation: "Apa yang dilakukan Maya akhir pekan lalu?",
          options: [
            "She visited her grandmother.",
            "She played football.",
            "She stayed at school.",
          ],
          answer: "She visited her grandmother.",
          focus: "Dengarkan kata kerja visited dan penanda waktu last weekend.",
        },
      ],
      recap: [
        "Yesterday berarti kemarin, sedangkan last night berarti tadi malam.",
        "Gunakan bentuk lampau untuk kegiatan yang sudah selesai.",
        "Penanda waktu dapat muncul di awal atau akhir kalimat.",
      ],
      coachTip:
        "Buat satu kalimat tentang akhir pekanmu dengan pola: I + kata kerja lampau + last weekend.",
    },
    {
      lessonId: "a1-u3-was-were",
      objective:
        "Menggunakan was dan were untuk menjelaskan keadaan dan lokasi di masa lalu.",
      warmup:
        "Pikirkan di mana kamu berada tadi malam dan bagaimana perasaanmu. Contoh: di rumah dan lelah.",
      vocabulary: [
        {
          term: "was",
          meaning: "adalah/berada (lampau untuk I, he, she, it)",
          example: "I was at home yesterday.",
          exampleMeaning: "Saya berada di rumah kemarin.",
        },
        {
          term: "were",
          meaning: "adalah/berada (lampau untuk you, we, they)",
          example: "They were at the park.",
          exampleMeaning: "Mereka berada di taman.",
        },
        {
          term: "at home",
          meaning: "di rumah",
          example: "She was at home last night.",
          exampleMeaning: "Dia berada di rumah tadi malam.",
        },
        {
          term: "at school",
          meaning: "di sekolah",
          example: "We were at school yesterday.",
          exampleMeaning: "Kami berada di sekolah kemarin.",
        },
        {
          term: "tired",
          meaning: "lelah",
          example: "He was tired after work.",
          exampleMeaning: "Dia lelah setelah bekerja.",
        },
        {
          term: "happy",
          meaning: "senang",
          example: "The children were happy.",
          exampleMeaning: "Anak-anak itu senang.",
        },
      ],
      teachingPoints: [
        {
          title: "Gunakan was untuk I, he, she, dan it",
          explanation:
            "Was dipakai bersama I, he, she, it, serta satu orang atau benda. Jangan gunakan was untuk you, meskipun you merujuk pada satu orang.",
          pattern: "I / He / She / It + was + place or condition",
          examples: [
            {
              english: "I was busy yesterday.",
              indonesian: "Saya sibuk kemarin.",
            },
            {
              english: "Rina was at the library.",
              indonesian: "Rina berada di perpustakaan.",
            },
          ],
        },
        {
          title: "Gunakan were untuk you, we, dan they",
          explanation:
            "Were dipakai bersama you—baik untuk satu maupun banyak orang—serta we, they, atau subjek jamak.",
          pattern: "You / We / They + were + place or condition",
          examples: [
            {
              english: "You were very quiet.",
              indonesian: "Kamu sangat diam.",
            },
            {
              english: "We were at the market.",
              indonesian: "Kami berada di pasar.",
            },
          ],
          tip: "Ingat pasangan pendeknya: I was, tetapi you were.",
        },
        {
          title: "Bentuk negatif",
          explanation:
            "Tambahkan not setelah was atau were untuk mengatakan bahwa suatu keadaan tidak terjadi.",
          pattern: "Subject + was not / were not + complement",
          examples: [
            {
              english: "He was not tired.",
              indonesian: "Dia tidak lelah.",
              note: "Was not dapat disingkat menjadi wasn't.",
            },
            {
              english: "They were not at home.",
              indonesian: "Mereka tidak berada di rumah.",
              note: "Were not dapat disingkat menjadi weren't.",
            },
          ],
        },
      ],
      practice: [
        {
          id: "a1-u3-l2-multiple-choice",
          type: "multiple-choice",
          instruction: "Pilih bentuk to be lampau yang tepat.",
          prompt: "Maya ___ happy yesterday.",
          options: ["was", "were", "are"],
          answer: "was",
          explanation: "Maya adalah satu orang, jadi bentuk yang tepat adalah was.",
        },
        {
          id: "a1-u3-l2-verb-fill",
          type: "verb-fill",
          instruction: "Isi bagian kosong dengan was atau were.",
          sentence: "They ___ at the park yesterday.",
          baseVerb: "be",
          answer: "were",
          translation: "Mereka berada di taman kemarin.",
          explanation: "Subjek they menggunakan were.",
        },
        {
          id: "a1-u3-l2-word-order",
          type: "word-order",
          instruction: "Susun kata-kata menjadi kalimat yang benar.",
          prompt: "Katakan bahwa kamu lelah tadi malam.",
          words: ["I", "was", "tired", "last", "night."],
          answer: "I was tired last night.",
          translation: "Saya lelah tadi malam.",
        },
      ],
      recap: [
        "Gunakan was bersama I, he, she, it, atau nama satu orang maupun benda.",
        "Gunakan were bersama you—untuk satu atau banyak orang—serta we, they, dan subjek jamak.",
        "Untuk bentuk negatif, letakkan not setelah was atau were.",
      ],
      coachTip:
        "Ucapkan dua fakta tentang kemarin: satu dengan I was dan satu lagi dengan we atau they were.",
    },
    {
      lessonId: "a1-u3-past-verbs",
      objective:
        "Membedakan kata kerja lampau beraturan dan tidak beraturan serta menggunakannya dalam kalimat sederhana.",
      warmup:
        "Sebutkan tiga kata kerja yang sering kamu gunakan, misalnya play, go, dan eat. Apakah kamu tahu bentuk lampaunya?",
      vocabulary: [
        {
          term: "played",
          meaning: "bermain (lampau)",
          example: "I played a game yesterday.",
          exampleMeaning: "Saya bermain gim kemarin.",
        },
        {
          term: "watched",
          meaning: "menonton (lampau)",
          example: "She watched a movie.",
          exampleMeaning: "Dia menonton film.",
        },
        {
          term: "visited",
          meaning: "mengunjungi (lampau)",
          example: "We visited our uncle.",
          exampleMeaning: "Kami mengunjungi paman kami.",
        },
        {
          term: "went",
          meaning: "pergi (bentuk lampau go)",
          example: "They went to the beach.",
          exampleMeaning: "Mereka pergi ke pantai.",
        },
        {
          term: "had",
          meaning: "memiliki/makan (bentuk lampau have)",
          example: "I had breakfast at seven.",
          exampleMeaning: "Saya sarapan pukul tujuh.",
        },
        {
          term: "ate",
          meaning: "makan (bentuk lampau eat)",
          example: "He ate fried rice.",
          exampleMeaning: "Dia makan nasi goreng.",
        },
        {
          term: "did",
          meaning: "melakukan (bentuk lampau do)",
          example: "I did my homework.",
          exampleMeaning: "Saya mengerjakan pekerjaan rumah saya.",
        },
        {
          term: "saw",
          meaning: "melihat (bentuk lampau see)",
          example: "We saw a beautiful bird.",
          exampleMeaning: "Kami melihat seekor burung yang indah.",
        },
      ],
      teachingPoints: [
        {
          title: "Kata kerja beraturan",
          explanation:
            "Banyak kata kerja membentuk past simple dengan menambahkan -ed. Bentuknya sama untuk semua subjek.",
          pattern: "Subject + regular verb-ed + complement",
          examples: [
            {
              english: "I played football.",
              indonesian: "Saya bermain sepak bola.",
            },
            {
              english: "She visited her friend.",
              indonesian: "Dia mengunjungi temannya.",
            },
          ],
          tip: "Untuk kata kerja yang sudah berakhir dengan e, cukup tambahkan d: live menjadi lived.",
        },
        {
          title: "Kata kerja tidak beraturan",
          explanation:
            "Beberapa kata kerja berubah bentuk dan tidak memakai pola -ed. Pelajari bentuk yang paling sering digunakan sedikit demi sedikit.",
          examples: [
            {
              english: "We went to the market.",
              indonesian: "Kami pergi ke pasar.",
              note: "Go berubah menjadi went.",
            },
            {
              english: "He ate an apple.",
              indonesian: "Dia makan sebuah apel.",
              note: "Eat berubah menjadi ate.",
            },
            {
              english: "They had lunch together.",
              indonesian: "Mereka makan siang bersama.",
              note: "Have berubah menjadi had.",
            },
          ],
          tip: "Jangan menambahkan -ed pada went, ate, had, did, atau saw.",
        },
      ],
      practice: [
        {
          id: "a1-u3-l3-multiple-choice",
          type: "multiple-choice",
          instruction: "Pilih bentuk lampau yang tepat.",
          prompt: "Yesterday, we ___ to the market.",
          options: ["go", "went", "goed"],
          answer: "went",
          explanation: "Went adalah bentuk lampau tidak beraturan dari go.",
        },
        {
          id: "a1-u3-l3-verb-fill-regular",
          type: "verb-fill",
          instruction: "Ubah kata kerja dalam kurung ke bentuk lampau.",
          sentence: "She ___ her grandmother last Sunday.",
          baseVerb: "visit",
          answer: "visited",
          translation: "Dia mengunjungi neneknya hari Minggu lalu.",
          explanation: "Visit adalah kata kerja beraturan, jadi tambahkan -ed.",
        },
        {
          id: "a1-u3-l3-verb-fill-irregular",
          type: "verb-fill",
          instruction: "Ubah kata kerja dalam kurung ke bentuk lampau.",
          sentence: "I ___ fried rice for dinner.",
          baseVerb: "eat",
          answer: "ate",
          translation: "Saya makan nasi goreng untuk makan malam.",
          explanation: "Eat berubah menjadi ate dalam past simple.",
        },
        {
          id: "a1-u3-l3-vocabulary-match",
          type: "vocabulary-match",
          instruction: "Pasangkan kata kerja dasar dengan bentuk lampaunya.",
          pairs: [
            { id: "u3-l3-pair-1", term: "go", match: "went" },
            { id: "u3-l3-pair-2", term: "have", match: "had" },
            { id: "u3-l3-pair-3", term: "eat", match: "ate" },
            { id: "u3-l3-pair-4", term: "see", match: "saw" },
          ],
        },
      ],
      recap: [
        "Kata kerja beraturan umumnya mendapat akhiran -ed.",
        "Kata kerja tidak beraturan berubah bentuk dan perlu diingat.",
        "Bentuk past simple tidak berubah meskipun subjeknya berbeda.",
      ],
      coachTip:
        "Buat kartu kecil untuk pasangan go–went, have–had, eat–ate, do–did, dan see–saw.",
    },
    {
      lessonId: "a1-u3-build-weekend-story",
      objective:
        "Menyusun tiga hingga empat kejadian lampau menjadi cerita akhir pekan yang pendek dan runtut.",
      warmup:
        "Urutkan secara lisan tiga bagian harimu: kegiatan pertama, kegiatan berikutnya, dan kegiatan terakhir.",
      vocabulary: [
        {
          term: "first",
          meaning: "pertama-tama",
          example: "First, I had breakfast.",
          exampleMeaning: "Pertama-tama, saya sarapan.",
        },
        {
          term: "then",
          meaning: "kemudian",
          example: "Then, I went to the market.",
          exampleMeaning: "Kemudian, saya pergi ke pasar.",
        },
        {
          term: "after that",
          meaning: "setelah itu",
          example: "After that, we watched a movie.",
          exampleMeaning: "Setelah itu, kami menonton film.",
        },
        {
          term: "finally",
          meaning: "akhirnya/terakhir",
          example: "Finally, I went home.",
          exampleMeaning: "Terakhir, saya pulang.",
        },
        {
          term: "in the morning",
          meaning: "pada pagi hari",
          example: "I cleaned my room in the morning.",
          exampleMeaning: "Saya membersihkan kamar pada pagi hari.",
        },
        {
          term: "in the afternoon",
          meaning: "pada siang/sore hari",
          example: "We played football in the afternoon.",
          exampleMeaning: "Kami bermain sepak bola pada sore hari.",
        },
      ],
      teachingPoints: [
        {
          title: "Beri urutan pada cerita",
          explanation:
            "First, then, after that, dan finally membantu pendengar mengikuti urutan kejadian.",
          pattern: "First, ... Then, ... Finally, ...",
          examples: [
            {
              english: "First, I had breakfast. Then, I went to school.",
              indonesian: "Pertama-tama, saya sarapan. Kemudian, saya pergi ke sekolah.",
            },
            {
              english: "After that, we played a game. Finally, we went home.",
              indonesian: "Setelah itu, kami bermain gim. Terakhir, kami pulang.",
            },
          ],
        },
        {
          title: "Tambahkan waktu dan tempat",
          explanation:
            "Cerita menjadi lebih jelas jika kamu menyebutkan kapan atau di mana kegiatan terjadi.",
          pattern: "Subject + past verb + place/time",
          examples: [
            {
              english: "I visited my cousin in the afternoon.",
              indonesian: "Saya mengunjungi sepupu saya pada sore hari.",
            },
            {
              english: "We ate dinner at home.",
              indonesian: "Kami makan malam di rumah.",
            },
          ],
          tip: "Mulailah dengan tiga kalimat sederhana. Cerita yang jelas lebih penting daripada cerita yang panjang.",
        },
      ],
      practice: [
        {
          id: "a1-u3-l4-word-order-first",
          type: "word-order",
          instruction: "Susun kata-kata menjadi awal cerita yang benar.",
          prompt: "Ceritakan kegiatan pertamamu kemarin pagi.",
          words: ["First,", "I", "cleaned", "my", "room."],
          answer: "First, I cleaned my room.",
          translation: "Pertama-tama, saya membersihkan kamar saya.",
        },
        {
          id: "a1-u3-l4-word-order-finally",
          type: "word-order",
          instruction: "Susun kata-kata menjadi akhir cerita yang benar.",
          prompt: "Akhiri cerita dengan kegiatan pulang ke rumah.",
          words: ["Finally,", "we", "went", "home."],
          answer: "Finally, we went home.",
          translation: "Terakhir, kami pulang.",
        },
        {
          id: "a1-u3-l4-guided-speaking",
          type: "listen-speak",
          mode: "guided-speaking",
          instruction: "Ceritakan tiga kegiatan akhir pekanmu dengan urutan yang jelas.",
          audioText:
            "First, I cleaned my room. Then, I visited my friend. Finally, we watched a movie.",
          prompt:
            "Gunakan first, then, dan finally untuk menceritakan tiga kegiatan yang sudah selesai.",
          translation:
            "Pertama, saya membersihkan kamar. Kemudian, saya mengunjungi teman. Terakhir, kami menonton film.",
          modelAnswer:
            "First, I had breakfast. Then, I went to the park. Finally, I watched a movie at home.",
          focus: "Urutan cerita dan bentuk lampau kata kerja.",
        },
      ],
      recap: [
        "Gunakan first, then, after that, dan finally untuk menunjukkan urutan.",
        "Tambahkan waktu atau tempat agar cerita lebih jelas.",
        "Tiga kalimat sederhana sudah cukup untuk membuat cerita mini.",
      ],
      coachTip:
        "Rekam cerita tiga kalimatmu, lalu dengarkan kembali apakah setiap kata kerja sudah berbentuk lampau.",
    },
    {
      lessonId: "a1-u3-listen-yesterday",
      objective:
        "Menemukan waktu, tempat, dan aktivitas utama dalam cerita lisan sederhana tentang kemarin.",
      warmup:
        "Saat mendengar cerita, fokus dahulu pada penanda waktu dan kata kerja utama. Kamu tidak perlu memahami setiap kata.",
      vocabulary: [
        {
          term: "woke up",
          meaning: "bangun tidur",
          example: "I woke up at seven.",
          exampleMeaning: "Saya bangun pukul tujuh.",
        },
        {
          term: "had breakfast",
          meaning: "sarapan",
          example: "She had breakfast at home.",
          exampleMeaning: "Dia sarapan di rumah.",
        },
        {
          term: "market",
          meaning: "pasar",
          example: "We went to the market.",
          exampleMeaning: "Kami pergi ke pasar.",
        },
        {
          term: "movie",
          meaning: "film",
          example: "They watched a movie.",
          exampleMeaning: "Mereka menonton film.",
        },
        {
          term: "evening",
          meaning: "sore/malam hari",
          example: "I studied in the evening.",
          exampleMeaning: "Saya belajar pada malam hari.",
        },
        {
          term: "with my family",
          meaning: "bersama keluarga saya",
          example: "I had dinner with my family.",
          exampleMeaning: "Saya makan malam bersama keluarga saya.",
        },
      ],
      teachingPoints: [
        {
          title: "Tangkap tiga petunjuk utama",
          explanation:
            "Cari jawaban untuk tiga pertanyaan: kapan, di mana, dan melakukan apa. Ketiganya membantu kamu memahami inti cerita.",
          examples: [
            {
              english: "Yesterday, Lina went to the market.",
              indonesian: "Kemarin, Lina pergi ke pasar.",
              note: "Waktu: yesterday; orang: Lina; kegiatan: went to the market.",
            },
            {
              english: "Last night, we watched a movie at home.",
              indonesian: "Tadi malam, kami menonton film di rumah.",
              note: "Waktu: last night; kegiatan: watched a movie; tempat: at home.",
            },
          ],
        },
        {
          title: "Ikuti kata pengurut",
          explanation:
            "Kata then dan after that memberi tanda bahwa pembicara berpindah ke kegiatan berikutnya.",
          examples: [
            {
              english: "I had breakfast. Then, I went to school.",
              indonesian: "Saya sarapan. Kemudian, saya pergi ke sekolah.",
            },
            {
              english: "We played football. After that, we ate lunch.",
              indonesian: "Kami bermain sepak bola. Setelah itu, kami makan siang.",
            },
          ],
          tip: "Catat satu atau dua kata kunci saat mendengarkan, bukan seluruh kalimat.",
        },
      ],
      practice: [
        {
          id: "a1-u3-l5-listen-choose-activity",
          type: "listen-speak",
          mode: "listen-and-choose",
          instruction: "Dengarkan cerita mini, lalu pilih kegiatan utamanya.",
          audioText:
            "Yesterday, Dito went to the market with his mother. They bought fruit and went home.",
          prompt: "What did Dito do yesterday?",
          translation: "Apa yang Dito lakukan kemarin?",
          options: [
            "He went to the market.",
            "He played football.",
            "He visited his teacher.",
          ],
          answer: "He went to the market.",
          focus: "Dengarkan went to the market.",
        },
        {
          id: "a1-u3-l5-listen-choose-time",
          type: "listen-speak",
          mode: "listen-and-choose",
          instruction: "Dengarkan, lalu pilih kapan kegiatan terjadi.",
          audioText: "Last night, Sari watched a movie with her family.",
          prompt: "When did Sari watch a movie?",
          translation: "Kapan Sari menonton film?",
          options: ["Last night.", "This morning.", "Every Sunday."],
          answer: "Last night.",
          focus: "Dengarkan penanda waktu last night.",
        },
        {
          id: "a1-u3-l5-listen-choose-order",
          type: "listen-speak",
          mode: "listen-and-choose",
          instruction: "Dengarkan urutan kegiatan, lalu pilih kegiatan terakhir.",
          audioText:
            "I woke up at seven and had breakfast. Then, I walked to school.",
          prompt: "What did the speaker do after breakfast?",
          translation: "Apa yang dilakukan pembicara setelah sarapan?",
          options: [
            "Walked to school.",
            "Went back to sleep.",
            "Watched a movie.",
          ],
          answer: "Walked to school.",
          focus: "Kata then menandai kegiatan berikutnya.",
        },
      ],
      recap: [
        "Fokus pada penanda waktu dan kata kerja utama saat mendengarkan.",
        "Cari petunjuk kapan, di mana, dan melakukan apa.",
        "Then dan after that membantu menunjukkan urutan kegiatan.",
      ],
      coachTip:
        "Dengarkan setiap cerita dua kali: pertama untuk ide utama, kedua untuk waktu dan tempat.",
    },
    {
      lessonId: "a1-u3-checkpoint",
      objective:
        "Menggabungkan penanda waktu, was/were, dan kata kerja lampau untuk menceritakan tiga hal yang dilakukan kemarin.",
      warmup:
        "Siapkan tiga catatan pendek: di mana kamu berada, apa yang kamu lakukan, dan bagaimana perasaanmu kemarin.",
      vocabulary: [
        {
          term: "yesterday morning",
          meaning: "kemarin pagi",
          example: "I was at home yesterday morning.",
          exampleMeaning: "Saya berada di rumah kemarin pagi.",
        },
        {
          term: "yesterday afternoon",
          meaning: "kemarin siang/sore",
          example: "We played badminton yesterday afternoon.",
          exampleMeaning: "Kami bermain bulu tangkis kemarin sore.",
        },
        {
          term: "went",
          meaning: "pergi",
          example: "I went to school.",
          exampleMeaning: "Saya pergi ke sekolah.",
        },
        {
          term: "had",
          meaning: "memiliki/makan",
          example: "We had lunch together.",
          exampleMeaning: "Kami makan siang bersama.",
        },
        {
          term: "watched",
          meaning: "menonton",
          example: "I watched television last night.",
          exampleMeaning: "Saya menonton televisi tadi malam.",
        },
        {
          term: "finally",
          meaning: "terakhir/akhirnya",
          example: "Finally, I went to bed.",
          exampleMeaning: "Terakhir, saya pergi tidur.",
        },
      ],
      teachingPoints: [
        {
          title: "Rancang cerita tiga bagian",
          explanation:
            "Mulailah dengan waktu atau keadaan, lanjutkan dengan dua kegiatan, lalu tutup dengan kegiatan terakhir atau perasaanmu.",
          pattern: "Yesterday, ... Then, ... Finally, ...",
          examples: [
            {
              english:
                "Yesterday, I was at home. Then, I cleaned my room. Finally, I watched a movie.",
              indonesian:
                "Kemarin, saya berada di rumah. Kemudian, saya membersihkan kamar. Terakhir, saya menonton film.",
            },
            {
              english:
                "I went to the park. I played football with my friends. I was tired but happy.",
              indonesian:
                "Saya pergi ke taman. Saya bermain sepak bola bersama teman-teman. Saya lelah tetapi senang.",
            },
          ],
        },
        {
          title: "Periksa bentuk lampau",
          explanation:
            "Pastikan keadaan memakai was/were dan kegiatan memakai kata kerja lampau seperti played, went, had, atau watched.",
          examples: [
            {
              english: "She was happy and she played with her friends.",
              indonesian: "Dia senang dan dia bermain bersama teman-temannya.",
            },
            {
              english: "We were at home and we had dinner together.",
              indonesian: "Kami berada di rumah dan kami makan malam bersama.",
            },
          ],
          tip: "Setelah selesai, lingkari penanda waktu dan garis bawahi setiap kata kerja lampau.",
        },
      ],
      practice: [
        {
          id: "a1-u3-l6-multiple-choice",
          type: "multiple-choice",
          instruction: "Pilih kalimat dengan bentuk lampau yang benar.",
          prompt: "Kalimat mana yang tepat untuk menceritakan kegiatan kemarin?",
          options: [
            "I go to the park yesterday.",
            "I went to the park yesterday.",
            "I am going to the park yesterday.",
          ],
          answer: "I went to the park yesterday.",
          explanation:
            "Went adalah bentuk lampau dari go dan cocok dengan penanda waktu yesterday.",
        },
        {
          id: "a1-u3-l6-verb-fill",
          type: "verb-fill",
          instruction: "Isi bagian kosong dengan bentuk lampau yang tepat.",
          sentence: "My friends ___ happy after the game.",
          baseVerb: "be",
          answer: "were",
          translation: "Teman-teman saya senang setelah pertandingan.",
          explanation: "My friends adalah subjek jamak, jadi gunakan were.",
        },
        {
          id: "a1-u3-l6-word-order",
          type: "word-order",
          instruction: "Susun kata-kata menjadi kalimat penutup cerita.",
          prompt: "Katakan bahwa terakhir kamu makan malam bersama keluarga.",
          words: ["Finally,", "I", "had", "dinner", "with", "my", "family."],
          answer: "Finally, I had dinner with my family.",
          translation: "Terakhir, saya makan malam bersama keluarga saya.",
        },
        {
          id: "a1-u3-l6-guided-speaking",
          type: "listen-speak",
          mode: "guided-speaking",
          instruction: "Ceritakan tiga hal yang kamu lakukan kemarin.",
          audioText:
            "Yesterday, I was at school. Then, I played badminton. Finally, I had dinner with my family.",
          prompt:
            "Buat cerita tiga atau empat kalimat. Sertakan satu penanda waktu dan sedikitnya dua kata kerja lampau.",
          translation:
            "Kemarin, saya berada di sekolah. Kemudian, saya bermain bulu tangkis. Terakhir, saya makan malam bersama keluarga.",
          modelAnswer:
            "Yesterday morning, I was at home. Then, I visited my friend. We played a game. Finally, I watched a movie with my family.",
          focus: "Kelancaran, urutan cerita, serta penggunaan was/were dan kata kerja lampau.",
        },
      ],
      recap: [
        "Gunakan yesterday atau last ... untuk menandai waktu lampau.",
        "Pilih was/were untuk keadaan dan bentuk past simple untuk kegiatan.",
        "Hubungkan tiga kegiatan dengan first, then, atau finally.",
      ],
      coachTip:
        "Berbicara perlahan tidak masalah. Utamakan tiga kalimat yang jelas dan bentuk kata kerja yang benar.",
    },
  ],
} satisfies UnitContent;
