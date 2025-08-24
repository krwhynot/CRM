import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form'
import type { OpportunityFormData, OpportunityContext } from '@/types/opportunity.types'

interface WizardStepTimelineProps {
  register: UseFormRegister<OpportunityFormData>
  setValue: UseFormSetValue<OpportunityFormData>
  opportunityContextValue: OpportunityContext | null
  errors: FieldErrors<OpportunityFormData>
  loading?: boolean
}

const OPPORTUNITY_CONTEXTS = [
  'Site Visit',
  'Food Show',
  'New Product Interest', 
  'Follow-up',
  'Demo Request',
  'Sampling',
  'Custom'
] as const

export const WizardStepTimeline: React.FC<WizardStepTimelineProps> = ({
  register,
  setValue,
  opportunityContextValue,
  errors,
  loading = false
}) => {
  return (
    <div className="space-y-4">
      <div>
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
          <p className="text-sm text-red-600 mt-1">{errors.estimated_close_date.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="opportunity_context" className="text-sm font-medium">
          Opportunity Context
        </label>
        <Select 
          value={opportunityContextValue || undefined} 
          onValueChange={(value: OpportunityContext) => setValue('opportunity_context', value)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select context" />
          </SelectTrigger>
          <SelectContent>
            {OPPORTUNITY_CONTEXTS.map((context) => (
              <SelectItem key={context} value={context}>
                {context}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.opportunity_context && (
          <p className="text-sm text-red-600 mt-1">{errors.opportunity_context.message}</p>
        )}
      </div>

      <div>
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
          <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
        )}
      </div>
    </div>
  )
}