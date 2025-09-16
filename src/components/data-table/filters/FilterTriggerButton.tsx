import React, { useCallback } from 'react'
import { Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useFilterTrigger } from '@/hooks/useFilterLayout'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'

export interface FilterTriggerButtonProps {
  /**
   * Number of active filters to display in badge
   */
  activeFilterCount?: number

  /**
   * Override the button label text
   */
  label?: string

  /**
   * Whether the button is disabled
   */
  disabled?: boolean

  /**
   * Additional className for customization
   */
  className?: string

  /**
   * Button variant override
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'

  /**
   * Button size override
   */
  size?: 'default' | 'sm' | 'lg' | 'icon'

  /**
   * Whether to force show label on mobile (default: false)
   */
  forceShowLabel?: boolean

  /**
   * Accessibility label for screen readers
   */
  'aria-label'?: string

  /**
   * onClick handler override (if not using filter layout context)
   */
  onClick?: () => void
}

/**
 * FilterTriggerButton Component
 *
 * A responsive button that triggers filter overlays (sheet/drawer) on mobile/tablet
 * and provides visual feedback about active filters. Features:
 *
 * - Responsive design: icon-only on mobile, text+icon on desktop
 * - Active filter count badge
 * - Accessibility features with proper ARIA labels
 * - Integrates with FilterLayoutContext for automatic behavior
 * - Touch-friendly sizing (minimum 44px target)
 */
export function FilterTriggerButton({
  activeFilterCount = 0,
  label,
  disabled = false,
  className,
  variant = 'outline',
  size = 'default',
  forceShowLabel = false,
  'aria-label': ariaLabel,
  onClick: onClickOverride,
}: FilterTriggerButtonProps) {
  const { shouldShow, onClick, label: contextLabel, icon, mode } = useFilterTrigger()
  const { deviceContext, isTouch } = useDeviceDetection()

  // Handle click event with touch optimization
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent double-tap zoom on mobile
    if (isTouch) {
      event.preventDefault()
    }

    const clickHandler = onClickOverride || onClick
    if (clickHandler) {
      clickHandler()
    }
  }, [onClickOverride, onClick, isTouch])

  // Don't render if not needed (inline mode on desktop)
  if (!shouldShow && !onClickOverride) {
    return null
  }

  // Determine button content based on screen size and mode
  const displayLabel = label || contextLabel
  const showLabel = forceShowLabel || size !== 'icon'

  // Icon selection based on device context
  const IconComponent = icon === 'sidebar' ? SlidersHorizontal : Filter

  // Generate accessible label
  const accessibleLabel = ariaLabel ||
    (activeFilterCount > 0
      ? `${displayLabel || 'Filters'} (${activeFilterCount} active)`
      : displayLabel || 'Open filters')

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        // Base classes
        'relative inline-flex items-center justify-center',
        // Touch-friendly minimum size (44px Apple guidelines)
        'min-h-[44px] min-w-[44px] touch-manipulation',
        // Enhanced touch responsiveness
        isTouch && 'active:scale-95 transition-transform duration-75',
        // Improved mobile spacing
        deviceContext === 'mobile' ? 'gap-2 px-3' : 'gap-2 px-3',
        // Responsive text visibility
        !forceShowLabel && 'sm:gap-2',
        // Active state styling with better contrast
        activeFilterCount > 0 && [
          'ring-2 ring-primary/30 shadow-sm',
          variant === 'outline' && 'border-primary/60 bg-primary/5',
          variant === 'ghost' && 'bg-primary/10'
        ],
        // Enhanced hover states for non-touch devices
        !isTouch && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
      aria-label={accessibleLabel}
      aria-pressed={mode === 'sheet' || mode === 'drawer' ? 'false' : undefined}
      data-testid="filter-trigger-button"
      data-filter-mode={mode}
      data-active-filters={activeFilterCount}
    >
      {/* Filter Icon */}
      <IconComponent
        className={cn(
          // Larger icons on mobile for better touch targets
          deviceContext === 'mobile' ? 'h-5 w-5' : 'h-4 w-4',
          'flex-shrink-0',
          // Enhanced icon color based on active state
          activeFilterCount > 0 ? 'text-primary' : 'text-muted-foreground'
        )}
        aria-hidden="true"
      />

      {/* Button Label - responsive visibility */}
      {showLabel && displayLabel && (
        <span
          className={cn(
            'font-medium truncate',
            // Improved mobile typography
            deviceContext === 'mobile' ? 'text-sm' : 'text-sm',
            // Hide on mobile unless forced, with better breakpoints
            !forceShowLabel && 'hidden sm:inline',
            // Enhanced text color based on active state
            activeFilterCount > 0 ? 'text-primary font-semibold' : 'text-foreground'
          )}
        >
          {displayLabel}
        </span>
      )}

      {/* Active Filter Count Badge */}
      {activeFilterCount > 0 && (
        <Badge
          variant="default"
          className={cn(
            // Absolute positioning for overlay
            'absolute -top-1 -right-1',
            // Enhanced sizing for touch devices
            deviceContext === 'mobile'
              ? 'h-6 min-w-[24px] px-2 py-0.5'
              : 'h-5 min-w-[20px] px-1.5 py-0',
            // Improved typography for readability
            deviceContext === 'mobile' ? 'text-xs font-semibold' : 'text-xs font-medium',
            'leading-none',
            // Ensure it's above other content
            'z-10',
            // Enhanced visual prominence
            'bg-primary text-primary-foreground border border-background',
            'shadow-sm',
            // Responsive adjustments
            'sm:-top-1 sm:-right-1'
          )}
          aria-label={`${activeFilterCount} active ${activeFilterCount === 1 ? 'filter' : 'filters'}`}
        >
          {activeFilterCount > 99 ? '99+' : activeFilterCount}
        </Badge>
      )}
    </Button>
  )
}

/**
 * Compact variant for tight spaces
 */
export function CompactFilterTriggerButton(props: Omit<FilterTriggerButtonProps, 'size' | 'forceShowLabel'>) {
  return (
    <FilterTriggerButton
      {...props}
      size="icon"
      forceShowLabel={false}
    />
  )
}

/**
 * Extended variant that always shows label
 */
export function ExtendedFilterTriggerButton(props: Omit<FilterTriggerButtonProps, 'forceShowLabel'>) {
  return (
    <FilterTriggerButton
      {...props}
      forceShowLabel={true}
    />
  )
}

export type { FilterTriggerButtonProps }