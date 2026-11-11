# External Technical Dependencies & Uncertainties (As of Milestone 05)

## 1. Resolved Dependencies & Technical Decisions (M0 through M5)

1. **Gemini Live Protocol (M0, M2)**: [VERIFIED & STABLE]
   - `models/gemini-3.8-live` functions via stateful OkHttp WebSocket (`BidiGenerateContent`).
   - 16kHz PCM capture (Hardware AEC) + 24kHz PCM playback with ~100ms jitter buffer.
   - Dual-modality text injection (`realtimeInput.clientContent`) allows silent prompt steering without reconnecting the socket.
2. **Gemini 2.5 Flash API (M1, M3)**: [VERIFIED & STABLE]
   - `models/gemini-2.5-flash` functions via OkHttp REST API (`generateContent`).
   - Powers the text chat room and the asynchronous structured grammar correction engine with sub-2s turnaround.
3. **Dynamic Intent Routing & Learning Modes (M4)**: [VERIFIED & STABLE]
   - Two-tier deterministic routing in `ModeRouter.kt` separates temporary questions from persistent mode changes with zero API cost and < 1ms execution time.
4. **Offline Curated Flashcards (M4.5)**: [VERIFIED & STABLE]
   - Pre-enriched 3,000-word dataset packaged as compressed asset (`fluelo_vocabulary_v1.json`).
   - Option A deterministic queue scheduling (seed 42) with active recall reset invariant and native Android TTS.
5. **Room Database V2 & Non-Destructive Migration (M5)**: [VERIFIED & STABLE]
   - Upgraded Room database from V1 to V2 using manual `MIGRATION_1_2`.
   - Complete preservation of flashcard dataset (3,000 words), progress, and queue state.
   - Foreign key cascading deletes (`ON DELETE CASCADE`) ensure database consistency when sessions are deleted.
6. **Thread Decoupling for Audio & Persistence (M5)**: [VERIFIED & STABLE]
   - All Room writes execute on `Dispatchers.IO`. Zero frame drops or audio stutter during turn finalization.
7. **Grounded Deterministic Summaries & Learning Memory (M5)**: [VERIFIED & STABLE]
   - Offline summarization in `SessionSummaryGenerator.kt` extracts genuine topics, grammar highlights, and practice focus recommendations from session records with zero external API calls and zero hallucinated scores.

---

## 2. Technical Uncertainties & Design Considerations for Milestone 06 (M6)

1. **R8 / Proguard Minification & Code Shrinking**:
   - *Uncertainty*: Enabling `isMinifyEnabled = true` and `isShrinkResources = true` in `build.gradle.kts` can break reflection-based serializers or Room generated code if keep rules are incomplete.
   - *Mitigation Plan*: Inspect and configure `proguard-rules.pro` to preserve:
     - `@Serializable` data classes in `com.aibuddy.live`, `com.aibuddy.data.chat`, `com.aibuddy.data.tutor`.
     - Room entities and DAOs in `com.aibuddy.data.db`, `com.aibuddy.data.flashcard`, `com.aibuddy.data.history`.
     - OkHttp WebSocket internal listeners.
   - *Verification*: Execute `.\gradlew.bat assembleRelease` and install the release APK on the physical Samsung phone to verify end-to-end functionality.

2. **Haptic Feedback Consistency Across Android OEMs**:
   - *Uncertainty*: Hardware haptic vibrators vary significantly between budget and flagship Android devices. Standard `Vibrator` patterns may feel jarring or buzzy on some devices.
   - *Recommendation*: Use `HapticFeedbackType.TextHandleMove` or `VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)` with SDK 29+ checks and `HAPTIC_FEEDBACK_ENABLED` user preference respect.

3. **Accessibility & Reduced Motion Compliance**:
   - *Uncertainty*: Compose transitions (such as 3D card flips or mascot bouncing) may trigger motion sickness for sensitive users if system-level animation scale is set to 0x (`animator_duration_scale`).
   - *Recommendation*: Introduce a graceful motion fall-through: if reduced motion is requested (either via Android System Settings or in-app toggle), replace spring-based multi-frame rotations with instantaneous opacity crossfades.

4. **Extended Audio Session Memory Profiling**:
   - *Uncertainty*: During continuous 30+ minute voice calls, does the accumulation of AudioTrack PCM buffers or WebSocket transcript tokens cause gradual heap growth or memory fragmentation?
   - *Mitigation Plan*: Verify that `LiveSessionRepository` caps in-memory active transcript entries or dumps historical turns to Room V2 database, keeping the active heap flat and predictable.
