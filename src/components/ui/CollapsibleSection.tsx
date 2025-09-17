import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useCollapsibleSection } from '@/hooks/useCollapsibleSection'
import {
  useDashboardDensity,
  type DashboardDensity,
} from '@/features/dashboard/hooks/useDashboardDensity'

interface CollapsibleSectionProps {
  /**
   * Unique identifier for the section (used for localStorage key)
   */
  sectionId: string

  /**
   * Section title displayed in header
   */
  title: string

  /**
   * Optional badge content to show in header (typically count)
   */
  badge?: string | number

  /**
   * Default open state (can be overridden by localStorage)
   */
  defaultOpen?: boolean

  /**
   * Priority level affects default responsive behavior
   * - 'high': Expanded by default on all screen sizes
   * - 'medium': Expanded on desktop, collapsed on tablet
   * - 'low': Collapsed by default, users expand when needed
   */
  priority?: 'high' | 'medium' | 'low'

  /**
   * Additional CSS classes for the container
   */
  className?: string

  /**
   * Additional CSS classes for the content area
   */
  contentClassName?: string

  /**
   * Content to render when section is expanded
   */
  children: React.ReactNode

  /**
   * Optional content to show when collapsed (preview mode)
   */
  collapsedPreview?: React.ReactNode
}

// Density-aware priority mapping
const DENSITY_PRIORITY_MAP: Record<DashboardDensity, Record<string, boolean>> = {
  compact: {
    high: true, // Always open
    medium: false, // Collapsed by default
    low: false, // Collapsed by default
  },
  comfortable: {
    high: true, // Always open
    medium: true, // Open by default
    low: false, // Collapsed by default
  },
  spacious: {
    high: true, // Always open
    medium: true, // Open by default
    low: true, // Open by default
  },
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  sectionId,
  title,
  badge,
  defaultOpen,
  priority = 'medium',
  className,
  contentClassName,
  children,
  collapsedPreview,
}) => {
  const { density } = useDashboardDensity()

  // Get density-aware responsive default based on priority
  const getDensityAwareDefault = (): boolean => {
    if (typeof defaultOpen === 'boolean') return defaultOpen

    // For server-side rendering safety, default to closed
    if (typeof window === 'undefined') return false

    // Primary: Use density-aware priority mapping
    if (DENSITY_PRIORITY_MAP[density] && DENSITY_PRIORITY_MAP[density][priority] !== undefined) {
      return DENSITY_PRIORITY_MAP[density][priority]
    }

    // Fallback: Legacy responsive defaults based on screen size
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    const isTablet = window.matchMedia('(min-width: 768px)').matches

    switch (priority) {
      case 'high':
        return true // Always expanded
      case 'medium':
        return isDesktop // Expanded on desktop only
      case 'low':
        return false // Always collapsed by default
      default:
        return isTablet // Fallback: expanded on tablet and up
    }
  }

  // Create density-specific defaults for the hook
  const densityDefaults = {
    compact: DENSITY_PRIORITY_MAP.compact[priority],
    comfortable: DENSITY_PRIORITY_MAP.comfortable[priority],
    spacious: DENSITY_PRIORITY_MAP.spacious[priority],
  }

  const { isOpen, toggle } = useCollapsibleSection(
    sectionId,
    getDensityAwareDefault(),
    densityDefaults
  )

  return (
    <Collapsible open={isOpen} onOpenChange={toggle}>
      <div className={cn('space-y-2', className)}>
        {/* Section Header with Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
              aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            >
              {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Collapsed Preview (if provided and section is collapsed) */}
        {!isOpen && collapsedPreview && <div className="opacity-75">{collapsedPreview}</div>}

        {/* Expandable Content */}
        <CollapsibleContent className="space-y-2">
          <div className={cn('animate-in fade-in-50 duration-200', contentClassName)}>
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export default CollapsibleSection
