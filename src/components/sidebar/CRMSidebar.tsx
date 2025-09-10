import React, { useState, useCallback } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  Building,
  Users,
  Package,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Settings,
  Search,
  Plus,
  Home,
  Calendar,
  FileText,
  Bell,
  User,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  Star,
  Clock,
  Target,
  Filter,
  Download,
  Upload,
  Zap,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Sidebar Variants
const sidebarVariants = cva(
  "flex flex-col bg-background border-r border-border transition-all duration-300",
  {
    variants: {
      size: {
        sm: "w-16",
        md: "w-64", 
        lg: "w-80",
        full: "w-full"
      },
      collapsed: {
        true: "w-16",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      collapsed: false
    }
  }
)

// Navigation Item Types
export interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    count?: number
  }
  children?: NavigationItem[]
  isActive?: boolean
  onClick?: () => void
}

export interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  onClick: () => void
}

export interface RecentItem {
  id: string
  type: 'contact' | 'organization' | 'product' | 'opportunity' | 'interaction'
  name: string
  subtitle?: string
  href: string
  timestamp: Date
  avatar?: string
}

// Sidebar Props
export interface CRMSidebarProps extends VariantProps<typeof sidebarVariants> {
  className?: string
  navigation: NavigationItem[]
  quickActions?: QuickAction[]
  recentItems?: RecentItem[]
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  notifications?: number
  onNavigate?: (item: NavigationItem) => void
  onSearch?: (query: string) => void
  onToggleCollapse?: (collapsed: boolean) => void
  searchPlaceholder?: string
  showQuickActions?: boolean
  showRecentItems?: boolean
  showUserProfile?: boolean
}

// Navigation Item Component
const NavigationItemComponent: React.FC<{
  item: NavigationItem
  level: number
  collapsed: boolean
  onNavigate?: (item: NavigationItem) => void
}> = ({ item, level, collapsed, onNavigate }) => {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const indentClass = level > 0 ? `ml-${level * 4}` : ''

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded)
    } else {
      item.onClick?.()
      onNavigate?.(item)
    }
  }

  const itemContent = (
    <Button
      variant={item.isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 h-10 px-3',
        collapsed && 'px-2 justify-center',
        item.isActive && 'bg-secondary/50 text-secondary-foreground'
      )}
      onClick={handleClick}
    >
      <item.icon className={cn('size-4 shrink-0', collapsed && 'size-5')} />
      
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{item.label}</span>
          
          {item.badge && (
            <Badge 
              variant={item.badge.variant || 'default'} 
              className="ml-auto shrink-0 text-xs"
            >
              {item.badge.count !== undefined ? item.badge.count : item.badge.text}
            </Badge>
          )}
          
          {hasChildren && (
            expanded ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />
          )}
        </>
      )}
    </Button>
  )

  return (
    <div className={cn('space-y-1', indentClass)}>
      {collapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {itemContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
              {item.badge && (
                <Badge variant={item.badge.variant} className="ml-2 text-xs">
                  {item.badge.count !== undefined ? item.badge.count : item.badge.text}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        itemContent
      )}

      {/* Child Items */}
      {hasChildren && expanded && !collapsed && (
        <div className="space-y-1 ml-4">
          {item.children!.map((child) => (
            <NavigationItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Quick Actions Component
const QuickActionsSection: React.FC<{
  actions: QuickAction[]
  collapsed: boolean
}> = ({ actions, collapsed }) => {
  if (actions.length === 0) return null

  return (
    <div className="space-y-2">
      {!collapsed && (
        <div className="px-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h3>
        </div>
      )}
      
      <div className={cn('px-2', collapsed && 'space-y-1')}>
        {actions.map((action) => {
          const buttonContent = (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className={cn(
                'w-full justify-start gap-2 h-8',
                collapsed && 'justify-center p-2'
              )}
              onClick={action.onClick}
            >
              <action.icon className="size-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate text-xs">{action.label}</span>
                  {action.shortcut && (
                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
                      {action.shortcut}
                    </kbd>
                  )}
                </>
              )}
            </Button>
          )

          return collapsed ? (
            <TooltipProvider key={action.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {buttonContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="font-medium">{action.label}</div>
                  {action.shortcut && (
                    <div className="text-xs text-muted-foreground">{action.shortcut}</div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : buttonContent
        })}
      </div>
    </div>
  )
}

// Recent Items Component
const RecentItemsSection: React.FC<{
  items: RecentItem[]
  collapsed: boolean
  onNavigate?: (href: string) => void
}> = ({ items, collapsed, onNavigate }) => {
  if (items.length === 0 || collapsed) return null

  const typeIcons = {
    contact: Users,
    organization: Building,
    product: Package,
    opportunity: TrendingUp,
    interaction: MessageSquare
  }

  return (
    <div className="space-y-2">
      <div className="px-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Recent
        </h3>
      </div>
      
      <div className="px-2 space-y-1">
        {items.slice(0, 5).map((item) => {
          const IconComponent = typeIcons[item.type]
          return (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start gap-3 h-auto p-2"
              onClick={() => onNavigate?.(item.href)}
            >
              <div className="relative">
                {item.avatar ? (
                  <Avatar className="size-6">
                    <AvatarImage src={item.avatar} />
                    <AvatarFallback className="text-xs">
                      {item.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="size-6 rounded-full bg-muted flex items-center justify-center">
                    <IconComponent className="size-3" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium truncate">{item.name}</div>
                {item.subtitle && (
                  <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground shrink-0">
                {item.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

// Main Sidebar Component
export function CRMSidebar({
  className,
  size = 'md',
  collapsed: controlledCollapsed,
  navigation,
  quickActions = [],
  recentItems = [],
  user,
  notifications = 0,
  onNavigate,
  onSearch,
  onToggleCollapse,
  searchPlaceholder = 'Search...',
  showQuickActions = true,
  showRecentItems = true,
  showUserProfile = true,
  ...props
}: CRMSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const collapsed = controlledCollapsed ?? internalCollapsed
  
  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !collapsed
    setInternalCollapsed(newCollapsed)
    onToggleCollapse?.(newCollapsed)
  }, [collapsed, onToggleCollapse])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }, [onSearch])

  return (
    <div className={cn(sidebarVariants({ size: collapsed ? 'sm' : size }), className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Target className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">CRM</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCollapse}
          className={cn('shrink-0', collapsed && 'mx-auto')}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </div>
      )}

      {/* Navigation Content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavigationItemComponent
                key={item.id}
                item={item}
                level={0}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* Quick Actions */}
          {showQuickActions && quickActions.length > 0 && (
            <>
              <Separator />
              <QuickActionsSection actions={quickActions} collapsed={collapsed} />
            </>
          )}

          {/* Recent Items */}
          {showRecentItems && recentItems.length > 0 && (
            <>
              <Separator />
              <RecentItemsSection 
                items={recentItems} 
                collapsed={collapsed} 
                onNavigate={onNavigate as any}
              />
            </>
          )}
        </div>
      </ScrollArea>

      {/* User Profile */}
      {showUserProfile && user && (
        <div className="p-3 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-auto p-2',
                  collapsed && 'justify-center p-2'
                )}
              >
                <div className="relative">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {notifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 size-5 text-xs p-0 flex items-center justify-center"
                    >
                      {notifications > 9 ? '9+' : notifications}
                    </Badge>
                  )}
                </div>

                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.role || user.email}
                    </div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 size-4" />
                Notifications
                {notifications > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {notifications}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 size-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

// Default CRM Navigation Structure
export const defaultCRMNavigation: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    isActive: true
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: Users,
    href: '/contacts',
    badge: { count: 1250, variant: 'secondary' }
  },
  {
    id: 'organizations',
    label: 'Organizations',
    icon: Building,
    href: '/organizations',
    badge: { count: 345, variant: 'secondary' }
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    icon: TrendingUp,
    href: '/opportunities',
    badge: { count: 89, variant: 'default' },
    children: [
      {
        id: 'opportunities-active',
        label: 'Active',
        icon: Target,
        href: '/opportunities/active',
        badge: { count: 67, variant: 'default' }
      },
      {
        id: 'opportunities-won',
        label: 'Won',
        icon: Star,
        href: '/opportunities/won'
      },
      {
        id: 'opportunities-lost',
        label: 'Lost',
        icon: Clock,
        href: '/opportunities/lost'
      }
    ]
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    href: '/products',
    badge: { count: 156, variant: 'outline' }
  },
  {
    id: 'interactions',
    label: 'Interactions',
    icon: MessageSquare,
    href: '/interactions',
    badge: { count: 24, variant: 'destructive' }
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    href: '/calendar'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/reports',
    children: [
      {
        id: 'reports-sales',
        label: 'Sales Reports',
        icon: TrendingUp,
        href: '/reports/sales'
      },
      {
        id: 'reports-activity',
        label: 'Activity Reports',
        icon: MessageSquare,
        href: '/reports/activity'
      },
      {
        id: 'reports-performance',
        label: 'Performance',
        icon: Target,
        href: '/reports/performance'
      }
    ]
  }
]

// Default Quick Actions
export const defaultQuickActions: QuickAction[] = [
  {
    id: 'new-contact',
    label: 'New Contact',
    icon: Users,
    shortcut: 'Ctrl+N',
    onClick: () => console.log('Create new contact')
  },
  {
    id: 'new-organization',
    label: 'New Organization',
    icon: Building,
    shortcut: 'Ctrl+O',
    onClick: () => console.log('Create new organization')
  },
  {
    id: 'new-opportunity',
    label: 'New Opportunity',
    icon: TrendingUp,
    shortcut: 'Ctrl+P',
    onClick: () => console.log('Create new opportunity')
  },
  {
    id: 'import-data',
    label: 'Import Data',
    icon: Upload,
    onClick: () => console.log('Import data')
  }
]