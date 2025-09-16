import { useState, useMemo } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { InteractionsTableActions } from './InteractionsTableActions'
import { BulkActionsToolbar } from '@/components/bulk-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { toast } from '@/lib/toast-styles'
import type { InteractionWithRelations, InteractionFilters } from '@/types/interaction.types'
import { DEFAULT_WEEKLY_FILTERS } from '@/types/shared-filters.types'
import { useInteractionIconMapping } from '@/features/interactions/hooks/useInteractionIconMapping'
import {
  ChevronDown,
  ChevronRight,
  Building,
  User,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react'

interface InteractionsTableProps {
  interactions?: InteractionWithRelations[]
  filters?: InteractionFilters
  loading?: boolean
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
}

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

export function InteractionsTable({
  interactions = [],
  filters: propFilters,
  loading = false,
  onEdit,
  onDelete,
  onView,
}: InteractionsTableProps) {
  // ✨ Updated to use proper filters state
  const [filters, setFilters] = useState<InteractionFilters>(() => ({
    ...DEFAULT_WEEKLY_FILTERS,
    ...propFilters,
  }))
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const { getInteractionIcon } = useInteractionIconMapping()

  // ✨ Updated filter logic to use filters.search
  const filteredInteractions = useMemo(() => {
    if (!filters?.search) return interactions

    const term = filters.search.toLowerCase()
    return interactions.filter((interaction) => {
      return (
        interaction.subject?.toLowerCase().includes(term) ||
        interaction.description?.toLowerCase().includes(term) ||
        interaction.notes?.toLowerCase().includes(term) ||
        interaction.contact?.first_name?.toLowerCase().includes(term) ||
        interaction.contact?.last_name?.toLowerCase().includes(term) ||
        interaction.organization?.name?.toLowerCase().includes(term) ||
        interaction.opportunity?.name?.toLowerCase().includes(term) ||
        interaction.type.toLowerCase().includes(term) ||
        interaction.outcome?.toLowerCase().includes(term)
      )
    })
  }, [interactions, filters?.search])

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredInteractions.map((i) => i.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSet = new Set(selectedItems)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedItems(newSet)
  }

  // Column definitions
  const columns: DataTableColumn<InteractionWithRelations>[] = [
    {
      key: 'selection',
      header: (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedItems.size > 0 && selectedItems.size === filteredInteractions.length}
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: (interaction) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(interaction.id)}
            className="h-auto p-0"
          >
            {expandedRows.has(interaction.id) ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
          <Checkbox
            checked={selectedItems.has(interaction.id)}
            onCheckedChange={(checked) => handleSelectItem(interaction.id, !!checked)}
            aria-label={`Select ${interaction.subject || 'interaction'}`}
          />
        </div>
      ),
      className: 'w-[80px]',
    },
    {
      key: 'type',
      header: 'Type',
      cell: (interaction) => {
        const icon = getInteractionIcon(interaction.type)
        const colorClass =
          INTERACTION_COLORS[interaction.type] || 'bg-gray-100 text-gray-700 border-gray-200'

        return (
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg border', colorClass)}>{icon}</div>
            <div className="space-y-1">
              <div className="text-sm font-medium capitalize">
                {interaction.type.replace('_', ' ')}
              </div>
              {interaction.duration_minutes && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {interaction.duration_minutes}m
                </div>
              )}
            </div>
          </div>
        )
      },
      className: 'w-[150px]',
    },
    {
      key: 'details',
      header: 'Details',
      cell: (interaction) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{interaction.subject || 'No subject'}</div>
          {interaction.description && (
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {interaction.description}
            </div>
          )}
          <div className="flex items-center gap-2">
            {interaction.follow_up_required && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="mr-1 size-3" />
                Follow-up needed
              </Badge>
            )}
            {interaction.outcome && (
              <Badge variant="outline" className="text-xs capitalize">
                {interaction.outcome.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
      ),
      className: 'min-w-[300px]',
    },
    {
      key: 'relationships',
      header: 'Related To',
      cell: (interaction) => (
        <div className="space-y-1 text-sm">
          {interaction.opportunity && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {interaction.opportunity.name}
              </Badge>
            </div>
          )}
          {interaction.organization && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Building className="size-3" />
              <span className="truncate">{interaction.organization.name}</span>
            </div>
          )}
          {interaction.contact && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="size-3" />
              <span>
                {interaction.contact.first_name} {interaction.contact.last_name}
              </span>
            </div>
          )}
        </div>
      ),
      className: 'w-[250px]',
      hidden: { sm: true },
    },
    {
      key: 'date',
      header: 'Date & Time',
      cell: (interaction) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="size-3 text-muted-foreground" />
            <span className="font-medium">
              {format(parseISO(interaction.interaction_date), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(parseISO(interaction.interaction_date), { addSuffix: true })}
          </div>
          {interaction.follow_up_date && (
            <div className="text-xs text-orange-600">
              Follow-up: {format(parseISO(interaction.follow_up_date), 'MMM d')}
            </div>
          )}
        </div>
      ),
      className: 'w-[150px]',
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (interaction) => (
        <InteractionsTableActions
          interaction={interaction}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ),
      className: 'w-[100px] text-right',
    },
  ]

  // Expandable content for each row
  const renderExpandableContent = (interaction: InteractionWithRelations) => (
    <div className="border-l-4 border-primary/20 bg-muted/30 p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Full Description */}
        <div className="md:col-span-2 lg:col-span-2">
          <h4 className="mb-3 font-medium text-foreground">Full Details</h4>
          <div className="space-y-3">
            {interaction.subject && (
              <div>
                <span className="text-sm font-medium">Subject: </span>
                <span className="text-sm text-muted-foreground">{interaction.subject}</span>
              </div>
            )}
            {interaction.description && (
              <div>
                <span className="text-sm font-medium">Description: </span>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {interaction.description}
                </p>
              </div>
            )}
            {interaction.notes && (
              <div>
                <span className="text-sm font-medium">Notes: </span>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {interaction.notes}
                </p>
              </div>
            )}
            {interaction.outcome && (
              <div>
                <span className="text-sm font-medium">Outcome: </span>
                <Badge variant="outline" className="capitalize">
                  {interaction.outcome.replace('_', ' ')}
                </Badge>
              </div>
            )}
            {interaction.location && (
              <div>
                <span className="text-sm font-medium">Location: </span>
                <span className="text-sm text-muted-foreground">{interaction.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Follow-up Information */}
        <div>
          <h4 className="mb-3 font-medium text-foreground">Follow-up</h4>
          <div className="space-y-2 text-sm">
            {interaction.follow_up_required ? (
              <>
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="font-medium text-destructive">Follow-up Required</span>
                </div>
                {interaction.follow_up_date && (
                  <div>
                    <span className="font-medium">Due: </span>
                    <span>{format(parseISO(interaction.follow_up_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {interaction.follow_up_notes && (
                  <div className="mt-2 rounded bg-muted p-2 text-muted-foreground">
                    {interaction.follow_up_notes}
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground">No follow-up needed</div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="lg:col-span-1">
          <h4 className="mb-3 font-medium text-foreground">Information</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {interaction.duration_minutes && (
              <div>
                <span className="font-medium">Duration: </span>
                {interaction.duration_minutes} minutes
              </div>
            )}
            <div>
              <span className="font-medium">Created: </span>
              {format(parseISO(interaction.created_at), 'MMM d, yyyy h:mm a')}
            </div>
            {interaction.updated_at && interaction.updated_at !== interaction.created_at && (
              <div>
                <span className="font-medium">Updated: </span>
                {format(parseISO(interaction.updated_at), 'MMM d, yyyy h:mm a')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Note: Filters are now handled by ResponsiveFilterWrapper via DataTable integration */}

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="space-y-2">
          <BulkActionsToolbar
            selectedCount={selectedItems.size}
            totalCount={filteredInteractions.length}
            onBulkDelete={() => {
              if (
                confirm(
                  `Delete ${selectedItems.size} interactions? This action cannot be undone.`
                )
              ) {
                toast.success(`Deleted ${selectedItems.size} interactions`)
                setSelectedItems(new Set())
              }
            }}
            onClearSelection={() => setSelectedItems(new Set())}
            onSelectAll={() => setSelectedItems(new Set(filteredInteractions.map(i => i.id)))}
            onSelectNone={() => setSelectedItems(new Set())}
            entityType="interaction"
            entityTypePlural="interactions"
          />

          {/* Additional interaction-specific actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.success(`Marked ${selectedItems.size} interactions as complete`)
                setSelectedItems(new Set())
              }}
              className="rounded bg-green-50 px-3 py-1 text-sm text-green-700 hover:bg-green-100"
            >
              Mark Complete
            </button>
            <button
              onClick={() => {
                toast.success(`Added follow-up requirement to ${selectedItems.size} interactions`)
                setSelectedItems(new Set())
              }}
              className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
            >
              Require Follow-up
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable<InteractionWithRelations>
        data={filteredInteractions}
        columns={columns}
        loading={loading}
        rowKey={(row) => row.id}
        expandableContent={renderExpandableContent}
        expandedRows={Array.from(expandedRows)}
        onToggleRow={toggleRowExpansion}
        emptyMessage="No interactions found"
        emptyDescription="Get started by logging your first customer interaction"
      />
    </div>
  )
}
