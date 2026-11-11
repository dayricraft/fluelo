# Fluelo — M4.5 Vocabulary Flashcards | Agent Handoff

**Status:** owner-approved design brief; **no Android code is included**.

## Purpose
Introduce an additive **M4.5 Flashcard Vocabulary** milestone between the already-completed M4 Dynamic Skills and the planned M5 Local History & Learning Summaries. The owner wants all Kotlin, Android, UI, data processing and APK implementation performed **by the Antigravity AI agent**, not by the planning assistant.

## Install into the existing workspace (IMPORTANT)
1. Open the **existing** Android repository in Antigravity. Do not create a new app or replace its files.
2. Copy **`docs/features/flashcards/`** from this package into the repository at that same relative location.
3. Copy **`assets/vocabulary/`** into the existing repository at that same relative location (or propose an equivalent location after repository inspection). It contains the canonical 3,000-word text, **not** translated/enriched content.
4. Open `START_M4_5_AGENT.md` in this package, then paste its complete contents into **a new Antigravity chat in the same workspace**.
5. The first response must be audit and implementation planning only, and must stop until explicit approval.
6. Keep original M0–M4 features, source files, app name, logo, package ID, styling and branding unchanged unless strictly needed and approved.

## Package contents
- `docs/features/flashcards/01_FEATURE_BRIEF.md` — user intent, detailed scope, flow, product rules
- `docs/features/flashcards/02_UX_MOTION.md` — screen, gestures, visual/motion spec
- `docs/features/flashcards/03_DATA_PIPELINE.md` — word ingestion, enrichment, storage, offline and queue guarantees
- `docs/features/flashcards/04_TEST_ACCEPTANCE.md` — measurable success checks
- `docs/features/flashcards/05_DELIVERY_PLAN.md` — implementation order, handoff, compatibility with M5
- `docs/features/flashcards/references/` — **actual screenshots from the owner**
- `assets/vocabulary/kosakata_3000_source.txt` — **exact original 3,000-word input**
- `assets/vocabulary/source_audit.json` — automated source audit
- `START_M4_5_AGENT.md` — first-chat agent instructions

## Document precedence
Existing repository `AGENTS.md` + current owner-approved implementation > current runtime source code reality > this **additive M4.5 approval** > older M0-era template names. If they disagree, agent must inspect and explain; never silently overwrite working features. The app is now named **Fluelo** and the owner already changed its logo. This package does **not** request a rebrand.

## Intended deployment
Android only, Kotlin + Jetpack Compose, persistent on-device vocabulary data, offline card browsing/review, on-device TTS when the installed voice engine supports offline playback. No Gemini call per flashcard, no new paid service, no account/login or cloud DB.
