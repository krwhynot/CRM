import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { FormField } from '@/components/forms'
import { Input } from '@/components/ui/input'
import { ContactFormData } from '@/types/contact.types'

interface ContactFormBasicFieldsProps {
  control: Control<ContactFormData>
  loading: boolean
  useNewStyle?: boolean // Optional for backwards compatibility
  inputClassName?: string
}

export const ContactFormBasicFields: React.FC<ContactFormBasicFieldsProps> = ({
  control,
  loading,
  inputClassName = ""
}) => {
  return (
    <>
      <Controller
        control={control}
        name="first_name"
        render={({ field, fieldState }) => (
          <FormField label="First Name" required error={fieldState.error?.message}>
            <Input {...field} className={inputClassName} disabled={loading} />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="last_name"
        render={({ field, fieldState }) => (
          <FormField label="Last Name" required error={fieldState.error?.message}>
            <Input {...field} className={inputClassName} disabled={loading} />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="Title" error={fieldState.error?.message}>
            <Input {...field} value={field.value || ''} className={inputClassName} disabled={loading} />
          </FormField>
        )}
      />
    </>
  )
}