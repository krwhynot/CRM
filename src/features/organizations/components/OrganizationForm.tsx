import { CoreFormLayout } from '@/components/forms/CoreFormLayout'
import { createOrganizationFormConfig } from '@/configs/forms/organization.config'
import type { OrganizationFormData } from '@/types/organization.types'
import type { BaseFormProps } from '@/types/forms'
import { deriveOrganizationFlags } from '@/lib/organization-utils'

interface OrganizationFormProps extends BaseFormProps<OrganizationFormData> {
  // OrganizationForm-specific props can be added here if needed
}

export function OrganizationForm({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save Organization',
}: OrganizationFormProps) {
  const handleSubmit = (data: OrganizationFormData) => {
    // Automatically derive boolean flags from the selected type
    const derivedFlags = deriveOrganizationFlags(data.type)
    const submitData = { ...data, ...derivedFlags }
    onSubmit(submitData)
  }

  const formConfig = createOrganizationFormConfig(initialData)

  return (
    <CoreFormLayout
      {...formConfig}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={submitLabel}
    />
  )
}