import React from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useContactRowState } from '@/hooks/useContactRowState'
import { ContactBasicInfo } from './contact-row/ContactBasicInfo'
import { ContactActions } from './contact-row/ContactActions'
import { ContactExpandedDetails } from './contact-row/ContactExpandedDetails'
import type { Contact, ContactWithOrganization } from '@/types/entities'

interface ContactRowProps {
  contact: ContactWithOrganization
  index: number
  isExpanded: boolean
  onToggleExpansion: (contactId: string) => void
  onEdit?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
  showOrganization?: boolean
}

export const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  index,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onView,
  onContact,
  showOrganization = true
}) => {
  const { primaryContactInfo } = useContactRowState(contact)

  return (
    <React.Fragment>
      {/* Main Row */}
      <TableRow 
        className={cn(
          "hover:bg-gray-50/80 transition-colors border-b",
          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
        )}
      >
        {/* Expand Toggle */}
        <TableCell className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpansion(contact.id)}
            className="h-8 w-8 p-0 hover:bg-gray-200"
          >
            {isExpanded ? 
              <ChevronDown className="h-4 w-4 text-gray-500" /> : 
              <ChevronRight className="h-4 w-4 text-gray-500" />
            }
          </Button>
        </TableCell>

        <ContactBasicInfo
          contact={contact}
          showOrganization={showOrganization}
          primaryContactInfo={primaryContactInfo}
        />
        
        <ContactActions
          contact={contact}
          onEdit={onEdit}
          onView={onView}
          onContact={onContact}
        />
      </TableRow>

      {/* Expandable Row Details */}
      {isExpanded && (
        <ContactExpandedDetails
          contact={contact}
          showOrganization={showOrganization}
        />
      )}
    </React.Fragment>
  )
}