import { useState } from 'react'

// Placeholder hook to fix build - will be properly implemented later
export function usePrincipalSelection() {
  const [selectedPrincipals, setSelectedPrincipals] = useState<string[]>([])

  return {
    selectedPrincipals,
    setSelectedPrincipals,
    clearSelection: () => setSelectedPrincipals([]),
  }
}
