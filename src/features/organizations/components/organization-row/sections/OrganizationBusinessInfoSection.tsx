import React from 'react'
import { Briefcase, User } from 'lucide-react'
import type { Organization } from '@/types/entities'

interface OrganizationBusinessInfoSectionProps {
  organization: Organization
}

const EmptyCell = () => (
  <span className="italic text-gray-400">Not provided</span>
)

export const OrganizationBusinessInfoSection: React.FC<OrganizationBusinessInfoSectionProps> = ({
  organization
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Briefcase className="size-4" />
          Business Segment
        </div>
        <div className="pl-6 text-sm text-gray-600">
          {organization.segment || <EmptyCell />}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <User className="size-4" />
          Secondary Manager
        </div>
        <div className="pl-6 text-sm text-gray-600">
          {organization.secondary_manager_name || <EmptyCell />}
        </div>
      </div>
    </div>
  )
}