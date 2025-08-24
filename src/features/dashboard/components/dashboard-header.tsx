import { Bell, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/features/auth/components/UserMenu"

export function DashboardHeader() {
  return (
    <header className="h-[60px] bg-gradient-to-r from-white to-primary-50 border-b-2 border-primary-400 flex items-center justify-between px-6 shrink-0 shadow-[0_2px_8px_rgba(141,198,63,0.15)]">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle - hidden on larger screens since we use fixed sidebar */}
        <SidebarTrigger className="md:hidden -ml-1" />
        
        {/* MFB Branding */}
        <div className="flex items-center gap-2">
          <span className="bg-primary text-white px-2 py-1 rounded text-sm font-bold italic">
            MFB
          </span>
          <span className="text-primary-600 font-semibold">
            Master Food Brokers, Inc.
          </span>
          <span className="text-gray-400 text-xs italic ml-2 hidden sm:inline">
            "Partnering with Excellence"
          </span>
        </div>
        
        {/* Search bar - hidden on mobile */}
        <div className="relative ml-4 hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] lg:w-[300px] rounded-lg bg-white pl-8 border-gray-200"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <UserMenu />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="w-9 h-9 rounded-full border-gray-200 hover:bg-primary-100 hover:border-primary-300 hover:text-primary-600">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>No new notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}