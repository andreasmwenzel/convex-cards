# Convex Auth Environment Setup

This project uses Convex Auth with:
- Google OAuth
- Email magic links via Resend

Set these values in your **Convex deployment environment** (not in `.env.local`):

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL_FROM`
- `AUTH_REDIRECT_ORIGINS` (optional CSV for non-`vercel.app` origins)

## 1. Redirect destination behavior

This project uses `redirectTo` from the frontend for OAuth/magic-link return URLs.
`convex/auth.ts` allows:

- `localhost` / `127.0.0.1`
- `*.vercel.app` (so branch previews work without per-branch env changes)
- Exact origins listed in `AUTH_REDIRECT_ORIGINS`

Set `AUTH_REDIRECT_ORIGINS` when you use custom domains:

- Production example: `https://cards.example.com`
- Multiple values: `https://cards.example.com,https://staging.example.com`

## 2. Get Google OAuth credentials

1. Open Google Cloud Console: https://console.cloud.google.com/
2. Create/select a project.
3. Configure OAuth consent screen.
4. Create OAuth client credentials (`Web application`).
5. Add Authorized redirect URI:
   - `<CONVEX_SITE_URL>/api/auth/callback/google`

For local Convex dev, use `.env.local` `PUBLIC_CONVEX_SITE_URL` as `<CONVEX_SITE_URL>`.
For Vercel preview auth, add the callback URI for the preview deployment(s) you want to test.

Use the created values for:
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

## 3. Get Resend credentials

1. Open Resend dashboard: https://resend.com/
2. Create an API key for the project.
3. Verify a sending domain or sender identity.
4. Choose a `from` address that matches your verified sender.

Use these for:
- `AUTH_RESEND_KEY` (API key)
- `AUTH_EMAIL_FROM` (for example `Convex Cards <noreply@yourdomain.com>`)

## 4. Set Convex deployment env vars

Set values separately for each Convex deployment (local/dev/preview/production).

Example values:

```bash
npx convex env set AUTH_GOOGLE_ID your-google-client-id
npx convex env set AUTH_GOOGLE_SECRET your-google-client-secret
npx convex env set AUTH_RESEND_KEY re_xxxxx
npx convex env set AUTH_EMAIL_FROM "Convex Cards <noreply@yourdomain.com>"
npx convex env set AUTH_REDIRECT_ORIGINS "http://localhost:5173,https://cards.example.com"
```

Check what is set:

```bash
npx convex env list
```

## Notes

- `PUBLIC_CONVEX_URL` / `PUBLIC_CONVEX_SITE_URL` in `.env.local` are frontend/public values used by SvelteKit.
- Convex Auth backend settings (`AUTH_*`) must be set via Convex environment variables.
- On Vercel, set `PUBLIC_CONVEX_URL` / `PUBLIC_CONVEX_SITE_URL` in project environment variables for both Production and Preview.
- Preview auth does not require per-branch redirect env updates when using `*.vercel.app`.
- If `AUTH_RESEND_KEY` or `AUTH_EMAIL_FROM` are missing, this project logs magic-link URLs instead of sending email.
