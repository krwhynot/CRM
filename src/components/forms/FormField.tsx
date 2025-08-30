import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label: React.ReactNode
  description?: React.ReactNode
  error?: React.ReactNode
  required?: boolean
  children: React.ReactElement
  className?: string
}

/**
 * FormField component provides consistent labels, help text, error messages, 
 * and accessibility features for form inputs. Integrates seamlessly with 
 * React Hook Form via Controller pattern.
 * 
 * Features:
 * - Automatic ID generation and ARIA attribute management
 * - Required field indicators with asterisk
 * - Error state handling with proper styling
 * - Description/help text support
 * - Full accessibility compliance (aria-describedby, aria-invalid)
 * 
 * Usage with React Hook Form:
 * ```tsx
 * <Controller
 *   control={form.control}
 *   name="name"
 *   render={({ field, fieldState }) => (
 *     <FormField label="Name" required error={fieldState.error?.message}>
 *       <Input {...field} />
 *     </FormField>
 *   )}
 * />
 * ```
 */
export function FormField({
  label,
  description,
  error,
  required,
  children,
  className
}: FormFieldProps) {
  const id = React.useId()
  const descId = description ? `${id}-desc` : undefined
  const errId = error ? `${id}-err` : undefined
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined

  // Clone the child element and inject necessary props
  const control = React.cloneElement(children, {
    id,
    "aria-invalid": !!error || undefined,
    "aria-describedby": describedBy
  })

  return (
    <div data-form-field className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} {required && <span className="text-destructive" aria-label="required">*</span>}
      </label>
      {control}
      {description && (
        <p id={descId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}