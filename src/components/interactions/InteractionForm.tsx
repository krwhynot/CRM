import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { interactionSchema, type InteractionFormData } from '@/types/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Constants } from '@/types/database.types'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { useOpportunities } from '@/hooks/useOpportunities'
import type { Interaction } from '@/types/entities'

interface InteractionFormProps {
  onSubmit: (data: InteractionFormData) => void
  initialData?: Partial<Interaction>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
  preselectedContact?: string
  preselectedOpportunity?: string
}

export function InteractionForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Interaction',
  preselectedOrganization,
  preselectedContact,
  preselectedOpportunity
}: InteractionFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()
  const { data: opportunities = [] } = useOpportunities()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(interactionSchema),
    defaultValues: {
      subject: initialData?.subject || '',
      type: initialData?.type || 'email',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      contact_id: preselectedContact || initialData?.contact_id || '',
      opportunity_id: preselectedOpportunity || initialData?.opportunity_id || '',
      interaction_date: initialData?.interaction_date || new Date().toISOString().split('T')[0],
      duration_minutes: initialData?.duration_minutes || null,
      description: initialData?.description || '',
      outcome: initialData?.outcome || '',
      follow_up_required: initialData?.follow_up_required || false,
      follow_up_date: initialData?.follow_up_date || '',
      follow_up_notes: initialData?.follow_up_notes || '',
      attachments: initialData?.attachments || []
    }
  })

  const selectedOrganization = watch('organization_id')
  const selectedContact = watch('contact_id')
  const selectedOpportunity = watch('opportunity_id')
  const selectedType = watch('type')
  const followUpRequired = watch('follow_up_required')

  // Filter contacts by selected organization
  const filteredContacts = selectedOrganization 
    ? contacts.filter(contact => contact.organization_id === selectedOrganization)
    : contacts

  // Filter opportunities by selected organization
  const filteredOpportunities = selectedOrganization 
    ? opportunities.filter(opportunity => opportunity.organization_id === selectedOrganization)
    : opportunities

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Interaction' : 'New Interaction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject *
              </label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder="Meeting subject or interaction topic"
                disabled={loading}
              />
              {errors.subject && (
                <p className="text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="interaction_date" className="text-sm font-medium">
                Date *
              </label>
              <Input
                id="interaction_date"
                type="date"
                {...register('interaction_date')}
                disabled={loading}
              />
              {errors.interaction_date && (
                <p className="text-sm text-red-600">{errors.interaction_date.message}</p>
              )}
            </div>
          </div>

          {/* Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Type *
              </label>
              <Select 
                value={selectedType} 
                onValueChange={(value) => setValue('type', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.interaction_type.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
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
                  value={selectedOrganization || undefined} 
                  onValueChange={(value) => {
                    setValue('organization_id', value || undefined)
                    // Clear contact and opportunity selections when organization changes
                    if (value !== selectedOrganization) {
                      setValue('contact_id', '')
                      setValue('opportunity_id', '')
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
                  Contact
                </label>
                <Select 
                  value={selectedContact || 'none'} 
                  onValueChange={(value) => setValue('contact_id', value === 'none' ? undefined : value || undefined)}
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
                  <p className="text-sm text-red-600">{errors.contact_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="opportunity_id" className="text-sm font-medium">
                  Opportunity
                </label>
                <Select 
                  value={selectedOpportunity || 'none'} 
                  onValueChange={(value) => setValue('opportunity_id', value === 'none' ? undefined : value || undefined)}
                  disabled={loading || !selectedOrganization || !!preselectedOpportunity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No opportunity</SelectItem>
                    {filteredOpportunities.map((opportunity) => (
                      <SelectItem key={opportunity.id} value={opportunity.id}>
                        {opportunity.name} ({opportunity.stage})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.opportunity_id && (
                  <p className="text-sm text-red-600">{errors.opportunity_id.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="duration_minutes" className="text-sm font-medium">
                  Duration (Minutes)
                </label>
                <Input
                  id="duration_minutes"
                  type="number"
                  {...register('duration_minutes', { valueAsNumber: true })}
                  placeholder="30"
                  disabled={loading}
                />
                {errors.duration_minutes && (
                  <p className="text-sm text-red-600">{errors.duration_minutes.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description and Outcome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe what was discussed or communicated"
                disabled={loading}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="outcome" className="text-sm font-medium">
                Outcome
              </label>
              <Textarea
                id="outcome"
                {...register('outcome')}
                placeholder="What was the result or outcome?"
                disabled={loading}
                rows={4}
              />
              {errors.outcome && (
                <p className="text-sm text-red-600">{errors.outcome.message}</p>
              )}
            </div>
          </div>

          {/* Follow-up */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Follow-up</h3>
            <div className="flex items-center space-x-2">
              <input
                id="follow_up_required"
                type="checkbox"
                {...register('follow_up_required')}
                disabled={loading}
                className="rounded border-gray-300"
              />
              <label
                htmlFor="follow_up_required"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Follow-up required
              </label>
            </div>

            {followUpRequired && (
              <div className="space-y-2">
                <label htmlFor="follow_up_date" className="text-sm font-medium">
                  Follow-up Date
                </label>
                <Input
                  id="follow_up_date"
                  type="date"
                  {...register('follow_up_date')}
                  disabled={loading}
                />
                {errors.follow_up_date && (
                  <p className="text-sm text-red-600">{errors.follow_up_date.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label htmlFor="attachments" className="text-sm font-medium">
              Attachments
            </label>
            <Textarea
              id="attachments"
              {...register('attachments')}
              placeholder="List any attachments or documents discussed"
              disabled={loading}
              rows={2}
            />
            {errors.attachments && (
              <p className="text-sm text-red-600">{errors.attachments.message}</p>
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