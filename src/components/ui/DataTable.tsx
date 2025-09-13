import React, { useMemo, useCallback, useState, useRef } from 'react'
import { List as FixedSizeList } from 'react-window'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useResponsiveTokens } from '@/hooks/tokens'
import {
  spacing,
  semanticSpacing,
  semanticTypography,
  semanticColors,
  semanticShadows,
  semanticRadius,
} from '@/styles/tokens'

// Column definition interface with full TypeScript generics support
export interface Column<T> {
  key: keyof T | string
  header: React.ReactNode | ((data: T[]) => React.ReactNode)
  cell?: (row: T) => React.ReactNode
  className?: string
  hidden?: {
    sm?: boolean
    md?: boolean
    lg?: boolean
  }
}

// Performance and virtualization features
export interface TableFeatures {
  virtualization?: 'auto' | 'always' | 'never'
  selection?: boolean
  sorting?: boolean
  filtering?: boolean
  pagination?: boolean
}

// Main DataTable props interface
export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  empty?: {
    title: string
    description?: string
  }
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  // Expandable row support
  expandableContent?: (row: T) => React.ReactNode
  expandedRows?: string[]
  onToggleRow?: (rowKey: string) => void
  // Enhanced features
  features?: TableFeatures
  // Virtualization specific (when enabled)
  rowHeight?: number
  tableHeight?: number | string
  className?: string
  // Selection support
  selectedRows?: Set<string>
  onRowSelect?: (rowKey: string, selected: boolean) => void
}

/**
 * DataTable - Unified table component for the CRM system
 *
 * A generic, accessible table component that consolidates all table functionality
 * with TypeScript generics, responsive design, comprehensive accessibility support,
 * and automatic performance optimization with virtualization for large datasets.
 *
 * @example Basic Usage
 * <DataTable
 *   data={organizations}
 *   columns={organizationColumns}
 *   rowKey={(row) => row.id}
 *   onRowClick={handleRowClick}
 * />
 *
 * @example With Auto-Virtualization
 * <DataTable
 *   data={largeDataset}
 *   columns={columns}
 *   rowKey={(row) => row.id}
 *   features={{ virtualization: 'auto' }} // Auto-enables for 500+ rows
 * />
 *
 * @example With Selection
 * <DataTable
 *   data={items}
 *   columns={columns}
 *   rowKey={(row) => row.id}
 *   features={{ selection: true }}
 *   selectedRows={selectedRows}
 *   onRowSelect={handleRowSelect}
 * />
 */
export function DataTable<T>({
  data,
  columns,
  loading = false,
  empty = {
    title: 'No data',
    description: undefined,
  },
  rowKey,
  onRowClick,
  expandableContent,
  expandedRows = [],
  onToggleRow,
  // Enhanced features
  features = {},
  rowHeight = 60,
  tableHeight = 400,
  className,
  selectedRows,
  onRowSelect,
}: DataTableProps<T>) {
  const { spacing, typography } = useResponsiveTokens()

  // Performance detection and auto-virtualization logic
  const VIRTUALIZATION_THRESHOLD = 500
  const shouldUseVirtualization = useMemo(() => {
    switch (features.virtualization) {
      case 'always':
        return true
      case 'never':
        return false
      case 'auto':
      default:
        return data.length >= VIRTUALIZATION_THRESHOLD
    }
  }, [features.virtualization, data.length])

  // Helper function to generate responsive column classes
  const getColumnClasses = (column: Column<T>): string => {
    if (!column.hidden) return column.className || ''

    const hideClasses = []
    if (column.hidden.sm) hideClasses.push('hidden sm:table-cell')
    if (column.hidden.md) hideClasses.push('hidden md:table-cell')
    if (column.hidden.lg) hideClasses.push('hidden lg:table-cell')

    return cn(column.className, hideClasses.join(' '))
  }

  // If virtualization is enabled, use different rendering approach
  if (shouldUseVirtualization) {
    return (
      <VirtualizedDataTable
        data={data}
        columns={columns}
        loading={loading}
        empty={empty}
        rowKey={rowKey}
        onRowClick={onRowClick}
        expandableContent={expandableContent}
        expandedRows={expandedRows}
        onToggleRow={onToggleRow}
        rowHeight={rowHeight}
        tableHeight={tableHeight}
        className={className}
        selectedRows={selectedRows}
        onRowSelect={onRowSelect}
        getColumnClasses={getColumnClasses}
        spacing={spacing}
        typography={typography}
      />
    )
  }

  // Loading state with skeleton
  if (loading) {
    return (
      <div
        className={cn(
          'overflow-hidden bg-background',
          semanticColors.cardBackground,
          semanticShadows.table,
          semanticRadius.table
        )}
        role="status"
        aria-live="polite"
        aria-label="Loading table data"
      >
        <div className="overflow-x-auto">
          <table
            className={cn('w-full', semanticTypography.tableCell)}
            role="table"
            aria-label="Loading data table"
          >
            <thead className="sticky top-0 z-10">
              <tr className={cn('border-b', semanticColors.cardBackground)}>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={cn(
                      'h-12 text-left align-middle',
                      semanticSpacing.tableCell,
                      semanticTypography.tableHeader,
                      getColumnClasses(column)
                    )}
                  >
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {columns.map((column, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={cn(
                        'align-middle',
                        semanticSpacing.tableCell,
                        getColumnClasses(column)
                      )}
                    >
                      <Skeleton
                        className={cn(
                          'h-4',
                          cellIndex === 0
                            ? 'w-32' // First column wider
                            : cellIndex === columns.length - 1
                              ? 'w-16' // Last column narrower
                              : 'w-24' // Middle columns medium
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span className="sr-only">Loading table data...</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden bg-background',
        semanticColors.cardBackground,
        semanticShadows.table,
        semanticRadius.table
      )}
    >
      <div className="overflow-x-auto">
        <table className={cn('w-full', semanticTypography.tableCell)} role="table" aria-label="Data table">
          <thead className="sticky top-0 z-10">
            <tr className={cn('border-b', semanticColors.cardBackground)}>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={cn(
                    'h-12 text-left align-middle',
                    semanticSpacing.tableCell,
                    semanticTypography.tableHeader,
                    getColumnClasses(column)
                  )}
                >
                  {typeof column.header === 'function' ? column.header(data) : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={cn('text-center align-middle', semanticSpacing.cardContainer, 'py-16')}
                >
                  <div className={cn('flex flex-col items-center justify-center', spacing.stack)}>
                    <div className={spacing.stack}>
                      <h3 className={semanticTypography.sectionTitle}>{empty.title}</h3>
                      {empty.description && (
                        <p className={semanticTypography.sectionSubtitle}>{empty.description}</p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.flatMap((row) => {
                const rowKeyValue = rowKey(row)
                const isExpanded = expandedRows.includes(rowKeyValue)

                const mainRow = (
                  <tr
                    key={rowKeyValue}
                    className={cn(
                      'border-b transition-colors',
                      semanticColors.hoverBackground,
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onRowClick(row)
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? 'button' : undefined}
                    aria-label={onRowClick ? `Click to select row` : undefined}
                  >
                    {columns.map((column, index) => (
                      <td
                        key={index}
                        className={cn(
                          'align-middle',
                          semanticSpacing.tableCell,
                          getColumnClasses(column)
                        )}
                      >
                        {column.cell
                          ? column.cell(row)
                          : String(
                              (row as Record<string | number | symbol, unknown>)[
                                column.key as keyof T
                              ] || ''
                            )}
                      </td>
                    ))}
                  </tr>
                )

                const expandedRow =
                  isExpanded && expandableContent ? (
                    <tr
                      key={`${rowKeyValue}-expanded`}
                      className={cn('border-b', semanticColors.cardBackground)}
                    >
                      <td colSpan={columns.length} className="p-0">
                        <div className={semanticSpacing.cardContainer}>
                          {expandableContent(row)}
                        </div>
                      </td>
                    </tr>
                  ) : null

                return expandedRow ? [mainRow, expandedRow] : [mainRow]
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// =============================================================================
// VIRTUAL TABLE COMPONENTS
// =============================================================================

interface VirtualRowData<T> {
  data: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  selectedRows?: Set<string>
  onRowSelect?: (rowKey: string, selected: boolean) => void
  expandableContent?: (row: T) => React.ReactNode
  expandedRows?: string[]
  onToggleRow?: (rowKey: string) => void
  getColumnClasses: (column: Column<T>) => string
}

interface VirtualRowProps<T> {
  index: number
  style: React.CSSProperties
  data: VirtualRowData<T>
}

const VirtualRow = React.memo(<T,>({ index, style, data }: VirtualRowProps<T>) => {
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
    getColumnClasses,
  } = data

  const row = tableData[index]
  const rowKeyValue = rowKey(row)
  const isSelected = selectedRows?.has(rowKeyValue) || false
  const isExpanded = expandedRows?.includes(rowKeyValue) || false

  const handleRowClick = useCallback(() => {
    onRowClick?.(row)
  }, [onRowClick, row])

  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      onRowSelect?.(rowKeyValue, checked)
    },
    [onRowSelect, rowKeyValue]
  )

  const handleToggleExpanded = useCallback(() => {
    onToggleRow?.(rowKeyValue)
  }, [onToggleRow, rowKeyValue])

  return (
    <div style={style} className="border-b border-border">
      <div
        className={cn(
          `flex items-center ${semanticSpacing.cardContainer} hover:bg-muted/50 transition-colors`,
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
          <div className={cn(semanticSpacing.inline.sm, 'flex items-center')}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                handleCheckboxChange(e.target.checked)
              }}
              className={cn(
                semanticRadius.small,
                'h-4 w-4 text-primary focus:ring-primary border-gray-300'
              )}
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
                  (row as Record<string | number | symbol, unknown>)[column.key as keyof T] || ''
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
              className={cn(
                semanticRadius.small,
                'h-6 w-6 flex items-center justify-center hover:bg-gray-200 transition-colors'
              )}
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
        <div className={`${semanticSpacing.cardContainer} bg-gray-50/50 border-t`}>
          {expandableContent(row)}
        </div>
      )}
    </div>
  )
})

VirtualRow.displayName = 'VirtualRow'

interface VirtualTableHeaderProps<T> {
  columns: Column<T>[]
  data: T[]
  hasSelection?: boolean
  hasExpansion?: boolean
  selectedCount?: number
  totalCount?: number
  onSelectAll?: () => void
  getColumnClasses: (column: Column<T>) => string
}

function VirtualTableHeader<T>({
  columns,
  data,
  hasSelection,
  hasExpansion,
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
  getColumnClasses,
}: VirtualTableHeaderProps<T>) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount

  return (
    <div
      className={cn(
        semanticTypography.label,
        'flex items-center',
        semanticSpacing.cardContainer,
        'bg-muted/50 border-b',
        semanticTypography.caption,
        'text-muted-foreground sticky top-0 z-10'
      )}
    >
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
            className={cn(
              semanticRadius.small,
              'h-4 w-4 text-primary focus:ring-primary border-gray-300'
            )}
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
          {typeof column.header === 'function' ? column.header(data) : column.header}
        </div>
      ))}

      {/* Expansion header spacer */}
      {hasExpansion && <div className="ml-3 w-6" />}
    </div>
  )
}

interface VirtualizedDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading: boolean
  empty: { title: string; description?: string }
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  expandableContent?: (row: T) => React.ReactNode
  expandedRows?: string[]
  onToggleRow?: (rowKey: string) => void
  rowHeight: number
  tableHeight: number | string
  className?: string
  selectedRows?: Set<string>
  onRowSelect?: (rowKey: string, selected: boolean) => void
  getColumnClasses: (column: Column<T>) => string
  spacing: any
  typography: any
}

function VirtualizedDataTable<T>({
  data,
  columns,
  loading,
  empty,
  rowKey,
  onRowClick,
  expandableContent,
  expandedRows,
  onToggleRow,
  rowHeight,
  tableHeight,
  className,
  selectedRows,
  onRowSelect,
  getColumnClasses,
  spacing,
  typography,
}: VirtualizedDataTableProps<T>) {
  const listRef = useRef<FixedSizeList>(null)
  const [containerHeight, setContainerHeight] = useState(
    typeof tableHeight === 'number' ? tableHeight : 400
  )

  // Memoize row data to prevent unnecessary re-renders
  const rowData = useMemo<VirtualRowData<T>>(
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
      getColumnClasses,
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
      getColumnClasses,
    ]
  )

  // Selection helpers
  const selectedCount = selectedRows?.size || 0
  const totalCount = data.length

  const handleSelectAll = useCallback(() => {
    if (!onRowSelect) return

    const isAllSelected = selectedCount === totalCount && totalCount > 0

    if (isAllSelected) {
      // Deselect all
      data.forEach((row) => {
        const key = rowKey(row)
        onRowSelect(key, false)
      })
    } else {
      // Select all
      data.forEach((row) => {
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
      >
        <VirtualTableHeader
          columns={columns}
          data={data}
          hasSelection={!!onRowSelect}
          hasExpansion={!!expandableContent}
          getColumnClasses={getColumnClasses}
        />
        <div className={`${semanticSpacing.cardContainer} ${semanticSpacing.stack.xs}`}>
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
      >
        <VirtualTableHeader
          columns={columns}
          data={data}
          hasSelection={!!onRowSelect}
          hasExpansion={!!expandableContent}
          getColumnClasses={getColumnClasses}
        />
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className={`${semanticTypography.h4} text-foreground`}>{empty.title}</h3>
          {empty.description && (
            <p
              className={cn(
                semanticSpacing.topGap.xs,
                semanticTypography.caption,
                'text-muted-foreground'
              )}
            >
              {empty.description}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('overflow-hidden rounded-lg border bg-background', className)}
      style={{ height: containerHeight }}
    >
      <VirtualTableHeader
        columns={columns}
        data={data}
        hasSelection={!!onRowSelect}
        hasExpansion={!!expandableContent}
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSelectAll={handleSelectAll}
        getColumnClasses={getColumnClasses}
      />

      <FixedSizeList
        ref={listRef}
        height={containerHeight - 60} // Subtract header height
        itemCount={data.length}
        itemSize={rowHeight}
        itemData={rowData}
        overscanCount={10}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {VirtualRow as any}
      </FixedSizeList>
    </div>
  )
}

// Export helper type for easier column definition
export type DataTableColumn<T> = Column<T>
