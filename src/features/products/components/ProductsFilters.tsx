import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductFilterType } from '@/features/products/hooks/useProductsFiltering'

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
  filteredCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Header with Add New button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-card-foreground">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredCount === totalProducts
              ? `${totalProducts} products`
              : `${filteredCount} of ${totalProducts} products`}
          </p>
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search products by name, SKU, category, brand, or principal..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full py-2 pl-10 pr-4"
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
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {pill.label}
            <span
              className={cn(
                'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
                activeFilter === pill.key
                  ? 'bg-primary/80 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
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
