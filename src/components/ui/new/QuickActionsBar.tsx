import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, MoreVertical } from 'lucide-react'
import { semanticSpacing, semanticRadius } from '@/styles/tokens'

import { cn } from '@/lib/utils'
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
    <div
      className={cn(
        semanticRadius.default,
        'flex items-center justify-between border bg-muted/50',
        semanticSpacing.cardContainer
      )}
    >
      <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
        {selectedCount > 0 && (
          <>
            <Badge variant="secondary">{selectedCount} selected</Badge>
            {onBulkAction && (
              <>
                <Button variant="outline" size="sm" onClick={() => onBulkAction('delete')}>
                  <Trash2 className={`${semanticSpacing.rightGap.xs} size-4`} />
                  Delete Selected
                </Button>
                <Button variant="outline" size="sm" onClick={() => onBulkAction('more')}>
                  <MoreVertical className={`${semanticSpacing.rightGap.xs} size-4`} />
                  More Actions
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {onQuickAdd && (
        <Button size="sm" onClick={onQuickAdd}>
          <Plus className={`${semanticSpacing.rightGap.xs} size-4`} />
          Quick Add
        </Button>
      )}
    </div>
  )
}
