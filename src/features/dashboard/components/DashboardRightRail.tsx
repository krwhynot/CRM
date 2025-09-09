import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Activity,
  Filter,
} from 'lucide-react'
import { MiniSparkline } from '@/components/ui/mini-sparkline'
import { formatCurrency } from '@/lib/metrics-utils'
import type { WeeklyKPIData } from '../hooks/useWeeklyKPIData'
import type { FilterState, Principal } from '@/types/dashboard'

interface DashboardRightRailProps {
  kpiData: WeeklyKPIData
  filters: FilterState
  principals: Principal[]
}

export const DashboardRightRail: React.FC<DashboardRightRailProps> = ({
  kpiData,
  filters,
  principals,
}) => {
  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.principal !== 'all') count++
    if (filters.product.length > 0) count++
    if (filters.weeks !== 4) count++
    if (filters.focus !== 'all') count++
    if (filters.quickView !== 'all') count++
    return count
  }

  // Get selected principal name
  const getSelectedPrincipalName = () => {
    if (filters.principal === 'all') return 'All Principals'
    const principal = principals.find((p) => p.id === filters.principal)
    return principal?.name || 'Unknown Principal'
  }

  // Mock trend data for sparklines (in production this would come from props)
  const mockTrendData = {
    interactions: [12, 15, 18, 14, 22, 19, 24], // Last 7 days
    opportunities: [3, 2, 5, 4, 3, 6, 4],
    pipelineValue: [450, 460, 470, 475, 480, 485, 490], // In thousands
  }

  // Mock top AM data (in production this would come from props)
  const topAM = {
    name: 'Sarah Johnson',
    interactions: 24,
    opportunities: 12,
    pipelineValue: 485000,
    completionRate: 92,
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
      {/* This Week Totals Card */}
      <Card className="dashboard-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" />
            This Week Totals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <span className="text-sm">Interactions</span>
            </div>
            <div className="flex items-center gap-3">
              <MiniSparkline
                data={mockTrendData.interactions}
                color="blue"
                height={16}
                width={40}
              />
              <div className="text-right">
                <div className="font-semibold">{kpiData.interactionsLogged.thisWeek}</div>
                <div className="text-xs text-muted-foreground">
                  {kpiData.interactionsLogged.count} total
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <span className="text-sm">Opportunities</span>
            </div>
            <div className="flex items-center gap-3">
              <MiniSparkline
                data={mockTrendData.opportunities}
                color="green"
                height={16}
                width={40}
              />
              <div className="text-right">
                <div className="font-semibold">{kpiData.opportunitiesMoved.count}</div>
                <div className="text-xs text-muted-foreground">
                  {kpiData.opportunitiesMoved.stageChanges} moved
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              <span className="text-sm">Pipeline Value</span>
            </div>
            <div className="flex items-center gap-3">
              <MiniSparkline
                data={mockTrendData.pipelineValue}
                color="blue"
                height={16}
                width={40}
              />
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(kpiData.pipelineValue.total)}</div>
                <div className="text-xs text-muted-foreground">
                  {kpiData.pipelineValue.opportunityCount} opps
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top AM Card */}
      <Card className="dashboard-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            Top AM This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{topAM.name}</div>
            <Badge variant="secondary" className="text-xs">
              {topAM.completionRate}% complete
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-muted/50 p-2 text-center">
              <div className="text-lg font-semibold">{topAM.interactions}</div>
              <div className="text-xs text-muted-foreground">Interactions</div>
            </div>
            <div className="rounded bg-muted/50 p-2 text-center">
              <div className="text-lg font-semibold">{topAM.opportunities}</div>
              <div className="text-xs text-muted-foreground">Opportunities</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold">{formatCurrency(topAM.pipelineValue)}</div>
            <div className="text-xs text-muted-foreground">Pipeline Value</div>
          </div>
        </CardContent>
      </Card>

      {/* To-Dos Card */}
      <Card className="dashboard-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="size-4" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-yellow-500" />
              <span className="text-sm">Due Today</span>
            </div>
            <Badge variant={kpiData.actionItemsDue.dueToday > 0 ? 'destructive' : 'secondary'}>
              {kpiData.actionItemsDue.dueToday}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span className="text-sm">This Week</span>
            </div>
            <Badge variant="outline">{kpiData.actionItemsDue.count}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-red-500" />
              <span className="text-sm">Overdue</span>
            </div>
            <div className="text-right">
              <Badge variant={kpiData.overdueItems.count > 0 ? 'destructive' : 'secondary'}>
                {kpiData.overdueItems.count}
              </Badge>
              {kpiData.overdueItems.oldestDays > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Oldest: {kpiData.overdueItems.oldestDays}d
                </div>
              )}
            </div>
          </div>

          <Button size="sm" variant="outline" className="w-full">
            View All Tasks
          </Button>
        </CardContent>
      </Card>

      {/* Active Filters Card */}
      {getActiveFilterCount() > 0 && (
        <Card className="dashboard-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="size-4" />
              Active Filters
              <Badge variant="secondary" className="ml-auto">
                {getActiveFilterCount()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filters.principal !== 'all' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Principal</span>
                <Badge variant="outline" className="text-xs">
                  {getSelectedPrincipalName()}
                </Badge>
              </div>
            )}

            {filters.product.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Products</span>
                <Badge variant="outline" className="text-xs">
                  {filters.product.length} selected
                </Badge>
              </div>
            )}

            {filters.weeks !== 4 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Range</span>
                <Badge variant="outline" className="text-xs">
                  {filters.weeks} weeks
                </Badge>
              </div>
            )}

            {filters.focus !== 'all' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Focus</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {filters.focus}
                </Badge>
              </div>
            )}

            {filters.quickView !== 'all' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quick View</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {filters.quickView}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </aside>
  )
}
