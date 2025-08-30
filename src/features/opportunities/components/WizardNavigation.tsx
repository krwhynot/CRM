import React from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WizardStep, StepStatus } from '../hooks/useOpportunityWizard'

interface WizardNavigationProps {
  steps: readonly WizardStep[]
  currentStep: number
  progress: number
  getStepStatus: (step: number) => StepStatus
  onStepClick: (step: number) => void
  onPrevious: () => void
  onNext: () => void
  onCancel: () => void
  onSubmit: () => void
  isFirstStep: boolean
  isLastStep: boolean
  loading?: boolean
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  steps,
  currentStep,
  progress,
  getStepStatus,
  onStepClick,
  onPrevious,
  onNext,
  onCancel,
  onSubmit,
  isFirstStep,
  isLastStep,
  loading = false
}) => {
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          {steps.map((step) => {
            const status = getStepStatus(step.id)
            const StepIcon = step.icon
            
            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.id)}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  status === 'completed' && 'bg-green-100 text-green-800 hover:bg-green-200',
                  status === 'current' && 'bg-blue-100 text-blue-800 hover:bg-blue-200',
                  status === 'upcoming' && 'bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-not-allowed'
                )}
                disabled={status === 'upcoming'}
              >
                <div className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full',
                  status === 'completed' && 'bg-green-600 text-white',
                  status === 'current' && 'bg-blue-600 text-white',
                  status === 'upcoming' && 'bg-gray-300 text-gray-500'
                )}>
                  {status === 'completed' ? (
                    <Check className="size-4" />
                  ) : (
                    <StepIcon className="size-4" />
                  )}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={loading}
            >
              <ChevronLeft className="mr-2 size-4" />
              Previous
            </Button>
          )}
        </div>
        
        <div className="flex space-x-2">
          {isLastStep ? (
            <Button
              type="submit"
              onClick={onSubmit}
              disabled={loading}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {loading ? 'Creating...' : 'Create Opportunity'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              disabled={loading}
            >
              Next
              <ChevronRight className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}