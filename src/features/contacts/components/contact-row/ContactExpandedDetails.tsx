import { TableRow, TableCell } from '@/components/ui/table'
import { ContactMethodsList } from './ContactMethodsList'
import { ContactProfessionalDetails } from './ContactProfessionalDetails'
import type { ContactWithOrganization } from '@/types/entities'

interface ContactExpandedDetailsProps {
  contact: ContactWithOrganization
  showOrganization: boolean
}

export const ContactExpandedDetails = ({
  contact,
  showOrganization,
}: ContactExpandedDetailsProps) => {
  return (
    <TableRow className="border-b-2 border-border">
      <TableCell
        colSpan={showOrganization ? 7 : 6}
        className="border-l-4 border-mfb-green bg-mfb-sage-tint p-6 transition-all duration-300 ease-out"
      >
        <div className="space-y-6">
          <ContactMethodsList contact={contact} />
          <ContactProfessionalDetails contact={contact} />

          {/* Notes */}
          {contact.notes && (
            <div className="space-y-2">
              <div className="text-sm font-bold text-muted-foreground">Notes</div>
              <div className="rounded border-l-2 border-primary bg-muted/50 p-3 text-sm text-muted-foreground">
                {contact.notes}
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
