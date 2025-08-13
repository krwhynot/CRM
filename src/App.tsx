import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Dashboard } from "@/components/dashboard"

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Dashboard />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App