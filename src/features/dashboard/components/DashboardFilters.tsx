import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Filter } from 'lucide-react'
import { useDashboardFiltersState } from '../hooks/useDashboardFiltersState'
import { useDashboardFiltersData } from '../hooks/useDashboardFiltersData'
import { useDashboardFiltersStyle } from '../hooks/useDashboardFiltersStyle'
import { PrincipalFilter } from './dashboard-filters/PrincipalFilter'
import { ProductFilter } from './dashboard-filters/ProductFilter'
import { WeeksFilter } from './dashboard-filters/WeeksFilter'
import { FocusFilter } from './dashboard-filters/FocusFilter'
import { QuickViewFilter } from './dashboard-filters/QuickViewFilter'
import { ActiveFiltersSummary } from './dashboard-filters/ActiveFiltersSummary'
import type { FilterState, Principal, Product } from '@/types/dashboard'

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
  isLoading = false,
}: DashboardFiltersProps) {
  const { localFilters, handleFilterChange, resetFilters } = useDashboardFiltersState(
    filters,
    onFiltersChange
  )

  const { weekOptions, filteredProducts } = useDashboardFiltersData(products, localFilters)

  const { USE_NEW_STYLE } = useDashboardFiltersStyle()

  return (
    <Card className={`${USE_NEW_STYLE ? 'border-primary/10 shadow-sm' : 'shadow-md'}`}>
      <CardContent className={`${USE_NEW_STYLE ? 'p-4' : 'p-6'}`}>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter className="size-4" />
            <span>Filters</span>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <PrincipalFilter
              localFilters={localFilters}
              principals={principals}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
            />

            <ProductFilter
              localFilters={localFilters}
              filteredProducts={filteredProducts}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
            />

            <WeeksFilter
              localFilters={localFilters}
              weekOptions={weekOptions}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
            />

            <FocusFilter
              localFilters={localFilters}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
            />
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

        {/* Quick View Filters Row */}
        <div className="mt-3 border-t border-border/50 pt-3">
          <QuickViewFilter
            localFilters={localFilters}
            isLoading={isLoading}
            onFilterChange={handleFilterChange}
          />
        </div>

        <ActiveFiltersSummary
          localFilters={localFilters}
          principals={principals}
          filteredProducts={filteredProducts}
        />
      </CardContent>
    </Card>
  )
}
