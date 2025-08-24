import { useMemo } from 'react'
import { FilterState, Product } from '@/types/dashboard'

export const useDashboardFiltersData = (
  products: Product[],
  localFilters: FilterState
) => {
  const weekOptions = [
    { value: 'Last Week', label: 'Last Week' },
    { value: 'Last 4 Weeks', label: 'Last 4 Weeks' },
    { value: 'Last 12 Weeks', label: 'Last 12 Weeks' }
  ]

  // Filter products based on selected principal
  const filteredProducts = useMemo(() => {
    return localFilters.principal === 'all' 
      ? products 
      : products.filter(p => p.principalId === localFilters.principal)
  }, [products, localFilters.principal])

  return {
    weekOptions,
    filteredProducts
  }
}