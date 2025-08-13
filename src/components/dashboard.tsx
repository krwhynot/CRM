import { DashboardHeader } from "@/components/dashboard-header"
import { ChartCard } from "@/components/chart-card"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { StatsCards } from "@/components/stats-cards"

export function Dashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader />
      <QuickActions />
      
      <div className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6">
        {/* Dashboard Content Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">📊 DASHBOARD</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome to Master Food Brokers CRM - Partnering with Excellence</p>
        </div>
        
        {/* Stats Cards Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 tablet:grid-cols-2 laptop:grid-cols-4 mb-6">
          <StatsCards />
        </div>

        {/* Chart Card */}
        <div className="mb-6">
          <ChartCard />
        </div>

        {/* Info Cards Grid */}
        <RecentActivity />
      </div>
    </div>
  )
}