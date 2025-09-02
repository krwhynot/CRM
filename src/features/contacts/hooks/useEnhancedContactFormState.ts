import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { contactSchema, type ContactFormData } from '@/types/contact.types'
import { yupResolver } from '@hookform/resolvers/yup'

export type OrganizationMode = 'existing' | 'new'

interface UseEnhancedContactFormStateReturn {
  form: ReturnType<typeof useForm<ContactFormData>>
  organizationMode: OrganizationMode
  setOrganizationMode: (mode: OrganizationMode) => void
}

export const useEnhancedContactFormState = (
  initialData?: Partial<ContactFormData>,
  preselectedOrganization?: string
): UseEnhancedContactFormStateReturn => {
  const [organizationMode, setOrganizationMode] = useState<OrganizationMode>(
    preselectedOrganization ? 'existing' : 'new'
  )

  const form = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema) as Resolver<ContactFormData>,
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
      preferred_principals: initialData?.preferred_principals || [],
    },
  })

  return {
    form,
    organizationMode,
    setOrganizationMode,
  }
}
