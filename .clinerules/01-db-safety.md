# DB Safety & Environment Guardrails

## Absolute Rules
- Never run destructive SQL (DROP/DELETE/ALTER … DROP COLUMN) against production.
- All write operations must target **staging** or a Supabase branch env. Production is **read-only** unless the user explicitly approves a pre-reviewed migration plan.

## Environment Gates
- Before any write:
  - Confirm `MCP_TARGET === "stg"` or a Supabase **branch** URL is configured.
  - Confirm the Supabase project ID matches the intended env.
  - If env is ambiguous → stop and ask for explicit path (STG URL or branch).

## Transactions & Timeouts
- Wrap migration DDL/DML in:
  - `BEGIN; SET LOCAL statement_timeout = '5min'; … COMMIT;`
- Default to **dry-run** semantics:
  - Provide a `BEGIN; … ROLLBACK;` preview when asked to “try it” or “show the effect”.

## Secrets & Safety
- Do not print keys/tokens. Use env vars.
- Do not modify `src/lib/database.types.ts` by hand (it’s generated).

## Confirmation Steps (Destructive Ops)
- Summarize the impact + objects touched + fallback.
- Require “CONFIRM: proceed” from the user before executing.
