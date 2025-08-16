import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { multiPrincipalOpportunitySchema, type MultiPrincipalOpportunityFormData } from '@/types/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Constants } from '@/types/database.types'
import { DynamicSelectField, type SelectOption } from '@/components/forms/DynamicSelectField'
import { CollapsibleFormSection, FormSectionPresets } from '@/components/forms/CollapsibleFormSection'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Check, Building, Users, DollarSign, Calendar, FileText } from 'lucide-react'

interface OpportunityWizardProps {
  onSubmit: (data: MultiPrincipalOpportunityFormData) => void
  onCancel: () => void
  loading?: boolean
  preselectedOrganization?: string
  preselectedContact?: string
}

const STEPS = [
  { id: 1, title: 'Context', icon: FileText, description: 'Opportunity context and type' },
  { id: 2, title: 'Organization', icon: Building, description: 'Select organization and contact' },
  { id: 3, title: 'Principals', icon: Users, description: 'Select principal organizations' },
  { id: 4, title: 'Details', icon: DollarSign, description: 'Stage and probability' },
  { id: 5, title: 'Notes', icon: Calendar, description: 'Additional information' }
] as const

export function OpportunityWizard({
  onSubmit,
  onCancel,
  loading = false,
  preselectedOrganization,
  preselectedContact
}: OpportunityWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPrincipal, setSelectedPrincipal] = useState<string>('')

  const form = useForm({
    resolver: yupResolver(multiPrincipalOpportunitySchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      organization_id: preselectedOrganization || '',
      contact_id: preselectedContact || '',
      principal_organization_id: '',
      auto_generated_name: false,
      opportunity_context: 'New Product Interest' as any,
      custom_context: '',
      stage: 'New Lead' as any,
      probability: null,
      estimated_close_date: '',
      notes: ''
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors }
  } = form

  const watchedValues = watch()
  const selectedOrganization = watch('organization_id')


  // Async search function for organizations
  const searchOrganizations = useCallback(async (query: string): Promise<SelectOption[]> => {
    try {
      let dbQuery = supabase
        .from('organizations')
        .select('id, name, type, city, state_province')
        .is('deleted_at', null)
        .order('name')
        .limit(25)

      if (query && query.length >= 1) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      }

      const { data, error } = await dbQuery
      if (error) throw error

      return (data || []).map(org => ({
        value: org.id,
        label: org.name,
        description: org.city && org.state_province ? `${org.city}, ${org.state_province}` : org.city || org.state_province || '',
        badge: {
          text: org.type.toUpperCase(),
          variant: org.type === 'principal' ? 'default' as const : 
                   org.type === 'distributor' ? 'secondary' as const : 'outline' as const
        },
        metadata: { type: org.type }
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
      if (selectedOrganization) {
        dbQuery = dbQuery.eq('organization_id', selectedOrganization)
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
  }, [selectedOrganization])

  // TODO: Re-implement searchPrincipals function for dynamic principal search

  // Handle quick create organization
  const handleCreateOrganization = async () => {
    console.log('Create new organization')
  }

  // Handle quick create contact
  const handleCreateContact = async () => {
    console.log('Create new contact')
  }

  const getStepValidation = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return await trigger(['opportunity_context'])
      case 2:
        return await trigger(['organization_id'])
      case 3:
        return await trigger(['principal_organization_id']) // Validate principal organization field
      case 4:
        return true // Financial info is optional
      case 5:
        return true // Timeline is optional
      default:
        return true
    }
  }

  const handleNext = async () => {
    const isValid = await getStepValidation(currentStep)
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = async (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step)
    } else {
      // Validate all steps up to the target step
      let canProceed = true
      for (let i = currentStep; i < step; i++) {
        const isValid = await getStepValidation(i)
        if (!isValid) {
          canProceed = false
          break
        }
      }
      if (canProceed) {
        setCurrentStep(step)
      }
    }
  }

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'current'
    return 'upcoming'
  }

  // Transform form data to match schema before submission
  const handleFormSubmit = (formData: MultiPrincipalOpportunityFormData) => {
    const transformedData: MultiPrincipalOpportunityFormData = {
      ...formData,
      principal_organization_id: selectedPrincipal || formData.principal_organization_id
    }
    
    onSubmit(transformedData)
  }

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="opportunity_context" className="text-sm font-medium">
                Opportunity Context *
              </label>
              <Select 
                value={watchedValues.opportunity_context || undefined} 
                onValueChange={(value) => setValue('opportunity_context', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select opportunity context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Site Visit">Site Visit</SelectItem>
                  <SelectItem value="Food Show">Food Show</SelectItem>
                  <SelectItem value="New Product Interest">New Product Interest</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Demo Request">Demo Request</SelectItem>
                  <SelectItem value="Sampling">Sampling</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.opportunity_context && (
                <p className="text-sm text-red-600 mt-1">{errors.opportunity_context.message}</p>
              )}
            </div>
            
            {watchedValues.opportunity_context === 'Custom' && (
              <div>
                <label htmlFor="custom_context" className="text-sm font-medium">
                  Custom Context *
                </label>
                <Input
                  id="custom_context"
                  {...register('custom_context')}
                  placeholder="Enter custom context"
                  disabled={loading}
                />
                {errors.custom_context && (
                  <p className="text-sm text-red-600 mt-1">{errors.custom_context.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('auto_generated_name')}
                  disabled={loading}
                />
                <span className="text-sm font-medium">Auto-generate opportunity name</span>
              </label>
              <p className="text-xs text-gray-500">
                When enabled, opportunity names will be automatically generated based on organization, principals, and context
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <CollapsibleFormSection
            {...FormSectionPresets.opportunityBasic}
            title="Organization & Contact"
            description="Select the organization and primary contact for this opportunity"
            icon={<Building className="h-4 w-4" />}
            forceState={true}
            defaultOpen={true}
          >
            <div className="space-y-6">
              <DynamicSelectField
                name="organization_id"
                control={control as any}
                label="Organization"
                placeholder="Search and select organization..."
                searchPlaceholder="Search organizations by name or city..."
                createNewText="Create New Organization"
                disabled={loading || !!preselectedOrganization}
                required
                onSearch={searchOrganizations}
                onCreateNew={handleCreateOrganization}
                showCreateWhenEmpty
                groupBy={(option) => {
                  const type = option.metadata?.type
                  if (type === 'principal') return 'Principals'
                  if (type === 'distributor') return 'Distributors'
                  return 'Other Organizations'
                }}
                clearable={!preselectedOrganization}
                debounceMs={300}
                minSearchLength={1}
                onClear={() => {
                  // Clear contact when organization changes
                  setValue('contact_id', '')
                }}
              />

              <DynamicSelectField
                name="contact_id"
                control={control as any}
                label="Primary Contact"
                placeholder="Search and select contact..."
                searchPlaceholder="Search contacts by name or title..."
                createNewText="Create New Contact"
                disabled={loading || !selectedOrganization || !!preselectedContact}
                required={false}
                onSearch={searchContacts}
                onCreateNew={handleCreateContact}
                showCreateWhenEmpty
                clearable
                debounceMs={300}
                minSearchLength={1}
                noResultsText={selectedOrganization ? "No contacts found for this organization" : "Select an organization first"}
              />
            </div>
          </CollapsibleFormSection>
        )

      case 3:
        return (
          <CollapsibleFormSection
            {...FormSectionPresets.opportunityBasic}
            title="Principal Organizations"
            description="Select the principal organizations for this opportunity"
            icon={<Users className="h-4 w-4" />}
            forceState={true}
            defaultOpen={true}
          >
            <div className="space-y-4">
              {/* TODO: Implement multiple selection for principals array */}
              <div>
                <label htmlFor="principal_select" className="text-sm font-medium">
                  Principal Organization *
                </label>
                <Select 
                  value={watchedValues.principal_organization_id || selectedPrincipal} 
                  onValueChange={(value) => {
                    setSelectedPrincipal(value)
                    setValue('principal_organization_id', value)
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select principal organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temp-principal-1">Sample Principal 1</SelectItem>
                    <SelectItem value="temp-principal-2">Sample Principal 2</SelectItem>
                    <SelectItem value="temp-principal-3">Sample Principal 3</SelectItem>
                  </SelectContent>
                </Select>
                {errors.principal_organization_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.principal_organization_id.message}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Select the primary principal organization for this opportunity. Multiple principal support and dynamic search will be added in a future update.
              </p>
            </div>
          </CollapsibleFormSection>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="stage" className="text-sm font-medium">
                  Stage
                </label>
                <Select 
                  value={watchedValues.stage} 
                  onValueChange={(value) => setValue('stage', value as any)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.opportunity_stage.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stage && (
                  <p className="text-sm text-red-600 mt-1">{errors.stage.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="probability" className="text-sm font-medium">
                  Probability (%)
                </label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  {...register('probability', { valueAsNumber: true })}
                  placeholder="50"
                  disabled={loading}
                />
                {errors.probability && (
                  <p className="text-sm text-red-600 mt-1">{errors.probability.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="estimated_close_date" className="text-sm font-medium">
                Estimated Close Date
              </label>
              <Input
                id="estimated_close_date"
                type="date"
                {...register('estimated_close_date')}
                disabled={loading}
              />
              {errors.estimated_close_date && (
                <p className="text-sm text-red-600 mt-1">{errors.estimated_close_date.message}</p>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes about this opportunity"
                disabled={loading}
                rows={6}
              />
              {errors.notes && (
                <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
              )}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Summary</h4>
              <p className="text-sm text-blue-700">
                Review your opportunity details before creating. Multiple opportunities will be created if you selected multiple principals.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Opportunity</CardTitle>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Step {currentStep} of {STEPS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Step Navigation */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step) => {
            const status = getStepStatus(step.id)
            const IconComponent = step.icon
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center cursor-pointer transition-colors ${
                  status === 'upcoming' ? 'opacity-50' : ''
                }`}
                onClick={() => handleStepClick(step.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    status === 'completed'
                      ? 'bg-green-500 text-white'
                      : status === 'current'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <IconComponent className="h-5 w-5" />
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    status === 'current' ? 'text-blue-600' : 
                    status === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="min-h-[300px] mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Opportunity'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}