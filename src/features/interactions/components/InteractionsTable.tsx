import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useInteractionsTableState } from '../hooks/useInteractionsTableState'
import { InteractionTableHeader } from './table/InteractionTableHeader'
import { InteractionTableRow } from './table/InteractionTableRow'
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
  const { searchTerm, setSearchTerm, filteredInteractions, useNewStyle } = useInteractionsTableState(interactions)



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
      />

      <div className="border rounded-lg">
        <Table className={cn(useNewStyle && "compact-table")}>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={showOrganization ? 8 : 7} className="text-center py-8 text-gray-500">
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
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}