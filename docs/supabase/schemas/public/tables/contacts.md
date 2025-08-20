# contacts

## Columns

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|---------|
| id | uuid | NO | gen_random_uuid() | |
| organization_id | uuid | NO | | |
| first_name | text | NO | | |
| last_name | text | NO | | |
| title | text | YES | | |
| role | contact_role | YES | | |
| email | text | YES | | |
| phone | text | YES | | |
| mobile_phone | text | YES | | |
| department | text | YES | | |
| linkedin_url | text | YES | | |
| notes | text | YES | | |
| is_primary_contact | boolean | YES | false | |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |
| created_by | uuid | YES | | |
| updated_by | uuid | YES | | |
| deleted_at | timestamptz | YES | | |
| purchase_influence | varchar | NO | 'Unknown'::character varying | Contact influence on purchasing decisions: High, Medium, Low, Unknown |
| decision_authority | varchar | NO | 'End User'::character varying | Contact decision-making authority: Decision Maker, Influencer, End User, Gatekeeper |
| search_tsv | tsvector | YES | | |

## Primary Key
- contacts_pkey: (id)

## Foreign Keys
- contacts_organization_id_fkey: organization_id → organizations(id)
- contacts_created_by_fkey: created_by → auth.users(id)
- contacts_updated_by_fkey: updated_by → auth.users(id)

## Check Constraints
- contacts_purchase_influence_check: purchase_influence::text = ANY (ARRAY['High'::character varying, 'Medium'::character varying, 'Low'::character varying, 'Unknown'::character varying]::text[])
- contacts_decision_authority_check: decision_authority::text = ANY (ARRAY['Decision Maker'::character varying, 'Influencer'::character varying, 'End User'::character varying, 'Gatekeeper'::character varying]::text[])

## Indexes
- contacts_pkey: UNIQUE btree (id)
- idx_contacts_active_name: btree (deleted_at, last_name, first_name) WHERE (deleted_at IS NULL)
- idx_contacts_email: btree (email) WHERE (email IS NOT NULL)
- idx_contacts_name_trgm: gin ((((first_name || ' '::text) || last_name)) gin_trgm_ops) WHERE (deleted_at IS NULL)
- idx_contacts_org_active: btree (organization_id, deleted_at) WHERE (deleted_at IS NULL)
- idx_contacts_organization: btree (organization_id)
- idx_contacts_owner_deleted: btree (created_by, deleted_at) WHERE (deleted_at IS NULL)
- idx_contacts_primary_per_org: UNIQUE btree (organization_id) WHERE ((is_primary_contact = true) AND (deleted_at IS NULL))
- idx_contacts_search_tsv: gin (search_tsv)

## RLS Enabled
Yes