import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CRMTooltip,
  HelpTooltip,
  StatusTooltip,
  EntityPreviewTooltip,
  FeatureGuideTooltip,
  ProgressTooltip,
  ActionTooltip,
  QuickStatsTooltip,
  FieldValidationTooltip
} from '../CRMTooltips'
import {
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Lightbulb,
  Zap,
  Users,
  Building,
  Package,
  TrendingUp,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Target,
  Clock,
  Globe,
  Shield,
  Settings,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  ArrowRight,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  Search,
  Filter,
  Plus,
  MoreHorizontal
} from 'lucide-react'

export function CRMTooltipExample() {
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true)
  const [selectedDemo, setSelectedDemo] = useState('basic')
  const [emailValid, setEmailValid] = useState(false)
  const [passwordValid, setPasswordValid] = useState(false)

  // Sample data for entity previews
  const sampleContact = {
    id: '1',
    name: 'John Smith',
    subtitle: 'VP of Sales • Acme Corporation',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'Active',
    priority: 'high',
    value: '$250,000 potential',
    description: 'Key decision maker for enterprise deals. Has shown strong interest in our premium offerings and prefers email communication.',
    tags: ['Enterprise', 'Decision Maker', 'Hot Lead', 'Q4 Target'],
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2)
  }

  const sampleOpportunity = {
    id: '2',
    name: 'Enterprise Software Deal',
    subtitle: 'Acme Corporation • Negotiation Stage',
    status: 'In Progress',
    priority: 'high',
    value: 250000,
    description: 'Multi-year enterprise software license with implementation services. Client is evaluating against two competitors.',
    tags: ['Enterprise', 'Software License', 'Multi-Year'],
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }

  const sampleOrganization = {
    id: '3',
    name: 'Acme Corporation',
    subtitle: '500+ employees • Technology Sector',
    status: 'Active Customer',
    value: '$2.4M annual revenue',
    description: 'Long-term strategic partner with multiple ongoing projects. Excellent payment history and strong relationship.',
    tags: ['Strategic Partner', 'Technology', 'Enterprise'],
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6)
  }

  const validationRules = [
    'Must be a valid email address',
    'Must belong to a business domain',
    'Cannot be a disposable email service'
  ]

  const passwordRules = [
    'At least 8 characters long',
    'Contains uppercase and lowercase letters',
    'Contains at least one number',
    'Contains at least one special character'
  ]

  const salesStats = [
    { label: 'This Month', value: '$124k', change: { value: '+12.5%', trend: 'up' as const } },
    { label: 'Active Deals', value: 23, change: { value: '+3', trend: 'up' as const } },
    { label: 'Closed Won', value: 8, change: { value: '+2', trend: 'up' as const } },
    { label: 'Conversion', value: '34.8%', change: { value: '+2.1%', trend: 'up' as const } }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">CRM Tooltip System</h2>
        <p className="text-muted-foreground">
          Contextual help and information tooltips for enhanced user experience
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Contextual</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Smart tooltips that adapt to content and context
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Rich Content</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Support for complex layouts, images, and interactions
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Accessible</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            WCAG compliant with keyboard navigation support
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">CRM-Focused</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Pre-built patterns for sales, support, and management
          </p>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Tooltip Configuration</CardTitle>
          <CardDescription>
            Control tooltip behavior and appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={tooltipsEnabled}
                onCheckedChange={setTooltipsEnabled}
              />
              <Label>Enable Tooltips</Label>
            </div>
            
            <CRMTooltip
              content="Toggle to enable or disable all tooltips on this page for testing purposes"
              variant="info"
              disabled={!tooltipsEnabled}
            >
              <HelpCircle className="size-4 text-muted-foreground" />
            </CRMTooltip>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demos */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="entity">Entity Preview</TabsTrigger>
          <TabsTrigger value="features">Feature Guide</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        {/* Basic Tooltips */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Tooltip Examples</CardTitle>
              <CardDescription>
                Simple tooltips for common UI elements and actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Help Tooltips */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Help Tooltips</h4>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label>Customer Priority</Label>
                    <HelpTooltip 
                      content="Priority determines how quickly customer inquiries are handled. High priority customers receive immediate attention."
                      disabled={!tooltipsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label>Lead Score</Label>
                    <HelpTooltip 
                      content={
                        <div className="space-y-2">
                          <p>Automated scoring based on:</p>
                          <ul className="text-xs space-y-1">
                            <li>• Engagement level (40%)</li>
                            <li>• Company size (25%)</li>
                            <li>• Budget fit (20%)</li>
                            <li>• Timeline (15%)</li>
                          </ul>
                        </div>
                      }
                      disabled={!tooltipsEnabled}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label>Deal Stage</Label>
                    <HelpTooltip 
                      content="Current position in the sales pipeline. Stages are customizable and should reflect your sales process."
                      size="lg"
                      disabled={!tooltipsEnabled}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Tooltips */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Action Tooltips</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <ActionTooltip
                    action="Edit Contact"
                    description="Modify contact information"
                    shortcut="Ctrl+E"
                    disabled={!tooltipsEnabled}
                  >
                    <Button variant="outline" size="sm">
                      <Edit className="size-4 mr-1" />
                      Edit
                    </Button>
                  </ActionTooltip>

                  <ActionTooltip
                    action="Delete"
                    description="Permanently remove this item"
                    disabled={!tooltipsEnabled}
                  >
                    <Button variant="destructive" size="sm">
                      <Trash2 className="size-4 mr-1" />
                      Delete
                    </Button>
                  </ActionTooltip>

                  <ActionTooltip
                    action="Export Data"
                    description="Download as CSV or Excel"
                    shortcut="Ctrl+Shift+E"
                    disabled={!tooltipsEnabled}
                  >
                    <Button variant="outline" size="sm">
                      <Download className="size-4 mr-1" />
                      Export
                    </Button>
                  </ActionTooltip>

                  <ActionTooltip
                    action="Archive Deal"
                    description="Cannot archive active deals"
                    disabled={true}
                    disabledReason="Deal is still active - close or cancel first"
                  >
                    <Button variant="outline" size="sm" disabled>
                      <Archive className="size-4 mr-1" />
                      Archive
                    </Button>
                  </ActionTooltip>
                </div>
              </div>

              <Separator />

              {/* Stats Tooltips */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Quick Stats</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickStatsTooltip
                    title="Sales Performance"
                    stats={salesStats}
                    disabled={!tooltipsEnabled}
                  >
                    <Card className="p-4 cursor-help">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Revenue</span>
                        <DollarSign className="size-4 text-muted-foreground" />
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold">$124k</span>
                        <p className="text-xs text-green-600">+12.5% vs last month</p>
                      </div>
                    </Card>
                  </QuickStatsTooltip>

                  <ProgressTooltip
                    title="Sales Target Progress"
                    current={124000}
                    total={200000}
                    segments={[
                      { label: 'Closed Won', value: 85000, color: '#10b981' },
                      { label: 'Pipeline', value: 39000, color: '#f59e0b' }
                    ]}
                    disabled={!tooltipsEnabled}
                  >
                    <Card className="p-4 cursor-help">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Target</span>
                        <Target className="size-4 text-muted-foreground" />
                      </div>
                      <Progress value={62} className="mb-2" />
                      <div className="flex justify-between text-xs">
                        <span>$124k / $200k</span>
                        <span>62%</span>
                      </div>
                    </Card>
                  </ProgressTooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Tooltips */}
        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & State Tooltips</CardTitle>
              <CardDescription>
                Rich status information with context and timestamps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Success States</h5>
                  
                  <StatusTooltip
                    status="success"
                    title="Deal Closed Won"
                    description="Successfully closed $250k enterprise deal with Acme Corp"
                    timestamp={new Date(Date.now() - 1000 * 60 * 30)}
                    user="Sarah Johnson"
                    disabled={!tooltipsEnabled}
                  >
                    <div className="flex items-center gap-2 cursor-help">
                      <CheckCircle className="size-4 text-green-600" />
                      <span className="text-sm">Enterprise Deal</span>
                      <Badge variant="default" className="ml-auto">Won</Badge>
                    </div>
                  </StatusTooltip>

                  <StatusTooltip
                    status="success"
                    title="Contact Verified"
                    description="Email and phone number confirmed"
                    timestamp={new Date(Date.now() - 1000 * 60 * 60)}
                    user="System"
                    disabled={!tooltipsEnabled}
                  >
                    <div className="flex items-center gap-2 cursor-help">
                      <CheckCircle className="size-4 text-green-600" />
                      <span className="text-sm">John Smith</span>
                      <Badge variant="outline" className="ml-auto">Verified</Badge>
                    </div>
                  </StatusTooltip>
                </div>

                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Warning States</h5>
                  
                  <StatusTooltip
                    status="warning"
                    title="Payment Overdue"
                    description="Invoice #INV-2024-001 is 5 days past due"
                    timestamp={new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)}
                    user="Finance Team"
                    disabled={!tooltipsEnabled}
                  >
                    <div className="flex items-center gap-2 cursor-help">
                      <AlertTriangle className="size-4 text-yellow-600" />
                      <span className="text-sm">Acme Corp Invoice</span>
                      <Badge variant="destructive" className="ml-auto">Overdue</Badge>
                    </div>
                  </StatusTooltip>

                  <StatusTooltip
                    status="warning"
                    title="Follow-up Required"
                    description="No contact in the last 14 days"
                    timestamp={new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)}
                    disabled={!tooltipsEnabled}
                  >
                    <div className="flex items-center gap-2 cursor-help">
                      <Clock className="size-4 text-yellow-600" />
                      <span className="text-sm">Jane Doe</span>
                      <Badge variant="outline" className="ml-auto">Stale</Badge>
                    </div>
                  </StatusTooltip>
                </div>

                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Info & Pending</h5>
                  
                  <StatusTooltip
                    status="info"
                    title="Proposal Sent"
                    description="Awaiting client review and feedback"
                    timestamp={new Date(Date.now() - 1000 * 60 * 60 * 2)}
                    user="Mike Wilson"
                    disabled={!tooltipsEnabled}
                  >
                    <div className="flex items-center gap-2 cursor-help">
                      <Info className="size-4 text-blue-600" />
                      <span className="text-sm">Software Proposal</span>
                      <Badge variant="secondary" className="ml-auto">Sent</Badge>
                    </div>
                  </StatusTooltip>

                  <StatusTooltip
                    status="pending"
                    title="Data Sync in Progress"
                    description="Synchronizing with external CRM system"
                    timestamp={new Date()}
                    user="System"
                    disabled={!tooltipsEnabled}
                  >
                    <div className="flex items-center gap-2 cursor-help">
                      <Clock className="size-4 text-orange-600 animate-pulse" />
                      <span className="text-sm">External Sync</span>
                      <Badge variant="outline" className="ml-auto">Syncing</Badge>
                    </div>
                  </StatusTooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entity Preview Tooltips */}
        <TabsContent value="entity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entity Preview Tooltips</CardTitle>
              <CardDescription>
                Rich previews of contacts, deals, and organizations on hover
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h5 className="text-sm font-medium">Contact Previews</h5>
                <div className="space-y-2">
                  <EntityPreviewTooltip
                    entityType="contact"
                    data={sampleContact}
                    disabled={!tooltipsEnabled}
                  >
                    <div className="flex items-center gap-3 p-3 border rounded-lg cursor-help hover:bg-accent/50">
                      <Avatar className="size-8">
                        <AvatarImage src={sampleContact.avatar} />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{sampleContact.name}</p>
                        <p className="text-sm text-muted-foreground">VP of Sales</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">High Priority</Badge>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </EntityPreviewTooltip>

                  <div className="text-xs text-muted-foreground">
                    → Hover over the contact card above to see detailed preview
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h5 className="text-sm font-medium">Deal Previews</h5>
                <div className="space-y-2">
                  <EntityPreviewTooltip
                    entityType="opportunity"
                    data={sampleOpportunity}
                    disabled={!tooltipsEnabled}
                  >
                    <div className="flex items-center gap-3 p-3 border rounded-lg cursor-help hover:bg-accent/50">
                      <div className="size-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <TrendingUp className="size-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{sampleOpportunity.name}</p>
                        <p className="text-sm text-muted-foreground">Acme Corporation</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$250,000</p>
                        <p className="text-xs text-muted-foreground">Negotiation</p>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </EntityPreviewTooltip>

                  <div className="text-xs text-muted-foreground">
                    → Hover over the opportunity card above to see detailed preview
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h5 className="text-sm font-medium">Organization Previews</h5>
                <div className="space-y-2">
                  <EntityPreviewTooltip
                    entityType="organization"
                    data={sampleOrganization}
                    disabled={!tooltipsEnabled}
                  >
                    <div className="flex items-center gap-3 p-3 border rounded-lg cursor-help hover:bg-accent/50">
                      <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Building className="size-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{sampleOrganization.name}</p>
                        <p className="text-sm text-muted-foreground">Technology • 500+ employees</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge className="text-xs">Strategic Partner</Badge>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </EntityPreviewTooltip>

                  <div className="text-xs text-muted-foreground">
                    → Hover over the organization card above to see detailed preview
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Guide Tooltips */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Guide Tooltips</CardTitle>
              <CardDescription>
                Interactive help and onboarding tooltips for complex features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-sm font-medium">Feature Introductions</h5>
                  
                  <FeatureGuideTooltip
                    title="Smart Lead Scoring"
                    description="Automatically score leads based on engagement, company data, and behavior patterns."
                    steps={[
                      'Upload or import your lead data',
                      'Configure scoring criteria and weights',
                      'Review and approve scoring model',
                      'Monitor lead scores in real-time'
                    ]}
                    shortcut="Ctrl+L"
                    learnMore={{
                      text: 'Learn more about lead scoring',
                      url: 'https://docs.example.com/lead-scoring'
                    }}
                    disabled={!tooltipsEnabled}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="size-4 mr-2" />
                      Smart Lead Scoring
                      <Lightbulb className="size-4 ml-auto text-yellow-500" />
                    </Button>
                  </FeatureGuideTooltip>

                  <FeatureGuideTooltip
                    title="Pipeline Automation"
                    description="Set up automated workflows to move deals through your sales pipeline."
                    steps={[
                      'Define your sales stages',
                      'Create automation rules',
                      'Set up notifications and tasks',
                      'Test and activate workflows'
                    ]}
                    shortcut="Ctrl+P"
                    disabled={!tooltipsEnabled}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="size-4 mr-2" />
                      Pipeline Automation
                      <Lightbulb className="size-4 ml-auto text-yellow-500" />
                    </Button>
                  </FeatureGuideTooltip>

                  <FeatureGuideTooltip
                    title="Email Sequences"
                    description="Create automated email sequences for nurturing leads and following up with prospects."
                    steps={[
                      'Design your email templates',
                      'Set up sequence timing and triggers',
                      'Configure personalization rules',
                      'Launch and monitor performance'
                    ]}
                    shortcut="Ctrl+M"
                    learnMore={{
                      text: 'Email sequence best practices',
                      url: 'https://docs.example.com/email-sequences'
                    }}
                    disabled={!tooltipsEnabled}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="size-4 mr-2" />
                      Email Sequences
                      <Lightbulb className="size-4 ml-auto text-yellow-500" />
                    </Button>
                  </FeatureGuideTooltip>
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-medium">Advanced Features</h5>
                  
                  <FeatureGuideTooltip
                    title="Revenue Forecasting"
                    description="Use AI-powered analytics to predict future revenue based on your pipeline data."
                    steps={[
                      'Connect your sales data',
                      'Review historical trends',
                      'Adjust forecast parameters',
                      'Generate and share reports'
                    ]}
                    disabled={!tooltipsEnabled}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="size-4 mr-2" />
                      Revenue Forecasting
                      <Zap className="size-4 ml-auto text-blue-500" />
                    </Button>
                  </FeatureGuideTooltip>

                  <FeatureGuideTooltip
                    title="Team Collaboration"
                    description="Share leads, collaborate on deals, and coordinate team activities."
                    steps={[
                      'Set up team permissions',
                      'Create shared workspaces',
                      'Configure notification preferences',
                      'Start collaborating!'
                    ]}
                    disabled={!tooltipsEnabled}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="size-4 mr-2" />
                      Team Collaboration
                      <Zap className="size-4 ml-auto text-blue-500" />
                    </Button>
                  </FeatureGuideTooltip>

                  <FeatureGuideTooltip
                    title="Advanced Reporting"
                    description="Create custom reports and dashboards with advanced analytics and visualizations."
                    steps={[
                      'Choose your data sources',
                      'Select visualization types',
                      'Configure filters and parameters',
                      'Schedule and share reports'
                    ]}
                    shortcut="Ctrl+R"
                    disabled={!tooltipsEnabled}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <PieChart className="size-4 mr-2" />
                      Advanced Reporting
                      <Zap className="size-4 ml-auto text-blue-500" />
                    </Button>
                  </FeatureGuideTooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tooltips */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Validation Tooltips</CardTitle>
              <CardDescription>
                Real-time validation feedback with detailed requirements and errors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-sm font-medium">Email Validation</h5>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value="john@acme.com"
                        onChange={(e) => setEmailValid(e.target.value.includes('@') && e.target.value.includes('.'))}
                        className={emailValid ? 'border-green-500' : 'border-red-500'}
                      />
                      <FieldValidationTooltip
                        rules={validationRules}
                        isValid={emailValid}
                        errors={emailValid ? [] : ['Please enter a valid email address']}
                        disabled={!tooltipsEnabled}
                      >
                        <div className="cursor-help">
                          {emailValid ? (
                            <CheckCircle className="size-4 text-green-600" />
                          ) : (
                            <XCircle className="size-4 text-red-600" />
                          )}
                        </div>
                      </FieldValidationTooltip>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-medium">Password Validation</h5>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        onChange={(e) => setPasswordValid(e.target.value.length >= 8)}
                        className={passwordValid ? 'border-green-500' : 'border-red-500'}
                      />
                      <FieldValidationTooltip
                        rules={passwordRules}
                        isValid={passwordValid}
                        errors={passwordValid ? [] : ['Password must be at least 8 characters long']}
                        disabled={!tooltipsEnabled}
                      >
                        <div className="cursor-help">
                          {passwordValid ? (
                            <CheckCircle className="size-4 text-green-600" />
                          ) : (
                            <XCircle className="size-4 text-red-600" />
                          )}
                        </div>
                      </FieldValidationTooltip>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h5 className="text-sm font-medium">Complex Form Example</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Deal Value</Label>
                      <HelpTooltip 
                        content="Enter the total expected value of this deal in USD. This will be used for forecasting and reporting."
                        disabled={!tooltipsEnabled}
                      />
                    </div>
                    <Input placeholder="$250,000" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Close Probability</Label>
                      <HelpTooltip 
                        content="Likelihood of closing this deal (0-100%). This affects pipeline weighting and forecasts."
                        disabled={!tooltipsEnabled}
                      />
                    </div>
                    <Input placeholder="75%" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Expected Close Date</Label>
                      <HelpTooltip 
                        content="When you expect to close this deal. Used for pipeline management and quota planning."
                        disabled={!tooltipsEnabled}
                      />
                    </div>
                    <Input type="date" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Deal Stage</Label>
                      <HelpTooltip 
                        content={
                          <div className="space-y-2">
                            <p>Current stage in your sales process:</p>
                            <ul className="text-xs space-y-1">
                              <li>• Qualification (25%)</li>
                              <li>• Proposal (50%)</li>
                              <li>• Negotiation (75%)</li>
                              <li>• Closed Won (100%)</li>
                            </ul>
                          </div>
                        }
                        disabled={!tooltipsEnabled}
                      />
                    </div>
                    <Input placeholder="Negotiation" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>
            Code examples for implementing CRM tooltips in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic-usage" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic-usage">Basic Usage</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
            </TabsList>

            <TabsContent value="basic-usage">
              <div className="space-y-4">
                <h4 className="font-medium">Simple Tooltip</h4>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`import { CRMTooltip, HelpTooltip } from '@/components/tooltips/CRMTooltips'

// Basic tooltip
<CRMTooltip content="This is a helpful tooltip">
  <Button>Hover me</Button>
</CRMTooltip>

// Help tooltip with icon
<HelpTooltip content="Explains a complex feature or setting">
  <HelpCircle className="size-4 text-muted-foreground" />
</HelpTooltip>`}
                </pre>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Entity Preview</h4>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`<EntityPreviewTooltip
  entityType="contact"
  data={{
    id: '123',
    name: 'John Smith',
    subtitle: 'VP of Sales • Acme Corp',
    status: 'Active',
    priority: 'high',
    value: '$250k potential',
    description: 'Key decision maker...',
    tags: ['Enterprise', 'Hot Lead'],
    lastActivity: new Date()
  }}
>
  <ContactCard {...contact} />
</EntityPreviewTooltip>`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <div className="space-y-4">
                <h4 className="font-medium">Feature Guide Tooltip</h4>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`<FeatureGuideTooltip
  title="Smart Lead Scoring"
  description="Automatically score leads based on multiple criteria"
  steps={[
    'Upload lead data',
    'Configure scoring rules',
    'Review and activate'
  ]}
  shortcut="Ctrl+L"
  learnMore={{
    text: 'Documentation',
    url: '/docs/lead-scoring'
  }}
>
  <Button>Lead Scoring</Button>
</FeatureGuideTooltip>`}
                </pre>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Validation Tooltip</h4>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`<FieldValidationTooltip
  rules={[
    'Must be valid email',
    'Business domain required',
    'No disposable emails'
  ]}
  isValid={isEmailValid}
  errors={emailErrors}
>
  <Input
    type="email"
    className={isEmailValid ? 'border-green-500' : 'border-red-500'}
  />
</FieldValidationTooltip>`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="best-practices">
              <div className="space-y-4">
                <h4 className="font-medium">Best Practices</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-medium">Content Guidelines</h5>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>• Keep tooltip content concise and actionable</li>
                      <li>• Use clear, jargon-free language</li>
                      <li>• Include specific examples when helpful</li>
                      <li>• Provide next steps or related actions</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium">Timing & Behavior</h5>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>• Use appropriate delay durations (200-500ms)</li>
                      <li>• Ensure tooltips don't interfere with interactions</li>
                      <li>• Test on mobile devices for touch interactions</li>
                      <li>• Consider keyboard navigation and screen readers</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium">Performance</h5>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>• Use disabled prop to conditionally show tooltips</li>
                      <li>• Avoid complex computations in tooltip content</li>
                      <li>• Lazy load heavy content or images</li>
                      <li>• Limit tooltip nesting and complexity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}