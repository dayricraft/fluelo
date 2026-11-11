# M4.5 — Vocabulary Flashcards | Approved Feature Brief

## Context
- Existing app: **Fluelo** (already renamed by owner; do not modify branding), Android-only Kotlin + Jetpack Compose, M0–M4 complete as claimed by owner; **verify the actual repository**.
- User-provided current Home screenshot and target flashcard reference are attached under `references/`.
- This is a **new core feature** with a dedicated flashcard room; it is not a replacement for the existing M4 spoken VOCABULARY skill.
- Implement **before M5**, but design Room persistence so future M5 entities/migrations can coexist.

## Approved Home change
1. Retain existing two primary bento cards, **Talk with Buddy** and **Chat with Buddy**, their behavior and styling.
2. Remove the full-width **“Buddy Online & Ready”** status panel **from Home only**.
3. Replace it in the **same position and width** with a full-width, tappable **Vocabulary Flashcards** bento, aligned to the outer bounds of the two top bento cards.
4. Tap opens dedicated **Flashcard Room**. Do not add another top-level app, chatbot identity, or login screen.
5. Removing the Home status bento must **not delete the underlying voice/network connection status logic** needed elsewhere.
6. Keep Practice History below the new bento; do not unexpectedly redesign Home.

## Approved card behavior (no additional controls clutter)
- Front: **one English vocabulary word**, legible, centered; tap card to flip to the back.
- Back: **concise Indonesian meaning**; **pronunciation in IPA**; **spoken pronunciation via a speaker control**; **one natural English example sentence**. An Indonesian example translation is a useful secondary addition if layout remains clear, otherwise optionally expandable.
- Tap the card (outside interactive child controls) to flip back. Speaker tap must **speak**, not flip or advance.
- **Swipe left** = next word; **swipe right** = previous word. Return to front when switching to another word. Back-navigation restores last position.
- **Remove** reference-design controls for levels, timer, difficulty ratings, face emojis, countdowns and graded buttons. No forced difficulty judgment is needed.
- Show compact, non-gamified progress, e.g. `124 / 3000` for unique introduced words (label the metric clearly; do not imply mastery).
- Optional small **bookmark** for words to revisit; users can browse bookmarks in Review. Do not implement an advanced SRS scorer.
- 20 **new words per session by default**, without a hard cap; resume seamlessly on reopening.
- Provide a simple mode switch **Explore New / Review** (the two activities share Flashcard Room; no mandatory separate screen).

## Word scheduling — Option A, confirmed by owner
**Shuffle all 3,000 valid unique words once, persist the shuffled order, then advance through the entire deck without reshuffling or reintroducing words as 'new' until first-pass coverage reaches the end.**

1. Source contains 3,000 case-insensitive-unique nonblank entries. Preserve exact original display strings and stable IDs.
2. Create one persisted order/seed at first activation/import (or a deterministic one-off shuffle whose resulting ranks are saved).
3. Explore New follows unintroduced entries in that fixed order; never reseeds on app restart, navigation, configuration change, Room migration or app update.
4. The previous-card gesture is browsing/history navigation, **not** a request to undo progress or reshuffle.
5. Distinguish **presented** versus **revealed/seen**: presenting the front is not evidence the user understands a word. A card earns `seen` when its back was exposed; a skipped/unrevealed card should stay eligible to be presented later as a new word, not disappear from coverage forever.
6. For UX continuity, don't abruptly teleport a skipped card back in the middle of the current swipe chain. Keep deterministic navigation history and a separate pending queue of unrevealed words; re-offer eligible skips before declaring the first pass complete.
7. Completion of the first pass means **every eligible word has been revealed at least once**, not `mastered`. Offer entering Review or a deliberate new pass; do not silently reset the order/progress.
8. Restart app, phone reboot, and UI recomposition must preserve order, seen flags, bookmarks and current position.
9. If the word content for a card is invalid/incomplete, **do not silently count it as completed**; show a non-breaking content-unavailable state and report how the data pipeline handles it.

## Content and learning quality
- The text file supplies **only English headwords**. It does **not** supply translations, IPA, part-of-speech or example sentences.
- Enrich the entire list **before runtime** with Indonesian primary meaning(s), pronunciation/IPA, part of speech, and concise real-life example sentence. Do not claim those extras are source-provided.
- Some entries are ambiguous or special-form (e.g. `present`, `right`, `lead`, `record`, `I`, `Mr`, `n't`, `mm-hmm`). Enrich using a clearly selected primary sense or a compact small set of common senses. If pronunciations differ, indicate sense-specific IPA instead of arbitrary one-pronunciation claims.
- If no defensible translation/IPA/example is available, flag for review instead of inventing certainty. No fake data passed as production dictionary content.
- Aim for friendly, natural daily-speaking examples, not generic filler or definitions disguised as examples.

## Architecture rules
- New flashcard presentation/navigation belongs to Compose UI and its own ViewModel/use case; data loading, scheduling and source content belong in repositories/Room.
- Extend **existing local database if present**; otherwise introduce one Room database through the approved architecture, in a migration-friendly way for M5. Do not create two unrelated Room databases accidentally.
- Preserve M0–M4 voice/chat/tutor/skills features; flashcards operate independently of the AI conversation connection.
- No runtime Gemini per word; no new backend, cloud database, subscription, or extra paid API.
- Preserve approved Fluelo visual identity and accessibility semantics.

## Explicit non-goals for M4.5
- No new cloud sync, auth, profiles, social features or gamification.
- No advanced scientifically calibrated spaced repetition / SM-2 / FSRS.
- No user-rated Easy/Medium/Hard, levels, countdown timer or XP.
- No pronunciation grading or mandatory mic recording for cards.
- No bulk redesign of the Home or conversational screens.
- No early implementation of full M5 session history/learning summaries.
