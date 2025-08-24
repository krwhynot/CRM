import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { OrganizationAddressSection } from './sections/OrganizationAddressSection'
import { OrganizationBusinessInfoSection } from './sections/OrganizationBusinessInfoSection'
import { OrganizationContactInfoSection } from './sections/OrganizationContactInfoSection'
import { OrganizationNotesSection } from './sections/OrganizationNotesSection'
import type { Organization } from '@/types/entities'

interface OrganizationRowDetailsProps {
  organization: Organization
}

export const OrganizationRowDetails: React.FC<OrganizationRowDetailsProps> = ({
  organization
}) => {
  return (
    <TableRow className="border-b-2 border-gray-100">
      <TableCell 
        colSpan={6} 
        className="bg-[--mfb-sage-tint] border-l-4 border-[--mfb-green] p-6 transition-all duration-300 ease-out"
      >
        <div className="space-y-6">
          <OrganizationAddressSection organization={organization} />
          
          <OrganizationBusinessInfoSection organization={organization} />
          
          <OrganizationContactInfoSection organization={organization} />
          
          <OrganizationNotesSection organization={organization} />
        </div>
      </TableCell>
    </TableRow>
  )
}