# Test Plan — Automated and Real Device (As of Milestone 05)

## 1. Test Environment Baseline
- **Physical Device**: Samsung Galaxy A55 5G (`RRCX408EXYZ`, Android 14/15, 1080x2340 physical resolution)
- **Toolchain**: Microsoft OpenJDK 17.0.21, Android SDK 35 (Platform-Tools 37.0.1), Gradle 8.10.2, AGP 8.6.1, Kotlin 2.0.21, KSP 2.0.21-1.0.28
- **API Models**: Google Gemini Live (`models/gemini-3.8-live`), Google Gemini Flash (`models/gemini-2.5-flash`)
- **Connection**: Standard Wi-Fi, low latency (~330ms connect, ~500ms TTFA)

---

## 2. Automated Test Suite Status
Executed command: `.\gradlew.bat testDebugUnitTest`  
Result: **53 Tests across 9 Suites — 100% PASSED (0 Failures, 0 Errors)**

| Test Suite | File Location | Tests | Status |
|---|---|---|---|
| `SessionSummaryGeneratorTest` | `app/src/test/.../history/SessionSummaryGeneratorTest.kt` | 3 | **PASSED** |
| `FlashcardOrderEngineTest` | `app/src/test/.../flashcard/FlashcardOrderEngineTest.kt` | 11 | **PASSED** |
| `ModeRouterTest` | `app/src/test/.../router/ModeRouterTest.kt` | 8 | **PASSED** |
| `TutorCorrectionParserTest` | `app/src/test/.../tutor/TutorCorrectionParserTest.kt` | 7 | **PASSED** |
| `ConversationRepositoryTest` | `app/src/test/.../conversation/ConversationRepositoryTest.kt` | 6 | **PASSED** |
| `UserPreferencesTest` | `app/src/test/.../preferences/UserPreferencesTest.kt` | 5 | **PASSED** |
| `LiveProtocolTest` | `app/src/test/.../live/LiveProtocolTest.kt` | 5 | **PASSED** |
| `TurnDetectorTest` | `app/src/test/.../audio/TurnDetectorTest.kt` | 4 | **PASSED** |
| `ChatModelsTest` | `app/src/test/.../chat/ChatModelsTest.kt` | 4 | **PASSED** |

---

## 3. Real Device QA History (Samsung Galaxy A55 5G)

### M0 Voice Feasibility QA Matrix (2026-10-27)
- **Microphone Hardware AEC & Audio Routing**: `AudioRecord` with `VOICE_COMMUNICATION`, loudspeaker output via `AudioTrack` with jitter buffer. **PASSED**.
- **Gemini Live WebSocket**: Bidirectional streaming, TTFA ~490–970ms, instantaneous client-side barge-in. **PASSED**.

### M1 Android App Foundation QA Matrix (2026-10-27)
- **Compose Navigation & Bento Grid**: WCAG AA compliance, responsive tap targets, honest empty states. **PASSED**.
- **Gemini 2.5 Flash Chat Room**: Streaming and markdown rendering with IME soft keyboard insets. **PASSED**.
- **DataStore Preferences**: Theme mode, UI language, and AI voice model persisted across process restarts. **PASSED**.

### M2 Unified Voice + Chat QA Matrix (2026-10-27)
- **Collapsible In-Call Transcript Sheet**: 3-state sheet (`HIDDEN`, `PEEK`, `EXPANDED`) transitioning with zero audio interruption. **PASSED**.
- **In-Call Text Input Bar**: Dual-modality text injection over live WebSocket without socket teardown. **PASSED**.
- **Active Call Banner & Re-entry**: Background audio persistence when navigating to Home and returning. **PASSED**.

### M3 Tutor & Correction Engine QA Matrix (2026-10-27)
- **Asynchronous Dual-Engine**: Gemini 2.5 Flash correction parser evaluating completed turns without audio stutter. **PASSED**.
- **Structured Written Feedback Cards**: `TutorCorrectionCard` with error category, strikethrough, and Indonesian explanation. **PASSED**.

### M4 Dynamic Learning Modes QA Matrix (2026-10-27)
- **Mode Switching Engine**: Two-tier intent routing distinguishing persistent mode changes from temporary questions. **PASSED**.
- **Interactive Exercise Flow**: `ExerciseProgressCard` with skip/repeat/stop actions and seamless resumption. **PASSED**.

### M4.5 Vocabulary Flashcards QA Matrix (2026-10-27)
- **3,000 Word Curated Dataset**: Pre-enriched JSON asset loaded into SQLite/Room with zero network calls. **PASSED**.
- **Option A Deck Scheduler**: Seed 42 deterministic shuffle, active recall front-face reset, skip queue. **PASSED**.
- **3D Y-Axis Flip & Audio TTS**: Native Android TTS pronunciation with call audio safety guard. **PASSED**.

### M5 Local History, Learning Memory & Session Summaries QA Matrix (2026-10-28)
- **Room V1->V2 Migration (`MIGRATION_1_2`)**: Upgraded database schema preserving all 3,000 flashcards and user progress. **PASSED**.
- **Turn Persistence & Audio Decoupling**: Turns persisted to Room on `Dispatchers.IO` without audio thread stutter. **PASSED**.
- **Grounded Deterministic Summaries**: Topic extraction, grammar highlights, and practice recommendations synthesized 100% offline. **PASSED**.
- **Session Detail Screen**: Read-only historical turn inspection, expandable correction cards, and cascade deletion dialogs. **PASSED**.
- **UI Polish & Cleanliness**: Deprecated M0 diagnostics removed from Settings, chart button removed from Home top bar, logo border removed in Chat with Buddy, and flashcard Bento subtitle updated. **PASSED**.

---

## 4. Verification Targets for Milestone 06 (M6)
1. **Frame Rate Profiling**: Profile 60fps consistency during complex Compose transitions (3D card flip, mascot animations, transcript sheet expansion).
2. **Haptic Feedback Verification**: Test light haptic feedback on card flip and voice button press across supported Android devices.
3. **Accessibility / Reduced Motion**: Verify that users with system-level reduced motion settings experience instant transitions without jarring effects.
4. **Release APK & Proguard/R8**: Build signed release APK (`assembleRelease`), verify that Room DAOs and KotlinX serialization models survive minification and code shrinking.
