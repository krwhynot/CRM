import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox,
  ProgressiveDetails 
} from '@/components/forms'
import { FormCard } from '@/components/forms/FormCard'
import { FormSubmitButton } from '@/components/forms/FormSubmitButton'
import { contactSchema, CONTACT_ROLES, type ContactFormData } from '@/types/contact.types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
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
  
  const form = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      purchase_influence: initialData?.purchase_influence || 'Unknown',
      decision_authority: initialData?.decision_authority || 'Gatekeeper',
      role: initialData?.role || null,
      email: initialData?.email || null,
      title: initialData?.title || null,
      department: initialData?.department || null,
      phone: initialData?.phone || null,
      mobile_phone: initialData?.mobile_phone || null,
      linkedin_url: initialData?.linkedin_url || null,
      is_primary_contact: initialData?.is_primary_contact || false,
      notes: initialData?.notes || null,
      preferred_principals: initialData?.preferred_principals || []
    }
  })

  // Prepare organization options
  const organizationOptions = organizations.map((org: { id: string; name: string }) => ({
    value: org.id,
    label: org.name
  }))

  // Prepare role options  
  const roleOptions = CONTACT_ROLES.map(role => ({
    value: role.value,
    label: role.label
  }))

  const influenceOptions = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Unknown', label: 'Unknown' }
  ]

  const authorityOptions = [
    { value: 'Decision Maker', label: 'Decision Maker' },
    { value: 'Influencer', label: 'Influencer' },
    { value: 'End User', label: 'End User' },
    { value: 'Gatekeeper', label: 'Gatekeeper' }
  ]

  return (
    <FormCard title={initialData ? 'Edit Contact' : 'New Contact'}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Core Contact Information */}
          <FormInput 
            control={form.control}
            name="first_name" 
            label="First Name" 
            required 
          />
          
          <FormInput 
            control={form.control}
            name="last_name" 
            label="Last Name" 
            required 
          />
      
          <FormInput 
            control={form.control}
            name="title" 
            label="Title" 
          />

          <FormSelect
            control={form.control}
            name="position"
            label="Position"
            options={roleOptions}
            placeholder="Select position"
          />
          
          <FormSelect
            control={form.control}
            name="organization_id"
            label="Organization"
            options={organizationOptions}
            placeholder="Select organization"
            required
          />

          {/* Progressive Details for Advanced Fields */}
          <ProgressiveDetails buttonText="Contact Details">
            <FormInput 
              control={form.control}
              name="email" 
              label="Email" 
              type="email"
              placeholder="contact@company.com"
            />
            
            <FormInput 
              control={form.control}
              name="phone" 
              label="Phone" 
              type="tel"
              placeholder="(555) 123-4567"
            />
            
            <FormInput 
              control={form.control}
              name="mobile_phone" 
              label="Mobile Phone" 
              type="tel"
              placeholder="(555) 123-4567"
            />
            
            <FormInput 
              control={form.control}
              name="department" 
              label="Department"
            />

            <FormSelect
              control={form.control}
              name="purchase_influence"
              label="Purchase Influence"
              options={influenceOptions}
            />

            <FormSelect
              control={form.control}
              name="decision_authority"
              label="Decision Authority"
              options={authorityOptions}
            />

            <FormCheckbox
              control={form.control}
              name="is_primary_contact"
              label="Primary Contact"
              description="This is the primary contact for the organization"
            />

            <PreferredPrincipalsSelect 
              value={form.watch('preferred_principals') || []}
              onChange={(value) => form.setValue('preferred_principals', value)}
            />

            <FormTextarea
              control={form.control}
              name="notes"
              label="Notes"
              placeholder="Additional information about this contact..."
              rows={3}
            />
          </ProgressiveDetails>

          <FormSubmitButton loading={loading}>
            {submitLabel}
          </FormSubmitButton>
        </form>
      </Form>
    </FormCard>
  )
}
