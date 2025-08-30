import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRecentActivity } from '@/features/interactions/hooks/useInteractions'
import type { InteractionWithRelations } from '@/types/interaction.types'

interface UseActivityRealTimeProps {
  limit: number
  enableRealTime: boolean
}

interface UseActivityRealTimeReturn {
  activities: InteractionWithRelations[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<{ data: InteractionWithRelations[] | undefined }>
  isRefreshing: boolean
  handleRefresh: () => Promise<void>
}

export const useActivityRealTime = ({
  limit,
  enableRealTime
}: UseActivityRealTimeProps): UseActivityRealTimeReturn => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Fetch recent activities
  const { data: activities, isLoading, error, refetch } = useRecentActivity(limit)
  
  // Real-time subscription for new interactions
  useEffect(() => {
    if (!enableRealTime) return
    
    const channel = supabase
      .channel('activity-feed-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'interactions',
          filter: 'deleted_at=is.null'
        }, 
        () => {
          // Refetch data when interactions are updated
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enableRealTime, refetch])
  
  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }
  
  return {
    activities,
    isLoading,
    error,
    refetch,
    isRefreshing,
    handleRefresh
  }
}