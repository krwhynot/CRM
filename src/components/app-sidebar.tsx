import React from "react"
import { Link } from "react-router-dom"
import {
  BarChart3,
  Building2,
  FileText,
  Download,
  Package,
  Target,
  MessageSquare,
  Building,
  UserCheck,
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

const data = {
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
      title: "🏢 BUSINESS",
      items: [
        {
          title: "Principals",
          url: "#",
          icon: Building2,
        },
        {
          title: "Products", 
          url: "/products",
          icon: Package,
        },
      ],
    },
    {
      title: "👥 CUSTOMERS",
      items: [
        {
          title: "Organizations",
          url: "/organizations",
          icon: Building,
        },
        {
          title: "Contacts",
          url: "/contacts",
          icon: UserCheck,
        },
      ],
    },
    {
      title: "🎯 SALES",
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="sidebar" collapsible="none" className="w-[250px] border-r-2 border-primary" {...props}>
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
                      <SidebarMenuButton 
                        asChild
                        className="text-sm py-1 mb-1 hover:bg-gradient-to-r hover:from-primary-100 hover:to-primary-50 hover:text-primary-700 hover:border-l-2 hover:border-primary hover:pl-2"
                      >
                        <Link to={item.url}>
                          {item.icon && <item.icon className="size-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
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