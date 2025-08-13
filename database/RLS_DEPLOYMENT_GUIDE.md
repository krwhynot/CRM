# RLS Deployment Guide - KitchenPantry CRM

## Overview

This guide provides step-by-step instructions for deploying Row Level Security (RLS) policies to your Supabase database. Follow these instructions carefully to ensure proper security implementation.

## Prerequisites

Before deploying RLS policies, ensure you have:

1. **Supabase project set up** with the initial schema deployed
2. **Database access** via Supabase Dashboard or CLI
3. **Admin/Owner permissions** on the Supabase project
4. **Initial schema applied** (migration `001_initial_crm_schema.sql`)

## Deployment Methods

### Method 1: Supabase Dashboard (Recommended for Development)

#### Step 1: Access SQL Editor
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query

#### Step 2: Deploy RLS Policies
1. Copy the entire contents of `database/migrations/002_rls_policies.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute the migration
4. Verify successful execution (no error messages)

#### Step 3: Validate Deployment
1. Run the validation queries from `database/RLS_TEST_QUERIES.sql`
2. Check that RLS is enabled on all tables
3. Verify helper functions are created
4. Test basic access patterns

### Method 2: Supabase CLI (Recommended for Production)

#### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

#### Step 2: Initialize and Link Project
```bash
# In your project directory
supabase init
supabase link --project-ref YOUR_PROJECT_REF
```

#### Step 3: Apply Migration
```bash
# Copy migration file to migrations directory
cp database/migrations/002_rls_policies.sql supabase/migrations/

# Apply the migration
supabase db push
```

#### Step 4: Verify Deployment
```bash
# Run test queries
supabase db reset --linked
psql -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -d postgres -U postgres -f database/RLS_TEST_QUERIES.sql
```

### Method 3: Direct Database Connection

#### Step 1: Get Connection Details
From Supabase Dashboard → Settings → Database:
- Host: `db.YOUR_PROJECT_REF.supabase.co`
- Port: `5432`
- Database: `postgres`
- Username: `postgres`
- Password: [Your database password]

#### Step 2: Connect and Deploy
```bash
# Connect to database
psql -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -d postgres -U postgres

# Run migration
\i database/migrations/002_rls_policies.sql

# Run tests
\i database/RLS_TEST_QUERIES.sql

# Exit
\q
```

## Post-Deployment Validation

### 1. Verify RLS Status
```sql
-- Check RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'organizations', 'contacts', 'products', 
    'opportunities', 'opportunity_products', 
    'interactions', 'principal_distributor_relationships'
);
```

Expected result: All tables should show `rowsecurity = true`

### 2. Check Policy Count
```sql
-- Count policies by table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

Expected results:
- `contacts`: 4 policies
- `interactions`: 4 policies  
- `opportunities`: 4 policies
- `opportunity_products`: 4 policies
- `organizations`: 4 policies
- `principal_distributor_relationships`: 4 policies
- `products`: 4 policies

### 3. Test Helper Functions
```sql
-- Test function availability
SELECT 
    proname as function_name,
    prosecdef as "Security Definer"
FROM pg_proc 
WHERE proname IN (
    'user_has_org_access',
    'user_is_admin', 
    'user_accessible_org_ids'
);
```

Expected result: All 3 functions should be present with `prosecdef = true`

### 4. Test Access Control
```sql
-- Test basic access (should work without errors)
SELECT * FROM user_data_summary;
SELECT * FROM user_accessible_organizations;
```

## Environment-Specific Configurations

### Development Environment

**Configuration:**
- More permissive policies for testing
- Debug views enabled
- Verbose logging

**Setup:**
```sql
-- Enable additional debugging
CREATE OR REPLACE VIEW rls_debug_info AS
SELECT 
    'RLS Debug Mode' as mode,
    auth.uid() as current_user,
    user_is_admin() as is_admin,
    NOW() as timestamp;
```

### Staging Environment

**Configuration:**
- Production-like policies
- Limited debug information
- Performance monitoring enabled

**Setup:**
```sql
-- Enable performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitor RLS performance
SELECT query, calls, mean_time 
FROM pg_stat_statements 
WHERE query LIKE '%user_has_org_access%';
```

### Production Environment

**Configuration:**
- Strict security policies
- No debug views
- Full audit logging
- Performance optimization

**Additional Setup:**
```sql
-- Drop debug views in production
DROP VIEW IF EXISTS rls_debug_info;

-- Enable audit logging
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action TEXT,
    table_name TEXT,
    record_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## Application Integration

### Environment Variables
Update your application's environment configuration:

```env
# .env.development
VITE_SUPABASE_RLS_ENABLED=true
VITE_SUPABASE_DEBUG_RLS=true

# .env.production  
VITE_SUPABASE_RLS_ENABLED=true
VITE_SUPABASE_DEBUG_RLS=false
```

### Supabase Client Configuration
```typescript
// src/config/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // RLS is handled automatically by Supabase
  // No additional configuration needed
})
```

### Application Code Updates
```typescript
// Example: Organization access check
export async function getAccessibleOrganizations() {
  // RLS automatically filters results
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  // No additional filtering needed - RLS handles it
  return { data, error }
}

// Example: Create organization with proper user assignment
export async function createOrganization(orgData: Partial<Organization>) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      ...orgData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      updated_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single()
  
  return { data, error }
}
```

## Monitoring and Maintenance

### Performance Monitoring
```sql
-- Monitor RLS function performance
SELECT 
    funcname,
    calls,
    total_time,
    mean_time,
    self_time
FROM pg_stat_user_functions 
WHERE funcname LIKE 'user_%'
ORDER BY total_time DESC;

-- Monitor slow queries with RLS
SELECT 
    query,
    calls,
    mean_time,
    total_time
FROM pg_stat_statements 
WHERE query LIKE '%organizations%'
AND mean_time > 100  -- queries taking > 100ms
ORDER BY total_time DESC;
```

### Regular Maintenance Tasks

#### Weekly:
```sql
-- Check for orphaned records
SELECT * FROM user_data_summary;

-- Verify policy effectiveness
\i database/RLS_TEST_QUERIES.sql
```

#### Monthly:
```sql
-- Analyze helper function performance
ANALYZE;

-- Review access patterns
SELECT 
    date_trunc('day', NOW()) as date,
    COUNT(DISTINCT auth.uid()) as active_users,
    AVG((SELECT COUNT(*) FROM user_accessible_org_ids())) as avg_accessible_orgs
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), '1 day') as date;
```

## Troubleshooting

### Common Issues

#### Issue 1: "Permission denied" errors after RLS deployment
**Cause:** RLS policies too restrictive or user not properly authenticated

**Solution:**
```sql
-- Check authentication status
SELECT auth.uid(), auth.jwt();

-- Test basic access
SELECT user_is_admin();
SELECT COUNT(*) FROM user_accessible_org_ids();

-- Temporarily grant broader access for debugging
-- (Remove after fixing)
CREATE POLICY temp_debug_access ON organizations FOR ALL TO authenticated USING (true);
```

#### Issue 2: Performance degradation
**Cause:** Inefficient RLS policies or missing indexes

**Solution:**
```sql
-- Check query plans
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM organizations WHERE name = 'Test';

-- Add missing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_created_by 
ON organizations(created_by) WHERE created_by IS NOT NULL;
```

#### Issue 3: Users can't access expected data
**Cause:** Incomplete organization relationships or access logic

**Solution:**
```sql
-- Debug user access
SELECT * FROM user_accessible_organizations;

-- Check organization relationships
SELECT o1.name as parent, o2.name as child
FROM organizations o1 
JOIN organizations o2 ON o1.id = o2.parent_organization_id;

-- Verify business relationship data
SELECT * FROM principal_distributor_relationships;
```

## Rollback Procedures

### Emergency Rollback
If RLS policies cause critical issues:

```sql
-- EMERGENCY: Disable RLS on all tables
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE principal_distributor_relationships DISABLE ROW LEVEL SECURITY;
```

### Complete Rollback
Use the rollback migration:

```bash
# Via Supabase CLI
psql -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -d postgres -U postgres \
  -f database/migrations/002_rls_policies_rollback.sql

# Or via Dashboard
# Copy and run contents of 002_rls_policies_rollback.sql
```

### Rollback Verification
```sql
-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Should return no rows

-- Verify policies are removed  
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- Should return 0

-- Verify functions are removed
SELECT proname FROM pg_proc WHERE proname LIKE 'user_%';
-- Should return no rows
```

## Security Best Practices

### 1. Principle of Least Privilege
- Users only get access to data they need
- Regular review of access patterns
- Remove unnecessary permissions promptly

### 2. Defense in Depth
- RLS policies + application-level validation
- Input sanitization at application layer
- API rate limiting and monitoring

### 3. Regular Security Audits
- Monthly policy effectiveness review
- Quarterly access pattern analysis
- Annual security architecture review

### 4. Incident Response Plan
- Document rollback procedures
- Maintain emergency contacts
- Practice incident response scenarios

This deployment guide ensures safe, reliable implementation of RLS policies for the KitchenPantry CRM system.