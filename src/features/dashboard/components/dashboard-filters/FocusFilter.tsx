import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FilterState } from '@/types/dashboard'

interface FocusFilterProps {
  localFilters: FilterState
  isLoading: boolean
  onFilterChange: (field: keyof FilterState, value: FilterState[keyof FilterState]) => void
}

const focusOptions = [
  { value: 'all_activity', label: 'All Activity' },
  { value: 'my_tasks', label: 'My Tasks' },
  { value: 'team_overview', label: 'Team Overview' },
  { value: 'high_priority', label: 'High Priority' },
  { value: 'overdue', label: 'Overdue' },
] as const

export function FocusFilter({ localFilters, isLoading, onFilterChange }: FocusFilterProps) {
  return (
    <div className="min-w-0 flex-1 sm:min-w-[140px] sm:flex-none">
      <Select
        value={localFilters.focus || 'all_activity'}
        onValueChange={(value) => onFilterChange('focus', value)}
        disabled={isLoading}
      >
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder="Focus" />
        </SelectTrigger>
        <SelectContent>
          {focusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}