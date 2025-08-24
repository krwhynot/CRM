import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UseFormReturn } from 'react-hook-form'
import type { ContactFormData } from '@/types/contact.types'

interface ContactClassificationFieldsProps {
  form: UseFormReturn<ContactFormData>
  loading: boolean
}

export const ContactClassificationFields: React.FC<ContactClassificationFieldsProps> = ({ 
  form, 
  loading 
}) => {
  return (
    <>
      <FormField control={form.control} name="purchase_influence" render={({ field }) => (
        <FormItem>
          <FormLabel>Purchase Influence *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="decision_authority" render={({ field }) => (
        <FormItem>
          <FormLabel>Decision Authority *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
            <SelectContent>
              <SelectItem value="Decision Maker">Decision Maker</SelectItem>
              <SelectItem value="Influencer">Influencer</SelectItem>
              <SelectItem value="End User">End User</SelectItem>
              <SelectItem value="Gatekeeper">Gatekeeper</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )
}