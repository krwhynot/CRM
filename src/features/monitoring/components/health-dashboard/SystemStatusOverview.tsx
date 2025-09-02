import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Shield, Zap } from 'lucide-react'
import { ServiceStatusCard } from './ServiceStatusCard'
import type { SystemStatusOverviewProps } from '@/types/monitoring'

export const SystemStatusOverview: React.FC<SystemStatusOverviewProps> = ({
  status,
  summary,
  isHealthy,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Health Status</span>
          <Badge
            variant={isHealthy ? 'default' : 'destructive'}
            className={isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          >
            {summary.overallHealth}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ServiceStatusCard
            icon={<Database className="size-6 text-blue-500" />}
            name="Database"
            status={{
              status: status.database.status,
              responseTime: status.database.responseTime || 0,
            }}
          />

          <ServiceStatusCard
            icon={<Shield className="size-6 text-green-500" />}
            name="Authentication"
            status={{
              status: status.auth.status,
              responseTime: status.auth.responseTime || 0,
            }}
          />

          <ServiceStatusCard
            icon={<Zap className="size-6 text-purple-500" />}
            name="API Endpoints"
            status={{
              status: status.api.status,
              responseTime: status.api.responseTime || 0,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
