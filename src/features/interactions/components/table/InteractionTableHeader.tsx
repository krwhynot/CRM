import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuickActionsBar } from '@/components/ui/new/QuickActionsBar'
import { Plus, Search } from 'lucide-react'

interface InteractionTableHeaderProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddNew?: () => void
  loading?: boolean
  useNewStyle: boolean
}

export const InteractionTableHeader: React.FC<InteractionTableHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddNew,
  loading = false,
  useNewStyle
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search interactions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64"
            disabled={loading}
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Interaction
          </Button>
        )}
      </div>

      {/* Quick Actions Bar - only show with new styling */}
      {useNewStyle && (
        <QuickActionsBar
          onQuickAdd={onAddNew}
          selectedCount={0} // TODO: Implement selection state
          onBulkAction={(action: string) => {
            console.log('Bulk action selected:', action);
            // TODO: Implement bulk operations
          }}
        />
      )}
    </div>
  )
}