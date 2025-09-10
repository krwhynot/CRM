import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  CRMModal,
  ConfirmationModal,
  WizardModal,
  EntityFormModal,
  BulkActionsModal,
  type WizardStep
} from '../CRMModals'
import {
  CRMSheet,
  EntityDetailSheet,
  FilterSheet,
  QuickActionsSheet,
  type FilterOption
} from '../../sheets/CRMSheets'
import {
  Users,
  Building,
  Package,
  TrendingUp,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  FileText,
  Download,
  Upload,
  Trash2,
  Save,
  Edit,
  Eye,
  Star,
  Clock,
  MapPin,
  Globe,
  Filter,
  Search,
  Plus,
  Settings,
  MoreHorizontal,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  DollarSign,
  Tag,
  Zap,
  Copy,
  Share,
  Archive
} from 'lucide-react'

export function CRMModalSheetExample() {
  // Modal states
  const [basicModalOpen, setBasicModalOpen] = useState(false)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [wizardModalOpen, setWizardModalOpen] = useState(false)
  const [entityFormModalOpen, setEntityFormModalOpen] = useState(false)
  const [bulkActionsModalOpen, setBulkActionsModalOpen] = useState(false)

  // Sheet states
  const [basicSheetOpen, setBasicSheetOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [quickActionsSheetOpen, setQuickActionsSheetOpen] = useState(false)

  // Sample data
  const sampleContact = {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    position: 'VP of Sales',
    status: 'Active',
    priority: 'high',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    description: 'Key decision maker for enterprise deals. Prefers email communication and has shown strong interest in our premium offerings.',
    tags: ['Enterprise', 'Decision Maker', 'Hot Lead'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    createdBy: 'Sarah Johnson'
  }

  const sampleActivities = [
    {
      id: '1',
      type: 'call',
      title: 'Follow-up call completed',
      description: 'Discussed Q4 budget and implementation timeline',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face' }
    },
    {
      id: '2',
      type: 'email',
      title: 'Proposal sent',
      description: 'Sent enterprise package proposal with custom pricing',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      user: { name: 'Mike Wilson' }
    }
  ]

  const selectedItems = [
    { id: '1', name: 'John Smith', type: 'Contact' },
    { id: '2', name: 'Jane Doe', type: 'Contact' },
    { id: '3', name: 'Bob Johnson', type: 'Contact' }
  ]

  const bulkActions = [
    {
      id: 'update_status',
      label: 'Update Status',
      icon: CheckCircle,
      description: 'Change the status of selected contacts',
      onExecute: async (items: any[]) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success(`Updated status for ${items.length} contacts`)
      }
    },
    {
      id: 'add_tags',
      label: 'Add Tags',
      icon: Tag,
      description: 'Add tags to selected contacts',
      onExecute: async (items: any[]) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success(`Added tags to ${items.length} contacts`)
      }
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Download,
      description: 'Export selected contacts to CSV',
      onExecute: async (items: any[]) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success(`Exported ${items.length} contacts`)
      }
    },
    {
      id: 'delete',
      label: 'Delete Contacts',
      icon: Trash2,
      variant: 'destructive' as const,
      description: 'Permanently delete selected contacts',
      confirmationRequired: true,
      onExecute: async (items: any[]) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success(`Deleted ${items.length} contacts`)
      }
    }
  ]

  const wizardSteps: WizardStep[] = [
    {
      id: 'basic_info',
      title: 'Basic Information',
      description: 'Enter the contact\'s basic details',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" placeholder="John" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" placeholder="Smith" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" placeholder="john@company.com" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
          </div>
        </div>
      ),
      validation: () => {
        // Basic validation logic would go here
        return true
      }
    },
    {
      id: 'company_info',
      title: 'Company Information',
      description: 'Add company and professional details',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" placeholder="Acme Corporation" />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input id="position" placeholder="VP of Sales" />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      optional: true
    },
    {
      id: 'additional_details',
      title: 'Additional Details',
      description: 'Optional information and preferences',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Additional information about this contact..." 
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" placeholder="Enterprise, Decision Maker, Hot Lead" />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      optional: true
    }
  ]

  const entityFormFields = [
    { id: 'name', label: 'Full Name', type: 'text' as const, required: true, placeholder: 'John Smith' },
    { id: 'email', label: 'Email', type: 'email' as const, required: true, placeholder: 'john@company.com' },
    { id: 'phone', label: 'Phone', type: 'phone' as const, placeholder: '+1 (555) 123-4567' },
    { id: 'company', label: 'Company', type: 'text' as const, placeholder: 'Acme Corporation' },
    { id: 'position', label: 'Position', type: 'text' as const, placeholder: 'VP of Sales' },
    { 
      id: 'status', 
      label: 'Status', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'prospect', label: 'Prospect' }
      ]
    },
    { id: 'notes', label: 'Notes', type: 'textarea' as const, placeholder: 'Additional information...' }
  ]

  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'prospect', label: 'Prospect' }
      ]
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ]
    },
    {
      id: 'company',
      label: 'Company',
      type: 'text'
    },
    {
      id: 'tags',
      label: 'Tags',
      type: 'text'
    }
  ]

  const quickActions = [
    {
      id: 'new_contact',
      label: 'New Contact',
      description: 'Add a new contact',
      icon: Users,
      shortcut: 'Ctrl+N',
      onClick: () => toast.success('Creating new contact...')
    },
    {
      id: 'new_deal',
      label: 'New Deal',
      description: 'Create a new opportunity',
      icon: Target,
      shortcut: 'Ctrl+D',
      onClick: () => toast.success('Creating new deal...')
    },
    {
      id: 'schedule_call',
      label: 'Schedule Call',
      description: 'Book a meeting or call',
      icon: Phone,
      shortcut: 'Ctrl+S',
      onClick: () => toast.success('Opening calendar...')
    },
    {
      id: 'send_email',
      label: 'Send Email',
      description: 'Compose and send email',
      icon: Mail,
      onClick: () => toast.success('Opening email composer...')
    },
    {
      id: 'import_data',
      label: 'Import Data',
      description: 'Import contacts from file',
      icon: Upload,
      onClick: () => toast.success('Opening import dialog...')
    },
    {
      id: 'export_data',
      label: 'Export Data',
      description: 'Export data to file',
      icon: Download,
      onClick: () => toast.success('Preparing export...')
    },
    {
      id: 'share_link',
      label: 'Share Link',
      description: 'Generate shareable link',
      icon: Share,
      onClick: () => toast.success('Link copied to clipboard')
    },
    {
      id: 'archive_items',
      label: 'Archive Items',
      description: 'Archive selected items',
      icon: Archive,
      variant: 'secondary' as const,
      onClick: () => toast.success('Items archived')
    }
  ]

  const handleWizardComplete = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Contact created successfully!')
  }

  const handleEntitySave = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Contact saved successfully!')
  }

  const handleFiltersApply = (filters: Record<string, any>) => {
    toast.success(`Applied ${Object.keys(filters).length} filters`)
  }

  const handleFiltersReset = () => {
    toast.success('Filters cleared')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Modal & Sheet Patterns</h2>
        <p className="text-muted-foreground">
          Comprehensive overlay patterns for forms, details, confirmations, and workflows
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Modals</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Centered overlays for forms, confirmations, and workflows
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Sheets</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Side panels for details, filters, and quick actions
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Responsive</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Mobile-friendly with adaptive layouts and interactions
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">CRM-Focused</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Pre-built patterns for common CRM workflows
          </p>
        </Card>
      </div>

      {/* Interactive Demos */}
      <Tabs defaultValue="modals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="modals">Modal Patterns</TabsTrigger>
          <TabsTrigger value="sheets">Sheet Patterns</TabsTrigger>
        </TabsList>

        {/* Modal Examples */}
        <TabsContent value="modals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Modal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Modal</CardTitle>
                <CardDescription>
                  Simple modal with custom content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setBasicModalOpen(true)}>
                  Open Basic Modal
                </Button>
              </CardContent>
            </Card>

            {/* Confirmation Modal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confirmation Modal</CardTitle>
                <CardDescription>
                  Destructive action confirmation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={() => setConfirmationModalOpen(true)}
                >
                  Delete Items
                </Button>
              </CardContent>
            </Card>

            {/* Wizard Modal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Wizard Modal</CardTitle>
                <CardDescription>
                  Multi-step form with progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setWizardModalOpen(true)}>
                  <Plus className="size-4 mr-1" />
                  New Contact Wizard
                </Button>
              </CardContent>
            </Card>

            {/* Entity Form Modal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Entity Form</CardTitle>
                <CardDescription>
                  CRM entity creation form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setEntityFormModalOpen(true)}>
                  <Users className="size-4 mr-1" />
                  Create Contact
                </Button>
              </CardContent>
            </Card>

            {/* Bulk Actions Modal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bulk Actions</CardTitle>
                <CardDescription>
                  Multiple item actions with confirmation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline"
                  onClick={() => setBulkActionsModalOpen(true)}
                >
                  <MoreHorizontal className="size-4 mr-1" />
                  Bulk Actions ({selectedItems.length})
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sheet Examples */}
        <TabsContent value="sheets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Basic Sheet */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Sheet</CardTitle>
                <CardDescription>
                  Simple side panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setBasicSheetOpen(true)}>
                  Open Side Panel
                </Button>
              </CardContent>
            </Card>

            {/* Detail Sheet */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Entity Details</CardTitle>
                <CardDescription>
                  Comprehensive record view
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setDetailSheetOpen(true)}>
                  <Eye className="size-4 mr-1" />
                  View Contact
                </Button>
              </CardContent>
            </Card>

            {/* Filter Sheet */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
                <CardDescription>
                  Advanced filtering interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setFilterSheetOpen(true)}>
                  <Filter className="size-4 mr-1" />
                  Open Filters
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions Sheet */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription>
                  Searchable action menu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setQuickActionsSheetOpen(true)}>
                  <Zap className="size-4 mr-1" />
                  Quick Actions
                </Button>
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
            Code samples for common modal and sheet patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="modal-basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="modal-basic">Modal Usage</TabsTrigger>
              <TabsTrigger value="sheet-basic">Sheet Usage</TabsTrigger>
            </TabsList>

            <TabsContent value="modal-basic">
              <div className="space-y-4">
                <h4 className="font-medium">Entity Form Modal</h4>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`import { EntityFormModal } from '@/components/modals/CRMModals'

const [modalOpen, setModalOpen] = useState(false)

const fields = [
  { id: 'name', label: 'Full Name', type: 'text', required: true },
  { id: 'email', label: 'Email', type: 'email', required: true },
  { id: 'company', label: 'Company', type: 'text' }
]

<EntityFormModal
  open={modalOpen}
  onOpenChange={setModalOpen}
  entityType="contact"
  mode="create"
  fields={fields}
  onSave={async (data) => {
    await createContact(data)
    toast.success('Contact created!')
  }}
/>`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="sheet-basic">
              <div className="space-y-4">
                <h4 className="font-medium">Entity Detail Sheet</h4>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
{`import { EntityDetailSheet } from '@/components/sheets/CRMSheets'

const [sheetOpen, setSheetOpen] = useState(false)

<EntityDetailSheet
  open={sheetOpen}
  onOpenChange={setSheetOpen}
  entityType="contact"
  entityId="123"
  data={contactData}
  activities={activityHistory}
  onEdit={() => openEditModal()}
  onDelete={() => handleDelete()}
/>`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal Instances */}
      <CRMModal
        open={basicModalOpen}
        onOpenChange={setBasicModalOpen}
        title="Custom Modal"
        description="This is a custom modal with your own content"
        actions={
          <>
            <Button variant="outline" onClick={() => setBasicModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setBasicModalOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            You can put any content here - forms, tables, charts, or any other React components.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="example">Example Field</Label>
              <Input id="example" placeholder="Enter some text..." />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Add a description..." rows={3} />
            </div>
          </div>
        </div>
      </CRMModal>

      <ConfirmationModal
        open={confirmationModalOpen}
        onOpenChange={setConfirmationModalOpen}
        title="Delete Selected Items"
        description="Are you sure you want to delete 3 selected items? This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        icon={Trash2}
        onConfirm={async () => {
          await new Promise(resolve => setTimeout(resolve, 1000))
          toast.success('Items deleted successfully')
        }}
      />

      <WizardModal
        open={wizardModalOpen}
        onOpenChange={setWizardModalOpen}
        title="Create New Contact"
        description="Add a new contact to your CRM system"
        steps={wizardSteps}
        onComplete={handleWizardComplete}
        showProgress={true}
        allowSkipOptional={true}
      />

      <EntityFormModal
        open={entityFormModalOpen}
        onOpenChange={setEntityFormModalOpen}
        entityType="contact"
        mode="create"
        fields={entityFormFields}
        onSave={handleEntitySave}
      />

      <BulkActionsModal
        open={bulkActionsModalOpen}
        onOpenChange={setBulkActionsModalOpen}
        selectedItems={selectedItems}
        actions={bulkActions}
      />

      {/* Sheet Instances */}
      <CRMSheet
        open={basicSheetOpen}
        onOpenChange={setBasicSheetOpen}
        title="Custom Sheet"
        subtitle="Your custom side panel content"
        actions={
          <Button onClick={() => setBasicSheetOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is a custom sheet where you can display any content you need.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sheetExample">Example Input</Label>
              <Input id="sheetExample" placeholder="Type something..." />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Star className="size-4 mr-1" />
                Mark Favorite
              </Button>
              <Button size="sm" variant="outline">
                <Share className="size-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CRMSheet>

      <EntityDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        entityType="contact"
        entityId="1"
        data={sampleContact}
        activities={sampleActivities}
        onEdit={() => {
          setDetailSheetOpen(false)
          toast.info('Opening edit form...')
        }}
        onDelete={() => {
          setDetailSheetOpen(false)
          toast.success('Contact deleted')
        }}
      />

      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        title="Contact Filters"
        filters={filterOptions}
        onApply={handleFiltersApply}
        onReset={handleFiltersReset}
      />

      <QuickActionsSheet
        open={quickActionsSheetOpen}
        onOpenChange={setQuickActionsSheetOpen}
        title="Quick Actions"
        actions={quickActions}
        searchable={true}
      />
    </div>
  )
}