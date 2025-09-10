import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  CRMSidebar,
  defaultCRMNavigation,
  defaultQuickActions,
  type NavigationItem,
  type QuickAction,
  type RecentItem
} from '../CRMSidebar'
import {
  Building,
  Users,
  Package,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Settings,
  Home,
  Calendar,
  FileText,
  Bell,
  User,
  Star,
  Clock,
  Target,
  Filter,
  Download,
  Upload,
  Zap,
  HelpCircle,
  Shield,
  Database,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Palette,
  Globe
} from 'lucide-react'

export function CRMSidebarExample() {
  const [selectedSidebar, setSelectedSidebar] = useState('default')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState('dashboard')

  // Sample user data
  const sampleUser = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Sales Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face'
  }

  // Sample recent items
  const sampleRecentItems: RecentItem[] = [
    {
      id: '1',
      type: 'contact',
      name: 'John Smith',
      subtitle: 'Acme Corporation',
      href: '/contacts/john-smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      type: 'opportunity',
      name: 'Enterprise Software Deal',
      subtitle: '$250,000 • Negotiation',
      href: '/opportunities/enterprise-deal',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      type: 'organization',
      name: 'TechCorp Solutions',
      subtitle: '150 employees',
      href: '/organizations/techcorp',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: '4',
      type: 'product',
      name: 'Premium Support Package',
      subtitle: '$5,000/month',
      href: '/products/premium-support',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    }
  ]

  // Navigation with active states
  const navigationWithActive = defaultCRMNavigation.map(item => ({
    ...item,
    isActive: item.id === activeNavItem,
    children: item.children?.map(child => ({
      ...child,
      isActive: child.id === activeNavItem
    }))
  }))

  // Admin navigation structure
  const adminNavigation: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      href: '/admin',
      isActive: activeNavItem === 'overview'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      href: '/admin/users',
      badge: { count: 45, variant: 'secondary' },
      isActive: activeNavItem === 'users'
    },
    {
      id: 'system',
      label: 'System Settings',
      icon: Settings,
      href: '/admin/system',
      isActive: activeNavItem === 'system',
      children: [
        {
          id: 'system-general',
          label: 'General',
          icon: Settings,
          href: '/admin/system/general'
        },
        {
          id: 'system-security',
          label: 'Security',
          icon: Shield,
          href: '/admin/system/security',
          badge: { text: 'Alert', variant: 'destructive' }
        },
        {
          id: 'system-integrations',
          label: 'Integrations',
          icon: Globe,
          href: '/admin/system/integrations'
        }
      ]
    },
    {
      id: 'database',
      label: 'Database',
      icon: Database,
      href: '/admin/database',
      isActive: activeNavItem === 'database',
      children: [
        {
          id: 'db-backup',
          label: 'Backups',
          icon: Download,
          href: '/admin/database/backups'
        },
        {
          id: 'db-performance',
          label: 'Performance',
          icon: Zap,
          href: '/admin/database/performance'
        }
      ]
    },
    {
      id: 'reports',
      label: 'System Reports',
      icon: BarChart3,
      href: '/admin/reports',
      isActive: activeNavItem === 'reports'
    }
  ]

  // Compact quick actions for mobile
  const compactQuickActions: QuickAction[] = [
    {
      id: 'new-contact',
      label: 'Contact',
      icon: Users,
      onClick: () => toast.success('Creating new contact...')
    },
    {
      id: 'new-org',
      label: 'Organization',
      icon: Building,
      onClick: () => toast.success('Creating new organization...')
    }
  ]

  // Extended quick actions
  const extendedQuickActions: QuickAction[] = [
    ...defaultQuickActions,
    {
      id: 'schedule-meeting',
      label: 'Schedule Meeting',
      icon: Calendar,
      shortcut: 'Ctrl+M',
      onClick: () => toast.success('Opening calendar...')
    },
    {
      id: 'create-report',
      label: 'Generate Report',
      icon: FileText,
      onClick: () => toast.success('Creating report...')
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: Download,
      onClick: () => toast.info('Preparing data export...')
    }
  ]

  const handleNavigation = (item: NavigationItem) => {
    setActiveNavItem(item.id)
    toast.info(`Navigating to ${item.label}`)
  }

  const handleSearch = (query: string) => {
    if (query.length > 2) {
      toast.info(`Searching for "${query}"...`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">CRM Sidebar Navigation</h2>
        <p className="text-muted-foreground">
          Enhanced sidebar component with CRM-specific navigation patterns and features
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Navigation</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Hierarchical CRM navigation with badges and indicators
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Quick Actions</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Keyboard shortcuts and rapid access to common tasks
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Recent Items</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Recently accessed contacts, deals, and records
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">Responsive</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Collapsible design with mobile-first responsive behavior
          </p>
        </Card>
      </div>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Sidebar Demo</CardTitle>
          <CardDescription>
            Try different sidebar configurations and interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant={sidebarCollapsed ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <Eye className="size-4 mr-1" /> : <EyeOff className="size-4 mr-1" />}
              {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
            </Button>

            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Style:</span>
              <Button
                variant={selectedSidebar === 'default' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedSidebar('default')}
              >
                Default
              </Button>
              <Button
                variant={selectedSidebar === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedSidebar('admin')}
              >
                Admin
              </Button>
              <Button
                variant={selectedSidebar === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedSidebar('compact')}
              >
                Compact
              </Button>
            </div>
          </div>

          {/* Sidebar Demo */}
          <div className="border rounded-lg overflow-hidden bg-background" style={{ height: '600px' }}>
            <div className="flex h-full">
              {/* Sidebar */}
              {selectedSidebar === 'default' && (
                <CRMSidebar
                  navigation={navigationWithActive}
                  quickActions={defaultQuickActions}
                  recentItems={sampleRecentItems}
                  user={sampleUser}
                  notifications={5}
                  collapsed={sidebarCollapsed}
                  onNavigate={handleNavigation}
                  onSearch={handleSearch}
                  onToggleCollapse={setSidebarCollapsed}
                  searchPlaceholder="Search CRM..."
                />
              )}

              {selectedSidebar === 'admin' && (
                <CRMSidebar
                  navigation={adminNavigation}
                  quickActions={extendedQuickActions}
                  recentItems={[]}
                  user={{
                    ...sampleUser,
                    name: 'Admin User',
                    role: 'System Administrator'
                  }}
                  notifications={12}
                  collapsed={sidebarCollapsed}
                  onNavigate={handleNavigation}
                  onSearch={handleSearch}
                  onToggleCollapse={setSidebarCollapsed}
                  searchPlaceholder="Search admin..."
                  showRecentItems={false}
                />
              )}

              {selectedSidebar === 'compact' && (
                <CRMSidebar
                  size="sm"
                  navigation={navigationWithActive.slice(0, 6)} // Limited nav items
                  quickActions={compactQuickActions}
                  recentItems={sampleRecentItems.slice(0, 3)}
                  user={sampleUser}
                  notifications={3}
                  collapsed={sidebarCollapsed}
                  onNavigate={handleNavigation}
                  onSearch={handleSearch}
                  onToggleCollapse={setSidebarCollapsed}
                />
              )}

              {/* Main Content Area */}
              <div className="flex-1 p-6 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="max-w-4xl">
                  <h3 className="text-2xl font-bold mb-4">
                    {selectedSidebar === 'admin' ? 'Admin Dashboard' : 
                     selectedSidebar === 'compact' ? 'Mobile View' : 'CRM Dashboard'}
                  </h3>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Home className="size-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Welcome to your CRM</h4>
                            <p className="text-muted-foreground">
                              Current active item: <Badge variant="secondary">{activeNavItem}</Badge>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Contacts</p>
                              <p className="text-2xl font-bold">1,250</p>
                            </div>
                            <Users className="size-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Active Deals</p>
                              <p className="text-2xl font-bold">89</p>
                            </div>
                            <TrendingUp className="size-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Revenue</p>
                              <p className="text-2xl font-bold">$2.4M</p>
                            </div>
                            <BarChart3 className="size-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Examples */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Setup</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          <TabsTrigger value="responsive">Responsive Design</TabsTrigger>
        </TabsList>

        {/* Basic Setup */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Sidebar Implementation</CardTitle>
              <CardDescription>
                Minimum configuration to get started with the CRM sidebar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`import { CRMSidebar, defaultCRMNavigation } from '@/components/sidebar/CRMSidebar'

export function App() {
  const [activeItem, setActiveItem] = useState('dashboard')
  
  const navigation = defaultCRMNavigation.map(item => ({
    ...item,
    isActive: item.id === activeItem
  }))

  return (
    <div className="flex h-screen">
      <CRMSidebar
        navigation={navigation}
        user={{
          name: 'John Doe',
          email: 'john@company.com',
          role: 'Sales Manager'
        }}
        onNavigate={(item) => setActiveItem(item.id)}
      />
      
      <main className="flex-1 p-6">
        {/* Your main content */}
      </main>
    </div>
  )
}`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Features */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`const quickActions = [
  {
    id: 'new-contact',
    label: 'New Contact',
    icon: Users,
    shortcut: 'Ctrl+N',
    onClick: () => navigate('/contacts/new')
  },
  {
    id: 'new-deal',
    label: 'New Deal',
    icon: TrendingUp,
    shortcut: 'Ctrl+D',
    onClick: () => navigate('/deals/new')
  }
]

<CRMSidebar
  quickActions={quickActions}
  // ... other props
/>`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Items Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`const recentItems = [
  {
    id: '1',
    type: 'contact',
    name: 'John Smith',
    subtitle: 'Acme Corp',
    href: '/contacts/john-smith',
    timestamp: new Date(),
    avatar: '/avatars/john.jpg'
  }
  // ... more items
]

<CRMSidebar
  recentItems={recentItems}
  onNavigate={(href) => navigate(href)}
  // ... other props
/>`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customization */}
        <TabsContent value="customization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Navigation Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`const customNavigation = [
  {
    id: 'sales',
    label: 'Sales',
    icon: TrendingUp,
    children: [
      {
        id: 'leads',
        label: 'Leads',
        icon: Users,
        href: '/sales/leads',
        badge: { count: 25, variant: 'default' }
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        icon: Target,
        href: '/sales/opportunities'
      }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    href: '/marketing',
    badge: { text: 'New', variant: 'secondary' }
  }
]`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sidebar Sizing Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium mb-1">Available Sizes:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <code>sm</code> - 64px width (collapsed mode)</li>
                      <li>• <code>md</code> - 256px width (default)</li>
                      <li>• <code>lg</code> - 320px width (extended)</li>
                      <li>• <code>full</code> - Full width (mobile)</li>
                    </ul>
                  </div>
                  
                  <pre className="text-xs bg-muted p-3 rounded-md">
{`<CRMSidebar
  size="lg"
  collapsed={false}
  onToggleCollapse={setCollapsed}
  // ... other props
/>`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Responsive Design */}
        <TabsContent value="responsive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile & Responsive Patterns</CardTitle>
              <CardDescription>
                Best practices for responsive sidebar behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Responsive Hook Example</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`import { useMediaQuery } from '@/hooks/useMediaQuery'

export function ResponsiveSidebar() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0">
            <CRMSidebar
              size="full"
              collapsed={false}
              navigation={navigation}
              showRecentItems={false}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <CRMSidebar
          navigation={navigation}
          collapsed={collapsed}
          onToggleCollapse={setCollapsed}
        />
      )}
    </>
  )
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Responsive Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automatic collapse on mobile viewports</li>
                    <li>• Touch-friendly navigation items</li>
                    <li>• Optimized spacing and typography</li>
                    <li>• Sheet overlay for mobile navigation</li>
                    <li>• Keyboard navigation support</li>
                    <li>• Focus management and accessibility</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}