import type { UnitContent } from "./types";

export const DAILY_ROUTINE_CONTENT = {
  unitId: "a1-daily-routine",
  overview:
    "Unit ini membantu pelajar menceritakan rutinitas dari pagi sampai malam dengan kata kerja umum, keterangan waktu, dan present simple.",
  outcomes: [
    "Mengenali dan memakai kata kerja untuk rutinitas sehari-hari.",
    "Membuat kalimat present simple dengan bentuk kata kerja yang tepat.",
    "Mengajukan pertanyaan sederhana memakai do dan does.",
    "Menceritakan rutinitas harian secara runtut dalam sedikitnya lima kalimat.",
  ],
  lessons: [
    {
      lessonId: "a1-u2-routine-verbs",
      objective:
        "Mengenali dan memakai kata kerja paling umum untuk kegiatan dari bangun tidur hingga tidur malam.",
      warmup:
        "Bayangkan kegiatanmu pagi ini. Sebutkan tiga kegiatan yang kamu lakukan setelah bangun tidur, boleh dalam bahasa Indonesia dahulu.",
      vocabulary: [
        {
          term: "wake up",
          meaning: "bangun tidur",
          example: "I wake up at six every day.",
          exampleMeaning: "Saya bangun pukul enam setiap hari.",
        },
        {
          term: "have breakfast",
          meaning: "sarapan",
          example: "We have breakfast in the kitchen.",
          exampleMeaning: "Kami sarapan di dapur.",
        },
        {
          term: "go to work",
          meaning: "pergi bekerja",
          example: "My father goes to work at eight.",
          exampleMeaning: "Ayah saya pergi bekerja pukul delapan.",
        },
        {
          term: "go to bed",
          meaning: "pergi tidur",
          example: "I go to bed at ten.",
          exampleMeaning: "Saya pergi tidur pukul sepuluh.",
        },
      ],
      teachingPoints: [
        {
          title: "Kegiatan memakai pasangan kata",
          explanation:
            "Beberapa rutinitas terdiri dari dua atau tiga kata. Pelajari sebagai satu frasa agar terdengar natural.",
          pattern: "wake up / have breakfast / go to work / go to bed",
          examples: [
            {
              english: "I wake up early.",
              indonesian: "Saya bangun lebih awal.",
            },
            {
              english: "They go to bed at eleven.",
              indonesian: "Mereka pergi tidur pukul sebelas.",
            },
          ],
          tip: "Jangan menghilangkan kata to dalam go to work dan go to bed.",
        },
        {
          title: "Menyebut waktu kegiatan",
          explanation:
            "Gunakan at sebelum jam tertentu. Gunakan in the morning, in the afternoon, atau in the evening untuk bagian hari.",
          pattern: "subject + activity + at + time",
          examples: [
            {
              english: "I have breakfast at seven.",
              indonesian: "Saya sarapan pukul tujuh.",
            },
            {
              english: "We study in the evening.",
              indonesian: "Kami belajar pada malam hari.",
            },
          ],
        },
      ],
      practice: [
        {
          id: "a1-u2-l1-match-routines",
          type: "vocabulary-match",
          instruction: "Pasangkan kegiatan dengan arti yang tepat.",
          pairs: [
            { id: "routine-wake", term: "wake up", match: "bangun tidur" },
            { id: "routine-breakfast", term: "have breakfast", match: "sarapan" },
            { id: "routine-work", term: "go to work", match: "pergi bekerja" },
            { id: "routine-bed", term: "go to bed", match: "pergi tidur" },
          ],
        },
        {
          id: "a1-u2-l1-choose-bed",
          type: "multiple-choice",
          instruction: "Pilih frasa bahasa Inggris yang paling tepat.",
          prompt: "Kegiatan yang berarti 'pergi tidur' adalah ...",
          options: ["go to bed", "have breakfast", "wake up", "go to work"],
          answer: "go to bed",
          explanation: "Go to bed berarti pergi tidur atau mulai tidur pada malam hari.",
        },
        {
          id: "a1-u2-l1-repeat-morning",
          type: "listen-speak",
          mode: "listen-and-repeat",
          instruction: "Dengarkan lalu ulangi dengan ritme yang sama.",
          audioText: "I wake up at six and have breakfast at seven.",
          prompt: "Ulangi kalimat tentang dua kegiatan pagi ini.",
          translation: "Saya bangun pukul enam dan sarapan pukul tujuh.",
          focus: "Tekankan wake up, six, breakfast, dan seven.",
        },
      ],
      recap: [
        "Pelajari frasa rutinitas sebagai satu kelompok kata.",
        "Gunakan at sebelum jam tertentu.",
        "Gunakan in the morning, afternoon, atau evening untuk bagian hari.",
      ],
      coachTip:
        "Pilih empat kegiatan yang benar-benar kamu lakukan setiap hari, lalu ucapkan masing-masing bersama waktunya.",
    },
    {
      lessonId: "a1-u2-present-simple",
      objective:
        "Membuat kalimat present simple positif dengan bentuk dasar atau akhiran -s yang sesuai subjek.",
      warmup:
        "Lengkapi secara lisan: I work ..., I study ..., dan My friend works .... Tidak perlu membuat kalimat panjang.",
      vocabulary: [
        {
          term: "work",
          meaning: "bekerja",
          example: "I work at a hospital.",
          exampleMeaning: "Saya bekerja di rumah sakit.",
        },
        {
          term: "study",
          meaning: "belajar",
          example: "She studies English every night.",
          exampleMeaning: "Dia belajar bahasa Inggris setiap malam.",
        },
        {
          term: "start",
          meaning: "memulai",
          example: "We start class at nine.",
          exampleMeaning: "Kami memulai kelas pukul sembilan.",
        },
        {
          term: "finish",
          meaning: "menyelesaikan atau berakhir",
          example: "He finishes work at five.",
          exampleMeaning: "Dia selesai bekerja pukul lima.",
        },
        {
          term: "usually",
          meaning: "biasanya",
          example: "I usually have breakfast at home.",
          exampleMeaning: "Saya biasanya sarapan di rumah.",
        },
      ],
      teachingPoints: [
        {
          title: "I, you, we, dan they memakai bentuk dasar",
          explanation:
            "Untuk rutinitas dengan I, you, we, atau they, gunakan kata kerja bentuk dasar tanpa akhiran tambahan.",
          pattern: "I / You / We / They + base verb",
          examples: [
            {
              english: "I work from Monday to Friday.",
              indonesian: "Saya bekerja dari Senin sampai Jumat.",
            },
            {
              english: "They study after dinner.",
              indonesian: "Mereka belajar setelah makan malam.",
            },
          ],
        },
        {
          title: "Aturan umum: tambahkan -s",
          explanation:
            "Dengan he, she, it, atau nama satu orang, tambahkan -s pada kebanyakan kata kerja.",
          pattern: "He / She / It + verb-s",
          examples: [
            {
              english: "She starts work at eight.",
              indonesian: "Dia mulai bekerja pukul delapan.",
            },
            {
              english: "Rudi works from home.",
              indonesian: "Rudi bekerja dari rumah.",
            },
          ],
          tip: "Periksa subjek dahulu sebelum memilih bentuk kata kerja.",
        },
        {
          title: "Kapan memakai -es dan -ies",
          explanation:
            "Kata kerja berakhiran -s, -sh, -ch, -x, atau -o mendapat -es. Jika kata kerja berakhir dengan konsonan + y, ubah y menjadi -ies.",
          pattern: "wash → washes; go → goes; study → studies",
          examples: [
            {
              english: "He washes his face in the morning.",
              indonesian: "Dia mencuci wajahnya pada pagi hari.",
              note: "wash berakhir dengan -sh, jadi tambahkan -es.",
            },
            {
              english: "Rafi studies in the evening.",
              indonesian: "Rafi belajar pada malam hari.",
              note: "study berakhir dengan konsonan + y, jadi berubah menjadi studies.",
            },
          ],
        },
        {
          title: "Posisi usually dan normally",
          explanation:
            "Dalam kalimat present simple positif, letakkan usually atau normally setelah subjek dan sebelum kata kerja utama.",
          pattern: "Subject + usually / normally + main verb",
          examples: [
            {
              english: "I usually have breakfast at home.",
              indonesian: "Saya biasanya sarapan di rumah.",
            },
            {
              english: "She normally starts work at eight.",
              indonesian: "Dia biasanya mulai bekerja pukul delapan.",
            },
          ],
          tip: "Ingat urutannya: siapa, seberapa sering, lalu kegiatannya.",
        },
      ],
      practice: [
        {
          id: "a1-u2-l2-choose-studies",
          type: "multiple-choice",
          instruction: "Pilih bentuk kata kerja yang tepat.",
          prompt: "Maya ___ English every evening.",
          options: ["studies", "study", "studying", "to study"],
          answer: "studies",
          explanation: "Maya adalah satu orang, jadi study berubah menjadi studies.",
        },
        {
          id: "a1-u2-l2-fill-work",
          type: "verb-fill",
          instruction: "Isi bagian kosong dengan bentuk kata kerja yang benar.",
          sentence: "I ___ at a bank every weekday.",
          baseVerb: "work",
          answer: "work",
          translation: "Saya bekerja di bank setiap hari kerja.",
          explanation: "Subjek I memakai bentuk dasar work.",
        },
        {
          id: "a1-u2-l2-order-starts",
          type: "word-order",
          instruction: "Susun kata menjadi kalimat present simple yang benar.",
          prompt: "Dia mulai bekerja pukul delapan.",
          words: ["He", "starts", "work", "at", "eight."],
          answer: "He starts work at eight.",
          translation: "Dia mulai bekerja pukul delapan.",
        },
        {
          id: "a1-u2-l2-order-usually",
          type: "word-order",
          instruction: "Susun kata dengan posisi adverb of frequency yang tepat.",
          prompt: "Dia biasanya mulai bekerja pukul delapan.",
          words: ["She", "usually", "starts", "work", "at", "eight."],
          answer: "She usually starts work at eight.",
          translation: "Dia biasanya mulai bekerja pukul delapan.",
        },
      ],
      recap: [
        "I, you, we, dan they memakai kata kerja bentuk dasar.",
        "He, she, it, dan nama satu orang biasanya memakai verb-s; akhiran -s, -sh, -ch, -x, atau -o memakai -es.",
        "Kata kerja berakhiran konsonan + y berubah menjadi -ies.",
        "Usually dan normally berada setelah subjek, sebelum kata kerja utama.",
      ],
      coachTip:
        "Saat berbicara, pikirkan satu pertanyaan singkat: subjeknya satu orang atau bukan? Itu membantu memilih work atau works.",
    },
    {
      lessonId: "a1-u2-does-questions",
      objective:
        "Membuat pertanyaan dan jawaban pendek tentang rutinitas memakai do atau does.",
      warmup:
        "Pikirkan dua hal yang ingin kamu tanyakan tentang rutinitas teman, misalnya waktu bangun dan tempat sarapan.",
      vocabulary: [
        {
          term: "weekday",
          meaning: "hari kerja, Senin sampai Jumat",
          example: "Do you work on weekdays?",
          exampleMeaning: "Apakah kamu bekerja pada hari kerja?",
        },
        {
          term: "weekend",
          meaning: "akhir pekan",
          example: "She rests on the weekend.",
          exampleMeaning: "Dia beristirahat pada akhir pekan.",
        },
        {
          term: "early",
          meaning: "lebih awal atau pagi-pagi",
          example: "Does he wake up early?",
          exampleMeaning: "Apakah dia bangun pagi-pagi?",
        },
        {
          term: "usually",
          meaning: "biasanya",
          example: "I usually eat at home.",
          exampleMeaning: "Saya biasanya makan di rumah.",
        },
      ],
      teachingPoints: [
        {
          title: "Do untuk I, you, we, dan they",
          explanation:
            "Letakkan do di awal pertanyaan ya atau tidak. Kata kerja utama tetap dalam bentuk dasar.",
          pattern: "Do + I / you / we / they + base verb ...?",
          examples: [
            {
              english: "Do you have breakfast at home?",
              indonesian: "Apakah kamu sarapan di rumah?",
            },
            {
              english: "Do they work on Saturdays?",
              indonesian: "Apakah mereka bekerja pada hari Sabtu?",
            },
          ],
          tip: "Jawab singkat dengan Yes, I do atau No, I don't.",
        },
        {
          title: "Does untuk he, she, it, dan satu nama",
          explanation:
            "Gunakan does untuk satu orang. Setelah does, kata kerja kembali ke bentuk dasar tanpa -s.",
          pattern: "Does + he / she / name + base verb ...?",
          examples: [
            {
              english: "Does Lina start work at nine?",
              indonesian: "Apakah Lina mulai bekerja pukul sembilan?",
            },
            {
              english: "What time does he go to bed?",
              indonesian: "Pukul berapa dia pergi tidur?",
              note: "Gunakan go, bukan goes, setelah does.",
            },
          ],
          tip: "Does sudah membawa penanda orang ketiga, jadi kata kerja utama tidak memakai -s.",
        },
      ],
      practice: [
        {
          id: "a1-u2-l3-choose-does",
          type: "multiple-choice",
          instruction: "Pilih kata bantu yang tepat.",
          prompt: "___ your brother work on Saturdays?",
          options: ["Does", "Do", "Is", "Are"],
          answer: "Does",
          explanation: "Your brother berarti he, sehingga pertanyaannya dimulai dengan does.",
        },
        {
          id: "a1-u2-l3-fill-start",
          type: "verb-fill",
          instruction: "Isi bagian kosong dengan bentuk kata kerja yang tepat.",
          sentence: "What time does Rina ___ work?",
          baseVerb: "start",
          answer: "start",
          translation: "Pukul berapa Rina mulai bekerja?",
          explanation: "Setelah does, gunakan bentuk dasar start tanpa -s.",
        },
        {
          id: "a1-u2-l3-order-question",
          type: "word-order",
          instruction: "Susun kata menjadi pertanyaan yang benar.",
          prompt: "Apakah kamu sarapan di rumah?",
          words: ["Do", "you", "have", "breakfast", "at", "home?"],
          answer: "Do you have breakfast at home?",
          translation: "Apakah kamu sarapan di rumah?",
        },
        {
          id: "a1-u2-l3-choose-short-answer",
          type: "multiple-choice",
          instruction: "Pilih pasangan jawaban pendek yang benar.",
          prompt: "Does he work on Saturdays?",
          options: [
            "Yes, he does. / No, he doesn't.",
            "Yes, he do. / No, he don't.",
            "Yes, he works. / No, he not.",
            "Yes, does he. / No, doesn't he.",
          ],
          answer: "Yes, he does. / No, he doesn't.",
          explanation:
            "Pertanyaan dengan does dijawab memakai does atau doesn't: Yes, he does atau No, he doesn't.",
        },
      ],
      recap: [
        "Gunakan do untuk I, you, we, dan they.",
        "Gunakan does untuk he, she, it, atau nama satu orang.",
        "Kata kerja setelah do atau does selalu kembali ke bentuk dasar.",
        "Jawaban pendeknya mengikuti kata bantu: Yes, he does atau No, he doesn't.",
      ],
      coachTip:
        "Latih pertanyaan bersama jawaban pendeknya: Do you ...? Yes, I do. Does she ...? No, she doesn't.",
    },
    {
      lessonId: "a1-u2-order-the-day",
      objective:
        "Mengurutkan kegiatan harian dengan kata penghubung sederhana dan keterangan waktu yang jelas.",
      warmup:
        "Urutkan empat kegiatan ini menurut harimu sendiri: bangun, sarapan, bekerja atau belajar, lalu tidur.",
      vocabulary: [
        {
          term: "first",
          meaning: "pertama-tama",
          example: "First, I make my bed.",
          exampleMeaning: "Pertama-tama, saya merapikan tempat tidur.",
        },
        {
          term: "then",
          meaning: "kemudian",
          example: "Then, I take a shower.",
          exampleMeaning: "Kemudian, saya mandi.",
        },
        {
          term: "after that",
          meaning: "setelah itu",
          example: "After that, I go to school.",
          exampleMeaning: "Setelah itu, saya pergi ke sekolah.",
        },
        {
          term: "finally",
          meaning: "akhirnya atau sebagai langkah terakhir",
          example: "Finally, I go to bed.",
          exampleMeaning: "Terakhir, saya pergi tidur.",
        },
      ],
      teachingPoints: [
        {
          title: "Penanda urutan membuat cerita mudah diikuti",
          explanation:
            "Awali kegiatan pertama dengan first, lanjutkan dengan then atau after that, dan tutup dengan finally.",
          pattern: "First, ... Then, ... After that, ... Finally, ...",
          examples: [
            {
              english: "First, I wake up. Then, I drink water.",
              indonesian: "Pertama, saya bangun. Kemudian, saya minum air.",
            },
            {
              english: "After that, I have breakfast.",
              indonesian: "Setelah itu, saya sarapan.",
            },
          ],
        },
        {
          title: "Tambahkan waktu pada kegiatan penting",
          explanation:
            "Keterangan waktu biasanya diletakkan setelah kegiatan. Tidak semua kalimat harus memiliki jam.",
          pattern: "connector + subject + activity + time",
          examples: [
            {
              english: "Then, I leave home at seven thirty.",
              indonesian: "Kemudian, saya meninggalkan rumah pukul tujuh tiga puluh.",
            },
            {
              english: "Finally, I go to bed at ten.",
              indonesian: "Terakhir, saya pergi tidur pukul sepuluh.",
            },
          ],
          tip: "Berhenti sebentar setelah first, then, after that, dan finally saat berbicara.",
        },
      ],
      practice: [
        {
          id: "a1-u2-l4-match-connectors",
          type: "vocabulary-match",
          instruction: "Pasangkan penanda urutan dengan artinya.",
          pairs: [
            { id: "connector-first", term: "first", match: "pertama-tama" },
            { id: "connector-then", term: "then", match: "kemudian" },
            { id: "connector-after", term: "after that", match: "setelah itu" },
            { id: "connector-finally", term: "finally", match: "terakhir" },
          ],
        },
        {
          id: "a1-u2-l4-order-first",
          type: "word-order",
          instruction: "Susun kata menjadi langkah pertama dalam rutinitas.",
          prompt: "Pertama-tama, saya mandi.",
          words: ["First,", "I", "take", "a", "shower."],
          answer: "First, I take a shower.",
          translation: "Pertama-tama, saya mandi.",
        },
        {
          id: "a1-u2-l4-order-school",
          type: "word-order",
          instruction: "Susun kata menjadi kegiatan berikutnya.",
          prompt: "Setelah itu, saya pergi ke sekolah.",
          words: ["After", "that,", "I", "go", "to", "school."],
          answer: "After that, I go to school.",
          translation: "Setelah itu, saya pergi ke sekolah.",
        },
        {
          id: "a1-u2-l4-guided-sequence",
          type: "listen-speak",
          mode: "guided-speaking",
          instruction: "Ikuti pola contoh, lalu ceritakan tiga kegiatanmu sendiri.",
          audioText: "First, I wake up. Then, I have breakfast. After that, I go to work.",
          prompt: "Ceritakan tiga kegiatan berurutan memakai first, then, dan after that.",
          modelAnswer: "First, I wake up at six. Then, I take a shower. After that, I have breakfast.",
          focus: "Urutan yang logis dan jeda singkat setelah setiap connector.",
        },
      ],
      recap: [
        "First menandai kegiatan pertama dan finally menandai kegiatan terakhir.",
        "Then dan after that menghubungkan kegiatan di bagian tengah.",
        "Letakkan keterangan jam setelah kegiatan.",
      ],
      coachTip:
        "Gunakan satu jari untuk setiap kegiatan saat berbicara. Cara sederhana ini membantu menjaga urutan ceritamu.",
    },
    {
      lessonId: "a1-u2-listen-schedule",
      objective:
        "Menangkap jam dan urutan kegiatan utama dari jadwal harian yang diucapkan dengan jelas.",
      warmup:
        "Ucapkan jam berikut dalam bahasa Inggris: 7:00, 8:30, dan 12:00. Dengarkan perbedaan seven dan seven thirty.",
      vocabulary: [
        {
          term: "schedule",
          meaning: "jadwal",
          example: "My schedule is busy today.",
          exampleMeaning: "Jadwal saya sibuk hari ini.",
        },
        {
          term: "lunch break",
          meaning: "waktu istirahat makan siang",
          example: "My lunch break starts at twelve.",
          exampleMeaning: "Istirahat makan siang saya dimulai pukul dua belas.",
        },
        {
          term: "meeting",
          meaning: "rapat atau pertemuan",
          example: "She has a meeting at two.",
          exampleMeaning: "Dia memiliki rapat pukul dua.",
        },
        {
          term: "busy",
          meaning: "sibuk",
          example: "Monday is a busy day.",
          exampleMeaning: "Senin adalah hari yang sibuk.",
        },
      ],
      teachingPoints: [
        {
          title: "Dengarkan kata kerja dan jam",
          explanation:
            "Untuk memahami jadwal, cari dua informasi utama: kegiatan apa yang dilakukan dan pukul berapa kegiatan itu terjadi.",
          pattern: "activity + at + time",
          examples: [
            {
              english: "Leo starts work at eight thirty.",
              indonesian: "Leo mulai bekerja pukul delapan tiga puluh.",
            },
            {
              english: "Nina has lunch at twelve.",
              indonesian: "Nina makan siang pukul dua belas.",
            },
          ],
          tip: "Catat angka yang terdengar; jangan mencoba menerjemahkan seluruh kalimat sekaligus.",
        },
        {
          title: "Kata penghubung memberi petunjuk urutan",
          explanation:
            "Then dan after that memberi tahu bahwa kegiatan berikutnya terjadi sesudah kegiatan sebelumnya.",
          examples: [
            {
              english: "Mia has lunch at twelve. Then, she has a meeting.",
              indonesian: "Mia makan siang pukul dua belas. Kemudian, dia mengikuti rapat.",
            },
            {
              english: "After that, she finishes work at five.",
              indonesian: "Setelah itu, dia selesai bekerja pukul lima.",
            },
          ],
        },
      ],
      practice: [
        {
          id: "a1-u2-l5-listen-start-time",
          type: "listen-speak",
          mode: "listen-and-choose",
          instruction: "Dengarkan lalu pilih waktu yang kamu dengar.",
          audioText: "Leo starts work at eight thirty.",
          prompt: "Pukul berapa Leo mulai bekerja?",
          options: ["7:30", "8:00", "8:30"],
          answer: "8:30",
          focus: "Bedakan eight dengan eight thirty.",
        },
        {
          id: "a1-u2-l5-listen-after-lunch",
          type: "listen-speak",
          mode: "listen-and-choose",
          instruction: "Dengarkan jadwal singkat lalu pilih kegiatan yang benar.",
          audioText: "Mia has lunch at twelve. After that, she has a meeting at two. She finishes work at five.",
          prompt: "Apa yang Mia lakukan setelah makan siang?",
          options: ["She goes home.", "She has a meeting.", "She starts work."],
          answer: "She has a meeting.",
          focus: "Gunakan after that sebagai petunjuk urutan.",
        },
        {
          id: "a1-u2-l5-choose-evening",
          type: "multiple-choice",
          instruction: "Pilih bagian hari yang sesuai.",
          prompt: "Dalam kalimat 'I study in the evening,' kapan kegiatan itu terjadi?",
          options: ["Pagi hari", "Siang hari", "Sore atau malam hari", "Tengah malam"],
          answer: "Sore atau malam hari",
          explanation: "In the evening merujuk pada waktu sore menuju malam.",
        },
      ],
      recap: [
        "Cari kegiatan dan jam untuk memahami sebuah jadwal.",
        "Kata thirty setelah angka jam berarti lewat tiga puluh menit.",
        "Then dan after that menunjukkan kegiatan berikutnya.",
      ],
      coachTip:
        "Saat mendengar jadwal, tulis kata kunci seperti work - 8:30 atau meeting - 2:00. Catatan pendek lebih mudah daripada kalimat lengkap.",
    },
    {
      lessonId: "a1-u2-checkpoint",
      objective:
        "Menyampaikan rutinitas hari kerja dalam sedikitnya lima kalimat yang runtut dan mudah dipahami.",
      warmup:
        "Pilih lima titik dalam harimu: bangun, kegiatan pagi, mulai bekerja atau belajar, kegiatan sore, dan tidur.",
      vocabulary: [
        {
          term: "normally",
          meaning: "biasanya atau secara normal",
          example: "I normally wake up at six.",
          exampleMeaning: "Saya biasanya bangun pukul enam.",
        },
        {
          term: "before",
          meaning: "sebelum",
          example: "I drink water before breakfast.",
          exampleMeaning: "Saya minum air sebelum sarapan.",
        },
        {
          term: "after",
          meaning: "setelah",
          example: "I study after dinner.",
          exampleMeaning: "Saya belajar setelah makan malam.",
        },
        {
          term: "weekday",
          meaning: "hari kerja",
          example: "My weekdays start early.",
          exampleMeaning: "Hari-hari kerja saya dimulai lebih awal.",
        },
      ],
      teachingPoints: [
        {
          title: "Bangun jawaban lima langkah",
          explanation:
            "Mulai dengan waktu bangun, tambahkan kegiatan pagi, siang, dan sore, lalu tutup dengan kegiatan malam.",
          pattern: "opening + morning + daytime + evening + closing",
          examples: [
            {
              english: "On weekdays, I wake up at six.",
              indonesian: "Pada hari kerja, saya bangun pukul enam.",
            },
            {
              english: "Finally, I go to bed at ten thirty.",
              indonesian: "Terakhir, saya pergi tidur pukul sepuluh tiga puluh.",
            },
          ],
          tip: "Satu kalimat jelas untuk satu kegiatan sudah cukup pada level A1.",
        },
        {
          title: "Periksa subjek, kata kerja, dan urutan",
          explanation:
            "Pastikan he atau she memakai verb-s, sementara I memakai bentuk dasar. Gunakan connector agar urutan tidak membingungkan.",
          examples: [
            {
              english: "I finish work at five, but my sister finishes at six.",
              indonesian: "Saya selesai bekerja pukul lima, tetapi saudari saya selesai pukul enam.",
            },
            {
              english: "After that, I have dinner with my family.",
              indonesian: "Setelah itu, saya makan malam bersama keluarga.",
            },
          ],
        },
      ],
      practice: [
        {
          id: "a1-u2-l6-guided-routine",
          type: "listen-speak",
          mode: "guided-speaking",
          instruction: "Dengarkan model, lalu ceritakan rutinitasmu dengan lima kalimat.",
          audioText: "On weekdays, I wake up at six. Then, I take a shower. After that, I have breakfast. I start work at eight. Finally, I go to bed at ten.",
          prompt: "Ceritakan rutinitas hari kerjamu dari pagi sampai malam.",
          modelAnswer: "On weekdays, I wake up at six. Then, I make my bed. After that, I have breakfast at seven. I study in the afternoon. Finally, I go to bed at ten.",
          focus: "Lima kalimat lengkap, present simple, dan urutan yang jelas.",
        },
        {
          id: "a1-u2-l6-order-opening",
          type: "word-order",
          instruction: "Susun kata menjadi pembuka cerita rutinitas.",
          prompt: "Pada hari kerja, saya bangun pukul enam.",
          words: ["On", "weekdays,", "I", "wake", "up", "at", "six."],
          answer: "On weekdays, I wake up at six.",
          translation: "Pada hari kerja, saya bangun pukul enam.",
        },
        {
          id: "a1-u2-l6-fill-goes",
          type: "verb-fill",
          instruction: "Isi bagian kosong dengan bentuk kata kerja yang tepat.",
          sentence: "My sister ___ home at five.",
          baseVerb: "go",
          answer: "goes",
          translation: "Saudari saya pulang pukul lima.",
          explanation: "My sister berarti she, jadi go berubah menjadi goes.",
        },
      ],
      recap: [
        "Cerita rutinitas yang baik bergerak dari pagi menuju malam.",
        "Gunakan present simple dan cocokkan bentuk kata kerja dengan subjek.",
        "Connector serta jam membantu pendengar mengikuti ceritamu.",
      ],
      coachTip:
        "Rekam jawaban lima kalimatmu sekali. Dengarkan kembali, lalu ulangi hanya bagian yang masih terhenti atau kurang jelas.",
    },
  ],
} satisfies UnitContent;
