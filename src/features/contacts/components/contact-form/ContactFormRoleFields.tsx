import React from 'react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { FormField } from '@/components/forms'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContactFormData } from '@/types/contact.types'
import { CONTACT_ROLES } from '@/types/contact.types'
import type { Organization } from '@/types/entities'

interface ContactFormRoleFieldsProps {
  control: Control<ContactFormData>
  organizations: Organization[]
  inputClassName: string
}

export const ContactFormRoleFields: React.FC<ContactFormRoleFieldsProps> = ({
  control,
  organizations,
  inputClassName,
}) => {
  return (
    <>
      <Controller
        control={control}
        name="role"
        render={({ field, fieldState }) => (
          <FormField label="Role" error={fieldState.error?.message}>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <SelectTrigger className={inputClassName}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="organization_id"
        render={({ field, fieldState }) => (
          <FormField label="Organization" required error={fieldState.error?.message}>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className={inputClassName}>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="purchase_influence"
        render={({ field, fieldState }) => (
          <FormField label="Purchase Influence" required error={fieldState.error?.message}>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="decision_authority"
        render={({ field, fieldState }) => (
          <FormField label="Decision Authority" required error={fieldState.error?.message}>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                <SelectItem value="Influencer">Influencer</SelectItem>
                <SelectItem value="End User">End User</SelectItem>
                <SelectItem value="Gatekeeper">Gatekeeper</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
    </>
  )
}
