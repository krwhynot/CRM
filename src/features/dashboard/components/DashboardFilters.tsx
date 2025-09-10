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
import { AccountManagerFilter } from './dashboard-filters/AccountManagerFilter'
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
      <CardContent className={`${USE_NEW_STYLE ? 'p-4' : 'p-4'}`}>
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Weekly Overview Title */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Weekly Overview</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="size-4" />
              <span>Filters</span>
            </div>
          </div>

          {/* Right: Filters + Actions */}
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
            {/* Main filters grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-2">
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

              <AccountManagerFilter
                localFilters={localFilters}
                isLoading={isLoading}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="shrink-0"
                  disabled={isLoading}
                >
                  Reset
                </Button>

                <Button variant="outline" size="sm" disabled={isLoading} className="shrink-0">
                  Export
                </Button>
              </div>
            </div>
          </div>

        {/* Quick View Filters - Compact Row */}
        <div className="mt-2 border-t border-border/50 pt-2">
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