import { ProgressiveDetails } from '@/components/forms'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { interactionSchema, type InteractionFormData, type InteractionType } from '@/types/interaction.types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { INTERACTION_TYPES } from '@/constants/interaction.constants'

interface InteractionFormProps {
  onSubmit: (data: InteractionFormData) => void
  initialData?: Partial<InteractionFormData>
  loading?: boolean
  submitLabel?: string
  defaultOpportunityId?: string
  [key: string]: any // Migration safety
}

export function InteractionForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Interaction',
  defaultOpportunityId
}: InteractionFormProps) {
  const { data: opportunities = [] } = useOpportunities()
  
  const form = useForm<InteractionFormData>({
    resolver: yupResolver(interactionSchema),
    defaultValues: {
      subject: initialData?.subject || '',
      type: initialData?.type || 'call',
      interaction_date: initialData?.interaction_date || new Date().toISOString().split('T')[0],
      opportunity_id: initialData?.opportunity_id || defaultOpportunityId || '',
      location: initialData?.location || null,
      notes: initialData?.notes || null,
      follow_up_required: initialData?.follow_up_required || false,
      follow_up_date: initialData?.follow_up_date || null
    }
  })

  const filteredOpportunities = opportunities

  return (
    <Card className="mx-auto w-full max-w-md">
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
                      <SelectItem key={type} value={type as InteractionType}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </SelectItem>
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


            <ProgressiveDetails buttonText="Add Details">
              <div className="space-y-4">
                <FormField control={form.control} name="opportunity_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opportunity *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!defaultOpportunityId}>
                      <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select opportunity" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {filteredOpportunities.map((opp) => (
                          <SelectItem key={opp.id} value={opp.id}>{opp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {defaultOpportunityId && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Linked to current opportunity
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} value={field.value || ''} className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} value={field.value || ''} rows={3} disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
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