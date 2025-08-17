import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import type { SelectOption } from "../types"

export type EntityType = 'organizations' | 'contacts' | 'products' | 'opportunities' | 'interactions'

export interface UseSearchCacheInvalidationReturn {
  invalidateEntitySearches: (entityType: EntityType) => void
  invalidateAllSearches: () => void
  optimisticallyAddToSearches: (entityType: EntityType, newOption: SelectOption) => void
  optimisticallyUpdateSearches: (entityType: EntityType, updatedOption: SelectOption) => void
  optimisticallyRemoveFromSearches: (entityType: EntityType, optionValue: string) => void
}

/**
 * Hook for managing search cache invalidation and optimistic updates
 * when entities are created, updated, or deleted
 */
export function useSearchCacheInvalidation(): UseSearchCacheInvalidationReturn {
  const queryClient = useQueryClient()

  // Invalidate all search caches for a specific entity type
  const invalidateEntitySearches = useCallback((entityType: EntityType) => {
    // Invalidate dynamic select searches for this entity
    queryClient.invalidateQueries({ 
      queryKey: ['dynamic-select', 'search'], 
      predicate: (query) => {
        // Check if the query key contains references to this entity type
        const queryKey = query.queryKey
        return queryKey.some(key => 
          typeof key === 'string' && 
          (key.includes(entityType) || key.includes('all'))
        )
      }
    })

    // Invalidate async entity searches
    queryClient.invalidateQueries({ 
      queryKey: ['entity-search', entityType] 
    })

    // Invalidate any specific entity type searches
    queryClient.invalidateQueries({ 
      queryKey: [entityType] 
    })
  }, [queryClient])

  // Invalidate all search caches
  const invalidateAllSearches = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['dynamic-select', 'search'] 
    })
    queryClient.invalidateQueries({ 
      queryKey: ['entity-search'] 
    })
  }, [queryClient])

  // Optimistically add a new option to relevant search caches
  const optimisticallyAddToSearches = useCallback((entityType: EntityType, newOption: SelectOption) => {
    // Update all search caches that might contain this entity type
    queryClient.setQueriesData(
      { 
        queryKey: ['dynamic-select', 'search'],
        predicate: (query) => {
          const queryKey = query.queryKey
          return queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes(entityType) || key.includes('all'))
          )
        }
      },
      (oldData: SelectOption[] | undefined) => {
        if (!oldData) return [newOption]
        
        // Add new option at the beginning and remove duplicates
        const filtered = oldData.filter(option => option.value !== newOption.value)
        return [newOption, ...filtered]
      }
    )
  }, [queryClient])

  // Optimistically update an existing option in search caches
  const optimisticallyUpdateSearches = useCallback((entityType: EntityType, updatedOption: SelectOption) => {
    queryClient.setQueriesData(
      { 
        queryKey: ['dynamic-select', 'search'],
        predicate: (query) => {
          const queryKey = query.queryKey
          return queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes(entityType) || key.includes('all'))
          )
        }
      },
      (oldData: SelectOption[] | undefined) => {
        if (!oldData) return [updatedOption]
        
        // Replace the existing option with the updated one
        return oldData.map(option => 
          option.value === updatedOption.value ? updatedOption : option
        )
      }
    )
  }, [queryClient])

  // Optimistically remove an option from search caches
  const optimisticallyRemoveFromSearches = useCallback((entityType: EntityType, optionValue: string) => {
    queryClient.setQueriesData(
      { 
        queryKey: ['dynamic-select', 'search'],
        predicate: (query) => {
          const queryKey = query.queryKey
          return queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes(entityType) || key.includes('all'))
          )
        }
      },
      (oldData: SelectOption[] | undefined) => {
        if (!oldData) return []
        
        // Remove the option from the list
        return oldData.filter(option => option.value !== optionValue)
      }
    )
  }, [queryClient])

  return {
    invalidateEntitySearches,
    invalidateAllSearches,
    optimisticallyAddToSearches,
    optimisticallyUpdateSearches,
    optimisticallyRemoveFromSearches,
  }
}

/**
 * Utility to create entity-specific cache invalidation hooks
 */
export function createEntityCacheInvalidation(entityType: EntityType) {
  return function useEntityCacheInvalidation() {
    const {
      invalidateEntitySearches,
      optimisticallyAddToSearches,
      optimisticallyUpdateSearches,
      optimisticallyRemoveFromSearches,
    } = useSearchCacheInvalidation()

    return {
      invalidateSearches: () => invalidateEntitySearches(entityType),
      optimisticallyAdd: (newOption: SelectOption) => optimisticallyAddToSearches(entityType, newOption),
      optimisticallyUpdate: (updatedOption: SelectOption) => optimisticallyUpdateSearches(entityType, updatedOption),
      optimisticallyRemove: (optionValue: string) => optimisticallyRemoveFromSearches(entityType, optionValue),
    }
  }
}

// Pre-created hooks for common entity types
export const useOrganizationCacheInvalidation = createEntityCacheInvalidation('organizations')
export const useContactCacheInvalidation = createEntityCacheInvalidation('contacts')
export const useProductCacheInvalidation = createEntityCacheInvalidation('products')
export const useOpportunityCacheInvalidation = createEntityCacheInvalidation('opportunities')
export const useInteractionCacheInvalidation = createEntityCacheInvalidation('interactions')