import { renderHook, act } from '@testing-library/react'
import { useOrganizationsDisplay } from '../useOrganizationsDisplay'

describe('useOrganizationsDisplay', () => {
  const mockOrganizationIds = ['org-1', 'org-2', 'org-3']

  it('should initialize with no expanded rows', () => {
    const { result } = renderHook(() => useOrganizationsDisplay(mockOrganizationIds))

    expect(result.current.expandedRows.size).toBe(0)
    expect(result.current.isRowExpanded('org-1')).toBe(false)
    expect(result.current.isRowExpanded('org-2')).toBe(false)
  })

  it('should toggle row expansion correctly', () => {
    const { result } = renderHook(() => useOrganizationsDisplay(mockOrganizationIds))

    // Expand a row
    act(() => {
      result.current.toggleRowExpansion('org-1')
    })

    expect(result.current.isRowExpanded('org-1')).toBe(true)
    expect(result.current.isRowExpanded('org-2')).toBe(false)
    expect(result.current.expandedRows.has('org-1')).toBe(true)

    // Collapse the same row
    act(() => {
      result.current.toggleRowExpansion('org-1')
    })

    expect(result.current.isRowExpanded('org-1')).toBe(false)
    expect(result.current.expandedRows.has('org-1')).toBe(false)
  })

  it('should handle multiple expanded rows', () => {
    const { result } = renderHook(() => useOrganizationsDisplay(mockOrganizationIds))

    // Expand multiple rows
    act(() => {
      result.current.toggleRowExpansion('org-1')
      result.current.toggleRowExpansion('org-3')
    })

    expect(result.current.isRowExpanded('org-1')).toBe(true)
    expect(result.current.isRowExpanded('org-2')).toBe(false)
    expect(result.current.isRowExpanded('org-3')).toBe(true)
    expect(result.current.expandedRows.size).toBe(2)
  })

  it('should expand all rows', () => {
    const { result } = renderHook(() => useOrganizationsDisplay(mockOrganizationIds))

    act(() => {
      result.current.expandAll()
    })

    expect(result.current.expandedRows.size).toBe(3)
    expect(result.current.isRowExpanded('org-1')).toBe(true)
    expect(result.current.isRowExpanded('org-2')).toBe(true)
    expect(result.current.isRowExpanded('org-3')).toBe(true)
  })

  it('should collapse all rows', () => {
    const { result } = renderHook(() => useOrganizationsDisplay(mockOrganizationIds))

    // First expand some rows
    act(() => {
      result.current.toggleRowExpansion('org-1')
      result.current.toggleRowExpansion('org-2')
    })

    expect(result.current.expandedRows.size).toBe(2)

    // Then collapse all
    act(() => {
      result.current.collapseAll()
    })

    expect(result.current.expandedRows.size).toBe(0)
    expect(result.current.isRowExpanded('org-1')).toBe(false)
    expect(result.current.isRowExpanded('org-2')).toBe(false)
  })

  it('should work with empty organization list', () => {
    const { result } = renderHook(() => useOrganizationsDisplay([]))

    expect(result.current.expandedRows.size).toBe(0)

    act(() => {
      result.current.expandAll()
    })

    expect(result.current.expandedRows.size).toBe(0)
  })

  it('should handle non-existent organization IDs gracefully', () => {
    const { result } = renderHook(() => useOrganizationsDisplay(mockOrganizationIds))

    act(() => {
      result.current.toggleRowExpansion('non-existent-id')
    })

    expect(result.current.isRowExpanded('non-existent-id')).toBe(true)
    expect(result.current.expandedRows.has('non-existent-id')).toBe(true)
  })
})
