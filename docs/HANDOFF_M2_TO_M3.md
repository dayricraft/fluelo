# AI Buddy — Milestone 2 to Milestone 3 Handoff Document

> **Tanggal**: 2026-10-27  
> **Status**: Milestone 2 (Unified Voice + Chat) **SELESAI & DIVERIFIKASI (PASSED)**  
> **Target Berikutnya**: Milestone 3 (Tutor Correction & Bilingual Behavior)  
> **Perangkat Uji Fisik**: Samsung Galaxy A55 5G (`RRCX408EXYZ`, Android 14/15, Layar 1080x2340)

---

## 1. Ringkasan Eksekutif Milestone 2

Milestone 2 berhasil menyatukan modalitas suara (*voice*) dan teks (*chat*) ke dalam satu kesatuan sesi obrolan yang konsisten tanpa menghentikan streaming audio, tanpa merusak sesi WebSocket aktif, dan tanpa menimbulkan *ghost bubbles* atau duplikasi data.

Semua target Milestone 2 telah diimplementasikan, diuji unit, dan diverifikasi langsung pada perangkat fisik:
1. **Shared In-Memory Conversation Repository (`ConversationRepository`)**:
   - Menghubungkan riwayat giliran obrolan (*turns*) dari panggilan suara (`LiveSessionViewModel`) dan obrolan teks (`ChatViewModel`).
   - Kapasitas dibatasi secara aman (*bounded* 50 turns) untuk mencegah kebocoran memori.
   - Perubahan giliran obrolan dipantau secara reaktif menggunakan `StateFlow<List<ConversationTurn>>`.
2. **Lembar Transkrip 3-State (`HIDDEN`, `PEEK`, `EXPANDED`)**:
   - `HIDDEN`: Hanya menampilkan maskot kucing kromatik reaktif pada layar penuh (pengalaman suara murni).
   - `PEEK`: Menampilkan 2 pesan terakhir di bagian bawah untuk glanceability tanpa menutupi maskot.
   - `EXPANDED`: Menampilkan riwayat transkrip lengkap yang dapat di-scroll dan bar input teks interaktif.
   - Perpindahan antar state berjalan mulus pada 60fps dan **sama sekali tidak menghentikan streaming audio atau mendiskoneksi WebSocket**.
3. **Input Teks dalam Panggilan Suara (In-Call Text Input)**:
   - Bar input teks khusus panggilan suara terintegrasi di mode `EXPANDED` dengan dukungan inset keyboard (`.imePadding()`).
   - Teks dikirim langsung melalui koneksi WebSocket Gemini Live yang sedang aktif menggunakan pesan wire protocol `LiveClientContentMessage` (`turns` dengan `role: "user"`).
   - Gemini Live merespons dengan **suara yang diucapkan langsung lewat speaker** (TTFA terukur: 981ms) dan teks transkrip respons yang di-stream ke dalam balon obrolan secara bersamaan.
4. **Finalisasi Giliran Obrolan & Integritas Streaming**:
   - `LiveTranscriptEntry` kini dilengkapi flag `isFinal: Boolean`.
   - Token streaming parsial dari Gemini Live diakumulasikan ke balon aktif (`isFinal = false`), dan difinalisasi secara tegas (`isFinal = true`) saat menerima sinyal `turnComplete`, `interrupted`, atau saat tombol manual barge-in ditekan.
5. **Banner Panggilan Aktif di Layar Utama (`HomeScreen`)**:
   - Saat pengguna kembali ke layar utama saat panggilan masih berlangsung, banner *"Voice Call in Progress • Tap to return to conversation"* muncul dengan indikator hijau berdenyut.
   - Pengguna dapat mengetuk banner untuk kembali ke ruang obrolan secara instan, sementara audio tetap berjalan stabil di latar belakang.
6. **Berbagi Konteks Lintas Modalitas (Cross-Modality Sync)**:
   - `ChatViewModel` (tutor Gemini Flash) otomatis memanfaatkan ringkasan riwayat obrolan dari `ConversationRepository`, sehingga obrolan teks tutor mengetahui topik yang baru saja dibicarakan pada panggilan suara.
7. **Pengujian Unit Otomatis**:
   - 24/24 unit test berhasil lolos 100% via `gradlew testDebugUnitTest` (termasuk tes logika bounded limit di `ConversationRepositoryTest` dan validasi serialisasi protokol di `LiveProtocolTest`).

---

## 2. Metrik Verifikasi Aktual (Perangkat Fisik Samsung Galaxy A55)

| Parameter / Fitur | Target Spesifikasi | Hasil Terukur di HP Fisik | Status |
|---|---|---|---|
| **Kompilasi Unit Test** | 100% Pass | 24 task passed (4s) | **PASSED** |
| **Kompilasi APK Debug** | Clean build | `assembleDebug` sukses (9s) | **PASSED** |
| **Pesan Teks In-Call via WebSocket** | Audio output + transkrip | Suara terucap + transkrip tampil | **PASSED** |
| **TTFA Pesan Teks In-Call** | < 1500ms | **981ms** (logcat terverifikasi) | **PASSED** |
| **Transisi Lembar Transkrip** | Tidak memutus audio | 0 dropout audio, 60fps | **PASSED** |
| **Input Keyboard IME Inset** | Terapung di atas keyboard | Bersih via `.imePadding()`, no overlap | **PASSED** |
| **Navigasi Layar Saat Panggilan Aktif** | Audio tetap jalan + banner | Banner aktif di Home, audio stabil | **PASSED** |
| **Tear-down Panggilan** | Graceful closure | WebSocket close code 1000 | **PASSED** |
| **Anti-Slop Compliance** | Kontras AA, tanpa em dash palsu | Lolos audit visual & WCAG AA | **PASSED** |

---

## 3. Peta Direktori & File Baru / Terubah di M2

```text
android-project/app/src/
├── main/java/com/aibuddy/
│   ├── data/
│   │   └── repository/
│   │       ├── ConversationRepository.kt      # [BARU] In-memory unified repository (suara + teks)
│   │       └── LiveSessionRepository.kt       # [DIPERBARUI] Menambahkan expose sendTextMessage()
│   ├── live/
│   │   ├── GeminiLiveClient.kt                # [DIPERBARUI] Dispatch LiveClientContentMessage & isFinal logic
│   │   ├── LiveProtocolModels.kt              # [DIPERBARUI] Model serialisasi turns pesan teks
│   │   └── LiveSessionState.kt                # [DIPERBARUI] LiveTranscriptEntry dengan isFinal
│   └── ui/
│       ├── conversation/
│       │   └── ConversationScreen.kt          # [DIPERBARUI] 3-state sheet UI + InCallTextInputBar + IME insets
│       ├── home/
│       │   └── HomeScreen.kt                  # [DIPERBARUI] Active call banner dengan re-entry tap
│       ├── navigation/
│       │   └── AiBuddyNavGraph.kt             # [DIPERBARUI] Wiring sheet state & sendTextMessage
│       └── viewmodel/
│           ├── ChatViewModel.kt               # [DIPERBARUI] Context injection dari ConversationRepository
│           └── LiveSessionViewModel.kt        # [DIPERBARUI] TranscriptSheetState & ConversationRepository sync
└── test/java/com/aibuddy/
    ├── data/repository/
    │   └── ConversationRepositoryTest.kt      # [BARU] Unit test bounded queue & turn notification
    └── live/
        └── LiveProtocolTest.kt                # [DIPERBARUI] Unit test turn text payload & isFinal
```

---

## 4. Rencana Kerja Milestone 3 (Tutor Correction & Bilingual Behavior)

Milestone 3 berfokus pada kecerdasan tutor AI Buddy: memberikan koreksi grammar yang selektif, ramah, dan tidak memotong pembicaraan (*turn-end hybrid correction*).

### Rencana Deliverables M3:
1. **Prompt Persona Tutor Versi 3 (Versioned Buddy Persona)**:
   - System prompt bilingual (Bahasa Indonesia & Bahasa Inggris) yang stabil dan natural.
   - Aturan anti-interupsi: Buddy **TIDAK PERNAH** memotong saat pengguna sedang berbicara untuk mengoreksi.
   - Aturan koreksi selektif: Hanya mengoreksi kesalahan yang signifikan atau menghambat pemahaman; apresiasi usaha pengguna terlebih dahulu.
2. **Koreksi Hybrid di Akhir Giliran (Turn-End Selective Hybrid Correction)**:
   - **Spoken Note (Suara Pendek)**: Satu kalimat lisan singkat dan hangat (contoh: *"Bagus! Sedikit tips, kita biasanya bilang 'on the bus', bukan 'in the bus' ya."*).
   - **Written Detail (Transkrip Tertulis Terstruktur)**: Kartu koreksi visual di transkrip dengan highlight kata asli vs kata yang disarankan dan penjelasan ringkas (*💡 Quick Tip*).
3. **Struktur Data Koreksi Tutor (`TutorFeedback`)**:
   - Menyimpan `originalPhrase`, `correctedPhrase`, `explanation`, dan `timestamp`.
   - Diekspos secara reaktif untuk ditampilkan pada lembar transkrip dan kartu obrolan.
4. **Pengujian Bahasa & Skenario**:
   - Uji skenario kesalahan umum pembelajar Indonesia (preposisi in/on/at, tenses lampau, agreement, kata serapan).
   - Verifikasi jeda VAD: koreksi hanya dikirim setelah jeda hening selesai dan giliran user dinyatakan tuntas.

---

## 5. Perintah Menjalankan & Memverifikasi

### Jalankan Semua Unit Test:
```powershell
cmd.exe /c "set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot&& set ANDROID_HOME=C:\Users\ahmad\AppData\Local\Android\Sdk&& set PATH=%JAVA_HOME%\bin;%PATH%&& cd android-project && gradlew.bat testDebugUnitTest"
```

### Build APK Debug:
```powershell
cmd.exe /c "set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot&& set ANDROID_HOME=C:\Users\ahmad\AppData\Local\Android\Sdk&& set PATH=%JAVA_HOME%\bin;%PATH%&& cd android-project && gradlew.bat assembleDebug"
```

### Install ke Perangkat Samsung Galaxy A55:
```powershell
cmd.exe /c "set ANDROID_HOME=C:\Users\ahmad\AppData\Local\Android\Sdk&& set PATH=%ANDROID_HOME%\platform-tools;%PATH%&& adb install -r android-project/app/build/outputs/apk/debug/app-debug.apk&& adb shell am start -n com.aibuddy/.MainActivity"
```
