# M4.5 — Verification Matrix and Definition of Done

**M4.5 is NOT complete until the implementation exists in the real repo, relevant tests pass, and physical-device checks have been performed or explicitly marked NOT VERIFIED.**

## Data integrity (automated, mandatory)
1. Source import: exactly **3,000** nonblank, **3,000** unique words; every input headword maps to stable key, with no omissions/new inventions.
2. Enrichment: all shipped `ready` entries have meaningful Indonesian meaning, consistent POS, IPA or explicitly valid unavailable behavior, contextual English example; no placeholders or meaningless repeated sample sentence.
3. Verify total enriched count and list unresolved semantic exceptions with evidence, not silent fixes.
4. Order: exact permutation, no duplicate ranks; deck is not sorted alphabetically unless random order happened to yield that by extraordinary coincidence.
5. Across simulated 3,000 reveal operations, every eligible entry reveals once before completion; no infinite loops or missing words.
6. Skipped/unrevealed items remain in new-word pool and are eventually revisited; show after skip vs reveal semantics in unit tests.
7. Count tracks distinct back revelations; previous swipe and repeated visits do not increment it.
8. Restart, navigation, configuration change and process death do not erase cursor/order, bookmarks, or revealed history.
9. Migration/upsert with dataset version bump retains user progress and source-word identities.

## Interaction (unit/UI + physical device)
10. Home current two bento cards still open correct voice/text flows; new full-width flashcard bento replaces `Buddy Online & Ready` in its exact Home location.
11. Flashcard Room loads quickly offline, even with no Gemini/network connection.
12. Tap front flips to back; tap back flips front; swipe left next, swipe right previous; reset face on next word.
13. Tap speaker does not flip/switch card; speaker uses English locale, handles missing engine and stop/lifecycle gracefully.
14. Flip/swipe rapid gestures do not crash or misalign current word/text/progress.
15. Long meaning/example and Android larger font size remain legible; TalkBack can flip, navigate and speak without relying solely on gestures.
16. No level, timer, difficulty emoji/buttons or clone of the reference design colors; use current Fluelo palette and actual icon/logo.
17. Explore vs Review selection works; bookmark toggle saved across restarts and filters correctly.
18. Re-entry from Home resumes previous position and active mode; 20 words is default suggested session, not forced cutoff.
19. Explicit empty/offline/invalid content states are human-readable and not mock successes.
20. Transitions and motion are responsive, without sustained jank on real device; existing audio pipeline remains unaffected.

## Regressions / security / performance
21. Build release/debug as repo supports; Gradle tests pass; screenshot/video proof from device if available.
22. Existing M0–M4: voice call, bilingual dialogue, transcript, chat, tutor corrections and mode switching continue working.
23. No new paid API, runtime Gemini requests for flashcards, secrets, analytics trackers, login or cloud sync.
24. No destructive Room migration; no excessive preloaded audio/video assets or startup database work on UI thread.
25. User can recover after TTS failure, empty review and data import errors.

## Deliverable evidence
- Source/asset file change list and actual commands/test outputs.
- Source audit counts, ready/needs_review counts, version and QA samples.
- Evidence of persisted 3,000-word coverage and last-position recovery.
- Physical Android device: model/Android version, any crash/lag concerns, manual gesture/audio tests.
- `docs/11_EXPERIMENT_LOG.md` update (or current repo's accepted milestone log) + a dedicated M4.5 handoff to M5.
- Explicit list of NOT VERIFIED assertions and unresolved defects. Do not claim success based on mocked UI/unit tests alone.
