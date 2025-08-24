import React from 'react'
import { X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { InteractionType } from '@/types/entities'
import type { ActivityFilters } from '@/hooks/useActivityFiltering'
import { ACTIVITY_CONFIG } from './ActivityConfig'

interface ActivityFiltersProps {
  filters: ActivityFilters
  setFilters: React.Dispatch<React.SetStateAction<ActivityFilters>>
  hasActiveFilters: boolean
  clearFilters: () => void
  showFilters: boolean
}

export const ActivityFiltersComponent: React.FC<ActivityFiltersProps> = ({
  filters,
  setFilters,
  hasActiveFilters,
  clearFilters,
  showFilters
}) => {
  if (!showFilters) return null

  return (
    <>
      {/* Filter Header */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500 mr-2">Filter</span>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as InteractionType | 'all' }))}
        >
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
        
        <Select
          value={filters.dateRange || 'all'}
          onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as ActivityFilters['dateRange'] }))}
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
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-8 px-2"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </>
  )
}