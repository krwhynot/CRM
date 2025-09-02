import { useState, useCallback } from 'react'
import type { ComponentType } from 'react'

export interface WizardStep {
  id: number
  title: string
  icon: ComponentType<{ className?: string }>
  description: string
}

export type StepStatus = 'completed' | 'current' | 'upcoming'

export interface UseOpportunityWizardReturn {
  currentStep: number
  setCurrentStep: (step: number) => void
  handleNext: (validateCurrentStep: () => Promise<boolean>) => Promise<void>
  handlePrevious: () => void
  handleStepClick: (
    step: number,
    validateSteps: (fromStep: number, toStep: number) => Promise<boolean>
  ) => Promise<void>
  getStepStatus: (step: number) => StepStatus
  progress: number
  isFirstStep: boolean
  isLastStep: boolean
}

export const useOpportunityWizard = (
  totalSteps: number,
  initialStep: number = 1
): UseOpportunityWizardReturn => {
  const [currentStep, setCurrentStep] = useState(initialStep)

  const handleNext = useCallback(
    async (validateCurrentStep: () => Promise<boolean>) => {
      const isValid = await validateCurrentStep()
      if (isValid && currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    },
    [currentStep, totalSteps]
  )

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleStepClick = useCallback(
    async (step: number, validateSteps: (fromStep: number, toStep: number) => Promise<boolean>) => {
      if (step <= currentStep) {
        setCurrentStep(step)
      } else {
        // Validate all steps up to the target step
        const canProceed = await validateSteps(currentStep, step)
        if (canProceed) {
          setCurrentStep(step)
        }
      }
    },
    [currentStep]
  )

  const getStepStatus = useCallback(
    (step: number): StepStatus => {
      if (step < currentStep) return 'completed'
      if (step === currentStep) return 'current'
      return 'upcoming'
    },
    [currentStep]
  )

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return {
    currentStep,
    setCurrentStep,
    handleNext,
    handlePrevious,
    handleStepClick,
    getStepStatus,
    progress,
    isFirstStep,
    isLastStep,
  }
}
