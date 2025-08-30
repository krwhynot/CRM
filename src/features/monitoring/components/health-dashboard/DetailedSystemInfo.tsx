import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Shield, Zap } from 'lucide-react'

interface ServiceDetail {
  status: string
  responseTime: number
  timestamp: string
  details?: string
}

interface DetailedSystemInfoProps {
  status: {
    database: ServiceDetail
    auth: ServiceDetail
    api: ServiceDetail
  }
}

const ServiceDetailSection: React.FC<{
  icon: React.ReactElement
  title: string
  service: ServiceDetail
  borderColor: string
}> = ({ icon, title, service, borderColor }) => {
  return (
    <div className={`border-l-4 ${borderColor} pl-4`}>
      <h4 className="flex items-center space-x-2 font-medium">
        {icon}
        <span>{title}</span>
      </h4>
      <div className="mt-1 text-sm text-muted-foreground">
        <div>Status: {service.status}</div>
        <div>Response Time: {service.responseTime}ms</div>
        <div>Last Check: {new Date(service.timestamp).toLocaleTimeString()}</div>
        {service.details && (
          <div className="text-warning-foreground">Details: {service.details}</div>
        )}
      </div>
    </div>
  )
}

export const DetailedSystemInfo: React.FC<DetailedSystemInfoProps> = ({ status }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed System Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ServiceDetailSection
            icon={<Database className="size-4" />}
            title="Database Service"
            service={status.database}
            borderColor="border-primary"
          />
          
          <ServiceDetailSection
            icon={<Shield className="size-4" />}
            title="Authentication Service"
            service={status.auth}
            borderColor="border-success"
          />
          
          <ServiceDetailSection
            icon={<Zap className="size-4" />}
            title="API Service"
            service={status.api}
            borderColor="border-accent"
          />
        </div>
      </CardContent>
    </Card>
  )
}