import { useForm } from 'react-hook-form'
import { useMemo } from 'react'
import { opportunitySchema, type OpportunityFormData } from '@/types/opportunity.types'
import { createTypeSafeResolver } from '@/lib/form-resolver'
import { DEFAULT_OPPORTUNITY_STAGE } from '@/lib/opportunity-stage-mapping'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'

interface UseOpportunityFormProps {
  preselectedOrganization?: string
  preselectedContact?: string
}

export interface UseOpportunityFormReturn {
  // Form methods
  register: ReturnType<typeof useForm<OpportunityFormData>>['register']
  handleSubmit: ReturnType<typeof useForm<OpportunityFormData>>['handleSubmit']
  setValue: ReturnType<typeof useForm<OpportunityFormData>>['setValue']
  watch: ReturnType<typeof useForm<OpportunityFormData>>['watch']
  trigger: ReturnType<typeof useForm<OpportunityFormData>>['trigger']
  formState: ReturnType<typeof useForm<OpportunityFormData>>['formState']
  
  // Derived data
  organizations: ReturnType<typeof useOrganizations>['data']
  contacts: ReturnType<typeof useContacts>['data']
  filteredContacts: ReturnType<typeof useContacts>['data']
  watchedValues: OpportunityFormData
  selectedOrganization: string
  
  // Validation helpers
  getStepValidation: (step: number) => Promise<boolean>
  validateStepsRange: (fromStep: number, toStep: number) => Promise<boolean>
}

export const useOpportunityForm = ({
  preselectedOrganization,
  preselectedContact
}: UseOpportunityFormProps = {}): UseOpportunityFormReturn => {
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()

  const form = useForm<OpportunityFormData>({
    resolver: createTypeSafeResolver<OpportunityFormData>(opportunitySchema),
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
      deal_owner: null
    }
  })

  const { watch, trigger } = form
  const watchedValues = watch()
  const selectedOrganization = watch('organization_id')

  // Filter contacts by selected organization
  const filteredContacts = useMemo(() => {
    return selectedOrganization 
      ? contacts.filter(contact => contact.organization_id === selectedOrganization)
      : contacts
  }, [selectedOrganization, contacts])

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

  return {
    // Form methods
    register: form.register,
    handleSubmit: form.handleSubmit,
    setValue: form.setValue,
    watch: form.watch,
    trigger: form.trigger,
    formState: form.formState,
    
    // Derived data
    organizations,
    contacts,
    filteredContacts,
    watchedValues,
    selectedOrganization,
    
    // Validation helpers
    getStepValidation,
    validateStepsRange
  }
}