import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FormInputFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'password'
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export function FormInputField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  disabled = false,
  className,
  required = false
}: FormInputFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={cn("h-11", className)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}