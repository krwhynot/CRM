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
  condition?: (values: FieldValues) => boolean // Conditional field visibility
}

interface FormFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>
  name: Path<T>
  config: FieldConfig
  disabled?: boolean
  className?: string
}

export function FormFieldNew<T extends FieldValues = FieldValues>({ control, name, config, disabled, className }: FormFieldProps<T>) {
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
