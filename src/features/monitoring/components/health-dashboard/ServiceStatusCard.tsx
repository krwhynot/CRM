import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useHealthStatusFormatting } from '../../hooks/useHealthStatusFormatting'
import { semanticSpacing, semanticTypography, semanticRadius, fontWeight } from '@/styles/tokens'

interface ServiceStatusCardProps {
  icon: React.ReactElement
  name: string
  status: {
    status: string
    responseTime: number
  }
}

export const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({ icon, name, status }) => {
  const { getStatusIcon, getStatusColor } = useHealthStatusFormatting()

  return (
    <div
      className={`flex items-center ${semanticSpacing.gap.lg} ${semanticRadius.lg} border ${semanticSpacing.cardContainer}`}
    >
      {icon}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={fontWeight.medium}>{name}</span>
          {getStatusIcon(status.status)}
        </div>
        <div className={`${semanticTypography.body} text-muted-foreground`}>
          {status.responseTime}ms response
        </div>
        <Badge
          variant="outline"
          className={`${semanticTypography.caption} ${getStatusColor(status.status)}`}
        >
          {status.status.toUpperCase()}
        </Badge>
      </div>
    </div>
  )
}
