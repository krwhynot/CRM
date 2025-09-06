import { useForm, type FieldValues } from 'react-hook-form'
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
import { FormProgressBar } from './FormProgressBar'
import { useFormProgress } from './hooks/useFormProgress'
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

interface SimpleFormProps<T extends FieldValues = FieldValues> {
  fields: SimpleFormField[]
  onSubmit: (data: T) => Promise<void> | void
  validationSchema?: AnyObjectSchema
  defaultValues?: Partial<T>
  loading?: boolean
  submitLabel?: string
  showReset?: boolean
  showProgress?: boolean
  className?: string
  fieldClassName?: string
}

export function SimpleForm<T extends FieldValues = FieldValues>({
  fields,
  onSubmit,
  validationSchema,
  defaultValues,
  loading = false,
  submitLabel = 'Save',
  showReset = true,
  showProgress = false,
  className,
  fieldClassName,
}: SimpleFormProps<T>) {
  const { isInDialog } = useDialogContext()
  const gridClasses = getFormGridClasses(isInDialog, fields.length)
  const spacingClasses = getFormSpacingClasses(isInDialog)
  const buttonClasses = getFormButtonClasses(isInDialog)

  const form = useForm<T>({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues: defaultValues as never,
    mode: 'onBlur', // Better UX - validate on blur, not every keystroke
  })

  // Progress tracking
  const progress = useFormProgress({
    control: form.control,
    fields,
  })

  const handleSubmit = async (data: T) => {
    await onSubmit(data)
  }

  const handleReset = () => {
    form.reset(defaultValues as never)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn(spacingClasses, className)}>
        {/* Progress Indicator */}
        {showProgress && (
          <FormProgressBar
            completed={progress.completed}
            total={progress.total}
            className="mb-6"
          />
        )}

        {/* Form Fields */}
        <div className={cn(gridClasses, spacingClasses)}>
          {fields.map((field) => {
            // Check conditional visibility
            if (field.condition && !field.condition(form.watch())) {
              return null
            }
            
            return (
              <FormFieldNew
                key={field.name}
                control={form.control}
                name={field.name as never}
                config={field}
                disabled={loading}
                className={fieldClassName}
              />
            )
          })}
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

// Export utility functions from separate file to avoid fast-refresh warnings
// eslint-disable-next-line react-refresh/only-export-components
export * from './form-field-builders'
