import React from 'react'
import { ProgressiveDetails } from '@/components/forms'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { interactionSchema, type InteractionFormData } from '@/types/interaction.types'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { useOpportunities } from '@/hooks/useOpportunities'

interface InteractionFormProps {
  onSubmit: (data: InteractionFormData) => void
  initialData?: Partial<InteractionFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
  preselectedContact?: string
}

const INTERACTION_TYPES = ['Call', 'Email', 'Meeting', 'Demo', 'Other']
const OUTCOMES = ['Positive', 'Neutral', 'Negative', 'Follow-up Required']

export function InteractionForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Interaction',
  preselectedOrganization,
  preselectedContact
}: InteractionFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()
  const { data: opportunities = [] } = useOpportunities()
  
  const form = useForm<InteractionFormData>({
    resolver: yupResolver(interactionSchema),
    defaultValues: {
      subject: initialData?.subject || '',
      type: initialData?.type || 'Call',
      interaction_date: initialData?.interaction_date || new Date().toISOString().split('T')[0],
      outcome: initialData?.outcome || 'Positive',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      contact_id: preselectedContact || initialData?.contact_id || '',
      opportunity_id: initialData?.opportunity_id || '',
      description: initialData?.description || '',
      notes: initialData?.notes || ''
    }
  })

  const watchedOrganization = form.watch('organization_id')
  const filteredContacts = contacts.filter(contact => contact.organization_id === watchedOrganization)
  const filteredOpportunities = opportunities.filter(opp => opp.organization_id === watchedOrganization)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader><CardTitle>{initialData ? 'Edit Interaction' : 'New Interaction'}</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField control={form.control} name="subject" render={({ field }) => (
              <FormItem>
                <FormLabel>Subject *</FormLabel>
                <FormControl><Input {...field} className="h-11" disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {INTERACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="interaction_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl><Input {...field} type="date" className="h-11" disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="outcome" render={({ field }) => (
              <FormItem>
                <FormLabel>Outcome *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {OUTCOMES.map((outcome) => (
                      <SelectItem key={outcome} value={outcome}>{outcome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <ProgressiveDetails buttonText="Add Details">
              <div className="space-y-4">
                <FormField control={form.control} name="organization_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select organization" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contact_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select contact" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {filteredContacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="opportunity_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opportunity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select opportunity" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {filteredOpportunities.map((opp) => (
                          <SelectItem key={opp.id} value={opp.id}>{opp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} rows={3} disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </ProgressiveDetails>

            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? 'Saving...' : submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}