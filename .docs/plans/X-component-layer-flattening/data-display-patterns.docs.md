# Data Display Patterns Research

Comprehensive analysis of data display architecture across all CRM entities, examining wrapper components, state management patterns, DataTable integration, and standardization opportunities.

## Relevant Files

### DataDisplay Wrapper Components
- `/src/features/contacts/components/ContactsDataDisplay.tsx`: Contact-specific wrapper with loading/error state handling
- `/src/features/organizations/components/OrganizationsDataDisplay.tsx`: Organization-specific wrapper, identical pattern to contacts
- `/src/features/products/components/ProductsDataDisplay.tsx`: Product-specific wrapper with optional props pattern
- `/src/features/interactions/components/InteractionsDataDisplay.tsx`: Interaction-specific wrapper with additional onView callback
- `/src/features/opportunities/`: **Missing DataDisplay wrapper** - directly uses OpportunitiesList in page

### List Components (DataTable Integration)
- `/src/features/contacts/components/ContactsList.tsx`: Advanced integration with expandable content and bulk operations
- `/src/features/organizations/components/OrganizationsList.tsx`: Similar pattern with organization-specific expandable content
- `/src/features/opportunities/components/OpportunitiesList.tsx`: Most advanced integration with tabbed expandable content and embedded interactions
- `/src/features/products/components/ProductsList.tsx`: Standard integration with bulk operations hook

### Core Infrastructure
- `/src/hooks/useStandardDataTable.ts`: Standardized DataTable configuration hook with ResponsiveFilterWrapper integration
- `/src/components/data-table/data-table.tsx`: Main DataTable component with extensive ResponsiveFilterWrapper integration
- `/src/components/ui/data-state.tsx`: LoadingState, ErrorState, and EmptyState components for consistent state handling
- `/src/components/layout/EntityListWrapper.tsx`: Layout wrapper component used by List components but not DataDisplay wrappers

### Page Integration Patterns
- `/src/pages/Contacts.tsx`: Standard pattern with DataDisplay wrapper
- `/src/pages/Organizations.tsx`: Standard pattern with DataDisplay wrapper
- `/src/pages/Products.tsx`: Standard pattern with DataDisplay wrapper
- `/src/pages/Opportunities.tsx`: **Inconsistent pattern** - bypasses DataDisplay wrapper, uses OpportunitiesList directly

## Architectural Patterns

### DataDisplay Wrapper Pattern
**Consistent Implementation**: All DataDisplay components follow identical pattern:
- **Purpose**: Handle loading, error, and success states before delegating to List components
- **Props Interface**: `{ isLoading, isError, error, [entity]s, onEdit, onDelete, onRefresh }`
- **State Handling**: Uses shared `LoadingState` and `ErrorState` components from `@/components/ui/data-state`
- **Delegation**: Renders appropriate List component when data is available

**Example Pattern**:
```typescript
if (isLoading) return <LoadingState message="Loading [entities]..." variant="table" />
if (isError) return <ErrorState title="Failed to load [entities]" onRetry={onRefresh} />
return <[Entity]List [entity]s={[entity]s} onEdit={onEdit} onDelete={onDelete} />
```

### List Component Pattern
**Advanced DataTable Integration**: All List components use standardized DataTable with:
- **ResponsiveFilterWrapper Integration**: Via `useStandardDataTable` hook with `useResponsiveFilters: true`
- **Entity-Specific Extended Interfaces**: Each entity extends base types with weekly/contextual data
- **Bulk Operations**: Standardized bulk actions toolbar and deletion workflows
- **Expandable Content**: Rich, entity-specific expandable content with detailed information
- **Selection Management**: Consistent selection state handling

**Example Configuration**:
```typescript
const { dataTableProps } = useStandardDataTable({
  useResponsiveFilters: true,
  responsiveFilterTitle: '[Entity] Filters',
  responsiveFilterDescription: 'Filter and search your [entities]',
  selectable: true,
  expandable: true,
  searchPlaceholder: 'Search [entities]...',
})
```

### Page Integration Pattern
**Two Distinct Approaches**:
1. **Standard Pattern** (Contacts, Organizations, Products):
   - Page → DataDisplay → List → DataTable
   - Consistent state handling through DataDisplay wrapper

2. **Direct Pattern** (Opportunities):
   - Page → List → DataTable
   - Bypasses DataDisplay wrapper completely

### Layout Integration Pattern
**Mixed Usage**:
- **List Components**: Use `EntityListWrapper` for consistent page structure
- **DataDisplay Components**: Do NOT use `EntityListWrapper` (page-level layout handled separately)
- **Page Components**: Use `PageLayout`, `PageHeader`, `ContentSection` directly

## Edge Cases & Gotchas

### Opportunities Entity Inconsistency
- **Missing DataDisplay Wrapper**: Opportunities page directly uses `OpportunitiesList`, breaking the standard pattern
- **Advanced Features**: Despite missing wrapper, has most sophisticated expandable content with tabbed interface and embedded interaction timeline
- **State Management**: Handles loading/error states internally within OpportunitiesList rather than delegating to wrapper

### Products Optional Props Pattern
- **Inconsistent Interface**: ProductsDataDisplay uses optional `isError?` and `onRefresh?` props while others require them
- **Potential Issues**: Could lead to undefined behavior if error states occur without proper handlers

### EntityListWrapper Usage Inconsistency
- **List Components**: All use EntityListWrapper for page structure
- **DataDisplay Components**: None use EntityListWrapper (wrapped by pages instead)
- **Layout Duplication**: Some layout logic duplicated between EntityListWrapper and page-level components

### Extended Entity Interfaces
- **Weekly Context Pattern**: Each entity extends base types with weekly/contextual data for enhanced display
- **Naming Inconsistency**: Some use `EntityWithWeeklyContext`, others use `EntityWithRelations` or custom naming
- **Data Fetching**: Weekly context data fetched at List level, not DataDisplay level

### ResponsiveFilterWrapper Integration Depth
- **Deep Integration**: DataTable component has 20+ ResponsiveFilterWrapper-related props
- **Configuration Complexity**: useStandardDataTable abstracts complexity but creates indirect coupling
- **Feature Flag Dependency**: ResponsiveFilterWrapper usage controlled by feature flags

## Gotchas & Edge Cases

### State Management Boundaries
- **Loading States**: Handled at DataDisplay level for most entities, but OpportunitiesList handles internally
- **Filter State**: Managed independently within each List component using EntityFilterState interface
- **Selection State**: Each List component manages selection independently with entity-specific hooks

### Entity-Specific Expandable Content
- **Contacts**: Authority tracking, purchase influence, weekly context with relationship data
- **Organizations**: Principal products, metrics, engagement scores with visual indicators
- **Opportunities**: Most complex - tabbed interface with interaction timeline embed and quick-add functionality
- **Products**: Promotion tracking, stock status, supplier information
- **Interactions**: Timeline-based expandable content (assumed - not directly examined)

### Bulk Operations Variations
- **Contacts**: Uses custom selection hook with Set-based state management
- **Organizations**: Uses simple array-based selection state
- **Opportunities**: Uses custom selection hook similar to contacts
- **Products**: Uses standardized `useBulkOperations` hook

### DataTable Integration Variations
- **Filter Options**: Each entity passes different filter options (statuses, priorities, principals)
- **Column Definitions**: Entity-specific column creators with different action callbacks
- **Row Key Functions**: Standardized via useStandardDataTable but can be overridden
- **Empty State Messages**: Entity-specific empty state configurations

## Standardization Opportunities

### Critical Pattern Unification Needed

1. **DataDisplay Wrapper Consistency**
   - **Issue**: Opportunities entity bypasses DataDisplay wrapper entirely
   - **Solution**: Create `OpportunitiesDataDisplay.tsx` following standard pattern
   - **Impact**: Unifies error/loading state handling across all entities

2. **Props Interface Standardization**
   - **Issue**: ProductsDataDisplay uses optional props (`isError?`, `onRefresh?`) while others require them
   - **Solution**: Standardize required props across all DataDisplay components
   - **Impact**: Prevents runtime errors and ensures consistent behavior

3. **Layout Wrapper Usage**
   - **Issue**: EntityListWrapper used inconsistently between List and DataDisplay layers
   - **Solution**: Standardize EntityListWrapper usage at List component level only
   - **Impact**: Eliminates layout logic duplication

4. **Selection State Management**
   - **Issue**: Different selection state patterns across entities (Set vs Array, custom hooks vs built-in)
   - **Solution**: Standardize on `useBulkOperations` hook or create unified selection hook
   - **Impact**: Consistent selection behavior and easier maintenance

5. **Extended Entity Interface Naming**
   - **Issue**: Inconsistent naming for extended entity interfaces (`WithWeeklyContext` vs `WithRelations`)
   - **Solution**: Establish naming convention like `EntityWithContext` or `EntityWithDetails`
   - **Impact**: Improved code readability and consistency

### Component Layer Flattening Opportunities

1. **Eliminate DataDisplay Wrapper Layer**
   - **Current**: Page → DataDisplay → List → DataTable
   - **Proposed**: Page → List → DataTable
   - **Benefits**: Reduces component nesting, simplifies state flow, follows Opportunities pattern
   - **Consideration**: Requires moving error/loading state handling into List components

2. **Merge EntityListWrapper into DataTable**
   - **Current**: List → EntityListWrapper + DataTable
   - **Proposed**: List → EnhancedDataTable (includes layout)
   - **Benefits**: Single component for data display with built-in layout
   - **Consideration**: May reduce layout flexibility

3. **Unified Data Display Component**
   - **Proposed**: Create `UnifiedDataDisplay<T>` generic component
   - **Features**: Built-in error/loading states, DataTable integration, responsive filters
   - **Benefits**: Single component per entity, standardized API
   - **Pattern**: `<UnifiedDataDisplay data={entities} entity="contacts" onEdit={onEdit} />`

### ResponsiveFilterWrapper Simplification

1. **Reduce DataTable Props Surface**
   - **Current**: 20+ ResponsiveFilterWrapper-related props in DataTable
   - **Proposed**: Group related props into configuration objects
   - **Benefits**: Cleaner API, easier to maintain

2. **Filter State Unification**
   - **Current**: Each entity manages filters independently
   - **Proposed**: Standardized filter state management with entity-specific extensions
   - **Benefits**: Consistent filter behavior across entities

## Implementation Priority

### High Priority (Breaking Inconsistencies)
1. Create `OpportunitiesDataDisplay.tsx` to unify pattern
2. Standardize required props across all DataDisplay components
3. Fix ProductsDataDisplay optional props issue

### Medium Priority (Architecture Improvement)
1. Standardize selection state management across all entities
2. Unify extended entity interface naming conventions
3. Consolidate layout wrapper usage patterns

### Low Priority (Future Optimization)
1. Consider DataDisplay wrapper elimination
2. Evaluate EntityListWrapper integration into DataTable
3. Explore unified data display component architecture

## Relevant Docs

- **Internal Architecture**: `/src/components/data-table/` - DataTable and ResponsiveFilterWrapper implementation
- **Entity Patterns**: `/src/features/*/components/` - Entity-specific implementations
- **State Management**: `/src/hooks/useStandardDataTable.ts` - Standardized configuration patterns
- **Layout System**: `/src/components/layout/` - Layout wrapper components
- **Bulk Operations**: `/src/components/bulk-actions/` - Standardized bulk operation patterns