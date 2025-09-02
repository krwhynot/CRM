import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useDialogContext } from '@/contexts/DialogContext'
import {
  getFormGridClasses,
  getFormSpacingClasses,
  getFormButtonClasses,
} from '@/lib/utils/form-utils'
import { FormFieldNew, type FieldConfig } from './FormField'
import { FormSubmitButton } from './FormSubmitButton'
import type { AnyObjectSchema } from 'yup'
import { cn } from '@/lib/utils'

/**
 * SimpleForm - Declarative form builder for basic forms
 *
 * Provides a simple API for creating forms with validation and submit handling.
 * Automatically adapts to dialog context for responsive behavior.
 */

export interface SimpleFormField extends FieldConfig {
  name: string
  label: string
}

interface SimpleFormProps<T extends Record<string, any>> {
  fields: SimpleFormField[]
  onSubmit: (data: T) => Promise<void> | void
  validationSchema?: AnyObjectSchema
  defaultValues?: Partial<T>
  loading?: boolean
  submitLabel?: string
  showReset?: boolean
  className?: string
  fieldClassName?: string
}

export function SimpleForm<T extends Record<string, any>>({
  fields,
  onSubmit,
  validationSchema,
  defaultValues,
  loading = false,
  submitLabel = 'Save',
  showReset = true,
  className,
  fieldClassName,
}: SimpleFormProps<T>) {
  const { isInDialog } = useDialogContext()
  const gridClasses = getFormGridClasses(isInDialog, fields.length)
  const spacingClasses = getFormSpacingClasses(isInDialog)
  const buttonClasses = getFormButtonClasses(isInDialog)

  const form = useForm<T>({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues: defaultValues as any,
    mode: 'onBlur', // Better UX - validate on blur, not every keystroke
  })

  const handleSubmit = async (data: T) => {
    await onSubmit(data)
  }

  const handleReset = () => {
    form.reset(defaultValues as any)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn(spacingClasses, className)}>
        {/* Form Fields */}
        <div className={cn(gridClasses, spacingClasses)}>
          {fields.map((field) => (
            <FormFieldNew
              key={field.name}
              control={form.control}
              name={field.name}
              config={field}
              disabled={loading}
              className={fieldClassName}
            />
          ))}
        </div>

        {/* Form Actions */}
        <div
          className={cn(
            'flex gap-3 pt-6 border-t',
            isInDialog ? 'flex-col-reverse sm:flex-row justify-end' : 'justify-end'
          )}
        >
          {showReset && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className={buttonClasses}
            >
              Reset
            </Button>
          )}

          <FormSubmitButton loading={loading} className={buttonClasses}>
            {submitLabel}
          </FormSubmitButton>
        </div>
      </form>
    </Form>
  )
}

/**
 * Quick field builders for common use cases
 */
export const createTextField = (
  name: string,
  label: string,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'text',
  required,
})

export const createEmailField = (
  name: string,
  label: string,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'email',
  required,
})

export const createSelectField = (
  name: string,
  label: string,
  options: { value: string; label: string; description?: string }[],
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'select',
  options,
  required,
})

export const createTextareaField = (
  name: string,
  label: string,
  rows = 3,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'textarea',
  rows,
  required,
})

export const createNumberField = (
  name: string,
  label: string,
  min?: number,
  max?: number,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'number',
  min,
  max,
  required,
})

export const createDateField = (
  name: string,
  label: string,
  required = false
): SimpleFormField => ({
  name,
  label,
  type: 'date',
  required,
})

export const createSwitchField = (
  name: string,
  label: string,
  switchLabel?: string
): SimpleFormField => ({
  name,
  label,
  type: 'switch',
  switchLabel,
})
