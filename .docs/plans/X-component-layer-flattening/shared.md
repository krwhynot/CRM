# Component Layer Flattening Implementation Plan

The current architecture suffers from excessive component layering with 4+ layers per entity page (Page → DataDisplay → List → EntityListWrapper → DataTable). This plan consolidates to 1-2 layers through wrapper elimination, layout simplification, and business logic centralization while maintaining full functionality through unified entity patterns.

## Relevant Files

### Page Components
- `/src/pages/Contacts.tsx`: Standard pattern using DataDisplay wrapper, target for direct composition
- `/src/pages/Organizations.tsx`: Standard pattern using DataDisplay wrapper, needs simplification
- `/src/pages/Products.tsx`: Standard pattern using DataDisplay wrapper, requires refactoring
- `/src/pages/Opportunities.tsx`: **IDEAL PATTERN** - skips DataDisplay wrapper, demonstrates target architecture
- `/src/pages/Interactions.tsx`: Standard pattern, requires migration to simplified approach

### DataDisplay Wrapper Components (TARGET FOR REMOVAL)
- `/src/features/contacts/components/ContactsDataDisplay.tsx`: 49-line wrapper with identical loading/error logic
- `/src/features/organizations/components/OrganizationsDataDisplay.tsx`: Duplicate wrapper, pure conditional rendering
- `/src/features/products/components/ProductsDataDisplay.tsx`: Same pattern with optional props inconsistency
- `/src/features/interactions/components/InteractionsDataDisplay.tsx`: Identical pattern with additional callback
- **MISSING**: OpportunitiesDataDisplay.tsx (opportunities already follows target pattern)

### Entity List Components (MAJOR REFACTOR TARGET)
- `/src/features/contacts/components/ContactsList.tsx`: 405 lines with 150+ lines of bulk operation logic to extract
- `/src/features/organizations/components/OrganizationsList.tsx`: 414 lines with duplicate business logic patterns
- `/src/features/opportunities/components/OpportunitiesList.tsx`: Most complex with embedded interaction timelines
- `/src/features/products/components/ProductsList.tsx`: Standard pattern with useBulkOperations integration

### Layout Components (SIMPLIFICATION TARGET)
- `/src/components/layout/EntityListWrapper.tsx`: Creates duplicate PageLayout structure, target for removal
- `/src/components/layout/PageLayoutRenderer.tsx`: 669-line unused schema-driven system, delete entirely
- `/src/components/layout/LayoutProvider.tsx`: Unused React context system, remove completely
- `/src/lib/layout/renderer.ts`: Dead code with stub implementation, safe to delete
- `/src/layouts/organizations-list.layout.ts`: 669-line unused configuration, remove

### Hook System (UNIFICATION TARGET)
- `/src/hooks/useEntityPageState.ts`: Generic CRUD dialog management, base for unified pattern
- `/src/hooks/useEntitySelection.ts`: Generic multi-item selection, foundation for consolidation
- `/src/hooks/useStandardDataTable.ts`: DataTable configuration hook, enhance for loading/error states
- `/src/features/*/hooks/use*PageState.ts`: Thin 30-line wrappers around useEntityPageState, eliminate

### Core Infrastructure (ENHANCEMENT TARGET)
- `/src/components/data-table/data-table.tsx`: Main DataTable component, add loading/error state support
- `/src/components/ui/data-state.tsx`: LoadingState/ErrorState components, integrate directly into DataTable
- `/src/App.tsx`: LazyPageWrapper usage, simplify to inline error boundary + suspense

## Relevant Tables

- **contacts**: Primary entity for contact management with weekly context data
- **organizations**: Company entities with principal products and engagement metrics
- **products**: Catalog items with promotion tracking and supplier information
- **opportunities**: Sales opportunities with complex relationship data and interaction timelines
- **interactions**: Communication history linked to contacts and opportunities

## Relevant Patterns

**DataDisplay Wrapper Pattern**: Identical 49-line components that conditionally render LoadingState, ErrorState, or delegate to List component - prime candidates for elimination. Example: `/src/features/contacts/components/ContactsDataDisplay.tsx`

**EntityListWrapper Duplication**: Layout component that recreates PageLayout + PageHeader + ContentSection structure already established at page level, creating nested duplicate layouts. Example: `/src/components/layout/EntityListWrapper.tsx`

**Generic Hook Composition**: useEntityPageState<T> wrapped by entity-specific hooks (useContactsPageState) in identical 30-line patterns that add no value. Example: `/src/features/contacts/hooks/useContactsPageState.ts`

**Bulk Operations Duplication**: 150+ lines of identical selection state management and bulk delete logic duplicated across ContactsList and OrganizationsList components.

**Query Key Factory**: Consistent hierarchical cache key generation pattern across all entities for TanStack Query optimization. Example: contactKeys.list(filters) in `/src/features/contacts/hooks/useContacts.ts`

**ResponsiveFilterWrapper Integration**: DataTable component with 20+ ResponsiveFilterWrapper-related props managed through useStandardDataTable hook abstraction.

**Schema-Driven Layout System**: Complex unused 2000+ line layout system with PageLayoutRenderer, LayoutProvider, and configuration files that adds zero value to current implementation.

**Opportunities Direct Pattern**: The opportunities page demonstrates the target architecture by bypassing DataDisplay wrapper entirely and going directly from page to OpportunitiesList to DataTable.

## Relevant Docs

**entity-architecture.docs.md**: You _must_ read this when working on DataDisplay wrapper removal, EntityListWrapper elimination, and understanding current component hierarchy problems.

**layout-system.docs.md**: You _must_ read this when working on layout simplification, removing unused schema-driven components, and flattening container hierarchies.

**hook-patterns.docs.md**: You _must_ read this when working on hook consolidation, creating useEntityPage pattern, and understanding current state management boundaries.

**data-display-patterns.docs.md**: You _must_ read this when working on DataTable integration, standardizing props interfaces, and understanding entity-specific display patterns.