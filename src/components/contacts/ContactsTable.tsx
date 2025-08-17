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
import { MoreHorizontal, Pencil, Trash2, Plus, Search, ExternalLink, Star } from 'lucide-react'
import type { Contact, ContactWithOrganization } from '@/types/entities'

interface ContactsTableProps {
  contacts: ContactWithOrganization[]
  loading?: boolean
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onAddNew?: () => void
  showOrganization?: boolean
}

export function ContactsTable({ 
  contacts, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onAddNew,
  showOrganization = true
}: ContactsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.title && contact.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.organization?.name && contact.organization.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getInfluenceColor = (influence: string | null) => {
    if (!influence) return 'bg-gray-100 text-gray-800'
    
    switch (influence) {
      case 'High':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-blue-100 text-blue-800'
      case 'Unknown':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAuthorityColor = (authority: string | null) => {
    if (!authority) return 'bg-gray-100 text-gray-800'
    
    switch (authority) {
      case 'Decision Maker':
        return 'bg-purple-100 text-purple-800'
      case 'Influencer':
        return 'bg-indigo-100 text-indigo-800'
      case 'End User':
        return 'bg-green-100 text-green-800'
      case 'Gatekeeper':
        return 'bg-orange-100 text-orange-800'
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
              placeholder="Search contacts..."
              className="w-64"
              disabled
            />
          </div>
          {onAddNew && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          )}
        </div>
        <div className="border rounded-lg">
          <div className="p-8 text-center text-gray-500">
            Loading contacts...
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
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {showOrganization && <TableHead>Organization</TableHead>}
              <TableHead>Position</TableHead>
              <TableHead>Purchase Influence</TableHead>
              <TableHead>Decision Authority</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Primary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showOrganization ? 8 : 7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No contacts match your search.' : 'No contacts found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">
                        {contact.first_name} {contact.last_name}
                      </div>
                    </div>
                  </TableCell>
                  {showOrganization && (
                    <TableCell>
                      {contact.organization?.name || 'N/A'}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="text-sm">
                      {contact.title ? (
                        <div className="font-medium">{contact.title}</div>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getInfluenceColor(contact.purchase_influence)}>
                      {contact.purchase_influence || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getAuthorityColor(contact.decision_authority)}>
                      {contact.decision_authority || 'Gatekeeper'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {contact.email && (
                        <div className="text-gray-600">{contact.email}</div>
                      )}
                      {contact.phone && (
                        <div className="text-gray-500">📞 {contact.phone}</div>
                      )}
                      {contact.mobile_phone && (
                        <div className="text-gray-500">📱 {contact.mobile_phone}</div>
                      )}
                      {!contact.email && !contact.phone && !contact.mobile_phone && 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.is_primary_contact && (
                      <div className="flex items-center text-yellow-600">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        <span className="text-sm">Primary</span>
                      </div>
                    )}
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
                          <DropdownMenuItem onClick={() => onView(contact)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(contact)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(contact)}
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