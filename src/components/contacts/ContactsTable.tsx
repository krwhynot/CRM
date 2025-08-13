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
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.title && contact.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.department && contact.department.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getRoleColor = (role: string | null) => {
    if (!role) return 'bg-gray-100 text-gray-800'
    
    switch (role) {
      case 'decision_maker':
        return 'bg-purple-100 text-purple-800'
      case 'influencer':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      case 'gatekeeper':
        return 'bg-orange-100 text-orange-800'
      case 'technical_contact':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRole = (role: string | null) => {
    if (!role) return 'Not specified'
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
              <TableHead>Role</TableHead>
              <TableHead>Title & Department</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Primary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showOrganization ? 7 : 6} className="text-center py-8 text-gray-500">
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
                      {contact.linkedin_url && (
                        <div className="text-sm text-blue-600">
                          <a 
                            href={contact.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {showOrganization && (
                    <TableCell>
                      {contact.organization?.name || 'N/A'}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge className={getRoleColor(contact.role)}>
                      {formatRole(contact.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {contact.title && (
                        <div className="font-medium">{contact.title}</div>
                      )}
                      {contact.department && (
                        <div className="text-gray-500">{contact.department}</div>
                      )}
                      {!contact.title && !contact.department && 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {contact.email && (
                        <div>{contact.email}</div>
                      )}
                      {contact.phone && (
                        <div className="text-gray-500">{contact.phone}</div>
                      )}
                      {contact.mobile_phone && (
                        <div className="text-gray-500">Mobile: {contact.mobile_phone}</div>
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