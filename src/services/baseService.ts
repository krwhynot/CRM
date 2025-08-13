/**
 * Base Service Class for KitchenPantry CRM
 * 
 * Provides common functionality for all entity services including:
 * - Type-safe CRUD operations
 * - Error handling with proper error types
 * - Filtering and pagination
 * - Caching strategies
 * - Authentication awareness
 * - Performance optimization
 */

import { supabase, ApiError, handleSupabaseResponse } from './api'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import type { Database } from '@/types/database.types'
import type { SortDirection } from '@/types'

// =============================================================================
// BASE SERVICE TYPES
// =============================================================================

export interface BaseEntity {
  id: string
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
}

export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

export interface SortOptions {
  field: string
  direction: SortDirection
}

export interface FilterOptions {
  [key: string]: any
}

export interface SearchOptions {
  query?: string
  fields?: string[]
}

export interface QueryOptions extends PaginationOptions {
  sort?: SortOptions
  filters?: FilterOptions
  search?: SearchOptions
  include?: string[]
}

export interface ServiceResponse<T> {
  data: T
  count?: number
  page?: number
  limit?: number
  hasMore?: boolean
}

export interface BulkOperation {
  success: boolean
  processed: number
  failed: number
  errors: Array<{ id?: string; error: string }>
}

// =============================================================================
// BASE SERVICE CLASS
// =============================================================================

// Define valid table names type from database schema
type TableNames = keyof Database['public']['Tables']

export abstract class BaseService<
  TRow extends BaseEntity,
  TInsert extends Record<string, any>,
  TUpdate extends Record<string, any>
> {
  protected readonly tableName: TableNames
  protected readonly cache = new Map<string, { data: any; timestamp: number }>()
  protected readonly cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor(tableName: TableNames) {
    this.tableName = tableName
  }

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================

  protected getCacheKey(id: string, operation: string = 'get'): string {
    return `${this.tableName}:${operation}:${id}`
  }

  protected getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  protected setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  protected invalidateCache(pattern: string = ''): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  // =============================================================================
  // QUERY BUILDER HELPERS
  // =============================================================================

  protected applyFilters(
    query: PostgrestFilterBuilder<Database['public'], any, any>,
    filters?: FilterOptions
  ): PostgrestFilterBuilder<Database['public'], any, any> {
    if (!filters) return query

    let filteredQuery = query

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return

      // Handle different filter types
      if (Array.isArray(value)) {
        filteredQuery = filteredQuery.in(key, value)
      } else if (typeof value === 'object' && value.operator) {
        // Handle complex filters like { operator: 'gte', value: 100 }
        const { operator, value: filterValue } = value
        filteredQuery = (filteredQuery as any)[operator](key, filterValue)
      } else if (typeof value === 'string' && value.includes('%')) {
        // Handle LIKE patterns
        filteredQuery = filteredQuery.like(key, value)
      } else {
        filteredQuery = filteredQuery.eq(key, value)
      }
    })

    return filteredQuery
  }

  protected applySearch(
    query: PostgrestFilterBuilder<Database['public'], any, any>,
    search?: SearchOptions
  ): PostgrestFilterBuilder<Database['public'], any, any> {
    if (!search?.query || !search?.fields?.length) return query

    // Build text search query
    const searchConditions = search.fields.map(field => 
      `${field}.ilike.%${search.query}%`
    ).join(',')

    return query.or(searchConditions)
  }

  protected applySorting(
    query: PostgrestFilterBuilder<Database['public'], any, any>,
    sort?: SortOptions
  ): PostgrestFilterBuilder<Database['public'], any, any> {
    if (!sort) return query.order('created_at', { ascending: false })

    return query.order(sort.field, { 
      ascending: sort.direction === 'asc' 
    })
  }

  protected applyPagination(
    query: PostgrestFilterBuilder<Database['public'], any, any>,
    pagination?: PaginationOptions
  ): PostgrestFilterBuilder<Database['public'], any, any> {
    if (!pagination) return query

    const { page, limit, offset } = pagination

    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 10) - 1)
    } else if (page && limit) {
      const start = (page - 1) * limit
      const end = start + limit - 1
      query = query.range(start, end)
    } else if (limit) {
      query = query.limit(limit)
    }

    return query
  }

  // =============================================================================
  // CORE CRUD OPERATIONS
  // =============================================================================

  /**
   * Get entity by ID with optional caching
   */
  async findById(
    id: string, 
    options: { useCache?: boolean; include?: string[] } = {}
  ): Promise<TRow> {
    const { useCache = true, include = [] } = options
    const cacheKey = this.getCacheKey(id)

    // Check cache first
    if (useCache) {
      const cached = this.getFromCache<TRow>(cacheKey)
      if (cached) return cached
    }

    try {
      let query = (supabase.from as any)(this.tableName).select('*').eq('id', id)

      // Apply includes for related data
      if (include.length > 0) {
        const selectFields = this.buildSelectFields(include)
        query = (supabase.from as any)(this.tableName).select(selectFields).eq('id', id)
      }

      const { data, error } = await query.single()
      const result = handleSupabaseResponse(data, error)

      // Cache the result
      if (useCache) {
        this.setCache(cacheKey, result)
      }

      return result
    } catch (error) {
      throw new ApiError(
        `Failed to fetch ${this.tableName} with ID ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * List entities with filtering, sorting, and pagination
   */
  async findMany(options: QueryOptions = {}): Promise<ServiceResponse<TRow[]>> {
    const { 
      page = 1, 
      limit = 20, 
      sort, 
      filters, 
      search, 
      include = [] 
    } = options

    try {
      const selectFields = include.length > 0 
        ? this.buildSelectFields(include)
        : '*'

      let query = (supabase.from as any)(this.tableName)
        .select(selectFields, { count: 'exact' })

      // Apply filters
      query = this.applyFilters(query, filters)

      // Apply search
      query = this.applySearch(query, search)

      // Apply sorting
      query = this.applySorting(query, sort)

      // Apply pagination
      query = this.applyPagination(query, { page, limit })

      // Exclude soft-deleted records by default
      query = query.is('deleted_at', null)

      const { data, error, count } = await query
      const result = handleSupabaseResponse(data, error)

      return {
        data: result,
        count: count || 0,
        page,
        limit,
        hasMore: count ? (page * limit) < count : false
      }
    } catch (error) {
      throw new ApiError(
        `Failed to fetch ${this.tableName} list`,
        500,
        error as any
      )
    }
  }

  /**
   * Create new entity
   */
  async create(data: TInsert): Promise<TRow> {
    try {
      // Add audit fields
      const createData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: await this.getCurrentUserId(),
        updated_by: await this.getCurrentUserId()
      }

      const { data: result, error } = await (supabase.from as any)(this.tableName)
        .insert(createData)
        .select()
        .single()

      const entity = handleSupabaseResponse(result, error)

      // Invalidate relevant caches
      this.invalidateCache()

      return entity
    } catch (error) {
      throw new ApiError(
        `Failed to create ${this.tableName}`,
        500,
        error as any
      )
    }
  }

  /**
   * Update existing entity
   */
  async update(id: string, data: TUpdate): Promise<TRow> {
    try {
      // Add audit fields
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: await this.getCurrentUserId()
      }

      const { data: result, error } = await (supabase.from as any)(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      const entity = handleSupabaseResponse(result, error) as TRow

      // Invalidate caches
      this.invalidateCache(id)

      return entity
    } catch (error) {
      throw new ApiError(
        `Failed to update ${this.tableName} with ID ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Soft delete entity
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await (supabase.from as any)(this.tableName)
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: await this.getCurrentUserId()
        })
        .eq('id', id)

      if (error) {
        throw new ApiError(error.message, 500, error)
      }

      // Invalidate caches
      this.invalidateCache(id)
    } catch (error) {
      throw new ApiError(
        `Failed to delete ${this.tableName} with ID ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Hard delete entity (permanent removal)
   */
  async hardDelete(id: string): Promise<void> {
    try {
      const { error } = await (supabase.from as any)(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        throw new ApiError(error.message, 500, error)
      }

      // Invalidate caches
      this.invalidateCache(id)
    } catch (error) {
      throw new ApiError(
        `Failed to permanently delete ${this.tableName} with ID ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Restore soft-deleted entity
   */
  async restore(id: string): Promise<TRow> {
    try {
      const { data: result, error } = await (supabase.from as any)(this.tableName)
        .update({
          deleted_at: null,
          updated_at: new Date().toISOString(),
          updated_by: await this.getCurrentUserId()
        })
        .eq('id', id)
        .select()
        .single()

      const entity = handleSupabaseResponse(result, error)

      // Invalidate caches
      this.invalidateCache(id)

      return entity
    } catch (error) {
      throw new ApiError(
        `Failed to restore ${this.tableName} with ID ${id}`,
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================

  /**
   * Create multiple entities in a transaction
   */
  async createMany(items: TInsert[]): Promise<BulkOperation> {
    const results: BulkOperation = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    }

    try {
      const userId = await this.getCurrentUserId()
      const now = new Date().toISOString()

      const createData = items.map(item => ({
        ...item,
        created_at: now,
        updated_at: now,
        created_by: userId,
        updated_by: userId
      }))

      const { data, error } = await (supabase.from as any)(this.tableName)
        .insert(createData)
        .select()

      if (error) {
        results.success = false
        results.failed = items.length
        results.errors.push({ error: error.message })
      } else {
        results.processed = data?.length || 0
      }

      this.invalidateCache()

      return results
    } catch (error) {
      results.success = false
      results.failed = items.length
      results.errors.push({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return results
    }
  }

  /**
   * Update multiple entities
   */
  async updateMany(updates: Array<{ id: string; data: TUpdate }>): Promise<BulkOperation> {
    const results: BulkOperation = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    }

    const userId = await this.getCurrentUserId()
    const now = new Date().toISOString()

    for (const { id, data } of updates) {
      try {
        const updateData = {
          ...data,
          updated_at: now,
          updated_by: userId
        }

        const { error } = await (supabase.from as any)(this.tableName)
          .update(updateData)
          .eq('id', id)

        if (error) {
          results.failed++
          results.errors.push({ id, error: error.message })
          results.success = false
        } else {
          results.processed++
        }
      } catch (error) {
        results.failed++
        results.errors.push({ 
          id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
        results.success = false
      }
    }

    this.invalidateCache()
    return results
  }

  /**
   * Soft delete multiple entities
   */
  async deleteMany(ids: string[]): Promise<BulkOperation> {
    const results: BulkOperation = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    }

    try {
      const userId = await this.getCurrentUserId()
      const now = new Date().toISOString()

      const { error } = await (supabase.from as any)(this.tableName)
        .update({
          deleted_at: now,
          updated_at: now,
          updated_by: userId
        })
        .in('id', ids)

      if (error) {
        results.success = false
        results.failed = ids.length
        results.errors.push({ error: error.message })
      } else {
        results.processed = ids.length
      }

      this.invalidateCache()

      return results
    } catch (error) {
      results.success = false
      results.failed = ids.length
      results.errors.push({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return results
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const { data, error } = await (supabase.from as any)(this.tableName)
        .select('id')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      return !error && !!data
    } catch {
      return false
    }
  }

  /**
   * Count entities with optional filters
   */
  async count(filters?: FilterOptions): Promise<number> {
    try {
      let query = (supabase.from as any)(this.tableName)
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      query = this.applyFilters(query, filters)

      const { count, error } = await query

      if (error) throw error

      return count || 0
    } catch (error) {
      throw new ApiError(
        `Failed to count ${this.tableName}`,
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  protected async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  protected buildSelectFields(include: string[]): string {
    const baseFields = '*'
    
    if (include.length === 0) return baseFields

    // Build select string with related fields
    // This is a placeholder for more complex relationship handling
    // Each service can override this method for entity-specific relationships
    const relationFields = include.map(rel => {
      // Example: 'contacts' -> 'contacts(*)'
      return `${rel}(*)`
    }).join(', ')

    return `${baseFields}, ${relationFields}`
  }

  /**
   * Validate required fields for create/update operations
   */
  protected validateRequiredFields(data: any, requiredFields: string[]): void {
    const missing = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    )

    if (missing.length > 0) {
      throw new ApiError(
        `Missing required fields: ${missing.join(', ')}`,
        400
      )
    }
  }

  /**
   * Validate data constraints
   */
  protected async validateConstraints(data: any, operation: 'create' | 'update' = 'create'): Promise<void> {
    // Override in child classes for entity-specific validation
  }
}