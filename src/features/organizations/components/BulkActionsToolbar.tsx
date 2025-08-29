import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, X, CheckSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkActionsToolbarProps {
  selectedCount: number
  totalCount: number
  onBulkDelete: () => void
  onClearSelection: () => void
  onSelectAll?: () => void
  onSelectNone?: () => void
  className?: string
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  totalCount,
  onBulkDelete,
  onClearSelection,
  onSelectAll,
  onSelectNone,
  className
}) => {
  if (selectedCount === 0) return null

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 bg-blue-50 border border-blue-200 rounded-lg",
      "animate-in slide-in-from-top-2 duration-200",
      className
    )}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-blue-900">
          {selectedCount} organization{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8 w-8 sm:h-6 sm:w-6 p-0 text-blue-700 hover:text-blue-900 hover:bg-blue-100 touch-manipulation"
        >
          <X className="h-4 w-4 sm:h-3 sm:w-3" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {/* Quick selection buttons */}
        {selectedCount < totalCount && onSelectAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="text-blue-700 hover:bg-blue-100 hover:text-blue-900 h-11 sm:h-8 touch-manipulation"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Select All ({totalCount})</span>
            <span className="xs:hidden">All</span>
          </Button>
        )}
        
        {selectedCount > 0 && onSelectNone && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectNone}
            className="text-blue-700 hover:bg-blue-100 hover:text-blue-900 h-11 sm:h-8 touch-manipulation"
          >
            <Square className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Select None</span>
            <span className="xs:hidden">None</span>
          </Button>
        )}
        
        <div className="hidden sm:block w-px h-6 bg-blue-300 mx-1" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300 h-11 sm:h-8 touch-manipulation flex-1 sm:flex-none"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">Delete Selected</span>
          <span className="xs:hidden">Delete</span>
        </Button>
      </div>
    </div>
  )
}