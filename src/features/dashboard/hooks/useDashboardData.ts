import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface DashboardData {
  totalOrganizations: number
  totalContacts: number
  totalOpportunities: number
  totalInteractions: number
  recentActivity: any[]
  performanceMetrics: {
    conversionRate: number
    averageDealSize: number
    totalRevenue: number
    activePipeline: number
  }
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      // Fetch aggregate data from multiple tables
      const [orgs, contacts, opportunities, interactions] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('opportunities').select('*'),
        supabase
          .from('interactions')
          .select('*')
          .order('interaction_date', { ascending: false })
          .limit(10),
      ])

      const opportunityData = opportunities.data || []
      const wonOpportunities = opportunityData.filter((o) => o.stage === 'Closed - Won')
      const totalRevenue = wonOpportunities.reduce((sum, o) => sum + (o.value || 0), 0)
      const activePipeline = opportunityData
        .filter((o) => !['Closed - Won', 'Closed - Lost'].includes(o.stage))
        .reduce((sum, o) => sum + (o.value || 0), 0)

      return {
        totalOrganizations: orgs.count || 0,
        totalContacts: contacts.count || 0,
        totalOpportunities: opportunities.data?.length || 0,
        totalInteractions: interactions.data?.length || 0,
        recentActivity: interactions.data || [],
        performanceMetrics: {
          conversionRate:
            opportunityData.length > 0
              ? (wonOpportunities.length / opportunityData.length) * 100
              : 0,
          averageDealSize: wonOpportunities.length > 0 ? totalRevenue / wonOpportunities.length : 0,
          totalRevenue,
          activePipeline,
        },
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}
