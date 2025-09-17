import React, { useCallback } from 'react'
import { Search, Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { TimeRangeFilter, type TimeRangeType } from './TimeRangeFilter'
import { QuickFilters, type QuickFilterValue } from './QuickFilters'
import { useFilterLayout } from '@/contexts/FilterLayoutContext'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import type { FilterLayoutMode } from '@/types/filters.types'

export interface EntityFilterState {
  search?: string
  timeRange?: TimeRangeType
  quickView?: QuickFilterValue
  principal?: string
  status?: string
  priority?: string
  [key: string]: string | undefined
}

interface FilterOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface EntityFiltersProps {
  entityType: 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'
  filters: EntityFilterState
  onFiltersChange: (filters: EntityFilterState) => void

  // Search configuration
  searchPlaceholder?: string
  showSearch?: boolean

  // Available options for dropdowns
  principals?: FilterOption[]
  statuses?: FilterOption[]
  priorities?: FilterOption[]

  // Display options
  compact?: boolean
  showTimeRange?: boolean
  showQuickFilters?: boolean
  showPrincipalFilter?: boolean
  showStatusFilter?: boolean
  showPriorityFilter?: boolean

  // Loading and state
  isLoading?: boolean
  totalCount?: number
  filteredCount?: number

  // Layout
  className?: string
  maxFiltersPerRow?: number

  // Layout mode support
  layoutMode?: FilterLayoutMode
  suppressLayoutContext?: boolean
}

export function EntityFilters({
  entityType,
  filters,
  onFiltersChange,
  searchPlaceholder,
  showSearch = true,
  principals = [],
  statuses = [],
  priorities = [],
  compact = false,
  showTimeRange = true,
  showQuickFilters = true,
  showPrincipalFilter = false,
  showStatusFilter = false,
  showPriorityFilter = false,
  isLoading = false,
  totalCount,
  filteredCount,
  className = '',
  maxFiltersPerRow = 4,
  layoutMode,
  suppressLayoutContext = false,
}: EntityFiltersProps) {
  const { deviceContext, isTouch } = useDeviceDetection()

  // Get layout context (if not suppressed)
  let layoutContext = null
  if (!suppressLayoutContext) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      layoutContext = useFilterLayout()
    } catch {
      // Context not available, use inline mode
      layoutContext = null
    }
  }

  // Determine effective layout mode
  const effectiveLayoutMode = layoutMode || layoutContext?.currentMode || 'inline'

  // Auto-adjust settings based on layout mode
  const isNonInlineMode = effectiveLayoutMode === 'sheet' || effectiveLayoutMode === 'drawer'
  const effectiveCompact = isNonInlineMode ? true : compact
  const effectiveMaxFiltersPerRow = isNonInlineMode ? 1 : maxFiltersPerRow

  // Helper function to update filters with touch optimization
  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const newFilters = { ...filters }

      if (value === undefined || value === '' || value === 'all' || value === 'none') {
        delete newFilters[key]
      } else {
        newFilters[key] = value
      }

      onFiltersChange(newFilters)
    },
    [filters, onFiltersChange]
  )

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter((key) => {
    const value = filters[key]
    return value && value !== '' && value !== 'all' && value !== 'none'
  }).length

  // Clear all filters with touch feedback
  const clearAllFilters = useCallback(() => {
    onFiltersChange({})
  }, [onFiltersChange])

  // Generate search placeholder based on entity type
  const getSearchPlaceholder = () => {
    if (searchPlaceholder) return searchPlaceholder

    const placeholders = {
      organizations: 'Search organizations by name, location, manager, phone, or segment...',
      contacts: 'Search contacts by name, title, organization, email, or phone...',
      opportunities: 'Search opportunities by name, organization, stage, or value...',
      products: 'Search products by name, category, SKU, or description...',
      interactions: 'Search interactions by type, description, or contact...',
    }

    return placeholders[entityType] || 'Search...'
  }

  // Filter content components to be rendered
  const renderFilterContent = () => (
    <>
      {/* Primary Filter Controls Row */}
      <div
        className={cn(
          'grid',
          // Enhanced spacing for touch devices
          deviceContext === 'mobile' ? 'gap-4' : 'gap-3 sm:gap-4',
          effectiveMaxFiltersPerRow === 1 && 'grid-cols-1',
          effectiveMaxFiltersPerRow === 2 && 'grid-cols-1 md:grid-cols-2',
          effectiveMaxFiltersPerRow === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          effectiveMaxFiltersPerRow === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          effectiveMaxFiltersPerRow === 5 &&
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
          // Layout-specific adjustments with touch considerations
          isNonInlineMode && (deviceContext === 'mobile' ? 'gap-5' : 'gap-4')
        )}
      >
        {/* Search Filter */}
        {showSearch && (
          <div className="flex flex-col space-y-1">
            {!effectiveCompact && (
              <label
                className={cn(
                  'text-xs font-medium text-muted-foreground',
                  deviceContext === 'mobile' && 'text-sm'
                )}
              >
                Search
              </label>
            )}
            <div className="relative">
              <Search
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
                  deviceContext === 'mobile' ? 'size-5' : 'size-4'
                )}
              />
              <Input
                placeholder={getSearchPlaceholder()}
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className={cn(
                  deviceContext === 'mobile' ? 'pl-12 h-12 text-base' : 'pl-10',
                  // Enhanced touch responsiveness
                  isTouch && 'touch-manipulation focus:ring-2 focus:ring-primary/20'
                )}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Time Range Filter */}
        {showTimeRange && (
          <TimeRangeFilter
            value={filters.timeRange || 'this_month'}
            onChange={(value) => updateFilter('timeRange', value)}
            compact={effectiveCompact}
            isLoading={isLoading}
            showLabel={!effectiveCompact}
            showQuickPresets={false}
          />
        )}

        {/* Principal Filter */}
        {showPrincipalFilter && principals.length > 0 && (
          <div className="flex flex-col space-y-1">
            {!effectiveCompact && (
              <label
                className={cn(
                  'text-xs font-medium text-muted-foreground',
                  deviceContext === 'mobile' && 'text-sm'
                )}
              >
                Principal
              </label>
            )}
            <Select
              value={filters.principal || 'all'}
              onValueChange={(value) => updateFilter('principal', value)}
              disabled={isLoading}
            >
              <SelectTrigger
                className={cn(
                  deviceContext === 'mobile' && 'h-12 text-base',
                  isTouch && 'touch-manipulation'
                )}
              >
                <SelectValue placeholder="Select principal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Principals</SelectItem>
                {principals.map((principal) => (
                  <SelectItem
                    key={principal.value}
                    value={principal.value}
                    className={cn(deviceContext === 'mobile' && 'min-h-[44px] text-base')}
                  >
                    {principal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Filter */}
        {showStatusFilter && statuses.length > 0 && (
          <div className="flex flex-col space-y-1">
            {!effectiveCompact && (
              <label
                className={cn(
                  'text-xs font-medium text-muted-foreground',
                  deviceContext === 'mobile' && 'text-sm'
                )}
              >
                Status
              </label>
            )}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => updateFilter('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger
                className={cn(
                  deviceContext === 'mobile' && 'h-12 text-base',
                  isTouch && 'touch-manipulation'
                )}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem
                    key={status.value}
                    value={status.value}
                    className={cn(deviceContext === 'mobile' && 'min-h-[44px] text-base')}
                  >
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Priority Filter */}
        {showPriorityFilter && priorities.length > 0 && (
          <div className="flex flex-col space-y-1">
            {!effectiveCompact && (
              <label
                className={cn(
                  'text-xs font-medium text-muted-foreground',
                  deviceContext === 'mobile' && 'text-sm'
                )}
              >
                Priority
              </label>
            )}
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) => updateFilter('priority', value)}
              disabled={isLoading}
            >
              <SelectTrigger
                className={cn(
                  deviceContext === 'mobile' && 'h-12 text-base',
                  isTouch && 'touch-manipulation'
                )}
              >
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem
                    key={priority.value}
                    value={priority.value}
                    className={cn(deviceContext === 'mobile' && 'min-h-[44px] text-base')}
                  >
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Quick Filters Section */}
      {showQuickFilters && (
        <>
          <Separator />
          <QuickFilters
            value={filters.quickView || 'none'}
            onChange={(value) => updateFilter('quickView', value)}
            entityType={entityType}
            compact={effectiveCompact}
            isLoading={isLoading}
            showBadges={!effectiveCompact}
          />
        </>
      )}

      {/* Active Filters Summary and Actions */}
      {(activeFilterCount > 0 || (totalCount !== undefined && filteredCount !== undefined)) && (
        <>
          <Separator />
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Filter Summary */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {activeFilterCount > 0 && (
                <div className="flex items-center space-x-2">
                  <Filter className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </span>

                  {/* Active filter badges */}
                  <div className="flex flex-wrap items-center gap-1">
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value || value === 'all' || value === 'none') return null

                      let displayValue = value
                      if (key === 'timeRange') displayValue = value.replace('_', ' ')
                      if (key === 'quickView') displayValue = value.replace('_', ' ')

                      return (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key === 'timeRange'
                            ? 'Time'
                            : key === 'quickView'
                              ? 'Quick'
                              : key.charAt(0).toUpperCase() + key.slice(1)}
                          : {displayValue}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'ml-1 h-auto p-1 text-muted-foreground hover:text-foreground touch-manipulation',
                              // Enhanced touch targets
                              deviceContext === 'mobile'
                                ? 'min-h-[32px] min-w-[32px]'
                                : 'min-h-[24px] min-w-[24px]',
                              isTouch && 'active:scale-95 transition-transform duration-75'
                            )}
                            onClick={() => updateFilter(key, undefined)}
                            aria-label={`Remove ${key} filter`}
                          >
                            <RotateCcw
                              className={cn(deviceContext === 'mobile' ? 'size-4' : 'size-3')}
                            />
                          </Button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Results Count and Clear All */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {totalCount !== undefined && filteredCount !== undefined && (
                <span className="text-sm text-muted-foreground">
                  {filteredCount === totalCount
                    ? `${totalCount} ${entityType}`
                    : `${filteredCount} of ${totalCount} ${entityType}`}
                </span>
              )}

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={isLoading}
                  className={cn(
                    'touch-manipulation',
                    deviceContext === 'mobile' ? 'text-sm h-10 px-4 min-h-[44px]' : 'text-xs h-8',
                    isTouch && 'active:scale-95 transition-transform duration-75'
                  )}
                >
                  <RotateCcw
                    className={cn('mr-1', deviceContext === 'mobile' ? 'size-4' : 'size-3')}
                  />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )

  // Return content with layout-specific wrapper
  switch (effectiveLayoutMode) {
    case 'inline':
      return <div className={cn('space-y-4', className)}>{renderFilterContent()}</div>

    case 'sheet':
    case 'drawer':
      // For sheet/drawer modes, return the content with mobile optimizations
      return (
        <div
          className={cn(
            'space-y-4 p-4',
            isNonInlineMode && 'max-h-screen overflow-y-auto',
            className
          )}
        >
          {renderFilterContent()}
        </div>
      )

    default:
      return <div className={cn('space-y-4', className)}>{renderFilterContent()}</div>
  }
}

export type { FilterOption }
