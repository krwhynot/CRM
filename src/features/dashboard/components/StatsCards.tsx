import { TrendingUp, TrendingDown, Users, Target, MessageSquare, Building2 } from "lucide-react"
import { useDashboardMetrics } from "@/features/dashboard/hooks/useDashboardMetrics"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function StatsCards() {
  const metrics = useDashboardMetrics()

  if (metrics.isLoading) {
    return (
      <>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  if (metrics.error) {
    return (
      <div className="col-span-4 text-center text-red-500">
        Error loading dashboard metrics
      </div>
    )
  }

  // Calculate dynamic subtitles based on real data
  const prospectCount = Object.entries(metrics.principalsByPriority)
    .filter(([priority]) => priority === 'low')
    .reduce((sum, [, count]) => sum + count, 0)
  
  const activeCount = metrics.totalPrincipals - prospectCount

  const emailCalls = Object.entries(metrics.interactionsByType)
  const callCount = emailCalls.find(([type]) => type === 'call')?.[1] || 0
  const emailCount = emailCalls.find(([type]) => type === 'email')?.[1] || 0

  const primaryContactsCount = Math.round(metrics.totalContacts * 0.21) // Estimate 21% primary contacts

  const stats = [
    {
      title: "Active Principals",
      value: metrics.totalPrincipals.toString(),
      change: `${metrics.growthMetrics.principalsGrowth >= 0 ? '+' : ''}${metrics.growthMetrics.principalsGrowth.toFixed(1)}%`,
      changeType: metrics.growthMetrics.principalsGrowth >= 0 ? "increase" : "decrease",
      icon: Building2,
      subtitle: `${prospectCount} Prospects, ${activeCount} Active`,
    },
    {
      title: "Open Opportunities",
      value: metrics.activeOpportunities.toString(),
      change: `${metrics.growthMetrics.opportunitiesGrowth >= 0 ? '+' : ''}${metrics.growthMetrics.opportunitiesGrowth.toFixed(1)}%`,
      changeType: metrics.growthMetrics.opportunitiesGrowth >= 0 ? "increase" : "decrease",
      icon: Target,
      subtitle: `${metrics.opportunitiesByStage['New Lead'] || 0} New Leads, ${metrics.opportunitiesByStage['Demo Scheduled'] || 0} Demo Scheduled`,
    },
    {
      title: "This Week's Interactions",
      value: metrics.thisWeekInteractions.toString(),
      change: `${metrics.growthMetrics.interactionsGrowth >= 0 ? '+' : ''}${metrics.growthMetrics.interactionsGrowth.toFixed(1)}%`,
      changeType: metrics.growthMetrics.interactionsGrowth >= 0 ? "increase" : "decrease",
      icon: MessageSquare,
      subtitle: `${callCount} Calls, ${emailCount} Emails`,
    },
    {
      title: "Active Contacts",
      value: metrics.totalContacts.toString(),
      change: `${metrics.growthMetrics.contactsGrowth >= 0 ? '+' : ''}${metrics.growthMetrics.contactsGrowth.toFixed(1)}%`,
      changeType: metrics.growthMetrics.contactsGrowth >= 0 ? "increase" : "decrease",
      icon: Users,
      subtitle: `${primaryContactsCount} Primary Contacts`,
    },
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {stat.subtitle}
            </p>
            <p className="text-xs text-muted-foreground flex items-center">
              {stat.changeType === "increase" ? (
                <TrendingUp className="h-3 w-3 mr-1 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
              )}
              <span
                className={
                  stat.changeType === "increase"
                    ? "text-success"
                    : "text-destructive"
                }
              >
                {stat.change}
              </span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}