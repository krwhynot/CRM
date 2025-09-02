import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useHealthStatusFormatting } from '../../hooks/useHealthStatusFormatting'

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
    <div className="flex items-center space-x-3 rounded-lg border p-3">
      {icon}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{name}</span>
          {getStatusIcon(status.status)}
        </div>
        <div className="text-sm text-gray-600">{status.responseTime}ms response</div>
        <Badge variant="outline" className={`text-xs ${getStatusColor(status.status)}`}>
          {status.status.toUpperCase()}
        </Badge>
      </div>
    </div>
  )
}
