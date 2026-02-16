# Proposed Agent Rules

## Convex workflow rules

1. If any file under `convex/` changes, run:
   - `npx convex codegen`
   - `npm run check`
2. Never run `npm run check` first after backend schema/function changes.
3. When Convex commands fail, capture exact stderr and identify missing env/credential precisely.

## Documentation rules

1. Keep architecture/setup/roadmap docs updated in the same PR when workflows change.
2. Include command examples that match `package.json` scripts.
3. Keep instructions non-interactive friendly (CI/headless safe).

## Delivery rules

1. Report a concise status section: done, blocked, next.
2. Include exact commands executed for verification.
3. If blocked on credentials, stop retry loops and surface required variable/token explicitly.
