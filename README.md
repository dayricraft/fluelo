# FluentPath AI

FluentPath AI adalah aplikasi latihan speaking bahasa Inggris berbasis AI suara real-time. Aplikasi ini membantu pelajar Indonesia berlatih percakapan, mencoba format speaking TOEFL iBT, dan mendapatkan umpan balik terstruktur dalam Bahasa Indonesia.

## Fitur MVP

- **Free Talk** dengan partner AI bernama Emma dan topik sesuai level.
- **Adaptive Placement Test** untuk memperkirakan CEFR A1–C2.
- **TOEFL Take an Interview** dengan empat pertanyaan bertahap, nomor soal, dan timer jawaban 45 detik yang berpindah otomatis saat waktu habis.
- **TOEFL Listen & Repeat** dengan tujuh kalimat, rekaman mikrofon, skor akurasi, dan tips pelafalan.
- **Live transcript**, mute, interruption handling, dan playback PCM tanpa jeda.
- **Laporan speaking**: band TOEFL 1.0–6.0, lima kriteria, koreksi grammar, vocabulary upgrades, filler words, dan rekomendasi latihan.
- **Dashboard dan riwayat lokal** dengan penyimpanan `localStorage` yang menormalisasi data lama atau rusak sebelum dirender.
- **Jalur Belajar A1–A2** dengan 8 unit terurut dan pratinjau 48 lesson untuk kosakata, grammar, sentence building, listening, pronunciation, dan checkpoint.
- **Materi tiga unit awal** dengan 18 lesson yang dapat dibaca, 96 entri kosakata, 39 teaching point, dan 61 latihan interaktif.
- **Engine lima tipe latihan** untuk pilihan ganda, cocokkan kosakata, susun kata, isi verb, serta listen/speak dengan TTS, transkripsi browser, dan fallback ketik manual.
- **Progres belajar persisten** dengan penyelesaian lesson, XP kurikulum satu kali, mastery dari skor terbaik tiap latihan, dan antrean review terarah. Ringkasannya tersedia di Beranda, Belajar, dan Progres.
- **18 Speaking Mission bersama Emma** yang membawa kosakata, grammar, dan tujuan setiap lesson aktif ke roleplay suara. Identitas lesson divalidasi dari katalog kanonis di server, hasilnya memuat penilaian berbasis bukti untuk tiga kriteria misi, lalu tersimpan di riwayat tanpa mengubah XP, mastery, maupun antrean review.

## Stack

- Next.js 16.4 App Router
- React 19.3 dan TypeScript
- Tailwind CSS 4
- `@google/genai` 2.28+
- Gemini Live API untuk percakapan suara
- Gemini Interactions API untuk structured evaluation
- Web Audio API dan AudioWorklet PCM 16 kHz/24 kHz

## Menjalankan proyek

Prasyarat: Node.js modern, npm, browser Chrome/Edge terbaru, dan Gemini API key yang memiliki akses ke model yang dikonfigurasi.

1. Buat `.env.local` di root proyek:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

2. Instal dependency dan jalankan development server:

   ```bash
   npm install
   npm run dev
   ```

3. Buka `http://localhost:3000`, lalu izinkan akses mikrofon.

Gunakan headphone saat menguji voice session untuk mencegah suara speaker masuk kembali ke mikrofon.

## Scripts

```bash
npm run dev     # development server
npm test        # unit test untuk CEFR, audio, kurikulum, konten, practice engine, progres, dan Speaking Mission
npm run lint    # ESLint
npm run build   # production build + TypeScript
npm run start   # menjalankan production build
```

## Struktur penting

```text
src/
├── app/
│   ├── api/
│   │   ├── evaluate/route.ts
│   │   ├── live-token/route.ts
│   │   └── toefl/listen-repeat/route.ts
│   └── page.tsx
├── components/
│   ├── fluent-path-app.tsx
│   ├── dashboard-home.tsx
│   ├── learning-path.tsx
│   ├── lesson-material.tsx
│   ├── practice-session.tsx
│   ├── voice-room.tsx
│   ├── listen-repeat-room.tsx
│   └── feedback-view.tsx
├── hooks/
│   ├── useLiveSession.ts
│   ├── useListenRepeat.ts
│   └── useCourseSpeech.ts
└── lib/
    ├── audio.ts
    ├── curriculum.ts
    ├── course-content/          # materi Introduce Yourself, Daily Routine, Past Activities
    ├── learning-progress.ts     # reducer completion, XP, mastery, dan review queue
    ├── levels.ts
    ├── practice-engine.ts       # scoring murni + deterministic shuffle lima tipe latihan
    ├── prompts.ts
    ├── speaking-missions.ts     # 18 misi kanonis yang diturunkan dari lesson aktif
    ├── storage.ts               # penyimpanan lokal, migrasi, dan sinkronisasi antartab
    └── server/
```

`GEMINI_API_KEY` hanya dibaca oleh module server. Browser menerima ephemeral token sekali pakai untuk koneksi Gemini Live; API key tidak dikirim ke client.

## Verifikasi saat ini

- Unit test core, kurikulum, konten, practice engine, progres belajar, dan Speaking Mission: 42/42 lulus
- ESLint: lulus
- TypeScript (`tsc --noEmit`): lulus
- Production build: lulus
- Smoke test Milestone 3 untuk halaman utama, invalid-request API, dan alur 13 soal pada empat lesson: lulus tanpa error runtime; pengujian ini dilakukan sebelum aktivasi penyimpanan progres
- Acceptance test Edge Milestone 4: completion, XP satu kali, retake, mastery, review jatuh tempo, reload, sinkronisasi antartab, dan retry saat `localStorage` gagal semuanya lulus tanpa error runtime tak terduga
- Voice-to-voice end-to-end: lulus (ephemeral token, mikrofon, audio PCM, transkrip, dan evaluasi)
- Validasi route Milestone 5: request token dan evaluasi untuk lesson tidak dikenal atau masih pratinjau ditolak dengan status 400; request valid mengembalikan status 200 dan evaluasi berisi tiga kriteria kanonis.
- Acceptance test Edge pada alur production Milestone 5 berhasil tersambung ke Gemini Live memakai mikrofon sintetis tanpa suara, menerima transkrip Emma, menghasilkan assessment gagal untuk sesi yang terlalu singkat, menyimpan sesi, dan mengembalikan fokus ke lesson asal. Uji Live ini dilakukan sebelum hardening persistence/scoring terakhir; kode final kemudian lulus TypeScript, lint, production build, dan suite 42 unit test. Helper scoring/persistence belum memiliki unit test langsung, dan kualitas audio manusia tidak diuji ulang pada pemeriksaan ini.

Hasil Speaking Mission disimpan di perangkat. Jika `localStorage` gagal, UI tetap menampilkan evaluasi beserta peringatan bahwa sesi belum tersimpan agar pengguna tidak mendapat kesan progres palsu.

Pengujian pada perangkat baru tetap membutuhkan API key aktif, izin mikrofon, dan akses model Gemini yang sesuai.

Spesifikasi produk dan riwayat implementasi lebih lengkap tersedia di [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md).
