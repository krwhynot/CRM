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
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formTheme } from '@/configs/forms/base.config'
import type { FieldConfig } from '@/types/forms'

interface EnhancedFormFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>
  name: Path<T>
  config: FieldConfig
  disabled?: boolean
}

export function EnhancedFormField<T extends FieldValues = FieldValues>({ control, name, config, disabled }: EnhancedFormFieldProps<T>) {
  return (
    <FormFieldPrimitive
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={config.className}>
          <FormLabel className="text-sm font-medium text-gray-700">
            {config.label}
            {config.required && <span className="ml-1 text-mfb-clay">*</span>}
          </FormLabel>

          <FormControl>{renderFieldInput(field, config, disabled)}</FormControl>

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

function renderFieldInput<T extends FieldValues>(field: ControllerRenderProps<T, Path<T>>, config: FieldConfig, disabled?: boolean) {
  const commonProps = {
    ...field,
    disabled: disabled || config.disabled,
    placeholder: config.placeholder,
    className: cn(formTheme.sizing.input, config.className),
  }

  switch (config.type) {
    case 'select':
      return (
        <Select
          value={field.value || ''}
          onValueChange={field.onChange}
          disabled={commonProps.disabled}
        >
          <SelectTrigger className={formTheme.sizing.select}>
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
      return <Textarea {...commonProps} rows={config.rows ?? 3} className="min-h-20 resize-y" />

    case 'radio':
      return (
        <RadioGroup
          value={field.value || ''}
          onValueChange={field.onChange}
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
            checked={field.value || false}
            onCheckedChange={field.onChange}
            disabled={commonProps.disabled}
          />
          {config.switchLabel && (
            <span className="text-sm text-gray-700">{config.switchLabel}</span>
          )}
        </div>
      )

    case 'date':
      return (
        <Input {...commonProps} type="date" value={field.value || ''} onChange={field.onChange} />
      )

    case 'email':
      return <Input {...commonProps} type="email" autoComplete="email" />

    case 'phone':
      return <Input {...commonProps} type="tel" autoComplete="tel" />

    case 'url':
      return <Input {...commonProps} type="url" autoComplete="url" />

    case 'number':
      return (
        <Input
          {...commonProps}
          type="number"
          min={config.min}
          max={config.max}
          step={config.step}
        />
      )

    default:
      return <Input {...commonProps} type="text" autoComplete={getAutoComplete(config.name)} />
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
