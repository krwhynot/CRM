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
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/features/auth/components/UserMenu"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="h-16 bg-gradient-to-r from-background to-primary-50 border-b-2 border-primary-400 flex items-center justify-between px-6 shrink-0" style={{ boxShadow: 'var(--header-shadow)' }}>
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle - hidden on larger screens since we use fixed sidebar */}
        <SidebarTrigger className="-ml-1" />
        
        {/* MFB Branding */}
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-bold italic">
            MFB
          </span>
          <span className="text-primary-600 font-semibold">
            Master Food Brokers, Inc.
          </span>
          <span className="text-muted-foreground text-xs italic ml-2 hidden sm:inline">
            "Partnering with Excellence"
          </span>
        </div>
        
        {/* Search bar - hidden on mobile */}
        <div className="relative ml-4 hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-48 lg:w-72 rounded-lg bg-background pl-8 border-border focus-ring"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Mobile Search Button - visible only on mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMobileSearchOpen(true)}
          className="md:hidden w-11 h-11 focus-ring"
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
        </Button>
        
        <ThemeToggle />
        <UserMenu />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="w-11 h-11 rounded-full border-border hover:bg-primary-100 hover:border-primary-400 hover:text-primary-600 focus-ring">
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

      {/* Mobile Search Sheet */}
      <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
        <SheetContent side="top" className="h-auto max-h-[50vh] border-b-0">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">Search</SheetTitle>
            <SheetDescription className="text-left">
              Search across organizations, contacts, products, and opportunities
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 h-12 text-base focus-ring"
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