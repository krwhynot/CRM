import React from 'react'
import { Control } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ContactFormData } from '@/types/contact.types'

interface ContactFormBasicFieldsProps {
  control: Control<ContactFormData>
  loading: boolean
  useNewStyle?: boolean // Optional for backwards compatibility
  inputClassName?: string
}

export const ContactFormBasicFields: React.FC<ContactFormBasicFieldsProps> = ({
  control,
  loading,
  inputClassName = ""
}) => {
  return (
    <>
      <FormField control={control} name="first_name" render={({ field }) => (
        <FormItem>
          <FormLabel>First Name *</FormLabel>
          <FormControl>
            <Input {...field} className={inputClassName} disabled={loading} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="last_name" render={({ field }) => (
        <FormItem>
          <FormLabel>Last Name *</FormLabel>
          <FormControl>
            <Input {...field} className={inputClassName} disabled={loading} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="title" render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input {...field} value={field.value || ''} className={inputClassName} disabled={loading} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )
}