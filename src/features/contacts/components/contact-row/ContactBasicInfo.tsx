import React from 'react'
import { TableCell } from '@/components/ui/table'
import { Star, Phone } from 'lucide-react'
import { ContactBadges } from '../ContactBadges'
import type { ContactWithOrganization } from '@/types/entities'

interface ContactBasicInfoProps {
  contact: ContactWithOrganization
  showOrganization: boolean
  primaryContactInfo: string | null
}

const EmptyCell = () => (
  <span className="text-sm italic text-muted-foreground">—</span>
)

export const ContactBasicInfo: React.FC<ContactBasicInfoProps> = ({
  contact,
  showOrganization,
  primaryContactInfo
}) => {
  return (
    <>
      {/* Contact Name */}
      <TableCell className="font-semibold">
        <div className="flex items-center gap-2">
          <div className="text-base font-semibold text-foreground">
            {contact.first_name} {contact.last_name}
          </div>
          {contact.is_primary_contact && (
            <Star className="size-4 fill-current text-yellow-500" />
          )}
        </div>
      </TableCell>

      {/* Organization */}
      {showOrganization && (
        <TableCell>
          <span className="text-foreground">
            {contact.organization?.name || <EmptyCell />}
          </span>
        </TableCell>
      )}

      {/* Position */}
      <TableCell>
        <span className="text-foreground">
          {contact.title || <EmptyCell />}
        </span>
      </TableCell>

      {/* Primary Contact Info */}
      <TableCell>
        <div className="flex items-center gap-2">
          {primaryContactInfo ? (
            <>
              <Phone className="size-4 text-muted-foreground" />
              <span className="font-mono text-sm text-muted-foreground">
                {primaryContactInfo}
              </span>
            </>
          ) : (
            <EmptyCell />
          )}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="text-center">
        <ContactBadges 
          contact={contact}
          showPriority={true}
          showInfluence={false}
          showAuthority={false}
          className="justify-center"
        />
      </TableCell>
    </>
  )
}