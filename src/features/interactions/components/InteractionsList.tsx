import React, { useState, useCallback } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { createInteractionColumns } from '@/components/data-table/columns/interactions'
import { useStandardDataTable } from '@/hooks/useStandardDataTable'
import { BulkActionsToolbar, BulkDeleteDialog } from '@/components/bulk-actions'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Phone,
  Mail,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  Building,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { toast } from '@/lib/toast-styles'
import { COPY } from '@/lib/copy'
import type { InteractionWithRelations } from '@/types/interaction.types'
import type { EntityFilterState } from '@/components/data-table/filters/EntityFilters'

// Extended interaction interface with additional context
interface InteractionWithContext extends InteractionWithRelations {
  // Additional context fields for enhanced display
  interaction_priority?: 'A+' | 'A' | 'B' | 'C' | 'D'
  weekly_interaction_count?: number
  last_follow_up_date?: string | Date
  engagement_score?: number
}

interface InteractionsListProps {
  interactions?: InteractionWithContext[]
  loading?: boolean
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
  onContact?: (interaction: InteractionWithRelations) => void
  onAddNew?: () => void
}

// Interaction type colors mapping
const INTERACTION_COLORS = {
  call: 'bg-blue-50 text-blue-700 border-blue-200',
  email: 'bg-green-50 text-green-700 border-green-200',
  meeting: 'bg-purple-50 text-purple-700 border-purple-200',
  demo: 'bg-orange-50 text-orange-700 border-orange-200',
  proposal: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  follow_up: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  trade_show: 'bg-pink-50 text-pink-700 border-pink-200',
  site_visit: 'bg-teal-50 text-teal-700 border-teal-200',
  contract_review: 'bg-red-50 text-red-700 border-red-200',
  in_person: 'bg-blue-100 text-blue-800 border-blue-300',
  quoted: 'bg-green-100 text-green-800 border-green-300',
  distribution: 'bg-gray-50 text-gray-700 border-gray-200',
} as const

export function InteractionsList({
  interactions = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  onContact,
  onAddNew,
}: InteractionsListProps) {
  // Selection state management
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter state for the new DataTable system
  const [filters, setFilters] = useState<EntityFilterState>({
    timeRange: 'this_month',
    principal: 'all',
    quickView: 'none',
    search: '',
  })

  // Standard DataTable configuration with ResponsiveFilterWrapper
  const { dataTableProps } = useStandardDataTable({
    useResponsiveFilters: true,
    responsiveFilterTitle: 'Interaction Filters',
    responsiveFilterDescription: 'Filter and search your interactions',
    selectable: true,
    expandable: true,
    searchPlaceholder: 'Search interactions by subject, description, contact, or organization...',
    searchKey: 'subject',
  })

  // Use interactions directly - DataTable will handle filtering via ResponsiveFilterWrapper
  const displayInteractions = interactions

  // Expandable content renderer
  const renderExpandableContent = (interaction: InteractionWithContext) => (
    <div className="space-y-6">
      {/* Interaction Details Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Full Description and Notes */}
        <div className="md:col-span-2">
          <h4 className="mb-2 font-medium text-gray-900">Full Details</h4>
          <div className="space-y-3">
            {interaction.description && (
              <div>
                <span className="text-sm font-medium">Description:</span>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                  {interaction.description}
                </p>
              </div>
            )}
            {interaction.notes && (
              <div>
                <span className="text-sm font-medium">Notes:</span>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                  {interaction.notes}
                </p>
              </div>
            )}
            {interaction.location && (
              <div>
                <span className="text-sm font-medium">Location:</span>
                <span className="ml-2 text-sm text-gray-600">{interaction.location}</span>
              </div>
            )}
            {interaction.outcome && (
              <div>
                <span className="text-sm font-medium">Outcome:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {interaction.outcome.replace('_', ' ')}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Relationships and Context */}
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Related Information</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {interaction.opportunity && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {interaction.opportunity.name}
                </Badge>
              </div>
            )}
            {interaction.organization && (
              <div className="flex items-center gap-1">
                <Building className="size-3 text-gray-500" />
                <span className="truncate">{interaction.organization.name}</span>
              </div>
            )}
            {interaction.contact && (
              <div className="flex items-center gap-1">
                <User className="size-3 text-gray-500" />
                <span>
                  {interaction.contact.first_name} {interaction.contact.last_name}
                </span>
              </div>
            )}
            {interaction.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="size-3 text-gray-500" />
                <span>{interaction.duration_minutes} minutes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up Information */}
      {interaction.follow_up_required && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="size-4 text-orange-600" />
            <h4 className="font-medium text-orange-900">Follow-up Required</h4>
          </div>
          <div className="space-y-1 text-sm text-orange-800">
            {interaction.follow_up_date && (
              <div>
                <span className="font-medium">Due Date:</span>
                <span className="ml-1">
                  {format(parseISO(interaction.follow_up_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {interaction.follow_up_notes && (
              <div>
                <span className="font-medium">Follow-up Notes:</span>
                <p className="mt-1 text-orange-700">{interaction.follow_up_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="border-t pt-4 text-xs text-gray-500">
        <div className="flex justify-between">
          <div>
            <span>Created:</span>
            <span className="ml-1">
              {format(parseISO(interaction.created_at), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          {interaction.updated_at && interaction.updated_at !== interaction.created_at && (
            <div>
              <span>Updated:</span>
              <span className="ml-1">
                {format(parseISO(interaction.updated_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Selection handlers - wrapped in useCallback to prevent infinite re-renders
  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedIds(selectedIds)
  }, [])

  const handleSelectAllFromToolbar = useCallback(() => {
    setSelectedIds(displayInteractions.map((interaction) => interaction.id))
  }, [displayInteractions])

  const handleSelectNoneFromToolbar = useCallback(() => {
    setSelectedIds([])
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const handleBulkDelete = useCallback(() => {
    setDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    let successCount = 0
    let errorCount = 0

    try {
      // Process deletions sequentially for safety
      for (const interactionId of selectedIds) {
        try {
          // Call the actual delete function when available
          if (onDelete) {
            const interaction = interactions.find((i) => i.id === interactionId)
            if (interaction) {
              onDelete(interaction)
            }
          }
          successCount++
        } catch (error) {
          errorCount++
        }
      }

      // Show results to user
      if (successCount > 0 && errorCount === 0) {
        toast.success(
          `Successfully archived ${successCount} interaction${successCount !== 1 ? 's' : ''}`
        )
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Archived ${successCount} interactions, but ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to archive ${errorCount} interaction${errorCount !== 1 ? 's' : ''}`)
      }

      // Clear selection if any operations succeeded
      if (successCount > 0) {
        setSelectedIds([])
      }
    } catch (error) {
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Get selected interactions for dialog
  const selectedInteractions = interactions.filter((interaction) =>
    selectedIds.includes(interaction.id)
  )

  // Create columns with actions
  const columns = createInteractionColumns({
    onEdit,
    onDelete,
    onView,
    onContact,
  })

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.length}
          totalCount={displayInteractions.length}
          onBulkDelete={handleBulkDelete}
          onClearSelection={handleClearSelection}
          onSelectAll={handleSelectAllFromToolbar}
          onSelectNone={handleSelectNoneFromToolbar}
          entityType="interaction"
          entityTypePlural="interactions"
        />
      )}

      {/* Data Table with integrated ResponsiveFilterWrapper */}
      <DataTable<InteractionWithContext, unknown>
        {...dataTableProps}
        data={displayInteractions}
        columns={columns}
        loading={loading}
        expandedContent={renderExpandableContent}
        onSelectionChange={handleSelectionChange}
        entityFilters={filters}
        onEntityFiltersChange={setFilters}
        statuses={[
          { value: 'call', label: 'Call' },
          { value: 'email', label: 'Email' },
          { value: 'meeting', label: 'Meeting' },
          { value: 'demo', label: 'Demo' },
          { value: 'proposal', label: 'Proposal' },
          { value: 'follow_up', label: 'Follow-up' },
          { value: 'trade_show', label: 'Trade Show' },
          { value: 'site_visit', label: 'Site Visit' },
          { value: 'contract_review', label: 'Contract Review' },
          { value: 'in_person', label: 'In Person' },
          { value: 'quoted', label: 'Quoted' },
          { value: 'distribution', label: 'Distribution' },
        ]}
        totalCount={interactions.length}
        filteredCount={displayInteractions.length}
        emptyState={{
          title: 'No interactions found',
          description: 'Get started by logging your first customer interaction',
          action: onAddNew ? (
            <Button onClick={onAddNew} className="flex items-center gap-2">
              <Plus className="size-4" />
              Add Interaction
            </Button>
          ) : undefined,
        }}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entities={selectedInteractions}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        entityType="interaction"
        entityTypePlural="interactions"
      />
    </div>
  )
}
