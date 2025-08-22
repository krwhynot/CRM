import React, { useState, useCallback, useMemo } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Clock, 
  MessageSquare, 
  Phone, 
  Mail, 
  Users, 
  Calendar, 
  FileText, 
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { InteractionWithRelations } from '@/types/entities'
import { InteractionTimelineItem } from './InteractionTimelineItem'
import { InteractionTimelineSkeleton } from './InteractionTimelineSkeleton'

// Constants for pagination
const INITIAL_DISPLAY_COUNT = 5

// Interface following error prevention rules
export interface InteractionTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  interactions: InteractionWithRelations[]
  onAddNew: () => void
  onItemClick: (interaction: InteractionWithRelations) => void
  onEditInteraction: (interaction: InteractionWithRelations) => void
  onDeleteInteraction: (interaction: InteractionWithRelations) => void
  opportunityId: string
  loading?: boolean
  className?: string
  [key: string]: any // Migration safety
}

// Map interaction types to appropriate icons
function getInteractionIcon(type: string): React.ReactNode {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'call':
      return <Phone className="h-4 w-4" />
    case 'meeting':
      return <Users className="h-4 w-4" />
    case 'demo':
      return <Calendar className="h-4 w-4" />
    case 'proposal':
    case 'contract_review':
      return <FileText className="h-4 w-4" />
    case 'follow_up':
      return <Clock className="h-4 w-4" />
    case 'trade_show':
    case 'site_visit':
      return <Activity className="h-4 w-4" />
    default:
      return <MessageSquare className="h-4 w-4" />
  }
}

// Map interaction types to badge colors
function getInteractionTypeColor(type: string): string {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'call':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'meeting':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'demo':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'proposal':
    case 'contract_review':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'follow_up':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'trade_show':
      return 'bg-pink-100 text-pink-800 border-pink-200'
    case 'site_visit':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const InteractionTimeline = forwardRef<HTMLDivElement, InteractionTimelineProps>(
  ({ 
    interactions, 
    onAddNew, 
    onItemClick,
    onEditInteraction,
    onDeleteInteraction,
    opportunityId: _opportunityId, 
    loading = false,
    className,
    ...props 
  }, ref) => {
    const [showAllInteractions, setShowAllInteractions] = useState(false)
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

    // Memoize displayed interactions for performance
    const displayedInteractions = useMemo(() => {
      return showAllInteractions 
        ? interactions 
        : interactions.slice(0, INITIAL_DISPLAY_COUNT)
    }, [interactions, showAllInteractions])

    const hasMore = useMemo(() => 
      interactions.length > INITIAL_DISPLAY_COUNT, 
      [interactions.length]
    )
    const remaining = useMemo(() => 
      interactions.length - INITIAL_DISPLAY_COUNT, 
      [interactions.length]
    )

    // Toggle expanded state for individual items
    const handleToggleExpand = useCallback((interactionId: string) => {
      setExpandedItems(prev => {
        const newSet = new Set(prev)
        if (newSet.has(interactionId)) {
          newSet.delete(interactionId)
        } else {
          newSet.add(interactionId)
        }
        return newSet
      })
    }, [])

    // Handle show more/less toggle
    const handleToggleShowAll = useCallback(() => {
      setShowAllInteractions(prev => !prev)
      // Scroll to top of timeline when collapsing
      if (showAllInteractions && ref && 'current' in ref && ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, [showAllInteractions, ref])

    // Handle item actions
    const handleEditInteraction = useCallback((interaction: InteractionWithRelations) => {
      onEditInteraction(interaction)
    }, [onEditInteraction])

    const handleDeleteInteraction = useCallback((interaction: InteractionWithRelations) => {
      onDeleteInteraction(interaction)
    }, [onDeleteInteraction])

    if (loading) {
      return <InteractionTimelineSkeleton />
    }

    return (
      <Card ref={ref} className={cn('mt-4', className)} {...props}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-nunito">Activity Timeline</CardTitle>
            {interactions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {interactions.length}
              </Badge>
            )}
          </div>
          <Button 
            onClick={onAddNew}
            size="sm"
            className="flex items-center gap-2 md:h-9 h-11"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Log Activity</span>
            <span className="sm:hidden">Log</span>
          </Button>
        </CardHeader>
        
        <CardContent className="p-3 md:p-6">
          {interactions.length === 0 ? (
            // Empty state
            <div className="text-center py-8 space-y-3">
              <Activity className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="text-sm font-medium text-gray-900">No activities logged yet</h3>
              <p className="text-sm text-gray-500">
                Start tracking interactions and activities for this opportunity
              </p>
              <Button 
                onClick={onAddNew}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log First Activity
              </Button>
            </div>
          ) : (
            // Timeline items
            <div className="space-y-6 pb-4 md:pb-0">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                {/* Timeline items */}
                <div className="space-y-6">
                  {displayedInteractions.map((interaction: InteractionWithRelations) => (
                    <InteractionTimelineItem
                      key={interaction.id}
                      interaction={interaction}
                      isExpanded={expandedItems.has(interaction.id)}
                      onToggleExpand={() => handleToggleExpand(interaction.id)}
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
                <div className="text-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleToggleShowAll}
                    className="w-full md:w-auto flex items-center gap-2"
                  >
                    {showAllInteractions ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show {remaining} More Activities
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

InteractionTimeline.displayName = 'InteractionTimeline'