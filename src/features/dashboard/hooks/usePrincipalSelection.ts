import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { OpportunityFormData } from '@/types/opportunity.types'
import type { Organization } from '@/types/entities'

interface UsePrincipalSelectionReturn {
  selectedPrincipals: string[]
  principalOrganizations: Organization[]
  handleAddPrincipal: (principalId: string) => void
  handleRemovePrincipal: (principalId: string) => void
}

export const usePrincipalSelection = (
  organizations: Organization[],
  form: UseFormReturn<OpportunityFormData>
): UsePrincipalSelectionReturn => {
  const [selectedPrincipals, setSelectedPrincipals] = useState<string[]>([])

  const principalOrganizations = organizations.filter(org => 
    org.type && (org.type.toLowerCase() === 'principal')
  )

  const handleAddPrincipal = (principalId: string) => {
    if (principalId && !selectedPrincipals.includes(principalId)) {
      const newPrincipals = [...selectedPrincipals, principalId]
      setSelectedPrincipals(newPrincipals)
      form.setValue('principals', newPrincipals)
    }
  }

  const handleRemovePrincipal = (principalId: string) => {
    const newPrincipals = selectedPrincipals.filter(id => id !== principalId)
    setSelectedPrincipals(newPrincipals)
    form.setValue('principals', newPrincipals)
  }

  return {
    selectedPrincipals,
    principalOrganizations,
    handleAddPrincipal,
    handleRemovePrincipal
  }
}