import React from 'react'
import { FileText } from 'lucide-react'
import type { Organization } from '@/types/entities'

interface OrganizationNotesSectionProps {
  organization: Organization
}

export const OrganizationNotesSection: React.FC<OrganizationNotesSectionProps> = ({
  organization
}) => {
  if (!organization.notes) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
        <FileText className="h-4 w-4" />
        Notes
      </div>
      <div className="text-sm text-gray-600 pl-6">
        {organization.notes}
      </div>
    </div>
  )
}