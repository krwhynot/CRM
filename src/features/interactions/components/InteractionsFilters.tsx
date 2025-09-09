import React from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import {
  GenericWeeksFilter,
  GenericPrincipalFilter,
  GenericQuickViewFilter,
  createQuickViewOptions,
} from '@/components/filters/shared'
import type {
  WeeklyFilterComponentProps,
  InteractionWeeklyFilters,
} from '@/types/shared-filters.types'
import type { InteractionFilters } from '@/types/interaction.types'

interface InteractionsFiltersProps extends WeeklyFilterComponentProps<InteractionFilters> {
  totalInteractions: number
  filteredCount: number
  showBadges?: boolean
}

export const InteractionsFilters: React.FC<InteractionsFiltersProps> = ({
  filters,
  onFiltersChange,
  principals = [],
  isLoading = false,
  totalInteractions,
  filteredCount,
  showBadges = false,
  className = '',
}) => {
  // ✨ Defensive programming: handle undefined filters
  if (!filters) {
    console.warn('InteractionsFilters: filters prop is undefined, returning null')
    return null
  }
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleTimeRangeChange = (timeRange: string) => {
    onFiltersChange({
      ...filters,
      timeRange: timeRange as InteractionWeeklyFilters['timeRange'],
    })
  }

  const handlePrincipalChange = (principal: string) => {
    onFiltersChange({
      ...filters,
      principal: principal,
    })
  }

  const handleQuickViewChange = (quickView: string | 'none') => {
    onFiltersChange({
      ...filters,
      quickView: quickView as InteractionWeeklyFilters['quickView'],
    })
  }

  const quickViewOptions = createQuickViewOptions('interactions')

  // Calculate active filter count with safe property access
  const activeFilterCount = [
    filters?.timeRange && filters.timeRange !== 'this_month',
    filters?.principal && filters.principal !== 'all',
    filters?.quickView && filters.quickView !== 'none',
    filters?.search,
    filters?.type,
    filters?.organization_id,
    filters?.contact_id,
    filters?.opportunity_id,
    filters?.follow_up_required,
  ].filter(Boolean).length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Filters Row */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {/* Weekly Time Range */}
        <GenericWeeksFilter
          value={filters.timeRange || 'this_month'}
          options={[
            { value: 'this_week', label: 'This Week' },
            { value: 'last_week', label: 'Last Week' },
            { value: 'last_2_weeks', label: 'Last 2 Weeks' },
            { value: 'last_4_weeks', label: 'Last 4 Weeks' },
            { value: 'this_month', label: 'This Month' },
            { value: 'last_month', label: 'Last Month' },
            { value: 'this_quarter', label: 'This Quarter' },
            { value: 'last_quarter', label: 'Last Quarter' },
            { value: 'custom', label: 'Custom Range' },
          ]}
          isLoading={isLoading}
          onChange={handleTimeRangeChange}
          className="w-full sm:w-auto"
        />

        {/* Principal Filter */}
        <GenericPrincipalFilter
          value={filters.principal || 'all'}
          principals={principals}
          isLoading={isLoading}
          onChange={handlePrincipalChange}
          className="w-full sm:w-auto"
        />

        {/* Quick View Filter */}
        <GenericQuickViewFilter
          value={filters.quickView || 'none'}
          options={quickViewOptions}
          isLoading={isLoading}
          showBadges={showBadges}
          onChange={handleQuickViewChange}
          className="w-full sm:w-auto"
        />

        {/* Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search interactions, contacts, organizations..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="min-w-0 max-w-80 flex-1"
          />
        </div>
      </div>

      {/* Filter Summary */}
      {(activeFilterCount > 0 || filters.search) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <span>
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredCount} interactions</Badge>
            {filteredCount !== totalInteractions && (
              <Badge variant="outline">of {totalInteractions} total</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
