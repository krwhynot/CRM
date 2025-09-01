import { MessageSquare } from 'lucide-react'
import { interactionSchema, type InteractionFormData } from '@/types/interaction.types'
import { INTERACTION_TYPES } from '@/constants/interaction.constants'
import type { CoreFormLayoutProps, SelectOption } from '@/components/forms/CoreFormLayout'

// Interaction type configuration
const typeOptions: SelectOption[] = INTERACTION_TYPES.map(type => ({
  value: type,
  label: getTypeLabel(type),
  description: getTypeDescription(type),
  icon: getTypeIcon(type)
}))

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'call': 'Phone Call',
    'email': 'Email',
    'meeting': 'Meeting',
    'demo': 'Product Demo',
    'proposal': 'Proposal',
    'follow_up': 'Follow-up',
    'trade_show': 'Trade Show',
    'site_visit': 'Site Visit',
    'contract_review': 'Contract Review'
  }
  return labels[type] || type.replace('_', ' ').toUpperCase()
}

function getTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    'call': 'Phone conversation with contact or prospect',
    'email': 'Email communication or correspondence',
    'meeting': 'In-person or virtual meeting',
    'demo': 'Product demonstration or presentation',
    'proposal': 'Proposal presentation or submission',
    'follow_up': 'Follow-up communication or check-in',
    'trade_show': 'Trade show or industry event interaction',
    'site_visit': 'On-site visit or facility tour',
    'contract_review': 'Contract discussion or review meeting'
  }
  return descriptions[type] || 'Customer interaction activity'
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'call': '📞',
    'email': '📧',
    'meeting': '🤝',
    'demo': '🎪',
    'proposal': '📋',
    'follow_up': '🔄',
    'trade_show': '🎪',
    'site_visit': '🏢',
    'contract_review': '📑'
  }
  return icons[type] || '💬'
}

export function createInteractionFormConfig(
  initialData?: Partial<InteractionFormData>
): Omit<CoreFormLayoutProps<InteractionFormData>, 'onSubmit'> {
  return {
    entityType: 'activity',
    title: 'Interaction',
    icon: MessageSquare,
    formSchema: interactionSchema,
    initialData,
    
    coreSections: [
      {
        id: 'basic-info',
        title: 'Interaction Information',
        layout: 'double',
        fields: [
          {
            name: 'subject',
            type: 'text',
            label: 'Subject',
            placeholder: 'Enter interaction subject',
            required: true,
            className: 'md:col-span-2'
          },
          {
            name: 'type',
            type: 'select',
            label: 'Type',
            required: true,
            tooltip: 'Type of interaction or communication',
            options: typeOptions
          },
          {
            name: 'interaction_date',
            type: 'text', // Will be handled as date input in the renderer
            label: 'Date',
            placeholder: 'Select date',
            required: true,
            tooltip: 'Date when the interaction occurred'
          }
        ]
      },
      {
        id: 'opportunity-assignment',
        title: 'Opportunity Assignment',
        description: 'Link this interaction to an opportunity',
        layout: 'single',
        fields: [
          {
            name: 'opportunity_id',
            type: 'select',
            label: 'Opportunity',
            required: true,
            tooltip: 'The opportunity this interaction relates to',
            // Note: options will be populated dynamically from opportunities data
            options: []
          }
        ]
      }
    ],
    
    optionalSections: [
      {
        id: 'interaction-details',
        title: 'Interaction Details',
        layout: 'single',
        fields: [
          {
            name: 'location',
            type: 'text',
            label: 'Location',
            placeholder: 'Meeting location, phone, or platform',
            description: 'Where the interaction took place (address, phone, video platform, etc.)'
          },
          {
            name: 'notes',
            type: 'textarea',
            label: 'Notes',
            placeholder: 'Detailed notes about the interaction...',
            description: 'Comprehensive notes about what was discussed, outcomes, and observations'
          }
        ]
      },
      {
        id: 'follow-up-tracking',
        title: 'Follow-up Tracking',
        layout: 'double',
        fields: [
          {
            name: 'follow_up_required',
            type: 'switch',
            label: 'Follow-up Required',
            description: 'Mark if this interaction requires follow-up action'
          },
          {
            name: 'follow_up_date',
            type: 'text', // Will be handled as date input in the renderer
            label: 'Follow-up Date',
            placeholder: 'Select follow-up date',
            conditional: (values: InteractionFormData) => values.follow_up_required === true,
            tooltip: 'When to follow up on this interaction'
          }
        ]
      }
    ],
    
    contextualSections: [
      {
        condition: (values: InteractionFormData) => values.type === 'demo' || values.type === 'proposal',
        section: {
          id: 'sales-activity-details',
          title: 'Sales Activity Details',
          description: 'Additional details for sales-focused interactions',
          fields: [
            {
              name: 'notes',
              type: 'textarea',
              label: 'Demo/Proposal Details',
              placeholder: 'Products demonstrated, proposal specifics, customer response...',
              description: 'Detailed information about the demonstration or proposal presented'
            }
          ]
        }
      },
      {
        condition: (values: InteractionFormData) => values.type === 'trade_show' || values.type === 'site_visit',
        section: {
          id: 'event-location-details',
          title: 'Event & Location Details',
          description: 'Additional context for event-based interactions',
          fields: [
            {
              name: 'location',
              type: 'text',
              label: 'Event/Location Details',
              placeholder: 'Event name, booth number, facility address...',
              description: 'Specific details about the event or location'
            },
            {
              name: 'notes',
              type: 'textarea',
              label: 'Event Outcomes',
              placeholder: 'Attendees met, leads generated, products showcased...',
              description: 'Key outcomes and contacts made during the event'
            }
          ]
        }
      },
      {
        condition: (values: InteractionFormData) => values.follow_up_required === true,
        section: {
          id: 'follow-up-details',
          title: 'Follow-up Planning',
          description: 'Plan next steps and follow-up actions',
          fields: [
            {
              name: 'notes',
              type: 'textarea',
              label: 'Follow-up Action Plan',
              placeholder: 'Specific actions to take, people to contact, materials to send...',
              description: 'Detailed plan for follow-up activities and next steps'
            }
          ]
        }
      }
    ]
  }
}

export default createInteractionFormConfig