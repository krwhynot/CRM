import { useState, useCallback } from 'react'
import { useDebounce } from '@/lib/performance-optimizations'
import { FilterState, UseDashboardFiltersReturn } from '@/types/dashboard'

export const useDashboardFilters = (
  initialFilters: FilterState = {
    principal: 'all',
    product: 'all',
    weeks: 'Last 4 Weeks'
  }
): UseDashboardFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isLoading, setIsLoading] = useState(false)
  
  // Debounced filters to prevent excessive recalculations
  const debouncedFilters = useDebounce(filters, 300)
  
  // Handle filter changes with loading state simulation
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setIsLoading(true)
    setFilters(newFilters)
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }, [])
  
  return {
    filters,
    debouncedFilters,
    isLoading,
    handleFiltersChange
  }
}