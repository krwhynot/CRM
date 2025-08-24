import { useForm } from 'react-hook-form'
import { contactSchema, type ContactFormData } from '@/types/contact.types'
import { createTypeSafeResolver } from '@/lib/form-resolver'

interface UseContactFormStateProps {
  initialData?: Partial<ContactFormData>
  preselectedOrganization?: string
  onSubmit: (data: ContactFormData) => void
}

interface UseContactFormStateReturn {
  form: ReturnType<typeof useForm<ContactFormData>>
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}

export const useContactFormState = ({
  initialData,
  preselectedOrganization,
  onSubmit
}: UseContactFormStateProps): UseContactFormStateReturn => {
  
  const form = useForm<ContactFormData>({
    resolver: createTypeSafeResolver<ContactFormData>(contactSchema),
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

  const handleSubmit = form.handleSubmit(onSubmit)

  return {
    form,
    handleSubmit
  }
}