import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Upload, Map, Eye, Download, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Wizard step definitions
export type WizardStep = 'upload' | 'map' | 'preview' | 'import' | 'complete'

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
}

const STEP_ORDER: WizardStep[] = ['upload', 'map', 'preview', 'import', 'complete']

const STEP_CONFIGS: Record<WizardStep, Omit<WizardStepConfig, 'completed' | 'current'>> = {
  upload: {
    id: 'upload',
    title: 'Upload File',
    description: 'Select CSV file to import',
    icon: Upload
  },
  map: {
    id: 'map', 
    title: 'Map Fields',
    description: 'AI-powered field mapping',
    icon: Map
  },
  preview: {
    id: 'preview',
    title: 'Preview Data',
    description: 'Review before importing',
    icon: Eye
  },
  import: {
    id: 'import',
    title: 'Import',
    description: 'Processing your data',
    icon: Download
  },
  complete: {
    id: 'complete',
    title: 'Complete',
    description: 'Import finished',
    icon: CheckCircle
  }
}

export function SmartImportWizard({
  currentStep,
  completedSteps,
  title = "Smart Import Wizard",
  subtitle = "Import your data with AI-powered field mapping and validation",
  children,
  onStepClick,
  className
}: SmartImportWizardProps) {
  
  // Calculate progress percentage
  const currentStepIndex = STEP_ORDER.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100

  // Build step configurations with completion status
  const steps: WizardStepConfig[] = STEP_ORDER.map(stepId => {
    const config = STEP_CONFIGS[stepId]
    return {
      ...config,
      completed: completedSteps.includes(stepId),
      current: stepId === currentStep
    }
  })

  const handleStepClick = (step: WizardStepConfig) => {
    // Only allow clicking on completed steps or the current step
    if (step.completed || step.current) {
      onStepClick?.(step.id)
    }
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-4 space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">
          {subtitle}
        </p>
      </div>

      {/* Progress Bar - iPad optimized */}
      <div className="space-y-3">
        <div className="flex justify-between px-1 text-xs text-slate-500">
          <span>Step {currentStepIndex + 1} of {STEP_ORDER.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators - iPad touch-friendly */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {steps.map((step, _index) => {
              const Icon = step.icon
              const isClickable = step.completed || step.current
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step)}
                  disabled={!isClickable}
                  className={cn(
                    "flex flex-col items-center space-y-2 p-3 rounded-lg transition-all",
                    "min-h-[80px] touch-manipulation", // iPad touch optimization
                    isClickable && "hover:bg-white hover:shadow-sm active:scale-95",
                    step.current && "bg-primary/10 border border-primary/20",
                    step.completed && "bg-green-50 border border-green-200",
                    !isClickable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Step Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    step.completed && "bg-green-500 text-white",
                    step.current && "bg-primary text-primary-foreground",
                    !step.completed && !step.current && "bg-slate-300 text-slate-600"
                  )}>
                    {step.completed ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>

                  {/* Step Title */}
                  <div className="text-center">
                    <div className={cn(
                      "text-xs font-medium leading-tight",
                      step.current && "text-primary",
                      step.completed && "text-green-700",
                      !step.completed && !step.current && "text-slate-600"
                    )}>
                      {step.title}
                    </div>
                    
                    {/* Status Badge - Only show for current/completed */}
                    {step.current && (
                      <Badge variant="secondary" className="mt-1 bg-primary/10 text-xs text-primary">
                        Current
                      </Badge>
                    )}
                    {step.completed && !step.current && (
                      <Badge variant="secondary" className="mt-1 bg-green-100 text-xs text-green-700">
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
      <Card className="min-h-[500px]">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            {/* Current Step Icon */}
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {React.createElement(STEP_CONFIGS[currentStep].icon, { className: "w-5 h-5" })}
            </div>
            
            <div>
              <CardTitle className="text-lg">
                {STEP_CONFIGS[currentStep].title}
              </CardTitle>
              <CardDescription>
                {STEP_CONFIGS[currentStep].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Dynamic step content */}
          {children}
        </CardContent>
      </Card>

      {/* Footer - Mobile/iPad optimized */}
      <div className="flex justify-center">
        <div className="max-w-md text-center text-xs text-slate-500">
          <p>AI-powered import with smart field mapping and data validation.</p>
          <p className="mt-1">Need help? Check our import guide or contact support.</p>
        </div>
      </div>
    </div>
  )
}

// Export step utilities for use in parent components
export { STEP_ORDER, STEP_CONFIGS }

export function getNextStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep)
  return currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : null
}

export function getPreviousStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep)  
  return currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : null
}