import { CoreFormLayout } from '@/components/forms/CoreFormLayout'
import { createProductFormConfig, type ProductFormData } from '@/configs/forms/product.config'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void
  initialData?: Partial<ProductFormData>
  loading?: boolean
  submitLabel?: string
}

export function ProductForm({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save Product',
}: ProductFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const principalOrganizations = organizations.filter((org) => org.type === 'principal')
  
  // Create form config with dynamic options
  const formConfig = createProductFormConfig(initialData)
  
  // Update principal organization options dynamically
  const principalSection = formConfig.coreSections.find(section => section.id === 'principal-assignment')
  if (principalSection) {
    const principalField = principalSection.fields.find(field => field.name === 'principal_id')
    if (principalField) {
      principalField.options = principalOrganizations.map(org => ({
        value: org.id,
        label: org.name,
        description: `${org.type} - ${org.segment || 'No segment'}`
      }))
    }
  }

  return (
    <CoreFormLayout
      {...formConfig}
      onSubmit={onSubmit}
      loading={loading}
      submitLabel={submitLabel}
    />
  )
}