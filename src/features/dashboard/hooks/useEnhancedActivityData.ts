import { useQuery } from '@tanstack/react-query'
// Removed unused: import { supabase } from '@/lib/supabase'

export interface ActivityData {
  date: string
  interactions: number
  opportunities: number
  contacts: number
  revenue: number
}

export interface EnhancedActivityData {
  daily: ActivityData[]
  weekly: ActivityData[]
  monthly: ActivityData[]
  summary: {
    totalInteractions: number
    totalOpportunities: number
    totalContacts: number
    totalRevenue: number
    averageInteractionsPerDay: number
    conversionRate: number
  }
}

export function useEnhancedActivityData(timeRange: 'week' | 'month' | 'quarter' = 'month') {
  return useQuery({
    queryKey: ['enhanced-activity-data', timeRange],
    queryFn: async (): Promise<EnhancedActivityData> => {
      // This would typically call a Supabase function or aggregate data
      // For now, returning mock structure
      return {
        daily: [],
        weekly: [],
        monthly: [],
        summary: {
          totalInteractions: 0,
          totalOpportunities: 0,
          totalContacts: 0,
          totalRevenue: 0,
          averageInteractionsPerDay: 0,
          conversionRate: 0,
        },
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
