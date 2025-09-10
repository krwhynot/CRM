import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  ContactFormBuilder,
  OrganizationFormBuilder,
  ProductFormBuilder,
  OpportunityFormBuilder,
  InteractionFormBuilder,
  CRMFormBuilder
} from '../CRMFormBuilder'
import {
  contactFormSchema,
  opportunityFormSchema,
  type ContactFormData,
  type OrganizationFormData,
  type ProductFormData,
  type OpportunityFormData,
  type InteractionFormData
} from '../CRMFormSchemas'
import type { FormStep } from '../CRMFormBuilder'

export function CRMFormsExample() {
  const [selectedForm, setSelectedForm] = useState('contact')
  const [formData, setFormData] = useState<any>(null)

  // Multi-step form configuration for Opportunity
  const opportunityFormSteps: FormStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Essential opportunity details',
      fields: ['name', 'organizationId', 'contactId', 'type', 'source']
    },
    {
      id: 'financial',
      title: 'Financial Details',
      description: 'Value and timeline information',
      fields: ['value', 'currency', 'expectedCloseDate', 'probability']
    },
    {
      id: 'process',
      title: 'Sales Process',
      description: 'Stage and assignment details',
      fields: ['stage', 'priority', 'assignedTo']
    },
    {
      id: 'products',
      title: 'Products & Services',
      description: 'Associated products and pricing',
      fields: ['products', 'competitors']
    },
    {
      id: 'additional',
      title: 'Additional Information',
      description: 'Notes, tags, and other details',
      fields: ['description', 'notes', 'tags']
    }
  ]

  // Sample default values
  const defaultContactData: Partial<ContactFormData> = {
    status: 'active',
    priority: 'b',
    preferredContactMethod: 'email',
    marketingOptIn: true,
    tags: ['New Contact']
  }

  const defaultOrganizationData: Partial<OrganizationFormData> = {
    type: 'customer',
    status: 'active',
    priority: 'b',
    sameAsShipping: true,
    tags: ['New Customer']
  }

  const defaultProductData: Partial<ProductFormData> = {
    currency: 'USD',
    unit: 'each',
    status: 'active',
    tags: ['New Product']
  }

  const defaultOpportunityData: Partial<OpportunityFormData> = {
    currency: 'USD',
    stage: 'prospecting',
    probability: 25,
    type: 'new-business',
    priority: 'medium',
    tags: ['New Opportunity']
  }

  const defaultInteractionData: Partial<InteractionFormData> = {
    type: 'call',
    outcome: 'pending',
    direction: 'outbound',
    followUpRequired: false,
    tags: ['Follow-up']
  }

  // Form submission handlers
  const handleContactSubmit = async (data: ContactFormData) => {
    console.log('Contact submitted:', data)
    setFormData(data)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    toast.success('Contact created successfully!')
  }

  const handleOrganizationSubmit = async (data: OrganizationFormData) => {
    console.log('Organization submitted:', data)
    setFormData(data)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Organization created successfully!')
  }

  const handleProductSubmit = async (data: ProductFormData) => {
    console.log('Product submitted:', data)
    setFormData(data)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Product created successfully!')
  }

  const handleOpportunitySubmit = async (data: OpportunityFormData) => {
    console.log('Opportunity submitted:', data)
    setFormData(data)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Opportunity created successfully!')
  }

  const handleInteractionSubmit = async (data: InteractionFormData) => {
    console.log('Interaction submitted:', data)
    setFormData(data)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Interaction logged successfully!')
  }

  // Draft save handlers
  const handleDraftSave = async (data: any) => {
    console.log('Draft saved:', data)
    await new Promise(resolve => setTimeout(resolve, 500))
    // In real app, save to localStorage or API
  }

  // Custom field renderer example
  const renderCustomField = (fieldName: string, control: any) => {
    // Example of custom field rendering
    if (fieldName === 'customField') {
      return (
        <div key={fieldName} className="space-y-2">
          <label className="text-sm font-medium">Custom Field</label>
          <input className="w-full px-3 py-2 border rounded-md" placeholder="Custom input" />
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">CRM Form System Examples</h2>
        <p className="text-muted-foreground">
          Comprehensive form components with validation, multi-step workflows, and auto-save functionality.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Validation</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Zod-powered business validation with real-time feedback
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Multi-step</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Complex workflows broken into manageable steps
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Auto-save</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Automatic draft saving to prevent data loss
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">TypeScript</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Full type safety for all form data and validation
          </p>
        </Card>
      </div>

      {/* Form Examples */}
      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
          <TabsTrigger value="interaction">Interaction</TabsTrigger>
        </TabsList>

        {/* Contact Form */}
        <TabsContent value="contact">
          <ContactFormBuilder
            title="Create New Contact"
            description="Add a new contact to your CRM system"
            defaultValues={defaultContactData}
            onSubmit={handleContactSubmit}
            onDraft={handleDraftSave}
            submitText="Create Contact"
            autoSave
            showProgress
          />
        </TabsContent>

        {/* Organization Form */}
        <TabsContent value="organization">
          <OrganizationFormBuilder
            title="Create New Organization"
            description="Add a new organization to your CRM system"
            defaultValues={defaultOrganizationData}
            onSubmit={handleOrganizationSubmit}
            onDraft={handleDraftSave}
            submitText="Create Organization"
            autoSave
          />
        </TabsContent>

        {/* Product Form */}
        <TabsContent value="product">
          <ProductFormBuilder
            title="Create New Product"
            description="Add a new product to your catalog"
            defaultValues={defaultProductData}
            onSubmit={handleProductSubmit}
            onDraft={handleDraftSave}
            submitText="Create Product"
            autoSave
          />
        </TabsContent>

        {/* Opportunity Form (Multi-step) */}
        <TabsContent value="opportunity">
          <OpportunityFormBuilder
            title="Create New Opportunity"
            description="Track a new sales opportunity through the pipeline"
            steps={opportunityFormSteps}
            defaultValues={defaultOpportunityData}
            onSubmit={handleOpportunitySubmit}
            onDraft={handleDraftSave}
            submitText="Create Opportunity"
            showProgress
            autoSave
            autoSaveInterval={15000} // Save every 15 seconds
            renderCustomField={renderCustomField}
          />
        </TabsContent>

        {/* Interaction Form */}
        <TabsContent value="interaction">
          <InteractionFormBuilder
            title="Log New Interaction"
            description="Record a customer interaction or activity"
            defaultValues={defaultInteractionData}
            onSubmit={handleInteractionSubmit}
            onDraft={handleDraftSave}
            submitText="Log Interaction"
            autoSave
          />
        </TabsContent>
      </Tabs>

      {/* Submitted Data Display */}
      {formData && (
        <Card>
          <CardHeader>
            <CardTitle>Form Submission Result</CardTitle>
            <CardDescription>
              This is the data that was submitted (in a real app, this would be sent to your API)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Technical Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Field Types</CardTitle>
            <CardDescription>
              Specialized field components for CRM data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium">Input Types</h4>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Text & Email fields</li>
                    <li>• Phone number formatting</li>
                    <li>• URL validation</li>
                    <li>• Currency with formatting</li>
                    <li>• Date picker integration</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Advanced Fields</h4>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Multi-line textarea</li>
                    <li>• Select dropdowns</li>
                    <li>• Radio groups</li>
                    <li>• Tag management</li>
                    <li>• Address components</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Validation</CardTitle>
            <CardDescription>
              Comprehensive validation rules for CRM data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <h4 className="font-medium mb-2">Validation Features</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Email format validation</li>
                  <li>• Phone number formatting</li>
                  <li>• Required field enforcement</li>
                  <li>• Data type validation</li>
                  <li>• Business rule validation</li>
                  <li>• Real-time error feedback</li>
                  <li>• Cross-field dependencies</li>
                  <li>• Custom validation rules</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
          <CardDescription>
            How to implement these forms in your CRM application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Simple Form</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<ContactFormBuilder
  title="Create Contact"
  onSubmit={handleSubmit}
  defaultValues={defaultData}
  autoSave
/>`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Multi-step Form</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<OpportunityFormBuilder
  steps={formSteps}
  showProgress
  onSubmit={handleSubmit}
  onDraft={handleDraft}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Custom Field Rendering</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
{`<CRMFormBuilder
  schema={customSchema}
  renderCustomField={(field, control) => {
    if (field === 'special') return <CustomComponent />
    return null
  }}
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}