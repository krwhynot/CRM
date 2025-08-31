import type React from 'react'
import { Upload, Map, Eye, Download, CheckCircle } from 'lucide-react'

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

// Wizard step configuration and utilities
export const STEP_ORDER: WizardStep[] = ['upload', 'map', 'preview', 'import', 'complete']

export const STEP_CONFIGS: Record<WizardStep, Omit<WizardStepConfig, 'completed' | 'current'>> = {
  upload: {
    id: 'upload',
    title: 'Upload File',
    description: 'Select CSV file to import',
    icon: Upload,
  },
  map: {
    id: 'map',
    title: 'Map Fields',
    description: 'AI-powered field mapping',
    icon: Map,
  },
  preview: {
    id: 'preview',
    title: 'Preview Data',
    description: 'Review before importing',
    icon: Eye,
  },
  import: {
    id: 'import',
    title: 'Import',
    description: 'Processing your data',
    icon: Download,
  },
  complete: {
    id: 'complete',
    title: 'Complete',
    description: 'Import finished',
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
