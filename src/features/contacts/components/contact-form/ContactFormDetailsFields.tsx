import React from 'react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { FormField } from '@/components/forms'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type { ContactFormData } from '@/types/contact.types'
import { PreferredPrincipalsSelect } from '../PreferredPrincipalsSelect'

interface ContactFormDetailsFieldsProps {
  control: Control<ContactFormData>
  loading: boolean
  inputClassName: string
}

export const ContactFormDetailsFields: React.FC<ContactFormDetailsFieldsProps> = ({
  control,
  loading,
  inputClassName,
}) => {
  return (
    <div className="space-y-4">
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField label="Email" error={fieldState.error?.message}>
            <Input
              {...field}
              value={field.value || ''}
              type="email"
              className={inputClassName}
              disabled={loading}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <FormField label="Phone" error={fieldState.error?.message}>
            <Input
              {...field}
              value={field.value || ''}
              type="tel"
              className={inputClassName}
              disabled={loading}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="mobile_phone"
        render={({ field, fieldState }) => (
          <FormField label="Mobile Phone" error={fieldState.error?.message}>
            <Input
              {...field}
              value={field.value || ''}
              type="tel"
              className={inputClassName}
              disabled={loading}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="department"
        render={({ field, fieldState }) => (
          <FormField label="Department" error={fieldState.error?.message}>
            <Input
              {...field}
              value={field.value || ''}
              className={inputClassName}
              disabled={loading}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="preferred_principals"
        render={({ field, fieldState }) => (
          <FormField label="Preferred Principals" error={fieldState.error?.message}>
            <PreferredPrincipalsSelect
              value={field.value?.filter((v): v is string => v !== undefined) || []}
              onChange={(value) => field.onChange(value)}
              disabled={loading}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="is_primary_contact"
        render={({ field, fieldState }) => (
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={loading}
            />
            <div className="grid gap-1.5 leading-none">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Primary Contact
              </label>
              {fieldState.error && (
                <p className="text-xs text-destructive" role="alert">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          </div>
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field, fieldState }) => (
          <FormField label="Notes" error={fieldState.error?.message}>
            <Textarea {...field} value={field.value || ''} rows={3} disabled={loading} />
          </FormField>
        )}
      />
    </div>
  )
}
