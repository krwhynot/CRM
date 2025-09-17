# Layout Standardization - Component-First Architecture

This plan addresses standardizing entity page layouts across the CRM application using a component-first approach, while simultaneously fixing critical data table issues like duplicate checkboxes and expansion arrows. The architecture leverages existing EntityFilters, BulkActionsToolbar, and PageLayout components to create consistent user experiences across all entity pages.

## Relevant Files

### Core Layout Components
- `/src/components/layout/PageLayout.tsx`: Simple page wrapper providing consistent background and container structure
- `/src/components/layout/PageHeader.tsx`: Standardized title, description, and action button layout
- `/src/components/layout/PageContainer.tsx`: Responsive width and spacing container
- `/src/components/layout/ContentSection.tsx`: Optional content sectioning for organized page structure

### Data Table System
- `/src/components/data-table/data-table.tsx`: Enhanced DataTable with TanStack Table, contains duplicate rendering issue (lines 241-315)
- `/src/components/data-table/columns/organizations.tsx`: Column definitions with selection/expansion columns (lines 162-213), contributing to duplicates
- `/src/components/data-table/filters/EntityFilters.tsx`: Unified filtering interface with search, time ranges, and quick filters
- `/src/components/data-table/pagination.tsx`: Consistent pagination controls

### Entity List Components
- `/src/features/organizations/components/OrganizationsList.tsx`: Template implementation with duplicate header issue (lines 388-406)
- `/src/features/contacts/components/ContactsList.tsx`: Needs standardization and EntityFilters integration
- `/src/features/opportunities/components/OpportunitiesList.tsx`: Requires alignment with standard pattern
- `/src/features/products/components/ProductsList.tsx`: Needs bulk actions and expandable rows
- `/src/features/interactions/components/InteractionsTable.tsx`: No dedicated list component, needs creation

### Bulk Actions System
- `/src/components/bulk-actions/BulkActionsToolbar.tsx`: Generic, reusable toolbar with TypeScript generics
- `/src/components/bulk-actions/BulkDeleteDialog.tsx`: Confirmation dialog for bulk delete operations
- `/src/components/bulk-actions/types.ts`: TypeScript interfaces for bulk action props

### Entity Filters
- `/src/features/contacts/components/ContactsFilters.tsx`: Legacy implementation, needs EntityFilters migration
- `/src/features/organizations/components/OrganizationsFilters.tsx`: Stripped down, needs re-implementation
- `/src/features/opportunities/components/OpportunitiesFilters.tsx`: Minimal, needs complete filter system
- `/src/features/products/components/ProductsFilters.tsx`: Stripped down, needs re-implementation
- `/src/features/interactions/components/InteractionsFilters.tsx`: Minimal, needs complete filter system

## Relevant Tables

- `organizations`: Primary entity table with contacts, opportunities, and product relationships
- `contacts`: Individual people within organizations
- `opportunities`: Sales opportunities linked to organizations and contacts
- `products`: Items being sold/distributed
- `interactions`: Communication history and touchpoints

## Relevant Patterns

**Component-First Architecture**: Uses shadcn/ui primitives wrapped in CRM-specific components for consistent design system implementation, seen in `/src/components/ui/` directory.

**EntityFilters Pattern**: Unified filtering interface at `/src/components/data-table/filters/EntityFilters.tsx` with configurable search, time ranges, and quick filters that can be applied to any entity type.

**Feature-Based Organization**: Domain logic grouped by business features in `/src/features/*/components/` with entity-specific hooks and components.

**TanStack Table Integration**: Enhanced DataTable using TanStack Table for sorting, filtering, and pagination with column-based selection and expansion, implemented in `/src/components/data-table/data-table.tsx`.

**Bulk Actions Integration**: Generic BulkActionsToolbar at `/src/components/bulk-actions/BulkActionsToolbar.tsx` with TypeScript generics for reusable bulk operations across entities.

**PageLayout Composition**: Simple layout composition using PageLayout → PageHeader + ContentSection pattern for consistent page structure across all entity pages.

**State Management Separation**: TanStack Query for server data, Zustand for client UI state, with clear boundaries maintained in entity hooks and components.

## Relevant Docs

**CLAUDE.md**: You _must_ read this when working on component architecture, form systems, state management patterns, and understanding the simplified architecture approach.

**src/types/entities.ts**: You _must_ read this when working on entity type definitions, relationships, and data structures.

**src/lib/design-tokens.ts**: You _must_ read this when working on consistent styling, spacing, and design system implementation.

## Critical Issues to Address

### Duplicate Rendering Issue
**Problem**: Both column definitions (`/src/components/data-table/columns/organizations.tsx` lines 162-213) AND the DataTable component (`/src/components/data-table/data-table.tsx` lines 241-315) are adding selection checkboxes and expansion arrows, resulting in duplicate UI elements.

**Root Cause**: Two separate systems are rendering the same functionality - the column-based approach in TanStack Table and the manual rendering in the DataTable component.

**Solution**: Remove manual rendering from DataTable component (lines 241-252, 286-315) and rely solely on column definitions for UI rendering while keeping state management in DataTable.

### Header Duplication
**Problem**: OrganizationsList has duplicate headers - one in the component itself and one from PageHeader, creating visual redundancy.

**Location**: `/src/features/organizations/components/OrganizationsList.tsx` lines 388-406 need removal.

### Inconsistent Filter Implementation
**Problem**: Mixed adoption of EntityFilters pattern across entities, with some using legacy implementations and others having minimal or no filtering.

**Status**:
- ContactsFilters: Legacy with TODOs for EntityFilters migration
- OrganizationsFilters: Stripped during simplification, needs rebuild
- Other entity filters: Minimal implementations requiring complete systems

### Missing Standardization Components
**Problem**: No shared EntityListWrapper or useStandardDataTable hook for consistent configuration across all entity lists.

**Need**: Central configuration for DataTable props, pagination settings, and integration patterns.

## Implementation Phases

### Phase 1: Fix Core Issues (Days 1-2)
1. Remove duplicate rendering from DataTable component
2. Extract EntityListWrapper for shared list functionality
3. Create useStandardDataTable hook for consistent configuration
4. Remove duplicate headers from OrganizationsList

### Phase 2: Standardize Entity Pages (Days 3-5)
1. Migrate all entity filters to EntityFilters pattern
2. Apply EntityListWrapper to all entity lists
3. Enable bulk actions and expandable rows consistently
4. Ensure all pages follow PageLayout → PageHeader + ContentSection pattern

### Phase 3: Add Navigation (Day 6)
1. Create simple Breadcrumbs component (Home > [Current Page])
2. Integrate breadcrumbs into PageLayout
3. Auto-generate breadcrumbs from current route

### Phase 4: Validation and Testing (Day 7)
1. Audit all pages for consistency
2. Verify filter functionality across entities
3. Test bulk actions and expandable rows
4. Ensure responsive design and empty states

## Success Criteria

✅ No duplicate checkboxes or expansion arrows in any data table
✅ No duplicate titles or headers on any page
✅ All entity pages use consistent DataTable configuration
✅ All entities have working EntityFilters implementation
✅ All pages support bulk actions with BulkActionsToolbar
✅ All pages have expandable rows for detail viewing
✅ Simple breadcrumb navigation on all pages
✅ Consistent empty states across all entity lists
✅ Organizations page serves as the template for other entities