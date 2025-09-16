import { type Control, type FieldValues, type Path } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField as FormFieldPrimitive,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { useDialogContext } from '@/contexts/DialogContext'
import { getFormSpacingClasses } from '@/lib/utils/form-utils'
import { FormInput, type InputConfig, type SelectOption } from './FormInput'
import { type ZodError } from 'zod'

/**
 * FormField - Field wrapper component with label, validation, and description
 *
 * Provides consistent field layout with React Hook Form integration.
 * Automatically adapts to dialog context for responsive behavior.
 */

export interface BaseFieldConfig {
  label: string
  condition?: (values: FieldValues) => boolean // Conditional field visibility
  className?: string
}

export interface RegularFieldConfig extends BaseFieldConfig, InputConfig {
  name: string
  required?: boolean
  description?: string
  validation?: Record<string, unknown> // Schema validation (Yup or Zod compatible)
  errorMessage?: string // Custom error message override
  zodErrorPath?: string[] // Specific path for Zod error handling
}

export interface HeadingFieldConfig extends BaseFieldConfig {
  type: 'heading'
  level?: 2 | 3 | 4 // Optional heading level (defaults to 3)
}

export type FieldConfig = RegularFieldConfig | HeadingFieldConfig

interface FormFieldProps<T extends FieldValues = FieldValues> {
  control?: Control<T>
  name?: Path<T>
  config: FieldConfig
  disabled?: boolean
  className?: string
}

// Utility function to format validation errors for better UX
const formatValidationError = (error: any, config: RegularFieldConfig): string => {
  // Use custom error message if provided
  if (config.errorMessage) {
    return config.errorMessage
  }

  // Handle Zod error structures
  if (error && typeof error === 'object') {
    // Zod errors have a message property
    if (error.message) {
      return error.message
    }

    // Handle nested error structures
    if (error.errors && Array.isArray(error.errors)) {
      const firstError = error.errors[0]
      return firstError?.message || 'Invalid value'
    }
  }

  // Fallback for string errors
  if (typeof error === 'string') {
    return error
  }

  // Default fallback
  return 'Invalid value'
}

export function FormFieldNew<T extends FieldValues = FieldValues>({ control, name, config, disabled, className }: FormFieldProps<T>) {
  const { isInDialog } = useDialogContext()
  const spacingClasses = getFormSpacingClasses(isInDialog)

  // Handle heading fields
  if (config.type === 'heading') {
    const headingConfig = config as HeadingFieldConfig
    const level = headingConfig.level || 3
    const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    
    return (
      <div className={cn('col-span-full', config.className, className)}>
        <HeadingTag className="text-md mb-2 mt-4 font-semibold text-gray-900 first:mt-0">
          {config.label}
        </HeadingTag>
      </div>
    )
  }

  // Handle regular fields
  if (!control || !name) {
    // This should not happen in normal usage
    return null
  }

  const regularConfig = config as RegularFieldConfig

  return (
    <FormFieldPrimitive
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(spacingClasses, config.className, className)}>
          <FormLabel className="text-sm font-medium text-gray-700">
            {config.label}
            {regularConfig.required && <span className="ml-1 text-red-500">*</span>}
          </FormLabel>

          <FormControl>
            <FormInput {...field} config={regularConfig} disabled={disabled} />
          </FormControl>

          {regularConfig.description && (
            <FormDescription className="text-xs text-muted-foreground">
              {regularConfig.description}
            </FormDescription>
          )}

          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  )
}

// Export types for external usage
export type { SelectOption, InputConfig }
