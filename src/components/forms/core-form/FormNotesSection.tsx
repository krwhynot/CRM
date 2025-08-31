import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { FormFieldRenderer } from '../FormFieldRenderer'

interface FormNotesSectionProps<T extends FieldValues> {
  form: UseFormReturn<T, any, any>
  loading: boolean
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'activity'
}

export function FormNotesSection<T extends FieldValues>({
  form,
  loading,
  entityType,
}: FormNotesSectionProps<T>) {
  return (
    <FormFieldRenderer
      field={{
        name: 'notes' as keyof T,
        type: 'textarea',
        label: 'Additional Notes',
        placeholder: `Any additional information about this ${entityType}...`,
        description: 'Internal notes, special requirements, relationship history, etc.',
      }}
      form={form}
      loading={loading}
      className="space-y-6"
    />
  )
}
