import React from 'react'
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SortField, SortDirection } from '@/features/opportunities/hooks/useOpportunitiesSorting'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface SortableHeaderProps {
  field: SortField
  children: React.ReactNode
  className?: string
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  field, 
  children, 
  className, 
  sortField, 
  sortDirection, 
  onSort 
}) => (
  <TableHead 
    className={cn(
      "font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors select-none",
      className
    )}
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {children}
      {sortField === field && (
        sortDirection === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
      )}
    </div>
  </TableHead>
)

interface OpportunitiesTableHeaderProps {
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  selectedCount: number
  totalCount: number
  onSelectAll: (checked: boolean) => void
}

export const OpportunitiesTableHeader: React.FC<OpportunitiesTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
  selectedCount,
  totalCount,
  onSelectAll
}) => {
  return (
    <TableHeader className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
      <TableRow className="bg-gray-50/80">
        {/* Checkbox column - 40px fixed */}
        <TableHead className="w-[40px] px-6 py-3">
          <Checkbox
            checked={selectedCount === totalCount && totalCount > 0}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
          />
        </TableHead>
        
        {/* Company/Opportunity - 35% */}
        <SortableHeader 
          field="company" 
          className="w-[35%] px-6 py-3 text-xs"
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        >
          Company / Opportunity
        </SortableHeader>
        
        {/* Stage - 20% */}
        <SortableHeader 
          field="stage" 
          className="w-[20%] px-6 py-3 text-xs"
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        >
          Stage
        </SortableHeader>
        
        {/* Value/Probability - 15% */}
        <SortableHeader 
          field="value" 
          className="w-[15%] px-6 py-3 text-xs text-right"
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        >
          Value / Probability
        </SortableHeader>
        
        {/* Last Interaction - 20% - Default sort */}
        <SortableHeader 
          field="last_activity" 
          className="w-[20%] px-6 py-3 text-xs text-right"
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        >
          Last Interaction
        </SortableHeader>
        
        {/* Actions - 10% */}
        <TableHead className="w-[10%] px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}