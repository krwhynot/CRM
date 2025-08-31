import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface FormCheckboxFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export function FormCheckboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  className,
}: FormCheckboxFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3',
            className
          )}
        >
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {description && <div className="text-xs text-muted-foreground">{description}</div>}
          </div>
        </FormItem>
      )}
    />
  )
}
