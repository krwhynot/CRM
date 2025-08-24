import React from 'react'
import { 
  Select, 
  SelectContent, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useEntitySelectSearch } from '@/hooks/useEntitySelectSearch'
import { useEntitySelectState } from '@/hooks/useEntitySelectState'
import { EntitySelectLoadingState } from './entity-select/EntitySelectLoadingState'
import { EntitySelectSearchBox } from './entity-select/EntitySelectSearchBox'
import { EntitySelectOptionsList } from './entity-select/EntitySelectOptionsList'

export interface EntityOption {
  id: string
  name: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface EntitySelectProps {
  options: EntityOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  searchable?: boolean
  disabled?: boolean
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function EntitySelect({
  options,
  value,
  onValueChange,
  placeholder,
  searchable = true,
  disabled = false,
  loading = false,
  emptyMessage = "No options found",
  className
}: EntitySelectProps) {
  const { searchTerm, setSearchTerm, filteredOptions, clearSearch } = useEntitySelectSearch(options)
  const { isOpen, setIsOpen, selectedOption, handleSelectOption } = useEntitySelectState(
    value,
    options,
    (optionId) => {
      onValueChange(optionId)
      clearSearch()
    }
  )

  if (loading) {
    return <EntitySelectLoadingState />
  }

  return (
    <div className={className}>
      <Select
        value={value}
        onValueChange={handleSelectOption}
        disabled={disabled}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="h-12 text-base px-4 focus:ring-2 focus:ring-blue-200">
          <SelectValue placeholder={placeholder}>
            {selectedOption?.name || placeholder}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="max-h-80 overflow-y-auto">
          {searchable && (
            <EntitySelectSearchBox
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearSearch={clearSearch}
            />
          )}
          
          <EntitySelectOptionsList
            options={filteredOptions}
            emptyMessage={emptyMessage}
          />
        </SelectContent>
      </Select>
    </div>
  )
}

// Re-export specialized entity selectors
export { OrganizationSelect, ContactSelect, ProductSelect } from './entity-select/specialized'
export type { OrganizationSelectProps, ContactSelectProps, ProductSelectProps } from './entity-select/specialized'