import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import type { FilterState } from '@/types/dashboard'

interface WeeksFilterProps {
  localFilters: FilterState
  weekOptions: Array<{ value: string; label: string }>
  isLoading: boolean
  onFilterChange: (key: keyof FilterState, value: string) => void
}

export const WeeksFilter: React.FC<WeeksFilterProps> = ({
  localFilters,
  weekOptions,
  isLoading,
  onFilterChange,
}) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Calendar className="size-4 shrink-0 text-muted-foreground" />
      <Select
        value={localFilters.weeks}
        onValueChange={(value) => onFilterChange('weeks', value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full sm:w-filter-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {weekOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
