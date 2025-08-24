import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CONTACT_ROLES } from '@/types/contact.types'
import type { UseFormReturn } from 'react-hook-form'
import type { ContactFormData } from '@/types/contact.types'

interface ContactBasicFieldsProps {
  form: UseFormReturn<ContactFormData>
  loading: boolean
}

export const ContactBasicFields: React.FC<ContactBasicFieldsProps> = ({ form, loading }) => {
  return (
    <>
      <FormField control={form.control} name="first_name" render={({ field }) => (
        <FormItem>
          <FormLabel>First Name *</FormLabel>
          <FormControl><Input {...field} className="h-11" disabled={loading} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="last_name" render={({ field }) => (
        <FormItem>
          <FormLabel>Last Name *</FormLabel>
          <FormControl><Input {...field} className="h-11" disabled={loading} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="title" render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl><Input {...field} value={field.value || ''} className="h-11" disabled={loading} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="role" render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
            <SelectContent>
              {CONTACT_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )
}