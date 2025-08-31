import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface FormSwitchFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export function FormSwitchField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  className,
}: FormSwitchFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm',
            className
          )}
        >
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description && <div className="text-xs text-muted-foreground">{description}</div>}
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
