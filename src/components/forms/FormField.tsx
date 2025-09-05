import { type Control } from 'react-hook-form'
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

/**
 * FormField - Field wrapper component with label, validation, and description
 *
 * Provides consistent field layout with React Hook Form integration.
 * Automatically adapts to dialog context for responsive behavior.
 */

export interface FieldConfig extends InputConfig {
  label: string
  name: string
  required?: boolean
  description?: string
  validation?: Record<string, unknown> // Yup schema validation
}

interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  name: string
  config: FieldConfig
  disabled?: boolean
  className?: string
}

export function FormFieldNew({ control, name, config, disabled, className }: FormFieldProps) {
  const { isInDialog } = useDialogContext()
  const spacingClasses = getFormSpacingClasses(isInDialog)

  return (
    <FormFieldPrimitive
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(spacingClasses, config.className, className)}>
          <FormLabel className="text-sm font-medium text-gray-700">
            {config.label}
            {config.required && <span className="ml-1 text-red-500">*</span>}
          </FormLabel>

          <FormControl>
            <FormInput {...field} config={config} disabled={disabled} />
          </FormControl>

          {config.description && (
            <FormDescription className="text-xs text-muted-foreground">
              {config.description}
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
