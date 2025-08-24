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
    <div className="flex items-center gap-2 min-w-0">
      <Package className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select
        value={localFilters.product}
        onValueChange={(value) => onFilterChange('product', value)}
        disabled={isLoading || localFilters.principal === 'all'}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select Product" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Products</SelectItem>
          {filteredProducts.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.name}
              {product.category && (
                <span className="text-xs text-muted-foreground ml-1">
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