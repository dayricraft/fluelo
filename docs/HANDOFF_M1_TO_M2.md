# AI Buddy — Milestone 1 to Milestone 2 Handoff Document

> **Tanggal**: 2026-10-27  
> **Status**: Milestone 1 (Android App Foundation) **SELESAI & DIVERIFIKASI (PASSED)**  
> **Target Berikutnya**: Milestone 2 (Unified Voice + Chat)  
> **Perangkat Uji Fisik**: Samsung Galaxy (`RRCX408EXYZ`, Android 14/15, Layar 1080x2340)

---

## 1. Ringkasan Eksekutif Milestone 1

Milestone 1 berhasil membangun fondasi aplikasi native Android yang kokoh, modular, dan mematuhi standar desain anti-slop tanpa merusak (*zero regression*) kontrak audio Gemini Live yang telah dibuktikan di Milestone 0. 

Fitur utama yang telah selesai diimplementasikan dan diuji di perangkat fisik:
1. **Navigasi Multi-Screen (Jetpack Compose Navigation)**: Mengatur rute antar 5 layar: `Home`, `Conversation`, `Chat`, `Settings`, dan `DiagnosticM0`.
2. **Dashboard Bento Grid**: Layout berestetika tinggi dengan kontras tinggi (WCAG AA), ukuran sentuh nyaman (>= 48dp), indikator status koneksi, dan *honest empty state* tanpa grafik palsu.
3. **Pemisahan Modality (Voice vs Text)**:
   - **Talk with Buddy (Neon Lime)**: Ruang panggilan suara interaktif berlatensi rendah (~500ms TTFA) menggunakan **Gemini 3.8 Live (WebSocket)**.
   - **Chat with Buddy (Soft Purple)**: Ruang chat teks khusus tutor bahasa Inggris menggunakan **Gemini 2.5 Flash (REST API)** yang memberikan penjelasan grammar terstruktur, koreksi kalimat ramah (*💡 Quick Tip*), dan saran prompt cepat.
4. **Penyimpanan Lokal (Jetpack DataStore)**: Menyimpan tema tampilan (`DARK`, `LIGHT`, `SYSTEM`), bahasa aplikasi, nama pengguna, dan profil suara AI.
5. **Maskot Kromatik Prosedural**: `ChromaticCatCharacter` digambar langsung pada Canvas dengan reaksi amplitudo audio mikrofon dan speaker tanpa alokasi memori berlebih per frame.
6. **Latar Belakang Gradasi Radial Sinematik**: `RadialGradientBackground.kt` yang mengadaptasi CSS spotlight radial gradient ke dalam native Jetpack Compose menggunakan palet warna resmi (`BackgroundDark` `#09090B` dan pendaran `SoftPurple` `#C9B6FF`).
7. **Suite Unit Test Otomatis**: Pengujian unit untuk serialisasi model, protokol Gemini, dan DataStore preferences berjalan sukses 100%.

---

## 2. Peta Direktori Kode Sumber Aktual

Semua kode sumber aplikasi berada di `android-project/app/src/`:

```text
android-project/app/src/main/java/com/aibuddy/
├── MainActivity.kt                      # Edge-to-edge Activity, runtime permission, lifecycle audio pause
├── audio/
│   ├── AudioConfig.kt                   # Konstanta audio: 16kHz capture, 24kHz playback, chunk sizes
│   ├── AudioCaptureService.kt           # Native AudioRecord (VOICE_COMMUNICATION AEC, RMS, VAD)
│   └── AudioPlaybackService.kt          # Native AudioTrack (Loudspeaker routing, 100ms jitter buffer, flush)
├── data/
│   ├── chat/
│   │   ├── ChatModels.kt                # Model serialisasi Gemini REST API & ChatMessage
│   │   └── GeminiChatClient.kt          # HTTP Client OkHttp memanggil gemini-2.5-flash (English Tutor)
│   └── preferences/
│       ├── UserPreferences.kt           # Domain data class (ThemeMode, AppLanguage)
│       └── UserPreferencesRepository.kt # Jetpack DataStore Preferences persistence
├── live/
│   ├── GeminiLiveClient.kt              # WebSocket client gemini-3.8-live (FIFO channel queue, turn accumulator)
│   ├── LiveProtocolModels.kt            # Model serialisasi pesan wire protocol Gemini Live
│   ├── LiveSessionModels.kt / State.kt  # State enum, metrik latensi, LiveTranscriptEntry
│   └── LiveSessionRepository.kt         # Domain repository pengelola Voice Engine (Capture + Playback + WS)
└── ui/
    ├── M0FeasibilityScreen.kt           # Layar diagnostik teknis M0 (audio latency, jitter, direct controls)
    ├── chat/
    │   └── ChatScreen.kt                # Layar obrolan teks tutor bahasa Inggris (chips, IME padding)
    ├── components/
    │   ├── BentoCard.kt                 # Komponen kartu Bento Grid (Neon Lime & Soft Purple)
    │   ├── ChromaticCatCharacter.kt     # Maskot kucing hitam berlingkar pendaran kromatik reaktif
    │   └── RadialGradientBackground.kt  # Komponen Compose latar radial gradient bernuansa gelap
    ├── conversation/
    │   └── ConversationScreen.kt        # Layar panggilan suara live (barge-in, drawer transkrip, maskot)
    ├── home/
    │   └── HomeScreen.kt                # Layar dashboard utama Bento Grid
    ├── navigation/
    │   ├── NavRoutes.kt                 # Sealed class rute navigasi Screen (Home, Conversation, Chat, dll)
    │   └── AiBuddyNavGraph.kt           # NavHost yang menghubungkan ViewModel dengan seluruh layar
    ├── settings/
    │   └── SettingsScreen.kt            # Layar pengaturan preferensi tema, bahasa, dan suara AI
    ├── theme/
    │   ├── Color.kt                     # Palet warna resmi (#09090B, #C8F53B, #C9B6FF, #FFC8E2)
    │   ├── Theme.kt                     # Dynamic MaterialTheme Compose wrapper
    │   └── Type.kt                      # Token tipografi Outfit/Inter
    └── viewmodel/
        ├── ChatViewModel.kt             # Presentation state flow untuk Chat Room (messages, loading, error)
        ├── LiveSessionViewModel.kt      # Presentation state flow untuk Voice Call (sessionState, audio RMS)
        └── SettingsViewModel.kt         # Presentation state flow untuk DataStore preferences
```

---

## 3. Lingkungan Toolchain & Perintah Eksekusi

- **Sistem Operasi**: Windows 11
- **JDK**: Microsoft Build of OpenJDK 17 (`C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot`)
- **Android SDK**: `C:\Users\ahmad\AppData\Local\Android\Sdk` (compileSdk 35, targetSdk 35, minSdk 26)
- **Kredensial API**: `android-project/local.properties` (`GEMINI_API_KEY=...` ➡️ Gradle `BuildConfig.GEMINI_API_KEY`)
- **Perintah Jalankan Unit Test**:
  ```cmd
  cmd.exe /c "set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot&& set ANDROID_HOME=C:\Users\ahmad\AppData\Local\Android\Sdk&& set PATH=%JAVA_HOME%\bin;%PATH%&& cd android-project && gradlew.bat testDebugUnitTest"
  ```
- **Perintah Build APK**:
  ```cmd
  cmd.exe /c "set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot&& set ANDROID_HOME=C:\Users\ahmad\AppData\Local\Android\Sdk&& set PATH=%JAVA_HOME%\bin;%PATH%&& cd android-project && gradlew.bat assembleDebug"
  ```
- **Perintah Install & Buka di HP Fisik**:
  ```cmd
  cmd.exe /c "set ANDROID_HOME=C:\Users\ahmad\AppData\Local\Android\Sdk&& set PATH=%ANDROID_HOME%\platform-tools;%PATH%&& adb install -r android-project/app/build/outputs/apk/debug/app-debug.apk&& adb shell am start -n com.aibuddy/.MainActivity"
  ```

---

## 4. Keputusan Teknis & "Gotchas" Penting (Wajib Dibaca)

1. **Penanganan Keyboard IME pada Android 14/15 (`.imePadding()`)**:
   Pada `ChatScreen.kt`, bar bawah input teks wajib menggunakan modifier `.imePadding()` dan `.navigationBarsPadding()`. Jika tidak ada, keyboard virtual bawaan sistem akan menutupi kolom input.
2. **Aspek Rasio Gradien Layar Smartphone**:
   Saat mengonversi CSS `radial-gradient(125% 125% at 50% 10%, #000 40%, #glow 100%)` ke Canvas Android, perhitungan radius tidak boleh menggunakan `maxOf(width, height) * 1.25f` karena rasio layar HP portrait sangat tinggi (9:19.5). Penggunaan radius sebesar itu akan membuang pendaran warna ke luar layar. Nilai optimal yang terbukti di HP Samsung adalah `radius = size.height * 0.88f` dengan *lerp* warna `SoftPurple` di kekuatan `0.48f`.
3. **Pemberian Latar Belakang Transparan pada `Scaffold`**:
   Agar `RadialGradientBackground` terlihat tembus di belakang chat bubbles dan top bar, `Scaffold` harus disetel `containerColor = Color.Transparent`, dan `TopAppBar` memiliki `containerColor = Color.Transparent`.
4. **Isolasi Urutan Frame Audio WebSocket**:
   Google Gemini Live mengirim frame streaming kecil secara konstan. Jangan pernah memproses frame-frame ini langsung secara konkuren. Semua frame masuk ke dalam Kotlin `Channel<String>(Channel.UNLIMITED)` dan dikonsumsi oleh satu coroutine sequential.
5. **Pemisahan Model Berdasarkan Kebutuhan**:
   - Panggilan Suara: Menggunakan `models/gemini-3.8-live` melalui WebSocket duplex untuk audio instan dan interupsi langsung.
   - Percakapan Teks & Tutor: Menggunakan `models/gemini-2.5-flash` melalui REST API untuk penjelasan tata bahasa yang mendalam, terstruktur, dan terformat rapi.

---

## 5. Panduan Pelaksanaan Milestone 2 (M2 — Unified Voice + Chat)

Tujuan utama Milestone 2 adalah **menyatukan pengalaman suara dan teks ke dalam satu kesatuan sesi yang harmonis**:

1. **Kontinuitas Konteks Percakapan (Shared Context)**:
   - Buat jembatan data agar apa yang dibicarakan di panggilan suara dapat diacu kembali saat pengguna berpindah ke chat teks (dan sebaliknya).
   - *Catatan Teknis*: Gemini Live mengelola state di server selama WebSocket aktif, sedangkan Gemini Flash menerima riwayat berupa list `GeminiContent`. Sediakan lapisan repository percakapan lokal untuk menyimpan giliran bicara pengguna (*user turns*) secara seragam.
2. **Sheet Transkrip Suara yang Dapat Dilipat (*Collapsible In-Call Transcript Drawer*)**:
   - Pada `ConversationScreen`, sempurnakan panel transkrip agar pengguna dapat membuka atau menutup transkrip teks kapan saja tanpa menghentikan audio streaming yang sedang berjalan.
3. **Penyelarasan Status Sesi Lintas Layar**:
   - Ketika panggilan suara sedang aktif dan pengguna menekan tombol kembali ke Home, sediakan indikator status aktif (misalnya bar hijau *"Panggilan Aktif"*) di Home screen.
4. **Pencegahan Redundansi Giliran Bicara (*No Duplicate Turns*)**:
   - Pastikan token streaming parsial dari transkripsi tidak membuat bubble chat duplikat saat status berganti menjadi `turnComplete`.

> [!IMPORTANT]
> Jangan mengubah atau menghapus suite unit test yang ada. Pastikan perintah `gradlew.bat testDebugUnitTest` dan `gradlew.bat assembleDebug` selalu sukses di setiap checkpoint pengerjaan Milestone 2.
