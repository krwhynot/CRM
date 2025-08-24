import { DashboardHeader } from "./dashboard-header"
import { QuickActions } from "@/components/QuickActions"
import { CRMDashboard } from "./CRMDashboard"

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