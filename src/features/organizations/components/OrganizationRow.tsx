import React from 'react'
import { OrganizationRowMain } from './organization-row/OrganizationRowMain'
import { OrganizationRowDetails } from './organization-row/OrganizationRowDetails'
import type { Organization } from '@/types/entities'

interface OrganizationRowProps {
  organization: Organization
  isExpanded: boolean
  onToggleExpansion: () => void
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
  isSelected?: boolean
  onSelect?: () => void
}

export const OrganizationRow: React.FC<OrganizationRowProps> = ({
  organization,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  onView,
  onContact,
  isSelected,
  onSelect,
}) => {
  return (
    <>
      <OrganizationRowMain
        organization={organization}
        isExpanded={isExpanded}
        onToggleExpansion={onToggleExpansion}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onContact={onContact}
        isSelected={isSelected}
        onSelect={onSelect}
      />

      {isExpanded && <OrganizationRowDetails organization={organization} />}
    </>
  )
}
