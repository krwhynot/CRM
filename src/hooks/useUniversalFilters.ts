import { useState, useCallback, useMemo } from 'react'
import { useDebounce } from '@/lib/performance-optimizations'
import {
  calculateDateRange,
  getDateRangeDescription,
  getMemoizedDateRange,
} from '@/lib/date-range-utils'
import { applyQuickViewPreset, getQuickViewPreset, isPresetActive } from '@/lib/quick-view-presets'
import type {
  UniversalFilterState,
  UseUniversalFiltersReturn,
  FilterChangeEvent,
  FilterValidationResult,
  ComputedFilterProperties,
  TimeRangeType,
  FocusType,
  QuickViewType,
} from '@/types/filters.types'
import { DEFAULT_UNIVERSAL_FILTERS } from '@/types/filters.types'

export const useUniversalFilters = (
  initialFilters: Partial<UniversalFilterState> = {}
): UseUniversalFiltersReturn => {
  // Merge provided initial filters with defaults
  const defaultFilters: UniversalFilterState = {
    ...DEFAULT_UNIVERSAL_FILTERS,
    ...initialFilters,
  }

  const [filters, setFilters] = useState<UniversalFilterState>(defaultFilters)
  const [isLoading, setIsLoading] = useState(false)

  // Debounced filters to prevent excessive recalculations
  const debouncedFilters = useDebounce(filters, 300)

  // Validate filters
  const validateFilters = useCallback(
    (filtersToValidate: UniversalFilterState): FilterValidationResult => {
      const errors: FilterValidationResult['errors'] = []

      // Validate custom date range
      if (filtersToValidate.timeRange === 'custom') {
        if (!filtersToValidate.dateFrom || !filtersToValidate.dateTo) {
          errors.push({
            field: 'timeRange',
            message: 'Custom date range requires both start and end dates',
          })
        } else if (filtersToValidate.dateFrom > filtersToValidate.dateTo) {
          errors.push({
            field: 'timeRange',
            message: 'Start date must be before end date',
          })
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      }
    },
    []
  )

  // Handle filter changes with validation and loading state
  const handleFiltersChange = useCallback(
    (newFilters: UniversalFilterState) => {
      const validation = validateFilters(newFilters)

      if (!validation.isValid) {
        console.warn('Filter validation failed:', validation.errors)
        return
      }

      setIsLoading(true)
      setFilters(newFilters)

      // Simulate processing delay for smooth UX
      setTimeout(() => {
        setIsLoading(false)
      }, 200)
    },
    [validateFilters]
  )

  // Enhanced individual update functions
  const updateFilter = useCallback(
    <K extends keyof UniversalFilterState>(field: K, value: UniversalFilterState[K]) => {
      const newFilters = { ...filters, [field]: value }

      // Clear custom date fields if switching away from custom time range
      if (field === 'timeRange' && value !== 'custom') {
        newFilters.dateFrom = undefined
        newFilters.dateTo = undefined
      }

      handleFiltersChange(newFilters)
    },
    [filters, handleFiltersChange]
  )

  const updateTimeRange = useCallback(
    (range: TimeRangeType, customDates?: { start: Date; end: Date }) => {
      const newFilters: UniversalFilterState = {
        ...filters,
        timeRange: range,
        dateFrom: range === 'custom' ? customDates?.start : undefined,
        dateTo: range === 'custom' ? customDates?.end : undefined,
      }

      handleFiltersChange(newFilters)
    },
    [filters, handleFiltersChange]
  )

  const updateFocus = useCallback(
    (focus: FocusType) => {
      updateFilter('focus', focus)
    },
    [updateFilter]
  )

  const updateQuickView = useCallback(
    (preset: QuickViewType | 'none') => {
      updateFilter('quickView', preset)
    },
    [updateFilter]
  )

  // Quick view preset functions
  const applyQuickView = useCallback(
    (preset: QuickViewType) => {
      const newFilters = applyQuickViewPreset(preset, filters)
      handleFiltersChange(newFilters)
    },
    [filters, handleFiltersChange]
  )

  const clearQuickView = useCallback(() => {
    updateFilter('quickView', 'none')
  }, [updateFilter])

  // Reset functions
  const resetFilters = useCallback(() => {
    handleFiltersChange(defaultFilters)
  }, [defaultFilters, handleFiltersChange])

  const resetUniversalFilters = useCallback(() => {
    const resetFilters: UniversalFilterState = {
      ...filters,
      timeRange: DEFAULT_UNIVERSAL_FILTERS.timeRange,
      focus: DEFAULT_UNIVERSAL_FILTERS.focus,
      quickView: DEFAULT_UNIVERSAL_FILTERS.quickView,
      dateFrom: undefined,
      dateTo: undefined,
    }
    handleFiltersChange(resetFilters)
  }, [filters, handleFiltersChange])

  const resetDashboardFilters = useCallback(() => {
    const resetFilters: UniversalFilterState = {
      ...filters,
      principal: DEFAULT_UNIVERSAL_FILTERS.principal,
      product: DEFAULT_UNIVERSAL_FILTERS.product,
      weeks: DEFAULT_UNIVERSAL_FILTERS.weeks,
    }
    handleFiltersChange(resetFilters)
  }, [filters, handleFiltersChange])

  // Computed properties for enhanced UX
  const computed = useMemo((): ComputedFilterProperties => {
    const effectiveTimeRange = getMemoizedDateRange(
      filters.timeRange,
      filters.dateFrom && filters.dateTo
        ? { start: filters.dateFrom, end: filters.dateTo }
        : undefined
    )

    const isMyTasksView = filters.focus === 'my_tasks'

    const activeFilterCount = [
      filters.principal !== DEFAULT_UNIVERSAL_FILTERS.principal,
      filters.product !== DEFAULT_UNIVERSAL_FILTERS.product,
      filters.weeks !== DEFAULT_UNIVERSAL_FILTERS.weeks,
      filters.timeRange !== DEFAULT_UNIVERSAL_FILTERS.timeRange,
      filters.focus !== DEFAULT_UNIVERSAL_FILTERS.focus,
      filters.quickView !== DEFAULT_UNIVERSAL_FILTERS.quickView,
    ].filter(Boolean).length

    const hasActiveFilters = activeFilterCount > 0

    // Create filter summary
    const summaryParts: string[] = []

    if (filters.timeRange !== DEFAULT_UNIVERSAL_FILTERS.timeRange) {
      summaryParts.push(
        getDateRangeDescription(
          filters.timeRange,
          filters.dateFrom && filters.dateTo
            ? { start: filters.dateFrom, end: filters.dateTo }
            : undefined
        )
      )
    }

    if (filters.focus !== DEFAULT_UNIVERSAL_FILTERS.focus) {
      summaryParts.push(filters.focus.replace('_', ' '))
    }

    if (filters.quickView !== DEFAULT_UNIVERSAL_FILTERS.quickView) {
      const preset = getQuickViewPreset(filters.quickView as QuickViewType)
      if (preset) {
        summaryParts.push(preset.name)
      }
    }

    const filterSummary = summaryParts.length > 0 ? summaryParts.join(' • ') : 'All data'

    const dateRangeText = getDateRangeDescription(
      filters.timeRange,
      filters.dateFrom && filters.dateTo
        ? { start: filters.dateFrom, end: filters.dateTo }
        : undefined
    )

    return {
      isMyTasksView,
      hasActiveFilters,
      activeFilterCount,
      filterSummary,
      dateRangeText,
      effectiveTimeRange,
    }
  }, [filters])

  return {
    filters,
    debouncedFilters,
    isLoading,

    // Basic filter functions
    handleFiltersChange,
    resetFilters,
    resetUniversalFilters,
    resetDashboardFilters,

    // Enhanced individual update functions
    updateFilter,
    updateTimeRange,
    updateFocus,
    updateQuickView,

    // Quick view presets
    applyQuickView,
    clearQuickView,

    // Computed properties
    computed,
  }
}

// Helper hook for filter change events (kept for backward compatibility)
export const useFilterChangeHandler = (
  filters: UniversalFilterState,
  onFiltersChange: (filters: UniversalFilterState) => void
) => {
  return useCallback(
    <K extends keyof UniversalFilterState>(field: K, value: UniversalFilterState[K]) => {
      const previousValue = filters[field]
      const newFilters = { ...filters, [field]: value }

      // Clear custom date fields if switching away from custom time range
      if (field === 'timeRange' && value !== 'custom') {
        newFilters.dateFrom = undefined
        newFilters.dateTo = undefined
      }

      const changeEvent: FilterChangeEvent = {
        filters: newFilters,
        changedField: field,
        previousValue,
        newValue: value,
      }

      onFiltersChange(newFilters)
    },
    [filters, onFiltersChange]
  )
}

// Helper hook for getting active filter count (kept for backward compatibility)
export const useActiveFilterCount = (filters: UniversalFilterState) => {
  return useMemo(() => {
    let count = 0

    // Count dashboard filters
    if (filters.principal !== DEFAULT_UNIVERSAL_FILTERS.principal) count++
    if (filters.product !== DEFAULT_UNIVERSAL_FILTERS.product) count++
    if (filters.weeks !== DEFAULT_UNIVERSAL_FILTERS.weeks) count++

    // Count universal filters
    if (filters.timeRange !== DEFAULT_UNIVERSAL_FILTERS.timeRange) count++
    if (filters.focus !== DEFAULT_UNIVERSAL_FILTERS.focus) count++
    if (filters.quickView !== DEFAULT_UNIVERSAL_FILTERS.quickView) count++

    return count
  }, [filters])
}
