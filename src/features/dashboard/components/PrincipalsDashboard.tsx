import React from 'react'
import { PrincipalCardsGrid } from './PrincipalCardsGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { Button } from '@/components/ui/button'
import { usePrincipals } from '@/features/organizations/hooks/useOrganizations'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { useInteractions } from '@/features/interactions/hooks/useInteractions'
import { Plus, TrendingUp, Users, Activity } from 'lucide-react'

interface DashboardStats {
  totalPrincipals: number
  activePrincipals: number
  totalOpportunities: number
  totalActivities: number
  totalEstimatedValue: number
}

/**
 * PrincipalsDashboard Component
 *
 * Comprehensive dashboard view for principal organizations showing:
 * - Key performance indicators and summary statistics
 * - Grid of individual principal cards with detailed metrics
 * - Quick actions for managing principals
 * - Real-time data integration
 *
 * Features:
 * - Responsive design optimized for all screen sizes
 * - Real-time data updates using React Query
 * - Performance optimized with proper data fetching strategies
 * - Comprehensive error handling and loading states
 */
export function PrincipalsDashboard() {
  const { data: principals = [], isLoading: principalsLoading } = usePrincipals()
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useOpportunities()
  const { data: interactions = [], isLoading: interactionsLoading } = useInteractions()

  // Calculate dashboard statistics
  const stats: DashboardStats = React.useMemo(() => {
    const principalIds = new Set(principals.map((p) => p.id))

    // Filter opportunities and activities related to principals
    const principalOpportunities = opportunities.filter(
      (opp) => opp.principal_organization_id && principalIds.has(opp.principal_organization_id)
    )

    const principalInteractions = interactions.filter((interaction) =>
      principalOpportunities.some((opp) => opp.id === interaction.opportunity_id)
    )

    return {
      totalPrincipals: principals.length,
      activePrincipals: principals.filter((p) => p.is_active).length,
      totalOpportunities: principalOpportunities.length,
      totalActivities: principalInteractions.length,
      totalEstimatedValue: principalOpportunities.reduce(
        (sum, opp) => sum + (opp.estimated_value || 0),
        0
      ),
    }
  }, [principals, opportunities, interactions])

  const isLoading = principalsLoading || opportunitiesLoading || interactionsLoading

  return (
    <div className="space-y-8 p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Principal Organizations</h1>
          <p className="text-muted-foreground">
            Manage and monitor your principal partnerships and opportunities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button className="gap-2">
            <Plus className="size-4" />
            Add Principal
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Principals</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" role="status" aria-live="polite">
              {isLoading ? <span>Loading...</span> : stats.totalPrincipals}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusIndicator variant="success" size="sm" role="status" aria-live="polite">
                {isLoading ? <span>Loading...</span> : stats.activePrincipals} Active
              </StatusIndicator>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" role="status" aria-live="polite">
              {isLoading ? <span>Loading...</span> : stats.totalOpportunities}
            </div>
            <p className="text-xs text-muted-foreground">Across all principals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Est. Value</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" role="status" aria-live="polite">
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                `$${stats.totalEstimatedValue.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Pipeline value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" role="status" aria-live="polite">
              {isLoading ? <span>Loading...</span> : stats.totalActivities}
            </div>
            <p className="text-xs text-muted-foreground">All principal activities</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="flex items-center gap-2">
              <StatusIndicator variant="destructive" size="sm">
                A+
              </StatusIndicator>
              <span className="text-sm">Enterprise</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIndicator variant="warning" size="sm">
                A
              </StatusIndicator>
              <span className="text-sm">Large</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIndicator
                variant="warning"
                size="sm"
              >
                B
              </StatusIndicator>
              <span className="text-sm">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIndicator variant="secondary" size="sm">
                C
              </StatusIndicator>
              <span className="text-sm">Small</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIndicator variant="outline" size="sm">
                D
              </StatusIndicator>
              <span className="text-sm">Unassigned</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Principal Cards Grid */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Principal Organizations</h2>
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              `${stats.totalPrincipals} principal${stats.totalPrincipals !== 1 ? 's' : ''}`
            )}
          </p>
        </div>

        <PrincipalCardsGrid />
      </div>
    </div>
  )
}

export default PrincipalsDashboard
