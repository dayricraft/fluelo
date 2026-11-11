# Ready-to-paste Antigravity Prompt

> You are the Android engineer for AI Buddy. Read `AGENTS.md` and all required planning documents before writing any code. The product is Android-only (Kotlin + Jetpack Compose), a personal bilingual Indonesian/English real-time voice+chat companion. Preserve the provided design references and anti-slop rules. Your first task is **M0: Voice Feasibility**, NOT a production UI or the full application. Inspect current official Gemini Live / Firebase AI Logic Android support, available models, free-tier/rate limits, permission/auth approach, and provider/API constraints. Propose a minimal secure PoC on a physical Android device: microphone capture, bidirectional streaming, audio playback, switch Indonesian/English, interruption with buffer clearing, reconnect/session limits, time-to-first-audio measurements, and log hygiene. Present a short implementation plan and approval gates first; then implement M0 only when I ask. For every step report actual build/test output and uncertainties. Never hardcode my provider API key or invent performance results.

## Working method
- Use one Antigravity conversation/work unit per milestone if helpful; the repository documents are the source of truth.
- Show proposed file changes before major architecture migrations.
- Record verified outcomes in `docs/11_EXPERIMENT_LOG.md`.
- The final Android APK is to be built by the agent, not by the creator of this planning bundle.
