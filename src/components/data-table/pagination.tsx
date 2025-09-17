'use client'

import * as React from 'react'
import type { Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  showSelected?: boolean
  className?: string
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  showSelected = true,
  className,
}: DataTablePaginationProps<TData>) {
  const {
    getState,
    getCanPreviousPage,
    getCanNextPage,
    getPageCount,
    previousPage,
    nextPage,
    setPageIndex,
    setPageSize,
    getFilteredSelectedRowModel,
    getFilteredRowModel,
  } = table

  const { pageIndex, pageSize } = getState().pagination
  const totalRows = getFilteredRowModel().rows.length
  const selectedRows = getFilteredSelectedRowModel().rows.length

  // Calculate page range for display
  const startRow = pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className={cn('flex items-center justify-between px-2', className)}>
      <div className="flex-1 text-sm text-muted-foreground">
        {showSelected && selectedRows > 0 && (
          <span>
            {selectedRows} of {totalRows} row{totalRows !== 1 ? 's' : ''} selected.
          </span>
        )}
        {(!showSelected || selectedRows === 0) && totalRows > 0 && (
          <span>
            Showing {startRow} to {endRow} of {totalRows} result{totalRows !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {getPageCount()}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => setPageIndex(0)}
            disabled={!getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => previousPage()}
            disabled={!getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => nextPage()}
            disabled={!getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => setPageIndex(getPageCount() - 1)}
            disabled={!getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Simplified pagination component for mobile or minimal layouts
export function DataTablePaginationSimple<TData>({
  table,
  className,
}: {
  table: Table<TData>
  className?: string
}) {
  const {
    getState,
    getCanPreviousPage,
    getCanNextPage,
    getPageCount,
    previousPage,
    nextPage,
    getFilteredRowModel,
  } = table

  const { pageIndex } = getState().pagination
  const totalRows = getFilteredRowModel().rows.length

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="text-sm text-muted-foreground">
        {totalRows} result{totalRows !== 1 ? 's' : ''}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => previousPage()}
          disabled={!getCanPreviousPage()}
        >
          Previous
        </Button>
        <div className="flex min-w-[80px] items-center justify-center text-sm font-medium">
          {getPageCount() > 0 ? `${pageIndex + 1} of ${getPageCount()}` : '0 of 0'}
        </div>
        <Button variant="outline" size="sm" onClick={() => nextPage()} disabled={!getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}

// Custom pagination input component for jumping to specific pages
export function DataTablePageInput<TData>({
  table,
  className,
}: {
  table: Table<TData>
  className?: string
}) {
  const [pageInput, setPageInput] = React.useState('')
  const { getState, setPageIndex, getPageCount } = table
  const { pageIndex } = getState().pagination

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = Number(pageInput)
    if (page >= 1 && page <= getPageCount()) {
      setPageIndex(page - 1)
      setPageInput('')
    }
  }

  return (
    <form onSubmit={handlePageSubmit} className={cn('flex items-center space-x-2', className)}>
      <span className="text-sm text-muted-foreground">Go to page:</span>
      <input
        type="number"
        min="1"
        max={getPageCount()}
        value={pageInput}
        onChange={(e) => setPageInput(e.target.value)}
        placeholder={`${pageIndex + 1}`}
        className="w-16 rounded border border-input bg-background px-2 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <Button type="submit" variant="outline" size="sm" disabled={!pageInput}>
        Go
      </Button>
    </form>
  )
}

// Row count info component
export function DataTableRowInfo<TData>({
  table,
  className,
}: {
  table: Table<TData>
  className?: string
}) {
  const { getState, getFilteredSelectedRowModel, getFilteredRowModel, getPreFilteredRowModel } =
    table

  const { pageIndex, pageSize } = getState().pagination
  const totalRows = getPreFilteredRowModel().rows.length
  const filteredRows = getFilteredRowModel().rows.length
  const selectedRows = getFilteredSelectedRowModel().rows.length

  const startRow = Math.min(pageIndex * pageSize + 1, filteredRows)
  const endRow = Math.min((pageIndex + 1) * pageSize, filteredRows)

  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      {selectedRows > 0 && (
        <div>
          {selectedRows} of {filteredRows} row{filteredRows !== 1 ? 's' : ''} selected
        </div>
      )}
      <div>
        {filteredRows > 0 ? (
          <>
            Showing {startRow} to {endRow} of {filteredRows} result{filteredRows !== 1 ? 's' : ''}
            {filteredRows !== totalRows && ` (filtered from ${totalRows} total)`}
          </>
        ) : (
          'No results found'
        )}
      </div>
    </div>
  )
}
