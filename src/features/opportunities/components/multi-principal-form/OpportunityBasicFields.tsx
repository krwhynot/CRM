import React from 'react'
import { Building2 } from 'lucide-react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { OPPORTUNITY_CONTEXTS, OPPORTUNITY_STAGES } from '@/constants/opportunity.constants'
import type { UseFormReturn } from 'react-hook-form'
import type { OpportunityFormData } from '@/types/opportunity.types'
import type { Organization, Contact } from '@/types/entities'
import { semanticSpacing } from '@/styles/tokens'

interface OpportunityBasicFieldsProps {
  form: UseFormReturn<OpportunityFormData>
  organizations: Organization[]
  filteredContacts: Contact[]
}

export const OpportunityBasicFields: React.FC<OpportunityBasicFieldsProps> = ({
  form,
  organizations,
  filteredContacts,
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="organization_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={`flex items-center ${semanticSpacing.gap.xs}`}>
              <Building2 className="size-4" />
              Customer Organization *
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger data-testid="customer-organization-select">
                  <SelectValue placeholder="Select customer organization" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    <div className="flex w-full items-center justify-between">
                      <span>{org.name}</span>
                      {org.type && (
                        <StatusIndicator variant="outline" size="sm">
                          {org.type}
                        </StatusIndicator>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contact_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Contact</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary contact" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="opportunity_context"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opportunity Context *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger data-testid="opportunity-context-select">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {OPPORTUNITY_CONTEXTS.map((context) => (
                  <SelectItem key={context} value={context}>
                    {context}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stage</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {OPPORTUNITY_STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ''}
                rows={3}
                placeholder="Additional notes about this opportunity..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
