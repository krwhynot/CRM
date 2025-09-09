import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  EnhancedUniversalFilters,
  CompactUniversalFilters,
  InlineUniversalFilters,
  MinimalUniversalFilters,
  FullFeaturedUniversalFilters,
} from './UniversalFilters'
import { useUniversalFiltersWithOrganizations } from '@/hooks/useUniversalFiltersWithOrganizations'
import type { UniversalFilterState, FilterOrganizationData } from '@/types/filters.types'

// Mock data for demonstration
const mockPrincipals: FilterOrganizationData[] = [
  { id: '1', name: 'Acme Foods Inc.', type: 'principal' },
  { id: '2', name: 'Global Distributors LLC', type: 'principal' },
  { id: '3', name: 'Premium Food Partners', type: 'principal' },
]

const mockManagers = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen']

export function UniversalFiltersDemo() {
  const [selectedVariant, setSelectedVariant] = useState<
    'enhanced' | 'compact' | 'inline' | 'minimal' | 'full'
  >('enhanced')
  const [isLoading, setIsLoading] = useState(false)

  // Use the enhanced hook with organization data
  const { filters, handleFiltersChange, resetFilters, computed } =
    useUniversalFiltersWithOrganizations()

  const handleClearFilter = (filterKey: keyof UniversalFilterState) => {
    const newFilters = { ...filters }
    if (filterKey === 'timeRange') {
      newFilters.timeRange = 'this_week'
    } else if (filterKey === 'focus') {
      newFilters.focus = 'all_activity'
    } else if (filterKey === 'quickView') {
      newFilters.quickView = 'none'
    }
    handleFiltersChange(newFilters)
  }

  const handleClearAllFilters = () => {
    resetFilters()
  }

  const handleSavePreset = (preset: Partial<UniversalFilterState>) => {
    // NOTE: Preset saving will be implemented in a future iteration
    console.log('Saving preset:', preset)
  }

  const variants = {
    enhanced: (
      <EnhancedUniversalFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        maxColumns={3}
        compactMode="standard"
        principals={mockPrincipals}
        managers={mockManagers}
        showPrincipalSelector={true}
        showManagerSelector={true}
        showQuickViews={true}
        enableActiveFilterManagement={true}
        variant="card"
        onClearFilter={handleClearFilter}
        onClearAllFilters={handleClearAllFilters}
        onSavePreset={handleSavePreset}
      />
    ),
    compact: (
      <CompactUniversalFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        principals={mockPrincipals}
        managers={mockManagers}
        showPrincipalSelector={true}
        showManagerSelector={true}
      />
    ),
    inline: (
      <InlineUniversalFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        maxColumns={4}
        principals={mockPrincipals}
        managers={mockManagers}
        showPrincipalSelector={true}
        showManagerSelector={true}
        showQuickViews={true}
      />
    ),
    minimal: (
      <MinimalUniversalFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        principals={mockPrincipals}
        managers={mockManagers}
      />
    ),
    full: (
      <FullFeaturedUniversalFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        principals={mockPrincipals}
        managers={mockManagers}
        showPrincipalSelector={true}
        showManagerSelector={true}
        onClearFilter={handleClearFilter}
        onClearAllFilters={handleClearAllFilters}
        onSavePreset={handleSavePreset}
      />
    ),
  }

  return (
    <div className="space-y-6 p-6">
      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Universal Filters Demo - Phase 3</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Variant Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Variant:</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(variants).map((variant) => (
                <Button
                  key={variant}
                  variant={selectedVariant === variant ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setSelectedVariant(
                      variant as 'enhanced' | 'compact' | 'inline' | 'minimal' | 'full'
                    )
                  }
                  className="capitalize"
                >
                  {variant}
                </Button>
              ))}
            </div>
          </div>

          {/* Demo Controls */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsLoading(!isLoading)}>
              Toggle Loading: {isLoading ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset All Filters
            </Button>
          </div>

          <Separator />

          {/* Filter State Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Filter State:</label>
            <div className="rounded-md bg-muted/30 p-3 font-mono text-xs">
              <pre>{JSON.stringify(filters, null, 2)}</pre>
            </div>
          </div>

          {/* Computed Properties Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Computed Properties:</label>
            <div className="flex flex-wrap gap-2">
              <Badge variant={computed.hasActiveFilters ? 'default' : 'outline'}>
                Active Filters: {computed.activeFilterCount}
              </Badge>
              <Badge variant={computed.isMyTasksView ? 'default' : 'outline'}>
                My Tasks View: {computed.isMyTasksView ? 'Yes' : 'No'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{computed.filterSummary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Selected Variant Display */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{selectedVariant} Variant</CardTitle>
        </CardHeader>
        <CardContent>{variants[selectedVariant]}</CardContent>
      </Card>

      {/* Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 3 Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Responsive Grid Layout</h4>
              <p className="text-xs text-muted-foreground">
                1-5 column responsive grid that adapts to screen size and component count
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Enhanced Components</h4>
              <p className="text-xs text-muted-foreground">
                Principal/Manager selectors, Quick Views with badges, Time Range presets
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Active Filter Management</h4>
              <p className="text-xs text-muted-foreground">
                Individual clear buttons, save presets, comprehensive filter summary
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Component Variants</h4>
              <p className="text-xs text-muted-foreground">
                Card, Inline, Minimal variants with different feature sets
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Compact Modes</h4>
              <p className="text-xs text-muted-foreground">
                Minimal, Standard, Full modes for different use cases
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Organization Integration</h4>
              <p className="text-xs text-muted-foreground">
                Seamless integration with CRM organization and manager data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
