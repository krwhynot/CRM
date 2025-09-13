import { renderHook, act } from '@testing-library/react'
import { useBulkActions } from '../useBulkActions'

interface TestEntity {
  id: string
  name: string
  status: 'active' | 'inactive'
}

describe('useBulkActions', () => {
  const mockEntities: TestEntity[] = [
    { id: '1', name: 'Entity 1', status: 'active' },
    { id: '2', name: 'Entity 2', status: 'inactive' },
    { id: '3', name: 'Entity 3', status: 'active' },
  ]

  const defaultOptions = {
    getItemId: (item: TestEntity) => item.id,
    getItemName: (item: TestEntity) => item.name,
    entityType: 'entity',
    entityTypePlural: 'entities',
  }

  it('should initialize with zero progress', () => {
    const { result } = renderHook(() => useBulkActions(defaultOptions))

    expect(result.current.progress).toEqual({
      total: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: false,
    })
  })

  it('should handle bulk delete operation', async () => {
    const { result } = renderHook(() => useBulkActions(defaultOptions))

    const mockDeleteFunction = jest.fn().mockResolvedValue(undefined)

    await act(async () => {
      await result.current.executeBulkDelete([mockEntities[0], mockEntities[1]], mockDeleteFunction)
    })

    expect(mockDeleteFunction).toHaveBeenCalledTimes(2)
    expect(mockDeleteFunction).toHaveBeenCalledWith('1')
    expect(mockDeleteFunction).toHaveBeenCalledWith('2')
    expect(result.current.progress.completed).toBe(2)
    expect(result.current.progress.successful).toBe(2)
    expect(result.current.progress.failed).toBe(0)
    expect(result.current.progress.isRunning).toBe(false)
  })

  it('should handle bulk delete errors', async () => {
    const { result } = renderHook(() => useBulkActions(defaultOptions))

    const mockDeleteFunction = jest
      .fn()
      .mockResolvedValueOnce(undefined) // First item succeeds
      .mockRejectedValueOnce(new Error('Delete failed')) // Second item fails

    await act(async () => {
      await result.current.executeBulkDelete([mockEntities[0], mockEntities[1]], mockDeleteFunction)
    })

    expect(mockDeleteFunction).toHaveBeenCalledTimes(2)
    expect(result.current.progress.completed).toBe(2)
    expect(result.current.progress.successful).toBe(1)
    expect(result.current.progress.failed).toBe(1)
    expect(result.current.progress.isRunning).toBe(false)
  })

  it('should handle generic bulk operation', async () => {
    const { result } = renderHook(() => useBulkActions(defaultOptions))

    const mockOperation = jest.fn().mockResolvedValue(undefined)

    await act(async () => {
      await result.current.executeBulkOperation(
        [mockEntities[0], mockEntities[1]],
        mockOperation,
        'test-operation'
      )
    })

    expect(mockOperation).toHaveBeenCalledTimes(2)
    expect(mockOperation).toHaveBeenCalledWith(mockEntities[0])
    expect(mockOperation).toHaveBeenCalledWith(mockEntities[1])
    expect(result.current.progress.completed).toBe(2)
    expect(result.current.progress.successful).toBe(2)
    expect(result.current.progress.failed).toBe(0)
  })

  it('should handle generic bulk operation errors', async () => {
    const { result } = renderHook(() => useBulkActions(defaultOptions))

    const mockOperation = jest
      .fn()
      .mockResolvedValueOnce(undefined) // First item succeeds
      .mockRejectedValueOnce(new Error('Operation failed')) // Second item fails

    await act(async () => {
      await result.current.executeBulkOperation(
        [mockEntities[0], mockEntities[1]],
        mockOperation,
        'test-operation'
      )
    })

    expect(mockOperation).toHaveBeenCalledTimes(2)
    expect(result.current.progress.completed).toBe(2)
    expect(result.current.progress.successful).toBe(1)
    expect(result.current.progress.failed).toBe(1)
  })

  it('should reset progress', async () => {
    const { result } = renderHook(() => useBulkActions(defaultOptions))

    const mockOperation = jest.fn().mockResolvedValue(undefined)

    await act(async () => {
      await result.current.executeBulkOperation([mockEntities[0]], mockOperation, 'test-operation')
    })

    expect(result.current.progress.completed).toBe(1)

    act(() => {
      result.current.resetProgress()
    })

    expect(result.current.progress).toEqual({
      total: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: false,
    })
  })

  it('should track operation progress', async () => {
    const { result } = renderHook(() => useBulkActions(defaultOptions))

    expect(result.current.progress.isRunning).toBe(false)

    const slowOperation = jest.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)))

    const operationPromise = act(async () => {
      return result.current.executeBulkOperation(mockEntities, slowOperation, 'slow-operation')
    })

    // Check that operation is running immediately after starting
    expect(result.current.progress.isRunning).toBe(true)
    expect(result.current.progress.total).toBe(3)

    await operationPromise

    expect(result.current.progress.isRunning).toBe(false)
    expect(result.current.progress.completed).toBe(3)
  })

  it('should handle empty array for bulk operations', async () => {
    const { result } = renderHook(() => useBulkActions(defaultOptions))

    const mockOperation = jest.fn()

    const results = await act(async () => {
      return result.current.executeBulkOperation([], mockOperation, 'test-operation')
    })

    expect(mockOperation).not.toHaveBeenCalled()
    expect(results).toEqual([])
    expect(result.current.progress.total).toBe(0)
  })
})
