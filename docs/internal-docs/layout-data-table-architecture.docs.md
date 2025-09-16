# Layout and Data Table Architecture Research

Comprehensive analysis of the current layout and data table architecture across the CRM codebase, focusing on standardization opportunities and critical duplicate rendering issues.

## Relevant Files

### Core Layout Components
- `/src/components/layout/PageLayout.tsx`: Simple page wrapper with consistent background and PageContainer
- `/src/components/layout/PageHeader.tsx`: Standardized title, description, and action button layout
- `/src/components/layout/PageContainer.tsx`: Responsive width and spacing container
- `/src/components/layout/ContentSection.tsx`: Optional content sectioning component
- `/src/components/layout/index.ts`: Export definitions showing legacy components being phased out

### Data Table System
- `/src/components/data-table/data-table.tsx`: Enhanced DataTable with TanStack Table - **CRITICAL DUPLICATE RENDERING** (lines 241-315)
- `/src/components/data-table/columns/organizations.tsx`: Column definitions with selection/expansion - **DUPLICATE SOURCE** (lines 162-213)
- `/src/components/data-table/pagination.tsx`: Standard TanStack Table pagination with configurable page sizes
- `/src/components/data-table/toolbar.tsx`: Filtering and view options toolbar
- `/src/components/data-table/filters/EntityFilters.tsx`: Unified filtering interface (well-designed, inconsistently adopted)

### Entity List Components
- `/src/features/organizations/components/OrganizationsList.tsx`: **DUPLICATE HEADER ISSUE** (lines 388-406)
- `/src/features/contacts/components/ContactsList.tsx`: Uses legacy ContactsFilters, needs EntityFilters migration
- `/src/features/products/components/ProductsList.tsx`: Minimal filtering, needs bulk actions and expandable rows
- `/src/features/opportunities/components/OpportunitiesList.tsx`: Requires alignment with standard pattern

### Filter Implementations (Inconsistent Patterns)
- `/src/features/contacts/components/ContactsFilters.tsx`: **TODO comments** for EntityFilters migration (lines 2-3, 43)
- `/src/features/organizations/components/OrganizationsFilters.tsx`: **Stripped during simplification** (lines 81-82) + duplicate header (lines 58-77)
- `/src/features/products/components/ProductsFilters.tsx`: Minimal implementation
- `/src/features/opportunities/components/OpportunitiesFilters.tsx`: Minimal implementation

### Bulk Actions System
- `/src/components/bulk-actions/BulkActionsToolbar.tsx`: Well-designed, reusable with TypeScript generics
- `/src/components/bulk-actions/BulkDeleteDialog.tsx`: Confirmation dialog for bulk operations
- `/src/components/bulk-actions/types.ts`: TypeScript interfaces for bulk actions

### Page Composition
- `/src/pages/Organizations.tsx`: Clean PageLayout → PageHeader + ContentSection pattern

## Architectural Patterns

### Current Layout Pattern
- **Simple Composition**: `PageLayout` → `PageHeader` + `ContentSection` replacing complex layout-builder system
- **Component-First**: Uses shadcn/ui primitives wrapped in CRM-specific components
- **Feature-Based Organization**: Domain logic grouped by business features in `/src/features/*/components/`
- **Legacy Phase-Out**: Complex layout components (LayoutProvider, PageLayoutRenderer) being deprecated

### Data Table Integration
- **TanStack Table**: Enhanced DataTable using TanStack Table for sorting, filtering, and pagination
- **Column-Based Architecture**: Entity-specific column definitions with helpers (createSortableHeader, createSelectColumn, etc.)
- **OpenStatus Pattern**: Integrated filtering, expandable rows, and entity-specific configurations
- **State Management Separation**: TanStack Query for server data, Zustand for client UI state

### Filter Architecture
- **EntityFilters Pattern**: Unified filtering interface with configurable search, time ranges, and quick filters
- **Type Safety**: Strong TypeScript interfaces for filter states and options
- **Reusable Components**: TimeRangeFilter, QuickFilters as composable filter components

## Edge Cases & Gotchas

### Critical Duplicate Rendering Issue
**Problem**: Both column definitions (`/src/components/data-table/columns/organizations.tsx` lines 162-213) AND the DataTable component (`/src/components/data-table/data-table.tsx` lines 241-315) render selection checkboxes and expansion arrows.

**Root Cause**: Two separate systems rendering the same functionality:
- Column-based approach in TanStack Table (lines 162-182 for select, lines 184-213 for expand in organizations.tsx)
- Manual rendering in DataTable component (lines 241-252 for select header, 286-315 for row cells)

**Impact**: Users see duplicate checkboxes and expansion arrows in data tables

### Header Duplication Across Components
**Problem**: Multiple components render the same page headers:
- OrganizationsList.tsx lines 388-406: Manual header with title and add button
- OrganizationsFilters.tsx lines 58-77: Another header duplication
- PageHeader component: Standard header that should be used instead

**Impact**: Visual redundancy and inconsistent spacing/styling

### Inconsistent Filter Adoption
**Problem**: Mixed adoption of EntityFilters pattern across entities:
- ContactsFilters: Legacy implementation with TODO comments for migration
- OrganizationsFilters: Stripped during architecture simplification (lines 81-82)
- Other entities: Minimal or no filtering implementations

**Impact**: Inconsistent user experience across entity pages

### Missing Standardization Components
**Problem**: No shared wrapper or hook for consistent DataTable configuration:
- Each entity list implements its own DataTable setup
- Inconsistent prop patterns across entity lists
- No standard configuration for pagination, selection, expansion

## Relevant Docs

**Primary Architecture Reference**: `.docs/plans/layout-standardization/shared.md` - Documents exact duplicate rendering issues and implementation phases

**CLAUDE.md**: Component-driven architecture guidelines, form systems, and state management patterns

**Design System**: `src/lib/design-tokens.ts` for consistent styling and spacing

## Opportunities for Standardization

### 1. EntityListWrapper Component
Create a shared wrapper that:
- Combines PageHeader + BulkActionsToolbar + DataTable
- Provides consistent DataTable configuration
- Handles common patterns (selection, expansion, filtering)
- Eliminates duplicate headers

### 2. useStandardDataTable Hook
Centralized hook for:
- Standard DataTable props and configuration
- Consistent pagination settings (10, 20, 30, 40, 50 page sizes)
- Integration patterns with EntityFilters and BulkActionsToolbar

### 3. Unified EntityFilters Migration
- Replace all legacy filter implementations with EntityFilters
- Consistent search, time range, and quick filter patterns
- Standardized filter state management

### 4. Column Definition Standardization
- Remove duplicate rendering from DataTable component (lines 241-252, 286-315)
- Rely solely on column definitions for UI rendering
- Keep state management in DataTable, UI rendering in columns

### 5. Page Template Pattern
Standardize all entity pages to follow:
```
PageLayout
  PageHeader (title, description, action)
  ContentSection
    EntityFilters (if applicable)
    EntityListWrapper
      BulkActionsToolbar (conditional)
      DataTable (with standard config)
```

This research reveals a well-designed foundation with specific implementation inconsistencies that can be systematically addressed through component standardization and pattern consolidation.