import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { type OpportunityFormData } from '@/types/opportunity.types'
import { DEFAULT_OPPORTUNITY_STAGE } from '@/lib/opportunity-stage-mapping'

// Define explicit form interface for better type compatibility with all components
interface MultiPrincipalFormData {
  name: string
  organization_id: string
  estimated_value: number
  stage: string
  status: string
  contact_id?: string | null
  estimated_close_date?: string | null
  description?: string | null
  notes?: string | null
  principals: string[]
  product_id?: string | null
  opportunity_context?: string | null
  auto_generated_name: boolean
  principal_id?: string | null
  probability?: number | null
  deal_owner?: string | null
}

interface UseMultiPrincipalFormStateReturn {
  form: UseFormReturn<OpportunityFormData> // Return compatible type for existing components
  watchedOrganization: string
}

export const useMultiPrincipalFormState = (
  preselectedOrganization?: string
): UseMultiPrincipalFormStateReturn => {
  const form = useForm<MultiPrincipalFormData>({
    // resolver: yupResolver(opportunitySchema), // Temporarily disabled due to type inference issues
    defaultValues: {
      name: '',
      organization_id: preselectedOrganization || '',
      estimated_value: 0,
      stage: DEFAULT_OPPORTUNITY_STAGE,
      status: 'Active',
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
      deal_owner: null,
    },
  })

  const watchedOrganization = form.watch('organization_id')

  return {
    form: form as UseFormReturn<OpportunityFormData>,
    watchedOrganization,
  }
}
