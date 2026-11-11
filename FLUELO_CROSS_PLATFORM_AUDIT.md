# FLUELO 2.0 — CROSS-PLATFORM ARCHITECTURE & COMPATIBILITY AUDIT
**Dokumen Audit & Rencana Strategis Migrasi: Android Menuju Kotlin Multiplatform + Compose Multiplatform (Android & iOS)**

---

- **Versi Dokumen:** 2.0.0-AUDIT
- **Tanggal Audit:** 11 November 2026
- **Status:** Phase 1 — Complete Audit & Architecture Plan (**No Source Code Modified**)
- **Target Platform:** Android (v1.0.0 Stable 유지) & iOS (v2.0.0 via Compose Multiplatform)
- **Kondisi Pengembang:** Laptop Windows 11, Antigravity IDE, Tanpa Mac/iPhone Pribadi, Cloud CI/CD (Codemagic), Pengujian via TestFlight.

---

## DAFTAR ISI

1. [Ringkasan Eksekutif & Status Saat Ini (Fluelo v1.0.0)](#1-ringkasan-eksekutif--status-saat-ini-fluelo-v100)
2. [Matriks Kompatibilitas Seluruh Komponen & Modul](#2-matriks-kompatibilitas-seluruh-komponen--modul)
3. [Analisis Bagian yang Dapat Digunakan Kembali (Shared Code 100%)](#3-analisis-bagian-yang-dapat-digunakan-kembali-shared-code-100)
4. [Analisis Bagian yang Memerlukan Adaptasi KMP (Expect/Actual & Multiplatform Libraries)](#4-analisis-bagian-yang-memerlukan-adaptasi-kmp-expectactual--multiplatform-libraries)
5. [Analisis Bagian yang Wajib Diimplementasikan Native iOS (AVFoundation & CoreAudio)](#5-analisis-bagian-yang-wajib-diimplementasikan-native-ios-avfoundation--coreaudio)
6. [Rekomendasi Arsitektur Repository Fluelo 2.0 (KMP + Compose Multiplatform)](#6-rekomendasi-arsitektur-repository-fluelo-20-kmp--compose-multiplatform)
7. [Strategi Development, Build, dan Testing Tanpa Mac Pribadi](#7-strategi-development-build-dan-testing-tanpa-mac-pribadi)
8. [Keamanan API Key & Kredensial AI Sebelum Distribusi TestFlight](#8-keamanan-api-key--kredensial-ai-sebelum-distribusi-testflight)
9. [Manajemen Risiko Teknis & Estimasi Kompleksitas](#9-manajemen-risiko-teknis--estimasi-kompleksitas)
10. [Roadmap Implementasi Fase 2–5 & Acceptance Criteria](#10-roadmap-implementasi-fase-25--acceptance-criteria)

---

## 1. RINGKASAN EKSEKUTIF & STATUS SAAT INI (FLUELO v1.0.0)

Fluelo (sebelumnya AI Buddy) saat ini merupakan aplikasi Android native berstatus **Milestone 06 (M0–M6) COMPLETED & VERIFIED** pada perangkat fisik Samsung Galaxy A55 5G. Aplikasi beroperasi dengan performa tinggi (98.85% smooth frames, ukuran rilis signed APK 12.65 MB, 53 automated unit tests lulus 100%).

### 1.1. Profil Teknologi Fluelo Android Saat Ini
- **Bahasa & Runtime:** Kotlin 2.0.21, JVM 17 (Microsoft OpenJDK 17).
- **UI Toolkit:** Jetpack Compose (BOM 2024.10.01), Material 3, Single-Activity Architecture.
- **Arsitektur Aplikasi:** Unidirectional Data Flow (UDF / MVVM), StateFlow reactive streams, Coroutines 1.9.0.
- **Dual-Engine AI Pipeline:**
  1. *Voice Engine (Roomtalk):* Gemini Live (`gemini-3.8-live`) melalui WebSocket dua arah langsung (OkHttp 4.12.0), PCM 16kHz capture dengan hardware AEC, PCM 24kHz streaming playback dengan jitter buffer, TTFA ~490–970ms, client-side barge-in.
  2. *Text Tutor Engine (Roomchat):* Gemini Flash (`gemini-2.5-flash` / `gemini-3.5-flash`) via stateless REST HTTP/2.
  3. *Tutor Correction Engine:* Analisis linguistik asinkron di latar belakang menggunakan Gemini Flash dengan JSON schema enforcement, menghasilkan kartu koreksi (`TutorCorrectionCard`) tanpa mengganggu latensi audio suara.
  4. *Offline Grounded Summaries:* `SessionSummaryGenerator` menghasilkan ringkasan sesi belajar 100% deterministik dan bebas kuota/jaringan di perangkat lokal.
- **Fitur Tambahan:** Flashcard 3.000 kosakata terkurasi (`fluelo_vocabulary_v1.json`) dengan algoritma Option A seed 42, animasi flip kartu 3D sumbu-Y, dan Text-To-Speech (TTS) offline Android native.
- **Penyimpanan Lokal:** Room Database v2 (`FlueloDatabase`) dengan migrasi eksplisit `MIGRATION_1_2` dan Jetpack DataStore Preferences 1.1.1.

### 1.2. Misi Fluelo 2.0: Ekspansi ke iOS
Tujuan Fluelo 2.0 adalah memperluas ketersediaan aplikasi ke platform **iOS** menggunakan **Kotlin Multiplatform (KMP) + Compose Multiplatform (CMP)** dengan prinsip fundamental:
1. **Zero Regression pada Android:** Fluelo Android v1.0 yang sudah stabil tidak boleh rusak atau menurun performanya.
2. **Maksimalisasi Code Reuse:** Kode domain, state machine, model AI, database Room, preferences, dan 90%+ kode antarmuka Compose dipertahankan dan dibagikan (*shared*).
3. **Penyelesaian Native yang Presisi:** Hanya komponen hardware audio (mikrofon, echo cancellation, speakerphone routing, dan TTS) yang dipisah ke implementasi native iOS (`AVFoundation` / `CoreAudio`).
4. **Cloud-Native Workflow di Windows:** Mengatasi ketiadaan laptop Mac dan iPhone fisik dengan orkestrasi Codemagic CI/CD, cloud simulator (Appetize.io / cloud macOS), dan Apple TestFlight.

---

## 2. MATRIKS KOMPATIBILITAS SELURUH KOMPONEN & MODUL

Seluruh 68 file Kotlin, konfigurasi Gradle, library pihak ketiga, dan resource Fluelo telah diaudit secara baris per baris. Berikut adalah matriks klasifikasi kompatibilitas:

| Kategori | Definisi | Estimasi Porsi Kode |
|---|---|---|
| **Kategori 1: Direct Shared Code** | Kode Kotlin murni tanpa dependensi Android SDK. Dapat langsung dipindahkan ke `commonMain` tanpa perubahan atau hanya perubahan sintaks trivial. | **~65%** |
| **Kategori 2: KMP Adapted Code** | Memiliki dependensi library yang sudah mendukung KMP atau memerlukan pola `expect/actual` / interface abstraction. | **~20%** |
| **Kategori 3: Native iOS Required** | Menggunakan API hardware, audio framework, atau sistem operasi Android tingkat rendah yang wajib diimplementasikan ulang menggunakan API Apple iOS. | **~15%** |

### Tabel Matriks Audit Komponen

| Modul / Komponen | File / Artefak Terkait | Dependensi Saat Ini | Klasifikasi | Kompleksitas Migrasi | Keterangan & Rencana Adaptasi |
|---|---|---|---|---|---|
| **Domain: Intent Router** | `ModeRouter.kt` | Kotlin Stdlib, Regex murni | **Kategori 1** | Sangat Rendah | 100% Kotlin murni. Zero platform API. Langsung ke `commonMain`. |
| **Domain: Exercise State** | `ExerciseState.kt`, `LearningMode.kt` | `java.util.UUID`, kotlinx.serialization | **Kategori 1** | Sangat Rendah | Ganti `java.util.UUID` ke `kotlin.uuid.Uuid` (Kotlin 2.0+) atau helper random UUID. |
| **Domain: AI Prompts** | `BuddyPrompts.kt` | Kotlin Stdlib | **Kategori 1** | Sangat Rendah | Berisi konstanta prompt instruksi sistem bilingual. Langsung ke `commonMain`. |
| **Domain: Conversation State** | `ConversationRepository.kt`, `LiveSessionState.kt` | Coroutines, StateFlow, `UUID` | **Kategori 1** | Sangat Rendah | In-memory UDF turn repository. Berpindah utuh ke `commonMain`. |
| **Domain: Session Summary** | `SessionSummaryGenerator.kt` | Kotlin Stdlib, kotlinx.serialization | **Kategori 1** | Sangat Rendah | 100% deterministik rule-based summary generator. Pindah utuh ke `commonMain`. |
| **AI Protocol Models** | `LiveProtocolModels.kt`, `ChatModels.kt`, `TutorFeedback.kt` | `kotlinx.serialization` | **Kategori 1** | Sangat Rendah | Serialisasi JSON multiplatform. Langsung dapat digunakan di iOS dan Android. |
| **UI: Bento Grid & Cards** | `BentoCard.kt`, `ExerciseProgressCard.kt` | Jetpack Compose Foundation, Material 3 | **Kategori 1** | Rendah | Menggunakan Compose Multiplatform murni. Tampilan identik di Android & iOS. |
| **UI: Background Glow** | `RadialGradientBackground.kt` | `Modifier.drawBehind`, `Brush.radialGradient` | **Kategori 1** | Rendah | Menggunakan Compose Canvas murni tanpa platform canvas. 100% kompatibel CMP. |
| **UI: Markdown Renderer** | `MarkdownText.kt` | Compose Text, Regex parsing | **Kategori 1** | Rendah | Komponen parsing markdown ringan. 100% shared di `commonMain`. |
| **UI: Flashcard 3D Card** | `VocabularyCardView.kt` | `Modifier.graphicsLayer` (rotationY, cameraDistance) | **Kategori 1** | Rendah | Animasi 3D flip berjalan mulus pada Skiko/Metal iOS tanpa modifikasi. |
| **UI: Screen Layouts** | `ChatScreen.kt`, `FlashcardScreen.kt`, `SessionDetailScreen.kt`, `SettingsScreen.kt` | Compose Layout, Material 3 | **Kategori 1** | Rendah | Seluruh layout, form, dialog konfirmasi, dan list StateFlow dapat dibagikan utuh. |
| **UI: Chromatic Cat Mascot** | `ChromaticCatCharacter.kt` | `android.graphics.BlurMaskFilter`, `SweepGradient`, `Paint`, `Path`, `nativeCanvas` | **Kategori 2** | Sedang | Memanggil Android Native Canvas API untuk blur dan sweep gradient. Perlu adaptasi ke Skia/Compose Graphics (`Brush.sweepGradient` + blur modifier CMP). |
| **UI: Permissions & Host** | `HomeScreen.kt`, `ConversationScreen.kt`, `AiBuddyNavGraph.kt` | `ActivityResultContracts.RequestPermission`, `ContextCompat` | **Kategori 2** | Sedang | Pemanggilan izin mic Android-specific. Dibuatkan abstraksi `AudioPermissionHandler` (Android vs iOS Info.plist). |
| **UI: Theme & Insets** | `Theme.kt`, `Color.kt` | `WindowCompat`, `Activity` | **Kategori 2** | Rendah | Warna & typography 100% shared. Bar status edge-to-edge dialihkan ke CMP window insets. |
| **Navigation** | `NavRoutes.kt`, `AiBuddyNavGraph.kt` | `androidx.navigation:navigation-compose` | **Kategori 2** | Rendah | Navigation Compose 2.8+ telah mendukung Kotlin Multiplatform resmi dari JetBrains/Google. |
| **ViewModels** | `LiveSessionViewModel`, `ChatViewModel`, `FlashcardVM`, `SettingsVM` | `AndroidViewModel(application)` | **Kategori 2** | Rendah | Migrasi dari `AndroidViewModel` ke `androidx.lifecycle.ViewModel` KMP (2.8+). Injeksi repository via constructor. |
| **Database: Room V2** | `FlueloDatabase.kt`, DAOs, Entities, `MIGRATION_1_2` | `androidx.room:room-runtime` 2.6.1 | **Kategori 2** | Sedang | Upgrade ke **Room Multiplatform 2.7.0+**. Seluruh entity, DAO, composite model, dan migrasi SQL tetap 100% sama! Builder database dibuat via `expect/actual`. |
| **Preferences: DataStore** | `UserPreferencesRepository.kt` | `androidx.datastore:datastore-preferences` 1.1.1 | **Kategori 2** | Rendah | Jetpack DataStore 1.1.1 resmi mendukung KMP. Hanya butuh `expect/actual` penyedia file path (`filesDir` Android vs `NSDocumentDirectory` iOS). |
| **AI Client: Flash REST** | `GeminiChatClient.kt`, `TutorCorrectionEngine.kt` | `okhttp3.OkHttpClient`, `android.util.Log` | **Kategori 2** | Sedang | Ganti OkHttp dengan **Ktor Client 3.0+** (`io.ktor:ktor-client-core` dengan engine OkHttp di Android dan Darwin di iOS). |
| **AI Client: Live WebSocket** | `GeminiLiveClient.kt` | `okhttp3.WebSocket`, `android.util.Base64` | **Kategori 2** | Sedang-Tinggi | Porting WebSocket client ke `io.ktor:ktor-client-websockets`. Ganti Base64 Android ke `kotlin.io.encoding.Base64`. FIFO channel tetap dipertahankan. |
| **Assets: 3.000 Kosakata** | `fluelo_vocabulary_v1.json` | `context.assets.open(...)` | **Kategori 2** | Rendah | Migrasi ke Compose Multiplatform Resources (`Res.readBytes("files/fluelo_vocabulary_v1.json")`) atau expect/actual reader. |
| **Audio: Microphone Capture** | `AudioCaptureService.kt` | `android.media.AudioRecord`, `VOICE_COMMUNICATION` (AEC) | **Kategori 3** | Tinggi | **Wajib Native iOS**: Implementasi `AVAudioEngine` / `AVAudioInputNode` dengan `AVAudioSessionCategoryPlayAndRecord` (Mode VoiceChat untuk hardware AEC iOS) 16kHz PCM. |
| **Audio: Speaker Playback** | `AudioPlaybackService.kt` | `android.media.AudioTrack` 24kHz, `AudioManager.setCommunicationDevice` | **Kategori 3** | Tinggi | **Wajib Native iOS**: Implementasi `AVAudioPlayerNode` / `AudioQueue` 24kHz mono PCM streaming, jitter buffer, dan instant buffer flush saat user barge-in. |
| **Audio: Text-To-Speech** | `FlashcardTtsManager.kt` | `android.speech.tts.TextToSpeech` | **Kategori 3** | Sedang | **Wajib Native iOS**: Implementasi `AVSpeechSynthesizer` dan `AVSpeechUtterance` (Voice US English) dengan listener completion. |
| **Build: Secrets Management** | `BuildConfig.GEMINI_API_KEY`, `local.properties` | AGP BuildConfig generator | **Kategori 2** | Rendah | Migrasi ke library `BuildKonfig` (multiplatform) atau inject compile-time configuration yang aman. |

---

## 3. ANALISIS BAGIAN YANG DAPAT DIGUNAKAN KEMBALI (SHARED CODE 100%)

Salah satu keunggulan terbesar dari arsitektur Fluelo v1.0 yang telah dibangun adalah **pemisahan tanggung jawab (*separation of concerns*) yang sangat ketat**. Domain logic dan pemrosesan state tidak pernah dicampur ke dalam lifecycle Android.

### 3.1. Domain & Algoritma Logika Pembelajaran
1. **ModeRouter (Zero-Cost Intent Router):**
   - Menggunakan kompilasi pola regex untuk mendeteksi perubahan mode (`FREE_CONVERSATION`, `VOCABULARY`, `GRAMMAR`, `ROLEPLAY`), tindakan latihan (`SKIP`, `REPEAT`, `STOP`), dan pertanyaan sementara pengguna dalam Bahasa Indonesia, Inggris, maupun bahasa campur (*code-switching*).
   - Kode ini 100% murni Kotlin standard library, mengeksekusi dalam tempo < 1ms, tanpa ketergantungan framework. Berpindah langsung ke `commonMain`.
2. **ExerciseState & LearningMode:**
   - State machine multi-dimensi yang mengatur mode aktif, preferensi bahasa (`BILINGUAL`, `INDONESIAN_ONLY`, `ENGLISH_ONLY`), dan kebijakan koreksi (`GENTLE`, `INTENSIVE`, `OFF`).
   - Tidak ada ketergantungan platform.
3. **SessionSummaryGenerator:**
   - Logika sintesis topik, ekstraksi kosakata baru, dan rekomendasi fokus tata bahasa berdasarkan frekuensi kesalahan M3.
   - 100% deterministik, berbasis aturan lokal, bebas jaringan. Berpindah langsung ke `commonMain`.
4. **Algoritma Flashcard Option A (Deterministic Seed 42):**
   - Logika pengacakan deterministik tepat satu kali untuk 3.000 kata dengan seed 42 dan invariant reset active recall.
   - Berpindah utuh ke `commonMain`.

### 3.2. Data Models & Serialization
1. **LiveProtocolModels:**
   - Seluruh payload frame WebSocket Gemini Live (`LiveClientSetup`, `LiveClientContentMessage`, `LiveAudioChunk`, `LiveServerContent`, dsb.) dianotasi dengan `@Serializable` dari `kotlinx.serialization`.
2. **ChatModels & TutorFeedback:**
   - DTO REST untuk interaksi dengan Gemini Flash dan struktur umpan balik koreksi linguistik (`needsCorrection`, `originalText`, `correctedText`, `explanation`, `spokenNote`).
   - 100% multiplatform serializable.

### 3.3. Presentasi UI Jetpack Compose
Sekitar **90% kode visual dan layout** dapat langsung digunakan di iOS melalui Compose Multiplatform:
1. **Bento Grid Dashboard (`HomeScreen`):** Komponen grid modular, animasi tactile press scale `0.975f`, banner active call, dan empty state.
2. **Chat Room (`ChatScreen`):** Daftar gelembung pesan auto-scroll, chips saran tata bahasa, indikator loading, dan penyesuaian IME keyboard.
3. **Kartu Flashcard 3D (`VocabularyCardView`):**
   - Transformasi 3D sumbu-Y menggunakan `Modifier.graphicsLayer { rotationY = animatedRotation; cameraDistance = 12f * density }` didukung penuh oleh Skiko (Skia Multiplatform) di iOS dengan performa 60/120fps yang akseleratif via Metal.
4. **Kartu Koreksi Tutor (`TutorCorrectionCard`):** Tampilan visual teks coret (*strikethrough*), teks tebal Neon Lime, dan ekspansi animasi penjelasan tata bahasa bilingual.
5. **Session Detail & Settings Screens:** Tampilan riwayat sesi, tombol hapus, toggle reduced motion, dan seleksi suara AI.

---

## 4. ANALISIS BAGIAN YANG MEMERLUKAN ADAPTASI KMP (EXPECT/ACTUAL & LIBRARIES)

Komponen-komponen ini membutuhkan adaptasi struktural ringan atau penggantian library Android ke library resmi Kotlin Multiplatform:

### 4.1. Room Database Multiplatform (v2.7.0+)
- **Kondisi Saat Ini:** Menggunakan `androidx.room:room-runtime:2.6.1` dan `androidx.room:room-compiler` via KSP di Android.
- **Rencana Adaptasi KMP:**
  - Google telah merilis **Room Multiplatform** resmi di `androidx.room` versi 2.7.0+.
  - **Kabar Baik:** Seluruh class `@Entity` (8 tabel), `@Dao` (7 DAO interfaces), hubungan `@Relation` (`SessionWithDetails`), dan logika migrasi SQL (`MIGRATION_1_2`) tetap berada di `commonMain` tanpa perlu penulisan ulang ke SQLDelight!
  - **Adaptasi yang dibutuhkan:**
    Membuat fungsi factory database via `expect/actual`:
    ```kotlin
    // commonMain
    expect fun getDatabaseBuilder(): RoomDatabase.Builder<FlueloDatabase>
    
    // androidMain
    actual fun getDatabaseBuilder(): RoomDatabase.Builder<FlueloDatabase> {
        val appContext = AndroidContextHolder.context
        val dbFile = appContext.getDatabasePath("fluelo_database.db")
        return Room.databaseBuilder<FlueloDatabase>(appContext, dbFile.absolutePath)
    }
    
    // iosMain
    actual fun getDatabaseBuilder(): RoomDatabase.Builder<FlueloDatabase> {
        val documentDirectory = NSFileManager.defaultManager.URLForDirectory(
            directory = NSDocumentDirectory,
            inDomain = NSUserDomainMask,
            appropriateForURL = null,
            create = false,
            error = null
        )?.path ?: ""
        val dbFilePath = "$documentDirectory/fluelo_database.db"
        return Room.databaseBuilder<FlueloDatabase>(name = dbFilePath)
            .setDriver(BundledSQLiteDriver())
    }
    ```

### 4.2. Jetpack DataStore Preferences Multiplatform
- **Kondisi Saat Ini:** Menggunakan `androidx.datastore:datastore-preferences:1.1.1` dengan `Context.preferencesDataStore`.
- **Rencana Adaptasi KMP:**
  - DataStore 1.1.1 sudah multiplatform secara bawaan.
  - Kita hanya perlu memisahkan penyedia path file data store:
    - Android: `context.filesDir.resolve("user_preferences.preferences_pb")`
    - iOS: `NSFileManager` Documents folder `resolve("user_preferences.preferences_pb")`
  - Seluruh logic `UserPreferencesRepository` (Flow mapping, enum serializer) tetap berada di `commonMain`.

### 4.3. Networking & WebSocket (Ktor Client 3.0+)
- **Kondisi Saat Ini:** OkHttp 4.12.0 digunakan untuk HTTP REST (`GeminiChatClient`, `TutorCorrectionEngine`) dan WebSocket langsung (`GeminiLiveClient`).
- **Rencana Adaptasi KMP:**
  - Ganti OkHttp dengan **Ktor Client** (`io.ktor:ktor-client-*`).
  - Arsitektur Engine Ktor:
    - `androidMain`: Menggunakan engine `io.ktor:ktor-client-okhttp` (menjamin stabilitas koneksi Android tetap 100% identik dengan v1.0).
    - `iosMain`: Menggunakan engine `io.ktor:ktor-client-darwin` (memanfaatkan network stack native Apple `NSURLSession`).
  - `GeminiLiveClient` diadaptasi menggunakan `DefaultClientWebSocketSession`:
    ```kotlin
    val client = HttpClient(getPlatformHttpEngine()) {
        install(WebSockets) {
            pingInterval = 30_000
        }
    }
    ```
  - Base64 Encoding: Ganti `android.util.Base64` dengan standar Kotlin `kotlin.io.encoding.Base64.Default`.
  - Logging: Ganti `android.util.Log` dengan multiplatform logger (Kermit / Napier atau expect-actual `AppLogger`).

### 4.4. Animasi Maskot Chromatic Cat (`ChromaticCatCharacter`)
- **Kondisi Saat Ini:**
  `ChromaticCatCharacter.kt` memanggil `drawIntoCanvas { it.nativeCanvas.drawPath(...) }` dengan dependensi Android `android.graphics.BlurMaskFilter`, `SweepGradient`, `Paint`, dan `Path`.
- **Rencana Adaptasi KMP:**
  - Pisahkan rendering canvas ke standar Compose Multiplatform:
    1. Ganti `android.graphics.Path` dengan `androidx.compose.ui.graphics.Path`.
    2. Ganti `android.graphics.SweepGradient` dengan `androidx.compose.ui.graphics.Brush.sweepGradient()`.
    3. Untuk efek blur aura chromatic di background, gunakan `Modifier.blur(radius = 24.dp)` bawaan Compose Multiplatform yang dipetakan ke Skia GPU shader di iOS dan RenderNode di Android, mengeliminasi kebutuhan memanggil `nativeCanvas` secara manual.

### 4.5. ViewModels & Lifecycle
- **Kondisi Saat Ini:** ViewModels meng-extend `AndroidViewModel(application)`.
- **Rencana Adaptasi KMP:**
  - Menggunakan library resmi `androidx.lifecycle:lifecycle-viewmodel-compose` (versi 2.8+ KMP).
  - Ubah class menjadi `ViewModel()` biasa (tanpa dependensi ke `Application`), dan oper repository yang dibutuhkan melalui constructor injection sederhana atau Service Locator.

---

## 5. ANALISIS BAGIAN YANG WAJIB DIIMPLEMENTASIKAN NATIVE iOS (AVFOUNDATION & COREAUDIO)

Bagian ini merupakan **titik krusial yang paling membutuhkan perhatian teknis tinggi**. Real-time voice AI dengan latensi sub-detik tidak dapat menggunakan abstraksi audio generic. Komponen ini wajib diimplementasikan menggunakan framework native Apple via Kotlin/Native (`platform.AVFoundation.*` dan `platform.AudioToolbox.*`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SHARED AUDIO INTERFACES (commonMain)                 │
│                                                                        │
│   ┌────────────────────────┐             ┌─────────────────────────┐   │
│   │   AudioCaptureEngine   │             │   AudioPlaybackEngine   │   │
│   │   - startCapture()     │             │   - startPlayback()     │   │
│   │   - stopCapture()      │             │   - enqueuePcmChunk()   │   │
│   │   - amplitude: Flow    │             │   - clearAndInterrupt() │   │
│   └───────────▲────────────┘             └────────────▲────────────┘   │
└───────────────┼───────────────────────────────────────┼────────────────┘
                │                                       │
     ┌──────────┴──────────┐                 ┌──────────┴──────────┐
     │                     │                 │                     │
┌────┴────────────┐  ┌─────┴───────────┐┌────┴────────────┐  ┌─────┴───────────┐
│   Android       │  │      iOS        ││   Android       │  │      iOS        │
│ AudioRecord     │  │ AVAudioEngine   ││ AudioTrack      │  │ AVAudioPlayer   │
│ VOICE_COMM      │  │ VoiceChat Mode  ││ MODE_IN_COMM    │  │ Jitter Buffer   │
│ Hardware AEC    │  │ Apple AEC       ││ setCommDevice   │  │ Hardware Flush  │
└─────────────────┘  └─────────────────┘└─────────────────┘  └─────────────────┘
```

### 5.1. Audio Capture & Echo Cancellation (16kHz PCM Mono)
- **Implementasi Android:** Menggunakan `AudioRecord` dengan `AudioSource.VOICE_COMMUNICATION` yang mengaktifkan chip hardware Acoustic Echo Cancellation (AEC).
- **Implementasi iOS (Wajib Native):**
  - Menggunakan **`AVAudioEngine`** dan node input **`inputNode`**.
  - Mengatur konfigurasi audio session:
    ```swift
    // Pseudocode / Kotlin-Native implementation
    let audioSession = AVAudioSession.sharedInstance()
    try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [.defaultToSpeaker, .allowBluetooth])
    try audioSession.setPreferredSampleRate(16000.0)
    try audioSession.setActive(true)
    ```
  - **PENTING (AEC di iOS):** Penggunaan `mode: .voiceChat` adalah kunci mutlak pada sistem operasi iOS untuk mengaktifkan VoiceProcessingIO bawaan Apple (Acoustic Echo Cancellation & AGC). Tanpa mode ini, suara Buddy dari loudspeaker iPhone akan memantul kembali ke mikrofon dan merusak percakapan.
  - Memasang tap pada bus:
    ```kotlin
    val format = AVAudioFormat(kAudioFormatLinearPCM, 16000.0, 1, false)
    engine.inputNode.installTapOnBus(0u, 1600u, format) { buffer, _ ->
        // Convert AVAudioPCMBuffer ke ByteArray PCM 16-bit mono 16kHz
        // Hitung RMS amplitude -> kirim ke shared onAudioChunk callback
    }
    ```

### 5.2. Streaming Audio Playback & Client Barge-In (24kHz PCM Mono)
- **Implementasi Android:** Menggunakan streaming `AudioTrack` dengan jitter buffer 100ms dan metode `clearAndInterrupt()` yang memanggil `audioTrack.pause()`, `audioTrack.flush()`, dan mengosongkan channel coroutine.
- **Implementasi iOS (Wajib Native):**
  - Menggunakan `AVAudioEngine` dengan **`AVAudioPlayerNode`** atau **`AudioQueue`** (`AudioQueueNewOutput`).
  - Format output: 24.000 Hz, 1 channel (mono), Linear PCM 16-bit.
  - Mengimplementasikan pre-buffering ~100ms (4.800 bytes) sebelum node dijalankan untuk mencegah audio cracking/underrun.
  - **CRITICAL BARGE-IN (Interupsi Suara Seketika):**
    Saat pengguna berbicara atau menekan tombol interupsi, fungsi `clearAndInterrupt()` pada iOS harus segera:
    1. Mengosongkan buffer antrian audio Ktor/Kotlin.
    2. Memanggil `playerNode.stop()` dan `playerNode.reset()` (atau `AudioQueueFlush` + `AudioQueueReset`).
    3. Mengatur ulang state berbicara ke `isSpeaking = false` dalam tempo < 10ms.

### 5.3. Text-To-Speech Flashcard (Pengucapan Kata US English)
- **Implementasi Android:** Menggunakan `android.speech.tts.TextToSpeech` dengan guard `AudioSessionState.IDLE`.
- **Implementasi iOS (Wajib Native):**
  - Menggunakan **`AVSpeechSynthesizer`** dari framework `AVFoundation`.
  - Mengonfigurasi utterance:
    ```kotlin
    val utterance = AVSpeechUtterance(string = text).apply {
        voice = AVSpeechSynthesisVoice.voiceWithLanguage("en-US")
        rate = AVSpeechUtteranceDefaultSpeechRate
    }
    synthesizer.speakUtterance(utterance)
    ```
  - Mengimplementasikan `AVSpeechSynthesizerDelegateProtocol` untuk mendeteksi event `didStartSpeechUtterance` dan `didFinishSpeechUtterance`.

---

## 6. REKOMENDASI ARSITEKTUR REPOSITORY FLUELO 2.0 (KMP + COMPOSE MULTIPLATFORM)

Agar versi Android v1.0 yang sudah stabil tidak terganggu, kami merekomendasikan migrasi ke struktur modular standar industri Kotlin Multiplatform:

### 6.1. Usulan Struktur Folder Proyek Fluelo 2.0

```
fluelo-workspace/
├── .gitignore
├── gradlew
├── gradlew.bat
├── gradle.properties
├── settings.gradle.kts                   <-- Mengaktifkan modul :shared dan :composeApp
├── build.gradle.kts                      <-- Konfigurasi root KMP plugins
│
├── gradle/
│   └── libs.versions.toml                <-- Version Catalog terpusat (Kotlin, KMP, Ktor, Room)
│
├── shared/                               <-- MODUL MULTIPLATFORM UTAMA (Domain & Data & UI)
│   ├── build.gradle.kts                  <-- KMP build configuration
│   └── src/
│       ├── commonMain/                   <-- 100% Shared Logic, UI, & State
│       │   ├── kotlin/com/aibuddy/
│       │   │   ├── domain/               <-- ModeRouter, ExerciseState, Intent rules
│       │   │   ├── data/
│       │   │   │   ├── db/               <-- Room Entities, DAOs, Migrations (v2)
│       │   │   │   ├── history/          <-- SessionSummaryGenerator, Repositories
│       │   │   │   ├── flashcard/        <-- FlashcardRepository, Option A seed 42
│       │   │   │   ├── preferences/      <-- UserPreferencesRepository (DataStore KMP)
│       │   │   │   ├── prompt/           <-- BuddyPrompts (Master system instructions)
│       │   │   │   └── tutor/            <-- TutorCorrectionEngine logic & models
│       │   │   ├── live/                 <-- LiveProtocolModels, LiveSessionState
│       │   │   ├── audio/                <-- Audio interfaces (Capture, Playback, TTS)
│       │   │   └── ui/                   <-- Compose Multiplatform (Screens, Bento, 3D Cards)
│       │   │       ├── home/
│       │   │       ├── conversation/
│       │   │       ├── chat/
│       │   │       ├── flashcard/
│       │   │       ├── history/
│       │   │       ├── settings/
│       │   │       ├── components/       <-- BentoCard, Cat (Adapted), 3D Flip, Glow
│       │   │       └── navigation/       <-- Navigation Compose Multiplatform
│       │   └── composeResources/         <-- Shared Assets (Vocabulary JSON, Icons, Logo)
│       │       └── files/
│       │           └── fluelo_vocabulary_v1.json
│       │
│       ├── androidMain/                  <-- Platform Implementations untuk Android
│       │   └── kotlin/com/aibuddy/
│       │       ├── audio/                <-- AudioRecord, AudioTrack, Android TextToSpeech
│       │       └── platform/             <-- Android DatabaseBuilder, DataStore path, Mic Permission
│       │
│       └── iosMain/                      <-- Platform Implementations untuk iOS
│           └── kotlin/com/aibuddy/
│               ├── audio/                <-- AVAudioEngine capture, AVAudioPlayerNode, AVSpeech
│               ├── platform/             <-- iOS DatabaseBuilder (NSDocument), DataStore path, Mic Permission
│               └── MainViewController.kt <-- UIViewController wrapper untuk Compose Multiplatform
│
├── androidApp/                           <-- THIN LAUNCHER ANDROID (Menggantikan /app saat ini)
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/aibuddy/
│           └── MainActivity.kt           <-- Activity tipis yang memanggil Compose shared content
│
└── iosApp/                               <-- THIN XCODE HOST UNTUK iOS (SwiftUI Entry Point)
    ├── iosApp.xcodeproj
    ├── iosApp/
    │   ├── iOSApp.swift                  <-- App entry point (@main)
    │   ├── ContentView.swift             <-- Memanggil MainViewController dari shared framework
    │   ├── Info.plist                    <-- Berisi NSMicrophoneUsageDescription
    │   └── Assets.xcassets               <-- App icon iOS
    └── Podfile / SPM (Swift Package)     <-- Linker ke shared XCFramework
```

### 6.2. Strategi Checkpoint Git & Proteksi Branch
Sebelum satu baris kode pun diubah di Fase 2:
1. **Inisialisasi & Baseline Tag:**
   ```bash
   git init
   git add .
   git commit -m "chore: Fluelo Android v1.0.0 M6 verified baseline"
   git tag -a v1.0.0-android-stable -m "Baseline Fluelo Android v1.0 Signed Release"
   ```
2. **Branch Terisolasi:**
   ```bash
   git checkout -b feature/fluelo-kmp-2.0
   ```
3. **Aturan Proteksi:**
   - Cabang `main` tetap berisi source code Android v1.0 yang dapat di-build kapan saja (`./gradlew assembleRelease`).
   - Seluruh eksperimen refactoring KMP berlangsung di branch `feature/fluelo-kmp-2.0`.
   - Pada setiap commit migrasi di branch KMP, unit test Android (`./gradlew :shared:testDebugUnitTest`) wajib tetap hijau (100% lulus).

---

## 7. STRATEGI DEVELOPMENT, BUILD, DAN TESTING TANPA MAC PRIBADI

Mengembangkan aplikasi iOS dari lingkungan Windows tanpa perangkat Apple fisik membutuhkan pipeline otomatis berbasis cloud yang teruji dan efisien.

### 7.1. Alur Kerja Harian di Laptop Windows
- **Coding & Editing:** Dilakukan 100% di Antigravity / Android Studio di Windows.
- **Kompilasi Lokal:**
  - Kode di `commonMain` dan `androidMain` dikompilasi langsung di Windows menggunakan JDK 17 dan Android SDK lokal.
  - Unit test domain, database, serialisasi, dan viewmodel dijalankan secara lokal di Windows dalam hitungan detik.
- **Keterbatasan Teknis Windows:**
  - Toolchain Kotlin/Native untuk iOS (`iosArm64`, `iosSimulatorArm64`) membutuhkan library header Darwin dan linker Apple (Xcode CLI tools) yang **hanya ada di sistem operasi macOS**.
  - Oleh karena itu, tugas kompilasi framework iOS dan pembuatan file `.ipa` didelegasikan sepenuhnya ke runner macOS di cloud.

### 7.2. Pipeline Build Otomatis via Codemagic CI/CD
Codemagic adalah penyedia CI/CD khusus mobile dengan integrasi native Kotlin Multiplatform dan macOS M2 runners.

```
┌──────────────────┐       git push        ┌───────────────────────────────────────┐
│  Laptop Windows  │ ────────────────────► │          GitHub / GitLab Repo         │
│  (Antigravity)   │                       └──────────────────┬────────────────────┘
└──────────────────┘                                          │ webhook
                                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CODEMAGIC CLOUD CI/CD                                │
│                         (Runner: macOS M2 Instance)                              │
│                                                                                  │
│ 1. Checkout repository & setup JDK 17 + Xcode versi terbaru                      │
│ 2. Jalankan test otomatis: ./gradlew :shared:allTests                            │
│ 3. Kompilasi XCFramework: ./gradlew :shared:assembleReleaseXCFramework           │
│ 4. Build iOS App (.ipa) via xcodebuild CLI                                       │
│ 5. Code signing otomatis menggunakan App Store Connect API Key (.p8)             │
│ 6. Upload .ipa secara otomatis ke Apple TestFlight                               │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
     ┌─────────────────────────────┐           ┌─────────────────────────────┐
     │      Apple TestFlight       │           │         Appetize.io         │
     │   (Distribusi ke iPhone     │           │   (Interactive Web Stream   │
     │     fisik teman-teman)      │           │    Simulator di Chrome PC)  │
     └─────────────────────────────┘           └─────────────────────────────┘
```

#### Blueprint Konfigurasi `codemagic.yaml`:
```yaml
workflows:
  ios-testflight:
    name: Fluelo iOS TestFlight Release
    instance_type: mac_mini_m2
    max_build_duration: 30
    environment:
      groups:
        - apple_credentials # Menyimpan APP_STORE_CONNECT_PRIVATE_KEY, KEY_ID, ISSUER_ID
      vars:
        XCODE_WORKSPACE: "iosApp/iosApp.xcworkspace"
        XCODE_SCHEME: "iosApp"
        BUNDLE_ID: "com.aibuddy.fluelo"
    scripts:
      - name: Setup Java 17
        script: jdk-select 17
      - name: Run KMP Common Unit Tests
        script: ./gradlew :shared:testDebugUnitTest
      - name: Assemble Release XCFramework
        script: ./gradlew :shared:assembleSharedReleaseXCFramework
      - name: Set up code signing settings on Xcode project
        script: xcode-project use-profiles
      - name: Build and Package IPA
        script: |
          xcodebuild -workspace "$XCODE_WORKSPACE" \
            -scheme "$XCODE_SCHEME" \
            -configuration Release \
            -archivePath build/ios.xcarchive \
            archive
          xcodebuild -exportArchive \
            -archivePath build/ios.xcarchive \
            -exportOptionsPlist iosApp/ExportOptions.plist \
            -exportPath build/ipa
    artifacts:
      - build/ipa/*.ipa
    publishing:
      app_store_connect:
        auth: integration
        submit_to_testflight: true
        beta_groups:
          - Fluelo-Alpha-Testers
```

### 7.3. Strategi Pengujian iOS Tanpa Memiliki iPhone Pribadi
1. **Pengujian Cepat UI & Navigasi via Appetize.io (Di Browser Windows):**
   - Codemagic dapat dikonfigurasi untuk menghasilkan build iOS Simulator (`.app` zipped).
   - Artefak ini diunggah ke [Appetize.io](https://appetize.io), yang memungkinkan Anda menjalankan simulator iPhone interaktif langsung di dalam tab Google Chrome di laptop Windows.
   - Anda dapat memeriksa layout Compose, transisi layar, respons sentuhan, dan visualisasi tema secara instan tanpa memegang iPhone.
2. **Pengujian Akhir Hardware Audio via Apple TestFlight (Teman-Teman):**
   - Teman-teman yang memiliki iPhone diundang ke **Internal Testing** di App Store Connect menggunakan email Apple ID mereka.
   - Setiap kali Codemagic selesai mem-build, aplikasi TestFlight di iPhone teman akan berbunyi notifikasi pembaruan secara otomatis.
   - Teman dapat langsung menguji mikrofon, speakerphone, AEC, dan kecepatan respon suara Gemini Live dalam penggunaan nyata.

### 7.4. Kebutuhan Akun, Biaya, dan Pengaturan Sertifikat Apple
- **Apple Developer Program:**
  - **Biaya:** $99 USD / tahun (sekitar Rp 1.550.000 – Rp 1.650.000 / tahun).
  - **Keharusan:** Wajib memiliki akun ini untuk dapat mendistribusikan aplikasi ke TestFlight dan membuat sertifikat penandatanganan kode (*code signing*). Tanpa akun ini, iOS build tidak dapat diinstal di perangkat orang lain.
- **Manajemen Sertifikat Tanpa Membuka Mac:**
  - Anda tidak perlu meminjam Mac untuk membuat file CSR (Certificate Signing Request) secara manual.
  - Cukup buat **App Store Connect API Key** di portal web [appstoreconnect.apple.com](https://appstoreconnect.apple.com) (Users and Access -> Integrations -> App Store Connect API).
  - Unduh file private key `.p8`, catat Key ID dan Issuer ID, lalu masukkan ke Environment Variables di Codemagic.
  - Fitur **Codemagic Automatic Code Signing** akan membuat Distribution Certificate, App ID, dan Provisioning Profile secara otomatis di cloud!

---

## 8. KEAMANAN API KEY & KREDENSIAL AI SEBELUM DISTRIBUSI TESTFLIGHT

Sebelum mendistribusikan aplikasi Fluelo versi iOS kepada penguji di TestFlight, **masalah perlindungan Gemini API Key wajib diselesaikan secara tuntas**.

### 8.1. Analisis Kerentanan Saat Ini
- Pada Android v1.0 personal, key dibaca dari `local.properties` dan dikompilasi menjadi `BuildConfig.GEMINI_API_KEY`.
- **Risiko Fatal pada Distribusi Multi-User / TestFlight:**
  1. File `.ipa` TestFlight dapat di-unzip oleh siapapun. String di dalam binary dapat diekstrak dengan perintah `strings` sederhana.
  2. Gemini Live WebSocket memanggil endpoint dengan query parameter:
     `wss://generativelanguage.googleapis.com/...BidiGenerateContent?key=AIzaSy...`
  3. Siapapun yang menghubungkan iPhone ke tool network inspection (seperti Proxyman, Charles Proxy, atau Wireshark) dapat menyalin API key Anda dalam 5 detik dan menggunakannya untuk kebutuhan lain hingga tagihan/kuota Anda habis.

### 8.2. Opsi Solusi & Rekomendasi Arsitektur Keamanan

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PERBANDINGAN STRATEGI KEAMANAN API KEY                       │
├──────────────────────┬──────────────────────┬───────────────────────────────────┤
│ Opsi                 │ Kompleksitas         │ Tingkat Keamanan & Rekomendasi    │
├──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ 1. BYOK              │ Rendah               │ SANGAT AMAN UNTUK ALPHA           │
│    (Bring Your Own   │ (Hanya input UI di   │ Bebas risiko kuota pengembang.    │
│    Key di Settings)  │ Settings)            │ Penguji memasukkan key sendiri.   │
├──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ 2. Hardened & Capped │ Sangat Rendah        │ CUKUP UNTUK TEMAN DEKAT           │
│    Google Cloud Key  │ (Konfigurasi di GCP  │ Kuota dibatasi ketat $5/hari,     │
│                      │ Console)             │ billing alert aktif.              │
├──────────────────────┼──────────────────────┼───────────────────────────────────┤
│ 3. Ephemeral Token   │ Sedang               │ STANDAR PRODUKSI (ENTERPRISE)     │
│    Auth Proxy        │ (1 Cloudflare Worker │ Key asli tidak pernah menyentuh   │
│    (Worker / Lambda) │ gratis)              │ device; token kedaluwarsa 30 mnt. │
└──────────────────────┴──────────────────────┴───────────────────────────────────┘
```

#### Rekomendasi Bertahap:
1. **Untuk Fase Pengujian Awal TestFlight (Alpha Internal bersama Teman):**
   - **Kombinasi Opsi 1 & Opsi 2:** Sediakan opsi input *Gemini API Key* di layar `SettingsScreen` (disimpan aman di DataStore lokal perangkat). Untuk key bawaan developer (jika diberikan ke teman dekat), atur **Budget Cap maksimal $5/bulan** dan alert di Google Cloud Platform Console agar tidak ada risiko pembengkakan biaya.
2. **Untuk Fase Rilis Publik (Fase 5+):**
   - Terapkan **Opsi 3: Cloudflare Worker Token Broker** (gratis 100.000 request/hari). Klien mobile meminta token sesi sementara (*ephemeral token*), sehingga API key permanen Anda tersimpan aman di server environment variable dan tidak pernah ada di dalam file aplikasi.

---

## 9. MANAJEMEN RISIKO TEKNIS & ESTIMASI KOMPLEKSITAS

| Risiko Teknis | Dampak | Probabilitas | Mitigasi Arsitektur |
|---|---|---|---|
| **Audio Latency & Stutter di iOS** | Sangat Tinggi | Sedang | Gunakan buffer streaming native via `AVAudioEngine` dengan pre-buffering 100ms dan hardware echo cancellation mode `.voiceChat`. |
| **Echo Loop Loudspeaker di iPhone** | Sangat Tinggi | Sedang | Wajib mengaktifkan `AVAudioSessionCategoryPlayAndRecord` dengan mode `AVAudioSessionModeVoiceChat` yang mengaktifkan hardware DSP VoiceProcessingIO bawaan Apple. |
| **Regresi / Kerusakan Versi Android** | Sangat Tinggi | Rendah | Pertahankan unit test 53 suite di Android. Buat branch git terpisah dan baseline tag `v1.0.0-android-stable`. |
| **Kegagalan Build di Cloud CI (Codemagic)** | Sedang | Sedang | Lakukan build bertahap: kompilasi shared framework (`assembleReleaseXCFramework`) terlebih dahulu sebelum merangkai file `.ipa`. |
| **Ketidaksesuaian Render UI Skiko di Metal** | Sedang | Rendah | Menggunakan komponen standar Material 3 Compose Multiplatform yang telah stabil (1.7+). Hindari native platform canvas hacks. |
| **Kebocoran / Penyalahgunaan API Key** | Tinggi | Tinggi | Terapkan pembatasan kuota ketat di Google Cloud Console dan sediakan fitur BYOK di menu Pengaturan. |

---

## 10. ROADMAP IMPLEMENTASI FASE 2–5 & ACCEPTANCE CRITERIA

Migrasi Fluelo 2.0 dirancang dalam tahapan terstruktur yang sistematis:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    FASE 2    │ ──► │    FASE 3    │ ──► │    FASE 4    │ ──► │    FASE 5    │
│ KMP Core &   │     │ Compose UI & │     │ Hardware     │     │ Cloud CI/CD  │
│  Data Layer  │     │ Nav Multipl. │     │ Audio iOS    │     │ & TestFlight │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### FASE 2: KMP Foundation & Data Layer Migration
**Tujuan:** Membangun modul `:shared`, memigrasikan Room Database V2, DataStore, Ktor Client, dan Domain logic ke `commonMain`. Android v1.0 tetap berjalan 100%.

- **Rincian Pekerjaan:**
  1. Git checkpoint: Tag `v1.0.0-android-stable` dan checkout branch `feature/fluelo-kmp-2.0`.
  2. Setup root Gradle KMP plugins, konfigurasi version catalog (`libs.versions.toml`).
  3. Buat modul `:shared` dengan source set `commonMain`, `androidMain`, `iosMain`.
  4. Migrasikan Room 2.7.0 KMP (Entities, DAOs, Migrasi 1->2).
  5. Migrasikan DataStore Preferences KMP 1.1.1.
  6. Migrasikan network REST & WebSocket ke Ktor 3.0+.
  7. Migrasikan `ModeRouter`, `ExerciseState`, `SessionSummaryGenerator`, dan `FlashcardRepository`.
- **Acceptance Criteria Fase 2:**
  - [ ] Seluruh unit test (53 unit tests) berhasil dikompilasi dan lulus 100% di `commonTest` / `androidUnitTest`.
  - [ ] Aplikasi Android dapat di-build (`assembleDebug`) dan berfungsi normal dengan data layer baru.
  - [ ] Data kosakata 3.000 kata berhasil di-seed tanpa corrupt pada database lokal.

### FASE 3: Compose Multiplatform UI & Navigation
**Tujuan:** Memindahkan 90%+ komponen antarmuka Jetpack Compose ke Compose Multiplatform di `commonMain`.

- **Rincian Pekerjaan:**
  1. Pindahkan `Theme.kt`, `Color.kt`, dan resource token ke `commonMain`.
  2. Refaktor `ChromaticCatCharacter.kt` dari Android Native Canvas ke Compose Graphics Multiplatform (`Brush.sweepGradient` + blur).
  3. Pindahkan komponen `BentoCard`, `MarkdownText`, `TutorCorrectionCard`, dan kartu flashcard 3D (`VocabularyCardView`).
  4. Pindahkan layar `HomeScreen`, `ChatScreen`, `FlashcardScreen`, `SessionDetailScreen`, dan `SettingsScreen`.
  5. Integrasikan Navigation Compose Multiplatform dan sesuaikan ViewModels ke `androidx.lifecycle.ViewModel`.
- **Acceptance Criteria Fase 3:**
  - [ ] Aplikasi Android berjalan normal menggunakan UI dari modul `:shared`.
  - [ ] Animasi 3D flip flashcard berjalan lancar 60fps tanpa glitch.
  - [ ] Tampilan tema gelap bento grid dan radial gradient glow tampil sempurna.

### FASE 4: Native iOS Audio Engine & Hardware Integration
**Tujuan:** Mengimplementasikan audio capture, streaming playback, dan TTS secara native untuk iOS menggunakan `AVFoundation` via Kotlin/Native.

- **Rincian Pekerjaan:**
  1. Definisikan interface `AudioCaptureEngine`, `AudioPlaybackEngine`, dan `TextToSpeechManager` di `commonMain`.
  2. Implementasikan `androidMain` wrapper untuk menghubungkan `AudioRecord`, `AudioTrack`, dan Android `TextToSpeech` yang sudah ada.
  3. Implementasikan `iosMain` audio capture dengan `AVAudioEngine.inputNode` (16kHz mono PCM) + `AVAudioSessionModeVoiceChat` (Hardware AEC).
  4. Implementasikan `iosMain` audio playback dengan `AVAudioPlayerNode` (24kHz mono PCM) dengan zero-latency buffer flush saat barge-in.
  5. Implementasikan `iosMain` TTS dengan `AVSpeechSynthesizer`.
  6. Buat `iosApp` Xcode project sederhana yang memanggil `MainViewController` via SwiftUI.
- **Acceptance Criteria Fase 4:**
  - [ ] Shared XCFramework (`assembleSharedReleaseXCFramework`) berhasil terkompilasi tanpa error linking.
  - [ ] Audio capture mikrofon di iOS menghasilkan stream 16kHz PCM yang terbaca oleh Gemini Live WebSocket.
  - [ ] Suara respon Gemini Live dapat terdengar jelas melalui loudspeaker iPhone tanpa distorsi.
  - [ ] Interupsi bicara (*barge-in*) seketika mematikan audio yang sedang diputar di iOS dalam < 50ms.

### FASE 5: Cloud Build Automation, Keamanan & Distribusi TestFlight
**Tujuan:** Menyiapkan Codemagic CI/CD, mengamankan API key, dan mendistribusikan build iOS ke Apple TestFlight.

- **Rincian Pekerjaan:**
  1. Daftarkan Apple Developer Account ($99/thn) dan buat App Store Connect API Key (`.p8`).
  2. Buat file `codemagic.yaml` untuk otomasi kompilasi, code signing, dan publikasi TestFlight.
  3. Tambahkan fitur BYOK (input API Key sendiri) di menu Settings sebagai proteksi awal.
  4. Atur kuota dan billing alerts di Google Cloud Console.
  5. Konfigurasikan build simulator untuk pengujian visual via Appetize.io di Windows.
  6. Rilis build pertama ke TestFlight Internal Testing untuk dicoba oleh teman-teman.
- **Acceptance Criteria Fase 5:**
  - [ ] Pipeline Codemagic berhasil membuild `.ipa` bertanda tangan resmi dari commit git tanpa error.
  - [ ] Aplikasi muncul di TestFlight dan dapat diinstal oleh penguji iPhone.
  - [ ] Teman-teman dapat melakukan panggilan suara bilingual dengan Buddy, membaca flashcard dengan audio TTS, dan melihat koreksi tata bahasa secara lancar di iPhone fisik mereka.
  - [ ] Fluelo Android v1.0 tetap beroperasi sempurna tanpa regresi sedikitpun.

---

## KESIMPULAN AUDIT & LANGKAH SELANJUTNYA

Fluelo memiliki fondasi arsitektur yang **sangat sehat dan modular**. Sebagian besar kode (~85%) dapat dipertahankan dan dibagikan secara langsung atau dengan adaptasi library standar KMP. Ketiadaan laptop Mac dan iPhone fisik sama sekali bukan halangan dengan arsitektur cloud Codemagic dan TestFlight yang telah kami rancang.

> [!IMPORTANT]
> **Status Fase 1 Selesai:** Seluruh audit dan perencanaan telah rampung. **Tidak ada kode aplikasi atau konfigurasi proyek yang dimodifikasi.**
> 
> Silakan pelajari dokumen audit ini. **Fase 2 (KMP Foundation & Data Layer) hanya akan dimulai setelah mendapatkan persetujuan tertulis dari Anda.**

