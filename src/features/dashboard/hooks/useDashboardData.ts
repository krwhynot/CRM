import { useMemo } from 'react'
import { generateSampleData } from '@/utils/sampleData'
import { generateWeeksData, getWeeksBack, isSameWeekMonday } from '@/utils/dateUtils'
import type {
  FilterState,
  UseDashboardDataReturn,
  ActivityItem,
  PipelineFlowData,
  PipelineValueFunnelData,
  PipelineStageFlow,
  FunnelStage,
} from '@/types/dashboard'

export const useDashboardData = (debouncedFilters: FilterState): UseDashboardDataReturn => {
  // Initialize with sample data
  const { opportunities, principals, products } = useMemo(() => generateSampleData(), [])

  // Filter opportunities based on selected filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const principalMatch =
        debouncedFilters.principal === 'all' || opp.principalId === debouncedFilters.principal
      const productMatch =
        debouncedFilters.product === 'all' || opp.productId === debouncedFilters.product
      return principalMatch && productMatch
    })
  }, [opportunities, debouncedFilters.principal, debouncedFilters.product])

  // Generate chart data based on filtered opportunities
  const { opportunityChartData, interactionChartData } = useMemo(() => {
    const weeksBack = getWeeksBack(debouncedFilters.weeks)
    const weeksData = generateWeeksData(weeksBack)

    // Count opportunities per week
    const opportunityData = weeksData.map((week) => {
      const count = filteredOpportunities.filter((opp) =>
        isSameWeekMonday(opp.date, week.weekStart)
      ).length

      return { ...week, count }
    })

    // Count interactions per week
    const interactionData = weeksData.map((week) => {
      const count = filteredOpportunities.reduce((total, opp) => {
        const interactionsInWeek = opp.interactions.filter((interaction) =>
          isSameWeekMonday(interaction.date, week.weekStart)
        ).length
        return total + interactionsInWeek
      }, 0)

      return { ...week, count }
    })

    return {
      opportunityChartData: opportunityData,
      interactionChartData: interactionData,
    }
  }, [filteredOpportunities, debouncedFilters.weeks])

  // Generate activity items for the feed
  const activityItems = useMemo(() => {
    const activities: ActivityItem[] = []

    // Add opportunities as activities
    filteredOpportunities.forEach((opp) => {
      const principal = principals.find((p) => p.id === opp.principalId)
      const product = products.find((p) => p.id === opp.productId)

      activities.push({
        id: `opportunity-${opp.id}`,
        type: 'opportunity',
        title: opp.title,
        date: opp.date,
        principalName: principal?.name || 'Unknown Principal',
        productName: product?.name,
      })

      // Add interactions as activities
      opp.interactions.forEach((interaction) => {
        activities.push({
          id: `interaction-${interaction.id}`,
          type: 'interaction',
          title: `${interaction.type}: ${interaction.description}`,
          date: interaction.date,
          principalName: principal?.name || 'Unknown Principal',
          productName: product?.name,
        })
      })
    })

    return activities
  }, [filteredOpportunities, principals, products])

  // Phase 5: New chart data calculations
  const weeklyActivityData = useMemo(() => {
    // Weekly activity combines interactions and opportunities
    return interactionChartData.map((item) => ({
      ...item,
      interactions: Math.floor(item.count * 0.7), // 70% interactions ratio
      opportunities: item.count,
    }))
  }, [interactionChartData])

  const principalPerformanceData = useMemo(() => {
    // Calculate performance metrics per principal
    return principals
      .map((principal) => {
        const principalOpps = filteredOpportunities.filter(
          (opp) => opp.principalId === principal.id
        )
        const totalInteractions = principalOpps.reduce(
          (sum, opp) => sum + opp.interactions.length,
          0
        )

        // Determine performance based on interaction count and opportunity success
        let performance: 'high' | 'medium' | 'low' = 'low'
        if (totalInteractions > 35) performance = 'high'
        else if (totalInteractions > 20) performance = 'medium'

        return {
          name: principal.name,
          interactions: totalInteractions,
          performance,
        }
      })
      .filter((item) => item.interactions > 0) // Only show principals with activity
      .sort((a, b) => b.interactions - a.interactions) // Sort by interactions desc
  }, [principals, filteredOpportunities])

  const teamPerformanceData = useMemo(() => {
    // Mock team data - in real implementation, this would come from user/manager data
    const mockTeamData = [
      { name: 'Alice Johnson', baseInteractions: 25, baseOpportunities: 8, baseMovements: 12 },
      { name: 'Bob Smith', baseInteractions: 22, baseOpportunities: 6, baseMovements: 10 },
      { name: 'Carol Davis', baseInteractions: 18, baseOpportunities: 7, baseMovements: 8 },
      { name: 'David Wilson', baseInteractions: 15, baseOpportunities: 4, baseMovements: 6 },
      { name: 'Eva Brown', baseInteractions: 20, baseOpportunities: 5, baseMovements: 9 },
    ]

    // Apply focus-based filtering
    let filteredTeamData = mockTeamData
    if (debouncedFilters.focus === 'my_tasks') {
      // Show only current user's data
      filteredTeamData = mockTeamData.filter((member) => member.name === 'Alice Johnson')
    } else if (debouncedFilters.focus === 'high_priority') {
      // Show top performers
      filteredTeamData = mockTeamData.filter((member) => member.baseInteractions > 20)
    }

    return filteredTeamData.map((member, index) => ({
      name: member.name,
      interactions: member.baseInteractions,
      opportunities: member.baseOpportunities,
      movements: member.baseMovements,
      rank: index + 1,
      isCurrentUser: member.name === 'Alice Johnson', // Mock current user
    }))
  }, [debouncedFilters.focus])

  // Pipeline Flow Data - calculate stage transitions
  const pipelineFlowData = useMemo((): PipelineFlowData => {
    const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

    // Mock pipeline flow calculations based on filtered opportunities
    const totalOpportunities = filteredOpportunities.length
    const baseFlows: PipelineStageFlow[] = [
      {
        from: 'Lead',
        to: 'Qualified',
        count: Math.floor(totalOpportunities * 0.65),
        value: totalOpportunities * 12000,
        percentage: 65,
      },
      {
        from: 'Lead',
        to: 'Closed Lost',
        count: Math.floor(totalOpportunities * 0.35),
        value: totalOpportunities * 7900,
        percentage: 35,
      },
      {
        from: 'Qualified',
        to: 'Proposal',
        count: Math.floor(totalOpportunities * 0.49),
        value: totalOpportunities * 10600,
        percentage: 75,
      },
      {
        from: 'Qualified',
        to: 'Closed Lost',
        count: Math.floor(totalOpportunities * 0.16),
        value: totalOpportunities * 1400,
        percentage: 25,
      },
      {
        from: 'Proposal',
        to: 'Negotiation',
        count: Math.floor(totalOpportunities * 0.33),
        value: totalOpportunities * 7400,
        percentage: 67,
      },
      {
        from: 'Proposal',
        to: 'Closed Lost',
        count: Math.floor(totalOpportunities * 0.16),
        value: totalOpportunities * 3200,
        percentage: 33,
      },
      {
        from: 'Negotiation',
        to: 'Closed Won',
        count: Math.floor(totalOpportunities * 0.22),
        value: totalOpportunities * 5500,
        percentage: 67,
      },
      {
        from: 'Negotiation',
        to: 'Closed Lost',
        count: Math.floor(totalOpportunities * 0.11),
        value: totalOpportunities * 1800,
        percentage: 33,
      },
    ]

    return {
      stages,
      flows: baseFlows,
      totalMovements: baseFlows.reduce((sum, flow) => sum + flow.count, 0),
      timeRange: debouncedFilters.weeks,
    }
  }, [filteredOpportunities.length, debouncedFilters.weeks])

  // Pipeline Value Funnel Data - calculate conversion funnel
  const pipelineValueFunnelData = useMemo((): PipelineValueFunnelData => {
    const totalOpportunities = Math.max(filteredOpportunities.length, 45) // Minimum 45 for demo

    const stages: FunnelStage[] = [
      {
        name: 'Lead',
        count: totalOpportunities,
        value: totalOpportunities * 15000,
        conversionRate: 100,
        dropOffRate: 0,
        color: 'bg-chart-1',
      },
      {
        name: 'Qualified',
        count: Math.floor(totalOpportunities * 0.71),
        value: Math.floor(totalOpportunities * 0.71) * 16000,
        conversionRate: 71,
        dropOffRate: 29,
        color: 'bg-chart-2',
      },
      {
        name: 'Proposal',
        count: Math.floor(totalOpportunities * 0.53),
        value: Math.floor(totalOpportunities * 0.53) * 17000,
        conversionRate: 75,
        dropOffRate: 25,
        color: 'bg-primary',
      },
      {
        name: 'Negotiation',
        count: Math.floor(totalOpportunities * 0.36),
        value: Math.floor(totalOpportunities * 0.36) * 18500,
        conversionRate: 67,
        dropOffRate: 33,
        color: 'bg-warning',
      },
      {
        name: 'Closed Won',
        count: Math.floor(totalOpportunities * 0.27),
        value: Math.floor(totalOpportunities * 0.27) * 19500,
        conversionRate: 75,
        dropOffRate: 25,
        color: 'bg-success',
      },
    ]

    const closedWonCount = stages[stages.length - 1].count
    const overallConversion = (closedWonCount / totalOpportunities) * 100

    return {
      stages,
      totalValue: stages[stages.length - 1].value,
      totalOpportunities,
      overallConversion,
    }
  }, [filteredOpportunities.length])

  return {
    opportunities,
    principals,
    products,
    filteredOpportunities,
    opportunityChartData,
    interactionChartData,
    activityItems,
    // Phase 5: New chart data
    weeklyActivityData,
    principalPerformanceData,
    teamPerformanceData,
    // Pipeline chart data
    pipelineFlowData,
    pipelineValueFunnelData,
  }
}
