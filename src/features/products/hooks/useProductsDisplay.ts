import { useState } from 'react'

interface UseProductsDisplayReturn {
  expandedRows: Set<string>
  toggleRowExpansion: (productId: string) => void
  isRowExpanded: (productId: string) => boolean
  expandAll: () => void
  collapseAll: () => void
}

export const useProductsDisplay = (
  productIds: string[] = []
): UseProductsDisplayReturn => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRowExpansion = (productId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedRows(newExpanded)
  }

  const isRowExpanded = (productId: string) => {
    return expandedRows.has(productId)
  }

  const expandAll = () => {
    setExpandedRows(new Set(productIds))
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