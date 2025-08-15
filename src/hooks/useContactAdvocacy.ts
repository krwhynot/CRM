/**
 * Contact Advocacy Hooks - TanStack Query Integration
 * 
 * Provides React Query hooks that integrate with the Contact Advocacy Store
 * for optimal caching, error handling, and performance.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  useContactAdvocacyStore,
  useAdvocacyRelationships,
  useAdvocacyActions,
  useAdvocacyMetrics,
  type ContactAdvocacyRelationship,
  type AdvocacyFilters 
} from '@/stores/contactAdvocacyStore'
import type { 
  ContactPreferredPrincipalInsert,
  ContactPreferredPrincipalUpdate 
} from '@/types/entities'

// Query key factory for contact advocacy
export const contactAdvocacyKeys = {
  all: ['contact-advocacy'] as const,
  lists: () => [...contactAdvocacyKeys.all, 'list'] as const,
  list: (filters?: AdvocacyFilters) => [...contactAdvocacyKeys.lists(), { filters }] as const,
  details: () => [...contactAdvocacyKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactAdvocacyKeys.details(), id] as const,
  byContact: (contactId: string) => [...contactAdvocacyKeys.all, 'contact', contactId] as const,
  byPrincipal: (principalId: string) => [...contactAdvocacyKeys.all, 'principal', principalId] as const,
  metrics: () => [...contactAdvocacyKeys.all, 'metrics'] as const,
}

// Hook to fetch advocacy relationships with React Query caching
export function useAdvocacyRelationshipsQuery(filters?: AdvocacyFilters) {
  const { fetchRelationships } = useAdvocacyRelationships()
  
  return useQuery({
    queryKey: contactAdvocacyKeys.list(filters),
    queryFn: async () => {
      await fetchRelationships(filters)
      return useContactAdvocacyStore.getState().relationships
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to fetch advocacy relationships for a specific contact
export function useContactAdvocacyRelationships(contactId: string) {
  const store = useContactAdvocacyStore()
  
  return useQuery({
    queryKey: contactAdvocacyKeys.byContact(contactId),
    queryFn: () => store.actions.fetchRelationshipsByContact(contactId),
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch advocacy relationships for a specific principal
export function usePrincipalAdvocacyRelationships(principalId: string) {
  const store = useContactAdvocacyStore()
  
  return useQuery({
    queryKey: contactAdvocacyKeys.byPrincipal(principalId),
    queryFn: () => store.actions.fetchRelationshipsByPrincipal(principalId),
    enabled: !!principalId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch advocacy metrics
export function useAdvocacyMetricsQuery() {
  const { calculateMetrics } = useAdvocacyMetrics()
  
  return useQuery({
    queryKey: contactAdvocacyKeys.metrics(),
    queryFn: calculateMetrics,
    staleTime: 10 * 60 * 1000, // 10 minutes for metrics
  })
}

// Hook to create a new advocacy relationship
export function useCreateAdvocacyRelationship() {
  const queryClient = useQueryClient()
  const { createRelationship } = useAdvocacyActions()

  return useMutation({
    mutationFn: (data: ContactPreferredPrincipalInsert) => createRelationship(data),
    onSuccess: (newRelationship) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: contactAdvocacyKeys.lists() })
      queryClient.invalidateQueries({ 
        queryKey: contactAdvocacyKeys.byContact(newRelationship.contact_id) 
      })
      queryClient.invalidateQueries({ 
        queryKey: contactAdvocacyKeys.byPrincipal(newRelationship.principal_organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactAdvocacyKeys.metrics() })
      
      // Update the detail cache
      queryClient.setQueryData(
        contactAdvocacyKeys.detail(newRelationship.id), 
        newRelationship
      )
    },
    onError: (error) => {
      console.error('Failed to create advocacy relationship:', error)
    },
  })
}

// Hook to update an advocacy relationship
export function useUpdateAdvocacyRelationship() {
  const queryClient = useQueryClient()
  const { updateRelationship } = useAdvocacyActions()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ContactPreferredPrincipalUpdate }) => 
      updateRelationship(id, updates),
    onSuccess: (updatedRelationship) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: contactAdvocacyKeys.lists() })
      queryClient.invalidateQueries({ 
        queryKey: contactAdvocacyKeys.byContact(updatedRelationship.contact_id) 
      })
      queryClient.invalidateQueries({ 
        queryKey: contactAdvocacyKeys.byPrincipal(updatedRelationship.principal_organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactAdvocacyKeys.metrics() })
      
      // Update the detail cache
      queryClient.setQueryData(
        contactAdvocacyKeys.detail(updatedRelationship.id), 
        updatedRelationship
      )
    },
    onError: (error) => {
      console.error('Failed to update advocacy relationship:', error)
    },
  })
}

// Hook to delete an advocacy relationship
export function useDeleteAdvocacyRelationship() {
  const queryClient = useQueryClient()
  const { deleteRelationship } = useAdvocacyActions()

  return useMutation({
    mutationFn: (id: string) => deleteRelationship(id),
    onSuccess: (_, deletedId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: contactAdvocacyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactAdvocacyKeys.metrics() })
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: contactAdvocacyKeys.detail(deletedId) })
      
      // Invalidate contact and principal specific queries
      queryClient.invalidateQueries({ 
        queryKey: ['contact-advocacy', 'contact'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['contact-advocacy', 'principal'] 
      })
    },
    onError: (error) => {
      console.error('Failed to delete advocacy relationship:', error)
    },
  })
}

// Hook for bulk operations
export function useBulkUpdateAdvocacyStrength() {
  const queryClient = useQueryClient()
  const store = useContactAdvocacyStore()

  return useMutation({
    mutationFn: (relationships: Array<{ id: string; advocacy_strength: number }>) =>
      store.actions.bulkUpdateAdvocacyStrength(relationships),
    onSuccess: () => {
      // Invalidate all related queries after bulk update
      queryClient.invalidateQueries({ queryKey: contactAdvocacyKeys.all })
    },
    onError: (error) => {
      console.error('Failed to bulk update advocacy strengths:', error)
    },
  })
}

// Hook to validate advocacy assignment
export function useValidateAdvocacyAssignment() {
  const { validateAdvocacyAssignment } = useAdvocacyActions()

  return useMutation({
    mutationFn: ({ contactId, principalId }: { contactId: string; principalId: string }) =>
      validateAdvocacyAssignment(contactId, principalId),
    onError: (error) => {
      console.error('Failed to validate advocacy assignment:', error)
    },
  })
}

// Hook to compute advocacy score for a contact
export function useComputeAdvocacyScore() {
  const { computeAdvocacyScore } = useAdvocacyActions()
  
  return computeAdvocacyScore
}

// Utility hook for advocacy relationship management state
export function useAdvocacyRelationshipState() {
  const store = useContactAdvocacyStore()
  
  return {
    selectedRelationship: store.selectedRelationship,
    setSelectedRelationship: store.actions.setSelectedRelationship,
    isLoading: store.isLoading,
    isCreating: store.isCreating,
    isUpdating: store.isUpdating,
    isDeleting: store.isDeleting,
    error: store.error,
    clearError: store.actions.clearError,
  }
}

// Hook for advocacy filtering and search
export function useAdvocacyFiltering() {
  const store = useContactAdvocacyStore()
  
  return {
    filters: store.filters,
    searchQuery: store.searchQuery,
    setFilters: store.actions.setFilters,
    setSearchQuery: store.actions.setSearchQuery,
    clearFilters: store.actions.clearFilters,
    getFilteredRelationships: store.actions.getFilteredRelationships,
  }
}

// Advanced hook for advocacy analytics
export function useAdvocacyAnalytics() {
  const store = useContactAdvocacyStore()
  
  return {
    metrics: store.metrics,
    calculateMetrics: store.actions.calculateMetrics,
    getAdvocacyTrends: store.actions.getAdvocacyTrends,
  }
}

// Cache management hook
export function useAdvocacyCacheManagement() {
  const store = useContactAdvocacyStore()
  const queryClient = useQueryClient()
  
  return {
    invalidateCache: () => {
      store.actions.invalidateCache()
      queryClient.invalidateQueries({ queryKey: contactAdvocacyKeys.all })
    },
    refreshCache: store.actions.refreshCache,
    lastFetched: store.lastFetched,
    cacheTimeout: store.cacheTimeout,
  }
}

// contactAdvocacyKeys is already exported above