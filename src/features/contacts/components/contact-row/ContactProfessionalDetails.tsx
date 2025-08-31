import { Briefcase, User } from 'lucide-react'
import { ContactBadges } from '../ContactBadges'
import type { ContactWithOrganization } from '@/types/entities'

interface ContactProfessionalDetailsProps {
  contact: ContactWithOrganization
}

export const ContactProfessionalDetails = ({ contact }: ContactProfessionalDetailsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <Briefcase className="size-4" />
          Professional Details
        </div>
        <div className="space-y-1 pl-6 text-sm text-muted-foreground">
          {contact.department && (
            <div>
              <strong>Department:</strong> {contact.department}
            </div>
          )}
          {contact.purchase_influence && (
            <div>
              <strong>Purchase Influence:</strong> {contact.purchase_influence}
            </div>
          )}
          {contact.decision_authority && (
            <div>
              <strong>Decision Authority:</strong> {contact.decision_authority}
            </div>
          )}
        </div>
      </div>

      {/* Badges Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <User className="size-4" />
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
  )
}
