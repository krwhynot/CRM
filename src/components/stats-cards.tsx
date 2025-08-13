import { TrendingUp, TrendingDown, Users, Target, MessageSquare, Building2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const stats = [
  {
    title: "Active Principals",
    value: "24",
    change: "+12.5%",
    changeType: "increase",
    icon: Building2,
    subtitle: "8 Prospects, 16 Active",
  },
  {
    title: "Open Opportunities",
    value: "47",
    change: "+23.4%",
    changeType: "increase",
    icon: Target,
    subtitle: "32 New Leads, 15 In Progress",
  },
  {
    title: "This Week's Interactions",
    value: "156",
    change: "+8.2%",
    changeType: "increase",
    icon: MessageSquare,
    subtitle: "89 Calls, 67 Emails",
  },
  {
    title: "Active Contacts",
    value: "312",
    change: "+15.7%",
    changeType: "increase",
    icon: Users,
    subtitle: "67 Primary Contacts",
  },
]

export function StatsCards() {
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
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mb-2">
              {stat.subtitle}
            </p>
            <p className="text-xs text-muted-foreground flex items-center">
              {stat.changeType === "increase" ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span
                className={
                  stat.changeType === "increase"
                    ? "text-green-500"
                    : "text-red-500"
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