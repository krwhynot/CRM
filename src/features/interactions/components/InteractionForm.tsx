import { SimpleForm, type SimpleFormField } from '@/components/forms'
import { interactionSchema, type InteractionFormData } from '@/types/interaction.types'
import { INTERACTION_TYPES } from '@/constants/interaction.constants'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'

interface InteractionFormProps {
  onSubmit: (data: InteractionFormData) => Promise<void> | void
  initialData?: Partial<InteractionFormData>
  loading?: boolean
  submitLabel?: string
  defaultOpportunityId?: string
  preselectedContactId?: string
  preselectedOrganizationId?: string
}

export function InteractionForm({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save Interaction',
  defaultOpportunityId,
  preselectedContactId,
  preselectedOrganizationId,
}: InteractionFormProps) {
  const { data: opportunities = [] } = useOpportunities()
  const { data: contacts = [] } = useContacts()
  const { data: organizations = [] } = useOrganizations()

  // Interaction type options
  const interactionTypeOptions = INTERACTION_TYPES.map((type) => ({
    value: type,
    label: getInteractionTypeLabel(type),
    description: getInteractionTypeDescription(type),
  }))

  // Outcome options
  const outcomeOptions = [
    { value: 'successful', label: 'Successful', description: 'Positive outcome achieved' },
    {
      value: 'follow_up_needed',
      label: 'Follow-up Needed',
      description: 'Requires additional follow-up',
    },
    { value: 'not_interested', label: 'Not Interested', description: 'Contact not interested' },
    { value: 'postponed', label: 'Postponed', description: 'Decision postponed' },
    { value: 'no_response', label: 'No Response', description: 'No response received' },
  ]

  // Create field definitions using SimpleForm pattern
  const fields: SimpleFormField[] = [
    // Basic Information
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      required: true,
      placeholder: 'Brief description of interaction',
    },
    {
      name: 'type',
      label: 'Interaction Type',
      type: 'select',
      required: true,
      options: interactionTypeOptions,
      placeholder: 'Select interaction type',
    },
    {
      name: 'interaction_date',
      label: 'Date',
      type: 'date',
      required: true,
    },
    {
      name: 'duration_minutes',
      label: 'Duration (minutes)',
      type: 'number',
      min: 1,
      placeholder: '30',
    },

    // Relationships
    {
      name: 'opportunity_id',
      label: 'Related Opportunity',
      type: 'select',
      options: opportunities.map((opp) => ({
        value: opp.id,
        label: opp.name,
        description: `${opp.stage} - ${opp.estimated_value ? `$${opp.estimated_value}` : 'No value'}`,
      })),
      placeholder: 'Select opportunity (optional)',
    },
    {
      name: 'contact_id',
      label: 'Contact',
      type: 'select',
      options: contacts.map((contact) => ({
        value: contact.id,
        label: `${contact.first_name} ${contact.last_name}`,
        description: contact.title || contact.role || 'Contact',
      })),
      placeholder: 'Select contact (optional)',
    },
    {
      name: 'organization_id',
      label: 'Organization',
      type: 'select',
      options: organizations.map((org) => ({
        value: org.id,
        label: org.name,
        description: `${org.type} - ${org.segment || 'No segment'}`,
      })),
      placeholder: 'Select organization (optional)',
    },

    // Content
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 4,
      placeholder: 'Detailed notes about the interaction...',
    },
    {
      name: 'outcome',
      label: 'Outcome',
      type: 'select',
      options: outcomeOptions,
      placeholder: 'Select outcome',
    },

    // Follow-up
    {
      name: 'follow_up_required',
      label: 'Follow-up Required',
      type: 'switch',
      switchLabel: 'This interaction requires follow-up action',
    },
    {
      name: 'follow_up_date',
      label: 'Follow-up Date',
      type: 'date',
    },
    {
      name: 'follow_up_notes',
      label: 'Follow-up Notes',
      type: 'textarea',
      rows: 2,
      placeholder: 'Notes about required follow-up...',
    },

    // Additional Information
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Meeting location or platform',
    },
    {
      name: 'notes',
      label: 'Additional Notes',
      type: 'textarea',
      rows: 2,
      placeholder: 'Any additional notes...',
    },
  ]

  // Handle preselected values
  const enhancedInitialData = {
    ...initialData,
    ...(defaultOpportunityId && { opportunity_id: defaultOpportunityId }),
    ...(preselectedContactId && { contact_id: preselectedContactId }),
    ...(preselectedOrganizationId && { organization_id: preselectedOrganizationId }),
    interaction_date: initialData?.interaction_date || new Date().toISOString().split('T')[0],
  }

  return (
    <SimpleForm<InteractionFormData>
      fields={fields}
      onSubmit={onSubmit}
      validationSchema={interactionSchema}
      defaultValues={enhancedInitialData}
      loading={loading}
      submitLabel={submitLabel}
      showReset={true}
    />
  )
}

// Helper functions for interaction type display
function getInteractionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    call: 'Phone Call',
    email: 'Email',
    meeting: 'Meeting',
    demo: 'Demo/Presentation',
    proposal: 'Proposal',
    follow_up: 'Follow-up',
    trade_show: 'Trade Show',
    site_visit: 'Site Visit',
    contract_review: 'Contract Review',
  }
  return labels[type] || type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function getInteractionTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    call: 'Phone call or voice conversation',
    email: 'Email communication',
    meeting: 'In-person or virtual meeting',
    demo: 'Product demonstration or presentation',
    proposal: 'Proposal submission or review',
    follow_up: 'Follow-up communication',
    trade_show: 'Trade show or exhibition contact',
    site_visit: 'Customer site visit',
    contract_review: 'Contract or agreement review',
  }
  return descriptions[type] || 'Interaction type'
}
