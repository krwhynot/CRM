# Layout-as-Data Database Integration Analysis

## Executive Summary

This document analyzes the database schemas and data structures relevant to implementing a Layout-as-Data system in the Master Food Brokers CRM. The analysis covers existing database patterns, security models, storage options, and integration strategies for persisting layout configurations.

## Core Business Entity Analysis

### Primary Business Tables

The CRM operates on 5 core business entities with the following database structure:

#### 1. Organizations (id: uuid, name: text)
- **Type**: `organization_type` enum - customer, principal, distributor, prospect, vendor, unknown
- **Relationships**: Self-referential hierarchy via `parent_organization_id`
- **Manager Fields**: `primary_manager_id`, `secondary_manager_id` (UUID references to contacts)
- **Search**: Full-text search via `search_tsv` tsvector column
- **Audit Trail**: Standard `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`

#### 2. Contacts (id: uuid, first_name: text, last_name: text)
- **Authority Levels**: `decision_authority` and `purchase_influence` text fields
- **Business Role**: `contact_role` enum - decision_maker, influencer, buyer, end_user, gatekeeper, champion
- **Organization Link**: Required `organization_id` foreign key
- **Search Optimization**: `search_tsv` tsvector for full-text search

#### 3. Opportunities (id: uuid, name: text)
- **Pipeline Fields**: `stage` enum (8 stages), `status` enum (6 statuses), `priority` enum (4 levels)
- **Value Tracking**: `estimated_value` numeric, `probability` integer
- **Multi-entity Relations**: `organization_id`, `contact_id`, `principal_organization_id`, `distributor_organization_id`
- **Timeline**: `estimated_close_date`, `actual_close_date`, `next_action_date`

#### 4. Products (id: uuid, name: text)
- **Categorization**: `product_category` enum (12 categories)
- **Principal Ownership**: Required `principal_id` foreign key to organizations
- **Pricing**: `list_price`, `unit_cost` numeric fields
- **Specifications**: `specifications`, `storage_requirements` text fields

#### 5. Interactions (id: uuid, subject: text)
- **Type Classification**: `interaction_type` enum (9 types: call, email, meeting, demo, etc.)
- **Linked Entities**: `opportunity_id` (required), `contact_id`, `organization_id`
- **Temporal Data**: `interaction_date`, `follow_up_date`, `duration_minutes`
- **Content**: `description`, `outcome`, `follow_up_notes` text fields

### Data Relationship Patterns

**Complex B2B Network Structure:**
- Organizations have hierarchical relationships (parent/child)
- Multiple organization types participate in single opportunities
- Principal-Distributor relationships tracked in dedicated junction table
- Contact advocacy relationships with principal organizations

**Multi-entity Cross-references:**
- Opportunities reference up to 4 different organizations (customer, principal, distributor, founding)
- Contacts can have preferred principal relationships tracked separately
- Products belong to principals but can appear in opportunities with different customers

## Current Data Storage & Configuration Patterns

### 1. Client-Side State Management (Zustand)

The CRM uses a well-established pattern for UI preferences:

```typescript
// Example from contactAdvocacyStore.ts
interface ContactAdvocacyUIState extends BaseClientState {
  // View preferences
  viewMode: 'list' | 'cards' | 'table'
  sortBy: 'name' | 'strength' | 'computed_score' | 'date'
  sortOrder: 'asc' | 'desc'
  showAdvancedFilters: boolean

  // UI preferences with persistence
  preferences: {
    defaultViewMode: AdvocacyViewMode
    cardsPerPage: number
    showComputedScores: boolean
    autoRefresh: boolean
  }
}
```

**Current Persistence Strategy:**
- Uses Zustand middleware with localStorage persistence
- Partializes state to persist only preferences and settings
- Type-safe with validation in development mode
- Graceful fallbacks with secure storage utilities

### 2. JSON Data Handling

**Existing JSON Usage:**
- `Json` type defined in database.types.ts for flexible data storage
- Used in function parameters (e.g., `create_contact_with_org`)
- Dashboard metrics returned as JSON for complex data structures
- Import/export systems handle JSON configurations

### 3. Security & Storage Utilities

**Secure Storage Layer (`src/lib/secure-storage.ts`):**
- Handles localStorage/sessionStorage with error boundaries
- Validates JSON parsing with try-catch blocks
- Quota and security error handling
- Type-safe getters and setters with fallback values

## Database Security Model

### Row Level Security (RLS) Architecture

**Current RLS Patterns:**
```sql
-- Example from database hardening SQL
CREATE POLICY "ins_participants_with_check"
  ON opportunity_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities o
      WHERE o.id = opportunity_id
        AND (
          user_is_admin()
          OR o.created_by = auth.uid()
          OR user_has_org_access(o.organization_id)
        )
    )
  );
```

**Security Functions Available:**
- `user_is_admin()` - Admin privilege checking
- `user_has_org_access(org_id)` - Organization-based access control
- `auth.uid()` - Current authenticated user ID
- Session-based access patterns with comprehensive audit trails

**RLS Policy Types:**
- **INSERT**: `WITH CHECK` policies prevent unauthorized data creation
- **UPDATE**: Both `USING` and `WITH CHECK` for read and write validation
- **SELECT**: `USING` policies for data visibility control
- **DELETE**: Controlled deletion with audit trail preservation

### User Access Patterns

**Current User Model:**
- Supabase Auth integration with session management
- User ID stored as UUID (standard Supabase pattern)
- Development bypass mode for localhost testing
- Mock user support for development environments

**Access Control Levels:**
1. **Admin Users**: Full system access via `user_is_admin()`
2. **Organization Access**: Scoped access via `user_has_org_access()`
3. **Creator Access**: Users can access records they created
4. **Session-based**: All access tied to authenticated sessions

## Storage Options for Layout Configurations

### Option 1: User Preferences Table (Recommended)

**Schema Design:**
```sql
CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key text NOT NULL,
  preference_value jsonb NOT NULL,
  scope text DEFAULT 'global', -- 'global', 'page', 'entity', 'table'
  entity_type text NULL, -- 'organizations', 'contacts', etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, preference_key, scope, entity_type)
);
```

**Benefits:**
- Leverages existing RLS patterns
- Supports complex layout configurations in JSONB
- Scoped preferences (global, page-level, entity-specific)
- Type-safe with proper indexing
- Integrates with current audit trail patterns

### Option 2: Extended User Metadata

**Using Supabase Auth User Metadata:**
```typescript
// Store in user_metadata field
const layoutConfig = {
  pageLayouts: {
    organizations: { /* layout config */ },
    contacts: { /* layout config */ }
  },
  globalPreferences: { /* global settings */ }
};
```

**Considerations:**
- Limited to Supabase metadata size constraints
- Less queryable than dedicated table
- Simpler implementation
- Good for lightweight preferences

### Option 3: Configuration Tables per Entity

**Dedicated Layout Tables:**
```sql
CREATE TABLE organization_layout_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  layout_name text NOT NULL,
  layout_config jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

**Benefits:**
- Entity-specific optimizations
- Supports multiple layouts per user/entity
- Clear data separation
- Easier to implement gradual migration

## Data Types & TypeScript Integration

### JSONB Layout Schema

**Recommended Layout Configuration Type:**
```typescript
interface LayoutConfiguration {
  layoutId: string
  entityType: 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'
  version: string // Schema versioning

  // Layout structure
  layout: {
    type: 'slots' | 'grid' | 'flex'
    slots?: SlotConfiguration[]
    responsive?: ResponsiveBreakpoints
  }

  // User preferences
  preferences: {
    density: 'compact' | 'normal' | 'relaxed'
    theme: 'light' | 'dark' | 'auto'
    animations: boolean
  }

  // Metadata
  metadata: {
    name: string
    description?: string
    isShared: boolean
    createdBy: string
    createdAt: string
    lastModified: string
  }
}
```

### Integration with Existing Types

**Database Type Safety:**
- Extends existing `Database` type from `src/lib/database.types.ts`
- Uses established `Json` type for flexible schema storage
- Leverages existing TypeScript path aliases (`@/types/*`)
- Maintains compatibility with Supabase code generation

## Integration Points with Existing Data Layer

### 1. TanStack Query Integration

**Query Pattern for Layout Preferences:**
```typescript
// Following existing pattern from features/*/hooks/use*.ts
export function useLayoutPreferences(entityType: EntityType) {
  return useQuery({
    queryKey: ['layout-preferences', entityType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .eq('entity_type', entityType)
        .eq('scope', 'layout')

      if (error) throw error
      return data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

### 2. Zustand State Management

**Client-Side Layout Store:**
```typescript
// Following established pattern from src/stores/*
interface LayoutUIState extends BaseClientState {
  currentLayoutId: string | null
  availableLayouts: LayoutMetadata[]
  isEditMode: boolean
  previewMode: boolean

  actions: {
    setCurrentLayout: (layoutId: string) => void
    toggleEditMode: () => void
    saveLayoutConfiguration: (config: LayoutConfiguration) => Promise<void>
  }
}
```

### 3. Security Integration

**RLS Policies for Layout Data:**
```sql
-- Following existing RLS patterns
CREATE POLICY "user_own_preferences"
  ON user_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "shared_layouts_read"
  ON user_preferences
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (preference_value->>'isShared')::boolean = true
  );
```

## Performance & Optimization Considerations

### 1. Database Indexing

**Recommended Indexes:**
```sql
-- User preference lookup optimization
CREATE INDEX idx_user_preferences_lookup
  ON user_preferences (user_id, scope, entity_type);

-- JSONB content indexing for layout queries
CREATE INDEX idx_layout_config_metadata
  ON user_preferences USING GIN (preference_value);

-- Layout sharing queries
CREATE INDEX idx_shared_layouts
  ON user_preferences (entity_type)
  WHERE (preference_value->>'isShared')::boolean = true;
```

### 2. Caching Strategy

**Multi-level Caching:**
- **Client**: Zustand persistence with localStorage fallback
- **React Query**: 10-minute stale time for preference data
- **Database**: Efficient JSONB indexing for complex queries

### 3. Migration Path

**Gradual Implementation:**
1. **Phase 1**: User preferences table with basic layout storage
2. **Phase 2**: Entity-specific layout configurations
3. **Phase 3**: Shared layouts and template system
4. **Phase 4**: Advanced features (versioning, rollback)

## Security Considerations & Compliance

### 1. Data Protection

**User Privacy:**
- Layout preferences are user-scoped by design
- RLS policies prevent cross-user access
- Audit trail for all preference changes
- Soft delete pattern preserves data integrity

### 2. Content Security

**JSONB Validation:**
- Schema validation on insert/update
- Size limits to prevent abuse
- Sanitization of user-provided configuration
- Version compatibility checking

### 3. Access Control

**Layout Sharing Security:**
- Explicit opt-in for layout sharing
- Organization-scoped sharing where appropriate
- Admin override capabilities
- Audit trail for shared configuration access

## Recommendations

### 1. Immediate Implementation

**Start with User Preferences Table:**
- Most flexible and scalable approach
- Leverages existing security patterns
- Supports future feature expansion
- Clear migration path from client-only storage

### 2. Integration Strategy

**Phased Database Integration:**
1. Create `user_preferences` table with comprehensive RLS
2. Migrate existing Zustand persistence to database storage
3. Extend schema to support advanced layout features
4. Implement sharing and template capabilities

### 3. Performance Optimization

**Query Optimization:**
- Use JSONB indexing for complex layout queries
- Implement client-side caching with React Query
- Optimize for common layout operations
- Monitor query performance with existing database health checks

### 4. Security First Approach

**Follow Established Patterns:**
- Use existing RLS policy patterns
- Integrate with current audit trail system
- Leverage established user access control functions
- Maintain compatibility with development bypass modes

This analysis provides a comprehensive foundation for integrating Layout-as-Data storage with the existing CRM database architecture while maintaining security, performance, and scalability requirements.