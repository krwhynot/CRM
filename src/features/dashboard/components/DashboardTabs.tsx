import React, { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Filter } from 'lucide-react'
import { PrincipalPerformanceChart } from './charts/PrincipalPerformanceChart'
// import { TeamPerformanceChart } from './charts/TeamPerformanceChart' // Unused
import { OpportunitiesChart } from './charts/OpportunitiesChart'
import { ActivityChart } from './charts/ActivityChart'
import { PipelineFlowChart } from './charts/PipelineFlowChart'
import { PipelineValueFunnel } from './charts/PipelineValueFunnel'
import { PrincipalCardsGrid } from './PrincipalCardsGrid'
import { OpportunityKanban } from './OpportunityKanban'
// import { SimpleActivityFeed } from './SimpleActivityFeed' // Unused
import { KpiCard } from '@/components/dashboard/kpi-card'
import { useWeeklyKPIData } from '../hooks/useWeeklyKPIData'
import { Activity, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react'
// Import our new Team Mode components
import { ActivityTable } from './modes/ActivityTable'
import { ActivityChart as TeamActivityChart } from './modes/ActivityChart'
import { MetricCard, ActivityMetricCard, OpportunityMetricCard, InteractionMetricCard } from './modes/MetricCard'
import { 
  aggregateActivityData,
  prepareActivityChartData,
  calculateActivityMetrics,
  getAccountManagersFromActivities,
  filterActivitiesByDateRange
} from '../utils/activityAggregation'
import { subDays } from 'date-fns'
import type {
  DashboardChartDataPoint,
  OpportunityChartData,
  PrincipalPerformanceData,
  TeamPerformanceData,
  PipelineFlowData,
  PipelineValueFunnelData,
  FilterState,
  Opportunity,
  Principal,
  // Activity, // Conflict with imported type
} from '@/types/dashboard'

interface DashboardTabsProps {
  // Chart data props
  weeklyActivityData: DashboardChartDataPoint[]
  opportunityChartData: OpportunityChartData
  interactionChartData: DashboardChartDataPoint[]
  principalPerformanceData: PrincipalPerformanceData[]
  teamPerformanceData: TeamPerformanceData[]
  pipelineFlowData: PipelineFlowData | undefined
  pipelineValueFunnelData: PipelineValueFunnelData | undefined
  isLoading?: boolean
  visibleChartIds: string[]
  filters?: FilterState
  // Additional props for component migration (Day 3)
  filteredOpportunities?: Opportunity[] // For OpportunityKanban migration
  activityItems?: Activity[] // For SimpleActivityFeed migration
  principals?: Principal[] // For component props
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  opportunityChartData,
  interactionChartData,
  principalPerformanceData,
  // teamPerformanceData, // Unused
  pipelineFlowData,
  pipelineValueFunnelData,
  isLoading = false,
  visibleChartIds,
  filters,
  // New props for Day 3 migration
  filteredOpportunities,
  // activityItems, // Unused
  principals,
}) => {
  const kpiData = useWeeklyKPIData(filters)
  
  // Team Mode State - Account Manager Selection
  const [selectedAccountManager, setSelectedAccountManager] = useState<string>('')
  
  // Team Mode Data Processing
  const allActivityData = useMemo(() => {
    if (!filteredOpportunities || !principals) return []
    return aggregateActivityData(
      filteredOpportunities,
      [], // interactions - would come from data hook if available
      principals,
      selectedAccountManager || undefined
    )
  }, [filteredOpportunities, principals, selectedAccountManager])

  const accountManagers = useMemo(() => {
    return getAccountManagersFromActivities(allActivityData)
  }, [allActivityData])

  const filteredActivityData = useMemo(() => {
    if (!selectedAccountManager) return allActivityData
    return allActivityData.filter(activity => activity.accountManager === selectedAccountManager)
  }, [allActivityData, selectedAccountManager])

  const chartData = useMemo(() => {
    return prepareActivityChartData(filteredActivityData, 30)
  }, [filteredActivityData])

  const currentPeriodMetrics = useMemo(() => {
    const endDate = new Date()
    const startDate = subDays(endDate, 30)
    const currentPeriodData = filterActivitiesByDateRange(filteredActivityData, startDate, endDate)
    
    const prevEndDate = subDays(endDate, 30)
    const prevStartDate = subDays(prevEndDate, 30)
    const previousPeriodData = filterActivitiesByDateRange(filteredActivityData, prevStartDate, prevEndDate)
    
    return calculateActivityMetrics(currentPeriodData, previousPeriodData)
  }, [filteredActivityData])

  return (
    <div className="space-y-4">
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="principals">Principals</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4 duration-300 animate-in fade-in-50">
          {/* KPI Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Interactions This Week"
              value={kpiData.interactionsLogged.thisWeek}
              change={kpiData.interactionsLogged.trend.value}
              changeLabel={kpiData.interactionsLogged.trend.label}
              icon={Activity}
              trend={
                kpiData.interactionsLogged.trend.value > 0
                  ? 'up'
                  : kpiData.interactionsLogged.trend.value < 0
                    ? 'down'
                    : 'neutral'
              }
              isLoading={isLoading || kpiData.isLoading}
            />

            <KpiCard
              title="Opportunities Moved"
              value={kpiData.opportunitiesMoved.count}
              change={kpiData.opportunitiesMoved.trend.value}
              changeLabel={kpiData.opportunitiesMoved.trend.label}
              icon={TrendingUp}
              trend={
                kpiData.opportunitiesMoved.trend.value > 0
                  ? 'up'
                  : kpiData.opportunitiesMoved.trend.value < 0
                    ? 'down'
                    : 'neutral'
              }
              variant="success"
              isLoading={isLoading || kpiData.isLoading}
            />

            <KpiCard
              title="Pipeline Value"
              value={`$${(kpiData.pipelineValue.total / 1000000).toFixed(1)}M`}
              subtitle={`${kpiData.pipelineValue.opportunityCount} opportunities`}
              icon={DollarSign}
              change={kpiData.pipelineValue.trend.value}
              changeLabel={kpiData.pipelineValue.trend.label}
              trend={
                kpiData.pipelineValue.trend.value > 0
                  ? 'up'
                  : kpiData.pipelineValue.trend.value < 0
                    ? 'down'
                    : 'neutral'
              }
              isLoading={isLoading || kpiData.isLoading}
            />

            <KpiCard
              title="Action Items"
              value={kpiData.actionItemsDue.count}
              subtitle={`${kpiData.actionItemsDue.dueToday} due today`}
              icon={CheckCircle2}
              variant={kpiData.overdueItems.count > 0 ? 'warning' : 'default'}
              isLoading={isLoading || kpiData.isLoading}
            />
          </div>

          {/* Pipeline Kanban - Mini funnel view */}
          {filteredOpportunities && (
            <OpportunityKanban
              opportunities={filteredOpportunities}
              principals={principals || []}
              loading={isLoading}
            />
          )}

          {/* Pipeline Movement Section */}
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleChartIds.includes('pipeline-flow') && (
              <Card className="dashboard-card">
                <CardContent className="pt-4">
                  <PipelineFlowChart data={pipelineFlowData} loading={isLoading} />
                </CardContent>
              </Card>
            )}

            {visibleChartIds.includes('pipeline-funnel') && (
              <Card className="dashboard-card">
                <CardContent className="pt-4">
                  <PipelineValueFunnel data={pipelineValueFunnelData} loading={isLoading} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Weekly Activity Charts Row */}
          {(visibleChartIds.includes('activities') ||
            visibleChartIds.includes('opportunities')) && (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleChartIds.includes('activities') && (
                <Card className="dashboard-card">
                  <CardContent className="pt-4">
                    <ActivityChart data={interactionChartData} loading={isLoading} />
                  </CardContent>
                </Card>
              )}

              {visibleChartIds.includes('opportunities') && (
                <Card className="dashboard-card">
                  <CardContent className="pt-4">
                    <OpportunitiesChart data={opportunityChartData} loading={isLoading} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-6 duration-300 animate-in fade-in-50">
          {/* NEW TEAM MODE - Account Manager Activity Dashboard */}
          
          {/* Account Manager Selector */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Team Activity Dashboard</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-muted-foreground" />
                  <Select
                    value={selectedAccountManager}
                    onValueChange={setSelectedAccountManager}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue placeholder="All Account Managers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Account Managers</SelectItem>
                      {accountManagers.map((manager) => (
                        <SelectItem key={manager} value={manager}>
                          {manager}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Activity Table - Top Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedAccountManager 
                  ? `Activity for ${selectedAccountManager}` 
                  : 'Activity across all account managers'
                } - Last 30 days
              </p>
            </CardHeader>
            <CardContent>
              <ActivityTable 
                data={filteredActivityData.slice(0, 20)}
                loading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Bottom Section - Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Activity Chart (2/3 width on large screens) */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Daily activity trends over the last 30 days
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <TeamActivityChart 
                      data={chartData}
                      loading={isLoading}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right - Metric Cards (1/3 width on large screens) */}
            <div className="space-y-4">
              <ActivityMetricCard
                count={currentPeriodMetrics.totalActivity}
                trend={currentPeriodMetrics.totalTrendDirection as 'up' | 'down' | 'neutral'}
                trendValue={currentPeriodMetrics.totalTrend}
              />
              
              <InteractionMetricCard
                count={currentPeriodMetrics.interactions}
                trend={currentPeriodMetrics.interactionsTrendDirection as 'up' | 'down' | 'neutral'}
                trendValue={currentPeriodMetrics.interactionsTrend}
              />
              
              <OpportunityMetricCard
                count={currentPeriodMetrics.opportunities}
                totalValue={currentPeriodMetrics.totalOpportunityValue}
              />
              
              <MetricCard
                title="Average Daily Activity"
                value={(currentPeriodMetrics.totalActivity / 30).toFixed(1)}
                subtitle="Activities per day"
                variant="primary"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="principals" className="space-y-4 duration-300 animate-in fade-in-50">
          {/* Principal Cards Grid */}
          <PrincipalCardsGrid />

          {/* Principal Performance Chart (if visible) */}
          {visibleChartIds.includes('principal-performance') && (
            <Card className="dashboard-card">
              <CardContent className="pt-6">
                <PrincipalPerformanceChart data={principalPerformanceData} loading={isLoading} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}