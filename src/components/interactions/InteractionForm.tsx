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
import { useOpportunities } from '@/hooks/useOpportunities'

interface InteractionFormProps {
  onSubmit: (data: InteractionFormData) => void
  initialData?: Partial<InteractionFormData>
  loading?: boolean
  submitLabel?: string
}

const INTERACTION_TYPES = ['call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'trade_show', 'site_visit', 'contract_review']

export function InteractionForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Interaction'
}: InteractionFormProps) {
  const { data: opportunities = [] } = useOpportunities()
  
  const form = useForm<InteractionFormData>({
    resolver: yupResolver(interactionSchema) as any,
    defaultValues: {
      subject: initialData?.subject || '',
      type: initialData?.type || 'call',
      interaction_date: initialData?.interaction_date || new Date().toISOString().split('T')[0],
      opportunity_id: initialData?.opportunity_id || '',
      location: initialData?.location || null,
      notes: initialData?.notes || null,
      follow_up_required: initialData?.follow_up_required || false,
      follow_up_date: initialData?.follow_up_date || null
    }
  })

  const filteredOpportunities = opportunities

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader><CardTitle>{initialData ? 'Edit Interaction' : 'New Interaction'}</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            
            <FormField control={form.control as any} name="subject" render={({ field }) => (
              <FormItem>
                <FormLabel>Subject *</FormLabel>
                <FormControl><Input {...field} className="h-11" disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control as any} name="type" render={({ field }) => (
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

            <FormField control={form.control as any} name="interaction_date" render={({ field }) => (
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
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
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