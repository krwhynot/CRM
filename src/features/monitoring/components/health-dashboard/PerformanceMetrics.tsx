import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PerformanceMetricsProps {
  performance: {
    averageQueryTime: number
    pageLoadTime: number
    errorRate: number
  }
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ performance }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {performance.averageQueryTime}ms
            </div>
            <div className="text-sm text-gray-600">Average Query Time</div>
            <div className="text-xs text-gray-500">Target: &lt;25ms</div>
          </div>

          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {performance.pageLoadTime}ms
            </div>
            <div className="text-sm text-gray-600">Page Load Time</div>
            <div className="text-xs text-gray-500">Target: &lt;3000ms</div>
          </div>

          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {performance.errorRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Error Rate</div>
            <div className="text-xs text-gray-500">Target: &lt;1%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}