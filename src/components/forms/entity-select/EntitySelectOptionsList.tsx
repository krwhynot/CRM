import React from 'react'
import { SelectItem } from '@/components/ui/select'
import type { EntityOption } from '../EntitySelect'

interface EntitySelectOptionsListProps {
  options: EntityOption[]
  emptyMessage: string
}

export const EntitySelectOptionsList: React.FC<EntitySelectOptionsListProps> = ({
  options,
  emptyMessage,
}) => {
  if (options.length === 0) {
    return <div className="p-4 text-center text-sm text-gray-500">{emptyMessage}</div>
  }

  return (
    <div className="max-h-64 overflow-y-auto">
      {options.map((option) => (
        <SelectItem
          key={option.id}
          value={option.id}
          className="h-12 cursor-pointer px-4 hover:bg-gray-50 focus:bg-blue-50"
        >
          <div className="flex w-full flex-col items-start">
            <span className="text-base font-medium">{option.name}</span>
            {option.description && (
              <span className="mt-1 text-xs text-gray-500">{option.description}</span>
            )}
          </div>
        </SelectItem>
      ))}
    </div>
  )
}
