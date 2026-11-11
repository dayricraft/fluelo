# Android Architecture — Actual Implementation (As of Milestone 05)

## 1. High-Level System Architecture
Fluelo (formerly AI Buddy) is a native Android application built in **Kotlin** and **Jetpack Compose** using a single-activity architecture, unidirectional data flow (UDF / MVVM), coroutine-based asynchronous reactive streams (StateFlow), and strict separation of concerns across presentation, domain, audio transport, AI clients, and local persistence.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                  │
│  MainActivity ───► AiBuddyNavGraph ───┬──► HomeScreen (Bento Grid)     │
│                                       ├──► ConversationScreen (Voice)  │
│                                       ├──► ChatScreen (Tutor Text)     │
│                                       ├──► FlashcardScreen (3k Vocab)  │
│                                       ├──► SessionDetailScreen (Detail)│
│                                       └──► SettingsScreen (Prefs)      │
│  Components: ChromaticCat, BentoCard, RadialGradient, TutorCorrectionCard│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ observes StateFlows / dispatches intents
┌───────────────────────────────────▼────────────────────────────────────┐
│                        VIEWMODEL / PRESENTATION                        │
│  LiveSessionViewModel    ChatViewModel    FlashcardVM   SettingsVM     │
└──────────────┬──────────────────┬──────────────┬─────────────┬─────────┘
               │                  │              │             │
┌──────────────▼───────┐ ┌────────▼──────────┐ ┌─▼───────────┐ ┌▼────────┐
│LiveSessionRepository │ │TutorCorrectionEng │ │FlashcardRepo│ │UserPrefs│
│(Voice + Barge-in)    │ │(Gemini 2.5 Flash) │ │(3k Dataset) │ │(Data-   │
└──────────────┬───────┘ └────────┬──────────┘ └─┬───────────┘ │ Store)  │
               │                  │              │             └─────────┘
               │         ┌────────▼──────────────▼───────────┐
               │         │ SessionHistoryRepository          │
               │         │ (Coordinator on Dispatchers.IO)   │
               │         └────────────────┬──────────────────┘
               │                          │
┌──────────────▼───────────┐     ┌────────▼──────────────────────────────┐
│ - AudioCaptureService    │     │ Room Database V2 (FlueloDatabase)     │
│   (16kHz AudioRecord,    │     │ - conversation_sessions               │
│    Hardware AEC, RMS)    │     │ - conversation_messages (Cascade FK)  │
│ - AudioPlaybackService   │     │ - structured_corrections (Cascade FK) │
│   (24kHz AudioTrack,     │     │ - session_summaries (Cascade FK)      │
│    Jitter Buffer, Flush) │     │ - learning_memory_signals             │
│ - GeminiLiveClient       │     │ - vocabulary_entries (3,000 words)    │
│   (WebSocket FIFO Queue) │     │ - vocabulary_progress (seen/bookmark) │
│ - FlashcardTtsManager    │     │ - flashcard_deck_state (Option A)     │
└──────────────┬───────────┘     └───────────────────────────────────────┘
               │
┌──────────────▼─────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE                               │
│  Gemini Live WebSocket (gemini-3.8-live) ── OkHttp REST (gemini-2.5)   │
│  SQLite (Android Room 2.6.1 + KSP) ────── Jetpack DataStore 1.1.1      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Package Organization (`com.aibuddy`)

1. **`audio`** (Native Real-Time Audio Engine)
   - [`AudioConfig.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/audio/AudioConfig.kt): Constants (16kHz in, 24kHz out, 100ms frames, buffer tuning).
   - [`AudioCaptureService.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/audio/AudioCaptureService.kt): Native `AudioRecord` with hardware `VOICE_COMMUNICATION` echo cancellation, RMS amplitude calculations, and turn boundary detection.
   - [`AudioPlaybackService.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/audio/AudioPlaybackService.kt): Native streaming `AudioTrack` with 100ms jitter buffer, loudspeaker routing (`setCommunicationDevice`), and zero-latency `clearAndInterrupt()`.
   - [`FlashcardTtsManager.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/audio/FlashcardTtsManager.kt): Native Android `TextToSpeech` manager for flashcard pronunciation with voice call safety guards.

2. **`live`** (Gemini Live Bidirectional Streaming Client)
   - [`GeminiLiveClient.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/live/GeminiLiveClient.kt): Stateful OkHttp WebSocket connection to `models/gemini-3.8-live`. Sequential FIFO queue, live transcript accumulator, steering directives, and self-interruption prevention.
   - [`LiveProtocolModels.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/live/LiveProtocolModels.kt): KotlinX serialization models for WebSocket protocol payloads.
   - [`LiveSessionRepository.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/live/LiveSessionRepository.kt): Domain layer orchestrating audio capture, playback, and live streaming under a single repository.

3. **`data.chat`** (Gemini Flash English Tutor Client)
   - [`ChatModels.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/chat/ChatModels.kt): Request/response models for `generateContent` REST API.
   - [`GeminiChatClient.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/chat/GeminiChatClient.kt): HTTP client for `models/gemini-2.5-flash`, managing bilingual tutor prompt and message history.

4. **`data.tutor`** (Tutor & Selective Hybrid Correction Engine)
   - [`TutorCorrectionEngine.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/tutor/TutorCorrectionEngine.kt): Asynchronous secondary engine evaluating user utterances without delaying live voice audio playback.
   - [`TutorFeedback.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/tutor/TutorFeedback.kt): Structured feedback models (error category, severity, original vs corrected, Indonesian explanation, spoken note).

5. **`data.mode` & `domain.router`** (Dynamic Skills & Intent Routing)
   - [`LearningMode.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/mode/LearningMode.kt): 4 core modes: `FREE_CONVERSATION`, `VOCABULARY`, `GRAMMAR`, `ROLEPLAY`.
   - [`ExerciseState.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/mode/ExerciseState.kt): Multi-dimensional orthogonal state (active mode, correction policy, language preference, active/paused exercise).
   - [`ModeRouter.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/domain/router/ModeRouter.kt): Two-tier zero-cost deterministic intent router handling natural Indonesian and English switching.

6. **`data.flashcard`** (Curated Vocabulary Flashcards — M4.5)
   - Entities: `VocabularyEntry` (3,000 words), `VocabularyProgress` (seen status, bookmarks), `FlashcardDeckState` (Option A queue rank).
   - DAOs: `VocabularyDao`, `FlashcardDeckDao`.
   - [`FlashcardRepository.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/flashcard/FlashcardRepository.kt): Seed 42 deterministic shuffle, Option A queue scheduling, active recall reset invariant, explore vs review mode.

7. **`data.history` & `data.db`** (Local History, Learning Memory & Room V2 — M5)
   - [`FlueloDatabase.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/db/FlueloDatabase.kt): Room DB v2 with explicit `MIGRATION_1_2`.
   - Entities: `ConversationSessionEntity`, `ConversationMessageEntity`, `StructuredCorrectionEntity`, `SessionSummaryEntity`, `LearningMemorySignalEntity`.
   - Composite model: `SessionWithDetails` (`@Embedded` session with `@Relation` messages, corrections, and summary).
   - DAOs: `ConversationSessionDao`, `ConversationMessageDao`, `StructuredCorrectionDao`, `SessionSummaryDao`, `LearningMemoryDao`.
   - [`SessionHistoryRepository.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/history/SessionHistoryRepository.kt): Central coordinator executing DB operations on `Dispatchers.IO`.
   - [`SessionSummaryGenerator.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/history/SessionSummaryGenerator.kt): 100% offline deterministic summary synthesis.
   - [`LearningMemoryRepository.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/data/history/LearningMemoryRepository.kt): Tracking genuine error categories and learning patterns without fake scores.

8. **`ui`** (Presentation & Screens)
   - `home/`: [`HomeScreen.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/home/HomeScreen.kt) (Bento Grid, Practice History list, clear all dialog).
   - `conversation/`: [`ConversationScreen.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/conversation/ConversationScreen.kt) (Live voice call, chromatic mascot, mode badge, drawer transcript).
   - `chat/`: [`ChatScreen.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/chat/ChatScreen.kt) (Streamlined text chat room, clean logo, IME insets, tutor feedback bubbles).
   - `flashcard/`: [`FlashcardScreen.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/flashcard/FlashcardScreen.kt) (Interactive 3D Y-axis flip cards, anti-mirroring, audio TTS, explore/review tabs).
   - `history/`: [`SessionDetailScreen.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/history/SessionDetailScreen.kt) (Read-only historical turn inspection, grounded summary card, inline tutor corrections, single session deletion).
   - `settings/`: [`SettingsScreen.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/settings/SettingsScreen.kt) (Appearance, app language, voice model selector).
   - `navigation/`: [`NavRoutes.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/navigation/NavRoutes.kt), [`AiBuddyNavGraph.kt`](file:///c:/Users/ahmad/Downloads/ai-buddy-android-handoff/ai-buddy-android-handoff/android-project/app/src/main/java/com/aibuddy/ui/navigation/AiBuddyNavGraph.kt).

---

## 3. Dual-Engine AI Integration Architecture

| Channel | Modality | Protocol | Model | Latency | Key Function |
|---|---|---|---|---|---|
| **Roomtalk** | Live Voice | Stateful WebSocket | `models/gemini-3.8-live` | ~500ms TTFA | Real-time spoken English, bidirectional streaming, instant interruption |
| **Roomchat** | Text Chat | Stateless REST (HTTP/2) | `models/gemini-2.5-flash` | ~1.5s TTFT | Deep grammar explanations, vocabulary analysis, sentence corrections |
| **Correction Engine** | Background Analysis | Stateless REST (HTTP/2) | `models/gemini-2.5-flash` | Async | Structured JSON feedback for voice turns without audio playback delay |
| **Summaries Engine** | Local Synthesis | Deterministic On-Device | N/A (100% Offline) | < 5ms | Grounded topic extraction, grammar highlights, review focus recommendations |
| **Flashcard TTS** | Speech Audio | Android Native TTS | US English Engine | Local | Pronunciation audio for 3,000 flashcards with call audio safety guard |

---

## 4. Security & Privacy Guardrails
1. **Secrets**: API Key stored in git-ignored `local.properties` -> Gradle `BuildConfig.GEMINI_API_KEY`. Never committed.
2. **Audio Hardware**: Microphone automatically released on `onPause` lifecycle event.
3. **Data Storage**: User preferences stored locally via Jetpack DataStore; conversation history and flashcards stored locally via Room SQLite database. No third-party analytics SDKs, cloud tracking, or remote database synchronization.
