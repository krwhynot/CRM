import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  StatusBadge,
  PriorityBadge,
  OrganizationTypeBadge,
  OpportunityStageBadge,
  InteractionTypeBadge,
  HealthBadge,
  EngagementBadge,
  TrendBadge,
  CustomBadge,
  BadgeGroup
} from '../CRMBadges'
import { 
  Star, 
  Zap, 
  TrendingUp, 
  Heart,
  Users,
  Calendar,
  Phone,
  Target 
} from 'lucide-react'

export function CRMBadgesExample() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">CRM Badge System</h2>
        <p className="text-muted-foreground">
          Comprehensive badge components for all CRM status types with consistent styling and behavior.
        </p>
      </div>

      {/* Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Status Badges</CardTitle>
          <CardDescription>
            General status indicators for records, accounts, and activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Default Size</h4>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="active" />
              <StatusBadge status="inactive" />
              <StatusBadge status="pending" />
              <StatusBadge status="archived" />
              <StatusBadge status="draft" />
              <StatusBadge status="expired" />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Size Variations</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-16">Small:</span>
                <StatusBadge status="active" size="sm" />
                <StatusBadge status="pending" size="sm" />
                <StatusBadge status="archived" size="sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-16">Medium:</span>
                <StatusBadge status="active" size="md" />
                <StatusBadge status="pending" size="md" />
                <StatusBadge status="archived" size="md" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-16">Large:</span>
                <StatusBadge status="active" size="lg" />
                <StatusBadge status="pending" size="lg" />
                <StatusBadge status="archived" size="lg" />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Without Icons</h4>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="active" showIcon={false} />
              <StatusBadge status="pending" showIcon={false} />
              <StatusBadge status="archived" showIcon={false} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Badges</CardTitle>
          <CardDescription>
            Customer and account priority levels with clear visual hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Priority Levels</h4>
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority="a-plus" />
              <PriorityBadge priority="a" />
              <PriorityBadge priority="b" />
              <PriorityBadge priority="c" />
              <PriorityBadge priority="d" />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Custom Labels</h4>
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority="a-plus" label="VIP" />
              <PriorityBadge priority="a" label="Key Account" />
              <PriorityBadge priority="b" label="Standard" />
              <PriorityBadge priority="c" label="Low Value" />
              <PriorityBadge priority="d" label="Inactive" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Type Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Types</CardTitle>
          <CardDescription>
            Different organization categories in the CRM system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <OrganizationTypeBadge type="customer" />
              <p className="text-xs text-muted-foreground">Companies that buy from us</p>
            </div>
            <div className="text-center space-y-2">
              <OrganizationTypeBadge type="distributor" />
              <p className="text-xs text-muted-foreground">Distribution partners</p>
            </div>
            <div className="text-center space-y-2">
              <OrganizationTypeBadge type="principal" />
              <p className="text-xs text-muted-foreground">Principal partners</p>
            </div>
            <div className="text-center space-y-2">
              <OrganizationTypeBadge type="supplier" />
              <p className="text-xs text-muted-foreground">Product suppliers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Stage Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Stages</CardTitle>
          <CardDescription>
            Sales pipeline stages with progress indication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Pipeline Stages</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <OpportunityStageBadge stage="prospecting" />
              <OpportunityStageBadge stage="qualification" />
              <OpportunityStageBadge stage="needs-analysis" />
              <OpportunityStageBadge stage="proposal" />
              <OpportunityStageBadge stage="negotiation" />
              <OpportunityStageBadge stage="closed-won" />
              <OpportunityStageBadge stage="closed-lost" />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Different Sizes</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <OpportunityStageBadge stage="closed-won" size="sm" />
                <OpportunityStageBadge stage="closed-won" size="md" />
                <OpportunityStageBadge stage="closed-won" size="lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Type Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction Types</CardTitle>
          <CardDescription>
            Different types of customer interactions and touchpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <InteractionTypeBadge type="call" />
            <InteractionTypeBadge type="email" />
            <InteractionTypeBadge type="meeting" />
            <InteractionTypeBadge type="demo" />
            <InteractionTypeBadge type="proposal" />
            <InteractionTypeBadge type="contract" />
            <InteractionTypeBadge type="support" />
            <InteractionTypeBadge type="follow-up" />
            <InteractionTypeBadge type="other" />
          </div>
        </CardContent>
      </Card>

      {/* Health and Engagement Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Health</CardTitle>
            <CardDescription>
              Overall health indicators for customer accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <HealthBadge health="excellent" />
              <HealthBadge health="good" />
              <HealthBadge health="fair" />
              <HealthBadge health="poor" />
              <HealthBadge health="critical" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Levels</CardTitle>
            <CardDescription>
              Customer engagement and activity levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <EngagementBadge engagement="high" />
              <EngagementBadge engagement="medium" />
              <EngagementBadge engagement="low" />
              <EngagementBadge engagement="none" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Indicators</CardTitle>
          <CardDescription>
            Performance trends and directional indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Basic Trends</h4>
            <div className="flex flex-wrap gap-2">
              <TrendBadge trend="up" />
              <TrendBadge trend="down" />
              <TrendBadge trend="stable" />
              <TrendBadge trend="volatile" />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">With Values</h4>
            <div className="flex flex-wrap gap-2">
              <TrendBadge trend="up" value="+15%" />
              <TrendBadge trend="down" value="-8%" />
              <TrendBadge trend="stable" value="±2%" />
              <TrendBadge trend="volatile" value="±25%" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Badges</CardTitle>
          <CardDescription>
            Flexible badge component for custom use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Color Variations</h4>
            <div className="flex flex-wrap gap-2">
              <CustomBadge label="Featured" color="blue" icon={Star} />
              <CustomBadge label="Hot Lead" color="red" icon={Zap} />
              <CustomBadge label="Growing" color="green" icon={TrendingUp} />
              <CustomBadge label="Favorite" color="pink" icon={Heart} />
              <CustomBadge label="Team" color="purple" icon={Users} />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Different Styles</h4>
            <div className="flex flex-wrap gap-2">
              <CustomBadge label="Default" variant="default" color="blue" />
              <CustomBadge label="Secondary" variant="secondary" color="gray" />
              <CustomBadge label="Destructive" variant="destructive" />
              <CustomBadge label="Outline" variant="outline" color="green" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Groups</CardTitle>
          <CardDescription>
            Organized collections of related badges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Account Overview</h4>
            <BadgeGroup
              badges={[
                <StatusBadge key="status" status="active" />,
                <PriorityBadge key="priority" priority="a-plus" />,
                <OrganizationTypeBadge key="type" type="customer" />,
                <HealthBadge key="health" health="excellent" />
              ]}
            />
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Opportunity Details</h4>
            <BadgeGroup
              badges={[
                <OpportunityStageBadge key="stage" stage="negotiation" />,
                <TrendBadge key="trend" trend="up" value="+12%" />,
                <CustomBadge key="custom" label="Hot" color="red" icon={Zap} />
              ]}
            />
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Recent Activity</h4>
            <BadgeGroup
              spacing="sm"
              badges={[
                <InteractionTypeBadge key="call" type="call" size="sm" />,
                <InteractionTypeBadge key="email" type="email" size="sm" />,
                <InteractionTypeBadge key="meeting" type="meeting" size="sm" />,
                <Badge key="count" variant="outline" className="text-xs">
                  +3 more
                </Badge>
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Real-world Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Real-world Usage Examples</CardTitle>
          <CardDescription>
            How badges would appear in actual CRM interfaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Card Example */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Sarah Johnson</h4>
                <p className="text-sm text-muted-foreground">VP of Operations • Metro Restaurant Group</p>
              </div>
              <BadgeGroup
                badges={[
                  <StatusBadge key="status" status="active" size="sm" />,
                  <PriorityBadge key="priority" priority="a-plus" size="sm" />
                ]}
                spacing="sm"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <BadgeGroup
                badges={[
                  <InteractionTypeBadge key="last" type="call" size="sm" />,
                  <span key="date" className="text-muted-foreground">2 days ago</span>
                ]}
                spacing="sm"
              />
              <BadgeGroup
                badges={[
                  <EngagementBadge key="engagement" engagement="high" size="sm" />,
                  <TrendBadge key="trend" trend="up" value="+5%" size="sm" />
                ]}
                spacing="sm"
              />
            </div>
          </div>

          <Separator />

          {/* Organization Card Example */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Metro Restaurant Group</h4>
                <p className="text-sm text-muted-foreground">Chicago, IL • 150 employees</p>
              </div>
              <BadgeGroup
                badges={[
                  <OrganizationTypeBadge key="type" type="customer" size="sm" />,
                  <HealthBadge key="health" health="excellent" size="sm" />
                ]}
                spacing="sm"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last contact: 2 days ago</span>
              <BadgeGroup
                badges={[
                  <PriorityBadge key="priority" priority="a-plus" size="sm" />,
                  <CustomBadge key="revenue" label="$2.5M" color="green" size="sm" />
                ]}
                spacing="sm"
              />
            </div>
          </div>

          <Separator />

          {/* Opportunity Card Example */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Q2 Catering Contract</h4>
                <p className="text-sm text-muted-foreground">Metro Restaurant Group • $250,000</p>
              </div>
              <BadgeGroup
                badges={[
                  <OpportunityStageBadge key="stage" stage="negotiation" size="sm" />,
                  <CustomBadge key="probability" label="85%" color="green" size="sm" />
                ]}
                spacing="sm"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expected close: March 15, 2024</span>
              <BadgeGroup
                badges={[
                  <TrendBadge key="trend" trend="up" value="+10%" size="sm" />,
                  <CustomBadge key="hot" label="Hot" color="red" icon={Zap} size="sm" />
                ]}
                spacing="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>
            Code examples for using the badge components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic Usage</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<StatusBadge status="active" />
<PriorityBadge priority="a-plus" />
<OrganizationTypeBadge type="customer" />`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">With Custom Props</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<StatusBadge 
  status="active" 
  size="lg" 
  showIcon={false}
  label="Online"
/>
<TrendBadge 
  trend="up" 
  value="+15%" 
  size="sm"
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Badge Groups</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<BadgeGroup
  spacing="sm"
  badges={[
    <StatusBadge status="active" />,
    <PriorityBadge priority="a" />,
    <HealthBadge health="excellent" />
  ]}
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}