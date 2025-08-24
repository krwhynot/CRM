import { useMemo } from 'react'
import { generateSampleData } from '@/utils/sampleData'
import { generateWeeksData, getWeeksBack, isSameWeekMonday } from '@/utils/dateUtils'
import { FilterState, UseDashboardDataReturn, ActivityItem } from '@/types/dashboard'

export const useDashboardData = (debouncedFilters: FilterState): UseDashboardDataReturn => {
  // Initialize with sample data
  const { opportunities, principals, products } = useMemo(() => generateSampleData(), [])
  
  // Filter opportunities based on selected filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const principalMatch = debouncedFilters.principal === 'all' || opp.principalId === debouncedFilters.principal
      const productMatch = debouncedFilters.product === 'all' || opp.productId === debouncedFilters.product
      return principalMatch && productMatch
    })
  }, [opportunities, debouncedFilters.principal, debouncedFilters.product])
  
  // Generate chart data based on filtered opportunities
  const { opportunityChartData, interactionChartData } = useMemo(() => {
    const weeksBack = getWeeksBack(debouncedFilters.weeks)
    const weeksData = generateWeeksData(weeksBack)
    
    // Count opportunities per week
    const opportunityData = weeksData.map(week => {
      const count = filteredOpportunities.filter(opp =>
        isSameWeekMonday(opp.date, week.weekStart)
      ).length
      
      return { ...week, count }
    })
    
    // Count interactions per week
    const interactionData = weeksData.map(week => {
      const count = filteredOpportunities.reduce((total, opp) => {
        const interactionsInWeek = opp.interactions.filter(interaction =>
          isSameWeekMonday(interaction.date, week.weekStart)
        ).length
        return total + interactionsInWeek
      }, 0)
      
      return { ...week, count }
    })
    
    return {
      opportunityChartData: opportunityData,
      interactionChartData: interactionData
    }
  }, [filteredOpportunities, debouncedFilters.weeks])
  
  // Generate activity items for the feed
  const activityItems = useMemo(() => {
    const activities: ActivityItem[] = []
    
    // Add opportunities as activities
    filteredOpportunities.forEach(opp => {
      const principal = principals.find(p => p.id === opp.principalId)
      const product = products.find(p => p.id === opp.productId)
      
      activities.push({
        id: `opportunity-${opp.id}`,
        type: 'opportunity',
        title: opp.title,
        date: opp.date,
        principalName: principal?.name || 'Unknown Principal',
        productName: product?.name
      })
      
      // Add interactions as activities
      opp.interactions.forEach(interaction => {
        activities.push({
          id: `interaction-${interaction.id}`,
          type: 'interaction',
          title: `${interaction.type}: ${interaction.description}`,
          date: interaction.date,
          principalName: principal?.name || 'Unknown Principal',
          productName: product?.name
        })
      })
    })
    
    return activities
  }, [filteredOpportunities, principals, products])
  
  return {
    opportunities,
    principals,
    products,
    filteredOpportunities,
    opportunityChartData,
    interactionChartData,
    activityItems
  }
}