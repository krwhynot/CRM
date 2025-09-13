import { useMemo } from 'react'
import { useProducts } from './useProducts'
import type { Product } from '@/types/entities'
import type { ProductWithPrincipal } from '@/types/product-extensions'

// Extended product interface with weekly context
interface ProductWithWeeklyContext extends ProductWithPrincipal {
  promotion_start_date?: string | Date
  promotion_end_date?: string | Date
  is_promoted_this_week?: boolean
  opportunity_count?: number
  recent_opportunity_count?: number
  weekly_sales_velocity?: number
  was_promoted_recently?: boolean
}

interface UseProductTableDataConfig {
  filters?: any
}

export function useProductTableData({ filters }: UseProductTableDataConfig) {
  const { data: products = [], isLoading } = useProducts()

  // Enhanced products with context
  const productsWithContext: ProductWithWeeklyContext[] = useMemo(() => {
    return products.map((product) => ({
      ...product,
      // Add any additional context calculations here
    }))
  }, [products])

  // Filter and sort products
  const sortedProducts = useMemo(() => {
    let filtered = [...productsWithContext]

    // Apply filters if provided
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm) ||
          product.sku?.toLowerCase().includes(searchTerm) ||
          product.category?.toLowerCase().includes(searchTerm)
      )
    }

    // Sort by name by default
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    return filtered
  }, [productsWithContext, filters])

  // Row expansion state
  const expandedRows = new Set<string>()
  const toggleRowExpansion = (id: string) => {
    if (expandedRows.has(id)) {
      expandedRows.delete(id)
    } else {
      expandedRows.add(id)
    }
  }
  const isRowExpanded = (id: string) => expandedRows.has(id)

  // Empty state messages
  const hasFilters = filters?.search || filters?.quickView !== 'none'
  const emptyMessage = hasFilters ? 'No products match your criteria' : 'No products found'
  const emptySubtext = hasFilters
    ? 'Try adjusting your filters'
    : 'Get started by adding your first product'

  return {
    products: productsWithContext,
    sortedProducts,
    isLoading,
    toggleRowExpansion,
    isRowExpanded,
    emptyMessage,
    emptySubtext,
  }
}
