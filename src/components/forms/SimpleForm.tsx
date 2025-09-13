import { useForm, type FieldValues } from 'react-hook-form'
import { createTypedZodResolver } from '@/lib/form-resolver'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useDialogContext } from '@/contexts/DialogContext'
import { semanticSpacing } from '@/styles/tokens'
import {
  getFormGridClasses,
  getFormSpacingClasses,
  getFormButtonClasses,
} from '@/lib/utils/form-utils'
import { FormFieldNew, type FieldConfig } from './FormField'
import { FormSubmitButton } from './FormSubmitButton'
import { FormProgressBar } from './FormProgressBar'
import { useFormProgress } from './hooks/useFormProgress'
import type { z } from 'zod'
import { cn } from '@/lib/utils'

/**
 * SimpleForm - Declarative form builder for basic forms
 *
 * Provides a simple API for creating forms with validation and submit handling.
 * Automatically adapts to dialog context for responsive behavior.
 */

export type SimpleFormField = FieldConfig & {
  name?: string // Optional for heading fields
}

interface SimpleFormProps<T extends FieldValues = FieldValues> {
  fields: SimpleFormField[]
  onSubmit: (data: T) => Promise<void> | void
  validationSchema?: z.ZodType<T>
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
    resolver: validationSchema ? createTypedZodResolver(validationSchema) : undefined,
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
            className={`${semanticSpacing.bottomGap.md}`}
          />
        )}

        {/* Form Fields */}
        <div className={cn(gridClasses, spacingClasses)}>
          {fields.map((field, index) => {
            // Check conditional visibility
            if (field.condition && !field.condition(form.watch())) {
              return null
            }

            // Handle heading fields
            if ('type' in field && field.type === 'heading') {
              return (
                <FormFieldNew
                  key={`heading-${index}`}
                  config={field}
                  disabled={loading}
                  className={fieldClassName}
                />
              )
            }

            // Handle regular fields
            if (!field.name) {
              // Skip fields without names (should not happen in normal usage)
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
            `flex ${semanticSpacing.gap.lg} ${semanticSpacing.topPadding.xxl} border-t`,
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
