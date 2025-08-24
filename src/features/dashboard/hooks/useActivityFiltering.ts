import { useState, useMemo } from 'react'
import type { ActivityItem } from './useEnhancedActivityData'

export interface ActivityFilters {
  type?: string
  priority?: string
  dateRange?: string
}

export interface UseActivityFilteringReturn {
  selectedType: string
  selectedPriority: string
  setSelectedType: (type: string) => void
  setSelectedPriority: (priority: string) => void
  filteredItems: ActivityItem[]
}

export const useActivityFiltering = (
  activityItems: ActivityItem[], 
  limit: number
): UseActivityFilteringReturn => {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  // Filter activity items
  const filteredItems = useMemo(() => {
    let filtered = activityItems

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === selectedPriority)
    }

    return filtered.slice(0, limit)
  }, [activityItems, selectedType, selectedPriority, limit])

  return {
    selectedType,
    selectedPriority,
    setSelectedType,
    setSelectedPriority,
    filteredItems
  }
}