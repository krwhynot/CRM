/**
 * Enhanced Universal Filters with Organizations Integration
 * Provides universal filters with principal/manager data integration
 */

import { useMemo } from 'react'
import { useUniversalFilters } from './useUniversalFilters'
import { usePrincipals, useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import type { UniversalFilterState, EnhancedUniversalFilterState } from '@/types/filters.types'
import type { Organization } from '@/types/entities'

interface UseUniversalFiltersWithOrganizationsReturn
  extends ReturnType<typeof useUniversalFilters> {
  // Organization data
  principals: Organization[]
  managers: string[]
  isLoadingOrganizations: boolean

  // Enhanced filters with organization context
  enhancedFilters: EnhancedUniversalFilterState

  // Organization-specific filter functions
  updatePrincipal: (principalId: string) => void
  updateManager: (managerName: string) => void
  getPrincipalName: (principalId: string) => string
  getManagerOrganizations: (managerName: string) => Organization[]
}

export const useUniversalFiltersWithOrganizations = (
  initialFilters: Partial<UniversalFilterState> = {}
): UseUniversalFiltersWithOrganizationsReturn => {
  // Get base universal filters functionality
  const universalFilters = useUniversalFilters(initialFilters)

  // Fetch organization data
  const { data: principals = [], isLoading: isLoadingPrincipals } = usePrincipals()

  const { data: allOrganizations = [], isLoading: isLoadingAllOrganizations } = useOrganizations()

  const isLoadingOrganizations = isLoadingPrincipals || isLoadingAllOrganizations

  // Extract unique manager names from organizations
  const managers = useMemo(() => {
    const managerSet = new Set<string>()

    allOrganizations.forEach((org) => {
      // Extract manager names from organization data
      // This could be from a manager field, or derived from relationships
      if (org.notes) {
        // Look for manager mentions in notes
        const managerMatch = org.notes.match(/manager:\s*([^,\n]+)/i)
        if (managerMatch) {
          managerSet.add(managerMatch[1].trim())
        }
      }
    })

    return Array.from(managerSet).sort()
  }, [allOrganizations])

  // Create enhanced filters with organization context
  const enhancedFilters = useMemo(
    (): EnhancedUniversalFilterState => ({
      ...universalFilters.filters,
      selectedPrincipal:
        universalFilters.filters.principal !== 'all'
          ? universalFilters.filters.principal
          : undefined,
      selectedManager: undefined, // This would be tracked separately if needed
      principalFilters: {
        includeInactive: false,
        priorityFilter: 'all',
      },
    }),
    [universalFilters.filters]
  )

  // Organization-specific filter functions
  const updatePrincipal = (principalId: string) => {
    universalFilters.updateFilter('principal', principalId)
  }

  const updateManager = (managerName: string) => {
    // This could filter organizations by manager
    // For now, we'll use the principal filter as a proxy
    const managerOrganizations = allOrganizations.filter((org) =>
      org.notes?.toLowerCase().includes(`manager: ${managerName.toLowerCase()}`)
    )

    if (managerOrganizations.length > 0) {
      // Select the first organization as the principal filter
      universalFilters.updateFilter('principal', managerOrganizations[0].id)
    }
  }

  const getPrincipalName = (principalId: string): string => {
    const principal = principals.find((p) => p.id === principalId)
    return principal?.name || principalId
  }

  const getManagerOrganizations = (managerName: string): Organization[] => {
    return allOrganizations.filter((org) =>
      org.notes?.toLowerCase().includes(`manager: ${managerName.toLowerCase()}`)
    )
  }

  return {
    // Spread all base universal filters functionality
    ...universalFilters,

    // Organization data
    principals,
    managers,
    isLoadingOrganizations,

    // Enhanced filters
    enhancedFilters,

    // Organization-specific functions
    updatePrincipal,
    updateManager,
    getPrincipalName,
    getManagerOrganizations,
  }
}

/**
 * Hook for getting principal-specific filter suggestions
 */
export const usePrincipalFilterSuggestions = (principalId?: string) => {
  const { data: organizations = [] } = useOrganizations({
    is_principal: true,
  })

  return useMemo(() => {
    const principal = organizations.find((org) => org.id === principalId)

    if (!principal) return []

    const suggestions = []

    // Suggest time ranges based on principal activity patterns
    if (principal.type === 'principal') {
      suggestions.push({
        type: 'timeRange' as const,
        value: 'this_quarter',
        reason: 'Principals typically review quarterly performance',
      })
    }

    // Suggest focus based on principal priority
    if (principal.priority === 'high') {
      suggestions.push({
        type: 'focus' as const,
        value: 'high_priority',
        reason: 'High priority principal requires focused attention',
      })
    }

    // Suggest quick views based on principal segment
    if (principal.segment?.includes('food service')) {
      suggestions.push({
        type: 'quickView' as const,
        value: 'pipeline_movers',
        reason: 'Food service principals benefit from pipeline visibility',
      })
    }

    return suggestions
  }, [organizations, principalId])
}

/**
 * Hook for manager-based filtering
 */
export const useManagerFiltering = (managerName?: string) => {
  const { data: organizations = [] } = useOrganizations()

  return useMemo(() => {
    if (!managerName) return { organizations: [], principalIds: [] }

    const managerOrganizations = organizations.filter((org) =>
      org.notes?.toLowerCase().includes(`manager: ${managerName.toLowerCase()}`)
    )

    const principalIds = managerOrganizations.filter((org) => org.is_principal).map((org) => org.id)

    return {
      organizations: managerOrganizations,
      principalIds,
      count: managerOrganizations.length,
    }
  }, [organizations, managerName])
}
