import React from 'react'
import { Mail, ExternalLink } from 'lucide-react'
import type { Organization } from '@/types/entities'

interface OrganizationContactInfoSectionProps {
  organization: Organization
}

const EmptyCell = () => (
  <span className="italic text-gray-400">Not provided</span>
)

export const OrganizationContactInfoSection: React.FC<OrganizationContactInfoSectionProps> = ({
  organization
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Mail className="size-4" />
          Email
        </div>
        <div className="pl-6 text-sm text-gray-600">
          {organization.email || <EmptyCell />}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <ExternalLink className="size-4" />
          LinkedIn Profile
        </div>
        <div className="pl-6 text-sm">
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