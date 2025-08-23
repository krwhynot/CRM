import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, Calendar, Building2, Package } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { useEffect, useState } from "react"
import { FilterState, Principal, Product } from "@/types/dashboard"

interface DashboardFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  principals: Principal[]
  products: Product[]
  isLoading?: boolean
}

export function DashboardFilters({ 
  filters, 
  onFiltersChange, 
  principals = [], 
  products = [], 
  isLoading = false 
}: DashboardFiltersProps) {
  // Local state for immediate UI updates
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)
  
  // Debounce the filter changes by 300ms
  const debouncedFilters = useDebounce(localFilters, 300)
  
  // Update parent when debounced filters change
  useEffect(() => {
    onFiltersChange(debouncedFilters)
  }, [debouncedFilters, onFiltersChange])

  // Update local state when external filters change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Feature flag for new MFB compact styling
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false'

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    // Reset product when principal changes
    if (key === 'principal' && value !== localFilters.principal) {
      setLocalFilters({
        ...localFilters,
        [key]: value,
        product: 'all'
      })
    } else {
      setLocalFilters({
        ...localFilters,
        [key]: value
      })
    }
  }

  const resetFilters = () => {
    const resetState: FilterState = {
      principal: 'all',
      product: 'all',
      weeks: 'Last 4 Weeks'
    }
    setLocalFilters(resetState)
    onFiltersChange(resetState)
  }

  const weekOptions = [
    { value: 'Last Week', label: 'Last Week' },
    { value: 'Last 4 Weeks', label: 'Last 4 Weeks' },
    { value: 'Last 12 Weeks', label: 'Last 12 Weeks' }
  ]

  // Filter products based on selected principal
  const filteredProducts = localFilters.principal === 'all' 
    ? products 
    : products.filter(p => p.principalId === localFilters.principal)

  return (
    <Card className={`${USE_NEW_STYLE ? "shadow-sm border-primary/10" : "shadow-md"}`}>
      <CardContent className={`${USE_NEW_STYLE ? "p-4" : "p-6"}`}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Principal Filter */}
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select
                value={localFilters.principal}
                onValueChange={(value) => handleFilterChange('principal', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Principal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Principals</SelectItem>
                  {principals.map((principal) => (
                    <SelectItem key={principal.id} value={principal.id}>
                      {principal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Filter */}
            <div className="flex items-center gap-2 min-w-0">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select
                value={localFilters.product}
                onValueChange={(value) => handleFilterChange('product', value)}
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

            {/* Weeks Filter */}
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select
                value={localFilters.weeks}
                onValueChange={(value) => handleFilterChange('weeks', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="shrink-0"
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>

        {/* Active Filters Summary */}
        {(localFilters.principal !== 'all' || localFilters.product !== 'all' || localFilters.weeks !== 'Last 4 Weeks') && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
              <span>Active filters:</span>
              {localFilters.principal !== 'all' && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                  Principal: {principals.find(p => p.id === localFilters.principal)?.name || localFilters.principal}
                </span>
              )}
              {localFilters.product !== 'all' && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                  Product: {filteredProducts.find(p => p.id === localFilters.product)?.name || localFilters.product}
                </span>
              )}
              {localFilters.weeks !== 'Last 4 Weeks' && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {localFilters.weeks}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}