import React from 'react'
import { Briefcase, User } from 'lucide-react'
import type { Organization } from '@/types/entities'

interface OrganizationBusinessInfoSectionProps {
  organization: Organization
}

const EmptyCell = () => (
  <span className="text-gray-400 italic">Not provided</span>
)

export const OrganizationBusinessInfoSection: React.FC<OrganizationBusinessInfoSectionProps> = ({
  organization
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Briefcase className="h-4 w-4" />
          Business Segment
        </div>
        <div className="text-sm text-gray-600 pl-6">
          {organization.segment || <EmptyCell />}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <User className="h-4 w-4" />
          Secondary Manager
        </div>
        <div className="text-sm text-gray-600 pl-6">
          {organization.secondary_manager_name || <EmptyCell />}
        </div>
      </div>
    </div>
  )
}