import { CoreFormLayout } from '@/components/forms/CoreFormLayout'
import { createOpportunityFormConfig } from '@/configs/forms/opportunity.config'
import { type OpportunityFormData } from '@/types/opportunity.types'
import { type FormPropsWithPreselection } from '@/types/forms'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { useContacts } from '@/features/contacts/hooks/useContacts'

interface OpportunityFormProps extends FormPropsWithPreselection<OpportunityFormData> {
  // OpportunityForm-specific props can be added here if needed
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

  // Create form config with dynamic options
  const formConfig = createOpportunityFormConfig(initialData)

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

  // Update contact options dynamically (filtered by selected organization)
  const contactSection = formConfig.optionalSections?.find(section => section.id === 'contact-details')
  if (contactSection) {
    const contactField = contactSection.fields.find(field => field.name === 'contact_id')
    if (contactField) {
      const selectedOrgId = preselectedOrganization || initialData?.organization_id
      const filteredContacts = selectedOrgId 
        ? contacts.filter(contact => contact.organization_id === selectedOrgId)
        : contacts

      contactField.options = filteredContacts.map(contact => ({
        value: contact.id,
        label: `${contact.first_name} ${contact.last_name}`,
        description: contact.title || contact.role || 'Contact'
      }))
    }
  }

  // Update principal options in context section
  const contextSection = formConfig.optionalSections?.find(section => section.id === 'context-classification')
  if (contextSection) {
    const principalField = contextSection.fields.find(field => field.name === 'principal_id')
    if (principalField) {
      principalField.options = principalOrganizations.map(org => ({
        value: org.id,
        label: org.name,
        description: `Principal - ${org.segment || 'No segment'}`
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