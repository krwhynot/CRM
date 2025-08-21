# Supabase Migrations & SQL Style

## Source of Truth
- All schema changes go through `supabase/migrations/*`. No ad-hoc prod changes.
- After a migration: `npx supabase gen types typescript --project-id=<PROJECT_ID> > src/lib/database.types.ts`

## SQL Conventions
- Set `search_path = public, auth` inside SECURITY DEFINER functions.
- Prefer `text + CHECK` for agile code lists unless governance requires enums.
- Use **named** constraints and **partial unique indexes** for soft-delete semantics.
- Always include comments on tables/columns/constraints for future typegen consumers.

## Safety Helpers
- Keep and reuse:
  - Universal audit trigger `set_audit_fields()`.
  - Participant role enforcement trigger.
  - Interaction consistency trigger.

## Views & MVs
- Recreate dependent views after column changes.
- For materialized views: ensure a unique index exists; refresh **concurrently** and **not inside** a transaction.
