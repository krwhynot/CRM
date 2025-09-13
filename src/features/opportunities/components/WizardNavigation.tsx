import React from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
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
  loading = false,
}) => {
  return (
    <div className={semanticSpacing.stackContainer}>
      {/* Progress Bar */}
      <div className={semanticSpacing.stack.xs}>
        <div className={`flex justify-between ${semanticTypography.body} text-muted-foreground`}>
          <span>
            Step {currentStep} of {steps.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <div className={`flex ${semanticSpacing.gap.lg}`}>
          {steps.map((step) => {
            const status = getStepStatus(step.id)
            const StepIcon = step.icon

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.id)}
                className={cn(
                  'flex items-center rounded-lg font-medium transition-colors',
                  `${semanticSpacing.gap.xs} ${semanticSpacing.horizontalPadding.xs} ${semanticSpacing.verticalPadding.xs} ${semanticTypography.body}`,
                  status === 'completed' && 'bg-green-50 text-green-700 hover:bg-green-100',
                  status === 'current' && 'bg-primary/10 text-primary hover:bg-primary/20',
                  status === 'upcoming' &&
                    'bg-muted text-muted-foreground hover:bg-muted/80 cursor-not-allowed'
                )}
                disabled={status === 'upcoming'}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full',
                    status === 'completed' && 'bg-green-600 text-white',
                    status === 'current' && 'bg-primary text-primary-foreground',
                    status === 'upcoming' && 'bg-muted-foreground/30 text-muted-foreground'
                  )}
                >
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
      <div
        className={`flex items-center justify-between border-t border-border ${semanticSpacing.topPadding.lg}`}
      >
        <div className={`flex ${semanticSpacing.gap.xs}`}>
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          {!isFirstStep && (
            <Button type="button" variant="outline" onClick={onPrevious} disabled={loading}>
              <ChevronLeft className={`${semanticSpacing.rightGap.xs} size-4`} />
              Previous
            </Button>
          )}
        </div>

        <div className={cn(semanticSpacing.inline.xs, 'flex')}>
          {isLastStep ? (
            <Button
              type="submit"
              onClick={onSubmit}
              disabled={loading}
              className="bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
            >
              {loading ? 'Creating...' : 'Create Opportunity'}
            </Button>
          ) : (
            <Button type="button" onClick={onNext} disabled={loading}>
              Next
              <ChevronRight className={cn(semanticSpacing.leftGap.xs, 'size-4')} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
