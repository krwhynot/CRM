import React from 'react'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { semanticSpacing, semanticColors } from '@/styles/tokens'
import type {
  FilterSlotProps,
  FilterSlotDesktopProps,
  FilterSlotMobileProps,
  FilterContentWrapperProps,
} from './FilterSlot.types'

/**
 * Content wrapper component for filter sections and custom content
 */
const FilterContentWrapper: React.FC<FilterContentWrapperProps> = ({
  children,
  sections,
  mode = 'sections',
}) => {
  // If we have both sections and children, handle hybrid mode
  if (mode === 'hybrid' && sections && children) {
    return (
      <div className={semanticSpacing.stack.md}>
        {/* Render sections first */}
        <div>{/* FilterSidebar will handle sections internally */}</div>
        {/* Then custom content */}
        <div>{children}</div>
      </div>
    )
  }

  // For custom mode, just render children
  if (mode === 'custom' || (!sections && children)) {
    return <>{children}</>
  }

  // For sections mode or when only sections are provided
  // FilterSidebar will handle rendering internally
  return null
}

/**
 * Desktop filter slot component
 * Renders persistent sidebar with resizable functionality
 */
const FilterSlotDesktop: React.FC<FilterSlotDesktopProps> = ({
  children,
  sections,
  config,
  className,
}) => {
  return (
    <FilterSidebar {...config} sections={sections} className={cn('hidden md:block', className)}>
      <FilterContentWrapper sections={sections} mode={config.mode}>
        {children}
      </FilterContentWrapper>
    </FilterSidebar>
  )
}

/**
 * Mobile filter slot component
 * Renders as sheet overlay with floating trigger
 */
const FilterSlotMobile: React.FC<FilterSlotMobileProps> = ({
  children,
  sections,
  config,
  trigger,
  className,
}) => {
  // Count active filters for badge (if showFilterCount is enabled)
  const filterCount = React.useMemo(() => {
    if (!config.showFilterCount) return 0

    // Simple count based on sections - in real implementation,
    // this would integrate with actual filter state
    return sections?.length || 0
  }, [sections, config.showFilterCount])

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        'fixed bottom-6 right-6 z-50 shadow-lg',
        semanticColors.cardBackground,
        'md:hidden' // Only show on mobile
      )}
    >
      <Filter className="size-4" />
      <span className={semanticSpacing.leftGap.xs}>Filters</span>
      {config.showFilterCount && filterCount > 0 && (
        <Badge variant="secondary" className={semanticSpacing.leftGap.xs}>
          {filterCount}
        </Badge>
      )}
    </Button>
  )

  return (
    <div className={cn('md:hidden', className)}>
      <FilterSidebar {...config} sections={sections}>
        <FilterContentWrapper sections={sections} mode={config.mode}>
          {children}
        </FilterContentWrapper>
      </FilterSidebar>

      {/* Custom or default trigger for mobile sheet */}
      {trigger || defaultTrigger}
    </div>
  )
}

/**
 * FilterSlot Component
 *
 * Wrapper component that integrates FilterSidebar with PageLayout.
 * Provides slot-specific configuration and mobile/desktop rendering strategies.
 *
 * Features:
 * - Desktop persistent sidebar with resize functionality
 * - Mobile sheet overlay with floating trigger
 * - Support for both structured sections and custom content
 * - Hybrid mode for combining sections with custom elements
 * - Integration with PageLayout state management
 *
 * @example
 * ```tsx
 * // With structured sections
 * <FilterSlot
 *   sections={filterSections}
 *   persistKey="organizations-filters"
 *   showFilterCount
 * />
 *
 * // With custom content
 * <FilterSlot mode="custom">
 *   <OrganizationFilters />
 * </FilterSlot>
 *
 * // Hybrid approach
 * <FilterSlot
 *   sections={basicSections}
 *   mode="hybrid"
 * >
 *   <AdvancedFilters />
 * </FilterSlot>
 * ```
 */
export const FilterSlot: React.FC<FilterSlotProps> = ({
  children,
  sections,

  // Configuration
  mode = 'sections',
  showFilterCount = false,
  customTrigger,
  slotClassName,
  context = 'page-layout',
  pageLayoutIntegration = true,

  // FilterSidebar props
  defaultCollapsed = false,
  collapsedWidth = 64,
  expandedWidth = 280,
  minWidth = 200,
  maxWidth = 400,
  persistKey = 'filter-slot',
  className,
  onCollapsedChange,
  onWidthChange,
  mobileBreakpoint = 'md',
  ...restProps
}) => {
  // Configuration object for child components
  const config = {
    mode,
    showFilterCount,
    defaultCollapsed,
    collapsedWidth,
    expandedWidth,
    minWidth,
    maxWidth,
    persistKey,
    onCollapsedChange,
    onWidthChange,
    mobileBreakpoint,
    slotClassName,
    ...restProps,
  }

  // Root wrapper classes
  const wrapperClasses = cn(context === 'page-layout' && 'h-full', slotClassName)

  // For standalone context, render both desktop and mobile versions
  if (context === 'standalone') {
    return (
      <div className={wrapperClasses}>
        <FilterSlotDesktop sections={sections} config={config} className={className}>
          {children}
        </FilterSlotDesktop>

        <FilterSlotMobile
          sections={sections}
          config={config}
          trigger={customTrigger}
          className={className}
        >
          {children}
        </FilterSlotMobile>
      </div>
    )
  }

  // For page-layout context (default), return content for PageLayout to handle
  // PageLayout will render desktop and mobile versions separately
  return (
    <FilterContentWrapper sections={sections} mode={mode}>
      {children}
    </FilterContentWrapper>
  )
}

// Default export
export default FilterSlot

// Named exports for advanced usage
export { FilterSlotDesktop, FilterSlotMobile, FilterContentWrapper }
export type {
  FilterSlotProps,
  FilterSlotDesktopProps,
  FilterSlotMobileProps,
  FilterContentWrapperProps,
}
