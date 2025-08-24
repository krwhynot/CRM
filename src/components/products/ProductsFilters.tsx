import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductFilterType } from '@/hooks/useProductsFiltering'

interface FilterPill {
  key: ProductFilterType
  label: string
  count: number
}

interface ProductsFiltersProps {
  activeFilter: ProductFilterType
  onFilterChange: (filter: ProductFilterType) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  filterPills: FilterPill[]
  onAddNew?: () => void
  totalProducts: number
  filteredCount: number
}

export const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  filterPills,
  onAddNew,
  totalProducts,
  filteredCount
}) => {
  return (
    <div className="space-y-4">
      {/* Header with Add New button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredCount === totalProducts 
              ? `${totalProducts} products` 
              : `${filteredCount} of ${totalProducts} products`
            }
          </p>
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search products by name, SKU, category, brand, or principal..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filterPills.map((pill) => (
          <Button
            key={pill.key}
            variant={activeFilter === pill.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(pill.key)}
            className={cn(
              'flex items-center gap-1 transition-colors',
              activeFilter === pill.key
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {pill.label}
            <span 
              className={cn(
                'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
                activeFilter === pill.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              )}
            >
              {pill.count}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}