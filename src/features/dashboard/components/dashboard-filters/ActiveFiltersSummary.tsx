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
    <div className="mt-3 border-t border-border/50 pt-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Active filters:</span>
        {localFilters.principal !== 'all' && (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
            Principal: {principals.find(p => p.id === localFilters.principal)?.name || localFilters.principal}
          </span>
        )}
        {localFilters.product !== 'all' && (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
            Product: {filteredProducts.find(p => p.id === localFilters.product)?.name || localFilters.product}
          </span>
        )}
        {localFilters.weeks !== 'Last 4 Weeks' && (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
            {localFilters.weeks}
          </span>
        )}
      </div>
    </div>
  )
}