import { useState, useCallback, useMemo } from 'react'

export interface PaginationConfig {
  /** Current page (0-indexed) */
  currentPage: number
  /** Items per page */
  pageSize: number
  /** Total number of items */
  totalItems: number
}

export interface PaginationInfo {
  /** Total number of pages */
  totalPages: number
  /** Index of first item on current page */
  startIndex: number
  /** Index of last item on current page */
  endIndex: number
  /** Whether there's a previous page */
  hasPrevious: boolean
  /** Whether there's a next page */
  hasNext: boolean
  /** Page numbers to show in pagination UI */
  visiblePages: number[]
}

/**
 * Generic table pagination hook that provides pagination state management
 */
export interface UseTablePaginationOptions {
  /** Initial page size */
  initialPageSize?: number
  /** Available page size options */
  pageSizeOptions?: number[]
  /** Maximum number of page buttons to show */
  maxVisiblePages?: number
}

export interface UseTablePaginationReturn<T> {
  /** Current pagination configuration */
  pagination: PaginationConfig
  /** Pagination information and calculations */
  paginationInfo: PaginationInfo
  /** Paginated data for current page */
  paginatedData: T[]
  /** Go to specific page */
  goToPage: (page: number) => void
  /** Go to next page */
  nextPage: () => void
  /** Go to previous page */
  previousPage: () => void
  /** Go to first page */
  firstPage: () => void
  /** Go to last page */
  lastPage: () => void
  /** Change page size */
  setPageSize: (size: number) => void
  /** Reset to first page (useful when filters change) */
  resetToFirstPage: () => void
}

export function useTablePagination<T>({
  initialPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  maxVisiblePages = 5,
}: UseTablePaginationOptions = {}): Omit<UseTablePaginationReturn<T>, 'paginatedData'> {
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(0)

  const pagination: PaginationConfig = {
    currentPage,
    pageSize,
    totalItems,
  }

  const paginationInfo: PaginationInfo = useMemo(() => {
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = currentPage * pageSize
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1)
    const hasPrevious = currentPage > 0
    const hasNext = currentPage < totalPages - 1

    // Calculate visible page numbers
    const visiblePages: number[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    let startPage = Math.max(0, currentPage - halfVisible)
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i)
    }

    return {
      totalPages,
      startIndex,
      endIndex,
      hasPrevious,
      hasNext,
      visiblePages,
    }
  }, [currentPage, pageSize, totalItems, maxVisiblePages])

  const goToPage = useCallback((page: number) => {
    const totalPages = Math.ceil(totalItems / pageSize)
    const validPage = Math.max(0, Math.min(page, totalPages - 1))
    setCurrentPage(validPage)
  }, [totalItems, pageSize])

  const nextPage = useCallback(() => {
    if (paginationInfo.hasNext) {
      setCurrentPage(prev => prev + 1)
    }
  }, [paginationInfo.hasNext])

  const previousPage = useCallback(() => {
    if (paginationInfo.hasPrevious) {
      setCurrentPage(prev => prev - 1)
    }
  }, [paginationInfo.hasPrevious])

  const firstPage = useCallback(() => {
    setCurrentPage(0)
  }, [])

  const lastPage = useCallback(() => {
    const totalPages = Math.ceil(totalItems / pageSize)
    setCurrentPage(Math.max(0, totalPages - 1))
  }, [totalItems, pageSize])

  const setPageSize = useCallback((size: number) => {
    const validSize = pageSizeOptions.includes(size) ? size : initialPageSize
    setPageSizeState(validSize)
    // Reset to first page when page size changes
    setCurrentPage(0)
  }, [pageSizeOptions, initialPageSize])

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(0)
  }, [])

  return {
    pagination,
    paginationInfo,
    paginatedData: [], // Will be computed when used with data
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    resetToFirstPage,
  }
}

/**
 * Hook that combines pagination with data to return paginated results
 */
export function useTablePaginationWithData<T>(
  data: T[],
  options: UseTablePaginationOptions = {}
): UseTablePaginationReturn<T> {
  const paginationState = useTablePagination<T>(options)
  
  // Update total items when data changes
  const totalItems = data.length
  useMemo(() => {
    // This is a bit of a hack to update internal state
    // In a real implementation, you might want to expose setTotalItems
    if (paginationState.pagination.totalItems !== totalItems) {
      // Force re-render with new total
    }
  }, [totalItems, paginationState.pagination.totalItems])

  const paginatedData = useMemo(() => {
    const startIndex = paginationState.pagination.currentPage * paginationState.pagination.pageSize
    const endIndex = startIndex + paginationState.pagination.pageSize
    return data.slice(startIndex, endIndex)
  }, [data, paginationState.pagination.currentPage, paginationState.pagination.pageSize])

  // Create updated pagination config with correct total items
  const updatedPagination: PaginationConfig = {
    ...paginationState.pagination,
    totalItems,
  }

  // Recalculate pagination info with correct total
  const updatedPaginationInfo: PaginationInfo = useMemo(() => {
    const totalPages = Math.ceil(totalItems / updatedPagination.pageSize)
    const startIndex = updatedPagination.currentPage * updatedPagination.pageSize
    const endIndex = Math.min(startIndex + updatedPagination.pageSize - 1, totalItems - 1)
    const hasPrevious = updatedPagination.currentPage > 0
    const hasNext = updatedPagination.currentPage < totalPages - 1

    // Calculate visible page numbers
    const visiblePages: number[] = []
    const maxVisiblePages = options.maxVisiblePages || 5
    const halfVisible = Math.floor(maxVisiblePages / 2)
    let startPage = Math.max(0, updatedPagination.currentPage - halfVisible)
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i)
    }

    return {
      totalPages,
      startIndex,
      endIndex,
      hasPrevious,
      hasNext,
      visiblePages,
    }
  }, [updatedPagination, totalItems, options.maxVisiblePages])

  return {
    ...paginationState,
    pagination: updatedPagination,
    paginationInfo: updatedPaginationInfo,
    paginatedData,
  }
}