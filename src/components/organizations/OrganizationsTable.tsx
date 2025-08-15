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
    (org.priority && org.priority.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (org.segment && org.segment.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const getTypeFlags = (org: any) => {
    const flags = []
    if (org.is_principal) flags.push('Principal')
    if (org.is_distributor) flags.push('Distributor')
    return flags.length > 0 ? flags.join(' / ') : 'Customer'
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
              <TableHead>Priority</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No organizations match your search.' : 'No organizations found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrganizations.map((organization) => (
                <TableRow key={organization.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{organization.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(organization.priority)}>
                      {organization.priority || 'C'} Priority
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {organization.segment || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {organization.is_principal && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                          Principal
                        </Badge>
                      )}
                      {organization.is_distributor && (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          Distributor
                        </Badge>
                      )}
                      {!organization.is_principal && !organization.is_distributor && (
                        <Badge variant="outline" className="text-xs">
                          Customer
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {organization.city && organization.state ? (
                        <div>{organization.city}, {organization.state}</div>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {organization.phone && (
                        <div className="text-gray-500">{organization.phone}</div>
                      )}
                      {organization.website && (
                        <div>
                          <a 
                            href={organization.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {!organization.phone && !organization.website && 'N/A'}
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