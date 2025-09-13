import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Phone, Eye } from 'lucide-react'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'
import { semanticSpacing, semanticColors } from '@/styles/tokens'

interface OpportunityActionsProps {
  opportunity: OpportunityWithLastActivity
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onView?: (opportunity: OpportunityWithLastActivity) => void
  onContact?: (opportunity: OpportunityWithLastActivity) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export const OpportunityActions: React.FC<OpportunityActionsProps> = ({
  opportunity,
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
          onClick={() => onEdit(opportunity)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.primarySubtle}`}
          title="Edit Opportunity"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      {onContact && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onContact(opportunity)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.successSubtle}`}
          title="Contact Opportunity"
        >
          <Phone className="size-4" />
        </Button>
      )}

      {onView && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onView(opportunity)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hoverStates.subtle}`}
          title="View Details"
        >
          <Eye className="size-4" />
        </Button>
      )}
    </div>
  )
}
