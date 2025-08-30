import { ProgressiveDetails, FormField } from '@/components/forms'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useForm, Controller } from 'react-hook-form'
import { opportunitySchema, type OpportunityFormData } from '@/types/opportunity.types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { DB_STAGES, DEFAULT_OPPORTUNITY_STAGE } from '@/lib/opportunity-stage-mapping'
import type { OpportunityStage as OpportunityStageDB } from '@/types/entities'

interface OpportunityFormProps {
  onSubmit: (data: OpportunityFormData) => void | Promise<void>
  initialData?: Partial<OpportunityFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

// Opportunity stages for select dropdown
const STAGES: Array<{ value: OpportunityStageDB; display: string }> = DB_STAGES.map(stage => ({
  value: stage,
  display: stage
}))

// Opportunity statuses for select dropdown
const STATUSES: Array<{ value: string; display: string }> = [
  { value: 'Active', display: 'Active' },
  { value: 'On Hold', display: 'On Hold' },
  { value: 'Nurturing', display: 'Nurturing' },
  { value: 'Qualified', display: 'Qualified' },
  { value: 'Closed - Won', display: 'Closed - Won' },
  { value: 'Closed - Lost', display: 'Closed - Lost' }
]

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
      stage: initialData?.stage || DEFAULT_OPPORTUNITY_STAGE,
      status: initialData?.status || 'Active',
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
    <Card className="mx-auto w-full max-w-md">
      <CardHeader><CardTitle>{initialData ? 'Edit Opportunity' : 'Add Opportunity'}</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormField label="Name" required error={fieldState.error?.message}>
                  <Input {...field} className="h-11" disabled={loading} />
                </FormField>
              )}
            />

            <Controller
              control={form.control}
              name="organization_id"
              render={({ field, fieldState }) => (
                <FormField label="Organization" required error={fieldState.error?.message}>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              control={form.control}
              name="estimated_value"
              render={({ field, fieldState }) => (
                <FormField label="Value" required error={fieldState.error?.message}>
                  <Input {...field} type="number" min="0" step="0.01" className="h-11" disabled={loading} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormField>
              )}
            />

            <Controller
              control={form.control}
              name="stage"
              render={({ field, fieldState }) => (
                <FormField label="Stage" required error={fieldState.error?.message}>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>{stage.display}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <FormField label="Status" required error={fieldState.error?.message}>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.display}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <ProgressiveDetails buttonText="Add Details">
              <div className="space-y-4">
                <Controller
                  control={form.control}
                  name="contact_id"
                  render={({ field, fieldState }) => (
                    <FormField label="Contact" error={fieldState.error?.message}>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select contact" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                />
                <Controller
                  control={form.control}
                  name="estimated_close_date"
                  render={({ field, fieldState }) => (
                    <FormField label="Est. Close Date" error={fieldState.error?.message}>
                      <Input {...field} value={field.value || ''} type="date" className="h-11" disabled={loading} />
                    </FormField>
                  )}
                />
                <Controller
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormField label="Description" error={fieldState.error?.message}>
                      <Textarea {...field} value={field.value || ''} rows={3} disabled={loading} />
                    </FormField>
                  )}
                />
                <Controller
                  control={form.control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <FormField label="Notes" error={fieldState.error?.message}>
                      <Textarea {...field} value={field.value || ''} rows={3} disabled={loading} />
                    </FormField>
                  )}
                />
              </div>
            </ProgressiveDetails>

            <Button type="submit" disabled={loading} className="h-11 w-full">
              {loading ? 'Saving...' : submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
