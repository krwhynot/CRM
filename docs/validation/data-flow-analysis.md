# Data Flow Analysis Documentation

**Task 1.5 Deliverable** - Comprehensive analysis of data flow patterns across the CRM system to ensure architecture simplification preserves all data processing logic.

## Overview

This document analyzes the complete data flow patterns in the current CRM implementation, from database storage through UI display and form input validation back to database storage. It serves as the baseline for validating that the simplified architecture maintains identical data processing behavior.

## Data Flow Architecture

### Database-to-Display Flow (Read Operations)

#### Layer 1: Database Query (Supabase)

**Location**: `src/features/*/hooks/use*.ts` (TanStack Query hooks)

**Example**: `useOrganizations.ts`
```typescript
// Raw database query with field selection
let query = supabase
  .from('organizations')
  .select(`
    id, name, type, segment, priority, phone, email, website,
    address_line_1, city, state_province, country,
    is_active, is_principal, is_distributor, notes,
    created_at, updated_at
  `)
  .is('deleted_at', null)  // Soft delete filter
  .order('name')
  .limit(100)
```

**Critical Patterns**:
- Always include `WHERE deleted_at IS NULL` for soft delete
- Explicit field selection (never `SELECT *`)
- Consistent ordering and pagination
- Filter parameters applied via `.eq()`, `.in()`, `.ilike()`

#### Layer 2: Data Transformation (Hooks Processing)

**Location**: `src/features/*/hooks/use*.ts`

**Organization Data Processing**:
```typescript
// Apply business logic flags
const organizationsWithFlags = data.map(org => ({
  ...org,
  ...deriveOrganizationFlags(org),  // Business logic computation
  // Computed display fields
  location: formatLocation(org.city, org.state_province),
  manager_display: formatManagerName(org.primary_manager_name, org.secondary_manager_name)
}))
```

**Contact Data Processing**:
```typescript
// Transform authority levels for display
const processedContacts = contacts.map(contact => ({
  ...contact,
  decision_authority_level: mapAuthorityToLevel(contact.decision_authority),
  purchase_influence_score: mapInfluenceToScore(contact.purchase_influence),
  full_name: `${contact.first_name} ${contact.last_name}`,
  // External relationship lookups
  recent_interactions_count: await getInteractionCount(contact.id),
  last_interaction_date: await getLastInteractionDate(contact.id)
}))
```

#### Layer 3: Table Column Definitions

**Location**: `src/features/*/components/*Table.tsx`

**Column Mapping Process**:
```typescript
const columns: DataTableColumn<OrganizationWithWeeklyContext>[] = [
  {
    accessorKey: 'organization',  // Display field name
    header: 'Organization',
    cell: ({ row }) => {
      const org = row.original
      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{org.name}</span>  {/* Database: name */}
          <OrganizationBadges organization={org} />         {/* Database: type, priority, segment */}
        </div>
      )
    }
  },
  {
    accessorKey: 'location',     // Computed field
    header: 'Location',
    cell: ({ row }) => {
      const org = row.original
      // Database fields: city, state_province
      if (org.city && org.state_province) return `${org.city}, ${org.state_province}`
      if (org.city) return org.city
      if (org.state_province) return org.state_province
      return <EmptyCell />
    }
  }
]
```

#### Layer 4: UI Display Rendering

**Location**: `src/features/*/components/*Table.tsx` (render methods)

**Display Transformations**:
- **Currency Formatting**: `formatCurrency(organization.estimated_value)` - from `@/lib/metrics-utils`
- **Date Formatting**: `formatTimeAgo(organization.last_interaction_date)` - from `@/lib/utils`
- **Empty Value Handling**: `<EmptyCell />` component for null/undefined values
- **Badge Rendering**: Type/priority/segment displayed as visual badges
- **Link Formatting**: URLs made clickable with `target="_blank"` and security attributes

### Form-to-Database Flow (Write Operations)

#### Layer 1: Form Input Capture

**Location**: `src/components/forms/*Form*.tsx`

**Field Definition**:
```typescript
const fields: SimpleFormField[] = [
  {
    name: 'organization_name',     // Form field name
    type: 'text',
    label: 'Organization Name',
    required: true,
    placeholder: 'Enter organization name'
  },
  {
    name: 'organization_type',     // Form field name
    type: 'select',
    label: 'Type',
    required: true,
    options: organizationTypeOptions  // Mapped to enum values
  }
]
```

#### Layer 2: Validation Processing

**Location**: `src/lib/form-resolver.ts` + Zod schemas

**Validation Chain**:
```typescript
// 1. Form submission triggers validation
form.handleSubmit(async (formData) => {
  // 2. Zod schema validation with transforms
  const validatedData = organizationZodSchema.parse(formData)

  // 3. Transform applications from ZodTransforms
  const processedData = {
    name: ZodTransforms.requiredString(formData.organization_name),    // trim + require
    email: ZodTransforms.nullableEmail(formData.organization_email),   // normalize + null
    phone: ZodTransforms.nullablePhone(formData.organization_phone),   // digits only + null
    // ... other transforms
  }
})
```

**Critical Transform Logic**:
- **Empty String → Null**: `ZodTransforms.nullableString` converts `""` to `null`
- **Email Normalization**: `ZodTransforms.nullableEmail` converts to lowercase
- **Phone Normalization**: `ZodTransforms.nullablePhone` strips non-digits
- **UUID Validation**: `ZodTransforms.uuidField` validates format

#### Layer 3: Business Logic Processing

**Location**: Form submit handlers in components

**Contact with Organization Creation**:
```typescript
// Discriminated union logic based on organization_mode
if (formData.organization_mode === 'new') {
  // Extract organization data from contact form
  const organizationData = ContactZodValidation.extractOrganizationData(formData)
  const orgResult = await createOrganization(organizationData)

  // Use new organization ID for contact
  const contactData = {
    ...formData,
    organization_id: orgResult.id
  }
} else if (formData.organization_mode === 'existing') {
  // Use selected organization ID
  const contactData = {
    ...formData,
    organization_id: formData.organization_id  // Required when mode='existing'
  }
}
```

**Multi-Principal Opportunity Logic**:
```typescript
// Process multiple principal relationships
const principalRelationships = formData.principals.map((principalId, index) => ({
  opportunity_id: opportunityId,
  organization_id: principalId,
  role: 'principal',
  sequence_order: index + 1,
  created_by: user.id,
  created_at: new Date().toISOString()
}))

// Auto-generate opportunity name
const autoName = OpportunityZodValidation.generateMultiPrincipalName({
  organizationName: targetOrg.name,
  principals: selectedPrincipals,
  context: formData.opportunity_context,
  customContext: formData.custom_context
})
```

#### Layer 4: Database Mutation

**Location**: `src/features/*/hooks/use*.ts` (mutation hooks)

**Database Write Process**:
```typescript
// Create mutation with TanStack Query
const createOrganization = useMutation({
  mutationFn: async (data: OrganizationFormInterface) => {
    // Final data mapping to database columns
    const dbData = {
      name: data.organization_name,           // Form → DB mapping
      type: data.organization_type,
      priority: data.organization_priority || 'C',  // Default value
      segment: data.organization_segment || 'Unknown',
      phone: data.organization_phone,
      email: data.organization_email,
      website: data.organization_website,
      // Address fields
      address_line_1: data.address_line_1,
      city: data.city,
      state_province: data.state_province,
      // Business logic flags
      is_principal: data.organization_type === 'principal',
      is_distributor: data.organization_type === 'distributor',
      // Audit fields (auto-set)
      created_by: user.id,
      created_at: new Date().toISOString()
    }

    const { data: result, error } = await supabase
      .from('organizations')
      .insert(dbData)
      .select()
      .single()

    if (error) throw error
    return result
  }
})
```

## Data Transformation Catalog

### String Transformations

#### Location Display (Organizations/Contacts)
**Source**: `city`, `state_province` database fields
**Logic**:
```typescript
const formatLocation = (city: string | null, state: string | null): string => {
  if (city && state) return `${city}, ${state}`
  if (city) return city
  if (state) return state
  return null  // Displayed as <EmptyCell />
}
```

#### Contact Name Display
**Source**: `first_name`, `last_name` database fields
**Format**: `${first_name} ${last_name}`
**Usage**: All contact displays and references

#### Manager Name Display (Organizations)
**Source**: `primary_manager_name`, `secondary_manager_name` database fields
**Logic**:
```typescript
const formatManagerName = (primary: string | null, secondary: string | null): string => {
  if (primary && secondary) return `${primary} / ${secondary}`
  if (primary) return primary
  if (secondary) return secondary
  return null  // Displayed as <EmptyCell />
}
```

### Business Logic Transformations

#### Organization Type-Flag Alignment
**Source**: `type` database field
**Logic**: `organizationZodSchema.refine()` validation
```typescript
const validateTypeFlags = (data) => {
  if (data.type === 'principal' && !data.is_principal) return false
  if (data.type === 'distributor' && !data.is_distributor) return false
  if (data.is_principal && data.type !== 'principal') return false
  if (data.is_distributor && data.type !== 'distributor') return false
  return true
}
```

#### Decision Authority Level Mapping (Contacts)
**Source**: `decision_authority` enum database field
**Transform**:
```typescript
const mapAuthorityToLevel = (authority: DecisionAuthorityEnum): string => {
  switch (authority) {
    case 'Decision Maker': return 'High'
    case 'Influencer': return 'Medium'
    case 'End User': return 'Low'
    case 'Gatekeeper': return 'Low'
    default: return 'Unknown'
  }
}
```

#### Purchase Influence Score (Contacts)
**Source**: `purchase_influence` enum database field
**Transform**:
```typescript
const mapInfluenceToScore = (influence: PurchaseInfluenceEnum): number => {
  switch (influence) {
    case 'High': return 90
    case 'Medium': return 60
    case 'Low': return 30
    case 'Unknown': return 0
    default: return 0
  }
}
```

### Currency and Date Transformations

#### Currency Formatting
**Source**: `formatCurrency()` from `@/lib/metrics-utils`
**Applied to**: `estimated_value`, `list_price` fields
**Format**: US currency with thousands separators (`$1,234.56`)

#### Date/Time Formatting
**Source**: `formatTimeAgo()` from `@/lib/utils`
**Applied to**: `last_interaction_date`, `last_activity_date`, `created_at`
**Formats**:
- "2 hours ago"
- "3 days ago"
- "Last week"
- Full date for older entries

#### Timestamp Processing
**Database Storage**: ISO 8601 strings (`2024-01-15T10:30:00.000Z`)
**Display Processing**: JavaScript `Date` object conversion with timezone handling

## Validation Rule Flow

### Field-Level Validation

#### String Length Constraints
Applied via Zod schema definitions matching database column limits:
```typescript
// Organization name: 255 char limit
name: z.string().min(1, 'Required').max(255, 'Too long')

// Contact notes: 500 char limit
notes: ZodTransforms.nullableString.refine(
  val => !val || val.length <= 500,
  { message: 'Notes must be 500 characters or less' }
)
```

#### Email Validation
```typescript
// Combined format + length validation
email: ZodTransforms.nullableEmail.refine(
  val => !val || val.length <= 255,
  { message: 'Email must be 255 characters or less' }
)
```

#### Phone Number Validation
```typescript
// Normalization + length validation
phone: ZodTransforms.nullablePhone.refine(
  val => !val || val.length <= 50,
  { message: 'Phone must be 50 characters or less' }
)
```

### Business Rule Validation

#### Required Field Dependencies
**Contact Organization Mode**:
```typescript
const contactZodSchema = z.discriminatedUnion('organization_mode', [
  // When creating new organization
  z.object({
    organization_mode: z.literal('new'),
    organization_name: z.string().min(1, 'Organization name is required'),
    organization_type: OrganizationTypeEnum,
    organization_id: z.string().optional()  // Not required
  }),
  // When using existing organization
  z.object({
    organization_mode: z.literal('existing'),
    organization_id: ZodTransforms.uuidField.refine(
      val => val !== null,
      { message: 'Organization selection is required' }
    ),
    organization_name: z.string().optional()  // Not required
  })
])
```

#### Multi-Principal Opportunity Rules
```typescript
const multiPrincipalRules = z.object({
  principals: z.array(z.string().uuid())
    .min(1, 'At least one principal is required')
    .max(10, 'Maximum 10 principals allowed')
    .refine(arr => new Set(arr).size === arr.length, {
      message: 'Duplicate principals not allowed'
    }),
  opportunity_context: OpportunityContextEnum,
  custom_context: z.string().max(50).optional()
}).refine(data => {
  // Custom context required when context = 'Custom'
  if (data.opportunity_context === 'Custom') {
    return data.custom_context && data.custom_context.trim().length > 0
  }
  return true
}, {
  message: 'Custom context is required when context type is Custom',
  path: ['custom_context']
})
```

### Database Constraint Alignment

#### Foreign Key Validation
All UUID foreign key fields validated with:
```typescript
ZodTransforms.uuidField  // Format validation + null handling
.refine(val => val !== null, { message: 'ID is required' })  // When required
```

#### Enum Value Validation
Zod enums align exactly with database enum constraints:
```typescript
// Database: CREATE TYPE organization_type AS ENUM (...)
export const OrganizationTypeEnum = z.enum([
  'customer', 'principal', 'distributor', 'prospect', 'vendor', 'unknown'
])

// Database: CREATE TYPE priority_level AS ENUM (...)
export const OrganizationPriorityEnum = z.enum(['A', 'B', 'C', 'D'])
```

## External Data Dependencies

### Computed Display Fields

#### Organization Metrics (OrganizationsTable)
**Source**: External aggregate queries
**Fields**:
- `total_opportunities`: Count from `opportunities` table
- `active_opportunities`: Count with `status = 'active'`
- `weekly_engagement_score`: Computed from interaction frequency
- `top_principal_products`: Join with `products` and `opportunity_products`

#### Contact Interaction Data (ContactsTable)
**Source**: External `interactions` table queries
**Fields**:
- `recent_interactions_count`: Count of interactions in last 30 days
- `last_interaction_date`: MAX(interaction_date) from interactions
- `high_value_contact`: Computed from interaction frequency + opportunity value

#### Opportunity Activity Data (OpportunitiesTable)
**Source**: External `interactions` table queries
**Fields**:
- `interaction_count`: Total interactions for opportunity
- `last_activity_type`: Latest interaction type
- `last_activity_date`: Latest interaction date
- `days_since_activity`: Computed difference from current date

### Relationship Data Loading

#### Principal Organization Relationships (Contacts)
**Source**: `contact_preferred_principals` join table
**Loading**: Array of organization IDs mapped to organization names for display

#### Opportunity Participants (Opportunities)
**Source**: `opportunity_participants` join table
**Loading**: Multiple principal organizations with role information

#### Product Catalogs (Products)
**Source**: `products` table with principal relationships
**Loading**: Principal organization name via foreign key lookup

## Critical Data Integrity Points

### Soft Delete Consistency

**Pattern**: All queries MUST include `WHERE deleted_at IS NULL`
**Implementation**: Applied in all `useQuery` hooks
**Risk**: Omitting this filter exposes deleted records in UI

### UUID Field Handling

**Pattern**: All UUIDs validated via `ZodTransforms.uuidField`
**Implementation**: Format validation + null/empty string conversion
**Risk**: Invalid UUID format causing database constraint violations

### Audit Trail Preservation

**Pattern**: `created_at`, `updated_at`, `created_by`, `updated_by` auto-managed
**Implementation**: Set in mutation hooks, never in forms
**Risk**: Manual audit field manipulation corrupting data lineage

### Relationship Integrity

**Pattern**: Foreign key fields must reference existing, non-deleted records
**Implementation**: Validation in form dropdowns + database constraints
**Risk**: Orphaned records if relationship validation bypassed

## Form-Database Field Mapping Summary

### Organizations
| Form Field | Database Column | Transform | Required |
|---|---|---|---|
| `organization_name` | `name` | `ZodTransforms.requiredString` | Yes |
| `organization_type` | `type` | `OrganizationTypeEnum` | Yes |
| `organization_priority` | `priority` | `OrganizationPriorityEnum` | Yes |
| `organization_segment` | `segment` | `ZodTransforms.requiredString` | Yes |
| `organization_email` | `email` | `ZodTransforms.nullableEmail` | No |
| `organization_phone` | `phone` | `ZodTransforms.nullablePhone` | No |
| `organization_website` | `website` | `ZodTransforms.nullableUrl` | No |

### Contacts
| Form Field | Database Column | Transform | Required |
|---|---|---|---|
| `first_name` | `first_name` | `z.string().min(1)` | Yes |
| `last_name` | `last_name` | `z.string().min(1)` | Yes |
| `organization_id` | `organization_id` | `ZodTransforms.uuidField` | Conditional* |
| `email` | `email` | `ZodTransforms.nullableEmail` | No |
| `phone` | `phone` | `ZodTransforms.nullablePhone` | No |
| `purchase_influence` | `purchase_influence` | `PurchaseInfluenceEnum` | Yes |
| `decision_authority` | `decision_authority` | `DecisionAuthorityEnum` | Yes |

*Required when `organization_mode = 'existing'`

### Opportunities
| Form Field | Database Column | Transform | Required |
|---|---|---|---|
| `opportunity_name` | `name` | `z.string().min(1)` | Yes |
| `organization_id` | `organization_id` | `ZodTransforms.uuidField` | Yes |
| `estimated_value` | `estimated_value` | `z.number().min(0)` | Yes |
| `stage` | `stage` | `OpportunityStageEnum` | Yes |
| `status` | `status` | `OpportunityStatusEnum` | Yes |
| `estimated_close_date` | `estimated_close_date` | `ZodTransforms.nullableString` | No |

## Migration Validation Requirements

### Data Flow Preservation Checklist

For each entity migration, verify:

- [ ] **Database Query Fields**: New components select identical fields
- [ ] **Soft Delete Filter**: `WHERE deleted_at IS NULL` preserved
- [ ] **Field Transforms**: All `ZodTransforms` logic maintained
- [ ] **Business Logic**: Computed fields calculated identically
- [ ] **Display Formatting**: Currency, dates, locations formatted consistently
- [ ] **Form Validation**: All validation rules transferred accurately
- [ ] **Form-to-DB Mapping**: Field name mappings preserved exactly
- [ ] **External Dependencies**: Computed fields from joins maintained
- [ ] **Error Handling**: Validation errors displayed identically

### Testing Requirements

1. **CRUD Operation Testing**: Identical data in/out for all operations
2. **Data Transformation Testing**: All transforms produce identical results
3. **Validation Rule Testing**: All validation scenarios pass/fail identically
4. **Display Consistency Testing**: UI displays identical data formatting
5. **Relationship Integrity Testing**: All foreign key relationships preserved

### Critical Migration Risks

1. **Field Mapping Errors**: Form field names not matching database columns
2. **Transform Logic Loss**: Missing or incorrect `ZodTransforms` applications
3. **Validation Rule Changes**: Different validation behavior in new components
4. **Display Format Changes**: Inconsistent formatting of computed fields
5. **Relationship Data Loss**: Missing external lookup data in new components

This analysis serves as the definitive reference for ensuring data flow preservation during architecture simplification. Any deviation from these patterns in new components indicates a potential data integrity issue requiring immediate attention.