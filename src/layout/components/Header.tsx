import { useState } from "react"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/features/auth/components/UserMenu"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b-2 border-primary-400 bg-gradient-to-r from-background to-primary-50 px-6" style={{ boxShadow: 'var(--header-shadow)' }}>
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle - hidden on larger screens since we use fixed sidebar */}
        <SidebarTrigger className="-ml-1" />
        
        {/* MFB Branding */}
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary px-2 py-1 text-sm font-bold italic text-primary-foreground">
            MFB
          </span>
          <span className="font-semibold text-primary-600">
            Master Food Brokers, Inc.
          </span>
          <span className="ml-2 hidden text-xs italic text-muted-foreground sm:inline">
            &ldquo;Partnering with Excellence&rdquo;
          </span>
        </div>
        
        {/* Search bar - hidden on mobile */}
        <div className="relative ml-4 hidden md:block">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="focus-ring w-48 rounded-lg border-border bg-background pl-8 lg:w-72"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Mobile Search Button - visible only on mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMobileSearchOpen(true)}
          className="focus-ring size-11 md:hidden"
          aria-label="Open search"
        >
          <Search className="size-4" />
        </Button>
        
        <ThemeToggle />
        <UserMenu />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="focus-ring size-11 rounded-full border-border hover:border-primary-400 hover:bg-primary-100 hover:text-primary-600">
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

      {/* Mobile Search Sheet */}
      <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
        <SheetContent side="top" className="h-auto max-h-96 border-b-0">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">Search</SheetTitle>
            <SheetDescription className="text-left">
              Search across organizations, contacts, products, and opportunities
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="focus-ring h-12 pl-10 text-base"
                autoFocus
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Start typing to search across all your CRM data
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}