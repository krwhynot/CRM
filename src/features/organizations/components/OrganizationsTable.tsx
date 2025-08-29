import { useState } from 'react'
import { SimpleTable } from '@/components/ui/simple-table'
import { OrganizationsFilters } from './OrganizationsFilters'
import { OrganizationRow } from './OrganizationRow'
import { BulkActionsToolbar } from './BulkActionsToolbar'
import { BulkDeleteDialog } from './BulkDeleteDialog'
import { useOrganizationsFiltering } from '@/features/organizations/hooks/useOrganizationsFiltering'
import { useOrganizationsDisplay } from '@/features/organizations/hooks/useOrganizationsDisplay'
import { useDeleteOrganization } from '@/features/organizations/hooks/useOrganizations'
import { Checkbox } from '@/components/ui/checkbox'
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
    type: 'customer' as any,
    priority: 'A',
    segment: 'Restaurant',
    phone: '(555) 123-4567',
    primary_manager_name: 'John Smith',
    address_line_1: '123 Main St',
    city: 'New York',
    state_province: 'NY',
    website: 'https://linkedin.com/company/040kitchen',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: '2D RESTAURANT GROUP',
    type: 'customer' as any,
    priority: 'B',
    segment: 'Fine Dining',
    phone: '(555) 234-5678',
    primary_manager_name: 'Sarah Johnson',
    secondary_manager_name: 'Mike Davis',
    address_line_1: '456 Oak Ave',
    city: 'Los Angeles',
    state_province: 'CA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'ACME FOOD DISTRIBUTORS',
    type: 'distributor' as any,
    priority: 'A',
    segment: 'Distribution',
    phone: '(555) 345-6789',
    primary_manager_name: 'David Wilson',
    address_line_1: '789 Industrial Blvd',
    city: 'Chicago',
    state_province: 'IL',
    website: 'https://linkedin.com/company/acmefood',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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

  // Headers configuration for SimpleTable
  const headers = [
    { label: 'Select all organizations', isCheckbox: true },
    '',
    'Organization', 
    'Phone', 
    'Managers', 
    'Location', 
    'Actions'
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }
  
  const renderOrganizationRow = (organization: Organization, isExpanded: boolean, onToggle: () => void) => (
    <OrganizationRow
      key={organization.id}
      organization={organization}
      isExpanded={isRowExpanded(organization.id)}
      onToggleExpansion={() => toggleRowExpansion(organization.id)}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
      onContact={onContact}
      isSelected={selectedIds.includes(organization.id)}
      onSelect={() => handleRowSelect(organization.id)}
    />
  )

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

      {/* Table Container */}
      <SimpleTable
        data={filteredOrganizations}
        loading={loading}
        headers={headers}
        renderRow={renderOrganizationRow}
        emptyMessage={activeFilter !== 'all' ? 'No organizations match your criteria' : 'No organizations found'}
        emptySubtext={activeFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first organization'}
        colSpan={7}
        selectedCount={selectedIds.length}
        totalCount={filteredOrganizations.length}
        onSelectAll={(checked) => {
          if (checked) {
            setSelectedIds(filteredOrganizations.map(org => org.id))
          } else {
            setSelectedIds([])
          }
        }}
      />

      {/* Results Summary */}
      {filteredOrganizations.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 px-1">
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