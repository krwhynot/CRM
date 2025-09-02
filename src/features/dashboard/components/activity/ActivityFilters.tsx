import React from 'react'
import { X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InteractionType } from '@/types/entities'
import type { ActivityFilters } from '../../hooks/useActivityFiltering'
import { ACTIVITY_CONFIG } from './ActivityConfig'

interface ActivityFiltersProps {
  filters?: ActivityFilters
  setFilters?: React.Dispatch<React.SetStateAction<ActivityFilters>>
  hasActiveFilters?: boolean
  clearFilters?: () => void
  showFilters: boolean
  // Alternative props for simpler usage
  selectedType?: string
  setSelectedType?: (type: string) => void
  selectedPriority?: string
  setSelectedPriority?: (priority: string) => void
}

export const ActivityFiltersComponent: React.FC<ActivityFiltersProps> = ({
  filters,
  setFilters,
  hasActiveFilters,
  clearFilters,
  showFilters,
  selectedType,
  setSelectedType,
  selectedPriority,
  setSelectedPriority,
}) => {
  if (!showFilters) return null

  // Use simple props if available, otherwise complex filters
  const currentType = selectedType || filters?.type || 'all'
  const currentPriority = selectedPriority || 'all'

  const handleTypeChange = (value: string) => {
    if (setSelectedType) {
      setSelectedType(value)
    } else if (setFilters) {
      setFilters((prev: ActivityFilters) => ({ ...prev, type: value as InteractionType | 'all' }))
    }
  }

  const handlePriorityChange = (value: string) => {
    if (setSelectedPriority) {
      setSelectedPriority(value)
    }
  }

  return (
    <>
      {/* Filter Header */}
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-gray-500" />
        <span className="mr-2 text-sm text-gray-500">Filter</span>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Select value={currentType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(ACTIVITY_CONFIG).map(([type, config]) => (
              <SelectItem key={type} value={type}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {setSelectedPriority && (
          <Select value={currentPriority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        )}

        {filters?.dateRange && (
          <Select
            value={filters.dateRange || 'all'}
            onValueChange={(value) =>
              setFilters &&
              setFilters((prev: ActivityFilters) => ({
                ...prev,
                dateRange: value as ActivityFilters['dateRange'],
              }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        )}

        {(hasActiveFilters || currentType !== 'all' || currentPriority !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (clearFilters) clearFilters()
              if (setSelectedType) setSelectedType('all')
              if (setSelectedPriority) setSelectedPriority('all')
            }}
            className="h-8 px-2 text-xs"
          >
            <X className="mr-1 size-3" />
            Clear
          </Button>
        )}
      </div>
    </>
  )
}
