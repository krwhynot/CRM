# Testing (MCP Playwright), Observability & Rollback

## Testing Strategy
- Production: **read-only** MCP Playwright checks (navigation, network timings, no writes).
- Staging/branch: write tests for multi-principal flows, negative cases (double primary → 23505, unauthorized → 401/403).

## Supabase Logs First
- For 400/409 errors: check Supabase **API (PostgREST)** logs and **Auth** logs for authoritative `code/message/details/hint`.
- Provide SQL “dry-run” helpers with `set_config('request.jwt.claims', …)` only for **local dev/staging**.

## Performance Gates
- Dashboard load < 2s; participant queries median < 100ms.
- Use `EXPLAIN ANALYZE (BUFFERS, TIMING)` to validate heavy queries before merging.

## Rollback Readiness
- For each migration, include:
  - Reverse DDL (DROP INDEX/VIEW, ADD COLUMN back, etc.)
  - Data restoration notes if any backfills were run.

## CI Gates
- `pnpm typecheck && pnpm eslint . --max-warnings=0`
- Post-migration: regenerate types and ensure compilation is clean.

## Observability
- Log RPC outcomes (opportunity id + participant count) and error codes; do not log secrets or full JWTs.
