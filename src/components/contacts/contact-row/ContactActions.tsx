import React from 'react'
import { TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Phone } from 'lucide-react'
import type { Contact } from '@/types/entities'

interface ContactActionsProps {
  contact: Contact
  onEdit?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
}

export const ContactActions: React.FC<ContactActionsProps> = ({
  contact,
  onEdit,
  onView,
  onContact
}) => {
  return (
    <TableCell>
      <div className="flex items-center justify-center gap-1">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(contact)}
            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
            title="Edit Contact"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        
        {onContact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onContact(contact)}
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
            title="Contact Person"
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}
        
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(contact)}
            className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    </TableCell>
  )
}