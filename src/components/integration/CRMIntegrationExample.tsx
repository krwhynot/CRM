import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

// Import all our CRM components
import { CRMSidebar, defaultCRMNavigation, defaultQuickActions } from '../sidebar/CRMSidebar'
import { CRMTable } from '../tables/CRMTable'
import { CRMCommandPalette } from '../command/CRMCommandPalette'
import { ContactFormBuilder } from '../forms/CRMFormBuilder'
import { StatusBadge, PriorityBadge, OrganizationTypeBadge } from '../badges/CRMBadges'
import { PipelineProgress, DealProgress } from '../progress/CRMProgress'
import { CRMAlert, ContactAlert, useCRMAlerts } from '../alerts/CRMAlerts'
import { crmToast, entityToasts } from '../toasts/CRMToasts'
import { 
  MetricCard, 
  ActivityCard, 
  QuickActionsCard,
  StatusOverviewCard,
  type ActivityItem 
} from '../dashboard/CRMDashboardCards'
import { ResponsiveDashboard } from '../dashboard/CRMDashboardLayout'
import { 
  CRMModal,
  ConfirmationModal,
  EntityFormModal 
} from '../modals/CRMModals'
import { 
  CRMSheet,
  EntityDetailSheet,
  FilterSheet 
} from '../sheets/CRMSheets'
import { 
  ContactCardSkeleton,
  TableSkeleton,
  MetricCardSkeleton 
} from '../skeletons/CRMSkeletons'
import { 
  CRMTooltip,
  HelpTooltip,
  EntityPreviewTooltip,
  ActionTooltip 
} from '../tooltips/CRMTooltips'

import {
  Users,
  Building,
  Package,
  TrendingUp,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Settings,
  Bell,
  Eye,
  Edit,
  Trash2,
  Menu,
  X,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  WifiOff,
  Zap,
  Target,
  BarChart3,
  Activity,
  Clock,
  Star,
  RefreshCw
} from 'lucide-react'

export function CRMIntegrationExample() {
  // Mobile/responsive state
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  
  // Component states
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  
  // Data states
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Alerts and notifications
  const { alerts, addAlert, clearAlerts } = useCRMAlerts()

  // Sample data
  const sampleContacts = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@acme.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corporation',
      position: 'VP of Sales',
      status: 'active',
      priority: 'high',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      tags: ['Enterprise', 'Decision Maker']
    },
    {
      id: '2',
      name: 'Jane Doe',
      email: 'jane.doe@techcorp.com',
      phone: '+1 (555) 234-5678',
      company: 'TechCorp Solutions',
      position: 'CTO',
      status: 'prospect',
      priority: 'medium',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
      tags: ['Technology', 'Prospect']
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@startup.io',
      phone: '+1 (555) 345-6789',
      company: 'StartupXYZ',
      position: 'Founder',
      status: 'active',
      priority: 'low',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      tags: ['Startup', 'Founder']
    }
  ]

  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'call',
      title: 'Follow-up call with John Smith',
      description: 'Discussed Q4 requirements and budget',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'completed',
      user: { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face' }
    },
    {
      id: '2',
      type: 'email',
      title: 'Proposal sent to Jane Doe',
      description: 'Enterprise software proposal with pricing',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'completed'
    }
  ]

  const quickActions = [
    {
      id: 'new-contact',
      label: 'New Contact',
      description: 'Add contact',
      icon: Users,
      onClick: () => setShowContactForm(true)
    },
    {
      id: 'import-data',
      label: 'Import',
      description: 'Import CSV',
      icon: Upload,
      onClick: () => toast.info('Import feature coming soon')
    }
  ]

  const statusItems = [
    { label: 'Active', count: 145, color: '#10b981', percentage: 65 },
    { label: 'Prospects', count: 52, color: '#f59e0b', percentage: 23 },
    { label: 'Inactive', count: 27, color: '#6b7280', percentage: 12 }
  ]

  // Table columns
  const tableColumns = [
    {
      accessorKey: 'name',
      header: 'Contact',
      cell: ({ row }: { row: any }) => {
        const contact = row.original
        return (
          <EntityPreviewTooltip
            entityType="contact"
            data={{
              ...contact,
              subtitle: `${contact.position} • ${contact.company}`,
              description: `Last activity: ${contact.lastActivity.toLocaleDateString()}`
            }}
          >
            <div className="flex items-center gap-3 cursor-help">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-4" />
              </div>
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.company}</p>
              </div>
            </div>
          </EntityPreviewTooltip>
        )
      }
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: any }) => (
        <a href={`mailto:${row.original.email}`} className="text-blue-600 hover:underline">
          {row.original.email}
        </a>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => (
        <StatusBadge status={row.original.status} />
      )
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: { row: any }) => (
        <PriorityBadge priority={row.original.priority} />
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-1">
          <ActionTooltip action="View Details" shortcut="Ctrl+Click">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedContact(row.original)
                setDetailSheetOpen(true)
              }}
            >
              <Eye className="size-4" />
            </Button>
          </ActionTooltip>
          
          <ActionTooltip action="Edit Contact">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedContact(row.original)
                setShowContactForm(true)
              }}
            >
              <Edit className="size-4" />
            </Button>
          </ActionTooltip>
          
          <ActionTooltip action="Delete Contact">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedContact(row.original)
                setShowDeleteConfirm(true)
              }}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          </ActionTooltip>
        </div>
      )
    }
  ]

  // Initialize data
  useEffect(() => {
    setContacts(sampleContacts)
  }, [])

  // Simulate loading and network states
  const handleRefresh = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLoading(false)
    entityToasts.system.sync.completed(contacts.length)
  }

  const handleOfflineToggle = () => {
    setOffline(!offline)
    if (!offline) {
      toast.warning('You are now offline. Some features may be limited.')
    } else {
      toast.success('Connection restored. All features available.')
    }
  }

  // Form submissions
  const handleContactSave = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (selectedContact) {
      // Update existing
      setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, ...data } : c))
      entityToasts.contact.updated(data.name)
    } else {
      // Create new
      const newContact = { ...data, id: Date.now().toString() }
      setContacts(prev => [...prev, newContact])
      entityToasts.contact.created(data.name)
    }
    
    setShowContactForm(false)
    setSelectedContact(null)
  }

  const handleDeleteContact = async () => {
    if (!selectedContact) return
    
    await new Promise(resolve => setTimeout(resolve, 500))
    setContacts(prev => prev.filter(c => c.id !== selectedContact.id))
    entityToasts.contact.deleted(selectedContact.name)
    setShowDeleteConfirm(false)
    setSelectedContact(null)
  }

  // Mobile responsive classes
  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-sm mx-auto'
      case 'tablet': return 'max-w-4xl mx-auto'
      case 'desktop': return 'max-w-full'
    }
  }

  const isMobile = viewMode === 'mobile'
  const isTablet = viewMode === 'tablet'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">CRM Integration Demo</h2>
        <p className="text-muted-foreground">
          Complete CRM interface showcasing all components working together with mobile optimization
        </p>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
          <CardDescription>
            Simulate different screen sizes and connection states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Viewport Simulation */}
            <div className="flex items-center space-x-2">
              <Label>Viewport:</Label>
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="h-7 px-2"
                >
                  <Monitor className="h-3 w-3 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                  className="h-7 px-2"
                >
                  <Tablet className="h-3 w-3 mr-1" />
                  Tablet
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="h-7 px-2"
                >
                  <Smartphone className="h-3 w-3 mr-1" />
                  Mobile
                </Button>
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Connection State */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={!offline}
                onCheckedChange={handleOfflineToggle}
              />
              <div className="flex items-center gap-1">
                {offline ? <WifiOff className="size-4 text-red-600" /> : <Wifi className="size-4 text-green-600" />}
                <Label>{offline ? 'Offline' : 'Online'}</Label>
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`size-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search className="size-4 mr-1" />
              Command Palette
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main CRM Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5" />
            Integrated CRM Interface
            <Badge variant="outline" className="ml-auto">
              {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
            </Badge>
          </CardTitle>
          <CardDescription>
            Full-featured CRM interface with responsive design and offline capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className={`border rounded-lg overflow-hidden ${getViewportClass()}`}>
            <div className="flex h-screen max-h-[800px]">
              {/* Sidebar - Hidden on mobile */}
              {(!isMobile || sidebarOpen) && !isMobile && (
                <CRMSidebar
                  navigation={defaultCRMNavigation}
                  quickActions={defaultQuickActions}
                  recentItems={[]}
                  user={{
                    name: 'Demo User',
                    email: 'demo@company.com',
                    role: 'Sales Manager'
                  }}
                  notifications={alerts.length}
                  collapsed={isTablet}
                  onNavigate={(item) => toast.info(`Navigating to ${item.label}`)}
                />
              )}

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                {isMobile && (
                  <div className="flex items-center justify-between p-4 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      <Menu className="size-4" />
                    </Button>
                    <h3 className="font-semibold">CRM Dashboard</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCommandPaletteOpen(true)}
                    >
                      <Search className="size-4" />
                    </Button>
                  </div>
                )}

                <div className="flex-1 overflow-auto">
                  <div className="p-6 space-y-6">
                    {/* Dashboard Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold">Contact Management</h3>
                          <p className="text-muted-foreground">
                            {contacts.length} contacts • {selectedRows.length} selected
                          </p>
                        </div>
                        
                        {!isMobile && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilterSheetOpen(true)}
                            >
                              <Filter className="size-4 mr-1" />
                              Filters
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setShowContactForm(true)}
                            >
                              <Plus className="size-4 mr-1" />
                              Add Contact
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Alert Section */}
                      {alerts.length > 0 && (
                        <div className="space-y-2">
                          {alerts.slice(0, 2).map((alert) => (
                            <CRMAlert key={alert.id} {...alert} />
                          ))}
                        </div>
                      )}

                      {/* Metrics - Responsive Grid */}
                      <div className={`grid gap-4 ${
                        isMobile ? 'grid-cols-2' : 
                        isTablet ? 'grid-cols-3' : 
                        'grid-cols-4'
                      }`}>
                        {loading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <MetricCardSkeleton key={i} />
                          ))
                        ) : (
                          <>
                            <MetricCard
                              title="Total Contacts"
                              value={contacts.length}
                              trend="up"
                              trendValue="+12.5%"
                              icon={Users}
                              size="sm"
                            />
                            <MetricCard
                              title="Active Deals"
                              value="23"
                              trend="up"
                              trendValue="+5"
                              icon={TrendingUp}
                              size="sm"
                            />
                            <MetricCard
                              title="Revenue"
                              value="$2.4M"
                              trend="up"
                              trendValue="+18%"
                              icon={Target}
                              size="sm"
                            />
                            <MetricCard
                              title="Conversion"
                              value="34.8%"
                              trend="up"
                              trendValue="+2.1%"
                              icon={BarChart3}
                              size="sm"
                            />
                          </>
                        )}
                      </div>

                      {/* Mobile Action Buttons */}
                      {isMobile && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilterSheetOpen(true)}
                            className="flex-1"
                          >
                            <Filter className="size-4 mr-1" />
                            Filter
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowContactForm(true)}
                            className="flex-1"
                          >
                            <Plus className="size-4 mr-1" />
                            Add Contact
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Table Section */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Contacts</CardTitle>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                          />
                          <HelpTooltip content="Search by name, email, company, or tags">
                            <Button variant="ghost" size="sm">
                              <Search className="size-4" />
                            </Button>
                          </HelpTooltip>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <TableSkeleton rows={5} columns={4} showActions />
                        ) : (
                          <CRMTable
                            data={contacts.filter(contact =>
                              contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              contact.company.toLowerCase().includes(searchQuery.toLowerCase())
                            )}
                            columns={tableColumns}
                            rowKey={(row) => row.id}
                            selectable
                            onSelectionChange={setSelectedRows}
                            loading={loading}
                            className={isMobile ? 'text-sm' : ''}
                          />
                        )}
                      </CardContent>
                    </Card>

                    {/* Additional Sections - Hidden on mobile when space is limited */}
                    {!isMobile && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ActivityCard
                          title="Recent Activity"
                          subtitle="Latest team interactions"
                          activities={sampleActivities}
                          maxItems={3}
                        />

                        <StatusOverviewCard
                          title="Contact Status"
                          subtitle="Distribution by status"
                          items={statusItems}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Optimization Features */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Optimization Features</CardTitle>
          <CardDescription>
            Responsive design patterns and mobile-specific optimizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Smartphone className="size-4" />
                Mobile Adaptations
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Collapsible sidebar navigation</li>
                <li>• Touch-friendly button sizes</li>
                <li>• Responsive table layouts</li>
                <li>• Sheet overlays for forms</li>
                <li>• Swipe gestures support</li>
                <li>• Optimized tooltip placement</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Tablet className="size-4" />
                Tablet Optimizations
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Collapsed sidebar with icons</li>
                <li>• 3-column metric grids</li>
                <li>• Medium-sized components</li>
                <li>• Adaptive modal sizing</li>
                <li>• Touch and mouse support</li>
                <li>• Landscape/portrait layouts</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Monitor className="size-4" />
                Desktop Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full sidebar navigation</li>
                <li>• 4-column metric layouts</li>
                <li>• Rich tooltip previews</li>
                <li>• Keyboard shortcuts</li>
                <li>• Multi-panel layouts</li>
                <li>• Advanced interactions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal and Sheet Instances */}
      <CRMModal
        open={showContactForm}
        onOpenChange={setShowContactForm}
        title={selectedContact ? 'Edit Contact' : 'Add New Contact'}
        description="Enter contact information and details"
        size="lg"
      >
        <ContactFormBuilder
          defaultValues={selectedContact}
          onSubmit={handleContactSave}
          submitText={selectedContact ? 'Update Contact' : 'Create Contact'}
        />
      </CRMModal>

      <ConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Contact"
        description={`Are you sure you want to delete ${selectedContact?.name}? This action cannot be undone.`}
        variant="destructive"
        onConfirm={handleDeleteContact}
      />

      <EntityDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        entityType="contact"
        entityId={selectedContact?.id || ''}
        data={selectedContact || {}}
        activities={sampleActivities}
        onEdit={() => {
          setDetailSheetOpen(false)
          setShowContactForm(true)
        }}
        onDelete={() => {
          setDetailSheetOpen(false)
          setShowDeleteConfirm(true)
        }}
      />

      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        title="Contact Filters"
        filters={[
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'prospect', label: 'Prospect' },
              { value: 'inactive', label: 'Inactive' }
            ]
          },
          {
            id: 'priority',
            label: 'Priority',
            type: 'select',
            options: [
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]
          }
        ]}
        onApply={(filters) => {
          toast.success(`Applied ${Object.keys(filters).length} filters`)
          setFilterSheetOpen(false)
        }}
        onReset={() => toast.success('Filters cleared')}
      />

      <CRMCommandPalette
        open={commandPaletteOpen}
        setOpen={setCommandPaletteOpen}
        onNavigate={(path) => toast.info(`Navigating to ${path}`)}
        onCreateRecord={(type) => {
          if (type === 'contact') setShowContactForm(true)
          else toast.info(`Creating new ${type}`)
        }}
        onSearchResults={(query) => {
          setSearchQuery(query)
          toast.success(`Searching for "${query}"`)
        }}
      />
    </div>
  )
}