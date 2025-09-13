import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Phone, Eye } from 'lucide-react'
import { semanticSpacing, semanticColors } from '@/styles/tokens'
import type { Organization } from '@/types/entities'

interface OrganizationActionsProps {
  organization: Organization
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export const OrganizationActions: React.FC<OrganizationActionsProps> = ({
  organization,
  onEdit,
  onView,
  onContact,
  size = 'sm',
  variant = 'ghost',
}) => {
  return (
    <div className={`flex items-center justify-center ${semanticSpacing.gap.xs}`}>
      {onEdit && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onEdit(organization)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.primarySubtle}`}
          title="Edit Organization"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      {onContact && organization.phone && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onContact(organization)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.successSubtle}`}
          title="Contact Organization"
        >
          <Phone className="size-4" />
        </Button>
      )}

      {onView && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onView(organization)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hoverStates.subtle}`}
          title="View Details"
        >
          <Eye className="size-4" />
        </Button>
      )}
    </div>
  )
}
