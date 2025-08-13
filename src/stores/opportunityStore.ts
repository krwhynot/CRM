/**
 * Opportunity Store for KitchenPantry CRM
 * 
 * Provides reactive state management for opportunities with:
 * - Complete CRUD operations via API services
 * - Sales pipeline stage management and validation
 * - Product-opportunity relationship handling
 * - Pipeline metrics and forecasting
 * - Intelligent caching with TTL and invalidation
 * - Loading states and error handling
 * - Optimistic updates for better UX
 * - Advanced filtering by stage, contact, organization, date ranges
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import { 
  opportunityService, 
  ApiError, 
  type OpportunityWithRelations,
  type OpportunitySearchOptions,
  type ServiceResponse,
  type QueryOptions
} from '@/services'
import type { 
  Opportunity,
  OpportunityInsert,
  OpportunityUpdate,
  CreateOpportunitySchema,
  UpdateOpportunitySchema,
  LoadingState,
  SortDirection,
  Database
} from '@/types'
import { useAuthStore } from './authStore'
import { useContactStore } from './contactStore'
import { useOrganizationStore } from './organizationStore'

// =============================================================================
// STORE STATE INTERFACES
// =============================================================================

interface OpportunityFilters {
  stage?: string[]
  priority?: string[]
  contactId?: string[]
  organizationId?: string[]
  assignedTo?: string[]
  status?: string[]
  minValue?: number
  maxValue?: number
  expectedCloseAfter?: string
  expectedCloseBefore?: string
  createdAfter?: string
  createdBefore?: string
  hasProducts?: boolean
  isOverdue?: boolean
}

interface OpportunitySort {
  field: keyof Opportunity
  direction: SortDirection
}

interface OpportunityPagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

interface OpportunityCache {
  entities: Map<string, OpportunityWithRelations>
  queries: Map<string, {
    data: string[] // Array of entity IDs
    timestamp: number
    pagination: OpportunityPagination
  }>
  lastFetch: Map<string, number>
  TTL: number
}

interface PipelineMetrics {
  totalValue: number
  averageValue: number
  countByStage: Map<string, number>
  valueByStage: Map<string, number>
  winRate: number
  averageDaysToClose: number
  overdueCount: number
  thisMonthClosed: number
  nextMonthExpected: number
}

// =============================================================================
// STORE DEFINITION
// =============================================================================

export const useOpportunityStore = defineStore('opportunities', () => {
  const authStore = useAuthStore()
  const contactStore = useContactStore()
  const organizationStore = useOrganizationStore()

  // =============================================================================
  // STATE
  // =============================================================================
  
  // Core entities state
  const entities = ref<Map<string, OpportunityWithRelations>>(new Map())
  const entityIds = ref<string[]>([])
  
  // Loading states
  const loadingStates = ref<Record<string, LoadingState>>({
    list: 'idle',
    get: 'idle',
    create: 'idle',
    update: 'idle',
    delete: 'idle',
    stageUpdate: 'idle'
  })
  
  // Error states
  const errors = ref<Record<string, string | null>>({
    list: null,
    get: null,
    create: null,
    update: null,
    delete: null,
    stageUpdate: null
  })
  
  // Search and filtering
  const searchQuery = ref<string>('')
  const activeFilters = ref<OpportunityFilters>({})
  const sortConfig = ref<OpportunitySort>({
    field: 'estimated_close_date',
    direction: 'asc'
  })
  
  // Pagination
  const pagination = ref<OpportunityPagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })
  
  // Cache management
  const cache = ref<OpportunityCache>({
    entities: new Map(),
    queries: new Map(),
    lastFetch: new Map(),
    TTL: 3 * 60 * 1000 // 3 minutes (opportunities change frequently)
  })
  
  // UI states
  const selectedIds = ref<Set<string>>(new Set())
  const optimisticUpdates = ref<Map<string, Partial<Opportunity>>>(new Map())

  // =============================================================================
  // GETTERS
  // =============================================================================
  
  const opportunities = computed(() => 
    entityIds.value
      .map(id => entities.value.get(id))
      .filter(Boolean) as OpportunityWithRelations[]
  )
  
  const opportunityCount = computed(() => entities.value.size)
  
  const openOpportunities = computed(() => 
    opportunities.value.filter(opp => opp.stage !== 'closed_won' && opp.stage !== 'closed_lost')
  )
  
  const wonOpportunities = computed(() => 
    opportunities.value.filter(opp => opp.stage === 'closed_won')
  )
  
  const lostOpportunities = computed(() => 
    opportunities.value.filter(opp => opp.stage === 'closed_lost')
  )
  
  const highPriorityOpportunities = computed(() => 
    opportunities.value.filter(opp => opp.priority === 'high')
  )
  
  const overdueOpportunities = computed(() => {
    const now = new Date()
    return opportunities.value.filter(opp => 
      opp.estimated_close_date && 
      new Date(opp.estimated_close_date) < now && 
      opp.stage !== 'closed_won' && 
      opp.stage !== 'closed_lost'
    )
  })
  
  const opportunitiesByStage = computed(() => {
    const byStage = new Map<string, OpportunityWithRelations[]>()
    opportunities.value.forEach(opp => {
      const stage = opp.stage || 'unknown'
      const existing = byStage.get(stage) || []
      existing.push(opp)
      byStage.set(stage, existing)
    })
    return byStage
  })
  
  const opportunitiesByContact = computed(() => {
    const byContact = new Map<string, OpportunityWithRelations[]>()
    opportunities.value.forEach(opp => {
      if (opp.contact_id) {
        const existing = byContact.get(opp.contact_id) || []
        existing.push(opp)
        byContact.set(opp.contact_id, existing)
      }
    })
    return byContact
  })
  
  const opportunitiesByOrganization = computed(() => {
    const byOrg = new Map<string, OpportunityWithRelations[]>()
    opportunities.value.forEach(opp => {
      if (opp.organization_id) {
        const existing = byOrg.get(opp.organization_id) || []
        existing.push(opp)
        byOrg.set(opp.organization_id, existing)
      }
    })
    return byOrg
  })
  
  const pipelineMetrics = computed((): PipelineMetrics => {
    const activeOpps = openOpportunities.value
    const closedOpps = [...wonOpportunities.value, ...lostOpportunities.value]
    
    // Calculate totals
    const totalValue = activeOpps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)
    const averageValue = activeOpps.length > 0 ? totalValue / activeOpps.length : 0
    
    // Count and value by stage
    const countByStage = new Map<string, number>()
    const valueByStage = new Map<string, number>()
    
    activeOpps.forEach(opp => {
      const stage = opp.stage || 'unknown'
      countByStage.set(stage, (countByStage.get(stage) || 0) + 1)
      valueByStage.set(stage, (valueByStage.get(stage) || 0) + (opp.estimated_value || 0))
    })
    
    // Win rate calculation
    const totalClosed = closedOpps.length
    const totalWon = wonOpportunities.value.length
    const winRate = totalClosed > 0 ? (totalWon / totalClosed) * 100 : 0
    
    // Average days to close (for won opportunities)
    const avgDaysToClose = wonOpportunities.value.reduce((sum, opp) => {
      if (opp.created_at && opp.actual_close_date) {
        const created = new Date(opp.created_at)
        const closed = new Date(opp.actual_close_date)
        const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }
      return sum
    }, 0) / (wonOpportunities.value.length || 1)
    
    // Current month stats
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    
    const thisMonthClosed = wonOpportunities.value.filter(opp => 
      opp.actual_close_date &&
      new Date(opp.actual_close_date) >= thisMonthStart &&
      new Date(opp.actual_close_date) <= thisMonthEnd
    ).length
    
    const nextMonthExpected = activeOpps.filter(opp => 
      opp.estimated_close_date &&
      new Date(opp.estimated_close_date) >= thisMonthEnd &&
      new Date(opp.estimated_close_date) <= nextMonthEnd
    ).length
    
    return {
      totalValue,
      averageValue,
      countByStage,
      valueByStage,
      winRate,
      averageDaysToClose: avgDaysToClose,
      overdueCount: overdueOpportunities.value.length,
      thisMonthClosed,
      nextMonthExpected
    }
  })
  
  const filteredOpportunities = computed(() => {
    let result = opportunities.value
    
    // Apply search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(opp => 
        opp.name.toLowerCase().includes(query) ||
        opp.description?.toLowerCase().includes(query) ||
        opp.stage?.toLowerCase().includes(query) ||
        opp.priority?.toLowerCase().includes(query)
      )
    }
    
    // Apply filters
    if (activeFilters.value.stage?.length) {
      result = result.filter(opp => 
        opp.stage && activeFilters.value.stage!.includes(opp.stage)
      )
    }
    
    if (activeFilters.value.priority?.length) {
      result = result.filter(opp => 
        opp.priority && activeFilters.value.priority!.includes(opp.priority)
      )
    }
    
    if (activeFilters.value.contactId?.length) {
      result = result.filter(opp => 
        opp.contact_id && activeFilters.value.contactId!.includes(opp.contact_id)
      )
    }
    
    if (activeFilters.value.organizationId?.length) {
      result = result.filter(opp => 
        opp.organization_id && activeFilters.value.organizationId!.includes(opp.organization_id)
      )
    }
    
    if (activeFilters.value.minValue !== undefined) {
      result = result.filter(opp => 
        opp.estimated_value && opp.estimated_value >= activeFilters.value.minValue!
      )
    }
    
    if (activeFilters.value.maxValue !== undefined) {
      result = result.filter(opp => 
        opp.estimated_value && opp.estimated_value <= activeFilters.value.maxValue!
      )
    }
    
    if (activeFilters.value.isOverdue) {
      const now = new Date()
      result = result.filter(opp => 
        opp.estimated_close_date && 
        new Date(opp.estimated_close_date) < now &&
        opp.stage !== 'closed_won' && 
        opp.stage !== 'closed_lost'
      )
    }
    
    // Date range filters
    if (activeFilters.value.expectedCloseAfter) {
      result = result.filter(opp => 
        opp.estimated_close_date && 
        opp.estimated_close_date >= activeFilters.value.expectedCloseAfter!
      )
    }
    
    if (activeFilters.value.expectedCloseBefore) {
      result = result.filter(opp => 
        opp.estimated_close_date && 
        opp.estimated_close_date <= activeFilters.value.expectedCloseBefore!
      )
    }
    
    return result
  })
  
  const selectedOpportunities = computed(() => 
    Array.from(selectedIds.value)
      .map(id => entities.value.get(id))
      .filter(Boolean) as OpportunityWithRelations[]
  )
  
  const hasSelection = computed(() => selectedIds.value.size > 0)
  
  const isLoading = computed(() => 
    Object.values(loadingStates.value).some(state => state === 'loading')
  )
  
  const hasErrors = computed(() => 
    Object.values(errors.value).some(error => error !== null)
  )
  
  const getOpportunityById = computed(() => (id: string) => {
    const opportunity = entities.value.get(id)
    if (!opportunity) return null
    
    // Apply optimistic updates if any
    const optimistic = optimisticUpdates.value.get(id)
    return optimistic ? { ...opportunity, ...optimistic } : opportunity
  })
  
  const getOpportunitiesByContact = computed(() => (contactId: string) => 
    opportunities.value.filter(opp => opp.contact_id === contactId)
  )
  
  const getOpportunitiesByOrganization = computed(() => (organizationId: string) => 
    opportunities.value.filter(opp => opp.organization_id === organizationId)
  )
  
  const getOpportunitiesByStage = computed(() => (stage: string) => 
    opportunities.value.filter(opp => opp.stage === stage)
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
  
  const updateEntityCache = (opportunity: OpportunityWithRelations): void => {
    entities.value.set(opportunity.id, opportunity)
    cache.value.entities.set(opportunity.id, opportunity)
    
    // Update entity IDs if not present
    if (!entityIds.value.includes(opportunity.id)) {
      entityIds.value.push(opportunity.id)
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
  
  const applyOptimisticUpdate = (id: string, updates: Partial<Opportunity>): void => {
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
   * Validate contact-organization relationship
   */
  const validateContactOrganizationRelationship = (contactId: string, organizationId: string): void => {
    const contact = contactStore.getContactById(contactId)
    if (contact && contact.organization_id !== organizationId) {
      throw new ApiError('Contact must belong to the selected organization', 400)
    }
  }
  
  /**
   * Validate stage progression rules
   */
  const validateStageProgression = (currentStage: string | null, newStage: string): void => {
    // Define valid stage progressions
    const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
    const currentIndex = currentStage ? stageOrder.indexOf(currentStage) : -1
    const newIndex = stageOrder.indexOf(newStage)
    
    // Allow backward movement and skipping for flexibility
    // Only prevent moving to 'won'/'lost' from very early stages without proper progression
    if (newStage === 'won' && currentIndex < 1) {
      throw new ApiError('Cannot mark opportunity as won without proper qualification', 400)
    }
  }
  
  /**
   * Validate expected close date
   */
  const validateExpectedCloseDate = (expectedCloseDate: string): void => {
    const closeDate = new Date(expectedCloseDate)
    const now = new Date()
    
    // Allow past dates but warn if more than 30 days old
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    if (closeDate < thirtyDaysAgo) {
      console.warn('Expected close date is more than 30 days in the past')
    }
  }

  // =============================================================================
  // CORE ACTIONS
  // =============================================================================
  
  /**
   * Fetch opportunities list with caching and filtering
   */
  const fetchOpportunities = async (options: QueryOptions = {}): Promise<void> => {
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
      const response: ServiceResponse<OpportunityWithRelations[]> = 
        await opportunityService.findMany({
          ...options,
          sort: options.sort || sortConfig.value,
          filters: { ...activeFilters.value, ...options.filters },
          search: { query: searchQuery.value, fields: ['name', 'description'] },
          page: pagination.value.page,
          limit: pagination.value.limit
        })
      
      // Update entities
      response.data.forEach(updateEntityCache)
      entityIds.value = response.data.map(opp => opp.id)
      
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
   * Get opportunity by ID with caching
   */
  const getOpportunity = async (
    id: string, 
    options: { useCache?: boolean; forceRefresh?: boolean } = {}
  ): Promise<OpportunityWithRelations> => {
    const { useCache = true, forceRefresh = false } = options
    
    // Return cached entity if available and valid
    if (useCache && !forceRefresh && entities.value.has(id)) {
      return entities.value.get(id)!
    }
    
    loadingStates.value.get = 'loading'
    clearError('get')
    
    try {
      const opportunity = await opportunityService.findById(id, {
        include: ['contact', 'organization', 'products', 'interactions']
      })
      
      updateEntityCache(opportunity)
      loadingStates.value.get = 'success'
      
      return opportunity
    } catch (error) {
      setError('get', error)
      throw error
    }
  }
  
  /**
   * Create new opportunity with validation and optimistic updates
   */
  const createOpportunity = async (data: CreateOpportunitySchema): Promise<OpportunityWithRelations> => {
    loadingStates.value.create = 'loading'
    clearError('create')
    
    try {
      // Validate business rules
      if (data.contact_id && data.organization_id) {
        validateContactOrganizationRelationship(data.contact_id, data.organization_id)
      }
      
      if (data.estimated_close_date) {
        validateExpectedCloseDate(data.estimated_close_date)
      }
      
      // Create temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`
      const optimisticOpportunity = {
        ...data,
        id: tempId,
        stage: data.stage || 'lead',
        priority: data.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: authStore.userId,
        updated_by: authStore.userId,
        deleted_at: null
      } as OpportunityWithRelations
      
      // Apply optimistic update
      updateEntityCache(optimisticOpportunity)
      
      const opportunity = await opportunityService.create(data as OpportunityInsert)
      
      // Replace optimistic update with real data
      removeFromCache(tempId)
      updateEntityCache(opportunity)
      invalidateCache('list')
      
      loadingStates.value.create = 'success'
      return opportunity
    } catch (error) {
      // Rollback optimistic update
      const tempId = `temp-${Date.now()}`
      removeFromCache(tempId)
      setError('create', error)
      throw error
    }
  }
  
  /**
   * Update opportunity with validation and optimistic updates
   */
  const updateOpportunity = async (
    id: string, 
    data: UpdateOpportunitySchema
  ): Promise<OpportunityWithRelations> => {
    loadingStates.value.update = 'loading'
    clearError('update')
    
    try {
      const currentOpportunity = entities.value.get(id)
      
      // Validate business rules
      if (data.contact_id && data.organization_id) {
        validateContactOrganizationRelationship(data.contact_id, data.organization_id)
      }
      
      if (data.stage) {
        validateStageProgression(currentOpportunity?.stage || null, data.stage)
      }
      
      if (data.estimated_close_date) {
        validateExpectedCloseDate(data.estimated_close_date)
      }
      
      // Handle stage changes with automatic fields
      const updateData = { ...data }
      if (data.stage === 'closed_won' && !data.actual_close_date) {
        updateData.actual_close_date = new Date().toISOString()
      } else if (data.stage === 'closed_lost' && !data.actual_close_date) {
        updateData.actual_close_date = new Date().toISOString()
      }
      
      // Apply optimistic update
      applyOptimisticUpdate(id, updateData)
      
      const opportunity = await opportunityService.update(id, updateData as OpportunityUpdate)
      
      // Replace optimistic update with real data
      clearOptimisticUpdate(id)
      updateEntityCache(opportunity)
      invalidateCache('list')
      
      loadingStates.value.update = 'success'
      return opportunity
    } catch (error) {
      // Rollback optimistic update
      rollbackOptimisticUpdate(id)
      setError('update', error)
      throw error
    }
  }
  
  /**
   * Delete opportunity with optimistic updates
   */
  const deleteOpportunity = async (id: string): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for rollback
    const originalData = entities.value.get(id)
    
    try {
      // Apply optimistic update (soft delete)
      applyOptimisticUpdate(id, { 
        deleted_at: new Date().toISOString() 
      })
      
      await opportunityService.delete(id)
      
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
  // STAGE MANAGEMENT
  // =============================================================================
  
  /**
   * Update opportunity stage with validation
   */
  const updateOpportunityStage = async (id: string, newStage: string): Promise<OpportunityWithRelations> => {
    loadingStates.value.stageUpdate = 'loading'
    clearError('stageUpdate')
    
    try {
      const currentOpportunity = entities.value.get(id)
      if (!currentOpportunity) {
        throw new ApiError('Opportunity not found', 404)
      }
      
      // Validate stage progression
      validateStageProgression(currentOpportunity.stage, newStage)
      
      // Prepare update data with stage-specific fields
      const updateData: Partial<Opportunity> = { stage: newStage }
      
      if (newStage === 'closed_won' || newStage === 'closed_lost') {
        updateData.actual_close_date = new Date().toISOString()
      }
      
      const opportunity = await updateOpportunity(id, updateData)
      
      loadingStates.value.stageUpdate = 'success'
      return opportunity
    } catch (error) {
      setError('stageUpdate', error)
      throw error
    }
  }
  
  /**
   * Move opportunity through pipeline stages
   */
  const advanceOpportunityStage = async (id: string): Promise<OpportunityWithRelations> => {
    const currentOpportunity = entities.value.get(id)
    if (!currentOpportunity) {
      throw new ApiError('Opportunity not found', 404)
    }
    
    const stageProgression = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won']
    const currentIndex = stageProgression.indexOf(currentOpportunity.stage || 'lead')
    
    if (currentIndex < 0 || currentIndex >= stageProgression.length - 1) {
      throw new ApiError('Cannot advance opportunity from current stage', 400)
    }
    
    const nextStage = stageProgression[currentIndex + 1]
    return updateOpportunityStage(id, nextStage)
  }
  
  /**
   * Mark opportunity as won
   */
  const winOpportunity = async (id: string, actualValue?: number): Promise<OpportunityWithRelations> => {
    const updateData: Partial<Opportunity> = {
      stage: 'closed_won',
      actual_close_date: new Date().toISOString()
    }
    
    if (actualValue !== undefined) {
      updateData.estimated_value = actualValue
    }
    
    return updateOpportunity(id, updateData)
  }
  
  /**
   * Mark opportunity as lost
   */
  const loseOpportunity = async (id: string, lostReason?: string): Promise<OpportunityWithRelations> => {
    const updateData: Partial<Opportunity> = {
      stage: 'closed_lost',
      actual_close_date: new Date().toISOString()
    }
    
    // Note: lost_reason field would need to be added to database schema
    // For now, we can store it in notes or description field
    if (lostReason) {
      updateData.notes = lostReason
    }
    
    return updateOpportunity(id, updateData)
  }

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================
  
  /**
   * Delete multiple opportunities
   */
  const deleteMultipleOpportunities = async (ids: string[]): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for potential rollback
    const originalData = new Map(
      ids.map(id => [id, entities.value.get(id)]).filter(([, opp]) => opp)
    )
    
    try {
      // Apply optimistic updates
      ids.forEach(id => {
        applyOptimisticUpdate(id, { deleted_at: new Date().toISOString() })
      })
      
      const result = await opportunityService.deleteMany(ids)
      
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
  
  /**
   * Bulk update opportunity stages
   */
  const updateMultipleOpportunityStages = async (
    ids: string[], 
    newStage: Database['public']['Enums']['opportunity_stage']
  ): Promise<void> => {
    loadingStates.value.stageUpdate = 'loading'
    clearError('stageUpdate')
    
    try {
      // Apply optimistic updates
      ids.forEach(id => {
        const currentOpportunity = entities.value.get(id)
        if (currentOpportunity) {
          validateStageProgression(currentOpportunity.stage, newStage)
          
          const updateData: Partial<Opportunity> = { stage: newStage }
          if (newStage === 'closed_won' || newStage === 'closed_lost') {
            updateData.actual_close_date = new Date().toISOString()
          }
          
          applyOptimisticUpdate(id, updateData)
        }
      })
      
      const updates = ids.map(id => ({ 
        id, 
        data: { 
          stage: newStage,
          ...(newStage === 'closed_won' || newStage === 'closed_lost' 
            ? { actual_close_date: new Date().toISOString() } 
            : {})
        } as OpportunityUpdate
      }))
      const result = await opportunityService.updateMany(updates)
      
      if (!result.success) {
        // Handle partial failures - rollback failed updates
        result.errors.forEach(({ id: failedId }) => {
          if (failedId) {
            clearOptimisticUpdate(failedId)
          }
        })
      } else {
        // Clear optimistic updates on success
        ids.forEach(id => clearOptimisticUpdate(id))
      }
      
      invalidateCache('list')
      loadingStates.value.stageUpdate = 'success'
    } catch (error) {
      // Rollback all optimistic updates
      ids.forEach(id => clearOptimisticUpdate(id))
      setError('stageUpdate', error)
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
  const setFilters = async (filters: Partial<OpportunityFilters>): Promise<void> => {
    activeFilters.value = { ...activeFilters.value, ...filters }
    pagination.value.page = 1 // Reset pagination
    invalidateCache('list')
    await fetchOpportunities()
  }
  
  /**
   * Clear all filters
   */
  const clearFilters = async (): Promise<void> => {
    activeFilters.value = {}
    searchQuery.value = ''
    pagination.value.page = 1
    invalidateCache()
    await fetchOpportunities()
  }
  
  /**
   * Update sort configuration
   */
  const setSortConfig = async (field: keyof Opportunity, direction: SortDirection): Promise<void> => {
    sortConfig.value = { field, direction }
    pagination.value.page = 1
    invalidateCache('list')
    await fetchOpportunities()
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
    await fetchOpportunities()
  }
  
  /**
   * Load previous page of data
   */
  const loadPreviousPage = async (): Promise<void> => {
    if (pagination.value.page <= 1 || isLoading.value) return
    
    pagination.value.page -= 1
    await fetchOpportunities()
  }
  
  /**
   * Go to specific page
   */
  const goToPage = async (page: number): Promise<void> => {
    if (page < 1 || isLoading.value) return
    
    pagination.value.page = page
    await fetchOpportunities()
  }

  // =============================================================================
  // SELECTION MANAGEMENT
  // =============================================================================
  
  const selectOpportunity = (id: string): void => {
    selectedIds.value.add(id)
  }
  
  const deselectOpportunity = (id: string): void => {
    selectedIds.value.delete(id)
  }
  
  const toggleOpportunitySelection = (id: string): void => {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }
  
  const selectAllOpportunities = (): void => {
    filteredOpportunities.value.forEach(opp => {
      selectedIds.value.add(opp.id)
    })
  }
  
  const deselectAllOpportunities = (): void => {
    selectedIds.value.clear()
  }
  
  const isOpportunitySelected = (id: string): boolean => {
    return selectedIds.value.has(id)
  }

  // =============================================================================
  // BUSINESS LOGIC HELPERS
  // =============================================================================
  
  /**
   * Fetch opportunities for specific contact
   */
  const fetchOpportunitiesForContact = async (contactId: string): Promise<OpportunityWithRelations[]> => {
    try {
      const response = await opportunityService.findMany({
        filters: { contact_id: contactId },
        sort: { field: 'expected_close_date', direction: 'asc' }
      })
      
      // Update cache with fetched opportunities
      response.data.forEach(updateEntityCache)
      
      return response.data
    } catch (error) {
      setError('list', error)
      throw error
    }
  }
  
  /**
   * Fetch opportunities for specific organization
   */
  const fetchOpportunitiesForOrganization = async (organizationId: string): Promise<OpportunityWithRelations[]> => {
    try {
      const response = await opportunityService.findMany({
        filters: { organization_id: organizationId },
        sort: { field: 'expected_close_date', direction: 'asc' }
      })
      
      // Update cache with fetched opportunities
      response.data.forEach(updateEntityCache)
      
      return response.data
    } catch (error) {
      setError('list', error)
      throw error
    }
  }
  
  /**
   * Calculate opportunity score based on various factors
   */
  const calculateOpportunityScore = (opportunityId: string): number => {
    const opportunity = getOpportunityById.value(opportunityId)
    if (!opportunity) return 0
    
    let score = 0
    
    // Value factor (0-40 points)
    if (opportunity.estimated_value) {
      score += Math.min(40, (opportunity.estimated_value / 10000) * 10) // Scale based on $10k
    }
    
    // Stage factor (0-30 points)
    const stageScores = { lead: 5, qualified: 10, proposal: 20, negotiation: 30, closed_won: 0, closed_lost: 0 }
    score += stageScores[opportunity.stage as keyof typeof stageScores] || 0
    
    // Priority factor (0-20 points)
    const priorityScores = { low: 5, medium: 10, high: 20, critical: 25 }
    score += priorityScores[opportunity.priority as keyof typeof priorityScores] || 10
    
    // Urgency factor based on expected close date (0-10 points)
    if (opportunity.estimated_close_date) {
      const daysToClose = Math.floor((new Date(opportunity.estimated_close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      if (daysToClose <= 7) score += 10
      else if (daysToClose <= 30) score += 7
      else if (daysToClose <= 90) score += 5
      else score += 2
    }
    
    return Math.min(100, score) // Cap at 100
  }

  // =============================================================================
  // UTILITY ACTIONS
  // =============================================================================
  
  /**
   * Refresh all data
   */
  const refreshData = async (): Promise<void> => {
    invalidateCache()
    await fetchOpportunities({ forceRefresh: true } as any)
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
    opportunities: readonly(opportunities),
    opportunityCount: readonly(opportunityCount),
    loadingStates: readonly(loadingStates),
    errors: readonly(errors),
    searchQuery: readonly(searchQuery),
    activeFilters: readonly(activeFilters),
    sortConfig: readonly(sortConfig),
    pagination: readonly(pagination),
    selectedIds: readonly(selectedIds),
    
    // Computed getters
    openOpportunities,
    wonOpportunities,
    lostOpportunities,
    highPriorityOpportunities,
    overdueOpportunities,
    opportunitiesByStage,
    opportunitiesByContact,
    opportunitiesByOrganization,
    pipelineMetrics,
    filteredOpportunities,
    selectedOpportunities,
    hasSelection,
    isLoading,
    hasErrors,
    getOpportunityById,
    getOpportunitiesByContact,
    getOpportunitiesByOrganization,
    getOpportunitiesByStage,
    
    // Core actions
    fetchOpportunities,
    getOpportunity,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    deleteMultipleOpportunities,
    
    // Stage management
    updateOpportunityStage,
    advanceOpportunityStage,
    winOpportunity,
    loseOpportunity,
    updateMultipleOpportunityStages,
    
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
    selectOpportunity,
    deselectOpportunity,
    toggleOpportunitySelection,
    selectAllOpportunities,
    deselectAllOpportunities,
    isOpportunitySelected,
    
    // Business logic
    fetchOpportunitiesForContact,
    fetchOpportunitiesForOrganization,
    calculateOpportunityScore,
    
    // Utilities
    refreshData,
    resetStore,
    clearError,
    clearAllErrors,
    
    // Cache management
    invalidateCache
  }
})