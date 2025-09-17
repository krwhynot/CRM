import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import type { InteractionWithRelations } from '@/types/entities'
import { InteractionTimelineItem } from '../InteractionTimelineItem'

// Helper function to get week boundaries
function getWeekBoundaries(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

// Helper function to format week range
function formatWeekRange(start: Date, end: Date): string {
  const now = new Date()
  const thisWeek = getWeekBoundaries(now)

  // Check if it's this week
  if (start.getTime() === thisWeek.start.getTime()) {
    return 'This Week'
  }

  // Check if it's last week
  const lastWeek = new Date(thisWeek.start)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const lastWeekBoundaries = getWeekBoundaries(lastWeek)

  if (start.getTime() === lastWeekBoundaries.start.getTime()) {
    return 'Last Week'
  }

  // Format as date range
  const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return `${startMonth} - ${endMonth}`
}

// Group interactions by week
function groupInteractionsByWeek(interactions: InteractionWithRelations[]): {
  weekKey: string
  weekLabel: string
  weekStart: Date
  interactions: InteractionWithRelations[]
}[] {
  const groups = new Map<string, { interactions: InteractionWithRelations[]; weekStart: Date }>()

  interactions.forEach((interaction) => {
    const interactionDate = new Date(interaction.interaction_date || interaction.created_at || '')
    const { start } = getWeekBoundaries(interactionDate)
    const weekKey = start.toISOString().split('T')[0] // Use YYYY-MM-DD as key

    if (!groups.has(weekKey)) {
      groups.set(weekKey, { interactions: [], weekStart: start })
    }

    groups.get(weekKey)!.interactions.push(interaction)
  })

  // Convert to array and sort by week (newest first)
  return Array.from(groups.entries())
    .map(([weekKey, { interactions, weekStart }]) => {
      const { end } = getWeekBoundaries(weekStart)
      return {
        weekKey,
        weekLabel: formatWeekRange(weekStart, end),
        weekStart,
        interactions: interactions.sort(
          (a, b) =>
            new Date(b.interaction_date || b.created_at || '').getTime() -
            new Date(a.interaction_date || a.created_at || '').getTime()
        ),
      }
    })
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
}

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
  // Group interactions by week
  const weeklyGroups = groupInteractionsByWeek(displayedInteractions)

  return (
    <div className="space-y-6 pb-4 md:pb-0">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute inset-y-0 left-4 w-0.5 bg-gray-200" />

        {/* Weekly grouped timeline items */}
        <div className="space-y-8">
          {weeklyGroups.map((group, groupIndex) => (
            <div key={group.weekKey} className="relative">
              {/* Week header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="relative z-10 rounded-full border-2 border-primary bg-white p-2">
                  <Calendar className="size-4 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{group.weekLabel}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {group.interactions.length} activit
                    {group.interactions.length !== 1 ? 'ies' : 'y'}
                  </Badge>
                </div>
              </div>

              {/* Interactions in this week */}
              <div className="ml-2 space-y-6">
                {group.interactions.map(
                  (interaction: InteractionWithRelations, interactionIndex) => (
                    <div key={interaction.id} className="relative">
                      {/* Connecting line from week header to first item */}
                      {interactionIndex === 0 && (
                        <div className="absolute -top-4 left-2 h-4 w-0.5 bg-gray-200" />
                      )}

                      <InteractionTimelineItem
                        interaction={interaction}
                        isExpanded={expandedItems.has(interaction.id)}
                        onToggleExpand={() => onToggleExpand(interaction.id)}
                        onEdit={() => handleEditInteraction(interaction)}
                        onDelete={() => handleDeleteInteraction(interaction)}
                        onItemClick={() => onItemClick(interaction)}
                        getInteractionIcon={getInteractionIcon}
                        getInteractionTypeColor={getInteractionTypeColor}
                      />
                    </div>
                  )
                )}
              </div>

              {/* Add spacing between week groups except for the last one */}
              {groupIndex < weeklyGroups.length - 1 && (
                <div className="ml-5 mt-6 h-6 border-l-2 border-dashed border-gray-200" />
              )}
            </div>
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
