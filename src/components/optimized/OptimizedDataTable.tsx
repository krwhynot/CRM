/**
 * Optimized Data Table
 * 
 * Performance-optimized version of DataTable with memoization, virtual scrolling,
 * and intelligent re-rendering for large datasets.
 */

import React from 'react'
import { DataTable, type DataTableProps, type DataTableColumn } from '@/components/ui/DataTable'
import { VirtualDataTable, type VirtualDataTableProps } from '@/components/virtualization/VirtualDataTable'
import { memoWithArrayProps, useDebounce, usePerformanceMonitor } from '@/lib/performance/memoization-utils'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

interface OptimizedDataTableProps<T> extends Omit<DataTableProps<T>, 'data' | 'columns'> {
  data: T[]
  columns: DataTableColumn<T>[]
  
  // Performance options
  enableVirtualization?: boolean
  virtualizationThreshold?: number
  rowHeight?: number
  tableHeight?: number | string
  debounceMs?: number
  
  // Debug options
  enablePerformanceMonitoring?: boolean
  componentName?: string
}

// =============================================================================
// OPTIMIZED CELL RENDERER
// =============================================================================

interface CellProps<T> {
  row: T
  column: DataTableColumn<T>
  className?: string
}

const OptimizedCell = React.memo(<T,>({ row, column, className }: CellProps<T>) => {
  // Use performance monitoring in development
  usePerformanceMonitor(`DataTableCell-${String(column.key)}`, process.env.NODE_ENV === 'development')

  const cellContent = React.useMemo(() => {
    if (column.cell) {
      return column.cell(row)
    }
    
    const value = (row as Record<string | number | symbol, unknown>)[column.key as keyof T]
    return String(value || '')
  }, [row, column])

  return (
    <td className={className}>
      {cellContent}
    </td>
  )
}) as <T>(props: CellProps<T>) => JSX.Element

OptimizedCell.displayName = 'OptimizedCell'

// =============================================================================
// OPTIMIZED ROW RENDERER
// =============================================================================

interface RowProps<T> {
  row: T
  columns: DataTableColumn<T>[]
  rowKey: string
  onRowClick?: (row: T) => void
  className?: string
}

const OptimizedRow = React.memo(<T,>({ 
  row, 
  columns, 
  rowKey, 
  onRowClick,
  className 
}: RowProps<T>) => {
  // Memoize click handler to prevent recreation
  const handleClick = React.useCallback(() => {
    onRowClick?.(row)
  }, [onRowClick, row])

  // Memoize keyboard handler
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick, onRowClick])

  return (
    <tr
      className={cn(
        'border-b transition-colors hover:bg-muted/50',
        onRowClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onRowClick ? 0 : undefined}
      role={onRowClick ? 'button' : undefined}
      aria-label={onRowClick ? `Click to select row` : undefined}
    >
      {columns.map((column, index) => (
        <OptimizedCell
          key={`${rowKey}-${index}`}
          row={row}
          column={column}
          className={cn('px-4 py-3 align-middle', column.className)}
        />
      ))}
    </tr>
  )
}) as <T>(props: RowProps<T>) => JSX.Element

OptimizedRow.displayName = 'OptimizedRow'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function OptimizedDataTableComponent<T>({
  data,
  columns,
  enableVirtualization = false,
  virtualizationThreshold = 1000,
  rowHeight = 60,
  tableHeight = 400,
  debounceMs = 0,
  enablePerformanceMonitoring = false,
  componentName = 'OptimizedDataTable',
  ...props
}: OptimizedDataTableProps<T>) {
  // Performance monitoring
  usePerformanceMonitor(componentName, enablePerformanceMonitoring)

  // Debounce data updates to reduce re-renders
  const debouncedData = useDebounce(data, debounceMs)

  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = React.useMemo(() => columns, [columns])

  // Determine if virtualization should be used
  const shouldUseVirtualization = React.useMemo(() => {
    return enableVirtualization || debouncedData.length >= virtualizationThreshold
  }, [enableVirtualization, debouncedData.length, virtualizationThreshold])

  // Memoize row key function
  const memoizedRowKey = React.useCallback((row: T) => {
    return props.rowKey(row)
  }, [props.rowKey])

  // Use virtual table for large datasets
  if (shouldUseVirtualization) {
    const virtualProps: VirtualDataTableProps<T> = {
      data: debouncedData,
      columns: memoizedColumns,
      rowKey: memoizedRowKey,
      rowHeight,
      tableHeight,
      loading: props.loading,
      empty: props.empty,
      onRowClick: props.onRowClick,
      className: props.className,
    }

    return <VirtualDataTable {...virtualProps} />
  }

  // Use regular table for smaller datasets with optimized rendering
  const optimizedProps: DataTableProps<T> = {
    ...props,
    data: debouncedData,
    columns: memoizedColumns,
    rowKey: memoizedRowKey,
  }

  return <DataTable {...optimizedProps} />
}

// Memoize the component with array prop comparison
export const OptimizedDataTable = memoWithArrayProps(
  OptimizedDataTableComponent,
  ['data', 'columns']
)

// =============================================================================
// HOOKS FOR TABLE OPTIMIZATION
// =============================================================================

/**
 * Hook to optimize table columns with memoization
 */
export function useOptimizedColumns<T>(
  columnsFactory: () => DataTableColumn<T>[],
  deps: React.DependencyList
): DataTableColumn<T>[] {
  return React.useMemo(() => {
    const columns = columnsFactory()
    
    // Memoize cell renderers
    return columns.map(column => ({
      ...column,
      cell: column.cell ? React.useCallback(column.cell, []) : undefined,
    }))
  }, deps)
}

/**
 * Hook to optimize large datasets with chunking and pagination
 */
export function useChunkedData<T>(
  data: T[],
  chunkSize: number = 100,
  enabled: boolean = true
) {
  const [currentChunk, setCurrentChunk] = React.useState(0)

  const chunkedData = React.useMemo(() => {
    if (!enabled) return data

    const chunks = []
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize))
    }
    return chunks
  }, [data, chunkSize, enabled])

  const currentData = React.useMemo(() => {
    if (!enabled) return data
    return chunkedData.slice(0, currentChunk + 1).flat()
  }, [chunkedData, currentChunk, enabled, data])

  const loadMore = React.useCallback(() => {
    if (currentChunk < chunkedData.length - 1) {
      setCurrentChunk(prev => prev + 1)
    }
  }, [currentChunk, chunkedData.length])

  const hasMore = currentChunk < chunkedData.length - 1

  return {
    currentData,
    loadMore,
    hasMore,
    totalChunks: chunkedData.length,
    currentChunk,
    reset: () => setCurrentChunk(0),
  }
}

/**
 * Hook for intelligent table updates
 */
export function useSmartTableUpdates<T>(
  data: T[],
  keyExtractor: (item: T) => string,
  updateStrategy: 'replace' | 'merge' | 'append' = 'replace'
) {
  const [tableData, setTableData] = React.useState<T[]>(data)
  const previousDataMap = React.useRef(new Map<string, T>())

  React.useEffect(() => {
    const newDataMap = new Map(data.map(item => [keyExtractor(item), item]))

    switch (updateStrategy) {
      case 'replace':
        setTableData(data)
        break

      case 'merge':
        setTableData(prevData => {
          const mergedData = [...prevData]
          
          // Update existing items and add new ones
          data.forEach(item => {
            const key = keyExtractor(item)
            const existingIndex = mergedData.findIndex(existing => keyExtractor(existing) === key)
            
            if (existingIndex >= 0) {
              mergedData[existingIndex] = item
            } else {
              mergedData.push(item)
            }
          })
          
          // Remove items not in new data
          return mergedData.filter(item => newDataMap.has(keyExtractor(item)))
        })
        break

      case 'append':
        setTableData(prevData => {
          const existingKeys = new Set(prevData.map(keyExtractor))
          const newItems = data.filter(item => !existingKeys.has(keyExtractor(item)))
          return [...prevData, ...newItems]
        })
        break
    }

    previousDataMap.current = newDataMap
  }, [data, keyExtractor, updateStrategy])

  return tableData
}

// =============================================================================
// PERFORMANCE TESTING UTILITIES
// =============================================================================

/**
 * Generate test data for performance testing
 */
export function generateTestData(count: number): Array<{
  id: string
  name: string
  email: string
  role: string
  status: string
  lastActive: Date
}> {
  const roles = ['Admin', 'Manager', 'Employee', 'Contractor']
  const statuses = ['Active', 'Inactive', 'Pending']
  
  return Array.from({ length: count }, (_, index) => ({
    id: `user-${index}`,
    name: `User ${index}`,
    email: `user${index}@example.com`,
    role: roles[index % roles.length],
    status: statuses[index % statuses.length],
    lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }))
}

/**
 * Benchmark table performance
 */
export function useTableBenchmark<T>(
  data: T[],
  enabled: boolean = false
) {
  const renderTimes = React.useRef<number[]>([])
  const startTime = React.useRef<number>()

  React.useLayoutEffect(() => {
    if (enabled) {
      startTime.current = performance.now()
    }
  })

  React.useEffect(() => {
    if (enabled && startTime.current) {
      const renderTime = performance.now() - startTime.current
      renderTimes.current.push(renderTime)
      
      // Keep only last 10 renders
      if (renderTimes.current.length > 10) {
        renderTimes.current = renderTimes.current.slice(-10)
      }
      
      const avgRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
      
      console.log(`Table render stats:`, {
        lastRender: `${renderTime.toFixed(2)}ms`,
        avgRender: `${avgRenderTime.toFixed(2)}ms`,
        dataSize: data.length,
      })
    }
  })

  return {
    avgRenderTime: renderTimes.current.length > 0 
      ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length 
      : 0,
    lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
    renderCount: renderTimes.current.length,
  }
}