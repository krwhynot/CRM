import React from 'react'
import { useForm, FieldValues, DefaultValues } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { FormCard } from './FormCard'
import { FormInput, FormSelect, FormTextarea, FormCheckbox } from './FormInput'
import { FormSubmitButton } from './FormSubmitButton'

interface SimpleFieldConfig {
  name: string
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox'
  label: string
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
}

interface SimpleFormConfig<TFieldValues extends FieldValues> {
  title?: string
  fields: SimpleFieldConfig[]
  submitLabel?: string
  onSubmit: (data: TFieldValues) => void
  defaultValues?: DefaultValues<TFieldValues>
  loading?: boolean
  className?: string
}

export function SimpleForm<TFieldValues extends FieldValues = FieldValues>({
  title,
  fields,
  submitLabel = 'Submit',
  onSubmit,
  defaultValues,
  loading = false,
  className
}: SimpleFormConfig<TFieldValues>) {
  const form = useForm<TFieldValues>({
    defaultValues,
  })

  const renderField = (field: SimpleFieldConfig) => {
    const commonProps = {
      control: form.control,
      name: field.name as any,
      label: field.label,
      required: field.required,
      disabled: loading
    }

    switch (field.type) {
      case 'select':
        return (
          <FormSelect
            key={field.name}
            {...commonProps}
            placeholder={field.placeholder}
            options={field.options || []}
          />
        )
      case 'textarea':
        return (
          <FormTextarea
            key={field.name}
            {...commonProps}
            placeholder={field.placeholder}
          />
        )
      case 'checkbox':
        return (
          <FormCheckbox
            key={field.name}
            {...commonProps}
          />
        )
      default:
        return (
          <FormInput
            key={field.name}
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
          />
        )
    }
  }

  return (
    <FormCard title={title} className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(renderField)}
          <FormSubmitButton loading={loading}>
            {submitLabel}
          </FormSubmitButton>
        </form>
      </Form>
    </FormCard>
  )
}