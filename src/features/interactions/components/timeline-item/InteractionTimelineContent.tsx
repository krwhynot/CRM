import React from 'react'
import { format } from 'date-fns'
import type { InteractionWithRelations } from '@/types/entities'

interface InteractionTimelineContentProps {
  interaction: InteractionWithRelations
  isExpanded: boolean
}

export const InteractionTimelineContent: React.FC<InteractionTimelineContentProps> = ({
  interaction,
  isExpanded
}) => {
  return (
    <>
      {/* Expandable content */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {/* Notes/Description */}
          {interaction.description && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Notes: </span>
              <div className="text-gray-600 mt-1 whitespace-pre-wrap">
                {interaction.description}
              </div>
            </div>
          )}

          {/* Follow-up information */}
          {interaction.follow_up_required && interaction.follow_up_date && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Follow-up: </span>
              <span className="text-gray-600">
                {format(new Date(interaction.follow_up_date), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Opportunity link */}
          {interaction.opportunity && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Opportunity: </span>
              <span className="text-gray-600">{interaction.opportunity.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Collapsed preview */}
      {!isExpanded && interaction.description && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {interaction.description}
        </p>
      )}
    </>
  )
}