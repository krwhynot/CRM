import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useOrganizationsBadges } from '@/features/organizations/hooks/useOrganizationsBadges'

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
  className = ""
}) => {
  const { getPriorityBadge, getTypeBadge, getSegmentBadge, getStatusBadge } = useOrganizationsBadges()

  const priorityBadge = getPriorityBadge(priority)
  const typeBadge = getTypeBadge(type)
  const segmentBadge = getSegmentBadge(segment)
  const statusBadge = getStatusBadge(priority, type)

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {statusBadge && (
        <Badge className={statusBadge.className}>
          {statusBadge.label}
        </Badge>
      )}
      <Badge className={priorityBadge.className}>
        {priorityBadge.label}
      </Badge>
      <Badge className={typeBadge.className}>
        {typeBadge.label}
      </Badge>
      {segmentBadge && (
        <Badge className={segmentBadge.className}>
          {segmentBadge.label}
        </Badge>
      )}
    </div>
  )
}