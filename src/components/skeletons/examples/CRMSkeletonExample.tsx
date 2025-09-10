import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  MetricCardSkeleton,
  ContactCardSkeleton,
  OrganizationCardSkeleton,
  OpportunityCardSkeleton,
  ActivityFeedSkeleton,
  FormSkeleton,
  NavigationSkeleton,
  ChartSkeleton,
  PageSkeleton
} from '../CRMSkeletons'
import {
  RefreshCw,
  Users,
  Building,
  Package,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Clock,
  Zap,
  Eye,
  Layers,
  Grid,
  List,
  User,
  Settings,
  Search,
  Filter
} from 'lucide-react'

export function CRMSkeletonExample() {
  const [selectedDemo, setSelectedDemo] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [skeletonVariant, setSkeletonVariant] = useState<'default' | 'shimmer' | 'pulse'>('default')
  const [showSkeletons, setShowSkeletons] = useState(true)
  
  // Simulate loading states
  const [loadingStates, setLoadingStates] = useState({
    metrics: true,
    charts: true,
    table: true,
    cards: true,
    activities: true
  })

  // Auto-refresh demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (showSkeletons) {
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 2000)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [showSkeletons])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1500)
  }

  const toggleLoadingState = (key: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const sampleData = {
    metrics: [
      { title: 'Total Revenue', value: '$2.4M', change: '+14.3%' },
      { title: 'Active Deals', value: '128', change: '+11.3%' },
      { title: 'New Contacts', value: '45', change: '+18.4%' },
      { title: 'Conversion Rate', value: '23.5%', change: '+1.7%' }
    ],
    contacts: [
      { name: 'John Smith', company: 'Acme Corp', email: 'john@acme.com', status: 'Active' },
      { name: 'Jane Doe', company: 'TechCorp', email: 'jane@techcorp.com', status: 'Prospect' },
      { name: 'Bob Johnson', company: 'StartupXYZ', email: 'bob@startup.com', status: 'Active' }
    ],
    activities: [
      { title: 'Called John Smith', time: '2 hours ago', type: 'call' },
      { title: 'Email sent to Jane Doe', time: '4 hours ago', type: 'email' },
      { title: 'Meeting scheduled', time: '1 day ago', type: 'meeting' }
    ]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Skeleton Loading States</h2>
        <p className="text-muted-foreground">
          Comprehensive loading indicators for smooth user experience during data fetching
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Realistic</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Skeleton shapes match actual content structure
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Responsive</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Adaptive layouts that work across all screen sizes
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Animated</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Smooth pulse, shimmer, and loading animations
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">CRM-Focused</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Pre-built skeletons for common CRM components
          </p>
        </Card>
      </div>

      {/* Interactive Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Configuration</CardTitle>
          <CardDescription>
            Customize skeleton appearance and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Animation Variant */}
            <div className="space-y-2">
              <Label>Animation Style</Label>
              <Select value={skeletonVariant} onValueChange={(value: any) => setSkeletonVariant(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Pulse</SelectItem>
                  <SelectItem value="shimmer">Shimmer Effect</SelectItem>
                  <SelectItem value="pulse">Slow Pulse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Demo Selection */}
            <div className="space-y-2">
              <Label>Demo Layout</Label>
              <Select value={selectedDemo} onValueChange={setSelectedDemo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="list">Data List</SelectItem>
                  <SelectItem value="detail">Detail View</SelectItem>
                  <SelectItem value="components">Components</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Global Toggle */}
            <div className="space-y-2">
              <Label>Show Skeletons</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showSkeletons}
                  onCheckedChange={setShowSkeletons}
                />
                <span className="text-sm text-muted-foreground">
                  {showSkeletons ? 'Loading' : 'Content'}
                </span>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className={`size-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Demo
              </Button>
            </div>
          </div>

          {/* Individual Component Controls */}
          {selectedDemo === 'dashboard' && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Component Loading States</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(loadingStates).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        checked={value}
                        onCheckedChange={() => toggleLoadingState(key as keyof typeof loadingStates)}
                        size="sm"
                      />
                      <span className="text-sm capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Live Demonstrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="size-5" />
            Live Demo: {selectedDemo.charAt(0).toUpperCase() + selectedDemo.slice(1)} Layout
          </CardTitle>
          <CardDescription>
            Interactive demonstration showing skeleton states vs actual content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-background min-h-[600px]">
            {/* Dashboard Layout Demo */}
            {selectedDemo === 'dashboard' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  {(isLoading || showSkeletons) ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-64" variant={skeletonVariant} />
                      <Skeleton className="h-4 w-96" variant={skeletonVariant} />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-2xl font-bold">Sales Dashboard</h3>
                      <p className="text-muted-foreground">Track your sales performance and key metrics</p>
                    </div>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(isLoading || showSkeletons || loadingStates.metrics) ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <MetricCardSkeleton key={i} />
                    ))
                  ) : (
                    sampleData.metrics.map((metric, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{metric.title}</p>
                            <BarChart3 className="size-4 text-muted-foreground" />
                          </div>
                          <div className="mt-2">
                            <p className="text-2xl font-bold">{metric.value}</p>
                            <p className="text-xs text-green-600">{metric.change} vs last month</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {(isLoading || showSkeletons || loadingStates.charts) ? (
                    <>
                      <ChartSkeleton type="bar" />
                      <ChartSkeleton type="line" />
                    </>
                  ) : (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue Trend</CardTitle>
                          <CardDescription>Monthly revenue over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            <BarChart3 className="size-12 mb-2" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Deal Pipeline</CardTitle>
                          <CardDescription>Opportunities by stage</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            <PieChart className="size-12 mb-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                {/* Activity Feed */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest team interactions and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(isLoading || showSkeletons || loadingStates.activities) ? (
                      <ActivityFeedSkeleton items={3} />
                    ) : (
                      <div className="space-y-4">
                        {sampleData.activities.map((activity, i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Activity className="size-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* List Layout Demo */}
            {selectedDemo === 'list' && (
              <div className="space-y-6">
                {/* Header */}
                {(isLoading || showSkeletons) ? (
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-48" variant={skeletonVariant} />
                      <Skeleton className="h-4 w-64" variant={skeletonVariant} />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-9 w-20 rounded-md" variant={skeletonVariant} />
                      <Skeleton className="h-9 w-24 rounded-md" variant={skeletonVariant} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">Contacts</h3>
                      <p className="text-muted-foreground">Manage your contact database</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="size-4 mr-1" />
                        Filter
                      </Button>
                      <Button size="sm">
                        <Users className="size-4 mr-1" />
                        Add Contact
                      </Button>
                    </div>
                  </div>
                )}

                {/* Table */}
                {(isLoading || showSkeletons) ? (
                  <TableSkeleton rows={8} columns={5} showHeader showActions />
                ) : (
                  <div className="border rounded-lg">
                    <div className="border-b p-4">
                      <div className="grid grid-cols-5 gap-4 font-medium text-sm">
                        <div>Contact</div>
                        <div>Company</div>
                        <div>Email</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>
                    </div>
                    <div className="divide-y">
                      {sampleData.contacts.map((contact, i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 p-4 items-center">
                          <div className="flex items-center space-x-2">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="size-4" />
                            </div>
                            <span className="font-medium">{contact.name}</span>
                          </div>
                          <div>{contact.company}</div>
                          <div className="text-sm text-muted-foreground">{contact.email}</div>
                          <div>
                            <Badge variant={contact.status === 'Active' ? 'default' : 'secondary'}>
                              {contact.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="size-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Detail Layout Demo */}
            {selectedDemo === 'detail' && (
              <div className="space-y-6">
                {(isLoading || showSkeletons) ? (
                  <PageSkeleton layout="detail" />
                ) : (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="size-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">John Smith</h3>
                          <p className="text-muted-foreground">VP of Sales at Acme Corporation</p>
                          <div className="flex space-x-2 mt-2">
                            <Badge>Enterprise</Badge>
                            <Badge variant="outline">Decision Maker</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline">Edit</Button>
                        <Button>Contact</Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Email</Label>
                                <p>john.smith@acme.com</p>
                              </div>
                              <div>
                                <Label>Phone</Label>
                                <p>+1 (555) 123-4567</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {sampleData.activities.map((activity, i) => (
                                <div key={i} className="text-sm">
                                  <p className="font-medium">{activity.title}</p>
                                  <p className="text-muted-foreground text-xs">{activity.time}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Components Demo */}
            {selectedDemo === 'components' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Contact Cards */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Contact Cards</h4>
                    {(isLoading || showSkeletons) ? (
                      <ContactCardSkeleton />
                    ) : (
                      <Card className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="size-6" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">John Smith</h5>
                            <p className="text-sm text-muted-foreground">VP of Sales</p>
                            <div className="flex space-x-1 mt-2">
                              <Badge variant="default" className="text-xs">Active</Badge>
                              <Badge variant="outline" className="text-xs">Enterprise</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="size-4" />
                            <span>john@acme.com</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Building className="size-4" />
                            <span>+1 (555) 123-4567</span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Organization Cards */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Organization Cards</h4>
                    {(isLoading || showSkeletons) ? (
                      <OrganizationCardSkeleton />
                    ) : (
                      <Card className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="size-12 bg-muted rounded-lg flex items-center justify-center">
                              <Building className="size-6" />
                            </div>
                            <div>
                              <h5 className="font-medium">Acme Corporation</h5>
                              <p className="text-sm text-muted-foreground">Technology</p>
                            </div>
                          </div>
                          <Settings className="size-4 text-muted-foreground" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Employees</p>
                            <p className="font-medium">500+</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="font-medium">$50M</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Opportunity Cards */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Opportunity Cards</h4>
                    {(isLoading || showSkeletons) ? (
                      <OpportunityCardSkeleton />
                    ) : (
                      <Card className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium">Enterprise Software Deal</h5>
                            <p className="text-sm text-muted-foreground">Acme Corporation</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">$250,000</p>
                            <p className="text-xs text-muted-foreground">Negotiation</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>75%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Usage</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Skeleton Usage</CardTitle>
              <CardDescription>
                Simple skeleton implementation for loading states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`import { Skeleton, TableSkeleton, CardSkeleton } from '@/components/skeletons/CRMSkeletons'

// Basic skeleton
<Skeleton className="h-4 w-32" />

// Text with multiple lines
<TextSkeleton lines={3} lastLineWidth="60%" />

// Avatar placeholder
<AvatarSkeleton size="md" />

// Table loading state
<TableSkeleton rows={5} columns={4} showHeader />

// Card loading state
<CardSkeleton showHeader contentLines={4} />`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specialized CRM Components</CardTitle>
              <CardDescription>
                Pre-built skeletons for common CRM data types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`// Contact card skeleton
<ContactCardSkeleton />

// Organization card skeleton  
<OrganizationCardSkeleton />

// Opportunity card skeleton
<OpportunityCardSkeleton />

// Activity feed skeleton
<ActivityFeedSkeleton items={5} />

// Metric card skeleton
<MetricCardSkeleton />

// Chart skeleton
<ChartSkeleton type="bar" />

// Form skeleton
<FormSkeleton fields={6} showActions />

// Full page skeleton
<PageSkeleton layout="dashboard" />`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading State Patterns</CardTitle>
              <CardDescription>
                Common patterns for implementing skeleton loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`// Conditional rendering pattern
function ContactList({ loading, contacts }) {
  if (loading) {
    return <ContactCardSkeleton />
  }
  
  return contacts.map(contact => (
    <ContactCard key={contact.id} {...contact} />
  ))
}

// Component-level loading states
function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useMetrics()
  const { data: charts, isLoading: chartsLoading } = useCharts()
  
  return (
    <div className="space-y-6">
      {metricsLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <MetricsGrid data={metrics} />
      )}
      
      {chartsLoading ? (
        <ChartSkeleton type="bar" />
      ) : (
        <RevenueChart data={charts} />
      )}
    </div>
  )
}`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>
                Guidelines for effective skeleton loading states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Match Content Structure</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ensure skeleton components closely match the structure and proportions of actual content.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use similar spacing and alignment</li>
                    <li>• Match column layouts and grid structures</li>
                    <li>• Replicate text line lengths and heights</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Performance Considerations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use CSS-based animations over JavaScript</li>
                    <li>• Limit the number of animated elements</li>
                    <li>• Consider reducing animations on mobile devices</li>
                    <li>• Use appropriate skeleton counts (5-10 items max)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Accessibility</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Include appropriate ARIA labels</li>
                    <li>• Announce loading states to screen readers</li>
                    <li>• Ensure sufficient color contrast</li>
                    <li>• Provide alternative loading indicators</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">4. Timing</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Show skeletons immediately on loading</li>
                    <li>• Maintain minimum display time (300-500ms)</li>
                    <li>• Transition smoothly to actual content</li>
                    <li>• Handle error states appropriately</li>
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