import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Pencil, 
  Phone, 
  Eye, 
  ChevronDown, 
  ChevronRight,
  Plus,
  MapPin,
  ExternalLink,
  Briefcase,
  Mail,
  User,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Organization } from '@/types/entities'

interface OrganizationsTableProps {
  organizations: Organization[]
  loading?: boolean
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
  onAddNew?: () => void
}

type FilterType = 'all' | 'high-priority' | 'customers' | 'distributors' | 'recently-contacted'

// Sample data matching requirements
const sampleOrganizations: Organization[] = [
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
  organizations = sampleOrganizations, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onContact,
  onAddNew 
}: OrganizationsTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // Filter pills configuration
  const filterPills = [
    { key: 'all' as FilterType, label: 'All', count: organizations.length },
    { key: 'high-priority' as FilterType, label: 'High Priority', count: 0 },
    { key: 'customers' as FilterType, label: 'Customers', count: 0 },
    { key: 'distributors' as FilterType, label: 'Distributors', count: 0 },
    { key: 'recently-contacted' as FilterType, label: 'Recently Contacted', count: 0 }
  ]

  // Filtered and searched organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations

    // Apply filter
    switch (activeFilter) {
      case 'high-priority':
        filtered = filtered.filter(org => org.priority === 'A' || org.priority === 'A+')
        break
      case 'customers':
        filtered = filtered.filter(org => org.type === 'customer')
        break
      case 'distributors':
        filtered = filtered.filter(org => org.type === 'distributor')
        break
      case 'recently-contacted':
        // TODO: Implement based on interaction data
        break
    }

    // Apply search
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(org => 
        org.name?.toLowerCase().includes(lowercaseSearch) ||
        org.segment?.toLowerCase().includes(lowercaseSearch) ||
        org.city?.toLowerCase().includes(lowercaseSearch) ||
        org.state_province?.toLowerCase().includes(lowercaseSearch) ||
        org.primary_manager_name?.toLowerCase().includes(lowercaseSearch) ||
        org.secondary_manager_name?.toLowerCase().includes(lowercaseSearch) ||
        org.phone?.toLowerCase().includes(lowercaseSearch) ||
        org.email?.toLowerCase().includes(lowercaseSearch)
      )
    }

    return filtered
  }, [organizations, activeFilter, searchTerm])

  // Update filter counts
  const updatedFilterPills = useMemo(() => {
    return filterPills.map(pill => ({
      ...pill,
      count: pill.key === 'all' ? organizations.length :
             pill.key === 'high-priority' ? organizations.filter(org => org.priority === 'A' || org.priority === 'A+').length :
             pill.key === 'customers' ? organizations.filter(org => org.type === 'customer').length :
             pill.key === 'distributors' ? organizations.filter(org => org.type === 'distributor').length :
             pill.key === 'recently-contacted' ? 0 : 0
    }))
  }, [organizations])

  const toggleRowExpansion = (orgId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId)
    } else {
      newExpanded.add(orgId)
    }
    setExpandedRows(newExpanded)
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'A':
      case 'A+':
        return { label: 'HIGH', color: 'bg-red-100 text-red-800 border-red-200' }
      case 'B':
        return { label: 'MEDIUM', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
      case 'C':
      case 'D':
      default:
        return { label: 'LOW', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const EmptyCell = () => <span className="text-gray-400">—</span>

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search organizations..."
            className="pl-10 h-12 text-lg"
            disabled
          />
        </div>
        
        <div className="border rounded-lg bg-white">
          <div className="p-12 text-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="text-lg font-semibold text-gray-700">Loading organizations...</div>
            <div className="text-gray-500">Please wait while we fetch your data</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-2 focus:border-blue-500"
          />
        </div>
        
        {onAddNew && (
          <Button 
            onClick={onAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-12"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Organization
          </Button>
        )}
      </div>

      {/* Sticky Filter Pills */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b pb-4">
        <div className="flex flex-wrap gap-2">
          {updatedFilterPills.map((pill) => (
            <button
              key={pill.key}
              onClick={() => setActiveFilter(pill.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "border-2 flex items-center gap-2",
                activeFilter === pill.key
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {pill.label}
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                activeFilter === pill.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              )}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">Organization</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[100px]">Priority</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[100px]">Type</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[150px]">Primary Manager</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">Phone</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[150px]">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
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
                filteredOrganizations.map((organization, index) => {
                  const isExpanded = expandedRows.has(organization.id)
                  const priorityInfo = getPriorityLabel(organization.priority || 'C')
                  
                  return (
                    <React.Fragment key={organization.id}>
                      {/* Main Row */}
                      <TableRow 
                        className={cn(
                          "hover:bg-gray-50/80 transition-colors border-b",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        )}
                      >
                        {/* Expand Toggle */}
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(organization.id)}
                            className="h-8 w-8 p-0 hover:bg-gray-200"
                          >
                            {isExpanded ? 
                              <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            }
                          </Button>
                        </TableCell>

                        {/* Organization Name */}
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-gray-900 text-base">
                              {organization.name}
                            </div>
                          </div>
                        </TableCell>

                        {/* Priority Badge */}
                        <TableCell className="text-center">
                          <Badge className={cn("font-medium border", priorityInfo.color)}>
                            {priorityInfo.label}
                          </Badge>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="text-center">
                          <Badge variant="outline" className="capitalize">
                            {organization.type || 'Customer'}
                          </Badge>
                        </TableCell>

                        {/* Primary Manager */}
                        <TableCell>
                          <span className="text-gray-900">
                            {organization.primary_manager_name || <EmptyCell />}
                          </span>
                        </TableCell>

                        {/* Phone */}
                        <TableCell>
                          <span className="text-gray-600 font-mono text-sm">
                            {organization.phone || <EmptyCell />}
                          </span>
                        </TableCell>

                        {/* Quick Actions */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(organization)}
                                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                                title="Edit Organization"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {onContact && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onContact(organization)}
                                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                title="Contact Organization"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {onView && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(organization)}
                                className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Row Details */}
                      {isExpanded && (
                        <TableRow className="border-b-2 border-gray-100">
                          <TableCell 
                            colSpan={7} 
                            className="bg-[--mfb-sage-tint] border-l-4 border-[--mfb-green] p-6 transition-all duration-300 ease-out"
                          >
                            <div className="space-y-6">
                              {/* Address - Full Width */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                  <MapPin className="h-4 w-4" />
                                  Address
                                </div>
                                <div className="text-sm text-gray-600 pl-6">
                                  {organization.address_line_1 ? (
                                    <>
                                      <div>{organization.address_line_1}</div>
                                      {organization.address_line_2 && <div>{organization.address_line_2}</div>}
                                      {(organization.city || organization.state_province) && (
                                        <div>
                                          {organization.city}{organization.city && organization.state_province && ', '}
                                          {organization.state_province} {organization.postal_code}
                                        </div>
                                      )}
                                      {organization.country && <div>{organization.country}</div>}
                                    </>
                                  ) : (
                                    <EmptyCell />
                                  )}
                                </div>
                              </div>

                              {/* Compact Info Row 1: Business Segment + Secondary Manager */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Briefcase className="h-4 w-4" />
                                    Business Segment
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6">
                                    {organization.segment || <EmptyCell />}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <User className="h-4 w-4" />
                                    Secondary Manager
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6">
                                    {organization.secondary_manager_name || <EmptyCell />}
                                  </div>
                                </div>
                              </div>

                              {/* Compact Info Row 2: Email + LinkedIn */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Mail className="h-4 w-4" />
                                    Email
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6">
                                    {organization.email || <EmptyCell />}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <ExternalLink className="h-4 w-4" />
                                    LinkedIn Profile
                                  </div>
                                  <div className="text-sm pl-6">
                                    {organization.website ? (
                                      <a
                                        href={organization.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                      >
                                        View Profile
                                      </a>
                                    ) : (
                                      <EmptyCell />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Notes - Full Width (only if present) */}
                              {organization.notes && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <FileText className="h-4 w-4" />
                                    Notes
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6">
                                    {organization.notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-500 px-1">
        <span>
          Showing {filteredOrganizations.length} of {organizations.length} organizations
        </span>
        <span>
          {activeFilter !== 'all' && `Filter: ${updatedFilterPills.find(p => p.key === activeFilter)?.label}`}
        </span>
      </div>
    </div>
  )
}