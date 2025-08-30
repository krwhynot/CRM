import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ProgressiveDetails } from '@/components/forms'
import { Building2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { ContactFormData } from '@/types/contact.types'
import type { OrganizationMode } from '@/features/contacts/hooks/useEnhancedContactFormState'

interface NewOrganizationData {
  name: string
  type: 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor'
  phone: string
  email: string
  website: string
  notes: string
}

interface OrganizationModeSelectorProps {
  form: UseFormReturn<ContactFormData>
  organizations: Array<{ id: string; name: string }>
  organizationMode: OrganizationMode
  setOrganizationMode: (mode: OrganizationMode) => void
  newOrgData: {
    name: string
    type: 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor'
    phone: string
    email: string
    website: string
    notes: string
  }
  updateNewOrgField: (field: keyof NewOrganizationData, value: string) => void
  loading: boolean
}

export const OrganizationModeSelector: React.FC<OrganizationModeSelectorProps> = ({
  form,
  organizations,
  organizationMode,
  setOrganizationMode,
  newOrgData,
  updateNewOrgField,
  loading
}) => {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2 font-medium">
        <Building2 className="size-4" />
        Organization *
      </div>
      
      <RadioGroup 
        value={organizationMode} 
        onValueChange={(value: OrganizationMode) => setOrganizationMode(value)}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="existing" id="existing" />
          <label htmlFor="existing" className="text-sm">Select existing</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="new" id="new" />
          <label htmlFor="new" className="text-sm">Add new</label>
        </div>
      </RadioGroup>

      {organizationMode === 'existing' ? (
        <FormField control={form.control} name="organization_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Select Organization *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Choose organization" /></SelectTrigger></FormControl>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Organization Name *</label>
            <Input 
              value={newOrgData.name}
              onChange={(e) => updateNewOrgField('name', e.target.value)}
              className="mt-1 h-11"
              placeholder="Enter organization name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Organization Type *</label>
            <Select 
              value={newOrgData.type}
              onValueChange={(value: 'customer' | 'prospect' | 'vendor' | 'distributor' | 'principal') => 
                updateNewOrgField('type', value)
              }
            >
              <SelectTrigger className="mt-1 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ProgressiveDetails buttonText="Add Organization Details">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  value={newOrgData.phone}
                  onChange={(e) => updateNewOrgField('phone', e.target.value)}
                  className="mt-1 h-9"
                  placeholder="Organization phone"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input 
                  value={newOrgData.email}
                  onChange={(e) => updateNewOrgField('email', e.target.value)}
                  className="mt-1 h-9"
                  type="email"
                  placeholder="Organization email"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input 
                  value={newOrgData.website}
                  onChange={(e) => updateNewOrgField('website', e.target.value)}
                  className="mt-1 h-9"
                  placeholder="https://..."
                  disabled={loading}
                />
              </div>
            </div>
          </ProgressiveDetails>
        </div>
      )}
    </div>
  )
}
