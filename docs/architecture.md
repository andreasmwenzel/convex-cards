# Architecture Overview

## Stack

- **Frontend:** SvelteKit + TypeScript.
- **Backend:** Convex functions/schema with Better Auth via `@convex-dev/auth`.
- **Styling:** Tailwind CSS v4.

## High-level components

1. **Client app (`src/`)**
   - Route-level pages and auth-aware UI.
   - Uses generated Convex API bindings from `convex/_generated/`.

2. **Auth UI (`src/lib/components/auth/`)**
   - Sign-in/sign-out flow and provider actions.
   - Session-aware rendering.

3. **Convex backend (`convex/`)**
   - Auth configuration (`auth.config.ts`, `auth.ts`, `http.ts`).
   - Domain functions (`users.ts`, `userProfiles.ts`, future game modules).
   - Data schema (`schema.ts`).

## Request/data flow

1. User opens SvelteKit app.
2. Frontend initializes Convex client using `PUBLIC_CONVEX_URL`.
3. Auth flow is delegated to Convex Better Auth endpoints.
4. Frontend calls Convex queries/mutations via generated `api` typings.
5. Convex persists state and returns live query updates.

## Operational workflow constraints

- Run `npx convex codegen` **before** `npm run check` whenever Convex files change.
- Prefer parallel terminals in local dev:
  - `npm run convex:dev`
  - `npm run dev`
