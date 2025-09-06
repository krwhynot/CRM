import * as React from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * FormInput - Individual input components for forms
 *
 * Provides all input types used in the CRM system with consistent styling
 * and dialog-aware responsive behavior.
 */

export interface SelectOption {
  value: string
  label: string
  description?: string
  icon?: string
}

export interface InputConfig {
  type?:
    | 'text'
    | 'email'
    | 'tel'
    | 'url'
    | 'number'
    | 'date'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'switch'
  placeholder?: string
  options?: SelectOption[]
  rows?: number
  min?: number
  max?: number
  step?: number
  switchLabel?: string
  disabled?: boolean
  className?: string
}

interface FormInputProps {
  value?: string | number | boolean | null | undefined
  onChange?: (value: string | number | boolean | null | undefined) => void
  onBlur?: () => void
  name?: string
  config: InputConfig
  disabled?: boolean
}

export const FormInput = React.forwardRef<HTMLElement, FormInputProps>(
  ({ value, onChange, onBlur, name, config, disabled }, ref) => {
  const commonDisabled = disabled || config.disabled
  const baseClassName = cn('h-11', config.className)
  
  const stringValue = value ? String(value) : ''

  switch (config.type) {
    case 'select':
      return (
        <Select 
          value={stringValue} 
          onValueChange={(val) => onChange?.(val || null)} 
          disabled={commonDisabled}
        >
          <SelectTrigger ref={ref as React.RefObject<HTMLButtonElement>} className="h-11">
            <SelectValue placeholder={config.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {config.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon && <span className="text-sm">{option.icon}</span>}
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'textarea':
      return (
        <Textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={stringValue}
          onChange={(e) => onChange?.(e.target.value || null)}
          onBlur={onBlur}
          disabled={commonDisabled}
          placeholder={config.placeholder}
          rows={config.rows ?? 3}
          className="min-h-20 resize-y"
        />
      )

    case 'radio':
      return (
        <RadioGroup
          value={stringValue}
          onValueChange={(val) => onChange?.(val || null)}
          disabled={commonDisabled}
          className={config.className}
        >
          {config.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
              <Label
                htmlFor={`${name}-${option.value}`}
                className="cursor-pointer text-sm font-normal"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )

    case 'switch':
      return (
        <div className="flex items-center space-x-3 py-2">
          <Switch
            ref={ref as React.RefObject<HTMLButtonElement>}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange?.(checked)}
            disabled={commonDisabled}
          />
          {config.switchLabel && (
            <span className="text-sm text-gray-700">{config.switchLabel}</span>
          )}
        </div>
      )

    case 'date':
      return (
        <Input
          ref={ref as React.RefObject<HTMLInputElement>}
          value={stringValue}
          onChange={(e) => onChange?.(e.target.value || null)}
          onBlur={onBlur}
          disabled={commonDisabled}
          placeholder={config.placeholder}
          className={baseClassName}
          type="date"
        />
      )

    case 'email':
      return (
        <Input
          ref={ref as React.RefObject<HTMLInputElement>}
          value={stringValue}
          onChange={(e) => onChange?.(e.target.value || null)}
          onBlur={onBlur}
          disabled={commonDisabled}
          placeholder={config.placeholder}
          className={baseClassName}
          type="email"
          autoComplete="email"
        />
      )

    case 'tel':
      return (
        <Input
          ref={ref as React.RefObject<HTMLInputElement>}
          value={stringValue}
          onChange={(e) => onChange?.(e.target.value || null)}
          onBlur={onBlur}
          disabled={commonDisabled}
          placeholder={config.placeholder}
          className={baseClassName}
          type="tel"
          autoComplete="tel"
        />
      )

    case 'url':
      return (
        <Input
          ref={ref as React.RefObject<HTMLInputElement>}
          value={stringValue}
          onChange={(e) => onChange?.(e.target.value || null)}
          onBlur={onBlur}
          disabled={commonDisabled}
          placeholder={config.placeholder}
          className={baseClassName}
          type="url"
          autoComplete="url"
        />
      )

    case 'number':
      return (
        <Input
          ref={ref as React.RefObject<HTMLInputElement>}
          value={stringValue}
          onChange={(e) => {
            const numValue = parseFloat(e.target.value)
            onChange?.(isNaN(numValue) ? null : numValue)
          }}
          onBlur={onBlur}
          disabled={commonDisabled}
          placeholder={config.placeholder}
          className={baseClassName}
          type="number"
          min={config.min}
          max={config.max}
          step={config.step}
        />
      )

    case 'text':
    default:
      return (
        <Input
          ref={ref as React.RefObject<HTMLInputElement>}
          value={stringValue}
          onChange={(e) => onChange?.(e.target.value || null)}
          onBlur={onBlur}
          disabled={commonDisabled}
          placeholder={config.placeholder}
          className={baseClassName}
          type="text"
          autoComplete={getAutoComplete(name || '')}
        />
      )
    }
  }
)

FormInput.displayName = 'FormInput'

// Helper function to provide appropriate autocomplete attributes
function getAutoComplete(fieldName: string): string {
  const autoCompleteMap: Record<string, string> = {
    first_name: 'given-name',
    last_name: 'family-name',
    email: 'email',
    phone: 'tel',
    website: 'url',
    address: 'street-address',
    city: 'address-level2',
    state: 'address-level1',
    zip_code: 'postal-code',
    company: 'organization',
    position: 'organization-title',
    title: 'organization-title',
  }

  return autoCompleteMap[fieldName] || 'off'
}

// Export commonly used input components for direct usage
export { Input as TextInput } from '@/components/ui/input'
export { Textarea } from '@/components/ui/textarea'
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
export { Switch } from '@/components/ui/switch'
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
