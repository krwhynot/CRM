import { useState, useMemo } from 'react'
import type { ProductWithPrincipal } from '@/types/entities'

export type ProductFilterType = 'all' | 'high-value' | 'dairy' | 'fresh-products' | 'recently-added'

interface FilterPill {
  key: ProductFilterType
  label: string
  count: number
}

interface UseProductsFilteringReturn {
  activeFilter: ProductFilterType
  setActiveFilter: (filter: ProductFilterType) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredProducts: ProductWithPrincipal[]
  filterPills: FilterPill[]
}

export const useProductsFiltering = (
  products: ProductWithPrincipal[]
): UseProductsFilteringReturn => {
  const [activeFilter, setActiveFilter] = useState<ProductFilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Base filter pills configuration
  const baseFilterPills: Omit<FilterPill, 'count'>[] = [
    { key: 'all', label: 'All' },
    { key: 'high-value', label: 'High Value' },
    { key: 'dairy', label: 'Dairy Products' },
    { key: 'fresh-products', label: 'Fresh Products' },
    { key: 'recently-added', label: 'Recently Added' }
  ]

  // Filtered and searched products
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Apply filter
    switch (activeFilter) {
      case 'high-value':
        filtered = filtered.filter(product => (product.list_price || 0) > 20)
        break
      case 'dairy':
        filtered = filtered.filter(product => product.category === 'dairy')
        break
      case 'fresh-products':
        filtered = filtered.filter(product => (product.shelf_life_days || 0) <= 7)
        break
      case 'recently-added':
        // Filter products added within the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        filtered = filtered.filter(product => {
          if (!product.created_at) return false
          const createdDate = new Date(product.created_at)
          return createdDate > sevenDaysAgo
        })
        break
      case 'all':
      default:
        // No filtering needed for 'all'
        break
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.principal?.name?.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [products, activeFilter, searchTerm])

  // Update filter pills with counts
  const filterPills = useMemo(() => {
    return baseFilterPills.map(pill => ({
      ...pill,
      count: getFilterCount(pill.key, products)
    }))
  }, [products])

  return {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    filterPills
  }
}

// Helper function to calculate filter counts
function getFilterCount(filterKey: ProductFilterType, products: ProductWithPrincipal[]): number {
  switch (filterKey) {
    case 'all':
      return products.length
    case 'high-value':
      return products.filter(product => (product.list_price || 0) > 20).length
    case 'dairy':
      return products.filter(product => product.category === 'dairy').length
    case 'fresh-products':
      return products.filter(product => (product.shelf_life_days || 0) <= 7).length
    case 'recently-added':
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return products.filter(product => {
        if (!product.created_at) return false
        const createdDate = new Date(product.created_at)
        return createdDate > sevenDaysAgo
      }).length
    default:
      return 0
  }
}
