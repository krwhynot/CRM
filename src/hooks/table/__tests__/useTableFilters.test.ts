import { renderHook, act } from '@testing-library/react'
import { useTableFilters, useTableFiltersWithData } from '../useTableFilters'
import { vi } from 'vitest'

interface TestItem {
  id: string
  name: string
  status: 'active' | 'inactive'
  category?: string
}

interface TestFilters extends Record<string, unknown> {
  search: string
  status: string // Changed from union to string to satisfy Record<string, unknown>
  category: string
}

describe('useTableFilters', () => {
  const defaultFilters: TestFilters = {
    search: '',
    status: 'active',
    category: '',
  }

  // Type the filter function to match the expected signature
  const filterFunction = (items: TestItem[], filters: Record<string, unknown>): TestItem[] => {
    const typedFilters = filters as TestFilters
    return items.filter((item) => {
      if (
        typedFilters.search &&
        !item.name.toLowerCase().includes(typedFilters.search.toLowerCase())
      ) {
        return false
      }
      if (typedFilters.status && item.status !== typedFilters.status) {
        return false
      }
      if (typedFilters.category && item.category !== typedFilters.category) {
        return false
      }
      return true
    })
  }

  it('should initialize with default filters', () => {
    const { result } = renderHook(() =>
      useTableFilters({
        initialFilters: defaultFilters,
        filterFunction,
      })
    )

    expect(result.current.filters).toEqual(defaultFilters)
    expect(result.current.hasActiveFilters()).toBe(false) // No filters differ from initial
  })

  it('should update filters correctly', () => {
    const { result } = renderHook(() =>
      useTableFilters({
        initialFilters: defaultFilters,
        filterFunction,
      })
    )

    act(() => {
      result.current.setFilter('search', 'test query')
    })

    expect(result.current.filters.search).toBe('test query')
    expect(result.current.hasActiveFilters()).toBe(true) // search differs from initial
  })

  it('should update multiple filters at once', () => {
    const { result } = renderHook(() =>
      useTableFilters({
        initialFilters: defaultFilters,
        filterFunction,
      })
    )

    const newFilters: Partial<TestFilters> = {
      search: 'test',
      category: 'electronics',
    }

    act(() => {
      result.current.updateFilters(newFilters)
    })

    expect(result.current.filters.search).toBe('test')
    expect(result.current.filters.category).toBe('electronics')
    expect(result.current.filters.status).toBe('active') // preserved
    expect(result.current.hasActiveFilters()).toBe(true)
  })

  it('should reset specific filter to initial value', () => {
    const initialFilters: TestFilters = {
      search: '',
      status: 'active',
      category: '',
    }

    const { result } = renderHook(() =>
      useTableFilters({
        initialFilters,
        filterFunction,
      })
    )

    // First set some values
    act(() => {
      result.current.updateFilters({
        search: 'test',
        category: 'electronics',
      })
    })

    // Then reset search to initial value
    act(() => {
      result.current.setFilter('search', '')
    })

    expect(result.current.filters.search).toBe('')
    expect(result.current.filters.category).toBe('electronics')
    expect(result.current.hasActiveFilters()).toBe(true) // category still differs
  })

  it('should reset all filters to initial values', () => {
    const { result } = renderHook(() =>
      useTableFilters({
        initialFilters: defaultFilters,
        filterFunction,
      })
    )

    // Modify filters
    act(() => {
      result.current.updateFilters({
        search: 'test',
        category: 'electronics',
      })
    })

    // Reset to initial
    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.filters).toEqual(defaultFilters)
    expect(result.current.hasActiveFilters()).toBe(false)
  })

  it('should call onFiltersChange callback when filters change', () => {
    const onFiltersChange = vi.fn()

    const { result } = renderHook(() =>
      useTableFilters({
        initialFilters: defaultFilters,
        filterFunction,
        onFiltersChange,
      })
    )

    act(() => {
      result.current.updateFilters({
        search: 'test',
        status: 'inactive',
      })
    })

    expect(onFiltersChange).toHaveBeenCalledWith({
      search: 'test',
      status: 'inactive',
      category: '',
    })
  })

  it('should detect active filters correctly', () => {
    const initialFilters: TestFilters = {
      search: '',
      status: '',
      category: '',
    }

    const { result } = renderHook(() =>
      useTableFilters({
        initialFilters,
        filterFunction,
      })
    )

    expect(result.current.hasActiveFilters()).toBe(false)

    act(() => {
      result.current.updateFilters({
        status: 'active',
        category: 'electronics',
      })
    })

    expect(result.current.hasActiveFilters()).toBe(true)
  })

  it('should handle filter function with data', () => {
    const testData: TestItem[] = [
      { id: '1', name: 'Item 1', status: 'active', category: 'electronics' },
      { id: '2', name: 'Item 2', status: 'inactive', category: 'books' },
      { id: '3', name: 'Item 3', status: 'active', category: 'electronics' },
    ]

    const { result } = renderHook(() =>
      useTableFiltersWithData(testData, {
        initialFilters: defaultFilters,
        filterFunction,
      })
    )

    expect(result.current.filteredData).toHaveLength(2) // Only active items

    act(() => {
      result.current.updateFilters({ category: 'electronics' })
    })

    expect(result.current.filteredData).toHaveLength(2) // Active electronics
  })

  it('should update filtered data when filters change', () => {
    const testData: TestItem[] = [
      { id: '1', name: 'Apple', status: 'active' },
      { id: '2', name: 'Banana', status: 'active' },
      { id: '3', name: 'Cherry', status: 'inactive' },
    ]

    const { result } = renderHook(() =>
      useTableFiltersWithData(testData, {
        initialFilters: { ...defaultFilters, search: '' },
        filterFunction,
      })
    )

    expect(result.current.filteredData).toHaveLength(2) // Active items only

    act(() => {
      result.current.setFilter('search', 'app')
    })

    expect(result.current.filteredData).toHaveLength(1)
    expect(result.current.filteredData[0].name).toBe('Apple')
  })

  it('should preserve filter function reference', () => {
    const testData: TestItem[] = [{ id: '1', name: 'Test', status: 'active' }]

    const stableFilterFunction = vi.fn(filterFunction)

    const { result } = renderHook(() =>
      useTableFiltersWithData(testData, {
        initialFilters: defaultFilters,
        filterFunction: stableFilterFunction,
      })
    )

    // Access filtered data to trigger filter function
    const initialFiltered = result.current.filteredData
    expect(initialFiltered).toHaveLength(1)

    // Update filters
    act(() => {
      result.current.setFilter('search', 'test')
    })

    // Verify filter function was called
    expect(stableFilterFunction).toHaveBeenCalled()
  })
})
