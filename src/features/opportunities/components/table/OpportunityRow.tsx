import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { OpportunitiesTableActions } from '../OpportunitiesTableActions'
import { 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  Target, 
  TrendingUp 
} from 'lucide-react'
import { cn, formatTimeAgo, isOpportunityStalled, getStalledDays } from '@/lib/utils'
import { useOpportunitiesFormatting } from '../../hooks/useOpportunitiesFormatting'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'
import type { DataTableColumn } from '@/components/ui/DataTable'

interface OpportunityRowProps {
  opportunity: OpportunityWithLastActivity
  isSelected: boolean
  isExpanded: boolean
  onSelectItem: (id: string, checked: boolean) => void
  onToggleExpansion: (id: string) => void
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
}: {
  selectedItems: Set<string>
  onSelectAll: (checked: boolean, items: OpportunityWithLastActivity[]) => void
  onSelectItem: (id: string, checked: boolean) => void
  onToggleExpansion: (id: string) => void
  isRowExpanded: (id: string) => boolean
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
}) {
  const { getStageConfig, formatCurrency, formatActivityType } = useOpportunitiesFormatting()

  const columns: DataTableColumn<OpportunityWithLastActivity>[] = [
    {
      key: 'selection',
      header: (sortedOpportunities: OpportunityWithLastActivity[]) => (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedItems.size > 0 && selectedItems.size === sortedOpportunities.length}
            onCheckedChange={(checked) => onSelectAll(!!checked, sortedOpportunities)}
            aria-label="Select all opportunities"
          />
        </div>
      ),
      cell: (opportunity) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpansion(opportunity.id)}
            className="h-auto p-0 text-gray-400 hover:bg-transparent hover:text-gray-600"
            aria-label={isRowExpanded(opportunity.id) ? 'Collapse details' : 'Expand details'}
          >
            {isRowExpanded(opportunity.id) ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
          <Checkbox
            checked={selectedItems.has(opportunity.id)}
            onCheckedChange={(checked) => onSelectItem(opportunity.id, !!checked)}
            aria-label={`Select ${opportunity.name}`}
          />
        </div>
      ),
      className: 'w-[60px] px-6 py-3',
    },
    {
      key: 'company',
      header: 'Company / Opportunity',
      cell: (opportunity) => <OpportunityCompanyCell opportunity={opportunity} />,
      className: 'w-[35%] px-6 py-3',
    },
    {
      key: 'stage',
      header: 'Stage',
      cell: (opportunity) => <OpportunityStageCell opportunity={opportunity} getStageConfig={getStageConfig} />,
      className: 'w-[20%] px-6 py-3',
      hidden: { sm: true },
    },
    {
      key: 'value',
      header: 'Value / Probability',
      cell: (opportunity) => (
        <div>
          <div className="text-sm font-medium">{formatCurrency(opportunity.estimated_value)}</div>
          <div className="text-xs text-gray-500">
            {opportunity.probability ? `${opportunity.probability}% likely` : 'No probability'}
          </div>
        </div>
      ),
      className: 'w-[15%] px-6 py-3 text-right',
      hidden: { sm: true, md: true },
    },
    {
      key: 'last_activity',
      header: 'Last Activity',
      cell: (opportunity) => (
        <div>
          <div className="text-sm text-gray-900">
            {formatTimeAgo(opportunity.last_activity_date || null)}
          </div>
          <div className="text-xs text-gray-500">
            {formatActivityType(opportunity.last_activity_type || null)}
          </div>
        </div>
      ),
      className: 'w-[20%] px-6 py-3 text-right',
      hidden: { sm: true },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (opportunity) => (
        <OpportunitiesTableActions
          opportunity={opportunity}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={() => onToggleExpansion(opportunity.id)}
        />
      ),
      className: 'w-[10%] px-6 py-3 text-right',
    },
  ]

  return columns
}

function OpportunityCompanyCell({ opportunity }: { opportunity: OpportunityWithLastActivity }) {
  const getActivityIcon = () => {
    switch (opportunity.weeklyActivity) {
      case 'high': return <Zap className="size-3 text-green-500" />
      case 'medium': return <Target className="size-3 text-yellow-500" />
      default: return null
    }
  }
  
  const getActivityBadge = () => {
    if (opportunity.weeklyActivity === 'high') {
      return <Badge variant="secondary" className="border-green-200 bg-green-50 text-xs text-green-700">High Activity</Badge>
    }
    if (opportunity.weeklyActivity === 'medium') {
      return <Badge variant="secondary" className="border-yellow-200 bg-yellow-50 text-xs text-yellow-700">Active</Badge>
    }
    return null
  }
  
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-gray-900">
          {opportunity.organization?.name || 'No Organization'}
        </div>
        {opportunity.movedThisWeek && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <TrendingUp className="size-3 text-blue-500" />
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
      <div className="mt-0.5 flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {opportunity.name} • {opportunity.interaction_count || 0} activities
        </span>
        {getActivityBadge()}
      </div>
      {opportunity.weeklyEngagementScore && opportunity.weeklyEngagementScore > 50 && (
        <div className="mt-1 flex items-center gap-1">
          <span className="text-xs text-gray-400">Engagement:</span>
          <div className="flex items-center">
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
              <div 
                className={cn(
                  "h-full rounded-full",
                  opportunity.weeklyEngagementScore >= 80 ? "bg-green-500" :
                  opportunity.weeklyEngagementScore >= 60 ? "bg-yellow-500" : "bg-blue-500"
                )}
                style={{ width: `${opportunity.weeklyEngagementScore}%` }}
              />
            </div>
            <span className="ml-1 text-xs text-gray-400">{opportunity.weeklyEngagementScore}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function OpportunityStageCell({ 
  opportunity, 
  getStageConfig 
}: { 
  opportunity: OpportunityWithLastActivity
  getStageConfig: (stage: string | null | undefined) => any
}) {
  const stalled = isOpportunityStalled(
    opportunity.stage_updated_at || null,
    opportunity.created_at || ''
  )
  const stalledDays = stalled
    ? getStalledDays(opportunity.stage_updated_at || null, opportunity.created_at || '')
    : 0
  const stageConfig = getStageConfig(opportunity.stage)

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full', stageConfig.dot)}></span>
      {stalled && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="size-2 animate-pulse rounded-full bg-red-500"></span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stalled for {stalledDays} days</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <span className="text-sm font-medium">{opportunity.stage}</span>
      <span className="text-xs text-gray-400">{stageConfig.position}/7</span>
    </div>
  )
}