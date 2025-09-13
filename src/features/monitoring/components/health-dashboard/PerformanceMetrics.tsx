import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { semanticSpacing, semanticTypography, semanticRadius, fontWeight } from '@/styles/tokens'

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
        <div className={`grid grid-cols-1 ${semanticSpacing.gap.lg} md:grid-cols-3`}>
          <div
            className={`${semanticRadius.lg} border ${semanticSpacing.layoutPadding.lg} text-center`}
          >
            <div className={`${semanticTypography.title} ${fontWeight.bold} text-primary`}>
              {performance.averageQueryTime}ms
            </div>
            <div className={`${semanticTypography.body} text-muted-foreground`}>
              Average Query Time
            </div>
            <div className={`${semanticTypography.caption} text-muted-foreground/80`}>
              Target: &lt;25ms
            </div>
          </div>

          <div
            className={`${semanticRadius.lg} border ${semanticSpacing.layoutPadding.lg} text-center`}
          >
            <div className={`${semanticTypography.title} ${fontWeight.bold} text-success`}>
              {performance.pageLoadTime}ms
            </div>
            <div className={`${semanticTypography.body} text-muted-foreground`}>Page Load Time</div>
            <div className={`${semanticTypography.caption} text-muted-foreground/80`}>
              Target: &lt;3000ms
            </div>
          </div>

          <div
            className={`${semanticRadius.lg} border ${semanticSpacing.layoutPadding.lg} text-center`}
          >
            <div className={`${semanticTypography.title} ${fontWeight.bold} text-destructive`}>
              {performance.errorRate.toFixed(1)}%
            </div>
            <div className={`${semanticTypography.body} text-muted-foreground`}>Error Rate</div>
            <div className={`${semanticTypography.caption} text-muted-foreground/80`}>
              Target: &lt;1%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
