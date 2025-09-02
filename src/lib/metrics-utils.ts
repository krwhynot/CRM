import type {
  Organization,
  Contact,
  Product,
  OpportunityWithRelations,
  InteractionWithRelations,
  OpportunityStage,
  InteractionType,
  PriorityLevel,
} from '@/types/entities'
import { mapStringSizeToPriority } from '@/lib/enum-guards'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GrowthMetrics {
  organizationsGrowth: number
  contactsGrowth: number
  opportunitiesGrowth: number
  pipelineValueGrowth: number
  interactionsGrowth: number
  principalsGrowth: number
  distributorsGrowth: number
}

export interface OpportunityMetrics {
  total: number
  active: number
  totalPipelineValue: number
  activePipelineValue: number
  conversionRate: number
  averageValue: number
  averageProbability: number
  byStage: Record<OpportunityStage, number>
  byPriority: Record<PriorityLevel, number>
  stageValues: Record<OpportunityStage, number>
  priorityValues: Record<PriorityLevel, number>
}

export interface PrincipalMetrics {
  total: number
  byPriority: Record<PriorityLevel, number>
  withActiveOpportunities: number
  averageOpportunitiesPerPrincipal: number
  topByPipelineValue: Array<{
    id: string
    name: string
    totalValue: number
    opportunityCount: number
  }>
}

export interface InteractionMetrics {
  total: number
  recentCount: number
  thisWeekCount: number
  thisMonthCount: number
  byType: Record<InteractionType, number>
  averagePerOpportunity: number
  followUpRequired: number
  lastActivityDate: Date | null
}

export interface TimeRange {
  from: Date
  to: Date
}

export interface MetricsFilters {
  timeRange?: TimeRange
  principalIds?: string[]
  organizationIds?: string[]
  includeInactive?: boolean
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safe date conversion with null handling
 */
export function safeDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  try {
    return new Date(dateString)
  } catch {
    return null
  }
}

/**
 * Get date ranges for different periods
 */
export function getDateRanges() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Current week (Monday to Sunday)
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const currentWeekEnd = new Date(currentWeekStart)
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6)

  // Current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Previous month
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  // Last 30 days
  const last30DaysStart = new Date(today)
  last30DaysStart.setDate(today.getDate() - 30)

  return {
    thisWeek: { from: currentWeekStart, to: currentWeekEnd },
    thisMonth: { from: currentMonthStart, to: currentMonthEnd },
    previousMonth: { from: previousMonthStart, to: previousMonthEnd },
    last30Days: { from: last30DaysStart, to: today },
  }
}

/**
 * Filter data by date range with null-safe handling
 */
export function filterByDateRange<T extends { created_at: string | null }>(
  data: T[],
  timeRange: TimeRange
): T[] {
  return data.filter((item) => {
    const itemDate = safeDate(item.created_at)
    if (!itemDate) return false
    return itemDate >= timeRange.from && itemDate <= timeRange.to
  })
}

/**
 * Calculate percentage growth between two values
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// ============================================================================
// CORE METRICS CALCULATIONS
// ============================================================================

/**
 * Calculate comprehensive opportunity metrics
 */
export function calculateOpportunityMetrics(
  opportunities: OpportunityWithRelations[],
  filters?: MetricsFilters
): OpportunityMetrics {
  if (!opportunities?.length) {
    return {
      total: 0,
      active: 0,
      totalPipelineValue: 0,
      activePipelineValue: 0,
      conversionRate: 0,
      averageValue: 0,
      averageProbability: 0,
      byStage: {} as Record<OpportunityStage, number>,
      byPriority: {} as Record<PriorityLevel, number>,
      stageValues: {} as Record<OpportunityStage, number>,
      priorityValues: {} as Record<PriorityLevel, number>,
    }
  }

  // Apply filters
  let filteredOpportunities = opportunities
  if (filters?.principalIds?.length) {
    filteredOpportunities = filteredOpportunities.filter(
      (opp) =>
        opp.principal_organization_id &&
        filters.principalIds!.includes(opp.principal_organization_id)
    )
  }

  // Define active and closed stages
  const closedStages: OpportunityStage[] = ['Closed - Won', 'Closed - Lost']
  const activeOpportunities = filteredOpportunities.filter(
    (opp) => !closedStages.includes(opp.stage)
  )
  const wonOpportunities = filteredOpportunities.filter((opp) => opp.stage === 'Closed - Won')

  // Calculate basic metrics
  const total = filteredOpportunities.length
  const active = activeOpportunities.length
  const totalPipelineValue = filteredOpportunities.reduce(
    (sum, opp) => sum + (opp.estimated_value || 0),
    0
  )
  const activePipelineValue = activeOpportunities.reduce(
    (sum, opp) => sum + (opp.estimated_value || 0),
    0
  )
  const conversionRate = total > 0 ? (wonOpportunities.length / total) * 100 : 0
  const averageValue = total > 0 ? totalPipelineValue / total : 0
  const averageProbability =
    total > 0
      ? filteredOpportunities.reduce((sum, opp) => sum + (opp.probability || 0), 0) / total
      : 0

  // Calculate breakdowns
  const byStage = filteredOpportunities.reduce(
    (acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1
      return acc
    },
    {} as Record<OpportunityStage, number>
  )

  const byPriority = filteredOpportunities.reduce(
    (acc, opp) => {
      if (opp.priority) {
        acc[opp.priority] = (acc[opp.priority] || 0) + 1
      }
      return acc
    },
    {} as Record<PriorityLevel, number>
  )

  const stageValues = filteredOpportunities.reduce(
    (acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + (opp.estimated_value || 0)
      return acc
    },
    {} as Record<OpportunityStage, number>
  )

  const priorityValues = filteredOpportunities.reduce(
    (acc, opp) => {
      if (opp.priority) {
        acc[opp.priority] = (acc[opp.priority] || 0) + (opp.estimated_value || 0)
      }
      return acc
    },
    {} as Record<PriorityLevel, number>
  )

  return {
    total,
    active,
    totalPipelineValue,
    activePipelineValue,
    conversionRate,
    averageValue,
    averageProbability,
    byStage,
    byPriority,
    stageValues,
    priorityValues,
  }
}

/**
 * Calculate principal-specific metrics
 */
export function calculatePrincipalMetrics(
  organizations: Organization[],
  opportunities: OpportunityWithRelations[],
  filters?: MetricsFilters
): PrincipalMetrics {
  const principals = organizations.filter((org) => org.type === 'principal')

  if (!principals.length) {
    return {
      total: 0,
      byPriority: {} as Record<PriorityLevel, number>,
      withActiveOpportunities: 0,
      averageOpportunitiesPerPrincipal: 0,
      topByPipelineValue: [],
    }
  }

  // Apply filters
  let filteredPrincipals = principals
  if (filters?.principalIds?.length) {
    filteredPrincipals = filteredPrincipals.filter((p) => filters.principalIds!.includes(p.id))
  }

  // Calculate priority breakdown using size mapping
  const byPriority = filteredPrincipals.reduce(
    (acc, principal) => {
      const priority = mapStringSizeToPriority((principal as { size?: string }).size)
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    },
    {} as Record<PriorityLevel, number>
  )

  // Calculate principals with active opportunities
  const closedStages: OpportunityStage[] = ['Closed - Won', 'Closed - Lost']
  const activeOpportunities = opportunities.filter((opp) => !closedStages.includes(opp.stage))

  const principalsWithActiveOpps = new Set(
    activeOpportunities.map((opp) => opp.principal_organization_id).filter(Boolean)
  )
  const withActiveOpportunities = principalsWithActiveOpps.size

  // Calculate average opportunities per principal
  const totalOpportunities = opportunities.filter(
    (opp) =>
      opp.principal_organization_id &&
      filteredPrincipals.some((p) => p.id === opp.principal_organization_id)
  ).length
  const averageOpportunitiesPerPrincipal =
    filteredPrincipals.length > 0 ? totalOpportunities / filteredPrincipals.length : 0

  // Calculate top principals by pipeline value
  const principalValues = filteredPrincipals.map((principal) => {
    const principalOpportunities = opportunities.filter(
      (opp) => opp.principal_organization_id === principal.id
    )
    const totalValue = principalOpportunities.reduce(
      (sum, opp) => sum + (opp.estimated_value || 0),
      0
    )

    return {
      id: principal.id,
      name: principal.name,
      totalValue,
      opportunityCount: principalOpportunities.length,
    }
  })

  const topByPipelineValue = principalValues.sort((a, b) => b.totalValue - a.totalValue).slice(0, 5)

  return {
    total: filteredPrincipals.length,
    byPriority,
    withActiveOpportunities,
    averageOpportunitiesPerPrincipal,
    topByPipelineValue,
  }
}

/**
 * Calculate interaction and activity metrics
 */
export function calculateInteractionMetrics(
  interactions: InteractionWithRelations[],
  opportunities: OpportunityWithRelations[],
  filters?: MetricsFilters
): InteractionMetrics {
  if (!interactions?.length) {
    return {
      total: 0,
      recentCount: 0,
      thisWeekCount: 0,
      thisMonthCount: 0,
      byType: {} as Record<InteractionType, number>,
      averagePerOpportunity: 0,
      followUpRequired: 0,
      lastActivityDate: null,
    }
  }

  // Apply filters
  let filteredInteractions = interactions
  if (filters?.organizationIds?.length) {
    filteredInteractions = filteredInteractions.filter(
      (interaction) =>
        interaction.organization_id &&
        filters.organizationIds!.includes(interaction.organization_id)
    )
  }

  const dateRanges = getDateRanges()

  // Calculate time-based counts using interaction_date
  const recentInteractions = filteredInteractions.filter((interaction) => {
    const interactionDate = safeDate(interaction.interaction_date)
    if (!interactionDate) return false
    return (
      interactionDate >= dateRanges.last30Days.from && interactionDate <= dateRanges.last30Days.to
    )
  })

  const thisWeekInteractions = filteredInteractions.filter((interaction) => {
    const interactionDate = safeDate(interaction.interaction_date)
    if (!interactionDate) return false
    return interactionDate >= dateRanges.thisWeek.from && interactionDate <= dateRanges.thisWeek.to
  })

  const thisMonthInteractions = filteredInteractions.filter((interaction) => {
    const interactionDate = safeDate(interaction.interaction_date)
    if (!interactionDate) return false
    return (
      interactionDate >= dateRanges.thisMonth.from && interactionDate <= dateRanges.thisMonth.to
    )
  })

  // Calculate type breakdown
  const byType = filteredInteractions.reduce(
    (acc, interaction) => {
      acc[interaction.type] = (acc[interaction.type] || 0) + 1
      return acc
    },
    {} as Record<InteractionType, number>
  )

  // Calculate average interactions per opportunity
  const averagePerOpportunity =
    opportunities.length > 0 ? filteredInteractions.length / opportunities.length : 0

  // Count follow-ups required
  const followUpRequired = filteredInteractions.filter(
    (interaction) => interaction.follow_up_required
  ).length

  // Find last activity date with null-safe handling
  const lastActivityDate =
    filteredInteractions.length > 0
      ? filteredInteractions.reduce<Date | null>((latest, interaction) => {
          const interactionDate = safeDate(interaction.interaction_date)
          if (!interactionDate) return latest
          return !latest || interactionDate > latest ? interactionDate : latest
        }, null)
      : null

  return {
    total: filteredInteractions.length,
    recentCount: recentInteractions.length,
    thisWeekCount: thisWeekInteractions.length,
    thisMonthCount: thisMonthInteractions.length,
    byType,
    averagePerOpportunity,
    followUpRequired,
    lastActivityDate,
  }
}

/**
 * Calculate growth metrics by comparing current and previous periods
 */
export function calculateGrowthMetrics(
  currentData: {
    organizations: Organization[]
    contacts: Contact[]
    opportunities: OpportunityWithRelations[]
    interactions: InteractionWithRelations[]
    products: Product[]
  },
  previousData: {
    organizations: Organization[]
    contacts: Contact[]
    opportunities: OpportunityWithRelations[]
    interactions: InteractionWithRelations[]
    products: Product[]
  }
): GrowthMetrics {
  const currentOpportunityMetrics = calculateOpportunityMetrics(currentData.opportunities)
  const previousOpportunityMetrics = calculateOpportunityMetrics(previousData.opportunities)

  const currentPrincipals = currentData.organizations.filter(
    (org) => org.type === 'principal'
  ).length
  const previousPrincipals = previousData.organizations.filter(
    (org) => org.type === 'principal'
  ).length

  const currentDistributors = currentData.organizations.filter(
    (org) => org.type === 'distributor'
  ).length
  const previousDistributors = previousData.organizations.filter(
    (org) => org.type === 'distributor'
  ).length

  return {
    organizationsGrowth: calculateGrowth(
      currentData.organizations.length,
      previousData.organizations.length
    ),
    contactsGrowth: calculateGrowth(currentData.contacts.length, previousData.contacts.length),
    opportunitiesGrowth: calculateGrowth(
      currentData.opportunities.length,
      previousData.opportunities.length
    ),
    pipelineValueGrowth: calculateGrowth(
      currentOpportunityMetrics.totalPipelineValue,
      previousOpportunityMetrics.totalPipelineValue
    ),
    interactionsGrowth: calculateGrowth(
      currentData.interactions.length,
      previousData.interactions.length
    ),
    principalsGrowth: calculateGrowth(currentPrincipals, previousPrincipals),
    distributorsGrowth: calculateGrowth(currentDistributors, previousDistributors),
  }
}

/**
 * Format currency values for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format percentage values for display
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

/**
 * Format numbers with thousands separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
