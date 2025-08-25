import { useState, useCallback } from 'react'

/**
 * Hook for managing opportunity row expansion state
 * Follows the same pattern as useProductsDisplay
 */
export const useOpportunitiesDisplay = (opportunityIds: string[]) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRowExpansion = useCallback((opportunityId: string) => {
    setExpandedRows(prev => {
      const newExpandedRows = new Set(prev)
      if (newExpandedRows.has(opportunityId)) {
        newExpandedRows.delete(opportunityId)
      } else {
        newExpandedRows.add(opportunityId)
      }
      return newExpandedRows
    })
  }, [])

  const isRowExpanded = useCallback((opportunityId: string) => {
    return expandedRows.has(opportunityId)
  }, [expandedRows])

  const collapseAllRows = useCallback(() => {
    setExpandedRows(new Set())
  }, [])

  const expandAllRows = useCallback(() => {
    setExpandedRows(new Set(opportunityIds))
  }, [opportunityIds])

  return {
    toggleRowExpansion,
    isRowExpanded,
    collapseAllRows,
    expandAllRows,
    expandedRowsCount: expandedRows.size,
    hasExpandedRows: expandedRows.size > 0
  }
}