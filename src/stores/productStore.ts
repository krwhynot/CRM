/**
 * Product Store for KitchenPantry CRM
 * 
 * Provides reactive state management for products with:
 * - Complete CRUD operations via API services
 * - Principal ownership validation and constraints
 * - Seasonal product management
 * - Intelligent caching with TTL and invalidation
 * - Loading states and error handling
 * - Optimistic updates for better UX
 * - Advanced filtering by category, principal, seasonality
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import { 
  productService, 
  ApiError, 
  type ProductWithRelations,
  type ServiceResponse,
  type QueryOptions
} from '@/services'
import type { 
  Product,
  ProductInsert,
  ProductUpdate,
  CreateProductSchema,
  UpdateProductSchema,
  LoadingState,
  SortDirection
} from '@/types'
import { useAuthStore } from './authStore'
import { useOrganizationStore } from './organizationStore'

// =============================================================================
// STORE STATE INTERFACES
// =============================================================================

interface ProductFilters {
  principalId?: string[]
  category?: string[]
  isActive?: boolean
  isAvailable?: boolean
  isSeasonal?: boolean
  seasonStartMonth?: number[]
  seasonEndMonth?: number[]
  minPrice?: number
  maxPrice?: number
  hasInventory?: boolean
  createdAfter?: string
  createdBefore?: string
}

interface ProductSort {
  field: keyof Product
  direction: SortDirection
}

interface ProductPagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

interface ProductCache {
  entities: Map<string, ProductWithRelations>
  queries: Map<string, {
    data: string[] // Array of entity IDs
    timestamp: number
    pagination: ProductPagination
  }>
  lastFetch: Map<string, number>
  TTL: number
}

// =============================================================================
// STORE DEFINITION
// =============================================================================

export const useProductStore = defineStore('products', () => {
  const authStore = useAuthStore()
  const organizationStore = useOrganizationStore()

  // =============================================================================
  // STATE
  // =============================================================================
  
  // Core entities state
  const entities = ref<Map<string, ProductWithRelations>>(new Map())
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
  const activeFilters = ref<ProductFilters>({})
  const sortConfig = ref<ProductSort>({
    field: 'name',
    direction: 'asc'
  })
  
  // Pagination
  const pagination = ref<ProductPagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })
  
  // Cache management
  const cache = ref<ProductCache>({
    entities: new Map(),
    queries: new Map(),
    lastFetch: new Map(),
    TTL: 10 * 60 * 1000 // 10 minutes (products change less frequently)
  })
  
  // UI states
  const selectedIds = ref<Set<string>>(new Set())
  const optimisticUpdates = ref<Map<string, Partial<Product>>>(new Map())

  // =============================================================================
  // GETTERS
  // =============================================================================
  
  const products = computed(() => 
    entityIds.value
      .map(id => entities.value.get(id))
      .filter(Boolean) as ProductWithRelations[]
  )
  
  const productCount = computed(() => entities.value.size)
  
  const activeProducts = computed(() => 
    // All products are considered active (no is_active field in schema)
    products.value
  )
  
  const availableProducts = computed(() => 
    // All products are considered available (no is_available field in schema)
    products.value
  )
  
  const seasonalProducts = computed(() => 
    products.value.filter(product => product.season_start !== null && product.season_end !== null)
  )
  
  const productsByPrincipal = computed(() => {
    const byPrincipal = new Map<string, ProductWithRelations[]>()
    products.value.forEach(product => {
      if (product.principal_id) {
        const existing = byPrincipal.get(product.principal_id) || []
        existing.push(product)
        byPrincipal.set(product.principal_id, existing)
      }
    })
    return byPrincipal
  })
  
  const productsByCategory = computed(() => {
    const byCategory = new Map<string, ProductWithRelations[]>()
    products.value.forEach(product => {
      const category = product.category || 'other'
      const existing = byCategory.get(category) || []
      existing.push(product)
      byCategory.set(category, existing)
    })
    return byCategory
  })
  
  const availableCategories = computed(() => 
    Array.from(new Set(products.value.map(p => p.category).filter(Boolean)))
  )
  
  const filteredProducts = computed(() => {
    let result = products.value
    
    // Apply search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      )
    }
    
    // Apply filters
    if (activeFilters.value.principalId?.length) {
      result = result.filter(product => 
        product.principal_id && 
        activeFilters.value.principalId!.includes(product.principal_id)
      )
    }
    
    if (activeFilters.value.category?.length) {
      result = result.filter(product => 
        product.category && activeFilters.value.category!.includes(product.category)
      )
    }
    
    // Note: is_active and is_available fields don't exist in schema
    // These filters are disabled until schema is updated
    // if (activeFilters.value.isActive !== undefined) {
    //   result = result.filter(product => product.is_active === activeFilters.value.isActive)
    // }
    
    // if (activeFilters.value.isAvailable !== undefined) {
    //   result = result.filter(product => product.is_available === activeFilters.value.isAvailable)
    // }
    
    if (activeFilters.value.isSeasonal !== undefined) {
      result = result.filter(product => 
        activeFilters.value.isSeasonal 
          ? (product.season_start !== null && product.season_end !== null)
          : (product.season_start === null || product.season_end === null)
      )
    }
    
    if (activeFilters.value.minPrice !== undefined) {
      result = result.filter(product => 
        product.list_price && product.list_price >= activeFilters.value.minPrice!
      )
    }
    
    if (activeFilters.value.maxPrice !== undefined) {
      result = result.filter(product => 
        product.list_price && product.list_price <= activeFilters.value.maxPrice!
      )
    }
    
    // Seasonal filtering based on current month
    if (activeFilters.value.seasonStartMonth?.length || activeFilters.value.seasonEndMonth?.length) {
      result = result.filter(product => {
        // If not seasonal, always include
        if (product.season_start === null || product.season_end === null) return true
        
        if (activeFilters.value.seasonStartMonth?.length) {
          return product.season_start && 
                 activeFilters.value.seasonStartMonth.includes(product.season_start)
        }
        
        if (activeFilters.value.seasonEndMonth?.length) {
          return product.season_end && 
                 activeFilters.value.seasonEndMonth.includes(product.season_end)
        }
        
        return true
      })
    }
    
    return result
  })
  
  const selectedProducts = computed(() => 
    Array.from(selectedIds.value)
      .map(id => entities.value.get(id))
      .filter(Boolean) as ProductWithRelations[]
  )
  
  const hasSelection = computed(() => selectedIds.value.size > 0)
  
  const isLoading = computed(() => 
    Object.values(loadingStates.value).some(state => state === 'loading')
  )
  
  const hasErrors = computed(() => 
    Object.values(errors.value).some(error => error !== null)
  )
  
  const getProductById = computed(() => (id: string) => {
    const product = entities.value.get(id)
    if (!product) return null
    
    // Apply optimistic updates if any
    const optimistic = optimisticUpdates.value.get(id)
    return optimistic ? { ...product, ...optimistic } : product
  })
  
  const getProductsByPrincipal = computed(() => (principalId: string) => 
    products.value.filter(product => product.principal_id === principalId)
  )
  
  const getProductsByCategory = computed(() => (category: string) => 
    products.value.filter(product => product.category === category)
  )
  
  const getSeasonalProducts = computed(() => (month?: number) => {
    const targetMonth = month || new Date().getMonth() + 1
    return products.value.filter(product => 
      product.season_start && 
      product.season_end &&
      targetMonth >= product.season_start && 
      targetMonth <= product.season_end
    )
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
  
  const updateEntityCache = (product: ProductWithRelations): void => {
    entities.value.set(product.id, product)
    cache.value.entities.set(product.id, product)
    
    // Update entity IDs if not present
    if (!entityIds.value.includes(product.id)) {
      entityIds.value.push(product.id)
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
  
  const applyOptimisticUpdate = (id: string, updates: Partial<Product>): void => {
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
  // BUSINESS LOGIC VALIDATION
  // =============================================================================
  
  /**
   * Validate that only principals can own products
   */
  const validatePrincipalOwnership = (principalId: string): void => {
    const principal = organizationStore.getOrganizationById(principalId)
    if (!principal || principal.type !== 'principal') {
      throw new ApiError('Only principal organizations can own products', 400)
    }
  }
  
  /**
   * Validate seasonal product data
   */
  const validateSeasonalData = (data: Partial<Product>): void => {
    if (data.season_start && data.season_end) {
      if (data.season_start < 1 || data.season_start > 12 ||
          data.season_end < 1 || data.season_end > 12) {
        throw new ApiError('Season months must be between 1 and 12', 400)
      }
      
      if (data.season_start > data.season_end) {
        throw new ApiError('Season start month cannot be after end month', 400)
      }
    }
  }

  // =============================================================================
  // CORE ACTIONS
  // =============================================================================
  
  /**
   * Fetch products list with caching and filtering
   */
  const fetchProducts = async (options: QueryOptions = {}): Promise<void> => {
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
      const response: ServiceResponse<ProductWithRelations[]> = 
        await productService.findMany({
          ...options,
          sort: options.sort || sortConfig.value,
          filters: { ...activeFilters.value, ...options.filters },
          search: { query: searchQuery.value, fields: ['name', 'description', 'sku', 'category'] },
          page: pagination.value.page,
          limit: pagination.value.limit
        })
      
      // Update entities
      response.data.forEach(updateEntityCache)
      entityIds.value = response.data.map(product => product.id)
      
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
   * Get product by ID with caching
   */
  const getProduct = async (
    id: string, 
    options: { useCache?: boolean; forceRefresh?: boolean } = {}
  ): Promise<ProductWithRelations> => {
    const { useCache = true, forceRefresh = false } = options
    
    // Return cached entity if available and valid
    if (useCache && !forceRefresh && entities.value.has(id)) {
      return entities.value.get(id)!
    }
    
    loadingStates.value.get = 'loading'
    clearError('get')
    
    try {
      const product = await productService.findById(id, {
        include: ['principal', 'opportunities']
      })
      
      updateEntityCache(product)
      loadingStates.value.get = 'success'
      
      return product
    } catch (error) {
      setError('get', error)
      throw error
    }
  }
  
  /**
   * Create new product with validation and optimistic updates
   */
  const createProduct = async (data: CreateProductSchema): Promise<ProductWithRelations> => {
    loadingStates.value.create = 'loading'
    clearError('create')
    
    try {
      // Validate business rules
      if (data.principal_id) {
        validatePrincipalOwnership(data.principal_id)
      }
      
      // Convert season fields from strings to numbers if provided
      const productData = { ...data } as any
      if (typeof productData.season_start === 'string') {
        productData.season_start = parseInt(productData.season_start, 10) || null
      }
      if (typeof productData.season_end === 'string') {
        productData.season_end = parseInt(productData.season_end, 10) || null
      }
      validateSeasonalData(productData as Product)
      
      // Create temporary ID for optimistic update (with required database fields)
      const tempId = `temp-${Date.now()}`
      const optimisticProduct = {
        ...productData,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: authStore.userId,
        updated_by: authStore.userId,
        deleted_at: null,
        list_price: productData.unit_price || null,
        min_order_quantity: productData.case_pack || null,
        shelf_life_days: null,
        specifications: null,
        storage_requirements: null,
        unit_cost: null,
        unit_of_measure: productData.unit_of_measure || null
      } as ProductWithRelations
      
      // Apply optimistic update
      updateEntityCache(optimisticProduct)
      
      const product = await productService.create({
        ...productData,
        description: productData.description || null
      } as ProductInsert)
      
      // Replace optimistic update with real data
      removeFromCache(tempId)
      updateEntityCache(product)
      invalidateCache('list')
      
      loadingStates.value.create = 'success'
      return product
    } catch (error) {
      // Rollback optimistic update if it was applied
      const tempId = `temp-${Date.now()}`
      removeFromCache(tempId)
      setError('create', error)
      throw error
    }
  }
  
  /**
   * Update product with validation and optimistic updates
   */
  const updateProduct = async (
    id: string, 
    data: UpdateProductSchema
  ): Promise<ProductWithRelations> => {
    loadingStates.value.update = 'loading'
    clearError('update')
    
    try {
      // Convert season fields from strings to numbers if provided  
      const updateData = { ...data } as any
      if (typeof updateData.season_start === 'string') {
        updateData.season_start = parseInt(updateData.season_start, 10) || null
      }
      if (typeof updateData.season_end === 'string') {
        updateData.season_end = parseInt(updateData.season_end, 10) || null
      }
      validateSeasonalData(updateData as Product)
      
      // Apply optimistic update
      applyOptimisticUpdate(id, updateData)
      
      const product = await productService.update(id, {
        ...updateData,
        description: updateData.description || null
      } as ProductUpdate)
      
      // Replace optimistic update with real data
      clearOptimisticUpdate(id)
      updateEntityCache(product)
      invalidateCache('list')
      
      loadingStates.value.update = 'success'
      return product
    } catch (error) {
      // Rollback optimistic update
      rollbackOptimisticUpdate(id)
      setError('update', error)
      throw error
    }
  }
  
  /**
   * Delete product with optimistic updates
   */
  const deleteProduct = async (id: string): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for rollback
    const originalData = entities.value.get(id)
    
    try {
      // Apply optimistic update (soft delete)
      applyOptimisticUpdate(id, { 
        deleted_at: new Date().toISOString() 
      })
      
      await productService.delete(id)
      
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
   * Delete multiple products
   */
  const deleteMultipleProducts = async (ids: string[]): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for potential rollback
    const originalData = new Map(
      ids.map(id => [id, entities.value.get(id)]).filter(([, product]) => product) as Array<[string, ProductWithRelations]>
    )
    
    try {
      // Apply optimistic updates
      ids.forEach(id => {
        applyOptimisticUpdate(id, { deleted_at: new Date().toISOString() })
      })
      
      const result = await productService.deleteMany(ids)
      
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
  
  /**
   * Update product availability in bulk
   */
  const updateProductsAvailability = async (
    ids: string[], 
    isAvailable: boolean
  ): Promise<void> => {
    loadingStates.value.update = 'loading'
    clearError('update')
    
    try {
      // Note: is_available field doesn't exist in schema
      // This function is disabled until schema is updated
      console.log('Bulk availability update requested for:', ids, 'isAvailable:', isAvailable)
      
      // Placeholder - would need schema update to implement
      // const updates = ids.map(id => ({ id, data: { is_available: isAvailable } }))
      // const result = await productService.updateMany(updates)
      
      // Disabled implementation until schema supports is_available field
      console.warn('updateProductsAvailability is disabled: is_available field not in schema')
      
      // For now, just clear optimistic updates and mark as success
      ids.forEach(id => clearOptimisticUpdate(id))
      
      invalidateCache('list')
      loadingStates.value.update = 'success'
    } catch (error) {
      // Rollback all optimistic updates
      ids.forEach(id => clearOptimisticUpdate(id))
      setError('update', error)
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
  const setFilters = async (filters: Partial<ProductFilters>): Promise<void> => {
    activeFilters.value = { ...activeFilters.value, ...filters }
    pagination.value.page = 1 // Reset pagination
    invalidateCache('list')
    await fetchProducts()
  }
  
  /**
   * Clear all filters
   */
  const clearFilters = async (): Promise<void> => {
    activeFilters.value = {}
    searchQuery.value = ''
    pagination.value.page = 1
    invalidateCache()
    await fetchProducts()
  }
  
  /**
   * Update sort configuration
   */
  const setSortConfig = async (field: keyof Product, direction: SortDirection): Promise<void> => {
    sortConfig.value = { field, direction }
    pagination.value.page = 1
    invalidateCache('list')
    await fetchProducts()
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
    await fetchProducts()
  }
  
  /**
   * Load previous page of data
   */
  const loadPreviousPage = async (): Promise<void> => {
    if (pagination.value.page <= 1 || isLoading.value) return
    
    pagination.value.page -= 1
    await fetchProducts()
  }
  
  /**
   * Go to specific page
   */
  const goToPage = async (page: number): Promise<void> => {
    if (page < 1 || isLoading.value) return
    
    pagination.value.page = page
    await fetchProducts()
  }

  // =============================================================================
  // SELECTION MANAGEMENT
  // =============================================================================
  
  const selectProduct = (id: string): void => {
    selectedIds.value.add(id)
  }
  
  const deselectProduct = (id: string): void => {
    selectedIds.value.delete(id)
  }
  
  const toggleProductSelection = (id: string): void => {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }
  
  const selectAllProducts = (): void => {
    filteredProducts.value.forEach(product => {
      selectedIds.value.add(product.id)
    })
  }
  
  const deselectAllProducts = (): void => {
    selectedIds.value.clear()
  }
  
  const isProductSelected = (id: string): boolean => {
    return selectedIds.value.has(id)
  }

  // =============================================================================
  // BUSINESS LOGIC HELPERS
  // =============================================================================
  
  /**
   * Fetch products for specific principal
   */
  const fetchProductsForPrincipal = async (principalId: string): Promise<ProductWithRelations[]> => {
    try {
      const response = await productService.findMany({
        filters: { principal_id: principalId },
        sort: { field: 'name', direction: 'asc' }
      })
      
      // Update cache with fetched products
      response.data.forEach(updateEntityCache)
      
      return response.data
    } catch (error) {
      setError('list', error)
      throw error
    }
  }
  
  /**
   * Get product availability status considering seasonality
   */
  const isProductCurrentlyAvailable = (productId: string): boolean => {
    const product = getProductById.value(productId)
    if (!product) return false
    
    // Products are available by default (no is_active or is_available fields in schema)
    
    // Check seasonality
    if (product.season_start && product.season_end) {
      const currentMonth = new Date().getMonth() + 1
      return currentMonth >= product.season_start && currentMonth <= product.season_end
    }
    
    return true
  }

  // =============================================================================
  // UTILITY ACTIONS
  // =============================================================================
  
  /**
   * Refresh all data
   */
  const refreshData = async (): Promise<void> => {
    invalidateCache()
    await fetchProducts({ forceRefresh: true } as any)
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
    products: readonly(products),
    productCount: readonly(productCount),
    loadingStates: readonly(loadingStates),
    errors: readonly(errors),
    searchQuery: readonly(searchQuery),
    activeFilters: readonly(activeFilters),
    sortConfig: readonly(sortConfig),
    pagination: readonly(pagination),
    selectedIds: readonly(selectedIds),
    
    // Computed getters
    activeProducts,
    availableProducts,
    seasonalProducts,
    productsByPrincipal,
    productsByCategory,
    availableCategories,
    filteredProducts,
    selectedProducts,
    hasSelection,
    isLoading,
    hasErrors,
    getProductById,
    getProductsByPrincipal,
    getProductsByCategory,
    getSeasonalProducts,
    
    // Core actions
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    updateProductsAvailability,
    
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
    selectProduct,
    deselectProduct,
    toggleProductSelection,
    selectAllProducts,
    deselectAllProducts,
    isProductSelected,
    
    // Business logic
    fetchProductsForPrincipal,
    isProductCurrentlyAvailable,
    
    // Utilities
    refreshData,
    resetStore,
    clearError,
    clearAllErrors,
    
    // Cache management
    invalidateCache
  }
})