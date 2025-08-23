import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardFilters } from './DashboardFilters'
import { OpportunityChart } from './OpportunityChart'
import { InteractionChart } from './InteractionChart'
import { SimpleActivityFeed } from './SimpleActivityFeed'
import { OpportunityKanban } from './OpportunityKanban'
import { DashboardSkeleton, ChartSkeleton } from './DashboardSkeleton'
import { EmptyState, ChartEmptyState } from './EmptyState'
import { useDebounce } from '@/hooks/useDebounce'
import { generateSampleData } from '@/utils/sampleData'
import { generateWeeksData, getWeeksBack, isSameWeekMonday } from '@/utils/dateUtils'
import { FilterState, ActivityItem } from '@/types/dashboard'

export const CRMDashboard: React.FC = () => {
  // Initialize with sample data
  const { opportunities, principals, products } = useMemo(() => generateSampleData(), [])
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    principal: 'all',
    product: 'all',
    weeks: 'Last 4 Weeks'
  })
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Debounced filters to prevent excessive recalculations
  const debouncedFilters = useDebounce(filters, 300)
  
  // Simulate initial loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])
  
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
    
    // Count opportunities and interactions per week
    const opportunityData = weeksData.map(week => {
      const count = filteredOpportunities.filter(opp =>
        isSameWeekMonday(opp.date, week.weekStart)
      ).length
      
      return { ...week, count }
    })
    
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
  
  // Handle filter changes with loading state simulation
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setIsLoading(true)
    setFilters(newFilters)
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }, [])
  
  // Show initial loading skeleton
  if (isInitialLoad) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto p-6">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }
  
  // Show empty state if no principal selected (and no data would be visible)
  const showEmptyState = debouncedFilters.principal === 'all' && activityItems.length === 0
  
  if (showEmptyState) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto p-6">
          <DashboardFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            principals={principals}
            products={products}
            isLoading={isLoading}
          />
          <div className="mt-6">
            <EmptyState
              type="dashboard"
              title="Select a principal to view their activity"
              description="Choose a principal from the filters above to see their opportunities, interactions, and activity trends over time."
            />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Filters - Sticky top bar */}
        <DashboardFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          principals={principals}
          products={products}
          isLoading={isLoading}
        />
        
        {/* Charts - Side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opportunity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : opportunityChartData.some(d => d.count > 0) ? (
                <OpportunityChart data={opportunityChartData} loading={false} />
              ) : (
                <ChartEmptyState 
                  title="No opportunities found" 
                  description="No opportunities match the selected filters" 
                />
              )}
            </CardContent>
          </Card>
          
          {/* Interaction Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : interactionChartData.some(d => d.count > 0) ? (
                <InteractionChart data={interactionChartData} loading={false} />
              ) : (
                <ChartEmptyState 
                  title="No interactions found" 
                  description="No interactions match the selected filters" 
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Opportunity Kanban - Sales Pipeline */}
        <OpportunityKanban
          opportunities={filteredOpportunities}
          principals={principals}
          loading={isLoading}
        />
        
        {/* Activity Feed - Full width, paginated */}
        <SimpleActivityFeed
          activities={activityItems}
          loading={isLoading}
          className="w-full"
        />
      </div>
    </div>
  )
}

export default CRMDashboard