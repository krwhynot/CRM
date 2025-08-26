import { SimpleTable } from '@/components/ui/simple-table'
import { Button } from '@/components/ui/button'
import { useOpportunitiesWithLastActivity } from '../hooks/useOpportunities'
import { useOpportunitiesSearch } from '../hooks/useOpportunitiesSearch'
import { useOpportunitiesSelection } from '../hooks/useOpportunitiesSelection'
import { useOpportunitiesSorting } from '../hooks/useOpportunitiesSorting'
import { useOpportunitiesFormatting } from '../hooks/useOpportunitiesFormatting'
import { useOpportunitiesDisplay } from '../hooks/useOpportunitiesDisplay'
import { OpportunitiesFilters } from './OpportunitiesFilters'
import { OpportunityRow } from './OpportunityRow'
import type { OpportunityFilters } from '@/types/entities'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'

interface OpportunitiesTableProps {
  filters?: OpportunityFilters
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
  onView?: (opportunity: OpportunityWithLastActivity) => void
  onAddNew?: () => void
  
  // Interaction handlers for inline details
  onAddInteraction?: (opportunityId: string) => void
  onEditInteraction?: (interaction: any) => void
  onDeleteInteraction?: (interaction: any) => void
  onInteractionItemClick?: (interaction: any) => void
}

export function OpportunitiesTable({ 
  filters,
  onEdit, 
  onDelete, 
  onView,
  onAddNew,
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
  onInteractionItemClick
}: OpportunitiesTableProps) {
  const { data: opportunities = [], isLoading } = useOpportunitiesWithLastActivity(filters)

  const { searchTerm, setSearchTerm, filteredOpportunities } = useOpportunitiesSearch(opportunities)
  
  const { selectedItems, handleSelectAll, handleSelectItem } = useOpportunitiesSelection()
  
  const { sortField, sortDirection, handleSort, sortedOpportunities } = useOpportunitiesSorting(filteredOpportunities)
  
  const { getStageConfig, formatCurrency, formatActivityType } = useOpportunitiesFormatting()
  
  const { toggleRowExpansion, isRowExpanded } = useOpportunitiesDisplay(
    sortedOpportunities.map(opp => opp.id)
  )

  // Configure headers with sorting and selection support
  const headers = [
    { 
      label: '', 
      className: 'w-[40px] px-6 py-3',
      isCheckbox: true
    },
    { 
      label: 'Company / Opportunity', 
      className: 'w-[35%] px-6 py-3 text-xs',
      sortable: true,
      sortField: 'company'
    },
    { 
      label: 'Stage', 
      className: 'w-[20%] px-6 py-3 text-xs',
      sortable: true,
      sortField: 'stage'
    },
    { 
      label: 'Value / Probability', 
      className: 'w-[15%] px-6 py-3 text-xs text-right',
      sortable: true,
      sortField: 'value'
    },
    { 
      label: 'Last Interaction', 
      className: 'w-[20%] px-6 py-3 text-xs text-right',
      sortable: true,
      sortField: 'last_activity'
    },
    { 
      label: 'Actions', 
      className: 'w-[10%] px-6 py-3 text-xs text-right'
    }
  ]

  const renderOpportunityRow = (opportunity: OpportunityWithLastActivity, isExpanded: boolean, onToggle: () => void) => (
    <OpportunityRow
      key={opportunity.id}
      opportunity={opportunity}
      isSelected={selectedItems.has(opportunity.id)}
      onSelect={handleSelectItem}
      onEdit={onEdit}
      onDelete={onDelete}
      getStageConfig={getStageConfig}
      formatCurrency={formatCurrency}
      formatActivityType={formatActivityType}
      isExpanded={isRowExpanded(opportunity.id)}
      onToggleExpansion={() => toggleRowExpansion(opportunity.id)}
      // For now, pass empty/loading states - will be improved later
      interactions={[]}
      interactionsLoading={false}
      onAddInteraction={() => onAddInteraction?.(opportunity.id)}
      onEditInteraction={onEditInteraction}
      onDeleteInteraction={onDeleteInteraction}
      onInteractionItemClick={onInteractionItemClick}
    />
  )

  const emptyMessage = searchTerm ? 'No opportunities match your search.' : 'No opportunities yet'
  const emptySubtext = searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first opportunity'

  return (
    <div className="space-y-4">
      {/* Filters */}
      <OpportunitiesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddNew={onAddNew}
        totalOpportunities={opportunities.length}
        filteredCount={sortedOpportunities.length}
      />

      {/* Table */}
      <SimpleTable
        data={sortedOpportunities}
        loading={isLoading}
        headers={headers}
        renderRow={renderOpportunityRow}
        emptyMessage={emptyMessage}
        emptySubtext={emptySubtext}
        colSpan={6}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        selectedCount={selectedItems.size}
        totalCount={sortedOpportunities.length}
        onSelectAll={(checked) => handleSelectAll(checked, sortedOpportunities)}
      />
    </div>
  )
}