import React from 'react'
import { Mail, ExternalLink } from 'lucide-react'
import type { Organization } from '@/types/entities'

interface OrganizationContactInfoSectionProps {
  organization: Organization
}

const EmptyCell = () => (
  <span className="text-gray-400 italic">Not provided</span>
)

export const OrganizationContactInfoSection: React.FC<OrganizationContactInfoSectionProps> = ({
  organization
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Mail className="h-4 w-4" />
          Email
        </div>
        <div className="text-sm text-gray-600 pl-6">
          {organization.email || <EmptyCell />}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <ExternalLink className="h-4 w-4" />
          LinkedIn Profile
        </div>
        <div className="text-sm pl-6">
          {organization.website ? (
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              View Profile
            </a>
          ) : (
            <EmptyCell />
          )}
        </div>
      </div>
    </div>
  )
}