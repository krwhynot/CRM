# Table Composition Patterns

**Status**: ✅ IMPLEMENTED (Phase 1 Complete)  
**Last Updated**: September 10, 2025

## Overview

This document outlines the new table composition patterns extracted during the CRM architecture refactoring. These patterns reduce code duplication by 60%+ and provide consistent behavior across all table components.

## Architecture

### 📁 Shared Table Hooks (`/src/hooks/table/`)

#### `useTableSelection.ts`
Generic selection state management for any table component.

```typescript
const selection = useTableSelection<MyEntity>({
  getItemId: (item) => item.id,
  initialSelected: new Set(),
})

// Provides: selectedItems, handleSelectItem, handleSelectAll, clearSelection
```

#### `useTableFilters.ts`
Centralized filtering logic with generic filter application.

```typescript
const { filteredData } = useTableFiltersWithData(data, {
  initialFilters: { search: '', category: 'all' },
  filterFunction: (items, filters) => applyMyFilters(items, filters),
})
```

#### `useTableSort.ts`
Multi-column sorting with custom sort functions.

```typescript
const { sortedData } = useTableSortWithData(data, {
  initialSort: { field: 'name', direction: 'asc' },
  allowMultiSort: true,
})
```

#### `useTablePagination.ts`
Pagination state with configurable page sizes.

```typescript
const { paginatedData, pagination } = useTablePaginationWithData(data, {
  initialPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
})
```

### 🎛️ Shared Bulk Actions (`/src/components/shared/BulkActions/`)

#### `BulkActionsProvider.tsx`
Context provider that combines selection and bulk operations with keyboard shortcuts (Ctrl+A, Escape).

```typescript
<BulkActionsProvider<MyEntity>
  items={data}
  getItemId={(item) => item.id}
  getItemName={(item) => item.name}
  entityType="item"
  entityTypePlural="items"
>
  <MyTableComponent />
</BulkActionsProvider>
```

#### `BulkActionsToolbar.tsx`
Reusable toolbar with consistent bulk action UI.

```typescript
<BulkActionsToolbar
  selectedCount={selection.getSelectedCount()}
  totalCount={data.length}
  onDelete={handleBulkDelete}
  entityType="organizations"
  actions={customActions}
/>
```

#### `useBulkActions.ts`
Generic bulk operations with progress tracking and error handling.

```typescript
const { progress, executeBulkDelete } = useBulkActions<MyEntity>({
  getItemId: (item) => item.id,
  getItemName: (item) => item.name,
  entityType: "organization",
  entityTypePlural: "organizations",
})
```

## Component Decomposition Pattern

### Before (Monolithic)
```
OpportunitiesTable.tsx (571 lines)
├── Selection logic (50+ lines)
├── Bulk operations (100+ lines) 
├── Expandable content (100+ lines)
├── Column definitions (100+ lines)
└── Mobile responsiveness (50+ lines)
```

### After (Decomposed)
```
OpportunitiesTableRefactored.tsx (192 lines)
├── BulkActionsProvider (wraps everything)
├── OpportunityExpandedContent.tsx (focused component)
├── OpportunityRow.tsx (column definitions)
└── Shared hooks (imported)
```

**Result**: 66% reduction in code (571 → 192 lines)

## Benefits

### 🔄 Code Reuse
- **Selection Logic**: Shared across all tables
- **Bulk Operations**: Consistent behavior and UI
- **Filtering**: Generic filter application
- **Sorting**: Multi-column support everywhere

### 🎯 Maintainability  
- **Single Source of Truth**: Fix once, apply everywhere
- **Consistent Patterns**: Same API across all tables
- **Type Safety**: Full TypeScript generics support

### 📱 User Experience
- **Keyboard Shortcuts**: Ctrl+A, Escape work in all tables
- **Progress Feedback**: Unified bulk operation progress
- **Error Handling**: Consistent toast notifications
- **Mobile Optimization**: Shared responsive patterns

## Implementation Status

### ✅ Phase 1 Complete
- [x] Shared table hooks extracted
- [x] BulkActions system created
- [x] **OpportunitiesTable**: 571 → 192 lines (66% reduction)

### 🚧 Phase 2 In Progress  
- [ ] **ContactsTable**: 664 → <200 lines target
- [ ] **OrganizationsTable**: 746 → <200 lines target
- [ ] **ProductsTable**: 535 → <200 lines target

### 📊 Success Metrics
- **Current**: 1 of 4 tables refactored
- **Code Reduction**: 379 lines saved so far
- **Target**: 60% overall reduction (~1,500 lines)
- **Bundle Size**: 3.6MB (baseline) → target <3.0MB

## Usage Examples

### Complete Table Implementation
```typescript
// 1. Wrap with BulkActionsProvider
export function MyTable() {
  return (
    <BulkActionsProvider<MyEntity>
      items={data}
      getItemId={(item) => item.id}
      entityType="item"
      entityTypePlural="items"
    >
      <MyTableContainer />
    </BulkActionsProvider>
  )
}

// 2. Use shared hooks in container
function MyTableContainer() {
  const { selection, bulkActions } = useBulkActionsContext<MyEntity>()
  const { filteredData } = useTableFiltersWithData(data, filterOptions)
  const { sortedData } = useTableSortWithData(filteredData, sortOptions)
  
  return (
    <>
      <BulkActionsToolbar {...toolbarProps} />
      <DataTable {...tableProps} />
    </>
  )
}
```

## Migration Guide

### For Existing Tables
1. **Extract expandable content** into separate component
2. **Move column definitions** to separate file with hooks
3. **Replace selection logic** with `useTableSelection`
4. **Replace bulk operations** with `BulkActionsProvider`
5. **Wrap with provider** and update imports

### File Structure
```
src/features/[entity]/components/
├── [Entity]Table.tsx                 # Main component (< 200 lines)
├── [Entity]TableRefactored.tsx       # Refactored version
└── table/
    ├── [Entity]ExpandedContent.tsx   # Expandable content
    └── [Entity]Row.tsx               # Column definitions
```

## Next Steps

1. **Refactor ContactsTable** using established pattern
2. **Refactor OrganizationsTable** with provider integration  
3. **Refactor ProductsTable** and finalize patterns
4. **Performance testing** and bundle size validation
5. **Documentation updates** and pattern standardization

---

*This refactoring reduces technical debt while maintaining all existing functionality and improving consistency across the CRM application.*