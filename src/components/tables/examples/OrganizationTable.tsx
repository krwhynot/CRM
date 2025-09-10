import React, { useState } from 'react'
import { CRMTable, type CRMTableColumn, StatusBadge, PriorityBadge, OrgTypeBadge } from '../CRMTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  User, 
  Calendar,
  Edit,
  Eye
} from 'lucide-react'

// Example organization data type
interface Organization {
  id: string
  name: string
  type: 'customer' | 'distributor' | 'principal' | 'supplier'
  priority: 'a-plus' | 'a' | 'b' | 'c' | 'd'
  status: 'active' | 'inactive' | 'pending' | 'archived'
  location: string
  phone?: string
  email?: string
  website?: string
  primaryManager?: string
  secondaryManager?: string
  revenue?: number
  lastContact?: Date
  createdAt: Date
}

// Example data
const sampleOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Metro Restaurant Group',
    type: 'customer',
    priority: 'a-plus',
    status: 'active',
    location: 'Chicago, IL',
    phone: '+1 (312) 555-0123',
    email: 'orders@metrorestaurants.com',
    website: 'https://metrorestaurants.com',
    primaryManager: 'Sarah Johnson',
    secondaryManager: 'Mike Chen',
    revenue: 2500000,
    lastContact: new Date('2024-01-15'),
    createdAt: new Date('2023-03-10')
  },
  {
    id: '2', 
    name: 'Fresh Foods Distributor',
    type: 'distributor',
    priority: 'a',
    status: 'active',
    location: 'Los Angeles, CA',
    phone: '+1 (213) 555-0456',
    email: 'purchasing@freshfoods.com',
    primaryManager: 'David Rodriguez',
    revenue: 1800000,
    lastContact: new Date('2024-01-12'),
    createdAt: new Date('2023-05-22')
  },
  {
    id: '3',
    name: 'Organic Valley Suppliers',
    type: 'supplier',
    priority: 'b',
    status: 'pending',
    location: 'Portland, OR',
    phone: '+1 (503) 555-0789',
    email: 'sales@organicvalley.com',
    website: 'https://organicvalley.com',
    primaryManager: 'Emily Watson',
    revenue: 750000,
    lastContact: new Date('2024-01-08'),
    createdAt: new Date('2023-08-15')
  }
]

export function OrganizationTableExample() {
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([])
  const [sortField, setSortField] = useState<keyof Organization | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'none'>('none')

  // Define table columns with CRM-specific rendering
  const columns: CRMTableColumn<Organization>[] = [
    {
      key: 'name',
      header: 'Organization',
      sortable: true,
      width: '250px',
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {row.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{value}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {row.location}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      width: '120px',
      align: 'center',
      render: (value) => <OrgTypeBadge type={value} />
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      width: '100px',
      align: 'center',
      hidden: 'mobile',
      render: (value) => <PriorityBadge priority={value} />
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '100px',
      align: 'center',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'primaryManager',
      header: 'Manager',
      sortable: true,
      width: '150px',
      hidden: 'tablet',
      render: (value) => value ? (
        <div className="flex items-center text-sm">
          <User className="h-3 w-3 mr-1" />
          {value}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Unassigned</span>
      )
    },
    {
      key: 'revenue',
      header: 'Revenue',
      sortable: true,
      width: '120px',
      align: 'right',
      hidden: 'mobile',
      render: (value) => value ? (
        <span className="font-medium">
          ${(value / 1000000).toFixed(1)}M
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
    {
      key: 'lastContact',
      header: 'Last Contact',
      sortable: true,
      width: '130px',
      hidden: 'tablet',
      render: (value) => value ? (
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(value).toLocaleDateString()}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Never</span>
      )
    }
  ]

  // Expanded content for each row
  const renderExpandedContent = (org: Organization) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
      {/* Contact Information */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Contact Information
        </h4>
        <div className="space-y-2">
          {org.phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{org.phone}</span>
            </div>
          )}
          {org.email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{org.email}</span>
            </div>
          )}
          {org.website && (
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <a 
                href={org.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {org.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Management */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Account Management
        </h4>
        <div className="space-y-2">
          {org.primaryManager && (
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Primary: {org.primaryManager}</span>
            </div>
          )}
          {org.secondaryManager && (
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Secondary: {org.secondaryManager}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Since {org.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-1" />
            Send Email
          </Button>
        </div>
      </div>
    </div>
  )

  const handleSelectionChange = (selected: string[]) => {
    setSelectedOrgs(selected)
    console.log('Selected organizations:', selected)
  }

  const handleSort = (column: keyof Organization, direction: 'asc' | 'desc' | 'none') => {
    setSortField(column)
    setSortDirection(direction)
    console.log('Sort:', column, direction)
    // Here you would typically call your data fetching function with sort parameters
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedOrgs.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-md">
          <span className="text-sm font-medium">
            {selectedOrgs.length} organization{selectedOrgs.length === 1 ? '' : 's'} selected
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button variant="outline" size="sm">
              Assign Manager
            </Button>
            <Button variant="destructive" size="sm">
              Archive
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <CRMTable
        data={sampleOrganizations}
        columns={columns}
        rowKey={(org) => org.id}
        selectable
        expandable
        expandedContent={renderExpandedContent}
        onSelectionChange={handleSelectionChange}
        onSort={handleSort}
        stickyHeader
        striped
        emptyMessage="No organizations found. Create your first organization to get started."
      />

      {/* Table Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {sampleOrganizations.length} of {sampleOrganizations.length} organizations
        </span>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {sampleOrganizations.filter(org => org.status === 'active').length} Active
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {sampleOrganizations.filter(org => org.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            {sampleOrganizations.filter(org => org.priority === 'a-plus').length} A+ Priority
          </Badge>
        </div>
      </div>
    </div>
  )
}