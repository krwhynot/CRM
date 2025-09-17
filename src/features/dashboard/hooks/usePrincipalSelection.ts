/**
 * Principal Selection Hook
 * Simple stub to fix missing import in SimpleMultiPrincipalForm.tsx
 */

import { useState, useCallback } from 'react'

export interface PrincipalSelectionState {
  selectedPrincipals: string[]
  isSelecting: boolean
  selectionMode: 'single' | 'multiple'
}

export function usePrincipalSelection(mode: 'single' | 'multiple' = 'multiple') {
  const [state, setState] = useState<PrincipalSelectionState>({
    selectedPrincipals: [],
    isSelecting: false,
    selectionMode: mode,
  })

  const selectPrincipal = useCallback((principalId: string) => {
    setState((prev) => {
      if (prev.selectionMode === 'single') {
        return {
          ...prev,
          selectedPrincipals: [principalId],
        }
      } else {
        const isSelected = prev.selectedPrincipals.includes(principalId)
        return {
          ...prev,
          selectedPrincipals: isSelected
            ? prev.selectedPrincipals.filter((id) => id !== principalId)
            : [...prev.selectedPrincipals, principalId],
        }
      }
    })
  }, [])

  const deselectPrincipal = useCallback((principalId: string) => {
    setState((prev) => ({
      ...prev,
      selectedPrincipals: prev.selectedPrincipals.filter((id) => id !== principalId),
    }))
  }, [])

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedPrincipals: [],
    }))
  }, [])

  const setSelecting = useCallback((isSelecting: boolean) => {
    setState((prev) => ({
      ...prev,
      isSelecting,
    }))
  }, [])

  return {
    ...state,
    selectPrincipal,
    deselectPrincipal,
    clearSelection,
    setSelecting,
    hasSelection: state.selectedPrincipals.length > 0,
  }
}
