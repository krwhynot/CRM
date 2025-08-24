import React, { forwardRef, memo } from 'react'
import { cn } from '@/lib/utils'
import type { InteractionWithRelations } from '@/types/entities'
import { useInteractionTimelineItemActions } from '@/hooks/useInteractionTimelineItemActions'
import { useInteractionTimelineItemFormatting } from '@/hooks/useInteractionTimelineItemFormatting'
import { InteractionTimelineDot } from './timeline-item/InteractionTimelineDot'
import { InteractionTimelineHeader } from './timeline-item/InteractionTimelineHeader'
import { InteractionTimelineContent } from './timeline-item/InteractionTimelineContent'

// Interface following error prevention rules
export interface InteractionTimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  interaction: InteractionWithRelations
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  onItemClick: () => void
  getInteractionIcon: (type: string) => React.ReactNode
  getInteractionTypeColor: (type: string) => string
  className?: string
  [key: string]: any // Migration safety
}

const InteractionTimelineItemComponent = forwardRef<HTMLDivElement, InteractionTimelineItemProps>(
  ({ 
    interaction, 
    isExpanded, 
    onToggleExpand, 
    onEdit, 
    onDelete, 
    onItemClick: _onItemClick,
    getInteractionIcon,
    getInteractionTypeColor,
    className,
    ...props 
  }, ref) => {
    
    const { handleDelete, handleEdit, handleMarkComplete, handleKeyDown, handleItemClick } = 
      useInteractionTimelineItemActions({
        interactionType: interaction.type,
        onToggleExpand,
        onEdit,
        onDelete
      })

    const { formattedDate, relativeTime, formattedType } = 
      useInteractionTimelineItemFormatting({
        interactionDate: interaction.interaction_date,
        interactionType: interaction.type
      })

    return (
      <div 
        ref={ref}
        className={cn(
          'relative flex gap-4 cursor-pointer group transition-colors duration-200',
          'md:hover:bg-gray-50 rounded-lg p-3 -m-3',
          'min-h-[44px] touch-manipulation',
          className
        )}
        onClick={handleItemClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${interaction.type} interaction: ${interaction.subject}`}
        {...props}
      >
        <InteractionTimelineDot
          type={interaction.type}
          getInteractionIcon={getInteractionIcon}
          getInteractionTypeColor={getInteractionTypeColor}
        />

        <div className="flex-1 min-w-0 space-y-2">
          <InteractionTimelineHeader
            interaction={interaction}
            isExpanded={isExpanded}
            formattedDate={formattedDate}
            relativeTime={relativeTime}
            formattedType={formattedType}
            getInteractionTypeColor={getInteractionTypeColor}
            onToggleExpand={onToggleExpand}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleMarkComplete={handleMarkComplete}
          />

          <InteractionTimelineContent
            interaction={interaction}
            isExpanded={isExpanded}
          />
        </div>
      </div>
    )
  }
)

InteractionTimelineItemComponent.displayName = 'InteractionTimelineItem'

// Memoize the component for performance optimization
export const InteractionTimelineItem = memo(InteractionTimelineItemComponent)