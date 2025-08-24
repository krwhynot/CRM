import React from 'react'
import { Control } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputNew } from '@/components/ui/new/Input'
import { LabelNew } from '@/components/ui/new/Label'
import { ContactFormData } from '@/types/contact.types'

interface ContactFormBasicFieldsProps {
  control: Control<ContactFormData>
  loading: boolean
  useNewStyle: boolean
  inputClassName: string
}

export const ContactFormBasicFields: React.FC<ContactFormBasicFieldsProps> = ({
  control,
  loading,
  useNewStyle,
  inputClassName
}) => {
  return (
    <>
      <FormField control={control} name="first_name" render={({ field }) => (
        <FormItem>
          {useNewStyle ? (
            <LabelNew required>First Name</LabelNew>
          ) : (
            <FormLabel>First Name *</FormLabel>
          )}
          <FormControl>
            {useNewStyle ? (
              <InputNew {...field} disabled={loading} />
            ) : (
              <Input {...field} className={inputClassName} disabled={loading} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="last_name" render={({ field }) => (
        <FormItem>
          {useNewStyle ? (
            <LabelNew required>Last Name</LabelNew>
          ) : (
            <FormLabel>Last Name *</FormLabel>
          )}
          <FormControl>
            {useNewStyle ? (
              <InputNew {...field} disabled={loading} />
            ) : (
              <Input {...field} className={inputClassName} disabled={loading} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="title" render={({ field }) => (
        <FormItem>
          {useNewStyle ? (
            <LabelNew>Title</LabelNew>
          ) : (
            <FormLabel>Title</FormLabel>
          )}
          <FormControl>
            {useNewStyle ? (
              <InputNew {...field} value={field.value || ''} disabled={loading} />
            ) : (
              <Input {...field} value={field.value || ''} className={inputClassName} disabled={loading} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )
}