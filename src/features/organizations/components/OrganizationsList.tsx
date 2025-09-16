import React, { useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { createOrganizationColumns } from '@/components/data-table/columns/organizations'
import { useDeleteOrganization } from '@/features/organizations/hooks/useOrganizations'
import { BulkActionsToolbar, BulkDeleteDialog } from '@/components/bulk-actions'
import { EntityListWrapper } from '@/components/layout/EntityListWrapper'
import { useStandardDataTable } from '@/hooks/useStandardDataTable'
import { Package, TrendingUp, Users, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/metrics-utils'
import { toast } from '@/lib/toast-styles'
import type { Organization } from '@/types/entities'
import type { EntityFilterState } from '@/components/data-table/filters/EntityFilters'

// Extended organization interface with weekly context (matches OrganizationsTable.tsx)
interface OrganizationWithWeeklyContext extends Organization {
  // Principal products tracking
  top_principal_products?: Array<{
    id: string
    name: string
    category?: string
    list_price?: number
    opportunity_count?: number
  }>

  // Organization metrics
  total_opportunities?: number
  active_opportunities?: number
  total_products?: number
  weekly_engagement_score?: number
  last_interaction_date?: string | Date

  // Weekly context
  high_engagement_this_week?: boolean
  multiple_opportunities?: boolean
  inactive_status?: boolean
}

interface OrganizationsListProps {
  organizations?: OrganizationWithWeeklyContext[]
  loading?: boolean
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
  onAddNew?: () => void
}

export function OrganizationsList({
  organizations = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  onContact,
  onAddNew,
}: OrganizationsListProps) {
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

  // Hooks
  const deleteOrganization = useDeleteOrganization()

  // Standard DataTable configuration with ResponsiveFilterWrapper
  const { dataTableProps } = useStandardDataTable({
    useResponsiveFilters: true,
    responsiveFilterTitle: 'Organization Filters',
    responsiveFilterDescription: 'Filter and search your organizations',
    selectable: true,
    expandable: true,
  })

  // Use organizations directly - DataTable will handle filtering via ResponsiveFilterWrapper
  const displayOrganizations = organizations

  // Expandable content renderer
  const renderExpandableContent = (organization: OrganizationWithWeeklyContext) => (
    <div className="space-y-6">
      {/* Principal Products & Metrics Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Top Principal Products</h4>
          <div className="space-y-2">
            {organization.top_principal_products && organization.top_principal_products.length > 0 ? (
              organization.top_principal_products.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                  <div className="flex items-center gap-2">
                    <Package className="size-3 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.category && (
                        <div className="text-xs text-gray-500">{product.category}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {product.list_price && (
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.list_price)}
                      </div>
                    )}
                    {product.opportunity_count && product.opportunity_count > 0 && (
                      <div className="text-xs text-blue-600">
                        {product.opportunity_count} opp{product.opportunity_count !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm italic text-gray-400">No principal products</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Organization Metrics</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total Opportunities:</span>
              <span className="font-medium">{organization.total_opportunities || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Opportunities:</span>
              <span className="font-medium text-green-600">{organization.active_opportunities || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Products:</span>
              <span className="font-medium">{organization.total_products || 0}</span>
            </div>
            {organization.weekly_engagement_score && (
              <div className="flex items-center justify-between">
                <span>Engagement Score:</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        organization.weekly_engagement_score >= 70 ? "bg-green-500" :
                        organization.weekly_engagement_score >= 40 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${organization.weekly_engagement_score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{organization.weekly_engagement_score}</span>
                </div>
              </div>
            )}
            {organization.last_interaction_date && (
              <div className="flex justify-between">
                <span>Last Interaction:</span>
                <span className="font-medium">
                  {new Date(organization.last_interaction_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium text-gray-900">Weekly Context</h4>
          <div className="space-y-2">
            {organization.high_engagement_this_week && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="size-3" />
                <span className="text-sm">High engagement this week</span>
              </div>
            )}
            {organization.multiple_opportunities && (
              <div className="flex items-center gap-1 text-blue-600">
                <Users className="size-3" />
                <span className="text-sm">Multiple active opportunities</span>
              </div>
            )}
            {organization.inactive_status && (
              <div className="flex items-center gap-1 text-red-600">
                <span className="text-sm">⚠️ Low activity - needs attention</span>
              </div>
            )}
            {!organization.high_engagement_this_week && !organization.multiple_opportunities && !organization.inactive_status && (
              <span className="text-sm italic text-gray-400">Standard activity level</span>
            )}
          </div>
        </div>
      </div>

      {/* Original organization details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact Information */}
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Contact Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {organization.phone && <div>Phone: {organization.phone}</div>}
            {organization.website && (
              <div>
                Website:{' '}
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  {organization.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Address</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {organization.address_line_1 && <div>{organization.address_line_1}</div>}
            {organization.address_line_2 && <div>{organization.address_line_2}</div>}
            <div>
              {organization.city && organization.state_province
                ? `${organization.city}, ${organization.state_province}`
                : organization.city || organization.state_province || 'Not provided'}
            </div>
            {organization.postal_code && <div>{organization.postal_code}</div>}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Details</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>
              Priority: <span className="font-medium">{organization.priority}</span>
            </div>
            <div>
              Type: <span className="font-medium">{organization.type}</span>
            </div>
            <div>
              Segment: <span className="font-medium">{organization.segment}</span>
            </div>
            {organization.description && (
              <div className="mt-2">
                <span className="font-medium">Description:</span>
                <p className="mt-1">{organization.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Selection handlers
  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedIds(selectedIds)
  }

  const handleSelectAllFromToolbar = () => {
    setSelectedIds(displayOrganizations.map((org) => org.id))
  }

  const handleSelectNoneFromToolbar = () => {
    setSelectedIds([])
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    const results = []
    let successCount = 0
    let errorCount = 0

    try {
      // Process deletions sequentially for maximum safety
      for (const organizationId of selectedIds) {
        try {
          await deleteOrganization.mutateAsync(organizationId)
          results.push({ id: organizationId, status: 'success' })
          successCount++
        } catch (error) {
          // Log error to results for user feedback
          results.push({
            id: organizationId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          errorCount++
        }
      }

      // Show results to user
      if (successCount > 0 && errorCount === 0) {
        toast.success(
          `Successfully archived ${successCount} organization${successCount !== 1 ? 's' : ''}`
        )
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Archived ${successCount} organizations, but ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to archive ${errorCount} organization${errorCount !== 1 ? 's' : ''}`)
      }

      // Clear selection if any operations succeeded
      if (successCount > 0) {
        const successfulIds = results.filter((r) => r.status === 'success').map((r) => r.id)
        setSelectedIds((prev) => prev.filter((id) => !successfulIds.includes(id)))
      }
    } catch (error) {
      // Handle unexpected errors during bulk delete operation
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Get selected organizations for dialog
  const selectedOrganizations = organizations.filter((org) => selectedIds.includes(org.id))

  // Create columns with actions (selection and expansion handled by DataTable)
  const columns = createOrganizationColumns({
    onEdit,
    onDelete,
    onView,
    onContact,
  })

  return (
    <EntityListWrapper
      title="Organizations"
      description="Manage your organization relationships and contacts"
      action={onAddNew ? {
        label: "Add Organization",
        onClick: onAddNew,
        icon: <Plus className="size-4" />
      } : undefined}
    >
      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.length}
          totalCount={displayOrganizations.length}
          onBulkDelete={handleBulkDelete}
          onClearSelection={handleClearSelection}
          onSelectAll={handleSelectAllFromToolbar}
          onSelectNone={handleSelectNoneFromToolbar}
          entityType="organization"
          entityTypePlural="organizations"
        />
      )}

      {/* Data Table with integrated ResponsiveFilterWrapper */}
      <DataTable<OrganizationWithWeeklyContext, any>
        {...dataTableProps}
        data={displayOrganizations}
        columns={columns}
        loading={loading}
        expandedContent={renderExpandableContent}
        onSelectionChange={handleSelectionChange}
        entityFilters={filters}
        onEntityFiltersChange={setFilters}
        priorities={[
          { value: 'high', label: 'High Priority' },
          { value: 'medium', label: 'Medium Priority' },
          { value: 'low', label: 'Low Priority' }
        ]}
        statuses={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'prospect', label: 'Prospect' },
          { value: 'customer', label: 'Customer' }
        ]}
        totalCount={organizations.length}
        filteredCount={displayOrganizations.length}
        emptyState={{
          title: 'No organizations found',
          description: 'Get started by adding your first organization',
          action: onAddNew ? (
            <button onClick={onAddNew} className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" />
              Add Organization
            </button>
          ) : undefined,
        }}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entities={selectedOrganizations}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        entityType="organization"
        entityTypePlural="organizations"
      />
    </EntityListWrapper>
  )
}