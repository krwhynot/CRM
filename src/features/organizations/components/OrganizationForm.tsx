import { SimpleForm, type SimpleFormField } from '@/components/forms'
import { organizationSchema, type OrganizationFormData, FOOD_SERVICE_SEGMENTS } from '@/types/organization.types'
import { deriveOrganizationFlags } from '@/lib/organization-utils'

interface OrganizationFormProps {
  onSubmit: (data: OrganizationFormData) => Promise<void> | void
  initialData?: Partial<OrganizationFormData>
  loading?: boolean
  submitLabel?: string
}

export function OrganizationForm({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save Organization',
}: OrganizationFormProps) {
  // Organization type options
  const organizationTypeOptions = [
    {
      value: 'customer',
      label: 'Customer',
      description: 'Restaurant, food service establishment, or end customer',
    },
    {
      value: 'principal',
      label: 'Principal',
      description: 'Manufacturer or brand that produces food products',
    },
    {
      value: 'distributor',
      label: 'Distributor',
      description: 'Company that distributes food products to customers',
    },
    {
      value: 'prospect',
      label: 'Prospect',
      description: 'Potential customer or business opportunity',
    },
    {
      value: 'vendor',
      label: 'Vendor',
      description: 'Supplier or service provider to the business',
    },
  ]

  // Priority level options
  const priorityOptions = [
    {
      value: 'A',
      label: 'A - High Priority',
      description: 'Top-tier customer or highest value opportunity',
    },
    {
      value: 'B',
      label: 'B - Medium-High Priority',
      description: 'Important customer with significant potential',
    },
    {
      value: 'C',
      label: 'C - Medium Priority',
      description: 'Standard customer or moderate opportunity',
    },
    {
      value: 'D',
      label: 'D - Low Priority',
      description: 'Minimal focus or maintenance-only account',
    },
  ]

  // Segment options
  const segmentOptions = FOOD_SERVICE_SEGMENTS.map((segment) => ({
    value: segment,
    label: segment,
    description: getSegmentDescription(segment),
  }))

  // Handle submit with organization type derivation
  const handleSubmit = (data: OrganizationFormData) => {
    // Automatically derive boolean flags from the selected type
    const derivedFlags = deriveOrganizationFlags(data.type)
    const submitData = { ...data, ...derivedFlags }
    onSubmit(submitData)
  }

  // Create field definitions using SimpleForm pattern
  const fields: SimpleFormField[] = [
    // Basic Information
    {
      name: 'name',
      label: 'Organization Name',
      type: 'text',
      required: true,
      placeholder: 'Enter organization name',
    },
    {
      name: 'type',
      label: 'Organization Type',
      type: 'select',
      required: true,
      options: organizationTypeOptions,
      placeholder: 'Select organization type',
    },
    {
      name: 'priority',
      label: 'Priority Level',
      type: 'select',
      required: true,
      options: priorityOptions,
      placeholder: 'Select priority level',
    },
    {
      name: 'segment',
      label: 'Market Segment',
      type: 'select',
      required: true,
      options: segmentOptions,
      placeholder: 'Select market segment',
    },

    // Business Information
    {
      name: 'industry',
      label: 'Industry',
      type: 'text',
      placeholder: 'e.g. Food Service, Manufacturing',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
      placeholder: 'Brief description of the organization...',
    },

    // Contact Information
    {
      name: 'email',
      label: 'Primary Email',
      type: 'email',
      placeholder: 'contact@organization.com',
    },
    {
      name: 'phone',
      label: 'Primary Phone',
      type: 'tel',
      placeholder: '(555) 123-4567',
    },
    {
      name: 'website',
      label: 'Website',
      type: 'url',
      placeholder: 'https://www.organization.com',
    },

    // Address Information
    {
      name: 'address_line_1',
      label: 'Address Line 1',
      type: 'text',
      placeholder: '123 Main Street',
    },
    {
      name: 'address_line_2',
      label: 'Address Line 2',
      type: 'text',
      placeholder: 'Suite 100 (optional)',
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'City name',
    },
    {
      name: 'state_province',
      label: 'State/Province',
      type: 'text',
      placeholder: 'State or province',
    },
    {
      name: 'postal_code',
      label: 'Postal Code',
      type: 'text',
      placeholder: '12345',
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'Country name',
    },

    // Additional Information
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      rows: 3,
      placeholder: 'Additional notes about this organization...',
    },
  ]

  return (
    <SimpleForm<OrganizationFormData>
      fields={fields}
      onSubmit={handleSubmit}
      validationSchema={organizationSchema}
      defaultValues={initialData}
      loading={loading}
      submitLabel={submitLabel}
      showReset={true}
    />
  )
}

// Helper function for segment descriptions
function getSegmentDescription(segment: string): string {
  const descriptions: Record<string, string> = {
    'Fine Dining': 'Upscale restaurants with premium service and cuisine',
    'Fast Food': 'Quick service restaurants with limited menus',
    'Fast Casual': 'Higher quality fast food with customizable options',
    'Healthcare': 'Hospitals, clinics, and medical facilities',
    'Education': 'Schools, universities, and educational institutions',
    'Corporate Catering': 'Office buildings and corporate dining',
    'Hotel & Resort': 'Hotels, resorts, and hospitality venues',
    'Entertainment Venue': 'Sports venues, theaters, and entertainment facilities',
    'Retail Food Service': 'Grocery stores and retail food operations',
    'Government': 'Military, government facilities, and public institutions',
    'Senior Living': 'Retirement homes and senior care facilities',
    'Other': 'Other food service segments not listed above',
  }
  return descriptions[segment] || 'Food service segment'
}
