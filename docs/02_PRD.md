# Product Requirements Document (MVP)

## Product summary
AI Buddy is a **personal Android voice+chat language companion** for practicing natural English speaking with Indonesian explanations when helpful. The user can speak freely, switch languages, ask unrelated questions, or request a teaching mode by speaking naturally. The companion remains the same entity across modes.

## Jobs to be done
1. Practice speaking with natural response timing and interruption.
2. Ask for explanations in Indonesian without ending the English-learning session.
3. See what was said (transcript) and read corrected grammar/vocabulary.
4. Start or change drills (vocabulary, grammar, roleplay) by voice; return to the previous drill.
5. Review past corrections and session history locally.

## User stories and acceptance criteria
| ID | Story | Acceptance |
|---|---|---|
| US-01 | I can start a voice conversation | App requests mic permission respectfully; mic/audio are active only while intended; connection status is visible |
| US-02 | I can talk in ID/EN or mixed | Companion understands code switching and responds in the user's requested/appropriate language |
| US-03 | I can interrupt Buddy | Playback stops promptly, queued canceled audio is discarded, user input is accepted |
| US-04 | I can use voice and keyboard in one thread | Both modalities appear in a single chronological session history; no duplicate sessions |
| US-05 | I can show or hide transcript | Panel changes without disconnecting voice or resetting AI state |
| US-06 | I receive corrections after I finish | Selective, accurate, brief spoken correction + optional written explanation; no mid-sentence interruption |
| US-07 | I can say 'ayo latihan vocab' | Active mode changes after clear request; temporary questions do not permanently switch modes |
| US-08 | I can resume an exercise | Previous task context remains available within the session when feasible |
| US-09 | I can reopen local history | Sessions and corrections saved with clear delete controls; no raw audio unless explicit opt-in |
| US-10 | The interface feels polished | Navigation motion, microinteractions, character state, reduced-motion considerations, no jank blocking audio |
| US-11 | If network/provider fails, I can recover | Honest connection/error state, safe retry/resume, no invented transcript entries |

## MVP functional features
- Home, Conversation, expandable Transcript, Session Summary, History, Settings
- Voice/text in one conversation, dynamic modes, brief tutor correction after turns
- Local persistence of text/history/feedback and appearance preferences
- Real-time status: connecting, listening, user-speaking, processing, Buddy-speaking, interrupted, reconnecting, error

## Deliberately after MVP
- Cloud sync, subscription, Google sign-in, leaderboards, streaks, full CEFR scoring, objective pronunciation score, image search, full gamification, public scale, Play Store launch.

## Product success: testable rather than guessed
- Users can complete a multi-turn live bilingual conversation and deliberate interruption without crashes on a real Android device.
- Transcript is intelligible and correction quality is human-reviewable; failed/uncertain transcript is not treated as exact.
- Basic navigation/animations are fluid, with measured Android frame performance, and do not impair audio.
- Reconnection/errors handled; no silent data loss or exposed API keys.

## Non-functional requirements
- Audio pipeline isolated from UI-heavy work; avoid large queue/buffer buildup.
- Secure API credentials; explicit cost/privacy awareness.
- Accessible tap targets, readable typography, content descriptions, Android back behavior, keyboard insets, reduced-motion preferences.
