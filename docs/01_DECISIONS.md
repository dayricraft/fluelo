# Approved Decisions and Guardrails

As of 2026-10-26, approved in product discussion:

| Decision | Current status |
|---|---|
| Target | Personal-use **Android** application (no iOS/web scope) |
| Implementation | Kotlin + Jetpack Compose; Android native |
| UX | Unified voice + chat; transcript optional and collapsible; one shared conversation |
| Primary identity | A single chromatic-black-cat AI character |
| Core language | Indonesian + English; seamless code-switching |
| Feedback | Tutor mode, **after speaking**, selective **hybrid** (brief voice plus written detail) |
| Mode activation | Via natural voice requests; keep same persona and topic context |
| Modes for MVP | Conversation, Vocabulary, Grammar, Roleplay |
| Local data | Conversation history, corrections, preferences; no raw audio by default |
| Visual | Dark minimal, playful, premium; neon lime + violet/pink secondary |
| Motion | Playful / Fluid / Alive; functional microinteractions; prioritize audio responsiveness |
| Deployment | APK for personal phone; no store release required in MVP |
| Coding workflow | Antigravity/VS Code agent performs all implementation, builds, tests |

## Intentionally undecided (delegate verification / obtain approval)
- Live voice API model/SDK and secure auth method. Gemini Live is a candidate, not a guaranteed working implementation.
- Free usage limits, quota, billing and privacy characteristics: verify against official current documentation before enabling API.
- Exact audio buffering, VAD/turn-detection configuration, reconnection design and thresholds: measure on physical Android hardware.
- Package namespace, minSdk/targetSdk and dependency versions: propose current supported values and reasons during M0.
- Whether a small token broker/backend is unavoidable: do not add one by assumption.
- Whether app supports offline use: NOT an MVP requirement; UI must communicate online dependency.

## No scope creep
- No web page, no iOS, no image-search feature from visual reference, no separate chat-bot persona, no user-account backend, no gamification system, no pronunciation score presented as objective without a validated assessment method.

## Decision update protocol
When a new decision is approved, append date + rationale + owner approval + effects on plans/tests here. Do not silently replace approved defaults.

### 2026-10-27 — M0 Technical Decisions (Owner Approved & Verified)
- **Voice AI Model & Transport**: Approved direct WebSocket via `okhttp3:okhttp` to `models/gemini-3.8-live` (`BidiGenerateContent`). Avoids premature Firebase backend overhead while guaranteeing exact low-latency bidirectional PCM streaming and interruption handling.
- **WebSocket Protocol**: Google Gemini Live sends responses as Binary Frames (Opcode: 2). Handled via `WebSocketListener.onMessage(ws, bytes: okio.ByteString)`.
- **Wire Contract**: Stream microphone chunks using `realtimeInput.audio` (16kHz 16-bit mono PCM). Send `realtimeInput.audioStreamEnd: true` upon VAD silence to mark turn completion and trigger Gemini response.
- **Audio Routing**: Configured `AudioManager.MODE_IN_COMMUNICATION` with `AudioDeviceInfo.TYPE_BUILTIN_SPEAKER` (`setCommunicationDevice` on Android 12+, fallback to `isSpeakerphoneOn`) so audio plays through loud speakerphone rather than call earpiece.
- **Strictly Ordered FIFO Message Ingestion**: WebSocket messages routed into a Kotlin `Channel<String>(Channel.UNLIMITED)` consumed by a single dedicated coroutine reader. Prevents out-of-order execution that previously occurred when launching uncoordinated coroutines on `Dispatchers.Default`.
- **Jitter Buffer & Pre-buffering**: Added ~100ms (4,800 bytes) pre-buffering in `AudioPlaybackService` before calling `AudioTrack.play()`, eliminating buffer underruns and cracking/popping.
- **Acoustic Echo Handling & Barge-In**: Removed raw mic RMS self-interruption during `BUDDY_SPEAKING` to prevent the phone loudspeaker from interrupting its own speech. Interruption is handled via Gemini Live server-side VAD (`content.interrupted == true`) and explicit manual barge-in button.
- **Turn-based Transcript Accumulation**: Streaming text tokens are accumulated into the active conversational bubble (`appendTranscript`), emitting a single unified bubble per speaker turn rather than fragmenting token-by-token.
- **Credential Storage**: API key configured via git-ignored `android-project/local.properties` (`GEMINI_API_KEY=...`) and exposed via Gradle `BuildConfig.GEMINI_API_KEY`. Never hardcoded or committed.
- **Build & Platform Versions**: `compileSdk = 35`, `targetSdk = 35`, `minSdk = 26`, Kotlin 2.0.21, Jetpack Compose BOM 2024.10.01, AGP 8.6.1, Gradle 8.10.2, Microsoft OpenJDK 17.
- **Initial Voice Profile**: Prebuilt voice `Puck` configured in Gemini Live setup.

### 2026-10-27 — M1 Architectural Decisions (Foundation & Clean MVVM)
- **MVVM Domain Isolation**: Encapsulated `GeminiLiveClient`, `AudioCaptureService`, and `AudioPlaybackService` inside `LiveSessionRepository`. UI layer only observes reactive StateFlows from `LiveSessionViewModel`.
- **Compose Navigation Architecture**: Integrated `androidx.navigation:navigation-compose` (`2.8.3`). Routes structured as `Home` (Bento dashboard), `Conversation` (live call with mascot & transcript), `Settings` (preferences), and `DiagnosticM0` (preserved M0 latency & audio test screen).
- **Persistent Preferences via Jetpack DataStore**: Integrated `androidx.datastore:datastore-preferences` (`1.1.1`) inside `UserPreferencesRepository` to persist appearance theme (`DARK`, `LIGHT`, `SYSTEM`), UI language (`ID`, `EN`), AI voice model, and username.
- **Brand Aesthetic & Anti-Slop Compliance**: Built Bento Grid layout using approved chromatic dark palette (`#09090B`, `#17171B`, `#C8F53B`, `#C9B6FF`), high contrast (> 4.5:1 WCAG AA), 48dp+ tap targets, procedural canvas `ChromaticCatCharacter` without per-frame allocations, and honest empty states (no fake numbers, mock charts, or fictional avatars).
- **Automated Unit Testing**: Configured JUnit 4 (`4.13.2`) and Kotlinx Coroutines Test (`1.9.0`) in Gradle. Verified `UserPreferencesTest` and `LiveProtocolTest` via `testDebugUnitTest`.
### 2026-10-27 — Dedicated English Tutor Chat Room (Bento Card Separation)
- **Problem**: Both Bento Grid cards ("Talk with Buddy" and "Chat with Buddy") on the Home screen routed to the same voice call room, creating redundancy and confusion.
- **Decision (User Approved)**: Split the two cards into two distinct modalities:
  1. **"Talk with Buddy" (Neon Lime Bento)**: Remains the low-latency Gemini 3.8 Live bidirectional voice call room with live mascot & transcript.
  2. **"Chat with Buddy" (Soft Purple Bento)**: Dedicated text-based Chat Room powered by Gemini Flash (`gemini-2.5-flash`), tailored as a bilingual English tutor (Buddy persona).
- **English Tutor Chat Architecture**:
  - `GeminiChatClient`: Directly queries Gemini Flash `generateContent` with conversational multi-turn history and system instructions (bilingual English tutor explaining grammar, providing friendly corrections with "💡 Quick Tip", and engaging in conversation).
  - `ChatViewModel`: Reactive MVVM managing message list, typing states, and error handling.
  - `ChatScreen`: Clean Jetpack Compose chat room with suggestion chips for common grammar queries ("Beda in/on/at", "Koreksi kalimat saya"), auto-scrolling message list, Buddy chromatic badge, and IME padding support (`.imePadding()`).

### 2026-10-27 — Ambient Radial Gradient Background (Tailwind -> Jetpack Compose)
- **Rationale**: User requested porting the popular dark-mode spotlight radial gradient (`radial-gradient(125% 125% at 50% 10%, #000 40%, #glow 100%)`) into both Roomtalk (`ConversationScreen`) and Roomchat (`ChatScreen`).
- **Implementation**:
  - Created `RadialGradientBackground.kt` using `Modifier.drawBehind` with `Brush.radialGradient` (zero composition allocation).
  - Used project brand colors (`BackgroundDark` #09090B with `SoftPurple` ambient glow lerped at 48% strength), preserving high contrast and dark mode aesthetics while completely avoiding arbitrary CSS values.
  - Tuned radius (`0.88f * height`) to account for mobile portrait aspect ratios, ensuring atmospheric glow rises naturally from the bottom half of the screen.

### 2026-10-27 — M2 Technical Decisions: Unified Voice + Chat (Owner Approved & Verified)
- **Shared In-Memory Conversation Repository**: Created `ConversationRepository` as a singleton in-memory repository to hold the bounded canonical sequence of turns (`ConversationTurn`) across both voice calls (`ConversationScreen`) and text chats (`ChatScreen`).
- **3-State Collapsible Transcript Sheet**: Replaced binary show/hide with a 3-state sheet (`HIDDEN`, `PEEK`, `EXPANDED`). Transitioning between states causes zero audio playback disruption or WebSocket reconnects because audio and UI states are fully decoupled.
- **In-Call Text Ingestion over Gemini Live WebSocket**: Extended `GeminiLiveClient` to serialize and dispatch `LiveClientContentMessage` (`turns` containing `LiveTextPart` with `role: "user"`) directly over the active Live WebSocket. Gemini Live responds with both audio playback chunks (TTFA ~981ms) and streamed output transcript text within the existing continuous session.
- **Transcript Turn Finalization**: Distinguished partial streaming tokens (`isFinal = false`) from completed turns (`isFinal = true`) on `content.turnComplete`, `content.interrupted`, and manual barge-in, preventing duplicate turns or ghost bubbles.
- **Active Call Awareness Across Screens**: Added an active call banner on `HomeScreen` (`"Voice Call in Progress • Tap to return to conversation"`). Users can freely navigate to Home or ChatScreen while live audio capture and playback continue seamlessly in the background. Explicitly tapping "End Call" executes a graceful WebSocket close (Code 1000).
- **Cross-Modality AI Context Sharing**: `ChatViewModel` automatically injects recent conversation turns from `ConversationRepository` into Gemini Flash's prompt context, allowing the text tutor to reference topics spoken during voice calls.

### 2026-10-27 — M3 Technical Decisions: Tutor & Correction Engine (Owner Approved & Verified)
- **Dual-Engine Asynchronous Coordination (Gemini Live + Gemini Flash)**:
  - Gemini Live (`gemini-3.8-live` over WebSocket) is constrained to audio output when `responseModalities: ["AUDIO"]` is set. Attempting to emit structured JSON causes Gemini Live to speak raw JSON characters over the speaker.
  - To achieve both low-latency spoken natural dialogue and high-quality structured feedback cards, implemented a dual-engine architecture:
    1. **Gemini Live (Voice Engine)**: Calibrated via system instruction to maintain persona, keep spoken dialogue conversational (1-2 sentences), and offer at most one brief spoken tip at turn-end (e.g., *"Nice! Small tip: say 'I went', not 'I go'. What did you buy?"*). Never interrupts mid-utterance.
    2. **Gemini Flash (Tutor Engine via `TutorCorrectionEngine`)**: Concurrently triggered asynchronously in background coroutines when a user turn is finalized (`isFinal == true`). Queries `models/gemini-2.5-flash:generateContent` with JSON schema enforcement (`response_mime_type: "application/json"`, temperature 0.2f), returning structured `TutorFeedback?` completely off the audio critical path.
- **Tutor Feedback Data Model (`TutorFeedback`)**:
  - Encapsulates `turnId`, `originalText`, `correctedText`, `explanation` (in Indonesian), `category` (`TENSE`, `PREPOSITION`, `SUBJECT_VERB_AGREEMENT`, `VOCABULARY`, `NATURAL_PHRASING`, `GRAMMAR`, `GENERAL`), `severity` (`MINOR`, `MODERATE`, `MAJOR`), and `spokenNote`.
  - Negative detection rules built into system prompt: returns `needsCorrection: false` when user speaks Indonesian, uses natural code-switching ("Aku tadi lunch sama teman"), asks direct grammar questions, or uses correct English.
- **Expandable Structured Feedback UI (`TutorCorrectionCard`)**:
  - Integrated directly below user utterance bubbles in both `ConversationScreen` (transcript sheet in PEEK and EXPANDED modes) and `ChatScreen`.
  - Visual hierarchy:
    - Top badge: Category pill with lightbulb icon (`💡 Tips Tutor (Tenses)`).
    - Compact summary: Strikethrough original text (`~~Yesterday I go to market~~`) + Bold corrected text in `NeonLime` (`#C8F53B`).
    - Expandable detail: Tap or chevron triggers animated expansion (`AnimatedVisibility`) revealing detailed Indonesian grammar explanation and `Catatan Suara` container.
- **Zero Audio Latency Impact**: Because linguistic analysis is dispatched asynchronously off the UI and audio threads, voice TTFA and audio playback maintain zero stutter, zero delay, and zero interruption.

### 2026-10-27 - M4 Technical Decisions: Dynamic Skills & Mode Switching (Owner Approved & Verified)
- **Decision 010: Master Prompt + In-Call WebSocket Steering for Gemini Live**:
  - Gemini Live (`gemini-3.8-live` over WebSocket) does not support dynamic modification of `setup.systemInstruction` on an open bidirectional stream without closing and reconnecting the socket.
  - Reconnecting the socket introduces 300-500ms audio dropouts, flushes jitter buffers, and discards conversational turn context.
  - Approved Solution: Define a unified modular system instruction in [BuddyPrompts.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/prompt/BuddyPrompts.kt) (`MASTER_LIVE_SYSTEM_INSTRUCTION`) loaded once during WebSocket setup. This instruction equips Buddy with all 4 learning modalities simultaneously.
  - When learning mode changes or an exercise begins, dispatch a silent in-call steering directive (`sendSystemSteeringMessage`) over the active WebSocket. Gemini Live seamlessly adapts its behavior on the very next turn with zero audio interruption and zero context loss.
- **Decision 011: Multi-Dimensional Orthogonal Session State Architecture**:
  - Structured session state in [ExerciseState.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/mode/ExerciseState.kt) (`SessionModeState`) with independent, orthogonal dimensions:
    1. `activeMode`: `FREE_CONVERSATION`, `VOCABULARY`, `GRAMMAR`, `ROLEPLAY`.
    2. `correctionPolicy`: `GENTLE`, `INTENSIVE`, `OFF`.
    3. `languagePreference`: `BILINGUAL`, `INDONESIAN_ONLY`, `ENGLISH_ONLY`.
    4. `activeExercise`: Active exercise progress or null.
    5. `pausedExercise`: Cached resumable exercise state when temporarily paused or interrupted.
  - Guarantee: Changing learning modes never resets `correctionPolicy` or `languagePreference`. Similarly, requesting "jangan koreksi grammar dulu" switches `correctionPolicy = OFF` without erasing active exercise progress.
- **Decision 012: Two-Tier Intent Routing (Zero-Cost Deterministic Rules + LLM Fallback)**:
  - Natural language mode switching is evaluated locally using [ModeRouter.kt](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/domain/router/ModeRouter.kt) with compiled regex patterns across colloquial Indonesian, formal Indonesian, English, and mixed-language inputs.
  - Execution runs on-device in < 1ms with zero network calls and zero quota consumption.
  - Accurately differentiates persistent mode shifts ("sekarang kita latihan vocab", "ajarin present perfect tense") from temporary questions ("apa bedanya improve sama increase?") which must answer directly without altering the active mode or clearing exercises.
  - Supports natural exercise controls ("lewati"/"skip", "ulangi"/"repeat", "selesai"/"stop") and exercise resumption ("balik ke latihan tadi").

### 2026-10-28 — M5 Technical Decisions: Local History, Learning Memory & Session Summaries (Owner Approved & Verified)
- **Decision 013: Non-Destructive Room Migration (V1 -> V2)**:
  - Upgraded canonical Room database `FlueloDatabase` from `version = 1` to `version = 2`.
  - Implemented explicit SQLite migration `MIGRATION_1_2` creating `conversation_sessions`, `conversation_messages`, `structured_corrections`, `session_summaries`, and `learning_memory_signals` with cascading foreign keys and indexes.
  - Zero disruption or data loss for M4.5 vocabulary entries (3,000 words), user bookmarks, or queue order ranks. Verified on device.
- **Decision 014: Zero-Latency Audio-Isolated Turn Persistence**:
  - Live voice audio streams and text turns are collected in-memory for instant 60fps UI rendering and sub-second speech turnaround.
  - As turns finalize (`isFinal == true`), persistence to `conversation_messages` and `structured_corrections` is dispatched asynchronously on `Dispatchers.IO`, fully decoupled from `AudioPlaybackService` and `AudioCaptureService`.
- **Decision 015: Grounded Deterministic Offline Session Summaries**:
  - `SessionSummaryGenerator` extracts discussed topics, grammar correction highlights, vocabulary practiced, and recommended focus areas entirely from actual session records on-device.
  - Zero external LLM calls for summaries: 100% offline-ready, 0ms network latency, zero quota consumption, and zero hallucination of learning achievements or unmeasured pronunciation scores.
- **Decision 016: Dedicated Session Detail Inspection**:
  - Split active conversation resumption from historical session review.
  - Tapping a past session card in `HomeScreen` navigates to `SessionDetailScreen`, rendering the complete historical transcript, grounded summary card, and expandable `TutorCorrectionCard` components without starting an active audio call.
  - Provided explicit user confirmation dialogs before deleting single sessions or clearing all session history.



- **Decision 017: UI Polish, M0 Diagnostic Retirement & Header Cleanliness**:
  - Deprecated and removed the "Diagnostics & Technical Tests" section from `SettingsScreen` and the M0 analytics/chart button from `HomeScreen` top bar. M0 feasibility instruments served their purpose during prototype testing and are now replaced by honest session history.
  - Replaced the circular-bordered `BuddyAvatar` in `ChatScreen`'s top bar with the raw, clean `ic_app_logo` `Image` vector, matching `HomeScreen`.
  - Streamlined `ChatScreen` header text to title `"Chat with Buddy"` and subtitle `"Gemini Flash"` (removing the redundant mode suffix).
  - Restricted the `ModeBadgeChip` to the live voice `ConversationScreen` exclusively, removing it from `ChatScreen` top bar for a minimalist, uncluttered chat interface.
  - Updated the Vocabulary Flashcards Bento Card subtitle on `HomeScreen` to `"Explore & Review many words"`.

### 2026-10-28 — M6 Technical Decisions: Final UX Polish, Performance, Reliability & Android Release (Owner Approved & Verified)
- **Decision 018: Performance Allocation Optimization in Chromatic Cat Mascot**:
  - Identified and eliminated per-frame heap churn in `ChromaticCatCharacter.kt` that was creating ~300–600 objects per second during live calls due to allocating `Path()`, `Paint()`, and `BlurMaskFilter()` inside `drawIntoCanvas` every frame.
  - Pre-allocated and cached outer glow `Path`, ear paths, static `BlurMaskFilter(NORMAL, 26f)`, and cached `SweepGradient`.
  - Result: Eliminated garbage collector jank during live audio sessions; frame jank on physical Samsung Galaxy A55 5G dropped to 1.15% (98.85% smooth frames, 50th percentile 14ms).
- **Decision 019: Accessible Motion Tokens & Tactile Haptic System**:
  - Implemented user preferences for `reducedMotion` (default `false`) and `hapticFeedbackEnabled` (default `true`) stored in Jetpack DataStore and exposed in `SettingsScreen` under Section 4 "Interaksi & Aksesibilitas".
  - Screen transitions in `AiBuddyNavGraph` use purposeful horizontal slide (`FastOutSlowInEasing`, 280ms) + fade (200ms) by default, but seamlessly degrade to instant subtle fade (`tween(120)`) when `reducedMotion` is enabled.
  - Interactive tactile press scales (`0.975f` on Bento cards, `0.94f` on primary Call button) and subtle haptic clicks on flashcard flip, swipe throw, bookmark toggle, and message send.
- **Decision 020: Accessibility & Deprecation Standards Enforcement**:
  - Increased `TutorCorrectionCard` expand icon button touch target to 44dp adhering to WCAG / Android accessibility guidelines.
  - Replaced all deprecated non-mirrored navigation icons with `Icons.AutoMirrored`.
  - Removed deprecated window bar color mutations in `Theme.kt` relying cleanly on Compose edge-to-edge and `WindowCompat`.
  - Set `android:allowBackup="false"` in `AndroidManifest.xml` to protect user conversational privacy and prevent unencrypted cloud backup of local AI chat logs.
- **Decision 021: Signed Android Release Packaging & ProGuard Safeguards**:
  - Configured ProGuard keep rules in `proguard-rules.pro` covering KotlinX `@Serializable` models, Room Database DAOs and entities, and OkHttp WebSocket components.
  - Set `versionName = "1.0.0"` and configured `signingConfigs.debug` for the release build type to generate a signed release APK (`app-release.apk`, 12.65 MB).
  - Verified live installation and runtime execution on Samsung Galaxy A55 5G (`RRCX408EXYZ`) with zero crashes.
