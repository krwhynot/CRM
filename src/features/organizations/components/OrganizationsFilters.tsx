import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { COPY } from '@/lib/copy'
import { cn } from '@/lib/utils'
import {
  GenericWeeksFilter,
  GenericPrincipalFilter,
  GenericQuickViewFilter,
  createQuickViewOptions,
} from '@/components/filters/shared'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import type {
  WeeklyFilterComponentProps,
  OrganizationWeeklyFilters,
} from '@/types/shared-filters.types'

interface OrganizationsFiltersProps extends WeeklyFilterComponentProps<OrganizationWeeklyFilters> {
  totalOrganizations: number
  filteredCount: number
  showBadges?: boolean
  onAddNew?: () => void
}

export const OrganizationsFilters: React.FC<OrganizationsFiltersProps> = ({
  filters,
  onFiltersChange,
  principals = [],
  isLoading = false,
  totalOrganizations,
  filteredCount,
  showBadges = false,
  onAddNew,
  className = '',
}) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleTimeRangeChange = (timeRange: string) => {
    onFiltersChange({
      ...filters,
      timeRange: timeRange as OrganizationWeeklyFilters['timeRange'],
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
      quickView: quickView as OrganizationWeeklyFilters['quickView'],
    })
  }

  const quickViewOptions = createQuickViewOptions('organizations')

  // Calculate active filter count
  const activeFilterCount = [
    filters.timeRange && filters.timeRange !== 'this_month',
    filters.principal && filters.principal !== 'all',
    filters.quickView && filters.quickView !== 'none',
    filters.search,
    filters.type,
    filters.priority,
    filters.segment,
  ].filter(Boolean).length

  return (
    <div className={`${semanticSpacing.layoutContainer} ${className}`}>
      {/* Header with Add New button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn(semanticTypography.h2, semanticTypography.h4, 'text-card-foreground')}>
            Organizations
          </h2>
          <p className="${semanticSpacing.topGap.xs} ${semanticTypography.body} text-muted-foreground">
            {filteredCount === totalOrganizations
              ? `${totalOrganizations} organizations`
              : `${filteredCount} of ${totalOrganizations} organizations`}
          </p>
        </div>
        {onAddNew && (
          <Button
            onClick={onAddNew}
            className="focus-ring mobile-touch-target flex items-center ${semanticSpacing.gap.xs}"
          >
            <Plus className="size-4" />
            {COPY.BUTTONS.ADD_ORGANIZATION}
          </Button>
        )}
      </div>

      {/* Primary Filters Row */}
      <div className="flex flex-col items-start ${semanticSpacing.gap.lg} sm:flex-row sm:items-center">
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
        <div className="flex min-w-0 flex-1 items-center ${semanticSpacing.gap.xs}">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search organizations by name, location, manager, phone, or segment..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="mobile-search-input min-w-0 flex-1"
          />
        </div>
      </div>

      {/* Filter Summary */}
      {(activeFilterCount > 0 || filters.search) && (
        <div className="flex items-center justify-between ${semanticTypography.body} text-muted-foreground">
          <div className="flex items-center ${semanticSpacing.gap.xs}">
            {activeFilterCount > 0 && (
              <span>
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
            )}
          </div>
          <span>
            {filteredCount} of {totalOrganizations} organizations
          </span>
        </div>
      )}
    </div>
  )
}
