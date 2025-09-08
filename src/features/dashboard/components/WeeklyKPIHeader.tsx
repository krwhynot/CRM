import { 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react'
import { KPITile, SuccessKPITile, WarningKPITile, ErrorKPITile } from './kpi-tiles/KPITile'
import { KPITileSkeletonGrid } from './kpi-tiles/KPITileSkeleton'
import { useWeeklyKPIData } from '../hooks/useWeeklyKPIData'
import { cn } from '@/lib/utils'
import type { FilterState } from '@/types/dashboard'

interface WeeklyKPIHeaderProps {
  filters?: FilterState
  className?: string
  compact?: boolean
}

export function WeeklyKPIHeader({ 
  filters, 
  className,
  compact = false 
}: WeeklyKPIHeaderProps) {
  const {
    opportunitiesMoved,
    interactionsLogged,
    actionItemsDue,
    pipelineValue,
    overdueItems,
    completedTasks,
    isLoading,
    error
  } = useWeeklyKPIData(filters)

  // Show loading skeleton while data loads
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {!compact && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Weekly KPIs</h2>
            <div className="text-xs text-muted-foreground">
              Loading performance metrics...
            </div>
          </div>
        )}
        <KPITileSkeletonGrid count={6} />
      </div>
    )
  }

  // Show error state if data failed to load
  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        {!compact && (
          <h2 className="text-lg font-semibold">Weekly KPIs</h2>
        )}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <KPITile
              key={index}
              title="Error"
              value="--"
              icon={AlertTriangle}
              variant="error"
              subtitle="Failed to load"
              isLoading={false}
            />
          ))}
        </div>
        <p className="text-center text-sm text-destructive">
          Unable to load KPI data. Please try refreshing the page.
        </p>
      </div>
    )
  }

  // Format currency values
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Weekly KPIs</h2>
          <div className="text-xs text-muted-foreground">
            Updated {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* 1. Opportunities Moved */}
        <KPITile
          title="Opportunities Moved"
          value={opportunitiesMoved.count}
          icon={TrendingUp}
          variant={opportunitiesMoved.trend.value > 0 ? 'success' : 'default'}
          trend={{
            value: opportunitiesMoved.trend.value,
            label: opportunitiesMoved.trend.label
          }}
          subtitle={`${opportunitiesMoved.stageChanges} stage changes`}
        />

        {/* 2. Interactions Logged */}
        <KPITile
          title="Interactions Logged"
          value={interactionsLogged.count}
          icon={MessageSquare}
          trend={{
            value: interactionsLogged.trend.value,
            label: interactionsLogged.trend.label
          }}
          subtitle={`${interactionsLogged.thisWeek} this week`}
        />

        {/* 3. Action Items Due */}
        <WarningKPITile
          title="Action Items Due"
          value={actionItemsDue.count}
          icon={Clock}
          subtitle={
            actionItemsDue.count > 0 
              ? `${actionItemsDue.dueToday} due today`
              : 'All caught up!'
          }
        />

        {/* 4. Pipeline Value */}
        <SuccessKPITile
          title="Pipeline Value"
          value={formatCurrency(pipelineValue.total)}
          icon={DollarSign}
          trend={{
            value: pipelineValue.trend.value,
            label: pipelineValue.trend.label
          }}
          subtitle={`${pipelineValue.opportunityCount} opportunities`}
        />

        {/* 5. Overdue Items */}
        <ErrorKPITile
          title="Overdue Items"
          value={overdueItems.count}
          icon={AlertTriangle}
          subtitle={
            overdueItems.count > 0
              ? `${overdueItems.oldestDays} days oldest`
              : 'No overdue items'
          }
        />

        {/* 6. Completed Tasks */}
        <SuccessKPITile
          title="Completed Tasks"
          value={completedTasks.count}
          icon={CheckCircle}
          trend={{
            value: completedTasks.trend.value,
            label: completedTasks.trend.label
          }}
          subtitle={`${completedTasks.completionRate}% completion rate`}
        />
      </div>

      {/* Quick Summary (optional, for non-compact mode) */}
      {!compact && (opportunitiesMoved.count > 0 || overdueItems.count > 0) && (
        <div className="flex items-center justify-center space-x-6 border-t pt-2 text-sm text-muted-foreground">
          {opportunitiesMoved.count > 0 && (
            <span className="flex items-center space-x-1">
              <TrendingUp className="size-3 text-green-600" />
              <span>{opportunitiesMoved.count} opportunities advanced</span>
            </span>
          )}
          {overdueItems.count > 0 && (
            <span className="flex items-center space-x-1">
              <AlertTriangle className="size-3 text-red-600" />
              <span>{overdueItems.count} items need attention</span>
            </span>
          )}
          {overdueItems.count === 0 && actionItemsDue.count === 0 && (
            <span className="flex items-center space-x-1">
              <CheckCircle className="size-3 text-green-600" />
              <span>All tasks up to date</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Compact variant for mobile or constrained layouts
export function CompactWeeklyKPIHeader(props: Omit<WeeklyKPIHeaderProps, 'compact'>) {
  return <WeeklyKPIHeader {...props} compact={true} />
}