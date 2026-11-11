# M4.5 — Ordered Delivery Plan (Antigravity Only)

## Gate 0: Reconnaissance / no code
- Inspect current repo, `AGENTS.md`, latest source, docs, skills, actual App Name/Branding.
- Confirm M4 completion evidence and check current Home Compose structure and database setup.
- Read `01`–`04` specs and both images; inspect canonical wordlist/audit.
- Identify actual TTS and audio-focus integrations and whether user voice session can coexist safely.
- Produce plan, affected files, migrations, data creation method/cost and test plan. **STOP** for owner approval.

## Gate 1: Vocabulary content pipeline
- Ingest wordlist with IDs and audit.
- Enrich/check all 3,000 entries offline, with resumable batches and documented quality handling.
- Validate actual release artifact; provide audit numbers and remaining exceptions.
- Note: if all entries cannot be safely completed within tool/session constraints, do not ship fake translations; checkpoint batches and report incomplete status.

## Gate 2: Room persistence and order engine
- Extend existing DB/migrations if applicable; add word content and progress entities/DAOs/repository.
- Implement stable shuffled order, unrevealed skip handling, seen/first-pass metrics, Review/bookmarks, resume state.
- Unit/integration tests for ordering, deduplication, persistence and migrations.

## Gate 3: Compose flashcard UI
- Full-width Home flashcard bento replacing the status tile.
- Flashcard Room, Explore/Review, front/back, IPA, speaker, sample sentence and visible progress.
- Swipe/flip animations, app-brand fidelity, a11y/large font, lifecycle and TTS failure behavior.

## Gate 4: Validation and handoff
- Regression test M0–M4, real device UX checks, verify content, test offline, check Room integrity across restart/process death.
- Update experiment log and produce M4.5 implementation report/checkpoint.
- Flag any M5 architecture dependencies; do not preemptively implement full history feature.

## Scope-change gate
Pause and request approval if the project requires a new paid API, long-running cloud enrichment, additional backend, destructive schema change, or deletion/replacement of completed M0–M4 features. If the developer tool cannot access reliable external dictionary data, propose clearly labeled alternatives and quality checks rather than pretending completeness.
