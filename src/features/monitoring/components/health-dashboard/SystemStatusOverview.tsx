import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Shield, Zap } from 'lucide-react'
import { ServiceStatusCard } from './ServiceStatusCard'

interface SystemStatusOverviewProps {
  status: any
  summary: string
  isHealthy: boolean
}

export const SystemStatusOverview: React.FC<SystemStatusOverviewProps> = ({
  status,
  summary,
  isHealthy
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Health Status</span>
          <Badge 
            variant={isHealthy ? "default" : "destructive"}
            className={isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          >
            {summary}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ServiceStatusCard
            icon={<Database className="h-6 w-6 text-blue-500" />}
            name="Database"
            status={status.database}
          />
          
          <ServiceStatusCard
            icon={<Shield className="h-6 w-6 text-green-500" />}
            name="Authentication"
            status={status.auth}
          />
          
          <ServiceStatusCard
            icon={<Zap className="h-6 w-6 text-purple-500" />}
            name="API Endpoints"
            status={status.api}
          />
        </div>
      </CardContent>
    </Card>
  )
}