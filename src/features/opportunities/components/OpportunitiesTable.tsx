import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useOpportunitiesWithLastActivity } from '../hooks/useOpportunities'
import { useOpportunitiesSearch } from '../hooks/useOpportunitiesSearch'
import { useOpportunitiesSelection } from '../hooks/useOpportunitiesSelection'
import { useOpportunitiesSorting } from '../hooks/useOpportunitiesSorting'
import { useOpportunitiesFormatting } from '../hooks/useOpportunitiesFormatting'
import { OpportunitiesTableHeader } from './OpportunitiesTableHeader'
import { OpportunitiesTableRow } from './OpportunitiesTableRow'
import type { OpportunityFilters } from '@/types/entities'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface OpportunitiesTableProps {
  filters?: OpportunityFilters
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
  onView?: (opportunity: OpportunityWithLastActivity) => void
  onAddNew?: () => void
}

export function OpportunitiesTable({ 
  filters,
  onEdit, 
  onDelete, 
  onView,
  onAddNew
}: OpportunitiesTableProps) {
  const { data: opportunities = [], isLoading } = useOpportunitiesWithLastActivity(filters)

  const { searchTerm, setSearchTerm, filteredOpportunities } = useOpportunitiesSearch(opportunities)
  
  const { selectedItems, handleSelectAll, handleSelectItem } = useOpportunitiesSelection()
  
  const { sortField, sortDirection, handleSort, sortedOpportunities } = useOpportunitiesSorting(filteredOpportunities)
  
  const { getStageConfig, formatCurrency, formatActivityType } = useOpportunitiesFormatting()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search opportunities..."
              className="w-64"
              disabled
            />
          </div>
          {onAddNew && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          )}
        </div>
        
        {/* Loading state */}
        <div className="border rounded-lg bg-white shadow-sm">
          <div className="p-8 text-center text-gray-500">
            Loading opportunities...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Opportunity
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <OpportunitiesTableHeader
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              selectedCount={selectedItems.size}
              totalCount={sortedOpportunities.length}
              onSelectAll={(checked) => handleSelectAll(checked, sortedOpportunities)}
            />
            
            <TableBody>
              {sortedOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No opportunities match your search.' : (
                      <div className="space-y-2">
                        <div>No opportunities yet</div>
                        {onAddNew && (
                          <Button variant="outline" onClick={onAddNew} className="mt-2">
                            Add First Opportunity
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                sortedOpportunities.map((opportunity) => (
                  <OpportunitiesTableRow
                    key={opportunity.id}
                    opportunity={opportunity}
                    isSelected={selectedItems.has(opportunity.id)}
                    onSelect={handleSelectItem}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    getStageConfig={getStageConfig}
                    formatCurrency={formatCurrency}
                    formatActivityType={formatActivityType}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}