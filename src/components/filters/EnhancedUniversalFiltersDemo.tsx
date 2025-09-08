import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { UniversalFilters } from './UniversalFilters'
import { 
  useUniversalFiltersWithOrganizations,
  getSuggestedPresets,
  WORKFLOW_PRESETS,
  getPresetBadgeCount
} from '@/components/filters'
import type { QuickViewType } from '@/types/filters.types'

export function EnhancedUniversalFiltersDemo() {
  const {
    filters,
    debouncedFilters,
    isLoading,
    computed,
    
    // Enhanced functions
    updateTimeRange,
    updateFocus,
    applyQuickView,
    clearQuickView,
    resetFilters,
    
    // Organization integration
    principals,
    managers,
    isLoadingOrganizations,
    updatePrincipal,
    updateManager,
    getPrincipalName
  } = useUniversalFiltersWithOrganizations({
    timeRange: 'this_week',
    focus: 'my_tasks'
  })

  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({})

  // Load badge counts for quick view presets
  const loadBadgeCounts = async () => {
    const presets: QuickViewType[] = [
      'action_items_due',
      'pipeline_movers',
      'recent_wins',
      'needs_attention'
    ]

    const counts: Record<string, number> = {}
    for (const preset of presets) {
      counts[preset] = await getPresetBadgeCount(preset)
    }
    setBadgeCounts(counts)
  }

  // Get suggested presets based on current time
  const suggestedPresets = getSuggestedPresets()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Universal Filters Demo</h1>
          <p className="text-muted-foreground">
            Demonstration of Phase 2 universal filters with all enhanced features
          </p>
        </div>
        <Button onClick={loadBadgeCounts} variant="outline">
          Load Badge Counts
        </Button>
      </div>

      {/* Main Universal Filters Component */}
      <Card>
        <CardHeader>
          <CardTitle>Universal Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <UniversalFilters
            filters={filters}
            onFiltersChange={() => {}} // Using individual update functions instead
            isLoading={isLoading || isLoadingOrganizations}
            showTimeRange={true}
            showFocus={true}
            showQuickView={true}
            compact={false}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Computed Properties Display */}
        <Card>
          <CardHeader>
            <CardTitle>Computed Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">My Tasks View</div>
                <div className="text-lg">
                  {computed.isMyTasksView ? '✅ Active' : '❌ Inactive'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Active Filters</div>
                <div className="text-lg">
                  {computed.activeFilterCount} filters
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Filter Summary</div>
              <Badge variant="outline">{computed.filterSummary}</Badge>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Date Range</div>
              <Badge variant="secondary">{computed.dateRangeText}</Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              <div>Effective Range:</div>
              <div>{computed.effectiveTimeRange.start.toLocaleDateString()} - {computed.effectiveTimeRange.end.toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Time Range Updates</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateTimeRange('this_week')}
                >
                  This Week
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateTimeRange('this_month')}
                >
                  This Month
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateTimeRange('this_quarter')}
                >
                  This Quarter
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Focus Updates</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateFocus('my_tasks')}
                >
                  My Tasks
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateFocus('high_priority')}
                >
                  High Priority
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateFocus('team_activity')}
                >
                  Team Activity
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Quick View Presets</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyQuickView('action_items_due')}
                >
                  Action Items Due
                  {badgeCounts['action_items_due'] && (
                    <Badge variant="secondary" className="ml-1">
                      {badgeCounts['action_items_due']}
                    </Badge>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyQuickView('pipeline_movers')}
                >
                  Pipeline Movers
                  {badgeCounts['pipeline_movers'] && (
                    <Badge variant="secondary" className="ml-1">
                      {badgeCounts['pipeline_movers']}
                    </Badge>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearQuickView()}
                >
                  Clear Quick View
                </Button>
              </div>
            </div>

            <Button onClick={resetFilters} className="w-full" variant="destructive">
              Reset All Filters
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Organization Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                Principals ({principals.length})
              </div>
              <div className="max-h-32 space-y-1 overflow-y-auto">
                {principals.slice(0, 5).map(principal => (
                  <button
                    key={principal.id}
                    onClick={() => updatePrincipal(principal.id)}
                    className="block w-full rounded p-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {principal.name}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                Managers ({managers.length})
              </div>
              <div className="max-h-32 space-y-1 overflow-y-auto">
                {managers.slice(0, 5).map(manager => (
                  <button
                    key={manager}
                    onClick={() => updateManager(manager)}
                    className="block w-full rounded p-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {manager}
                  </button>
                ))}
                {managers.length === 0 && (
                  <div className="text-xs italic text-muted-foreground">
                    No managers found in organization data
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Presets & Workflows */}
        <Card>
          <CardHeader>
            <CardTitle>Smart Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                Suggested Presets (Time-based)
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedPresets.map(preset => (
                  <Button
                    key={preset}
                    size="sm"
                    variant="outline"
                    onClick={() => applyQuickView(preset)}
                  >
                    {preset.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                Workflow Presets
              </div>
              <div className="space-y-2">
                {Object.entries(WORKFLOW_PRESETS).map(([key, workflow]) => (
                  <div key={key} className="rounded border p-2">
                    <div className="text-sm font-medium">{workflow.name}</div>
                    <div className="mb-2 text-xs text-muted-foreground">
                      {workflow.description}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workflow.presets.map(preset => (
                        <Badge key={preset} variant="outline" className="text-xs">
                          {preset.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Filter State (for debugging) */}
      <Card>
        <CardHeader>
          <CardTitle>Current State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Real-time Filters</div>
              <pre className="overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(filters, null, 2)}
              </pre>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Debounced Filters (API)</div>
              <pre className="overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(debouncedFilters, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}