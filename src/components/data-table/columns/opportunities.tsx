'use client'

import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/metrics-utils'
import { formatTimeAgo } from '@/lib/utils'
import type { Opportunity } from '@/types/entities'

// Extended opportunity interface with activity data
interface OpportunityWithLastActivity extends Opportunity {
  // Relationship data
  organization?: {
    id: string
    name: string
    type: string
  }
  contact?: {
    id: string
    first_name: string
    last_name: string
    email?: string
  }
  principal_organization?: {
    id: string
    name: string
  }

  // Activity tracking
  last_activity_date?: string | null
  last_activity_type?: string | null
  interaction_count?: number
  days_since_activity?: number

  // Status indicators
  is_stalled?: boolean
  high_value?: boolean
  needs_attention?: boolean
}

// Opportunity action handlers interface
interface OpportunityActions {
  onEdit?: (opportunity: Opportunity) => void
  onDelete?: (opportunity: Opportunity) => void
  onView?: (opportunity: Opportunity) => void
  onAdvanceStage?: (opportunity: Opportunity) => void
  onScheduleActivity?: (opportunity: Opportunity) => void
}

// Helper component for empty cell display
const EmptyCell = () => <span className="italic text-muted-foreground">Not provided</span>

// Opportunity stage badge component using enhanced semantic tokens
const StageBadge: React.FC<{ stage: string }> = ({ stage }) => {
  const getStageColor = (stage: string) => {
    const lowerStage = stage.toLowerCase()
    if (lowerStage.includes('lead') || lowerStage.includes('new')) {
      return 'bg-muted text-muted-foreground border-border'
    }
    if (lowerStage.includes('qualified') || lowerStage.includes('outreach')) {
      return 'bg-info/10 text-info-foreground border-info'
    }
    if (
      lowerStage.includes('sample') ||
      lowerStage.includes('visit') ||
      lowerStage.includes('demo')
    ) {
      return 'bg-warning/10 text-warning-foreground border-warning'
    }
    if (lowerStage.includes('proposal') || lowerStage.includes('negotiation')) {
      return 'bg-demo/10 text-demo-foreground border-demo'
    }
    if (lowerStage.includes('won') || lowerStage.includes('closed - won')) {
      return 'bg-success/10 text-success-foreground border-success'
    }
    if (lowerStage.includes('lost') || lowerStage.includes('closed - lost')) {
      return 'bg-destructive/10 text-destructive-foreground border-destructive'
    }
    return 'bg-muted text-muted-foreground border-border'
  }

  return (
    <Badge variant="outline" className={cn('text-xs', getStageColor(stage))}>
      {stage}
    </Badge>
  )
}

// Opportunity status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('active')) {
      return 'bg-success/10 text-success-foreground border-success'
    }
    if (lowerStatus.includes('on hold') || lowerStatus.includes('nurturing')) {
      return 'bg-warning/10 text-warning-foreground border-warning'
    }
    if (lowerStatus.includes('qualified')) {
      return 'bg-info/10 text-info-foreground border-info'
    }
    if (lowerStatus.includes('won')) {
      return 'bg-success/10 text-success-foreground border-success'
    }
    if (lowerStatus.includes('lost')) {
      return 'bg-destructive/10 text-destructive-foreground border-destructive'
    }
    return 'bg-muted text-muted-foreground border-border'
  }

  return (
    <Badge variant="outline" className={cn('text-xs', getStatusColor(status))}>
      {status}
    </Badge>
  )
}

// Opportunity actions dropdown component
const OpportunityActionsDropdown: React.FC<{
  opportunity: Opportunity
  actions?: OpportunityActions
}> = ({ opportunity, actions }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="size-8 p-0" onClick={(e) => e.stopPropagation()}>
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {actions?.onView && (
        <DropdownMenuItem onClick={() => actions.onView!(opportunity)}>
          View Details
        </DropdownMenuItem>
      )}
      {actions?.onEdit && (
        <DropdownMenuItem onClick={() => actions.onEdit!(opportunity)}>
          Edit Opportunity
        </DropdownMenuItem>
      )}
      {actions?.onAdvanceStage && (
        <DropdownMenuItem onClick={() => actions.onAdvanceStage!(opportunity)}>
          Advance Stage
        </DropdownMenuItem>
      )}
      {actions?.onScheduleActivity && (
        <DropdownMenuItem onClick={() => actions.onScheduleActivity!(opportunity)}>
          Schedule Activity
        </DropdownMenuItem>
      )}
      {actions?.onDelete && (
        <DropdownMenuItem onClick={() => actions.onDelete!(opportunity)} className="text-destructive">
          Archive Opportunity
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
)

/**
 * Standard opportunity column definitions for TanStack Table
 *
 * Maps to exact database field names from opportunities table:
 * - id: UUID primary key
 * - name: opportunity name (string, 255 chars max)
 * - organization_id: UUID foreign key to organizations
 * - contact_id: UUID foreign key to contacts
 * - estimated_value: decimal value
 * - stage: opportunity_stage enum
 * - status: opportunity_status enum
 * - estimated_close_date: date field
 * - description: text field (1000 chars max)
 * - notes: text field (500 chars max)
 * - principal_id: UUID foreign key to principal organizations
 * - product_id: UUID foreign key to products
 * - opportunity_context: context enum
 * - probability: integer 0-100
 * - deal_owner: string (100 chars max)
 */
export function createOpportunityColumns(
  actions?: OpportunityActions
): ColumnDef<OpportunityWithLastActivity>[] {
  const columns: ColumnDef<OpportunityWithLastActivity>[] = []

  // Note: Selection and expansion columns are handled by the DataTable component
  // to avoid duplicate rendering.

  // Main columns
  columns.push(
    {
      id: 'opportunity',
      header: 'Opportunity',
      accessorKey: 'name', // Maps to 'name' field
      cell: ({ row }) => {
        const opportunity = row.original
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-foreground">
                {opportunity.name || <EmptyCell />}
              </div>
              {opportunity.high_value && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TrendingUp className="size-3 text-success" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>High value opportunity</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {opportunity.is_stalled && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Clock className="size-3 text-destructive" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Opportunity appears stalled</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="space-y-1">
              {opportunity.organization && (
                <div className="text-sm text-muted-foreground">{opportunity.organization.name}</div>
              )}
              {opportunity.contact && (
                <div className="text-xs text-muted-foreground">
                  {opportunity.contact.first_name} {opportunity.contact.last_name}
                </div>
              )}
              {opportunity.principal_organization && (
                <div className="text-xs text-info">
                  Principal: {opportunity.principal_organization.name}
                </div>
              )}
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'value',
      header: 'Value',
      accessorKey: 'estimated_value', // Maps to 'estimated_value' field
      cell: ({ row }) => {
        const { estimated_value, probability } = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="size-3 text-muted-foreground" />
              <span className="text-sm font-medium">
                {estimated_value ? formatCurrency(estimated_value) : <EmptyCell />}
              </span>
            </div>
            {probability !== null && probability !== undefined && (
              <div className="text-xs text-muted-foreground">{probability}% probability</div>
            )}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'stage_status',
      header: 'Stage & Status',
      accessorFn: (row) => `${row.stage} ${row.status}`, // Maps to 'stage' and 'status' fields
      cell: ({ row }) => {
        const { stage, status } = row.original
        return (
          <div className="space-y-1">
            <StageBadge stage={stage} />
            <StatusBadge status={status} />
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'close_date',
      header: 'Expected Close',
      accessorKey: 'estimated_close_date', // Maps to 'estimated_close_date' field
      cell: ({ row }) => {
        const { estimated_close_date } = row.original
        if (!estimated_close_date) {
          return <EmptyCell />
        }

        const closeDate = new Date(estimated_close_date)
        const now = new Date()
        const daysUntilClose = Math.ceil(
          (closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Calendar className="size-3 text-muted-foreground" />
              <span className="text-sm">{closeDate.toLocaleDateString()}</span>
            </div>
            <div
              className={cn(
                'text-xs',
                daysUntilClose < 0
                  ? 'text-destructive'
                  : daysUntilClose <= 30
                    ? 'text-warning'
                    : 'text-muted-foreground'
              )}
            >
              {daysUntilClose < 0
                ? `${Math.abs(daysUntilClose)} days overdue`
                : daysUntilClose === 0
                  ? 'Due today'
                  : `${daysUntilClose} days remaining`}
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'activity',
      header: 'Last Activity',
      accessorFn: (row) => row.last_activity_date, // Maps to computed field
      cell: ({ row }) => {
        const { interaction_count, last_activity_date, last_activity_type, days_since_activity } =
          row.original
        return (
          <div className="space-y-1">
            {interaction_count !== undefined && (
              <div className="text-sm font-medium text-foreground">
                {interaction_count} interaction{interaction_count !== 1 ? 's' : ''}
              </div>
            )}
            {last_activity_type && (
              <div className="text-xs text-muted-foreground">{last_activity_type}</div>
            )}
            {last_activity_date && (
              <div
                className={cn(
                  'text-xs',
                  (days_since_activity || 0) > 14
                    ? 'text-destructive'
                    : (days_since_activity || 0) > 7
                      ? 'text-warning'
                      : 'text-muted-foreground'
                )}
              >
                {formatTimeAgo(last_activity_date)}
              </div>
            )}
            {!interaction_count && !last_activity_date && <EmptyCell />}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <OpportunityActionsDropdown opportunity={row.original} actions={actions} />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 80,
    }
  )

  return columns
}

// Default export for convenience
export const opportunityColumns = createOpportunityColumns()
