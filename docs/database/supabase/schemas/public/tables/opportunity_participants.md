# opportunity_participants

Records organizations participating in opportunities and their specific roles and commission arrangements.

## Schema

```sql
CREATE TABLE opportunity_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    role TEXT NOT NULL CHECK (role = ANY (ARRAY['customer'::text, 'principal'::text, 'distributor'::text, 'partner'::text])),
    is_primary BOOLEAN DEFAULT false,
    commission_rate NUMERIC,
    territory TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID DEFAULT auth.uid(),
    updated_by UUID DEFAULT auth.uid(),
    
    UNIQUE(opportunity_id, organization_id, role)
);
```

## Purpose

This table manages the many-to-many relationship between opportunities and organizations, capturing:
- Which organizations are involved in each opportunity
- What role each organization plays (customer, principal, distributor, partner)
- Primary vs secondary participant designation
- Commission arrangements and territory assignments
- Detailed notes about the participation

## Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| `opportunity_id` | UUID | NOT NULL, FK to opportunities | The opportunity this participation relates to |
| `organization_id` | UUID | NOT NULL, FK to organizations | The participating organization |
| `role` | TEXT | NOT NULL, CHECK constraint | Role: customer, principal, distributor, or partner |
| `is_primary` | BOOLEAN | DEFAULT false | Whether this is the primary participant in this role |
| `commission_rate` | NUMERIC | NULLABLE | Commission percentage for this participant |
| `territory` | TEXT | NULLABLE | Territory or geographic scope for this participation |
| `notes` | TEXT | NULLABLE | Additional notes about the participation |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Record last update timestamp |
| `created_by` | UUID | DEFAULT auth.uid() | User who created the record |
| `updated_by` | UUID | DEFAULT auth.uid() | User who last updated the record |

## Constraints

### Primary Key
- `id` - UUID primary key

### Foreign Keys
- `opportunity_id` → `opportunities(id)`
- `organization_id` → `organizations(id)`

### Unique Constraints
- `(opportunity_id, organization_id, role)` - Prevents duplicate role assignments

### Check Constraints
- `role` must be one of: customer, principal, distributor, partner

### Business Logic Triggers
- `enforce_single_primary_customer()` - Ensures only one primary customer per opportunity
- `enforce_participant_role_match()` - Validates role consistency with organization type

## Row Level Security (RLS)

RLS is **ENABLED** with the following policies:

### SELECT Policy: "select participants via accessible opps"
- **Role**: public
- **Condition**: User can view participants for opportunities they have access to
- **Logic**: 
  ```sql
  EXISTS (
    SELECT 1 FROM opportunities o 
    WHERE o.id = opportunity_participants.opportunity_id 
    AND (user_is_admin() OR o.created_by = auth.uid() OR user_has_org_access(o.organization_id))
  )
  ```

### INSERT Policy: "write participants via accessible opps"  
- **Role**: authenticated
- **Condition**: User can add participants to opportunities they have access to
- **Logic**: Same as SELECT policy

### UPDATE Policy: "update/delete participants via accessible opps"
- **Role**: authenticated  
- **Condition**: User can modify participants for opportunities they have access to
- **Logic**: Same as SELECT policy

## Indexes

```sql
-- Foreign key indexes (automatically created)
CREATE INDEX idx_opportunity_participants_opportunity_id ON opportunity_participants(opportunity_id);
CREATE INDEX idx_opportunity_participants_organization_id ON opportunity_participants(organization_id);

-- Query optimization indexes
CREATE INDEX idx_opportunity_participants_role ON opportunity_participants(role);
CREATE INDEX idx_opportunity_participants_is_primary ON opportunity_participants(is_primary) WHERE is_primary = true;
```

## Relationships

### Parent Tables
- **opportunities** (via `opportunity_id`)
  - One opportunity can have many participants
  - Cascading behavior: Restrict delete (preserve participant history)

- **organizations** (via `organization_id`)  
  - One organization can participate in many opportunities
  - Cascading behavior: Restrict delete (preserve participation history)

### Child Tables
- None directly - this is a junction table

## Business Rules

1. **Role Validation**: Organizations must have appropriate roles (tracked in `organization_roles` table)
2. **Primary Customer Constraint**: Each opportunity can have only one primary customer
3. **Commission Logic**: Commission rates should align with organization agreements
4. **Territory Management**: Territory assignments should not conflict within same opportunity

## Common Queries

### Get all participants for an opportunity
```sql
SELECT 
    op.*,
    org.name as organization_name,
    org.organization_type
FROM opportunity_participants op
JOIN organizations org ON org.id = op.organization_id
WHERE op.opportunity_id = $1
ORDER BY op.is_primary DESC, op.role;
```

### Find opportunities where organization is primary customer
```sql
SELECT DISTINCT op.opportunity_id
FROM opportunity_participants op
WHERE op.organization_id = $1 
AND op.role = 'customer' 
AND op.is_primary = true;
```

### Get commission summary for organization
```sql
SELECT 
    op.role,
    COUNT(*) as participation_count,
    AVG(op.commission_rate) as avg_commission_rate,
    SUM(opp.estimated_value * op.commission_rate / 100) as potential_commission
FROM opportunity_participants op
JOIN opportunities opp ON opp.id = op.opportunity_id
WHERE op.organization_id = $1
AND op.commission_rate IS NOT NULL
GROUP BY op.role;
```

## Migration Notes

- Added in database migration following Phase 1 completion
- Supports complex opportunity structures with multiple participants
- Enables commission tracking and territory management
- Replaces simpler organization_id foreign key pattern in opportunities table

## Performance Considerations

- Primary access patterns are via opportunity_id and organization_id (both indexed)
- Role-based queries are optimized with dedicated index
- Primary participant queries use partial index for efficiency
- RLS policies leverage existing opportunity access patterns