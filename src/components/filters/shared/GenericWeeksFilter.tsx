import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import { semanticSpacing } from '@/styles/tokens'

export interface WeekOption {
  value: string
  label: string
}

export interface GenericWeeksFilterProps {
  value: string
  options: WeekOption[]
  isLoading?: boolean
  placeholder?: string
  className?: string
  onChange: (value: string) => void
}

export const GenericWeeksFilter: React.FC<GenericWeeksFilterProps> = ({
  value,
  options,
  isLoading = false,
  placeholder = 'Select Time Range',
  className = '',
  onChange,
}) => {
  return (
    <div className={`flex min-w-0 items-center ${semanticSpacing.gap.xs} ${className}`}>
      <Calendar className="size-4 shrink-0 text-muted-foreground" />
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full sm:w-filter-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Default week options that can be used across features
export const DEFAULT_WEEK_OPTIONS: WeekOption[] = [
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'last_2_weeks', label: 'Last 2 Weeks' },
  { value: 'last_4_weeks', label: 'Last 4 Weeks' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
]
