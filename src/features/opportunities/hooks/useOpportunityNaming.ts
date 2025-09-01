import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { OrganizationType } from '@/types/entities'
import { safeFindInArray, safeArrayAccess } from '@/lib/database-utils'

// Query key factory
export const opportunityNamingKeys = {
  all: ['opportunity-naming'] as const,
  principalNames: (ids: string[]) =>
    [...opportunityNamingKeys.all, 'principal-names', ids.sort()] as const,
  organizationName: (id: string) =>
    [...opportunityNamingKeys.all, 'organization-name', id] as const,
  principalValidation: (ids: string[]) =>
    [...opportunityNamingKeys.all, 'principal-validation', ids.sort()] as const,
  templates: () => [...opportunityNamingKeys.all, 'templates'] as const,
}

// Hook to fetch principal names by IDs
export function usePrincipalNames(principalIds: string[]) {
  return useQuery({
    queryKey: opportunityNamingKeys.principalNames(principalIds),
    queryFn: async () => {
      if (principalIds.length === 0) return []

      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .in('id', principalIds)
        .eq('type', 'principal')
        .is('deleted_at', null)

      if (error) throw error

      // Maintain order based on input array with safe data access
      const safeData = safeArrayAccess(data, 'fetch principal names')
      const orderedNames = principalIds
        .map((id) => safeFindInArray(safeData, (org) => org.id === id, 'find principal by id')?.name)
        .filter((name): name is string => Boolean(name))

      return orderedNames
    },
    enabled: principalIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes - names don't change often
  })
}

// Hook to fetch organization name by ID
export function useOrganizationName(organizationId: string) {
  return useQuery({
    queryKey: opportunityNamingKeys.organizationName(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', organizationId)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data.name
    },
    enabled: !!organizationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to validate principal IDs
export function useValidatePrincipals(principalIds: string[]) {
  return useQuery({
    queryKey: opportunityNamingKeys.principalValidation(principalIds),
    queryFn: async () => {
      if (principalIds.length === 0) {
        return { valid: true, invalid_ids: [] }
      }

      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .in('id', principalIds)
        .eq('type', 'principal')
        .is('deleted_at', null)

      if (error) {
        return {
          valid: false,
          invalid_ids: principalIds,
        }
      }

      const safeData = safeArrayAccess(data, 'validate principals')
      const validIds = safeData.map((org) => org.id)
      const invalidIds = principalIds.filter((id) => !validIds.includes(id))

      return {
        valid: invalidIds.length === 0,
        invalid_ids: invalidIds,
      }
    },
    enabled: principalIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Type for organization with basic info needed for naming
export interface OrganizationBasic {
  id: string
  name: string
  type: OrganizationType
}

// Hook to fetch both organization and principal names in a single query
export function useNamingData(organizationId: string, principalIds: string[]) {
  return useQuery({
    queryKey: [...opportunityNamingKeys.all, 'naming-data', organizationId, principalIds.sort()],
    queryFn: async () => {
      const queries = []

      // Fetch organization if ID provided
      if (organizationId) {
        queries.push(
          supabase
            .from('organizations')
            .select('id, name, type')
            .eq('id', organizationId)
            .is('deleted_at', null)
            .single()
            .then((result) => ({ type: 'organization', ...result }))
        )
      }

      // Fetch principals if IDs provided
      if (principalIds.length > 0) {
        queries.push(
          supabase
            .from('organizations')
            .select('id, name, type')
            .in('id', principalIds)
            .eq('type', 'principal')
            .is('deleted_at', null)
            .then((result) => ({ type: 'principals', ...result }))
        )
      }

      const results = await Promise.all(queries)

      let organizationName = ''
      let principalNames: string[] = []

      results.forEach((result) => {
        if (result.error) {
          throw result.error
        }

        if (result.type === 'organization' && result.data && 'name' in result.data) {
          organizationName = result.data.name
        } else if (result.type === 'principals' && result.data && Array.isArray(result.data)) {
          // Maintain order based on input array with safe data access
          const safeResultData = safeArrayAccess(result.data as OrganizationBasic[], 'naming data principals')
          principalNames = principalIds
            .map(
              (id) =>
                safeFindInArray(safeResultData, (org: OrganizationBasic) => org.id === id, 'find principal in naming data')
                  ?.name
            )
            .filter((name): name is string => Boolean(name))
        }
      })

      return {
        organizationName,
        principalNames,
      }
    },
    enabled: !!organizationId || principalIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for bulk organization/principal lookups (useful for batch operations)
export function useBulkOrganizationLookup(organizationIds: string[]) {
  return useQuery({
    queryKey: [...opportunityNamingKeys.all, 'bulk-organizations', organizationIds.sort()],
    queryFn: async () => {
      if (organizationIds.length === 0) return {}

      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, type')
        .in('id', organizationIds)
        .is('deleted_at', null)

      if (error) throw error

      // Return as a lookup map for easy access with safe data handling
      const lookup: Record<string, { name: string; type: OrganizationType }> = {}
      const safeData = safeArrayAccess(data, 'bulk organization lookup')
      safeData.forEach((org) => {
        lookup[org.id] = { name: org.name, type: org.type as OrganizationType }
      })

      return lookup
    },
    enabled: organizationIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Helper hook to invalidate all naming-related caches
export function useInvalidateNamingCache() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: opportunityNamingKeys.all })
  }
}

// Types for naming templates (if stored server-side in the future)
export interface NamingTemplate {
  id: string
  name: string
  pattern: string
  context_types: string[]
  max_length: number
  supports_multi_principal: boolean
  description: string
}

// Hook to fetch naming templates (placeholder for future server-side templates)
export function useNamingTemplates() {
  return useQuery({
    queryKey: opportunityNamingKeys.templates(),
    queryFn: async (): Promise<NamingTemplate[]> => {
      // For now, return empty array - templates are handled client-side
      // In the future, this could fetch from a templates table
      return []
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - templates rarely change
  })
}

// Hook to create a custom naming template (placeholder for future server-side storage)
export function useCreateNamingTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (template: Omit<NamingTemplate, 'id'>) => {
      // For now, this is a no-op since templates are client-side
      // In the future, this could insert into a templates table
      const newTemplate: NamingTemplate = {
        ...template,
        id: `custom-${Date.now()}`,
      }
      return newTemplate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityNamingKeys.templates() })
    },
  })
}

// Utility type for common naming data requirements
export interface NamingDataRequirements {
  organizationId?: string
  principalIds?: string[]
  validatePrincipals?: boolean
}

// Comprehensive hook that fetches all naming data needs
export function useCompleteNamingData({
  organizationId,
  principalIds = [],
  validatePrincipals = false,
}: NamingDataRequirements) {
  const organizationNameQuery = useOrganizationName(organizationId || '')
  const principalNamesQuery = usePrincipalNames(principalIds)
  const principalValidationQuery = useValidatePrincipals(validatePrincipals ? principalIds : [])

  return {
    organizationName: organizationNameQuery.data || '',
    principalNames: principalNamesQuery.data || [],
    principalValidation: principalValidationQuery.data,
    isLoading:
      organizationNameQuery.isLoading ||
      principalNamesQuery.isLoading ||
      principalValidationQuery.isLoading,
    error:
      organizationNameQuery.error || principalNamesQuery.error || principalValidationQuery.error,
    isReady:
      !organizationNameQuery.isLoading &&
      !principalNamesQuery.isLoading &&
      (!validatePrincipals || !principalValidationQuery.isLoading),
  }
}
