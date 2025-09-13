import React from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, MessageSquare } from 'lucide-react'
import type { InteractionWithRelations } from '@/types/interaction.types'
import { semanticSpacing, semanticColors } from '@/styles/tokens'

interface InteractionActionsProps {
  interaction: InteractionWithRelations
  onEdit?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
  onReply?: (interaction: InteractionWithRelations) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export const InteractionActions: React.FC<InteractionActionsProps> = ({
  interaction,
  onEdit,
  onView,
  onReply,
  size = 'sm',
  variant = 'ghost',
}) => {
  return (
    <div className={`flex items-center justify-center ${semanticSpacing.gap.xs}`}>
      {onEdit && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onEdit(interaction)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.primarySubtle}`}
          title="Edit Interaction"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      {onReply && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onReply(interaction)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hover.successSubtle}`}
          title="Reply to Interaction"
        >
          <MessageSquare className="size-4" />
        </Button>
      )}

      {onView && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onView(interaction)}
          className={`size-8 ${semanticSpacing.zero} ${semanticColors.hoverStates.subtle}`}
          title="View Details"
        >
          <Eye className="size-4" />
        </Button>
      )}
    </div>
  )
}
