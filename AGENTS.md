# AI Buddy — Agent Instructions (Android Only)

## Non-negotiable product constraints
- Build only for **Android**, in **Kotlin + Jetpack Compose**; do not add Flutter, React Native, web/PWA, or iOS implementations.
- One persistent AI persona (chromatic cat): free conversation and tutor in the same continuous session.
- Bilingual Indonesian/English, spontaneous switching, no forced translation of each answer.
- **Voice + text belong to a single conversation**; transcript can be shown/hidden without interrupting audio.
- Default feedback: **selective hybrid correction after a full user turn**; short spoken note, useful written details, avoid constant interruption.
- Natural-language mode switching: conversation, vocabulary, grammar, roleplay. Distinguish temporary questions from persistent mode changes.
- Android native UI must follow the supplied visual references and motion specification; no generic unapproved AI-style redesign.
- Personal-use MVP, local history; do not introduce account systems, RBAC, analytics SDKs, image search, or cloud sync without owner approval.
- Protect privacy and API credentials. NEVER embed a long-lived secret or paid-provider key in APK or repository. Do not silently enable billing or paid services.

## Required reading (order)
1. `docs/01_DECISIONS.md`
2. `docs/02_PRD.md`
3. `docs/03_AI_BEHAVIOR.md`
4. `docs/04_UX_FLOW.md`
5. `docs/05_DESIGN_SYSTEM.md`
6. `docs/06_MOTION_DESIGN.md`
7. `docs/07_ARCHITECTURE.md`
8. `docs/08_IMPLEMENTATION_PLAN.md`
9. `docs/09_TEST_PLAN.md`
10. `docs/10_TECHNICAL_UNCERTAINTIES.md`
11. Anti-slop skills relevant to the work (core + UI + human + mobile).

## Execution protocol
- Before each milestone: read the relevant spec, inspect the current repository, give a short plan with exact deliverables, identify risks, and request approval for architectural or paid-service changes.
- Work on **one milestone at a time**. **M0 voice feasibility first**. Do not implement the entire app in one giant change.
- Keep runnable code compact, idiomatic, and maintainable. Favor official Android APIs and currently supported dependencies; verify API/SDK availability rather than guessing names.
- Do not use fake provider responses as evidence of successful integration; mocks may be used for isolated UI tests but label them plainly.
- No boilerplate code, mysterious libraries, hidden fallbacks, unbounded background jobs, or hardcoded user data.
- Preserve service boundaries: UI / conversation-state / audio transport / AI provider / persistence.
- Use real device tests for mic, audio routing, network recovery, interruption, and frame performance. Emulators alone are insufficient.
- On each milestone completion: report changed files, how to run, build/test commands and actual outcomes, measured metrics, known defects, and next decision. Mark **NOT VERIFIED** when tests were not executed.
- When something conflicts, owner-approved product requirements and design references take precedence over generic skill suggestions; document the exception in `docs/01_DECISIONS.md`.

## Design skill behavior
- Core: `.agents/skills/antislop/SKILL.md`
- UI: `.agents/skills/antislop-ui/SKILL.md`
- Human/accessibility: `.agents/skills/antislop-human/SKILL.md`
- Mobile layout: `.agents/skills/antislop-layoutmobile/SKILL.md` (principles only; reinterpret web breakpoints/CSS for Android Compose)
- Code/copywriting optional when in scope.
- During build: apply anti-slop as guidance; after each visible screen: run its UI audit.
- Approved exceptions: neon-lime accent, functional bento grid, chromatic glow as brand identity, restrained state-aware motion.

## Repository changes
- The supplied Kotlin file under `docs/design/references/` is a **visual prototype**, not working product code. Do not paste it unchanged as the app implementation.
- No new backend by default. If direct API access requires a token broker, document alternatives and get approval before creating one.
- Never commit `.env`, keystores, tokens, API keys, user transcripts, or secrets.
