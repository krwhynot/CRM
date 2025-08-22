import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PriorityBadge } from '@/components/ui/new/PriorityBadge'
import { TypeIndicator } from '@/components/ui/new/TypeIndicator'
import { QuickActionsBar } from '@/components/ui/new/QuickActionsBar'
import { MoreHorizontal, Pencil, Trash2, Plus, Search, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Organization } from '@/types/entities'

interface OrganizationsTableProps {
  organizations: Organization[]
  loading?: boolean
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onAddNew?: () => void
}

export function OrganizationsTable({ 
  organizations, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onAddNew 
}: OrganizationsTableProps) {
  // Feature flag for new MFB styling (default: enabled, opt-out with 'false')
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false';
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.priority && org.priority.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (org.segment && org.segment.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (org.type && org.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (org.phone && org.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (org.city && org.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (org.state_province && org.state_province.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (org.primary_manager_name && org.primary_manager_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (org.secondary_manager_name && org.secondary_manager_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (org.notes && org.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'A':
        return 'bg-green-100 text-green-800'
      case 'B':
        return 'bg-blue-100 text-blue-800'
      case 'C':
        return 'bg-yellow-100 text-yellow-800'
      case 'D':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }


  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search organizations..."
              className="w-64"
              disabled
            />
          </div>
          {onAddNew && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
          )}
        </div>
        <div className="border rounded-lg">
          <div className="p-8 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-gray-600 font-medium">Loading organizations...</div>
            <div className="text-sm text-gray-400">
              Please wait while we fetch your organization data
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        )}
      </div>

      {/* Quick Actions Bar - only show with new styling */}
      {USE_NEW_STYLE && (
        <QuickActionsBar
          onQuickAdd={onAddNew}
          selectedCount={0} // TODO: Implement selection state
          onBulkAction={(action: string) => {
            console.log('Bulk action selected:', action);
            // TODO: Implement bulk operations
          }}
        />
      )}

      <div className="border rounded-lg overflow-x-auto">
        <Table className={cn(USE_NEW_STYLE && "compact-table")}>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Organization</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="min-w-[120px]">Segment</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="min-w-[120px]">LinkedIn</TableHead>
              <TableHead className="min-w-[150px]">Address</TableHead>
              <TableHead className="min-w-[120px]">Primary Manager</TableHead>
              <TableHead className="min-w-[120px]">Secondary Manager</TableHead>
              <TableHead className="min-w-[100px]">Notes</TableHead>
              <TableHead className="text-right min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No organizations match your search.' : 'No organizations found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrganizations.map((organization) => (
                <TableRow key={organization.id}>
                  {/* Organization Name */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {USE_NEW_STYLE && (
                        <TypeIndicator type={organization.type as any || 'Customer'} />
                      )}
                      <span className="truncate max-w-[250px] font-semibold">
                        {organization.name}
                      </span>
                    </div>
                  </TableCell>
                  
                  {/* Priority */}
                  <TableCell>
                    {USE_NEW_STYLE ? (
                      <PriorityBadge priority={organization.priority as 'A+' | 'A' | 'B' | 'C' | 'D' || 'C'} />
                    ) : (
                      <Badge className={getPriorityColor(organization.priority)}>
                        {organization.priority || 'C'}
                      </Badge>
                    )}
                  </TableCell>
                  
                  {/* Type */}
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {organization.type || 'Customer'}
                    </Badge>
                  </TableCell>
                  
                  {/* Segment */}
                  <TableCell>
                    <span className="text-sm">{organization.segment || '-'}</span>
                  </TableCell>
                  
                  {/* Phone */}
                  <TableCell>
                    <span className="text-sm">{organization.phone || '-'}</span>
                  </TableCell>
                  
                  {/* LinkedIn/Website */}
                  <TableCell>
                    {organization.website ? (
                      <a 
                        href={organization.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                        title={organization.website}
                      >
                        LinkedIn
                        <ExternalLink className="h-3 w-3 ml-1 inline" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  
                  {/* Address */}
                  <TableCell>
                    <div className="text-sm">
                      {organization.address_line_1 && (
                        <div className="truncate max-w-[140px]" title={organization.address_line_1}>
                          {organization.address_line_1}
                        </div>
                      )}
                      {organization.city && organization.state_province ? (
                        <div className="text-gray-500 text-xs">
                          {organization.city}, {organization.state_province} {organization.postal_code || ''}
                        </div>
                      ) : (
                        organization.city || organization.state_province ? (
                          <div className="text-gray-500 text-xs">
                            {organization.city} {organization.state_province}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )
                      )}
                    </div>
                  </TableCell>
                  
                  {/* Primary Manager */}
                  <TableCell>
                    <span className="text-sm">
                      {organization.primary_manager_name || '-'}
                    </span>
                  </TableCell>
                  
                  {/* Secondary Manager */}
                  <TableCell>
                    <span className="text-sm">
                      {organization.secondary_manager_name || '-'}
                    </span>
                  </TableCell>
                  
                  {/* Notes */}
                  <TableCell>
                    <div className="text-sm max-w-[90px] truncate" title={organization.notes || ''}>
                      {organization.notes || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(organization)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(organization)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(organization)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}