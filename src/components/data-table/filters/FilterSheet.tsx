import React, { useEffect, useCallback, useRef } from 'react'
import { StandardSheet } from '@/components/ui/StandardSheet'
import { EntityFilters, type EntityFilterState, type FilterOption } from './EntityFilters'
import { FilterTriggerButton } from './FilterTriggerButton'
import { useFilterLayout, FilterLayoutUtils } from '@/hooks/useFilterLayout'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { cn } from '@/lib/utils'

export interface FilterSheetProps {
  /**
   * Entity type for the filters
   */
  entityType: 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'

  /**
   * Current filter state
   */
  filters: EntityFilterState

  /**
   * Callback when filters change
   */
  onFiltersChange: (filters: EntityFilterState) => void

  /**
   * Filter configuration passed to EntityFilters
   */
  searchPlaceholder?: string
  showSearch?: boolean
  principals?: FilterOption[]
  statuses?: FilterOption[]
  priorities?: FilterOption[]
  showTimeRange?: boolean
  showQuickFilters?: boolean
  showPrincipalFilter?: boolean
  showStatusFilter?: boolean
  showPriorityFilter?: boolean

  /**
   * Loading and state
   */
  isLoading?: boolean
  totalCount?: number
  filteredCount?: number

  /**
   * Sheet customization
   */
  title?: string
  description?: string
  className?: string

  /**
   * Trigger button customization
   */
  triggerLabel?: string
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost'
  showTrigger?: boolean

  /**
   * Sheet size override (auto-determined by default)
   */
  sheetSize?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * FilterSheet Component
 *
 * A responsive filter container that wraps EntityFilters in a Sheet/Drawer layout.
 * Features:
 *
 * - Responsive behavior: side sheet on tablet/desktop, bottom drawer on mobile
 * - Integration with FilterLayoutContext for automatic mode detection
 * - Proper header/footer layout with customizable titles
 * - Automatic trigger button with active filter count
 * - Optimized sizing and animations for different devices
 * - EntityFilters integration with layout mode support
 *
 * @example
 * <FilterSheet
 *   entityType="contacts"
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   title="Filter Contacts"
 *   description="Adjust filters to refine your contact list"
 *   showTimeRange={true}
 *   showQuickFilters={true}
 *   principals={principalOptions}
 *   showPrincipalFilter={true}
 * />
 */
export const FilterSheet = React.memo(function FilterSheet({
  entityType,
  filters,
  onFiltersChange,
  searchPlaceholder,
  showSearch = true,
  principals = [],
  statuses = [],
  priorities = [],
  showTimeRange = true,
  showQuickFilters = true,
  showPrincipalFilter = false,
  showStatusFilter = false,
  showPriorityFilter = false,
  isLoading = false,
  totalCount,
  filteredCount,
  title,
  description,
  className,
  triggerLabel,
  triggerVariant = 'outline',
  showTrigger = true,
  sheetSize,
}: FilterSheetProps) {
  const {
    currentMode,
    isOpen,
    setOpen,
    deviceContext,
  } = useFilterLayout()

  const { deviceContext: detectedContext, isTouch } = useDeviceDetection()
  const sheetContentRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)

  // Handle swipe gestures for mobile drawer dismissal
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isTouch || currentMode !== 'drawer' || !isOpen) return

    startYRef.current = e.touches[0].clientY
    currentYRef.current = e.touches[0].clientY
    isDraggingRef.current = true
  }, [isTouch, currentMode, isOpen])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || !isTouch || currentMode !== 'drawer') return

    currentYRef.current = e.touches[0].clientY
    const deltaY = currentYRef.current - startYRef.current

    // Only allow downward swipes for closing
    if (deltaY > 0 && sheetContentRef.current) {
      // Prevent default scrolling when dragging down
      if (deltaY > 10) {
        e.preventDefault()
      }

      // Apply visual feedback with transform
      const progress = Math.min(deltaY / 200, 1)
      const opacity = 1 - progress * 0.5
      sheetContentRef.current.style.transform = `translateY(${deltaY}px)`
      sheetContentRef.current.style.opacity = opacity.toString()
    }
  }, [isTouch, currentMode])

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current || !isTouch || currentMode !== 'drawer') return

    const deltaY = currentYRef.current - startYRef.current

    // Close if dragged down more than 100px or with sufficient velocity
    if (deltaY > 100) {
      setOpen(false)
    }

    // Reset styles
    if (sheetContentRef.current) {
      sheetContentRef.current.style.transform = ''
      sheetContentRef.current.style.opacity = ''
    }

    isDraggingRef.current = false
    startYRef.current = 0
    currentYRef.current = 0
  }, [isTouch, currentMode, setOpen])

  // Set up touch event listeners for mobile swipe gestures
  useEffect(() => {
    if (!isTouch || currentMode !== 'drawer' || !isOpen) return

    const content = sheetContentRef.current
    if (!content) return

    content.addEventListener('touchstart', handleTouchStart, { passive: false })
    content.addEventListener('touchmove', handleTouchMove, { passive: false })
    content.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      content.removeEventListener('touchstart', handleTouchStart)
      content.removeEventListener('touchmove', handleTouchMove)
      content.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isTouch, currentMode, isOpen, handleTouchStart, handleTouchMove, handleTouchEnd])

  // Don't render anything in inline mode
  if (currentMode === 'inline') {
    return null
  }

  // Calculate active filter count for trigger button
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key]
    return value && value !== '' && value !== 'all' && value !== 'none'
  }).length

  // Determine appropriate sheet side and size
  const sheetSide = FilterLayoutUtils.getSheetSide(deviceContext)
  const effectiveSize = sheetSize || (deviceContext === 'mobile' ? 'lg' : 'md')

  // Generate appropriate title and description
  const sheetTitle = title || `Filter ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`
  const sheetDescription = description || `Adjust filters to refine your ${entityType} list`

  // Generate trigger label based on mode and device
  const effectiveTriggerLabel = triggerLabel || (
    currentMode === 'drawer'
      ? 'Filter Options'
      : currentMode === 'sheet'
      ? 'Show Filters'
      : 'Filters'
  )

  return (
    <>
      {/* Trigger Button */}
      {showTrigger && (
        <FilterTriggerButton
          activeFilterCount={activeFilterCount}
          label={effectiveTriggerLabel}
          variant={triggerVariant}
          disabled={isLoading}
          onClick={() => setOpen(true)}
          aria-label={`Open filter panel (${activeFilterCount} active filters)`}
        />
      )}

      {/* Filter Sheet */}
      <StandardSheet
        open={isOpen}
        onOpenChange={setOpen}
        title={sheetTitle}
        description={sheetDescription}
        size={effectiveSize}
        side={sheetSide}
        scroll="content"
        className={cn(
          // Enhanced mobile styling
          isTouch && currentMode === 'drawer' && [
            'touch-pan-y',
            '[&>[data-radix-sheet-overlay]]:touch-manipulation',
          ]
        )}
        headerActions={
          activeFilterCount > 0 && (
            <div className={cn(
              'text-sm text-muted-foreground',
              detectedContext === 'mobile' && 'text-xs'
            )}>
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </div>
          )
        }
      >
        {/* Drag Handle for Mobile */}
        {isTouch && currentMode === 'drawer' && (
          <div className="flex cursor-grab justify-center px-4 py-2 active:cursor-grabbing">
            <div className="h-1 w-12 rounded-full bg-muted" />
          </div>
        )}

        <div
          ref={sheetContentRef}
          className={cn(
            'space-y-1',
            // Enhanced mobile padding and spacing
            detectedContext === 'mobile' && 'space-y-2',
            className
          )}
        >
          <EntityFilters
            entityType={entityType}
            filters={filters}
            onFiltersChange={onFiltersChange}
            searchPlaceholder={searchPlaceholder}
            showSearch={showSearch}
            principals={principals}
            statuses={statuses}
            priorities={priorities}
            compact={true} // Always use compact mode in sheets
            showTimeRange={showTimeRange}
            showQuickFilters={showQuickFilters}
            showPrincipalFilter={showPrincipalFilter}
            showStatusFilter={showStatusFilter}
            showPriorityFilter={showPriorityFilter}
            isLoading={isLoading}
            totalCount={totalCount}
            filteredCount={filteredCount}
            maxFiltersPerRow={1} // Single column in sheets
            layoutMode={currentMode}
            suppressLayoutContext={false}
          />
        </div>
      </StandardSheet>
    </>
  )
})

/**
 * FilterSheetTrigger - Standalone trigger button for when you want to manage the sheet separately
 */
export interface FilterSheetTriggerProps {
  activeFilterCount?: number
  label?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  disabled?: boolean
  onClick: () => void
  className?: string
}

export const FilterSheetTrigger = React.memo(function FilterSheetTrigger({
  activeFilterCount = 0,
  label,
  variant = 'outline',
  disabled = false,
  onClick,
  className,
}: FilterSheetTriggerProps) {
  return (
    <FilterTriggerButton
      activeFilterCount={activeFilterCount}
      label={label}
      variant={variant}
      disabled={disabled}
      onClick={onClick}
      className={className}
    />
  )
})

/**
 * FilterSheetContent - Standalone content component for when you want to manage the sheet wrapper separately
 */
export interface FilterSheetContentProps {
  entityType: 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'
  filters: EntityFilterState
  onFiltersChange: (filters: EntityFilterState) => void
  searchPlaceholder?: string
  showSearch?: boolean
  principals?: FilterOption[]
  statuses?: FilterOption[]
  priorities?: FilterOption[]
  showTimeRange?: boolean
  showQuickFilters?: boolean
  showPrincipalFilter?: boolean
  showStatusFilter?: boolean
  showPriorityFilter?: boolean
  isLoading?: boolean
  totalCount?: number
  filteredCount?: number
  className?: string
}

export const FilterSheetContent = React.memo(function FilterSheetContent({
  entityType,
  filters,
  onFiltersChange,
  searchPlaceholder,
  showSearch = true,
  principals = [],
  statuses = [],
  priorities = [],
  showTimeRange = true,
  showQuickFilters = true,
  showPrincipalFilter = false,
  showStatusFilter = false,
  showPriorityFilter = false,
  isLoading = false,
  totalCount,
  filteredCount,
  className,
}: FilterSheetContentProps) {
  const { currentMode } = useFilterLayout()

  return (
    <div className={cn('space-y-1', className)}>
      <EntityFilters
        entityType={entityType}
        filters={filters}
        onFiltersChange={onFiltersChange}
        searchPlaceholder={searchPlaceholder}
        showSearch={showSearch}
        principals={principals}
        statuses={statuses}
        priorities={priorities}
        compact={true} // Always compact in sheet content
        showTimeRange={showTimeRange}
        showQuickFilters={showQuickFilters}
        showPrincipalFilter={showPrincipalFilter}
        showStatusFilter={showStatusFilter}
        showPriorityFilter={showPriorityFilter}
        isLoading={isLoading}
        totalCount={totalCount}
        filteredCount={filteredCount}
        maxFiltersPerRow={1} // Single column layout
        layoutMode={currentMode}
        suppressLayoutContext={false}
      />
    </div>
  )
})

export type { FilterSheetProps, FilterSheetTriggerProps, FilterSheetContentProps }