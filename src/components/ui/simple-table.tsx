import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TableHeaderConfig {
  label: string
  className?: string
  sortable?: boolean
  sortField?: string
  isCheckbox?: boolean
}

interface SimpleTableProps<T> {
  data: T[]
  loading?: boolean
  renderRow: (item: T, isExpanded: boolean, onToggle: () => void) => React.ReactNode
  emptyMessage?: string
  emptySubtext?: string
  headers: (string | TableHeaderConfig)[]
  colSpan?: number
  // Optional sorting support
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: string) => void
  // Optional selection support  
  selectedCount?: number
  totalCount?: number
  onSelectAll?: (checked: boolean) => void
}

export function SimpleTable<T extends { id: string }>({ 
  data = [], 
  loading = false,
  renderRow,
  emptyMessage = 'No items found',
  emptySubtext = 'Get started by adding your first item',
  headers,
  colSpan = 6,
  sortField,
  sortDirection,
  onSort,
  selectedCount,
  totalCount,
  onSelectAll
}: SimpleTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {headers.map((header, index) => {
                const isString = typeof header === 'string'
                const config = isString ? { label: header, className: '' } : header
                const baseClassName = "font-semibold text-gray-700"
                
                // Handle checkbox column
                if (config.isCheckbox && selectedCount !== undefined && totalCount !== undefined && onSelectAll) {
                  return (
                    <TableHead key={index} className={cn(baseClassName, config.className)}>
                      <Checkbox
                        checked={selectedCount === totalCount && totalCount > 0}
                        onCheckedChange={onSelectAll}
                        aria-label={config.label || "Select all"}
                      />
                    </TableHead>
                  )
                }
                
                // Handle sortable column
                if (config.sortable && config.sortField && onSort) {
                  const isSorted = sortField === config.sortField
                  return (
                    <TableHead 
                      key={index} 
                      className={cn(
                        baseClassName,
                        config.className,
                        "cursor-pointer hover:text-gray-900 transition-colors select-none"
                      )}
                      onClick={() => onSort(config.sortField!)}
                    >
                      <div className="flex items-center gap-1">
                        {config.label}
                        {isSorted && (
                          sortDirection === 'desc' ? 
                            <ChevronDown className="h-3 w-3" /> : 
                            <ChevronUp className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                  )
                }
                
                // Handle regular column
                return (
                  <TableHead key={index} className={cn(baseClassName, config.className)}>
                    {config.label}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-12">
                  <div className="space-y-3">
                    <div className="text-lg font-medium text-gray-500">
                      {emptyMessage}
                    </div>
                    <div className="text-sm text-gray-400">
                      {emptySubtext}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => renderRow(item, false, () => {}))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}