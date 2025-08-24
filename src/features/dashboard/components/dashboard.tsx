import { DashboardHeader } from "@/components/dashboard-header"
import { QuickActions } from "@/components/quick-actions"
import { CRMDashboard } from "@/components/dashboard/CRMDashboard"

export function Dashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader />
      <QuickActions />
      
      {/* Complete CRM Analytics Dashboard */}
      <CRMDashboard />
    </div>
  )
}