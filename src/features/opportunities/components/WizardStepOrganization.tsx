import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UseFormSetValue, FieldErrors } from 'react-hook-form'
import type { OpportunityFormData } from '@/types/opportunity.types'
import type { Organization, Contact } from '@/types/entities'

interface WizardStepOrganizationProps {
  organizations: Organization[]
  filteredContacts: Contact[]
  selectedOrganization: string
  contactValue: string | null
  setValue: UseFormSetValue<OpportunityFormData>
  errors: FieldErrors<OpportunityFormData>
  loading?: boolean
  preselectedOrganization?: string
  preselectedContact?: string
}

export const WizardStepOrganization: React.FC<WizardStepOrganizationProps> = ({
  organizations,
  filteredContacts,
  selectedOrganization,
  contactValue,
  setValue,
  errors,
  loading = false,
  preselectedOrganization,
  preselectedContact
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="organization_id" className="text-sm font-medium">
          Organization *
        </label>
        <Select 
          value={selectedOrganization || undefined} 
          onValueChange={(value) => {
            setValue('organization_id', value || '')
            if (value !== selectedOrganization) {
              setValue('contact_id', '')
            }
          }}
          disabled={loading || !!preselectedOrganization}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name} ({org.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.organization_id && (
          <p className="mt-1 text-sm text-red-600">{errors.organization_id.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact_id" className="text-sm font-medium">
          Primary Contact
        </label>
        <Select 
          value={contactValue || 'none'} 
          onValueChange={(value) => setValue('contact_id', value === 'none' ? null : value || null)}
          disabled={loading || !selectedOrganization || !!preselectedContact}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select contact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No contact</SelectItem>
            {filteredContacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.first_name} {contact.last_name} ({contact.title || 'No title'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.contact_id && (
          <p className="mt-1 text-sm text-red-600">{errors.contact_id.message}</p>
        )}
      </div>
    </div>
  )
}