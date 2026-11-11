# UX Flow & Screen Architecture

## Principles
- **Voice + chat = one active conversation**, not independent agents or separate message threads.
- Default: calm visual; interaction is expressive, not constantly animated.
- Transcript may be hidden / peek / expanded. Voice is uninterrupted when UI panel moves.
- User always knows whether mic is listening, AI is speaking, or network is reconnecting.

## Screens
1. **Home:** Buddy greeting, primary Talk/Continue CTA, recent sessions, settings affordance. A chat entry if shown leads to the *same* conversation engine.
2. **Conversation:** chromatic cat center, live state, prominent mic control, text input, transcript toggle, end session. Optional active mode indicator.
3. **Transcript bottom sheet:** Hidden / Peek / Expanded, scrollable user & Buddy turns, corrections; typing may switch input without destroying voice session.
4. **Session Summary:** what was practiced, selected correction items, new vocabulary if reliably extracted, retry/continue.
5. **History:** local session list, details, delete.
6. **Settings:** appearance, language of UI, correction preference, privacy/history controls, reduced motion option.

## Flows
- Home -> tap Talk -> connecting -> ready/listening -> voice exchange -> back/finish -> summary -> Home.
- Home -> type chat -> same session/thread -> optionally activate voice -> switch modalities without resetting history.
- Conversation -> swipe transcript sheet hidden/peek/full -> continue audio without reconnect.
- Conversation -> voice command change mode -> brief confirmation + mode label -> practice; ask unrelated question -> answer -> resume practice.
- Conversation -> user interrupts Buddy -> canceled playback stops -> listening -> new response.
- Permission denied -> contextual explanation/settings route; no false listening indicator.
- Network loss -> visual disconnected/reconnecting state and manual retry; no spinner masquerading as connected.
- App backgrounded / audio focus changes / incoming call / headphones unplug -> defined pause/stop/reconnect policy; no mic capture unexpectedly.

## UX screens must have state coverage
- Loading/connecting, empty, active, processing, mic muted, Buddy speaking, interrupted, permission denied, service quota hit, error, reconnecting, offline.
- Android back and keyboard insets, screen rotation/state restoration and accessibility announcements.

## Corrected sentence experience
- Brief spoken correction delivered after full user turn.
- In transcript, original/correction paired and readable; collapsible detailed note.
- Do not auto-open transcript on every correction.

## Navigation consistency
- Shared-element transitions permitted for Home -> Conversation if stable in current Compose version; graceful simple crossfade is acceptable when shared element introduces lifecycle bugs.
- Maintain conversation/audio controller above transient sheet/navigation recompositions.
- No separate 'Search by Image' feature in MVP even if shown in original visual inspiration.
