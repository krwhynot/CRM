import React, { useState, useMemo } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  ChevronRight, 
  ChevronDown as ExpandIcon 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc' | 'none'

export interface CRMTableColumn<T> {
  key: keyof T
  header: string
  sortable?: boolean
  hidden?: 'mobile' | 'tablet' | never
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface CRMTableProps<T> {
  data: T[]
  columns: CRMTableColumn<T>[]
  rowKey: (row: T) => string
  loading?: boolean
  selectable?: boolean
  expandable?: boolean
  expandedContent?: (row: T) => React.ReactNode
  onSelectionChange?: (selectedIds: string[]) => void
  onSort?: (column: keyof T, direction: SortDirection) => void
  className?: string
  emptyMessage?: string
  stickyHeader?: boolean
  striped?: boolean
}

export function CRMTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  selectable = false,
  expandable = false,
  expandedContent,
  onSelectionChange,
  onSort,
  className,
  emptyMessage = 'No data available',
  stickyHeader = false,
  striped = false
}: CRMTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{
    column: keyof T | null
    direction: SortDirection
  }>({ column: null, direction: 'none' })

  // Handle row selection
  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? new Set(data.map(rowKey)) : new Set<string>()
    setSelectedRows(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  // Handle row expansion
  const handleExpandRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Handle sorting
  const handleSort = (column: keyof T) => {
    const columnConfig = columns.find(col => col.key === column)
    if (!columnConfig?.sortable) return

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
  }

  // Get sort icon
  const getSortIcon = (column: keyof T) => {
    if (sortConfig.column !== column || sortConfig.direction === 'none') {
      return <ChevronsUpDown className="h-4 w-4 opacity-50" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  // Filter visible columns based on screen size
  const visibleColumns = useMemo(() => {
    return columns.filter(column => {
      if (column.hidden === 'mobile') {
        return false // Will be handled by responsive classes
      }
      return true
    })
  }, [columns])

  const allSelected = data.length > 0 && selectedRows.size === data.length
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && <TableHead className="w-12" />}
              {expandable && <TableHead className="w-12" />}
              {visibleColumns.map((column) => (
                <TableHead 
                  key={String(column.key)} 
                  style={{ width: column.width }}
                  className={cn(
                    column.hidden === 'mobile' && 'hidden sm:table-cell',
                    column.hidden === 'tablet' && 'hidden md:table-cell'
                  )}
                >
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {selectable && (
                  <TableCell>
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                )}
                {expandable && (
                  <TableCell>
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                )}
                {visibleColumns.map((column) => (
                  <TableCell 
                    key={String(column.key)}
                    className={cn(
                      column.hidden === 'mobile' && 'hidden sm:table-cell',
                      column.hidden === 'tablet' && 'hidden md:table-cell'
                    )}
                  >
                    <div className="h-4 bg-muted animate-pulse rounded" style={{ width: '60%' }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && <TableHead className="w-12" />}
              {expandable && <TableHead className="w-12" />}
              {visibleColumns.map((column) => (
                <TableHead 
                  key={String(column.key)}
                  style={{ width: column.width }}
                  className={cn(
                    column.hidden === 'mobile' && 'hidden sm:table-cell',
                    column.hidden === 'tablet' && 'hidden md:table-cell'
                  )}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      {getSortIcon(column.key)}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell 
                colSpan={
                  visibleColumns.length + 
                  (selectable ? 1 : 0) + 
                  (expandable ? 1 : 0)
                }
                className="text-center py-12 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader className={stickyHeader ? 'sticky top-0 bg-background z-10' : undefined}>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                  className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                />
              </TableHead>
            )}
            {expandable && <TableHead className="w-12" />}
            {visibleColumns.map((column) => (
              <TableHead 
                key={String(column.key)}
                style={{ width: column.width }}
                className={cn(
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.hidden === 'mobile' && 'hidden sm:table-cell',
                  column.hidden === 'tablet' && 'hidden md:table-cell'
                )}
              >
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.header}
                    {getSortIcon(column.key)}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.flatMap((row, index) => {
            const id = rowKey(row)
            const isSelected = selectedRows.has(id)
            const isExpanded = expandedRows.has(id)
            
            const mainRow = (
              <TableRow 
                key={id}
                className={cn(
                  striped && index % 2 === 1 && 'bg-muted/50',
                  isSelected && 'bg-primary/5 border-primary/20'
                )}
              >
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectRow(id, checked as boolean)}
                      aria-label={`Select row ${index + 1}`}
                    />
                  </TableCell>
                )}
                {expandable && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleExpandRow(id)}
                      disabled={!expandedContent}
                    >
                      {isExpanded ? (
                        <ExpandIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                )}
                {visibleColumns.map((column) => (
                  <TableCell 
                    key={String(column.key)}
                    className={cn(
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.hidden === 'mobile' && 'hidden sm:table-cell',
                      column.hidden === 'tablet' && 'hidden md:table-cell'
                    )}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            )

            const expandedRow = isExpanded && expandedContent ? (
              <TableRow key={`${id}-expanded`} className="border-t-0">
                <TableCell 
                  colSpan={
                    visibleColumns.length + 
                    (selectable ? 1 : 0) + 
                    (expandable ? 1 : 0)
                  }
                  className="p-4 bg-muted/25"
                >
                  {expandedContent(row)}
                </TableCell>
              </TableRow>
            ) : null

            return expandedRow ? [mainRow, expandedRow] : [mainRow]
          })}
        </TableBody>
      </Table>
    </div>
  )
}

// Utility function for creating status badge
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
    <Badge variant="outline" className={variants[status]}>
      {children || status}
    </Badge>
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
    <Badge variant="outline" className={variants[priority]}>
      {children || priority.toUpperCase()}
    </Badge>
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
    <Badge variant="outline" className={variants[type]}>
      {children || type}
    </Badge>
  )
}