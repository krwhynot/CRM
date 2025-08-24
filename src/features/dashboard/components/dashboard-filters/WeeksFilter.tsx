import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { FilterState } from "@/types/dashboard"

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
  onFilterChange
}) => {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select
        value={localFilters.weeks}
        onValueChange={(value) => onFilterChange('weeks', value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
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