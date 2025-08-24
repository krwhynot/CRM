import React from 'react'
import { 
  TableRow, 
  TableCell 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronRight,
  Star,
  Mail,
  Phone,
  Smartphone,
  Pencil,
  Eye,
  User,
  Briefcase,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ContactBadges } from './ContactBadges'
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

const EmptyCell = () => (
  <span className="text-gray-400 italic text-sm">—</span>
)

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
  const getPrimaryContactInfo = (contact: ContactWithOrganization): string | null => {
    if (contact.email) return contact.email
    if (contact.phone) return contact.phone
    if (contact.mobile_phone) return contact.mobile_phone
    return null
  }

  const primaryContactInfo = getPrimaryContactInfo(contact)

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

        {/* Quick Actions */}
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
      </TableRow>

      {/* Expandable Row Details */}
      {isExpanded && (
        <TableRow className="border-b-2 border-gray-100">
          <TableCell 
            colSpan={showOrganization ? 7 : 6} 
            className="bg-[--mfb-sage-tint] border-l-4 border-[--mfb-green] p-6 transition-all duration-300 ease-out"
          >
            <div className="space-y-6">
              {/* Contact Methods */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Phone className="h-4 w-4" />
                  Contact Methods
                </div>
                <div className="text-sm text-gray-600 pl-6 space-y-1">
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.mobile_phone && (
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-3 w-3" />
                      <a href={`tel:${contact.mobile_phone}`} className="text-blue-600 hover:underline">
                        {contact.mobile_phone}
                      </a>
                    </div>
                  )}
                  {contact.linkedin_url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Briefcase className="h-4 w-4" />
                    Professional Details
                  </div>
                  <div className="text-sm text-gray-600 pl-6 space-y-1">
                    {contact.department && (
                      <div><strong>Department:</strong> {contact.department}</div>
                    )}
                    {contact.purchase_influence && (
                      <div><strong>Purchase Influence:</strong> {contact.purchase_influence}</div>
                    )}
                    {contact.decision_authority && (
                      <div><strong>Decision Authority:</strong> {contact.decision_authority}</div>
                    )}
                  </div>
                </div>

                {/* Badges Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <User className="h-4 w-4" />
                    Contact Classifications
                  </div>
                  <div className="pl-6">
                    <ContactBadges 
                      contact={contact}
                      showPriority={true}
                      showInfluence={true}
                      showAuthority={true}
                    />
                  </div>
                </div>
              </div>

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
      )}
    </React.Fragment>
  )
}