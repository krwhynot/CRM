"use client"

import * as React from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { DataTablePagination } from "./pagination"
import { DataTableToolbar } from "./toolbar"
import { ResponsiveFilterWrapper, type ResponsiveFilterWrapperProps } from "./filters/ResponsiveFilterWrapper"
import { EmptyState, EmptyStatePresets, type EmptyStateProps } from "@/components/layout/EmptyState"
import { FEATURE_FLAGS } from "@/lib/feature-flags"

// Enhanced sort direction type
export type SortDirection = 'asc' | 'desc' | 'none'

// CRM Table Column interface - merged from CRMTable
export interface CRMTableColumn<T> {
  key: keyof T | string
  header: string | React.ReactNode
  sortable?: boolean
  hidden?: 'mobile' | 'tablet' | never | { sm?: boolean; md?: boolean; lg?: boolean }
  render?: (value: any, row: T) => React.ReactNode
  cell?: (row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  searchKey?: string
  searchPlaceholder?: string
  enableColumnFilters?: boolean
  enableSorting?: boolean
  enablePagination?: boolean
  enableToolbar?: boolean
  pageSize?: number
  rowActions?: (row: TData) => React.ReactNode
  expandedContent?: (row: TData) => React.ReactNode
  emptyState?: EmptyStateProps | {
    title: string
    description?: string
    action?: React.ReactNode
  }
  className?: string
  onRowClick?: (row: TData) => void

  // Enhanced features from CRMTable
  selectable?: boolean
  expandable?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
  stickyHeader?: boolean
  striped?: boolean
  rowKey?: (row: TData) => string
  emptyMessage?: string

  // Manual sort handling (for backward compatibility)
  onSort?: (column: string, direction: SortDirection) => void

  // ResponsiveFilterWrapper integration
  useResponsiveFilters?: boolean
  entityType?: 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'
  entityFilters?: Record<string, any>
  onEntityFiltersChange?: (filters: Record<string, any>) => void
  totalCount?: number
  filteredCount?: number
  principals?: Array<{ value: string; label: string }>
  statuses?: Array<{ value: string; label: string }>
  priorities?: Array<{ value: string; label: string }>
  showTimeRange?: boolean
  showQuickFilters?: boolean
  showPrincipalFilter?: boolean
  showStatusFilter?: boolean
  showPriorityFilter?: boolean
  responsiveFilterTitle?: string
  responsiveFilterDescription?: string
  responsiveFilterLayoutModeOverride?: ResponsiveFilterWrapperProps['layoutModeOverride']
  responsiveFilterCustomTrigger?: ResponsiveFilterWrapperProps['customTrigger']
  responsiveFilterForceInline?: boolean
  responsiveFilterLazyRender?: boolean
  responsiveFilterWrapperClassName?: string
  responsiveFilterTriggerClassName?: string
  responsiveFilterSheetProps?: ResponsiveFilterWrapperProps['sheetProps']
  responsiveFilterSheetContentProps?: ResponsiveFilterWrapperProps['sheetContentProps']
  onResponsiveFilterLayoutModeChange?: ResponsiveFilterWrapperProps['onLayoutModeChange']
  onResponsiveFilterOpenChange?: ResponsiveFilterWrapperProps['onOpenChange']
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  searchKey,
  searchPlaceholder = "Search...",
  enableColumnFilters = true,
  enableSorting = true,
  enablePagination = true,
  enableToolbar = true,
  pageSize = 10,
  expandedContent,
  emptyState,
  className,
  onRowClick,

  // Enhanced CRMTable features
  selectable = false,
  expandable = false,
  onSelectionChange,
  stickyHeader = false,
  striped = false,
  rowKey,
  emptyMessage = "No data available",
  onSort,

  // ResponsiveFilterWrapper integration
  useResponsiveFilters = false,
  entityType,
  entityFilters,
  onEntityFiltersChange,
  totalCount,
  filteredCount,
  principals = [],
  statuses = [],
  priorities = [],
  showTimeRange = true,
  showQuickFilters = true,
  showPrincipalFilter = false,
  showStatusFilter = false,
  showPriorityFilter = false,
  responsiveFilterTitle,
  responsiveFilterDescription,
  responsiveFilterLayoutModeOverride,
  responsiveFilterCustomTrigger,
  responsiveFilterForceInline = false,
  responsiveFilterLazyRender = true,
  responsiveFilterWrapperClassName,
  responsiveFilterTriggerClassName,
  responsiveFilterSheetProps,
  responsiveFilterSheetContentProps,
  onResponsiveFilterLayoutModeChange,
  onResponsiveFilterOpenChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Feature flag check for responsive filters
  const isResponsiveFiltersEnabled = FEATURE_FLAGS.responsiveFilters.enabled
  const shouldUseResponsiveFilters = useResponsiveFilters && isResponsiveFiltersEnabled

  // Note: Removed duplicate selection/expansion state management.
  // Selection is now handled entirely by TanStack Table's built-in rowSelection state.
  // Expansion is handled by column definitions when needed.

  // Manual sort state for backward compatibility
  const [sortConfig, setSortConfig] = React.useState<{
    column: string | null
    direction: SortDirection
  }>({ column: null, direction: 'none' })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableColumnFilters ? setColumnFilters : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableColumnFilters ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnFilters: enableColumnFilters ? columnFilters : undefined,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  const getRowId = React.useCallback((row: TData) => {
    // Use provided rowKey function or fallback
    if (rowKey) {
      return rowKey(row)
    }
    // Try to get an ID from the row, fallback to index
    const rowWithId = row as any
    return rowWithId.id || rowWithId._id || JSON.stringify(row)
  }, [rowKey])

  // Note: Removed duplicate selection/expansion handlers.
  // Selection handlers are now provided by TanStack Table's built-in functionality.
  // Expansion handlers are implemented in column definitions when needed.

  // Sync TanStack Table selection with onSelectionChange callback
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id])
      onSelectionChange(selectedIds)
    }
  }, [rowSelection, onSelectionChange])

  // Manual sort handler for backward compatibility
  const handleSort = React.useCallback((column: string) => {
    let newDirection: SortDirection = 'asc'

    if (sortConfig.column === column) {
      if (sortConfig.direction === 'asc') {
        newDirection = 'desc'
      } else if (sortConfig.direction === 'desc') {
        newDirection = 'none'
      } else {
        newDirection = 'asc'
      }
    }

    setSortConfig({ column, direction: newDirection })
    onSort?.(column, newDirection)
  }, [sortConfig, onSort])

  // Get sort icon for manual sorting
  const getSortIcon = React.useCallback((column: string) => {
    if (sortConfig.column !== column || sortConfig.direction === 'none') {
      return <ChevronsUpDown className="size-4 opacity-50" />
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="size-4" />
      : <ChevronDown className="size-4" />
  }, [sortConfig])

  // Helper to check if emptyState is the new format vs legacy
  const isNewEmptyStateFormat = (state: unknown): state is EmptyStateProps => {
    if (!state || typeof state !== 'object') return false
    const stateObj = state as Record<string, unknown>
    return 'variant' in stateObj || 'icon' in stateObj || ('action' in stateObj && typeof stateObj.action === 'object' && stateObj.action !== null && 'label' in (stateObj.action as Record<string, unknown>))
  }

  // Note: Removed duplicate selection state helpers.
  // Selection state is now managed entirely by TanStack Table.

  // Generate entity-based empty state if not provided
  const getDefaultEmptyState = React.useCallback((): EmptyStateProps => {
    if (shouldUseResponsiveFilters && entityType && entityFilters?.search) {
      // Searching - show search-specific empty state
      return EmptyStatePresets.noSearchResults(entityFilters.search)
    }

    if (shouldUseResponsiveFilters && entityType && (
      entityFilters?.statusFilter ||
      entityFilters?.principalFilter ||
      entityFilters?.timeRange?.type !== 'all'
    )) {
      // Has active filters - show filtered results empty state
      return EmptyStatePresets.filtered()
    }

    // Default empty state based on entity type
    if (entityType) {
      const entityNames = {
        organizations: 'Organizations',
        contacts: 'Contacts',
        opportunities: 'Opportunities',
        products: 'Products',
        interactions: 'Interactions'
      }
      return EmptyStatePresets.noData(entityNames[entityType])
    }

    // Fallback
    return {
      title: 'No data available',
      description: emptyMessage || 'No results found.',
      variant: 'default'
    }
  }, [shouldUseResponsiveFilters, entityType, entityFilters, emptyMessage])

  if (loading) {
    return <DataTableSkeleton columns={columns} />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* ResponsiveFilterWrapper Integration - Only if feature flag is enabled */}
      {shouldUseResponsiveFilters && entityType && entityFilters && onEntityFiltersChange && (
        <ResponsiveFilterWrapper
          entityType={entityType}
          filters={entityFilters}
          onFiltersChange={onEntityFiltersChange}
          searchPlaceholder={searchPlaceholder}
          principals={principals}
          statuses={statuses}
          priorities={priorities}
          showTimeRange={showTimeRange}
          showQuickFilters={showQuickFilters}
          showPrincipalFilter={showPrincipalFilter}
          showStatusFilter={showStatusFilter}
          showPriorityFilter={showPriorityFilter}
          isLoading={loading}
          totalCount={totalCount}
          filteredCount={filteredCount}
          title={responsiveFilterTitle}
          description={responsiveFilterDescription}
          layoutModeOverride={responsiveFilterLayoutModeOverride}
          customTrigger={responsiveFilterCustomTrigger}
          forceInline={responsiveFilterForceInline}
          lazyRender={responsiveFilterLazyRender}
          wrapperClassName={responsiveFilterWrapperClassName}
          triggerClassName={responsiveFilterTriggerClassName}
          sheetProps={responsiveFilterSheetProps}
          sheetContentProps={responsiveFilterSheetContentProps}
          onLayoutModeChange={onResponsiveFilterLayoutModeChange}
          onOpenChange={onResponsiveFilterOpenChange}
        />
      )}

      {enableToolbar && !shouldUseResponsiveFilters && (
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
        />
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className={stickyHeader ? 'sticky top-0 z-10 bg-background' : undefined}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.flatMap((row, index) => {
                const mainRow = (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "transition-colors hover:bg-muted/50",
                      striped && index % 2 === 1 && 'bg-muted/50',
                      row.getIsSelected() && 'bg-primary/5 border-primary/20',
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )

                // Note: Removed manual expansion row rendering.
                // Expansion is now handled entirely by column definitions.
                // If expandedContent is needed, it should be implemented via column definitions.
                return [mainRow]
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 p-0 text-center"
                >
                  {emptyState ? (
                    isNewEmptyStateFormat(emptyState) ? (
                      // New EmptyStateProps format
                      <EmptyState
                        {...emptyState}
                        size="sm"
                        className="border-0 bg-transparent shadow-none"
                      />
                    ) : (
                      // Legacy format support
                      <div className="flex flex-col items-center justify-center space-y-2 py-8">
                        <div className="text-lg font-semibold text-muted-foreground">
                          {emptyState.title}
                        </div>
                        {emptyState.description && (
                          <div className="text-sm text-muted-foreground">
                            {emptyState.description}
                          </div>
                        )}
                        {emptyState.action && (
                          <div className="mt-4">
                            {emptyState.action}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <EmptyState
                      {...getDefaultEmptyState()}
                      size="sm"
                      className="border-0 bg-transparent shadow-none"
                    />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && (
        <DataTablePagination table={table} />
      )}
    </div>
  )
}

function DataTableSkeleton<TData, TValue>({
  columns,
}: {
  columns: ColumnDef<TData, TValue>[]
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((_, index) => (
                <TableHead key={index} className="h-12">
                  <Skeleton className="h-4 w-[120px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((_, cellIndex) => (
                  <TableCell key={cellIndex} className="py-3">
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex space-x-2">
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
        </div>
      </div>
    </div>
  )
}

// Note: DataTableContext has been simplified to remove duplicate functionality.
// Selection and expansion are now handled entirely by TanStack Table and column definitions.
// If you need to access table state, use TanStack Table's built-in hooks instead.

// Legacy context - kept for backward compatibility but functionality moved to column definitions
export const DataTableContext = React.createContext<{
  // Context now empty - functionality moved to TanStack Table built-ins
} | null>(null)

export function useDataTable() {
  const context = React.useContext(DataTableContext)
  // Context is now primarily for backward compatibility
  return context || {}
}

// Utility components from CRMTable
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'archived'
  children?: React.ReactNode
}> = ({ status, children }) => {
  const variants = {
    active: 'bg-green-100 text-green-800 border-green-300',
    inactive: 'bg-gray-100 text-gray-700 border-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    archived: 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border', variants[status])}>
      {children || status}
    </span>
  )
}

// Utility function for priority badges
export const PriorityBadge: React.FC<{
  priority: 'a-plus' | 'a' | 'b' | 'c' | 'd'
  children?: React.ReactNode
}> = ({ priority, children }) => {
  const variants = {
    'a-plus': 'bg-red-100 text-red-800 border-red-300',
    'a': 'bg-red-50 text-red-700 border-red-200',
    'b': 'bg-orange-100 text-orange-800 border-orange-300',
    'c': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'd': 'bg-gray-100 text-gray-700 border-gray-300'
  }

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border', variants[priority])}>
      {children || priority.toUpperCase()}
    </span>
  )
}

// Utility function for organization type badges
export const OrgTypeBadge: React.FC<{
  type: 'customer' | 'distributor' | 'principal' | 'supplier'
  children?: React.ReactNode
}> = ({ type, children }) => {
  const variants = {
    customer: 'bg-blue-100 text-blue-800 border-blue-300',
    distributor: 'bg-green-100 text-green-800 border-green-300',
    principal: 'bg-purple-100 text-purple-800 border-purple-300',
    supplier: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  }

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border', variants[type])}>
      {children || type}
    </span>
  )
}