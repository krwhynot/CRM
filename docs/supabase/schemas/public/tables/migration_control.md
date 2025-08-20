# migration_control

## Columns

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|---------|
| phase_number | integer | NO | | |
| phase_name | text | NO | | |
| status | text | NO | 'pending'::text | |
| started_at | timestamptz | YES | | |
| completed_at | timestamptz | YES | | |
| error_message | text | YES | | |
| rollback_sql | text | YES | | |

## Primary Key
- migration_control_pkey: (phase_number)

## Foreign Keys
None

## Check Constraints
None

## Indexes
- migration_control_pkey: UNIQUE btree (phase_number)

## RLS Enabled
No