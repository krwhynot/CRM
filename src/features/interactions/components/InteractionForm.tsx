import { CoreFormLayout } from '@/components/forms/CoreFormLayout'
import { createInteractionFormConfig } from '@/configs/forms/interaction.config'
import { type InteractionFormData } from '@/types/interaction.types'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'

interface InteractionFormProps {
  onSubmit: (data: InteractionFormData) => void
  initialData?: Partial<InteractionFormData>
  loading?: boolean
  submitLabel?: string
  defaultOpportunityId?: string
  className?: string
}

export function InteractionForm({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save Interaction',
  defaultOpportunityId,
}: InteractionFormProps) {
  const { data: opportunities = [] } = useOpportunities()

  // Create form config with dynamic options
  const formConfig = createInteractionFormConfig(initialData)

  // Update opportunity options dynamically
  const opportunitySection = formConfig.coreSections.find(section => section.id === 'opportunity-assignment')
  if (opportunitySection) {
    const opportunityField = opportunitySection.fields.find(field => field.name === 'opportunity_id')
    if (opportunityField) {
      opportunityField.options = opportunities.map(opp => ({
        value: opp.id,
        label: opp.name,
        description: `${opp.stage} - $${opp.estimated_value?.toLocaleString() || '0'}`
      }))
    }
  }

  // Handle default opportunity ID
  const enhancedInitialData = defaultOpportunityId 
    ? { ...initialData, opportunity_id: defaultOpportunityId }
    : initialData

  const enhancedFormConfig = {
    ...formConfig,
    initialData: enhancedInitialData
  }

  return (
    <CoreFormLayout
      {...enhancedFormConfig}
      onSubmit={onSubmit}
      loading={loading}
      submitLabel={submitLabel}
    />
  )
}