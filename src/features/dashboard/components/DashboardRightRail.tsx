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
import { useDashboardDensity } from '../hooks/useDashboardDensity'
import { cn } from '@/lib/utils'
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
  const { density } = useDashboardDensity()

  // Density-specific configurations for right rail content
  const densityConfig = {
    compact: {
      showSparklines: false,
      showTopAM: false,
      showSubtitles: false,
      maxCards: 2, // Only essential cards
      cardSpacing: 'space-y-2',
      textSize: 'text-xs',
      iconSize: 'size-3',
      buttonSize: 'sm' as const,
      badgeSize: 'text-[10px]',
    },
    comfortable: {
      showSparklines: true,
      showTopAM: true,
      showSubtitles: true,
      maxCards: 4, // Standard cards
      cardSpacing: 'space-y-4',
      textSize: 'text-sm',
      iconSize: 'size-4',
      buttonSize: 'sm' as const,
      badgeSize: 'text-xs',
    },
    spacious: {
      showSparklines: true,
      showTopAM: true,
      showSubtitles: true,
      maxCards: 5, // All cards including extras
      cardSpacing: 'space-y-6',
      textSize: 'text-sm',
      iconSize: 'size-5',
      buttonSize: 'default' as const,
      badgeSize: 'text-sm',
    }
  }

  const config = densityConfig[density]

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
    <aside className={cn("density-aware-rail density-transition lg:sticky lg:top-6 lg:h-fit", config.cardSpacing)}>
      {/* This Week Totals Card - Always show in priority order */}
      <Card className="density-aware-card dashboard-card density-transition">
        <CardHeader className={cn(
          "density-aware-card density-transition",
          density === 'compact' ? 'pb-1' : density === 'spacious' ? 'pb-4' : 'pb-3'
        )}>
          <CardTitle className={cn("flex items-center gap-2", 
            density === 'compact' ? 'text-sm' : density === 'spacious' ? 'text-lg' : 'text-base'
          )}>
            <CalendarDays className={config.iconSize} />
            {density === 'compact' ? 'This Week' : 'This Week Totals'}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(
          density === 'compact' ? 'space-y-1' : density === 'spacious' ? 'space-y-4' : 'space-y-3'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={cn(config.iconSize, "text-muted-foreground")} />
              <span className={config.textSize}>Interactions</span>
            </div>
            <div className={cn("flex items-center", config.showSparklines ? "gap-3" : "gap-0")}>
              {config.showSparklines && (
                <MiniSparkline
                  data={mockTrendData.interactions}
                  color="blue"
                  height={density === 'spacious' ? 20 : 16}
                  width={density === 'spacious' ? 50 : 40}
                />
              )}
              <div className="text-right">
                <div className={cn("font-semibold", 
                  density === 'compact' ? 'text-sm' : density === 'spacious' ? 'text-lg' : 'text-base'
                )}>{kpiData.interactionsLogged.thisWeek}</div>
                {config.showSubtitles && (
                  <div className={cn("text-muted-foreground", 
                    density === 'compact' ? 'text-[10px]' : 'text-xs'
                  )}>
                    {kpiData.interactionsLogged.count} total
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={cn(config.iconSize, "text-muted-foreground")} />
              <span className={config.textSize}>Opportunities</span>
            </div>
            <div className={cn("flex items-center", config.showSparklines ? "gap-3" : "gap-0")}>
              {config.showSparklines && (
                <MiniSparkline
                  data={mockTrendData.opportunities}
                  color="green"
                  height={density === 'spacious' ? 20 : 16}
                  width={density === 'spacious' ? 50 : 40}
                />
              )}
              <div className="text-right">
                <div className={cn("font-semibold", 
                  density === 'compact' ? 'text-sm' : density === 'spacious' ? 'text-lg' : 'text-base'
                )}>{kpiData.opportunitiesMoved.count}</div>
                {config.showSubtitles && (
                  <div className={cn("text-muted-foreground", 
                    density === 'compact' ? 'text-[10px]' : 'text-xs'
                  )}>
                    {kpiData.opportunitiesMoved.stageChanges} moved
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className={cn(config.iconSize, "text-muted-foreground")} />
              <span className={config.textSize}>Pipeline Value</span>
            </div>
            <div className={cn("flex items-center", config.showSparklines ? "gap-3" : "gap-0")}>
              {config.showSparklines && (
                <MiniSparkline
                  data={mockTrendData.pipelineValue}
                  color="blue"
                  height={density === 'spacious' ? 20 : 16}
                  width={density === 'spacious' ? 50 : 40}
                />
              )}
              <div className="text-right">
                <div className={cn("font-semibold", 
                  density === 'compact' ? 'text-sm' : density === 'spacious' ? 'text-lg' : 'text-base'
                )}>{formatCurrency(kpiData.pipelineValue.total)}</div>
                {config.showSubtitles && (
                  <div className={cn("text-muted-foreground", 
                    density === 'compact' ? 'text-[10px]' : 'text-xs'
                  )}>
                    {kpiData.pipelineValue.opportunityCount} opps
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top AM Card - Show only in comfortable/spacious modes */}
      {config.showTopAM && (
        <Card className="density-aware-card dashboard-card density-transition">
          <CardHeader className={cn(
            "density-aware-card density-transition",
            density === 'compact' ? 'pb-1' : density === 'spacious' ? 'pb-4' : 'pb-3'
          )}>
            <CardTitle className={cn("flex items-center gap-2", 
              density === 'compact' ? 'text-sm' : density === 'spacious' ? 'text-lg' : 'text-base'
            )}>
              <Users className={config.iconSize} />
              Top AM This Week
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(
            density === 'compact' ? 'space-y-1' : density === 'spacious' ? 'space-y-4' : 'space-y-3'
          )}>
            <div className="flex items-center justify-between">
              <div className={cn("font-medium", 
                density === 'compact' ? 'text-xs' : density === 'spacious' ? 'text-base' : 'text-sm'
              )}>{topAM.name}</div>
              <Badge variant="secondary" className={config.badgeSize}>
                {topAM.completionRate}% complete
              </Badge>
            </div>

            <div className={cn(
              "grid gap-3",
              density === 'spacious' ? 'grid-cols-1 space-y-2' : 'grid-cols-2'
            )}>
              <div className={cn(
                "rounded bg-muted/20 text-center",
                density === 'compact' ? 'p-1' : density === 'spacious' ? 'p-4' : 'p-2'
              )}>
                <div className={cn("font-semibold", 
                  density === 'compact' ? 'text-sm' : density === 'spacious' ? 'text-xl' : 'text-lg'
                )}>{topAM.interactions}</div>
                {config.showSubtitles && (
                  <div className={cn("text-muted-foreground", 
                    density === 'compact' ? 'text-[10px]' : 'text-xs'
                  )}>Interactions</div>
                )}
              </div>
              <div className={cn(
                "rounded bg-muted/20 text-center",
                density === 'compact' ? 'p-1' : density === 'spacious' ? 'p-4' : 'p-2'
              )}>
                <div className={cn("font-semibold", 
                  density === 'compact' ? 'text-sm' : density === 'spacious' ? 'text-xl' : 'text-lg'
                )}>{topAM.opportunities}</div>
                {config.showSubtitles && (
                  <div className={cn("text-muted-foreground", 
                    density === 'compact' ? 'text-[10px]' : 'text-xs'
                  )}>Opportunities</div>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className={cn("font-semibold", 
                density === 'compact' ? 'text-base' : density === 'spacious' ? 'text-2xl' : 'text-lg'
              )}>{formatCurrency(topAM.pipelineValue)}</div>
              {config.showSubtitles && (
                <div className={cn("text-muted-foreground", 
                  density === 'compact' ? 'text-[10px]' : 'text-xs'
                )}>Pipeline Value</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items Card - Priority card, always show but condense in compact */}
      <Card className="density-aware-card dashboard-card density-transition">
        <CardHeader className={cn(
          "density-aware-card density-transition",
          density === 'compact' ? 'pb-1' : density === 'spacious' ? 'pb-4' : 'pb-3'
        )}>
          <CardTitle className={cn("flex items-center gap-2", 
            density === 'compact' ? 'text-sm' : density === 'spacious' ? 'text-lg' : 'text-base'
          )}>
            <CheckCircle2 className={config.iconSize} />
            {density === 'compact' ? 'Tasks' : 'Action Items'}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(
          density === 'compact' ? 'space-y-1' : density === 'spacious' ? 'space-y-4' : 'space-y-3'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className={cn(config.iconSize, "text-warning")} />
              <span className={config.textSize}>Due Today</span>
            </div>
            <Badge 
              variant={kpiData.actionItemsDue.dueToday > 0 ? 'destructive' : 'secondary'}
              className={config.badgeSize}
            >
              {kpiData.actionItemsDue.dueToday}
            </Badge>
          </div>

          {/* Show weekly and overdue items unless compact mode and limited space */}
          {density !== 'compact' && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className={cn(config.iconSize, "text-muted-foreground")} />
                  <span className={config.textSize}>This Week</span>
                </div>
                <Badge variant="outline" className={config.badgeSize}>
                  {kpiData.actionItemsDue.count}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className={cn(config.iconSize, "text-destructive")} />
                  <span className={config.textSize}>Overdue</span>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={kpiData.overdueItems.count > 0 ? 'destructive' : 'secondary'}
                    className={config.badgeSize}
                  >
                    {kpiData.overdueItems.count}
                  </Badge>
                  {config.showSubtitles && kpiData.overdueItems.oldestDays > 0 && (
                    <div className={cn("mt-1 text-muted-foreground", 
                      density === 'compact' ? 'text-[10px]' : 'text-xs'
                    )}>
                      Oldest: {kpiData.overdueItems.oldestDays}d
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Compact mode: show summary only */}
          {density === 'compact' && (
            <div className="flex items-center justify-between">
              <span className={config.textSize}>Week/Overdue</span>
              <div className="flex gap-1">
                <Badge variant="outline" className={config.badgeSize}>
                  {kpiData.actionItemsDue.count}
                </Badge>
                <Badge 
                  variant={kpiData.overdueItems.count > 0 ? 'destructive' : 'secondary'}
                  className={config.badgeSize}
                >
                  {kpiData.overdueItems.count}
                </Badge>
              </div>
            </div>
          )}

          {density !== 'compact' && (
            <Button size={config.buttonSize} variant="outline" className="w-full">
              View All Tasks
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Active Filters Card - Show unless maxCards limit reached or compact with limited space */}
      {getActiveFilterCount() > 0 && density !== 'compact' && (
        <Card className="density-aware-card dashboard-card density-transition">
          <CardHeader className={cn(
            "density-aware-card density-transition",
            density === 'compact' ? 'pb-1' : density === 'spacious' ? 'pb-4' : 'pb-3'
          )}>
            <CardTitle className={cn("flex items-center gap-2", 
              density === 'compact' ? 'text-sm' : density === 'spacious' ? 'text-lg' : 'text-base'
            )}>
              <Filter className={config.iconSize} />
              Active Filters
              <Badge variant="secondary" className={cn("ml-auto", config.badgeSize)}>
                {getActiveFilterCount()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(
            density === 'compact' ? 'space-y-1' : density === 'spacious' ? 'space-y-3' : 'space-y-2'
          )}>
            {filters.principal !== 'all' && (
              <div className={cn("flex items-center justify-between", config.textSize)}>
                <span className="text-muted-foreground">Principal</span>
                <Badge variant="outline" className={config.badgeSize}>
                  {density === 'spacious' ? getSelectedPrincipalName() : 'Selected'}
                </Badge>
              </div>
            )}

            {filters.product.length > 0 && (
              <div className={cn("flex items-center justify-between", config.textSize)}>
                <span className="text-muted-foreground">Products</span>
                <Badge variant="outline" className={config.badgeSize}>
                  {filters.product.length} selected
                </Badge>
              </div>
            )}

            {filters.weeks !== 4 && (
              <div className={cn("flex items-center justify-between", config.textSize)}>
                <span className="text-muted-foreground">Time Range</span>
                <Badge variant="outline" className={config.badgeSize}>
                  {filters.weeks} weeks
                </Badge>
              </div>
            )}

            {filters.focus !== 'all' && (
              <div className={cn("flex items-center justify-between", config.textSize)}>
                <span className="text-muted-foreground">Focus</span>
                <Badge variant="outline" className={cn(config.badgeSize, "capitalize")}>
                  {filters.focus}
                </Badge>
              </div>
            )}

            {filters.quickView !== 'all' && (
              <div className={cn("flex items-center justify-between", config.textSize)}>
                <span className="text-muted-foreground">Quick View</span>
                <Badge variant="outline" className={cn(config.badgeSize, "capitalize")}>
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
