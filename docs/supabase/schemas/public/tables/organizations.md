# organizations

## Columns

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|---------|
| id | uuid | NO | gen_random_uuid() | |
| name | text | NO | | |
| type | organization_type | NO | | |
| description | text | YES | | |
| phone | text | YES | | |
| email | text | YES | | |
| website | text | YES | | |
| address_line_1 | text | YES | | |
| address_line_2 | text | YES | | |
| city | text | YES | | |
| state_province | text | YES | | |
| postal_code | text | YES | | |
| country | text | YES | 'US'::text | |
| annual_revenue | numeric(15,2) | YES | | |
| employee_count | integer | YES | | |
| industry | text | YES | | |
| parent_organization_id | uuid | YES | | |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |
| created_by | uuid | YES | | |
| updated_by | uuid | YES | | |
| deleted_at | timestamptz | YES | | |
| size | organization_size | YES | | |
| notes | text | YES | | |
| is_active | boolean | YES | true | |
| is_principal | boolean | YES | false | TRUE if this organization is a Principal (manufacturer/supplier) |
| is_distributor | boolean | YES | false | TRUE if this organization is a Distributor |
| segment | text | NO | 'Standard'::text | Business segment classification (e.g. Premium, Value, Specialty, Standard) |
| priority | varchar(1) | NO | 'C'::character varying | Business priority level: A=Highest, B=High, C=Medium, D=Low priority |
| primary_manager_name | text | YES | | Account manager name from Excel import |
| secondary_manager_name | text | YES | | Secondary manager name from Excel import |
| import_notes | text | YES | | Notes from Excel import including unmapped columns |
| search_tsv | tsvector | YES | | |

## Primary Key
- organizations_pkey: (id)

## Foreign Keys
- organizations_parent_organization_id_fkey: parent_organization_id → organizations(id)

## Check Constraints
- organizations_priority_check: priority IN ('A', 'B', 'C', 'D')

## Indexes
- idx_organizations_active_name: btree (deleted_at, name) WHERE (deleted_at IS NULL)
- idx_organizations_name_text: gin (to_tsvector('english', name)) WHERE (deleted_at IS NULL)
- idx_organizations_name_trgm: gin (name gin_trgm_ops) WHERE (deleted_at IS NULL)
- idx_organizations_owner_deleted: btree (created_by, deleted_at) WHERE (deleted_at IS NULL)
- idx_organizations_parent: btree (parent_organization_id) WHERE (parent_organization_id IS NOT NULL)
- idx_organizations_search_tsv: gin (search_tsv)
- idx_organizations_type: btree (type)
- organizations_pkey: UNIQUE btree (id)

## RLS Enabled
Yes