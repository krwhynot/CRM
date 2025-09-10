import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  EnhancedProgress,
  PipelineProgress,
  DealProgress,
  PerformanceProgress,
  ProcessProgress,
  CircularProgress,
  ProgressComparison,
  type PipelineStage,
  type PerformanceMetric,
  type ProcessStep
} from '../CRMProgress'
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  Handshake,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from 'lucide-react'

export function CRMProgressExample() {
  const [selectedDeal, setSelectedDeal] = useState(0)

  // Sample pipeline data
  const pipelineStages: PipelineStage[] = [
    {
      id: 'prospecting',
      name: 'Prospecting',
      description: 'Initial outreach and lead qualification',
      value: 125000,
      target: 150000,
      icon: Target
    },
    {
      id: 'qualification',
      name: 'Qualification',
      description: 'Qualifying leads and assessing fit',
      value: 85000,
      target: 100000,
      icon: Users
    },
    {
      id: 'proposal',
      name: 'Proposal',
      description: 'Preparing and presenting proposals',
      value: 65000,
      target: 75000,
      icon: FileText
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      description: 'Contract terms and pricing discussions',
      value: 45000,
      target: 50000,
      icon: Handshake
    },
    {
      id: 'closed-won',
      name: 'Closed Won',
      description: 'Successfully closed deals',
      value: 32000,
      target: 40000,
      icon: CheckCircle
    }
  ]

  // Sample deal data
  const sampleDeals = [
    {
      dealName: 'Metro Restaurant Group - Q2 Contract',
      currentStage: 'Negotiation',
      probability: 85,
      value: 250000,
      expectedCloseDate: new Date('2024-03-15'),
      daysRemaining: 12
    },
    {
      dealName: 'Fresh Foods Distribution - Annual Agreement',
      currentStage: 'Proposal',
      probability: 65,
      value: 180000,
      expectedCloseDate: new Date('2024-04-01'),
      daysRemaining: 28
    },
    {
      dealName: 'Organic Valley - Partnership Deal',
      currentStage: 'Qualification',
      probability: 35,
      value: 95000,
      expectedCloseDate: new Date('2024-05-15'),
      daysRemaining: 72
    }
  ]

  // Sample performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'revenue',
      name: 'Monthly Revenue',
      current: 425000,
      target: 500000,
      unit: '',
      color: 'success',
      trend: 'up',
      icon: DollarSign
    },
    {
      id: 'deals',
      name: 'Deals Closed',
      current: 18,
      target: 25,
      unit: '',
      color: 'warning',
      trend: 'stable',
      icon: Target
    },
    {
      id: 'calls',
      name: 'Sales Calls',
      current: 145,
      target: 120,
      unit: '',
      color: 'success',
      trend: 'up',
      icon: Phone
    },
    {
      id: 'meetings',
      name: 'Client Meetings',
      current: 32,
      target: 40,
      unit: '',
      color: 'warning',
      trend: 'down',
      icon: Calendar
    }
  ]

  // Sample process steps
  const processSteps: ProcessStep[] = [
    {
      id: 'contact',
      name: 'Initial Contact',
      description: 'First touchpoint with potential customer',
      status: 'completed'
    },
    {
      id: 'discovery',
      name: 'Discovery Call',
      description: 'Understanding customer needs and requirements',
      status: 'completed'
    },
    {
      id: 'demo',
      name: 'Product Demo',
      description: 'Presenting solution and capabilities',
      status: 'current'
    },
    {
      id: 'proposal',
      name: 'Proposal Preparation',
      description: 'Creating detailed proposal document',
      status: 'pending'
    },
    {
      id: 'negotiation',
      name: 'Contract Negotiation',
      description: 'Finalizing terms and conditions',
      status: 'pending'
    },
    {
      id: 'signature',
      name: 'Contract Signature',
      description: 'Getting final approval and signature',
      status: 'pending',
      optional: false
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">CRM Progress Components</h2>
        <p className="text-muted-foreground">
          Comprehensive progress visualization components for sales pipelines, deal tracking, and performance monitoring.
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <Badge variant="outline">Pipeline Tracking</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Visual sales pipeline with stage-by-stage progress
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-500" />
            <Badge variant="outline">Deal Progress</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Individual opportunity tracking and urgency
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <Badge variant="outline">Performance</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Goal vs actual metrics with trend analysis
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-orange-500" />
            <Badge variant="outline">Process Flow</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Multi-step process tracking with status
          </p>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
          <TabsTrigger value="circular">Circular</TabsTrigger>
        </TabsList>

        {/* Pipeline Progress */}
        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PipelineProgress
              stages={pipelineStages}
              currentStage="negotiation"
              title="Q1 2024 Sales Pipeline"
              totalValue={352000}
              currency="$"
            />
            
            {/* Pipeline Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Summary</CardTitle>
                <CardDescription>
                  Key metrics and conversion rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Pipeline Value</span>
                    <Badge variant="outline" className="font-mono">
                      $352,000
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weighted Pipeline</span>
                    <Badge variant="outline" className="font-mono">
                      $285,600
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Deal Size</span>
                    <Badge variant="outline" className="font-mono">
                      $70,400
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Conversion Rates</h4>
                  <EnhancedProgress
                    value={68}
                    label="Prospecting → Qualification"
                    color="success"
                    showPercentage
                  />
                  <EnhancedProgress
                    value={76}
                    label="Qualification → Proposal"
                    color="success"
                    showPercentage
                  />
                  <EnhancedProgress
                    value={69}
                    label="Proposal → Negotiation"
                    color="warning"
                    showPercentage
                  />
                  <EnhancedProgress
                    value={71}
                    label="Negotiation → Closed Won"
                    color="success"
                    showPercentage
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deal Progress */}
        <TabsContent value="deals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sampleDeals.map((deal, index) => (
              <DealProgress
                key={index}
                dealName={deal.dealName}
                currentStage={deal.currentStage}
                probability={deal.probability}
                value={deal.value}
                expectedCloseDate={deal.expectedCloseDate}
                daysRemaining={deal.daysRemaining}
              />
            ))}
          </div>
          
          {/* Deal Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressComparison
              current={725000}
              previous={680000}
              target={900000}
              label="Monthly Deal Value"
              unit=""
              period="vs last month"
            />
            
            <ProgressComparison
              current={23}
              previous={19}
              target={30}
              label="Deals in Pipeline"
              unit=" deals"
              period="vs last month"
            />
          </div>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceProgress
              metrics={performanceMetrics}
              title="Q1 2024 Performance"
              period="March 2024"
            />
            
            {/* Individual Metrics */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <CircularProgress
                        value={85}
                        size={100}
                        label="Revenue"
                        color="hsl(142, 76%, 36%)"
                      />
                    </div>
                    <div className="text-center">
                      <CircularProgress
                        value={72}
                        size={100}
                        label="Deals"
                        color="hsl(38, 92%, 50%)"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <CircularProgress
                        value={121}
                        max={100}
                        size={100}
                        label="Calls"
                        color="hsl(142, 76%, 36%)"
                      />
                    </div>
                    <div className="text-center">
                      <CircularProgress
                        value={80}
                        size={100}
                        label="Meetings"
                        color="hsl(38, 92%, 50%)"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Process Progress */}
        <TabsContent value="process" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProcessProgress
              steps={processSteps}
              title="Deal Progression Workflow"
              showStepNumbers
            />
            
            {/* Process Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Process Analytics</CardTitle>
                <CardDescription>
                  Average time spent in each stage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Initial Contact</span>
                      <span className="text-sm text-muted-foreground">2.3 days avg</span>
                    </div>
                    <EnhancedProgress
                      value={95}
                      color="success"
                      showLabel={false}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Discovery Call</span>
                      <span className="text-sm text-muted-foreground">5.1 days avg</span>
                    </div>
                    <EnhancedProgress
                      value={88}
                      color="success"
                      showLabel={false}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Product Demo</span>
                      <span className="text-sm text-muted-foreground">3.7 days avg</span>
                    </div>
                    <EnhancedProgress
                      value={65}
                      color="warning"
                      showLabel={false}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Proposal Preparation</span>
                      <span className="text-sm text-muted-foreground">7.2 days avg</span>
                    </div>
                    <EnhancedProgress
                      value={45}
                      color="danger"
                      showLabel={false}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Cycle Time</span>
                    <Badge variant="outline">
                      18.3 days avg
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Progress */}
        <TabsContent value="enhanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Progress Examples</CardTitle>
                <CardDescription>
                  Different styles and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <EnhancedProgress
                    value={75}
                    label="Revenue Goal"
                    color="success"
                    showPercentage
                    size="lg"
                  />
                  
                  <EnhancedProgress
                    value={850}
                    max={1000}
                    label="Monthly Calls"
                    color="info"
                    showValue
                    suffix=" calls"
                    size="md"
                  />
                  
                  <EnhancedProgress
                    value={42}
                    label="Customer Satisfaction"
                    color="warning"
                    showPercentage
                    animated
                    size="sm"
                  />
                  
                  <EnhancedProgress
                    value={95}
                    label="System Uptime"
                    color="success"
                    showPercentage
                    size="md"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Size Variations</CardTitle>
                <CardDescription>
                  Small, medium, and large progress bars
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Small Size</h4>
                    <div className="space-y-2">
                      <EnhancedProgress value={65} size="sm" showLabel={false} />
                      <EnhancedProgress value={80} size="sm" showLabel={false} color="success" />
                      <EnhancedProgress value={45} size="sm" showLabel={false} color="warning" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Medium Size</h4>
                    <div className="space-y-2">
                      <EnhancedProgress value={65} size="md" showLabel={false} />
                      <EnhancedProgress value={80} size="md" showLabel={false} color="success" />
                      <EnhancedProgress value={45} size="md" showLabel={false} color="warning" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Large Size</h4>
                    <div className="space-y-2">
                      <EnhancedProgress value={65} size="lg" showLabel={false} />
                      <EnhancedProgress value={80} size="lg" showLabel={false} color="success" />
                      <EnhancedProgress value={45} size="lg" showLabel={false} color="warning" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Circular Progress */}
        <TabsContent value="circular" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Revenue Target</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CircularProgress
                  value={425000}
                  max={500000}
                  size={150}
                  strokeWidth={12}
                  color="hsl(142, 76%, 36%)"
                  label="$425K / $500K"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Deals Closed</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CircularProgress
                  value={18}
                  max={25}
                  size={150}
                  strokeWidth={12}
                  color="hsl(38, 92%, 50%)"
                  label="18 / 25 deals"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CircularProgress
                  value={92}
                  max={100}
                  size={150}
                  strokeWidth={12}
                  color="hsl(221, 83%, 53%)"
                  label="4.6 / 5.0 rating"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Team Activity</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CircularProgress
                  value={145}
                  max={120}
                  size={150}
                  strokeWidth={12}
                  color="hsl(269, 84%, 61%)"
                  label="121% of target"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Implementation Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Examples</CardTitle>
          <CardDescription>
            Code examples for using the progress components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Enhanced Progress</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<EnhancedProgress
  value={75}
  label="Revenue Goal"
  color="success"
  showPercentage
  size="lg"
/>`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Pipeline Progress</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<PipelineProgress
  stages={pipelineStages}
  currentStage="negotiation"
  title="Q1 2024 Sales Pipeline"
  totalValue={352000}
  currency="$"
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Circular Progress</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<CircularProgress
  value={425000}
  max={500000}
  size={150}
  strokeWidth={12}
  color="hsl(142, 76%, 36%)"
  label="$425K / $500K"
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}