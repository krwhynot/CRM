import { useCallback } from 'react'
import { useCreateOpportunity } from './useOpportunities'
import { toast } from '@/lib/toast-styles'
import type { OpportunityFormData } from '@/types/opportunity.types'
import type { OpportunityInsert } from '@/types/entities'
import type { Database } from '@/lib/database.types'
import type { Organization } from '@/types/entities'

interface UseOpportunityFormSubmissionReturn {
  handleSubmit: (data: OpportunityFormData) => Promise<void>
  isLoading: boolean
  canSubmit: (selectedPrincipals: string[], isValid: boolean) => boolean
}

export const useOpportunityFormSubmission = (
  organizations: Organization[],
  selectedPrincipals: string[],
  onSuccess?: (opportunityId: string) => void
): UseOpportunityFormSubmissionReturn => {
  const createOpportunity = useCreateOpportunity()

  const handleSubmit = useCallback(
    async (data: OpportunityFormData) => {
      try {
        let opportunityName = 'Multi-Principal Opportunity'
        if (data.auto_generated_name) {
          const customerOrg = organizations.find((org) => org.id === data.organization_id)
          const principalNames = selectedPrincipals
            .map((id) => organizations.find((org) => org.id === id)?.name)
            .filter(Boolean)
            .join(', ')

          const context = data.opportunity_context || 'Opportunity'

          const date = new Date()
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

          if (customerOrg && principalNames) {
            opportunityName = `${customerOrg.name} - ${principalNames} - ${context} - ${monthYear}`
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { principals: _principals, ...opportunityFormData } = data

        // Extract principals for multi-principal workflows

        const opportunityData: Partial<OpportunityInsert> = {
          name: opportunityName,
          organization_id: opportunityFormData.organization_id,
          estimated_value: data.estimated_value || 0,
          stage: opportunityFormData.stage as Database['public']['Enums']['opportunity_stage'],
          contact_id: opportunityFormData.contact_id,
          estimated_close_date: opportunityFormData.estimated_close_date,
          notes: opportunityFormData.notes,
          description: `Multi-Principal Opportunity with principals: ${selectedPrincipals
            .map((id) => organizations.find((org) => org.id === id)?.name)
            .filter(Boolean)
            .join(', ')}`,
        }

        const result = await createOpportunity.mutateAsync(opportunityData as OpportunityInsert)

        toast.success('Multi-principal opportunity created successfully!')
        onSuccess?.(result.id)
      } catch (error) {
        // Handle opportunity creation errors
        toast.error('Failed to create opportunity. Please try again.')
      }
    },
    [organizations, selectedPrincipals, createOpportunity, onSuccess]
  )

  const canSubmit = useCallback((selectedPrincipals: string[], isValid: boolean) => {
    return selectedPrincipals.length > 0 && isValid
  }, [])

  return {
    handleSubmit,
    isLoading: createOpportunity.isPending,
    canSubmit,
  }
}
