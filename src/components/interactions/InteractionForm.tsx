import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { 
  interactionSchema, 
  interactionWithOpportunitySchema,
  type InteractionFormData, 
  type InteractionWithOpportunityFormData,
  type InteractionType,
  type MobileInteractionTemplate,
  MOBILE_INTERACTION_TEMPLATES
} from '@/types/interaction.types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  Eye,
  AlertCircle,
  Info,
  Calendar,
  Target,
  Phone,
  Mail,
  MapPin,
  Presentation,
  Clock,
  CheckCircle2,
  Plus,
  Zap
} from 'lucide-react'
import { useOrganizations, usePrincipals } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { useOpportunities } from '@/hooks/useOpportunities'
import { useOpportunityNaming } from '@/stores/opportunityAutoNamingStore'
import type { Interaction, OpportunityContext, OpportunityStage } from '@/types/entities'

// Types for the comprehensive form
type FormMode = 'link-existing' | 'create-opportunity'

interface InteractionFormProps {
  onSubmit: (data: InteractionFormData | InteractionWithOpportunityFormData, mode: FormMode) => void
  initialData?: Partial<Interaction>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
  preselectedContact?: string
  preselectedOpportunity?: string
  mode?: FormMode
  onModeChange?: (mode: FormMode) => void
}

// Interaction type configuration for mobile templates
const INTERACTION_TYPE_CONFIG: Array<{
  type: InteractionType
  label: string
  icon: any
  description: string
  color: string
}> = [
  {
    type: 'call',
    label: 'Call',
    icon: Phone,
    description: 'Phone conversation or conference call',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email communication or correspondence',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    type: 'meeting',
    label: 'Meeting',
    icon: Users,
    description: 'In-person or virtual meeting',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    type: 'site_visit',
    label: 'Site Visit',
    icon: MapPin,
    description: 'On-site customer visit or facility tour',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    type: 'demo',
    label: 'Demo',
    icon: Presentation,
    description: 'Product demonstration or presentation',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  {
    type: 'follow_up',
    label: 'Follow-up',
    icon: Clock,
    description: 'Follow-up contact or check-in',
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    type: 'proposal',
    label: 'Proposal',
    icon: Target,
    description: 'Proposal submission or review',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    type: 'trade_show',
    label: 'Trade Show',
    icon: Building2,
    description: 'Trade show or industry event interaction',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  {
    type: 'contract_review',
    label: 'Contract Review',
    icon: CheckCircle2,
    description: 'Contract negotiation or review session',
    color: 'bg-slate-100 text-slate-800 border-slate-200'
  }
]

// Opportunity contexts for new opportunity creation
const OPPORTUNITY_CONTEXTS: Array<{
  value: OpportunityContext
  label: string
  description: string
  icon: string
}> = [
  {
    value: 'Site Visit',
    label: 'Site Visit',
    description: 'On-site customer visit and product demonstration',
    icon: '🏢'
  },
  {
    value: 'Food Show',
    label: 'Food Show',
    description: 'Trade show or food industry event connection',
    icon: '🍽️'
  },
  {
    value: 'New Product Interest',
    label: 'New Product Interest',
    description: 'Customer interest in new or seasonal products',
    icon: '🆕'
  },
  {
    value: 'Follow-up',
    label: 'Follow-up',
    description: 'Regular follow-up or relationship maintenance',
    icon: '📞'
  },
  {
    value: 'Demo Request',
    label: 'Demo Request',
    description: 'Customer requested product demonstration',
    icon: '🎯'
  },
  {
    value: 'Sampling',
    label: 'Sampling',
    description: 'Product sampling program or taste testing',
    icon: '🍴'
  },
  {
    value: 'Custom',
    label: 'Custom Context',
    description: 'Custom business context (specify details)',
    icon: '✏️'
  }
]

export function InteractionForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Interaction',
  preselectedOrganization,
  preselectedContact,
  preselectedOpportunity,
  mode = 'link-existing',
  onModeChange
}: InteractionFormProps) {
  // Data hooks
  const { data: organizations = [] } = useOrganizations()
  const { data: principals = [] } = usePrincipals()
  const { data: contacts = [] } = useContacts()
  const { data: opportunities = [] } = useOpportunities()
  
  // Auto-naming store for opportunity creation
  const {
    previewName,
    currentPreview,
    isGenerating,
    error: namingError
  } = useOpportunityNaming()

  // Local state for form enhancement
  const [expandedSections, setExpandedSections] = useState({
    quickTemplates: true,
    basicInfo: true,
    relationships: true,
    opportunityCreation: mode === 'create-opportunity',
    followUp: false
  })
  const [selectedTemplate, setSelectedTemplate] = useState<MobileInteractionTemplate | null>(null)

  // Determine which schema to use based on mode
  const schema = mode === 'create-opportunity' ? interactionWithOpportunitySchema : interactionSchema

  // Form setup with dynamic schema and defaults
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: mode === 'create-opportunity' ? {
      // Interaction with opportunity creation defaults
      type: initialData?.type || 'follow_up',
      interaction_date: initialData?.interaction_date || new Date().toISOString().split('T')[0],
      subject: initialData?.subject || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      contact_id: preselectedContact || initialData?.contact_id || null,
      opportunity_context: 'Follow-up' as OpportunityContext,
      opportunity_name: '',
      opportunity_stage: 'New Lead' as OpportunityStage,
      principal_organization_id: null,
      location: initialData?.location || null,
      notes: initialData?.notes || null,
      follow_up_required: initialData?.follow_up_required || false,
      follow_up_date: initialData?.follow_up_date || null,
      create_opportunity: true
    } : {
      // Standard interaction defaults
      type: initialData?.type || 'follow_up',
      interaction_date: initialData?.interaction_date || new Date().toISOString().split('T')[0],
      subject: initialData?.subject || '',
      opportunity_id: preselectedOpportunity || initialData?.opportunity_id || '',
      location: initialData?.location || null,
      notes: initialData?.notes || null,
      follow_up_required: initialData?.follow_up_required || false,
      follow_up_date: initialData?.follow_up_date || null
    }
  })

  const { control, handleSubmit, setValue, watch, formState: { errors } } = form

  // Watch form values
  const watchedType = watch('type')
  const watchedOrganizationId = watch('organization_id')
  const watchedContactId = watch('contact_id')
  const watchedOpportunityId = watch('opportunity_id')
  const watchedFollowUpRequired = watch('follow_up_required')
  const watchedOpportunityContext = watch('opportunity_context')
  const watchedOpportunityName = watch('opportunity_name')
  const watchedPrincipalId = watch('principal_organization_id')

  // Filter contacts by selected organization
  const filteredContacts = watchedOrganizationId 
    ? contacts.filter(contact => contact.organization_id === watchedOrganizationId)
    : contacts

  // Filter opportunities by selected organization
  const filteredOpportunities = watchedOrganizationId 
    ? opportunities.filter(opportunity => opportunity.organization_id === watchedOrganizationId)
    : opportunities

  // Get organization name for auto-naming
  const selectedOrganization = organizations.find(org => org.id === watchedOrganizationId)
  const selectedPrincipal = principals.find(p => p.id === watchedPrincipalId)

  // Get current interaction type config
  const currentTypeConfig = INTERACTION_TYPE_CONFIG.find(config => config.type === watchedType) || INTERACTION_TYPE_CONFIG[0]

  // Auto-naming preview effect for opportunity creation
  useEffect(() => {
    if (mode === 'create-opportunity' && autoNamingEnabled && selectedOrganization && selectedPrincipal && watchedOpportunityContext) {
      const principalNames = [selectedPrincipal.name]
      previewName(
        {
          organization_id: watchedOrganizationId,
          principals: [watchedPrincipalId!],
          opportunity_context: watchedOpportunityContext
        },
        selectedOrganization.name,
        principalNames
      ).catch(console.error)
    }
  }, [watchedOrganizationId, watchedPrincipalId, watchedOpportunityContext, selectedOrganization, selectedPrincipal, mode, autoNamingEnabled])

  // Handle template selection
  const applyTemplate = (template: MobileInteractionTemplate) => {
    setSelectedTemplate(template)
    setValue('type', template.type)
    setValue('subject', template.subject)
    if (template.defaultNotes) {
      setValue('notes', template.defaultNotes)
    }
    
    // Show template applied feedback
    const typeConfig = INTERACTION_TYPE_CONFIG.find(config => config.type === template.type)
    if (typeConfig) {
      // Could add toast notification here
    }
  }

  // Handle form submission
  const onFormSubmit = (data: any) => {
    if (mode === 'create-opportunity') {
      const formData = data as InteractionWithOpportunityFormData
      // Add auto-generated name if enabled
      if (autoNamingEnabled && currentPreview) {
        formData.opportunity_name = currentPreview.full_name
      }
      onSubmit(formData, mode)
    } else {
      const formData = data as InteractionFormData
      onSubmit(formData, mode)
    }
  }

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center space-x-2">
            <currentTypeConfig.icon className="h-6 w-6" />
            <span>{initialData ? 'Edit Interaction' : 'New Interaction'}</span>
          </CardTitle>
          {onModeChange && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Mode:</label>
              <Select value={mode} onValueChange={(value: FormMode) => {
                onModeChange(value)
                setExpandedSections(prev => ({
                  ...prev,
                  opportunityCreation: value === 'create-opportunity'
                }))
              }}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link-existing">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Link to Existing Opportunity</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="create-opportunity">
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Create New Opportunity</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* Current mode indicator */}
        <div className="flex items-center space-x-2">
          <Badge className={currentTypeConfig.color}>
            <currentTypeConfig.icon className="h-3 w-3 mr-1" />
            {currentTypeConfig.label}
          </Badge>
          <span className="text-sm text-muted-foreground">•</span>
          <Badge variant={mode === 'create-opportunity' ? 'default' : 'secondary'}>
            {mode === 'create-opportunity' ? 'Creating Opportunity' : 'Linking Existing'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

            {/* Mobile Quick Templates */}
            <Collapsible 
              open={expandedSections.quickTemplates} 
              onOpenChange={() => toggleSection('quickTemplates')}
            >
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span className="text-lg font-medium">Quick Entry Templates</span>
                    </div>
                    {expandedSections.quickTemplates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Use these quick templates for common field interactions. Tap a template to auto-fill the form with typical values.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {MOBILE_INTERACTION_TEMPLATES.map((template) => {
                      const typeConfig = INTERACTION_TYPE_CONFIG.find(config => config.type === template.type)
                      const isSelected = selectedTemplate?.type === template.type && selectedTemplate?.subject === template.subject
                      
                      return (
                        <Tooltip key={`${template.type}-${template.subject}`}>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className={`h-auto p-4 flex flex-col items-start space-y-2 text-left ${
                                isSelected ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => applyTemplate(template)}
                            >
                              <div className="flex items-center space-x-2 w-full">
                                {typeConfig && <typeConfig.icon className="h-4 w-4" />}
                                <Badge className={typeConfig?.color || 'bg-gray-100'}>
                                  {typeConfig?.label || template.type}
                                </Badge>
                              </div>
                              <div className="space-y-1 w-full">
                                <p className="font-medium text-sm">{template.subject}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {template.defaultNotes}
                                </p>
                              </div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">{template.subject}</p>
                              <p className="text-sm">{template.defaultNotes}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                  
                  {selectedTemplate && (
                    <Alert className="border-primary/20 bg-primary/5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <AlertDescription>
                        <strong>Template Applied:</strong> {selectedTemplate.subject} - You can still customize the details below.
                      </AlertDescription>
                    </Alert>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Basic Information */}
            <Collapsible 
              open={expandedSections.basicInfo} 
              onOpenChange={() => toggleSection('basicInfo')}
            >
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-lg font-medium">Interaction Details</span>
                    </div>
                    {expandedSections.basicInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Interaction Type */}
                    <FormField
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interaction Type *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INTERACTION_TYPE_CONFIG.map((config) => (
                                <SelectItem key={config.type} value={config.type}>
                                  <div className="flex items-center space-x-2">
                                    <config.icon className="h-4 w-4" />
                                    <div>
                                      <p className="font-medium">{config.label}</p>
                                      <p className="text-xs text-muted-foreground">{config.description}</p>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Subject */}
                    <FormField
                      control={control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Interaction topic or purpose"
                              className="h-12"
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description of the interaction purpose
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Interaction Date */}
                    <FormField
                      control={control}
                      name="interaction_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Location (optional) */}
                  <FormField
                    control={control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            placeholder="Meeting location, phone number, or platform"
                          />
                        </FormControl>
                        <FormDescription>
                          Physical location, phone number, or virtual meeting platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Relationships */}
            <Collapsible 
              open={expandedSections.relationships} 
              onOpenChange={() => toggleSection('relationships')}
            >
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span className="text-lg font-medium">Customer Relationships</span>
                    </div>
                    {expandedSections.relationships ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Organization Selection */}
                    <FormField
                      control={control}
                      name="organization_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Organization *</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={(value) => {
                              field.onChange(value)
                              // Clear contact and opportunity when organization changes
                              if (value !== watchedOrganizationId) {
                                setValue('contact_id', null)
                                if (mode === 'link-existing') {
                                  setValue('opportunity_id', '')
                                }
                              }
                            }}
                            disabled={!!preselectedOrganization}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select organization" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Customer Organizations</SelectLabel>
                                {organizations.filter(org => org.type === 'customer').map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    <div className="flex items-center space-x-2">
                                      <Building2 className="h-4 w-4" />
                                      <span>{org.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact Selection */}
                    <FormField
                      control={control}
                      name="contact_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <Select 
                            value={field.value || 'none'} 
                            onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                            disabled={!watchedOrganizationId || !!preselectedContact}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select contact" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No specific contact</SelectItem>
                              {filteredContacts.map((contact) => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  <div>
                                    <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                                    {contact.title && (
                                      <p className="text-xs text-muted-foreground">{contact.title}</p>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Specific person involved in this interaction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Opportunity Linking or Creation */}
                  {mode === 'link-existing' ? (
                    <FormField
                      control={control}
                      name="opportunity_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opportunity *</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                            disabled={!watchedOrganizationId || !!preselectedOpportunity}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select opportunity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredOpportunities.map((opportunity) => (
                                <SelectItem key={opportunity.id} value={opportunity.id}>
                                  <div>
                                    <p className="font-medium">{opportunity.name}</p>
                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                      <Badge variant="outline" className="text-xs">
                                        {opportunity.stage}
                                      </Badge>
                                      {opportunity.estimated_close_date && (
                                        <span>• {new Date(opportunity.estimated_close_date).toLocaleDateString()}</span>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Required: Every interaction must be linked to an opportunity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Opportunity Creation (when in create mode) */}
            {mode === 'create-opportunity' && (
              <Collapsible 
                open={expandedSections.opportunityCreation} 
                onOpenChange={() => toggleSection('opportunityCreation')}
              >
                <div className="space-y-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                      <div className="flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span className="text-lg font-medium">New Opportunity Creation</span>
                      </div>
                      {expandedSections.opportunityCreation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Creating a new opportunity allows you to link this interaction to a fresh sales opportunity. 
                        The opportunity name will be auto-generated based on your selections.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Opportunity Context */}
                      <FormField
                        control={control}
                        name="opportunity_context"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opportunity Context *</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select context" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {OPPORTUNITY_CONTEXTS.map((context) => (
                                  <SelectItem key={context.value} value={context.value}>
                                    <div className="flex items-center space-x-2">
                                      <span>{context.icon}</span>
                                      <div>
                                        <p className="font-medium">{context.label}</p>
                                        <p className="text-xs text-muted-foreground">{context.description}</p>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Principal Organization */}
                      <FormField
                        control={control}
                        name="principal_organization_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Principal Organization</FormLabel>
                            <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? null : value)}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select principal" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">No specific principal</SelectItem>
                                {principals.map((principal) => (
                                  <SelectItem key={principal.id} value={principal.id}>
                                    {principal.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The food service principal associated with this opportunity
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Opportunity Stage */}
                    <FormField
                      control={control}
                      name="opportunity_stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Stage *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="New Lead">New Lead</SelectItem>
                              <SelectItem value="Initial Outreach">Initial Outreach</SelectItem>
                              <SelectItem value="Sample/Visit Offered">Sample/Visit Offered</SelectItem>
                              <SelectItem value="Awaiting Response">Awaiting Response</SelectItem>
                              <SelectItem value="Feedback Logged">Feedback Logged</SelectItem>
                              <SelectItem value="Demo Scheduled">Demo Scheduled</SelectItem>
                              <SelectItem value="Closed - Won">Closed - Won</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Starting stage for the new opportunity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Auto-naming preview */}
                    {currentPreview && (
                      <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">Generated Opportunity Name</span>
                        </div>
                        <p className="font-mono text-sm bg-background px-3 py-2 rounded border">
                          {currentPreview.full_name}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Characters: {currentPreview.character_count}/255</span>
                          {!currentPreview.is_within_limit && (
                            <Badge variant="destructive" className="text-xs">
                              Exceeds limit
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Manual name override */}
                    <FormField
                      control={control}
                      name="opportunity_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Opportunity Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ''}
                              placeholder="Leave empty to use auto-generated name"
                            />
                          </FormControl>
                          <FormDescription>
                            Override the auto-generated name if needed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Notes */}
            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Meeting notes, discussion points, or follow-up details..."
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed notes about what was discussed or accomplished
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Follow-up */}
            <Collapsible 
              open={expandedSections.followUp} 
              onOpenChange={() => toggleSection('followUp')}
            >
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span className="text-lg font-medium">Follow-up Planning</span>
                    </div>
                    {expandedSections.followUp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4">
                  <FormField
                    control={control}
                    name="follow_up_required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">
                            Follow-up Required
                          </FormLabel>
                          <FormDescription>
                            Mark if this interaction requires a follow-up action
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {watchedFollowUpRequired && (
                    <FormField
                      control={control}
                      name="follow_up_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Follow-up Date *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ''}
                              className="h-12"
                            />
                          </FormControl>
                          <FormDescription>
                            When should the follow-up action be completed?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Error Display */}
            {namingError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{namingError}</AlertDescription>
              </Alert>
            )}

            {/* Submit Section */}
            <Separator />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                Form validation: {Object.keys(errors).length === 0 ? 'Passed' : `${Object.keys(errors).length} errors`}
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading || isGenerating} className="min-w-[140px] h-12">
                  {loading || isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {isGenerating ? 'Creating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      {mode === 'create-opportunity' ? (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create & Link
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          {submitLabel}
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}