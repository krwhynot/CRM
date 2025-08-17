import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SelectOption } from '@/components/forms/DynamicSelectField'

export type EntityType = 'organizations' | 'contacts' | 'products' | 'opportunities'

export interface EntitySearchConfig {
  entityType: EntityType
  searchFields: string[]
  selectFields: string
  labelField: string
  valueField?: string
  descriptionField?: string
  badgeField?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  additionalFilters?: Record<string, any>
  limit?: number
  orderBy?: string
}

export interface UseAsyncEntitySearchOptions {
  debounceMs?: number
  minSearchLength?: number
  enabled?: boolean
  // React Query options
  staleTime?: number
  gcTime?: number
  enableReactQuery?: boolean
}

export interface UseAsyncEntitySearchReturn {
  searchResults: SelectOption[]
  isLoading: boolean
  error: Error | null
  search: (query: string) => Promise<void>
  clearSearch: () => void
  clearResults: () => void
  // React Query specific methods
  refetch?: () => void
  invalidateCache?: () => void
}

// Predefined configurations for common entity searches
export const entitySearchConfigs: Record<string, EntitySearchConfig> = {
  // Organization searches
  allOrganizations: {
    entityType: 'organizations',
    searchFields: ['name', 'email', 'website'],
    selectFields: 'id, name, type, email, website, city, state_province',
    labelField: 'name',
    descriptionField: 'email',
    badgeField: 'type',
    additionalFilters: { deleted_at: null },
    limit: 50,
    orderBy: 'name',
  },
  principalOrganizations: {
    entityType: 'organizations',
    searchFields: ['name', 'email', 'website'],
    selectFields: 'id, name, type, email, website, city, state_province',
    labelField: 'name',
    descriptionField: 'email',
    badgeField: 'type',
    badgeVariant: 'default',
    additionalFilters: { deleted_at: null, type: 'principal' },
    limit: 50,
    orderBy: 'name',
  },
  distributorOrganizations: {
    entityType: 'organizations',
    searchFields: ['name', 'email', 'website'],
    selectFields: 'id, name, type, email, website, city, state_province',
    labelField: 'name',
    descriptionField: 'email',
    badgeField: 'type',
    badgeVariant: 'secondary',
    additionalFilters: { deleted_at: null, type: 'distributor' },
    limit: 50,
    orderBy: 'name',
  },

  // Contact searches
  allContacts: {
    entityType: 'contacts',
    searchFields: ['first_name', 'last_name', 'email', 'title'],
    selectFields: `
      id, first_name, last_name, email, title, 
      organization:organizations(name, type)
    `,
    labelField: 'full_name', // Will be computed
    descriptionField: 'email',
    additionalFilters: { deleted_at: null },
    limit: 50,
    orderBy: 'last_name, first_name',
  },
  contactsByOrganization: {
    entityType: 'contacts',
    searchFields: ['first_name', 'last_name', 'email', 'title'],
    selectFields: 'id, first_name, last_name, email, title, organization_id',
    labelField: 'full_name', // Will be computed
    descriptionField: 'email',
    additionalFilters: { deleted_at: null },
    limit: 50,
    orderBy: 'last_name, first_name',
  },

  // Product searches
  allProducts: {
    entityType: 'products',
    searchFields: ['name', 'description', 'sku'],
    selectFields: `
      id, name, description, sku, category, 
      principal_organization:organizations(name, type)
    `,
    labelField: 'name',
    descriptionField: 'description',
    badgeField: 'category',
    additionalFilters: { deleted_at: null },
    limit: 50,
    orderBy: 'name',
  },

  // Opportunity searches
  allOpportunities: {
    entityType: 'opportunities',
    searchFields: ['name', 'description'],
    selectFields: `
      id, name, description, stage, value, 
      organization:organizations(name, type)
    `,
    labelField: 'name',
    descriptionField: 'description',
    badgeField: 'stage',
    additionalFilters: { deleted_at: null },
    limit: 50,
    orderBy: 'name',
  },
}

/**
 * Shared entity search function for React Query and manual search
 */
async function performEntitySearch(config: EntitySearchConfig, query: string): Promise<SelectOption[]> {
  let supabaseQuery = supabase
    .from(config.entityType)
    .select(config.selectFields)
    .limit(config.limit || 50)

  // Apply additional filters
  if (config.additionalFilters) {
    Object.entries(config.additionalFilters).forEach(([key, value]) => {
      if (value === null) {
        supabaseQuery = supabaseQuery.is(key, null)
      } else {
        supabaseQuery = supabaseQuery.eq(key, value)
      }
    })
  }

  // Build search query across multiple fields
  if (query.trim()) {
    const searchConditions = config.searchFields
      .map(field => `${field}.ilike.%${query}%`)
      .join(',')
    supabaseQuery = supabaseQuery.or(searchConditions)
  }

  // Apply ordering
  if (config.orderBy) {
    supabaseQuery = supabaseQuery.order(config.orderBy)
  }

  const { data, error: supabaseError } = await supabaseQuery

  if (supabaseError) throw supabaseError

  // Transform data into SelectOption format
  const options: SelectOption[] = (data || []).map((item: any) => {
    let label = item[config.labelField]
    
    // Handle computed fields like full_name for contacts
    if (config.labelField === 'full_name' && item.first_name && item.last_name) {
      label = `${item.first_name} ${item.last_name}`
    }

    let description = config.descriptionField ? item[config.descriptionField] : undefined
    
    // Handle nested organization name for description
    if (config.descriptionField === 'organization_name' && item.organization?.name) {
      description = item.organization.name
    }

    let badge = undefined
    if (config.badgeField) {
      const badgeText = item[config.badgeField]
      if (badgeText) {
        badge = {
          text: String(badgeText).toUpperCase(),
          variant: config.badgeVariant || 'default',
        }
      }
    }

    return {
      value: item[config.valueField || 'id'],
      label,
      description,
      badge,
      metadata: item,
    }
  })

  return options
}

/**
 * Custom hook for async entity search with optional React Query integration
 */
export function useAsyncEntitySearch(
  config: EntitySearchConfig,
  options: UseAsyncEntitySearchOptions = {}
): UseAsyncEntitySearchReturn {
  const {
    minSearchLength = 1,
    enabled = true,
    enableReactQuery = false,
    staleTime = 60 * 1000, // 1 minute for entity searches
    gcTime = 5 * 60 * 1000, // 5 minutes
  } = options

  const [searchResults, setSearchResults] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentQuery, setCurrentQuery] = useState<string>("")

  // React Query version (optional)
  const reactQueryResult = useQuery({
    queryKey: ['entity-search', config.entityType, currentQuery, config.additionalFilters],
    queryFn: ({ signal }) => performEntitySearch(config, currentQuery),
    enabled: enableReactQuery && enabled && currentQuery.length >= minSearchLength,
    staleTime,
    gcTime,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Manual search function (maintains backward compatibility)
  const search = useCallback(async (query: string) => {
    if (!enabled) return
    
    setCurrentQuery(query)
    
    if (enableReactQuery) {
      // Let React Query handle the search
      return
    }

    // Legacy manual search implementation
    if (query.length < minSearchLength) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const options = await performEntitySearch(config, query)
      setSearchResults(options)
    } catch (err) {
      console.error('Entity search error:', err)
      const errorMessage = err instanceof Error ? err : new Error(String(err))
      setError(errorMessage)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [config, enabled, minSearchLength, enableReactQuery])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setError(null)
    setCurrentQuery("")
  }, [])

  const clearResults = useCallback(() => {
    setSearchResults([])
  }, [])

  // Use React Query results if enabled, otherwise use manual state
  const finalResults = enableReactQuery ? (reactQueryResult.data || []) : searchResults
  const finalIsLoading = enableReactQuery ? reactQueryResult.isLoading : isLoading
  const finalError = enableReactQuery ? reactQueryResult.error : error

  return {
    searchResults: finalResults,
    isLoading: finalIsLoading,
    error: finalError,
    search,
    clearSearch,
    clearResults,
    // React Query specific methods
    ...(enableReactQuery && {
      refetch: reactQueryResult.refetch,
      invalidateCache: () => {
        // This would be handled by the cache invalidation hooks
      },
    }),
  }
}

/**
 * Convenience hooks for common entity searches
 */
export const useOrganizationSearch = (options?: UseAsyncEntitySearchOptions) =>
  useAsyncEntitySearch(entitySearchConfigs.allOrganizations, options)

export const usePrincipalSearch = (options?: UseAsyncEntitySearchOptions) =>
  useAsyncEntitySearch(entitySearchConfigs.principalOrganizations, options)

export const useDistributorSearch = (options?: UseAsyncEntitySearchOptions) =>
  useAsyncEntitySearch(entitySearchConfigs.distributorOrganizations, options)

export const useContactSearch = (organizationId?: string, options?: UseAsyncEntitySearchOptions) => {
  const config = organizationId 
    ? {
        ...entitySearchConfigs.contactsByOrganization,
        additionalFilters: { 
          ...entitySearchConfigs.contactsByOrganization.additionalFilters,
          organization_id: organizationId 
        }
      }
    : entitySearchConfigs.allContacts
  
  return useAsyncEntitySearch(config, options)
}

export const useProductSearch = (options?: UseAsyncEntitySearchOptions) =>
  useAsyncEntitySearch(entitySearchConfigs.allProducts, options)

export const useOpportunitySearch = (options?: UseAsyncEntitySearchOptions) =>
  useAsyncEntitySearch(entitySearchConfigs.allOpportunities, options)