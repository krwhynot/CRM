import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

// Column definition interface with full TypeScript generics support
export interface Column<T> {
  key: keyof T | string
  header: React.ReactNode
  cell?: (row: T) => React.ReactNode
  className?: string
  hidden?: {
    sm?: boolean
    md?: boolean
    lg?: boolean
  }
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
}

/**
 * @deprecated This DataTable component is deprecated. Use the enhanced DataTable from
 * @/components/data-table/data-table.tsx instead which includes:
 * - TanStack Table integration
 * - Enhanced selection and expansion features
 * - Better performance optimizations
 * - Standardized column definitions
 *
 * Migration path:
 * 1. Import from '@/components/data-table/data-table'
 * 2. Use column definitions from '@/components/data-table/columns/*'
 * 3. Update props to TanStack Table format
 *
 * DataTable - Unified table component for the CRM system
 *
 * A generic, accessible table component that consolidates all table functionality
 * with TypeScript generics, responsive design, and comprehensive accessibility support.
 *
 * @example Basic Usage
 * <DataTable
 *   data={organizations}
 *   columns={organizationColumns}
 *   rowKey={(row) => row.id}
 *   onRowClick={handleRowClick}
 * />
 *
 * @example With Loading State
 * <DataTable
 *   data={[]}
 *   columns={columns}
 *   loading={true}
 *   rowKey={(row) => row.id}
 * />
 *
 * @example With Custom Empty State
 * <DataTable
 *   data={[]}
 *   columns={columns}
 *   rowKey={(row) => row.id}
 *   empty={{
 *     title: "No contacts found",
 *     description: "Get started by adding your first contact"
 *   }}
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
  onToggleRow: _onToggleRow, // Available for column components but not directly used here
}: DataTableProps<T>) {
  // Helper function to generate responsive column classes
  const getColumnClasses = (column: Column<T>): string => {
    if (!column.hidden) return column.className || ''

    const hideClasses = []
    if (column.hidden.sm) hideClasses.push('hidden sm:table-cell')
    if (column.hidden.md) hideClasses.push('hidden md:table-cell')
    if (column.hidden.lg) hideClasses.push('hidden lg:table-cell')

    return cn(column.className, hideClasses.join(' '))
  }

  // Loading state with skeleton
  if (loading) {
    return (
      <div
        className="overflow-hidden rounded-lg border bg-background"
        role="status"
        aria-live="polite"
        aria-label="Loading table data"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Loading data table">
            <thead className="sticky top-0 z-10">
              <tr className="border-b bg-muted/50">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={cn(
                      'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
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
                      className={cn('px-4 py-3 align-middle', getColumnClasses(column))}
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
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Data table">
          <thead className="sticky top-0 z-10">
            <tr className="border-b bg-muted/50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={cn(
                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                    getColumnClasses(column)
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center align-middle">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{empty.title}</h3>
                      {empty.description && (
                        <p className="text-sm text-muted-foreground">{empty.description}</p>
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
                      'border-b transition-colors hover:bg-muted/50',
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
                        className={cn('px-4 py-3 align-middle', getColumnClasses(column))}
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
                    <tr key={`${rowKeyValue}-expanded`} className="border-b bg-gray-50/50">
                      <td colSpan={columns.length} className="p-0">
                        <div className="p-6">{expandableContent(row)}</div>
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

// Export helper type for easier column definition
export type DataTableColumn<T> = Column<T>
