import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  CRMAlert,
  ContactAlert,
  OpportunityAlert,
  SystemAlert,
  AlertContainer,
  useCRMAlerts,
  type CRMAlertProps
} from '../CRMAlerts'
import {
  crmToast,
  entityToasts,
  systemToasts,
  bulkToasts,
  useCRMToasts,
  createProgressToast
} from '../../toasts/CRMToasts'
import {
  Bell,
  Settings,
  Users,
  TrendingUp,
  Package,
  Building,
  Phone,
  Mail,
  Calendar,
  Download,
  Upload,
  Database,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

export function CRMNotificationExample() {
  const { alerts, addAlert, clearAlerts } = useCRMAlerts()
  const { toast: crmToastFns, entity, system, bulk, showProgressToast } = useCRMToasts()
  const [selectedTab, setSelectedTab] = useState('alerts')

  // Sample alert data
  const sampleAlerts: Array<Omit<CRMAlertProps, 'dismissible' | 'onDismiss'>> = [
    {
      title: "High-Priority Follow-up",
      description: "John Smith from Acme Corp requires immediate attention for the $50K opportunity.",
      variant: "warning",
      priority: "high",
      badge: { text: "Follow-up", variant: "destructive" }
    },
    {
      title: "Birthday Reminder",
      description: "Sarah Johnson celebrates her birthday today. Consider sending a personalized message.",
      variant: "opportunity",
      priority: "low",
      badge: { text: "Birthday", variant: "secondary" }
    },
    {
      title: "Deal Closing Soon",
      description: "Tech Solutions opportunity worth $75,000 is set to close within 3 days.",
      variant: "pending",
      priority: "medium",
      badge: { text: "Closing Soon", variant: "outline" }
    }
  ]

  // Toast Examples
  const showBasicToasts = () => {
    crmToastFns.success({
      title: "Success!",
      description: "Operation completed successfully"
    })

    setTimeout(() => {
      crmToastFns.warning({
        title: "Warning",
        description: "Please review this action"
      })
    }, 1000)

    setTimeout(() => {
      crmToastFns.error({
        title: "Error Occurred",
        description: "Something went wrong"
      })
    }, 2000)

    setTimeout(() => {
      crmToastFns.info({
        title: "Information",
        description: "Here's some helpful information"
      })
    }, 3000)
  }

  const showEntityToasts = () => {
    // Contact toasts
    entity.contact.created("John Doe", () => {})
    
    setTimeout(() => {
      entity.contact.called("Jane Smith", "15 minutes")
    }, 1500)

    setTimeout(() => {
      entity.opportunity.won("Tech Upgrade Project", 125000)
    }, 3000)

    setTimeout(() => {
      entity.organization.updated("Acme Corporation")
    }, 4500)
  }

  const showSystemToasts = () => {
    system.dataImport.started("contacts", 150)
    
    let processed = 0
    const total = 150
    const interval = setInterval(() => {
      processed += 15
      system.dataImport.progress(processed, total)
      
      if (processed >= total) {
        clearInterval(interval)
        setTimeout(() => {
          system.dataImport.completed("contacts", 145, 5)
        }, 500)
      }
    }, 1000)
  }

  const showProgressExample = () => {
    const progressToast = showProgressToast(
      "Data Export",
      "Exporting organization data"
    )

    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      progressToast.updateProgress(progress)
      
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          progressToast.complete("1,250 organizations exported successfully")
        }, 500)
      }
    }, 300)
  }

  const showBulkActions = () => {
    bulk.bulkUpdate(25, "contacts")
    
    setTimeout(() => {
      bulk.bulkDelete(12, "organizations", () => {
        toast.success("Undo successful - organizations restored")
      })
    }, 2000)

    setTimeout(() => {
      bulk.bulkExport(150, "opportunities", () => {
        toast.info("Download started")
      })
    }, 4000)
  }

  const showPromiseToast = () => {
    // Simulate API call
    const apiCall = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.3 ? resolve("Data saved successfully") : reject("Network error")
      }, 3000)
    })

    crmToastFns.promise(apiCall, {
      loading: {
        title: "Saving Changes",
        description: "Updating contact information..."
      },
      success: (data) => ({
        title: "Changes Saved",
        description: data as string,
        icon: Save
      }),
      error: (error) => ({
        title: "Save Failed",
        description: error as string,
        icon: XCircle
      })
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">CRM Notification System</h2>
        <p className="text-muted-foreground">
          Comprehensive alert and toast notification system for CRM workflows
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Bell className="size-4" />
            <Badge variant="default">Alerts</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Persistent notifications for important events
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="size-4" />
            <Badge variant="secondary">Toasts</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Temporary feedback for user actions
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="size-4" />
            <Badge variant="outline">Progress</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Real-time progress tracking for long operations
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Settings className="size-4" />
            <Badge variant="destructive">System</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            System status and maintenance notifications
          </p>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="toasts">Toasts</TabsTrigger>
          <TabsTrigger value="entity">Entity Actions</TabsTrigger>
          <TabsTrigger value="system">System Events</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Alert Examples */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-5" />
                  Alert Examples
                </CardTitle>
                <CardDescription>
                  Test different types of CRM alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {sampleAlerts.map((alert, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addAlert(alert)}
                      className="text-xs h-8"
                    >
                      Add {alert.variant} Alert
                    </Button>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Specialized Alerts</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAlert({
                        title: "Contact Follow-up",
                        description: "John Smith requires follow-up call",
                        variant: "pending"
                      })}
                    >
                      <Users className="size-3 mr-1" />
                      Contact Alert
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAlert({
                        title: "Opportunity Update",
                        description: "Deal moved to negotiation stage",
                        variant: "opportunity"
                      })}
                    >
                      <TrendingUp className="size-3 mr-1" />
                      Opportunity Alert
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAlert({
                        title: "System Maintenance",
                        description: "Scheduled maintenance tonight at 2 AM",
                        variant: "system"
                      })}
                    >
                      <Database className="size-3 mr-1" />
                      System Alert
                    </Button>
                  </div>
                </div>

                <Separator />

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAlerts}
                  className="w-full"
                  disabled={alerts.length === 0}
                >
                  <Trash2 className="size-3 mr-1" />
                  Clear All Alerts
                </Button>
              </CardContent>
            </Card>

            {/* Alert Display */}
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts ({alerts.length})</CardTitle>
                <CardDescription>
                  Currently displayed alerts in your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertContainer
                  alerts={alerts}
                  maxAlerts={5}
                  onDismissAll={clearAlerts}
                />
                
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="size-8 mx-auto mb-2 opacity-50" />
                    <p>No active alerts</p>
                    <p className="text-xs">Click the buttons to generate sample alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Toast Examples */}
        <TabsContent value="toasts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Toasts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showBasicToasts}
                  className="w-full"
                >
                  Show Basic Examples
                </Button>
                <p className="text-xs text-muted-foreground">
                  Success, Warning, Error, and Info toasts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Promise Toasts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showPromiseToast}
                  className="w-full"
                >
                  Simulate API Call
                </Button>
                <p className="text-xs text-muted-foreground">
                  Loading → Success/Error pattern
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showProgressExample}
                  className="w-full"
                >
                  Start Progress Demo
                </Button>
                <p className="text-xs text-muted-foreground">
                  Real-time progress updates
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Entity Action Toasts */}
        <TabsContent value="entity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Entity Actions</CardTitle>
                <CardDescription>
                  Toast notifications for CRUD operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={showEntityToasts}
                  className="w-full"
                >
                  <Users className="size-4 mr-2" />
                  Show Entity Examples
                </Button>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Individual Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => entity.contact.created("Alice Johnson")}
                    >
                      <Users className="size-3 mr-1" />
                      Contact Created
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => entity.organization.updated("TechCorp Inc")}
                    >
                      <Building className="size-3 mr-1" />
                      Org Updated
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => entity.product.created("Premium Service")}
                    >
                      <Package className="size-3 mr-1" />
                      Product Added
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => entity.opportunity.stageChanged("Big Deal", "Proposal")}
                    >
                      <TrendingUp className="size-3 mr-1" />
                      Stage Changed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Actions</CardTitle>
                <CardDescription>
                  Toasts for interaction tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => entity.contact.called("Mike Wilson", "22 minutes")}
                  >
                    <Phone className="size-3 mr-2" />
                    Log Phone Call
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => entity.contact.emailed("Sarah Davis")}
                  >
                    <Mail className="size-3 mr-2" />
                    Email Sent
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => entity.contact.meetingScheduled("Tom Brown", "Tomorrow 2 PM")}
                  >
                    <Calendar className="size-3 mr-2" />
                    Meeting Scheduled
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Events */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Operations</CardTitle>
                <CardDescription>
                  Import, export, and sync notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={showSystemToasts}
                  className="w-full"
                >
                  <Upload className="size-4 mr-2" />
                  Simulate Data Import
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => system.dataExport.completed("contacts", 500, () => toast.info("Download started"))}
                  >
                    <Download className="size-3 mr-1" />
                    Export Ready
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => system.sync.completed(150)}
                  >
                    <Database className="size-3 mr-1" />
                    Sync Complete
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
                <CardDescription>
                  Mass operation notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={showBulkActions}
                  className="w-full"
                >
                  Show Bulk Examples
                </Button>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• Bulk update notifications</p>
                  <p>• Mass delete with undo</p>
                  <p>• Export confirmations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Features */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialized Alerts</CardTitle>
                <CardDescription>
                  Business-context specific notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContactAlert
                  contactName="Jennifer Adams"
                  alertType="birthday"
                  message="Send a personalized birthday message to maintain relationship"
                  action={{ label: "Send Message", onClick: () => toast.success("Birthday message sent!") }}
                />

                <OpportunityAlert
                  opportunityName="Enterprise Software Deal"
                  alertType="closing_soon"
                  value={250000}
                  message="Final proposal presentation scheduled for Friday"
                  action={{ label: "Review Proposal", onClick: () => toast.info("Opening proposal...") }}
                />

                <SystemAlert
                  alertType="security"
                  message="Unusual login activity detected from new location"
                  severity="high"
                  action={{ label: "Review Activity", onClick: () => toast.info("Opening security log...") }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Examples</CardTitle>
                <CardDescription>
                  Real-world usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Common Patterns</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Form submission feedback</li>
                    <li>• Data import/export progress</li>
                    <li>• Real-time collaboration updates</li>
                    <li>• System maintenance notices</li>
                    <li>• Performance monitoring alerts</li>
                    <li>• Task deadline reminders</li>
                    <li>• Revenue milestone celebrations</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use alerts for persistent information</li>
                    <li>• Use toasts for temporary feedback</li>
                    <li>• Include actionable buttons when relevant</li>
                    <li>• Provide undo options for destructive actions</li>
                    <li>• Show progress for long-running operations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>
            How to use the CRM notification system in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Basic Usage</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`import { crmToast, entityToasts } from '@/components/toasts/CRMToasts'
import { CRMAlert, useCRMAlerts } from '@/components/alerts/CRMAlerts'

// Show success toast
crmToast.success({
  title: 'Contact Created',
  description: 'John Doe added successfully'
})

// Entity-specific toasts
entityToasts.contact.created('Jane Smith', () => navigate('/contacts/123'))

// Alerts
const { alerts, addAlert } = useCRMAlerts()
addAlert({
  title: 'Follow-up Required',
  description: 'Contact Mike Johnson about proposal',
  variant: 'warning'
})`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Progress Tracking</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`import { createProgressToast } from '@/components/toasts/CRMToasts'

const progressToast = createProgressToast(
  'Data Export',
  'Exporting customer data'
)

// Update progress
progressToast.updateProgress(45)

// Complete
progressToast.complete('Export finished successfully')`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Specialized Components</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<ContactAlert
  contactName="John Smith"
  alertType="birthday"
  message="Birthday reminder"
  action={{ label: 'Send Message', onClick: handleSendMessage }}
/>

<OpportunityAlert
  opportunityName="Big Deal"
  alertType="won"
  value={100000}
  message="Congratulations on closing this deal!"
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}