# Data Binding and State Management Patterns

## Current Data Flow Architecture

### Overview
The CRM system implements a well-structured data flow architecture with clear separation of concerns:
- **Server State**: TanStack Query v5 for data fetching, caching, and mutations
- **Client State**: Zustand stores for UI state management
- **Form State**: React Hook Form with Zod validation
- **Component State**: React's built-in state for local UI interactions

### Data Flow Layers

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │  TanStack Query │    │   Components    │
│   PostgreSQL    │◄───┤   (Server State)│◄───┤   (React State) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲                       ▲
                                │                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Zustand     │    │ React Hook Form │
                       │  (Client State) │    │ (Form State)    │
                       └─────────────────┘    └─────────────────┘
```

## TanStack Query Usage Patterns

### 1. Query Key Factories
Standardized query key factories ensure consistent caching:

```typescript
// Example from useOrganizations.ts
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters?: OrganizationFilters) => {
    // Normalize filters for consistent cache keys
    const normalizedFilters = filters
      ? {
          ...filters,
          type: Array.isArray(filters.type) ? [...filters.type].sort() : filters.type,
        }
      : undefined
    return [...organizationKeys.lists(), { filters: normalizedFilters }] as const
  },
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  principals: () => [...organizationKeys.all, 'principals'] as const,
  distributors: () => [...organizationKeys.all, 'distributors'] as const,
}
```

### 2. Caching Strategies
- **Stale Time**: 5 minutes for entity data
- **Cache Invalidation**: Coordinated across related queries on mutations
- **Optimistic Updates**: Used for create operations with rollback on failure
- **Background Refetching**: Automated for stale data

### 3. Query Performance Monitoring
Built-in performance tracking and debugging:

```typescript
// Performance measurement
const timer = measureQueryPerformance('useOrganizations query')
// ... query execution
timer.end()

// Debug state tracking
React.useEffect(() => {
  debugQueryState([...organizationKeys.list(filters)], 'useOrganizations', queryResult.data, {
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || undefined,
    dataUpdatedAt: queryResult.dataUpdatedAt,
    status: queryResult.status,
    fetchStatus: queryResult.fetchStatus,
  })
}, [queryResult.data, queryResult.isLoading, queryResult.isError, filters, queryResult])
```

### 4. Mutation Patterns
Consistent mutation handling with cache management:

```typescript
export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (organization: OrganizationFormInterface) => {
      // Auth validation
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required to create organization')
      }

      // Data transformation and flags derivation
      const derivedFlags = deriveOrganizationFlags(organization.type || 'customer')
      const organizationData = {
        ...organization,
        ...derivedFlags,
        created_by: user.id,
        updated_by: user.id,
        segment: organization.segment || undefined,
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert(organizationData)
        .select()
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Failed to create organization')
      return data as Organization
    },
    onSuccess: (newOrganization) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.principals() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.distributors() })

      // Add to detail cache
      queryClient.setQueryData(organizationKeys.detail(newOrganization.id), newOrganization)
    },
  })
}
```

## Zustand Store Patterns

### 1. Store Architecture
Pure client-side state management with clear boundaries:

```typescript
// Store pattern from contactAdvocacyStore.ts
export interface ContactAdvocacyUIState extends BaseClientState {
  // Selected IDs only (not full server objects)
  selectedRelationshipId: string | null

  // UI Filters and Search (client-side state)
  filters: ClientAdvocacyFilters
  searchQuery: string

  // View preferences
  viewMode: AdvocacyViewMode
  sortBy: AdvocacySortBy
  sortOrder: AdvocacySortOrder
  showAdvancedFilters: boolean

  // Form state
  isFormOpen: boolean
  formMode: 'create' | 'edit' | null
  editingRelationshipId: string | null

  // Client-side actions
  actions: {
    setSelectedRelationshipId: (relationshipId: string | null) => void
    setFilters: (filters: ClientAdvocacyFilters) => void
    // ... other actions
  }
}
```

### 2. State Boundaries
Clear separation between client and server state:
- ✅ **Client State**: UI filters, search, view modes, form state, selections
- ❌ **Does NOT Store**: Server data, relationship objects, computed values

### 3. Persistence Strategy
Selective persistence of UI preferences:

```typescript
persist(
  subscribeWithSelector((set) => ({ /* state logic */ })),
  {
    name: 'contact-advocacy-ui-store',
    partialize: (state) => ({
      // Persist UI preferences and settings
      viewMode: state.viewMode,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      preferences: state.preferences,
      filters: state.filters, // Persist last used filters
    }),
  }
)
```

### 4. Convenience Hooks Pattern
Granular store access with specialized hooks:

```typescript
export const useAdvocacySelection = () => {
  const store = useContactAdvocacyStore()
  return {
    selectedRelationshipId: store.selectedRelationshipId,
    setSelectedRelationshipId: store.actions.setSelectedRelationshipId,
  }
}
```

## Form State Management

### 1. React Hook Form Integration
Centralized form state with Zod validation:

```typescript
// Pattern from useContactFormState.ts
export const useContactFormState = ({
  initialData,
  preselectedOrganization,
  onSubmit,
}: UseContactFormStateProps): UseContactFormStateReturn => {
  const form = useForm<ContactFormData>({
    resolver: createTypedZodResolver<ContactFormData>(contactSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      // ... all form fields with defaults
    },
  })

  const handleSubmit = form.handleSubmit(onSubmit)

  return { form, handleSubmit }
}
```

### 2. Form Data Transformations
Comprehensive transform utilities for type-safe data handling:

```typescript
// From form-transforms.ts
export const FormTransforms = {
  nullableString: emptyStringToNull,
  requiredString: (value: unknown): string => {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('Value is required')
    }
    return value.trim()
  },
  nullableNumber: emptyStringToNullNumber,
  nullableEmail: normalizeEmail,
  nullablePhone: normalizePhone,
  nullableUrl: emptyStringToNullUrl,
  optionalArray: ensureArray,
  booleanField: stringToBoolean,
  uuidField: normalizeUuid,
}
```

### 3. Multi-Step Form Patterns
Complex form validation with step-by-step validation:

```typescript
// From useOpportunityForm.ts
const getStepValidation = async (step: number): Promise<boolean> => {
  switch (step) {
    case 1:
      return await trigger(['name'])
    case 2:
      return await trigger(['organization_id'])
    case 3:
      return await trigger(['stage'])
    case 4:
      return true // Financial info is optional
    case 5:
      return true // Timeline is optional
    default:
      return true
  }
}
```

## Filter and Search State Management

### 1. Universal Filter System
Comprehensive filter state with debouncing and validation:

```typescript
// From useUniversalFilters.ts
export const useUniversalFilters = (
  initialFilters: Partial<UniversalFilterState> = {}
): UseUniversalFiltersReturn => {
  const [filters, setFilters] = useState<UniversalFilterState>(defaultFilters)
  const [isLoading, setIsLoading] = useState(false)

  // Debounced filters to prevent excessive recalculations
  const debouncedFilters = useDebounce(filters, 300)

  // Validation with error handling
  const validateFilters = useCallback(
    (filtersToValidate: UniversalFilterState): FilterValidationResult => {
      const errors: FilterValidationResult['errors'] = []

      if (filtersToValidate.timeRange === 'custom') {
        if (!filtersToValidate.dateFrom || !filtersToValidate.dateTo) {
          errors.push({
            field: 'timeRange',
            message: 'Custom date range requires both start and end dates',
          })
        }
      }

      return { isValid: errors.length === 0, errors }
    },
    []
  )
}
```

### 2. Filter State Persistence
Local filters with cross-page consistency:

```typescript
// Pattern from useOrganizationsFiltering.ts
const useOrganizationsFiltering = (organizations: Organization[]) => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Computed filtered results
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations

    // Apply text search
    if (searchTerm.trim()) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filters
    switch (activeFilter) {
      case 'customers':
        return filtered.filter(org => org.type === 'customer')
      case 'distributors':
        return filtered.filter(org => org.type === 'distributor')
      // ... other filters
    }

    return filtered
  }, [organizations, activeFilter, searchTerm])

  return {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredOrganizations,
  }
}
```

## Component Prop Drilling and Data Passing

### 1. Page-Level Data Flow
Clean data flow from page to components:

```typescript
// Pattern from Organizations.tsx
function OrganizationsPage() {
  // Data fetching
  const { data: organizations = [], isLoading, error, isError } = useOrganizations()

  // Filter state
  const {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredOrganizations,
  } = useOrganizationsFiltering(organizations)

  // Page state management
  const {
    isCreateDialogOpen,
    selectedOrganization,
    openCreateDialog,
    closeCreateDialog,
    // ... other dialog state
  } = useOrganizationsPageState()

  // Actions
  const { handleCreate, handleUpdate, handleDelete, isCreating } =
    useOrganizationsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)

  return (
    <PageLayout {...pageLayoutProps}>
      <OrganizationsDataDisplay
        isLoading={isLoading}
        organizations={filteredOrganizations}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <OrganizationDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        selectedOrganization={selectedOrganization}
        onCreateSubmit={handleCreate}
        isCreating={isCreating}
        // ... other dialog props
      />
    </PageLayout>
  )
}
```

### 2. DataTable Integration
Unified table component with auto-virtualization:

```typescript
// Pattern from DataTable.tsx
export function DataTable<T>({
  data,
  columns,
  loading = false,
  rowKey,
  onRowClick,
  features = {},
}: DataTableProps<T>) {
  // Auto-virtualization based on data size
  const VIRTUALIZATION_THRESHOLD = 500
  const shouldUseVirtualization = useMemo(() => {
    switch (features.virtualization) {
      case 'always': return true
      case 'never': return false
      case 'auto':
      default: return data.length >= VIRTUALIZATION_THRESHOLD
    }
  }, [features.virtualization, data.length])

  // Different rendering paths for performance
  if (shouldUseVirtualization) {
    return <VirtualizedDataTable {...props} />
  }

  return <StandardDataTable {...props} />
}
```

## Reactive Data Patterns

### 1. Computed State with useMemo
Expensive calculations memoized and reactive to dependencies:

```typescript
// Pattern from useUniversalFilters.ts
const computed = useMemo((): ComputedFilterProperties => {
  const effectiveTimeRange = getMemoizedDateRange(
    filters.timeRange,
    filters.dateFrom && filters.dateTo
      ? { start: filters.dateFrom, end: filters.dateTo }
      : undefined
  )

  const activeFilterCount = [
    filters.principal !== DEFAULT_UNIVERSAL_FILTERS.principal,
    filters.product !== DEFAULT_UNIVERSAL_FILTERS.product,
    filters.weeks !== DEFAULT_UNIVERSAL_FILTERS.weeks,
    // ... other filter checks
  ].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0

  return {
    effectiveTimeRange,
    hasActiveFilters,
    activeFilterCount,
    filterSummary: summaryParts.join(' • '),
  }
}, [filters])
```

### 2. Cross-Component Data Synchronization
Synchronized state updates across multiple components:

```typescript
// Pattern from useOrganizationFormData.ts - derived data
const { initialData: editFormInitialData } = useOrganizationFormData(selectedOrganization)

// Auto-updates when selectedOrganization changes
const initialData = useMemo(() => {
  if (!organization) return undefined

  return {
    name: organization.name,
    type: organization.type,
    segment: organization.segment || '',
    // ... other mapped fields
  }
}, [organization])
```

## Integration Points for Layout-as-Data

### 1. Current Layout Hook Pattern
The `usePageLayout` hook demonstrates layout-driven composition:

```typescript
// From usePageLayout.tsx
export function usePageLayout(config: UsePageLayoutConfig): UsePageLayoutReturn {
  // Auto-derive titles and labels from entity type
  const derivedCopy = React.useMemo(() => {
    if (!entityType) return null
    return getEntityPageCopy(entityType)
  }, [entityType])

  // Build slot content
  const pageLayoutProps = React.useMemo((): PageLayoutProps => {
    const title = customTitle || derivedCopy?.title || 'Page'
    const subtitle = customSubtitle || derivedCopy?.subtitle
    const meta = typeof entityCount === 'number'
      ? slotBuilders.buildEntityMeta(entityCount)
      : undefined

    return {
      title,
      subtitle,
      meta,
      actions: buildActions(),
      filters,
      withFilterSidebar,
    }
  }, [/* dependencies */])

  return { pageLayoutProps, slotBuilders, migrationHelpers }
}
```

### 2. Service Layer Integration
Application services coordinate domain logic with caching:

```typescript
// Pattern from OpportunityApplicationService.ts
export class OpportunityApplicationService {
  async createOpportunity(data: CreateOpportunityData): Promise<ServiceResponse<OpportunityDomain>> {
    const useCase = new CreateOpportunityUseCase(this.context, this.opportunityService)
    return useCase.execute(data)
  }

  // Cache invalidation patterns
  getInvalidationKeys(input: CreateOpportunityData): unknown[][] {
    return [
      OpportunityQueryKeys.all,
      OpportunityQueryKeys.lists(),
      OpportunityQueryKeys.byOrganization(input.organization_id),
      OpportunityQueryKeys.pipeline(),
    ]
  }
}
```

### 3. Layout-as-Data Integration Points

**Data Binding Opportunities:**
1. **Entity Configuration**: Layout definitions could specify data dependencies and transform requirements
2. **Filter Integration**: Layout could declare filter schemas and bind to data sources automatically
3. **Action Binding**: Layout definitions could specify CRUD operations and auto-wire to service methods
4. **State Synchronization**: Layout could manage cross-component state coordination automatically
5. **Cache Strategy**: Layout definitions could specify caching and invalidation patterns

**Proposed Integration Architecture:**
```typescript
// Future layout-as-data pattern
interface LayoutDataBinding<TEntity> {
  // Data dependencies
  queries: {
    primary: QueryDefinition<TEntity[]>
    related?: Record<string, QueryDefinition<any>>
  }

  // Filter integration
  filters: {
    schema: FilterSchema
    transform: (filters: FilterState) => QueryFilters
    persistence?: FilterPersistenceConfig
  }

  // Action binding
  actions: {
    create?: ActionDefinition<TEntity>
    update?: ActionDefinition<TEntity>
    delete?: ActionDefinition<TEntity>
  }

  // State management
  state: {
    selection?: SelectionConfig
    view?: ViewConfig
    form?: FormConfig
  }
}
```

This comprehensive data binding architecture provides a solid foundation for implementing layout-as-data patterns while maintaining the existing performance characteristics and type safety of the current system.