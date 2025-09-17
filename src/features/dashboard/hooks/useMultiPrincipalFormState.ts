/**
 * Multi-Principal Form State Hook
 * Simple stub to fix missing import in SimpleMultiPrincipalForm.tsx
 */

import { useState } from 'react'

export interface MultiPrincipalFormState {
  selectedPrincipals: string[]
  formData: Record<string, any>
  isValid: boolean
}

export function useMultiPrincipalFormState() {
  const [state, setState] = useState<MultiPrincipalFormState>({
    selectedPrincipals: [],
    formData: {},
    isValid: false,
  })

  const updatePrincipals = (principals: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedPrincipals: principals,
      isValid: principals.length > 0,
    }))
  }

  const updateFormData = (data: Record<string, any>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...data },
    }))
  }

  const resetForm = () => {
    setState({
      selectedPrincipals: [],
      formData: {},
      isValid: false,
    })
  }

  return {
    ...state,
    updatePrincipals,
    updateFormData,
    resetForm,
  }
}
