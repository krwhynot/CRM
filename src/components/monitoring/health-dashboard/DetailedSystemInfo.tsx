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
      <h4 className="font-medium flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </h4>
      <div className="text-sm text-gray-600 mt-1">
        <div>Status: {service.status}</div>
        <div>Response Time: {service.responseTime}ms</div>
        <div>Last Check: {new Date(service.timestamp).toLocaleTimeString()}</div>
        {service.details && (
          <div className="text-yellow-600">Details: {service.details}</div>
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
            icon={<Database className="h-4 w-4" />}
            title="Database Service"
            service={status.database}
            borderColor="border-blue-500"
          />
          
          <ServiceDetailSection
            icon={<Shield className="h-4 w-4" />}
            title="Authentication Service"
            service={status.auth}
            borderColor="border-green-500"
          />
          
          <ServiceDetailSection
            icon={<Zap className="h-4 w-4" />}
            title="API Service"
            service={status.api}
            borderColor="border-purple-500"
          />
        </div>
      </CardContent>
    </Card>
  )
}