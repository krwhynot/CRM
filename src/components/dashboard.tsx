import { DashboardHeader } from "@/components/dashboard-header"
import { ChartCard } from "@/components/chart-card"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { StatsCards } from "@/components/stats-cards"

export function Dashboard() {
  // Feature flag for new MFB compact styling (default: enabled, opt-out with 'false')
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false';

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader />
      <QuickActions />
      
      <div className={`flex-1 overflow-auto bg-gray-50 ${USE_NEW_STYLE ? "p-3 sm:p-4" : "p-4 sm:p-6"}`}>
        {/* Dashboard Content Header */}
        <div className={USE_NEW_STYLE ? "mb-3 sm:mb-4" : "mb-4 sm:mb-6"}>
          <h1 className={`mb-1 ${USE_NEW_STYLE ? "text-lg sm:text-xl font-bold text-[hsl(var(--foreground))]" : "text-xl sm:text-2xl font-bold text-gray-900"}`}>
            📊 DASHBOARD
          </h1>
          <p className={USE_NEW_STYLE ? "text-xs sm:text-sm text-muted-foreground" : "text-sm sm:text-base text-gray-600"}>
            Welcome to Master Food Brokers CRM - Partnering with Excellence
          </p>
        </div>
        
        {/* Stats Cards Grid */}
        <div className={`${USE_NEW_STYLE ? "compact-grid mb-4" : "grid gap-4 grid-cols-1 sm:grid-cols-2 tablet:grid-cols-2 laptop:grid-cols-4 mb-6"}`}>
          <StatsCards />
        </div>

        {/* Chart Card */}
        <div className={USE_NEW_STYLE ? "mb-4" : "mb-6"}>
          <ChartCard />
        </div>

        {/* Info Cards Grid */}
        <RecentActivity />
      </div>
    </div>
  )
}