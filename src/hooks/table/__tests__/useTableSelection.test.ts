import { renderHook, act } from '@testing-library/react'
import { useTableSelection } from '../useTableSelection'

interface TestItem {
  id: string
  name: string
}

describe('useTableSelection', () => {
  const mockItems: TestItem[] = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ]

  const getItemId = (item: TestItem) => item.id
  const defaultOptions = { getItemId }

  it('should initialize with no selected items', () => {
    const { result } = renderHook(() => useTableSelection(defaultOptions))

    expect(result.current.selectedItems.size).toBe(0)
    expect(result.current.getSelectedCount()).toBe(0)
    expect(result.current.getSelectedIds()).toEqual([])
    expect(result.current.isAllSelected(mockItems)).toBe(false)
    expect(result.current.isIndeterminate(mockItems)).toBe(false)
  })

  it('should initialize with provided selected items', () => {
    const initialSelected = new Set(['1', '2'])
    const { result } = renderHook(() => useTableSelection({ getItemId, initialSelected }))

    expect(result.current.selectedItems.size).toBe(2)
    expect(result.current.getSelectedCount()).toBe(2)
    expect(result.current.getSelectedIds()).toEqual(['1', '2'])
  })

  it('should handle individual item selection', () => {
    const { result } = renderHook(() => useTableSelection(defaultOptions))

    // Select an item
    act(() => {
      result.current.handleSelectItem('1', true)
    })

    expect(result.current.selectedItems.has('1')).toBe(true)
    expect(result.current.getSelectedCount()).toBe(1)
    expect(result.current.getSelectedIds()).toEqual(['1'])

    // Deselect the item
    act(() => {
      result.current.handleSelectItem('1', false)
    })

    expect(result.current.selectedItems.has('1')).toBe(false)
    expect(result.current.getSelectedCount()).toBe(0)
  })

  it('should handle select all functionality', () => {
    const { result } = renderHook(() => useTableSelection(defaultOptions))

    // Select all
    act(() => {
      result.current.handleSelectAll(true, mockItems)
    })

    expect(result.current.selectedItems.size).toBe(3)
    expect(result.current.isAllSelected(mockItems)).toBe(true)
    expect(result.current.isIndeterminate(mockItems)).toBe(false)
    expect(result.current.getSelectedIds()).toEqual(['1', '2', '3'])

    // Deselect all
    act(() => {
      result.current.handleSelectAll(false, mockItems)
    })

    expect(result.current.selectedItems.size).toBe(0)
    expect(result.current.isAllSelected(mockItems)).toBe(false)
  })

  it('should detect indeterminate state correctly', () => {
    const { result } = renderHook(() => useTableSelection(defaultOptions))

    // Select some items (not all)
    act(() => {
      result.current.handleSelectItem('1', true)
      result.current.handleSelectItem('2', true)
    })

    expect(result.current.isAllSelected(mockItems)).toBe(false)
    expect(result.current.isIndeterminate(mockItems)).toBe(true)
  })

  it('should clear all selections', () => {
    const { result } = renderHook(() => useTableSelection(defaultOptions))

    // Select multiple items
    act(() => {
      result.current.handleSelectAll(true, mockItems)
    })

    expect(result.current.selectedItems.size).toBe(3)

    // Clear selection
    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.selectedItems.size).toBe(0)
    expect(result.current.getSelectedCount()).toBe(0)
  })

  it('should handle empty item lists correctly', () => {
    const { result } = renderHook(() => useTableSelection(defaultOptions))

    expect(result.current.isAllSelected([])).toBe(false)
    expect(result.current.isIndeterminate([])).toBe(false)

    act(() => {
      result.current.handleSelectAll(true, [])
    })

    expect(result.current.selectedItems.size).toBe(0)
  })

  it('should maintain selection state across different item lists', () => {
    const { result } = renderHook(() => useTableSelection(defaultOptions))

    // Select items from first list
    act(() => {
      result.current.handleSelectItem('1', true)
      result.current.handleSelectItem('2', true)
    })

    const newItems = [
      { id: '1', name: 'New Item 1' },
      { id: '4', name: 'Item 4' },
    ]

    // Check selection state with different list
    expect(result.current.isAllSelected(newItems)).toBe(false)
    expect(result.current.isIndeterminate(newItems)).toBe(true) // Only item '1' is selected
  })
})
