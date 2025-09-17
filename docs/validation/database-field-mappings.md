# Database Field Mappings Documentation

**Task 1.4 Deliverable** - Comprehensive mapping of database fields used by current components to ensure data integrity during architecture simplification.

## Overview

This document provides a complete mapping of database table columns to form fields and UI components in the current CRM implementation. It serves as the baseline for validating data integrity during the migration to the simplified architecture.

## Entity Field Mappings

### Organizations Table

**Database Table**: `organizations`

**Zod Schema**: `/src/types/organization.zod.ts` - `organizationZodSchema`

#### Core Database Fields

| Database Column | Zod Schema Field | Form Field Name | Table Column Key | Data Type | Required | Transform Applied |
|---|---|---|---|---|---|---|
| `id` | N/A (auto-generated) | N/A | `id` | UUID | Yes | None |
| `name` | `name` | `organization_name` | `organization` | String(255) | Yes | ZodTransforms.requiredString |
| `type` | `type` | `organization_type` | N/A (in badges) | Enum | Yes | OrganizationTypeEnum |
| `priority` | `priority` | `organization_priority` | N/A (in badges) | Enum(A,B,C,D) | Yes | OrganizationPriorityEnum |
| `segment` | `segment` | `organization_segment` | N/A (in badges) | String(100) | Yes | ZodTransforms.requiredString |
| `is_principal` | `is_principal` | `is_principal` | N/A | Boolean | Yes | z.boolean() |
| `is_distributor` | `is_distributor` | `is_distributor` | N/A | Boolean | Yes | z.boolean() |

#### Optional Database Fields

| Database Column | Zod Schema Field | Form Field Name | Table Column Key | Data Type | Required | Transform Applied |
|---|---|---|---|---|---|---|
| `description` | `description` | `organization_description` | N/A | String(500) | No | ZodTransforms.nullableString |
| `email` | `email` | `organization_email` | N/A | String(255) | No | ZodTransforms.nullableEmail |
| `phone` | `phone` | `organization_phone` | `phone` | String(50) | No | ZodTransforms.nullablePhone |
| `website` | `website` | `organization_website` | N/A | String(255) | No | ZodTransforms.nullableUrl |
| `address_line_1` | `address_line_1` | `address_line_1` | N/A | String(255) | No | ZodTransforms.nullableString |
| `address_line_2` | `address_line_2` | `address_line_2` | N/A | String(255) | No | ZodTransforms.nullableString |
| `city` | `city` | `city` | `location` | String(100) | No | ZodTransforms.nullableString |
| `state_province` | `state_province` | `state_province` | `location` | String(100) | No | ZodTransforms.nullableString |
| `postal_code` | `postal_code` | `postal_code` | N/A | String(20) | No | ZodTransforms.nullableString |
| `country` | `country` | `country` | N/A | String(100) | No | ZodTransforms.nullableString |
| `industry` | `industry` | `industry` | N/A | String(100) | No | ZodTransforms.nullableString |
| `notes` | `notes` | `organization_notes` | N/A | String(500) | No | ZodTransforms.nullableString |

#### Audit/System Fields

| Database Column | Zod Schema Field | Form Field Name | Table Column Key | Data Type | Required | Transform Applied |
|---|---|---|---|---|---|---|
| `created_at` | N/A | N/A | N/A | Timestamp | Yes | Auto-generated |
| `updated_at` | N/A | N/A | N/A | Timestamp | Yes | Auto-generated |
| `created_by` | N/A | N/A | N/A | String | Yes | System-set |
| `updated_by` | N/A | N/A | N/A | String | No | System-set |
| `deleted_at` | N/A | N/A | N/A | Timestamp | No | Soft delete |

#### Display-Only Fields (OrganizationsTable.tsx)

| Display Field | Source | Description |
|---|---|---|
| `primary_manager_name` | External lookup | Manager display in `managers` column |
| `secondary_manager_name` | External lookup | Secondary manager display |
| `top_principal_products` | Computed | Product relationships in expandable content |
| `total_opportunities` | Computed | Opportunity count in expandable content |
| `active_opportunities` | Computed | Active opportunity count in badges |
| `weekly_engagement_score` | Computed | Engagement metrics in expandable content |

### Contacts Table

**Database Table**: `contacts`

**Zod Schema**: `/src/types/contact.zod.ts` - `contactZodSchema`

#### Core Database Fields

| Database Column | Zod Schema Field | Form Field Name | Table Column Key | Data Type | Required | Transform Applied |
|---|---|---|---|---|---|---|
| `id` | N/A (auto-generated) | N/A | `id` | UUID | Yes | None |
| `first_name` | `first_name` | `first_name` | `contact` | String(100) | Yes | z.string().min(1) |
| `last_name` | `last_name` | `last_name` | `contact` | String(100) | Yes | z.string().min(1) |
| `organization_id` | `organization_id` | `organization_id` | N/A | UUID | Yes* | ZodTransforms.uuidField |
| `email` | `email` | `email` | `primary_contact` | String(255) | No | ZodTransforms.nullableEmail |
| `phone` | `phone` | `phone` | `primary_contact` | String(50) | No | ZodTransforms.nullablePhone |
| `title` | `title` | `title` | `position` | String(100) | No | ZodTransforms.nullableString |
| `department` | `department` | `department` | N/A | String(100) | No | ZodTransforms.nullableString |
| `mobile_phone` | `mobile_phone` | `mobile_phone` | N/A | String(50) | No | ZodTransforms.nullablePhone |
| `linkedin_url` | `linkedin_url` | `linkedin_url` | N/A | String(500) | No | ZodTransforms.nullableUrl |
| `is_primary_contact` | `is_primary_contact` | `is_primary_contact` | N/A | Boolean | No | z.boolean().default(false) |
| `notes` | `notes` | `notes` | N/A | String(500) | No | ZodTransforms.nullableString |

*Required when `organization_mode` is 'existing'

#### Business Logic Fields

| Database Column | Zod Schema Field | Form Field Name | Table Column Key | Data Type | Required | Transform Applied |
|---|---|---|---|---|---|---|
| `purchase_influence` | `purchase_influence` | `purchase_influence` | N/A | Enum | Yes | PurchaseInfluenceEnum |
| `decision_authority` | `decision_authority` | `decision_authority` | N/A | Enum | Yes | DecisionAuthorityEnum |
| `role` | `role` | `role` | N/A | Enum | No | ContactRoleEnum.nullable() |

#### Virtual Form Fields (ContactsTable.tsx)

| Form Field | Purpose | Validation | Description |
|---|---|---|---|
| `organization_mode` | Discriminated union | z.literal('existing'/'new') | Controls organization creation |
| `organization_name` | New org creation | Required when mode='new' | Name for new organization |
| `organization_type` | New org creation | Required when mode='new' | Type for new organization |
| `organization_phone` | New org creation | Optional | Phone for new organization |
| `organization_email` | New org creation | Optional | Email for new organization |
| `organization_website` | New org creation | Optional | Website for new organization |
| `organization_notes` | New org creation | Optional | Notes for new organization |
| `preferred_principals` | Relationship data | Array of UUIDs | Principal organization relationships |

#### Display-Only Fields (ContactsTable.tsx)

| Display Field | Source | Description |
|---|---|---|
| `decision_authority_level` | Computed from `decision_authority` | Simplified authority display |
| `purchase_influence_score` | Computed from `purchase_influence` | Numeric influence score |
| `recent_interactions_count` | External lookup | Recent interaction count |
| `last_interaction_date` | External lookup | Last interaction timestamp |
| `budget_authority` | Computed | Boolean authority flag |
| `technical_authority` | Computed | Boolean authority flag |
| `user_authority` | Computed | Boolean authority flag |
| `high_value_contact` | Computed | High value contact flag |
| `needs_follow_up` | Computed | Follow-up needed flag |

### Opportunities Table

**Database Table**: `opportunities`

**Zod Schema**: `/src/types/opportunity.zod.ts` - `opportunityZodSchema`

#### Core Database Fields

| Database Column | Zod Schema Field | Form Field Name | Table Column Key | Data Type | Required | Transform Applied |
|---|---|---|---|---|---|---|
| `id` | N/A (auto-generated) | N/A | `id` | UUID | Yes | None |
| `name` | `name` | `opportunity_name` | N/A | String(255) | Yes | z.string().min(1) |
| `organization_id` | `organization_id` | `organization_id` | N/A | UUID | Yes | ZodTransforms.uuidField |
| `contact_id` | `contact_id` | `contact_id` | N/A | UUID | No | ZodTransforms.uuidField |
| `estimated_value` | `estimated_value` | `estimated_value` | N/A | Decimal | Yes | z.number().min(0) |
| `stage` | `stage` | `stage` | N/A | Enum | Yes | OpportunityStageEnum |
| `status` | `status` | `status` | N/A | Enum | Yes | OpportunityStatusEnum |
| `estimated_close_date` | `estimated_close_date` | `estimated_close_date` | N/A | Date | No | ZodTransforms.nullableString |
| `description` | `description` | `description` | N/A | String(1000) | No | ZodTransforms.nullableString |
| `notes` | `notes` | `notes` | N/A | String(500) | No | ZodTransforms.nullableString |

#### Multi-Principal Fields

| Database Column | Zod Schema Field | Form Field Name | Table Column Key | Data Type | Required | Transform Applied |
|---|---|---|---|---|---|---|
| `principal_id` | `principal_id` | `principal_id` | N/A | UUID | No | ZodTransforms.uuidField |
| `product_id` | `product_id` | `product_id` | N/A | UUID | No | ZodTransforms.uuidField |
| `opportunity_context` | `opportunity_context` | `opportunity_context` | N/A | Enum | No | OpportunityContextEnum |
| `auto_generated_name` | `auto_generated_name` | `auto_generated_name` | N/A | Boolean | No | z.boolean().default(false) |
| `probability` | `probability` | `probability` | N/A | Integer(0-100) | No | z.number().min(0).max(100) |
| `deal_owner` | `deal_owner` | `deal_owner` | N/A | String(100) | No | ZodTransforms.nullableString |

#### Virtual Form Fields (Multi-Principal)

| Form Field | Purpose | Validation | Description |
|---|---|---|---|
| `principals` | Multi-principal relationships | Array of UUIDs | Principal organization IDs |
| `custom_context` | Custom context input | String(50) | Custom context when type='Custom' |

#### Display-Only Fields (OpportunitiesTable.tsx)

| Display Field | Source | Description |
|---|---|---|
| `interaction_count` | External lookup | Number of interactions |
| `last_activity_type` | External lookup | Type of last activity |
| `last_activity_date` | External lookup | Date of last activity |
| `days_since_activity` | Computed | Days since last activity |
| `is_stalled` | Computed | Whether opportunity is stalled |

### Products Table

**Database Table**: `products`

**Zod Schema**: Not yet created (referenced in task)

#### Core Database Fields (from ProductsTable.tsx)

| Database Column | Form Field Name | Table Column Key | Data Type | Required | Description |
|---|---|---|---|---|---|
| `id` | N/A | `id` | UUID | Yes | Primary key |
| `name` | `product_name` | N/A | String | Yes | Product name |
| `sku` | `product_sku` | N/A | String | No | Stock keeping unit |
| `description` | `product_description` | N/A | Text | No | Product description |
| `category` | `product_category` | N/A | String | No | Product category |
| `list_price` | `list_price` | N/A | Decimal | No | Product list price |
| `in_stock` | `in_stock` | N/A | Boolean | Yes | Stock availability |
| `low_stock` | `low_stock` | N/A | Boolean | No | Low stock indicator |

#### Display-Only Fields (ProductsTable.tsx)

| Display Field | Source | Description |
|---|---|---|
| `principal_name` | Relationship lookup | Principal organization name |
| `opportunity_count` | External lookup | Number of opportunities |
| `recent_opportunity_count` | External lookup | Recent opportunity count |
| `promotion_start_date` | External lookup | Promotion start date |
| `promotion_end_date` | External lookup | Promotion end date |
| `is_promoted_this_week` | Computed | Current promotion status |
| `weekly_sales_velocity` | Computed | Sales velocity metric |
| `was_promoted_recently` | Computed | Recent promotion history |

### Interactions Table

**Database Table**: `interactions`

**Zod Schema**: `/src/types/interaction.types.ts` (Yup-based, needs Zod migration)

#### Core Database Fields (from OpportunitiesTable usage)

| Database Column | Form Field Name | Table Column Key | Data Type | Required | Description |
|---|---|---|---|---|---|
| `id` | N/A | `id` | UUID | Yes | Primary key |
| `opportunity_id` | `opportunity_id` | N/A | UUID | No | Related opportunity |
| `contact_id` | `contact_id` | N/A | UUID | No | Related contact |
| `organization_id` | `organization_id` | N/A | UUID | Yes | Related organization |
| `interaction_type` | `interaction_type` | N/A | Enum | Yes | Type of interaction |
| `interaction_date` | `interaction_date` | N/A | Date | Yes | Date of interaction |
| `notes` | `interaction_notes` | N/A | Text | No | Interaction notes |
| `follow_up_required` | `follow_up_required` | N/A | Boolean | No | Follow-up needed |
| `follow_up_date` | `follow_up_date` | N/A | Date | No | Scheduled follow-up |

## Data Transformation Logic

### Form to Database Transforms

#### Organization Creation from Contact Form

**Location**: `ContactZodValidation.extractOrganizationData()`

**Transformation**:
```typescript
{
  name: formData.organization_name,
  type: formData.organization_type,
  phone: formData.organization_phone,
  email: formData.organization_email,
  website: formData.organization_website,
  notes: formData.organization_notes,
  // Auto-generated defaults
  priority: 'C',
  segment: 'Unknown',
  is_principal: false,
  is_distributor: false,
}
```

#### Multi-Principal Opportunity Participants

**Location**: `OpportunityZodValidation.extractPrincipalRelationships()`

**Transformation**:
```typescript
formData.principals.map((principalId, index) => ({
  opportunity_id: opportunityId,
  organization_id: principalId,
  role: 'principal',
  sequence_order: index + 1,
  created_by: createdBy,
  created_at: new Date().toISOString(),
}))
```

#### Auto-Generated Opportunity Names

**Location**: `OpportunityZodValidation.generateMultiPrincipalName()`

**Format**: `{OrganizationName} - {PrincipalDisplay} - {Context} - {MonthYear}`

### Database to Display Transforms

#### Location Display (Organizations)

**Source Fields**: `city`, `state_province`

**Logic**:
```typescript
if (city && state_province) return `${city}, ${state_province}`
if (city) return city
if (state_province) return state_province
return <EmptyCell />
```

#### Contact Name Display

**Source Fields**: `first_name`, `last_name`

**Format**: `${first_name} ${last_name}`

#### Currency Formatting

**Source**: `formatCurrency()` from `@/lib/metrics-utils`

**Applied to**: `estimated_value`, `list_price`

#### Time Formatting

**Source**: `formatTimeAgo()` from `@/lib/utils`

**Applied to**: `last_interaction_date`, `last_activity_date`

## Validation Constraints

### String Length Limits

| Entity | Field | Database Limit | Zod Validation |
|---|---|---|---|
| Organization | `name` | 255 | `.max(255)` |
| Organization | `description` | 500 | `.max(500)` |
| Organization | `email` | 255 | `.max(255)` |
| Organization | `phone` | 50 | `.max(50)` |
| Contact | `first_name` | 100 | `.max(100)` |
| Contact | `last_name` | 100 | `.max(100)` |
| Contact | `email` | 255 | `.max(255)` |
| Contact | `notes` | 500 | `.max(500)` |
| Opportunity | `name` | 255 | `.max(255)` |
| Opportunity | `description` | 1000 | `.max(1000)` |
| Opportunity | `notes` | 500 | `.max(500)` |

### Required Field Validation

| Entity | Required Fields | Conditional Requirements |
|---|---|---|
| Organization | `name`, `type`, `priority`, `segment` | None |
| Contact | `first_name`, `last_name`, `purchase_influence`, `decision_authority` | `organization_id` when mode='existing' |
| Opportunity | `name`, `organization_id`, `estimated_value`, `stage`, `status` | None |

### Business Logic Validation

#### Organization Type Alignment

**Rule**: `is_principal` and `is_distributor` flags must align with `type`

**Implementation**: `organizationZodSchema.refine()`

#### Multi-Principal Business Rules

**Rules**:
- At least 1 principal required
- Maximum 10 principals allowed
- No duplicate principals
- Target organization cannot be a principal
- Custom context required when context='Custom'

**Implementation**: `multiPrincipalOpportunityZodSchema.refine()`

## Critical Mapping Notes

### Soft Delete Pattern

**All entities use soft delete**: `deleted_at IS NULL` required in all queries

### UUID Primary Keys

**All entities use UUID primary keys**: Validation via `ZodTransforms.uuidField`

### Audit Trail Fields

**Standard audit fields on all tables**:
- `created_at` (auto-generated)
- `updated_at` (auto-generated)
- `created_by` (system-set)
- `updated_by` (system-set)

### Relationship Integrity

**Foreign Key Constraints**:
- `contacts.organization_id` → `organizations.id`
- `opportunities.organization_id` → `organizations.id`
- `opportunities.contact_id` → `contacts.id`
- `opportunity_participants.opportunity_id` → `opportunities.id`
- `opportunity_participants.organization_id` → `organizations.id`

### Search and Indexing

**Search fields** (via `search_tsv` columns):
- Organization: `name`, `primary_manager_name`, `phone`, `segment`, `city`
- Contact: `first_name`, `last_name`, `email`, `title`, organization name
- Product: `name`, `sku`, `description`, `category`, principal name

## Migration Validation Checklist

### Pre-Migration Validation

- [ ] All database field mappings documented
- [ ] Form field to database column mappings verified
- [ ] Data transformation logic catalogued
- [ ] Validation constraints captured
- [ ] Relationship integrity rules documented

### Post-Migration Validation Required

- [ ] All CRUD operations work with new components
- [ ] Data displays identically in old vs new components
- [ ] Form validation rules preserved
- [ ] Relationship data integrity maintained
- [ ] Search functionality preserved
- [ ] Audit trail functionality preserved

### High-Risk Areas

1. **Multi-Principal Opportunities**: Complex relationship mapping and auto-naming logic
2. **Contact Organization Creation**: Dual-mode form logic with discriminated unions
3. **Expandable Content**: Complex computed fields and external lookups
4. **Search Functionality**: Full-text search across related entities
5. **Soft Delete Logic**: Ensure `WHERE deleted_at IS NULL` in all queries

This documentation serves as the authoritative source for validating that all database field mappings are preserved during the architecture simplification migration.