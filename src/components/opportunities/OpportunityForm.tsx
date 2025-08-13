import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { opportunitySchema, type OpportunityFormData } from '@/types/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Constants } from '@/types/database.types'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import type { Opportunity } from '@/types/entities'

interface OpportunityFormProps {
  onSubmit: (data: OpportunityFormData) => void
  initialData?: Partial<Opportunity>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
  preselectedContact?: string
}

export function OpportunityForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Opportunity',
  preselectedOrganization,
  preselectedContact
}: OpportunityFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(opportunitySchema),
    defaultValues: {
      name: initialData?.name || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      contact_id: preselectedContact || initialData?.contact_id || '',
      stage: initialData?.stage || 'lead',
      priority: initialData?.priority || 'medium',
      estimated_value: initialData?.estimated_value || null,
      probability: initialData?.probability || null,
      estimated_close_date: initialData?.estimated_close_date || '',
      description: initialData?.description || '',
      decision_criteria: initialData?.decision_criteria || '',
      competition: initialData?.competition || '',
      next_action: initialData?.next_action || '',
      notes: initialData?.notes || ''
    }
  })

  const selectedOrganization = watch('organization_id')
  const selectedContact = watch('contact_id')
  const selectedStage = watch('stage')
  const selectedPriority = watch('priority')

  // Filter contacts by selected organization
  const filteredContacts = selectedOrganization 
    ? contacts.filter(contact => contact.organization_id === selectedOrganization)
    : contacts

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Opportunity' : 'New Opportunity'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Opportunity Name *
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="New sales opportunity"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="stage" className="text-sm font-medium">
                Stage *
              </label>
              <Select 
                value={selectedStage} 
                onValueChange={(value) => setValue('stage', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.opportunity_stage.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stage && (
                <p className="text-sm text-red-600">{errors.stage.message}</p>
              )}
            </div>
          </div>

          {/* Relationships */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Relationships</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="organization_id" className="text-sm font-medium">
                  Organization *
                </label>
                <Select 
                  value={selectedOrganization} 
                  onValueChange={(value) => {
                    setValue('organization_id', value)
                    // Clear contact selection when organization changes
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
                  <p className="text-sm text-red-600">{errors.organization_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="contact_id" className="text-sm font-medium">
                  Primary Contact
                </label>
                <Select 
                  value={selectedContact} 
                  onValueChange={(value) => setValue('contact_id', value)}
                  disabled={loading || !selectedOrganization || !!preselectedContact}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No contact</SelectItem>
                    {filteredContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name} ({contact.title || 'No title'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contact_id && (
                  <p className="text-sm text-red-600">{errors.contact_id.message}</p>
                )}
              </div>

            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the opportunity"
              disabled={loading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="estimated_value" className="text-sm font-medium">
                  Opportunity Value ($)
                </label>
                <Input
                  id="estimated_value"
                  type="number"
                  step="0.01"
                  {...register('estimated_value', { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.estimated_value && (
                  <p className="text-sm text-red-600">{errors.estimated_value.message}</p>
                )}
              </div>


              <div className="space-y-2">
                <label htmlFor="probability" className="text-sm font-medium">
                  Probability (%)
                </label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  {...register('probability', { valueAsNumber: true })}
                  placeholder="50"
                  disabled={loading}
                />
                {errors.probability && (
                  <p className="text-sm text-red-600">{errors.probability.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timeline & Priority</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="estimated_close_date" className="text-sm font-medium">
                  Estimated Close Date
                </label>
                <Input
                  id="estimated_close_date"
                  type="date"
                  {...register('estimated_close_date')}
                  disabled={loading}
                />
                {errors.estimated_close_date && (
                  <p className="text-sm text-red-600">{errors.estimated_close_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority *
                </label>
                <Select 
                  value={selectedPriority || undefined} 
                  onValueChange={(value) => setValue('priority', value as any)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.opportunity_priority.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sales Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sales Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="decision_criteria" className="text-sm font-medium">
                  Decision Criteria
                </label>
                <Textarea
                  id="decision_criteria"
                  {...register('decision_criteria')}
                  placeholder="What criteria will be used to make the decision?"
                  disabled={loading}
                  rows={3}
                />
                {errors.decision_criteria && (
                  <p className="text-sm text-red-600">{errors.decision_criteria.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="competition" className="text-sm font-medium">
                  Competition
                </label>
                <Input
                  id="competition"
                  {...register('competition')}
                  placeholder="Competing companies or products"
                  disabled={loading}
                />
                {errors.competition && (
                  <p className="text-sm text-red-600">{errors.competition.message}</p>
                )}
              </div>
            </div>


            <div className="space-y-2">
              <label htmlFor="next_action" className="text-sm font-medium">
                Next Action
              </label>
              <Textarea
                id="next_action"
                {...register('next_action')}
                placeholder="What is the next action to move this opportunity forward?"
                disabled={loading}
                rows={3}
              />
              {errors.next_action && (
                <p className="text-sm text-red-600">{errors.next_action.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this opportunity"
              disabled={loading}
              rows={4}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}