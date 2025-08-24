import { useMemo } from 'react'
import type { InteractionWithRelations } from '@/types/entities'

export const useInteractionsFiltering = (
  interactions: InteractionWithRelations[],
  searchTerm: string
) => {
  const filteredInteractions = useMemo(() => {
    if (!searchTerm.trim()) return interactions

    const lowerSearchTerm = searchTerm.toLowerCase()
    
    return interactions.filter(interaction =>
      interaction.subject.toLowerCase().includes(lowerSearchTerm) ||
      interaction.description?.toLowerCase().includes(lowerSearchTerm) ||
      interaction.organization?.name.toLowerCase().includes(lowerSearchTerm) ||
      interaction.contact?.first_name.toLowerCase().includes(lowerSearchTerm) ||
      interaction.contact?.last_name.toLowerCase().includes(lowerSearchTerm)
    )
  }, [interactions, searchTerm])

  return { filteredInteractions }
}