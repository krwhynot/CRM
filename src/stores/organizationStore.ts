/**
 * Organization Store for KitchenPantry CRM
 * 
 * Provides reactive state management for organizations with:
 * - Complete CRUD operations via API services
 * - Intelligent caching with TTL and invalidation
 * - Loading states and error handling
 * - Optimistic updates for better UX
 * - Advanced filtering and search
 * - Hierarchical relationship management
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import { 
  organizationService, 
  ApiError, 
  type OrganizationWithRelations,
  type OrganizationSearchOptions,
  type ServiceResponse,
  type QueryOptions
} from '@/services'
import type { 
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  LoadingState,
  SortDirection
} from '@/types'
import { useAuthStore } from './authStore'

// =============================================================================
// STORE STATE INTERFACES
// =============================================================================

interface OrganizationFilters {
  type?: string[]
  industry?: string[]
  parentId?: string | null
  hasContacts?: boolean
  hasProducts?: boolean
  hasOpportunities?: boolean
  createdAfter?: string
  createdBefore?: string
}

interface OrganizationSort {
  field: keyof Organization
  direction: SortDirection
}

interface OrganizationPagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

interface OrganizationCache {
  entities: Map<string, OrganizationWithRelations>
  queries: Map<string, {
    data: string[] // Array of entity IDs
    timestamp: number
    pagination: OrganizationPagination
  }>
  lastFetch: Map<string, number>
  TTL: number
}

// =============================================================================
// STORE DEFINITION
// =============================================================================

export const useOrganizationStore = defineStore('organizations', () => {
  const authStore = useAuthStore()

  // =============================================================================
  // STATE
  // =============================================================================
  
  // Core entities state
  const entities = ref<Map<string, OrganizationWithRelations>>(new Map())
  const entityIds = ref<string[]>([])
  
  // Loading states
  const loadingStates = ref<Record<string, LoadingState>>({
    list: 'idle',
    get: 'idle',
    create: 'idle',
    update: 'idle',
    delete: 'idle'
  })
  
  // Error states
  const errors = ref<Record<string, string | null>>({
    list: null,
    get: null,
    create: null,
    update: null,
    delete: null
  })
  
  // Search and filtering
  const searchQuery = ref<string>('')
  const activeFilters = ref<OrganizationFilters>({})
  const sortConfig = ref<OrganizationSort>({
    field: 'name',
    direction: 'asc'
  })
  
  // Pagination
  const pagination = ref<OrganizationPagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })
  
  // Cache management
  const cache = ref<OrganizationCache>({
    entities: new Map(),
    queries: new Map(),
    lastFetch: new Map(),
    TTL: 5 * 60 * 1000 // 5 minutes
  })
  
  // UI states
  const selectedIds = ref<Set<string>>(new Set())
  const optimisticUpdates = ref<Map<string, Partial<Organization>>>(new Map())

  // =============================================================================
  // GETTERS
  // =============================================================================
  
  const organizations = computed(() => 
    entityIds.value
      .map(id => entities.value.get(id))
      .filter(Boolean) as OrganizationWithRelations[]
  )
  
  const organizationCount = computed(() => entities.value.size)
  
  const principalOrganizations = computed(() => 
    organizations.value.filter(org => org.type === 'principal')
  )
  
  const distributorOrganizations = computed(() => 
    organizations.value.filter(org => org.type === 'distributor')
  )
  
  const customerOrganizations = computed(() => 
    organizations.value.filter(org => org.type === 'customer')
  )
  
  const filteredOrganizations = computed(() => {
    let result = organizations.value
    
    // Apply search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(org => 
        org.name.toLowerCase().includes(query) ||
        org.industry?.toLowerCase().includes(query) ||
        org.website?.toLowerCase().includes(query) ||
        org.phone?.includes(query) ||
        org.email?.toLowerCase().includes(query)
      )
    }
    
    // Apply filters
    if (activeFilters.value.type?.length) {
      result = result.filter(org => 
        activeFilters.value.type!.includes(org.type)
      )
    }
    
    if (activeFilters.value.industry?.length) {
      result = result.filter(org => 
        org.industry && activeFilters.value.industry!.includes(org.industry)
      )
    }
    
    if (activeFilters.value.parentId !== undefined) {
      result = result.filter(org => org.parent_organization_id === activeFilters.value.parentId)
    }
    
    return result
  })
  
  const selectedOrganizations = computed(() => 
    Array.from(selectedIds.value)
      .map(id => entities.value.get(id))
      .filter(Boolean) as OrganizationWithRelations[]
  )
  
  const hasSelection = computed(() => selectedIds.value.size > 0)
  
  const isLoading = computed(() => 
    Object.values(loadingStates.value).some(state => state === 'loading')
  )
  
  const hasErrors = computed(() => 
    Object.values(errors.value).some(error => error !== null)
  )
  
  // Hierarchy helpers
  const rootOrganizations = computed(() => 
    organizations.value.filter(org => !org.parent_organization_id)
  )
  
  const getOrganizationById = computed(() => (id: string) => {
    const org = entities.value.get(id)
    if (!org) return null
    
    // Apply optimistic updates if any
    const optimistic = optimisticUpdates.value.get(id)
    return optimistic ? { ...org, ...optimistic } : org
  })
  
  const getChildOrganizations = computed(() => (parentId: string) => 
    organizations.value.filter(org => org.parent_organization_id === parentId)
  )
  
  const getOrganizationHierarchy = computed(() => (rootId: string): OrganizationWithRelations[] => {
    const buildHierarchy = (id: string): OrganizationWithRelations[] => {
      const org = entities.value.get(id)
      if (!org) return []
      
      const children = getChildOrganizations.value(id)
      return [
        {
          ...org,
          child_organizations: children.flatMap(child => buildHierarchy(child.id))
        }
      ]
    }
    
    return buildHierarchy(rootId)
  })

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================
  
  const getCacheKey = (operation: string, params?: any): string => {
    if (!params) return operation
    return `${operation}:${JSON.stringify(params)}`
  }
  
  const isCacheValid = (key: string): boolean => {
    const lastFetch = cache.value.lastFetch.get(key)
    if (!lastFetch) return false
    return Date.now() - lastFetch < cache.value.TTL
  }
  
  const invalidateCache = (pattern?: string): void => {
    if (!pattern) {
      cache.value.queries.clear()
      cache.value.lastFetch.clear()
      return
    }
    
    // Remove cache entries matching pattern
    for (const key of cache.value.queries.keys()) {
      if (key.includes(pattern)) {
        cache.value.queries.delete(key)
        cache.value.lastFetch.delete(key)
      }
    }
  }
  
  const updateEntityCache = (organization: OrganizationWithRelations): void => {
    entities.value.set(organization.id, organization)
    cache.value.entities.set(organization.id, organization)
    
    // Update entity IDs if not present
    if (!entityIds.value.includes(organization.id)) {
      entityIds.value.push(organization.id)
    }
  }
  
  const removeFromCache = (id: string): void => {
    entities.value.delete(id)
    cache.value.entities.delete(id)
    entityIds.value = entityIds.value.filter(entityId => entityId !== id)
  }

  // =============================================================================
  // ERROR HANDLING
  // =============================================================================
  
  const clearError = (operation: string): void => {
    errors.value[operation] = null
  }
  
  const setError = (operation: string, error: unknown): void => {
    const message = error instanceof ApiError 
      ? error.message 
      : error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'
    
    errors.value[operation] = message
    loadingStates.value[operation] = 'error'
  }
  
  const clearAllErrors = (): void => {
    Object.keys(errors.value).forEach(key => {
      errors.value[key] = null
    })
  }

  // =============================================================================
  // OPTIMISTIC UPDATES
  // =============================================================================
  
  const applyOptimisticUpdate = (id: string, updates: Partial<Organization>): void => {
    optimisticUpdates.value.set(id, {
      ...optimisticUpdates.value.get(id),
      ...updates
    })
  }
  
  const clearOptimisticUpdate = (id: string): void => {
    optimisticUpdates.value.delete(id)
  }
  
  const rollbackOptimisticUpdate = (id: string): void => {
    optimisticUpdates.value.delete(id)
    // Could also show user notification about rollback
  }

  // =============================================================================
  // CORE ACTIONS
  // =============================================================================
  
  /**
   * Fetch organizations list with caching and filtering
   */
  const fetchOrganizations = async (options: QueryOptions = {}): Promise<void> => {
    const cacheKey = getCacheKey('list', options)
    
    // Return cached data if valid
    if (isCacheValid(cacheKey) && cache.value.queries.has(cacheKey)) {
      const cached = cache.value.queries.get(cacheKey)!
      entityIds.value = cached.data
      pagination.value = cached.pagination
      return
    }
    
    loadingStates.value.list = 'loading'
    clearError('list')
    
    try {
      const response: ServiceResponse<OrganizationWithRelations[]> = 
        await organizationService.findMany({
          ...options,
          sort: options.sort || sortConfig.value,
          filters: { ...activeFilters.value, ...options.filters },
          search: { query: searchQuery.value, fields: ['name', 'industry', 'email'] },
          page: pagination.value.page,
          limit: pagination.value.limit
        })
      
      // Update entities
      response.data.forEach(updateEntityCache)
      entityIds.value = response.data.map(org => org.id)
      
      // Update pagination
      pagination.value = {
        page: response.page || 1,
        limit: response.limit || 20,
        total: response.count || 0,
        hasMore: response.hasMore || false
      }
      
      // Cache the result
      cache.value.queries.set(cacheKey, {
        data: entityIds.value,
        timestamp: Date.now(),
        pagination: pagination.value
      })
      cache.value.lastFetch.set(cacheKey, Date.now())
      
      loadingStates.value.list = 'success'
    } catch (error) {
      setError('list', error)
      throw error
    }
  }
  
  /**
   * Get organization by ID with caching
   */
  const getOrganization = async (
    id: string, 
    options: { useCache?: boolean; forceRefresh?: boolean } = {}
  ): Promise<OrganizationWithRelations> => {
    const { useCache = true, forceRefresh = false } = options
    
    // Return cached entity if available and valid
    if (useCache && !forceRefresh && entities.value.has(id)) {
      return entities.value.get(id)!
    }
    
    loadingStates.value.get = 'loading'
    clearError('get')
    
    try {
      const organization = await organizationService.findById(id, {
        include: ['contacts', 'opportunities', 'products']
      })
      
      updateEntityCache(organization)
      loadingStates.value.get = 'success'
      
      return organization
    } catch (error) {
      setError('get', error)
      throw error
    }
  }
  
  /**
   * Create new organization with optimistic updates
   */
  const createOrganization = async (data: CreateOrganizationSchema): Promise<OrganizationWithRelations> => {
    loadingStates.value.create = 'loading'
    clearError('create')
    
    // Create temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticOrg = {
      ...data,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: authStore.userId,
      updated_by: authStore.userId,
      deleted_at: null
    } as OrganizationWithRelations
    
    try {
      // Apply optimistic update
      updateEntityCache(optimisticOrg)
      
      const organization = await organizationService.create({
        ...data,
        description: data.description || null
      } as OrganizationInsert)
      
      // Replace optimistic update with real data
      removeFromCache(tempId)
      updateEntityCache(organization)
      invalidateCache('list')
      
      loadingStates.value.create = 'success'
      return organization
    } catch (error) {
      // Rollback optimistic update
      removeFromCache(tempId)
      setError('create', error)
      throw error
    }
  }
  
  /**
   * Update organization with optimistic updates
   */
  const updateOrganization = async (
    id: string, 
    data: UpdateOrganizationSchema
  ): Promise<OrganizationWithRelations> => {
    loadingStates.value.update = 'loading'
    clearError('update')
    
    // Apply optimistic update
    applyOptimisticUpdate(id, data)
    
    try {
      const organization = await organizationService.update(id, {
        ...data,
        description: data.description || null
      } as OrganizationUpdate)
      
      // Replace optimistic update with real data
      clearOptimisticUpdate(id)
      updateEntityCache(organization)
      invalidateCache('list')
      
      loadingStates.value.update = 'success'
      return organization
    } catch (error) {
      // Rollback optimistic update
      rollbackOptimisticUpdate(id)
      setError('update', error)
      throw error
    }
  }
  
  /**
   * Delete organization with optimistic updates
   */
  const deleteOrganization = async (id: string): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for rollback
    const originalData = entities.value.get(id)
    
    try {
      // Apply optimistic update (soft delete)
      applyOptimisticUpdate(id, { 
        deleted_at: new Date().toISOString() 
      })
      
      await organizationService.delete(id)
      
      // Remove from cache after successful delete
      removeFromCache(id)
      selectedIds.value.delete(id)
      invalidateCache('list')
      
      loadingStates.value.delete = 'success'
    } catch (error) {
      // Rollback optimistic update
      if (originalData) {
        clearOptimisticUpdate(id)
      }
      setError('delete', error)
      throw error
    }
  }

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================
  
  /**
   * Delete multiple organizations
   */
  const deleteMultipleOrganizations = async (ids: string[]): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for potential rollback
    const originalData = new Map(
      ids.map(id => [id, entities.value.get(id)]).filter(([, org]) => org) as Array<[string, OrganizationWithRelations]>
    )
    
    try {
      // Apply optimistic updates
      ids.forEach(id => {
        applyOptimisticUpdate(id, { deleted_at: new Date().toISOString() })
      })
      
      const result = await organizationService.deleteMany(ids)
      
      if (!result.success) {
        // Handle partial failures
        result.errors.forEach(({ id: failedId }) => {
          if (failedId && originalData.has(failedId)) {
            clearOptimisticUpdate(failedId)
          }
        })
      } else {
        // Remove all from cache on success
        ids.forEach(id => {
          removeFromCache(id)
          selectedIds.value.delete(id)
        })
      }
      
      invalidateCache('list')
      loadingStates.value.delete = 'success'
    } catch (error) {
      // Rollback all optimistic updates
      ids.forEach(id => {
        if (originalData.has(id)) {
          clearOptimisticUpdate(id)
        }
      })
      setError('delete', error)
      throw error
    }
  }

  // =============================================================================
  // SEARCH AND FILTERING
  // =============================================================================
  
  /**
   * Update search query and trigger search
   */
  const setSearchQuery = (query: string): void => {
    searchQuery.value = query
    pagination.value.page = 1 // Reset pagination
    invalidateCache('list')
  }
  
  /**
   * Update filters and refresh data
   */
  const setFilters = async (filters: Partial<OrganizationFilters>): Promise<void> => {
    activeFilters.value = { ...activeFilters.value, ...filters }
    pagination.value.page = 1 // Reset pagination
    invalidateCache('list')
    await fetchOrganizations()
  }
  
  /**
   * Clear all filters
   */
  const clearFilters = async (): Promise<void> => {
    activeFilters.value = {}
    searchQuery.value = ''
    pagination.value.page = 1
    invalidateCache()
    await fetchOrganizations()
  }
  
  /**
   * Update sort configuration
   */
  const setSortConfig = async (field: keyof Organization, direction: SortDirection): Promise<void> => {
    sortConfig.value = { field, direction }
    pagination.value.page = 1
    invalidateCache('list')
    await fetchOrganizations()
  }

  // =============================================================================
  // PAGINATION
  // =============================================================================
  
  /**
   * Load next page of data
   */
  const loadNextPage = async (): Promise<void> => {
    if (!pagination.value.hasMore || isLoading.value) return
    
    pagination.value.page += 1
    await fetchOrganizations()
  }
  
  /**
   * Load previous page of data
   */
  const loadPreviousPage = async (): Promise<void> => {
    if (pagination.value.page <= 1 || isLoading.value) return
    
    pagination.value.page -= 1
    await fetchOrganizations()
  }
  
  /**
   * Go to specific page
   */
  const goToPage = async (page: number): Promise<void> => {
    if (page < 1 || isLoading.value) return
    
    pagination.value.page = page
    await fetchOrganizations()
  }

  // =============================================================================
  // SELECTION MANAGEMENT
  // =============================================================================
  
  const selectOrganization = (id: string): void => {
    selectedIds.value.add(id)
  }
  
  const deselectOrganization = (id: string): void => {
    selectedIds.value.delete(id)
  }
  
  const toggleOrganizationSelection = (id: string): void => {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }
  
  const selectAllOrganizations = (): void => {
    filteredOrganizations.value.forEach(org => {
      selectedIds.value.add(org.id)
    })
  }
  
  const deselectAllOrganizations = (): void => {
    selectedIds.value.clear()
  }
  
  const isOrganizationSelected = (id: string): boolean => {
    return selectedIds.value.has(id)
  }

  // =============================================================================
  // UTILITY ACTIONS
  // =============================================================================
  
  /**
   * Refresh all data
   */
  const refreshData = async (): Promise<void> => {
    invalidateCache()
    await fetchOrganizations({ forceRefresh: true } as any)
  }
  
  /**
   * Reset store to initial state
   */
  const resetStore = (): void => {
    entities.value.clear()
    entityIds.value = []
    selectedIds.value.clear()
    optimisticUpdates.value.clear()
    cache.value.queries.clear()
    cache.value.lastFetch.clear()
    searchQuery.value = ''
    activeFilters.value = {}
    pagination.value = { page: 1, limit: 20, total: 0, hasMore: false }
    clearAllErrors()
    Object.keys(loadingStates.value).forEach(key => {
      loadingStates.value[key] = 'idle'
    })
  }
  
  /**
   * Get organization hierarchy tree
   */
  const getHierarchyTree = (): OrganizationWithRelations[] => {
    return rootOrganizations.value.map(root => ({
      ...root,
      child_organizations: getOrganizationHierarchy.value(root.id)
    }))
  }

  // =============================================================================
  // WATCHERS
  // =============================================================================
  
  // Auto-refresh when user authentication changes
  watch(
    () => authStore.isAuthenticated,
    (isAuth, wasAuth) => {
      if (isAuth && !wasAuth) {
        // User just logged in, refresh data
        refreshData()
      } else if (!isAuth && wasAuth) {
        // User logged out, reset store
        resetStore()
      }
    }
  )

  // =============================================================================
  // RETURN STORE INTERFACE
  // =============================================================================
  
  return {
    // State (readonly)
    organizations: readonly(organizations),
    organizationCount: readonly(organizationCount),
    loadingStates: readonly(loadingStates),
    errors: readonly(errors),
    searchQuery: readonly(searchQuery),
    activeFilters: readonly(activeFilters),
    sortConfig: readonly(sortConfig),
    pagination: readonly(pagination),
    selectedIds: readonly(selectedIds),
    
    // Computed getters
    principalOrganizations,
    distributorOrganizations,
    customerOrganizations,
    filteredOrganizations,
    selectedOrganizations,
    hasSelection,
    isLoading,
    hasErrors,
    rootOrganizations,
    getOrganizationById,
    getChildOrganizations,
    getOrganizationHierarchy,
    
    // Core actions
    fetchOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    deleteMultipleOrganizations,
    
    // Search and filtering
    setSearchQuery,
    setFilters,
    clearFilters,
    setSortConfig,
    
    // Pagination
    loadNextPage,
    loadPreviousPage,
    goToPage,
    
    // Selection management
    selectOrganization,
    deselectOrganization,
    toggleOrganizationSelection,
    selectAllOrganizations,
    deselectAllOrganizations,
    isOrganizationSelected,
    
    // Utilities
    refreshData,
    resetStore,
    getHierarchyTree,
    clearError,
    clearAllErrors,
    
    // Cache management
    invalidateCache
  }
})