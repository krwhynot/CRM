import { SimpleForm, type SimpleFormField } from '@/components/forms'
import { contactSchema, type ContactFormData, CONTACT_ROLES } from '@/types/contact.types'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { placeholderUrls } from '@/config/urls'

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void> | void
  initialData?: Partial<ContactFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

export function ContactForm({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save Contact',
  preselectedOrganization,
}: ContactFormProps) {
  const { data: organizations = [] } = useOrganizations()

  // Create field definitions using SimpleForm pattern with logical groupings
  const fields: SimpleFormField[] = [
    // Contact Info Section
    {
      type: 'heading',
      label: 'Contact Info',
    },
    {
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter first name',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Enter last name',
    },
    {
      name: 'title',
      label: 'Job Title',
      type: 'text',
      placeholder: 'e.g. Sales Manager',
    },

    // Communication Section
    {
      type: 'heading',
      label: 'Communication',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'contact@company.com',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '(555) 123-4567',
    },
    {
      name: 'mobile_phone',
      label: 'Mobile Phone',
      type: 'tel',
      placeholder: '(555) 123-4567',
    },

    // Organization Setup Section
    {
      type: 'heading',
      label: 'Organization Setup',
    },
    {
      name: 'organization_mode',
      label: 'Organization Setup',
      type: 'radio',
      options: [
        { value: 'existing', label: 'Select Existing Organization' },
        { value: 'new', label: 'Create New Organization' },
      ],
    },

    // Existing Organization Selection (shown when mode = 'existing')
    {
      name: 'organization_id',
      label: 'Select Organization',
      type: 'select',
      options: organizations.map((org) => ({
        value: org.id,
        label: org.name,
        description: `${org.type} - ${org.segment || 'No segment'}`,
      })),
      placeholder: 'Select organization',
      condition: (values) => values.organization_mode === 'existing',
    },

    // New Organization Fields (shown when mode = 'new')
    {
      name: 'organization_name',
      label: 'Organization Name',
      type: 'text',
      required: true,
      placeholder: 'Enter organization name',
      condition: (values) => values.organization_mode === 'new',
    },
    {
      name: 'organization_type',
      label: 'Organization Type',
      type: 'select',
      required: true,
      options: [
        { value: 'customer', label: 'Customer', description: 'Restaurant or food service establishment' },
        { value: 'principal', label: 'Principal', description: 'Manufacturer or brand' },
        { value: 'distributor', label: 'Distributor', description: 'Distribution company' },
        { value: 'prospect', label: 'Prospect', description: 'Potential customer' },
        { value: 'vendor', label: 'Vendor', description: 'Supplier or service provider' },
      ],
      placeholder: 'Select organization type',
      condition: (values) => values.organization_mode === 'new',
    },
    {
      name: 'organization_phone',
      label: 'Organization Phone',
      type: 'tel',
      placeholder: '(555) 123-4567',
      condition: (values) => values.organization_mode === 'new',
    },
    {
      name: 'organization_email',
      label: 'Organization Email',
      type: 'email',
      placeholder: 'contact@organization.com',
      condition: (values) => values.organization_mode === 'new',
    },
    {
      name: 'organization_website',
      label: 'Organization Website',
      type: 'url',
      placeholder: placeholderUrls.organization,
      condition: (values) => values.organization_mode === 'new',
    },

    // CRM Role Section
    {
      type: 'heading',
      label: 'CRM Role',
    },
    {
      name: 'role',
      label: 'Contact Role',
      type: 'select',
      options: CONTACT_ROLES.map((role) => ({
        value: role.value,
        label: role.label,
      })),
      placeholder: 'Select role',
    },
    {
      name: 'department',
      label: 'Department',
      type: 'text',
      placeholder: 'e.g. Sales, Marketing, Operations',
    },

    // Influence Assessment
    {
      name: 'purchase_influence',
      label: 'Purchase Influence',
      type: 'select',
      options: [
        {
          value: 'High',
          label: 'High Influence',
          description: 'Significant impact on purchasing decisions',
        },
        {
          value: 'Medium',
          label: 'Medium Influence',
          description: 'Moderate influence on decisions',
        },
        {
          value: 'Low',
          label: 'Low Influence',
          description: 'Limited influence but provides input',
        },
        { value: 'Unknown', label: 'Unknown', description: 'Influence level not yet determined' },
      ],
      placeholder: 'Select influence level',
    },
    {
      name: 'decision_authority',
      label: 'Decision Authority',
      type: 'select',
      options: [
        {
          value: 'Decision Maker',
          label: 'Decision Maker',
          description: 'Can make final purchasing decisions',
        },
        {
          value: 'Influencer',
          label: 'Influencer',
          description: 'Influences decisions but does not make final call',
        },
        { value: 'End User', label: 'End User', description: 'Will use the product/service' },
        {
          value: 'Gatekeeper',
          label: 'Gatekeeper',
          description: 'Controls access to decision makers',
        },
      ],
      placeholder: 'Select decision authority',
    },

    // Additional Info Section
    {
      type: 'heading',
      label: 'Additional Info',
    },
    {
      name: 'linkedin_url',
      label: 'LinkedIn Profile',
      type: 'url',
      placeholder: placeholderUrls.linkedin,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      rows: 3,
      placeholder: 'Additional notes about this contact...',
    },
  ]

  // Handle preselected organization and set default organization mode
  const enhancedInitialData = {
    organization_mode: 'existing' as 'existing' | 'new', // Default to existing organization mode
    ...initialData,
    ...(preselectedOrganization && { 
      organization_id: preselectedOrganization,
      organization_mode: 'existing' as 'existing' | 'new'
    }),
  }

  return (
    <SimpleForm<ContactFormData>
      fields={fields}
      onSubmit={onSubmit}
      validationSchema={contactSchema}
      defaultValues={enhancedInitialData}
      loading={loading}
      submitLabel={submitLabel}
      showReset={true}
      showProgress={true}
    />
  )
}
