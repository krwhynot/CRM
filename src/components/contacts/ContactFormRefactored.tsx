import React from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { 
  BusinessForm, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox,
  ProgressiveDetails 
} from '@/components/forms'
import { contactSchema, type ContactFormData, CONTACT_POSITIONS } from '@/types/contact.types'
import { useOrganizations } from '@/hooks/useOrganizations'
import { PreferredPrincipalsSelect } from './PreferredPrincipalsSelect'

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
  initialData?: Partial<ContactFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

export function ContactFormRefactored({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Contact',
  preselectedOrganization
}: ContactFormProps) {
  const { data: organizations = [] } = useOrganizations()
  
  const defaultValues: Partial<ContactFormData> = {
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    title: initialData?.title || '',
    position: initialData?.position || '',
    custom_position: initialData?.custom_position || '',
    organization_id: preselectedOrganization || initialData?.organization_id || '',
    purchase_influence: initialData?.purchase_influence || 'Unknown',
    decision_authority: initialData?.decision_authority || 'Gatekeeper',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    mobile_phone: initialData?.mobile_phone || '',
    department: initialData?.department || '',
    is_primary_contact: initialData?.is_primary_contact || false,
    notes: initialData?.notes || '',
    preferred_principals: initialData?.preferred_principals || []
  }

  // Prepare organization options
  const organizationOptions = organizations.map(org => ({
    value: org.id,
    label: org.name
  }))

  // Prepare position options  
  const positionOptions = [
    ...CONTACT_POSITIONS.map(pos => ({ value: pos, label: pos })),
    { value: 'Custom', label: 'Custom' }
  ]

  const influenceOptions = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Unknown', label: 'Unknown' }
  ]

  const authorityOptions = [
    { value: 'Decision Maker', label: 'Decision Maker' },
    { value: 'Influencer', label: 'Influencer' },
    { value: 'Gatekeeper', label: 'Gatekeeper' },
    { value: 'User', label: 'User' }
  ]

  return (
    <BusinessForm
      title={initialData ? 'Edit Contact' : 'New Contact'}
      resolver={yupResolver(contactSchema)}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      loading={loading}
    >
      {/* Core Contact Information */}
      <FormInput 
        name="first_name" 
        label="First Name" 
        required 
      />
      
      <FormInput 
        name="last_name" 
        label="Last Name" 
        required 
      />
      
      <FormInput 
        name="title" 
        label="Title" 
      />

      <FormSelect
        name="position"
        label="Position"
        options={positionOptions}
        placeholder="Select position"
        required
      />

      {/* Custom Position Field - conditionally rendered */}
      {/* Note: This would need conditional logic in BusinessForm or separate component */}
      
      <FormSelect
        name="organization_id"
        label="Organization"
        options={organizationOptions}
        placeholder="Select organization"
        required
      />

      {/* Progressive Details for Advanced Fields */}
      <ProgressiveDetails title="Contact Details">
        <FormInput 
          name="email" 
          label="Email" 
          type="email"
          placeholder="contact@company.com"
        />
        
        <FormInput 
          name="phone" 
          label="Phone" 
          type="tel"
          placeholder="(555) 123-4567"
        />
        
        <FormInput 
          name="mobile_phone" 
          label="Mobile Phone" 
          type="tel"
          placeholder="(555) 123-4567"
        />
        
        <FormInput 
          name="department" 
          label="Department"
        />

        <FormSelect
          name="purchase_influence"
          label="Purchase Influence"
          options={influenceOptions}
        />

        <FormSelect
          name="decision_authority"
          label="Decision Authority"
          options={authorityOptions}
        />

        <FormCheckbox
          name="is_primary_contact"
          label="Primary Contact"
          description="This is the primary contact for the organization"
        />

        <PreferredPrincipalsSelect />

        <FormTextarea
          name="notes"
          label="Notes"
          placeholder="Additional information about this contact..."
          rows={3}
        />
      </ProgressiveDetails>
    </BusinessForm>
  )
}