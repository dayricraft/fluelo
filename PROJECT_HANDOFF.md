# FLUENTPATH AI - Handoff Guide & Spesifikasi Proyek

Dokumen ini adalah instruksi lengkap untuk **OpenAI Codex / AI Agent / Developer** yang akan melanjutkan pengembangan aplikasi belajar bahasa Inggris berbasis AI suara real-time (mirip Stimuler).

---

## 1. Ringkasan & Visi Aplikasi

- **Nama Konsep:** FluentPath AI (Stimuler-like Voice English Learning App)
- **Fokus Utama:** 
  1. Belajar percakapan bahasa Inggris interaktif dengan AI suara (*real-time voice to voice*).
  2. Fokus ujian: **TOEFL iBT Format Baru** (skala skor 1.0–6.0 yang selaras dengan CEFR).
  3. Sistem tingkatan standar internasional: **CEFR (A1, A2, B1, B2, C1, C2)** yang dibagi ke dalam kelompok tingkat **A (Basic), B (Independent), C (Proficient)**.
  4. Umpan balik komprehensif setelah sesi (skor band TOEFL, koreksi tata bahasa, kosakata alternatif, analisis kata pengisi/filler words, dan penjelasan dalam Bahasa Indonesia).
- **Tech Stack:**
  - **Framework:** Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS v4).
  - **AI SDK:** `@google/genai` (v2.28+).
  - **Voice Engine:** **Gemini Live API** (`gemini-3.8-live` dengan model suara `Kore`) via WebSockets langsung dari browser menggunakan **Ephemeral Auth Tokens**.
  - **Evaluator Engine:** **Gemini 3.8 Flash** (`gemini-3.8-flash`) via *Interactions API* dengan *Structured JSON Output* (JSON Schema).
  - **Audio Processing:** Browser Web Audio API + AudioWorklet kustom (`public/worklets/pcm-recorder.js`) untuk konversi mic ke 16 kHz mono 16-bit PCM (persyaratan Gemini Live) & gapless PCM 24 kHz playback.
- **Penyimpanan Data MVP:** `localStorage` dengan React 19 `useSyncExternalStore` (SSR-safe, siap di-upgrade ke Supabase/PostgreSQL).

### Status Implementasi — 14 Oktober 2026

MVP utama sudah terhubung dari UI sampai route server:

- ✅ Dashboard responsif, profil, pemilihan level/topik, placement banner, progres, dan riwayat.
- ✅ Route evaluasi dengan validasi runtime, structured JSON, serta audio WAV opsional.
- ✅ Route TOEFL Listen & Repeat untuk membuat tujuh kalimat dan menilai rekaman.
- ✅ Hook Gemini Live lengkap: token, mic PCM 16 kHz, playback PCM 24 kHz, transkrip, mute, interruption, evaluasi, dan penyimpanan sesi.
- ✅ Hook dan ruang latihan Listen & Repeat dengan browser TTS, perekaman, scoring, navigasi item, dan ringkasan hasil.
- ✅ Feedback view lengkap untuk lima kriteria, koreksi, vocabulary upgrades, filler words, dan next focus.
- ✅ ESLint, TypeScript, production build, dan smoke test HTTP lokal lulus.

- ✅ TOEFL Interview memiliki nomor pertanyaan dan timer visual 45 detik yang hanya berjalan pada giliran user, lalu mengirim sinyal `TIME_UP` untuk berpindah otomatis.
- ✅ Data `localStorage` dinormalisasi saat dibaca dan ditulis agar profil, sesi, transkrip, feedback, hasil Listen & Repeat, atau progres belajar yang rusak tidak menjatuhkan UI. Data versi lama tanpa field progres dimigrasikan tanpa menghapus profil dan riwayat.
- ✅ Fondasi automated test tersedia: 42 unit test untuk navigasi/mapping CEFR, audio, integritas kurikulum, validitas bank konten, practice engine, reducer progres belajar, dan Speaking Mission.
- ✅ Pengujian voice-to-voice nyata berhasil: ephemeral token, mikrofon, respons audio Emma, transkrip dua arah, penyimpanan sesi, dan evaluasi pascasesi bekerja.
- ✅ Playback PCM memakai resampling stream kontinu dan buffer awal untuk mencegah artefak suara pada batas network chunk.
- ✅ Grafik aktivitas memakai key tanggal unik sehingga tidak lagi menghasilkan warning React untuk label hari yang sama.
- ✅ Milestone pembelajaran 1 selesai: halaman **Belajar**, jalur fondasi A1–A2, 8 unit terurut, dan pratinjau 48 lesson sudah tersedia tanpa menyimpan progres atau memberikan XP palsu.
- ✅ Milestone pembelajaran 2 selesai: 18 lesson pada tiga unit awal memiliki materi nyata, 96 entri kosakata, 39 teaching point, serta 61 contoh latihan yang tervalidasi untuk lima format engine.
- ✅ Milestone pembelajaran 3 selesai: seluruh 61 latihan dapat dijawab dan dinilai melalui engine pilihan ganda, vocabulary matching, word order, verb fill, dan listen/speak. Sesi menyediakan feedback, skor pecahan, ringkasan, restart, TTS/transkripsi browser, serta fallback manual; hasil akhirnya kini diteruskan ke sistem progres Milestone 4.
- ✅ Smoke test Edge Milestone 3 pada build production menyelesaikan 13 soal di empat lesson, mencakup semua lima tipe UI, pilihan listening, dan fallback speaking manual dengan 0 error runtime. Pengujian tersebut dilakukan sebelum aktivasi penyimpanan progres.
- ✅ Milestone pembelajaran 4 selesai: completion lesson, XP kurikulum satu kali, mastery non-regresif, dan antrean review tersimpan di browser. Ringkasan progres tampil di Beranda, Belajar, dan Progres; data lama/rusak dinormalisasi, perubahan antartab disinkronkan, dan UI memperingatkan pengguna bila penyimpanan gagal.
- ✅ Acceptance test Edge Milestone 4 pada build production memverifikasi completion pertama, XP yang tidak dobel saat retake, review terarah hingga mastery 100%, persistence setelah reload, pembaruan tab kedua, serta kegagalan `localStorage` dan retry; tidak ada error runtime tak terduga.
- ✅ Milestone pembelajaran 5 selesai: 18 lesson aktif masing-masing memiliki Speaking Mission yang membawa target kosakata, grammar, dan tujuan lesson ke roleplay suara bersama Emma. `lessonId` selalu diselesaikan ke katalog kanonis di server untuk token Live dan evaluasi, bukan menerima instruksi misi bebas dari browser.
- ✅ Penilaian Speaking Mission menghasilkan assessment terstruktur berbasis bukti untuk tepat tiga kriteria kanonis. Sesi dan hasil misi masuk ke riwayat lokal, UI dapat kembali serta memulihkan fokus ke lesson sumber, dan penyelesaian misi sengaja tidak mengubah XP, mastery, completion, maupun review queue.
- ✅ Jika penyimpanan sesi misi gagal, hasil evaluasi tetap ditampilkan dengan peringatan bahwa sesi belum tersimpan. Normalisasi penyimpanan memastikan status lulus memerlukan skor minimal 70 dan membuang assessment misi dari sesi non-misi, tanpa menjadikannya sumber progres kurikulum.

Hasil di atas diverifikasi secara lokal sampai 14 Oktober 2026 dengan `GEMINI_API_KEY` aktif dan akses ke `gemini-3.8-live`.

---

## 2. Struktur Proyek Saat Ini

```
agitated-volta/
├── public/
│   └── worklets/
│       └── pcm-recorder.js       # ✅ SUDAH ADA: AudioWorklet resampler mic -> 16kHz mono PCM Int16
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── live-token/
│   │   │   │   └── route.ts      # ✅ SUDAH ADA: POST generator ephemeral token + lock system prompt
│   │   │   ├── evaluate/
│   │   │   │   └── route.ts      # ✅ POST evaluasi sesi dengan Gemini 3.8 Flash
│   │   │   └── toefl/
│   │   │       └── listen-repeat/
│   │   │           └── route.ts  # ✅ GET buat soal & POST nilai Listen & Repeat
│   │   ├── favicon.ico
│   │   ├── globals.css           # ✅ Tailwind CSS v4 styling
│   │   ├── layout.tsx            # ✅ Root layout
│   │   └── page.tsx              # ✅ Entry halaman FluentPath
│   ├── components/               # ✅ Dashboard, learning path, lesson material, practice session, voice room, feedback
│   ├── hooks/
│   │   ├── useLiveSession.ts     # ✅ Lifecycle Gemini Live + evaluasi
│   │   ├── useListenRepeat.ts    # ✅ Generate, playback, record, score, save
│   │   └── useCourseSpeech.ts    # ✅ TTS + SpeechRecognition en-US dengan fallback manual
│   ├── lib/
│   │   ├── audio.ts              # ✅ SUDAH ADA: Mic recorder, PcmPlayer 24kHz, WAV builder
│   │   ├── curriculum.ts         # ✅ Metadata 8 unit dan 48 lesson fondasi A1–A2
│   │   ├── course-content/      # ✅ Materi + bank contoh latihan untuk tiga unit awal
│   │   ├── practice-engine.ts    # ✅ Scoring murni untuk lima tipe latihan + deterministic shuffle
│   │   ├── levels.ts             # ✅ SUDAH ADA: Sistem level A1-C2, skor TOEFL 1-6, adaptasi AI
│   │   ├── prompts.ts            # ✅ Prompt Emma, Placement, TOEFL Interview, Speaking Mission, Evaluator
│   │   ├── speaking-missions.ts  # ✅ 18 misi kanonis yang diturunkan dari lesson aktif
│   │   ├── learning-progress.ts  # ✅ Reducer completion, XP, mastery, review queue, dan summary unit
│   │   ├── storage.ts            # ✅ LocalStorage profile, session, progres, migrasi, dan sinkronisasi tab
│   │   ├── topics.ts             # ✅ SUDAH ADA: Topik Free Talk & TOEFL Interview
│   │   ├── types.ts              # ✅ SUDAH ADA: Type definitions lengkap
│   │   └── server/
│   │       ├── gemini.ts         # ✅ SUDAH ADA: Server SDK client, generateJson helper
│   │       └── schemas.ts        # ✅ SUDAH ADA: JSON Schema evaluator & Listen/Repeat
├── package.json                  # ✅ Next 16, React 19, @google/genai, Tailwind 4
├── tsconfig.json
└── PROJECT_HANDOFF.md            # Dokumen ini
```

---

## 3. Komponen yang Sudah Selesai Dikerjakan (Detailed Checklist)

1. **Sistem Level & Rubrik TOEFL (`src/lib/levels.ts`):**
   - Mendefinisikan 6 level CEFR: A1, A2, B1, B2, C1, C2 dalam grup A, B, C.
   - Mapping ke skala baru TOEFL iBT 1.0 – 6.0 (step 0.5):
     - `6.0` = C2 (Proficient)
     - `5.0 – 5.5` = C1 (Advanced)
     - `4.0 – 4.5` = B2 (Upper-Intermediate)
     - `3.0 – 3.5` = B1 (Intermediate)
     - `2.0 – 2.5` = A2 (Elementary)
     - `1.0 – 1.5` = A1 (Beginner)
   - Fungsi saran naik/turun level otomatis (`getLevelSuggestion`).

2. **Topik Latihan (`src/lib/topics.ts`):**
   - 12 topik percakapan harian (*Free Talk*) dengan level minimum.
   - 8 topik simulasi *TOEFL "Take an Interview"* (format 4 pertanyaan bergradasi).

3. **Prompt Engineering Siap Pakai (`src/lib/prompts.ts`):**
   - `buildPracticePrompt`: AI "Emma", respons pendek 1–3 kalimat, teknik *natural recast*, alokasi waktu bicara user 70%.
   - `buildPlacementPrompt`: Penguji ramah yang menaikkan tingkat kesulitan pertanyaan secara bertahap (A1 ke C2).
   - `buildToeflInterviewPrompt`: Pewawancara TOEFL iBT dengan 4 pertanyaan per topik, waktu jawab ~45 detik per pertanyaan.
   - `buildSpeakingMissionPrompt`: Emma menjalankan roleplay berdasarkan mission, language targets, dan tiga success criteria dari lesson kanonis; browser hanya mengirim `lessonId`.
   - `buildEvaluationPrompt`: Rater TOEFL bersertifikasi, menilai 5 kriteria (*fluency, pronunciation, grammar, vocabulary, coherence*), menghasilkan koreksi dan tips dalam Bahasa Indonesia.
   - Evaluasi mode `speaking-mission` juga mengembalikan bukti ucapan pengguna untuk setiap kriteria misi, skor 0–100, status lulus yang mengikuti ambang 70, dan ringkasan percobaan berikutnya.

4. **Audio Engine Real-Time (`public/worklets/pcm-recorder.js` & `src/lib/audio.ts`):**
   - `AudioWorklet`: Merekam suara mic dari frekuensi berapa pun dan me-resample ke 16 kHz 16-bit mono PCM.
   - `startMicRecorder`: Mengirim potongan PCM ~100ms dan tingkat volume (RMS) untuk animasi UI.
   - `PcmPlayer`: Memainkan audio stream 24 kHz dari Gemini Live tanpa delay, dan mendukung pembatalan instan saat user memotong pembicaraan (*interruption handling*).
   - `pcmChunksToWavBase64`: Mengemas rekaman user menjadi file WAV base64 untuk dikirim ke evaluator.

5. **Keamanan & Ephemeral Token Route (`src/app/api/live-token/route.ts`):**
   - API key disimpan di server (`.env.local`).
   - Browser meminta token sekali pakai (*ephemeral token*) dengan durasi 30 menit.
   - Konfigurasi sistem prompt dan instruksi dikunci ke dalam token sehingga klien tidak bisa mengubah prompt di luar aturan.
   - Untuk Speaking Mission, route hanya menerima `lessonId` yang cocok dengan salah satu dari 18 lesson aktif. Lesson tidak dikenal atau unit pratinjau ditolak, lalu seluruh konteks misi dibangun ulang dari katalog server.

---

## 4. Implementasi MVP (Completed Work)

### ✅ Tugas 1: Route Evaluasi (`src/app/api/evaluate/route.ts`)
Endpoint ini menerima transkrip percakapan dan rekaman suara user (WAV base64 opsional), lalu memanggil `gemini-3.8-flash` dengan JSON Schema `FEEDBACK_SCHEMA`.

**Spesifikasi implementasi:**
```typescript
// src/app/api/evaluate/route.ts
import { buildEvaluationPrompt } from "@/lib/prompts";
import { generateJson, errorResponse } from "@/lib/server/gemini";
import { FEEDBACK_SCHEMA } from "@/lib/server/schemas";
import type { Feedback, SessionMode } from "@/lib/types";
import type { CefrLevel } from "@/lib/levels";

interface EvalRequest {
  mode: SessionMode;
  level: CefrLevel;
  topicTitle: string;
  transcript: string;
  audioWavBase64?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EvalRequest;
    const prompt = buildEvaluationPrompt({
      mode: body.mode,
      level: body.level,
      topicTitle: body.topicTitle,
      transcript: body.transcript,
      hasAudio: Boolean(body.audioWavBase64),
    });

    // Format input untuk Gemini Interactions API
    // Jika ada audio, masukkan sebagai part inline
    let input: any = prompt;
    if (body.audioWavBase64) {
      input = [
        { type: "text", text: prompt },
        {
          type: "audio",
          data: body.audioWavBase64,
          mime_type: "audio/wav",
        },
      ];
    }

    const feedback = await generateJson<Feedback>({
      input,
      schema: FEEDBACK_SCHEMA,
    });

    return Response.json(feedback);
  } catch (err) {
    return errorResponse(err);
  }
}
```

---

### ✅ Tugas 2: Route TOEFL "Listen & Repeat" (`src/app/api/toefl/listen-repeat/route.ts`)
Fitur ini mensimulasikan tugas baru TOEFL iBT: 7 kalimat kampus yang diulang langsung oleh peserta.

**Spesifikasi:**
- **GET:** Menerima `level` dari query parameter (`?level=B1`), memanggil `buildListenRepeatGenerationPrompt`, mengembalikan JSON dengan list 7 kalimat.
- **POST:** Menerima `{ targetSentence: string, audioWavBase64: string }`, memanggil `buildListenRepeatScoringPrompt` dengan audio rekaman user, mengembalikan `{ heard, accuracy, missedWords, pronunciationIssues, tip }`.

---

### ✅ Tugas 3: Hook Percakapan Live (`src/hooks/useLiveSession.ts`)
Buat custom React hook untuk mengelola siklus hidup percakapan suara dengan Gemini Live API.

**Alur kerja hook:**
1. Minta token ke `/api/live-token` dengan `{ mode, level, topicId }`.
2. Buka koneksi `@google/genai` Live API dari browser:
   ```typescript
   import { GoogleGenAI } from "@google/genai";
   const ai = new GoogleGenAI({
     apiKey: token,
     httpOptions: { apiVersion: "v1alpha" },
   });
   const session = await ai.live.connect({
     model: "gemini-3.8-live",
     callbacks: {
       onmessage: (msg) => { ... },
       onclose: () => { ... },
       onerror: (err) => { ... }
     }
   });
   ```
3. Mulai `startMicRecorder`:
   - Kirim chunk PCM ke Gemini:
     ```typescript
     session.sendRealtimeInput({
       audio: { data: bytesToBase64(new Uint8Array(pcm.buffer)), mimeType: "audio/pcm;rate=16000" }
     });
     ```
   - Simpan chunk pcm ke buffer array lokal untuk dibuat WAV saat sesi selesai.
4. Tangani pesan masuk (`msg.serverContent`):
   - Jika ada audio model: `player.enqueueBase64(part.inlineData.data)`.
   - Jika `msg.serverContent.interrupted`: panggil `player.clear()`.
   - Update transkrip realtime dari `msg.serverContent.inputTranscription` & `outputTranscription`.
5. Selesai sesi:
   - Tutup koneksi mic dan WebSocket.
   - Buat WAV base64 menggunakan `pcmChunksToWavBase64(userChunks)`.
   - Kirim ke `/api/evaluate` untuk mendapatkan laporan `Feedback`.
   - Simpan sesi menggunakan `saveSession()` dari `@/lib/storage`.

---

### ✅ Tugas 4: Tampilan Antarmuka Pengguna (UI / Frontend)
Ubah `src/app/page.tsx` dan tambahkan komponen-komponen UI yang menarik, bersih, dan modern:

1. **Header / Profile Bar:**
   - Menampilkan nama pengguna, level aktif saat ini (badge CEFR warna: misal A = Biru muda, B = Hijau/Kuning, C = Ungu), target skor TOEFL.
   - Tombol ganti level manual atau reset progres.

2. **Placement Test Banner / Modal:**
   - Jika pengguna baru pertama kali masuk (`!profile.placementDone`), tampilkan tombol ajakan **"Ikuti Placement Test 5 Menit"** untuk menentukan level awal secara otomatis.

3. **Mode Latihan Cards:**
   - **Mode 1: Free Talk (Percakapan Santai)**: Pilih dari topik `PRACTICE_TOPICS` yang cocok dengan level pengguna.
   - **Mode 2: TOEFL Interview Simulator**: 4 pertanyaan bertahap dengan timer 45 detik per pertanyaan.
   - **Mode 3: TOEFL Listen & Repeat**: 7 latihan repetisi kalimat kampus.

4. **Ruang Bicara Aktif (Voice Call Screen):**
   - Indikator status (Menghubungkan, Mendengarkan, AI Berbicara, Mengevaluasi).
   - Animasi visualizer suara (menggunakan `level` RMS dari mic dan audio player).
   - Subtitle / live caption transkrip teks secara transparan dan mulus.
   - Kontrol panggilan: Mute Mic, Selesai / Akhiri Sesi, dan timer sesi.

5. **Laporan Feedback Pasca Sesi (Feedback Modal / View):**
   - Skor Band TOEFL (1.0 – 6.0) besar dengan estimasi CEFR.
   - Skor per kriteria (*Fluency, Pronunciation, Grammar, Vocabulary, Coherence*).
   - Ringkasan evaluasi dalam Bahasa Indonesia.
   - Daftar koreksi kesalahan kalimat (sebelum vs sesudah + alasan).
   - Kosakata alternatif lebih baik (*Vocabulary Upgrades*).
   - Analisis kata pengisi (*Filler Words* seperti "um", "like").
   - Rekomendasi Naik/Turun Level jika performa konsisten di atas atau di bawah rata-rata.

6. **Riwayat Sesi & Grafik Perkembangan:**
   - Daftar rekaman sesi sebelumnya, tanggal, durasi, topik, dan skor band yang diperoleh.

7. **Jalur Belajar Terstruktur (Milestone 1):**
   - Menu **Belajar** tersedia di navigasi desktop dan mobile, dengan pintasan dari Beranda.
   - Kurikulum fondasi berisi 4 unit A1 dan 4 unit A2. Tiga unit pertamanya adalah *Introduce Yourself*, *Daily Routine*, dan *Past Activities*.
   - Setiap unit menampilkan fokus kosakata, grammar, estimasi durasi, serta 5–6 lesson preview.
   - Unit yang belum memiliki konten tetap ditandai sebagai pratinjau; progres dan XP belum diaktifkan agar tidak menampilkan progres semu.

8. **Konten Tiga Unit Awal (Milestone 2):**
   - Seluruh 18 lesson pada *Introduce Yourself*, *Daily Routine*, dan *Past Activities* dapat dibuka dari halaman Belajar.
   - Setiap lesson memiliki tujuan, pemanasan, kosakata, teaching point, contoh bilingual, recap, dan catatan Emma.
   - Tersedia 61 contoh latihan bertipe pilihan ganda, cocokkan kosakata, susun kata, isi verb, dan listen/speak.
   - Bank konten memakai discriminated union TypeScript, ID global unik, array readonly, serta registry yang menolak ID unit/lesson duplikat.
   - Seluruh contoh latihan tersebut sekarang dapat dijalankan melalui engine Milestone 3.

9. **Engine Lima Tipe Latihan (Milestone 3):**
   - `PracticeSession` menjalankan soal lesson secara berurutan, mengunci jawaban setelah submit, memberi feedback, lalu menampilkan ringkasan dan opsi restart.
   - Pilihan ganda dan listen-and-choose memakai exact scoring ternormalisasi; vocabulary matching memberi skor parsial; word order aman untuk token duplikat; verb fill mendukung jawaban alternatif.
   - Listen-and-repeat menilai kemiripan teks/transkrip, bukan kualitas pronunciation. Guided speaking hanya menilai kelengkapan minimum dan secara eksplisit tidak mengklaim penilaian grammar atau pengucapan.
   - `useCourseSpeech` mendeteksi TTS dan SpeechRecognition secara terpisah, memakai `en-US`, membersihkan resource pada reset/unmount, serta selalu menyediakan fallback input manual.
   - Hasil setiap soal menjadi input sistem progres Milestone 4 setelah seluruh sesi lesson diselesaikan.

10. **Sistem Progres Persisten (Milestone 4):**
   - Lesson baru dicatat selesai setelah semua latihannya dijawab dan pengguna mencapai ringkasan; keluar atau memuat ulang halaman sebelum itu tidak memberi completion maupun XP.
   - XP memakai nilai tetap dari kurikulum dan hanya diberikan pada completion pertama. Mengulang lesson tetap memperbarui hasil tanpa menggandakan XP; total maksimum untuk 18 lesson aktif saat ini adalah 270 XP.
   - Mastery dihitung dari skor terbaik per latihan sehingga tidak turun saat mengulang. Skor lemah masuk antrean review terjadwal, sedangkan hasil review memperbarui latihan terkait tanpa memberi XP atau menambah hitungan percobaan lesson penuh.
   - `learning-progress.ts` menyediakan reducer murni, normalisasi data, ringkasan unit, dan pemilihan review jatuh tempo. ID lesson/practice yang tidak dikenal atau usang dibuang agar tidak dapat menambah XP maupun antrean.
   - `storage.ts` menyimpan state belajar di key `fluentpath:v1`, memigrasikan data lama, dan menyinkronkan perubahan melalui event `storage` antartab. Seluruh mutasi profil, sesi, progres, dan reset diserialisasi dengan Web Locks sebelum membaca state terbaru; browser tanpa Web Locks memakai lease mutex `localStorage` agar update berbeda tidak saling menimpa.
   - Hasil penyimpanan membawa status `persisted`; ringkasan latihan menampilkan peringatan bila kuota atau akses `localStorage` gagal dan tidak mengklaim progres sudah tersimpan.
   - Beranda menampilkan XP/completion/review, halaman Belajar menampilkan progres per unit dan status tiap lesson beserta antrean review, sedangkan halaman Progres memisahkan progres kursus dari analitik speaking.
   - Reset data menghapus profil, riwayat sesi, XP, mastery, completion, dan antrean review setelah konfirmasi eksplisit.

11. **Speaking Mission bersama Emma (Milestone 5):**
   - `speaking-missions.ts` membangun 18 mission dari lesson aktif dalam tiga unit berkonten. Setiap misi membawa scenario roleplay, peran learner dan Emma, opening line, target vocabulary, target grammar, contoh respons, dan tepat tiga success criteria kanonis.
   - CTA di materi lesson membuka ruang voice dalam mode `speaking-mission`. Emma menerima konteks lesson melalui ephemeral token yang dikunci server, lalu melakukan roleplay Live dan memancing pengguna memakai bahasa target dalam percakapan nyata.
   - Route token dan evaluasi hanya mempercayai `lessonId`, lalu mengambil kembali mission dari registry server. ID tidak dikenal dan lesson pada unit pratinjau ditolak agar browser tidak dapat menyuntikkan scenario, target, atau kriteria evaluasi sendiri.
   - Evaluator mengembalikan lima skor speaking umum dan `missionAssessment` terstruktur: skor 0–100, status lulus, bukti per kriteria (`achieved`, `partial`, atau `not-shown`), vocabulary/grammar yang benar-benar terlihat, serta ringkasan Bahasa Indonesia. Server memasangkan hasil ke tiga kriteria kanonis dan membatasi skor berdasarkan status kriteria serta jumlah ucapan learner.
   - Sesi misi disimpan sebagai `SessionRecord` dan tampil di riwayat/analitik. Normalisasi memastikan status lulus memerlukan skor minimal 70, menolak kriteria nonkanonis, dan membuang `missionAssessment` dari sesi yang bukan Speaking Mission.
   - Selesai atau batal dari misi mengembalikan pengguna ke lesson sumber dan memulihkan fokus ke pemicu misi satu kali. Jika `localStorage` gagal, evaluasi tetap dapat dibaca tetapi UI memberi peringatan bahwa sesi belum tersimpan.
   - Speaking Mission sengaja terpisah dari reducer progres kursus: menjalankan atau lulus misi tidak memberikan XP, tidak menandai lesson selesai, dan tidak mengubah mastery maupun review queue.

**Bukti validasi Milestone 5:**

- `tsc --noEmit`, ESLint, dan production build lulus; 42 unit test lulus.
- Request token maupun evaluasi dengan `lessonId` tidak dikenal atau lesson pratinjau mengembalikan HTTP 400. Request valid ke kedua route mengembalikan HTTP 200, dan evaluasi berisi tepat tiga kriteria kanonis.
- Acceptance test Edge pada alur production berhasil tersambung ke Gemini Live menggunakan mikrofon sintetis tanpa suara, menerima transkrip Emma, mengakhiri sesi pendek dengan assessment gagal yang sesuai bukti, menyimpan session, lalu kembali dan memulihkan fokus ke lesson sumber.
- Acceptance Live dilakukan sebelum hardening persistence/scoring terakhir. Kode final kemudian lulus TypeScript, ESLint, production build, dan suite 42 unit test; helper scoring/persistence belum memiliki unit test langsung. Pemeriksaan ini tidak menguji ulang kualitas audio dengan percakapan manusia.

---

### Roadmap Pembelajaran Terstruktur

1. ✅ **Milestone 1 — Halaman Belajar dan jalur unit A1–A2.**
2. ✅ **Milestone 2 — Konten tiga unit awal:** Introduce Yourself, Daily Routine, dan Past Activities.
3. ✅ **Milestone 3 — Engine lima tipe latihan:** pilihan ganda, cocokkan kosakata, susun kata, isi verb, serta listen/speak.
4. ✅ **Milestone 4 — Sistem progres:** XP, mastery, penyelesaian lesson, dan review queue.
5. ✅ **Milestone 5 — Speaking Mission bersama Emma:** 18 misi lesson-grounded dengan roleplay Live, assessment berbasis bukti, riwayat sesi, dan kembali ke lesson sumber.

---

### Pekerjaan Lanjutan Setelah MVP

1. Perluas pengujian voice-to-voice ke browser/perangkat lain serta sesi panjang untuk mengukur stabilitas jaringan dan penggunaan memori.
2. Perluas 42 automated tests yang sudah ada ke validator route HTTP, transcript merge, state timer, serta integrasi browser otomatis yang berjalan di CI.
3. Tambahkan rate limiting, observability, batas durasi sesi, dan strategi retensi audio untuk deployment publik.
4. Upgrade `localStorage` ke autentikasi dan database (misalnya Supabase/PostgreSQL) bila aplikasi mulai multi-device.
5. Verifikasi nama model dan entitlement pada project Gemini tujuan sebelum deployment production.

## 5. Cara Menjalankan & Menguji Proyek

1. **Konfigurasi Environment:**
   Buat file `.env.local` di root folder:
   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
   ```

2. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di Google Chrome atau Microsoft Edge (perlu izin akses mikrofon).

3. **Verifikasi Build:**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

---

## 6. Catatan Penting untuk Codex

- **Versi Next.js:** Gunakan konvensi Next.js 16 App Router. Untuk interaksi browser dan Web Audio API, selalu tambahkan directive `'use client'` di bagian atas file komponen/hook.
- **Model Gemini:** Jangan gunakan model legacy (seperti `gemini-1.5-*` atau `gemini-2.0-*`). Gunakan `gemini-3.8-live` untuk Live voice audio dan `gemini-3.8-flash` untuk evaluasi teks/JSON.
- **Testing Mic:** Gunakan earphone/headphone saat menguji sesi suara untuk menghindari loop feedback/echo antara speaker dan mikrofon browser.
