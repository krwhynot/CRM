# Hook Patterns and State Management Research

Research on existing hook patterns and state management architecture to identify opportunities for creating unified patterns like useEntityPage.

## Relevant Files

- `/src/hooks/index.ts`: Main hook exports with generic utilities
- `/src/hooks/useEntityPageState.ts`: Generic CRUD dialog state management
- `/src/hooks/useEntitySelection.ts`: Generic multi-item selection with Set<string> pattern
- `/src/hooks/useStandardDataTable.ts`: Standardized DataTable configuration hook
- `/src/features/contacts/hooks/useContacts.ts`: Comprehensive contact entity hooks with TanStack Query
- `/src/features/organizations/hooks/useOrganizations.ts`: Organization entity hooks with query key factory
- `/src/features/opportunities/hooks/useOpportunities.ts`: Complex opportunity hooks with filtering and relationships
- `/src/features/contacts/hooks/useContactsPageState.ts`: Entity-specific page state wrapper
- `/src/features/contacts/hooks/useContactsFiltering.ts`: Client-side filtering and search logic
- `/src/stores/contactAdvocacyStore.ts`: Zustand client-side UI state management example

## Architectural Patterns

### Query Key Factory Pattern
**Consistent across all entities** - Standardized cache key generation:
```typescript
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters?: ContactFilters) => [...contactKeys.lists(), { filters }] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  byOrganization: (organizationId: string) => [...contactKeys.all, 'organization', organizationId] as const,
}
```

### TanStack Query Integration Pattern
**Server state management** - Consistent useQuery/useMutation patterns:
- 5-minute staleTime across all entity hooks
- Standardized error handling and data transformation
- Cache invalidation patterns in mutation onSuccess callbacks
- RLS policy compliance with authentication checks

### Generic Hook Utilities
**Reusable abstractions** - Type-safe generic hooks:
- **useEntityPageState<T>**: Generic CRUD dialog management
- **useEntitySelection<T>**: ID-based multi-selection with Set pattern
- **useStandardDataTable**: Unified DataTable configuration with responsive filters

### State Boundary Enforcement
**Clear separation** - TanStack Query vs Zustand usage:
- **Server State (TanStack Query)**: All API/database data, relationships, computed values
- **Client State (Zustand)**: UI preferences, view modes, form state, selections, filters

### Hook Composition Patterns
**Entity-specific wrappers** - Composing generic hooks with entity types:
```typescript
export const useContactsPageState = () => {
  const { /* ... */ } = useEntityPageState<Contact>()
  // Renames selectedEntity to selectedContact for type safety
}
```

## Current Loading/Error State Management

### TanStack Query Built-in States
**Consistent across entities**:
```typescript
const { data, isLoading, isError, error, status, fetchStatus } = useContacts(filters)
```

### Error Handling Patterns
- Authentication validation in mutation functions
- Business rule validation before database operations
- Consistent error surfaces via toast notifications
- Soft delete patterns with `deleted_at` filtering

### Loading State Coordination
- Query status monitoring with debug utilities in development
- Stale time management (5 minutes standard, 2 minutes for activity data)
- Cache invalidation strategies for related data consistency

## Shared Hook Utilities

### Generic Abstractions
**Location**: `/src/hooks/`
- **useEntityPageState**: CRUD dialog management for any entity type
- **useEntitySelection**: Multi-item selection with Set<string> pattern
- **useStandardDataTable**: DataTable configuration with responsive filters
- **useFilterLayout**: Device-aware filter layout management
- **useMediaQuery**: Responsive design utilities
- **useFormLayout**: Form configuration and validation setup

### Entity-Specific Patterns
**Location**: `/src/features/*/hooks/`
- **Filtering**: Client-side search and filter logic per entity
- **Display**: Data transformation for presentation layer
- **Selection**: Entity-specific selection state management
- **Page Actions**: CRUD operation orchestration
- **Page State**: Entity-specific wrappers around generic hooks

## State Management Patterns Across Features

### Server State (TanStack Query) Patterns
1. **Query Key Factories**: Hierarchical cache keys with filter normalization
2. **Mutation Patterns**: Optimistic updates with rollback on error
3. **Cache Management**: Strategic invalidation and preloading
4. **Relationship Loading**: Join queries with select statements for related data

### Client State (Zustand) Patterns
1. **UI State Only**: View modes, preferences, temporary selections
2. **ID-Based Selection**: Store entity IDs, not full objects
3. **Persistence**: UI preferences persisted to localStorage
4. **Type Safety**: BaseClientState interface with validation

### Hook Composition Strategy
1. **Generic Base**: useEntityPageState, useEntitySelection
2. **Entity Wrapper**: useContactsPageState wraps generic with entity types
3. **Feature Integration**: Page-level hooks combine multiple concerns
4. **Separation of Concerns**: Clear boundaries between server and client state

## Current Hook Export Patterns

### Main Hook Exports (`/src/hooks/index.ts`)
**Categories**:
- Form & Data Hooks (useCoreFormSetup, useFormLayout)
- Generic Entity Hooks (useEntitySelection, useEntityPageState)
- Data Table Hooks (useStandardDataTable)
- UI & Navigation Hooks (useIsMobile, useSidebar)
- Filter Layout Hooks (useFilterLayout with full API)

### Feature-Specific Exports
**Pattern**: Each feature exports its own hooks directly from feature directories
- No centralized feature hook exports
- Direct imports from `/src/features/*/hooks/`
- Entity-specific naming conventions

### Export Strategy
- **Generic hooks**: Exported from `/src/hooks/index.ts`
- **Entity hooks**: Direct imports from feature directories
- **Type exports**: Included with hook exports for full API surface

## Edge Cases & Gotchas

### Query Key Normalization
**Issue**: Filter objects can create cache misses due to key inconsistency
**Solution**: Normalize filters in query key factory (sort arrays, handle undefined)

### Authentication State Synchronization
**Issue**: Mutations need current user for RLS policy compliance
**Pattern**: `validateAuthentication` utility in all mutations

### Client-Side Filter State Persistence
**Issue**: Persisted filters may reference deleted entities
**Gotcha**: Filter validation needed on store hydration

### Generic Hook Type Safety
**Issue**: Entity types must extend `{ id: string }` for generic hooks
**Pattern**: Consistent ID-based patterns across all entities

### Cache Invalidation Complexity
**Issue**: Related entity updates require multiple cache invalidations
**Pattern**: Comprehensive invalidation in mutation onSuccess callbacks

## Opportunities for Standardization (useEntityPage)

### Unified Entity Page Pattern
**Potential**: Combine common page-level patterns:
```typescript
interface UseEntityPageConfig<T> {
  entityName: string
  useEntityList: (filters?: any) => QueryResult<T[]>
  useCreateEntity: () => MutationResult<T>
  useUpdateEntity: () => MutationResult<T>
  useDeleteEntity: () => MutationResult<T>
  defaultFilters?: any
  enableResponsiveFilters?: boolean
}

// Unified hook combining: data fetching, page state, filtering, selection
function useEntityPage<T extends { id: string }>(config: UseEntityPageConfig<T>)
```

### Standardization Opportunities
1. **Data Fetching + Page State**: Combine useContacts + useContactsPageState
2. **Filter Integration**: Merge entity hooks with responsive filter management
3. **Selection Coordination**: Integrate selection state with bulk operations
4. **Loading State Management**: Centralized loading/error state coordination
5. **Cache Strategy**: Unified cache invalidation patterns
6. **Form Integration**: Coordinate CRUD forms with entity data and validation

### Benefits of useEntityPage Pattern
- **Reduced Boilerplate**: Single hook for common page patterns
- **Consistent Behavior**: Standardized loading, error, and success states
- **Type Safety**: Generic implementation with entity-specific typing
- **Maintainability**: Centralized logic for common operations
- **Developer Experience**: Clear API for entity page development

### Implementation Considerations
- **Backward Compatibility**: Must work with existing entity hooks
- **Flexibility**: Allow overrides for entity-specific requirements
- **Performance**: Maintain current query optimization patterns
- **State Boundaries**: Preserve TanStack Query vs Zustand separation