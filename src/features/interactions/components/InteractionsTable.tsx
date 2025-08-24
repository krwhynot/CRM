import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useInteractionsTableState } from '../hooks/useInteractionsTableState'
import { InteractionTableHeader } from './table/InteractionTableHeader'
import { InteractionTableRow } from './table/InteractionTableRow'
import { isFeatureEnabled } from '@/lib/feature-flags'
import type { InteractionWithRelations } from '@/types/entities'

interface InteractionsTableProps {
  interactions: InteractionWithRelations[]
  loading?: boolean
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
  onAddNew?: () => void
  showOrganization?: boolean
}

export function InteractionsTable({ 
  interactions, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onAddNew,
  showOrganization = true
}: InteractionsTableProps) {
  const { 
    searchTerm, 
    setSearchTerm, 
    filteredInteractions, 
    useNewStyle,
    selectedCount,
    selectedInteractions,
    toggleSelection,
    toggleAllSelection,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected
  } = useInteractionsTableState(interactions)

  // Bulk action handlers
  const handleBulkAction = (action: string) => {
    if (selectedCount === 0) return

    switch (action) {
      case 'export':
        console.log('Exporting selected interactions:', selectedInteractions)
        // Future: Implement bulk export functionality
        break
      case 'assign':
        console.log('Assigning manager to selected interactions:', selectedInteractions)
        // Future: Implement bulk assign functionality
        break
      case 'tag':
        console.log('Adding tags to selected interactions:', selectedInteractions)
        // Future: Implement bulk tagging functionality
        break
      case 'archive':
        console.log('Archiving selected interactions:', selectedInteractions)
        // Future: Implement bulk archive functionality
        break
      default:
        console.log('Unknown bulk action:', action)
    }
    
    // Clear selection after action
    clearSelection()
  }



  if (loading) {
    return (
      <div className="space-y-4">
        <InteractionTableHeader
          searchTerm=""
          onSearchChange={() => {}}
          onAddNew={onAddNew}
          loading={true}
          useNewStyle={useNewStyle}
        />
        <div className="border rounded-lg">
          <div className="p-8 text-center text-gray-500">
            Loading interactions...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <InteractionTableHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddNew={onAddNew}
        loading={loading}
        useNewStyle={useNewStyle}
        selectedCount={selectedCount}
        onBulkAction={handleBulkAction}
      />

      <div className="border rounded-lg">
        <Table className={cn(useNewStyle && "compact-table")}>
          <TableHeader>
            <TableRow>
              {isFeatureEnabled('bulkOperations') && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleAllSelection}
                    aria-label="Select all interactions"
                    className={isSomeSelected ? "data-[state=checked]:bg-orange-500" : ""}
                  />
                </TableHead>
              )}
              <TableHead>Subject</TableHead>
              {showOrganization && <TableHead>Organization</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInteractions.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={
                    (isFeatureEnabled('bulkOperations') ? 1 : 0) + 
                    (showOrganization ? 8 : 7)
                  } 
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm ? 'No interactions match your search.' : 'No interactions found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredInteractions.map((interaction) => (
                <InteractionTableRow
                  key={interaction.id}
                  interaction={interaction}
                  showOrganization={showOrganization}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  isSelected={isSelected(interaction.id)}
                  onToggleSelection={() => toggleSelection(interaction.id)}
                  showSelection={isFeatureEnabled('bulkOperations')}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}