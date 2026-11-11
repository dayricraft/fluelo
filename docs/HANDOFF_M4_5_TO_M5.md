# Handoff Report: Milestone 04.5 -> Milestone 05

## 1. Ringkasan Eksekutif (Executive Summary)
Milestone 04.5 (**Vocabulary Flashcards**) telah diimplementasikan, diuji secara komprehensif, dan diverifikasi beroperasi penuh pada perangkat fisik **Samsung Galaxy A55 5G (`RRCX408EXYZ`)**.

Fitur baru ini menambahkan ruang belajar kosakata mandiri (**Flashcard Room**) dengan 3.000 kata pilihan berkualitas tinggi yang telah diperkaya (enriched) secara offline sebelum build time, sehingga **nol biaya API** dan **nol latensi jaringan** saat runtime belajar kartu kosakata.

### Capaian Kunci M4.5:
1. **Bento Card Home Screen**:
   - Menggantikan tile redundan *"Buddy Online & Ready"* di baris tengah dengan Bento Card *"Vocabulary Flashcards"* full-width beraksen `SoftPink` (`#FFC8E2`), subjudul *"3,000 curated words • Explore & review"*, dan ikon lapis (`Icons.Outlined.Layers`).
   - Riwayat Sesi (Practice History) di bawahnya tetap utuh dan berfungsi penuh.
2. **Flashcard Room Interaktif (`FlashcardScreen.kt`)**:
   - Mempertahankan bahasa visual gelap kromatik Fluelo (`#09090B`, `#222227`, sudut kartu 28dp, aksen Neon Lime `#D4FB46` dan Soft Purple `#D8B4FE`).
   - Menolak keras desain biru/putih template rujukan, timer hitung mundur, level kaku, dan tombol emoji slop.
3. **Flip 3D Sumbu Y & Anti-Mirroring**:
   - Tampak Depan: Headword tebal, badge jenis kata (POS), US IPA phonetics, ikon bookmark, dan panduan gestur.
   - Tampak Belakang: Arti bahasa Indonesia kontekstual, tombol audio TTS US English, pengucapan IPA, serta kotak *"CONTOH KALIMAT"* (kalimat contoh natural bahasa Inggris + terjemahan bahasa Indonesia).
   - Dilengkapi rotasi penyeimbang 180° (`graphicsLayer { rotationY = 180f }`) sehingga teks dan ikon sisi belakang tidak terbalik atau bercermin.
4. **Option A Deck Scheduling & Invariant**:
   - 3.000 kosakata di-shuffle secara deterministik satu kali (seed 42) dan disimpan dengan urutan `orderRank` 1..3000.
   - Kartu baru disajikan tanpa penggantian berulang (*without replacement*).
   - **Reveal vs Present Invariant**: Kartu yang hanya dilewati tanpa dibalik *tidak* dihitung sebagai kata yang telah dilihat (`revealedAt IS NOT NULL`).
   - **Active Recall Reset**: Saat berpindah ke kartu berikutnya atau sebelumnya, sisi kartu selalu kembali ke tampak depan.
   - **Antrean Skip**: Kartu yang dilewati tanpa di-reveal akan disajikan kembali di akhir siklus putaran.
   - **Resume State**: Posisi kursor terakhir tersimpan aman di Room database, melanjutkan progres saat pengguna membuka kembali aplikasi.
5. **Mode Jelajahi vs Ulas (Explore vs Review)**:
   - Mode `[Jelajahi]` (Neon Lime): Menjelajahi 3.000 kata baru secara bertahap.
   - Mode `[Ulas]` (Soft Purple): Mengulang kembali hanya kata-kata yang sudah pernah dilihat atau yang diberi tanda bookmark (`Semua` / `Bertanda`).
6. **Keselamatan Audio TTS Native**:
   - `FlashcardTtsManager` menggunakan Android `TextToSpeech` native (US English) dengan audio focus.
   - Dilengkapi guard pemeriksaan aktif: tidak akan membajak audio jika sesi panggilan suara Gemini Live sedang aktif (`MODE_IN_COMMUNICATION`).

---

## 2. Deliverables & Komponen yang Terverifikasi
| Komponen | Lokasi File | Status Verifikasi |
|---|---|---|
| Dataset Sumber | `assets/vocabulary/kosakata_3000_source.txt` | 3.000 baris unik, SHA256 terverifikasi |
| Pipeline Enrichment | `scripts/enrich_vocabulary.py` | 50 batch selesai 100%, 0 kata needs_review |
| Aset APK Terkompresi | `android-project/app/src/main/assets/vocabulary/fluelo_vocabulary_v1.json` | 1,04 MB terkompresi, di-load cepat saat inisialisasi awal |
| Room Entity Kosakata | [VocabularyEntry.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/flashcard/model/VocabularyEntry.kt) | Room `@Entity(tableName = "vocabulary_entries")` |
| Room Entity Progres | [VocabularyProgress.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/flashcard/model/VocabularyProgress.kt) | Room `@Entity(tableName = "vocabulary_progress")` |
| Room Entity Kursor | [FlashcardDeckState.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/flashcard/model/FlashcardDeckState.kt) | Room `@Entity(tableName = "flashcard_deck_state")` |
| Composite Item Model | [FlashcardItem.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/flashcard/model/FlashcardItem.kt) | `@Embedded` + `@Relation` |
| Room DAOs | [VocabularyDao.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/flashcard/dao/VocabularyDao.kt), [FlashcardDeckDao.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/flashcard/dao/FlashcardDeckDao.kt) | Query Option A, bookmark filter, metrics |
| Room Database V1 | [FlueloDatabase.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/db/FlueloDatabase.kt) | Database Version 1 (Dasar untuk M5 migration) |
| Repository & Scheduler | [FlashcardRepository.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/flashcard/FlashcardRepository.kt) | Idempotent import, shuffle seed 42, skip queue |
| Audio TTS Manager | [FlashcardTtsManager.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/audio/FlashcardTtsManager.kt) | Native TTS + Call Audio Safety Guard |
| Flip Card 3D Component | [VocabularyCardView.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/flashcard/components/VocabularyCardView.kt) | 3D Y-axis flip, anti-mirroring, IPA typography |
| ViewModel & UI Screen | [FlashcardViewModel.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/flashcard/FlashcardViewModel.kt), [FlashcardScreen.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/flashcard/FlashcardScreen.kt) | Gestur geser, pill mode, indikator progres |
| Integrasi HomeScreen | [HomeScreen.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/home/HomeScreen.kt) | Bento Card SoftPink menggantikan status online |
| Routing Navigasi | [NavRoutes.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/navigation/NavRoutes.kt), [AiBuddyNavGraph.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/navigation/AiBuddyNavGraph.kt) | Rute `Screen.Flashcards` terhubung |
| Automated Unit Tests | [FlashcardOrderEngineTest.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/test/java/com/aibuddy/data/flashcard/FlashcardOrderEngineTest.kt) | 11 unit tests baru, 100% lulus (total 50 tests) |

---

## 3. Bukti Verifikasi Perangkat Fisik (Samsung Galaxy A55 5G)
Telah diverifikasi secara langsung pada hardware asli menggunakan `adb`:
- **Home Screen Bento Layout**: `docs/design/screenshots/m4_5_home_screen.png`
  - Kartu "Vocabulary Flashcards" dalam palet `SoftPink` (`#FFC8E2`) berada presisi di bawah 2 kartu atas dan di atas Practice History.
- **Tampak Depan Kartu Kosakata**: `docs/design/screenshots/m4_5_flashcard_front.png`
  - Menampilkan kata pertama *"boyfriend"*, badge *"noun"*, IPA `/'bɔɪˌfrɛnd/`, dan counter `Dilihat 0 / 3000`.
- **Flip 3D & Reveal Tampak Belakang**: `docs/design/screenshots/m4_5_flashcard_back.png`
  - Transisi animasi 3D mulus tanpa teks terbalik. Counter otomatis bertambah menjadi `Dilihat 1 / 3000`. Menampilkan arti *"pacar laki-laki"*, tombol speaker suara, dan kotak contoh kalimat.
- **Active Recall Front-Face Reset**: `docs/design/screenshots/m4_5_flashcard_next_front.png`
  - Berpindah ke kata kedua *"easy"*; sisi kartu langsung reset ke tampak depan. Counter tetap `Dilihat 1 / 3000` karena kata kedua belum di-reveal.
- **Mode Ulas (Review)**: `docs/design/screenshots/m4_5_flashcard_review_mode.png`
  - Pill `[Ulas]` aktif dengan aksen Soft Purple (`#D8B4FE`). Menampilkan hanya kata yang telah dilihat (`Ulasan (1 kata)`).
- **Uji Regresi Fitur Eksisting**:
  - Chat Room: `docs/design/screenshots/m4_5_chat_regression.png` (Tutor AI, prompt dynamic skill, dan riwayat chat tetap 100% berfungsi).
  - Voice Room: `docs/design/screenshots/m4_5_voice_regression.png` (Live mascot cat, kontrol panggilan, dan WebSocket tetap 100% berfungsi).

---

## 4. Panduan Transisi ke Milestone 05 (Local History)
Bagi pengembang yang melanjutkan ke **Milestone 05 (Local History)**:

1. **Room Database Versioning & Schema Migration**:
   - `FlueloDatabase` saat ini berada di **Version 1** (`version = 1`, `exportSchema = false`).
   - Di Milestone 05, untuk memindahkan `practice_sessions.json` dan `chat_history.json` ke tabel Room yang reliabel (`conversation_sessions` dan `chat_messages`), buat **`version = 2`** dengan migrasi manual:
     ```kotlin
     val MIGRATION_1_2 = object : Migration(1, 2) {
         override fun migrate(db: SupportSQLiteDatabase) {
             db.execSQL("""
                 CREATE TABLE IF NOT EXISTS conversation_sessions (
                     sessionId TEXT PRIMARY KEY NOT NULL,
                     modality TEXT NOT NULL,
                     learningMode TEXT NOT NULL,
                     startedAt INTEGER NOT NULL,
                     endedAt INTEGER,
                     turnCount INTEGER NOT NULL,
                     summary TEXT NOT NULL
                 )
             """.trimIndent())
             // migration untuk pesan detail jika diperlukan
         }
     }
     ```
   - Registrasikan `addMigrations(MIGRATION_1_2)` pada builder `FlueloDatabase` di `FlueloApplication` atau DI module agar progres flashcard pengguna tidak ter-reset saat database di-upgrade ke V2.

2. **Daftar Perintah Verifikasi Build**:
   ```bash
   # Jalankan semua unit test
   .\gradlew.bat testDebugUnitTest --rerun-tasks

   # Build APK Debug
   .\gradlew.bat assembleDebug

   # Install ke perangkat Android
   adb -s <DEVICE_ID> install -r android-project/app/build/outputs/apk/debug/app-debug.apk
   ```

Milestone 4.5 selesai dengan status **VERIFIED & OPERATIONAL**. Siap untuk eksekusi Milestone 05!
