import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form'
import type { OpportunityFormData } from '@/types/opportunity.types'

interface WizardStepDetailsProps {
  register: UseFormRegister<OpportunityFormData>
  setValue: UseFormSetValue<OpportunityFormData>
  stageValue: string
  errors: FieldErrors<OpportunityFormData>
  loading?: boolean
}

const OPPORTUNITY_STAGES = [
  'New Lead',
  'Initial Outreach',
  'Sample/Visit Offered',
  'Awaiting Response',
  'Feedback Logged',
  'Demo Scheduled',
  'Closed - Won',
  'Closed - Lost',
] as const

export const WizardStepDetails: React.FC<WizardStepDetailsProps> = ({
  register,
  setValue,
  stageValue,
  errors,
  loading = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="stage" className="text-sm font-medium">
            Stage *
          </label>
          <Select
            value={stageValue}
            onValueChange={(value: string) => {
              setValue('stage', value as OpportunityFormData['stage'])
            }}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {OPPORTUNITY_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.stage && <p className="mt-1 text-sm text-red-600">{errors.stage.message}</p>}
        </div>

        <div>
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
            <p className="mt-1 text-sm text-red-600">{errors.probability.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Brief description of the opportunity"
          disabled={loading}
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>
    </div>
  )
}
