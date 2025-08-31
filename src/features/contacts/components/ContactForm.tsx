import { ProgressiveDetails } from '@/components/forms'
import { Form } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ContactFormData } from '@/types/contact.types'
import { type FormPropsWithPreselection } from '@/types/forms'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { useContactFormState } from '@/features/contacts/hooks/useContactFormState'
import { useContactFormStyle } from '@/features/contacts/hooks/useContactFormStyle'
import { ContactFormBasicFields } from './contact-form/ContactFormBasicFields'
import { ContactFormRoleFields } from './contact-form/ContactFormRoleFields'
import { ContactFormDetailsFields } from './contact-form/ContactFormDetailsFields'
import { FormSubmitButton } from '@/components/forms/FormSubmitButton'

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
  const { form, handleSubmit } = useContactFormState({ initialData, preselectedOrganization, onSubmit })
  const { useNewStyle, inputClassName } = useContactFormStyle()

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader><CardTitle>{initialData ? 'Edit Contact' : 'Add Contact'}</CardTitle></CardHeader>
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

            <FormSubmitButton
              loading={loading}
              className={inputClassName}
            >
              {submitLabel}
            </FormSubmitButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
