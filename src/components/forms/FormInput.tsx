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
  value?: any
  onChange?: (value: any) => void
  onBlur?: () => void
  name?: string
  config: InputConfig
  disabled?: boolean
}

export function FormInput({ value, onChange, onBlur, name, config, disabled }: FormInputProps) {
  const commonProps = {
    value: value || '',
    onChange,
    onBlur,
    disabled: disabled || config.disabled,
    placeholder: config.placeholder,
    className: cn('h-11', config.className),
  }

  switch (config.type) {
    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange} disabled={commonProps.disabled}>
          <SelectTrigger className="h-11">
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
          {...commonProps}
          rows={config.rows ?? 3}
          className="min-h-20 resize-y"
          onChange={(e) => onChange?.(e.target.value)}
        />
      )

    case 'radio':
      return (
        <RadioGroup
          value={value || ''}
          onValueChange={onChange}
          disabled={commonProps.disabled}
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
            checked={value || false}
            onCheckedChange={onChange}
            disabled={commonProps.disabled}
          />
          {config.switchLabel && (
            <span className="text-sm text-gray-700">{config.switchLabel}</span>
          )}
        </div>
      )

    case 'date':
      return <Input {...commonProps} type="date" onChange={(e) => onChange?.(e.target.value)} />

    case 'email':
      return (
        <Input
          {...commonProps}
          type="email"
          autoComplete="email"
          onChange={(e) => onChange?.(e.target.value)}
        />
      )

    case 'tel':
      return (
        <Input
          {...commonProps}
          type="tel"
          autoComplete="tel"
          onChange={(e) => onChange?.(e.target.value)}
        />
      )

    case 'url':
      return (
        <Input
          {...commonProps}
          type="url"
          autoComplete="url"
          onChange={(e) => onChange?.(e.target.value)}
        />
      )

    case 'number':
      return (
        <Input
          {...commonProps}
          type="number"
          min={config.min}
          max={config.max}
          step={config.step}
          onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
        />
      )

    default:
      return (
        <Input
          {...commonProps}
          type="text"
          autoComplete={getAutoComplete(name || '')}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )
  }
}

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
