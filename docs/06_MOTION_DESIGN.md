# Motion Design — Playful / Fluid / Alive

## Motion principles
- Purposeful, tactile, responsive, consistent; movement is feedback and context, not decoration.
- Prioritize **audio quality and UI responsiveness** over visual effects. No blocking audio capture/playback with animation work.
- A quiet baseline + expressive moments (opening conversation, changing mode, correct vocabulary answer).
- Respect system accessibility/reduced-animation settings where available; provide settings fallback.

## Initial timing proposals (tune on device)
| Interaction | Starting guide | Behavior |
|---|---:|---|
| Button/touch feedback | 80–140ms | Press response and subtle release |
| Answer feedback | 150–250ms | Gentle scale/fade, optional haptic |
| Transcript sheet | 220–350ms | Spring with gesture follow-through |
| Home -> conversation | 250–400ms | Shared element if safe, otherwise smooth fallback |
| Cat state change | 200–400ms | Soft crossfade/shape/aura transition |
| Speaking/listening glow | Audio-driven | Derived from real audio level, NOT arbitrary looping |

## Motion inventory
- Primary Talk CTA: press scale and optional light haptic -> transition -> truthful connecting status.
- Conversation character: idle breathing subtle; listening aura responds to mic; processing slowed indication; speaking responds to output audio; interruption stops speaking visualization; disconnected dims and shows retry.
- Transcript panel: swipe/drag + button; hidden / peek / expanded; never triggers session reconnect.
- Mode switch: label and small feedback; no disruptive full screen change.
- Vocabulary evaluation: short lime success / measured error states and progress; no punitive shake or loud motion.
- Session finish: controlled dismissal and summary entrance; respect current audio lifecycle.

## Performance and accessibility gates
- Monitor actual frame timing, jank, memory and CPU on the owner's Android phone.
- Animate scale/alpha/translation efficiently, avoid per-frame heavy blurred Canvas allocations or uncontrolled shadow layers.
- No infinite ripples unrelated to real app state; no content flashing.
- Avoid haptic on every incoming audio chunk or token; only meaningful events.
- Standard Android back gestures, long-press semantics and keyboard focus must continue functioning.
- If animation causes audio underruns, simplify/disable it and document findings.
