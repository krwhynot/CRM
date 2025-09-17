import { Calendar, ChevronDown, Clock, Zap, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { format } from 'date-fns'

type TimeRangeType =
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom'

interface TimeRangeOption {
  value: TimeRangeType
  label: string
  shortLabel: string
}

interface TimeRangeFilterProps {
  value: TimeRangeType
  onChange: (value: TimeRangeType) => void
  dateFrom?: Date
  dateTo?: Date
  onDateFromChange?: (date: Date | undefined) => void
  onDateToChange?: (date: Date | undefined) => void
  isLoading?: boolean
  compact?: boolean
  showQuickPresets?: boolean
  showLabel?: boolean
  className?: string
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 'this_week', label: 'This Week', shortLabel: 'This Week' },
  { value: 'last_week', label: 'Last Week', shortLabel: 'Last Week' },
  { value: 'this_month', label: 'This Month', shortLabel: 'This Month' },
  { value: 'last_month', label: 'Last Month', shortLabel: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter', shortLabel: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter', shortLabel: 'Last Quarter' },
  { value: 'this_year', label: 'This Year', shortLabel: 'This Year' },
  { value: 'last_year', label: 'Last Year', shortLabel: 'Last Year' },
  { value: 'custom', label: 'Custom Range', shortLabel: 'Custom' },
]

// Quick preset categories for enhanced UI
const QUICK_PRESET_GROUPS = {
  popular: [
    { value: 'this_month' as TimeRangeType, label: 'This Month', icon: Calendar },
    { value: 'this_week' as TimeRangeType, label: 'This Week', icon: Clock },
    { value: 'this_quarter' as TimeRangeType, label: 'This Quarter', icon: Zap },
  ],
  recent: [
    { value: 'last_week' as TimeRangeType, label: 'Last Week', icon: RotateCcw },
    { value: 'last_month' as TimeRangeType, label: 'Last Month', icon: RotateCcw },
  ],
}

export function TimeRangeFilter({
  value,
  onChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  isLoading = false,
  compact = false,
  showQuickPresets = false,
  showLabel = true,
  className = '',
}: TimeRangeFilterProps) {
  const selectedOption = TIME_RANGE_OPTIONS.find((option) => option.value === value)
  const displayLabel = compact ? selectedOption?.shortLabel : selectedOption?.label

  const getDisplayText = () => {
    if (value === 'custom' && dateFrom && dateTo) {
      return `${format(dateFrom, 'MMM d')} - ${format(dateTo, 'MMM d')}`
    }
    return displayLabel || 'Select Range'
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {showLabel && !compact && (
        <label className="text-xs font-medium text-muted-foreground">Time Range</label>
      )}

      {/* Quick Preset Buttons */}
      {showQuickPresets && !compact && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Zap className="size-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Quick Presets</span>
          </div>

          {/* Popular Presets */}
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESET_GROUPS.popular.map((preset) => {
              const IconComponent = preset.icon
              const isActive = value === preset.value

              return (
                <TooltipProvider key={preset.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onChange(preset.value)}
                        className={`h-8 px-3 ${isActive ? 'ring-2 ring-primary' : ''}`}
                        disabled={isLoading}
                      >
                        <IconComponent className="mr-1 size-3" />
                        <span className="text-xs">{preset.label}</span>
                        {isActive && (
                          <Badge variant="secondary" className="ml-1 h-4 px-1">
                            Active
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set time range to {preset.label.toLowerCase()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>

          {/* Recent Presets */}
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESET_GROUPS.recent.map((preset) => {
              const IconComponent = preset.icon
              const isActive = value === preset.value

              return (
                <TooltipProvider key={preset.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => onChange(preset.value)}
                        className={`h-7 px-2 text-xs ${isActive ? 'ring-2 ring-primary' : ''}`}
                        disabled={isLoading}
                      >
                        <IconComponent className="mr-1 size-3" />
                        {preset.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set time range to {preset.label.toLowerCase()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>

          <Separator />
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={compact ? 'sm' : 'default'}
            className="justify-between"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="size-4" />
              <span>{getDisplayText()}</span>
            </div>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {TIME_RANGE_OPTIONS.map((option) => (
            <div key={option.value}>
              {option.value === 'custom' && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => onChange(option.value)}
                className={value === option.value ? 'bg-accent' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Date Range Picker */}
      {value === 'custom' && (
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                className={`justify-start text-left font-normal ${!dateFrom ? 'text-muted-foreground' : ''}`}
              >
                <Calendar className="mr-2 size-4" />
                {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateFrom}
                onSelect={onDateFromChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                className={`justify-start text-left font-normal ${!dateTo ? 'text-muted-foreground' : ''}`}
              >
                <Calendar className="mr-2 size-4" />
                {dateTo ? format(dateTo, 'MMM d, yyyy') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateTo}
                onSelect={onDateToChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}

export type { TimeRangeType, TimeRangeFilterProps }
