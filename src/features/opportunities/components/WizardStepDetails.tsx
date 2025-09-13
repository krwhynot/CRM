import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
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
    <div className={semanticSpacing.layoutContainer}>
      <div className={`grid grid-cols-2 ${semanticSpacing.gap.lg}`}>
        <div>
          <label htmlFor="stage" className={cn(semanticTypography.label, semanticTypography.body)}>
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
          {errors.stage && (
            <p className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-red-600`}>
              {errors.stage.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="probability"
            className={cn(semanticTypography.label, semanticTypography.body)}
          >
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
            <p className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-red-600`}>
              {errors.probability.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className={cn(semanticTypography.label, semanticTypography.body)}
        >
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
          <p className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-red-600`}>
            {errors.description.message}
          </p>
        )}
      </div>
    </div>
  )
}
