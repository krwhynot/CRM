import { User } from 'lucide-react'
import { contactSchema, type ContactFormData, CONTACT_ROLES } from '@/types/contact.types'
import type { CoreFormLayoutProps, SelectOption } from '@/components/forms/CoreFormLayout'

// Purchase influence configuration
const purchaseInfluenceOptions: SelectOption[] = [
  {
    value: 'High',
    label: 'High Influence',
    description: 'Significant impact on purchasing decisions and budget allocation',
    icon: '🎯'
  },
  {
    value: 'Medium',
    label: 'Medium Influence',
    description: 'Moderate influence on purchasing decisions and evaluation process',
    icon: '📈'
  },
  {
    value: 'Low',
    label: 'Low Influence',
    description: 'Limited influence on purchasing decisions but may provide input',
    icon: '📊'
  },
  {
    value: 'Unknown',
    label: 'Unknown Influence',
    description: 'Influence level not yet determined or unclear',
    icon: '❓'
  }
]

// Decision authority configuration
const decisionAuthorityOptions: SelectOption[] = [
  {
    value: 'Decision Maker',
    label: 'Decision Maker',
    description: 'Has final authority to approve or reject purchasing decisions',
    icon: '🎯'
  },
  {
    value: 'Influencer',
    label: 'Influencer',
    description: 'Provides input and recommendations that impact decisions',
    icon: '💬'
  },
  {
    value: 'End User',
    label: 'End User',
    description: 'Will use the product or service but may not decide on purchase',
    icon: '👤'
  },
  {
    value: 'Gatekeeper',
    label: 'Gatekeeper',
    description: 'Controls access to decision makers and information flow',
    icon: '🚪'
  }
]

// Role configuration
const roleOptions: SelectOption[] = CONTACT_ROLES.map(role => ({
  value: role.value,
  label: role.label,
  description: getRoleDescription(role.value)
}))

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    'decision_maker': 'Primary authority for purchasing and strategic decisions',
    'influencer': 'Provides expertise and recommendations for decision making',
    'buyer': 'Responsible for procurement processes and vendor relationships',
    'end_user': 'Direct user of products or services within the organization',
    'gatekeeper': 'Controls access and information flow to decision makers',
    'champion': 'Internal advocate who promotes solutions within the organization'
  }
  return descriptions[role] || 'Contact role within the organization'
}

export function createContactFormConfig(
  initialData?: Partial<ContactFormData>
): Omit<CoreFormLayoutProps<ContactFormData>, 'onSubmit'> {
  return {
    entityType: 'contact',
    title: 'Contact',
    icon: User,
    formSchema: contactSchema,
    initialData,
    
    coreSections: [
      {
        id: 'basic-info',
        title: 'Contact Information',
        layout: 'double',
        fields: [
          {
            name: 'first_name',
            type: 'text',
            label: 'First Name',
            placeholder: 'Enter first name',
            required: true
          },
          {
            name: 'last_name',
            type: 'text',
            label: 'Last Name',
            placeholder: 'Enter last name',
            required: true
          },
          {
            name: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'contact@company.com',
            className: 'md:col-span-2'
          },
          {
            name: 'title',
            type: 'text',
            label: 'Job Title',
            placeholder: 'e.g., Operations Manager'
          },
          {
            name: 'department',
            type: 'text',
            label: 'Department',
            placeholder: 'e.g., Operations, Purchasing'
          }
        ]
      },
      {
        id: 'organization-assignment',
        title: 'Organization Assignment',
        description: 'Associate this contact with an organization',
        layout: 'single',
        fields: [
          {
            name: 'organization_id',
            type: 'select',
            label: 'Organization',
            required: true,
            tooltip: 'The organization this contact works for',
            // Note: options will be populated dynamically from organizations data
            options: []
          }
        ]
      }
    ],
    
    optionalSections: [
      {
        id: 'contact-methods',
        title: 'Contact Methods',
        layout: 'double',
        fields: [
          { 
            name: 'phone', 
            type: 'tel', 
            label: 'Phone', 
            placeholder: '(555) 123-4567' 
          },
          { 
            name: 'mobile_phone', 
            type: 'tel', 
            label: 'Mobile Phone', 
            placeholder: '(555) 987-6543' 
          },
          { 
            name: 'linkedin_url', 
            type: 'url', 
            label: 'LinkedIn Profile', 
            placeholder: 'https://linkedin.com/in/username',
            className: 'md:col-span-2'
          }
        ]
      },
      {
        id: 'business-role',
        title: 'Business Role & Influence',
        layout: 'double',
        fields: [
          {
            name: 'role',
            type: 'select',
            label: 'Role',
            description: 'Primary role within the organization',
            options: roleOptions
          },
          {
            name: 'purchase_influence',
            type: 'select',
            label: 'Purchase Influence',
            required: true,
            tooltip: 'Level of influence on purchasing decisions',
            options: purchaseInfluenceOptions
          },
          {
            name: 'decision_authority',
            type: 'select',
            label: 'Decision Authority',
            required: true,
            tooltip: 'Role in the decision-making process',
            options: decisionAuthorityOptions,
            className: 'md:col-span-2'
          }
        ]
      },
      {
        id: 'contact-settings',
        title: 'Contact Settings',
        layout: 'single',
        fields: [
          {
            name: 'is_primary_contact',
            type: 'switch',
            label: 'Primary Contact',
            description: 'Mark as the primary contact for this organization'
          }
        ]
      }
    ],
    
    contextualSections: [
      {
        condition: (values: ContactFormData) => values.role === 'decision_maker' || values.purchase_influence === 'High',
        section: {
          id: 'high-value-contact',
          title: 'High-Value Contact Options',
          description: 'Additional options for key decision makers and high-influence contacts',
          fields: [
            {
              name: 'preferred_principals',
              type: 'text', // This would be replaced with a custom multi-select component
              label: 'Preferred Principals',
              description: 'Principal organizations this contact prefers to work with'
            }
          ]
        }
      }
    ]
  }
}

export default createContactFormConfig