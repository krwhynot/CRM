import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { OrganizationBadges } from '../OrganizationBadges'
import { OrganizationActions } from '../OrganizationActions'
import type { Organization } from '@/types/entities'

interface OrganizationRowMainProps {
  organization: Organization
  isExpanded: boolean
  onToggleExpansion: () => void
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
}

const EmptyCell = () => (
  <span className="text-gray-400 italic">Not provided</span>
)

export const OrganizationRowMain: React.FC<OrganizationRowMainProps> = ({
  organization,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  onView,
  onContact
}) => {
  const formatLocation = () => {
    if (organization.city && organization.state_province) {
      return `${organization.city}, ${organization.state_province}`
    }
    if (organization.city) {
      return organization.city
    }
    if (organization.state_province) {
      return organization.state_province
    }
    return <EmptyCell />
  }

  const formatManagers = () => (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-900">
        {organization.primary_manager_name || <EmptyCell />}
      </div>
      {organization.secondary_manager_name && (
        <div className="text-xs text-gray-600">
          + {organization.secondary_manager_name}
        </div>
      )}
    </div>
  )

  return (
    <TableRow className="hover:bg-gray-50 transition-colors duration-200 group">
      <TableCell className="py-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleExpansion}
          className="p-0 h-auto hover:bg-transparent"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </TableCell>
      <TableCell className="font-medium py-4">
        <div className="space-y-2">
          <div className="text-base font-semibold text-gray-900">
            {organization.name || <EmptyCell />}
          </div>
          <OrganizationBadges
            priority={organization.priority}
            type={organization.type}
            segment={organization.segment}
          />
        </div>
      </TableCell>
      <TableCell className="py-4 text-gray-700">
        {organization.phone || <EmptyCell />}
      </TableCell>
      <TableCell className="py-4">
        {formatManagers()}
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-700">
          {formatLocation()}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <OrganizationActions
          organization={organization}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onContact={onContact}
        />
      </TableCell>
    </TableRow>
  )
}