import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  MetricCard,
  ProgressCard,
  ActivityCard,
  QuickActionsCard,
  ChartCard,
  StatusOverviewCard,
  type ActivityItem,
} from '../CRMDashboardCards'
import {
  DashboardGrid,
  DashboardSection,
  DashboardCardWrapper,
  ResponsiveDashboard,
  DashboardLayouts,
  useDashboardBreakpoints,
  useDashboardCardSizes,
} from '../CRMDashboardLayout'
import { chartColors } from '../chart-colors'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Package,
  DollarSign,
  Target,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Layout,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react'

export function CRMDashboardExample() {
  const [selectedLayout, setSelectedLayout] = useState<'executive' | 'sales' | 'analytics'>(
    'executive'
  )
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [refreshing, setRefreshing] = useState(false)

  const breakpoint = useDashboardBreakpoints()
  const { getCardSize, getCardSpan } = useDashboardCardSizes()

  // Sample data
  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'call',
      title: 'Called John Smith',
      description: 'Discussed Q4 budget requirements',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'completed',
      user: {
        name: 'Sarah Johnson',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
      },
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Created new opportunity',
      description: 'Enterprise Software Deal - $250k',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'pending',
      priority: 'high',
    },
    {
      id: '3',
      type: 'meeting',
      title: 'Product demo scheduled',
      description: 'TechCorp Solutions - Tomorrow 2 PM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      status: 'pending',
      user: {
        name: 'Mike Wilson',
      },
    },
    {
      id: '4',
      type: 'email',
      title: 'Sent proposal',
      description: 'Premium Support Package proposal',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'completed',
    },
  ]

  const mockChart = (
    <div className="flex size-full items-center justify-center rounded-lg bg-gradient-to-br from-info/10 to-info/20 text-muted-foreground dark:from-info/5 dark:to-info/10">
      <div className="text-center">
        <BarChart3 className="mx-auto mb-2 size-12 opacity-50" />
        <p className="text-sm">Chart placeholder</p>
      </div>
    </div>
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
    toast.success('Dashboard refreshed successfully')
  }

  const quickActions = [
    {
      id: 'new-contact',
      label: 'New Contact',
      description: 'Add a new contact',
      icon: Users,
      onClick: () => toast.success('Creating new contact...'),
      shortcut: 'Ctrl+N',
    },
    {
      id: 'new-deal',
      label: 'New Deal',
      description: 'Create opportunity',
      icon: Target,
      onClick: () => toast.success('Creating new deal...'),
      shortcut: 'Ctrl+D',
    },
    {
      id: 'schedule',
      label: 'Schedule Call',
      description: 'Book a meeting',
      icon: Phone,
      onClick: () => toast.success('Opening calendar...'),
      shortcut: 'Ctrl+S',
    },
    {
      id: 'report',
      label: 'Generate Report',
      description: 'Create sales report',
      icon: BarChart3,
      onClick: () => toast.success('Generating report...'),
      shortcut: 'Ctrl+R',
    },
  ]

  const statusItems = [
    { label: 'Qualified', count: 45, color: chartColors.pipeline.qualified, percentage: 35 },
    { label: 'Proposal', count: 28, color: chartColors.pipeline.proposal, percentage: 22 },
    { label: 'Negotiation', count: 32, color: chartColors.pipeline.negotiation, percentage: 25 },
    { label: 'Closed Won', count: 23, color: chartColors.pipeline.closed, percentage: 18, trend: 'up' as const },
  ]

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      case 'desktop':
        return 'max-w-full'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">CRM Dashboard System</h2>
        <p className="text-muted-foreground">
          Comprehensive dashboard cards and responsive layout system for CRM applications
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Responsive</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Mobile-first responsive design with adaptive layouts
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Interactive</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Rich interaction patterns with actions and drill-downs
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Performance</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Optimized rendering with lazy loading and priority
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">CRM-Ready</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Pre-built components for sales, marketing, and service
          </p>
        </Card>
      </div>

      {/* Interactive Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Configuration</CardTitle>
          <CardDescription>
            Try different layouts and viewport sizes to see responsive behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Layout Selection */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Layout:</span>
              <Select
                value={selectedLayout}
                onValueChange={(value: any) => setSelectedLayout(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Viewport Simulation */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Viewport:</span>
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="h-7 px-2"
                >
                  <Monitor className="size-3" />
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                  className="h-7 px-2"
                >
                  <Tablet className="size-3" />
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="h-7 px-2"
                >
                  <Smartphone className="size-3" />
                </Button>
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Actions */}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-1 size-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>

            <div className="ml-auto text-xs text-muted-foreground">
              Current breakpoint: <Badge variant="outline">{breakpoint}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Dashboard Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="size-5" />
            Live Dashboard Demo
          </CardTitle>
          <CardDescription>
            Interactive {selectedLayout} layout with {viewMode} viewport simulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn('border rounded-lg p-6 bg-background', getViewportClass())}>
            <ResponsiveDashboard
              layout={selectedLayout}
              title={`${selectedLayout.charAt(0).toUpperCase() + selectedLayout.slice(1)} Dashboard`}
              subtitle={`${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view`}
              actions={
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-1 size-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 size-4" />
                    Export
                  </Button>
                </div>
              }
            >
              {/* Key Metrics */}
              <MetricCard
                title="Total Revenue"
                value="$2.4M"
                previousValue="$2.1M"
                trend="up"
                trendValue="+14.3%"
                icon={DollarSign}
                size={getCardSize('high')}
                variant="primary"
                badge={{ text: 'This Month', variant: 'secondary' }}
              />

              <MetricCard
                title="Active Deals"
                value={128}
                previousValue={115}
                trend="up"
                trendValue="+11.3%"
                icon={Target}
                size={getCardSize('high')}
                actions={[
                  { label: 'View Pipeline', onClick: () => toast.info('Opening pipeline...') },
                  { label: 'Add Deal', onClick: () => toast.success('Creating deal...') },
                ]}
              />

              <MetricCard
                title="New Contacts"
                value={45}
                previousValue={38}
                trend="up"
                trendValue="+18.4%"
                icon={Users}
                size={getCardSize('medium')}
                subtitle="Added this week"
              />

              <MetricCard
                title="Conversion Rate"
                value="23.5%"
                previousValue="21.8%"
                trend="up"
                trendValue="+1.7%"
                icon={TrendingUp}
                size={getCardSize('medium')}
                variant="success"
              />

              {/* Progress and Status */}
              <ProgressCard
                title="Sales Target"
                subtitle="Monthly progress towards goal"
                value={1680000}
                max={2400000}
                size={getCardSize('medium')}
                segments={[
                  { label: 'Closed', value: 850000, color: 'hsl(var(--success))' },
                  { label: 'Pending', value: 830000, color: 'hsl(var(--warning))' },
                ]}
              />

              <StatusOverviewCard
                title="Deal Pipeline"
                subtitle="Opportunities by stage"
                items={statusItems}
                size={getCardSize('medium')}
              />

              {/* Activities */}
              <ActivityCard
                title="Recent Activity"
                subtitle="Team updates and interactions"
                activities={sampleActivities}
                size={getCardSize('high')}
                maxItems={4}
                onViewAll={() => toast.info('Opening activity feed...')}
              />

              {/* Quick Actions */}
              <QuickActionsCard
                title="Quick Actions"
                subtitle="Common CRM tasks"
                actions={quickActions}
                size={getCardSize('medium')}
                layout={viewMode === 'mobile' ? 'list' : 'grid'}
              />

              {/* Charts */}
              {selectedLayout !== 'executive' && (
                <>
                  <ChartCard
                    title="Revenue Trend"
                    subtitle="Monthly revenue over time"
                    chartType="line"
                    period="Last 12 months"
                    size="xl"
                    actions={[
                      {
                        label: 'Export Data',
                        onClick: () => toast.info('Exporting...'),
                        icon: Download,
                      },
                      {
                        label: 'View Details',
                        onClick: () => toast.info('Opening details...'),
                        icon: Eye,
                      },
                    ]}
                    filters={
                      <Select defaultValue="12m">
                        <SelectTrigger className="h-7 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">1M</SelectItem>
                          <SelectItem value="3m">3M</SelectItem>
                          <SelectItem value="6m">6M</SelectItem>
                          <SelectItem value="12m">12M</SelectItem>
                        </SelectContent>
                      </Select>
                    }
                  >
                    {mockChart}
                  </ChartCard>

                  <ChartCard
                    title="Performance Metrics"
                    subtitle="Key performance indicators"
                    chartType="bar"
                    period="This Quarter"
                    size="lg"
                  >
                    {mockChart}
                  </ChartCard>
                </>
              )}

              {/* Additional Analytics Cards */}
              {selectedLayout === 'analytics' && (
                <>
                  <MetricCard
                    title="Lead Score"
                    value="8.7/10"
                    trend="up"
                    trendValue="+0.3"
                    icon={Star}
                    size="sm"
                    variant="success"
                  />

                  <MetricCard
                    title="Response Time"
                    value="2.4h"
                    previousValue="3.1h"
                    trend="up"
                    trendValue="-22%"
                    icon={Clock}
                    size="sm"
                    subtitle="Average response"
                  />

                  <MetricCard
                    title="Customer Satisfaction"
                    value="4.8/5"
                    trend="neutral"
                    icon={CheckCircle}
                    size="sm"
                    variant="primary"
                  />
                </>
              )}
            </ResponsiveDashboard>
          </div>
        </CardContent>
      </Card>

      {/* Component Gallery */}
      <Tabs defaultValue="cards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cards">Card Types</TabsTrigger>
          <TabsTrigger value="layouts">Layout System</TabsTrigger>
          <TabsTrigger value="responsive">Responsive Design</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
        </TabsList>

        {/* Card Types */}
        <TabsContent value="cards" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Metric Cards</CardTitle>
                <CardDescription>Display key performance indicators with trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricCard
                  title="Sample Metric"
                  value={1234}
                  trend="up"
                  trendValue="+12.5%"
                  icon={TrendingUp}
                  size="sm"
                />
                <p className="text-sm text-muted-foreground">
                  Perfect for KPIs, revenue numbers, user counts, and performance metrics.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Cards</CardTitle>
                <CardDescription>
                  Show progress towards goals with visual indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressCard
                  title="Sample Progress"
                  value={750}
                  max={1000}
                  size="sm"
                  showPercentage
                />
                <p className="text-sm text-muted-foreground">
                  Ideal for sales targets, project completion, and quota tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Cards</CardTitle>
                <CardDescription>Display recent activities and interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ActivityCard
                  title="Sample Activities"
                  activities={sampleActivities.slice(0, 2)}
                  size="sm"
                  maxItems={2}
                />
                <p className="text-sm text-muted-foreground">
                  Great for activity feeds, task lists, and interaction history.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>Breakdown of items by status or category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatusOverviewCard
                  title="Sample Status"
                  items={statusItems.slice(0, 3)}
                  size="sm"
                />
                <p className="text-sm text-muted-foreground">
                  Perfect for pipeline stages, ticket status, and category breakdowns.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Layout System */}
        <TabsContent value="layouts" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Predefined Layouts</CardTitle>
                <CardDescription>
                  Ready-to-use dashboard layouts for different use cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 font-medium">Executive Layout</h4>
                    <p className="mb-3 text-sm text-muted-foreground">
                      High-level KPIs and summary information
                    </p>
                    <div className="mb-2 grid grid-cols-3 gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-6 rounded bg-primary/20" />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 rounded bg-muted" />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 font-medium">Sales Layout</h4>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Pipeline, activities, and performance metrics
                    </p>
                    <div className="mb-2 grid grid-cols-4 gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 rounded bg-success/20" />
                      ))}
                    </div>
                    <div className="mb-2 grid grid-cols-2 gap-1">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-8 rounded bg-muted" />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-4 rounded bg-muted" />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 font-medium">Analytics Layout</h4>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Detailed charts and comprehensive reporting
                    </p>
                    <div className="mb-2 grid grid-cols-6 gap-1">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-3 rounded bg-info/20" />
                      ))}
                    </div>
                    <div className="mb-2 h-8 rounded bg-muted" />
                    <div className="grid grid-cols-4 gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 rounded bg-muted" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Responsive Design */}
        <TabsContent value="responsive" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Breakpoint System</CardTitle>
                <CardDescription>Adaptive layouts based on screen size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="mb-1 font-medium">Current breakpoint: {breakpoint}</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>
                        • <code>sm</code> - &lt; 640px (Mobile)
                      </li>
                      <li>
                        • <code>md</code> - 640px - 768px (Large mobile)
                      </li>
                      <li>
                        • <code>lg</code> - 768px - 1024px (Tablet)
                      </li>
                      <li>
                        • <code>xl</code> - &gt; 1024px (Desktop)
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsive Features</CardTitle>
                <CardDescription>Adaptive behavior and optimizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Automatic card sizing based on priority</li>
                      <li>• Responsive grid layouts with smart column spans</li>
                      <li>• Mobile-optimized interaction patterns</li>
                      <li>• Progressive disclosure of information</li>
                      <li>• Touch-friendly targets and spacing</li>
                      <li>• Performance optimizations for mobile</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Code Examples */}
        <TabsContent value="examples" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Dashboard Setup</CardTitle>
                <CardDescription>Simple dashboard with responsive layout</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
                  {`import { 
  ResponsiveDashboard, 
  MetricCard, 
  ActivityCard 
} from '@/components/dashboard'

export function SalesDashboard() {
  return (
    <ResponsiveDashboard
      layout="sales"
      title="Sales Dashboard"
      subtitle="Track your sales performance"
    >
      <MetricCard
        title="Revenue"
        value="$2.4M"
        trend="up"
        trendValue="+14.3%"
        icon={DollarSign}
      />
      
      <MetricCard
        title="Deals"
        value={128}
        icon={Target}
      />
      
      <ActivityCard
        title="Recent Activity"
        activities={activities}
        maxItems={5}
      />
    </ResponsiveDashboard>
  )
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Layout with Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
                  {`export function CustomDashboard() {
  return (
    <ResponsiveDashboard
      layout="custom"
      sections={[
        {
          id: 'metrics',
          title: 'Key Metrics',
          priority: 1,
          children: (
            <DashboardGrid layout="wide">
              <MetricCard title="Revenue" value="$2.4M" />
              <MetricCard title="Customers" value={1250} />
              <MetricCard title="Growth" value="12.5%" />
            </DashboardGrid>
          )
        },
        {
          id: 'charts',
          title: 'Analytics',
          priority: 2,
          children: (
            <ChartCard title="Sales Trend">
              <SalesChart />
            </ChartCard>
          )
        }
      ]}
    />
  )
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsive Hooks Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
                  {`import { 
  useDashboardBreakpoints, 
  useDashboardCardSizes 
} from '@/components/dashboard'

export function AdaptiveDashboard() {
  const breakpoint = useDashboardBreakpoints()
  const { getCardSize, getCardSpan } = useDashboardCardSizes()

  return (
    <DashboardGrid>
      <DashboardCardWrapper
        span={getCardSpan('high')}
      >
        <MetricCard
          title="Revenue"
          value="$2.4M"
          size={getCardSize('high')}
        />
      </DashboardCardWrapper>
      
      {/* More cards with responsive sizing */}
    </DashboardGrid>
  )
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
