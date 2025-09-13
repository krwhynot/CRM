import React from 'react'
import { Input } from '@/components/ui/input'
import { semanticSpacing, semanticTypography, fontWeight } from '@/styles/tokens'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { OpportunityFormData } from '@/types/opportunity.types'

interface WizardStepFinancialProps {
  register: UseFormRegister<OpportunityFormData>
  errors: FieldErrors<OpportunityFormData>
  loading?: boolean
}

export const WizardStepFinancial: React.FC<WizardStepFinancialProps> = ({
  register,
  errors,
  loading = false,
}) => {
  return (
    <div className={semanticSpacing.layoutContainer}>
      <div className={`grid grid-cols-2 ${semanticSpacing.gap.lg}`}>
        <div>
          <label
            htmlFor="estimated_value"
            className={`${semanticTypography.body} ${fontWeight.medium}`}
          >
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
            <p
              className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-destructive`}
            >
              {errors.estimated_value.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="probability"
            className={`${semanticTypography.body} ${fontWeight.medium}`}
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
            <p
              className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-destructive`}
            >
              {errors.probability.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="deal_owner" className={`${semanticTypography.body} ${fontWeight.medium}`}>
          Deal Owner
        </label>
        <Input
          id="deal_owner"
          {...register('deal_owner')}
          placeholder="Who owns this opportunity?"
          disabled={loading}
        />
        {errors.deal_owner && (
          <p className={`${semanticSpacing.topGap.xs} ${semanticTypography.body} text-destructive`}>
            {errors.deal_owner.message}
          </p>
        )}
      </div>
    </div>
  )
}
