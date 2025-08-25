import { useState, useMemo, useCallback } from 'react'
import type { InteractionWithRelations } from '@/types/entities'
import { safeGetString } from '@/lib/secure-storage'

interface UseInteractionsTableStateReturn {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredInteractions: InteractionWithRelations[]
  useNewStyle: boolean
  selectedIds: Set<string>
  selectedCount: number
  selectedInteractions: InteractionWithRelations[]
  toggleSelection: (id: string) => void
  toggleAllSelection: () => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
  isAllSelected: boolean
  isSomeSelected: boolean
}

export const useInteractionsTableState = (
  interactions: InteractionWithRelations[]
): UseInteractionsTableStateReturn => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  // Feature flag for new MFB compact styling (default: enabled, opt-out with 'false')
  const useNewStyle = safeGetString('useNewStyle', 'true') !== 'false'

  const filteredInteractions = useMemo(() => {
    if (!searchTerm) return interactions
    
    return interactions.filter(interaction =>
      interaction.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interaction.organization?.name && interaction.organization.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (interaction.contact && `${interaction.contact.first_name} ${interaction.contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [interactions, searchTerm])

  // Selection management
  const selectedCount = selectedIds.size
  
  const selectedInteractions = useMemo(() => {
    return filteredInteractions.filter(interaction => selectedIds.has(interaction.id))
  }, [filteredInteractions, selectedIds])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const toggleAllSelection = useCallback(() => {
    if (selectedIds.size === filteredInteractions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredInteractions.map(interaction => interaction.id)))
    }
  }, [filteredInteractions, selectedIds.size])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])

  const isAllSelected = filteredInteractions.length > 0 && selectedIds.size === filteredInteractions.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredInteractions.length

  return {
    searchTerm,
    setSearchTerm,
    filteredInteractions,
    useNewStyle,
    selectedIds,
    selectedCount,
    selectedInteractions,
    toggleSelection,
    toggleAllSelection,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected
  }
}