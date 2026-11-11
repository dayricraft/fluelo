# M4.5 — Flashcard UX, Visual Design and Motion

## Original references
- `references/01_current_fluelo_home.jpeg`: current Android Home, exact hierarchy/brand/logo
- `references/02_flashcard_inspiration.png`: a flashcard interaction reference, **not a color/UI clone**

## Home integration
- Current Home has a black near-`#09090B` background and two top bento cards: **Talk with Buddy** (lime `#C8F53B`) and **Chat with Buddy** (lavender `#C9B6FF`).
- Replace the existing **Buddy Online & Ready** rectangle directly below those cards with a **full-width Vocabulary Flashcards** entry card. The new card aligns horizontally with the two existing cards and matches their design system; visual recommendation: **soft pink `#FFC8E2`** to distinguish the third action; validate contrast and current runtime tokens.
- Entry card may show icon, title, one-sentence description and minimal arrow affordance. Preserve Practice History beneath.
- Press: visible immediate feedback (subtle compression/haptics where supported) and smooth screen transition. Loading/sync status cannot claim availability before data are ready.

## Flashcard Room layout
- Android status/window/navigation bars handled with native WindowInsets.
- Top app bar: Back + `Vocabulary` + optional discreet bookmark/review entry. No fake user avatar borrowed from reference.
- Simple mode toggle: `Explore New` / `Review`. Avoid an extra navigation screen unless needed.
- One large central rounded vocabulary card dominates the screen. Keep text readable on narrow phones/font scaling and in both front/back states.
- Front: English word prominently centered; optional clearly labeled speaker near it if robust.
- Back: meaning (ID) near top, IPA, speaker action, English example sentence; optional smaller Indonesian example translation. Content fits with considered spacing/scroll for long senses.
- Small progress context `Seen 124 / 3000` (or exact label) at top/below card. No timer, stars, difficulty faces, streak, level or unrelated clutter.
- Previous/Next **via horizontal swipes**, with accessible non-gesture alternative (compact controls or accessibility actions). Back Android system gesture must not be hijacked.
- Card starts front-side on every **new** word. Returning to a previously visited word may restore card side only if explicitly decided by agent and documented; preferred: reset front for learning consistency.
- Review activity shows previously revealed and/or bookmarked cards; define clear filters so `Review` is not an empty mystery screen. Recommended: `All seen` and optional `Bookmarked`, with empty-state messages.

## Motion behavior
- Tap flips face/back using a **3D Y-axis card rotation** or an equivalently readable native flip with perspective and backface concealment. The text must never appear mirrored halfway.
- Swipe: card translates with touch, snaps back if gesture threshold not met, advances to next/previous if passed; content does not jump abruptly.
- Swipe horizontally without accidental flip. Tap speaker does not trigger flip, pagination or extra haptic feedback.
- Opening/closing page: use existing navigation/motion system from M1–M4 instead of introducing a disconnected animation library.
- Prefer native Compose APIs (`HorizontalPager`, animated state, pointer input if needed). Agent must check compatibility of target Compose versions before choosing implementation.
- Motion duration starting guidance: press feedback ~80–140 ms, card flip ~300–450 ms, swipe completion ~180–300 ms. Tune on physical phone, not blindly fixed.
- Avoid heavy blur, expensive bitmap redraw, unnecessary looping animation and overdraw. Honor OS accessibility/reduced-motion settings where supported; provide an alternative discreet crossfade if necessary.
- Ensure target devices have smooth frame pacing; manual jank test with at least some rapid swipes and card flips.

## Interaction rules & edge cases
- Debounce or serialize rapid swipe navigation so no card is skipped by inconsistent async data loads.
- If swipe occurs during flip, finish/cancel flip deterministically, then switch card. No ghost text or mixed back/front states.
- Persist current deck position on meaningful navigation and lifecycle events, without blocking the main thread.
- If pronunciation engine unavailable, show a helpful muted/unavailable state rather than crash; do not silently use the wrong language.
- Speaker playback stops/cleans up with lifecycle and audio focus; do not hijack an ongoing Buddy voice call.
- Content longer than card: flexible scroll within card, no clipping; accessibility labels for flip, next, previous, speak, bookmark.
- If no card remains in first-pass Explore: show explicit **3,000 of 3,000 revealed** completion, with Review as next action, not a repeated random card.
- Favor subtle tactile delight consistent with Anti-Slop skills and existing Fluelo motion design—not a flashy game clone.

## Explicit fidelity requirements
Use **actual current Fluelo screenshot and existing Compose implementation** as visual baseline. The older `AI Buddy` assets and reference iPhone mock are historical inspiration only; do not restore old app branding, create a notch, or use the mock's blue/white palette.
