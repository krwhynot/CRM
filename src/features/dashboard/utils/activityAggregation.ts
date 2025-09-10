import { format, startOfDay, subDays, isWithinInterval } from 'date-fns'
import type { 
  Opportunity, 
  Interaction,
  Principal,
  ActivityTableRow,
  ActivityChartData
} from '@/types/dashboard'

/**
 * Aggregates opportunities and interactions into a unified activity feed
 * filtered by account manager
 */
export const aggregateActivityData = (
  opportunities: Opportunity[],
  interactions: Interaction[],
  principals: Principal[],
  selectedAccountManager?: string
): ActivityTableRow[] => {
  const activities: ActivityTableRow[] = []

  // Add opportunities as activities
  opportunities.forEach(opportunity => {
    const principal = principals.find(p => p.id === opportunity.principalId)
    
    // For now, we'll mock account manager assignment since it's not in the current data structure
    // In a real implementation, this would come from the opportunity or principal data
    const accountManager = mockAccountManagerAssignment(opportunity.id)
    
    // Skip if filtering by account manager and this doesn't match
    if (selectedAccountManager && accountManager !== selectedAccountManager) {
      return
    }

    // Add opportunity creation activity
    activities.push({
      id: `opp-created-${opportunity.id}`,
      date: opportunity.date,
      type: 'opportunity_created',
      principal: principal?.name || 'Unknown Principal',
      company: principal?.company || 'Unknown Company',
      description: opportunity.title,
      value: opportunity.value,
      status: opportunity.status,
      accountManager
    })
  })

  // Add interactions as activities
  opportunities.forEach(opportunity => {
    const principal = principals.find(p => p.id === opportunity.principalId)
    const accountManager = mockAccountManagerAssignment(opportunity.id)
    
    // Skip if filtering by account manager and this doesn't match
    if (selectedAccountManager && accountManager !== selectedAccountManager) {
      return
    }

    opportunity.interactions.forEach(interaction => {
      activities.push({
        id: `interaction-${interaction.id}`,
        date: interaction.date,
        type: 'interaction',
        principal: principal?.name || 'Unknown Principal',
        company: principal?.company || 'Unknown Company', 
        description: `${interaction.type}: ${interaction.description}`,
        priority: mockInteractionPriority(),
        status: 'Completed',
        accountManager
      })
    })
  })

  // Sort by date descending (most recent first)
  return activities.sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Prepares chart data showing activity over time
 */
export const prepareActivityChartData = (
  activities: ActivityTableRow[],
  days: number = 30
): ActivityChartData[] => {
  const chartData: ActivityChartData[] = []
  const now = new Date()

  // Create data points for each day
  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(subDays(now, i))
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // Count activities for this day
    const dayActivities = activities.filter(activity =>
      isWithinInterval(activity.date, { 
        start: date, 
        end: new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1) 
      })
    )
    
    const interactions = dayActivities.filter(a => a.type === 'interaction').length
    const opportunities = dayActivities.filter(a => 
      a.type === 'opportunity_created' || a.type === 'opportunity_updated'
    ).length
    
    chartData.push({
      date: dateStr,
      interactions,
      opportunities,
      total: interactions + opportunities
    })
  }

  return chartData
}

/**
 * Calculate summary metrics from activity data
 */
export const calculateActivityMetrics = (
  activities: ActivityTableRow[],
  previousPeriodActivities?: ActivityTableRow[]
) => {
  const totalActivity = activities.length
  const interactions = activities.filter(a => a.type === 'interaction').length
  const opportunities = activities.filter(a => 
    a.type === 'opportunity_created' || a.type === 'opportunity_updated'
  ).length
  
  // Calculate total opportunity value
  const totalOpportunityValue = activities
    .filter(a => a.value)
    .reduce((sum, a) => sum + (a.value || 0), 0)

  // Calculate trends if previous period data is provided
  let trends = {}
  if (previousPeriodActivities) {
    const prevTotal = previousPeriodActivities.length
    const prevInteractions = previousPeriodActivities.filter(a => a.type === 'interaction').length
    
    trends = {
      totalTrend: prevTotal > 0 ? ((totalActivity - prevTotal) / prevTotal * 100).toFixed(1) + '%' : '0%',
      interactionsTrend: prevInteractions > 0 ? ((interactions - prevInteractions) / prevInteractions * 100).toFixed(1) + '%' : '0%',
      totalTrendDirection: totalActivity >= prevTotal ? 'up' : 'down',
      interactionsTrendDirection: interactions >= prevInteractions ? 'up' : 'down'
    }
  }

  return {
    totalActivity,
    interactions,
    opportunities,
    totalOpportunityValue,
    ...trends
  }
}

/**
 * Mock function to assign account managers to opportunities
 * In a real implementation, this would come from the database
 */
const mockAccountManagerAssignment = (opportunityId: string): string => {
  const accountManagers = ['Sue', 'Gary', 'Dale']
  // Use a simple hash to consistently assign the same AM to the same opportunity
  const hash = opportunityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return accountManagers[hash % accountManagers.length]
}

/**
 * Mock function to assign interaction priorities
 * In a real implementation, this would come from the database
 */
const mockInteractionPriority = (): 'A+' | 'A' | 'B' | 'C' | 'D' => {
  const priorities: ('A+' | 'A' | 'B' | 'C' | 'D')[] = ['A+', 'A', 'B', 'C', 'D']
  const weights = [0.1, 0.2, 0.4, 0.2, 0.1] // A+ rarest, B most common
  
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < priorities.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return priorities[i]
    }
  }
  
  return 'B' // fallback
}

/**
 * Filter activities by date range
 */
export const filterActivitiesByDateRange = (
  activities: ActivityTableRow[],
  startDate: Date,
  endDate: Date
): ActivityTableRow[] => {
  return activities.filter(activity =>
    isWithinInterval(activity.date, { start: startDate, end: endDate })
  )
}

/**
 * Get unique account managers from activity data
 */
export const getAccountManagersFromActivities = (activities: ActivityTableRow[]): string[] => {
  const managers = new Set(activities.map(a => a.accountManager))
  return Array.from(managers).sort()
}