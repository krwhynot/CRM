import { ProgressiveDetails } from '@/components/forms'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { opportunitySchema, type OpportunityFormData } from '@/types/opportunity.types'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'

interface OpportunityFormProps {
  onSubmit: (data: OpportunityFormData) => void
  initialData?: Partial<OpportunityFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

const STAGES = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost', 'New Lead', 'Initial Outreach', 'Sample/Visit Offered', 'Awaiting Response', 'Feedback Logged', 'Demo Scheduled', 'Closed - Won', 'Closed - Lost']

export function OpportunityForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Opportunity',
  preselectedOrganization
}: OpportunityFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()
  
  const form = useForm<OpportunityFormData>({
    resolver: yupResolver(opportunitySchema),
    defaultValues: {
      name: initialData?.name || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      estimated_value: initialData?.estimated_value || 0,
      stage: initialData?.stage || 'Discovery',
      contact_id: initialData?.contact_id || null,
      estimated_close_date: initialData?.estimated_close_date || null,
      description: initialData?.description || null,
      notes: initialData?.notes || null,
      principals: initialData?.principals || [],
      product_id: initialData?.product_id || null,
      opportunity_context: initialData?.opportunity_context || null,
      auto_generated_name: initialData?.auto_generated_name || false,
      principal_id: initialData?.principal_id || null,
      probability: initialData?.probability || null,
      deal_owner: initialData?.deal_owner || null
    }
  })

  const watchedOrganization = form.watch('organization_id')
  const filteredContacts = contacts.filter(contact => contact.organization_id === watchedOrganization)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader><CardTitle>{initialData ? 'Edit Opportunity' : 'New Opportunity'}</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl><Input {...field} className="h-11" disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="organization_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Organization *</FormLabel>
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

            <FormField control={form.control} name="estimated_value" render={({ field }) => (
              <FormItem>
                <FormLabel>Value *</FormLabel>
                <FormControl><Input {...field} type="number" min="0" step="0.01" className="h-11" disabled={loading} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="stage" render={({ field }) => (
              <FormItem>
                <FormLabel>Stage *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <ProgressiveDetails buttonText="Add Details">
              <div className="space-y-4">
                <FormField control={form.control} name="contact_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
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
                <FormField control={form.control} name="estimated_close_date" render={({ field }) => (
                  <FormItem><FormLabel>Est. Close Date</FormLabel><FormControl><Input {...field} value={field.value || ''} type="date" className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value || ''} rows={3} disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} value={field.value || ''} rows={3} disabled={loading} /></FormControl><FormMessage /></FormItem>
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