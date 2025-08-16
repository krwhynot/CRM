import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { 
  multiPrincipalOpportunitySchema,
  type OpportunityFormData, 
  type MultiPrincipalOpportunityFormData,
  type OpportunityContext,
  type OpportunityStage 
} from '@/types/opportunity.types'
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
import { Progress } from '@/components/ui/progress'
import { FormErrorBoundary } from '@/components/ui/form-error-boundary'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Users, 
  Eye, 
  Wand2, 
  AlertCircle, 
  Info, 
  Target,
  DollarSign,
  CheckCircle2
} from 'lucide-react'
import { useOrganizations, usePrincipals } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { useProducts } from '@/hooks/useProducts'
import { useOpportunityNaming } from '@/stores/opportunityAutoNamingStore'
import type { Opportunity } from '@/types/entities'

// Types for the comprehensive form
type FormMode = 'standard' | 'multi-principal'

interface OpportunityFormProps {
  onSubmit: (data: OpportunityFormData | MultiPrincipalOpportunityFormData) => void
  initialData?: Partial<Opportunity>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
  preselectedContact?: string
  mode?: FormMode
  onModeChange?: (mode: FormMode) => void
}

// 7-Point Sales Funnel Configuration
const SALES_FUNNEL_STAGES: Array<{
  value: OpportunityStage
  label: string
  description: string
  color: string
  progress: number
}> = [
  {
    value: 'New Lead',
    label: 'New Lead',
    description: 'Initial prospect identification and qualification',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    progress: 14
  },
  {
    value: 'Initial Outreach',
    label: 'Initial Outreach', 
    description: 'First contact made, introduction and needs assessment',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    progress: 28
  },
  {
    value: 'Sample/Visit Offered',
    label: 'Sample/Visit Offered',
    description: 'Product samples provided or site visit scheduled',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    progress: 42
  },
  {
    value: 'Awaiting Response',
    label: 'Awaiting Response',
    description: 'Waiting for feedback on samples or proposal',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    progress: 56
  },
  {
    value: 'Feedback Logged',
    label: 'Feedback Logged',
    description: 'Customer feedback received and documented',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    progress: 70
  },
  {
    value: 'Demo Scheduled',
    label: 'Demo Scheduled',
    description: 'Product demonstration or trial scheduled',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    progress: 85
  },
  {
    value: 'Closed - Won',
    label: 'Closed - Won',
    description: 'Opportunity successfully closed with sale',
    color: 'bg-green-100 text-green-800 border-green-200',
    progress: 100
  }
]

// Opportunity Context Configuration
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

export function OpportunityForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Opportunity',
  preselectedOrganization,
  preselectedContact,
  mode = 'standard',
  onModeChange
}: OpportunityFormProps) {
  // Data hooks
  const { data: organizations = [] } = useOrganizations()
  const { data: principals = [] } = usePrincipals()
  const { data: contacts = [] } = useContacts()
  const { data: products = [] } = useProducts()
  
  // Auto-naming store
  const {
    previewName,
    currentPreview,
    isGenerating,
    error: namingError
  } = useOpportunityNaming()

  // Local state for form enhancement
  const [expandedSections, setExpandedSections] = useState({
    autoNaming: true,
    basicInfo: true,
    relationships: true,
    salesInfo: false,
    financial: false,
    advanced: false
  })

  // Use unified schema that supports both modes
  const form = useForm<any>({
    resolver: yupResolver(multiPrincipalOpportunitySchema) as any,
    defaultValues: mode === 'multi-principal' ? {
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      contact_id: preselectedContact || initialData?.contact_id || '',
      principals: [],
      auto_generated_name: true,
      opportunity_context: 'Follow-up' as OpportunityContext,
      custom_context: '',
      stage: 'New Lead' as OpportunityStage,
      probability: undefined,
      expected_close_date: '',
      notes: ''
    } : {
      // Standard mode using multi-principal schema structure
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      contact_id: preselectedContact || initialData?.contact_id || '',
      principals: [],
      auto_generated_name: false,
      opportunity_context: 'Follow-up' as OpportunityContext,
      custom_context: '',
      stage: (initialData?.stage as OpportunityStage) || 'New Lead',
      probability: initialData?.probability || undefined,
      expected_close_date: initialData?.estimated_close_date || '',
      notes: initialData?.notes || ''
    }
  })

  const { control, handleSubmit, setValue, watch, formState: { errors } } = form

  // Watch form values for auto-naming
  const watchedOrganizationId = watch('organization_id')
  const watchedPrincipals = watch('principals') || []
  const watchedContext = watch('opportunity_context')
  const watchedCustomContext = watch('custom_context')
  const watchedAutoNaming = watch('auto_generated_name')
  const watchedStage = watch('stage')

  // Filter contacts by selected organization
  const filteredContacts = watchedOrganizationId 
    ? contacts.filter(contact => contact.organization_id === watchedOrganizationId)
    : contacts

  // Get organization name for auto-naming
  const selectedOrganization = organizations.find(org => org.id === watchedOrganizationId)
  const selectedPrincipalOrgs = principals.filter(p => watchedPrincipals.includes(p.id))

  // Auto-naming preview effect
  useEffect(() => {
    if (mode === 'multi-principal' && watchedAutoNaming && selectedOrganization && watchedPrincipals.length > 0 && watchedContext) {
      const principalNames = selectedPrincipalOrgs.map(p => p.name)
      previewName(
        {
          organization_id: watchedOrganizationId,
          principals: watchedPrincipals,
          opportunity_context: watchedContext,
          custom_context: watchedCustomContext
        },
        selectedOrganization.name,
        principalNames
      ).catch(console.error)
    }
  }, [watchedOrganizationId, watchedPrincipals, watchedContext, watchedCustomContext, watchedAutoNaming, selectedOrganization, selectedPrincipalOrgs, mode, previewName])

  // Stage progression helpers
  const currentStageIndex = SALES_FUNNEL_STAGES.findIndex(stage => stage.value === watchedStage)
  const currentStageConfig = SALES_FUNNEL_STAGES[currentStageIndex] || SALES_FUNNEL_STAGES[0]


  // Handle form submission with unified typing
  const onFormSubmit = (data: any) => {
    if (mode === 'multi-principal') {
      // For multi-principal mode, use data as is
      onSubmit(data)
    } else {
      // For standard mode, transform to legacy format if needed
      const standardData = {
        name: '', // Will be filled by auto-naming or manual entry
        stage: data.stage,
        principals: data.principals,
        product_id: '', // Not used in multi-principal mode
        opportunity_context: data.opportunity_context,
        auto_generated_name: data.auto_generated_name,
        principal_id: data.principals.length > 0 ? data.principals[0] : '',
        probability: data.probability,
        expected_close_date: data.expected_close_date,
        deal_owner: '',
        notes: data.notes
      } as OpportunityFormData
      onSubmit(standardData)
    }
  }

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <FormErrorBoundary>
      <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {initialData ? 'Edit Opportunity' : 'New Opportunity'}
          </CardTitle>
          {onModeChange && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Mode:</label>
              <Select value={mode} onValueChange={(value: FormMode) => onModeChange(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Opportunity</SelectItem>
                  <SelectItem value="multi-principal">Multi-Principal Creation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* Sales Funnel Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Sales Funnel Progress</span>
            <Badge className={currentStageConfig.color}>
              {currentStageConfig.label}
            </Badge>
          </div>
          <Progress value={currentStageConfig.progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{currentStageConfig.description}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

            {/* Auto-Naming Section (Multi-Principal Mode) */}
            {mode === 'multi-principal' && (
              <Collapsible 
                open={expandedSections.autoNaming} 
                onOpenChange={() => toggleSection('autoNaming')}
              >
                <div className="space-y-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                      <div className="flex items-center space-x-2">
                        <Wand2 className="h-5 w-5" />
                        <span className="text-lg font-medium">Auto-Naming Configuration</span>
                      </div>
                      {expandedSections.autoNaming ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Auto-naming creates meaningful opportunity names based on organization, principals, and context. 
                        Names follow the pattern: "Organization - Principal(s) - Context - Date"
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={control}
                      name="auto_generated_name"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Enable Auto-Naming
                            </FormLabel>
                            <FormDescription>
                              Automatically generate opportunity names based on context and relationships
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {watchedAutoNaming && (
                      <div className="space-y-4">
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

                        {watchedContext === 'Custom' && (
                          <FormField
                            control={control}
                            name="custom_context"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Custom Context *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter custom context (e.g., Holiday Special, Emergency Supply)"
                                    maxLength={50}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Provide a brief description of the custom context (max 50 characters)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Name Preview */}
                        {currentPreview && (
                          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">Generated Name Preview</span>
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
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Basic Information */}
            <Collapsible 
              open={expandedSections.basicInfo} 
              onOpenChange={() => toggleSection('basicInfo')}
            >
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span className="text-lg font-medium">Basic Information</span>
                    </div>
                    {expandedSections.basicInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name field (only for standard mode) */}
                    {mode === 'standard' && (
                      <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opportunity Name *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter opportunity name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Stage Selection */}
                    <FormField
                      control={control}
                      name="stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sales Funnel Stage *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SALES_FUNNEL_STAGES.map((stage) => (
                                <SelectItem key={stage.value} value={stage.value}>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={`${stage.color} text-xs`}>
                                      {stage.progress}%
                                    </Badge>
                                    <div>
                                      <p className="font-medium">{stage.label}</p>
                                      <p className="text-xs text-muted-foreground">{stage.description}</p>
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
                  </div>
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
                      <span className="text-lg font-medium">Relationships</span>
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
                              // Clear contact when organization changes
                              if (value !== watchedOrganizationId) {
                                setValue('contact_id', null)
                              }
                            }}
                            disabled={!!preselectedOrganization}
                          >
                            <FormControl>
                              <SelectTrigger>
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
                          <FormLabel>Primary Contact</FormLabel>
                          <Select 
                            value={field.value || 'none'} 
                            onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                            disabled={!watchedOrganizationId || !!preselectedContact}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select contact" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No specific contact</SelectItem>
                              {filteredContacts.map((contact) => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  {contact.first_name} {contact.last_name}
                                  {contact.title && (
                                    <span className="text-muted-foreground ml-1">({contact.title})</span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Principal Selection */}
                  <FormField
                    control={control}
                    name="principals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Principal Organizations *</FormLabel>
                        <FormDescription>
                          Select the food service principals involved in this opportunity
                        </FormDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {principals.map((principal) => (
                            <div key={principal.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`principal-${principal.id}`}
                                checked={field.value?.includes(principal.id) || false}
                                onCheckedChange={(checked) => {
                                  const newPrincipals = checked
                                    ? [...(field.value || []), principal.id]
                                    : (field.value || []).filter((id: string) => id !== principal.id)
                                  field.onChange(newPrincipals)
                                }}
                              />
                              <label 
                                htmlFor={`principal-${principal.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {principal.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value.map((principalId: string) => {
                              const principal = principals.find(p => p.id === principalId)
                              return principal ? (
                                <Badge key={principalId} variant="secondary">
                                  {principal.name}
                                </Badge>
                              ) : null
                            })}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Product Selection (for standard mode) */}
                  {mode === 'standard' && (
                    <FormField
                      control={control}
                      name="product_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Product *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {product.principal?.name} - {product.category}
                                    </p>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Financial Information */}
            <Collapsible 
              open={expandedSections.financial} 
              onOpenChange={() => toggleSection('financial')}
            >
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-lg font-medium">Financial Information</span>
                    </div>
                    {expandedSections.financial ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Probability */}
                    <FormField
                      control={control}
                      name="probability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Success Probability (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              placeholder="50"
                            />
                          </FormControl>
                          <FormDescription>
                            Estimated likelihood of closing this opportunity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Expected Close Date */}
                    <FormField
                      control={control}
                      name="expected_close_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Close Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            Target date for closing this opportunity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Deal Owner (for standard mode) */}
                  {mode === 'standard' && (
                    <FormField
                      control={control}
                      name="deal_owner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deal Owner</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} placeholder="Sales representative or account manager" />
                          </FormControl>
                          <FormDescription>
                            Person responsible for managing this opportunity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>

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
                      placeholder="Additional notes, context, or important details about this opportunity..."
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Any additional information that would be helpful for tracking this opportunity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                <Button type="submit" disabled={loading || isGenerating}>
                  {loading || isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {isGenerating ? 'Generating...' : 'Saving...'}
                    </>
                  ) : (
                    submitLabel
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