# opportunity_products

## Columns

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|---------|
| id | uuid | NO | gen_random_uuid() | |
| opportunity_id | uuid | NO | | |
| product_id | uuid | NO | | |
| quantity | integer | NO | 1 | |
| unit_price | numeric | YES | | |
| extended_price | numeric | YES | | |
| notes | text | YES | | |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

## Primary Key
- opportunity_products_pkey: (id)

## Foreign Keys
- opportunity_products_opportunity_id_fkey: opportunity_id → opportunities(id)
- opportunity_products_product_id_fkey: product_id → products(id)

## Check Constraints
None

## Indexes
- opportunity_products_pkey: UNIQUE btree (id)
- opportunity_products_opportunity_id_product_id_key: UNIQUE btree (opportunity_id, product_id)

## RLS Enabled
Yes