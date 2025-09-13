import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { semanticSpacing, semanticTypography, fontWeight } from '@/styles/tokens'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { OpportunityFormData } from '@/types/opportunity.types'

interface WizardStepBasicInfoProps {
  register: UseFormRegister<OpportunityFormData>
  errors: FieldErrors<OpportunityFormData>
  loading?: boolean
}

export const WizardStepBasicInfo: React.FC<WizardStepBasicInfoProps> = ({
  register,
  errors,
  loading = false,
}) => {
  return (
    <div className={semanticSpacing.layoutContainer}>
      <div>
        <label htmlFor="name" className={`${semanticTypography.body} ${fontWeight.medium}`}>
          Opportunity Name *
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter opportunity name"
          disabled={loading}
        />
        {errors.name && (
          <p
            className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} ${text - destructive}`}
          >
            {errors.name.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="description" className={`${semanticTypography.body} ${fontWeight.medium}`}>
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
          <p
            className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} ${text - destructive}`}
          >
            {errors.description.message}
          </p>
        )}
      </div>
    </div>
  )
}
