# Layout Standardization - Parallel Implementation Plan

This plan addresses the systematic layout standardization across the CRM application, focusing on eliminating duplicate rendering issues, standardizing entity filters, and creating consistent page layouts. The implementation leverages existing PageLayout, EntityFilters, and BulkActionsToolbar components while fixing critical data table duplication problems and establishing reusable patterns for all entity pages.

## Critically Relevant Files and Documentation

### Core Components to Understand
- `/src/components/data-table/data-table.tsx` - Main table component with duplicate rendering issues (lines 241-315)
- `/src/components/data-table/columns/organizations.tsx` - Column definitions causing duplicates (lines 162-213)
- `/src/components/data-table/filters/EntityFilters.tsx` - Modern filter system to be standardized
- `/src/components/layout/PageLayout.tsx` - Page wrapper for consistent structure
- `/src/components/layout/PageHeader.tsx` - Standardized headers
- `/src/components/bulk-actions/BulkActionsToolbar.tsx` - Reusable bulk operations

### Entity List Components
- `/src/features/organizations/components/OrganizationsList.tsx` - Reference implementation with issues
- `/src/features/contacts/components/ContactsList.tsx` - Needs standardization
- `/src/features/opportunities/components/OpportunitiesList.tsx` - Requires EntityFilters
- `/src/features/products/components/ProductsList.tsx` - Minimal implementation
- `/src/features/interactions/components/` - Missing list component

### Documentation
- `/CLAUDE.md` - Architecture patterns and component guidelines
- `/docs/internal-docs/layout-data-table-architecture.docs.md` - Research findings
- `/docs/internal-docs/filter-system-research.docs.md` - Filter system analysis

## Implementation Plan

### Phase 1: Fix Core Duplication Issues

#### Task 1.1: Remove DataTable Duplicate Rendering [none]

**READ THESE BEFORE TASK**
- `/src/components/data-table/data-table.tsx` (lines 241-315)
- `/src/components/data-table/columns/organizations.tsx` (lines 162-213)
- `/docs/internal-docs/layout-data-table-architecture.docs.md`

**Instructions**

Files to Modify
- `/src/components/data-table/data-table.tsx`

Remove manual selection checkbox and expansion arrow rendering from DataTable component (lines 241-252, 286-315). Keep only the state management logic and rely on column definitions for UI rendering. Ensure selection and expansion state management remains functional.

#### Task 1.2: Clean Column Definitions [1.1]

**READ THESE BEFORE TASK**
- `/src/components/data-table/columns/organizations.tsx` (lines 162-213)
- `/src/components/data-table/columns/contacts.tsx`
- `/src/features/organizations/components/OrganizationsList.tsx` (lines 371-372)

**Instructions**

Files to Modify
- `/src/components/data-table/columns/organizations.tsx`
- `/src/components/data-table/columns/contacts.tsx`
- All other column definition files

Remove the `selectable` and `expandable` options from column creation functions. Ensure selection and expansion columns are only added when explicitly requested by the DataTable component, not automatically by column definitions.

#### Task 1.3: Remove Duplicate Headers [1.1]

**READ THESE BEFORE TASK**
- `/src/features/organizations/components/OrganizationsList.tsx` (lines 388-406)
- `/src/components/layout/PageHeader.tsx`

**Instructions**

Files to Modify
- `/src/features/organizations/components/OrganizationsList.tsx`

Remove manual header rendering (lines 388-406) and rely solely on PageHeader component integration. Ensure the DataTable toolbar provides search and action functionality without conflicting headers.

### Phase 2: Create Standardization Components

#### Task 2.1: Create EntityListWrapper Component [1.3]

**READ THESE BEFORE TASK**
- `/src/features/organizations/components/OrganizationsList.tsx`
- `/src/components/layout/PageLayout.tsx`
- `/src/components/layout/PageHeader.tsx`

**Instructions**

Files to Create
- `/src/components/layout/EntityListWrapper.tsx`

Create a reusable wrapper component that combines PageLayout, PageHeader, and ContentSection with standardized props for entity lists. Include props for title, description, add button, and children content.

#### Task 2.2: Create useStandardDataTable Hook [2.1]

**READ THESE BEFORE TASK**
- `/src/features/organizations/components/OrganizationsList.tsx` (lines 429-432)
- `/src/features/contacts/components/ContactsList.tsx` (lines 412-413)
- `/src/components/data-table/data-table.tsx`

**Instructions**

Files to Create
- `/src/hooks/useStandardDataTable.ts`

Create a hook that provides consistent DataTable configuration including pagination, selection, expansion, and toolbar settings. Return standardized props object that can be spread into DataTable components.

#### Task 2.3: Complete EntityFilters DataTable Integration [none]

**READ THESE BEFORE TASK**
- `/src/components/data-table/filters/EntityFilters.tsx`
- `/src/features/organizations/components/OrganizationsList.tsx` (useEntityFilters reference)
- `/docs/internal-docs/filter-system-research.docs.md`

**Instructions**

Files to Create
- `/src/hooks/useEntityFilters.ts`

Files to Modify
- `/src/components/data-table/data-table.tsx`

Add missing `useEntityFilters` and `entityFilters` props to DataTable component. Create useEntityFilters hook for filter state management. Implement the integration pattern referenced in OrganizationsList.

### Phase 3: Standardize Entity Pages

#### Task 3.1: Migrate Organizations Page [2.1, 2.2, 2.3]

**READ THESE BEFORE TASK**
- `/src/features/organizations/components/OrganizationsList.tsx`
- `/src/components/layout/EntityListWrapper.tsx`
- `/src/hooks/useStandardDataTable.ts`

**Instructions**

Files to Modify
- `/src/features/organizations/components/OrganizationsList.tsx`
- `/src/features/organizations/components/OrganizationsFilters.tsx`

Refactor OrganizationsList to use EntityListWrapper, useStandardDataTable, and complete EntityFilters integration. Remove manual header and configuration code. Rebuild OrganizationsFilters using EntityFilters component.

#### Task 3.2: Migrate Contacts Page [2.1, 2.2, 2.3]

**READ THESE BEFORE TASK**
- `/src/features/contacts/components/ContactsList.tsx`
- `/src/features/contacts/components/ContactsFilters.tsx`
- `/src/components/layout/EntityListWrapper.tsx`

**Instructions**

Files to Modify
- `/src/features/contacts/components/ContactsList.tsx`
- `/src/features/contacts/components/ContactsFilters.tsx`

Apply standardization pattern to ContactsList using EntityListWrapper and useStandardDataTable. Migrate ContactsFilters from legacy implementation to EntityFilters component following the TODO comments.

#### Task 3.3: Migrate Opportunities Page [2.1, 2.2, 2.3]

**READ THESE BEFORE TASK**
- `/src/features/opportunities/components/OpportunitiesList.tsx`
- `/src/features/opportunities/components/OpportunitiesFilters.tsx`
- `/src/components/layout/EntityListWrapper.tsx`

**Instructions**

Files to Modify
- `/src/features/opportunities/components/OpportunitiesList.tsx`
- `/src/features/opportunities/components/OpportunitiesFilters.tsx`

Standardize OpportunitiesList with EntityListWrapper and useStandardDataTable. Replace minimal OpportunitiesFilters with full EntityFilters implementation supporting opportunity-specific filters.

#### Task 3.4: Migrate Products Page [2.1, 2.2, 2.3]

**READ THESE BEFORE TASK**
- `/src/features/products/components/ProductsList.tsx`
- `/src/features/products/components/ProductsFilters.tsx`
- `/src/components/layout/EntityListWrapper.tsx`

**Instructions**

Files to Modify
- `/src/features/products/components/ProductsList.tsx`
- `/src/features/products/components/ProductsFilters.tsx`

Apply standardization to ProductsList and rebuild ProductsFilters with EntityFilters. Add bulk actions and expandable rows functionality that was missing.

#### Task 3.5: Create and Migrate Interactions Page [2.1, 2.2, 2.3]

**READ THESE BEFORE TASK**
- `/src/features/interactions/components/InteractionsFilters.tsx`
- `/src/pages/Interactions.tsx`
- `/src/components/layout/EntityListWrapper.tsx`

**Instructions**

Files to Create
- `/src/features/interactions/components/InteractionsList.tsx`

Files to Modify
- `/src/features/interactions/components/InteractionsFilters.tsx`
- `/src/pages/Interactions.tsx`

Create missing InteractionsList component using standardization pattern. Rebuild InteractionsFilters with EntityFilters. Update Interactions page to use new list component.

### Phase 4: Add Navigation Enhancement

#### Task 4.1: Create Breadcrumbs Component [none]

**READ THESE BEFORE TASK**
- `/src/components/layout/PageHeader.tsx`
- `/src/pages/Organizations.tsx`
- Current routing structure

**Instructions**

Files to Create
- `/src/components/layout/Breadcrumbs.tsx`

Create simple breadcrumb component with "Home > [Current Page]" pattern. Auto-generate breadcrumbs from current route using React Router location.

#### Task 4.2: Integrate Breadcrumbs into PageLayout [4.1]

**READ THESE BEFORE TASK**
- `/src/components/layout/PageLayout.tsx`
- `/src/components/layout/PageHeader.tsx`
- `/src/components/layout/Breadcrumbs.tsx`

**Instructions**

Files to Modify
- `/src/components/layout/PageLayout.tsx`
- `/src/components/layout/PageHeader.tsx`

Add breadcrumb support to PageLayout and PageHeader components. Ensure breadcrumbs appear consistently across all entity pages.

### Phase 5: Validation and Polish

#### Task 5.1: Create Empty State Components [none]

**READ THESE BEFORE TASK**
- `/src/components/data-table/data-table.tsx`
- Existing empty state patterns

**Instructions**

Files to Create
- `/src/components/layout/EmptyState.tsx`

Files to Modify
- `/src/components/data-table/data-table.tsx`

Create reusable EmptyState component for consistent no-data displays. Integrate with DataTable for empty search results and empty entity lists.

#### Task 5.2: Architecture Validation Testing [3.1, 3.2, 3.3, 3.4, 3.5]

**READ THESE BEFORE TASK**
- All migrated entity list components
- `/tests/architecture/` existing patterns

**Instructions**

Files to Create
- `/tests/architecture/layout-standardization.test.ts`

Create architecture tests to validate:
- No duplicate headers on any page
- No duplicate checkboxes in data tables
- All entity pages use EntityListWrapper pattern
- All filters use EntityFilters component
- Consistent DataTable configuration across entities

#### Task 5.3: Responsive Design Audit [5.1]

**READ THESE BEFORE TASK**
- All entity list components after migration
- `/src/lib/design-tokens.ts`
- Mobile breakpoint patterns

**Instructions**

Files to Modify
- Any components with responsive issues discovered

Audit all entity pages for consistent responsive behavior. Ensure EntityListWrapper, DataTable, and EntityFilters work properly on mobile devices. Fix any layout issues discovered.

## Advice

- **Test Incremental Changes**: After fixing duplicate rendering (Task 1.1), immediately test Organizations page to ensure selection and expansion still work correctly before proceeding.

- **Maintain State Management**: When removing duplicate rendering, preserve all existing state management logic for selection, expansion, and filtering - only remove UI rendering duplicates.

- **EntityFilters Configuration**: Each entity will need specific filter configurations. Start with Organizations as the reference and copy patterns to other entities, adjusting field names and options.

- **Column Definition Safety**: When cleaning column definitions (Task 1.2), ensure you don't break any custom column logic - only remove the automatic selection/expansion column additions.

- **Migration Order Matters**: Complete all duplicate fixes (Phase 1) before starting standardization (Phase 2) to avoid compounding issues. Test each phase thoroughly before proceeding.

- **Bulk Actions Integration**: When migrating entity pages, ensure BulkActionsToolbar integration is consistent. The component is well-designed but needs proper data and callback integration.

- **Performance Monitoring**: The standardization will reduce duplicate DOM elements significantly. Monitor for improved performance, especially on pages with large datasets.

- **Accessibility Preservation**: EntityFilters component has good accessibility features. Ensure these are maintained during migration and that duplicate screen reader announcements are eliminated.