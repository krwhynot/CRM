# interactions

## Columns

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|---------|
| id | uuid | NO | gen_random_uuid() | |
| type | interaction_type | NO | | |
| subject | text | NO | | |
| description | text | YES | | |
| interaction_date | timestamptz | NO | now() | |
| duration_minutes | integer | YES | | |
| contact_id | uuid | YES | | |
| organization_id | uuid | YES | | |
| opportunity_id | uuid | YES | | |
| follow_up_required | boolean | YES | false | |
| follow_up_date | date | YES | | |
| follow_up_notes | text | YES | | |
| outcome | text | YES | | |
| attachments | text[] | YES | | |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |
| created_by | uuid | YES | | |
| updated_by | uuid | YES | | |
| deleted_at | timestamptz | YES | | |

## Primary Key
- interactions_pkey: (id)

## Foreign Keys
- interactions_contact_id_fkey: contact_id → contacts(id)
- interactions_organization_id_fkey: organization_id → organizations(id)
- interactions_opportunity_id_fkey: opportunity_id → opportunities(id)
- interactions_created_by_fkey: created_by → auth.users(id)
- interactions_updated_by_fkey: updated_by → auth.users(id)

## Check Constraints
None

## Indexes
- interactions_pkey: UNIQUE btree (id)
- idx_interactions_composite: btree (opportunity_id, interaction_date DESC, deleted_at) WHERE (deleted_at IS NULL)
- idx_interactions_contact: btree (contact_id)
- idx_interactions_date: btree (interaction_date)
- idx_interactions_opportunity: btree (opportunity_id)

## RLS Enabled
Yes