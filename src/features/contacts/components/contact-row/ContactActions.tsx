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

export const ContactActions = ({ contact, onEdit, onView, onContact }: ContactActionsProps) => {
  return (
    <TableCell>
      <div className="flex items-center justify-center gap-1">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(contact)}
            className="size-8 p-0 hover:bg-blue-100 hover:text-blue-700"
            title="Edit Contact"
          >
            <Pencil className="size-4" />
          </Button>
        )}

        {onContact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onContact(contact)}
            className="size-8 p-0 hover:bg-green-100 hover:text-green-700"
            title="Contact Person"
          >
            <Phone className="size-4" />
          </Button>
        )}

        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(contact)}
            className="size-8 p-0 hover:bg-gray-100 hover:text-gray-700"
            title="View Details"
          >
            <Eye className="size-4" />
          </Button>
        )}
      </div>
    </TableCell>
  )
}
