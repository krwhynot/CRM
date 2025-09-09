import React from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { TimeRangeFilter } from './TimeRangeFilter'
import { FocusFilter } from './FocusFilter'
import { QuickViewFilter } from './QuickViewFilter'
import { PrincipalSelector } from './PrincipalSelector'
import { ManagerSelector } from './ManagerSelector'
import { QuickViewsSection } from './QuickViewsSection'
import { ActiveFiltersDisplay } from './ActiveFiltersDisplay'
import { useFilterChangeHandler, useActiveFilterCount } from '@/hooks/useUniversalFilters'
import type { EnhancedUniversalFiltersProps } from '@/types/filters.types'

export function EnhancedUniversalFilters({
  filters,
  onFiltersChange,
  isLoading = false,
  showTimeRange = true,
  showFocus = true,
  showQuickView = true,
  compact = false,
  maxColumns = 3,
  compactMode = 'standard',
  principals = [],
  managers = [],
  availableQuickViews,
  showPrincipalSelector = false,
  showManagerSelector = false,
  showQuickViews = false,
  enableActiveFilterManagement = true,
  variant = 'card',
  headerActions,
  onPrincipalChange,
  onManagerChange,
  onClearFilter,
  onClearAllFilters,
  onSavePreset
}: EnhancedUniversalFiltersProps) {
  const handleFieldChange = useFilterChangeHandler(filters, onFiltersChange)
  const activeFilterCount = useActiveFilterCount(filters)

  // Get dynamic grid columns based on maxColumns and active components
  const getGridColumns = () => {
    const components = [
      showTimeRange,
      showFocus, 
      showQuickView,
      showPrincipalSelector,
      showManagerSelector
    ].filter(Boolean).length
    
    const effectiveColumns = Math.min(maxColumns, components)
    
    return {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
    }[effectiveColumns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  // Handle individual filter clearing
  const handleClearFilter = (filterKey: keyof typeof filters) => {
    if (onClearFilter) {
      onClearFilter(filterKey)
    } else {
      // Fallback to direct filter change
      const defaultValues = {
        timeRange: 'this_month',
        focus: 'all_activity',
        quickView: 'none',
        principal: 'all',
        product: 'all'
      }
      handleFieldChange(filterKey, defaultValues[filterKey as keyof typeof defaultValues])
    }
  }

  // Compute properties for ActiveFiltersDisplay
  const computed = {
    isMyTasksView: filters.focus === 'my_tasks',
    hasActiveFilters: activeFilterCount > 0,
    activeFilterCount,
    filterSummary: `${activeFilterCount} active filters`,
    dateRangeText: filters.timeRange.replace('_', ' '),
    effectiveTimeRange: { start: new Date(), end: new Date() } // Would be calculated properly
  }

  // Container component based on variant
  const ContainerComponent = ({ children }: { children: React.ReactNode }) => {
    switch (variant) {
      case 'inline':
        return <div className="space-y-4">{children}</div>
      case 'minimal':
        return <div className="space-y-2">{children}</div>
      case 'card':
      default:
        return (
          <Card className="border-primary/10 shadow-sm">
            <CardContent className={compact || compactMode === 'minimal' ? "p-3" : "p-4"}>
              <div className="space-y-4">
                {children}
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <ContainerComponent>
      {/* Header */}
      {variant !== 'minimal' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Universal Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {headerActions}
            
            {onClearAllFilters && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAllFilters}
                      disabled={isLoading}
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Quick Views Section */}
      {showQuickViews && (
        <QuickViewsSection
          selectedQuickView={filters.quickView}
          onQuickViewChange={(preset) => handleFieldChange('quickView', preset)}
          availableQuickViews={availableQuickViews}
          isLoading={isLoading}
          compact={compact || compactMode === 'minimal'}
          showBadges={compactMode !== 'minimal'}
          showSuggestions={compactMode === 'full'}
        />
      )}

      {/* Filter Controls Grid */}
      <div className={`grid gap-4 ${getGridColumns()}`}>
        {/* Time Range Filter */}
        {showTimeRange && (
          <TimeRangeFilter
            value={filters.timeRange}
            onChange={(value) => handleFieldChange('timeRange', value)}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onDateFromChange={(date) => handleFieldChange('dateFrom', date)}
            onDateToChange={(date) => handleFieldChange('dateTo', date)}
            isLoading={isLoading}
            compact={compact || compactMode === 'minimal'}
            showQuickPresets={compactMode === 'full'}
            showLabel={compactMode !== 'minimal'}
          />
        )}

        {/* Focus Filter */}
        {showFocus && (
          <div className="flex flex-col space-y-1">
            {!compact && compactMode !== 'minimal' && (
              <label className="text-xs font-medium text-muted-foreground">
                Focus
              </label>
            )}
            <FocusFilter
              value={filters.focus}
              onChange={(value) => handleFieldChange('focus', value)}
              isLoading={isLoading}
              compact={compact || compactMode === 'minimal'}
              showBadges={compactMode !== 'minimal'}
            />
          </div>
        )}

        {/* Legacy Quick View Filter (fallback) */}
        {showQuickView && !showQuickViews && (
          <div className="flex flex-col space-y-1">
            {!compact && compactMode !== 'minimal' && (
              <label className="text-xs font-medium text-muted-foreground">
                Quick View
              </label>
            )}
            <QuickViewFilter
              value={filters.quickView}
              onChange={(value) => handleFieldChange('quickView', value)}
              isLoading={isLoading}
              compact={compact || compactMode === 'minimal'}
              showBadges={compactMode !== 'minimal'}
            />
          </div>
        )}

        {/* Principal Selector */}
        {showPrincipalSelector && (
          <PrincipalSelector
            value={filters.principal || 'all'}
            onChange={(value) => {
              handleFieldChange('principal', value)
              onPrincipalChange?.(value)
            }}
            principals={principals}
            isLoading={isLoading}
            compact={compact || compactMode === 'minimal'}
            showBadges={compactMode !== 'minimal'}
          />
        )}

        {/* Manager Selector */}
        {showManagerSelector && (
          <ManagerSelector
            value={filters.focus === 'my_tasks' ? 'my_activity' : 'all'}
            onChange={(value) => {
              if (value === 'my_activity') {
                handleFieldChange('focus', 'my_tasks')
              } else {
                handleFieldChange('focus', 'all_activity')
              }
              onManagerChange?.(value)
            }}
            managers={managers}
            isLoading={isLoading}
            compact={compact || compactMode === 'minimal'}
            showBadges={compactMode !== 'minimal'}
          />
        )}
      </div>

      {/* Advanced Active Filters Display */}
      {enableActiveFilterManagement && activeFilterCount > 0 && (
        <ActiveFiltersDisplay
          filters={filters}
          computed={computed}
          onClearFilter={handleClearFilter}
          onClearAllFilters={onClearAllFilters || (() => {})}
          onSavePreset={onSavePreset}
          compact={compact || compactMode === 'minimal'}
          showActions={variant !== 'minimal'}
        />
      )}
    </ContainerComponent>
  )
}

// Legacy component for backward compatibility
export function UniversalFilters(props: EnhancedUniversalFiltersProps) {
  return <EnhancedUniversalFilters {...props} />
}

// Variant components for different use cases
export function CompactUniversalFilters(props: EnhancedUniversalFiltersProps) {
  return <EnhancedUniversalFilters {...props} compact={true} compactMode="minimal" />
}

export function InlineUniversalFilters(props: EnhancedUniversalFiltersProps) {
  return <EnhancedUniversalFilters {...props} variant="inline" />
}

export function MinimalUniversalFilters(props: EnhancedUniversalFiltersProps) {
  return <EnhancedUniversalFilters {...props} variant="minimal" compactMode="minimal" />
}

export function FullFeaturedUniversalFilters(props: EnhancedUniversalFiltersProps) {
  return (
    <EnhancedUniversalFilters 
      {...props} 
      compactMode="full" 
      showQuickViews={true}
      enableActiveFilterManagement={true}
      maxColumns={4}
    />
  )
}