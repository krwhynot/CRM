import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useOrganizationsBadges } from '@/features/organizations/hooks/useOrganizationsBadges'
import { semanticSpacing } from '@/styles/tokens'

interface OrganizationBadgesProps {
  priority: string | null
  type: string | null
  segment: string | null
  className?: string
}

export const OrganizationBadges: React.FC<OrganizationBadgesProps> = ({
  priority,
  type,
  segment,
  className = '',
}) => {
  const { getPriorityBadge, getTypeBadge, getSegmentBadge, getStatusBadge } =
    useOrganizationsBadges()

  const priorityBadge = getPriorityBadge(priority)
  const typeBadge = getTypeBadge(type)
  const segmentBadge = getSegmentBadge(segment)
  const statusBadge = getStatusBadge(priority, type)

  return (
    <div className={`flex flex-wrap ${semanticSpacing.gap.xs} ${className}`}>
      {statusBadge && <Badge {...statusBadge.props}>{statusBadge.label}</Badge>}
      <Badge {...priorityBadge.props}>{priorityBadge.label}</Badge>
      <Badge {...typeBadge.props}>{typeBadge.label}</Badge>
      {segmentBadge && <Badge {...segmentBadge.props}>{segmentBadge.label}</Badge>}
    </div>
  )
}
