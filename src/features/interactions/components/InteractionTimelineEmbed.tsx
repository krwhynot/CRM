import React, { useState, useCallback } from 'react'
import { useInteractionsByOpportunity } from '../hooks/useInteractions'
import { InteractionTimelineItem } from './InteractionTimelineItem'
import { TimelineEmptyState } from './timeline/TimelineEmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile, useIsIPad } from '@/hooks/useMediaQuery'
import type { InteractionWithRelations } from '@/types/entities'
import { 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users,
  MapPin,
  FileCheck,
  PhoneCall
} from 'lucide-react'

/**
 * Props for the InteractionTimelineEmbed component
 */
interface InteractionTimelineEmbedProps {
  /** The ID of the opportunity to show interactions for */
  opportunityId: string
  /** Maximum height of the timeline container (default: '400px') */
  maxHeight?: string
  /** Whether to show empty state when no interactions exist (default: true) */
  showEmptyState?: boolean
  /** Display variant - 'compact' shows fewer items initially (default: 'compact') */
  variant?: 'default' | 'compact'
  /** Callback function called when "Add New" is clicked from empty state */
  onAddNew?: () => void
  /** Additional CSS classes to apply to the container */
  className?: string
  /** Whether the timeline should fetch data - used for lazy loading (default: true) */
  enabled?: boolean
}

// Icon mapping for interaction types
const getInteractionIcon = (type: string): React.ReactNode => {
  const iconClass = "h-4 w-4"
  
  switch (type) {
    case 'call':
      return <Phone className={iconClass} />
    case 'email':
      return <Mail className={iconClass} />
    case 'meeting':
      return <Calendar className={iconClass} />
    case 'demo':
      return <Users className={iconClass} />
    case 'note':
      return <MessageSquare className={iconClass} />
    case 'proposal':
      return <FileText className={iconClass} />
    case 'follow_up':
      return <PhoneCall className={iconClass} />
    case 'trade_show':
      return <Users className={iconClass} />
    case 'site_visit':
      return <MapPin className={iconClass} />
    case 'contract_review':
      return <FileCheck className={iconClass} />
    default:
      return <MessageSquare className={iconClass} />
  }
}

// Color mapping for interaction types
const getInteractionTypeColor = (type: string): string => {
  switch (type) {
    case 'call':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'email':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'meeting':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'demo':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'proposal':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'follow_up':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'trade_show':
      return 'bg-pink-100 text-pink-700 border-pink-200'
    case 'site_visit':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    case 'contract_review':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

/**
 * InteractionTimelineEmbed Component
 * 
 * An embedded timeline component that displays interactions for a specific opportunity.
 * Supports mobile-responsive design, lazy loading, and expandable interaction items.
 * 
 * @example
 * ```tsx
 * <InteractionTimelineEmbed
 *   opportunityId="opp-123"
 *   variant="compact"
 *   onAddNew={() => setShowQuickAdd(true)}
 *   enabled={isRowExpanded}
 * />
 * ```
 * 
 * @param props - The component props
 * @returns A timeline component showing interactions with mobile-optimized layout
 */
export function InteractionTimelineEmbed({
  opportunityId,
  maxHeight = '400px',
  showEmptyState = true,
  variant = 'compact',
  onAddNew,
  className,
  enabled = true
}: InteractionTimelineEmbedProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)
  
  // Mobile detection for responsive behavior
  const isMobile = useIsMobile()
  const isIPad = useIsIPad()
  
  const { 
    data: interactions, 
    isLoading,
    error 
  } = useInteractionsByOpportunity(opportunityId, { enabled })

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

  const handleItemClick = useCallback((interaction: InteractionWithRelations) => {
    handleToggleExpand(interaction.id)
  }, [handleToggleExpand])

  const handleEditInteraction = useCallback((interaction: InteractionWithRelations) => {
    // For embedded version, we don't handle editing directly
    // This could be extended to emit events or open modals
    // TODO: Implement edit functionality
  }, [])

  const handleDeleteInteraction = useCallback((interaction: InteractionWithRelations) => {
    // For embedded version, we don't handle deletion directly
    // This could be extended to emit events or open modals
    // TODO: Implement delete functionality
  }, [])

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-center py-4 text-red-600", className)}>
        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
        <p className="text-sm">Failed to load interactions</p>
      </div>
    )
  }

  if (!interactions?.length && showEmptyState) {
    return (
      <div className={className}>
        {onAddNew ? (
          <TimelineEmptyState onAddNew={onAddNew} />
        ) : (
          <div className="space-y-3 py-8 text-center">
            <MessageSquare className="mx-auto size-12 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900">No activities logged yet</h3>
            <p className="text-sm text-gray-500">
              Start tracking interactions and activities for this opportunity
            </p>
          </div>
        )}
      </div>
    )
  }

  // Mobile-responsive display logic
  let maxDisplayed: number
  if (isMobile) {
    // On mobile, show fewer items initially to reduce scrolling
    maxDisplayed = variant === 'compact' && !showAll ? 2 : interactions?.length || 0
  } else if (isIPad) {
    // On iPad, show more items since there's more screen space
    maxDisplayed = variant === 'compact' && !showAll ? 4 : interactions?.length || 0
  } else {
    // Desktop default
    maxDisplayed = variant === 'compact' && !showAll ? 3 : interactions?.length || 0
  }
  
  const displayedInteractions = interactions?.slice(0, maxDisplayed) || []
  const hasMore = (interactions?.length || 0) > maxDisplayed
  const remaining = (interactions?.length || 0) - maxDisplayed

  // Mobile-responsive max height
  const responsiveMaxHeight = isMobile ? '300px' : isIPad ? '450px' : maxHeight

  return (
    <div 
      className={cn(
        "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
        isMobile ? "pr-1" : "pr-2",
        className
      )}
      style={{ maxHeight: responsiveMaxHeight }}
    >
      <div className={cn(
        "pb-4 md:pb-0",
        isMobile ? "space-y-4" : "space-y-6"
      )}>
        <div className="relative">
          {/* Timeline line - thinner on mobile */}
          <div className={cn(
            "absolute inset-y-0 bg-gray-200",
            isMobile ? "left-3 w-px" : "left-4 w-0.5"
          )} />

          {/* Timeline items - tighter spacing on mobile */}
          <div className={cn(
            isMobile ? "space-y-4" : "space-y-6"
          )}>
            {displayedInteractions.map((interaction: InteractionWithRelations) => (
              <InteractionTimelineItem
                key={interaction.id}
                interaction={interaction}
                isExpanded={expandedItems.has(interaction.id)}
                onToggleExpand={() => handleToggleExpand(interaction.id)}
                onEdit={() => handleEditInteraction(interaction)}
                onDelete={() => handleDeleteInteraction(interaction)}
                onItemClick={() => handleItemClick(interaction)}
                getInteractionIcon={getInteractionIcon}
                getInteractionTypeColor={getInteractionTypeColor}
              />
            ))}
          </div>
        </div>

        {/* Show More/Less Button - mobile optimized */}
        {hasMore && (
          <div className="border-t pt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className={cn(
                "flex items-center gap-2",
                isMobile ? "w-full h-12 text-base" : "w-full md:w-auto"
              )}
            >
              {showAll ? (
                <>
                  <ChevronUp className="size-4" />
                  {isMobile ? "Less" : "Show Less"}
                </>
              ) : (
                <>
                  <ChevronDown className="size-4" />
                  {isMobile ? `+${remaining}` : `Show ${remaining} More Activities`}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}