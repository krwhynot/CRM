import { Target } from 'lucide-react'
import { opportunitySchema, type OpportunityFormData } from '@/types/opportunity.types'
import { DB_STAGES } from '@/lib/opportunity-stage-mapping'
import type { CoreFormLayoutProps, SelectOption } from '@/components/forms/CoreFormLayout'

// Opportunity stage configuration
const stageOptions: SelectOption[] = DB_STAGES.map(stage => ({
  value: stage,
  label: stage,
  description: getStageDescription(stage),
  icon: getStageIcon(stage)
}))

function getStageDescription(stage: string): string {
  const descriptions: Record<string, string> = {
    'New Lead': 'Initial contact or lead identified',
    'Initial Outreach': 'First contact made with prospect',
    'Sample/Visit Offered': 'Samples provided or site visit scheduled',
    'Awaiting Response': 'Waiting for prospect response or feedback',
    'Feedback Logged': 'Received and documented prospect feedback',
    'Demo Scheduled': 'Product demonstration or presentation scheduled',
    'Closed - Won': 'Successfully closed opportunity',
    'Closed - Lost': 'Opportunity lost to competitor or no decision'
  }
  return descriptions[stage] || stage
}

function getStageIcon(stage: string): string {
  const icons: Record<string, string> = {
    'New Lead': '🎯',
    'Initial Outreach': '📞',
    'Sample/Visit Offered': '📦',
    'Awaiting Response': '⏳',
    'Feedback Logged': '📝',
    'Demo Scheduled': '🎪',
    'Closed - Won': '✅',
    'Closed - Lost': '❌'
  }
  return icons[stage] || '📋'
}

// Opportunity status configuration
const statusOptions: SelectOption[] = [
  {
    value: 'Active',
    label: 'Active',
    description: 'Actively pursuing this opportunity',
    icon: '🟢'
  },
  {
    value: 'On Hold',
    label: 'On Hold',
    description: 'Temporarily paused or delayed',
    icon: '🟡'
  },
  {
    value: 'Nurturing',
    label: 'Nurturing',
    description: 'Long-term relationship building',
    icon: '🌱'
  },
  {
    value: 'Qualified',
    label: 'Qualified',
    description: 'Qualified lead with confirmed interest',
    icon: '✔️'
  },
  {
    value: 'Closed - Won',
    label: 'Closed - Won',
    description: 'Successfully closed opportunity',
    icon: '🏆'
  },
  {
    value: 'Closed - Lost',
    label: 'Closed - Lost',
    description: 'Opportunity lost or cancelled',
    icon: '❌'
  }
]

// Opportunity context configuration
const contextOptions: SelectOption[] = [
  {
    value: 'Site Visit',
    label: 'Site Visit',
    description: 'Opportunity arising from on-site visit',
    icon: '🏢'
  },
  {
    value: 'Food Show',
    label: 'Food Show',
    description: 'Lead generated at trade show or expo',
    icon: '🎪'
  },
  {
    value: 'New Product Interest',
    label: 'New Product Interest',
    description: 'Interest in new or featured products',
    icon: '🆕'
  },
  {
    value: 'Follow-up',
    label: 'Follow-up',
    description: 'Follow-up from previous interaction',
    icon: '🔄'
  },
  {
    value: 'Demo Request',
    label: 'Demo Request',
    description: 'Specific request for product demonstration',
    icon: '🎯'
  },
  {
    value: 'Sampling',
    label: 'Sampling',
    description: 'Product sampling opportunity',
    icon: '🍽️'
  },
  {
    value: 'Custom',
    label: 'Custom',
    description: 'Other or custom opportunity context',
    icon: '⚡'
  }
]

export function createOpportunityFormConfig(
  initialData?: Partial<OpportunityFormData>
): Omit<CoreFormLayoutProps<OpportunityFormData>, 'onSubmit'> {
  return {
    entityType: 'opportunity',
    title: 'Opportunity',
    icon: Target,
    formSchema: opportunitySchema,
    initialData,
    
    coreSections: [
      {
        id: 'basic-info',
        title: 'Opportunity Information',
        layout: 'double',
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Opportunity Name',
            placeholder: 'Enter opportunity name',
            required: true,
            className: 'md:col-span-2'
          },
          {
            name: 'estimated_value',
            type: 'number',
            label: 'Estimated Value',
            placeholder: '0.00',
            required: true,
            tooltip: 'Expected revenue value from this opportunity'
          },
          {
            name: 'estimated_close_date',
            type: 'text', // Will be handled as date input in the renderer
            label: 'Estimated Close Date',
            placeholder: 'Select date',
            tooltip: 'Expected date to close this opportunity'
          }
        ]
      },
      {
        id: 'organization-assignment',
        title: 'Organization Assignment',
        description: 'Associate this opportunity with an organization',
        layout: 'single',
        fields: [
          {
            name: 'organization_id',
            type: 'select',
            label: 'Organization',
            required: true,
            tooltip: 'The organization this opportunity relates to',
            // Note: options will be populated dynamically from organizations data
            options: []
          }
        ]
      },
      {
        id: 'stage-status',
        title: 'Stage & Status',
        layout: 'double',
        fields: [
          {
            name: 'stage',
            type: 'select',
            label: 'Stage',
            required: true,
            tooltip: 'Current stage in the sales funnel',
            options: stageOptions
          },
          {
            name: 'status',
            type: 'select',
            label: 'Status',
            tooltip: 'Overall status of the opportunity',
            options: statusOptions
          }
        ]
      }
    ],
    
    optionalSections: [
      {
        id: 'contact-details',
        title: 'Contact Details',
        layout: 'single',
        fields: [
          {
            name: 'contact_id',
            type: 'select',
            label: 'Primary Contact',
            tooltip: 'Main contact person for this opportunity',
            // Note: options will be filtered dynamically based on selected organization
            options: []
          }
        ]
      },
      {
        id: 'opportunity-details',
        title: 'Opportunity Details',
        layout: 'single',
        fields: [
          {
            name: 'description',
            type: 'textarea',
            label: 'Description',
            placeholder: 'Detailed description of the opportunity...',
            description: 'Comprehensive description of the opportunity and potential'
          },
          {
            name: 'notes',
            type: 'textarea',
            label: 'Notes',
            placeholder: 'Additional notes, comments, or observations...',
            description: 'Internal notes and observations about the opportunity'
          }
        ]
      },
      {
        id: 'context-classification',
        title: 'Context & Classification',
        layout: 'double',
        fields: [
          {
            name: 'opportunity_context',
            type: 'select',
            label: 'Opportunity Context',
            tooltip: 'How this opportunity was generated or identified',
            options: contextOptions
          },
          {
            name: 'probability',
            type: 'number',
            label: 'Win Probability (%)',
            placeholder: '0-100',
            description: 'Estimated probability of closing this opportunity (0-100%)'
          },
          {
            name: 'deal_owner',
            type: 'text',
            label: 'Deal Owner',
            placeholder: 'Sales representative or deal owner',
            description: 'Person responsible for managing this opportunity'
          },
          {
            name: 'principal_id',
            type: 'select',
            label: 'Primary Principal',
            tooltip: 'Primary principal organization involved in this opportunity',
            // Note: options will be populated dynamically from principal organizations
            options: []
          }
        ]
      }
    ],
    
    contextualSections: [
      {
        condition: (values: OpportunityFormData) => values.stage === 'Closed - Won' || values.stage === 'Closed - Lost',
        section: {
          id: 'closure-details',
          title: 'Closure Details',
          description: 'Additional information for closed opportunities',
          fields: [
            {
              name: 'notes',
              type: 'textarea',
              label: 'Closure Notes',
              placeholder: 'Reasons for win/loss, lessons learned, next steps...',
              description: 'Document the reasons for closure and any follow-up actions'
            }
          ]
        }
      },
      {
        condition: (values: OpportunityFormData) => Boolean(values.estimated_value) && Number(values.estimated_value) > 10000,
        section: {
          id: 'high-value-tracking',
          title: 'High-Value Opportunity Tracking',
          description: 'Additional tracking for high-value opportunities',
          fields: [
            {
              name: 'deal_owner',
              type: 'text',
              label: 'Executive Sponsor',
              placeholder: 'Executive or senior manager overseeing this opportunity',
              description: 'Senior leadership contact for high-value opportunities'
            },
            {
              name: 'principals',
              type: 'text', // This would be replaced with a multi-select component
              label: 'Involved Principals',
              description: 'Multiple principal organizations involved in this opportunity'
            }
          ]
        }
      },
      {
        condition: (values: OpportunityFormData) => values.opportunity_context === 'Food Show' || values.opportunity_context === 'Demo Request',
        section: {
          id: 'event-details',
          title: 'Event & Demo Details',
          description: 'Additional details for event-based or demo opportunities',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              label: 'Event/Demo Details',
              placeholder: 'Event name, location, demo specifics, attendees...',
              description: 'Details about the event, demonstration, or sampling activity'
            }
          ]
        }
      }
    ]
  }
}

export default createOpportunityFormConfig