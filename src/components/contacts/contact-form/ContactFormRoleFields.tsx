import React from 'react'
import { Control } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ContactFormData, CONTACT_ROLES } from '@/types/contact.types'
import { Organization } from '@/types/entities'

interface ContactFormRoleFieldsProps {
  control: Control<ContactFormData>
  organizations: Organization[]
  inputClassName: string
}

export const ContactFormRoleFields: React.FC<ContactFormRoleFieldsProps> = ({
  control,
  organizations,
  inputClassName
}) => {
  return (
    <>
      <FormField control={control} name="role" render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl><SelectTrigger className={inputClassName}><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
            <SelectContent>
              {CONTACT_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="organization_id" render={({ field }) => (
        <FormItem>
          <FormLabel>Organization *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl><SelectTrigger className={inputClassName}><SelectValue placeholder="Select organization" /></SelectTrigger></FormControl>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="purchase_influence" render={({ field }) => (
        <FormItem>
          <FormLabel>Purchase Influence *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger className={inputClassName}><SelectValue /></SelectTrigger></FormControl>
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

      <FormField control={control} name="decision_authority" render={({ field }) => (
        <FormItem>
          <FormLabel>Decision Authority *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger className={inputClassName}><SelectValue /></SelectTrigger></FormControl>
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