import React from 'react'
import { Briefcase, User } from 'lucide-react'
import { ContactBadges } from '../ContactBadges'
import type { ContactWithOrganization } from '@/types/entities'

interface ContactProfessionalDetailsProps {
  contact: ContactWithOrganization
}

export const ContactProfessionalDetails: React.FC<ContactProfessionalDetailsProps> = ({ contact }) => {
  return (
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
  )
}