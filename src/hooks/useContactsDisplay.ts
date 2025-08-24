import { useState } from 'react'

interface UseContactsDisplayReturn {
  expandedRows: Set<string>
  toggleRowExpansion: (contactId: string) => void
  isRowExpanded: (contactId: string) => boolean
  expandAll: () => void
  collapseAll: () => void
}

export const useContactsDisplay = (
  contactIds: string[] = []
): UseContactsDisplayReturn => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRowExpansion = (contactId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(contactId)) {
      newExpanded.delete(contactId)
    } else {
      newExpanded.add(contactId)
    }
    setExpandedRows(newExpanded)
  }

  const isRowExpanded = (contactId: string) => {
    return expandedRows.has(contactId)
  }

  const expandAll = () => {
    setExpandedRows(new Set(contactIds))
  }

  const collapseAll = () => {
    setExpandedRows(new Set())
  }

  return {
    expandedRows,
    toggleRowExpansion,
    isRowExpanded,
    expandAll,
    collapseAll
  }
}