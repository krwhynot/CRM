import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package } from "lucide-react"
import { Product, FilterState } from "@/types/dashboard"

interface ProductFilterProps {
  localFilters: FilterState
  filteredProducts: Product[]
  isLoading: boolean
  onFilterChange: (key: keyof FilterState, value: string) => void
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  localFilters,
  filteredProducts,
  isLoading,
  onFilterChange
}) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Package className="size-4 shrink-0 text-muted-foreground" />
      <Select
        value={localFilters.product}
        onValueChange={(value) => onFilterChange('product', value)}
        disabled={isLoading || localFilters.principal === 'all'}
      >
        <SelectTrigger className="w-full sm:w-filter-md">
          <SelectValue placeholder="Select Product" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Products</SelectItem>
          {filteredProducts.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.name}
              {product.category && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({product.category})
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}