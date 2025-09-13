import { useState } from 'react'
import { X, RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { StandardDialog } from '@/components/ui/StandardDialog'
import { getQuickViewPreset } from '@/lib/quick-view-presets'
import { getDateRangeDescription } from '@/lib/date-range-utils'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
import type {
  UniversalFilterState,
  QuickViewType,
  ComputedFilterProperties,
} from '@/types/filters.types'

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
  maxDisplayedFilters = 8,
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
        value: getDateRangeDescription(
          filters.timeRange,
          filters.dateFrom && filters.dateTo
            ? { start: filters.dateFrom, end: filters.dateTo }
            : undefined
        ),
        variant: 'secondary',
        removable: true,
      })
    }

    // Focus filter
    if (filters.focus !== 'all_activity') {
      badges.push({
        key: 'focus',
        label: 'Focus',
        value: filters.focus.replace('_', ' '),
        variant: filters.focus === 'my_tasks' ? 'default' : 'secondary',
        removable: true,
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
        removable: true,
      })
    }

    // Principal filter
    if (
      Array.isArray(filters.principal)
        ? filters.principal.length > 0 && !filters.principal.includes('all')
        : filters.principal !== 'all'
    ) {
      const principalValue = Array.isArray(filters.principal)
        ? filters.principal.join(', ')
        : filters.principal
      badges.push({
        key: 'principal',
        label: 'Principal',
        value: principalValue,
        variant: 'outline',
        removable: true,
      })
    }

    // Product filter
    if (filters.product !== 'all') {
      badges.push({
        key: 'product',
        label: 'Product',
        value: filters.product,
        variant: 'outline',
        removable: true,
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
        quickView: filters.quickView,
      }

      // Only include non-default values
      if (filters.principal !== 'all') presetData.principal = filters.principal
      if (filters.product !== 'all') presetData.product = filters.product

      onSavePreset(presetData)
    }
  }

  return (
    <div className={`${semanticSpacing.stack.sm}`}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
            <span
              className={cn(
                semanticTypography.caption,
                semanticTypography.label,
                'text-muted-foreground'
              )}
            >
              Active Filters
            </span>
            <Badge variant="outline" className={`${semanticTypography.caption}`}>
              {computed.activeFilterCount}
            </Badge>
          </div>

          {showActions && (
            <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
              {onSavePreset && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSavePreset}
                        className={cn(semanticSpacing.compactX, 'h-6')}
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
                      className={cn(semanticSpacing.compactX, 'h-6')}
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
        <div
          className={cn(
            semanticRadius.default,
            semanticSpacing.compactX,
            semanticSpacing.compactY,
            semanticTypography.caption,
            'bg-muted/30 text-muted-foreground'
          )}
        >
          Showing: {computed.filterSummary}
        </div>
      )}

      {/* Active Filter Badges */}
      <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
        {displayedBadges.map((badge, index) => (
          <div key={`${badge.key}-${index}`} className="flex items-center">
            <Badge
              variant={badge.variant}
              className={cn(
                semanticSpacing.inline.xs,
                semanticSpacing.compactX,
                semanticSpacing.minimalY,
                semanticTypography.caption,
                'flex items-center'
              )}
            >
              <span className={`${semanticTypography.label}`}>{badge.label}:</span>
              <span>{badge.value}</span>
              {badge.removable && (
                <button
                  onClick={() => handleClearFilter(badge.key)}
                  className={cn(
                    semanticRadius.small,
                    'ml-1 p-0.5 transition-colors hover:bg-background/20'
                  )}
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
                <Badge
                  variant="outline"
                  className={cn(
                    semanticSpacing.compactX,
                    semanticSpacing.minimalY,
                    semanticTypography.caption
                  )}
                >
                  +{hiddenCount} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className={`${semanticSpacing.stack.xs}`}>
                  {activeFilterBadges.slice(maxDisplayedFilters).map((badge, index) => (
                    <div key={index} className={`${semanticTypography.caption}`}>
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
            className={cn(semanticSpacing.compactX, semanticTypography.caption, 'h-6')}
          >
            <RotateCcw className="mr-1 size-3" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}
