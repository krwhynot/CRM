# products

## Columns

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|---------|
| id | uuid | NO | gen_random_uuid() | |
| principal_id | uuid | NO | | |
| name | text | NO | | |
| description | text | YES | | |
| category | product_category | NO | | |
| sku | text | YES | | |
| unit_of_measure | text | YES | | |
| unit_cost | numeric | YES | | |
| list_price | numeric | YES | | |
| min_order_quantity | integer | YES | | |
| season_start | integer | YES | | |
| season_end | integer | YES | | |
| shelf_life_days | integer | YES | | |
| storage_requirements | text | YES | | |
| specifications | text | YES | | |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |
| created_by | uuid | YES | | |
| updated_by | uuid | YES | | |
| deleted_at | timestamptz | YES | | |

## Primary Key
- products_pkey: (id)

## Foreign Keys
- products_principal_id_fkey: principal_id → organizations(id)
- products_created_by_fkey: created_by → auth.users(id)
- products_updated_by_fkey: updated_by → auth.users(id)

## Check Constraints
None

## Indexes
- products_pkey: UNIQUE btree (id)
- products_sku_key: UNIQUE btree (sku)
- idx_products_principal: btree (principal_id)
- idx_products_principal_active: btree (principal_id, deleted_at) WHERE (deleted_at IS NULL)

## RLS Enabled
Yes