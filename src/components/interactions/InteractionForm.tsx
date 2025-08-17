import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { 
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
import { DynamicSelectField, type SelectOption } from '@/components/forms/DynamicSelectField'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FormErrorBoundary } from '@/components/ui/form-error-boundary'
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
import { useOrganizationSearch } from '@/hooks/useAsyncEntitySearch'
// import { useContacts } from '@/hooks/useContacts'
// import { useOpportunities } from '@/hooks/useOpportunities'
import { useOpportunityNaming } from '@/stores/opportunityAutoNamingStore'
import type { Interaction, OpportunityContext } from '@/types/entities'

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
  const { search: searchOrganizations } = useOrganizationSearch()
  // const { data: contacts = [] } = useContacts()
  // const { data: opportunities = [] } = useOpportunities()
  
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

  // Use unified schema that supports both modes
  const form = useForm<any>({
    resolver: yupResolver(interactionWithOpportunitySchema) as any,
    defaultValues: mode === 'create-opportunity' ? {
      // Interaction with opportunity creation defaults
      type: initialData?.type || 'follow_up',
      interaction_date: initialData?.interaction_date || new Date().toISOString().split('T')[0],
      subject: initialData?.subject || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      contact_id: preselectedContact || initialData?.contact_id || null,
      opportunity_context: 'Follow-up',
      opportunity_name: null,
      opportunity_stage: 'New Lead',
      principal_organization_id: null,
      location: null,
      description: null,
      follow_up_required: false,
      follow_up_date: initialData?.follow_up_date || null,
      create_opportunity: true
    } : {
      // Standard interaction defaults (using unified schema)
      type: initialData?.type || 'follow_up',
      interaction_date: initialData?.interaction_date || new Date().toISOString().split('T')[0],
      subject: initialData?.subject || '',
      opportunity_id: preselectedOpportunity || initialData?.opportunity_id || '',
      location: null,
      description: null,
      follow_up_required: false,
      follow_up_date: initialData?.follow_up_date || null,
      create_opportunity: false
    }
  })

  const { control, handleSubmit, setValue, watch, formState: { errors } } = form

  // Watch form values - only watch what's actually used
  const watchedType = watch('type')
  const watchedOrganizationId = mode === 'create-opportunity' ? watch('organization_id') : undefined
  const watchedFollowUpRequired = watch('follow_up_required')
  const watchedOpportunityContext = mode === 'create-opportunity' ? watch('opportunity_context') : undefined
  const watchedPrincipalId = mode === 'create-opportunity' ? watch('principal_organization_id') : undefined

  // Async search function for organizations (customers only)
  const searchCustomerOrganizations = useCallback(async (query: string): Promise<SelectOption[]> => {
    try {
      let dbQuery = supabase
        .from('organizations')
        .select('id, name, type, email, website, city, state_province')
        .eq('type', 'customer')
        .is('deleted_at', null)
        .order('name')
        .limit(25)

      if (query && query.length >= 1) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%,website.ilike.%${query}%`)
      }

      const { data, error } = await dbQuery
      if (error) throw error

      return (data || []).map(org => ({
        value: org.id,
        label: org.name,
        description: org.email || `${org.city ? org.city + ', ' : ''}${org.state_province || ''}`.trim() || undefined,
        badge: {
          text: org.type.toUpperCase(),
          variant: 'outline' as const
        },
        metadata: org
      }))
    } catch (error) {
      console.error('Error searching organizations:', error)
      return []
    }
  }, [])

  // Async search function for contacts
  const searchContacts = useCallback(async (query: string): Promise<SelectOption[]> => {
    try {
      let dbQuery = supabase
        .from('contacts')
        .select('id, first_name, last_name, title, email, organization_id, organizations(name)')
        .is('deleted_at', null)
        .order('last_name')
        .limit(25)

      // Filter by organization if one is selected
      if (watchedOrganizationId) {
        dbQuery = dbQuery.eq('organization_id', watchedOrganizationId)
      }

      if (query && query.length >= 1) {
        dbQuery = dbQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,title.ilike.%${query}%`)
      }

      const { data, error } = await dbQuery
      if (error) throw error

      return (data || []).map(contact => ({
        value: contact.id,
        label: `${contact.first_name} ${contact.last_name}`,
        description: contact.title ? `${contact.title} at ${contact.organizations?.name}` : contact.organizations?.name || '',
        metadata: { 
          organization_id: contact.organization_id,
          email: contact.email
        }
      }))
    } catch (error) {
      console.error('Error searching contacts:', error)
      return []
    }
  }, [watchedOrganizationId])

  // Async search function for opportunities
  const searchOpportunities = useCallback(async (query: string): Promise<SelectOption[]> => {
    try {
      let dbQuery = supabase
        .from('opportunities')
        .select('id, name, stage, estimated_value, organization_id, organization:organizations!organization_id(name)')
        .is('deleted_at', null)
        .order('name')
        .limit(25)

      // Filter by organization if one is selected
      if (watchedOrganizationId) {
        dbQuery = dbQuery.eq('organization_id', watchedOrganizationId)
      }

      if (query && query.length >= 1) {
        dbQuery = dbQuery.ilike('name', `%${query}%`)
      }

      const { data, error } = await dbQuery
      if (error) throw error

      return (data || []).map(opp => ({
        value: opp.id,
        label: opp.name,
        description: `${opp.stage}${opp.organization?.name ? ` • ${opp.organization.name}` : ''}`,
        badge: {
          text: opp.estimated_value ? `${(opp.estimated_value / 1000).toFixed(0)}K` : opp.stage.toUpperCase(),
          variant: 'outline' as const
        },
        metadata: { 
          organization_id: opp.organization_id,
          stage: opp.stage,
          estimated_value: opp.estimated_value
        }
      }))
    } catch (error) {
      console.error('Error searching opportunities:', error)
      return []
    }
  }, [watchedOrganizationId])

  const handleCreateOrganization = async () => {
    console.log('Create new organization')
  }

  const handleCreateContact = async () => {
    console.log('Create new contact')
  }

  const handleCreateOpportunity = async () => {
    console.log('Create new opportunity')
  }

  // Get organization name for auto-naming
  const selectedOrganization = organizations.find(org => org.id === watchedOrganizationId)
  const selectedPrincipal = watchedPrincipalId ? principals.find(p => p.id === watchedPrincipalId) : undefined

  // Get current interaction type config
  const currentTypeConfig = INTERACTION_TYPE_CONFIG.find(config => config.type === watchedType) || INTERACTION_TYPE_CONFIG[0]

  // Handle organization change - clear dependent fields
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'organization_id') {
        // Clear contact and opportunity when organization changes
        setValue('contact_id', null)
        if (mode === 'link-existing') {
          setValue('opportunity_id', '')
        }
      }
    })
    
    return () => subscription.unsubscribe()
  }, [form, setValue, mode])

  // Auto-naming preview effect for opportunity creation
  useEffect(() => {
    if (mode === 'create-opportunity' && selectedOrganization && selectedPrincipal && watchedOpportunityContext) {
      const principalNames = [selectedPrincipal.name]
      previewName(
        {
          organization_id: watchedOrganizationId,
          principals: [watchedPrincipalId!],
          opportunity_context: watchedOpportunityContext as any
        },
        selectedOrganization.name,
        principalNames
      ).catch(console.error)
    }
  }, [watchedOrganizationId, watchedPrincipalId, watchedOpportunityContext, selectedOrganization, selectedPrincipal, mode, previewName])

  // Handle template selection
  const applyTemplate = (template: MobileInteractionTemplate) => {
    setSelectedTemplate(template)
    setValue('type', template.type)
    setValue('subject', template.subject)
    if (template.defaultNotes) {
      setValue('description', template.defaultNotes as any)
    }
    
    // Show template applied feedback
    const typeConfig = INTERACTION_TYPE_CONFIG.find(config => config.type === template.type)
    if (typeConfig) {
      // Could add toast notification here
    }
  }

  // Handle form submission with unified typing
  const onFormSubmit = (data: any) => {
    // Convert date string to ISO timestamp for database compatibility
    const processedData = {
      ...data,
      interaction_date: data.interaction_date ? new Date(data.interaction_date + 'T00:00:00').toISOString() : new Date().toISOString(),
      follow_up_date: data.follow_up_date || null
    }

    if (mode === 'create-opportunity') {
      // Add auto-generated name if available
      if (currentPreview) {
        processedData.opportunity_name = currentPreview.full_name
      }
      onSubmit(processedData, mode)
    } else {
      // For link-existing mode, cast to the interface expected by onSubmit
      const linkingData = {
        type: processedData.type,
        interaction_date: processedData.interaction_date,
        subject: processedData.subject,
        opportunity_id: processedData.opportunity_id!,
        location: processedData.location,
        description: processedData.description,
        follow_up_required: processedData.follow_up_required,
        follow_up_date: processedData.follow_up_date
      } as InteractionFormData
      onSubmit(linkingData, mode)
    }
  }

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <FormErrorBoundary>
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
                    <DynamicSelectField
                      name="organization_id"
                      control={control}
                      label="Customer Organization"
                      placeholder="Search and select organization..."
                      searchPlaceholder="Search organizations by name or email..."
                      createNewText="Create New Organization"
                      disabled={!!preselectedOrganization}
                      required
                      onSearch={searchCustomerOrganizations}
                      onCreateNew={handleCreateOrganization}
                      showCreateWhenEmpty
                      clearable={!preselectedOrganization}
                      debounceMs={300}
                      minSearchLength={1}
                      description="Customer organization for this interaction"
                      noResultsText="No customer organizations found"
                    />

                    {/* Contact Selection */}
                    <DynamicSelectField
                      name="contact_id"
                      control={control}
                      label="Contact Person"
                      placeholder="Search and select contact..."
                      searchPlaceholder="Search contacts by name or title..."
                      createNewText="Create New Contact"
                      disabled={!watchedOrganizationId || !!preselectedContact}
                      required={false}
                      onSearch={searchContacts}
                      onCreateNew={handleCreateContact}
                      showCreateWhenEmpty
                      clearable
                      debounceMs={300}
                      minSearchLength={1}
                      description="Specific person involved in this interaction"
                      noResultsText={watchedOrganizationId ? "No contacts found for this organization" : "Select an organization first"}
                    />
                  </div>

                  {/* Opportunity Linking or Creation */}
                  {mode === 'link-existing' ? (
                    <DynamicSelectField
                      name="opportunity_id"
                      control={control}
                      label="Opportunity"
                      placeholder="Search and select opportunity..."
                      searchPlaceholder="Search opportunities by name..."
                      createNewText="Create New Opportunity"
                      disabled={!watchedOrganizationId || !!preselectedOpportunity}
                      required
                      onSearch={searchOpportunities}
                      onCreateNew={handleCreateOpportunity}
                      showCreateWhenEmpty
                      clearable={!preselectedOpportunity}
                      debounceMs={300}
                      minSearchLength={1}
                      description="Required: Every interaction must be linked to an opportunity"
                      noResultsText={watchedOrganizationId ? "No opportunities found for this organization" : "Select an organization first"}
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

            {/* Description/Notes */}
            <FormField
              control={control}
              name="description"
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
    </FormErrorBoundary>
  )
}