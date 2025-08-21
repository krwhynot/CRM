# RLS, Auth, and RPC Security

## Golden Rules
- **Never disable RLS** to “make tests pass.”
- RPCs that write must be **SECURITY INVOKER** and respect RLS.

## Policies
- Use `WITH CHECK` for INSERT/UPDATE symmetry with USING.
- Mirror parent row access on junction tables (`opportunity_participants`) by referencing the parent opportunity in the policy.

## Auth Context
- DB functions may rely on `auth.uid()`. If missing, insert/update must fail (no silent fallbacks).
- Provide test harness directions (JWT simulation) in PR descriptions, not in production code.

## Error Surfacing
- Map PG codes to UX:
  - `23505` unique violation → “Value must be unique”
  - `23502` not-null → “Required field is missing”
  - `22P02` invalid_uuid → “Invalid ID”
