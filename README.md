# Convex Cards

A starter scaffold for a multiplayer cards app using:

- **SvelteKit** (TypeScript)
- **Tailwind CSS v4**
- **Convex** for database/functions
- **Convex Auth** with:
  - Google OAuth
  - Email magic links (via Resend)
- **SvelteKit adapter-auto** for platform-aware deployment

## What is scaffolded

- SvelteKit app initialized with `npx sv create`
- Tailwind installed with `npx sv add tailwindcss`
- SvelteKit adapter-auto config
- Convex folder with:
  - `schema.ts` (auth tables + starter game tables)
  - `http.ts` (auth routes)
  - `auth.ts` (Google + magic-link providers)
  - `auth.config.ts`

## Local setup

1. Install deps:

```bash
npm install
```

2. Start Convex once (creates/links a dev deployment, generates `convex/_generated/*`, and writes `.env.local`):

```bash
npx convex dev --once
```

3. Start SvelteKit:

```bash
npm run dev
```

## Auth setup

See `AUTH_SETUP.md` for how to obtain and configure:

- `SITE_URL`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL_FROM`
- `VERCEL_PROJECT_NAME` (for preview redirect fallback)
- `VERCEL_PROJECT_URL_ENDING` (for preview redirect fallback)

## Convex Auth notes

- Google sign-in is configured through Convex Auth using `@auth/core/providers/google` with `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
- Magic links are configured through Convex Auth's `Email` provider with `authorize: undefined` (token-only magic-link flow).
- `SITE_URL` is the primary redirect base and default post-auth destination.
- Post-auth redirects via `redirectTo` are validated in `convex/auth.ts`.
- Preview fallback is supported when redirect host starts with `VERCEL_PROJECT_NAME` and ends with `VERCEL_PROJECT_URL_ENDING`.
- If `AUTH_RESEND_KEY` / `AUTH_EMAIL_FROM` are missing, magic-link URLs are logged to console as a dev fallback.
- Google callback URL to register in Google Cloud: `<CONVEX_SITE_URL>/api/auth/callback/google` (for local dev use `.env.local` `PUBLIC_CONVEX_SITE_URL`).

## Vercel notes

This repo uses `@sveltejs/adapter-auto` and does not require a committed `vercel.json` by default.

Typical Vercel setup:

- Framework preset: `SvelteKit` (auto-detected)
- Build command: `npm run build`
- Node runtime: 22.x recommended
- Set frontend public vars in Vercel project env:
  - Production: `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL` (production Convex values)
  - Preview: `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL` (matching preview Convex values)
- Set Convex Auth backend vars (`SITE_URL`, `AUTH_*`, `VERCEL_PROJECT_*`) in Convex deployment env, not in Vercel runtime env

For production Convex deploy + web build pipeline:

```bash
npx convex deploy --cmd 'npm run build'
```

For preview redirect fallback, set `VERCEL_PROJECT_NAME` and `VERCEL_PROJECT_URL_ENDING` in Convex env.
