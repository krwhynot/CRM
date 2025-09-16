import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { BulkActionsToolbar } from './BulkActionsToolbar'
import { BulkDeleteDialog } from './BulkDeleteDialog'
import { OrganizationBadges } from './OrganizationBadges'
import { OrganizationActions } from './OrganizationActions'
import { useOrganizationsDisplay } from '@/features/organizations/hooks/useOrganizationsDisplay'
import { useDeleteOrganization } from '@/features/organizations/hooks/useOrganizations'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Package, TrendingUp, Users } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/metrics-utils'
import { toast } from '@/lib/toast-styles'
import type { Organization } from '@/types/entities'
import type { OrganizationWeeklyFilters } from '@/types/shared-filters.types'

// Extended organization interface with weekly context
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

interface OrganizationsTableProps {
  organizations?: OrganizationWithWeeklyContext[]
  loading?: boolean
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
  onAddNew?: () => void
  filters?: OrganizationWeeklyFilters
  onFiltersChange?: (filters: OrganizationWeeklyFilters) => void
}

const DEFAULT_ORGANIZATIONS: OrganizationWithWeeklyContext[] = [
  {
    id: '1',
    name: '040 KITCHEN INC',
    type: 'customer',
    priority: 'A',
    segment: 'Restaurant',
    phone: '(555) 123-4567',
    primary_manager_name: 'John Smith',
    address_line_1: '123 Main St',
    address_line_2: null,
    city: 'New York',
    state_province: 'NY',
    postal_code: null,
    country: null,
    website: 'https://linkedin.com/company/040kitchen',
    email: null,
    description: null,
    secondary_manager_name: null,
    notes: null,
    is_principal: false,
    is_distributor: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    updated_by: null,
    deleted_at: null,
    import_notes: null,
    industry: null,
    is_active: true,
    parent_organization_id: null,
    search_tsv: null,
  },
  {
    id: '2',
    name: '2D RESTAURANT GROUP',
    type: 'customer',
    priority: 'B',
    segment: 'Fine Dining',
    phone: '(555) 234-5678',
    primary_manager_name: 'Sarah Johnson',
    secondary_manager_name: 'Mike Davis',
    address_line_1: '456 Oak Ave',
    address_line_2: null,
    city: 'Los Angeles',
    state_province: 'CA',
    postal_code: null,
    country: null,
    website: null,
    email: null,
    description: null,
    notes: null,
    is_principal: false,
    is_distributor: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    updated_by: null,
    deleted_at: null,
    import_notes: null,
    industry: null,
    is_active: true,
    parent_organization_id: null,
    search_tsv: null,
  },
  {
    id: '3',
    name: 'ACME FOOD DISTRIBUTORS',
    type: 'distributor',
    priority: 'A',
    segment: 'Distribution',
    phone: '(555) 345-6789',
    primary_manager_name: 'David Wilson',
    secondary_manager_name: null,
    address_line_1: '789 Industrial Blvd',
    address_line_2: null,
    city: 'Chicago',
    state_province: 'IL',
    postal_code: null,
    country: null,
    website: 'https://linkedin.com/company/acmefood',
    email: null,
    description: null,
    notes: null,
    is_principal: false,
    is_distributor: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    updated_by: null,
    deleted_at: null,
    import_notes: null,
    industry: null,
    is_active: true,
    parent_organization_id: null,
    search_tsv: null,
  },
]

export function OrganizationsTable({
  organizations = DEFAULT_ORGANIZATIONS,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onContact,
  onAddNew,
  filters,
  onFiltersChange,
}: OrganizationsTableProps) {
  // Selection state management
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Enhanced filtering state
  const [organizationFilters, setOrganizationFilters] = useState<OrganizationWeeklyFilters>({
    timeRange: 'this_month',
    principal: 'all',
    quickView: 'none',
    search: '',
    ...filters // merge any filters passed as props
  })

  // Hooks
  const deleteOrganization = useDeleteOrganization()

  // Simple filtering logic (using the new weekly pattern)
  const filteredOrganizations = organizations.filter(organization => {
    // Apply search filter
    if (organizationFilters.search) {
      const searchTerm = organizationFilters.search.toLowerCase()
      const matchesSearch = (
        organization.name?.toLowerCase().includes(searchTerm) ||
        organization.primary_manager_name?.toLowerCase().includes(searchTerm) ||
        organization.phone?.toLowerCase().includes(searchTerm) ||
        organization.segment?.toLowerCase().includes(searchTerm) ||
        organization.city?.toLowerCase().includes(searchTerm)
      )
      if (!matchesSearch) return false
    }

    // Apply quick view filters
    if (organizationFilters.quickView && organizationFilters.quickView !== 'none') {
      switch (organizationFilters.quickView) {
        case 'high_engagement':
          return organization.high_engagement_this_week || (organization.weekly_engagement_score || 0) > 70
        case 'multiple_opportunities':
          return (organization.active_opportunities || 0) > 1
        case 'inactive_orgs':
          return organization.inactive_status || (organization.weekly_engagement_score || 0) < 30
        default:
          break
      }
    }

    return true
  })

  // Handle filter changes
  const handleFiltersChange = (newFilters: OrganizationWeeklyFilters) => {
    setOrganizationFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const { toggleRowExpansion, isRowExpanded } = useOrganizationsDisplay(
    organizations.map((org) => org.id)
  )

  const handleSelectAllFromToolbar = () => {
    setSelectedIds(filteredOrganizations.map((org) => org.id))
  }

  const handleSelectNoneFromToolbar = () => {
    setSelectedIds([])
  }

  const handleRowSelect = (organizationId: string) => {
    setSelectedIds((prev) =>
      prev.includes(organizationId)
        ? prev.filter((id) => id !== organizationId)
        : [...prev, organizationId]
    )
  }

  // Get selected organizations for dialog
  const selectedOrganizations = organizations.filter((org) => selectedIds.includes(org.id))

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

  // Helper component for empty cell display
  const EmptyCell = () => <span className="italic text-gray-400">Not provided</span>

  // Expandable content renderer
  const renderExpandableContent = (organization: OrganizationWithWeeklyContext) => (
    <div className="space-y-6">
      {/* Principal Products & Metrics Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <h4 className="mb-2 font-medium text-gray-900">Top Principal Products</h4>
          <div className="space-y-2">
            {organization.top_principal_products && organization.top_principal_products.length > 0 ? (
              organization.top_principal_products.slice(0, 3).map((product, index) => (
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

  // Column definitions for DataTable
  const organizationColumns: DataTableColumn<OrganizationWithWeeklyContext>[] = [
    {
      key: 'selection',
      header: (
        <Checkbox
          checked={selectedIds.length > 0 && selectedIds.length === filteredOrganizations.length}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedIds(filteredOrganizations.map((org) => org.id))
            } else {
              setSelectedIds([])
            }
          }}
          aria-label="Select all organizations"
        />
      ),
      cell: (organization) => (
        <Checkbox
          checked={selectedIds.includes(organization.id)}
          onCheckedChange={() => handleRowSelect(organization.id)}
          aria-label={`Select ${organization.name}`}
        />
      ),
      className: 'w-12',
    },
    {
      key: 'expansion',
      header: '',
      cell: (organization) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRowExpansion(organization.id)}
          className="h-auto p-0 hover:bg-transparent"
        >
          {isRowExpanded(organization.id) ? (
            <ChevronDown className="size-4 text-gray-500" />
          ) : (
            <ChevronRight className="size-4 text-gray-500" />
          )}
        </Button>
      ),
      className: 'w-8',
    },
    {
      key: 'organization',
      header: 'Organization',
      cell: (organization) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-gray-900">
              {organization.name || <EmptyCell />}
            </div>
            {organization.high_engagement_this_week && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <TrendingUp className="size-3 text-green-500" />
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
                      <Users className="size-3 text-blue-500" />
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
                      <span className="size-2 animate-pulse rounded-full bg-red-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Low activity - needs attention</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <OrganizationBadges
              priority={organization.priority}
              type={organization.type}
              segment={organization.segment}
            />
            {(organization.active_opportunities || 0) > 0 && (
              <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                {organization.active_opportunities} active opp{(organization.active_opportunities || 0) !== 1 ? 's' : ''}
              </Badge>
            )}
            {(organization.total_products || 0) > 0 && (
              <Badge variant="secondary" className="border-gray-200 bg-gray-50 text-xs text-gray-700">
                {organization.total_products} product{(organization.total_products || 0) !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Weekly engagement score */}
          {organization.weekly_engagement_score && organization.weekly_engagement_score > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Engagement:</span>
              <div className="flex items-center">
                <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      organization.weekly_engagement_score >= 70 ? "bg-green-500" :
                      organization.weekly_engagement_score >= 40 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${organization.weekly_engagement_score}%` }}
                  />
                </div>
                <span className="ml-1 text-xs text-gray-400">{organization.weekly_engagement_score}</span>
              </div>
            </div>
          )}
        </div>
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
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {organization.primary_manager_name || <EmptyCell />}
          </div>
          {organization.secondary_manager_name && (
            <div className="text-xs text-gray-600">+ {organization.secondary_manager_name}</div>
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

  return (
    <div className="space-y-4">
      {/* Note: Filters component removed - OrganizationsList now uses ResponsiveFilterWrapper */}

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        totalCount={filteredOrganizations.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAllFromToolbar}
        onSelectNone={handleSelectNoneFromToolbar}
      />

      {/* Table Container with Integrated Row Expansion */}
      <DataTable<Organization>
        data={filteredOrganizations}
        columns={organizationColumns}
        loading={loading}
        rowKey={(organization) => organization.id}
        expandableContent={renderExpandableContent}
        expandedRows={filteredOrganizations
          .filter((organization) => isRowExpanded(organization.id))
          .map((organization) => organization.id)}
        onToggleRow={toggleRowExpansion}
        empty={{
          title: organizationFilters.search || organizationFilters.quickView !== 'none' 
            ? 'No organizations match your criteria'
            : 'No organizations found',
          description: organizationFilters.search || organizationFilters.quickView !== 'none'
            ? 'Try adjusting your filters'
            : 'Get started by adding your first organization',
        }}
      />

      {/* Results Summary */}
      {filteredOrganizations.length > 0 && (
        <div className="flex items-center justify-between px-1 text-sm text-gray-500">
          <span>
            Showing {filteredOrganizations.length} of {organizations.length} organizations
          </span>
          <span>
            {organizationFilters.quickView !== 'none' &&
              `Quick View: ${organizationFilters.quickView?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
          </span>
        </div>
      )}

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        organizations={selectedOrganizations}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
