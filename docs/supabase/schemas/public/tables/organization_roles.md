# organization_roles

Defines the business roles/types that each organization can fulfill in the food service industry.

## Schema

```sql
CREATE TABLE organization_roles (
    organization_id UUID NOT NULL REFERENCES organizations(id),
    role TEXT NOT NULL CHECK (role = ANY (ARRAY['principal'::text, 'distributor'::text, 'customer'::text, 'prospect'::text, 'vendor'::text])),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    PRIMARY KEY (organization_id, role)
);
```

## Purpose

This table enables organizations to have multiple business roles simultaneously, supporting complex food service industry relationships where:
- A company might be both a distributor and a customer
- Organizations can transition between roles over time
- Role-based access and business logic can be applied
- Participation validation in opportunities is enforced

## Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `organization_id` | UUID | PRIMARY KEY, NOT NULL, FK | Reference to the organization |
| `role` | TEXT | PRIMARY KEY, NOT NULL, CHECK constraint | Business role type |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | When this role was assigned |

## Constraints

### Primary Key
- `(organization_id, role)` - Composite primary key prevents duplicate role assignments

### Foreign Keys
- `organization_id` → `organizations(id)`

### Check Constraints
- `role` must be one of: principal, distributor, customer, prospect, vendor

## Row Level Security (RLS)

RLS is **DISABLED** - This is a lookup/reference table with no sensitive data that requires organization-level filtering.

## Indexes

```sql
-- Primary key index (automatically created)
CREATE UNIQUE INDEX organization_roles_pkey ON organization_roles(organization_id, role);

-- Query optimization indexes
CREATE INDEX idx_organization_roles_role ON organization_roles(role);
CREATE INDEX idx_organization_roles_created_at ON organization_roles(created_at);
```

## Relationships

### Parent Tables
- **organizations** (via `organization_id`)
  - One organization can have multiple roles
  - Cascading behavior: CASCADE delete (roles removed when organization deleted)

### Child Tables
- Referenced by business logic in:
  - `opportunity_participants` role validation
  - Organization type filtering in UI
  - Access control and permission systems

## Business Rules

1. **Role Definitions**:
   - **principal**: Food manufacturers/brands (source of products)
   - **distributor**: Companies that distribute food products
   - **customer**: End customers purchasing products
   - **prospect**: Potential customers being pursued
   - **vendor**: Suppliers of services or non-food products

2. **Multi-Role Support**: Organizations can have multiple roles simultaneously
3. **Role Transitions**: Prospects can become customers, customers can become distributors, etc.
4. **Validation**: Opportunity participation must align with organization roles

## Common Queries

### Get all roles for an organization
```sql
SELECT role, created_at
FROM organization_roles
WHERE organization_id = $1
ORDER BY created_at;
```

### Find organizations with specific role
```sql
SELECT DISTINCT or.organization_id, org.name
FROM organization_roles or
JOIN organizations org ON org.id = or.organization_id
WHERE or.role = $1
AND org.deleted_at IS NULL
ORDER BY org.name;
```

### Get organizations with multiple roles
```sql
SELECT 
    org.name,
    array_agg(or.role ORDER BY or.role) as roles,
    COUNT(or.role) as role_count
FROM organization_roles or
JOIN organizations org ON org.id = or.organization_id
WHERE org.deleted_at IS NULL
GROUP BY org.id, org.name
HAVING COUNT(or.role) > 1
ORDER BY role_count DESC, org.name;
```

### Find principals who are also distributors
```sql
SELECT DISTINCT org.name, org.id
FROM organizations org
WHERE org.id IN (
    SELECT organization_id FROM organization_roles WHERE role = 'principal'
    INTERSECT
    SELECT organization_id FROM organization_roles WHERE role = 'distributor'
)
AND org.deleted_at IS NULL
ORDER BY org.name;
```

## Triggers and Functions

### Related Functions
- `sync_organization_roles()` - Ensures role consistency during organization updates
- `validate_principal_type()` - Validates principal-specific business rules
- `enforce_participant_role_match()` - Validates opportunity participation against roles

## Migration Notes

- Added during Phase 1 completion to support complex organization structures
- Replaces simple `organization_type` enum with flexible multi-role system
- Enables organizations to evolve their business relationships over time
- Supports food service industry's complex role relationships

## Performance Considerations

- Primary access pattern is by organization_id (part of primary key)
- Role-based filtering is optimized with dedicated index
- Composite primary key prevents duplicate role assignments efficiently
- Small table size (typically 1-4 rows per organization) ensures fast lookups

## Integration Points

### UI Components
- Organization forms display and manage multiple roles
- Filtering and search by organization role type
- Role-based permission checks

### Business Logic
- Opportunity participation validation
- Commission calculation based on role
- Territory assignment logic
- Access control for different role types

### Reporting
- Role distribution analytics
- Organization type analysis
- Business relationship mapping