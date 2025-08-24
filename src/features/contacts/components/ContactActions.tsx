import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Phone, Eye } from 'lucide-react'
import type { Contact } from '@/types/entities'

interface ContactActionsProps {
  contact: Contact
  onEdit?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export const ContactActions: React.FC<ContactActionsProps> = ({
  contact,
  onEdit,
  onView,
  onContact,
  size = 'sm',
  variant = 'ghost'
}) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {onEdit && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onEdit(contact)}
          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
          title="Edit Contact"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      
      {onContact && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onContact(contact)}
          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
          title="Contact Person"
        >
          <Phone className="h-4 w-4" />
        </Button>
      )}
      
      {onView && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onView(contact)}
          className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}