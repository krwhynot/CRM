import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Phone, Eye } from 'lucide-react'
import type { Organization } from '@/types/entities'

interface OrganizationActionsProps {
  organization: Organization
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
}

export const OrganizationActions: React.FC<OrganizationActionsProps> = ({
  organization,
  onEdit,
  onView,
  onContact
}) => {
  return (
    <div className="flex gap-2">
      {onView && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView(organization)}
          className="h-8 px-3 transition-colors duration-200"
          title="View organization details"
        >
          <Eye className="size-3" />
        </Button>
      )}
      {onContact && organization.phone && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onContact(organization)}
          className="h-8 px-3 transition-colors duration-200"
          title="Contact organization"
        >
          <Phone className="size-3" />
        </Button>
      )}
      {onEdit && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(organization)}
          className="h-8 px-3 transition-colors duration-200"
          title="Edit organization"
        >
          <Pencil className="size-3" />
        </Button>
      )}
    </div>
  )
}