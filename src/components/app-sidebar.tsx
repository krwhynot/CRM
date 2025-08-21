import React from "react"
import { Link } from "react-router-dom"
import { type LucideIcon } from "lucide-react"
import {
  BarChart3,
  FileText,
  Download,
  Package,
  Target,
  MessageSquare,
  Building,
  UserCheck,
  Factory,
  AlertTriangle,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { useNavigationCounts } from "@/hooks/useNavigationCounts"

interface NavigationItem {
  title: string
  url: string
  icon: LucideIcon
  showCount?: boolean
  showWarning?: boolean
  isPrimaryEntry?: boolean
}

interface NavigationMainItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  isPrimaryEntry?: boolean
}

interface NavigationData {
  navMain: NavigationMainItem[]
  navSections: Array<{
    title: string
    items: NavigationItem[]
  }>
}

const getNavigationData = (): NavigationData => ({
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: BarChart3,
      isActive: true,
    },
  ],
  navSections: [
    {
      title: "👥 PRIMARY WORKFLOW",
      items: [
        {
          title: "Contacts",
          url: "/contacts",
          icon: UserCheck,
          isPrimaryEntry: true,
        },
        {
          title: "Organizations",
          url: "/organizations",
          icon: Building,
          showWarning: true,
        },
      ],
    },
    {
      title: "🏢 PRINCIPALS & PRODUCTS",
      items: [
        {
          title: "Principals",
          url: "/organizations?type=principal",
          icon: Factory,
          showCount: true,
        },
        {
          title: "Products", 
          url: "/products",
          icon: Package,
        },
      ],
    },
    {
      title: "🎯 SALES ACTIVITIES",
      items: [
        {
          title: "Opportunities",
          url: "/opportunities",
          icon: Target,
        },
        {
          title: "Interactions",
          url: "/interactions",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: "📊 REPORTING & DATA",
      items: [
        {
          title: "Reports",
          url: "#",
          icon: FileText,
        },
        {
          title: "Import/Export",
          url: "#",
          icon: Download,
        },
      ],
    },
    {
      title: "⚙️ SETTINGS",
      items: [],
    },
  ],
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: navigationCounts } = useNavigationCounts()
  const data = getNavigationData()

  const renderNavigationItem = (item: NavigationItem) => {
    const showPrimaryBadge = item.isPrimaryEntry
    const showCountBadge = item.showCount && navigationCounts?.principalsCount
    const showWarningBadge = item.showWarning && navigationCounts?.organizationsWithoutContactsCount && navigationCounts.organizationsWithoutContactsCount > 0

    return (
      <SidebarMenuButton 
        asChild
        className={`text-sm py-1 mb-1 hover:bg-gradient-to-r hover:from-primary-100 hover:to-primary-50 hover:text-primary-700 hover:border-l-2 hover:border-primary hover:pl-2 ${
          showPrimaryBadge ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-2 border-green-400' : ''
        }`}
      >
        <Link to={item.url} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {item.icon && <item.icon className="size-4" />}
            <span>{item.title}</span>
            {showPrimaryBadge && (
              <StatusIndicator variant="success" size="sm" ariaLabel="Primary workflow entry">Primary Entry</StatusIndicator>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showCountBadge && (
              <StatusIndicator variant="secondary" size="sm">{navigationCounts.principalsCount}</StatusIndicator>
            )}
            {showWarningBadge && (
              <StatusIndicator variant="warning" size="sm" className="flex items-center gap-1">
                <AlertTriangle className="size-3" />
                {navigationCounts.organizationsWithoutContactsCount}
              </StatusIndicator>
            )}
          </div>
        </Link>
      </SidebarMenuButton>
    )
  }

  return (
    <Sidebar variant="sidebar" collapsible="none" className="w-[280px] border-r-2 border-primary" {...props}>
      <SidebarHeader className="border-b-2 border-primary-400 bg-white p-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-bold italic">
                  MFB
                </span>
                <span className="text-primary-600 font-semibold text-lg">
                  KitchenPantry
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-4 bg-gradient-to-b from-gray-50 to-secondary-50">
        {/* Dashboard */}
        <SidebarGroup className="mb-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={item.isActive}
                    className="mb-1 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary-400 data-[active=true]:text-white data-[active=true]:font-semibold data-[active=true]:shadow-md"
                  >
                    <Link to={item.url}>
                      {item.icon && <item.icon className="size-6" />}
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Navigation Sections */}
        {data.navSections.map((section) => (
          <SidebarGroup key={section.title} className="mb-6">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-3">
              {section.title}
            </SidebarGroupLabel>
            {section.items.length > 0 && (
              <SidebarGroupContent className="ml-8">
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {renderNavigationItem(item)}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}