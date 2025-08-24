import React from 'react'
import { SelectItem } from "@/components/ui/select"
import type { EntityOption } from '@/components/forms/EntitySelect'

interface EntitySelectOptionsListProps {
  options: EntityOption[]
  emptyMessage: string
}

export const EntitySelectOptionsList: React.FC<EntitySelectOptionsListProps> = ({
  options,
  emptyMessage
}) => {
  if (options.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
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
          className="h-12 px-4 cursor-pointer hover:bg-gray-50 focus:bg-blue-50"
        >
          <div className="flex flex-col items-start w-full">
            <span className="font-medium text-base">{option.name}</span>
            {option.description && (
              <span className="text-xs text-gray-500 mt-1">
                {option.description}
              </span>
            )}
          </div>
        </SelectItem>
      ))}
    </div>
  )
}