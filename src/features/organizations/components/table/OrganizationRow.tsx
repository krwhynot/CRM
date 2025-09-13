import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { OrganizationBadges } from '../OrganizationBadges'
import { OrganizationActions } from '../OrganizationActions'
import { TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Organization } from '@/types/entities'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { semanticSpacing, semanticTypography, semanticColors } from '@/styles/tokens'

// Extended organization interface with weekly context
interface OrganizationWithWeeklyContext extends Organization {
  top_principal_products?: Array<{
    id: string
    name: string
    category?: string
    list_price?: number
    opportunity_count?: number
  }>
  total_opportunities?: number
  active_opportunities?: number
  total_products?: number
  weekly_engagement_score?: number
  last_interaction_date?: string | Date
  high_engagement_this_week?: boolean
  multiple_opportunities?: boolean
  inactive_status?: boolean
}

export function useOrganizationColumns({
  selectedItems,
  onSelectAll,
  onSelectItem,
  onToggleExpansion,
  isRowExpanded,
  onEdit,
  onDelete,
  onView,
  onContact,
}: {
  selectedItems: Set<string>
  onSelectAll: (checked: boolean, items: OrganizationWithWeeklyContext[]) => void
  onSelectItem: (id: string, checked: boolean) => void
  onToggleExpansion?: (id: string) => void
  isRowExpanded?: (id: string) => boolean
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
}) {
  // Helper component for empty cell display
  const EmptyCell = () => (
    <span className={`italic ${semanticTypography.dataMeta}`}>Not provided</span>
  )

  const columns: DataTableColumn<OrganizationWithWeeklyContext>[] = [
    {
      key: 'selection',
      header: (sortedOrganizations: OrganizationWithWeeklyContext[]) => (
        <Checkbox
          checked={selectedItems.size > 0 && selectedItems.size === sortedOrganizations.length}
          onCheckedChange={(checked) => onSelectAll(!!checked, sortedOrganizations)}
          aria-label="Select all organizations"
        />
      ),
      cell: (organization) => (
        <Checkbox
          checked={selectedItems.has(organization.id)}
          onCheckedChange={(checked) => onSelectItem(organization.id, !!checked)}
          aria-label={`Select ${organization.name}`}
          className={semanticSpacing.interactiveElement}
        />
      ),
    },
    ...(onToggleExpansion && isRowExpanded
      ? [
          {
            key: 'expansion',
            header: '',
            cell: (organization: OrganizationWithWeeklyContext) => (
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpansion(organization.id)
                }}
                className={cn(
                  semanticSpacing.interactiveElement,
                  'transition-transform duration-200',
                  isRowExpanded(organization.id) && 'rotate-90'
                )}
                aria-label={`${isRowExpanded(organization.id) ? 'Collapse' : 'Expand'} organization details`}
              >
                <span className="sr-only">Toggle row expansion</span>▶
              </Button>
            ),
          } as DataTableColumn<OrganizationWithWeeklyContext>,
        ]
      : []),
    {
      key: 'organization',
      header: 'Organization',
      cell: (organization) => (
        <OrganizationNameCell organization={organization} EmptyCell={EmptyCell} />
      ),
      className: 'font-medium',
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (organization) => (
        <span className="text-foreground">{organization.phone || <EmptyCell />}</span>
      ),
      hidden: { sm: true },
    },
    {
      key: 'managers',
      header: 'Managers',
      cell: (organization) => (
        <div className={semanticSpacing.stack.xxs}>
          <div className={cn(semanticTypography.label, semanticTypography.body, 'text-gray-900')}>
            {organization.primary_manager_name || <EmptyCell />}
          </div>
          {organization.secondary_manager_name && (
            <div className={`${semanticTypography.caption} text-gray-600`}>
              + {organization.secondary_manager_name}
            </div>
          )}
        </div>
      ),
      hidden: { sm: true, md: true },
    },
    {
      key: 'location',
      header: 'Location',
      cell: (organization) => {
        if (organization.city && organization.state_province) {
          return `${organization.city}, ${organization.state_province}`
        }
        if (organization.city) {
          return organization.city
        }
        if (organization.state_province) {
          return organization.state_province
        }
        return <EmptyCell />
      },
      hidden: { sm: true },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (organization) => (
        <OrganizationActions
          organization={organization}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onContact={onContact}
        />
      ),
      className: 'w-20',
    },
  ]

  return columns
}

function OrganizationNameCell({
  organization,
  EmptyCell,
}: {
  organization: OrganizationWithWeeklyContext
  EmptyCell: () => JSX.Element
}) {
  return (
    <div className={semanticSpacing.stack.xs}>
      <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
        <div
          className={cn(
            semanticTypography.h4,
            semanticTypography.entityTitle,
            semanticColors.text.primary
          )}
        >
          {organization.name || <EmptyCell />}
        </div>
        {organization.high_engagement_this_week && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <TrendingUp className={`size-3 ${semanticColors.success.primary}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>High engagement this week</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {organization.multiple_opportunities && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Users className={`size-3 ${semanticColors.info.primary}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Multiple active opportunities</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {organization.inactive_status && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <span
                    className={cn(
                      semanticRadius.full,
                      'size-2 animate-pulse',
                      semanticColors.error.primary
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Low activity - needs attention</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
        <OrganizationBadges
          priority={organization.priority}
          type={organization.type}
          segment={organization.segment}
        />
        {(organization.active_opportunities || 0) > 0 && (
          <Badge
            variant="secondary"
            className={`${semanticColors.info.background} ${semanticColors.info.border} ${semanticTypography.caption} ${semanticColors.info.foreground}`}
          >
            {organization.active_opportunities} active opp
            {(organization.active_opportunities || 0) !== 1 ? 's' : ''}
          </Badge>
        )}
        {(organization.total_products || 0) > 0 && (
          <Badge
            variant="secondary"
            className={`${semanticColors.neutral.background} ${semanticColors.neutral.border} ${semanticTypography.caption} ${semanticColors.neutral.foreground}`}
          >
            {organization.total_products} product
            {(organization.total_products || 0) !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Weekly engagement score */}
      {organization.weekly_engagement_score && organization.weekly_engagement_score > 0 && (
        <div className={`flex items-center ${semanticSpacing.gap.xxs}`}>
          <span className={`${semanticTypography.caption} ${semanticColors.text.tertiary}`}>
            Engagement:
          </span>
          <div className="flex items-center">
            <div className={cn(semanticRadius.full, 'h-1.5 w-12 overflow-hidden bg-gray-200')}>
              <div
                className={cn(
                  'h-full rounded-full',
                  organization.weekly_engagement_score >= 70
                    ? semanticColors.success.primary
                    : organization.weekly_engagement_score >= 40
                      ? semanticColors.warning.primary
                      : semanticColors.error.primary
                )}
                style={{ width: `${organization.weekly_engagement_score}%` }}
              />
            </div>
            <span
              className={`${semanticSpacing.leftGap.xxs} ${semanticTypography.caption} ${semanticColors.text.tertiary}`}
            >
              {organization.weekly_engagement_score}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
