# Convex Cards

A starter scaffold for a multiplayer cards app using:

- **SvelteKit** (TypeScript)
- **Tailwind CSS v4**
- **Convex** for database/functions
- **Convex Auth** with:
  - Google OAuth
  - Email magic links (via Resend)
- **SvelteKit Node adapter** for Railway deployment

## What is scaffolded

- SvelteKit app initialized with `npx sv create`
- Tailwind installed with `npx sv add tailwindcss`
- Railway-friendly Node adapter and `npm run start`
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

2. Copy env template:

```bash
cp .env.example .env
```

3. Fill in auth provider values:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL_FROM`

4. Start Convex (first run will create/link a deployment):

```bash
npx convex dev
```

This generates `convex/_generated/*` and sets `PUBLIC_CONVEX_URL` for local dev.

5. Start SvelteKit:

```bash
npm run dev
```

## Convex Auth notes

- Google sign-in is configured through Convex Auth using `@auth/core/providers/google` with `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
- Magic links are configured through Convex Auth's `Email` provider with `authorize: undefined` (token-only magic-link flow).
- If `AUTH_RESEND_KEY` / `AUTH_EMAIL_FROM` are missing, magic-link URLs are logged to console as a dev fallback.
- Google callback URL to register in Google Cloud: `<CONVEX_URL>/api/auth/callback/google` (for local `convex dev`, use the URL shown by Convex).

## Railway notes

This repo includes `railway.json` and uses the Node adapter.

Typical Railway setup:

- Build command: `npm run build`
- Start command: `npm run start`
- Add env vars from `.env.example`

For production Convex deploy + web build pipeline:

```bash
npx convex deploy --cmd-url-env-var-name PUBLIC_CONVEX_URL --cmd 'npm run build'
```
