import { useState } from 'react'

// Placeholder hook to fix build - will be properly implemented later
export function useMultiPrincipalFormState() {
  const [isLoading, setIsLoading] = useState(false)

  return {
    isLoading,
    setIsLoading,
  }
}
