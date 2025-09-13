import { useMemo } from 'react'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Zap, Target, TrendingUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatTimeAgo, isOpportunityStalled, getStalledDays } from '@/lib/utils'
import { useOpportunitiesFormatting } from '../../hooks/useOpportunitiesFormatting'
import { OpportunityActions } from '../OpportunityActions'
import {
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  semanticColors,
} from '@/styles/tokens'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface UseOpportunityColumnsProps {
  selectedItems: Set<string>
  onSelectAll: (checked: boolean, opportunities: OpportunityWithLastActivity[]) => void
  onSelectItem: (id: string, checked: boolean) => void
  onToggleExpansion: (id: string) => void
  isRowExpanded: (id: string) => boolean
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
}

export function useOpportunityColumns({
  selectedItems,
  onSelectAll,
  onSelectItem,
  onToggleExpansion,
  isRowExpanded,
  onEdit,
  onDelete,
}: UseOpportunityColumnsProps) {
  const { getStageConfig, formatCurrency, formatActivityType } = useOpportunitiesFormatting()

  const columns: DataTableColumn<OpportunityWithLastActivity>[] = useMemo(
    () => [
      {
        key: 'selection',
        header: (opportunities: OpportunityWithLastActivity[]) => (
          <Checkbox
            checked={selectedItems.size > 0 && selectedItems.size === opportunities.length}
            onCheckedChange={(checked) => onSelectAll(!!checked, opportunities)}
            aria-label="Select all opportunities"
            className={semanticSpacing.interactiveElement}
          />
        ),
        cell: (opportunity) => (
          <Checkbox
            checked={selectedItems.has(opportunity.id)}
            onCheckedChange={(checked) => onSelectItem(opportunity.id, !!checked)}
            aria-label={`Select ${opportunity.name}`}
            className={semanticSpacing.interactiveElement}
          />
        ),
      },
      {
        key: 'expand',
        header: '',
        cell: (opportunity) => (
          <Button
            variant="ghost"
            onClick={() => onToggleExpansion(opportunity.id)}
            className={cn(
              semanticSpacing.interactiveElement,
              `transition-transform duration-200`,
              isRowExpanded(opportunity.id) && 'rotate-90'
            )}
            aria-label={`${isRowExpanded(opportunity.id) ? 'Collapse' : 'Expand'} opportunity details`}
          >
            <span className="sr-only">Toggle row expansion</span>▶
          </Button>
        ),
      },
      {
        key: 'company',
        header: 'Company / Opportunity',
        cell: (opportunity) => {
          const getActivityIcon = () => {
            switch (opportunity.weeklyActivity) {
              case 'high':
                return <Zap className={`size-3 ${semanticColors.success.primary}`} />
              case 'medium':
                return <Target className={`size-3 ${semanticColors.warning.primary}`} />
              default:
                return null
            }
          }

          const getActivityBadge = () => {
            if (opportunity.weeklyActivity === 'high') {
              return (
                <Badge
                  variant="secondary"
                  className={`${semanticColors.success.background} ${semanticColors.success.border} ${semanticTypography.caption} ${semanticColors.success.foreground}`}
                >
                  High Activity
                </Badge>
              )
            }
            if (opportunity.weeklyActivity === 'medium') {
              return (
                <Badge
                  variant="secondary"
                  className={`${semanticColors.warning.background} ${semanticColors.warning.border} ${semanticTypography.caption} ${semanticColors.warning.foreground}`}
                >
                  Active
                </Badge>
              )
            }
            return null
          }

          return (
            <div>
              <div className={`flex items-center ${semanticSpacing.gap.sm}`}>
                <div
                  className={cn(
                    semanticTypography.label,
                    semanticTypography.body,
                    semanticColors.text.primary
                  )}
                >
                  {opportunity.organization?.name || 'No Organization'}
                </div>
                {opportunity.movedThisWeek && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <TrendingUp className={`size-3 ${semanticColors.info.primary}`} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Stage moved this week</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {getActivityIcon()}
              </div>
              <div
                className={`${semanticSpacing.topGap.xs} flex items-center ${semanticSpacing.gap.sm}`}
              >
                <span className={`${semanticTypography.caption} ${semanticColors.text.secondary}`}>
                  {opportunity.name} • {opportunity.interaction_count || 0} activities
                </span>
                {getActivityBadge()}
              </div>
              {opportunity.weeklyEngagementScore && opportunity.weeklyEngagementScore > 50 && (
                <div
                  className={`${semanticSpacing.topGap.xs} flex items-center ${semanticSpacing.gap.xs}`}
                >
                  <span className={`${semanticTypography.caption} ${semanticColors.text.tertiary}`}>
                    Engagement:
                  </span>
                  <div className="flex items-center">
                    <div
                      className={cn(semanticRadius.full, 'h-1.5 w-12 overflow-hidden bg-gray-200')}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full',
                          opportunity.weeklyEngagementScore >= 80
                            ? semanticColors.success.primary
                            : opportunity.weeklyEngagementScore >= 60
                              ? semanticColors.warning.primary
                              : semanticColors.info.primary
                        )}
                        style={{ width: `${opportunity.weeklyEngagementScore}%` }}
                      />
                    </div>
                    <span
                      className={`${semanticSpacing.leftGap.xs} ${semanticTypography.caption} ${semanticColors.text.tertiary}`}
                    >
                      {opportunity.weeklyEngagementScore}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        },
        className: `w-[35%] ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer}`,
      },
      {
        key: 'stage',
        header: 'Stage',
        cell: (opportunity) => {
          const stalled = isOpportunityStalled(
            opportunity.stage_updated_at || null,
            opportunity.created_at || ''
          )
          const stalledDays = stalled
            ? getStalledDays(opportunity.stage_updated_at || null, opportunity.created_at || '')
            : 0
          const stageConfig = getStageConfig(opportunity.stage)

          return (
            <div className={`flex items-center ${semanticSpacing.gap.sm}`}>
              <span className={cn('w-2 h-2 rounded-full', stageConfig.dot)}></span>
              {stalled && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(semanticRadius.full, 'size-2 animate-pulse bg-red-500')}
                      ></span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stalled for {stalledDays} days</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span className={cn(semanticTypography.label, semanticTypography.body)}>
                {opportunity.stage}
              </span>
              <span className={`${semanticTypography.caption} text-gray-400`}>
                {stageConfig.position}/7
              </span>
            </div>
          )
        },
        className: `w-[20%] ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer}`,
        hidden: { sm: true },
      },
      {
        key: 'value',
        header: 'Value / Probability',
        cell: (opportunity) => (
          <div>
            <div className={cn(semanticTypography.label, semanticTypography.body)}>
              {formatCurrency(opportunity.estimated_value)}
            </div>
            <div className={`${semanticTypography.caption} text-gray-500`}>
              {opportunity.probability ? `${opportunity.probability}% likely` : 'No probability'}
            </div>
          </div>
        ),
        className: `w-[15%] ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer} text-right`,
        hidden: { sm: true, md: true },
      },
      {
        key: 'last_activity',
        header: 'Last Activity',
        cell: (opportunity) => (
          <div>
            <div className={`${semanticTypography.body} text-gray-900`}>
              {formatTimeAgo(opportunity.last_activity_date || null)}
            </div>
            <div className={`${semanticTypography.caption} text-gray-500`}>
              {formatActivityType(opportunity.last_activity_type || null)}
            </div>
          </div>
        ),
        className: `w-[20%] ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer} text-right`,
        hidden: { sm: true },
      },
      {
        key: 'actions',
        header: '',
        cell: (opportunity) => (
          <OpportunityActions
            opportunity={opportunity}
            onEdit={onEdit}
            onView={() => onToggleExpansion(opportunity.id)}
            variant="ghost"
            size="sm"
          />
        ),
        className: `w-[10%] ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer} text-right`,
      },
    ],
    [
      selectedItems,
      onSelectAll,
      onSelectItem,
      onToggleExpansion,
      isRowExpanded,
      onEdit,
      onDelete,
      getStageConfig,
      formatCurrency,
      formatActivityType,
    ]
  )

  return columns
}
