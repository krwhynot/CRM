import React from 'react'
import { TableCell } from '@/components/ui/table'
import { Star, Mail, Phone } from 'lucide-react'
import { ContactBadges } from '../ContactBadges'
import type { ContactWithOrganization } from '@/types/entities'

interface ContactBasicInfoProps {
  contact: ContactWithOrganization
  showOrganization: boolean
  primaryContactInfo: string | null
}

const EmptyCell = () => (
  <span className="text-gray-400 italic text-sm">—</span>
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
          <div className="font-semibold text-gray-900 text-base">
            {contact.first_name} {contact.last_name}
          </div>
          {contact.is_primary_contact && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
        </div>
      </TableCell>

      {/* Organization */}
      {showOrganization && (
        <TableCell>
          <span className="text-gray-900">
            {contact.organization?.name || <EmptyCell />}
          </span>
        </TableCell>
      )}

      {/* Position */}
      <TableCell>
        <span className="text-gray-900">
          {contact.title || <EmptyCell />}
        </span>
      </TableCell>

      {/* Primary Contact Info */}
      <TableCell>
        <div className="flex items-center gap-2">
          {primaryContactInfo ? (
            <>
              {contact.email && primaryContactInfo === contact.email && (
                <Mail className="h-4 w-4 text-gray-500" />
              )}
              {(contact.phone || contact.mobile_phone) && primaryContactInfo !== contact.email && (
                <Phone className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm text-gray-600 font-mono">
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