import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronUp, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

// Helper function to generate responsive column classes
function getResponsiveColumnClasses(responsive?: TableHeaderConfig['responsive']): string {
  if (!responsive?.hidden) return ''
  
  const breakpointClasses = {
    sm: 'hidden sm:table-cell',    // Hidden on mobile, visible on sm+
    md: 'hidden md:table-cell',    // Hidden on mobile/tablet, visible on md+
    lg: 'hidden lg:table-cell',    // Hidden up to lg, visible on lg+
    xl: 'hidden xl:table-cell'     // Hidden up to xl, visible on xl+
  }
  
  return breakpointClasses[responsive.hidden] || ''
}

interface TableHeaderConfig {
  label: string
  className?: string
  sortable?: boolean
  sortField?: string
  isCheckbox?: boolean
  responsive?: {
    hidden?: 'sm' | 'md' | 'lg' | 'xl'  // Hide on this breakpoint and below
    priority?: 'essential' | 'important' | 'optional' // Column priority for responsive hiding
  }
}

interface SimpleTableProps<T> {
  data: T[]
  loading?: boolean
  renderRow: (item: T, isExpanded: boolean, onToggle: () => void, responsiveClasses?: string[]) => React.ReactNode
  emptyMessage?: string
  emptySubtext?: string
  emptyIcon?: React.ReactNode
  emptyAction?: {
    label: string
    onClick: () => void
  }
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
  emptyIcon,
  emptyAction,
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden table-scroll-mobile" role="status" aria-live="polite" aria-label="Loading table data">
        <div className="overflow-x-auto w-full">
          <Table role="table" aria-label="Loading data table">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                {headers.map((header, index) => {
                  const config = typeof header === 'string' ? { label: header, className: '' } : header
                  const responsiveClasses = getResponsiveColumnClasses(config.responsive)
                  return (
                    <TableHead key={index} className={cn("font-semibold text-gray-700 bg-gray-50 sticky top-0", responsiveClasses, config.className)}>
                      <Skeleton className="h-5 w-20" />
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Generate skeleton rows */}
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, cellIndex) => {
                    const config = typeof header === 'string' ? { label: header } : header
                    const responsiveClasses = getResponsiveColumnClasses(config.responsive)
                    return (
                      <TableCell key={cellIndex} className={cn("py-4", responsiveClasses)}>
                        <Skeleton className={cn(
                          "h-4",
                          cellIndex === 0 ? "w-32" : // First column (usually name/title) - wider
                          cellIndex === headers.length - 1 ? "w-16" : // Last column (usually actions) - narrower  
                          "w-24" // Middle columns - medium width
                        )} />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <span className="sr-only">Loading table data...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden table-scroll-mobile">
      <div className="overflow-x-auto w-full">
        <Table role="table" aria-label="Data table with selectable rows">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-gray-50 border-b-2 border-gray-200">
              {headers.map((header, index) => {
                const isString = typeof header === 'string'
                const config = isString ? { label: header, className: '' } : header
                const baseClassName = "font-semibold text-gray-700 bg-gray-50 sticky top-0"
                const responsiveClasses = getResponsiveColumnClasses(config.responsive)
                
                // Handle checkbox column
                if (config.isCheckbox && selectedCount !== undefined && totalCount !== undefined && onSelectAll) {
                  return (
                    <TableHead key={index} className={cn(baseClassName, responsiveClasses, config.className)}>
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
                        responsiveClasses,
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
                  <TableHead key={index} className={cn(baseClassName, responsiveClasses, config.className)}>
                    {config.label}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-16">
                  <div className="space-y-6 max-w-sm mx-auto">
                    {emptyIcon && (
                      <div className="flex justify-center text-gray-300">
                        {emptyIcon}
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="text-xl font-semibold text-gray-700">
                        {emptyMessage}
                      </div>
                      <div className="text-sm text-gray-500 leading-relaxed">
                        {emptySubtext}
                      </div>
                    </div>
                    {emptyAction && (
                      <div className="pt-2">
                        <Button 
                          onClick={emptyAction.onClick}
                          className="mobile-touch-target"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {emptyAction.label}
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                // Generate responsive classes for each column to pass to renderRow
                const responsiveClasses = headers.map(header => {
                  const config = typeof header === 'string' ? { label: header } : header
                  return getResponsiveColumnClasses(config.responsive)
                })
                return renderRow(item, false, () => {}, responsiveClasses)
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}