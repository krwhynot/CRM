/**
 * Generic Entity Filters Hook
 *
 * Provides comprehensive filtering functionality for any entity type.
 * Supports both server-side and client-side filtering with performance optimization.
 */

import { useState, useCallback, useMemo } from 'react'
import type { BaseEntity, BaseFilters, UseEntityFiltersReturn } from './types'

export interface EntityFilterConfig<TFilters extends BaseFilters> {
  defaultFilters: TFilters
  persistFilters?: boolean
  filterKey?: string
  debounceMs?: number
  onFiltersChange?: (filters: TFilters) => void
}

export interface FilterPreset<TFilters extends BaseFilters> {
  id: string
  name: string
  description?: string
  filters: Partial<TFilters>
  icon?: string
}

/**
 * Generic entity filters hook with comprehensive filtering capabilities
 */
export function useEntityFilters<TFilters extends BaseFilters, T extends BaseEntity = BaseEntity>(
  entities: T[],
  config: EntityFilterConfig<TFilters>,
  customFilterFn?: (entity: T, filters: TFilters) => boolean
): UseEntityFiltersReturn<TFilters, T> {
  // Initialize filters state
  const [filters, setFiltersState] = useState<TFilters>(() => {
    if (config.persistFilters && config.filterKey) {
      try {
        const saved = localStorage.getItem(`filters-${config.filterKey}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          return { ...config.defaultFilters, ...parsed }
        }
      } catch {
        // Ignore invalid saved filters
      }
    }
    return config.defaultFilters
  })

  // Apply filters to entities
  const applyFilters = useCallback(
    (entitiesToFilter: T[]): T[] => {
      return entitiesToFilter.filter((entity) => {
        // Apply custom filter function if provided
        if (customFilterFn) {
          return customFilterFn(entity, filters)
        }

        // Default filtering logic
        return applyDefaultFilters(entity, filters)
      })
    },
    [filters, customFilterFn]
  )

  // Get filtered data
  const filteredData = useMemo(() => {
    return applyFilters(entities)
  }, [entities, applyFilters])

  // Update filters with persistence and callbacks
  const setFilters = useCallback(
    (newFilters: TFilters | ((prev: TFilters) => TFilters)) => {
      const resolvedFilters = typeof newFilters === 'function' ? newFilters(filters) : newFilters

      setFiltersState(resolvedFilters)

      // Persist filters if enabled
      if (config.persistFilters && config.filterKey) {
        localStorage.setItem(`filters-${config.filterKey}`, JSON.stringify(resolvedFilters))
      }

      // Trigger callback
      config.onFiltersChange?.(resolvedFilters)
    },
    [filters, config]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(config.defaultFilters)
  }, [setFilters, config.defaultFilters])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !areFiltersEqual(filters, config.defaultFilters)
  }, [filters, config.defaultFilters])

  return {
    filters,
    setFilters,
    filteredData,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  }
}

/**
 * Default filtering logic for common entity properties
 */
function applyDefaultFilters<TFilters extends BaseFilters, T extends BaseEntity>(
  entity: T,
  filters: TFilters
): boolean {
  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    const searchableFields = getSearchableFields(entity)
    const matchesSearch = searchableFields.some((value) =>
      value?.toLowerCase().includes(searchTerm)
    )
    if (!matchesSearch) return false
  }

  return true
}

/**
 * Extract searchable string fields from an entity
 */
function getSearchableFields(entity: BaseEntity): string[] {
  const searchableFields: string[] = []

  Object.entries(entity).forEach(([key, value]) => {
    if (
      typeof value === 'string' &&
      !key.includes('id') &&
      !key.includes('_at') &&
      !key.includes('password')
    ) {
      searchableFields.push(value)
    }
  })

  return searchableFields
}

/**
 * Check if two filter objects are equal
 */
function areFiltersEqual<TFilters extends BaseFilters>(
  filters1: TFilters,
  filters2: TFilters
): boolean {
  const keys1 = Object.keys(filters1) as (keyof TFilters)[]
  const keys2 = Object.keys(filters2) as (keyof TFilters)[]

  if (keys1.length !== keys2.length) return false

  return keys1.every((key) => filters1[key] === filters2[key])
}

/**
 * Hook for advanced filtering with presets and quick filters
 */
export function useAdvancedEntityFilters<
  TFilters extends BaseFilters,
  T extends BaseEntity = BaseEntity,
>(
  entities: T[],
  config: EntityFilterConfig<TFilters> & {
    presets?: FilterPreset<TFilters>[]
    quickFilters?: Array<{
      key: keyof TFilters
      label: string
      options: Array<{ label: string; value: any }>
    }>
  },
  customFilterFn?: (entity: T, filters: TFilters) => boolean
) {
  const baseFilters = useEntityFilters(entities, config, customFilterFn)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  // Apply preset filters
  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = config.presets?.find((p) => p.id === presetId)
      if (preset) {
        baseFilters.setFilters({
          ...config.defaultFilters,
          ...preset.filters,
        } as TFilters)
        setActivePreset(presetId)
      }
    },
    [baseFilters, config.defaultFilters, config.presets]
  )

  // Clear preset
  const clearPreset = useCallback(() => {
    setActivePreset(null)
    baseFilters.clearFilters()
  }, [baseFilters])

  // Apply quick filter
  const applyQuickFilter = useCallback(
    (key: keyof TFilters, value: any) => {
      baseFilters.setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
      setActivePreset(null) // Clear active preset when manual filter is applied
    },
    [baseFilters]
  )

  // Get filter statistics
  const getFilterStats = useCallback(() => {
    const totalEntities = entities.length
    const filteredEntities = baseFilters.filteredData.length
    const filteredPercentage =
      totalEntities > 0 ? Math.round((filteredEntities / totalEntities) * 100) : 0

    return {
      total: totalEntities,
      filtered: filteredEntities,
      hidden: totalEntities - filteredEntities,
      percentage: filteredPercentage,
    }
  }, [entities.length, baseFilters.filteredData.length])

  return {
    ...baseFilters,
    presets: config.presets || [],
    quickFilters: config.quickFilters || [],
    activePreset,
    applyPreset,
    clearPreset,
    applyQuickFilter,
    getFilterStats,
  }
}

/**
 * Hook for faceted filtering (filter by multiple categories)
 */
export function useFacetedEntityFilters<
  TFilters extends BaseFilters,
  T extends BaseEntity = BaseEntity,
>(
  entities: T[],
  config: EntityFilterConfig<TFilters> & {
    facets: Array<{
      key: keyof T
      label: string
      type: 'string' | 'number' | 'boolean' | 'date' | 'enum'
      options?: Array<{ label: string; value: any }>
    }>
  },
  customFilterFn?: (entity: T, filters: TFilters) => boolean
) {
  const baseFilters = useEntityFilters(entities, config, customFilterFn)

  // Calculate facet counts
  const facetCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {}

    config.facets.forEach((facet) => {
      counts[facet.key as string] = {}

      entities.forEach((entity) => {
        const value = entity[facet.key]
        const key = String(value)
        counts[facet.key as string][key] = (counts[facet.key as string][key] || 0) + 1
      })
    })

    return counts
  }, [entities, config.facets])

  // Get available filter values for a facet
  const getFacetValues = useCallback(
    (facetKey: keyof T) => {
      const facet = config.facets.find((f) => f.key === facetKey)
      if (!facet) return []

      if (facet.options) {
        return facet.options.map((option) => ({
          ...option,
          count: facetCounts[facetKey as string]?.[String(option.value)] || 0,
        }))
      }

      // Auto-generate values from data
      const values = Object.entries(facetCounts[facetKey as string] || {})
        .map(([value, count]) => ({
          label: value,
          value: facet.type === 'number' ? Number(value) : value,
          count,
        }))
        .sort((a, b) => b.count - a.count)

      return values
    },
    [config.facets, facetCounts]
  )

  return {
    ...baseFilters,
    facets: config.facets,
    facetCounts,
    getFacetValues,
  }
}
