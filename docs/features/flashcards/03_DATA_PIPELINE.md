# M4.5 — Vocabulary Data, Enrichment and Room Contract

## Canonical source
`assets/vocabulary/kosakata_3000_source.txt` (copied verbatim from user `kosakata(1).txt`)

Automated initial audit: **3,000 nonempty lines, 3,000 case-insensitive unique strings, no blank lines or duplicate headwords**, alphabetically ordered. Audit metadata and SHA256 are stored in `assets/vocabulary/source_audit.json`. Do not assume these words already include linguistic metadata.

## Two distinct entities: dictionary content vs user progress

**VocabularyEntry** (immutable-ish released content):
- `id`: stable key mapping to original source line/headword, never position in shuffled order
- `headword`: exact original English string (case-preserved)
- `normalizedKey`: search/uniqueness key without mangling punctuation like `n't`
- `partOfSpeech`: suitable primary POS or `multiple/uncertain` when needed
- `meaningsId`: concise vetted Indonesian sense(s), tied to POS
- `ipa`: pronunciation for specified accent/sense, if verified
- `pronunciationLocale`: selected English locale (e.g. `en-US`)
- `exampleEn`: useful, grammatical sentence using word in appropriate sense
- `exampleId`: recommended Indonesian example translation if concise
- `contentStatus`: `ready` / `needs_review` / `unavailable` (distinguish source import from content verification)
- `datasetVersion`: content version for migration/upsert and future fixes

If polysemy requires more than one useful sense or varying IPA, agent may normalize senses into a child table or a structured set; design must remain compact on flashcard back.

**VocabularyProgress** (mutable device-local user state):
- stable `vocabularyEntryId`
- persisted shuffled `orderRank` in current coverage cycle **or** a separate `DeckOrder` table
- `presentedAt` (optional) and **`revealedAt`** (first actual back reveal)
- `lastVisitedAt`
- `isBookmarked`
- `reviewCount`, `lastReviewedAt` (basic history; no difficulty scoring)
- optional `pendingUnrevealed`, queue cursor and per-session navigation history as needed

**Settings/deck state**: `datasetVersion`, `shuffleSeed` or persisted rank order, first-pass cursor, currently focused card, active Explore/Review mode. Keep consistent transactional updates. Avoid coupling app navigation state to SQLite row IDs.

## Enrichment (OFFLINE BUILD-TIME ONLY)
1. Read exact 3,000 headwords and calculate audit manifest.
2. Batch enrichment (suggest 100–200 words per checkpoint) into staging artifacts (JSONL/CSV/SQLite). Generate meaning, POS, IPA if credible, English example and optional Indonesian translation. **No model call at card-open time**.
3. Use authoritative dictionary or lexical sources / licensing-compatible datasets where available to validate polysemy and IPA; if AI creates draft content, label it as AI-generated until reviewed. Do **not** misrepresent generated text as sourced from the input file.
4. Preserve all headword IDs and batch provenance. Resume failed/interrupted batches; never drop or duplicate entries.
5. Validate 3,000 exact source keys; non-null mandatory display fields for `ready` entries; IPA formatting and accent consistency; POS/meaning/example concordance; examples contain correct inflected form if not exact word.
6. Flag difficult items for targeted linguistic audit: `lead`, `record`, `present`, `right`, `close`, `live`, `use`, `read`, `tear`, `wind`, `minute`, abbreviations (`Mr`, `Ms`, `AM`, `PM`, `PC`, `TV`), interjections and contractions (`n't`, `mm-hmm`), proper nouns. This list is illustrative only; inspect actual source.
7. Validate random stratified samples across alphabet and POS plus 100% structural checks. Translation and IPA semantic quality cannot be guaranteed by schema validation alone.
8. Produce a **complete, versioned, importable offline content artifact** in assets, or explain/count any `needs_review` records and obtain approval for shipping incomplete content. Never substitute `TBD`, blank translated text, or fabricated pronunciations and call the data complete.
9. Verify license terms of third-party dictionaries, speech data or example corpora before bundling; prefer original example sentences.
10. Build/test the import in Android without startup hangs (prepackaged Room DB or idempotent asynchronous seed; choose based on actual repo).

## Coverage order invariants
- Start from a single shuffled permutation of **all eligible 3,000 IDs** (not random sampling with replacement). Persist it.
- `next` never consumes a word twice as a NEW item once `revealedAt != null`.
- Unrevealed skips remain outstanding and are re-presented in deterministic order, without a random infinite loop. Use a fixed pending queue or equivalent.
- `previous` is navigational and does not decrement distinct `seen` count.
- `seenCount = COUNT(DISTINCT id WHERE revealedAt IS NOT NULL)`, not swipes/taps/queries.
- On app close/reopen, a still-unrevealed current word remains resumable and order remains intact.
- On completion: first pass only when `seenCount == totalEligibleCount`, unless some items are unavailable; incomplete records must be shown in an explicit reconciliation report, not ignored.
- Review is separate from Explore and may freely repeat seen/bookmarked cards; Review must not cause unseen items to appear marked as seen accidentally.
- If dataset changes via app update, reconcile stable IDs and preserve known progress; do not truncate user data or reshuffle silently.

## Pronunciation / offline nuance
- Displayed IPA is lexical content; **Android TextToSpeech** is audio. They are separate capabilities. Verify accent/engine/voice availability, language setup, and offline voice support on real device.
- No generated audio files required unless a copyright-safe, size-appropriate approach has been justified and approved.
- If TTS engine needs a data download, disclose it; say 'offline' only when the actual installed engine supports it. Flashcard **text browsing remains offline** regardless.
- Avoid speaking over the companion's existing voice session; apply Android audio focus and lifecycle handling.

## Database compatibility with M5
- Check whether current app already uses a Room database or database schema; **add entities/migrations to it rather than starting another isolated database unnecessarily**.
- Do not clobber DataStore settings, conversation IDs, tutor corrections or current app name/package.
- M5 will add chat history/learning summary entities; account for a straightforward path to schema evolution.
- Include safe migration tests and data persistence tests; never use destructive migration for this user-progress data.
