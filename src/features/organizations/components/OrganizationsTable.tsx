import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { OrganizationsFilters } from './OrganizationsFilters'
import { BulkActionsToolbar } from './BulkActionsToolbar'
import { BulkDeleteDialog } from './BulkDeleteDialog'
import { OrganizationBadges } from './OrganizationBadges'
import { OrganizationActions } from './OrganizationActions'
import { useOrganizationsFiltering } from '@/features/organizations/hooks/useOrganizationsFiltering'
import { useOrganizationsDisplay } from '@/features/organizations/hooks/useOrganizationsDisplay'
import { useDeleteOrganization } from '@/features/organizations/hooks/useOrganizations'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from '@/lib/toast-styles'
import type { Organization } from '@/types/entities'

interface OrganizationsTableProps {
  organizations?: Organization[]
  loading?: boolean
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
  onAddNew?: () => void
}

const DEFAULT_ORGANIZATIONS: Organization[] = [
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
    deleted_at: null
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
    deleted_at: null
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
    deleted_at: null
  }
]

export function OrganizationsTable({ 
  organizations = DEFAULT_ORGANIZATIONS, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onContact,
  onAddNew 
}: OrganizationsTableProps) {
  // Selection state management
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  

  // Hooks
  const deleteOrganization = useDeleteOrganization()

  // Extract business logic to custom hooks
  const {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredOrganizations,
    filterPills
  } = useOrganizationsFiltering(organizations)

  const { toggleRowExpansion, isRowExpanded } = useOrganizationsDisplay(
    organizations.map(org => org.id)
  )


  const handleSelectAllFromToolbar = () => {
    setSelectedIds(filteredOrganizations.map(org => org.id))
  }

  const handleSelectNoneFromToolbar = () => {
    setSelectedIds([])
  }

  const handleRowSelect = (organizationId: string) => {
    setSelectedIds(prev => 
      prev.includes(organizationId)
        ? prev.filter(id => id !== organizationId)
        : [...prev, organizationId]
    )
  }

  // Get selected organizations for dialog
  const selectedOrganizations = organizations.filter(org => selectedIds.includes(org.id))

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
          console.error(`Failed to delete organization ${organizationId}:`, error)
          results.push({ 
            id: organizationId, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
          errorCount++
        }
      }

      // Show results to user
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully archived ${successCount} organization${successCount !== 1 ? 's' : ''}`)
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Archived ${successCount} organizations, but ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to archive ${errorCount} organization${errorCount !== 1 ? 's' : ''}`)
      }

      // Clear selection if any operations succeeded
      if (successCount > 0) {
        const successfulIds = results
          .filter(r => r.status === 'success')
          .map(r => r.id)
        
        setSelectedIds(prev => prev.filter(id => !successfulIds.includes(id)))
      }
      
    } catch (error) {
      console.error('Unexpected error during bulk delete:', error)
      toast.error('An unexpected error occurred during bulk deletion')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Helper component for empty cell display  
  const EmptyCell = () => (
    <span className="italic text-gray-400">Not provided</span>
  )

  // Column definitions for DataTable
  const organizationColumns: DataTableColumn<Organization>[] = [
    {
      key: 'selection',
      header: (
        <Checkbox
          checked={selectedIds.length > 0 && selectedIds.length === filteredOrganizations.length}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedIds(filteredOrganizations.map(org => org.id))
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
      className: "w-12"
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
      className: "w-8"
    },
    {
      key: 'organization',
      header: 'Organization',
      cell: (organization) => (
        <div className="space-y-2">
          <div className="text-base font-semibold text-gray-900">
            {organization.name || <EmptyCell />}
          </div>
          <OrganizationBadges
            priority={organization.priority}
            type={organization.type}
            segment={organization.segment}
          />
        </div>
      ),
      className: "font-medium"
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (organization) => (
        <span className="text-gray-700">
          {organization.phone || <EmptyCell />}
        </span>
      ),
      hidden: { sm: true }
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
            <div className="text-xs text-gray-600">
              + {organization.secondary_manager_name}
            </div>
          )}
        </div>
      ),
      hidden: { sm: true, md: true }
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
      hidden: { sm: true }
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
      className: "w-20"
    }
  ]


  return (
    <div className="space-y-4">
      {/* Filters Component */}
      <OrganizationsFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterPills={filterPills}
        onAddNew={onAddNew}
        totalOrganizations={organizations.length}
        filteredCount={filteredOrganizations.length}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        totalCount={filteredOrganizations.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAllFromToolbar}
        onSelectNone={handleSelectNoneFromToolbar}
      />

      {/* Table Container with Row Expansion */}
      <div className="space-y-0">
        <DataTable<Organization>
          data={filteredOrganizations}
          columns={organizationColumns}
          loading={loading}
          rowKey={(organization) => organization.id}
          empty={{
            title: activeFilter !== 'all' ? 'No organizations match your criteria' : 'No organizations found',
            description: activeFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first organization'
          }}
        />
        
        {/* Expanded Row Details */}
        {filteredOrganizations
          .filter((organization) => isRowExpanded(organization.id))
          .map((organization) => (
            <div 
              key={`${organization.id}-details`} 
              className="-mt-px border-x border-b bg-gray-50/50 p-6"
              style={{ marginTop: '-1px' }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Contact Information */}
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">Contact Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {organization.phone && <div>Phone: {organization.phone}</div>}
                    {organization.website && (
                      <div>
                        Website: <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{organization.website}</a>
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
                    <div>Priority: <span className="font-medium">{organization.priority}</span></div>
                    <div>Type: <span className="font-medium">{organization.type}</span></div>
                    <div>Segment: <span className="font-medium">{organization.segment}</span></div>
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
          ))}
      </div>

      {/* Results Summary */}
      {filteredOrganizations.length > 0 && (
        <div className="flex items-center justify-between px-1 text-sm text-gray-500">
          <span>
            Showing {filteredOrganizations.length} of {organizations.length} organizations
          </span>
          <span>
            {activeFilter !== 'all' && `Filter: ${filterPills.find(p => p.key === activeFilter)?.label}`}
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