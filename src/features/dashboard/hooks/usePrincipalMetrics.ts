import React from 'react'
import { useOpportunities } from '@/hooks/useOpportunities'
import { useInteractions } from '@/hooks/useInteractions'
import type { Organization, OpportunityWithRelations, InteractionWithRelations } from '@/types/entities'

interface PrincipalMetrics {
  opportunityCount: number
  interactionCount: number
  lastActivity: Date | null
  totalValue: number
  activeOpportunities: number
}

interface UsePrincipalMetricsReturn {
  metrics: PrincipalMetrics
  isLoading: boolean
  hasError: boolean
}

/**
 * Calculates comprehensive metrics for a principal organization
 */
const calculatePrincipalMetrics = (
  principal: Organization,
  opportunities: OpportunityWithRelations[],
  interactions: InteractionWithRelations[]
): PrincipalMetrics => {
  // Filter opportunities where this organization is the principal
  const principalOpportunities = opportunities.filter(
    (opp) => opp.principal_organization_id === principal.id
  )

  // Filter interactions related to this principal's opportunities
  const principalInteractions = interactions.filter((interaction) =>
    principalOpportunities.some((opp) => opp.id === interaction.opportunity_id)
  )

  // Find the most recent interaction
  const lastActivity = principalInteractions.length > 0
    ? principalInteractions
        .map((interaction) => new Date(interaction.interaction_date))
        .sort((a, b) => b.getTime() - a.getTime())[0]
    : null

  // Calculate total estimated value
  const totalValue = principalOpportunities.reduce(
    (sum, opp) => sum + (opp.estimated_value || 0),
    0
  )

  // Count active opportunities (not closed)
  const activeOpportunities = principalOpportunities.filter(
    (opp) => !['closed_won', 'closed_lost'].includes(opp.stage)
  ).length

  return {
    opportunityCount: principalOpportunities.length,
    interactionCount: principalInteractions.length,
    lastActivity,
    totalValue,
    activeOpportunities
  }
}

export const usePrincipalMetrics = (principal: Organization): UsePrincipalMetricsReturn => {
  // Fetch opportunities with filtering for performance
  const { 
    data: opportunities = [], 
    isLoading: opportunitiesLoading,
    error: opportunitiesError
  } = useOpportunities({ principal_organization_id: principal.id })

  // Fetch interactions - we'll filter client-side for related opportunities
  const { 
    data: interactions = [], 
    isLoading: interactionsLoading,
    error: interactionsError
  } = useInteractions()

  // Calculate loading state
  const isLoading = opportunitiesLoading || interactionsLoading

  // Calculate error state
  const hasError = !!opportunitiesError || !!interactionsError

  // Calculate metrics
  const metrics = React.useMemo(() => 
    calculatePrincipalMetrics(principal, opportunities, interactions),
    [principal, opportunities, interactions]
  )

  return {
    metrics,
    isLoading,
    hasError
  }
}