import { renderHook, act } from '@testing-library/react'
import { useTableSort, useTableSortWithData } from '../useTableSort'

interface TestItem {
  id: string
  name: string
  age: number
  date: string
  active: boolean
}

describe('useTableSort', () => {
  const mockData: TestItem[] = [
    { id: '1', name: 'Alice', age: 30, date: '2024-01-15', active: true },
    { id: '2', name: 'Bob', age: 25, date: '2024-02-10', active: false },
    { id: '3', name: 'Charlie', age: 35, date: '2024-01-05', active: true },
    { id: '4', name: 'Diana', age: 28, date: '2024-03-01', active: false },
  ]

  it('should initialize with no sorting', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    expect(result.current.sortConfig).toEqual([])
    expect(result.current.sortedData).toEqual(mockData)
  })

  it('should sort by string field ascending', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.sortConfig).toHaveLength(1)
    expect(result.current.sortConfig[0]).toEqual({
      field: 'name',
      direction: 'asc',
      sortFn: undefined,
    })
    expect(result.current.sortedData.map((item) => item.name)).toEqual([
      'Alice',
      'Bob',
      'Charlie',
      'Diana',
    ])
  })

  it('should sort by string field descending on second click', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    // First click - ascending
    act(() => {
      result.current.handleSort('name')
    })

    // Second click - descending
    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.sortConfig).toHaveLength(1)
    expect(result.current.sortConfig[0]).toEqual({
      field: 'name',
      direction: 'desc',
      sortFn: undefined,
    })
    expect(result.current.sortedData.map((item) => item.name)).toEqual([
      'Diana',
      'Charlie',
      'Bob',
      'Alice',
    ])
  })

  it('should clear sort on third click', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    // First click - ascending
    act(() => {
      result.current.handleSort('name')
    })

    // Second click - descending
    act(() => {
      result.current.handleSort('name')
    })

    // Third click - clear sort
    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.sortConfig).toEqual([])
    expect(result.current.sortedData).toEqual(mockData)
  })

  it('should sort by number field correctly', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    act(() => {
      result.current.handleSort('age')
    })

    expect(result.current.sortConfig).toHaveLength(1)
    expect(result.current.sortConfig[0].field).toBe('age')
    expect(result.current.sortConfig[0].direction).toBe('asc')
    expect(result.current.sortedData.map((item) => item.age)).toEqual([25, 28, 30, 35])
  })

  it('should sort by date field correctly', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    act(() => {
      result.current.handleSort('date')
    })

    expect(result.current.sortConfig).toHaveLength(1)
    expect(result.current.sortConfig[0].field).toBe('date')
    expect(result.current.sortConfig[0].direction).toBe('asc')
    expect(result.current.sortedData.map((item) => item.date)).toEqual([
      '2024-01-05',
      '2024-01-15',
      '2024-02-10',
      '2024-03-01',
    ])
  })

  it('should sort by boolean field correctly', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    act(() => {
      result.current.handleSort('active')
    })

    expect(result.current.sortConfig).toHaveLength(1)
    expect(result.current.sortConfig[0].field).toBe('active')
    // false values should come first when sorting ascending (false < true)
    expect(result.current.sortedData.map((item) => item.active)).toEqual([false, false, true, true])
  })

  it('should use custom sort function when provided', () => {
    const customSortFn = (a: TestItem, b: TestItem) => {
      // Sort by name length
      return a.name.length - b.name.length
    }

    const { result } = renderHook(() =>
      useTableSortWithData(mockData, {
        customSortFns: { name: customSortFn },
      })
    )

    act(() => {
      result.current.handleSort('name')
    })

    // Bob (3) < Alice (5) < Diana (5) < Charlie (7)
    expect(result.current.sortedData.map((item) => item.name)).toEqual([
      'Bob',
      'Alice',
      'Diana',
      'Charlie',
    ])
  })

  it('should support multi-column sorting when enabled', () => {
    const { result } = renderHook(() =>
      useTableSortWithData(mockData, {
        allowMultiSort: true,
      })
    )

    // Sort by active first
    act(() => {
      result.current.handleSort('active')
    })

    // Then by age
    act(() => {
      result.current.handleSort('age')
    })

    expect(result.current.sortConfig).toHaveLength(2)
    expect(result.current.sortConfig[0].field).toBe('active')
    expect(result.current.sortConfig[1].field).toBe('age')

    // Should be sorted by active first (false < true), then by age
    expect(
      result.current.sortedData.map((item) => ({ active: item.active, age: item.age }))
    ).toEqual([
      { active: false, age: 25 }, // Bob
      { active: false, age: 28 }, // Diana
      { active: true, age: 30 }, // Alice
      { active: true, age: 35 }, // Charlie
    ])
  })

  it('should provide getSortDirection helper', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    expect(result.current.getSortDirection('name')).toBeUndefined()

    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.getSortDirection('name')).toBe('asc')

    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.getSortDirection('name')).toBe('desc')
  })

  it('should provide isSorted helper', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    expect(result.current.isSorted('name')).toBe(false)

    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.isSorted('name')).toBe(true)
    expect(result.current.isSorted('age')).toBe(false)
  })

  it('should clear all sorting', () => {
    const { result } = renderHook(() => useTableSortWithData(mockData))

    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.sortConfig).toHaveLength(1)

    act(() => {
      result.current.clearSort()
    })

    expect(result.current.sortConfig).toEqual([])
    expect(result.current.sortedData).toEqual(mockData)
  })

  it('should handle nested property sorting with dot notation', () => {
    const nestedData = [
      { id: '1', user: { name: 'Alice', age: 30 } },
      { id: '2', user: { name: 'Bob', age: 25 } },
      { id: '3', user: { name: 'Charlie', age: 35 } },
    ]

    const { result } = renderHook(() => useTableSortWithData(nestedData))

    act(() => {
      result.current.handleSort('user.name')
    })

    expect(result.current.sortedData.map((item) => item.user.name)).toEqual([
      'Alice',
      'Bob',
      'Charlie',
    ])
  })

  it('should handle null and undefined values in sorting', () => {
    const dataWithNulls = [
      { id: '1', name: 'Alice', age: 30 },
      { id: '2', name: null, age: 25 },
      { id: '3', name: 'Charlie', age: null },
      { id: '4', name: undefined, age: 28 },
    ]

    const { result } = renderHook(() => useTableSortWithData(dataWithNulls))

    act(() => {
      result.current.handleSort('name')
    })

    // Nulls and undefined should sort to the end
    const names = result.current.sortedData.map((item) => item.name)
    expect(names[0]).toBe('Alice')
    expect(names[1]).toBe('Charlie')
    expect(names[2]).toBeNull()
    expect(names[3]).toBeUndefined()
  })
})
