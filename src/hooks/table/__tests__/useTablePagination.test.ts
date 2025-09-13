import { renderHook, act } from '@testing-library/react'
import { useTablePaginationWithData } from '../useTablePagination'

describe('useTablePagination', () => {
  const mockData = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))

  it('should initialize with default pagination settings', () => {
    const { result } = renderHook(() => useTablePaginationWithData(mockData))

    expect(result.current.pagination.currentPage).toBe(0) // 0-indexed
    expect(result.current.pagination.pageSize).toBe(25) // Default page size
    expect(result.current.pagination.totalItems).toBe(100)
    expect(result.current.paginationInfo.totalPages).toBe(4) // 100 items / 25 per page
    expect(result.current.paginationInfo.startIndex).toBe(0)
    expect(result.current.paginationInfo.endIndex).toBe(24)
    expect(result.current.paginatedData).toHaveLength(25)
  })

  it('should initialize with custom page size', () => {
    const { result } = renderHook(() =>
      useTablePaginationWithData(mockData, { initialPageSize: 10 })
    )

    expect(result.current.pagination.pageSize).toBe(10)
    expect(result.current.paginationInfo.totalPages).toBe(10) // 100 items / 10 per page
    expect(result.current.paginatedData).toHaveLength(10)
  })

  it('should navigate to next page', () => {
    const { result } = renderHook(() => useTablePaginationWithData(mockData))

    act(() => {
      result.current.nextPage()
    })

    expect(result.current.pagination.currentPage).toBe(1) // 0-indexed, so second page is 1
    expect(result.current.paginationInfo.startIndex).toBe(25)
    expect(result.current.paginationInfo.endIndex).toBe(49)
    expect(result.current.paginatedData[0]).toEqual({ id: 26, name: 'Item 26' })
  })

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => useTablePaginationWithData(mockData))

    // First go to page 2
    act(() => {
      result.current.nextPage()
    })

    // Then go back
    act(() => {
      result.current.previousPage()
    })

    expect(result.current.pagination.currentPage).toBe(0)
    expect(result.current.paginationInfo.startIndex).toBe(0)
    expect(result.current.paginationInfo.endIndex).toBe(24)
  })

  it('should go to specific page', () => {
    const { result } = renderHook(() => useTablePaginationWithData(mockData))

    act(() => {
      result.current.goToPage(2) // Go to third page (0-indexed)
    })

    expect(result.current.pagination.currentPage).toBe(2)
    expect(result.current.paginationInfo.startIndex).toBe(50)
    expect(result.current.paginationInfo.endIndex).toBe(74)
    expect(result.current.paginatedData[0]).toEqual({ id: 51, name: 'Item 51' })
  })

  it('should go to first and last page', () => {
    const { result } = renderHook(() => useTablePaginationWithData(mockData))

    // Go to last page
    act(() => {
      result.current.lastPage()
    })

    expect(result.current.pagination.currentPage).toBe(3) // 0-indexed, so last page is 3
    expect(result.current.paginationInfo.startIndex).toBe(75)
    expect(result.current.paginationInfo.endIndex).toBe(99)

    // Go back to first page
    act(() => {
      result.current.firstPage()
    })

    expect(result.current.pagination.currentPage).toBe(0)
    expect(result.current.paginationInfo.startIndex).toBe(0)
    expect(result.current.paginationInfo.endIndex).toBe(24)
  })

  it('should change page size', () => {
    const { result } = renderHook(() => useTablePaginationWithData(mockData))

    act(() => {
      result.current.setPageSize(50)
    })

    expect(result.current.pagination.pageSize).toBe(50)
    expect(result.current.paginationInfo.totalPages).toBe(2) // 100 items / 50 per page
    expect(result.current.paginatedData).toHaveLength(50)
    expect(result.current.pagination.currentPage).toBe(0) // Should reset to first page
  })

  it('should handle empty data', () => {
    const { result } = renderHook(() => useTablePaginationWithData([]))

    expect(result.current.pagination.totalItems).toBe(0)
    expect(result.current.paginationInfo.totalPages).toBe(0)
    expect(result.current.paginatedData).toHaveLength(0)
    expect(result.current.paginationInfo.hasPrevious).toBe(false)
    expect(result.current.paginationInfo.hasNext).toBe(false)
  })

  it('should handle data with fewer items than page size', () => {
    const smallData = mockData.slice(0, 10)
    const { result } = renderHook(() => useTablePaginationWithData(smallData))

    expect(result.current.pagination.totalItems).toBe(10)
    expect(result.current.paginationInfo.totalPages).toBe(1)
    expect(result.current.paginatedData).toHaveLength(10)
    expect(result.current.paginationInfo.hasNext).toBe(false)
    expect(result.current.paginationInfo.hasPrevious).toBe(false)
  })

  it('should reset to first page', () => {
    const { result } = renderHook(() => useTablePaginationWithData(mockData))

    // Go to page 3
    act(() => {
      result.current.goToPage(2)
    })

    expect(result.current.pagination.currentPage).toBe(2)

    // Reset to first page
    act(() => {
      result.current.resetToFirstPage()
    })

    expect(result.current.pagination.currentPage).toBe(0)
    expect(result.current.paginationInfo.startIndex).toBe(0)
  })

  it('should provide navigation state correctly', () => {
    const { result } = renderHook(() => useTablePaginationWithData(mockData))

    // On first page
    expect(result.current.paginationInfo.hasPrevious).toBe(false)
    expect(result.current.paginationInfo.hasNext).toBe(true)

    // Go to middle page
    act(() => {
      result.current.goToPage(1)
    })

    expect(result.current.paginationInfo.hasPrevious).toBe(true)
    expect(result.current.paginationInfo.hasNext).toBe(true)

    // Go to last page
    act(() => {
      result.current.lastPage()
    })

    expect(result.current.paginationInfo.hasPrevious).toBe(true)
    expect(result.current.paginationInfo.hasNext).toBe(false)
  })

  it('should calculate visible pages for pagination UI', () => {
    const { result } = renderHook(() =>
      useTablePaginationWithData(mockData, {
        maxVisiblePages: 5,
      })
    )

    // On first page, should show pages 0-4
    expect(result.current.paginationInfo.visiblePages).toEqual([0, 1, 2, 3])

    // Go to last page
    act(() => {
      result.current.lastPage()
    })

    // On last page, should still show all pages since we only have 4 total
    expect(result.current.paginationInfo.visiblePages).toEqual([0, 1, 2, 3])
  })
})
