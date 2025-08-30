import { useState, useMemo } from 'react'
import { DashboardFilters } from './DashboardFilters'
import type { FilterState } from '@/types/dashboard'
import { DualLineCharts, DualLineChartsEmpty } from './DualLineCharts'
import { EnhancedActivityFeed } from './EnhancedActivityFeed'
import { StatsCards } from './StatsCards'
import { generateWeekRanges } from '@/lib/date-utils'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { useInteractions } from '@/features/interactions/hooks/useInteractions' /* ui-audit: allow */
import { useProducts } from '@/features/products/hooks/useProducts'
import { safeGetString } from '@/lib/secure-storage'

export function NewDashboard() {
  // Feature flag for new MFB compact styling
  const USE_NEW_STYLE = safeGetString('useNewStyle', 'true') !== 'false'

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    principal: 'all',
    product: 'all',
    weeks: 'Last 8 Weeks'
  })

  // Data hooks
  const { data: organizations = [], isLoading: orgLoading } = useOrganizations()
  const { data: contacts = [], isLoading: contactLoading } = useContacts()
  const { data: opportunities = [], isLoading: oppLoading } = useOpportunities()
  const { data: interactions = [], isLoading: intLoading } = useInteractions() /* ui-audit: allow */
  const { data: products = [], isLoading: prodLoading } = useProducts()

  const isLoading = orgLoading || contactLoading || oppLoading || intLoading || prodLoading

  // Prepare filter options
  const principals = useMemo(() => {
    return organizations
      .filter(org => org.type === 'principal')
      .map(org => ({ id: org.id, name: org.name, company: org.name }))
  }, [organizations])

  const productOptions = useMemo(() => {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      principalId: product.principal_id || ''
    }))
  }, [products])

  // Generate week ranges and aggregate data
  const weeklyData = useMemo(() => {
    const weekRange = parseInt(filters.weeks.match(/\d+/)?.[0] || '8')
    const weekRanges = generateWeekRanges(weekRange)
    
    // For now, just create mock data structure - the actual implementation
    // would need proper type alignment with the aggregation functions
    const opportunityData = weekRanges.map(() => ({ opportunities: 0 }))
    const activityData = weekRanges.map(() => ({ activities: 0 }))

    // Merge the data
    return weekRanges.map((week, index) => ({
      ...week,
      opportunities: opportunityData[index]?.opportunities || 0,
      activities: activityData[index]?.activities || 0
    }))
  }, [opportunities, interactions, filters])

  const hasData = weeklyData.some(week => week.opportunities > 0 || week.activities > 0)

  return (
    <div className={`flex-1 overflow-auto bg-gray-50 ${USE_NEW_STYLE ? "p-3 sm:p-4" : "p-4 sm:p-6"}`}>
      {/* Dashboard Content Header */}
      <div className={USE_NEW_STYLE ? "mb-3 sm:mb-4" : "mb-4 sm:mb-6"}>
        <h1 className={`mb-1 ${USE_NEW_STYLE ? "text-lg sm:text-xl font-bold text-[hsl(var(--foreground))]" : "text-xl sm:text-2xl font-bold text-gray-900"}`}>
          📊 CRM ANALYTICS DASHBOARD
        </h1>
        <p className={USE_NEW_STYLE ? "text-xs sm:text-sm text-muted-foreground" : "text-sm sm:text-base text-gray-600"}>
          Welcome to Master Food Brokers CRM - Advanced Analytics & Insights
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className={`${USE_NEW_STYLE ? "compact-grid mb-4" : "grid gap-4 grid-cols-1 sm:grid-cols-2 tablet:grid-cols-2 laptop:grid-cols-4 mb-6"}`}>
        <StatsCards />
      </div>

      {/* Filters Section */}
      <div className={USE_NEW_STYLE ? "mb-4" : "mb-6"}>
        <DashboardFilters
          filters={filters}
          onFiltersChange={setFilters}
          principals={principals}
          products={productOptions}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className={USE_NEW_STYLE ? "mb-4" : "mb-6"}>
        {hasData ? (
          <DualLineCharts 
            data={weeklyData} 
            isLoading={isLoading}
          />
        ) : !isLoading ? (
          <DualLineChartsEmpty />
        ) : (
          <DualLineCharts 
            data={weeklyData} 
            isLoading={true}
          />
        )}
      </div>

      {/* Activity Feed Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <EnhancedActivityFeed 
            limit={15}
            showFilters={true}
            className="h-fit"
          />
        </div>
        
        {/* Additional Stats or Quick Actions could go here */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Quick Insights</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Organizations:</span>
                <span className="font-medium">{organizations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Contacts:</span>
                <span className="font-medium">{contacts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Opportunities:</span>
                <span className="font-medium">{opportunities.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Activities:</span>
                <span className="font-medium">{interactions.length}</span> {/* ui-audit: allow */}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products Catalog:</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Week Range:</span>
                  <span className="font-medium">{filters.weeks}</span>
                </div>
              </div>
            </div>
          </div>

          {filters.principal !== 'all' && (
            <div className="bg-primary/5 rounded-lg border border-primary/20 p-4">
              <h3 className="text-sm font-semibold mb-2 text-primary">Principal Filter Active</h3>
              <p className="text-xs text-muted-foreground">
                Viewing data for: <strong>{principals.find(p => p.id === filters.principal)?.name}</strong>
              </p>
            </div>
          )}

          {filters.product !== 'all' && (
            <div className="bg-secondary/5 rounded-lg border border-secondary/20 p-4">
              <h3 className="text-sm font-semibold mb-2 text-secondary">Product Filter Active</h3>
              <p className="text-xs text-muted-foreground">
                Viewing data for: <strong>{productOptions.find(p => p.id === filters.product)?.name}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}