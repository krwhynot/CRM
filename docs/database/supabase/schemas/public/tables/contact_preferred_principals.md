# contact_preferred_principals

## Columns

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|---------|
| id | uuid | NO | gen_random_uuid() | |
| contact_id | uuid | NO | | |
| principal_organization_id | uuid | NO | | |
| advocacy_strength | integer | YES | 5 | Scale 1-10: How strongly this contact advocates for this Principal. 1=Weak advocacy, 10=Strong advocacy |
| advocacy_notes | text | YES | | Notes about the advocacy relationship, history, or context |
| relationship_type | text | YES | 'professional'::text | Type of relationship: professional, personal, historical, competitive |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |
| created_by | uuid | YES | | |
| updated_by | uuid | YES | | |
| deleted_at | timestamptz | YES | | |

## Primary Key
- contact_preferred_principals_pkey: (id)

## Foreign Keys
- contact_preferred_principals_contact_id_fkey: contact_id → contacts(id)
- contact_preferred_principals_principal_id_fkey: principal_organization_id → organizations(id)
- contact_preferred_principals_created_by_fkey: created_by → auth.users(id)
- contact_preferred_principals_updated_by_fkey: updated_by → auth.users(id)

## Check Constraints
- contact_preferred_principals_advocacy_strength_check: advocacy_strength >= 1 AND advocacy_strength <= 10
- contact_preferred_principals_relationship_type_check: relationship_type = ANY (ARRAY['professional'::text, 'personal'::text, 'historical'::text, 'competitive'::text])

## Indexes
- contact_preferred_principals_pkey: UNIQUE btree (id)
- contact_preferred_principals_unique_relationship: UNIQUE btree (contact_id, principal_organization_id)

## RLS Enabled
Yes