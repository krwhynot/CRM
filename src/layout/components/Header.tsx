import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between border-b-2 border-primary-400 bg-gradient-to-r from-background to-primary-50 px-6"
      style={{ boxShadow: 'var(--header-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))' }}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle - hidden on larger screens since we use fixed sidebar */}
        <SidebarTrigger className="-ml-1" />

        {/* MFB Branding */}
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary px-2 py-1 text-sm font-bold italic text-primary-foreground">
            MFB
          </span>
          <span className="font-semibold text-primary-600">Master Food Brokers, Inc.</span>
          <span className="ml-2 hidden text-xs italic text-muted-foreground sm:inline">
            &ldquo;Partnering with Excellence&rdquo;
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserMenu />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="focus-ring size-11 rounded-full border-border hover:border-primary-400 hover:bg-primary-100 hover:text-primary-600"
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
