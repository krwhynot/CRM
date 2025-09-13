/**
 * CRMFormBuilder - Legacy Form Builder Component
 *
 * This component is currently unused and has been stubbed out
 * to prevent TypeScript compilation errors during refactoring.
 *
 * Can be restored from git history if needed in the future.
 */

import React from 'react'
import { semanticSpacing } from '@/styles/tokens'

// Placeholder interface to maintain exports
export interface FormStep {
  id: string
  title: string
  description: string
  fields: string[]
  optional?: boolean
}

export interface CRMFormBuilderProps {
  // Placeholder props
}

export const CRMFormBuilder: React.FC<CRMFormBuilderProps> = () => {
  return (
    <div className={`${semanticSpacing.formContainer} text-center text-muted-foreground`}>
      CRMFormBuilder component is currently disabled during architecture refactoring.
    </div>
  )
}

export default CRMFormBuilder
