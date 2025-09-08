# interaction_type_lu

## Columns

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|---------|
| code | text | NO | | |
| display_name | text | NO | | |
| description | text | YES | | |
| sort_order | integer | NO | | |
| is_active | boolean | NO | true | |

## Primary Key
- interaction_type_lu_pkey: (code)

## Foreign Keys
None

## Check Constraints
None

## Indexes
- interaction_type_lu_pkey: UNIQUE btree (code)

## RLS Enabled
No