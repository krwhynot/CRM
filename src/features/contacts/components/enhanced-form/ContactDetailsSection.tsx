import React from 'react'
import { ProgressiveDetails } from '@/components/forms'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PreferredPrincipalsSelect } from '../PreferredPrincipalsSelect'
import type { UseFormReturn } from 'react-hook-form'
import type { ContactFormData } from '@/types/contact.types'

interface ContactDetailsSectionProps {
  form: UseFormReturn<ContactFormData>
  loading: boolean
}

export const ContactDetailsSection: React.FC<ContactDetailsSectionProps> = ({ 
  form, 
  loading 
}) => {
  return (
    <ProgressiveDetails buttonText="Add Contact Details">
      <div className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ''} 
                type="email" 
                className="h-11" 
                disabled={loading} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ''} 
                type="tel" 
                className="h-11" 
                disabled={loading} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="mobile_phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Mobile Phone</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ''} 
                type="tel" 
                className="h-11" 
                disabled={loading} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="department" render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ''} 
                className="h-11" 
                disabled={loading} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="preferred_principals" render={({ field }) => (
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

        <FormField control={form.control} name="is_primary_contact" render={({ field }) => (
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

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                value={field.value || ''} 
                rows={3} 
                disabled={loading} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </ProgressiveDetails>
  )
}