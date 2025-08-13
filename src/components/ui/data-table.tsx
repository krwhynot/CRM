import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoreHorizontal, Pencil, Trash2, Plus, Search, ExternalLink } from 'lucide-react'

export interface DataTableColumn<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  sortable?: boolean
  searchable?: boolean
}

export interface DataTableAction<T> {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: (item: T) => void
  variant?: 'default' | 'destructive'
}

interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  actions?: DataTableAction<T>[]
  loading?: boolean
  searchPlaceholder?: string
  onAddNew?: () => void
  addNewLabel?: string
  emptyStateMessage?: string
  searchableFields?: (keyof T)[]
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  searchPlaceholder = 'Search...',
  onAddNew,
  addNewLabel = 'Add New',
  emptyStateMessage = 'No data found.',
  searchableFields = []
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = data.filter(item => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    // Search in specified searchable fields
    if (searchableFields.length > 0) {
      return searchableFields.some(field => {
        const value = item[field]
        if (value == null) return false
        return String(value).toLowerCase().includes(searchLower)
      })
    }
    
    // Search in columns marked as searchable
    const searchableColumns = columns.filter(col => col.searchable && col.accessorKey)
    if (searchableColumns.length > 0) {
      return searchableColumns.some(col => {
        const value = item[col.accessorKey!]
        if (value == null) return false
        return String(value).toLowerCase().includes(searchLower)
      })
    }
    
    // Fallback: search in all string fields
    return Object.values(item).some(value => {
      if (value == null) return false
      return String(value).toLowerCase().includes(searchLower)
    })
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              className="w-64"
              disabled
            />
          </div>
          {onAddNew && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              {addNewLabel}
            </Button>
          )}
        </div>
        <div className="border rounded-lg">
          <div className="p-8 text-center text-gray-500">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            {addNewLabel}
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>
                  {column.header}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm ? `No results match "${searchTerm}".` : emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={item.id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell ? (
                        column.cell(item)
                      ) : column.accessorKey ? (
                        String(item[column.accessorKey] || '')
                      ) : (
                        ''
                      )}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={action.variant === 'destructive' ? 'text-red-600' : ''}
                            >
                              <action.icon className="mr-2 h-4 w-4" />
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Predefined action configurations for common use cases
export const commonActions = {
  view: (onClick: (item: any) => void): DataTableAction<any> => ({
    label: 'View Details',
    icon: ExternalLink,
    onClick,
  }),
  edit: (onClick: (item: any) => void): DataTableAction<any> => ({
    label: 'Edit',
    icon: Pencil,
    onClick,
  }),
  delete: (onClick: (item: any) => void): DataTableAction<any> => ({
    label: 'Delete',
    icon: Trash2,
    onClick,
    variant: 'destructive' as const,
  }),
}