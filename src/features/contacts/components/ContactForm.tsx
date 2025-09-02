import { SimpleForm, type SimpleFormField } from '@/components/forms'
import { contactSchema, type ContactFormData, CONTACT_ROLES } from '@/types/contact.types'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'

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

  // Create field definitions using new SimpleForm pattern
  const fields: SimpleFormField[] = [
    // Basic Information
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

    // Organization Assignment
    {
      name: 'organization_id',
      label: 'Organization',
      type: 'select',
      required: true,
      options: organizations.map((org) => ({
        value: org.id,
        label: org.name,
        description: `${org.type} - ${org.segment || 'No segment'}`,
      })),
      placeholder: 'Select organization',
    },

    // Role Information
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

    // Additional Information
    {
      name: 'linkedin_url',
      label: 'LinkedIn Profile',
      type: 'url',
      placeholder: 'https://linkedin.com/in/profile',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      rows: 3,
      placeholder: 'Additional notes about this contact...',
    },
  ]

  // Handle preselected organization
  const enhancedInitialData = preselectedOrganization
    ? { ...initialData, organization_id: preselectedOrganization }
    : initialData

  return (
    <SimpleForm<ContactFormData>
      fields={fields}
      onSubmit={onSubmit}
      validationSchema={contactSchema}
      defaultValues={enhancedInitialData}
      loading={loading}
      submitLabel={submitLabel}
      showReset={true}
    />
  )
}
