import { SimpleForm, type SimpleFormField } from '@/components/forms'
import { opportunitySchema, type OpportunityFormData } from '@/types/opportunity.types'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { DB_STAGES, DEFAULT_OPPORTUNITY_STAGE } from '@/lib/opportunity-stage-mapping'

interface OpportunityFormProps {
  onSubmit: (data: OpportunityFormData) => Promise<void> | void
  initialData?: Partial<OpportunityFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

export function OpportunityForm({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save Opportunity',
  preselectedOrganization,
}: OpportunityFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()
  const principalOrganizations = organizations.filter((org) => org.type === 'principal')

  // Stage options based on available stages
  const stageOptions = DB_STAGES.map((stage) => ({
    value: stage,
    label: getStageLabel(stage),
    description: getStageDescription(stage),
  }))

  // Status options
  const statusOptions = [
    { value: 'Active', label: 'Active', description: 'Actively pursuing opportunity' },
    { value: 'On Hold', label: 'On Hold', description: 'Temporarily paused' },
    { value: 'Nurturing', label: 'Nurturing', description: 'Long-term relationship building' },
    { value: 'Qualified', label: 'Qualified', description: 'Qualified lead' },
    { value: 'Closed - Won', label: 'Closed - Won', description: 'Successfully closed' },
    { value: 'Closed - Lost', label: 'Closed - Lost', description: 'Lost opportunity' },
  ]

  // Context options for opportunity classification
  const contextOptions = [
    { value: 'Site Visit', label: 'Site Visit', description: 'Customer site visit or tour' },
    { value: 'Food Show', label: 'Food Show', description: 'Trade show or food exhibition' },
    {
      value: 'New Product Interest',
      label: 'New Product Interest',
      description: 'Interest in new product',
    },
    { value: 'Follow-up', label: 'Follow-up', description: 'Follow-up from previous interaction' },
    { value: 'Demo Request', label: 'Demo Request', description: 'Product demonstration request' },
    { value: 'Sampling', label: 'Sampling', description: 'Product sampling opportunity' },
    { value: 'Custom', label: 'Custom', description: 'Other context' },
  ]

  // Filter contacts based on selected organization
  const selectedOrgId = preselectedOrganization || initialData?.organization_id
  const availableContacts = selectedOrgId
    ? contacts.filter((contact) => contact.organization_id === selectedOrgId)
    : contacts

  // Create field definitions using SimpleForm pattern
  const fields: SimpleFormField[] = [
    // Basic Information
    {
      name: 'name',
      label: 'Opportunity Name',
      type: 'text',
      required: true,
      placeholder: 'Enter opportunity name',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
      placeholder: 'Detailed description of the opportunity...',
    },

    // Value & Timing
    {
      name: 'estimated_value',
      label: 'Estimated Value ($)',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      name: 'estimated_close_date',
      label: 'Estimated Close Date',
      type: 'date',
    },
    {
      name: 'probability',
      label: 'Win Probability (%)',
      type: 'number',
      min: 0,
      max: 100,
      placeholder: '50',
    },

    // Relationships
    {
      name: 'organization_id',
      label: 'Customer Organization',
      type: 'select',
      required: true,
      options: organizations.map((org) => ({
        value: org.id,
        label: org.name,
        description: `${org.type} - ${org.segment || 'No segment'}`,
      })),
      placeholder: 'Select customer organization',
    },
    {
      name: 'contact_id',
      label: 'Primary Contact',
      type: 'select',
      options: availableContacts.map((contact) => ({
        value: contact.id,
        label: `${contact.first_name} ${contact.last_name}`,
        description: contact.title || contact.role || 'Contact',
      })),
      placeholder: 'Select primary contact (optional)',
    },
    {
      name: 'principal_id',
      label: 'Principal',
      type: 'select',
      options: principalOrganizations.map((org) => ({
        value: org.id,
        label: org.name,
        description: `Principal - ${org.segment || 'No segment'}`,
      })),
      placeholder: 'Select principal (optional)',
    },

    // Sales Process
    {
      name: 'stage',
      label: 'Sales Stage',
      type: 'select',
      required: true,
      options: stageOptions,
      placeholder: 'Select sales stage',
    },
    {
      name: 'status',
      label: 'Opportunity Status',
      type: 'select',
      required: true,
      options: statusOptions,
      placeholder: 'Select status',
    },

    // Context & Classification
    {
      name: 'opportunity_context',
      label: 'Opportunity Context',
      type: 'select',
      options: contextOptions,
      placeholder: 'Select context (optional)',
    },
    {
      name: 'deal_owner',
      label: 'Deal Owner',
      type: 'text',
      placeholder: 'Sales person or team responsible',
    },

    // Additional Information
    {
      name: 'notes',
      label: 'Internal Notes',
      type: 'textarea',
      rows: 2,
      placeholder: 'Internal notes about this opportunity...',
    },
  ]

  // Handle preselected values
  const enhancedInitialData = {
    stage: DEFAULT_OPPORTUNITY_STAGE,
    status: 'Active' as
      | 'Active'
      | 'On Hold'
      | 'Nurturing'
      | 'Qualified'
      | 'Closed - Won'
      | 'Closed - Lost',
    ...initialData,
    ...(preselectedOrganization && { organization_id: preselectedOrganization }),
  }

  return (
    <SimpleForm<OpportunityFormData>
      fields={fields}
      onSubmit={onSubmit}
      validationSchema={opportunitySchema}
      defaultValues={enhancedInitialData}
      loading={loading}
      submitLabel={submitLabel}
      showReset={true}
      showProgress={true}
    />
  )
}

// Helper functions for stage and context display
function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    // New stages
    lead: 'Lead',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed_won: 'Closed - Won',
    closed_lost: 'Closed - Lost',
    // Legacy stages
    'New Lead': 'New Lead',
    'Initial Outreach': 'Initial Outreach',
    'Sample/Visit Offered': 'Sample/Visit Offered',
    'Awaiting Response': 'Awaiting Response',
    'Feedback Logged': 'Feedback Logged',
    'Demo Scheduled': 'Demo Scheduled',
    'Closed - Won': 'Closed - Won',
    'Closed - Lost': 'Closed - Lost',
  }
  return labels[stage] || stage
}

function getStageDescription(stage: string): string {
  const descriptions: Record<string, string> = {
    // New stages
    lead: 'Initial lead or inquiry',
    qualified: 'Qualified and engaged prospect',
    proposal: 'Proposal submitted to customer',
    negotiation: 'In active negotiation',
    closed_won: 'Successfully closed opportunity',
    closed_lost: 'Lost or abandoned opportunity',
    // Legacy stages
    'New Lead': 'Initial lead or inquiry',
    'Initial Outreach': 'First contact made',
    'Sample/Visit Offered': 'Sample or visit has been offered',
    'Awaiting Response': 'Waiting for customer response',
    'Feedback Logged': 'Customer feedback received',
    'Demo Scheduled': 'Product demonstration scheduled',
    'Closed - Won': 'Successfully closed opportunity',
    'Closed - Lost': 'Lost or abandoned opportunity',
  }
  return descriptions[stage] || 'Sales stage'
}
