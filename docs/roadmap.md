# Product & Engineering Roadmap

## Phase 0 — Tooling stability

- Resolve non-interactive Convex authentication.
- Add CI job enforcing `npx convex codegen` + `npm run check`.
- Document env var contract for local + CI.

## Phase 1 — Core game domain

- Define card/game/player schema extensions.
- Add table lifecycle mutations (create/join/leave/start).
- Add turn state queries and guarded mutations.

## Phase 2 — Multiplayer UX

- Lobby/table browser views.
- Real-time table state and turn indicators.
- Action controls with optimistic/pending UI states.

## Phase 3 — Persistence & resilience

- Rejoin session support.
- Basic anti-cheat/turn validation checks.
- Error handling and reconnect UX.

## Phase 4 — Production readiness

- E2E smoke tests for auth + basic gameplay.
- Deployment hardening and environment separation.
- Telemetry/logging and operational runbook.
