import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { 
  Building2, 
  Users, 
  Package, 
  Target, 
  Home,
  MessageSquare
} from 'lucide-react'

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Organizations', url: '/organizations', icon: Building2 },
  { title: 'Contacts', url: '/contacts', icon: Users },
  { title: 'Products', url: '/products', icon: Package },
  { title: 'Opportunities', url: '/opportunities', icon: Target },
  { title: 'Interactions', url: '/interactions', icon: MessageSquare },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Master Food Brokers CRM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}