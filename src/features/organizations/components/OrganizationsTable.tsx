import React from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrganizationsFilters } from './OrganizationsFilters'
import { OrganizationRow } from './OrganizationRow'
import { useOrganizationsFiltering } from '@/features/organizations/hooks/useOrganizationsFiltering'
import { useOrganizationsDisplay } from '@/features/organizations/hooks/useOrganizationsDisplay'
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

      {/* Table Container */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">Organization</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">Phone</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[150px]">Managers</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">Location</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-gray-500">
                        {activeFilter !== 'all' ? 'No organizations match your criteria' : 'No organizations found'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {activeFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first organization'}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrganizations.map((organization) => (
                  <OrganizationRow
                    key={organization.id}
                    organization={organization}
                    isExpanded={isRowExpanded(organization.id)}
                    onToggleExpansion={() => toggleRowExpansion(organization.id)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    onContact={onContact}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
    </div>
  )
}