# Handoff Report: Milestone 03 -> Milestone 04

## 1. Executive Summary
Milestone 03 (**Tutor & Correction Engine**) is fully implemented, verified, and operational on the physical **Samsung Galaxy A55 5G (`RRCX408EXYZ`)**.

The app now features an asynchronous **Dual-Engine Architecture**:
- **Gemini 3.8 Live (`gemini-3.8-live` over WebSocket)**: Real-time, low-latency conversational audio flow without mid-sentence interruptions. Calibrated to deliver at most one brief spoken tip at turn end when helpful.
- **Gemini 2.5 Flash (`TutorCorrectionEngine`)**: Asynchronous linguistic analyzer querying structured JSON via `response_mime_type: "application/json"`. Returns structured `TutorFeedback` completely off the audio critical path.
- **UI (`TutorCorrectionCard.kt`)**: Displays structured feedback with category badge (`💡 Tips Tutor (Tenses)`), strikethrough original error, bold Neon Lime correction, and tap-to-expand bilingual Indonesian grammar explanation + spoken note. Integrated in both `ConversationScreen` (Voice transcript sheet) and `ChatScreen` (Text room).

---

## 2. Verified Deliverables & Artifacts
| Deliverable | Implementation File | Verification Status |
|---|---|---|
| Feedback Data Models | `com.aibuddy.data.tutor.TutorFeedback` | Verified via Unit Tests & Device |
| Asynchronous Tutor Engine | `com.aibuddy.data.tutor.TutorCorrectionEngine` | Verified via Gemini Flash API & JSON schema |
| Structured Feedback Card | `com.aibuddy.ui.components.TutorCorrectionCard` | Verified on Galaxy A55 (`m3_card_expanded_success.png`) |
| Shared State & Correlation | `com.aibuddy.data.repository.ConversationRepository` | Verified (`attachFeedback`, StateFlow map) |
| Voice Room Integration | `com.aibuddy.ui.conversation.ConversationScreen` | Verified in transcript sheet (PEEK & EXPANDED) |
| Text Chat Room Integration | `com.aibuddy.ui.chat.ChatScreen` | Verified on Galaxy A55 (`m3_chat_full_view.png`) |
| Negative Case Handling | System prompt rules in `TutorCorrectionEngine` | Verified (`needsCorrection: false`, `m3_negative_test.png`) |
| Automated Unit Tests | `TutorCorrectionEngineTest`, `ConversationRepositoryTest` | 100% Passed (`testDebugUnitTest` 24 tasks) |

---

## 3. Key Architectural Decisions (M3)
1. **Audio Isolation**: Gemini Live audio modality (`responseModalities: ["AUDIO"]`) cannot return structured JSON without speaking raw characters. The dual-engine separation isolates linguistic JSON analysis to Gemini Flash in background coroutines, preserving zero audio stutter and sub-second latency.
2. **Turn Finalization Gating**: Analysis is triggered only when a user turn is marked `isFinal = true` (via server-side turnComplete, speaker turn transition, or text send), avoiding premature triggers on partial streaming tokens.
3. **Anti-Slop Adherence**: No em dashes (`—`) are emitted in tutor explanations or UI copy. High contrast (`NeonLime` on dark background) exceeds WCAG AA (> 4.5:1).

---

## 4. Scope for Milestone 04 (Next Step)
According to `docs/08_IMPLEMENTATION_PLAN.md` and `docs/03_AI_BEHAVIOR.md`:
- **Modes**:
  1. `FREE_CONVERSATION` (default friendly bilingual buddy).
  2. `VOCABULARY` (deep-dives into word nuances, synonyms, collocations).
  3. `GRAMMAR` (targeted exercises, drills, structured explanations).
  4. `ROLEPLAY` (situational practice, e.g. ordering coffee, job interview, hotel check-in).
- **Natural Language Mode Switching**:
  - Detect intent from user speech/text (e.g., *"Bisa kita latihan roleplay pesan kopi di cafe?"* or *"Buddy, aku mau belajar kosakata kerja"*).
  - Distinguish temporary questions (e.g., *"Apa beda make dan do?"*) from persistent mode shifts.
- **Active Mode Indicator**:
  - Surface active mode badge in UI without cluttering the screen.
