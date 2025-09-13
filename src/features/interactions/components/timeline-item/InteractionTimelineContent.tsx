import React from 'react'
import { format } from 'date-fns'
import type { InteractionWithRelations } from '@/types/entities'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

import { cn } from '@/lib/utils'
interface InteractionTimelineContentProps {
  interaction: InteractionWithRelations
  isExpanded: boolean
}

export const InteractionTimelineContent: React.FC<InteractionTimelineContentProps> = ({
  interaction,
  isExpanded,
}) => {
  return (
    <>
      {/* Expandable content */}
      {isExpanded && (
        <div
          className={`${semanticSpacing.stack.lg} border-t border-gray-100 ${semanticSpacing.topGap.xs}`}
        >
          {/* Notes/Description */}
          {interaction.description && (
            <div className={semanticTypography.body}>
              <span className={cn(semanticTypography.label, 'text-gray-700')}>Notes: </span>
              <div className={`${semanticSpacing.topGap.xxs} whitespace-pre-wrap text-gray-600`}>
                {interaction.description}
              </div>
            </div>
          )}

          {/* Follow-up information */}
          {interaction.follow_up_required && interaction.follow_up_date && (
            <div className={semanticTypography.body}>
              <span className={cn(semanticTypography.label, 'text-gray-700')}>Follow-up: </span>
              <span className="text-muted-foreground">
                {format(new Date(interaction.follow_up_date), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Opportunity link */}
          {interaction.opportunity && (
            <div className={semanticTypography.body}>
              <span className={cn(semanticTypography.label, 'text-gray-700')}>Opportunity: </span>
              <span className="text-muted-foreground">{interaction.opportunity.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Collapsed preview */}
      {!isExpanded && interaction.description && (
        <p className={`line-clamp-2 ${semanticTypography.body} text-gray-600`}>
          {interaction.description}
        </p>
      )}
    </>
  )
}
