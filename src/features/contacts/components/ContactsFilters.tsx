import React from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { 
  GenericWeeksFilter,
  GenericPrincipalFilter, 
  GenericQuickViewFilter,
  createQuickViewOptions
} from '@/components/filters/shared'
import type { WeeklyFilterComponentProps, ContactWeeklyFilters } from '@/types/shared-filters.types'

interface ContactsFiltersProps extends WeeklyFilterComponentProps<ContactWeeklyFilters> {
  totalContacts: number
  filteredCount: number
  showBadges?: boolean
}

export const ContactsFilters: React.FC<ContactsFiltersProps> = ({
  filters,
  onFiltersChange,
  principals = [],
  isLoading = false,
  totalContacts,
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
      timeRange: timeRange as ContactWeeklyFilters['timeRange']
    })
  }

  const handlePrincipalChange = (principal: string) => {
    onFiltersChange({ 
      ...filters, 
      principal: principal
    })
  }

  const handleQuickViewChange = (quickView: string | 'none') => {
    onFiltersChange({ 
      ...filters, 
      quickView: quickView as ContactWeeklyFilters['quickView']
    })
  }

  const quickViewOptions = createQuickViewOptions('contacts')

  // Calculate active filter count
  const activeFilterCount = [
    filters.timeRange && filters.timeRange !== 'this_month',
    filters.principal && filters.principal !== 'all',
    filters.quickView && filters.quickView !== 'none',
    filters.search,
    filters.organization_id,
    filters.purchase_influence,
    filters.decision_authority
  ].filter(Boolean).length

  return (
    <div className={`space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-card-foreground">Contacts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {filteredCount === totalContacts
            ? `${totalContacts} contacts`
            : `${filteredCount} of ${totalContacts} contacts`}
        </p>
      </div>

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
            placeholder="Search contacts..."
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
          <span>
            {filteredCount} of {totalContacts} contacts
          </span>
        </div>
      )}
    </div>
  )
}
