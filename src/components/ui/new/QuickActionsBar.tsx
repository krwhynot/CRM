import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, MoreVertical } from 'lucide-react'

interface QuickActionsBarProps {
  onQuickAdd?: () => void
  selectedCount?: number
  onBulkAction?: (action: string) => void
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onQuickAdd,
  selectedCount = 0,
  onBulkAction,
}) => {
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
      <div className="flex items-center space-x-2">
        {selectedCount > 0 && (
          <>
            <Badge variant="secondary">{selectedCount} selected</Badge>
            {onBulkAction && (
              <>
                <Button variant="outline" size="sm" onClick={() => onBulkAction('delete')}>
                  <Trash2 className="mr-2 size-4" />
                  Delete Selected
                </Button>
                <Button variant="outline" size="sm" onClick={() => onBulkAction('more')}>
                  <MoreVertical className="mr-2 size-4" />
                  More Actions
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {onQuickAdd && (
        <Button size="sm" onClick={onQuickAdd}>
          <Plus className="mr-2 size-4" />
          Quick Add
        </Button>
      )}
    </div>
  )
}
