import React from 'react'
import { SelectItem } from '@/components/ui/select'
import type { EntityOption } from '../EntitySelect'

import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticColors } from '@/styles/tokens'
interface EntitySelectOptionsListProps {
  options: EntityOption[]
  emptyMessage: string
}

export const EntitySelectOptionsList: React.FC<EntitySelectOptionsListProps> = ({
  options,
  emptyMessage,
}) => {
  if (options.length === 0) {
    return (
      <div
        className={cn(
          semanticSpacing.cardContainer,
          semanticTypography.body,
          'text-center text-muted-foreground'
        )}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="max-h-64 overflow-y-auto">
      {options.map((option) => (
        <SelectItem
          key={option.id}
          value={option.id}
          className={cn(
            semanticSpacing.cardX,
            `h-12 cursor-pointer ${semanticColors.hoverStates.subtle} ${semanticColors.focusStates.info}`
          )}
        >
          <div className="flex w-full flex-col items-start">
            <span className={cn(semanticTypography.body, semanticTypography.label)}>
              {option.name}
            </span>
            {option.description && (
              <span className={cn(semanticTypography.caption, 'mt-1 text-muted-foreground')}>
                {option.description}
              </span>
            )}
          </div>
        </SelectItem>
      ))}
    </div>
  )
}
