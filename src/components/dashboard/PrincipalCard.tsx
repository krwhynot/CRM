import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { usePrincipalMetrics } from '@/hooks/usePrincipalMetrics'
import { usePrincipalPriority } from '@/hooks/usePrincipalPriority'
import { PrincipalCardHeader } from './principal-card/PrincipalCardHeader'
import { PrincipalMetricsGrid } from './principal-card/PrincipalMetricsGrid'
import { PrincipalStatusBadges } from './principal-card/PrincipalStatusBadges'
import { PrincipalContactInfo } from './principal-card/PrincipalContactInfo'
import type { Organization } from '@/types/entities'

interface PrincipalCardProps {
  principal: Organization
  className?: string
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
  const { metrics, isLoading, hasError } = usePrincipalMetrics(principal)
  const { priority, priorityColor } = usePrincipalPriority(principal)

  // Handle error state
  if (hasError) {
    return (
      <Card className={`hover:shadow-md transition-shadow border-red-200 ${className || ''}`}>
        <PrincipalCardHeader
          principal={principal}
          priority={priority}
          priorityColor="text-red-600"
        />
        <CardContent>
          <p className="text-sm text-red-500">Failed to load principal data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer group ${className || ''}`}>
      <PrincipalCardHeader
        principal={principal}
        priority={priority}
        priorityColor={priorityColor}
      />
      
      <CardContent className="space-y-4">
        <PrincipalMetricsGrid
          metrics={metrics}
          isLoading={isLoading}
        />
        
        <PrincipalStatusBadges principal={principal} />
        
        <PrincipalContactInfo principal={principal} />
      </CardContent>
    </Card>
  )
}

export default PrincipalCard