# Deployment Setup (Vercel + Convex)

This runbook configures:

- Local development
- Vercel production deployment
- Vercel preview deployments (branch-based)

## 1) Vercel Project Settings

- Framework preset: `SvelteKit`
- Node runtime: `22.x`
- Build command:

```bash
npx convex deploy --cmd "npm run build"
```

Why this build command:

- Deploys backend first
- Injects `PUBLIC_CONVEX_URL` into the web build automatically (auto-detected for SvelteKit)

## 2) Vercel Environment Variables

Set `CONVEX_DEPLOY_KEY` in Vercel:

- `Production` environment: production Convex deploy key
- `Preview` environment: preview Convex deploy key

No committed `vercel.json` is required right now.

## 3) Convex Environment Variables

Set these in Convex (not `.env.local`) for each deployment:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL_FROM`
- `AUTH_REDIRECT_ORIGINS` (optional CSV for non-Vercel domains)

### Production Convex deployment

```bash
npx convex env set --prod AUTH_GOOGLE_ID <id>
npx convex env set --prod AUTH_GOOGLE_SECRET <secret>
npx convex env set --prod AUTH_RESEND_KEY <key>
npx convex env set --prod AUTH_EMAIL_FROM "Convex Cards <noreply@yourdomain.com>"
npx convex env set --prod AUTH_REDIRECT_ORIGINS "https://<your-prod-domain>"
```

### Preview Convex deployment (per branch)

```bash
npx convex env set --preview-name <branch> AUTH_GOOGLE_ID <id>
npx convex env set --preview-name <branch> AUTH_GOOGLE_SECRET <secret>
npx convex env set --preview-name <branch> AUTH_RESEND_KEY <key>
npx convex env set --preview-name <branch> AUTH_EMAIL_FROM "Convex Cards <noreply@yourdomain.com>"
```

### Local/dev Convex deployment

```bash
npx convex env set AUTH_GOOGLE_ID <id>
npx convex env set AUTH_GOOGLE_SECRET <secret>
npx convex env set AUTH_RESEND_KEY <key>
npx convex env set AUTH_EMAIL_FROM "Convex Cards <noreply@yourdomain.com>"
npx convex env set AUTH_REDIRECT_ORIGINS "http://localhost:5173"
```

## 4) Google OAuth Callback URLs

Add callback URLs in Google Cloud for each Convex deployment you use:

- Local Convex deployment callback
- Production Convex deployment callback
- Preview Convex deployment callback(s)

Format:

```text
<CONVEX_SITE_URL>/api/auth/callback/google
```

Important:

- Callback is on Convex URL (`CONVEX_SITE_URL`)
- Redirect destination comes from the frontend `redirectTo` param (validated in `convex/auth.ts`)

## 5) Local Development Workflow

```bash
npx convex dev --once
npm run dev
```

`npx convex dev --once` writes `.env.local` with:

- `PUBLIC_CONVEX_URL`
- `PUBLIC_CONVEX_SITE_URL`

## 6) Verification Checklist

- Local:
  - App loads on `http://localhost:5173`
  - Google sign-in starts and returns
  - Magic link flow returns and signs in
- Preview:
  - Branch preview deploy loads
  - Auth redirects back to preview URL
  - Magic link works on preview URL
- Production:
  - App loads on prod domain
  - Google and magic-link auth both work
