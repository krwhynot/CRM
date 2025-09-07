import { Focus, Users, User, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { FocusType, FocusOption } from '@/types/filters.types'

interface FocusFilterProps {
  value: FocusType
  onChange: (value: FocusType) => void
  isLoading?: boolean
  compact?: boolean
  showBadges?: boolean
  taskCounts?: Partial<Record<FocusType, number>>
}

const FOCUS_OPTIONS: FocusOption[] = [
  { 
    value: 'all_activity', 
    label: 'All Activity', 
    shortLabel: 'All',
    description: 'Show all activities and tasks',
    icon: 'Focus'
  },
  { 
    value: 'my_tasks', 
    label: 'My Tasks', 
    shortLabel: 'Mine',
    description: 'Tasks assigned to me',
    icon: 'User'
  },
  { 
    value: 'team_activity', 
    label: 'Team Activity', 
    shortLabel: 'Team',
    description: 'Team activities and collaborations',
    icon: 'Users'
  },
  { 
    value: 'high_priority', 
    label: 'High Priority', 
    shortLabel: 'High Priority',
    description: 'High priority items requiring attention',
    icon: 'AlertTriangle'
  },
  { 
    value: 'overdue', 
    label: 'Overdue', 
    shortLabel: 'Overdue',
    description: 'Overdue tasks and activities',
    icon: 'Clock'
  },
  { 
    value: 'pending_approval', 
    label: 'Pending Approval', 
    shortLabel: 'Pending',
    description: 'Items waiting for approval',
    icon: 'CheckCircle'
  },
]

const getIcon = (iconName: string, className: string = "size-4") => {
  const icons = {
    Focus: <Focus className={className} />,
    User: <User className={className} />,
    Users: <Users className={className} />,
    AlertTriangle: <AlertTriangle className={className} />,
    Clock: <Clock className={className} />,
    CheckCircle: <CheckCircle className={className} />,
  }
  return icons[iconName as keyof typeof icons] || <Focus className={className} />
}

export function FocusFilter({
  value,
  onChange,
  isLoading = false,
  compact = false,
  showBadges = false,
  taskCounts = {}
}: FocusFilterProps) {
  const selectedOption = FOCUS_OPTIONS.find(option => option.value === value)
  const displayLabel = compact ? selectedOption?.shortLabel : selectedOption?.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className="justify-between"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            {selectedOption && getIcon(selectedOption.icon || 'Focus')}
            <span>{displayLabel || 'Focus'}</span>
            {showBadges && taskCounts[value] && (
              <Badge variant="secondary" className="ml-1">
                {taskCounts[value]}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {FOCUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-between ${
              value === option.value ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              {getIcon(option.icon || 'Focus')}
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>
            </div>
            {showBadges && taskCounts[option.value] && (
              <Badge variant="outline" className="ml-2">
                {taskCounts[option.value]}
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}