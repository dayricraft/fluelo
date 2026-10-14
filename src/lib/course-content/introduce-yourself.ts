import type { UnitContent } from "./types";

export const INTRODUCE_YOURSELF_CONTENT = {
  unitId: "a1-introduce-yourself",
  overview:
    "Belajar menyapa orang, menyebutkan identitas dasar, dan memperkenalkan diri dalam percakapan singkat.",
  outcomes: [
    "Menyapa dan menutup perkenalan dengan ungkapan yang sesuai.",
    "Memilih subject pronoun serta bentuk am, is, atau are dengan tepat.",
    "Menyampaikan nama, usia, asal, pekerjaan atau status pelajar, dan kesukaan sederhana.",
    "Memahami informasi utama dari perkenalan singkat yang diucapkan dengan jelas.",
  ],
  lessons: [
    {
      lessonId: "a1-u1-greetings",
      objective:
        "Menggunakan sapaan dasar dan menyampaikan nama, asal, serta pekerjaan dalam kalimat pendek.",
      warmup:
        "Bayangkan kamu bertemu teman baru. Informasi apa yang biasanya kamu sampaikan lebih dahulu?",
      vocabulary: [
        {
          term: "hello",
          meaning: "halo",
          example: "Hello, I am Rani.",
          exampleMeaning: "Halo, saya Rani.",
        },
        {
          term: "name",
          meaning: "nama",
          example: "My name is Bima.",
          exampleMeaning: "Nama saya Bima.",
        },
        {
          term: "from",
          meaning: "dari",
          example: "I am from Indonesia.",
          exampleMeaning: "Saya dari Indonesia.",
        },
        {
          term: "years old",
          meaning: "berusia ... tahun",
          example: "I am 20 years old.",
          exampleMeaning: "Saya berusia 20 tahun.",
        },
        {
          term: "student",
          meaning: "pelajar atau mahasiswa",
          example: "I am a student.",
          exampleMeaning: "Saya seorang pelajar.",
        },
        {
          term: "nice to meet you",
          meaning: "senang bertemu denganmu",
          example: "Hi, Dito. Nice to meet you.",
          exampleMeaning: "Hai, Dito. Senang bertemu denganmu.",
        },
      ],
      teachingPoints: [
        {
          title: "Mulai dengan sapaan dan nama",
          explanation:
            "Gunakan Hello atau Hi, lalu sebutkan nama dengan I am atau My name is.",
          pattern: "Hello, I am + nama. / My name is + nama.",
          examples: [
            {
              english: "Hello, I am Sari.",
              indonesian: "Halo, saya Sari.",
            },
            {
              english: "Hi, my name is Andi.",
              indonesian: "Hai, nama saya Andi.",
            },
          ],
          tip: "Dalam percakapan, I'm adalah bentuk singkat yang alami dari I am.",
        },
        {
          title: "Tambahkan asal, usia, dan pekerjaan",
          explanation:
            "Pakai from untuk menyebutkan asal, years old untuk usia, serta a atau an sebelum satu pekerjaan.",
          pattern:
            "I am from + tempat. / I am + angka + years old. / I am a/an + pekerjaan.",
          examples: [
            {
              english: "I am from Makassar.",
              indonesian: "Saya dari Makassar.",
            },
            {
              english: "I am 20 years old.",
              indonesian: "Saya berusia 20 tahun.",
            },
            {
              english: "I am an engineer.",
              indonesian: "Saya seorang insinyur.",
              note: "Gunakan an karena engineer dimulai dengan bunyi vokal.",
            },
          ],
        },
      ],
      practice: [
        {
          id: "a1-u1-greetings-match",
          type: "vocabulary-match",
          instruction: "Pasangkan ungkapan bahasa Inggris dengan artinya.",
          pairs: [
            { id: "a1-u1-greetings-match-hello", term: "hello", match: "halo" },
            { id: "a1-u1-greetings-match-from", term: "from", match: "dari" },
            {
              id: "a1-u1-greetings-match-meet",
              term: "nice to meet you",
              match: "senang bertemu denganmu",
            },
          ],
        },
        {
          id: "a1-u1-greetings-choice",
          type: "multiple-choice",
          instruction: "Pilih respons yang paling tepat.",
          prompt: "A: Hi, I'm Nisa. Nice to meet you. B: ___",
          options: ["Nice to meet you too.", "I am from Bali.", "Good night."],
          answer: "Nice to meet you too.",
          explanation:
            "Nice to meet you too adalah balasan yang alami ketika seseorang berkata Nice to meet you.",
        },
        {
          id: "a1-u1-greetings-order",
          type: "word-order",
          instruction: "Susun kata menjadi perkenalan yang benar.",
          prompt: "Katakan: Nama saya Ayu.",
          words: ["Ayu.", "is", "name", "My"],
          answer: "My name is Ayu.",
          translation: "Nama saya Ayu.",
        },
      ],
      recap: [
        "Hello dan Hi dapat dipakai untuk membuka perkenalan.",
        "Gunakan I'm atau My name is untuk menyebutkan nama.",
        "Gunakan I'm from untuk menyebutkan asal.",
      ],
      coachTip:
        "Tidak perlu memberi banyak informasi sekaligus. Mulai dari nama, berhenti sejenak, lalu tambahkan asal atau pekerjaan.",
    },
    {
      lessonId: "a1-u1-pronouns-to-be",
      objective:
        "Memilih subject pronoun dan bentuk to be yang tepat dalam pernyataan serta pertanyaan sederhana.",
      warmup:
        "Lengkapi dalam hati: I ___ from Indonesia dan She ___ a teacher. Apakah jawabannya sama?",
      vocabulary: [
        {
          term: "I",
          meaning: "saya",
          example: "I am ready.",
          exampleMeaning: "Saya siap.",
        },
        {
          term: "you",
          meaning: "kamu atau kalian",
          example: "You are kind.",
          exampleMeaning: "Kamu baik.",
        },
        {
          term: "he",
          meaning: "dia laki-laki",
          example: "He is my friend.",
          exampleMeaning: "Dia teman saya.",
        },
        {
          term: "she",
          meaning: "dia perempuan",
          example: "She is a doctor.",
          exampleMeaning: "Dia seorang dokter.",
        },
        {
          term: "they",
          meaning: "mereka",
          example: "They are students.",
          exampleMeaning: "Mereka adalah pelajar.",
        },
      ],
      teachingPoints: [
        {
          title: "Pasangan pronoun dan to be",
          explanation:
            "I selalu memakai am. He, she, dan it memakai is. You, we, dan they memakai are.",
          pattern: "I am / he-she-it is / you-we-they are",
          examples: [
            {
              english: "I am from Medan.",
              indonesian: "Saya dari Medan.",
            },
            {
              english: "They are my classmates.",
              indonesian: "Mereka teman sekelas saya.",
            },
          ],
          tip: "Hafalkan dalam tiga kelompok: I-am; he, she, it, atau satu orang/benda-is; you, we, dan they-are.",
        },
        {
          title: "Pertanyaan dengan to be",
          explanation:
            "Untuk membuat pertanyaan, pindahkan am, is, atau are ke depan subject.",
          pattern: "Am/Is/Are + subject + pelengkap?",
          examples: [
            {
              english: "Are you a student?",
              indonesian: "Apakah kamu seorang pelajar?",
            },
            {
              english: "Is she from Jakarta?",
              indonesian: "Apakah dia dari Jakarta?",
            },
          ],
        },
      ],
      practice: [
        {
          id: "a1-u1-pronouns-choice",
          type: "multiple-choice",
          instruction: "Pilih kalimat yang tepat untuk membicarakan Rina.",
          prompt: "Rina is a student from Bandung.",
          options: [
            "She is a student from Bandung.",
            "He are a student from Bandung.",
            "They am a student from Bandung.",
          ],
          answer: "She is a student from Bandung.",
          explanation:
            "Rina adalah satu perempuan, jadi pronoun-nya she dan bentuk to be-nya is.",
        },
        {
          id: "a1-u1-pronouns-fill-am",
          type: "verb-fill",
          instruction: "Isi bagian kosong dengan bentuk to be yang tepat.",
          sentence: "I ___ from Bandung.",
          baseVerb: "be",
          answer: "am",
          translation: "Saya dari Bandung.",
          explanation: "Subject I selalu berpasangan dengan am.",
        },
        {
          id: "a1-u1-pronouns-fill-are",
          type: "verb-fill",
          instruction: "Isi bagian kosong dengan bentuk to be yang tepat.",
          sentence: "They ___ new students.",
          baseVerb: "be",
          answer: "are",
          translation: "Mereka adalah pelajar baru.",
          explanation: "Subject they berpasangan dengan are.",
        },
        {
          id: "a1-u1-pronouns-order",
          type: "word-order",
          instruction: "Susun kata menjadi pertanyaan yang benar.",
          prompt: "Tanyakan langsung kepada lawan bicara: Apakah kamu seorang guru?",
          words: ["a", "you", "teacher?", "Are"],
          answer: "Are you a teacher?",
          translation: "Apakah kamu seorang guru?",
        },
      ],
      recap: [
        "I memakai am; he, she, dan it memakai is.",
        "You, we, dan they memakai are.",
        "Letakkan to be di depan subject untuk membuat pertanyaan.",
      ],
      coachTip:
        "Saat ragu, ucapkan pasangan pendeknya lebih dulu, misalnya she-is, baru lanjutkan seluruh kalimat.",
    },
    {
      lessonId: "a1-u1-build-introduction",
      objective:
        "Menyusun empat informasi pribadi menjadi perkenalan yang singkat, jelas, dan berurutan.",
      warmup:
        "Pilih empat hal yang ingin kamu ceritakan: nama, kota, pekerjaan atau studi, dan satu kesukaan.",
      vocabulary: [
        {
          term: "live",
          meaning: "tinggal",
          example: "I live in Surabaya.",
          exampleMeaning: "Saya tinggal di Surabaya.",
        },
        {
          term: "work",
          meaning: "bekerja",
          example: "I work at a bank.",
          exampleMeaning: "Saya bekerja di sebuah bank.",
        },
        {
          term: "study",
          meaning: "belajar atau berkuliah",
          example: "I study English.",
          exampleMeaning: "Saya belajar bahasa Inggris.",
        },
        {
          term: "like",
          meaning: "menyukai",
          example: "I like music.",
          exampleMeaning: "Saya menyukai musik.",
        },
        {
          term: "hobby",
          meaning: "hobi",
          example: "My hobby is cooking.",
          exampleMeaning: "Hobi saya adalah memasak.",
        },
      ],
      teachingPoints: [
        {
          title: "Urutan perkenalan yang mudah diikuti",
          explanation:
            "Mulai dengan nama, lanjutkan asal atau tempat tinggal, lalu pekerjaan atau studi, dan tutup dengan kesukaan.",
          pattern: "name -> place -> work/study -> interest",
          examples: [
            {
              english: "I'm Fajar. I'm from Solo. I am a student. I like football.",
              indonesian:
                "Saya Fajar. Saya dari Solo. Saya seorang pelajar. Saya suka sepak bola.",
            },
            {
              english: "My name is Lina. I live in Bali. I work at a hotel.",
              indonesian:
                "Nama saya Lina. Saya tinggal di Bali. Saya bekerja di sebuah hotel.",
            },
          ],
        },
        {
          title: "Bedakan asal dan tempat tinggal",
          explanation:
            "I'm from menyatakan asal. I live in menyatakan tempat tinggal sekarang; keduanya bisa berbeda.",
          examples: [
            {
              english: "I'm from Lombok, but I live in Jakarta.",
              indonesian: "Saya dari Lombok, tetapi saya tinggal di Jakarta.",
            },
            {
              english: "I'm from Bandung and I live there too.",
              indonesian: "Saya dari Bandung dan saya juga tinggal di sana.",
            },
          ],
          tip: "Untuk tahap ini, gunakan but hanya ketika dua informasi berbeda.",
        },
      ],
      practice: [
        {
          id: "a1-u1-build-live-order",
          type: "word-order",
          instruction: "Susun kata menjadi kalimat yang tepat.",
          prompt: "Katakan bahwa kamu tinggal di Surabaya.",
          words: ["Surabaya.", "in", "live", "I"],
          answer: "I live in Surabaya.",
          translation: "Saya tinggal di Surabaya.",
        },
        {
          id: "a1-u1-build-sequence-choice",
          type: "multiple-choice",
          instruction: "Pilih perkenalan dengan urutan yang paling mudah diikuti.",
          prompt: "Perkenalan mana yang paling jelas?",
          options: [
            "Hi, I'm Tono. I'm from Malang. I'm a teacher. I like reading.",
            "Reading teacher Malang, Tono am I.",
            "I like. From teacher. My Malang.",
          ],
          answer: "Hi, I'm Tono. I'm from Malang. I'm a teacher. I like reading.",
          explanation:
            "Pilihan pertama memakai kalimat lengkap dan bergerak dari nama menuju asal, pekerjaan, lalu kesukaan.",
        },
        {
          id: "a1-u1-build-guided-speaking",
          type: "listen-speak",
          mode: "guided-speaking",
          instruction: "Gunakan model sebagai pola, lalu ganti informasinya dengan data dirimu.",
          audioText:
            "Hi, I'm Dewi. I'm from Yogyakarta. I'm a student, and I like movies.",
          prompt: "Perkenalkan nama, asal, pekerjaan atau studi, dan satu kesukaanmu.",
          translation:
            "Hai, saya Dewi. Saya dari Yogyakarta. Saya seorang pelajar dan saya suka film.",
          modelAnswer:
            "Hi, I'm Dewi. I'm from Yogyakarta. I'm a student, and I like movies.",
          focus: "Urutan informasi dan kelengkapan empat bagian perkenalan.",
        },
      ],
      recap: [
        "Urutan sederhana: nama, tempat, pekerjaan atau studi, lalu kesukaan.",
        "Gunakan I'm from untuk asal dan I live in untuk tempat tinggal.",
        "Kalimat pendek lebih mudah dipahami daripada satu kalimat yang terlalu panjang.",
      ],
      coachTip:
        "Siapkan satu versi perkenalan empat kalimat. Setelah lancar, ganti satu informasi agar kamu tidak hanya menghafal.",
    },
    {
      lessonId: "a1-u1-listen-new-friends",
      objective:
        "Menangkap nama, asal, dan pekerjaan dari perkenalan singkat yang diucapkan dengan kecepatan ramah pemula.",
      warmup:
        "Saat mendengar perkenalan, fokuskan perhatian pada tiga kata kunci: nama, tempat, dan pekerjaan.",
      vocabulary: [
        {
          term: "nurse",
          meaning: "perawat",
          example: "Maya is a nurse.",
          exampleMeaning: "Maya adalah seorang perawat.",
        },
        {
          term: "teacher",
          meaning: "guru",
          example: "He is an English teacher.",
          exampleMeaning: "Dia seorang guru bahasa Inggris.",
        },
        {
          term: "engineer",
          meaning: "insinyur",
          example: "My sister is an engineer.",
          exampleMeaning: "Saudari saya seorang insinyur.",
        },
        {
          term: "city",
          meaning: "kota",
          example: "Jakarta is a big city.",
          exampleMeaning: "Jakarta adalah kota besar.",
        },
      ],
      teachingPoints: [
        {
          title: "Dengarkan kata setelah pola penting",
          explanation:
            "Nama biasanya muncul setelah I'm atau My name is. Tempat muncul setelah from, dan pekerjaan muncul setelah a atau an.",
          pattern: "I'm + name / from + place / a-an + job",
          examples: [
            {
              english: "I'm Maya. I'm from Bali. I'm a nurse.",
              indonesian: "Saya Maya. Saya dari Bali. Saya seorang perawat.",
            },
            {
              english: "My name is Rio. I'm an engineer.",
              indonesian: "Nama saya Rio. Saya seorang insinyur.",
            },
          ],
        },
        {
          title: "Kenali bentuk singkat",
          explanation:
            "Dalam ucapan alami, I am sering menjadi I'm dan my name is terdengar sebagai satu kelompok kata.",
          examples: [
            {
              english: "I'm from Aceh.",
              indonesian: "Saya dari Aceh.",
              note: "I'm berarti I am.",
            },
            {
              english: "She's a teacher.",
              indonesian: "Dia seorang guru.",
              note: "She's berarti she is.",
            },
          ],
          tip: "Kamu tidak harus memahami setiap kata untuk menemukan informasi utama.",
        },
      ],
      practice: [
        {
          id: "a1-u1-listen-job",
          type: "listen-speak",
          mode: "listen-and-choose",
          instruction: "Dengarkan lalu pilih pekerjaan Maya.",
          audioText: "Hi, I'm Maya. I'm from Indonesia, and I'm a nurse.",
          prompt: "Apa pekerjaan Maya?",
          options: ["A nurse", "A teacher", "A student"],
          answer: "A nurse",
          focus: "Kata pekerjaan setelah I'm a.",
        },
        {
          id: "a1-u1-listen-origin",
          type: "listen-speak",
          mode: "listen-and-choose",
          instruction: "Dengarkan lalu pilih asal Kenji.",
          audioText: "Hello, my name is Kenji. I'm from Japan. I'm a student.",
          prompt: "Dari mana Kenji berasal?",
          options: ["Japan", "Indonesia", "Korea"],
          answer: "Japan",
          focus: "Nama tempat setelah kata from.",
        },
        {
          id: "a1-u1-listen-repeat-intro",
          type: "listen-speak",
          mode: "listen-and-repeat",
          instruction: "Dengarkan, lalu ulangi kalimat perkenalan ini dengan jelas.",
          audioText: "I'm Arif. I'm from Jakarta. I'm a teacher.",
          prompt: "Ulangi tiga kalimat yang kamu dengar.",
          translation: "Saya Arif. Saya dari Jakarta. Saya seorang guru.",
          modelAnswer: "I'm Arif. I'm from Jakarta. I'm a teacher.",
          focus: "Kata kunci nama, tempat, dan pekerjaan.",
        },
      ],
      recap: [
        "Cari nama setelah I'm atau My name is.",
        "Cari tempat setelah from dan pekerjaan setelah a atau an.",
        "Bentuk singkat seperti I'm dan she's sangat umum dalam percakapan.",
      ],
      coachTip:
        "Pada dengaran pertama, cari gambaran umum. Pada dengaran kedua, catat hanya nama, tempat, dan pekerjaan.",
    },
    {
      lessonId: "a1-u1-say-your-name",
      objective:
        "Mengucapkan kalimat perkenalan dengan ritme, jeda, dan bentuk singkat yang jelas.",
      warmup:
        "Ucapkan My name is tiga kali. Rasakan bahwa name menerima tekanan lebih kuat daripada my dan is.",
      vocabulary: [
        {
          term: "say",
          meaning: "mengatakan atau mengucapkan",
          example: "Say your name, please.",
          exampleMeaning: "Sebutkan namamu, ya.",
        },
        {
          term: "spell",
          meaning: "mengeja",
          example: "Can you spell your name?",
          exampleMeaning: "Bisakah kamu mengeja namamu?",
        },
        {
          term: "repeat",
          meaning: "mengulangi",
          example: "Please repeat that.",
          exampleMeaning: "Tolong ulangi itu.",
        },
        {
          term: "slowly",
          meaning: "dengan perlahan",
          example: "Please speak slowly.",
          exampleMeaning: "Tolong bicara perlahan.",
        },
        {
          term: "again",
          meaning: "lagi",
          example: "Please say it again.",
          exampleMeaning: "Tolong ucapkan lagi.",
        },
      ],
      teachingPoints: [
        {
          title: "Tekankan informasi penting",
          explanation:
            "Dalam perkenalan, nama, tempat, dan pekerjaan lebih kuat daripada kata pendek seperti my, is, dan a.",
          pattern: "my NAME is RANI / I'm from BAN-dung",
          examples: [
            {
              english: "My NAME is RANI.",
              indonesian: "Nama saya Rani.",
            },
            {
              english: "I'm from BAN-dung.",
              indonesian: "Saya dari Bandung.",
            },
          ],
          tip: "Huruf kapital di contoh menandai bagian yang diberi tekanan, bukan cara menulis normal.",
        },
        {
          title: "Gunakan jeda pendek",
          explanation:
            "Berhenti sebentar setelah setiap informasi agar lawan bicara mudah mengikuti.",
          examples: [
            {
              english: "Hi, I'm Nanda. / I'm from Bogor. / I'm a student.",
              indonesian: "Hai, saya Nanda. / Saya dari Bogor. / Saya seorang pelajar.",
            },
            {
              english: "My name is Putri. / I like cooking.",
              indonesian: "Nama saya Putri. / Saya suka memasak.",
            },
          ],
        },
      ],
      practice: [
        {
          id: "a1-u1-pronunciation-repeat-name",
          type: "listen-speak",
          mode: "listen-and-repeat",
          instruction: "Dengarkan dan ulangi. Beri tekanan pada nama.",
          audioText: "My name is Rani.",
          prompt: "Ulangi dengan ritme yang sama.",
          translation: "Nama saya Rani.",
          modelAnswer: "My name is Rani.",
          focus: "Tekanan pada name dan Rani.",
        },
        {
          id: "a1-u1-pronunciation-repeat-origin",
          type: "listen-speak",
          mode: "listen-and-repeat",
          instruction: "Dengarkan dan ulangi dengan bentuk singkat I'm.",
          audioText: "I'm from Bandung.",
          prompt: "Ulangi kalimat dengan jelas tanpa memisahkan I dan am.",
          translation: "Saya dari Bandung.",
          modelAnswer: "I'm from Bandung.",
          focus: "Kontraksi I'm dan tekanan pada Bandung.",
        },
        {
          id: "a1-u1-pronunciation-guided",
          type: "listen-speak",
          mode: "guided-speaking",
          instruction: "Ucapkan versi dirimu dengan jeda pendek di antara kalimat.",
          audioText: "Hi, I'm Nanda. I'm from Bogor. I'm a student.",
          prompt: "Ganti Nanda, Bogor, dan student dengan informasi tentang dirimu.",
          modelAnswer: "Hi, I'm Nanda. I'm from Bogor. I'm a student.",
          focus: "Ritme, tekanan kata penting, dan jeda antarkalimat.",
        },
      ],
      recap: [
        "Tekankan nama, tempat, dan pekerjaan sebagai informasi utama.",
        "I'm adalah bentuk singkat yang alami dari I am.",
        "Gunakan jeda pendek agar perkenalan terdengar jelas dan tenang.",
      ],
      coachTip:
        "Rekam perkenalanmu satu kali, dengarkan kembali, lalu ulangi hanya bagian yang terlalu cepat atau kurang jelas.",
    },
    {
      lessonId: "a1-u1-checkpoint",
      objective:
        "Menggabungkan sapaan, to be, informasi pribadi, dan pelafalan menjadi perkenalan sekitar 30 detik.",
      warmup:
        "Siapkan enam informasi tentang dirimu: nama, usia, asal, tempat tinggal, pekerjaan atau studi, dan hobi.",
      vocabulary: [
        {
          term: "first name",
          meaning: "nama depan",
          example: "My first name is Sinta.",
          exampleMeaning: "Nama depan saya Sinta.",
        },
        {
          term: "hometown",
          meaning: "kota asal",
          example: "My hometown is Padang.",
          exampleMeaning: "Kota asal saya Padang.",
        },
        {
          term: "years old",
          meaning: "berusia ... tahun",
          example: "I am 20 years old.",
          exampleMeaning: "Saya berusia 20 tahun.",
        },
        {
          term: "job",
          meaning: "pekerjaan",
          example: "My job is interesting.",
          exampleMeaning: "Pekerjaan saya menarik.",
        },
        {
          term: "classmate",
          meaning: "teman sekelas",
          example: "Ari is my classmate.",
          exampleMeaning: "Ari adalah teman sekelas saya.",
        },
        {
          term: "welcome",
          meaning: "selamat datang",
          example: "Welcome to our class.",
          exampleMeaning: "Selamat datang di kelas kami.",
        },
      ],
      teachingPoints: [
        {
          title: "Checklist perkenalan lengkap",
          explanation:
            "Perkenalan sekitar 30 detik memiliki pembuka, usia dan tempat, pekerjaan atau studi, hobi, serta penutup yang ramah.",
          pattern:
            "greeting -> name -> age -> origin/residence -> work/study -> hobby -> closing",
          examples: [
            {
              english:
                "Hi, I'm Sinta. I am 20 years old. I'm from Padang, but I live in Jakarta. I'm a university student. My hobby is playing the guitar. Nice to meet you.",
              indonesian:
                "Hai, saya Sinta. Saya berusia 20 tahun. Saya dari Padang, tetapi saya tinggal di Jakarta. Saya seorang mahasiswa. Hobi saya bermain gitar. Senang bertemu denganmu.",
            },
            {
              english:
                "Hello, my name is Bayu. I live in Jakarta. I work at a bank. I like cycling.",
              indonesian:
                "Halo, nama saya Bayu. Saya tinggal di Jakarta. Saya bekerja di sebuah bank. Saya suka bersepeda.",
            },
          ],
        },
        {
          title: "Periksa to be sebelum berbicara",
          explanation:
            "Pastikan I memakai am, satu orang memakai is, dan you, we, atau they memakai are.",
          examples: [
            {
              english: "I am a student. She is my classmate.",
              indonesian: "Saya seorang pelajar. Dia teman sekelas saya.",
            },
            {
              english: "We are from Indonesia.",
              indonesian: "Kami dari Indonesia.",
            },
          ],
          tip: "Jika lupa, pakai kalimat pendek yang sudah kamu kuasai daripada menerjemahkan kalimat panjang.",
        },
      ],
      practice: [
        {
          id: "a1-u1-checkpoint-choice",
          type: "multiple-choice",
          instruction: "Pilih kalimat yang benar secara grammar.",
          prompt: "Kalimat mana yang tepat?",
          options: [
            "I am a student from Semarang.",
            "I is a student from Semarang.",
            "I are a student from Semarang.",
          ],
          answer: "I am a student from Semarang.",
          explanation: "Subject I selalu memakai am.",
        },
        {
          id: "a1-u1-checkpoint-fill",
          type: "verb-fill",
          instruction: "Isi bagian kosong dengan bentuk to be yang benar.",
          sentence: "She ___ from Makassar.",
          baseVerb: "be",
          answer: "is",
          translation: "Dia dari Makassar.",
          explanation: "Subject she memakai is.",
        },
        {
          id: "a1-u1-checkpoint-order",
          type: "word-order",
          instruction: "Susun kata menjadi kalimat tentang kesukaan.",
          prompt: "Katakan bahwa kamu suka membaca.",
          words: ["reading.", "like", "I"],
          answer: "I like reading.",
          translation: "Saya suka membaca.",
        },
        {
          id: "a1-u1-checkpoint-speaking",
          type: "listen-speak",
          mode: "guided-speaking",
          instruction: "Buat perkenalanmu sendiri selama sekitar 30 detik.",
          audioText:
            "Hi, I'm Sinta. I am 20 years old. I'm from Padang, but I live in Jakarta. I'm a university student. My hobby is playing the guitar. Nice to meet you.",
          prompt:
            "Buat lima atau enam kalimat sederhana. Sebutkan nama, usia, asal dan tempat tinggal, pekerjaan atau studi, serta hobi, lalu tutup dengan ramah.",
          translation:
            "Hai, saya Sinta. Saya berusia 20 tahun. Saya dari Padang, tetapi saya tinggal di Jakarta. Saya seorang mahasiswa. Hobi saya bermain gitar. Senang bertemu denganmu.",
          modelAnswer:
            "Hi, I'm Sinta. I am 20 years old. I'm from Padang, but I live in Jakarta. I'm a university student. My hobby is playing the guitar. Nice to meet you.",
          focus:
            "Kelengkapan nama, usia, tempat tinggal, studi, dan hobi; ketepatan am-is-are; serta kejelasan pengucapan.",
        },
      ],
      recap: [
        "Buka dengan sapaan dan nama, lalu sampaikan usia serta informasi lain secara berurutan.",
        "Periksa pasangan pronoun dengan am, is, atau are.",
        "Tutup dengan Nice to meet you dan ucapkan setiap bagian dengan tenang.",
      ],
      coachTip:
        "Gunakan empat kata kunci sebagai panduan, bukan naskah lengkap. Dengan begitu perkenalanmu terdengar lebih alami.",
    },
  ],
} satisfies UnitContent;
