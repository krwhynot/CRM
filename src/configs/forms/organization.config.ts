import { Building2 } from 'lucide-react'
import { organizationSchema, type OrganizationFormData, FOOD_SERVICE_SEGMENTS, type FoodServiceSegment, type OrganizationPriority } from '@/types/organization.types'
import type { CoreFormLayoutProps, SelectOption } from '@/components/forms/CoreFormLayout'

// Priority configuration for Principal CRM
const priorityOptions: SelectOption[] = [
  {
    value: 'A',
    label: 'A - High Priority',
    description: 'Strategic accounts with high revenue potential and strong relationships',
    icon: '🎯'
  },
  {
    value: 'B',
    label: 'B - Medium Priority',
    description: 'Important accounts with good potential for growth and expansion',
    icon: '📈'
  },
  {
    value: 'C',
    label: 'C - Standard Priority',
    description: 'Regular accounts requiring standard attention and service',
    icon: '📊'
  },
  {
    value: 'D',
    label: 'D - Low Priority',
    description: 'Cold prospects or low-engagement accounts needing nurturing',
    icon: '❄️'
  }
]

// Segment configuration for food service industry
const segmentOptions: SelectOption[] = FOOD_SERVICE_SEGMENTS.map(segment => ({
  value: segment,
  label: segment,
  description: getSegmentDescription(segment)
}))

function getSegmentDescription(segment: FoodServiceSegment): string {
  const descriptions: Record<FoodServiceSegment, string> = {
    'Fine Dining': 'High-end restaurants focused on premium ingredients and presentation',
    'Fast Food': 'Quick service restaurants emphasizing speed and consistency',
    'Fast Casual': 'Higher quality fast food with made-to-order items',
    'Healthcare': 'Hospitals, clinics, and medical facilities',
    'Education': 'Schools, universities, and educational institutions',
    'Corporate Catering': 'Business catering and corporate dining services',
    'Hotel & Resort': 'Hospitality industry including hotels and resorts',
    'Entertainment Venue': 'Sports venues, theaters, and entertainment facilities',
    'Retail Food Service': 'Grocery stores and retail food operations',
    'Government': 'Government agencies and military food service',
    'Senior Living': 'Assisted living and senior care facilities',
    'Other': 'Specialized or unique food service operations'
  }
  return descriptions[segment]
}

export function createOrganizationFormConfig(
  initialData?: Partial<OrganizationFormData>
): Omit<CoreFormLayoutProps<OrganizationFormData>, 'onSubmit'> {
  return {
    entityType: 'organization',
    title: 'Organization',
    icon: Building2,
    formSchema: organizationSchema,
    initialData,
    
    coreSections: [
      {
        id: 'basic-info',
        title: 'Essential Information',
        layout: 'double',
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Organization Name',
            placeholder: 'Enter organization name',
            required: true,
            className: 'md:col-span-2'
          },
          {
            name: 'priority',
            type: 'select',
            label: 'Account Priority',
            required: true,
            tooltip: 'Set the strategic importance and engagement level',
            options: priorityOptions
          },
          {
            name: 'segment',
            type: 'select',
            label: 'Food Service Segment',
            required: true,
            tooltip: 'Primary food service market segment',
            options: segmentOptions
          }
        ]
      },
      {
        id: 'organization-type',
        title: 'Organization Type',
        description: 'Define the business relationship',
        className: 'bg-amber-50 border border-amber-200 rounded-lg p-4',
        layout: 'double',
        fields: [
          {
            name: 'is_principal',
            type: 'switch',
            label: 'Principal Organization',
            description: 'Food manufacturer or supplier that we represent'
          },
          {
            name: 'is_distributor',
            type: 'switch', 
            label: 'Distributor Organization',
            description: 'Company that purchases and distributes our products'
          }
        ]
      }
    ],
    
    optionalSections: [
      {
        id: 'contact-info',
        title: 'Contact Information',
        layout: 'double',
        fields: [
          { 
            name: 'phone', 
            type: 'tel', 
            label: 'Phone', 
            placeholder: '(555) 123-4567' 
          },
          { 
            name: 'website', 
            type: 'url', 
            label: 'Website', 
            placeholder: 'https://www.company.com' 
          },
          { 
            name: 'account_manager', 
            type: 'text', 
            label: 'Account Manager',
            description: 'Primary person managing this account relationship',
            className: 'md:col-span-2'
          }
        ]
      },
      {
        id: 'address-info',
        title: 'Address Information',
        fields: [
          { 
            name: 'address', 
            type: 'text', 
            label: 'Street Address',
            placeholder: '123 Main Street, Suite 100',
            className: 'md:col-span-3'
          },
          { 
            name: 'city', 
            type: 'text', 
            label: 'City', 
            placeholder: 'City' 
          },
          { 
            name: 'state', 
            type: 'text', 
            label: 'State/Province', 
            placeholder: 'State' 
          },
          { 
            name: 'zip', 
            type: 'text', 
            label: 'ZIP/Postal Code', 
            placeholder: '12345' 
          }
        ],
        layout: 'auto'
      }
    ],
    
    contextualSections: [
      {
        condition: (values) => values.is_principal && Boolean(initialData?.id),
        section: {
          id: 'advocacy-summary',
          title: 'Contact Advocacy Summary',
          description: 'Advocacy relationships for this Principal organization',
          fields: [
            {
              name: 'notes', // Placeholder field - in real implementation this would be a custom component
              type: 'text',
              label: 'Advocacy Status',
              description: 'This section would show advocacy relationship data'
            }
          ]
        }
      }
    ]
  }
}

export default createOrganizationFormConfig