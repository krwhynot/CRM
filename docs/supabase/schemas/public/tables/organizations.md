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
| industry | text | YES | | |
| parent_organization_id | uuid | YES | | |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |
| created_by | uuid | NO | | |
| updated_by | uuid | YES | | |
| deleted_at | timestamptz | YES | | |
| notes | text | YES | | |
| is_active | boolean | YES | true | |
| is_principal | boolean | YES | false | TRUE if this organization is a Principal (manufacturer/supplier) |
| is_distributor | boolean | YES | false | TRUE if this organization is a Distributor |
| segment | text | NO | 'Standard'::text | Business segment classification (e.g. Premium, Value, Specialty, Standard) |
| priority | varchar(1) | NO | 'C'::character varying | Business priority level: A=Highest, B=High, C=Medium, D=Low priority |
| primary_manager_name | text | YES | | Primary manager name (text field for Excel import compatibility) |
| secondary_manager_name | text | YES | | Secondary manager name (text field for Excel import compatibility) |
| import_notes | text | YES | | Notes and unmapped data from Excel import process |
| search_tsv | tsvector | YES | | Full-text search vector |

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
- idx_organizations_role_flags: btree (is_principal, is_distributor) WHERE (deleted_at IS NULL)
- idx_organizations_search_active: gin (search_tsv) WHERE (deleted_at IS NULL)
- idx_organizations_search_tsv: gin (search_tsv)
- idx_organizations_type: btree (type)
- idx_organizations_unique_name_type_active: UNIQUE btree (name, type) WHERE (deleted_at IS NULL)
- organizations_pkey: UNIQUE btree (id)

## RLS Enabled
Yes

## Relationships

### Child Tables
- **organization_roles** (via `organization_id`)
  - One organization can have multiple business roles
  - Supports flexible role assignments (principal, distributor, customer, prospect, vendor)
  - Enables role-based business logic and access control

- **contacts** (via `organization_id`)
  - One organization can have many contacts
  - Tracks individuals within the organization

- **opportunity_participants** (via `organization_id`)
  - Organizations can participate in opportunities with various roles
  - Many-to-many relationship supporting complex deal structures

- **products** (via `principal_id`)
  - When organization has 'principal' role, can own/manufacture products
  - One-to-many relationship for product ownership

- **principal_distributor_relationships** (via `principal_id` or `distributor_id`)
  - Many-to-many relationships between principals and distributors
  - Supports complex supply chain relationships

### Parent Tables
- **organizations** (via `parent_organization_id`)
  - Self-referencing for corporate hierarchies
  - Supports subsidiary and parent company relationships