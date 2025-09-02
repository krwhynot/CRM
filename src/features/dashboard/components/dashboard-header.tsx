import { Bell, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserMenu } from '@/features/auth/components/UserMenu'

export function DashboardHeader() {
  return (
    <header
      className="flex h-header shrink-0 items-center justify-between border-b-2 border-primary-400 bg-gradient-to-r from-white to-primary-50 px-6"
      style={{ boxShadow: 'var(--dashboard-shadow)' }}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle - hidden on larger screens since we use fixed sidebar */}
        <SidebarTrigger className="-ml-1 md:hidden" />

        {/* MFB Branding */}
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary px-2 py-1 text-sm font-bold italic text-white">
            MFB
          </span>
          <span className="font-semibold text-primary-600">Master Food Brokers, Inc.</span>
          <span className="ml-2 hidden text-xs italic text-gray-400 sm:inline">
            &ldquo;Partnering with Excellence&rdquo;
          </span>
        </div>

        {/* Search bar - hidden on mobile */}
        <div className="relative ml-4 hidden md:block">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-search-sm rounded-lg border-gray-200 bg-white pl-8 lg:w-search-lg"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <UserMenu />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="hover:border-primary-300 size-9 rounded-full border-gray-200 hover:bg-primary-100 hover:text-primary-600"
            >
              <Bell className="size-4" />
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
