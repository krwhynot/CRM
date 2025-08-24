import { useForm } from 'react-hook-form'
import { opportunitySchema, type OpportunityFormData } from '@/types/opportunity.types'
import { createTypeSafeResolver } from '@/lib/form-resolver'
import { DEFAULT_OPPORTUNITY_STAGE } from '@/lib/opportunity-stage-mapping'

interface UseMultiPrincipalFormStateReturn {
  form: ReturnType<typeof useForm<OpportunityFormData>>
  watchedOrganization: string
}

export const useMultiPrincipalFormState = (
  preselectedOrganization?: string
): UseMultiPrincipalFormStateReturn => {
  const form = useForm<OpportunityFormData>({
    resolver: createTypeSafeResolver<OpportunityFormData>(opportunitySchema),
    defaultValues: {
      name: '',
      organization_id: preselectedOrganization || '',
      estimated_value: 0,
      stage: DEFAULT_OPPORTUNITY_STAGE,
      contact_id: null,
      estimated_close_date: null,
      description: null,
      notes: null,
      principals: [],
      product_id: null,
      opportunity_context: 'New Product Interest',
      auto_generated_name: true,
      principal_id: null,
      probability: null,
      deal_owner: null
    }
  })

  const watchedOrganization = form.watch('organization_id')

  return {
    form,
    watchedOrganization
  }
}