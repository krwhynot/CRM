# Database Schema Setup Instructions

## Overview
The database schema for KitchenPantry CRM has been designed and is ready to be applied to your Supabase project.

## Files Created
- `database/migrations/001_initial_crm_schema.sql` - Complete schema migration
- `database/schema/001_initial_schema.sql` - Same migration with detailed documentation
- `database/README_SCHEMA_DESIGN.md` - Comprehensive design documentation

## How to Apply the Schema

### Option 1: Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ydpqaevzyvqvwqupskxn`
3. Navigate to **SQL Editor**
4. Copy the contents of `database/migrations/001_initial_crm_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Local Supabase CLI
```bash
# If you have supabase CLI configured locally
supabase db reset --local
psql -h localhost -p 54322 -U postgres -d postgres -f database/migrations/001_initial_crm_schema.sql
```

### Option 3: Direct psql Connection
```bash
# Connect directly to your Supabase database
psql "postgresql://postgres:[password]@db.ydpqaevzyvqvwqupskxn.supabase.co:5432/postgres" \
  -f database/migrations/001_initial_crm_schema.sql
```

## Verification
After applying the schema, run these queries to verify success:

```sql
-- Check all tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check indexes were created
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Check ENUM types were created
SELECT enumname, enumlabel 
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
ORDER BY enumname, enumlabel;
```

Expected results:
- **7 tables**: contacts, interactions, opportunities, opportunity_products, organizations, principal_distributor_relationships, products
- **7 ENUM types**: contact_role, interaction_type, opportunity_priority, opportunity_stage, organization_size, organization_type, product_category
- **20+ indexes** for optimized performance

## Next Steps
Once schema is applied:
1. ✅ **Task 3 Complete**: Database schema implemented
2. 🔄 **Task 4**: Generate TypeScript types from schema
3. 🔄 **Task 5**: Implement Row Level Security (RLS) policies
4. 🔄 **Task 6**: Create API service layer

## Need Help?
If you encounter any issues:
1. Check Supabase dashboard for error messages
2. Verify you have necessary permissions
3. Ensure the database connection is active
4. Review the schema documentation in `database/README_SCHEMA_DESIGN.md`