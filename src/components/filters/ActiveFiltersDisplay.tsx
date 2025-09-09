import { useState } from 'react'
import { X, RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { StandardDialog } from '@/components/ui/StandardDialog'
import { getQuickViewPreset } from '@/lib/quick-view-presets'
import { getDateRangeDescription } from '@/lib/date-range-utils'
import type { UniversalFilterState, QuickViewType, ComputedFilterProperties } from '@/types/filters.types'

interface ActiveFiltersDisplayProps {
  filters: UniversalFilterState
  computed: ComputedFilterProperties
  onClearFilter: (filterKey: keyof UniversalFilterState) => void
  onClearAllFilters: () => void
  onSavePreset?: (preset: Partial<UniversalFilterState>) => void
  compact?: boolean
  showActions?: boolean
  maxDisplayedFilters?: number
}

interface FilterBadgeInfo {
  key: keyof UniversalFilterState
  label: string
  value: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
  removable: boolean
}

export function ActiveFiltersDisplay({
  filters,
  computed,
  onClearFilter,
  onClearAllFilters,
  onSavePreset,
  compact = false,
  showActions = true,
  maxDisplayedFilters = 8
}: ActiveFiltersDisplayProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  // Generate filter badge information
  const getActiveFilterBadges = (): FilterBadgeInfo[] => {
    const badges: FilterBadgeInfo[] = []

    // Time Range filter
    if (filters.timeRange !== 'this_month') {
      badges.push({
        key: 'timeRange',
        label: 'Time',
        value: getDateRangeDescription(filters.timeRange, 
          filters.dateFrom && filters.dateTo 
            ? { start: filters.dateFrom, end: filters.dateTo } 
            : undefined
        ),
        variant: 'secondary',
        removable: true
      })
    }

    // Focus filter
    if (filters.focus !== 'all_activity') {
      badges.push({
        key: 'focus',
        label: 'Focus',
        value: filters.focus.replace('_', ' '),
        variant: filters.focus === 'my_tasks' ? 'default' : 'secondary',
        removable: true
      })
    }

    // Quick View filter
    if (filters.quickView !== 'none') {
      const preset = getQuickViewPreset(filters.quickView as QuickViewType)
      badges.push({
        key: 'quickView',
        label: 'Quick View',
        value: preset?.name || filters.quickView.replace('_', ' '),
        variant: 'default',
        removable: true
      })
    }

    // Principal filter
    if (filters.principal !== 'all') {
      badges.push({
        key: 'principal',
        label: 'Principal',
        value: filters.principal,
        variant: 'outline',
        removable: true
      })
    }

    // Product filter
    if (filters.product !== 'all') {
      badges.push({
        key: 'product',
        label: 'Product',
        value: filters.product,
        variant: 'outline',
        removable: true
      })
    }

    return badges
  }

  const activeFilterBadges = getActiveFilterBadges()
  const displayedBadges = activeFilterBadges.slice(0, maxDisplayedFilters)
  const hiddenCount = Math.max(0, activeFilterBadges.length - maxDisplayedFilters)

  // Don't render if no active filters
  if (activeFilterBadges.length === 0) {
    return null
  }

  const handleClearFilter = (filterKey: keyof UniversalFilterState) => {
    onClearFilter(filterKey)
  }

  const handleSavePreset = () => {
    if (onSavePreset) {
      const presetData: Partial<UniversalFilterState> = {
        timeRange: filters.timeRange,
        focus: filters.focus,
        quickView: filters.quickView
      }
      
      // Only include non-default values
      if (filters.principal !== 'all') presetData.principal = filters.principal
      if (filters.product !== 'all') presetData.product = filters.product
      
      onSavePreset(presetData)
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-muted-foreground">
              Active Filters
            </span>
            <Badge variant="outline" className="text-xs">
              {computed.activeFilterCount}
            </Badge>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1">
              {onSavePreset && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSavePreset}
                        className="h-6 px-2"
                      >
                        <Save className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save current filters as preset</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => setShowClearConfirm(true)}
                    >
                      <RotateCcw className="size-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear all filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <StandardDialog
                variant="alert"
                open={showClearConfirm}
                onOpenChange={setShowClearConfirm}
                title="Clear All Filters?"
                description="This will reset all filters to their default values. You cannot undo this action."
                confirmText="Clear All Filters"
                confirmVariant="destructive"
                onConfirm={() => {
                  onClearAllFilters()
                  setShowClearConfirm(false)
                }}
              >
                <div></div>
              </StandardDialog>
            </div>
          )}
        </div>
      )}

      {/* Filter Summary */}
      {!compact && (
        <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Showing: {computed.filterSummary}
        </div>
      )}

      {/* Active Filter Badges */}
      <div className="flex flex-wrap gap-2">
        {displayedBadges.map((badge, index) => (
          <div key={`${badge.key}-${index}`} className="flex items-center">
            <Badge
              variant={badge.variant}
              className="flex items-center space-x-1 px-2 py-1 text-xs"
            >
              <span className="font-medium">{badge.label}:</span>
              <span>{badge.value}</span>
              {badge.removable && (
                <button
                  onClick={() => handleClearFilter(badge.key)}
                  className="ml-1 rounded p-0.5 transition-colors hover:bg-background/20"
                >
                  <X className="size-2.5" />
                </button>
              )}
            </Badge>
          </div>
        ))}
        
        {hiddenCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  +{hiddenCount} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {activeFilterBadges.slice(maxDisplayedFilters).map((badge, index) => (
                    <div key={index} className="text-xs">
                      {badge.label}: {badge.value}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Compact Mode Clear All */}
      {compact && showActions && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="mr-1 size-3" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}