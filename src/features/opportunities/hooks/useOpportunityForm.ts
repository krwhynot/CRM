import { useForm } from 'react-hook-form'
import { useMemo } from 'react'
import { opportunityZodSchema, type OpportunityZodFormData } from '@/types/opportunity.types'
import { createResolver } from '@/lib/form-resolver'
import { DEFAULT_OPPORTUNITY_STAGE } from '@/lib/opportunity-stage-mapping'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { useContacts } from '@/features/contacts/hooks/useContacts'

interface UseOpportunityFormProps {
  preselectedOrganization?: string
  preselectedContact?: string
}

export interface UseOpportunityFormReturn<T = OpportunityZodFormData> {
  // Form methods
  register: ReturnType<typeof useForm<T>>['register']
  handleSubmit: ReturnType<typeof useForm<T>>['handleSubmit']
  setValue: ReturnType<typeof useForm<T>>['setValue']
  watch: ReturnType<typeof useForm<T>>['watch']
  trigger: ReturnType<typeof useForm<T>>['trigger']
  formState: ReturnType<typeof useForm<T>>['formState']
  errors: ReturnType<typeof useForm<T>>['formState']['errors']

  // Derived data
  organizations: ReturnType<typeof useOrganizations>['data']
  contacts: ReturnType<typeof useContacts>['data']
  filteredContacts: ReturnType<typeof useContacts>['data']
  watchedValues: T
  selectedOrganization: string

  // Validation helpers
  getStepValidation: (step: number) => Promise<boolean>
  validateStepsRange: (fromStep: number, toStep: number) => Promise<boolean>
  validateField: (fieldName: keyof T) => Promise<boolean>
  getFieldErrors: (fieldName: keyof T) => string[]

  // Schema info
  isUsingZodSchema: boolean
  validationSchema: typeof opportunityZodSchema
}

export const useOpportunityForm = ({
  preselectedOrganization,
  preselectedContact,
}: UseOpportunityFormProps = {}): UseOpportunityFormReturn<OpportunityZodFormData> => {
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()

  // Use Zod schema only
  const schema = opportunityZodSchema
  const resolver = createResolver(opportunityZodSchema)

  const form = useForm<OpportunityZodFormData>({
    resolver,
    mode: 'onBlur',
    defaultValues: {
      name: '',
      organization_id: preselectedOrganization || '',
      estimated_value: 0,
      stage: DEFAULT_OPPORTUNITY_STAGE,
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
      deal_owner: null,
    } as OpportunityZodFormData,
  })

  const { watch, trigger } = form
  const watchedValues = watch()
  const selectedOrganization = watch('organization_id')

  // Filter contacts by selected organization
  const filteredContacts = useMemo(() => {
    return selectedOrganization
      ? contacts.filter((contact) => contact.organization_id === selectedOrganization)
      : contacts
  }, [selectedOrganization, contacts])

  const getStepValidation = async (step: number): Promise<boolean> => {
    // Enhanced step validation with Zod-specific handling
    switch (step) {
      case 1:
        return await trigger(['name'])
      case 2:
        return await trigger(['organization_id'])
      case 3:
        return await trigger(['stage'])
      case 4:
        // Validate financial fields
        return await trigger(['estimated_value', 'probability'])
      case 5:
        return await trigger(['estimated_close_date'])
      default:
        return true
    }
  }

  const validateStepsRange = async (fromStep: number, toStep: number): Promise<boolean> => {
    let canProceed = true
    for (let i = fromStep; i < toStep; i++) {
      const isValid = await getStepValidation(i)
      if (!isValid) {
        canProceed = false
        break
      }
    }
    return canProceed
  }

  // Enhanced field validation for individual field checking
  const validateField = async (fieldName: keyof OpportunityZodFormData): Promise<boolean> => {
    return await trigger([fieldName as never])
  }

  // Get formatted errors for specific field
  const getFieldErrors = (fieldName: keyof OpportunityZodFormData): string[] => {
    const fieldError = form.formState.errors[fieldName as never]
    if (!fieldError) return []

    // Handle Zod error format
    if (fieldError) {
      if (Array.isArray(fieldError)) {
        return fieldError.map((err) => err.message || 'Invalid value')
      }
      return [fieldError.message || 'Invalid value']
    }

    return []
  }

  return {
    // Form methods
    register: form.register,
    handleSubmit: form.handleSubmit as never,
    setValue: form.setValue,
    watch: form.watch,
    trigger: form.trigger,
    formState: form.formState,
    errors: form.formState.errors,

    // Derived data
    organizations,
    contacts,
    filteredContacts,
    watchedValues,
    selectedOrganization,

    // Validation helpers
    getStepValidation,
    validateStepsRange,
    validateField,
    getFieldErrors,

    // Schema info
    isUsingZodSchema: true,
    validationSchema: schema,
  }
}
