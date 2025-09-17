# Bulk Actions and Shared Component Patterns Research

Research conducted on existing bulk action components and shared component patterns across the CRM codebase to identify consolidation opportunities and architectural improvements.

## Relevant Files

- `/src/features/organizations/components/BulkActionsToolbar.tsx`: Main bulk actions toolbar component with selection controls
- `/src/features/organizations/components/BulkDeleteDialog.tsx`: Generic bulk delete confirmation dialog
- `/src/components/data-table/data-table.tsx`: Core data table with built-in selection support
- `/src/components/data-table/toolbar.tsx`: Data table toolbar with actions integration point
- `/src/features/contacts/components/ContactsList.tsx`: Contact list using shared bulk components
- `/src/features/opportunities/components/OpportunitiesList.tsx`: Opportunities list using shared bulk components
- `/src/features/products/components/ProductsTable.tsx`: Products table using shared bulk components
- `/src/features/organizations/components/OrganizationsList.tsx`: Reference implementation of bulk actions

## Architectural Patterns

- **Generic Component Design**: BulkDeleteDialog already accepts generic `DeletableEntity` interface with configurable entity types
- **Cross-Feature Sharing**: All entity lists import bulk components from organizations feature directory
- **DataTable Integration**: Built-in selection state management with `selectable` prop and `onSelectionChange` callback
- **Toolbar Actions Pattern**: DataTable toolbar accepts `actions` prop for inserting bulk action components
- **State Management**: Selection state handled at list component level with coordination between DataTable and bulk components
- **Async Operations**: Bulk operations use sequential processing with comprehensive error handling and user feedback

## Current Implementation Analysis

### BulkActionsToolbar Component
**Location**: `src/features/organizations/components/BulkActionsToolbar.tsx`

**Features**:
- Responsive design with mobile-first approach
- Selection count display with entity-specific pluralization
- Clear selection, select all, and select none functionality
- Animated slide-in appearance when selections exist
- Hardcoded "organization" terminology but functionally generic

**Props Interface**:
```typescript
interface BulkActionsToolbarProps {
  selectedCount: number
  totalCount: number
  onBulkDelete: () => void
  onClearSelection: () => void
  onSelectAll?: () => void
  onSelectNone?: () => void
  className?: string
}
```

### BulkDeleteDialog Component
**Location**: `src/features/organizations/components/BulkDeleteDialog.tsx`

**Features**:
- Already generic with `DeletableEntity` interface
- Configurable entity types via `entityType` and `entityTypePlural` props
- Lists up to 5 entities with "...and X more" overflow display
- Soft delete messaging with warning indicators
- Uses StandardDialog component for consistent UI

**Generic Design**:
```typescript
interface BulkDeleteDialogProps<T extends DeletableEntity = Organization> {
  organizations: T[] // Generic entities array
  entityType?: string // e.g., "contact", "opportunity"
  entityTypePlural?: string // e.g., "contacts", "opportunities"
  // ... other props
}
```

### DataTable Selection Integration
**Location**: `src/components/data-table/data-table.tsx`

**Built-in Features**:
- `selectable` prop enables checkbox column
- Row-level and header-level selection checkboxes
- Selection state management with `selectedRows` Set
- `onSelectionChange` callback provides selected IDs array
- Visual indicators for selected rows
- Indeterminate state for partial selections

### Cross-Feature Usage Pattern
All entity list components follow the same import pattern:

```typescript
// Used in: ContactsList, OpportunitiesList, ProductsList, etc.
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
```

**Files importing from organizations**:
- `/src/features/contacts/components/ContactsList.tsx`
- `/src/features/contacts/components/ContactsTable.tsx`
- `/src/features/opportunities/components/OpportunitiesList.tsx`
- `/src/features/opportunities/components/OpportunitiesTable.tsx`
- `/src/features/products/components/ProductsTable.tsx`
- `/src/features/interactions/components/InteractionsTable.tsx`

## Edge Cases & Gotchas

- **Hardcoded Text**: BulkActionsToolbar has hardcoded "organization" text in selection display despite being shared across entities
- **Feature Location**: Bulk components live in organizations feature but are used by all entities, creating confusing import paths
- **Entity Type Mismatch**: BulkDeleteDialog prop is named `organizations` but accepts any entity type with `DeletableEntity` interface
- **Selection State Coordination**: Each list component must manually coordinate between DataTable selection and bulk action visibility
- **Async Error Handling**: Bulk delete operations use sequential processing which is safe but slower than batch operations
- **Import Path Confusion**: `@/features/organizations/components/BulkActionsToolbar` suggests organization-specific when it's actually generic

## Consolidation Opportunities

### 1. Move to Shared Location
**Current**: Bulk components in `src/features/organizations/components/`
**Proposed**: Move to `src/components/bulk-actions/` or `src/components/data-table/bulk-actions/`

### 2. Generic Toolbar Component
**Issue**: BulkActionsToolbar hardcodes "organization" terminology
**Solution**: Add `entityType` and `entityTypePlural` props similar to BulkDeleteDialog

### 3. Unified Bulk Operations Hook
**Pattern**: Each list component implements similar bulk operation logic
**Opportunity**: Create `useBulkOperations<T>` hook to standardize selection state and bulk delete logic

### 4. DataTable Bulk Integration
**Current**: Bulk toolbar rendered separately from DataTable
**Opportunity**: Integrate bulk actions directly into DataTable toolbar when selections exist

### 5. Consistent Error Handling
**Pattern**: Each implementation has similar but slightly different error handling
**Opportunity**: Standardize bulk operation error patterns and user feedback

## Import/Export Patterns

### Current Import Pattern
All features import bulk components from organizations:
```typescript
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
```

### Proposed Shared Pattern
```typescript
import { BulkActionsToolbar, BulkDeleteDialog } from '@/components/bulk-actions'
// or
import { BulkActionsToolbar, BulkDeleteDialog } from '@/components/data-table/bulk-actions'
```

### Component Export Structure
**Current** (`src/features/organizations/components/index.ts`):
- No centralized exports, each component imported individually

**Proposed** (`src/components/bulk-actions/index.ts`):
```typescript
export { BulkActionsToolbar } from './BulkActionsToolbar'
export { BulkDeleteDialog } from './BulkDeleteDialog'
export { useBulkOperations } from './useBulkOperations'
export type { BulkActionsProps, BulkOperationsHook } from './types'
```

## Improvement Recommendations

1. **Create Shared Location**: Move bulk components to `src/components/bulk-actions/` for better discoverability
2. **Genericize Toolbar**: Add entity type props to BulkActionsToolbar to remove hardcoded text
3. **Standardize Hook**: Create `useBulkOperations` hook to reduce code duplication across entity lists
4. **Integrate with DataTable**: Consider making bulk actions a first-class DataTable feature
5. **Update Import Paths**: Centralize exports and update all import statements across the codebase
6. **Consistent Naming**: Rename BulkDeleteDialog's `organizations` prop to generic `entities`
7. **Type Safety**: Add proper generic constraints and improve TypeScript definitions
8. **Documentation**: Add JSDoc comments explaining the generic nature and usage patterns

The current implementation shows good architectural patterns with generic design, but the organization could be improved to better reflect the shared nature of these components across all entity types.