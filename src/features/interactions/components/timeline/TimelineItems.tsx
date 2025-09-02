import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { InteractionWithRelations } from '@/types/entities'
import { InteractionTimelineItem } from '../InteractionTimelineItem'

interface TimelineItemsProps {
  displayedInteractions: InteractionWithRelations[]
  expandedItems: Set<string>
  hasMore: boolean
  remaining: number
  showAllInteractions: boolean
  onItemClick: (interaction: InteractionWithRelations) => void
  onToggleExpand: (interactionId: string) => void
  onToggleShowAll: () => void
  handleEditInteraction: (interaction: InteractionWithRelations) => void
  handleDeleteInteraction: (interaction: InteractionWithRelations) => void
  getInteractionIcon: (type: string) => React.ReactNode
  getInteractionTypeColor: (type: string) => string
}

export const TimelineItems: React.FC<TimelineItemsProps> = ({
  displayedInteractions,
  expandedItems,
  hasMore,
  remaining,
  showAllInteractions,
  onItemClick,
  onToggleExpand,
  onToggleShowAll,
  handleEditInteraction,
  handleDeleteInteraction,
  getInteractionIcon,
  getInteractionTypeColor,
}) => {
  return (
    <div className="space-y-6 pb-4 md:pb-0">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute inset-y-0 left-4 w-0.5 bg-gray-200" />

        {/* Timeline items */}
        <div className="space-y-6">
          {displayedInteractions.map((interaction: InteractionWithRelations) => (
            <InteractionTimelineItem
              key={interaction.id}
              interaction={interaction}
              isExpanded={expandedItems.has(interaction.id)}
              onToggleExpand={() => onToggleExpand(interaction.id)}
              onEdit={() => handleEditInteraction(interaction)}
              onDelete={() => handleDeleteInteraction(interaction)}
              onItemClick={() => onItemClick(interaction)}
              getInteractionIcon={getInteractionIcon}
              getInteractionTypeColor={getInteractionTypeColor}
            />
          ))}
        </div>
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="border-t pt-4 text-center">
          <Button
            variant="outline"
            onClick={onToggleShowAll}
            className="flex w-full items-center gap-2 md:w-auto"
          >
            {showAllInteractions ? (
              <>
                <ChevronUp className="size-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                Show {remaining} More Activities
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
