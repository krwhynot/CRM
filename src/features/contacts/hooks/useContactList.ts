/**
 * Contact List Hook
 *
 * Feature-specific adapter that uses generic entity hooks for contact management.
 * Provides contact-specific filtering, sorting, and relationship intelligence.
 */

import { useMemo } from 'react'
import {
  useEntityList,
  useEntityActions,
  useEntityFilters,
  createEntityListConfig,
  createEntityActionsConfig,
  type BaseFilters,
} from '@/hooks/entity'
import type { Contact, ContactFilters, ContactWithOrganization } from '@/types/entities'

// Extended contact interface with computed fields
export interface ContactWithContext extends ContactWithOrganization {
  // Decision authority tracking
  decision_authority?: string
  decision_authority_level?: 'high' | 'medium' | 'low'
  purchase_influence?: string
  purchase_influence_score?: number
  budget_authority?: boolean
  technical_authority?: boolean
  user_authority?: boolean

  // Interaction context
  recent_interactions_count?: number
  last_interaction_date?: string | Date
  interaction_frequency?: number
  preferred_communication_method?: string

  // Relationship context
  needs_follow_up?: boolean
  high_value_contact?: boolean
  champion_potential?: number
  relationship_strength?: 'strong' | 'medium' | 'weak'

  // Organization context
  organization_name?: string
  organization_type?: string
  organization_segment?: string
  organization_priority?: string

  // Weekly context
  engaged_this_week?: boolean
  opportunity_involvement?: number
  contact_temperature?: 'hot' | 'warm' | 'cold'

  // Preferred principals
  preferred_principals?: Array<{
    id: string
    name: string
    relationship_strength?: number
  }>

  // Contact quality metrics
  completeness_score?: number
  data_freshness_days?: number
}

// Contact-specific filters extending base filters
export interface ContactListFilters extends BaseFilters {
  organization_id?: string
  organization_type?: string | string[]
  organization_segment?: string | string[]
  role?: string | string[]
  department?: string | string[]
  decision_authority?: string | string[]
  is_primary_contact?: boolean
  has_email?: boolean
  has_phone?: boolean
  last_interaction_days?: number
  relationship_strength?: string | string[]
  champion_potential_min?: number
  quickView?:
    | 'decision_makers'
    | 'champions'
    | 'new_contacts'
    | 'needs_follow_up'
    | 'incomplete_data'
    | 'none'
  timeRange?: 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'all'
  preferred_principal?: string | string[]
}

// Query key factory for contacts
const contactQueryKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactQueryKeys.all, 'list'] as const,
  list: (filters?: ContactListFilters) => [...contactQueryKeys.lists(), { filters }] as const,
  details: () => [...contactQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactQueryKeys.details(), id] as const,
}

// Create contact list configuration
const contactListConfig = createEntityListConfig<ContactWithContext>('contacts', 'contacts', {
  queryKeyFactory: contactQueryKeys,
  select: `
      *,
      organization:organizations!contacts_organization_id_fkey(
        id,
        name,
        organization_type,
        segment,
        priority_rating,
        city,
        state_province
      ),
      interactions(
        id,
        interaction_date,
        interaction_type,
        created_at
      ),
      opportunity_contacts(
        opportunity:opportunities(
          id,
          name,
          stage,
          value,
          close_date
        )
      ),
      contact_preferred_principals(
        principal_organization:organizations!contact_preferred_principals_principal_organization_id_fkey(
          id,
          name
        )
      )
    `,
  defaultSort: {
    column: 'last_name',
    direction: 'asc',
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// Create contact actions configuration
const contactActionsConfig = createEntityActionsConfig<ContactWithContext>(
  'contacts',
  'contact',
  contactQueryKeys,
  {
    softDelete: true,
    optimisticUpdates: true,
    bulkOperations: true,
  }
)

/**
 * Hook for managing contact lists with relationship intelligence
 */
export function useContactList(
  initialFilters?: Partial<ContactListFilters>,
  options?: {
    includeDeleted?: boolean
    autoRefresh?: boolean
    onFiltersChange?: (filters: ContactListFilters) => void
  }
) {
  // Default filters with contact-specific business logic
  const defaultFilters: ContactListFilters = {
    search: '',
    orderBy: 'last_name',
    orderDirection: 'asc',
    quickView: 'none',
    timeRange: 'all',
    limit: 100,
    ...initialFilters,
  }

  // Use generic entity list hook
  const listResult = useEntityList<ContactWithContext, ContactListFilters>(contactListConfig, {
    initialFilters: defaultFilters,
    includeDeleted: options?.includeDeleted,
    onFiltersChange: options?.onFiltersChange,
    refetchInterval: options?.autoRefresh ? 60000 : undefined, // 1 minute refresh
  })

  // Use generic entity actions
  const actionsResult = useEntityActions<ContactWithContext>(listResult.data, contactActionsConfig)

  // Custom filtering logic for contacts
  const customFilterFn = (contact: ContactWithContext, filters: ContactListFilters): boolean => {
    // Organization filters
    if (filters.organization_id && contact.organization_id !== filters.organization_id) {
      return false
    }

    if (filters.organization_type) {
      const types = Array.isArray(filters.organization_type)
        ? filters.organization_type
        : [filters.organization_type]
      if (
        !contact.organization?.organization_type ||
        !types.includes(contact.organization.organization_type)
      ) {
        return false
      }
    }

    if (filters.organization_segment) {
      const segments = Array.isArray(filters.organization_segment)
        ? filters.organization_segment
        : [filters.organization_segment]
      if (!contact.organization?.segment || !segments.includes(contact.organization.segment)) {
        return false
      }
    }

    // Contact role and department filters
    if (filters.role) {
      const roles = Array.isArray(filters.role) ? filters.role : [filters.role]
      if (!contact.role || !roles.includes(contact.role)) return false
    }

    if (
      filters.department &&
      (!contact.department ||
        !contact.department.toLowerCase().includes(filters.department.toLowerCase()))
    ) {
      return false
    }

    // Decision authority filter
    if (filters.decision_authority) {
      const authorities = Array.isArray(filters.decision_authority)
        ? filters.decision_authority
        : [filters.decision_authority]
      if (!contact.decision_authority || !authorities.includes(contact.decision_authority)) {
        return false
      }
    }

    // Contact data completeness filters
    if (
      filters.is_primary_contact !== undefined &&
      contact.is_primary_contact !== filters.is_primary_contact
    ) {
      return false
    }

    if (filters.has_email !== undefined) {
      const hasEmail = !!contact.email
      if (filters.has_email !== hasEmail) return false
    }

    if (filters.has_phone !== undefined) {
      const hasPhone = !!(contact.phone || contact.mobile_phone)
      if (filters.has_phone !== hasPhone) return false
    }

    // Relationship strength filter
    if (filters.relationship_strength) {
      const strengths = Array.isArray(filters.relationship_strength)
        ? filters.relationship_strength
        : [filters.relationship_strength]
      if (!contact.relationship_strength || !strengths.includes(contact.relationship_strength)) {
        return false
      }
    }

    // Champion potential filter
    if (
      filters.champion_potential_min &&
      (!contact.champion_potential || contact.champion_potential < filters.champion_potential_min)
    ) {
      return false
    }

    // Quick view filters
    if (filters.quickView && filters.quickView !== 'none') {
      switch (filters.quickView) {
        case 'decision_makers':
          return (
            contact.decision_authority_level === 'high' ||
            contact.budget_authority ||
            contact.is_primary_contact
          )
        case 'champions':
          return (
            (contact.champion_potential || 0) >= 70 || contact.relationship_strength === 'strong'
          )
        case 'new_contacts':
          if (contact.created_at) {
            const daysOld = Math.ceil(
              (Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24)
            )
            return daysOld <= 7
          }
          return false
        case 'needs_follow_up':
          return contact.needs_follow_up || false
        case 'incomplete_data':
          return (contact.completeness_score || 0) < 70
      }
    }

    // Last interaction filter
    if (filters.last_interaction_days && contact.last_interaction_date) {
      const daysSinceInteraction = Math.ceil(
        (Date.now() - new Date(contact.last_interaction_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceInteraction > filters.last_interaction_days) return false
    }

    // Preferred principal filter
    if (filters.preferred_principal) {
      const principals = Array.isArray(filters.preferred_principal)
        ? filters.preferred_principal
        : [filters.preferred_principal]
      const contactPrincipals = contact.preferred_principals?.map((p) => p.id) || []
      if (!principals.some((p) => contactPrincipals.includes(p))) {
        return false
      }
    }

    return true
  }

  // Use advanced filters with contact-specific logic
  const filtersResult = useEntityFilters<ContactListFilters, ContactWithContext>(
    listResult.data,
    {
      defaultFilters,
      persistFilters: true,
      filterKey: 'contacts',
      onFiltersChange: options?.onFiltersChange,
    },
    customFilterFn
  )

  // Compute enhanced contact data with intelligence
  const enhancedContacts = useMemo(() => {
    return filtersResult.filteredData.map((contact) => {
      // Calculate metrics from related data
      const interactions = (contact as any).interactions || []
      const opportunities =
        (contact as any).opportunity_contacts?.map((oc: any) => oc.opportunity) || []
      const preferredPrincipals =
        (contact as any).contact_preferred_principals?.map((cpp: any) => ({
          id: cpp.principal_organization.id,
          name: cpp.principal_organization.name,
        })) || []

      // Calculate interaction metrics
      const lastInteraction =
        interactions.length > 0
          ? interactions.sort(
              (a: any, b: any) =>
                new Date(b.interaction_date).getTime() - new Date(a.interaction_date).getTime()
            )[0]
          : null

      const recentInteractions = interactions.filter((int: any) => {
        const daysAgo = Math.ceil(
          (Date.now() - new Date(int.interaction_date).getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysAgo <= 30
      })

      // Calculate completeness score
      const requiredFields = ['first_name', 'last_name', 'email', 'title', 'organization_id']
      const optionalFields = ['phone', 'mobile_phone', 'department', 'notes']

      const requiredComplete = requiredFields.filter(
        (field) => contact[field as keyof ContactWithContext]
      ).length
      const optionalComplete = optionalFields.filter(
        (field) => contact[field as keyof ContactWithContext]
      ).length
      const completenessScore = Math.round(
        (requiredComplete / requiredFields.length) * 70 +
          (optionalComplete / optionalFields.length) * 30
      )

      // Calculate data freshness
      const dataFreshnessDays = contact.updated_at
        ? Math.ceil((Date.now() - new Date(contact.updated_at).getTime()) / (1000 * 60 * 60 * 24))
        : 365

      // Determine decision authority level
      const decisionAuthorityLevel =
        contact.is_primary_contact || contact.budget_authority
          ? 'high'
          : contact.technical_authority || contact.user_authority
            ? 'medium'
            : 'low'

      // Calculate champion potential
      const championPotential = Math.min(
        100,
        (contact.is_primary_contact ? 40 : 0) +
          recentInteractions.length * 5 +
          opportunities.length * 10 +
          completenessScore * 0.3
      )

      // Determine relationship strength
      const relationshipStrength =
        championPotential > 70 ? 'strong' : championPotential > 40 ? 'medium' : 'weak'

      // Calculate contact temperature
      const daysSinceLastInteraction = lastInteraction
        ? Math.ceil(
            (Date.now() - new Date(lastInteraction.interaction_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 365

      const contactTemperature =
        daysSinceLastInteraction <= 7 ? 'hot' : daysSinceLastInteraction <= 30 ? 'warm' : 'cold'

      // Determine flags
      const needsFollowUp = daysSinceLastInteraction > 14 && opportunities.length > 0
      const highValueContact =
        championPotential > 70 || opportunities.some((opp: any) => (opp.value || 0) > 50000)
      const engagedThisWeek = daysSinceLastInteraction <= 7

      return {
        ...contact,
        organization_name: contact.organization?.name,
        organization_type: contact.organization?.organization_type,
        organization_segment: contact.organization?.segment,
        organization_priority: contact.organization?.priority_rating,
        recent_interactions_count: recentInteractions.length,
        last_interaction_date: lastInteraction?.interaction_date,
        interaction_frequency: interactions.length,
        opportunity_involvement: opportunities.length,
        completeness_score: completenessScore,
        data_freshness_days: dataFreshnessDays,
        decision_authority_level: decisionAuthorityLevel,
        champion_potential: championPotential,
        relationship_strength: relationshipStrength,
        contact_temperature: contactTemperature,
        needs_follow_up: needsFollowUp,
        high_value_contact: highValueContact,
        engaged_this_week: engagedThisWeek,
        preferred_principals: preferredPrincipals,
      } as ContactWithContext
    })
  }, [filtersResult.filteredData])

  return {
    // Data
    contacts: listResult.data,
    filteredContacts: enhancedContacts,

    // State
    isLoading: listResult.isLoading,
    isError: listResult.isError,
    error: listResult.error,

    // Filtering
    filters: filtersResult.filters,
    setFilters: filtersResult.setFilters,
    clearFilters: filtersResult.clearFilters,
    hasActiveFilters: filtersResult.hasActiveFilters,

    // Actions
    actions: actionsResult,

    // Utilities
    refetch: listResult.refetch,
    invalidateList: listResult.invalidateList,
  }
}

/**
 * Hook for contact relationship intelligence and metrics
 */
export function useContactMetrics(contacts: ContactWithContext[]) {
  return useMemo(() => {
    const total = contacts.length

    const byDecisionAuthority = contacts.reduce(
      (acc, contact) => {
        const level = contact.decision_authority_level || 'low'
        acc[level] = (acc[level] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const byRelationshipStrength = contacts.reduce(
      (acc, contact) => {
        const strength = contact.relationship_strength || 'weak'
        acc[strength] = (acc[strength] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const byTemperature = contacts.reduce(
      (acc, contact) => {
        const temp = contact.contact_temperature || 'cold'
        acc[temp] = (acc[temp] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const primaryContacts = contacts.filter((c) => c.is_primary_contact).length
    const decisionMakers = contacts.filter((c) => c.decision_authority_level === 'high').length
    const champions = contacts.filter((c) => (c.champion_potential || 0) > 70).length
    const highValue = contacts.filter((c) => c.high_value_contact).length
    const needsFollowUp = contacts.filter((c) => c.needs_follow_up).length
    const incompleteData = contacts.filter((c) => (c.completeness_score || 0) < 70).length

    const averageCompleteness =
      total > 0 ? contacts.reduce((sum, c) => sum + (c.completeness_score || 0), 0) / total : 0

    const averageChampionPotential =
      total > 0 ? contacts.reduce((sum, c) => sum + (c.champion_potential || 0), 0) / total : 0

    return {
      total,
      byDecisionAuthority,
      byRelationshipStrength,
      byTemperature,
      primaryContacts,
      decisionMakers,
      champions,
      highValue,
      needsFollowUp,
      incompleteData,
      averageCompleteness,
      averageChampionPotential,
      dataQualityScore: averageCompleteness,
      relationshipHealthScore: averageChampionPotential,
    }
  }, [contacts])
}
