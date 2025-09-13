import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, X, CheckSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  fontWeight,
  semanticColors,
} from '@/styles/tokens'

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
        `flex flex-col sm:flex-row items-start sm:items-center justify-between ${semanticColors.background.info} border ${semanticColors.border.info} ${semanticRadius.lg}`,
        `${semanticSpacing.gap.md} sm:gap-0 ${semanticSpacing.cardContainer}`,
        'animate-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      <div className={`flex items-center ${semanticSpacing.gap.md}`}>
        <span
          className={`${semanticTypography.body} ${fontWeight.medium} ${semanticColors.text.info}`}
        >
          {selectedCount} organization{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className={`size-8 touch-manipulation ${semanticSpacing.zero} ${semanticColors.text.infoAccent} ${semanticColors.hover.infoSubtle} sm:size-6`}
        >
          <X className="size-4 sm:size-3" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>

      <div className={`flex w-full flex-wrap items-center ${semanticSpacing.gap.xs} sm:w-auto`}>
        {/* Quick selection buttons */}
        {selectedCount < totalCount && onSelectAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className={`h-11 touch-manipulation ${semanticColors.text.infoAccent} ${semanticColors.hover.infoSubtle} sm:h-8`}
          >
            <CheckSquare className={`${semanticSpacing.rightGap.xs} size-4`} />
            <span className="hidden xs:inline">Select All ({totalCount})</span>
            <span className="xs:hidden">All</span>
          </Button>
        )}

        {selectedCount > 0 && onSelectNone && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectNone}
            className={`h-11 touch-manipulation ${semanticColors.text.infoAccent} ${semanticColors.hover.infoSubtle} sm:h-8`}
          >
            <Square className={`${semanticSpacing.rightGap.xs} size-4`} />
            <span className="hidden xs:inline">Select None</span>
            <span className="xs:hidden">None</span>
          </Button>
        )}

        <div className={`mx-1 hidden h-6 w-px ${semanticColors.border.infoSubtle} sm:block`} />

        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className={`h-11 flex-1 touch-manipulation ${semanticColors.border.danger} ${semanticColors.text.danger} ${semanticColors.hover.dangerSubtle} sm:h-8 sm:flex-none`}
        >
          <Trash2 className={`${semanticSpacing.rightGap.xs} size-4`} />
          <span className="hidden xs:inline">Delete Selected</span>
          <span className="xs:hidden">Delete</span>
        </Button>
      </div>
    </div>
  )
}
