# AI Buddy — Milestone 0 to Milestone 1 Handoff Document

> **Tanggal**: 2026-10-27  
> **Status**: Milestone 0 (Voice API Feasibility) **SELESAI & DISETUJUI (PASSED)**  
> **Target Berikutnya**: Milestone 1 (Android App Foundation)

---

## 1. Ringkasan Eksekutif M0
Milestone 0 berhasil membuktikan kelayakan teknis (*technical feasibility*) fitur panggilan suara dua arah (*bidirectional live voice*) secara langsung pada perangkat fisik Android (Samsung `RRCX408EXYZ`) menggunakan model Google Gemini Live (`models/gemini-3.8-live`).

Hasil pengujian fisik membuktikan:
- Koneksi WebSocket stabil dengan latensi jabat tangan ~333ms.
- Waktu respon audio pertama (*Time to First Audio* / TTFA) berkisar antara **494ms hingga 978ms** (sangat responsif, di bawah 1 detik).
- Suara mengalir jernih, mulus, tanpa retak (*crack/pop*), dan tidak ada tumpang tindih kata.
- Komunikasi dua arah bilingual (Indonesia & Inggris) berjalan natural.
- Transkripsi tersusun rapi per kalimat utuh dalam satu bubble.
- Pemotongan bicara (*barge-in*) seketika menghentikan audio tanpa residual buffer.

---

## 2. Arsitektur Aktual & Struktur Kode

Semua kode sumber berada di direktori `android-project/app/src/main/java/com/aibuddy/`:

### A. Paket `com.aibuddy.audio`
1. [`AudioConfig.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/audio/AudioConfig.kt)
   - Input: 16.000 Hz, 16-bit Mono PCM (chunk ~3200 bytes = 100ms).
   - Output: 24.000 Hz, 16-bit Mono PCM (standar Gemini Live output).
2. [`AudioCaptureService.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/audio/AudioCaptureService.kt)
   - Menggunakan `AudioRecord` dengan audio source `MediaRecorder.AudioSource.VOICE_COMMUNICATION` untuk mengaktifkan hardware Acoustic Echo Cancellation (AEC) dan noise suppression bawaan Android.
   - Menghitung RMS amplitudo untuk visualizer dan VAD lokal (Voice Activity Detection) dengan jeda hening 700ms sebelum mengirim sinyal `audioStreamEnd`.
3. [`AudioPlaybackService.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/audio/AudioPlaybackService.kt)
   - Menggunakan `AudioTrack` dalam `MODE_STREAM` dengan atribut `USAGE_VOICE_COMMUNICATION`.
   - Mengarahkan audio ke loudspeaker melalui `AudioManager.setCommunicationDevice(TYPE_BUILTIN_SPEAKER)` (Android 12+) atau `isSpeakerphoneOn`.
   - **Jitter Buffer / Pre-buffering**: Mengakumulasikan ~100ms (4.800 bytes) audio sebelum memanggil `audioTrack.play()`, mencegah audio underrun / suara retak (*crack*).
   - **Zero-Latency Barge-In**: Fungsi `clearAndInterrupt()` yang seketika mengosongkan antrean channel, mem-pause, dan mem-flush buffer native `AudioTrack`.

### B. Paket `com.aibuddy.live`
1. [`LiveProtocolModels.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/live/LiveProtocolModels.kt)
   - Model serialisasi JSON (menggunakan `kotlinx.serialization.json`): `LiveClientSetup`, `LiveSetupConfig`, `LiveRealtimeInput`, `LiveServerMessage`, dll.
   - Mendukung format wire `realtimeInput.audio` dan flag penyelesaian giliran `audioStreamEnd: true`.
2. [`LiveSessionState.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/live/LiveSessionState.kt)
   - Enum `AudioSessionState`: `IDLE`, `CONNECTING`, `CONNECTED`, `LISTENING`, `USER_SPEAKING`, `PROCESSING`, `BUDDY_SPEAKING`, `INTERRUPTED`, `RECONNECTING`, `ERROR`.
   - Data class `LiveTranscriptEntry` dengan `id: String` unik untuk stabilitas render Jetpack Compose.
   - Data class `LiveSessionMetrics` (latensi koneksi, TTFA, jumlah chunk).
3. [`GeminiLiveClient.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/live/GeminiLiveClient.kt)
   - Mengelola koneksi WebSocket via OkHttp ke:  
     `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=$apiKey`
   - Model: `models/gemini-3.8-live`, Voice: `Puck`.
   - **Antrean FIFO Channel (`incomingMessageChannel`)**: Memproses semua frame WebSocket secara *strictly sequential* dalam satu coroutine pembaca untuk menjamin urutan decoding audio 100% runtut.
   - **Akumulasi Transkrip Per Giliran (`appendTranscript`)**: Menggabungkan token teks streaming ke dalam bubble yang sama sampai giliran bicara selesai (`turnComplete == true`).
   - **Pencegahan Self-Interruption**: Menonaktifkan pemotongan suara lokal saat AI sedang berbicara untuk mencegah echo speakerphone mengganggu jalannya percakapan.

### C. Paket `com.aibuddy.ui`
1. [`M0FeasibilityScreen.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/M0FeasibilityScreen.kt): Layar pembuktian M0 dengan status badge, visualizer amplitudo mic & speaker, kartu metrik latensi, daftar transkrip chat yang auto-scroll, serta tombol kontrol (Connect/Disconnect, Mute, Manual Interrupt).
2. [`MainActivity.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/MainActivity.kt): Menangani permission runtime mic (`RECORD_AUDIO`), edge-to-edge layout, dan penghentian audio capture saat aplikasi di-background (`onPause`).
3. `theme/`: Palet warna chromatic dark mode (`BackgroundDark`, `SurfaceDark`, `NeonLime`, `SoftPurple`, dll).

---

## 3. Lingkungan Build & Toolchain

- **Sistem Operasi**: Windows 11
- **JDK**: Microsoft Build of OpenJDK 17.0.21 (`C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot`)
- **Android SDK**: `C:\Users\ahmad\AppData\Local\Android\Sdk` (Platform SDK 35, Build-Tools 35.0.0, Platform-Tools 37.0.1)
- **Versi Build**: `compileSdk = 35`, `targetSdk = 35`, `minSdk = 26`
- **Gradle**: 8.10.2 (Gradle Wrapper `gradlew.bat`)
- **Android Gradle Plugin (AGP)**: 8.6.1
- **Kotlin**: 2.0.21
- **Jetpack Compose BOM**: 2024.10.01
- **Dependensi Utama**:
  - `com.squareup.okhttp3:okhttp:4.12.0`
  - `org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3`
  - `org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0`
  - `androidx.compose.material3:material3`
- **Perintah Build**:
  ```powershell
  cmd.exe /c "set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot&& set ANDROID_HOME=C:\Users\ahmad\AppData\Local\Android\Sdk&& set PATH=%JAVA_HOME%\bin;%PATH%&& cd android-project && gradlew.bat assembleDebug"
  ```
- **Perintah Install**:
  ```powershell
  adb install -r android-project/app/build/outputs/apk/debug/app-debug.apk
  ```

---

## 4. Pelajaran Teknis & "Gotchas" Penting

1. **Frame Binary WebSocket Google**:
   Google Gemini Live mengirim respons sebagai *Binary Frames* (`Opcode: 2`). Harus di-handle lewat `WebSocketListener.onMessage(ws, bytes: okio.ByteString)`.
2. **Bahaya Multi-Threading pada Streaming Frame**:
   Jangan pernah memanggil `scope.launch(Dispatchers.Default)` untuk setiap frame audio WebSocket secara langsung tanpa antrean. Frame berukuran kecil dapat di-decode out-of-order oleh thread pool, menghasilkan suara acak/robot rusak. **Gunakan Kotlin `Channel<String>` FIFO**.
3. **Buffer Underrun & Jitter**:
   AudioTrack membutuhkan pra-buffering (~100ms / 4800 byte) sebelum mulai memainkan streaming burst baru agar tidak timbul suara *pop/crack*.
4. **Echo Akustik Loudspeaker**:
   Deteksi energi mikrofon lokal (RMS VAD) tidak boleh memotong audio AI yang sedang berbicara melalui loudspeaker. Serahkan deteksi interupsi kepada server Gemini Live (`content.interrupted == true`) atau tombol interupsi eksplisit.
5. **Format Wire Turn Boundary**:
   Kirim `realtimeInput.audioStreamEnd: true` begitu pengguna selesai berbicara agar server segera memulai inferensi respons.

---

## 5. Panduan Pelaksanaan Milestone 1 (M1 — Android App Foundation)

Milestone berikutnya adalah **M1**. Tugas agent pada M1:

1. **Arsitektur Aplikasi & State Management (MVVM)**:
   - Buat `LiveSessionViewModel` untuk memisahkan logic dari `MainActivity.kt`.
   - Bungkus `GeminiLiveClient`, `AudioCaptureService`, dan `AudioPlaybackService` ke dalam repository / service domain layer (`LiveSessionRepository`).
2. **Navigasi & Kerangka Layar**:
   - Pasang Compose Navigation.
   - Buat kerangka navigasi sesuai `docs/04_UX_FLOW.md`:
     - Home / Dashboard Screen (Bento Grid, Status Karakter Kucing Buddy, Quick Actions).
     - Conversation Screen (Panggilan aktif dengan karakter kucing, transcript toggle).
     - Learning / History Screen (Persiapan untuk ringkasan catatan).
3. **Design System & Theme Tokens**:
   - Terapkan design tokens dari `docs/05_DESIGN_SYSTEM.md` (tipografi Outfit / Inter, palet chromatic glow, corner radiuses, elevasi).
   - Patuhi aturan anti-slop: UI bersih, kontras tinggi, navigasi intuitif, tanpa placeholder palsu.
4. **Local Settings (DataStore)**:
   - Simpan preferensi pengguna (suara default, nama pengguna, kecepatan respon) menggunakan Jetpack DataStore Preferences.

> [!IMPORTANT]
> Jangan mengubah kontrak audio atau model WebSocket Gemini Live yang telah terbukti stabil di M0 tanpa alasan teknis yang kuat. Gunakan fondasi audio yang ada sebagai inti dari panggilan suara di M1 dan seterusnya.
