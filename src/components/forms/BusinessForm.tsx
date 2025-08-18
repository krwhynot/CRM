import React from 'react'
import { useForm, FieldValues, Resolver, DefaultValues } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { FormCard } from './FormCard'
import { FormSubmitButton } from './FormSubmitButton'

interface BusinessFormProps<TFieldValues extends FieldValues> {
  title?: string
  children: React.ReactNode
  resolver: Resolver<TFieldValues>
  defaultValues: DefaultValues<TFieldValues>
  onSubmit: (data: TFieldValues) => void
  submitLabel?: string
  loading?: boolean
  className?: string
}

export function BusinessForm<TFieldValues extends FieldValues>({
  title,
  children,
  resolver,
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  loading = false,
  className
}: BusinessFormProps<TFieldValues>) {
  const form = useForm<TFieldValues>({
    resolver,
    defaultValues,
  })

  return (
    <FormCard title={title} className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              // Pass form control to child components
              return React.cloneElement(child, { 
                control: form.control,
                disabled: loading,
                ...child.props 
              })
            }
            return child
          })}
          <FormSubmitButton loading={loading}>
            {submitLabel}
          </FormSubmitButton>
        </form>
      </Form>
    </FormCard>
  )
}