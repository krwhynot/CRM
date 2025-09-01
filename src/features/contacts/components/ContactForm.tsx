import { CoreFormLayout } from '@/components/forms/CoreFormLayout'
import { createContactFormConfig } from '@/configs/forms/contact.config'
import { type ContactFormData } from '@/types/contact.types'
import { type FormPropsWithPreselection } from '@/types/forms'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'

interface ContactFormProps extends FormPropsWithPreselection<ContactFormData> {
  // ContactForm-specific props can be added here if needed
}

export function ContactForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Contact',
  preselectedOrganization
}: ContactFormProps) {
  const { data: organizations = [] } = useOrganizations()
  
  // Create form config with dynamic options
  const formConfig = createContactFormConfig(initialData)
  
  // Update organization options dynamically
  const organizationSection = formConfig.coreSections.find(section => section.id === 'organization-assignment')
  if (organizationSection) {
    const organizationField = organizationSection.fields.find(field => field.name === 'organization_id')
    if (organizationField) {
      organizationField.options = organizations.map(org => ({
        value: org.id,
        label: org.name,
        description: `${org.type} - ${org.segment || 'No segment'}`
      }))
    }
  }

  // Handle preselected organization
  const enhancedInitialData = preselectedOrganization 
    ? { ...initialData, organization_id: preselectedOrganization }
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