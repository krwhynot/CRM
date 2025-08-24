import { ProgressiveDetails } from '@/components/shared/forms/forms'
import { Form } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ContactFormData } from '@/types/contact.types'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { useContactFormState } from '@/features/contacts/hooks/useContactFormState'
import { useContactFormStyle } from '@/features/contacts/hooks/useContactFormStyle'
import { ContactFormBasicFields } from './contact-form/ContactFormBasicFields'
import { ContactFormRoleFields } from './contact-form/ContactFormRoleFields'
import { ContactFormDetailsFields } from './contact-form/ContactFormDetailsFields'
import { ContactFormSubmitButton } from './contact-form/ContactFormSubmitButton'

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
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
  preselectedOrganization
}: ContactFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const { form, handleSubmit } = useContactFormState({ initialData, preselectedOrganization, onSubmit })
  const { useNewStyle, inputClassName } = useContactFormStyle()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader><CardTitle>{initialData ? 'Edit Contact' : 'New Contact'}</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ContactFormBasicFields
              control={form.control}
              loading={loading}
              useNewStyle={useNewStyle}
              inputClassName={inputClassName}
            />

            <ContactFormRoleFields
              control={form.control}
              organizations={organizations}
              inputClassName={inputClassName}
            />

            <ProgressiveDetails buttonText="Add Details">
              <ContactFormDetailsFields
                control={form.control}
                loading={loading}
                inputClassName={inputClassName}
              />
            </ProgressiveDetails>

            <ContactFormSubmitButton
              loading={loading}
              submitLabel={submitLabel}
              useNewStyle={useNewStyle}
              inputClassName={inputClassName}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
