import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { opportunitySchema, type OpportunityFormData, type OpportunityContext } from '@/types/opportunity.types'
import { createTypeSafeResolver } from '@/lib/form-resolver'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
// import type { Database } from '@/types/database.types' // Unused
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { ChevronLeft, ChevronRight, Check, Building, Users, DollarSign, Calendar, FileText } from 'lucide-react'

interface OpportunityWizardProps {
  onSubmit: (data: OpportunityFormData) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
  preselectedOrganization?: string
  preselectedContact?: string
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: FileText, description: 'Opportunity name and type' },
  { id: 2, title: 'Organization', icon: Building, description: 'Select organization and contact' },
  { id: 3, title: 'Details', icon: Users, description: 'Stage, priority, and description' },
  { id: 4, title: 'Financial', icon: DollarSign, description: 'Value and probability' },
  { id: 5, title: 'Timeline', icon: Calendar, description: 'Dates and next steps' }
] as const

export function OpportunityWizard({
  onSubmit,
  onCancel,
  loading = false,
  preselectedOrganization,
  preselectedContact
}: OpportunityWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors }
  } = useForm<OpportunityFormData>({
    resolver: createTypeSafeResolver<OpportunityFormData>(opportunitySchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      organization_id: preselectedOrganization || '',
      estimated_value: 0,
      stage: 'New Lead',
      contact_id: preselectedContact || null,
      estimated_close_date: null,
      description: null,
      notes: null,
      principals: [],
      product_id: null,
      opportunity_context: null,
      auto_generated_name: false,
      principal_id: null,
      probability: null,
      deal_owner: null
    }
  })

  const watchedValues = watch()
  const selectedOrganization = watch('organization_id')

  // Filter contacts by selected organization
  const filteredContacts = selectedOrganization 
    ? contacts.filter(contact => contact.organization_id === selectedOrganization)
    : contacts

  const getStepValidation = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return await trigger(['name'])
      case 2:
        return await trigger(['organization_id'])
      case 3:
        return await trigger(['stage'])
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

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Opportunity Name *
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter opportunity name"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the opportunity"
                disabled={loading}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="organization_id" className="text-sm font-medium">
                Organization *
              </label>
              <Select 
                value={selectedOrganization || undefined} 
                onValueChange={(value) => {
                  setValue('organization_id', value || '')
                  if (value !== selectedOrganization) {
                    setValue('contact_id', '')
                  }
                }}
                disabled={loading || !!preselectedOrganization}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({org.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organization_id && (
                <p className="text-sm text-red-600 mt-1">{errors.organization_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact_id" className="text-sm font-medium">
                Primary Contact
              </label>
              <Select 
                value={watchedValues.contact_id || 'none'} 
                onValueChange={(value) => setValue('contact_id', value === 'none' ? null : value || null)}
                disabled={loading || !selectedOrganization || !!preselectedContact}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No contact</SelectItem>
                  {filteredContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} ({contact.title || 'No title'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contact_id && (
                <p className="text-sm text-red-600 mt-1">{errors.contact_id.message}</p>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="stage" className="text-sm font-medium">
                  Stage *
                </label>
                <Select 
                  value={watchedValues.stage} 
                  onValueChange={(value: string) => {
                    setValue('stage', value as OpportunityFormData['stage'])
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'New Lead',
                      'Initial Outreach',
                      'Sample/Visit Offered',
                      'Awaiting Response',
                      'Feedback Logged',
                      'Demo Scheduled',
                      'Closed - Won',
                      'Closed - Lost'
                    ].map((stage) => (
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
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the opportunity"
                disabled={loading}
                rows={3}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="estimated_value" className="text-sm font-medium">
                  Opportunity Value ($)
                </label>
                <Input
                  id="estimated_value"
                  type="number"
                  step="0.01"
                  {...register('estimated_value', { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.estimated_value && (
                  <p className="text-sm text-red-600 mt-1">{errors.estimated_value.message}</p>
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
              <label htmlFor="deal_owner" className="text-sm font-medium">
                Deal Owner
              </label>
              <Input
                id="deal_owner"
                {...register('deal_owner')}
                placeholder="Person responsible for this opportunity"
                disabled={loading}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
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
            </div>

            <div>
              <label htmlFor="opportunity_context" className="text-sm font-medium">
                Opportunity Context
              </label>
              <Select 
                value={watchedValues.opportunity_context || undefined} 
                onValueChange={(value: OpportunityContext) => setValue('opportunity_context', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select context" />
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
            </div>

            <div>
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes about this opportunity"
                disabled={loading}
                rows={4}
              />
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
        <form onSubmit={handleSubmit((data: OpportunityFormData) => {
          // Filter out undefined values from principals array
          const cleanedData = {
            ...data,
            principals: data.principals.filter((id): id is string => id !== undefined)
          }
          onSubmit(cleanedData)
        })}>
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