# principal_distributor_relationships

## Columns

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|---------|
| id | uuid | NO | gen_random_uuid() | |
| principal_id | uuid | NO | | |
| distributor_id | uuid | NO | | |
| territory | text | YES | | |
| contract_start_date | date | YES | | |
| contract_end_date | date | YES | | |
| commission_rate | numeric | YES | | |
| terms | text | YES | | |
| is_active | boolean | YES | true | |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

## Primary Key
- principal_distributor_relationships_pkey: (id)

## Foreign Keys
- principal_distributor_relationships_principal_id_fkey: principal_id → organizations(id)
- principal_distributor_relationships_distributor_id_fkey: distributor_id → organizations(id)

## Check Constraints
None

## Indexes
- principal_distributor_relationships_pkey: UNIQUE btree (id)
- principal_distributor_relations_principal_id_distributor_id_key: UNIQUE btree (principal_id, distributor_id)

## RLS Enabled
Yes