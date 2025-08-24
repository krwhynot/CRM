import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormCheckbox,
  ProgressiveDetails 
} from '@/components/shared/forms/forms'
import { FormCard } from '@/components/shared/forms/forms/FormCard'
import { FormSubmitButton } from '@/components/shared/forms/forms/FormSubmitButton'
import { contactSchema, CONTACT_ROLES } from '@/types/contact.types'
import { ContactFormInterface, createContactFormInterfaceDefaults } from '@/types/forms/form-interfaces'
import { createTypeSafeResolver } from '@/lib/form-resolver'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { PreferredPrincipalsSelect } from './PreferredPrincipalsSelect'

interface ContactFormProps {
  onSubmit: (data: ContactFormInterface) => void
  initialData?: Partial<ContactFormInterface>
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
  
  // Use the TypeScript-safe default values factory
  const defaultValues = createContactFormInterfaceDefaults(
    preselectedOrganization,
    initialData
  )

  // Create type-safe form with proper control
  const form = useForm<ContactFormInterface>({
    resolver: createTypeSafeResolver<ContactFormInterface>(contactSchema),
    defaultValues,
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
