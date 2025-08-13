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
import { MoreHorizontal, Pencil, Trash2, Plus, Search, ExternalLink } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.industry && org.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-green-100 text-green-800'
      case 'prospect':
        return 'bg-blue-100 text-blue-800'
      case 'partner':
        return 'bg-purple-100 text-purple-800'
      case 'supplier':
        return 'bg-orange-100 text-orange-800'
      case 'competitor':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(revenue)
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
          <div className="p-8 text-center text-gray-500">
            Loading organizations...
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No organizations match your search.' : 'No organizations found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrganizations.map((organization) => (
                <TableRow key={organization.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{organization.name}</div>
                      {organization.description && (
                        <div className="text-sm text-gray-500 truncate max-w-48">
                          {organization.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(organization.type)}>
                      {organization.type.charAt(0).toUpperCase() + organization.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {organization.industry || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {organization.city && organization.state_province ? (
                        <div>{organization.city}, {organization.state_province}</div>
                      ) : (
                        'N/A'
                      )}
                      {organization.country && organization.country !== 'US' && (
                        <div className="text-gray-500">{organization.country}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatRevenue(organization.annual_revenue)}
                  </TableCell>
                  <TableCell>
                    {organization.employee_count || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {organization.email && (
                        <div>{organization.email}</div>
                      )}
                      {organization.phone && (
                        <div className="text-gray-500">{organization.phone}</div>
                      )}
                      {!organization.email && !organization.phone && 'N/A'}
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