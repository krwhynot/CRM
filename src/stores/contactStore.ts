/**
 * Contact Store for KitchenPantry CRM
 * 
 * Provides reactive state management for contacts with:
 * - Complete CRUD operations via API services
 * - Organization relationship management
 * - Intelligent caching with TTL and invalidation
 * - Loading states and error handling
 * - Optimistic updates for better UX
 * - Advanced filtering and search by role, organization
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import { 
  contactService, 
  ApiError, 
  type ContactWithRelations,
  type ContactSearchOptions,
  type ServiceResponse,
  type QueryOptions
} from '@/services'
import type { 
  Contact,
  ContactInsert,
  ContactUpdate,
  CreateContactSchema,
  UpdateContactSchema,
  LoadingState,
  SortDirection
} from '@/types'
import { useAuthStore } from './authStore'
import { useOrganizationStore } from './organizationStore'

// =============================================================================
// STORE STATE INTERFACES
// =============================================================================

interface ContactFilters {
  organizationId?: string[]
  role?: string[]
  isActive?: boolean
  hasPrimaryContact?: boolean
  createdAfter?: string
  createdBefore?: string
}

interface ContactSort {
  field: keyof Contact
  direction: SortDirection
}

interface ContactPagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

interface ContactCache {
  entities: Map<string, ContactWithRelations>
  queries: Map<string, {
    data: string[] // Array of entity IDs
    timestamp: number
    pagination: ContactPagination
  }>
  lastFetch: Map<string, number>
  TTL: number
}

// =============================================================================
// STORE DEFINITION
// =============================================================================

export const useContactStore = defineStore('contacts', () => {
  const authStore = useAuthStore()
  const organizationStore = useOrganizationStore()

  // =============================================================================
  // STATE
  // =============================================================================
  
  // Core entities state
  const entities = ref<Map<string, ContactWithRelations>>(new Map())
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
  const activeFilters = ref<ContactFilters>({})
  const sortConfig = ref<ContactSort>({
    field: 'last_name',
    direction: 'asc'
  })
  
  // Pagination
  const pagination = ref<ContactPagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })
  
  // Cache management
  const cache = ref<ContactCache>({
    entities: new Map(),
    queries: new Map(),
    lastFetch: new Map(),
    TTL: 5 * 60 * 1000 // 5 minutes
  })
  
  // UI states
  const selectedIds = ref<Set<string>>(new Set())
  const optimisticUpdates = ref<Map<string, Partial<Contact>>>(new Map())

  // =============================================================================
  // GETTERS
  // =============================================================================
  
  const contacts = computed(() => 
    entityIds.value
      .map(id => entities.value.get(id))
      .filter(Boolean) as ContactWithRelations[]
  )
  
  const contactCount = computed(() => entities.value.size)
  
  const primaryContacts = computed(() => 
    contacts.value.filter(contact => contact.is_primary)
  )
  
  const activeContacts = computed(() => 
    contacts.value.filter(contact => contact.is_active)
  )
  
  const contactsByOrganization = computed(() => {
    const byOrg = new Map<string, ContactWithRelations[]>()
    contacts.value.forEach(contact => {
      if (contact.organization_id) {
        const existing = byOrg.get(contact.organization_id) || []
        existing.push(contact)
        byOrg.set(contact.organization_id, existing)
      }
    })
    return byOrg
  })
  
  const contactsByRole = computed(() => {
    const byRole = new Map<string, ContactWithRelations[]>()
    contacts.value.forEach(contact => {
      const role = contact.role || 'other'
      const existing = byRole.get(role) || []
      existing.push(contact)
      byRole.set(role, existing)
    })
    return byRole
  })
  
  const filteredContacts = computed(() => {
    let result = contacts.value
    
    // Apply search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(contact => 
        contact.first_name.toLowerCase().includes(query) ||
        contact.last_name.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone?.includes(query) ||
        contact.title?.toLowerCase().includes(query) ||
        contact.role?.toLowerCase().includes(query)
      )
    }
    
    // Apply filters
    if (activeFilters.value.organizationId?.length) {
      result = result.filter(contact => 
        contact.organization_id && 
        activeFilters.value.organizationId!.includes(contact.organization_id)
      )
    }
    
    if (activeFilters.value.role?.length) {
      result = result.filter(contact => 
        contact.role && activeFilters.value.role!.includes(contact.role)
      )
    }
    
    if (activeFilters.value.isActive !== undefined) {
      result = result.filter(contact => contact.is_active === activeFilters.value.isActive)
    }
    
    if (activeFilters.value.hasPrimaryContact !== undefined) {
      result = result.filter(contact => contact.is_primary === activeFilters.value.hasPrimaryContact)
    }
    
    return result
  })
  
  const selectedContacts = computed(() => 
    Array.from(selectedIds.value)
      .map(id => entities.value.get(id))
      .filter(Boolean) as ContactWithRelations[]
  )
  
  const hasSelection = computed(() => selectedIds.value.size > 0)
  
  const isLoading = computed(() => 
    Object.values(loadingStates.value).some(state => state === 'loading')
  )
  
  const hasErrors = computed(() => 
    Object.values(errors.value).some(error => error !== null)
  )
  
  const getContactById = computed(() => (id: string) => {
    const contact = entities.value.get(id)
    if (!contact) return null
    
    // Apply optimistic updates if any
    const optimistic = optimisticUpdates.value.get(id)
    return optimistic ? { ...contact, ...optimistic } : contact
  })
  
  const getContactsByOrganization = computed(() => (organizationId: string) => 
    contacts.value.filter(contact => contact.organization_id === organizationId)
  )
  
  const getPrimaryContactForOrganization = computed(() => (organizationId: string) => 
    contacts.value.find(contact => 
      contact.organization_id === organizationId && contact.is_primary
    )
  )

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
  
  const updateEntityCache = (contact: ContactWithRelations): void => {
    entities.value.set(contact.id, contact)
    cache.value.entities.set(contact.id, contact)
    
    // Update entity IDs if not present
    if (!entityIds.value.includes(contact.id)) {
      entityIds.value.push(contact.id)
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
  
  const applyOptimisticUpdate = (id: string, updates: Partial<Contact>): void => {
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
  }

  // =============================================================================
  // CORE ACTIONS
  // =============================================================================
  
  /**
   * Fetch contacts list with caching and filtering
   */
  const fetchContacts = async (options: QueryOptions = {}): Promise<void> => {
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
      const response: ServiceResponse<ContactWithRelations[]> = 
        await contactService.findMany({
          ...options,
          sort: options.sort || sortConfig.value,
          filters: { ...activeFilters.value, ...options.filters },
          search: { query: searchQuery.value, fields: ['first_name', 'last_name', 'email', 'title'] },
          page: pagination.value.page,
          limit: pagination.value.limit
        })
      
      // Update entities
      response.data.forEach(updateEntityCache)
      entityIds.value = response.data.map(contact => contact.id)
      
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
   * Get contact by ID with caching
   */
  const getContact = async (
    id: string, 
    options: { useCache?: boolean; forceRefresh?: boolean } = {}
  ): Promise<ContactWithRelations> => {
    const { useCache = true, forceRefresh = false } = options
    
    // Return cached entity if available and valid
    if (useCache && !forceRefresh && entities.value.has(id)) {
      return entities.value.get(id)!
    }
    
    loadingStates.value.get = 'loading'
    clearError('get')
    
    try {
      const contact = await contactService.findById(id, {
        include: ['organization', 'opportunities', 'interactions']
      })
      
      updateEntityCache(contact)
      loadingStates.value.get = 'success'
      
      return contact
    } catch (error) {
      setError('get', error)
      throw error
    }
  }
  
  /**
   * Create new contact with optimistic updates
   */
  const createContact = async (data: CreateContactSchema): Promise<ContactWithRelations> => {
    loadingStates.value.create = 'loading'
    clearError('create')
    
    // Validate organization relationship
    if (data.organization_id && !organizationStore.getOrganizationById(data.organization_id)) {
      throw new ApiError('Selected organization does not exist', 400)
    }
    
    // Create temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticContact = {
      ...data,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: authStore.userId,
      updated_by: authStore.userId,
      deleted_at: null,
      is_active: data.is_active ?? true
    } as ContactWithRelations
    
    try {
      // Apply optimistic update
      updateEntityCache(optimisticContact)
      
      const contact = await contactService.create(data as ContactInsert)
      
      // Replace optimistic update with real data
      removeFromCache(tempId)
      updateEntityCache(contact)
      invalidateCache('list')
      
      loadingStates.value.create = 'success'
      return contact
    } catch (error) {
      // Rollback optimistic update
      removeFromCache(tempId)
      setError('create', error)
      throw error
    }
  }
  
  /**
   * Update contact with optimistic updates
   */
  const updateContact = async (
    id: string, 
    data: UpdateContactSchema
  ): Promise<ContactWithRelations> => {
    loadingStates.value.update = 'loading'
    clearError('update')
    
    // Validate organization relationship if being updated
    if (data.organization_id && !organizationStore.getOrganizationById(data.organization_id)) {
      throw new ApiError('Selected organization does not exist', 400)
    }
    
    // Apply optimistic update
    applyOptimisticUpdate(id, data)
    
    try {
      const contact = await contactService.update(id, data as ContactUpdate)
      
      // Replace optimistic update with real data
      clearOptimisticUpdate(id)
      updateEntityCache(contact)
      invalidateCache('list')
      
      loadingStates.value.update = 'success'
      return contact
    } catch (error) {
      // Rollback optimistic update
      rollbackOptimisticUpdate(id)
      setError('update', error)
      throw error
    }
  }
  
  /**
   * Delete contact with optimistic updates
   */
  const deleteContact = async (id: string): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for rollback
    const originalData = entities.value.get(id)
    
    try {
      // Apply optimistic update (soft delete)
      applyOptimisticUpdate(id, { 
        deleted_at: new Date().toISOString() 
      })
      
      await contactService.delete(id)
      
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
   * Delete multiple contacts
   */
  const deleteMultipleContacts = async (ids: string[]): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for potential rollback
    const originalData = new Map(
      ids.map(id => [id, entities.value.get(id)]).filter(([, contact]) => contact)
    )
    
    try {
      // Apply optimistic updates
      ids.forEach(id => {
        applyOptimisticUpdate(id, { deleted_at: new Date().toISOString() })
      })
      
      const result = await contactService.deleteMany(ids)
      
      if (!result.success) {
        // Handle partial failures
        result.errors.forEach(({ id: failedId, error }) => {
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
  const setFilters = async (filters: Partial<ContactFilters>): Promise<void> => {
    activeFilters.value = { ...activeFilters.value, ...filters }
    pagination.value.page = 1 // Reset pagination
    invalidateCache('list')
    await fetchContacts()
  }
  
  /**
   * Clear all filters
   */
  const clearFilters = async (): Promise<void> => {
    activeFilters.value = {}
    searchQuery.value = ''
    pagination.value.page = 1
    invalidateCache()
    await fetchContacts()
  }
  
  /**
   * Update sort configuration
   */
  const setSortConfig = async (field: keyof Contact, direction: SortDirection): Promise<void> => {
    sortConfig.value = { field, direction }
    pagination.value.page = 1
    invalidateCache('list')
    await fetchContacts()
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
    await fetchContacts()
  }
  
  /**
   * Load previous page of data
   */
  const loadPreviousPage = async (): Promise<void> => {
    if (pagination.value.page <= 1 || isLoading.value) return
    
    pagination.value.page -= 1
    await fetchContacts()
  }
  
  /**
   * Go to specific page
   */
  const goToPage = async (page: number): Promise<void> => {
    if (page < 1 || isLoading.value) return
    
    pagination.value.page = page
    await fetchContacts()
  }

  // =============================================================================
  // SELECTION MANAGEMENT
  // =============================================================================
  
  const selectContact = (id: string): void => {
    selectedIds.value.add(id)
  }
  
  const deselectContact = (id: string): void => {
    selectedIds.value.delete(id)
  }
  
  const toggleContactSelection = (id: string): void => {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }
  
  const selectAllContacts = (): void => {
    filteredContacts.value.forEach(contact => {
      selectedIds.value.add(contact.id)
    })
  }
  
  const deselectAllContacts = (): void => {
    selectedIds.value.clear()
  }
  
  const isContactSelected = (id: string): boolean => {
    return selectedIds.value.has(id)
  }

  // =============================================================================
  // BUSINESS LOGIC HELPERS
  // =============================================================================
  
  /**
   * Set primary contact for organization
   */
  const setPrimaryContact = async (contactId: string, organizationId: string): Promise<void> => {
    loadingStates.value.update = 'loading'
    clearError('update')
    
    try {
      // First, unset current primary contact for this organization
      const currentPrimary = getPrimaryContactForOrganization.value(organizationId)
      if (currentPrimary && currentPrimary.id !== contactId) {
        await updateContact(currentPrimary.id, { is_primary: false })
      }
      
      // Set new primary contact
      await updateContact(contactId, { is_primary: true })
      
      loadingStates.value.update = 'success'
    } catch (error) {
      setError('update', error)
      throw error
    }
  }
  
  /**
   * Fetch contacts for specific organization
   */
  const fetchContactsForOrganization = async (organizationId: string): Promise<ContactWithRelations[]> => {
    try {
      const response = await contactService.findMany({
        filters: { organization_id: organizationId },
        sort: { field: 'last_name', direction: 'asc' }
      })
      
      // Update cache with fetched contacts
      response.data.forEach(updateEntityCache)
      
      return response.data
    } catch (error) {
      setError('list', error)
      throw error
    }
  }

  // =============================================================================
  // UTILITY ACTIONS
  // =============================================================================
  
  /**
   * Refresh all data
   */
  const refreshData = async (): Promise<void> => {
    invalidateCache()
    await fetchContacts({ forceRefresh: true } as any)
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
    contacts: readonly(contacts),
    contactCount: readonly(contactCount),
    loadingStates: readonly(loadingStates),
    errors: readonly(errors),
    searchQuery: readonly(searchQuery),
    activeFilters: readonly(activeFilters),
    sortConfig: readonly(sortConfig),
    pagination: readonly(pagination),
    selectedIds: readonly(selectedIds),
    
    // Computed getters
    primaryContacts,
    activeContacts,
    contactsByOrganization,
    contactsByRole,
    filteredContacts,
    selectedContacts,
    hasSelection,
    isLoading,
    hasErrors,
    getContactById,
    getContactsByOrganization,
    getPrimaryContactForOrganization,
    
    // Core actions
    fetchContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
    
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
    selectContact,
    deselectContact,
    toggleContactSelection,
    selectAllContacts,
    deselectAllContacts,
    isContactSelected,
    
    // Business logic
    setPrimaryContact,
    fetchContactsForOrganization,
    
    // Utilities
    refreshData,
    resetStore,
    clearError,
    clearAllErrors,
    
    // Cache management
    invalidateCache
  }
})