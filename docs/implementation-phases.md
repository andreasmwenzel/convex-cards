# Phased Implementation Plan

## Phase A: Unblock Convex in headless sessions

- Add documented CI secret for Convex CLI auth token.
- Verify `npx convex dev` can start without interactive login prompts.
- Verify `npx convex codegen` succeeds.

## Phase B: Establish baseline quality gate

- Add CI steps:
  1. install deps
  2. convex codegen
  3. svelte check
- Ensure failures mention generated API mismatch and remediation.

## Phase C: Model game entities

- Extend `convex/schema.ts` for tables, players, decks, and turns.
- Add typed queries/mutations with auth checks.
- Regenerate API types and update frontend usage.

## Phase D: Build game flow UI

- Add lobby route and table route(s).
- Hook real-time queries + actions.
- Add loading/empty/error UX for each state.

## Phase E: Harden and ship

- Add smoke tests for auth and core game actions.
- Finalize deployment and runbook docs.
- Perform production build and checks before release.
