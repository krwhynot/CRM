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
  className,
}) => {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 bg-blue-50 border border-blue-200 rounded-lg',
        'animate-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-blue-900">
          {selectedCount} organization{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="size-8 touch-manipulation p-0 text-blue-700 hover:bg-blue-100 hover:text-blue-900 sm:size-6"
        >
          <X className="size-4 sm:size-3" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        {/* Quick selection buttons */}
        {selectedCount < totalCount && onSelectAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="h-11 touch-manipulation text-blue-700 hover:bg-blue-100 hover:text-blue-900 sm:h-8"
          >
            <CheckSquare className="mr-2 size-4" />
            <span className="hidden xs:inline">Select All ({totalCount})</span>
            <span className="xs:hidden">All</span>
          </Button>
        )}

        {selectedCount > 0 && onSelectNone && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectNone}
            className="h-11 touch-manipulation text-blue-700 hover:bg-blue-100 hover:text-blue-900 sm:h-8"
          >
            <Square className="mr-2 size-4" />
            <span className="hidden xs:inline">Select None</span>
            <span className="xs:hidden">None</span>
          </Button>
        )}

        <div className="mx-1 hidden h-6 w-px bg-blue-300 sm:block" />

        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="h-11 flex-1 touch-manipulation border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 sm:h-8 sm:flex-none"
        >
          <Trash2 className="mr-2 size-4" />
          <span className="hidden xs:inline">Delete Selected</span>
          <span className="xs:hidden">Delete</span>
        </Button>
      </div>
    </div>
  )
}
