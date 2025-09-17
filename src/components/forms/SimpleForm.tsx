import React from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useDialogContext } from '@/contexts/DialogContext'
import {
  getFormGridClasses,
  getFormSpacingClasses,
  getFormButtonClasses,
} from '@/lib/utils/form-utils'
import { FormFieldEnhanced, type FieldConfig } from './FormField.enhanced'
import { FormSubmitButton } from './FormSubmitButton'
import { Progress } from '@/components/ui/progress'
import { useFormProgress } from './hooks/useFormProgress'
import type { z } from 'zod'
import { createResolver } from '@/lib/form-resolver'
import { cn } from '@/lib/utils'

/**
 * SimpleForm - Declarative form builder for basic forms
 *
 * Provides a simple API for creating forms with validation and submit handling.
 * Automatically adapts to dialog context for responsive behavior.
 */

export type SimpleFormField = FieldConfig

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
  // Enhanced features
  autofocus?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  onFieldChange?: (fieldName: string, value: any) => void
  resetOnSubmit?: boolean
  isDirtyCheck?: boolean
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
  autofocus = false,
  autoSave = false,
  autoSaveDelay = 2000,
  onFieldChange,
  resetOnSubmit = false,
  isDirtyCheck = false,
}: SimpleFormProps<T>) {
  const { isInDialog } = useDialogContext()
  const gridClasses = getFormGridClasses(isInDialog, fields.length)
  const spacingClasses = getFormSpacingClasses(isInDialog)
  const buttonClasses = getFormButtonClasses(isInDialog)

  const form = useForm<T>({
    resolver: validationSchema ? createResolver(validationSchema) : undefined,
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
    if (resetOnSubmit) {
      form.reset(defaultValues as never)
    }
  }

  const handleReset = () => {
    form.reset(defaultValues as never)
  }

  // Enhanced features: Field change handling
  React.useEffect(() => {
    if (onFieldChange) {
      const subscription = form.watch((value, { name }) => {
        if (name) {
          onFieldChange(name, value[name])
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [form, onFieldChange])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn(spacingClasses, className)}>
        {/* Progress Indicator */}
        {showProgress && (
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-sm text-muted-foreground">
              <span>Form Progress</span>
              <span>
                {progress.completed} of {progress.total} fields
              </span>
            </div>
            <Progress value={(progress.completed / progress.total) * 100} className="h-2" />
          </div>
        )}

        {/* Form Fields */}
        <div className={cn(gridClasses, spacingClasses)}>
          {fields.map((field, index) => {
            // Check conditional visibility
            if (field.condition && !field.condition(form.watch())) {
              return null
            }

            // Handle heading fields
            if (field.type === 'heading') {
              return (
                <FormFieldEnhanced
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
              <FormFieldEnhanced
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
              disabled={loading || (isDirtyCheck && !form.formState.isDirty)}
              className={buttonClasses}
            >
              Reset
            </Button>
          )}

          <FormSubmitButton
            loading={loading}
            disabled={isDirtyCheck && !form.formState.isDirty}
            className={buttonClasses}
          >
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
