import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useOpportunities } from '@/hooks/useOpportunities'
import { useInteractions } from '@/hooks/useInteractions'
import type { Organization, OpportunityWithRelations, InteractionWithRelations } from '@/types/entities'
import { format } from 'date-fns'

interface PrincipalCardProps {
  principal: Organization
  className?: string
}

interface PrincipalMetrics {
  opportunityCount: number
  interactionCount: number
  lastActivity: Date | null
  totalValue: number
  activeOpportunities: number
}

/**
 * Maps organization size to priority level for business intelligence
 */
const getPriorityFromSize = (size: string | null): string => {
  switch (size) {
    case 'enterprise':
      return 'A+'
    case 'large':
      return 'A'
    case 'medium':
      return 'B'
    case 'small':
      return 'C'
    default:
      return 'D'
  }
}

/**
 * Returns priority-based color classes for badges
 */
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'A+':
      return 'bg-red-500 hover:bg-red-600 text-white border-red-500'
    case 'A':
      return 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
    case 'B':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500'
    case 'C':
      return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
    case 'D':
      return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500'
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500'
  }
}

/**
 * Calculates comprehensive metrics for a principal organization
 */
const calculatePrincipalMetrics = (
  principal: Organization,
  opportunities: OpportunityWithRelations[],
  interactions: InteractionWithRelations[]
): PrincipalMetrics => {
  // Filter opportunities where this organization is the principal
  const principalOpportunities = opportunities.filter(
    (opp) => opp.principal_organization_id === principal.id
  )

  // Filter interactions related to this principal's opportunities
  const principalInteractions = interactions.filter((interaction) =>
    principalOpportunities.some((opp) => opp.id === interaction.opportunity_id)
  )

  // Find the most recent interaction
  const lastActivity = principalInteractions.length > 0
    ? principalInteractions
        .map((interaction) => new Date(interaction.interaction_date))
        .sort((a, b) => b.getTime() - a.getTime())[0]
    : null

  // Calculate total estimated value
  const totalValue = principalOpportunities.reduce(
    (sum, opp) => sum + (opp.estimated_value || 0),
    0
  )

  // Count active opportunities (not closed)
  const activeOpportunities = principalOpportunities.filter(
    (opp) => !['closed_won', 'closed_lost'].includes(opp.stage)
  ).length

  return {
    opportunityCount: principalOpportunities.length,
    interactionCount: principalInteractions.length,
    lastActivity,
    totalValue,
    activeOpportunities
  }
}

/**
 * PrincipalCard Component
 * 
 * Displays comprehensive information about a principal organization including:
 * - Organization details with priority-based coloring
 * - Real-time opportunity and interaction counts
 * - Last activity date
 * - Total estimated value and active opportunities
 * 
 * Features:
 * - Mobile-responsive design
 * - Hover effects for interactivity
 * - Loading states with skeletons
 * - Error handling
 * - TypeScript strict mode compliance
 */
export function PrincipalCard({ principal, className }: PrincipalCardProps) {
  // Fetch opportunities with filtering for performance
  const { 
    data: opportunities = [], 
    isLoading: opportunitiesLoading,
    error: opportunitiesError
  } = useOpportunities({ principal_organization_id: principal.id })

  // Fetch interactions - we'll filter client-side for related opportunities
  const { 
    data: interactions = [], 
    isLoading: interactionsLoading,
    error: interactionsError
  } = useInteractions()

  // Calculate loading state
  const isLoading = opportunitiesLoading || interactionsLoading

  // Calculate error state
  const hasError = opportunitiesError || interactionsError

  // Calculate metrics
  const metrics = React.useMemo(() => 
    calculatePrincipalMetrics(principal, opportunities, interactions),
    [principal, opportunities, interactions]
  )

  const priority = getPriorityFromSize(principal.size)
  const priorityColor = getPriorityColor(priority)

  // Handle error state
  if (hasError) {
    return (
      <Card className={`hover:shadow-md transition-shadow border-red-200 ${className || ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-red-600">{principal.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Failed to load principal data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer group ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {principal.name}
          </CardTitle>
          <Badge className={priorityColor} variant="outline">
            {priority}
          </Badge>
        </div>
        
        {principal.industry && (
          <p className="text-sm text-muted-foreground">{principal.industry}</p>
        )}
        
        {principal.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {principal.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Total Opportunities:</span>
            {isLoading ? (
              <Skeleton className="h-4 w-8" />
            ) : (
              <p className="font-medium text-lg">{metrics.opportunityCount}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <span className="text-muted-foreground">Active:</span>
            {isLoading ? (
              <Skeleton className="h-4 w-8" />
            ) : (
              <p className="font-medium text-lg text-green-600">
                {metrics.activeOpportunities}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Interactions:</span>
            {isLoading ? (
              <Skeleton className="h-4 w-8" />
            ) : (
              <p className="font-medium">{metrics.interactionCount}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <span className="text-muted-foreground">Est. Value:</span>
            {isLoading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <p className="font-medium">
                ${metrics.totalValue.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Last Activity */}
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm">Last Activity:</span>
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : metrics.lastActivity ? (
            <p className="text-sm font-medium">
              {format(metrics.lastActivity, 'MMM d, yyyy')}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={principal.is_active ? 'default' : 'secondary'}
            className="text-xs"
          >
            {principal.is_active ? 'Active' : 'Inactive'}
          </Badge>
          
          {principal.size && (
            <Badge variant="outline" className="text-xs">
              {principal.size.charAt(0).toUpperCase() + principal.size.slice(1)}
            </Badge>
          )}
        </div>

        {/* Contact Information */}
        {(principal.phone || principal.email) && (
          <div className="pt-2 border-t border-border/50">
            <div className="space-y-1 text-xs text-muted-foreground">
              {principal.phone && (
                <p>📞 {principal.phone}</p>
              )}
              {principal.email && (
                <p>📧 {principal.email}</p>
              )}
              {principal.website && (
                <p>🌐 {principal.website}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PrincipalCard