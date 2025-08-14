import { DashboardHeader } from "@/components/dashboard-header"
import { ChartCard } from "@/components/chart-card"
import { QuickActions } from "@/components/quick-actions"
import { StatsCards } from "@/components/stats-cards"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import type { InteractionWithRelations } from "@/types/entities"

/**
 * Enhanced Dashboard component showcasing the integration of the new ActivityFeed
 * This demonstrates how to replace the mock recent-activity with real-time activity tracking
 */
export function DashboardWithActivityFeed() {
  // Handler for when an activity is clicked
  const handleActivityClick = (activity: InteractionWithRelations) => {
    console.log('Activity clicked:', activity)
    // You can implement navigation logic here, such as:
    // - Navigate to the contact detail page
    // - Open a modal with activity details
    // - Navigate to the opportunity page
    // Example: navigate(`/contacts/${activity.contact_id}`)
  }

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

        {/* Activity Feed - Real-time activity tracking */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 laptop:grid-cols-2">
          {/* Main Activity Feed */}
          <div className="laptop:col-span-2">
            <ActivityFeed
              limit={25}
              showFilters={true}
              enableRealTime={true}
              onActivityClick={handleActivityClick}
              className="w-full"
            />
          </div>
        </div>

        {/* Alternative Layout: Side-by-side Activity Views */}
        <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 laptop:grid-cols-2">
          {/* Recent Interactions Only */}
          <ActivityFeed
            limit={10}
            showFilters={false}
            enableRealTime={true}
            className="h-96"
          />
          
          {/* Today's Activities Only */}
          <ActivityFeed
            limit={10}
            showFilters={false}
            enableRealTime={true}
            className="h-96"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Example of ActivityFeed integration in a minimal layout
 */
export function MinimalActivityDashboard() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Activity Dashboard</h1>
      
      <ActivityFeed
        limit={50}
        showFilters={true}
        enableRealTime={true}
        onActivityClick={(activity) => {
          console.log('Navigate to activity:', activity.id)
        }}
      />
    </div>
  )
}

/**
 * Example of ActivityFeed in a widget-style layout
 */
export function ActivityWidget() {
  return (
    <div className="w-full max-w-md">
      <ActivityFeed
        limit={15}
        showFilters={false}
        enableRealTime={true}
        className="h-80"
      />
    </div>
  )
}