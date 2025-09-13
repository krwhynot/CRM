import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Phone, Eye } from 'lucide-react'
import type { Contact } from '@/types/entities'
import { semanticSpacing, semanticColors } from '@/styles/tokens'

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
  variant = 'ghost',
}) => {
  return (
    <div className={`flex items-center justify-center ${semanticSpacing.gap.xs}`}>
      {onEdit && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onEdit(contact)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.primarySubtle}`}
          title="Edit Contact"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      {onContact && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onContact(contact)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.successSubtle}`}
          title="Contact Person"
        >
          <Phone className="size-4" />
        </Button>
      )}

      {onView && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onView(contact)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hoverStates.subtle}`}
          title="View Details"
        >
          <Eye className="size-4" />
        </Button>
      )}
    </div>
  )
}
