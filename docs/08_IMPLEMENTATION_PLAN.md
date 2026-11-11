# Implementation Roadmap for Antigravity Agent

## M0 — Voice API feasibility (STATUS: COMPLETED & PASSED — 2026-10-27)
- **Delivered**: Working bidirectional voice call proof of concept on physical Samsung phone (`RRCX408EXYZ`); direct WebSocket streaming with `models/gemini-3.8-live`; 16kHz PCM mic capture with hardware AEC; 24kHz PCM speakerphone output with ~100ms jitter buffer; strictly sequential FIFO frame queue; turn-based transcript accumulator; instant barge-in; verified bilingual ID/EN conversation.
- **Latency measured**: Connection ~330ms, TTFA ~490–970ms.
- **Gate**: PASSED on physical device.

---

## M1 — Android app foundation (STATUS: COMPLETED & PASSED — 2026-10-27)
- **Delivered**:
  1. **Clean MVVM Architecture**: Separated business logic into `LiveSessionViewModel`, `ChatViewModel`, and `SettingsViewModel`, isolated from UI activities.
  2. **Navigation Compose**: Configured `AiBuddyNavGraph` with 5 routes: `Home`, `Conversation`, `Chat`, `Settings`, and `DiagnosticM0`.
  3. **Bento Grid Dashboard**: High-contrast, WCAG AA compliant home dashboard with status indicator, honest empty states, and responsive tap targets (>= 48dp).
  4. **Dedicated English Tutor Chat Room**: Integrated Gemini 2.5 Flash via `GeminiChatClient` and `ChatScreen` with suggestion chips, typing indicator, auto-scrolling history, and Android 14/15 keyboard IME padding.
  5. **Procedural Chromatic Cat Mascot**: `ChromaticCatCharacter` on Canvas with live audio amplitude reactivity and zero per-frame heap allocations.
  6. **Ambient Radial Gradient Background**: `RadialGradientBackground.kt` translating Tailwind CSS radial gradients into native Compose via `drawBehind`, using the brand palette (`#09090B` & `#C9B6FF`).
  7. **Local Settings via DataStore**: `UserPreferencesRepository` persisting theme mode, language, voice, and user name.
  8. **Automated Unit Testing**: `UserPreferencesTest`, `LiveProtocolTest`, and `ChatModelsTest` passing 100%.
- **Gate**: PASSED on physical device (`RRCX408EXYZ`). Unlocks M2.

---

## M2 — Unified Voice + Chat (STATUS: COMPLETED & PASSED — 2026-10-27)
- **Delivered**:
  1. **Shared Conversation Context**: Implemented `ConversationRepository` linking voice turns from `LiveSessionViewModel` and text turns from `ChatViewModel`, allowing seamless cross-modality context sharing with Gemini Flash.
  2. **Collapsible In-Call Transcript Sheet**: Replaced binary expansion with a 3-state sheet (`HIDDEN`, `PEEK`, `EXPANDED`) on `ConversationScreen`. Transitioning between states causes zero audio playback disruption or WebSocket disconnects.
  3. **In-Call Text Input Bar**: Created `InCallTextInputBar` with IME insets (`.imePadding()`) and dispatching `LiveClientContentMessage` over the active Gemini Live WebSocket. Received live spoken audio (TTFA ~981ms) and streamed transcripts in-session.
  4. **Turn Finalization & Streaming Integrity**: Added `isFinal` to `LiveTranscriptEntry`. Streaming partial tokens accumulate in-place; turns finalize cleanly upon turn completion, interruption, or barge-in with no duplicate bubbles.
  5. **Active Session Status Indicator**: Built active call banner on `HomeScreen` enabling immediate re-entry while live audio capture and playback continue uninterrupted in the background. Clean WebSocket code 1000 closure upon explicit hang-up.
  6. **Automated Unit Tests**: Added unit tests in `ConversationRepositoryTest` and `LiveProtocolTest` verifying turn limits, listener notification, JSON serialization, and transcript state. (24/24 tests passed).
- **Gate**: PASSED on physical Samsung Galaxy A55 (`RRCX408EXYZ`). Switching between voice and chat modes, toggling transcript sheet states, sending in-call text, and navigating screens operates with 0 crashes, 0 audio dropouts, and rock-solid 60fps performance. Unlocks M3.

---

## M3 - Tutor correction & bilingual behavior (STATUS: COMPLETED & PASSED - 2026-10-27)
- **Delivered**: Asynchronous Dual-Engine architecture (Gemini 3.8 Live conversational audio flow + Gemini 2.5 Flash `TutorCorrectionEngine`); turn-end selective hybrid corrections; structured written feedback cards (`TutorCorrectionCard`) with Indonesian grammar explanation, spoken note, and strikethrough error visualization; negative case handling; zero audio latency disruption.
- **Gate**: PASSED on physical Samsung Galaxy A55 (`RRCX408EXYZ`). Unlocks M4.

---

## M4 - Skill switching (STATUS: COMPLETED & PASSED - 2026-10-27)
- **Delivered**: 4 core learning modes (`FREE_CONVERSATION`, `VOCABULARY`, `GRAMMAR`, `ROLEPLAY`); two-tier intent routing engine (`ModeRouter`) handling natural Indonesian and English commands; temporary questions distinguished from persistent mode switches; exercise progress tracking with interactive card (`ExerciseProgressCard`) offering skip/repeat/finish actions; exercise resumption; in-call WebSocket steering directives without audio interruption; dynamic chat prompts; accessible mode badge chip (`ModeBadgeChip`) and mode selection dialog.
- **Gate**: PASSED on physical Samsung Galaxy A55 (`RRCX408EXYZ`). 39/39 automated unit tests passing. Unlocks M5.


---

## M5 — Local history & learning summaries (STATUS: COMPLETED & PASSED — 2026-10-28)
- **Delivered**:
  1. **Room Database V2 Architecture**: Upgraded `FlueloDatabase` from v1 to v2 with explicit `MIGRATION_1_2`. Added `conversation_sessions`, `conversation_messages`, `structured_corrections`, `session_summaries`, and `learning_memory_signals` with cascading foreign keys and indexes. 100% preservation of M4.5 3,000 flashcards, progress, and queue.
  2. **Session History Repository**: Centralized `SessionHistoryRepository` encapsulating turn persistence, correction linking, and deterministic summary generation on `Dispatchers.IO` without audio thread blocking.
  3. **Grounded Deterministic Learning Summaries**: `SessionSummaryGenerator` synthesizing discussed topics, grammar highlights, vocabulary practiced, and suggested focus areas strictly from actual session data. 100% offline-ready, zero API cost.
  4. **Transparent Learning Memory**: `LearningMemoryRepository` tracking genuine grammar error category frequencies and vocabulary review needs without fabricating unmeasured fluency or pronunciation metrics.
  5. **Session Detail Inspection Screen**: `SessionDetailScreen` with full scrollable transcript, expandable `TutorCorrectionCard` attachments, learning summary card, and explicit deletion confirmation dialogs.
  6. **Automated Unit Testing**: 53 unit tests passing (100% success across 9 test suites).
- **Gate**: PASSED on physical Samsung Galaxy A55 5G (`RRCX408EXYZ`). Unlocks M6.

---

## M6 — Premium UX motion, polish and release APK
- **Deliver**: Reference-faithful polish, micro-animations, touch feedback, haptics, accessibility/reduced-motion option, release signed APK build.
- **Gate**: Physical phone frame/audio profiling, happy-path and error-path manual tests, functional signed APK, documented remaining issues.

---

## Per-task definition of done
- Implemented and compiles cleanly via `gradlew assembleDebug`.
- Unit tests executed and passing via `gradlew testDebugUnitTest`.
- Verified on real physical Android device via `adb install -r`.
- No secrets, data loss, uncontrolled cost, or unsafe reconnection loops.
- Updated `docs/01_DECISIONS.md` and `docs/11_EXPERIMENT_LOG.md`.
