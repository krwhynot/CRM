import React, { useCallback, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useFilterContainer, useFilterLayout } from '@/hooks/useFilterLayout'
import { FilterTriggerButton } from './FilterTriggerButton'
import { EntityFilters, type EntityFiltersProps } from './EntityFilters'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { FilterLayoutMode } from '@/types/filters.types'
import { useIsIPad, useOrientation } from '@/hooks/useMediaQuery'

/**
 * Internal component that tries to use context but handles forceInline
 */
function ResponsiveFilterWrapperWithContext(props: ResponsiveFilterWrapperProps) {
  const { forceInline = false } = props

  // Always call the hook but conditionally use the result
  let layoutContainer: ReturnType<typeof useFilterContainer> | null = null

  try {
    const container = useFilterContainer()
    // Only use container if not forced inline
    layoutContainer = forceInline ? null : container
  } catch (error) {
    // Context not available, fall back to null (inline mode)
    layoutContainer = null
  }

  return <ResponsiveFilterWrapperInternal {...props} layoutContainer={layoutContainer} />
}

/**
 * Internal implementation that receives layoutContainer as a prop
 */
interface ResponsiveFilterWrapperInternalProps extends ResponsiveFilterWrapperProps {
  layoutContainer: ReturnType<typeof useFilterContainer> | null
}

interface ResponsiveFilterWrapperProps extends Omit<EntityFiltersProps, 'layoutMode'> {
  /**
   * Title to display in sheet/drawer header
   */
  title?: string

  /**
   * Description to display in sheet/drawer header
   */
  description?: string

  /**
   * Override the automatic layout mode detection
   */
  layoutModeOverride?: FilterLayoutMode

  /**
   * Additional className for the wrapper container
   */
  wrapperClassName?: string

  /**
   * Additional className for the trigger button
   */
  triggerClassName?: string

  /**
   * Custom trigger button element (replaces default button)
   */
  customTrigger?: React.ReactNode

  /**
   * Whether to suppress layout context usage (force inline mode)
   */
  forceInline?: boolean

  /**
   * Performance optimization: skip rendering filters when sheet/drawer is closed
   */
  lazyRender?: boolean

  /**
   * Callback when layout mode changes
   */
  onLayoutModeChange?: (mode: FilterLayoutMode) => void

  /**
   * Callback when overlay opens/closes
   */
  onOpenChange?: (open: boolean) => void

  /**
   * Additional props for the Sheet component
   */
  sheetProps?: React.ComponentProps<typeof Sheet>

  /**
   * Additional props for the SheetContent component
   */
  sheetContentProps?: React.ComponentProps<typeof SheetContent>
}

/**
 * ResponsiveFilterWrapper Component
 *
 * Smart wrapper component that automatically chooses between inline and sheet/drawer
 * layouts based on device context. Features:
 *
 * - Automatic layout switching based on device (mobile = drawer, tablet = sheet, desktop = inline)
 * - iPad-specific optimizations: portrait = drawer, landscape = inline
 * - iPadOS 13+ detection and handling for enterprise usage
 * - Seamless state bridging between layout modes with orientation changes
 * - Performance optimization with lazy rendering for overlay modes
 * - Consistent filter state management across all layouts
 * - Customizable trigger button and sheet/drawer appearance
 * - Support for manual layout mode override
 */
/**
 * Main ResponsiveFilterWrapper component with smart context detection
 */
export function ResponsiveFilterWrapper(props: ResponsiveFilterWrapperProps) {
  // Always try to use context first, handle forceInline within the implementation
  return <ResponsiveFilterWrapperWithContext {...props} />
}

/**
 * Internal implementation
 * Optimized with React.memo and performance monitoring
 */
const ResponsiveFilterWrapperInternal = React.memo(function ResponsiveFilterWrapperInternal({
  // EntityFilters props
  entityType,
  filters,
  onFiltersChange,

  // Wrapper-specific props
  title,
  description,
  layoutModeOverride,
  wrapperClassName,
  triggerClassName,
  customTrigger,
  forceInline = false,
  lazyRender = true,
  onLayoutModeChange,
  onOpenChange,
  sheetProps,
  sheetContentProps,

  // Layout container from context
  layoutContainer,

  // Rest of EntityFilters props
  ...entityFiltersProps
}: ResponsiveFilterWrapperInternalProps) {

  // iPad-specific detection and orientation tracking
  const isIPad = useIsIPad()
  const orientation = useOrientation()

  // Determine effective layout mode with iPad-specific logic
  const effectiveMode: FilterLayoutMode = useMemo(() => {
    if (forceInline) return 'inline'
    if (layoutModeOverride) return layoutModeOverride
    return layoutContainer?.mode || 'inline'
  }, [forceInline, layoutModeOverride, layoutContainer?.mode])

  // iPad-specific optimization: track orientation changes for smooth transitions
  const [previousOrientation, setPreviousOrientation] = React.useState<'portrait' | 'landscape' | null>(null)

  useEffect(() => {
    if (isIPad && previousOrientation && previousOrientation !== orientation) {
      // Handle iPad orientation change
      // Close overlay if switching from portrait (drawer) to landscape (inline)
      if (previousOrientation === 'portrait' && orientation === 'landscape') {
        layoutContainer?.sheetProps?.baseProps?.onOpenChange?.(false)
      }
    }
    setPreviousOrientation(orientation)
  }, [isIPad, orientation, previousOrientation, layoutContainer?.sheetProps?.baseProps])

  // Notify of layout mode changes
  React.useEffect(() => {
    onLayoutModeChange?.(effectiveMode)
  }, [effectiveMode, onLayoutModeChange])

  // Calculate active filter count for trigger button
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(key => {
      const value = filters[key]
      return value && value !== '' && value !== 'all' && value !== 'none'
    }).length
  }, [filters])

  // Generate appropriate title and description
  const sheetTitle = title || `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Filters`
  const sheetDesc = description || `Filter and search ${entityType} to find what you're looking for.`

  // Handle overlay open/close events
  const handleOpenChange = useCallback((open: boolean) => {
    layoutContainer?.sheetProps?.baseProps?.onOpenChange?.(open)
    onOpenChange?.(open)
  }, [layoutContainer?.sheetProps?.baseProps, onOpenChange])

  // Render EntityFilters with appropriate props
  const renderFilters = useCallback((mode: FilterLayoutMode = effectiveMode) => (
    <EntityFilters
      entityType={entityType}
      filters={filters}
      onFiltersChange={onFiltersChange}
      layoutMode={mode}
      suppressLayoutContext={forceInline}
      {...entityFiltersProps}
    />
  ), [
    entityType,
    filters,
    onFiltersChange,
    effectiveMode,
    forceInline,
    entityFiltersProps
  ])

  // For inline mode, render filters directly
  if (effectiveMode === 'inline' || !layoutContainer) {
    return (
      <div className={cn('w-full', wrapperClassName)}>
        {renderFilters('inline')}
      </div>
    )
  }

  // For sheet/drawer modes, render trigger + overlay
  const {
    isOverlayMode,
    sheetProps: contextSheetProps,
    containerProps
  } = layoutContainer

  if (!isOverlayMode || !contextSheetProps) {
    // Fallback to inline if overlay mode isn't available
    return (
      <div className={cn('w-full', wrapperClassName)}>
        {renderFilters('inline')}
      </div>
    )
  }

  const { baseProps, contentProps } = contextSheetProps
  const isOpen = baseProps.open

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {/* Trigger Button */}
      <div className="mb-4 flex items-center justify-between gap-4">
        {customTrigger || (
          <FilterTriggerButton
            activeFilterCount={activeFilterCount}
            className={triggerClassName}
            aria-label={`Open ${sheetTitle.toLowerCase()}`}
          />
        )}
      </div>

      {/* Sheet/Drawer Overlay */}
      <Sheet
        {...baseProps}
        onOpenChange={handleOpenChange}
        {...sheetProps}
      >
        <SheetContent
          {...contentProps}
          className={cn(
            // Base overlay styles
            'flex flex-col',
            // iPad-specific responsive sizing
            effectiveMode === 'drawer' && [
              'max-h-screen h-auto',
              'w-full max-w-none',
              // iPad drawer optimization: slightly shorter for better landscape transition
              isIPad && 'h-[80vh]',
            ],
            effectiveMode === 'sheet' && [
              'h-full',
              // iPad landscape gets wider sheet when needed
              isIPad && orientation === 'landscape'
                ? 'w-full sm:max-w-lg lg:max-w-xl'
                : 'w-full sm:max-w-md lg:max-w-lg',
            ],
            // Performance optimization
            lazyRender && !isOpen && 'hidden',
            // iPad-specific touch optimization
            isIPad && 'touch-manipulation',
            contentProps?.className
          )}
          {...sheetContentProps}
        >
          {/* Header */}
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            {description && (
              <SheetDescription>{sheetDesc}</SheetDescription>
            )}
          </SheetHeader>

          {/* Filter Content */}
          <div
            className={cn(
              'flex-1 overflow-y-auto',
              // iPad-optimized responsive padding
              effectiveMode === 'drawer' ? [
                'px-4 pb-4',
                // iPad drawer gets extra bottom padding for home indicator
                isIPad && 'pb-8',
              ] : 'px-0 pb-4',
              // iPad-specific scroll optimization
              isIPad && 'overscroll-contain',
              containerProps?.className
            )}
            {...containerProps}
          >
            {/* Lazy render optimization */}
            {(!lazyRender || isOpen) && renderFilters(effectiveMode)}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
})

/**
 * Hook for managing ResponsiveFilterWrapper state externally with iPad awareness
 */
export function useResponsiveFilterWrapper() {
  const layoutContainer = useFilterContainer()
  const isIPad = useIsIPad()
  const orientation = useOrientation()

  return {
    currentMode: layoutContainer.mode,
    isOverlayMode: layoutContainer.isOverlayMode,
    isOpen: layoutContainer.sheetProps?.baseProps?.open || false,
    deviceContext: layoutContainer.deviceContext,

    // iPad-specific properties
    isIPad,
    orientation,

    // Actions
    openFilters: () => layoutContainer.sheetProps?.baseProps?.onOpenChange?.(true),
    closeFilters: () => layoutContainer.sheetProps?.baseProps?.onOpenChange?.(false),
    toggleFilters: () => {
      const currentOpen = layoutContainer.sheetProps?.baseProps?.open || false
      layoutContainer.sheetProps?.baseProps?.onOpenChange?.(!currentOpen)
    },
  }
}

/**
 * Utility function to calculate filter performance metrics with iPad support
 */
export const ResponsiveFilterWrapperUtils = {
  /**
   * Check if current mode is optimal for the device (iPad-aware)
   */
  isModeOptimal: (mode: FilterLayoutMode, deviceContext: string, isIPad?: boolean): boolean => {
    // iPad-specific optimization logic
    if (isIPad) {
      switch (deviceContext) {
        case 'tablet-portrait':
          return mode === 'drawer' || mode === 'auto' // iPad portrait = drawer like mobile
        case 'tablet-landscape':
          return mode === 'inline' || mode === 'auto' // iPad landscape = inline like desktop
        default:
          return true
      }
    }

    // Standard logic for non-iPad devices
    switch (deviceContext) {
      case 'mobile':
        return mode === 'drawer' || mode === 'auto'
      case 'tablet-portrait':
        return mode === 'sheet' || mode === 'auto'
      case 'tablet-landscape':
      case 'desktop':
      case 'large-desktop':
        return mode === 'inline' || mode === 'auto'
      default:
        return true
    }
  },

  /**
   * Get recommended mode for device (iPad-aware)
   */
  getRecommendedMode: (deviceContext: string, isIPad?: boolean, orientation?: 'portrait' | 'landscape'): FilterLayoutMode => {
    // iPad-specific recommendations
    if (isIPad && orientation) {
      return orientation === 'portrait' ? 'drawer' : 'inline'
    }

    // Standard recommendations for non-iPad devices
    switch (deviceContext) {
      case 'mobile':
        return 'drawer'
      case 'tablet-portrait':
        return 'sheet'
      case 'tablet-landscape':
      case 'desktop':
      case 'large-desktop':
        return 'inline'
      default:
        return 'auto'
    }
  },

  /**
   * Calculate transition performance impact
   */
  getTransitionCost: (fromMode: FilterLayoutMode, toMode: FilterLayoutMode): 'low' | 'medium' | 'high' => {
    // Inline to inline = no cost
    if (fromMode === 'inline' && toMode === 'inline') return 'low'

    // Sheet to drawer or vice versa = medium cost (DOM restructure)
    if ((fromMode === 'sheet' && toMode === 'drawer') ||
        (fromMode === 'drawer' && toMode === 'sheet')) return 'medium'

    // Any overlay to inline or vice versa = high cost (component mount/unmount)
    if ((fromMode === 'inline' && (toMode === 'sheet' || toMode === 'drawer')) ||
        ((fromMode === 'sheet' || fromMode === 'drawer') && toMode === 'inline')) return 'high'

    return 'low'
  }
}

export type { ResponsiveFilterWrapperProps }