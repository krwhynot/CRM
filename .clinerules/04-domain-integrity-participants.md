# Domain Integrity: Participants, Orgs, Interactions

## Opportunity Participants (junction table)
- Enforce one primary per role:
  - Unique index: `(opportunity_id, role) WHERE is_primary`
- Role/Org compatibility:
  - Trigger must verify: 'principal' only if org has `organization_roles(role='principal')`, same for 'distributor'.
- Upsert pattern only on `(opportunity_id, organization_id, role)`; update fields on conflict.

## Organizations
- Do not rely on legacy boolean flags (`is_principal`, `is_distributor`) for logic.
- Use `organization_roles` as the single source of truth; keep legacy flags read-only if they exist.

## Interactions
- Every interaction must belong to an opportunity (no orphans).
- Enforce org alignment:
  - `interaction.organization_id` and `contact.organization_id` must match the opportunity’s org.

## Audit
- Keep `created_by`/`updated_by` NOT NULL with `set_audit_fields()` trigger attached to core tables.

## Performance
- Add functional/partial indexes that match query patterns (participants by role, primary flags).
