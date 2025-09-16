# Bulk Actions Architecture Analysis

Research conducted on the current bulk actions implementation patterns to identify architectural violations, cross-feature dependencies, and migration requirements for proper shared component architecture.

## Overview

The codebase currently has bulk actions components misplaced in the organizations feature directory, creating cross-feature import anti-patterns. These components are generic by design but violate architectural boundaries, causing confusion and maintenance issues. The research reveals that proper shared bulk action components existed previously but were deleted during architecture simplification.

## Relevant Files

### Current Implementation (Misplaced)
- `/src/features/organizations/components/BulkActionsToolbar.tsx`: Generic bulk actions toolbar with hardcoded organization terminology
- `/src/features/organizations/components/BulkDeleteDialog.tsx`: Generic bulk delete dialog with proper entity type configuration
- `/src/components/data-table/data-table.tsx`: Core data table with built-in selection support via `selectable` prop and `onSelectionChange` callback
- `/src/components/data-table/toolbar.tsx`: Data table toolbar with `actions` prop for bulk actions integration

### Cross-Feature Import Violations
- `/src/features/contacts/components/ContactsList.tsx`: Imports bulk components from organizations feature
- `/src/features/opportunities/components/OpportunitiesList.tsx`: Imports bulk components from organizations feature
- `/src/features/products/components/ProductsTable.tsx`: Imports bulk components from organizations feature
- `/src/features/opportunities/components/OpportunitiesTable.tsx`: Imports bulk components from organizations feature
- `/src/features/interactions/components/InteractionsTable.tsx`: Imports bulk components from organizations feature
- `/src/features/contacts/components/ContactsTable.tsx`: Imports bulk components from organizations feature

### Previously Deleted Shared Components (Git Status)
- `src/components/bulk-actions/BulkActionsProvider.tsx`: Deleted shared provider component
- `src/components/bulk-actions/BulkActionsToolbar.tsx`: Deleted shared toolbar component
- `src/components/bulk-actions/BulkSelectionCheckbox.tsx`: Deleted shared selection component
- `src/components/bulk-actions/index.ts`: Deleted export index for bulk actions

## Architectural Patterns

### Current Anti-Patterns
- **Feature Boundary Violation**: Generic bulk components placed in domain-specific organizations feature
- **Cross-Feature Dependencies**: All entity features import from organizations, creating tight coupling
- **Misleading Import Paths**: `@/features/organizations/components/BulkActionsToolbar` suggests organization-specific when actually generic
- **Inconsistent Terminology**: BulkActionsToolbar hardcodes "organization" text despite serving all entities
- **Prop Naming Confusion**: BulkDeleteDialog uses `organizations` prop name for all entity types

### Correct Architecture Patterns
- **DataTable Selection Integration**: Built-in selection state management with `selectable: boolean` and `onSelectionChange: (selectedIds: string[]) => void`
- **Generic Entity Interface**: BulkDeleteDialog correctly implements `DeletableEntity` interface with configurable entity types
- **Toolbar Actions Integration**: DataTableToolbar provides `actions?: React.ReactNode` prop for bulk component insertion
- **Sequential Processing**: Safe bulk delete operations with comprehensive error handling and user feedback

### Current Implementation Analysis

#### BulkActionsToolbar Component
**Location**: `src/features/organizations/components/BulkActionsToolbar.tsx` (INCORRECT)

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

**Architectural Issues**:
- Hardcoded "organization" text on line 37: `{selectedCount} organization{selectedCount !== 1 ? 's' : ''} selected`
- Should accept `entityType` and `entityTypePlural` props like BulkDeleteDialog
- Functionally generic but linguistically specific to organizations

#### BulkDeleteDialog Component
**Location**: `src/features/organizations/components/BulkDeleteDialog.tsx` (INCORRECT)

**Correct Generic Design**:
```typescript
interface BulkDeleteDialogProps<T extends DeletableEntity = Organization> {
  organizations: T[] // Misleading prop name, should be 'entities'
  entityType?: string
  entityTypePlural?: string
  // ... other props
}
```

**Positive Patterns**:
- Already implements proper generic interface with `DeletableEntity`
- Configurable entity types via props
- Lists up to 5 entities with overflow display
- Uses StandardDialog for consistency

### Cross-Feature Usage Analysis

All entity features follow identical import pattern:
```typescript
// Anti-pattern: importing from feature-specific directory
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
```

**Data Transformation Required**:
```typescript
// ContactsList.tsx - Line 126-130
const selectedContactsForDialog = selectedContacts.map((contact) => ({
  ...contact,
  name: `${contact.first_name} ${contact.last_name}`, // Transform for BulkDeleteDialog
}))
```

### DataTable Integration Points

#### Selection State Management
- **Built-in Feature**: DataTable provides `selectable: boolean` prop
- **Selection Callback**: `onSelectionChange: (selectedIds: string[]) => void`
- **Selection State**: Internal `selectedRows: Set<string>` with proper header/row checkboxes
- **Visual Indicators**: Selected row highlighting and indeterminate header state

#### Toolbar Actions Integration
- **Actions Prop**: DataTableToolbar accepts `actions?: React.ReactNode`
- **Current Usage**: Bulk components rendered separately, not integrated with toolbar
- **Integration Opportunity**: Pass BulkActionsToolbar as `actions` prop when selections exist

## Edge Cases & Gotchas

### Current Implementation Issues
- **Hardcoded Terminology**: BulkActionsToolbar displays "organization" regardless of entity type (line 37)
- **Import Path Confusion**: `@/features/organizations/components/` implies organization-specific functionality
- **Prop Name Mismatch**: BulkDeleteDialog uses `organizations` prop but accepts any DeletableEntity
- **Manual Selection Coordination**: Each list component manually coordinates between DataTable selection and bulk toolbar visibility
- **Sequential vs Batch Processing**: Current implementation uses safe sequential processing but could be optimized

### Data Integrity Considerations
- **Name Property Requirement**: BulkDeleteDialog expects entities to have `name` property, requiring transformation for contacts (first_name + last_name)
- **DeletableEntity Interface**: All entities must implement `{ id: string; name: string }` minimum interface
- **Soft Delete Messaging**: Dialog correctly indicates "archive" vs "delete" operations

### Performance Implications
- **Selection State**: O(n) operations for select all/none with large datasets
- **Sequential Deletion**: Safe but slower than batch operations for bulk deletes
- **Component Re-renders**: Bulk toolbar appears/disappears causing layout shifts

## Migration Requirements

### Phase 1: Restore Shared Location
1. **Create Directory**: `/src/components/bulk-actions/`
2. **Move Components**: Relocate BulkActionsToolbar and BulkDeleteDialog
3. **Update Exports**: Create proper index.ts with centralized exports
4. **Update All Imports**: Fix 6+ files importing from organizations

### Phase 2: Genericize Components
1. **Fix BulkActionsToolbar**: Add entityType/entityTypePlural props
2. **Rename BulkDeleteDialog Props**: Change `organizations` to `entities`
3. **Standardize Entity Interface**: Ensure all entities implement DeletableEntity
4. **Remove Hard-coded Text**: Replace organization-specific terminology

### Phase 3: Create Shared Hook
```typescript
// Proposed: useBulkOperations<T>
const {
  selectedItems,
  selectedCount,
  handleSelectAll,
  handleSelectNone,
  handleBulkDelete,
  // ... other bulk operations
} = useBulkOperations<Contact>({
  items: contacts,
  entityType: 'contact',
  onDelete: deleteContactMutation,
})
```

### Phase 4: DataTable Integration
1. **Conditional Actions**: Pass BulkActionsToolbar to DataTableToolbar `actions` prop when selections exist
2. **Selection Integration**: Utilize built-in DataTable selection state management
3. **Remove Duplicate Logic**: Eliminate manual selection coordination in list components

## Import/Export Patterns

### Current Anti-Pattern
```typescript
// All features currently do this (WRONG)
import { BulkActionsToolbar } from '@/features/organizations/components/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/features/organizations/components/BulkDeleteDialog'
```

### Target Pattern
```typescript
// Proper shared component imports
import { BulkActionsToolbar, BulkDeleteDialog } from '@/components/bulk-actions'
// or for better tree-shaking
import { BulkActionsToolbar } from '@/components/bulk-actions/BulkActionsToolbar'
import { BulkDeleteDialog } from '@/components/bulk-actions/BulkDeleteDialog'
```

### Component Export Structure
**Target**: `/src/components/bulk-actions/index.ts`
```typescript
export { BulkActionsToolbar } from './BulkActionsToolbar'
export { BulkDeleteDialog } from './BulkDeleteDialog'
export { useBulkOperations } from './useBulkOperations'
export type {
  BulkActionsProps,
  BulkDeleteProps,
  BulkOperationsHook,
  DeletableEntity
} from './types'
```

## Integration With Enhanced DataTable System

### Current DataTable Capabilities
- **Selection Support**: Built-in checkbox column with `selectable` prop
- **Selection State**: Managed internally with `onSelectionChange` callback
- **Toolbar Integration**: `actions` prop for custom action components
- **Entity Filtering**: Enhanced filtering system via EntityFilters

### Recommended Integration
1. **Conditional Rendering**: Show BulkActionsToolbar in DataTableToolbar actions when selections exist
2. **State Coordination**: Use DataTable's built-in selection state instead of manual coordination
3. **Consistent UX**: Bulk actions appear as part of table toolbar rather than separate component
4. **Mobile Optimization**: Leverage DataTable's responsive design patterns

The current implementation demonstrates good architectural patterns for generic design but suffers from poor organization and feature boundary violations. The migration path is clear and would resolve import confusion while maintaining existing functionality.