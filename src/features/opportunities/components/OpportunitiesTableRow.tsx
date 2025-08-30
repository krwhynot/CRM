import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatTimeAgo, isOpportunityStalled, getStalledDays } from '@/lib/utils'
import { OpportunitiesTableActions } from './OpportunitiesTableActions'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface OpportunitiesTableRowProps {
  opportunity: OpportunityWithLastActivity
  isSelected: boolean
  onSelect: (id: string, checked: boolean) => void
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
  onView?: (opportunity: OpportunityWithLastActivity) => void
  getStageConfig: (stage: string) => { dot: string; position: number }
  formatCurrency: (value: number | null) => string
  formatActivityType: (type: string | null) => string
  isExpanded?: boolean
}

export const OpportunitiesTableRow: React.FC<OpportunitiesTableRowProps> = ({
  opportunity,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
  getStageConfig,
  formatCurrency,
  formatActivityType,
  isExpanded = false
}) => {
  const stalled = isOpportunityStalled(opportunity.stage_updated_at || null, opportunity.created_at || '')
  const stalledDays = stalled ? getStalledDays(opportunity.stage_updated_at || null, opportunity.created_at || '') : 0
  const stageConfig = getStageConfig(opportunity.stage)

  return (
    <TableRow 
      key={opportunity.id}
      className={cn(
        "h-[52px] hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 cursor-pointer",
        isExpanded && "bg-blue-50 hover:bg-blue-50 border-blue-200"
      )}
      onClick={() => onView?.(opportunity)}
    >
      {/* Expansion Icon + Checkbox */}
      <TableCell className="px-6 py-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView?.(opportunity)
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(opportunity.id, !!checked)}
            aria-label={`Select ${opportunity.name}`}
          />
        </div>
      </TableCell>
      
      {/* Company / Opportunity */}
      <TableCell className="px-6 py-2.5">
        <div>
          <div className="font-medium text-sm text-gray-900">
            {opportunity.organization?.name || 'No Organization'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {opportunity.name} • {opportunity.interaction_count || 0} activities
          </div>
        </div>
      </TableCell>
      
      {/* Stage */}
      <TableCell className="px-6 py-2.5">
        <div className="flex items-center gap-1.5">
          {/* Stage color dot */}
          <span className={cn("w-2 h-2 rounded-full", stageConfig.dot)}></span>
          
          {/* Stalled indicator - red pulsing dot */}
          {stalled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
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
      </TableCell>
      
      {/* Value / Probability */}
      <TableCell className="px-6 py-2.5 text-right">
        <div>
          <div className="font-medium text-sm">{formatCurrency(opportunity.estimated_value)}</div>
          <div className="text-xs text-gray-500">
            {opportunity.probability ? `${opportunity.probability}% likely` : 'No probability'}
          </div>
        </div>
      </TableCell>
      
      {/* Last Activity */}
      <TableCell className="px-6 py-2.5 text-right">
        <div>
          <div className="text-sm text-gray-900">
            {formatTimeAgo(opportunity.last_activity_date || null)}
          </div>
          <div className="text-xs text-gray-500">
            {formatActivityType(opportunity.last_activity_type || null)}
          </div>
        </div>
      </TableCell>
      
      {/* Actions */}
      <TableCell className="px-6 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
        <OpportunitiesTableActions
          opportunity={opportunity}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      </TableCell>
    </TableRow>
  )
}