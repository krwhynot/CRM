import React from 'react'
import { Control } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ContactFormData } from '@/types/contact.types'
import { PreferredPrincipalsSelect } from '../PreferredPrincipalsSelect'

interface ContactFormDetailsFieldsProps {
  control: Control<ContactFormData>
  loading: boolean
  inputClassName: string
}

export const ContactFormDetailsFields: React.FC<ContactFormDetailsFieldsProps> = ({
  control,
  loading,
  inputClassName
}) => {
  return (
    <div className="space-y-4">
      <FormField control={control} name="email" render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} value={field.value || ''} type="email" className={inputClassName} disabled={loading} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="phone" render={({ field }) => (
        <FormItem>
          <FormLabel>Phone</FormLabel>
          <FormControl>
            <Input {...field} value={field.value || ''} type="tel" className={inputClassName} disabled={loading} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="mobile_phone" render={({ field }) => (
        <FormItem>
          <FormLabel>Mobile Phone</FormLabel>
          <FormControl>
            <Input {...field} value={field.value || ''} type="tel" className={inputClassName} disabled={loading} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="department" render={({ field }) => (
        <FormItem>
          <FormLabel>Department</FormLabel>
          <FormControl>
            <Input {...field} value={field.value || ''} className={inputClassName} disabled={loading} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="preferred_principals" render={({ field }) => (
        <FormItem>
          <FormLabel>Preferred Principals</FormLabel>
          <FormControl>
            <PreferredPrincipalsSelect
              value={field.value?.filter((v): v is string => v !== undefined) || []}
              onChange={(value) => field.onChange(value)}
              disabled={loading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="is_primary_contact" render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={loading}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Primary Contact</FormLabel>
          </div>
        </FormItem>
      )} />

      <FormField control={control} name="notes" render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea {...field} value={field.value || ''} rows={3} disabled={loading} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  )
}