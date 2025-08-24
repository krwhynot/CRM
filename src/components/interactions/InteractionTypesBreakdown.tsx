import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InteractionTypesBreakdownProps {
  stats: {
    total: number
    byType: Record<string, number>
  } | undefined
}

export const InteractionTypesBreakdown: React.FC<InteractionTypesBreakdownProps> = ({ stats }) => {
  if (!stats?.byType || Object.keys(stats.byType).length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interaction Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm capitalize">{type.replace('_', ' ')}</h3>
                <Badge variant="secondary">{count}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {((count / (stats.total || 1)) * 100).toFixed(1)}% of total
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}