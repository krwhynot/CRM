import { useState } from 'react'

interface UseOrganizationsDisplayReturn {
  expandedRows: Set<string>
  toggleRowExpansion: (organizationId: string) => void
  isRowExpanded: (organizationId: string) => boolean
  expandAll: () => void
  collapseAll: () => void
}

export const useOrganizationsDisplay = (
  organizationIds: string[] = []
): UseOrganizationsDisplayReturn => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRowExpansion = (organizationId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(organizationId)) {
      newExpanded.delete(organizationId)
    } else {
      newExpanded.add(organizationId)
    }
    setExpandedRows(newExpanded)
  }

  const isRowExpanded = (organizationId: string) => {
    return expandedRows.has(organizationId)
  }

  const expandAll = () => {
    setExpandedRows(new Set(organizationIds))
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