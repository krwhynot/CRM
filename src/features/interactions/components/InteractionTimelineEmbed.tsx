import React from 'react'
// Enhanced timeline with priority badges, account managers, and multiple principals
import { EnhancedInteractionTimelineEmbed } from './EnhancedInteractionTimelineEmbed'

/**
 * Props for the InteractionTimelineEmbed component
 * Enhanced with priority badges, account managers, and multiple principals
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
  /** Whether to show date grouping (default: true) */
  showGrouping?: boolean
}

/**
 * InteractionTimelineEmbed Component
 *
 * An embedded timeline component that displays interactions for a specific opportunity.
 * Now enhanced with priority badges, account manager display, and multiple principal support.
 * Supports mobile-responsive design, lazy loading, and expandable interaction items.
 *
 * @example
 * ```tsx
 * <InteractionTimelineEmbed
 *   opportunityId="opp-123"
 *   variant="compact"
 *   onAddNew={() => setShowQuickAdd(true)}
 *   enabled={isRowExpanded}
 *   showGrouping={true}
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
  enabled = true,
  showGrouping = true,
}: InteractionTimelineEmbedProps) {
  // Forward all props to the enhanced timeline component
  return (
    <EnhancedInteractionTimelineEmbed
      opportunityId={opportunityId}
      maxHeight={maxHeight}
      showGrouping={showGrouping}
      onAddNew={showEmptyState ? onAddNew : undefined}
      className={className}
      enabled={enabled}
    />
  )
}
