'use client'

import * as React from 'react'
import type { Table } from '@tanstack/react-table'
import { X, SlidersHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EntityFilters, type EntityFilterState } from './filters/EntityFilters'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  filterableColumns?: Array<{
    id: string
    title: string
    options: Array<{
      label: string
      value: string
    }>
  }>
  actions?: React.ReactNode
  className?: string

  // Enhanced filtering with EntityFilters
  entityType?: 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'
  useEntityFilters?: boolean
  entityFilters?: EntityFilterState
  onEntityFiltersChange?: (filters: EntityFilterState) => void
  totalCount?: number
  filteredCount?: number
  principals?: Array<{ value: string; label: string }>
  statuses?: Array<{ value: string; label: string }>
  priorities?: Array<{ value: string; label: string }>
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = 'Search...',
  filterableColumns = [],
  actions,
  className,
  // Enhanced filtering props
  entityType = 'organizations',
  useEntityFilters = false,
  entityFilters = {},
  onEntityFiltersChange,
  totalCount,
  filteredCount,
  principals = [],
  statuses = [],
  priorities = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [searchValue, setSearchValue] = React.useState('')

  // Handle search for legacy mode
  React.useEffect(() => {
    if (searchKey && !useEntityFilters) {
      table.getColumn(searchKey)?.setFilterValue(searchValue)
    }
  }, [searchKey, searchValue, table, useEntityFilters])

  // Handle entity filters search
  React.useEffect(() => {
    if (useEntityFilters && searchKey && entityFilters.search !== undefined) {
      table.getColumn(searchKey)?.setFilterValue(entityFilters.search)
    }
  }, [searchKey, entityFilters.search, table, useEntityFilters])

  // Get active filters count
  const activeFiltersCount = table.getState().columnFilters.length

  // If using entity filters, render the enhanced filter system
  if (useEntityFilters && onEntityFiltersChange) {
    return (
      <div className={cn('space-y-4', className)}>
        <EntityFilters
          entityType={entityType}
          filters={entityFilters}
          onFiltersChange={onEntityFiltersChange}
          searchPlaceholder={searchPlaceholder}
          totalCount={totalCount}
          filteredCount={filteredCount}
          principals={principals}
          statuses={statuses}
          priorities={priorities}
          showPrincipalFilter={principals.length > 0}
          showStatusFilter={statuses.length > 0}
          showPriorityFilter={priorities.length > 0}
        />

        {/* Actions row */}
        {actions && (
          <div className="flex items-center justify-end space-x-2">
            {actions}

            {/* Column visibility toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
                  <SlidersHorizontal className="mr-2 size-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter(
                    (column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    )
  }

  // Legacy toolbar for backwards compatibility
  return (
    <div className={cn('flex items-center justify-between space-x-2', className)}>
      <div className="flex flex-1 items-center space-x-2">
        {/* Search input */}
        {searchKey && (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Column filters */}
        {filterableColumns.map((column) => {
          const tableColumn = table.getColumn(column.id)
          if (!tableColumn) return null

          const filterValue = tableColumn.getFilterValue() as string[]
          const hasActiveFilter = filterValue && filterValue.length > 0

          return (
            <DropdownMenu key={column.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('h-8 border-dashed', hasActiveFilter && 'border-solid bg-accent')}
                >
                  <SlidersHorizontal className="mr-2 size-4" />
                  {column.title}
                  {hasActiveFilter && (
                    <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                      {filterValue.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>{column.title}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {column.options.map((option) => {
                  const isSelected = filterValue?.includes(option.value)
                  return (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const currentFilter = filterValue || []
                        if (checked) {
                          tableColumn.setFilterValue([...currentFilter, option.value])
                        } else {
                          tableColumn.setFilterValue(
                            currentFilter.filter((val) => val !== option.value)
                          )
                        }
                      }}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  )
                })}
                {hasActiveFilter && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={false}
                      onCheckedChange={() => tableColumn.setFilterValue(undefined)}
                    >
                      Clear filter
                    </DropdownMenuCheckboxItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}

        {/* Clear all filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 size-4" />
          </Button>
        )}

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Custom actions */}
        {actions}

        {/* Column visibility toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
              <SlidersHorizontal className="mr-2 size-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Data table view options component for column visibility
export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
          <SlidersHorizontal className="mr-2 size-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Quick filter badge component
export function DataTableFilterBadge({
  title,
  value,
  onClear,
}: {
  title: string
  value: string
  onClear: () => void
}) {
  return (
    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
      {title}: {value}
      <Button
        variant="ghost"
        size="sm"
        className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
        onClick={onClear}
      >
        <X className="size-3" />
      </Button>
    </Badge>
  )
}

// Faceted filter component for multiple selection
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: {
  column?: ReturnType<Table<TData>['getColumn']>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <SlidersHorizontal className="mr-2 size-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <DropdownMenuSeparator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value)
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={(checked) => {
                if (checked) {
                  selectedValues.add(option.value)
                } else {
                  selectedValues.delete(option.value)
                }
                const filterValues = Array.from(selectedValues)
                column?.setFilterValue(filterValues.length ? filterValues : undefined)
              }}
            >
              {option.icon && <option.icon className="mr-2 size-4 text-muted-foreground" />}
              <span>{option.label}</span>
              {facets?.get(option.value) && (
                <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                  {facets.get(option.value)}
                </span>
              )}
            </DropdownMenuCheckboxItem>
          )
        })}
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={() => column?.setFilterValue(undefined)}
            >
              Clear filters
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
