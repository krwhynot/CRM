import { useState, useMemo } from 'react'
import type { InteractionWithRelations } from '@/types/entities'

interface UseInteractionsTableStateReturn {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredInteractions: InteractionWithRelations[]
  useNewStyle: boolean
}

export const useInteractionsTableState = (
  interactions: InteractionWithRelations[]
): UseInteractionsTableStateReturn => {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Feature flag for new MFB compact styling (default: enabled, opt-out with 'false')
  const useNewStyle = localStorage.getItem('useNewStyle') !== 'false'

  const filteredInteractions = useMemo(() => {
    if (!searchTerm) return interactions
    
    return interactions.filter(interaction =>
      interaction.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interaction.organization?.name && interaction.organization.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (interaction.contact && `${interaction.contact.first_name} ${interaction.contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [interactions, searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    filteredInteractions,
    useNewStyle
  }
}