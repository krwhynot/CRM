import React from 'react'
import { Mail, Phone, Smartphone, ExternalLink } from 'lucide-react'
import type { ContactWithOrganization } from '@/types/entities'

interface ContactMethodsListProps {
  contact: ContactWithOrganization
}

export const ContactMethodsList: React.FC<ContactMethodsListProps> = ({ contact }) => {
  return (
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
  )
}