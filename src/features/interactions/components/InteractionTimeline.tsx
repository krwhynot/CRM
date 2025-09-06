import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { InteractionWithRelations } from '@/types/entities'
import { InteractionTimelineSkeleton } from './InteractionTimelineSkeleton'
import { useInteractionTimelineState } from '../hooks/useInteractionTimelineState'
import { useInteractionTimelineData } from '../hooks/useInteractionTimelineData'
import { useInteractionTimelineActions } from '../hooks/useInteractionTimelineActions'
import { useInteractionIconMapping } from '../hooks/useInteractionIconMapping'
import { TimelineHeader, TimelineEmptyState, TimelineItems } from './timeline'

// Interface following error prevention rules
export interface InteractionTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  interactions: InteractionWithRelations[]
  onAddNew: () => void
  onItemClick: (interaction: InteractionWithRelations) => void
  onEditInteraction: (interaction: InteractionWithRelations) => void
  onDeleteInteraction: (interaction: InteractionWithRelations) => void
  loading?: boolean
  className?: string
}

export const InteractionTimeline = forwardRef<HTMLDivElement, InteractionTimelineProps>(
  (
    {
      interactions,
      onAddNew,
      onItemClick,
      onEditInteraction,
      onDeleteInteraction,
      loading = false,
      className,
      ...props
    },
    ref
  ) => {
    const { showAllInteractions, expandedItems, handleToggleExpand, handleToggleShowAll } =
      useInteractionTimelineState()

    const { displayedInteractions, hasMore, remaining } = useInteractionTimelineData({
      interactions,
      showAllInteractions,
    })

    const { handleEditInteraction, handleDeleteInteraction } = useInteractionTimelineActions({
      onEditInteraction,
      onDeleteInteraction,
    })

    const { getInteractionIcon, getInteractionTypeColor } = useInteractionIconMapping()

    if (loading) {
      return <InteractionTimelineSkeleton />
    }

    return (
      <Card ref={ref} className={cn('mt-4', className)} {...props}>
        <TimelineHeader interactionCount={interactions.length} onAddNew={onAddNew} />

        <CardContent className="p-3 md:p-6">
          {interactions.length === 0 ? (
            <TimelineEmptyState onAddNew={onAddNew} />
          ) : (
            <TimelineItems
              displayedInteractions={displayedInteractions}
              expandedItems={expandedItems}
              hasMore={hasMore}
              remaining={remaining}
              showAllInteractions={showAllInteractions}
              onItemClick={onItemClick}
              onToggleExpand={handleToggleExpand}
              onToggleShowAll={handleToggleShowAll}
              handleEditInteraction={handleEditInteraction}
              handleDeleteInteraction={handleDeleteInteraction}
              getInteractionIcon={getInteractionIcon}
              getInteractionTypeColor={getInteractionTypeColor}
            />
          )}
        </CardContent>
      </Card>
    )
  }
)

InteractionTimeline.displayName = 'InteractionTimeline'
