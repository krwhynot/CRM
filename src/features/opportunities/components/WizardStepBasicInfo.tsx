import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  loading = false
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Opportunity Name *
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter opportunity name"
          disabled={loading}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
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
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>
    </div>
  )
}