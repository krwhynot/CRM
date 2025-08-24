import { renderHook, act } from '@testing-library/react'
import { useContactsDisplay } from '@/hooks/useContactsDisplay'

describe('useContactsDisplay', () => {
  const contactIds = ['1', '2', '3']

  it('should initialize with no expanded rows', () => {
    const { result } = renderHook(() => useContactsDisplay(contactIds))
    
    expect(result.current.expandedRows.size).toBe(0)
    expect(result.current.isRowExpanded('1')).toBe(false)
    expect(result.current.isRowExpanded('2')).toBe(false)
  })

  it('should toggle row expansion', () => {
    const { result } = renderHook(() => useContactsDisplay(contactIds))
    
    // Expand row
    act(() => {
      result.current.toggleRowExpansion('1')
    })
    
    expect(result.current.isRowExpanded('1')).toBe(true)
    expect(result.current.expandedRows.has('1')).toBe(true)
    
    // Collapse row
    act(() => {
      result.current.toggleRowExpansion('1')
    })
    
    expect(result.current.isRowExpanded('1')).toBe(false)
    expect(result.current.expandedRows.has('1')).toBe(false)
  })

  it('should expand multiple rows', () => {
    const { result } = renderHook(() => useContactsDisplay(contactIds))
    
    act(() => {
      result.current.toggleRowExpansion('1')
      result.current.toggleRowExpansion('2')
    })
    
    expect(result.current.expandedRows.size).toBe(2)
    expect(result.current.isRowExpanded('1')).toBe(true)
    expect(result.current.isRowExpanded('2')).toBe(true)
  })

  it('should expand all rows', () => {
    const { result } = renderHook(() => useContactsDisplay(contactIds))
    
    act(() => {
      result.current.expandAll()
    })
    
    expect(result.current.expandedRows.size).toBe(3)
    contactIds.forEach(id => {
      expect(result.current.isRowExpanded(id)).toBe(true)
    })
  })

  it('should collapse all rows', () => {
    const { result } = renderHook(() => useContactsDisplay(contactIds))
    
    // First expand some rows
    act(() => {
      result.current.toggleRowExpansion('1')
      result.current.toggleRowExpansion('2')
    })
    
    expect(result.current.expandedRows.size).toBe(2)
    
    // Then collapse all
    act(() => {
      result.current.collapseAll()
    })
    
    expect(result.current.expandedRows.size).toBe(0)
    contactIds.forEach(id => {
      expect(result.current.isRowExpanded(id)).toBe(false)
    })
  })

  it('should handle empty contact ids array', () => {
    const { result } = renderHook(() => useContactsDisplay([]))
    
    act(() => {
      result.current.expandAll()
    })
    
    expect(result.current.expandedRows.size).toBe(0)
  })

  it('should handle toggling non-existent contact id', () => {
    const { result } = renderHook(() => useContactsDisplay(contactIds))
    
    act(() => {
      result.current.toggleRowExpansion('nonexistent')
    })
    
    expect(result.current.isRowExpanded('nonexistent')).toBe(true)
    expect(result.current.expandedRows.has('nonexistent')).toBe(true)
  })
})