# Setup and Developer Workflow

## Prerequisites

- Node.js + npm
- Convex project/deployment configured
- Valid Convex auth credentials for CLI in non-interactive environments (for cloud deployments)

## Install

```bash
npm install
```

## Environment

Expected baseline env vars:

- `CONVEX_DEPLOYMENT`
- `PUBLIC_CONVEX_URL`
- `PUBLIC_CONVEX_SITE_URL`

For CI/non-interactive workflows targeting a cloud deployment, provide a Convex access token environment variable recognized by the Convex CLI.

## Local development (cloud deployment)

Terminal 1:

```bash
npm run convex:dev
```

Terminal 2:

```bash
npm run dev
```

## Local development (agent-mode anonymous fallback)

If non-interactive cloud auth is unavailable, run anonymous local Convex mode:

Terminal 1:

```bash
npm run convex:dev:agent
```

Terminal 2:

```bash
npm run dev
```

## Checks

Always sync generated API types first:

```bash
npx convex codegen
npm run check
```

For anonymous agent mode in non-interactive sessions:

```bash
npm run codegen:agent
npm run check
```
