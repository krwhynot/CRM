import React from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { ContactMethodsList } from './ContactMethodsList'
import { ContactProfessionalDetails } from './ContactProfessionalDetails'
import type { ContactWithOrganization } from '@/types/entities'

interface ContactExpandedDetailsProps {
  contact: ContactWithOrganization
  showOrganization: boolean
}

export const ContactExpandedDetails: React.FC<ContactExpandedDetailsProps> = ({
  contact,
  showOrganization
}) => {
  return (
    <TableRow className="border-b-2 border-gray-100">
      <TableCell 
        colSpan={showOrganization ? 7 : 6} 
        className="bg-[--mfb-sage-tint] border-l-4 border-[--mfb-green] p-6 transition-all duration-300 ease-out"
      >
        <div className="space-y-6">
          <ContactMethodsList contact={contact} />
          <ContactProfessionalDetails contact={contact} />
          
          {/* Notes */}
          {contact.notes && (
            <div className="space-y-2">
              <div className="text-sm font-bold text-gray-700">Notes</div>
              <div className="text-sm text-gray-600 bg-white/50 p-3 rounded border-l-2 border-blue-200">
                {contact.notes}
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}