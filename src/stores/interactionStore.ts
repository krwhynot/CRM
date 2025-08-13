/**
 * Interaction Store for KitchenPantry CRM
 * 
 * Provides reactive state management for interactions with:
 * - Complete CRUD operations via API services
 * - Follow-up task scheduling and management
 * - Activity timeline tracking
 * - Contact and opportunity relationship handling
 * - Intelligent caching with TTL and invalidation
 * - Loading states and error handling
 * - Optimistic updates for better UX
 * - Advanced filtering by type, date range, completion status
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import { 
  interactionService, 
  ApiError, 
  type InteractionWithRelations,
  type InteractionSearchOptions,
  type ServiceResponse,
  type QueryOptions
} from '@/services'
import type { 
  Interaction,
  InteractionInsert,
  InteractionUpdate,
  CreateInteractionSchema,
  UpdateInteractionSchema,
  LoadingState,
  SortDirection
} from '@/types'
import { useAuthStore } from './authStore'
import { useContactStore } from './contactStore'
import { useOpportunityStore } from './opportunityStore'

// =============================================================================
// STORE STATE INTERFACES
// =============================================================================

interface InteractionFilters {
  type?: string[]
  contactId?: string[]
  opportunityId?: string[]
  assignedTo?: string[]
  isCompleted?: boolean
  hasFollowUp?: boolean
  scheduledAfter?: string
  scheduledBefore?: string
  completedAfter?: string
  completedBefore?: string
  createdAfter?: string
  createdBefore?: string
  isOverdue?: boolean
}

interface InteractionSort {
  field: keyof Interaction
  direction: SortDirection
}

interface InteractionPagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

interface InteractionCache {
  entities: Map<string, InteractionWithRelations>
  queries: Map<string, {
    data: string[] // Array of entity IDs
    timestamp: number
    pagination: InteractionPagination
  }>
  lastFetch: Map<string, number>
  TTL: number
}

interface InteractionMetrics {
  totalInteractions: number
  completedInteractions: number
  completionRate: number
  overdueCount: number
  todayScheduledCount: number
  weekScheduledCount: number
  averageInteractionsPerContact: number
  interactionsByType: Map<string, number>
  interactionsByCompletion: Map<boolean, number>
}

// =============================================================================
// STORE DEFINITION
// =============================================================================

export const useInteractionStore = defineStore('interactions', () => {
  const authStore = useAuthStore()
  const contactStore = useContactStore()
  const opportunityStore = useOpportunityStore()

  // =============================================================================
  // STATE
  // =============================================================================
  
  // Core entities state
  const entities = ref<Map<string, InteractionWithRelations>>(new Map())
  const entityIds = ref<string[]>([])
  
  // Loading states
  const loadingStates = ref<Record<string, LoadingState>>({
    list: 'idle',
    get: 'idle',
    create: 'idle',
    update: 'idle',
    delete: 'idle',
    complete: 'idle'
  })
  
  // Error states
  const errors = ref<Record<string, string | null>>({
    list: null,
    get: null,
    create: null,
    update: null,
    delete: null,
    complete: null
  })
  
  // Search and filtering
  const searchQuery = ref<string>('')
  const activeFilters = ref<InteractionFilters>({})
  const sortConfig = ref<InteractionSort>({
    field: 'scheduled_at',
    direction: 'asc'
  })
  
  // Pagination
  const pagination = ref<InteractionPagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })
  
  // Cache management
  const cache = ref<InteractionCache>({
    entities: new Map(),
    queries: new Map(),
    lastFetch: new Map(),
    TTL: 2 * 60 * 1000 // 2 minutes (interactions change frequently)
  })
  
  // UI states
  const selectedIds = ref<Set<string>>(new Set())
  const optimisticUpdates = ref<Map<string, Partial<Interaction>>>(new Map())

  // =============================================================================
  // GETTERS
  // =============================================================================
  
  const interactions = computed(() => 
    entityIds.value
      .map(id => entities.value.get(id))
      .filter(Boolean) as InteractionWithRelations[]
  )
  
  const interactionCount = computed(() => entities.value.size)
  
  const completedInteractions = computed(() => 
    interactions.value.filter(interaction => interaction.is_completed)
  )
  
  const pendingInteractions = computed(() => 
    interactions.value.filter(interaction => !interaction.is_completed)
  )
  
  const overdueInteractions = computed(() => {
    const now = new Date()
    return interactions.value.filter(interaction => 
      !interaction.is_completed &&
      interaction.scheduled_at && 
      new Date(interaction.scheduled_at) < now
    )
  })
  
  const todayInteractions = computed(() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    return interactions.value.filter(interaction => 
      interaction.scheduled_at && 
      new Date(interaction.scheduled_at) >= todayStart && 
      new Date(interaction.scheduled_at) < todayEnd
    )
  })
  
  const upcomingInteractions = computed(() => {
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return interactions.value.filter(interaction => 
      !interaction.is_completed &&
      interaction.scheduled_at && 
      new Date(interaction.scheduled_at) > now && 
      new Date(interaction.scheduled_at) <= weekFromNow
    ).sort((a, b) => 
      new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
    )
  })
  
  const interactionsByContact = computed(() => {
    const byContact = new Map<string, InteractionWithRelations[]>()
    interactions.value.forEach(interaction => {
      if (interaction.contact_id) {
        const existing = byContact.get(interaction.contact_id) || []
        existing.push(interaction)
        byContact.set(interaction.contact_id, existing)
      }
    })
    return byContact
  })
  
  const interactionsByOpportunity = computed(() => {
    const byOpportunity = new Map<string, InteractionWithRelations[]>()
    interactions.value.forEach(interaction => {
      if (interaction.opportunity_id) {
        const existing = byOpportunity.get(interaction.opportunity_id) || []
        existing.push(interaction)
        byOpportunity.set(interaction.opportunity_id, existing)
      }
    })
    return byOpportunity
  })
  
  const interactionsByType = computed(() => {
    const byType = new Map<string, InteractionWithRelations[]>()
    interactions.value.forEach(interaction => {
      const type = interaction.type || 'other'
      const existing = byType.get(type) || []
      existing.push(interaction)
      byType.set(type, existing)
    })
    return byType
  })
  
  const interactionMetrics = computed((): InteractionMetrics => {
    const total = interactions.value.length
    const completed = completedInteractions.value.length
    const completionRate = total > 0 ? (completed / total) * 100 : 0
    
    // Type breakdown
    const typeBreakdown = new Map<string, number>()
    interactions.value.forEach(interaction => {
      const type = interaction.type || 'other'
      typeBreakdown.set(type, (typeBreakdown.get(type) || 0) + 1)
    })
    
    // Completion breakdown
    const completionBreakdown = new Map<boolean, number>()
    completionBreakdown.set(true, completed)
    completionBreakdown.set(false, total - completed)
    
    // Contact interaction average
    const contactsWithInteractions = new Set(
      interactions.value
        .filter(i => i.contact_id)
        .map(i => i.contact_id!)
    ).size
    const avgPerContact = contactsWithInteractions > 0 ? total / contactsWithInteractions : 0
    
    return {
      totalInteractions: total,
      completedInteractions: completed,
      completionRate,
      overdueCount: overdueInteractions.value.length,
      todayScheduledCount: todayInteractions.value.length,
      weekScheduledCount: upcomingInteractions.value.length,
      averageInteractionsPerContact: avgPerContact,
      interactionsByType: typeBreakdown,
      interactionsByCompletion: completionBreakdown
    }
  })
  
  const filteredInteractions = computed(() => {
    let result = interactions.value
    
    // Apply search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(interaction => 
        interaction.subject?.toLowerCase().includes(query) ||
        interaction.notes?.toLowerCase().includes(query) ||
        interaction.type?.toLowerCase().includes(query) ||
        interaction.outcome?.toLowerCase().includes(query)
      )
    }
    
    // Apply filters
    if (activeFilters.value.type?.length) {
      result = result.filter(interaction => 
        interaction.type && activeFilters.value.type!.includes(interaction.type)
      )
    }
    
    if (activeFilters.value.contactId?.length) {
      result = result.filter(interaction => 
        interaction.contact_id && activeFilters.value.contactId!.includes(interaction.contact_id)
      )
    }
    
    if (activeFilters.value.opportunityId?.length) {
      result = result.filter(interaction => 
        interaction.opportunity_id && activeFilters.value.opportunityId!.includes(interaction.opportunity_id)
      )
    }
    
    if (activeFilters.value.isCompleted !== undefined) {
      result = result.filter(interaction => interaction.is_completed === activeFilters.value.isCompleted)
    }
    
    if (activeFilters.value.hasFollowUp !== undefined) {
      result = result.filter(interaction => 
        Boolean(interaction.follow_up_date) === activeFilters.value.hasFollowUp
      )
    }
    
    if (activeFilters.value.isOverdue) {
      const now = new Date()
      result = result.filter(interaction => 
        !interaction.is_completed &&
        interaction.scheduled_at && 
        new Date(interaction.scheduled_at) < now
      )
    }
    
    // Date range filters
    if (activeFilters.value.scheduledAfter) {
      result = result.filter(interaction => 
        interaction.scheduled_at && 
        interaction.scheduled_at >= activeFilters.value.scheduledAfter!
      )
    }
    
    if (activeFilters.value.scheduledBefore) {
      result = result.filter(interaction => 
        interaction.scheduled_at && 
        interaction.scheduled_at <= activeFilters.value.scheduledBefore!
      )
    }
    
    if (activeFilters.value.completedAfter) {
      result = result.filter(interaction => 
        interaction.completed_at && 
        interaction.completed_at >= activeFilters.value.completedAfter!
      )
    }
    
    if (activeFilters.value.completedBefore) {
      result = result.filter(interaction => 
        interaction.completed_at && 
        interaction.completed_at <= activeFilters.value.completedBefore!
      )
    }
    
    return result
  })
  
  const selectedInteractions = computed(() => 
    Array.from(selectedIds.value)
      .map(id => entities.value.get(id))
      .filter(Boolean) as InteractionWithRelations[]
  )
  
  const hasSelection = computed(() => selectedIds.value.size > 0)
  
  const isLoading = computed(() => 
    Object.values(loadingStates.value).some(state => state === 'loading')
  )
  
  const hasErrors = computed(() => 
    Object.values(errors.value).some(error => error !== null)
  )
  
  const getInteractionById = computed(() => (id: string) => {
    const interaction = entities.value.get(id)
    if (!interaction) return null
    
    // Apply optimistic updates if any
    const optimistic = optimisticUpdates.value.get(id)
    return optimistic ? { ...interaction, ...optimistic } : interaction
  })
  
  const getInteractionsByContact = computed(() => (contactId: string) => 
    interactions.value
      .filter(interaction => interaction.contact_id === contactId)
      .sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  )
  
  const getInteractionsByOpportunity = computed(() => (opportunityId: string) => 
    interactions.value
      .filter(interaction => interaction.opportunity_id === opportunityId)
      .sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  )
  
  const getInteractionsTimeline = computed(() => (entityType: 'contact' | 'opportunity', entityId: string) => {
    const relevantInteractions = entityType === 'contact' 
      ? getInteractionsByContact.value(entityId)
      : getInteractionsByOpportunity.value(entityId)
    
    return relevantInteractions.map(interaction => ({
      id: interaction.id,
      type: interaction.type,
      subject: interaction.subject,
      date: interaction.scheduled_at || interaction.created_at,
      isCompleted: interaction.is_completed,
      hasFollowUp: Boolean(interaction.follow_up_date),
      outcome: interaction.outcome
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
  
  const updateEntityCache = (interaction: InteractionWithRelations): void => {
    entities.value.set(interaction.id, interaction)
    cache.value.entities.set(interaction.id, interaction)
    
    // Update entity IDs if not present
    if (!entityIds.value.includes(interaction.id)) {
      entityIds.value.push(interaction.id)
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
  
  const applyOptimisticUpdate = (id: string, updates: Partial<Interaction>): void => {
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
   * Validate interaction scheduling
   */
  const validateInteractionScheduling = (scheduledAt: string): void => {
    const scheduledDate = new Date(scheduledAt)
    const now = new Date()
    
    // Allow past dates but warn if more than 7 days old
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    if (scheduledDate < weekAgo) {
      console.warn('Interaction scheduled more than a week ago')
    }
    
    // Warn about weekend scheduling for business interactions
    if (scheduledDate.getDay() === 0 || scheduledDate.getDay() === 6) {
      console.warn('Interaction scheduled on weekend')
    }
  }
  
  /**
   * Validate follow-up date
   */
  const validateFollowUpDate = (followUpDate: string, scheduledAt?: string): void => {
    const followUp = new Date(followUpDate)
    const now = new Date()
    
    if (followUp < now) {
      throw new ApiError('Follow-up date cannot be in the past', 400)
    }
    
    if (scheduledAt) {
      const scheduled = new Date(scheduledAt)
      if (followUp <= scheduled) {
        throw new ApiError('Follow-up date must be after the interaction date', 400)
      }
    }
  }

  // =============================================================================
  // CORE ACTIONS
  // =============================================================================
  
  /**
   * Fetch interactions list with caching and filtering
   */
  const fetchInteractions = async (options: QueryOptions = {}): Promise<void> => {
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
      const response: ServiceResponse<InteractionWithRelations[]> = 
        await interactionService.findMany({
          ...options,
          sort: options.sort || sortConfig.value,
          filters: { ...activeFilters.value, ...options.filters },
          search: { query: searchQuery.value, fields: ['subject', 'notes', 'outcome'] },
          page: pagination.value.page,
          limit: pagination.value.limit
        })
      
      // Update entities
      response.data.forEach(updateEntityCache)
      entityIds.value = response.data.map(interaction => interaction.id)
      
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
   * Get interaction by ID with caching
   */
  const getInteraction = async (
    id: string, 
    options: { useCache?: boolean; forceRefresh?: boolean } = {}
  ): Promise<InteractionWithRelations> => {
    const { useCache = true, forceRefresh = false } = options
    
    // Return cached entity if available and valid
    if (useCache && !forceRefresh && entities.value.has(id)) {
      return entities.value.get(id)!
    }
    
    loadingStates.value.get = 'loading'
    clearError('get')
    
    try {
      const interaction = await interactionService.findById(id, {
        include: ['contact', 'opportunity']
      })
      
      updateEntityCache(interaction)
      loadingStates.value.get = 'success'
      
      return interaction
    } catch (error) {
      setError('get', error)
      throw error
    }
  }
  
  /**
   * Create new interaction with validation and optimistic updates
   */
  const createInteraction = async (data: CreateInteractionSchema): Promise<InteractionWithRelations> => {
    loadingStates.value.create = 'loading'
    clearError('create')
    
    try {
      // Validate business rules
      if (data.scheduled_at) {
        validateInteractionScheduling(data.scheduled_at)
      }
      
      if (data.follow_up_date) {
        validateFollowUpDate(data.follow_up_date, data.scheduled_at)
      }
      
      // Validate relationships
      if (data.contact_id && !contactStore.getContactById(data.contact_id)) {
        throw new ApiError('Selected contact does not exist', 400)
      }
      
      if (data.opportunity_id && !opportunityStore.getOpportunityById(data.opportunity_id)) {
        throw new ApiError('Selected opportunity does not exist', 400)
      }
      
      // Create temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`
      const optimisticInteraction = {
        ...data,
        id: tempId,
        is_completed: data.is_completed ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: authStore.userId,
        updated_by: authStore.userId,
        deleted_at: null
      } as InteractionWithRelations
      
      // Apply optimistic update
      updateEntityCache(optimisticInteraction)
      
      const interaction = await interactionService.create(data as InteractionInsert)
      
      // Replace optimistic update with real data
      removeFromCache(tempId)
      updateEntityCache(interaction)
      invalidateCache('list')
      
      loadingStates.value.create = 'success'
      return interaction
    } catch (error) {
      // Rollback optimistic update
      const tempId = `temp-${Date.now()}`
      removeFromCache(tempId)
      setError('create', error)
      throw error
    }
  }
  
  /**
   * Update interaction with validation and optimistic updates
   */
  const updateInteraction = async (
    id: string, 
    data: UpdateInteractionSchema
  ): Promise<InteractionWithRelations> => {
    loadingStates.value.update = 'loading'
    clearError('update')
    
    try {
      // Validate business rules
      if (data.scheduled_at) {
        validateInteractionScheduling(data.scheduled_at)
      }
      
      if (data.follow_up_date) {
        validateFollowUpDate(data.follow_up_date, data.scheduled_at)
      }
      
      // Validate relationships
      if (data.contact_id && !contactStore.getContactById(data.contact_id)) {
        throw new ApiError('Selected contact does not exist', 400)
      }
      
      if (data.opportunity_id && !opportunityStore.getOpportunityById(data.opportunity_id)) {
        throw new ApiError('Selected opportunity does not exist', 400)
      }
      
      // Handle completion logic
      const updateData = { ...data }
      if (data.is_completed && !data.completed_at) {
        updateData.completed_at = new Date().toISOString()
      } else if (data.is_completed === false) {
        updateData.completed_at = null
      }
      
      // Apply optimistic update
      applyOptimisticUpdate(id, updateData)
      
      const interaction = await interactionService.update(id, updateData as InteractionUpdate)
      
      // Replace optimistic update with real data
      clearOptimisticUpdate(id)
      updateEntityCache(interaction)
      invalidateCache('list')
      
      loadingStates.value.update = 'success'
      return interaction
    } catch (error) {
      // Rollback optimistic update
      rollbackOptimisticUpdate(id)
      setError('update', error)
      throw error
    }
  }
  
  /**
   * Delete interaction with optimistic updates
   */
  const deleteInteraction = async (id: string): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for rollback
    const originalData = entities.value.get(id)
    
    try {
      // Apply optimistic update (soft delete)
      applyOptimisticUpdate(id, { 
        deleted_at: new Date().toISOString() 
      })
      
      await interactionService.delete(id)
      
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
  // INTERACTION COMPLETION
  // =============================================================================
  
  /**
   * Mark interaction as completed
   */
  const completeInteraction = async (
    id: string, 
    outcome?: string, 
    followUpDate?: string
  ): Promise<InteractionWithRelations> => {
    loadingStates.value.complete = 'loading'
    clearError('complete')
    
    try {
      const updateData: Partial<Interaction> = {
        is_completed: true,
        completed_at: new Date().toISOString()
      }
      
      if (outcome) {
        updateData.outcome = outcome
      }
      
      if (followUpDate) {
        validateFollowUpDate(followUpDate)
        updateData.follow_up_date = followUpDate
      }
      
      const interaction = await updateInteraction(id, updateData)
      
      loadingStates.value.complete = 'success'
      return interaction
    } catch (error) {
      setError('complete', error)
      throw error
    }
  }
  
  /**
   * Mark interaction as incomplete
   */
  const uncompleteInteraction = async (id: string): Promise<InteractionWithRelations> => {
    return updateInteraction(id, {
      is_completed: false,
      completed_at: null,
      outcome: null
    })
  }
  
  /**
   * Snooze interaction to later date
   */
  const snoozeInteraction = async (
    id: string, 
    newScheduledDate: string
  ): Promise<InteractionWithRelations> => {
    validateInteractionScheduling(newScheduledDate)
    
    return updateInteraction(id, {
      scheduled_at: newScheduledDate,
      is_completed: false,
      completed_at: null
    })
  }

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================
  
  /**
   * Delete multiple interactions
   */
  const deleteMultipleInteractions = async (ids: string[]): Promise<void> => {
    loadingStates.value.delete = 'loading'
    clearError('delete')
    
    // Store original data for potential rollback
    const originalData = new Map(
      ids.map(id => [id, entities.value.get(id)]).filter(([, interaction]) => interaction)
    )
    
    try {
      // Apply optimistic updates
      ids.forEach(id => {
        applyOptimisticUpdate(id, { deleted_at: new Date().toISOString() })
      })
      
      const result = await interactionService.deleteMany(ids)
      
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
   * Bulk complete interactions
   */
  const completeMultipleInteractions = async (
    ids: string[], 
    outcome?: string
  ): Promise<void> => {
    loadingStates.value.complete = 'loading'
    clearError('complete')
    
    try {
      const updateData: Partial<Interaction> = {
        is_completed: true,
        completed_at: new Date().toISOString()
      }
      
      if (outcome) {
        updateData.outcome = outcome
      }
      
      // Apply optimistic updates
      ids.forEach(id => {
        applyOptimisticUpdate(id, updateData)
      })
      
      const updates = ids.map(id => ({ id, data: updateData }))
      const result = await interactionService.updateMany(updates)
      
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
      loadingStates.value.complete = 'success'
    } catch (error) {
      // Rollback all optimistic updates
      ids.forEach(id => clearOptimisticUpdate(id))
      setError('complete', error)
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
  const setFilters = async (filters: Partial<InteractionFilters>): Promise<void> => {
    activeFilters.value = { ...activeFilters.value, ...filters }
    pagination.value.page = 1 // Reset pagination
    invalidateCache('list')
    await fetchInteractions()
  }
  
  /**
   * Clear all filters
   */
  const clearFilters = async (): Promise<void> => {
    activeFilters.value = {}
    searchQuery.value = ''
    pagination.value.page = 1
    invalidateCache()
    await fetchInteractions()
  }
  
  /**
   * Update sort configuration
   */
  const setSortConfig = async (field: keyof Interaction, direction: SortDirection): Promise<void> => {
    sortConfig.value = { field, direction }
    pagination.value.page = 1
    invalidateCache('list')
    await fetchInteractions()
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
    await fetchInteractions()
  }
  
  /**
   * Load previous page of data
   */
  const loadPreviousPage = async (): Promise<void> => {
    if (pagination.value.page <= 1 || isLoading.value) return
    
    pagination.value.page -= 1
    await fetchInteractions()
  }
  
  /**
   * Go to specific page
   */
  const goToPage = async (page: number): Promise<void> => {
    if (page < 1 || isLoading.value) return
    
    pagination.value.page = page
    await fetchInteractions()
  }

  // =============================================================================
  // SELECTION MANAGEMENT
  // =============================================================================
  
  const selectInteraction = (id: string): void => {
    selectedIds.value.add(id)
  }
  
  const deselectInteraction = (id: string): void => {
    selectedIds.value.delete(id)
  }
  
  const toggleInteractionSelection = (id: string): void => {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }
  
  const selectAllInteractions = (): void => {
    filteredInteractions.value.forEach(interaction => {
      selectedIds.value.add(interaction.id)
    })
  }
  
  const deselectAllInteractions = (): void => {
    selectedIds.value.clear()
  }
  
  const isInteractionSelected = (id: string): boolean => {
    return selectedIds.value.has(id)
  }

  // =============================================================================
  // BUSINESS LOGIC HELPERS
  // =============================================================================
  
  /**
   * Fetch interactions for specific contact
   */
  const fetchInteractionsForContact = async (contactId: string): Promise<InteractionWithRelations[]> => {
    try {
      const response = await interactionService.findMany({
        filters: { contact_id: contactId },
        sort: { field: 'scheduled_at', direction: 'desc' }
      })
      
      // Update cache with fetched interactions
      response.data.forEach(updateEntityCache)
      
      return response.data
    } catch (error) {
      setError('list', error)
      throw error
    }
  }
  
  /**
   * Fetch interactions for specific opportunity
   */
  const fetchInteractionsForOpportunity = async (opportunityId: string): Promise<InteractionWithRelations[]> => {
    try {
      const response = await interactionService.findMany({
        filters: { opportunity_id: opportunityId },
        sort: { field: 'scheduled_at', direction: 'desc' }
      })
      
      // Update cache with fetched interactions
      response.data.forEach(updateEntityCache)
      
      return response.data
    } catch (error) {
      setError('list', error)
      throw error
    }
  }
  
  /**
   * Create follow-up interaction
   */
  const createFollowUpInteraction = async (
    originalInteractionId: string,
    followUpData: Partial<CreateInteractionSchema>
  ): Promise<InteractionWithRelactions> => {
    const originalInteraction = entities.value.get(originalInteractionId)
    if (!originalInteraction) {
      throw new ApiError('Original interaction not found', 404)
    }
    
    const followUpInteraction: CreateInteractionSchema = {
      type: followUpData.type || 'follow_up',
      subject: followUpData.subject || `Follow-up: ${originalInteraction.subject}`,
      contact_id: originalInteraction.contact_id,
      opportunity_id: originalInteraction.opportunity_id,
      scheduled_at: followUpData.scheduled_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notes: followUpData.notes || `Follow-up to interaction: ${originalInteraction.subject}`,
      ...followUpData
    } as CreateInteractionSchema
    
    return createInteraction(followUpInteraction)
  }
  
  /**
   * Get interaction summary for entity
   */
  const getInteractionSummary = (entityType: 'contact' | 'opportunity', entityId: string) => {
    const relevantInteractions = entityType === 'contact' 
      ? getInteractionsByContact.value(entityId)
      : getInteractionsByOpportunity.value(entityId)
    
    const total = relevantInteractions.length
    const completed = relevantInteractions.filter(i => i.is_completed).length
    const pending = total - completed
    const overdue = relevantInteractions.filter(i => 
      !i.is_completed && 
      i.scheduled_at && 
      new Date(i.scheduled_at) < new Date()
    ).length
    
    const lastInteraction = relevantInteractions
      .filter(i => i.is_completed)
      .sort((a, b) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime())[0]
    
    const nextInteraction = relevantInteractions
      .filter(i => !i.is_completed && i.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())[0]
    
    return {
      total,
      completed,
      pending,
      overdue,
      lastInteraction,
      nextInteraction,
      completionRate: total > 0 ? (completed / total) * 100 : 0
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
    await fetchInteractions({ forceRefresh: true } as any)
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
    interactions: readonly(interactions),
    interactionCount: readonly(interactionCount),
    loadingStates: readonly(loadingStates),
    errors: readonly(errors),
    searchQuery: readonly(searchQuery),
    activeFilters: readonly(activeFilters),
    sortConfig: readonly(sortConfig),
    pagination: readonly(pagination),
    selectedIds: readonly(selectedIds),
    
    // Computed getters
    completedInteractions,
    pendingInteractions,
    overdueInteractions,
    todayInteractions,
    upcomingInteractions,
    interactionsByContact,
    interactionsByOpportunity,
    interactionsByType,
    interactionMetrics,
    filteredInteractions,
    selectedInteractions,
    hasSelection,
    isLoading,
    hasErrors,
    getInteractionById,
    getInteractionsByContact,
    getInteractionsByOpportunity,
    getInteractionsTimeline,
    
    // Core actions
    fetchInteractions,
    getInteraction,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    deleteMultipleInteractions,
    
    // Completion actions
    completeInteraction,
    uncompleteInteraction,
    snoozeInteraction,
    completeMultipleInteractions,
    
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
    selectInteraction,
    deselectInteraction,
    toggleInteractionSelection,
    selectAllInteractions,
    deselectAllInteractions,
    isInteractionSelected,
    
    // Business logic
    fetchInteractionsForContact,
    fetchInteractionsForOpportunity,
    createFollowUpInteraction,
    getInteractionSummary,
    
    // Utilities
    refreshData,
    resetStore,
    clearError,
    clearAllErrors,
    
    // Cache management
    invalidateCache
  }
})