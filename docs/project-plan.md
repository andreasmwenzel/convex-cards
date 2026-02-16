# Convex Cards Project Plan

## Current status

- **Frontend scaffold exists** with SvelteKit routes and auth UI.
- **Convex backend exists** with auth config, schema, HTTP auth endpoints, and starter functions.
- **Environment variables present**: `CONVEX_DEPLOYMENT`, `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`.
- **Current constraint**: cloud-targeted non-interactive Convex commands still require a Convex access token, but anonymous agent-mode local development is working.

## Objectives

1. Stabilize non-interactive developer workflow for Convex + SvelteKit.
2. Implement core multiplayer card game domain model and API.
3. Deliver an auth-first UX with reliable session handling.
4. Add CI checks that enforce codegen and type safety.

## Success criteria

- `npx convex codegen` (or agent-mode equivalent) succeeds in non-interactive shells.
- `npm run check` passes locally and in CI.
- Authenticated users can create/join game tables and play turns.
- Docs fully cover setup, architecture, and roadmap.
