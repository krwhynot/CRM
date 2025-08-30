import { Form } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import type { ContactWithOrganizationData } from '@/features/contacts/hooks/useContacts'
import { User } from 'lucide-react'
import { useEnhancedContactFormState } from '@/features/contacts/hooks/useEnhancedContactFormState'
import { useNewOrganizationData } from '@/features/organizations/hooks/useNewOrganizationData'
import { ContactBasicFields } from './enhanced-form/ContactBasicFields'
import { OrganizationModeSelector } from './enhanced-form/OrganizationModeSelector'
import { ContactClassificationFields } from './enhanced-form/ContactClassificationFields'
import { ContactDetailsSection } from './enhanced-form/ContactDetailsSection'
import type { ContactFormData } from '@/types/contact.types'

interface EnhancedContactFormProps {
  onSubmit: (data: ContactWithOrganizationData) => void
  initialData?: Partial<ContactFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

export function EnhancedContactForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Contact',
  preselectedOrganization
}: EnhancedContactFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const { form, organizationMode, setOrganizationMode } = useEnhancedContactFormState(
    initialData,
    preselectedOrganization
  )
  const { newOrgData, updateNewOrgField } = useNewOrganizationData()

  const handleSubmit = (contactData: ContactFormData) => {
    const cleanedContactData = {
      ...contactData,
      preferred_principals: contactData.preferred_principals?.filter((id): id is string => id !== undefined)
    }

    let enhancedData: ContactWithOrganizationData

    if (organizationMode === 'existing') {
      enhancedData = {
        ...cleanedContactData,
        organization_id: cleanedContactData.organization_id
      }
    } else {
      enhancedData = {
        ...cleanedContactData,
        organization_name: newOrgData.name,
        organization_type: newOrgData.type,
        organization_data: {
          phone: newOrgData.phone || null,
          email: newOrgData.email || null,
          website: newOrgData.website || null,
          notes: newOrgData.notes || null
        }
      }
    }

    onSubmit(enhancedData)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {initialData ? 'Edit Contact' : 'Add Contact'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <ContactBasicFields form={form} loading={loading} />
            
            <OrganizationModeSelector
              form={form}
              organizations={organizations}
              organizationMode={organizationMode}
              setOrganizationMode={setOrganizationMode}
              newOrgData={newOrgData}
              updateNewOrgField={updateNewOrgField}
              loading={loading}
            />

            <ContactClassificationFields form={form} loading={loading} />

            <ContactDetailsSection form={form} loading={loading} />

            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? 'Saving...' : submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
