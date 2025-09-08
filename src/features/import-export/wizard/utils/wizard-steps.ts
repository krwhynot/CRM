import type React from 'react'
import { Upload, Map, Eye, Download, CheckCircle } from 'lucide-react'

// Simplified 3-step wizard
export type WizardStep = 'upload' | 'review' | 'import' | 'complete'

interface WizardStepConfig {
  id: WizardStep
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  current: boolean
}

// Streamlined wizard step configuration - merged mapping and preview into "review"
export const STEP_ORDER: WizardStep[] = ['upload', 'review', 'import', 'complete']

export const STEP_CONFIGS: Record<WizardStep, Omit<WizardStepConfig, 'completed' | 'current'>> = {
  upload: {
    id: 'upload',
    title: 'Upload',
    description: 'Choose your file',
    icon: Upload,
  },
  review: {
    id: 'review',
    title: 'Review',
    description: 'Preview & confirm data',
    icon: Eye,
  },
  import: {
    id: 'import',
    title: 'Import',
    description: 'Adding to CRM',
    icon: Download,
  },
  complete: {
    id: 'complete',
    title: 'Done',
    description: 'Import completed',
    icon: CheckCircle,
  },
}

export function getNextStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep)
  return currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : null
}

export function getPreviousStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep)
  return currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : null
}
