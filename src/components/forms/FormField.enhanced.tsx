import { type Control, type FieldValues, type Path, type ControllerRenderProps } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField as FormFieldPrimitive,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  CalendarIcon,
  Phone,
  Mail,
  Globe,
  MapPin,
  DollarSign,
  Building2,
  User,
  Package,
  Target,
  Plus,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useDialogContext } from '@/contexts/DialogContext'
import { getFormSpacingClasses } from '@/lib/utils/form-utils'

/**
 * Enhanced FormField - Consolidated field component
 *
 * Combines functionality from FormField, EnhancedFormField, and CRMFormFields
 * into a single, unified component with comprehensive field type support.
 */

export interface SelectOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface BaseFieldConfig {
  label: string
  name?: string
  type: string
  required?: boolean
  disabled?: boolean
  description?: string
  placeholder?: string
  className?: string
  condition?: (values: FieldValues) => boolean // Conditional field visibility
}

export interface InputConfig extends BaseFieldConfig {
  type: 'text' | 'email' | 'phone' | 'url' | 'password' | 'number' | 'date' | 'datetime-local' | 'time'
  autoComplete?: string
  min?: number
  max?: number
  step?: number
  maxLength?: number
}

export interface TextareaConfig extends BaseFieldConfig {
  type: 'textarea'
  rows?: number
  maxLength?: number
}

export interface SelectConfig extends BaseFieldConfig {
  type: 'select'
  options: SelectOption[]
  searchable?: boolean
}

export interface RadioConfig extends BaseFieldConfig {
  type: 'radio'
  options: SelectOption[]
}

export interface CheckboxConfig extends BaseFieldConfig {
  type: 'checkbox'
  checkboxLabel?: string
}

export interface SwitchConfig extends BaseFieldConfig {
  type: 'switch'
  switchLabel?: string
}

export interface HeadingConfig extends BaseFieldConfig {
  type: 'heading'
  level?: 2 | 3 | 4 // Optional heading level (defaults to 3)
}

export interface TagsConfig extends BaseFieldConfig {
  type: 'tags'
  maxTags?: number
  suggestions?: string[]
}

export interface CurrencyConfig extends BaseFieldConfig {
  type: 'currency'
  currency?: string
  min?: number
  max?: number
}

export interface PhoneConfig extends BaseFieldConfig {
  type: 'phone'
  format?: 'US' | 'international'
}

export interface DatePickerConfig extends BaseFieldConfig {
  type: 'datepicker'
  showTime?: boolean
  minDate?: Date
  maxDate?: Date
}

export type FieldConfig =
  | InputConfig
  | TextareaConfig
  | SelectConfig
  | RadioConfig
  | CheckboxConfig
  | SwitchConfig
  | HeadingConfig
  | TagsConfig
  | CurrencyConfig
  | PhoneConfig
  | DatePickerConfig

interface FormFieldEnhancedProps<T extends FieldValues = FieldValues> {
  control?: Control<T>
  name?: Path<T>
  config: FieldConfig
  disabled?: boolean
  className?: string
}

export function FormFieldEnhanced<T extends FieldValues = FieldValues>({
  control,
  name,
  config,
  disabled,
  className
}: FormFieldEnhancedProps<T>) {
  const { isInDialog } = useDialogContext()
  const spacingClasses = getFormSpacingClasses(isInDialog)

  // Handle heading fields
  if (config.type === 'heading') {
    const headingConfig = config as HeadingConfig
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
    // This should not happen in normal usage for non-heading fields
    return null
  }

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
            {renderFieldInput(field, config, disabled)}
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

function renderFieldInput<T extends FieldValues>(
  field: ControllerRenderProps<T, Path<T>>,
  config: FieldConfig,
  disabled?: boolean
) {
  const isDisabled = disabled || config.disabled

  switch (config.type) {
    case 'select': {
      const selectConfig = config as SelectConfig
      return (
        <Select
          value={field.value || ''}
          onValueChange={field.onChange}
          disabled={isDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={config.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {selectConfig.options?.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
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
    }

    case 'textarea': {
      const textareaConfig = config as TextareaConfig
      return (
        <Textarea
          {...field}
          disabled={isDisabled}
          placeholder={config.placeholder}
          rows={textareaConfig.rows ?? 3}
          maxLength={textareaConfig.maxLength}
          className="min-h-20 resize-y"
        />
      )
    }

    case 'radio': {
      const radioConfig = config as RadioConfig
      return (
        <RadioGroup
          value={field.value || ''}
          onValueChange={field.onChange}
          disabled={isDisabled}
          className={config.className}
        >
          {radioConfig.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
              <Label
                htmlFor={`${field.name}-${option.value}`}
                className="cursor-pointer text-sm font-normal"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    }

    case 'checkbox': {
      const checkboxConfig = config as CheckboxConfig
      return (
        <div className="flex items-center space-x-3 py-2">
          <Checkbox
            checked={field.value || false}
            onCheckedChange={field.onChange}
            disabled={isDisabled}
          />
          {checkboxConfig.checkboxLabel && (
            <span className="text-sm text-gray-700">{checkboxConfig.checkboxLabel}</span>
          )}
        </div>
      )
    }

    case 'switch': {
      const switchConfig = config as SwitchConfig
      return (
        <div className="flex items-center space-x-3 py-2">
          <Switch
            checked={field.value || false}
            onCheckedChange={field.onChange}
            disabled={isDisabled}
          />
          {switchConfig.switchLabel && (
            <span className="text-sm text-gray-700">{switchConfig.switchLabel}</span>
          )}
        </div>
      )
    }

    case 'datepicker': {
      const dateConfig = config as DatePickerConfig
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
              disabled={isDisabled}
            >
              <CalendarIcon className="mr-2 size-4" />
              {field.value ? format(new Date(field.value), "PPP") : <span>{config.placeholder || "Pick a date"}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={field.value ? new Date(field.value) : undefined}
              onSelect={(date) => field.onChange(date?.toISOString())}
              disabled={(date) => {
                if (dateConfig.minDate && date < dateConfig.minDate) return true
                if (dateConfig.maxDate && date > dateConfig.maxDate) return true
                return false
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )
    }

    case 'tags': {
      const tagsConfig = config as TagsConfig
      const tags = Array.isArray(field.value) ? field.value : []

      const addTag = (tag: string) => {
        if (tag && !tags.includes(tag) && (!tagsConfig.maxTags || tags.length < tagsConfig.maxTags)) {
          field.onChange([...tags, tag])
        }
      }

      const removeTag = (tagToRemove: string) => {
        field.onChange(tags.filter(tag => tag !== tagToRemove))
      }

      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 size-3 rounded-full hover:bg-gray-300"
                  disabled={isDisabled}
                >
                  <X className="size-2" />
                </button>
              </Badge>
            ))}
          </div>
          <Input
            placeholder={config.placeholder || "Add tags..."}
            disabled={isDisabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const value = e.currentTarget.value.trim()
                if (value) {
                  addTag(value)
                  e.currentTarget.value = ''
                }
              }
            }}
          />
        </div>
      )
    }

    case 'currency': {
      const currencyConfig = config as CurrencyConfig
      return (
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            {...field}
            type="number"
            disabled={isDisabled}
            placeholder={config.placeholder}
            min={currencyConfig.min}
            max={currencyConfig.max}
            step="0.01"
            className="pl-10"
          />
        </div>
      )
    }

    case 'phone': {
      const phoneConfig = config as PhoneConfig
      return (
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            {...field}
            type="tel"
            disabled={isDisabled}
            placeholder={config.placeholder || "+1 (555) 123-4567"}
            autoComplete="tel"
            className="pl-10"
          />
        </div>
      )
    }

    case 'email':
      return (
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            {...field}
            type="email"
            disabled={isDisabled}
            placeholder={config.placeholder}
            autoComplete="email"
            className="pl-10"
          />
        </div>
      )

    case 'url':
      return (
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            {...field}
            type="url"
            disabled={isDisabled}
            placeholder={config.placeholder || "https://example.com"}
            autoComplete="url"
            className="pl-10"
          />
        </div>
      )

    case 'number': {
      const inputConfig = config as InputConfig
      return (
        <Input
          {...field}
          type="number"
          disabled={isDisabled}
          placeholder={config.placeholder}
          min={inputConfig.min}
          max={inputConfig.max}
          step={inputConfig.step}
          maxLength={inputConfig.maxLength}
        />
      )
    }

    case 'date':
      return (
        <Input
          {...field}
          type="date"
          disabled={isDisabled}
          value={field.value || ''}
        />
      )

    case 'datetime-local':
      return (
        <Input
          {...field}
          type="datetime-local"
          disabled={isDisabled}
          value={field.value || ''}
        />
      )

    case 'time':
      return (
        <Input
          {...field}
          type="time"
          disabled={isDisabled}
          value={field.value || ''}
        />
      )

    case 'password':
      return (
        <Input
          {...field}
          type="password"
          disabled={isDisabled}
          placeholder={config.placeholder}
          autoComplete="current-password"
        />
      )

    default: {
      // Default to text input with smart autocomplete
      const inputConfig = config as InputConfig
      return (
        <Input
          {...field}
          type="text"
          disabled={isDisabled}
          placeholder={config.placeholder}
          autoComplete={inputConfig.autoComplete || getAutoComplete(config.name || '')}
          maxLength={inputConfig.maxLength}
        />
      )
    }
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
    name: 'name',
    organization_name: 'organization',
  }

  return autoCompleteMap[fieldName] || 'off'
}

// Export types for external usage
export type { SelectOption }