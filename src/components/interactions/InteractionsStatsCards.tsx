import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MessageSquare, AlertTriangle, Activity, CheckCircle } from 'lucide-react'

interface InteractionsStatsCardsProps {
  stats: {
    total: number
    followUpsNeeded: number
    recentActivity: number
    byType: Record<string, number>
  } | undefined
}

export const InteractionsStatsCards: React.FC<InteractionsStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-nunito">Total Interactions</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-nunito text-mfb-green">{stats?.total || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-nunito">Follow-ups Needed</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-nunito text-mfb-green">{stats?.followUpsNeeded || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-nunito">Recent Activity</CardTitle>
          <Activity className="h-4 w-4 text-mfb-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-nunito text-mfb-green">{stats?.recentActivity || 0}</div>
          <p className="text-xs text-muted-foreground">
            Last 7 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-nunito">By Type</CardTitle>
          <CheckCircle className="h-4 w-4 text-mfb-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.byType ? Object.keys(stats.byType).length : 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Interaction types
          </p>
        </CardContent>
      </Card>
    </div>
  )
}