'use client'

import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Column helper function for sortable headers
export function createSortableHeader(title: string) {
  return ({ column }: { column: any }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {title}
      <ArrowUpDown className="ml-2 size-4" />
    </Button>
  )
}

// Column helper for selection checkbox
export function createSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

// Column helper for expandable rows
export function createExpandColumn<TData>(
  expandedContent?: (row: TData) => React.ReactNode
): ColumnDef<TData> {
  return {
    id: 'expand',
    header: '',
    cell: ({ row }) => {
      if (!expandedContent) return null

      const [isExpanded, setIsExpanded] = React.useState(false)

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className="size-8 p-0"
        >
          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'} row</span>
        </Button>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 40,
  }
}

// Column helper for actions dropdown
export function createActionsColumn<TData>(
  actions: Array<{
    label: string
    onClick: (row: TData) => void
    icon?: React.ReactNode
    variant?: 'default' | 'destructive'
    shortcut?: string
  }>
): ColumnDef<TData> {
  return {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {actions.map((action, index) => (
            <React.Fragment key={action.label}>
              <DropdownMenuItem
                onClick={() => action.onClick(row.original)}
                className={cn(action.variant === 'destructive' && 'text-destructive')}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
                {action.shortcut && <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>}
              </DropdownMenuItem>
              {index < actions.length - 1 && <DropdownMenuSeparator />}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  }
}

// Column helper for status badges
export function createStatusColumn<TData>(
  accessor: keyof TData,
  title: string,
  statusConfig: Record<
    string,
    {
      label: string
      variant: 'default' | 'secondary' | 'destructive' | 'outline'
      className?: string
    }
  >
): ColumnDef<TData> {
  return {
    accessorKey: accessor as string,
    header: createSortableHeader(title),
    cell: ({ row }) => {
      const status = row.getValue(accessor as string) as string
      const config = statusConfig[status] || {
        label: status,
        variant: 'outline' as const,
      }

      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  }
}

// Column helper for date formatting
export function createDateColumn<TData>(
  accessor: keyof TData,
  title: string,
  options?: {
    format?: 'date' | 'datetime' | 'relative'
    className?: string
  }
): ColumnDef<TData> {
  return {
    accessorKey: accessor as string,
    header: createSortableHeader(title),
    cell: ({ row }) => {
      const date = row.getValue(accessor as string)
      if (!date) return null

      const dateObj = new Date(date as string)

      let formatted: string
      switch (options?.format || 'date') {
        case 'datetime':
          formatted = dateObj.toLocaleString()
          break
        case 'relative':
          formatted = formatRelativeTime(dateObj)
          break
        default:
          formatted = dateObj.toLocaleDateString()
      }

      return <div className={cn('font-medium', options?.className)}>{formatted}</div>
    },
    sortingFn: 'datetime',
  }
}

// Column helper for currency formatting
export function createCurrencyColumn<TData>(
  accessor: keyof TData,
  title: string,
  options?: {
    currency?: string
    locale?: string
    className?: string
  }
): ColumnDef<TData> {
  return {
    accessorKey: accessor as string,
    header: createSortableHeader(title),
    cell: ({ row }) => {
      const amount = row.getValue(accessor as string) as number
      if (amount === null || amount === undefined) return null

      const formatted = new Intl.NumberFormat(options?.locale || 'en-US', {
        style: 'currency',
        currency: options?.currency || 'USD',
      }).format(amount)

      return <div className={cn('font-medium', options?.className)}>{formatted}</div>
    },
    sortingFn: 'basic',
  }
}

// Column helper for text with truncation
export function createTextColumn<TData>(
  accessor: keyof TData,
  title: string,
  options?: {
    maxLength?: number
    showTooltip?: boolean
    className?: string
  }
): ColumnDef<TData> {
  return {
    accessorKey: accessor as string,
    header: createSortableHeader(title),
    cell: ({ row }) => {
      const text = row.getValue(accessor as string) as string
      if (!text) return null

      const maxLength = options?.maxLength || 50
      const truncated = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text

      return (
        <div
          className={cn('max-w-[200px]', options?.className)}
          title={options?.showTooltip && text.length > maxLength ? text : undefined}
        >
          {truncated}
        </div>
      )
    },
    filterFn: 'includesString',
  }
}

// Helper function for relative time formatting
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString()
}

// Export types for external use
export type { ColumnDef } from '@tanstack/react-table'
