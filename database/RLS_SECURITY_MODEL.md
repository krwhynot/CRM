# KitchenPantry CRM - Row Level Security (RLS) Model

## Overview

This document describes the comprehensive Row Level Security implementation for the KitchenPantry CRM system. The security model ensures proper data isolation in a multi-tenant environment while maintaining the flexibility needed for food service relationship management.

## Security Principles

### 1. Defense in Depth
- **Application-level validation** + **Database-level enforcement**
- **Multiple security layers** prevent unauthorized access
- **Principle of least privilege** - users only access necessary data

### 2. Multi-Tenant Data Isolation
- **User-based ownership** - Users can access data they created
- **Organization-based sharing** - Shared access within business relationships
- **Role-based permissions** - Different access levels for different user types

### 3. Business Logic Alignment
- **Territory management** - Sales managers access their assigned territories
- **Principal-distributor relationships** - Proper business hierarchy enforcement
- **Customer data protection** - Customer data only accessible to authorized users

## Access Control Patterns

### Primary Access Patterns

#### 1. Direct Ownership
```sql
created_by = auth.uid()
```
Users can always access data they created.

#### 2. Organization Membership
```sql
user_has_org_access(organization_id)
```
Users can access data from organizations they're associated with through any business relationship.

#### 3. Business Relationship Access
```sql
-- Opportunities: Access via customer, principal, or distributor relationship
user_has_org_access(organization_id) 
OR user_has_org_access(principal_organization_id)
OR user_has_org_access(distributor_organization_id)
```

#### 4. Administrative Override
```sql
user_is_admin()
```
Admin users can access all data for system management.

### Secondary Access Patterns

#### 5. Hierarchical Organization Access
- Parent-child organization relationships
- Implemented in `user_accessible_org_ids()` function
- Recursive CTE for organization hierarchy traversal

#### 6. Cross-Entity Relationship Access
- Access products through opportunities
- Access contacts through organizations
- Access interactions through opportunities

## Table-Specific Security Models

### Organizations Table
**Access Logic:**
- **SELECT**: Owner, associated users, or admin
- **INSERT**: Only authenticated users (become owner)
- **UPDATE**: Owner, associated users, or admin
- **DELETE**: Owner or admin only

**Key Constraints:**
- Creator cannot be changed during updates
- Parent organization relationships respected

### Contacts Table
**Access Logic:**
- **SELECT**: Organization access required
- **INSERT**: Organization access required
- **UPDATE**: Organization access required
- **DELETE**: Organization access or ownership required

**Key Constraints:**
- Must have access to parent organization
- Creator field protected from modification

### Products Table
**Access Logic:**
- **SELECT**: Principal organization access required
- **INSERT**: Principal organization access + type validation
- **UPDATE**: Principal organization access required
- **DELETE**: Principal organization access or ownership

**Key Constraints:**
- Principal organization must be type 'principal'
- Only accessible through principal relationships

### Opportunities Table
**Access Logic:**
- **SELECT**: Customer, principal, or distributor access
- **INSERT**: Customer organization access required
- **UPDATE**: Access through any related organization
- **DELETE**: Customer organization access or ownership

**Key Constraints:**
- Primary contact must belong to customer organization
- Principal/distributor organizations validated by type

### Opportunity Products Table
**Access Logic:**
- **SELECT**: Access through opportunity OR product
- **INSERT**: Access to both opportunity AND product required
- **UPDATE**: Opportunity access required
- **DELETE**: Opportunity access required

**Key Constraints:**
- Bridge table inherits security from related entities
- Prevents unauthorized product associations

### Interactions Table
**Access Logic:**
- **SELECT**: Organization or opportunity access
- **INSERT**: Organization or opportunity access
- **UPDATE**: Organization or opportunity access
- **DELETE**: Organization access or ownership

**Key Constraints:**
- Flexible access through multiple relationship paths
- Creator field protected

### Principal-Distributor Relationships Table
**Access Logic:**
- **SELECT**: Access to either principal OR distributor
- **INSERT**: Access to BOTH principal AND distributor
- **UPDATE**: Access to BOTH organizations
- **DELETE**: Access to BOTH organizations or admin

**Key Constraints:**
- Strictest security model (requires both-side access)
- Organization type validation enforced

## Helper Functions

### `user_has_org_access(org_id UUID)`
**Purpose:** Determines if current user has access to specified organization

**Logic:**
1. Direct ownership (created_by = auth.uid())
2. Associated through contacts
3. Associated through opportunities
4. Associated through products
5. Associated through interactions

**Performance:** Indexed queries, optimized for common access patterns

### `user_is_admin()`
**Purpose:** Checks if current user has administrative privileges

**Implementation:**
- Reads from JWT user metadata
- Extensible for future role management systems
- Secure DEFINER function prevents privilege escalation

**Future Enhancement:** Replace with proper role table

### `user_accessible_org_ids()`
**Purpose:** Returns all organization IDs accessible to current user

**Features:**
- Recursive CTE for hierarchical organizations
- Includes parent-child relationships
- Optimized for bulk access checks

## Security Validation & Debugging

### Debug Views

#### `user_accessible_organizations`
Shows organizations accessible to current user with access level:
```sql
SELECT * FROM user_accessible_organizations;
```

#### `user_data_summary`
Shows count of accessible records across all tables:
```sql
SELECT * FROM user_data_summary;
```

### Test Queries

#### Verify RLS is Active
```sql
-- Should return true for all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'organizations', 'contacts', 'products', 
    'opportunities', 'opportunity_products', 
    'interactions', 'principal_distributor_relationships'
);
```

#### Check Policy Count
```sql
-- Should return policies for each table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Business Scenarios & Access Patterns

### Scenario 1: Sales Manager Territory Access
**User Role:** Sales Manager  
**Territory:** West Coast distributors  
**Access Pattern:**
- Can view/edit opportunities in assigned territory
- Can access distributor and customer organizations in territory
- Can view products from principals working with territory distributors
- Cannot access opportunities outside territory

### Scenario 2: Principal Account Management  
**User Role:** Principal Sales Representative  
**Company:** ABC Food Manufacturing (Principal)  
**Access Pattern:**
- Can view/edit all ABC Food products
- Can view opportunities involving ABC Food products
- Can access distributor partners selling ABC Food products
- Cannot access competitor principal data

### Scenario 3: Distributor Operations
**User Role:** Distributor Sales Rep  
**Company:** XYZ Distribution (Distributor)  
**Access Pattern:**
- Can view products from contracted principals
- Can manage opportunities in assigned territory
- Can access customer organizations in territory
- Cannot access other distributor territories

### Scenario 4: Customer Relationship Management
**User Role:** Account Manager  
**Focus:** Large restaurant chains  
**Access Pattern:**
- Can manage assigned customer accounts
- Can view all opportunities for assigned customers
- Can access all interactions with assigned customers
- Cannot access unassigned customer accounts

## Performance Considerations

### Optimizations Implemented
1. **Function-based policies** - Centralized logic reduces duplication
2. **Indexed access patterns** - All RLS conditions use indexed columns
3. **Efficient helper functions** - Minimized subquery overhead
4. **Security definer functions** - Optimized execution context

### Performance Monitoring
```sql
-- Monitor RLS policy performance
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements 
WHERE query LIKE '%user_has_org_access%'
ORDER BY total_time DESC;
```

### Scaling Considerations
- **Recursive organization hierarchies** - Bounded depth recommended
- **Large dataset performance** - Consider partitioning by organization
- **Function caching** - Implement caching for expensive access checks

## Migration & Deployment

### Apply RLS Policies
```sql
-- Execute the main RLS migration
\i database/migrations/002_rls_policies.sql
```

### Rollback RLS Policies
```sql
-- Execute the rollback migration if needed
\i database/migrations/002_rls_policies_rollback.sql
```

### Validation After Deployment
```sql
-- 1. Verify RLS is enabled
SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = true;

-- 2. Verify policies exist
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';

-- 3. Test basic access
SELECT * FROM user_data_summary;

-- 4. Verify helper functions
SELECT user_is_admin(), COUNT(*) FROM user_accessible_org_ids();
```

## Security Audit & Compliance

### Regular Security Checks
1. **Policy effectiveness testing** - Verify access controls work as expected
2. **Performance impact assessment** - Monitor query performance
3. **Access pattern analysis** - Review unusual access patterns
4. **Function security review** - Audit helper function logic

### Compliance Features
- **Audit trail preservation** - created_by/updated_by fields protected
- **Data isolation verification** - Multi-tenant data separation
- **Access logging** - All access patterns trackable
- **Role-based access control** - Extensible for compliance requirements

## Future Enhancements

### Planned Improvements
1. **Formal role management system** - Replace JWT metadata approach
2. **Time-based access controls** - Temporary access grants
3. **Attribute-based access control** - More granular permissions
4. **Geographic access controls** - Location-based restrictions
5. **Data classification levels** - Sensitive data handling

### Integration Considerations
- **Application-level caching** - Cache access decisions for performance  
- **API rate limiting** - Combine with application-level controls
- **Monitoring integration** - Security event logging
- **Backup security** - Ensure RLS policies apply to backup/restore

## Troubleshooting

### Common Issues

#### Issue: User cannot access expected data
**Diagnosis:**
```sql
-- Check user's organization access
SELECT * FROM user_accessible_organizations;

-- Verify specific organization access
SELECT user_has_org_access('org-uuid-here');

-- Check admin status
SELECT user_is_admin();
```

#### Issue: Performance degradation
**Diagnosis:**
```sql
-- Check policy execution plans
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM organizations WHERE name = 'Test Company';

-- Monitor function performance
SELECT * FROM pg_stat_user_functions 
WHERE funcname LIKE 'user_%';
```

#### Issue: RLS policy conflicts
**Resolution:**
- Review policy order and logic
- Check for overly restrictive WITH CHECK clauses
- Verify helper function logic consistency

This security model provides enterprise-grade data protection while maintaining the flexibility needed for complex business relationships in the food service industry.