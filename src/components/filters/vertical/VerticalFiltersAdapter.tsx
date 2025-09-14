import { Calendar, Target, Users, Package, Eye } from 'lucide-react'
import { TimeRangeFilter } from '../TimeRangeFilter'
import { FocusFilter } from '../FocusFilter'
import { QuickViewFilter } from '../QuickViewFilter'
import { PrincipalSelector } from '../PrincipalSelector'
import { ManagerSelector } from '../ManagerSelector'
import { VerticalFilterSection } from './VerticalFilterSection'
import { useFilterChangeHandler } from '@/hooks/useUniversalFilters'
import { cn } from '@/lib/utils'
import { semanticSpacing } from '@/styles/tokens'
import type { FilterSection } from '../FilterSidebar.types'

interface VerticalFiltersAdapterProps {
  filters: any
  onFiltersChange: (filters: any) => void
  showTimeRange?: boolean
  showFocus?: boolean
  showQuickView?: boolean
  showPrincipalSelector?: boolean
  showManagerSelector?: boolean
  principals?: any[]
  managers?: any[]
  isLoading?: boolean
}

export function VerticalFiltersAdapter({
  filters,
  onFiltersChange,
  showTimeRange = true,
  showFocus = true,
  showQuickView = true,
  showPrincipalSelector = false,
  showManagerSelector = false,
  principals = [],
  managers = [],
  isLoading = false,
}: VerticalFiltersAdapterProps) {
  const handleFieldChange = useFilterChangeHandler(filters, onFiltersChange)

  return (
    <div className={cn(semanticSpacing.stack.md)}>
      {/* Time Range */}
      {showTimeRange && (
        <VerticalFilterSection title="Time Range">
          <TimeRangeFilter
            value={filters.timeRange}
            onChange={(value) => handleFieldChange('timeRange', value)}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onDateFromChange={(date) => handleFieldChange('dateFrom', date)}
            onDateToChange={(date) => handleFieldChange('dateTo', date)}
            isLoading={isLoading}
            compact={true}
            showLabel={false}
          />
        </VerticalFilterSection>
      )}

      {/* Focus Filter */}
      {showFocus && (
        <VerticalFilterSection title="Focus">
          <FocusFilter
            value={filters.focus}
            onChange={(value) => handleFieldChange('focus', value)}
            isLoading={isLoading}
            compact={true}
          />
        </VerticalFilterSection>
      )}

      {/* Quick View */}
      {showQuickView && (
        <VerticalFilterSection title="Quick View">
          <QuickViewFilter
            value={filters.quickView}
            onChange={(value) => handleFieldChange('quickView', value)}
            isLoading={isLoading}
            compact={true}
          />
        </VerticalFilterSection>
      )}

      {/* Principal Selector */}
      {showPrincipalSelector && principals.length > 0 && (
        <VerticalFilterSection title="Principal">
          <PrincipalSelector
            value={
              Array.isArray(filters.principal)
                ? filters.principal[0] || 'all'
                : filters.principal || 'all'
            }
            onChange={(value) => handleFieldChange('principal', value)}
            principals={principals}
            isLoading={isLoading}
            compact={true}
          />
        </VerticalFilterSection>
      )}

      {/* Manager Selector */}
      {showManagerSelector && managers.length > 0 && (
        <VerticalFilterSection title="Manager">
          <ManagerSelector
            value={filters.focus === 'my_tasks' ? 'my_activity' : 'all'}
            onChange={(value) => {
              if (value === 'my_activity') {
                handleFieldChange('focus', 'my_tasks')
              } else {
                handleFieldChange('focus', 'all_activity')
              }
            }}
            managers={managers}
            isLoading={isLoading}
            compact={true}
          />
        </VerticalFilterSection>
      )}
    </div>
  )
}

// Helper function to create filter sections from existing filters
export function createFilterSections({
  filters,
  onFiltersChange,
  showTimeRange = true,
  showFocus = true,
  showQuickView = true,
  showPrincipalSelector = false,
  showManagerSelector = false,
  principals = [],
  managers = [],
  isLoading = false,
}: VerticalFiltersAdapterProps): FilterSection[] {
  const handleFieldChange = useFilterChangeHandler(filters, onFiltersChange)
  const sections: FilterSection[] = []

  if (showTimeRange) {
    sections.push({
      id: 'time-range',
      title: 'Time Range',
      icon: <Calendar className="size-4" />,
      badge: filters.timeRange !== 'this_month' ? 1 : undefined,
      defaultExpanded: true,
      content: (
        <TimeRangeFilter
          value={filters.timeRange}
          onChange={(value) => handleFieldChange('timeRange', value)}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(date) => handleFieldChange('dateFrom', date)}
          onDateToChange={(date) => handleFieldChange('dateTo', date)}
          isLoading={isLoading}
          compact={true}
          showLabel={false}
        />
      ),
    })
  }

  if (showFocus) {
    sections.push({
      id: 'focus',
      title: 'Focus',
      icon: <Target className="size-4" />,
      badge: filters.focus !== 'all_activity' ? 1 : undefined,
      defaultExpanded: true,
      content: (
        <FocusFilter
          value={filters.focus}
          onChange={(value) => handleFieldChange('focus', value)}
          isLoading={isLoading}
          compact={true}
        />
      ),
    })
  }

  if (showQuickView) {
    sections.push({
      id: 'quick-view',
      title: 'Quick View',
      icon: <Eye className="size-4" />,
      badge: filters.quickView !== 'none' ? 1 : undefined,
      content: (
        <QuickViewFilter
          value={filters.quickView}
          onChange={(value) => handleFieldChange('quickView', value)}
          isLoading={isLoading}
          compact={true}
        />
      ),
    })
  }

  if (showPrincipalSelector && principals.length > 0) {
    sections.push({
      id: 'principal',
      title: 'Principal',
      icon: <Package className="size-4" />,
      badge: filters.principal && filters.principal !== 'all' ? 1 : undefined,
      content: (
        <PrincipalSelector
          value={
            Array.isArray(filters.principal)
              ? filters.principal[0] || 'all'
              : filters.principal || 'all'
          }
          onChange={(value) => handleFieldChange('principal', value)}
          principals={principals}
          isLoading={isLoading}
          compact={true}
        />
      ),
    })
  }

  if (showManagerSelector && managers.length > 0) {
    sections.push({
      id: 'manager',
      title: 'Manager',
      icon: <Users className="size-4" />,
      badge: filters.focus === 'my_tasks' ? 1 : undefined,
      content: (
        <ManagerSelector
          value={filters.focus === 'my_tasks' ? 'my_activity' : 'all'}
          onChange={(value) => {
            if (value === 'my_activity') {
              handleFieldChange('focus', 'my_tasks')
            } else {
              handleFieldChange('focus', 'all_activity')
            }
          }}
          managers={managers}
          isLoading={isLoading}
          compact={true}
        />
      ),
    })
  }

  return sections
}
