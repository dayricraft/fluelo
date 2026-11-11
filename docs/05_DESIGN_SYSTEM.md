# Design System & UI Reference Contract

## Visual north star
**Dark minimalist, premium, playful, fluid, alive**, inspired by the owner's two attached image references. Not a clone of existing app branding. The companion is a **chromatic black cat** with two simple white eyes. The orb in the first UI image is atmosphere/voice visualization, **not a second AI character**.

## Brand palette from supplied Kotlin reference
- Background dark: `#09090B`
- Surface dark: `#17171B`
- Primary text: `#F4F4F6`
- Secondary text: `#8E8E93` (verify contrast on chosen surface)
- Neon lime action: `#C8F53B`
- Soft purple: `#C9B6FF`
- Soft pink: `#FFC8E2`
- Light theme: provided reference includes `#F6F7F9`; MVP may default to dark, while light theme can be implemented when requested.

## Principles
- Restrained color: lime only for priority/affirmative action; pastel secondary colors sparingly.
- Typography: legible geometric sans; favor platform-safe fonts unless proper font licenses/assets exist. Clear hierarchy, comfortable line heights.
- Spacing based on consistent scale; avoid arbitrary one-off magic values. Insets for status/navigation bars and IME.
- Touch targets large enough for comfortable reach and accessibility; include semantic labels.
- Avoid giant random glows, gradient backgrounds, excess cards or bento-only-for-style.
- Small responsive phone first; account for larger screens and font scaling.
- Chromatic glow is an intentional **brand exception** to anti-slop; keep effects bounded and performant.

## Android adaptation of Anti-Slop
Use anti-slop design/a11y rules as intent; DO NOT blindly copy instructions about CSS/Tailwind/media-query syntax. Map concerns to Kotlin/Compose `Modifier`, Material 3 foundations, typography, semantics, `WindowInsets`, and native gestures.

## Reference assets
- `references/01_ui_reference.png`: visual language / original home & voice screenshots.
- `references/02_chromatic_cat.png`: visual character appearance, preferred mascot.
- `references/legacy_ui_prototype.kt`: supplied *incomplete* Compose UI experiment. Read to understand chosen palette/component ideas, not as runnable production code.

## Specific restrictions
- UI should not look like a generic purple-blue gradient AI chat app.
- If a proposed design differs from supplied references, present the rationale and mock first.
- Preserve one consistent companion identity across screens/modes.
- Loading/status indicators must reflect actual mic/connection states, not decorative animation.
