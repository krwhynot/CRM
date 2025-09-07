import { useState } from 'react'
import { UniversalFilters } from './UniversalFilters'
import { useUniversalFilters, DEFAULT_UNIVERSAL_FILTERS } from '@/hooks/useUniversalFilters'
import type { UniversalFilterState } from '@/types/filters.types'

export function UniversalFiltersExample() {
  const {
    filters,
    debouncedFilters,
    isLoading,
    handleFiltersChange,
    resetFilters
  } = useUniversalFilters({
    ...DEFAULT_UNIVERSAL_FILTERS,
    timeRange: 'this_week',
    focus: 'my_tasks'
  })

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Universal Filters Example</h2>
      
      <UniversalFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        showTimeRange={true}
        showFocus={true}
        showQuickView={true}
        compact={false}
      />

      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
        <h3 className="text-sm font-medium mb-2">Current Filters (Real-time):</h3>
        <pre className="text-xs">{JSON.stringify(filters, null, 2)}</pre>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <h3 className="text-sm font-medium mb-2">Debounced Filters (For API calls):</h3>
        <pre className="text-xs">{JSON.stringify(debouncedFilters, null, 2)}</pre>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={resetFilters}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Reset All Filters
        </button>
        <button
          onClick={() => handleFiltersChange({
            ...filters,
            timeRange: 'last_month',
            focus: 'high_priority',
            quickView: 'action_items_due'
          })}
          className="px-3 py-1 text-sm bg-blue-200 dark:bg-blue-700 rounded hover:bg-blue-300 dark:hover:bg-blue-600"
        >
          Set Example Filters
        </button>
      </div>
    </div>
  )
}