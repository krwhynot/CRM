import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Save, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Import all form components
import {
  TextFormField,
  EmailFormField,
  PhoneFormField,
  UrlFormField,
  CurrencyFormField,
  TextareaFormField,
  SelectFormField,
  DateFormField,
  CheckboxFormField,
  SwitchFormField,
  RadioFormField,
  AddressFormFields,
  TagsFormField
} from './CRMFormFields'

// Import schemas and types
import {
  contactFormSchema,
  organizationFormSchema,
  productFormSchema,
  opportunityFormSchema,
  interactionFormSchemaExtended,
  createFormStepSchema,
  ORGANIZATION_TYPES,
  PRIORITY_LEVELS,
  STATUS_OPTIONS,
  OPPORTUNITY_STAGES,
  INTERACTION_TYPES,
  type ContactFormData,
  type OrganizationFormData,
  type ProductFormData,
  type OpportunityFormData,
  type InteractionFormData
} from './CRMFormSchemas'

// Form step interface
export interface FormStep {
  id: string
  title: string
  description: string
  fields: string[]
  validation?: z.ZodTypeAny
  optional?: boolean
}

// Form builder props
interface CRMFormBuilderProps<T extends Record<string, any>> {
  schema: z.ZodSchema<T>
  steps?: FormStep[]
  defaultValues?: Partial<T>
  onSubmit: (data: T) => Promise<void> | void
  onDraft?: (data: Partial<T>) => Promise<void> | void
  title?: string
  description?: string
  submitText?: string
  showProgress?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
  className?: string
  loading?: boolean
  children?: React.ReactNode
  renderCustomField?: (fieldName: string, control: any) => React.ReactNode | null
}

export function CRMFormBuilder<T extends Record<string, any>>({
  schema,
  steps,
  defaultValues,
  onSubmit,
  onDraft,
  title,
  description,
  submitText = 'Submit',
  showProgress = false,
  autoSave = false,
  autoSaveInterval = 30000, // 30 seconds
  className,
  loading = false,
  children,
  renderCustomField
}: CRMFormBuilderProps<T>) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // Form setup
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as T,
    mode: 'onChange'
  })

  const { control, handleSubmit, watch, formState: { errors, isDirty, isValid } } = form
  const watchedValues = watch()

  // Multi-step logic
  const isMultiStep = steps && steps.length > 1
  const currentStepData = isMultiStep ? steps[currentStep] : null
  const progress = isMultiStep ? ((currentStep + 1) / steps.length) * 100 : 100

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && onDraft && isDirty) {
      const interval = setInterval(async () => {
        try {
          await onDraft(watchedValues)
          setLastSavedAt(new Date())
          toast.success('Draft saved', {
            duration: 2000,
            position: 'bottom-right'
          })
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }, autoSaveInterval)

      return () => clearInterval(interval)
    }
  }, [autoSave, onDraft, isDirty, watchedValues, autoSaveInterval])

  // Form submission
  const onSubmitHandler = async (data: T) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast.success('Form submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit form. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step navigation
  const nextStep = async () => {
    if (!isMultiStep || currentStep >= steps.length - 1) return

    const currentStepFields = steps[currentStep].fields
    const stepSchema = createFormStepSchema(schema, currentStepFields)
    
    try {
      await stepSchema.parseAsync(watchedValues)
      setCurrentStep(currentStep + 1)
    } catch (error) {
      toast.error('Please fix the errors before proceeding')
    }
  }

  const prevStep = () => {
    if (!isMultiStep || currentStep <= 0) return
    setCurrentStep(currentStep - 1)
  }

  // Get step validation status
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'pending'
  }

  // Render field based on type and name
  const renderField = (fieldName: string) => {
    // Check for custom field renderer first
    if (renderCustomField) {
      const customField = renderCustomField(fieldName, control)
      if (customField) return customField
    }

    // Standard field rendering based on field name patterns
    switch (true) {
      // Email fields
      case fieldName.includes('email') || fieldName === 'email':
        return (
          <EmailFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            placeholder={getFieldPlaceholder(fieldName)}
          />
        )

      // Phone fields
      case fieldName.includes('phone') || fieldName.includes('Phone'):
        return (
          <PhoneFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            placeholder={getFieldPlaceholder(fieldName)}
          />
        )

      // URL fields
      case fieldName.includes('url') || fieldName.includes('Url') || fieldName === 'website':
        return (
          <UrlFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            placeholder={getFieldPlaceholder(fieldName)}
          />
        )

      // Currency fields
      case fieldName.includes('price') || fieldName.includes('Price') || fieldName.includes('revenue') || fieldName === 'value':
        return (
          <CurrencyFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            placeholder={getFieldPlaceholder(fieldName)}
          />
        )

      // Date fields
      case fieldName.includes('date') || fieldName.includes('Date'):
        return (
          <DateFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            placeholder={getFieldPlaceholder(fieldName)}
          />
        )

      // Textarea fields
      case fieldName === 'description' || fieldName === 'notes' || fieldName === 'specifications':
        return (
          <TextareaFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            placeholder={getFieldPlaceholder(fieldName)}
            rows={fieldName === 'specifications' ? 5 : 3}
          />
        )

      // Select fields
      case fieldName === 'type':
        return (
          <SelectFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            options={ORGANIZATION_TYPES}
            placeholder="Select type"
          />
        )

      case fieldName === 'priority':
        return (
          <SelectFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            options={PRIORITY_LEVELS}
            placeholder="Select priority"
          />
        )

      case fieldName === 'status':
        return (
          <SelectFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            options={STATUS_OPTIONS}
            placeholder="Select status"
          />
        )

      case fieldName === 'stage':
        return (
          <SelectFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            options={OPPORTUNITY_STAGES}
            placeholder="Select stage"
          />
        )

      case fieldName === 'interactionType':
        return (
          <SelectFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            options={INTERACTION_TYPES}
            placeholder="Select interaction type"
          />
        )

      // Boolean fields
      case fieldName.includes('OptIn') || fieldName.includes('Required') || fieldName.startsWith('is') || fieldName.startsWith('has'):
        return (
          <CheckboxFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            description={getFieldDescription(fieldName)}
          />
        )

      // Tags field
      case fieldName === 'tags':
        return (
          <TagsFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            placeholder="Add tags..."
            maxTags={10}
            suggestions={getTagSuggestions(fieldName)}
          />
        )

      // Address fields
      case fieldName.includes('address') || fieldName.includes('Address'):
        return (
          <AddressFormFields
            key={fieldName}
            control={control}
            namePrefix={fieldName}
          />
        )

      // Default text field
      default:
        return (
          <TextFormField
            key={fieldName}
            control={control}
            name={fieldName as any}
            label={getFieldLabel(fieldName)}
            required={isFieldRequired(fieldName)}
            placeholder={getFieldPlaceholder(fieldName)}
          />
        )
    }
  }

  // Utility functions
  const getFieldLabel = (fieldName: string): string => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Id$/, ' ID')
      .replace(/Url$/, ' URL')
  }

  const getFieldPlaceholder = (fieldName: string): string => {
    const placeholders: Record<string, string> = {
      firstName: 'Enter first name',
      lastName: 'Enter last name',
      email: 'name@example.com',
      phone: '+1 (555) 123-4567',
      website: 'https://example.com',
      name: 'Enter name',
      title: 'Enter job title',
      description: 'Enter description...',
      notes: 'Add notes...'
    }
    return placeholders[fieldName] || `Enter ${getFieldLabel(fieldName).toLowerCase()}`
  }

  const getFieldDescription = (fieldName: string): string | undefined => {
    const descriptions: Record<string, string> = {
      marketingOptIn: 'Allow marketing communications',
      followUpRequired: 'Schedule follow-up for this interaction'
    }
    return descriptions[fieldName]
  }

  const getTagSuggestions = (fieldName: string): string[] => {
    return ['Important', 'Follow-up', 'Hot Lead', 'VIP', 'New']
  }

  const isFieldRequired = (fieldName: string): boolean => {
    try {
      const fieldSchema = (schema.shape as any)[fieldName]
      if (!fieldSchema) return false
      return !fieldSchema.isOptional()
    } catch {
      return false
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{title}</h2>
              {autoSave && lastSavedAt && (
                <Badge variant="outline" className="text-xs">
                  Last saved {lastSavedAt.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Multi-step Progress */}
      {isMultiStep && showProgress && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Step {currentStep + 1} of {steps.length}
                </CardTitle>
                <CardDescription>
                  {currentStepData?.title}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
        </Card>
      )}

      {/* Step Navigation */}
      {isMultiStep && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                    getStepStatus(index) === 'completed' && "bg-primary border-primary text-primary-foreground",
                    getStepStatus(index) === 'current' && "border-primary text-primary bg-primary/10",
                    getStepStatus(index) === 'pending' && "border-muted-foreground text-muted-foreground"
                  )}
                >
                  {getStepStatus(index) === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2",
                      getStepStatus(index) === 'completed' ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
          <Card>
            <CardHeader>
              {isMultiStep && currentStepData && (
                <div>
                  <CardTitle>{currentStepData.title}</CardTitle>
                  <CardDescription>{currentStepData.description}</CardDescription>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Render fields */}
              {isMultiStep && currentStepData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentStepData.fields.map((fieldName) => renderField(fieldName))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(schema.shape || {}).map((fieldName) => renderField(fieldName))}
                </div>
              )}

              {/* Custom children */}
              {children}

              {/* Form errors */}
              {Object.keys(errors).length > 0 && (
                <div className="rounded-md bg-destructive/15 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-destructive">
                        Please fix the following errors:
                      </h3>
                      <div className="mt-2 text-sm text-destructive">
                        <ul className="list-disc list-inside space-y-1">
                          {Object.entries(errors).map(([field, error]) => (
                            <li key={field}>
                              {getFieldLabel(field)}: {error?.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMultiStep && currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {onDraft && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onDraft(watchedValues)}
                  disabled={isSubmitting || !isDirty}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              )}

              {isMultiStep && currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isSubmitting}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || loading || !isValid}
                >
                  {isSubmitting ? 'Submitting...' : submitText}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

// Pre-configured form builders for common CRM entities
export const ContactFormBuilder = (props: Omit<CRMFormBuilderProps<ContactFormData>, 'schema'>) => (
  <CRMFormBuilder schema={contactFormSchema} {...props} />
)

export const OrganizationFormBuilder = (props: Omit<CRMFormBuilderProps<OrganizationFormData>, 'schema'>) => (
  <CRMFormBuilder schema={organizationFormSchema} {...props} />
)

export const ProductFormBuilder = (props: Omit<CRMFormBuilderProps<ProductFormData>, 'schema'>) => (
  <CRMFormBuilder schema={productFormSchema} {...props} />
)

export const OpportunityFormBuilder = (props: Omit<CRMFormBuilderProps<OpportunityFormData>, 'schema'>) => (
  <CRMFormBuilder schema={opportunityFormSchema} {...props} />
)

export const InteractionFormBuilder = (props: Omit<CRMFormBuilderProps<InteractionFormData>, 'schema'>) => (
  <CRMFormBuilder schema={interactionFormSchemaExtended} {...props} />
)