import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WizardStep } from '../utils/wizard-steps'
import { STEP_ORDER, STEP_CONFIGS } from '../utils/wizard-steps'
import {
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  fontWeight,
  semanticColors,
} from '@/styles/tokens'

// Re-export WizardStep for consumers
export type { WizardStep } from '../utils/wizard-steps'

interface WizardStepConfig {
  id: WizardStep
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  current: boolean
}

interface SmartImportWizardProps {
  currentStep: WizardStep
  completedSteps: WizardStep[]
  title?: string
  subtitle?: string
  children: React.ReactNode
  onStepClick?: (step: WizardStep) => void
  className?: string
  rightHeaderContent?: React.ReactNode
}

export function SmartImportWizard({
  currentStep,
  completedSteps,
  title = 'Import Organizations',
  subtitle = "Upload your spreadsheet and we'll handle the rest - just 3 simple steps",
  children,
  onStepClick,
  className,
  rightHeaderContent,
}: SmartImportWizardProps) {
  // Calculate progress percentage
  const currentStepIndex = STEP_ORDER.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100

  // Build step configurations with completion status
  const steps: WizardStepConfig[] = STEP_ORDER.map((stepId) => {
    const config = STEP_CONFIGS[stepId]
    return {
      ...config,
      completed: completedSteps.includes(stepId),
      current: stepId === currentStep,
    }
  })

  const handleStepClick = (step: WizardStepConfig) => {
    // Only allow clicking on completed steps or the current step
    if (step.completed || step.current) {
      onStepClick?.(step.id)
    }
  }

  return (
    <div
      className={cn(
        `w-full max-w-4xl mx-auto ${semanticSpacing.layoutPadding.lg} ${semanticSpacing.stack.xl}`,
        className
      )}
    >
      {/* Header */}
      <div className={`${semanticSpacing.stack.xs} text-center`}>
        <h1
          className={`${semanticTypography.title} ${fontWeight.bold} text-foreground md:text-3xl`}
        >
          {title}
        </h1>
        <p
          className={`mx-auto max-w-2xl ${semanticTypography.body} text-muted-foreground md:text-base`}
        >
          {subtitle}
        </p>
      </div>

      {/* Progress Bar - iPad optimized */}
      <div className={semanticSpacing.stack.lg}>
        <div
          className={`flex justify-between ${semanticSpacing.horizontalPadding.xxs} ${semanticTypography.caption} text-muted-foreground`}
        >
          <span>
            Step {currentStepIndex + 1} of {STEP_ORDER.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators - iPad touch-friendly */}
      <Card className={`border-border/60 ${semanticColors.cardBackground}`}>
        <CardContent className={semanticSpacing.layoutPadding.lg}>
          <div
            className={`grid grid-cols-4 ${semanticSpacing.gap.xs} md:${semanticSpacing.gap.lg}`}
          >
            {steps.map((step) => {
              const Icon = step.icon
              const isClickable = step.completed || step.current

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step)}
                  disabled={!isClickable}
                  className={cn(
                    `flex flex-col items-center ${semanticSpacing.stack.xs} ${semanticSpacing.layoutPadding.lg} ${semanticRadius.lg} transition-all`,
                    'min-h-[80px] touch-manipulation', // iPad touch optimization
                    isClickable && 'hover:bg-white hover:shadow-sm active:scale-95',
                    step.current && 'bg-primary/10 border border-primary/20',
                    step.completed &&
                      `${semanticColors.background.success} border ${semanticColors.border.success}`,
                    !isClickable && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Step Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      step.completed && `${semanticColors.background.successSolid} text-white`,
                      step.current && 'bg-primary text-primary-foreground',
                      !step.completed && !step.current && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>

                  {/* Step Title */}
                  <div className="text-center">
                    <div
                      className={cn(
                        `${semanticTypography.caption} font-medium leading-tight`,
                        step.current && 'text-primary',
                        step.completed && 'text-success',
                        !step.completed && !step.current && 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </div>

                    {/* Status Badge - Only show for current/completed */}
                    {step.current && (
                      <Badge
                        variant="secondary"
                        className={`${semanticSpacing.topGap.xxs} bg-primary/10 ${semanticTypography.caption} text-primary`}
                      >
                        Current
                      </Badge>
                    )}
                    {step.completed && !step.current && (
                      <Badge
                        variant="secondary"
                        className={`${semanticSpacing.topGap.xxs} ${semanticColors.background.success} ${semanticTypography.caption} ${semanticColors.text.success}`}
                      >
                        Done
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <Card className="min-h-96">
        <CardHeader className={semanticSpacing.bottomPadding.lg}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${semanticSpacing.gap.lg}`}>
              {/* Current Step Icon */}
              <div
                className={cn(
                  semanticRadius.full,
                  'flex size-10 items-center justify-center bg-primary text-primary-foreground'
                )}
              >
                {React.createElement(STEP_CONFIGS[currentStep].icon, { className: 'w-5 h-5' })}
              </div>

              <div>
                <CardTitle className={semanticTypography.heading}>
                  {STEP_CONFIGS[currentStep].title}
                </CardTitle>
                <CardDescription>{STEP_CONFIGS[currentStep].description}</CardDescription>
              </div>
            </div>

            {/* Right side content (like Next button) */}
            {rightHeaderContent && <div className="shrink-0">{rightHeaderContent}</div>}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Dynamic step content */}
          {children}
        </CardContent>
      </Card>

      {/* Footer - Mobile/iPad optimized */}
      <div className="flex justify-center">
        <div className={`max-w-md text-center ${semanticTypography.caption} text-muted-foreground`}>
          <p>We automatically detect your data fields and prepare everything for import.</p>
          <p className={semanticSpacing.topGap.xxs}>
            Need help? Contact support or check our user guide.
          </p>
        </div>
      </div>
    </div>
  )
}
