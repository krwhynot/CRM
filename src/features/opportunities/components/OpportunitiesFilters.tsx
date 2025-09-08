import React from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { 
  GenericWeeksFilter,
  GenericPrincipalFilter, 
  GenericQuickViewFilter,
  createQuickViewOptions
} from '@/components/filters/shared'
import type { WeeklyFilterComponentProps, OpportunityWeeklyFilters } from '@/types/shared-filters.types'
import type { OpportunityFilters } from '@/types/opportunity.types'

interface OpportunitiesFiltersProps extends WeeklyFilterComponentProps<OpportunityFilters> {
  totalOpportunities: number
  filteredCount: number
  showBadges?: boolean
}

export const OpportunitiesFilters: React.FC<OpportunitiesFiltersProps> = ({
  filters,
  onFiltersChange,
  principals = [],
  isLoading = false,
  totalOpportunities,
  filteredCount,
  showBadges = false,
  className = '',
}) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleTimeRangeChange = (timeRange: string) => {
    onFiltersChange({ 
      ...filters, 
      timeRange: timeRange as OpportunityWeeklyFilters['timeRange']
    })
  }

  const handlePrincipalChange = (principal: string) => {
    onFiltersChange({ 
      ...filters, 
      principal_organization_id: principal === 'all' ? undefined : principal,
      principal: principal
    })
  }

  const handleQuickViewChange = (quickView: string | 'none') => {
    onFiltersChange({ 
      ...filters, 
      quickView: quickView as OpportunityWeeklyFilters['quickView']
    })
  }

  const quickViewOptions = createQuickViewOptions('opportunities')

  // Calculate active filter count
  const activeFilterCount = [
    filters.timeRange && filters.timeRange !== 'this_month',
    filters.principal && filters.principal !== 'all',
    filters.quickView && filters.quickView !== 'none',
    filters.search,
    filters.stage,
    filters.organization_id,
    filters.contact_id
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
            placeholder="Search opportunities..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="min-w-0 max-w-64 flex-1"
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
          <span>
            {filteredCount} of {totalOpportunities} opportunities
          </span>
        </div>
      )}
    </div>
  )
}
