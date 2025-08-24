import React from 'react'
import { FilterState, Principal, Product } from "@/types/dashboard"

interface ActiveFiltersSummaryProps {
  localFilters: FilterState
  principals: Principal[]
  filteredProducts: Product[]
}

export const ActiveFiltersSummary: React.FC<ActiveFiltersSummaryProps> = ({
  localFilters,
  principals,
  filteredProducts
}) => {
  const hasActiveFilters = (
    localFilters.principal !== 'all' || 
    localFilters.product !== 'all' || 
    localFilters.weeks !== 'Last 4 Weeks'
  )

  if (!hasActiveFilters) {
    return null
  }

  return (
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
  )
}