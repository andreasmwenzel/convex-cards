# AGENTS.md

## Project Outline

- App: `convex-cards` (SvelteKit frontend + Convex backend)
- Purpose: Auth-first scaffold for a multiplayer card app
- Auth: Convex Better Auth (`@convex-dev/auth`) with Google + email magic link
- Styling: Tailwind CSS v4

## Repository Layout

- Frontend app: `src/`
- Routes: `src/routes/`
- Auth UI/components: `src/lib/components/auth/`
- Convex functions/schema/auth config: `convex/`
- Generated Convex API types: `convex/_generated/`

## Key Scripts

- Install deps: `npm install`
- Frontend dev server: `npm run dev`
- Convex dev backend: `npm run convex:dev`
- Type/lint-style check (Svelte/TS): `npm run check`
- Production build: `npm run build`

## Convex Sync Before Checks

Run Convex codegen before running checks so generated API types are in sync:

```bash
npx convex codegen
npm run check
```

## Local Development Workflow

Run backend and frontend together in separate terminals:

Terminal 1:

```bash
npm run convex:dev
```

Terminal 2:

```bash
npm run dev
```

## Agent Notes

- If you change files in `convex/`, run `npx convex codegen` before `npm run check`.
- Keep `convex dev` running while building features with Convex functions.
