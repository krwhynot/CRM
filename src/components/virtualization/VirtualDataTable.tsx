/**
 * Virtual Data Table
 * 
 * High-performance data table with virtual scrolling for large datasets.
 * Renders only visible rows for optimal performance with thousands of records.
 */

import React, { useMemo, useCallback, useState, useRef } from 'react'
import { FixedSizeList as List, areEqual } from 'react-window'
import { DataTableColumn } from '@/components/ui/DataTable'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface VirtualDataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  rowHeight?: number
  tableHeight?: number | string
  loading?: boolean
  empty?: {
    title: string
    description?: string
  }
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  className?: string
  
  // Virtual scrolling specific
  overscan?: number
  estimatedRowHeight?: number
  
  // Selection support
  selectedRows?: Set<string>
  onRowSelect?: (rowKey: string, selected: boolean) => void
  
  // Expandable rows
  expandableContent?: (row: T) => React.ReactNode
  expandedRows?: Set<string>
  onToggleRow?: (rowKey: string) => void
}

interface RowData<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  selectedRows?: Set<string>
  onRowSelect?: (rowKey: string, selected: boolean) => void
  expandableContent?: (row: T) => React.ReactNode
  expandedRows?: Set<string>
  onToggleRow?: (rowKey: string) => void
}

interface RowProps<T> {
  index: number
  style: React.CSSProperties
  data: RowData<T>
}

// =============================================================================
// ROW COMPONENT
// =============================================================================

const VirtualRow = React.memo(<T,>({ index, style, data }: RowProps<T>) => {
  const {
    data: tableData,
    columns,
    rowKey,
    onRowClick,
    selectedRows,
    onRowSelect,
    expandableContent,
    expandedRows,
    onToggleRow,
  } = data

  const row = tableData[index]
  const rowKeyValue = rowKey(row)
  const isSelected = selectedRows?.has(rowKeyValue) || false
  const isExpanded = expandedRows?.has(rowKeyValue) || false

  const handleRowClick = useCallback(() => {
    onRowClick?.(row)
  }, [onRowClick, row])

  const handleCheckboxChange = useCallback((checked: boolean) => {
    onRowSelect?.(rowKeyValue, checked)
  }, [onRowSelect, rowKeyValue])

  const handleToggleExpanded = useCallback(() => {
    onToggleRow?.(rowKeyValue)
  }, [onToggleRow, rowKeyValue])

  // Helper function to get responsive column classes
  const getColumnClasses = (column: DataTableColumn<T>): string => {
    if (!column.hidden) return column.className || ''

    const hideClasses = []
    if (column.hidden.sm) hideClasses.push('hidden sm:table-cell')
    if (column.hidden.md) hideClasses.push('hidden md:table-cell')
    if (column.hidden.lg) hideClasses.push('hidden lg:table-cell')

    return cn(column.className, hideClasses.join(' '))
  }

  return (
    <div style={style} className="border-b border-border">
      <div
        className={cn(
          'flex items-center px-4 py-3 hover:bg-muted/50 transition-colors',
          onRowClick && 'cursor-pointer',
          isSelected && 'bg-muted'
        )}
        onClick={handleRowClick}
        onKeyDown={
          onRowClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleRowClick()
                }
              }
            : undefined
        }
        tabIndex={onRowClick ? 0 : undefined}
        role={onRowClick ? 'button' : undefined}
        aria-label={onRowClick ? `Click to select row` : undefined}
        aria-selected={isSelected}
      >
        {/* Selection checkbox */}
        {onRowSelect && (
          <div className="flex items-center mr-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                handleCheckboxChange(e.target.checked)
              }}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              aria-label={`Select row ${index + 1}`}
            />
          </div>
        )}

        {/* Row cells */}
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={cn(
              'flex-1 min-w-0 text-sm',
              getColumnClasses(column),
              columnIndex === 0 && 'flex-[2]' // First column wider
            )}
          >
            {column.cell
              ? column.cell(row)
              : String(
                  (row as Record<string | number | symbol, unknown>)[
                    column.key as keyof T
                  ] || ''
                )}
          </div>
        ))}

        {/* Expand toggle */}
        {expandableContent && (
          <div className="ml-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggleExpanded()
              }}
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row details`}
            >
              <svg
                className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && expandableContent && (
        <div className="px-4 py-3 bg-gray-50/50 border-t">
          {expandableContent(row)}
        </div>
      )}
    </div>
  )
}, areEqual)

VirtualRow.displayName = 'VirtualRow'

// =============================================================================
// HEADER COMPONENT
// =============================================================================

interface TableHeaderProps<T> {
  columns: DataTableColumn<T>[]
  hasSelection?: boolean
  hasExpansion?: boolean
  selectedCount?: number
  totalCount?: number
  onSelectAll?: () => void
}

function TableHeader<T>({
  columns,
  hasSelection,
  hasExpansion,
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
}: TableHeaderProps<T>) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount

  const getColumnClasses = (column: DataTableColumn<T>): string => {
    if (!column.hidden) return column.className || ''

    const hideClasses = []
    if (column.hidden.sm) hideClasses.push('hidden sm:table-cell')
    if (column.hidden.md) hideClasses.push('hidden md:table-cell')
    if (column.hidden.lg) hideClasses.push('hidden lg:table-cell')

    return cn(column.className, hideClasses.join(' '))
  }

  return (
    <div className="flex items-center px-4 py-3 bg-muted/50 border-b font-medium text-sm text-muted-foreground sticky top-0 z-10">
      {/* Selection header */}
      {hasSelection && (
        <div className="flex items-center mr-3">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = isPartiallySelected
              }
            }}
            onChange={onSelectAll}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            aria-label={`Select all ${totalCount} rows`}
          />
        </div>
      )}

      {/* Column headers */}
      {columns.map((column, index) => (
        <div
          key={index}
          className={cn(
            'flex-1 min-w-0 text-left',
            getColumnClasses(column),
            index === 0 && 'flex-[2]' // First column wider
          )}
        >
          {column.header}
        </div>
      ))}

      {/* Expansion header spacer */}
      {hasExpansion && <div className="ml-3 w-6" />}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function VirtualDataTable<T>({
  data,
  columns,
  rowHeight = 60,
  tableHeight = 400,
  loading = false,
  empty = {
    title: 'No data',
    description: undefined,
  },
  rowKey,
  onRowClick,
  className,
  overscan = 10,
  selectedRows,
  onRowSelect,
  expandableContent,
  expandedRows,
  onToggleRow,
}: VirtualDataTableProps<T>) {
  const listRef = useRef<List>(null)
  const [containerHeight, setContainerHeight] = useState(
    typeof tableHeight === 'number' ? tableHeight : 400
  )

  // Memoize row data to prevent unnecessary re-renders
  const rowData = useMemo<RowData<T>>(
    () => ({
      data,
      columns,
      rowKey,
      onRowClick,
      selectedRows,
      onRowSelect,
      expandableContent,
      expandedRows,
      onToggleRow,
    }),
    [
      data,
      columns,
      rowKey,
      onRowClick,
      selectedRows,
      onRowSelect,
      expandableContent,
      expandedRows,
      onToggleRow,
    ]
  )

  // Handle container resize
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    for (const entry of entries) {
      setContainerHeight(entry.contentRect.height)
    }
  }, [])

  // Set up resize observer
  React.useEffect(() => {
    if (typeof tableHeight === 'string') {
      const observer = new ResizeObserver(handleResize)
      const container = document.querySelector(`[data-table-container]`)
      if (container) {
        observer.observe(container)
      }
      return () => observer.disconnect()
    }
  }, [tableHeight, handleResize])

  // Selection helpers
  const selectedCount = selectedRows?.size || 0
  const totalCount = data.length

  const handleSelectAll = useCallback(() => {
    if (!onRowSelect) return
    
    const isAllSelected = selectedCount === totalCount && totalCount > 0
    
    if (isAllSelected) {
      // Deselect all
      data.forEach(row => {
        const key = rowKey(row)
        onRowSelect(key, false)
      })
    } else {
      // Select all
      data.forEach(row => {
        const key = rowKey(row)
        onRowSelect(key, true)
      })
    }
  }, [selectedCount, totalCount, data, rowKey, onRowSelect])

  // Loading state
  if (loading) {
    return (
      <div
        className={cn('overflow-hidden rounded-lg border bg-background', className)}
        style={{ height: containerHeight }}
        data-table-container
      >
        <TableHeader
          columns={columns}
          hasSelection={!!onRowSelect}
          hasExpansion={!!expandableContent}
        />
        <div className="p-4 space-y-2">
          {Array.from({ length: Math.floor(containerHeight / rowHeight) }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className={cn('overflow-hidden rounded-lg border bg-background', className)}
        style={{ height: containerHeight }}
        data-table-container
      >
        <TableHeader
          columns={columns}
          hasSelection={!!onRowSelect}
          hasExpansion={!!expandableContent}
        />
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold text-foreground">{empty.title}</h3>
          {empty.description && (
            <p className="text-sm text-muted-foreground mt-2">{empty.description}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('overflow-hidden rounded-lg border bg-background', className)}
      style={{ height: containerHeight }}
      data-table-container
    >
      <TableHeader
        columns={columns}
        hasSelection={!!onRowSelect}
        hasExpansion={!!expandableContent}
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSelectAll={handleSelectAll}
      />
      
      <List
        ref={listRef}
        height={containerHeight - 60} // Subtract header height
        itemCount={data.length}
        itemSize={rowHeight}
        itemData={rowData}
        overscanCount={overscan}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {VirtualRow}
      </List>
    </div>
  )
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to manage virtual table selection state
 */
export function useVirtualTableSelection<T>(
  data: T[],
  rowKey: (row: T) => string
) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const handleRowSelect = useCallback((key: string, selected: boolean) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev)
      if (selected) {
        newSelection.add(key)
      } else {
        newSelection.delete(key)
      }
      return newSelection
    })
  }, [])

  const selectAll = useCallback(() => {
    const allKeys = data.map(rowKey)
    setSelectedRows(new Set(allKeys))
  }, [data, rowKey])

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set())
  }, [])

  const getSelectedItems = useCallback(() => {
    return data.filter(row => selectedRows.has(rowKey(row)))
  }, [data, selectedRows, rowKey])

  return {
    selectedRows,
    handleRowSelect,
    selectAll,
    clearSelection,
    getSelectedItems,
    selectedCount: selectedRows.size,
  }
}

/**
 * Hook to manage expandable rows
 */
export function useExpandableRows() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const handleToggleRow = useCallback((key: string) => {
    setExpandedRows(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(key)) {
        newExpanded.delete(key)
      } else {
        newExpanded.add(key)
      }
      return newExpanded
    })
  }, [])

  const expandAll = useCallback((data: unknown[], rowKey: (row: unknown) => string) => {
    const allKeys = data.map(rowKey)
    setExpandedRows(new Set(allKeys))
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedRows(new Set())
  }, [])

  return {
    expandedRows,
    handleToggleRow,
    expandAll,
    collapseAll,
  }
}