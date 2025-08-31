import type { FieldValues, UseFormReturn, Path, ControllerRenderProps } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import type { FormFieldConfig, SelectOption } from '@/hooks/useFormLayout'

interface FormFieldRendererProps<T extends FieldValues> {
  field: FormFieldConfig<T>
  form: UseFormReturn<T, any, any>
  loading: boolean
  className?: string
}

export function FormFieldRenderer<T extends FieldValues>({
  field,
  form,
  loading,
  className,
}: FormFieldRendererProps<T>) {
  const { name, type, label, placeholder, description, required, options, tooltip } = field

  return (
    <FormField
      control={form.control}
      name={name as Path<T>}
      render={({ field: formField }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center gap-2 text-base">
            {label}
            {required && <span className="text-destructive">*</span>}
            {tooltip && <span className="ml-1 text-xs text-gray-500">({tooltip})</span>}
          </FormLabel>

          <FormControl>
            <FormControlRenderer<T>
              type={type}
              field={formField}
              placeholder={placeholder}
              loading={loading}
              options={options}
            />
          </FormControl>

          {description && <FormDescription className="text-sm">{description}</FormDescription>}

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface FormControlRendererProps<T extends FieldValues> {
  type: FormFieldConfig<T>['type']
  field: ControllerRenderProps<T, Path<T>>
  placeholder?: string
  loading?: boolean
  options?: SelectOption[]
}

function FormControlRenderer<T extends FieldValues>({
  type,
  field,
  placeholder,
  loading,
  options,
}: FormControlRendererProps<T>) {
  switch (type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'number':
      return (
        <Input
          type={type}
          placeholder={placeholder}
          disabled={loading}
          className="h-12 rounded-md border border-gray-300 px-4 text-base 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                     disabled:bg-gray-50 disabled:text-gray-500"
          {...field}
        />
      )

    case 'textarea':
      return (
        <Textarea
          placeholder={placeholder}
          disabled={loading}
          rows={4}
          className="resize-none rounded-md border border-gray-300 p-4 
                     text-base focus:border-blue-500 focus:ring-2
                     focus:ring-blue-200"
          {...field}
        />
      )

    case 'select':
      return (
        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon && <span>{option.icon}</span>}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'switch':
      return <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />

    case 'checkbox':
      return <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading} />

    default:
      return (
        <Input
          placeholder={placeholder}
          disabled={loading}
          className="h-12 rounded-md border border-gray-300 px-4 text-base 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                     disabled:bg-gray-50 disabled:text-gray-500"
          {...field}
        />
      )
  }
}
