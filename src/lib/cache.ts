/**
 * Static Data Cache System
 *
 * Implements in-memory caching for lookup tables and static data that rarely change.
 * Provides sub-5ms access times and reduces database load.
 *
 * Features:
 * - Automatic cache warming on application start
 * - TTL-based expiration (configurable)
 * - Background refresh for seamless updates
 * - TypeScript-safe cache access
 * - Performance monitoring and metrics
 */

import { supabase } from './supabase'
import type { Database } from './database.types'

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 30 * 60 * 1000, // 30 minutes default
  LOOKUP_TTL: 60 * 60 * 1000, // 1 hour for lookup tables (rarely change)
  ENUM_TTL: 2 * 60 * 60 * 1000, // 2 hours for enums (very stable)
  REFRESH_BUFFER: 5 * 60 * 1000, // Start refresh 5 minutes before expiry
} as const

// Cache entry interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
  isRefreshing?: boolean
}

// Cache storage
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private metrics = {
    hits: 0,
    misses: 0,
    refreshes: 0,
    errors: 0,
  }

  // Get cache entry if valid
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.metrics.misses++
      return null
    }

    const now = Date.now()
    const age = now - entry.timestamp

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key)
      this.metrics.misses++
      return null
    }

    // Check if needs refresh (background refresh)
    if (age > entry.ttl - CACHE_CONFIG.REFRESH_BUFFER && !entry.isRefreshing) {
      this.backgroundRefresh(key, entry)
    }

    this.metrics.hits++
    return entry.data as T
  }

  // Set cache entry
  set<T>(key: string, data: T, ttl = CACHE_CONFIG.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      key,
      isRefreshing: false,
    })
  }

  // Clear cache entry
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Background refresh for seamless updates
  private async backgroundRefresh(key: string, entry: CacheEntry<any>): Promise<void> {
    if (entry.isRefreshing) return

    entry.isRefreshing = true
    this.metrics.refreshes++

    try {
      // Determine refresh function based on cache key
      const refreshed = await this.getRefreshFunction(key)
      if (refreshed !== null) {
        this.set(key, refreshed, entry.ttl)
      }
    } catch (error) {
      this.metrics.errors++
      console.warn(`Background refresh failed for cache key: ${key}`, error)
    } finally {
      entry.isRefreshing = false
    }
  }

  // Map cache keys to their refresh functions
  private async getRefreshFunction(key: string): Promise<any> {
    switch (key) {
      case 'lookup:interaction_types':
        return await fetchInteractionTypes()
      case 'lookup:stages':
        return await fetchStages()
      case 'lookup:statuses':
        return await fetchStatuses()
      case 'lookup:loss_reasons':
        return await fetchLossReasons()
      case 'lookup:sources':
        return await fetchSources()
      case 'static:organization_types':
        return getOrganizationTypes()
      case 'static:priority_levels':
        return getPriorityLevels()
      case 'static:contact_roles':
        return getContactRoles()
      case 'static:food_service_segments':
        return getFoodServiceSegments()
      default:
        return null
    }
  }

  // Get cache metrics
  getMetrics() {
    const totalRequests = this.metrics.hits + this.metrics.misses
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0

    return {
      ...this.metrics,
      totalRequests,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheSize: this.cache.size,
    }
  }
}

// Global cache instance
const cache = new MemoryCache()

// Lookup table types
type InteractionType = Database['public']['Tables']['interaction_type_lu']['Row']
type Stage = Database['public']['Tables']['stage_lu']['Row']
type Status = Database['public']['Tables']['status_lu']['Row']
type LossReason = Database['public']['Tables']['loss_reason_lu']['Row']
type Source = Database['public']['Tables']['source_lu']['Row']

// Database fetchers for lookup tables
async function fetchInteractionTypes(): Promise<InteractionType[]> {
  const { data, error } = await supabase
    .from('interaction_type_lu')
    .select('*')
    .order('display_name')
    .limit(50)

  if (error) throw error
  return data || []
}

async function fetchStages(): Promise<Stage[]> {
  const { data, error } = await supabase
    .from('stage_lu')
    .select('*')
    .order('display_name')
    .limit(20)

  if (error) throw error
  return data || []
}

async function fetchStatuses(): Promise<Status[]> {
  const { data, error } = await supabase
    .from('status_lu')
    .select('*')
    .order('display_name')
    .limit(20)

  if (error) throw error
  return data || []
}

async function fetchLossReasons(): Promise<LossReason[]> {
  const { data, error } = await supabase
    .from('loss_reason_lu')
    .select('*')
    .order('display_name')
    .limit(50)

  if (error) throw error
  return data || []
}

async function fetchSources(): Promise<Source[]> {
  const { data, error } = await supabase
    .from('source_lu')
    .select('*')
    .order('display_name')
    .limit(50)

  if (error) throw error
  return data || []
}

// Static data getters (no database calls needed)
function getOrganizationTypes(): Array<{ value: string; label: string }> {
  return [
    { value: 'customer', label: 'Customer' },
    { value: 'principal', label: 'Principal' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'unknown', label: 'Unknown' },
  ]
}

function getPriorityLevels(): Array<{ value: string; label: string }> {
  return [
    { value: 'A', label: 'A - Highest Priority' },
    { value: 'B', label: 'B - High Priority' },
    { value: 'C', label: 'C - Medium Priority' },
    { value: 'D', label: 'D - Low Priority' },
  ]
}

function getContactRoles(): Array<{ value: string; label: string }> {
  return [
    { value: 'owner', label: 'Owner' },
    { value: 'manager', label: 'Manager' },
    { value: 'buyer', label: 'Buyer' },
    { value: 'chef', label: 'Chef' },
    { value: 'other', label: 'Other' },
  ]
}

function getFoodServiceSegments(): Array<{ value: string; label: string }> {
  return [
    { value: 'Quick Service Restaurant (QSR)', label: 'Quick Service Restaurant (QSR)' },
    { value: 'Fast Casual', label: 'Fast Casual' },
    { value: 'Casual Dining', label: 'Casual Dining' },
    { value: 'Fine Dining', label: 'Fine Dining' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Corporate Dining', label: 'Corporate Dining' },
    { value: 'Sports & Entertainment', label: 'Sports & Entertainment' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Military/Government', label: 'Military/Government' },
    { value: 'Retail/Grocery', label: 'Retail/Grocery' },
    { value: 'Distributor', label: 'Distributor' },
    { value: 'General', label: 'General' },
  ]
}

// Public API for cached data access
export const staticDataCache = {
  // Lookup table accessors
  async getInteractionTypes(): Promise<InteractionType[]> {
    const cached = cache.get<InteractionType[]>('lookup:interaction_types')
    if (cached) return cached

    const data = await fetchInteractionTypes()
    cache.set('lookup:interaction_types', data, CACHE_CONFIG.LOOKUP_TTL)
    return data
  },

  async getStages(): Promise<Stage[]> {
    const cached = cache.get<Stage[]>('lookup:stages')
    if (cached) return cached

    const data = await fetchStages()
    cache.set('lookup:stages', data, CACHE_CONFIG.LOOKUP_TTL)
    return data
  },

  async getStatuses(): Promise<Status[]> {
    const cached = cache.get<Status[]>('lookup:statuses')
    if (cached) return cached

    const data = await fetchStatuses()
    cache.set('lookup:statuses', data, CACHE_CONFIG.LOOKUP_TTL)
    return data
  },

  async getLossReasons(): Promise<LossReason[]> {
    const cached = cache.get<LossReason[]>('lookup:loss_reasons')
    if (cached) return cached

    const data = await fetchLossReasons()
    cache.set('lookup:loss_reasons', data, CACHE_CONFIG.LOOKUP_TTL)
    return data
  },

  async getSources(): Promise<Source[]> {
    const cached = cache.get<Source[]>('lookup:sources')
    if (cached) return cached

    const data = await fetchSources()
    cache.set('lookup:sources', data, CACHE_CONFIG.LOOKUP_TTL)
    return data
  },

  // Static data accessors (instant access)
  getOrganizationTypes(): Array<{ value: string; label: string }> {
    const cached = cache.get<Array<{ value: string; label: string }>>('static:organization_types')
    if (cached) return cached

    const data = getOrganizationTypes()
    cache.set('static:organization_types', data, CACHE_CONFIG.ENUM_TTL)
    return data
  },

  getPriorityLevels(): Array<{ value: string; label: string }> {
    const cached = cache.get<Array<{ value: string; label: string }>>('static:priority_levels')
    if (cached) return cached

    const data = getPriorityLevels()
    cache.set('static:priority_levels', data, CACHE_CONFIG.ENUM_TTL)
    return data
  },

  getContactRoles(): Array<{ value: string; label: string }> {
    const cached = cache.get<Array<{ value: string; label: string }>>('static:contact_roles')
    if (cached) return cached

    const data = getContactRoles()
    cache.set('static:contact_roles', data, CACHE_CONFIG.ENUM_TTL)
    return data
  },

  getFoodServiceSegments(): Array<{ value: string; label: string }> {
    const cached = cache.get<Array<{ value: string; label: string }>>(
      'static:food_service_segments'
    )
    if (cached) return cached

    const data = getFoodServiceSegments()
    cache.set('static:food_service_segments', data, CACHE_CONFIG.ENUM_TTL)
    return data
  },

  // Cache management
  clearCache(): void {
    cache.clear()
  },

  getMetrics() {
    return cache.getMetrics()
  },

  // Warm cache with commonly used data
  async warmCache(): Promise<void> {
    console.log('Warming static data cache...')
    const startTime = performance.now()

    try {
      // Load lookup tables in parallel
      await Promise.allSettled([
        this.getInteractionTypes(),
        this.getStages(),
        this.getStatuses(),
        this.getLossReasons(),
        this.getSources(),
      ])

      // Load static data (instant)
      this.getOrganizationTypes()
      this.getPriorityLevels()
      this.getContactRoles()
      this.getFoodServiceSegments()

      const endTime = performance.now()
      console.log(`Cache warmed in ${(endTime - startTime).toFixed(2)}ms`)
      console.log('Cache metrics:', this.getMetrics())
    } catch (error) {
      console.error('Cache warming failed:', error)
    }
  },
}

// Export individual functions for backward compatibility
export const {
  getInteractionTypes,
  getStages,
  getStatuses,
  getLossReasons,
  getSources,
  clearCache,
  getMetrics,
  warmCache,
} = staticDataCache

// Export static data functions with different names to avoid conflicts
export const getCachedOrganizationTypes = staticDataCache.getOrganizationTypes
export const getCachedPriorityLevels = staticDataCache.getPriorityLevels
export const getCachedContactRoles = staticDataCache.getContactRoles
export const getCachedFoodServiceSegments = staticDataCache.getFoodServiceSegments

export default staticDataCache
