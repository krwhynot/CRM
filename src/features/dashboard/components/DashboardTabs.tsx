import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { PrincipalPerformanceChart } from './charts/PrincipalPerformanceChart'
import { TeamPerformanceChart } from './charts/TeamPerformanceChart'
import { OpportunitiesChart } from './charts/OpportunitiesChart'
import { ActivityChart } from './charts/ActivityChart'
import { PipelineFlowChart } from './charts/PipelineFlowChart'
import { PipelineValueFunnel } from './charts/PipelineValueFunnel'
import { PrincipalCardsGrid } from './PrincipalCardsGrid'
import { OpportunityKanban } from './OpportunityKanban'
import { SimpleActivityFeed } from './SimpleActivityFeed'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { useWeeklyKPIData } from '../hooks/useWeeklyKPIData'
import { Activity, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react'
import type {
  DashboardChartDataPoint,
  OpportunityChartData,
  PrincipalPerformanceData,
  TeamPerformanceData,
  PipelineFlowData,
  PipelineValueFunnelData,
  FilterState,
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
  filteredOpportunities?: unknown[] // For OpportunityKanban migration
  activityItems?: unknown[] // For SimpleActivityFeed migration
  principals?: unknown[] // For component props
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  opportunityChartData,
  interactionChartData,
  principalPerformanceData,
  teamPerformanceData,
  pipelineFlowData,
  pipelineValueFunnelData,
  isLoading = false,
  visibleChartIds,
  filters,
  // New props for Day 3 migration
  filteredOpportunities,
  activityItems,
  principals,
}) => {
  const kpiData = useWeeklyKPIData(filters)
  return (
    <div className="space-y-6">
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="principals">Principals</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6 duration-300 animate-in fade-in-50">
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
          <div className="grid gap-6 lg:grid-cols-2">
            {visibleChartIds.includes('pipeline-flow') && (
              <Card className="dashboard-card">
                <CardContent className="pt-6">
                  <PipelineFlowChart data={pipelineFlowData} loading={isLoading} />
                </CardContent>
              </Card>
            )}

            {visibleChartIds.includes('pipeline-funnel') && (
              <Card className="dashboard-card">
                <CardContent className="pt-6">
                  <PipelineValueFunnel data={pipelineValueFunnelData} loading={isLoading} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Weekly Activity Charts Row */}
          {(visibleChartIds.includes('activities') ||
            visibleChartIds.includes('opportunities')) && (
            <div className="grid gap-6 md:grid-cols-2">
              {visibleChartIds.includes('activities') && (
                <Card className="dashboard-card">
                  <CardContent className="pt-6">
                    <ActivityChart data={interactionChartData} loading={isLoading} />
                  </CardContent>
                </Card>
              )}

              {visibleChartIds.includes('opportunities') && (
                <Card className="dashboard-card">
                  <CardContent className="pt-6">
                    <OpportunitiesChart data={opportunityChartData} loading={isLoading} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-6 duration-300 animate-in fade-in-50">
          {/* Team Activity Feed - Main content */}
          {activityItems && (
            <SimpleActivityFeed activities={activityItems} loading={isLoading} className="h-full" />
          )}

          {/* Team Performance Chart - Secondary */}
          {visibleChartIds.includes('team-performance') && (
            <Card className="dashboard-card">
              <CardContent className="pt-6">
                <TeamPerformanceChart data={teamPerformanceData} loading={isLoading} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="principals" className="space-y-6 duration-300 animate-in fade-in-50">
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
