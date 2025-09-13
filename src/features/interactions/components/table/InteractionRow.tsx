import type { Column } from '@/components/ui/DataTable'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { InteractionActions } from '../InteractionActions'
import { useInteractionIconMapping } from '../../hooks/useInteractionIconMapping'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
import { Building, User, AlertCircle, Calendar, Clock } from 'lucide-react'
import type { InteractionWithRelations } from '@/types/interaction.types'

// Interaction color mapping with semantic approach
const INTERACTION_COLORS = {
  call: 'bg-primary/10 text-primary border-primary/20',
  email: 'bg-secondary text-secondary-foreground border-secondary',
  meeting: 'bg-primary/20 text-primary border-primary/30',
  note: 'bg-muted text-muted-foreground border-muted',
  demo: 'bg-accent text-accent-foreground border-accent',
  site_visit: 'bg-primary/15 text-primary border-primary/25',
  follow_up: 'bg-accent/50 text-accent-foreground border-accent',
  proposal: 'bg-primary/25 text-primary border-primary/35',
  trade_show: 'bg-secondary/50 text-secondary-foreground border-secondary',
  contract_review: 'bg-destructive/10 text-destructive border-destructive/20',
  in_person: 'bg-primary/30 text-primary border-primary/40',
  quoted: 'bg-accent/30 text-accent-foreground border-accent/50',
  distribution: 'bg-secondary/30 text-secondary-foreground border-secondary/50',
} as const

interface InteractionRowProps {
  selectedItems: Set<string>
  expandedRows: Set<string>
  filteredInteractions: InteractionWithRelations[]
  handleSelectAll: (checked: boolean) => void
  handleSelectItem: (id: string, checked: boolean) => void
  toggleRowExpansion: (id: string) => void
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
}

export function useInteractionColumns({
  selectedItems,
  expandedRows,
  filteredInteractions,
  handleSelectAll,
  handleSelectItem,
  toggleRowExpansion,
  onEdit,
  onDelete,
  onView,
}: InteractionRowProps): Column<InteractionWithRelations>[] {
  const { getInteractionIcon } = useInteractionIconMapping()

  return [
    {
      key: 'select',
      header: (interactions: InteractionWithRelations[]) => (
        <Checkbox
          checked={selectedItems.size > 0 && selectedItems.size === interactions.length}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
          aria-label="Select all interactions"
          className={semanticSpacing.interactiveElement}
        />
      ),
      cell: (interaction) => (
        <Checkbox
          checked={selectedItems.has(interaction.id)}
          onCheckedChange={(checked) => handleSelectItem(interaction.id, !!checked)}
          aria-label={`Select ${interaction.subject || 'interaction'}`}
          className={semanticSpacing.interactiveElement}
        />
      ),
    },
    {
      key: 'expand',
      header: '',
      cell: (interaction) => (
        <Button
          variant="ghost"
          onClick={() => toggleRowExpansion(interaction.id)}
          className={cn(
            semanticSpacing.interactiveElement,
            `transition-transform duration-200`,
            expandedRows.has(interaction.id) && 'rotate-90'
          )}
          aria-label={`${expandedRows.has(interaction.id) ? 'Collapse' : 'Expand'} interaction details`}
        >
          <span className="sr-only">Toggle row expansion</span>▶
        </Button>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (interaction) => {
        const icon = getInteractionIcon(interaction.type)
        const colorClass =
          INTERACTION_COLORS[interaction.type] || 'bg-gray-100 text-gray-700 border-gray-200'

        return (
          <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
            <div className={cn('border', semanticSpacing.compact, semanticRadius.lg, colorClass)}>
              {icon}
            </div>
            <div className={semanticSpacing.verticalContainer}>
              <div className={cn('font-medium capitalize', semanticTypography.body)}>
                {interaction.type.replace('_', ' ')}
              </div>
              {interaction.duration_minutes && (
                <div
                  className={`flex items-center ${semanticSpacing.gap.xs} text-muted-foreground`}
                >
                  <Clock className="size-3" />
                  <span className={semanticTypography.caption}>
                    {interaction.duration_minutes}m
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'subject',
      header: 'Details',
      cell: (row) => {
        const interaction = row

        return (
          <div className={semanticSpacing.verticalContainer}>
            <div className={cn(semanticTypography.h6, semanticTypography.body)}>
              {interaction.subject || 'No subject'}
            </div>
            {interaction.description && (
              <div className={cn('line-clamp-2 text-muted-foreground', semanticTypography.caption)}>
                {interaction.description}
              </div>
            )}
            <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
              {interaction.follow_up_required && (
                <Badge variant="destructive" className={semanticTypography.caption}>
                  <AlertCircle className={`${semanticSpacing.rightGap.xs} size-3`} />
                  Follow-up needed
                </Badge>
              )}
              {interaction.outcome && (
                <Badge variant="outline" className={cn('capitalize', semanticTypography.caption)}>
                  {interaction.outcome.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: 'relationships',
      header: 'Related To',
      cell: (row) => {
        const interaction = row

        return (
          <div className={cn(semanticSpacing.verticalContainer, semanticTypography.body)}>
            {interaction.opportunity && (
              <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                <Badge variant="secondary" className={semanticTypography.caption}>
                  {interaction.opportunity.name}
                </Badge>
              </div>
            )}
            {interaction.organization && (
              <div className={`flex items-center ${semanticSpacing.gap.xs} text-muted-foreground`}>
                <Building className="size-3" />
                <span className="truncate">{interaction.organization.name}</span>
              </div>
            )}
            {interaction.contact && (
              <div className={`flex items-center ${semanticSpacing.gap.xs} text-muted-foreground`}>
                <User className="size-3" />
                <span>
                  {interaction.contact.first_name} {interaction.contact.last_name}
                </span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'interaction_date',
      header: 'Date & Time',
      cell: (row) => {
        const interaction = row

        return (
          <div className={cn(semanticSpacing.verticalContainer, semanticTypography.body)}>
            <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
              <Calendar className="size-3 text-muted-foreground" />
              <span className={`${semanticTypography.label}`}>
                {format(parseISO(interaction.interaction_date), 'MMM d, yyyy')}
              </span>
            </div>
            <div className={cn('text-muted-foreground', semanticTypography.caption)}>
              {formatDistanceToNow(parseISO(interaction.interaction_date), { addSuffix: true })}
            </div>
            {interaction.follow_up_date && (
              <div className={cn('text-destructive', semanticTypography.caption)}>
                Follow-up: {format(parseISO(interaction.follow_up_date), 'MMM d')}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <InteractionActions
          interaction={row}
          onEdit={onEdit}
          onView={onView}
          variant="ghost"
          size="sm"
        />
      ),
    },
  ]
}
