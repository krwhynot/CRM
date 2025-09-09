import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import {
  useInteractions,
  useFollowUpInteractions,
} from '@/features/interactions/hooks/useInteractions'
import { calculateDateRange } from '@/lib/date-range-utils'
import type { UniversalFilterState } from '@/types/filters.types'
import type { FilterState } from '@/types/dashboard'
import type { InteractionWithRelations } from '@/types/interaction.types'

// KPI Data Types
export interface OpportunitiesMovedKPI {
  count: number
  stageChanges: number
  trend: {
    value: number
    label: string
  }
}

export interface InteractionsLoggedKPI {
  count: number
  thisWeek: number
  trend: {
    value: number
    label: string
  }
}

export interface ActionItemsDueKPI {
  count: number
  dueToday: number
}

export interface PipelineValueKPI {
  total: number
  opportunityCount: number
  trend: {
    value: number
    label: string
  }
}

export interface OverdueItemsKPI {
  count: number
  oldestDays: number
}

export interface CompletedTasksKPI {
  count: number
  completionRate: number
  trend: {
    value: number
    label: string
  }
}

export interface WeeklyKPIData {
  opportunitiesMoved: OpportunitiesMovedKPI
  interactionsLogged: InteractionsLoggedKPI
  actionItemsDue: ActionItemsDueKPI
  pipelineValue: PipelineValueKPI
  overdueItems: OverdueItemsKPI
  completedTasks: CompletedTasksKPI
  isLoading: boolean
  error: Error | null
}

// Type guard to check if filters is UniversalFilterState
const isUniversalFilterState = (filters: unknown): filters is UniversalFilterState => {
  return filters && typeof filters === 'object' && 'timeRange' in filters
}

// Hook implementation
export function useWeeklyKPIData(filters?: UniversalFilterState | FilterState): WeeklyKPIData {
  // Calculate date ranges for current and previous periods
  const dateRanges = useMemo(() => {
    // Convert FilterState to UniversalFilterState-like object
    const universalFilters = isUniversalFilterState(filters)
      ? filters
      : { ...filters, timeRange: 'this_week' as const }

    const timeRange = universalFilters?.timeRange || 'this_week'
    const current = calculateDateRange(
      timeRange,
      universalFilters?.dateFrom && universalFilters?.dateTo
        ? { start: universalFilters.dateFrom, end: universalFilters.dateTo }
        : undefined
    )

    // Calculate previous period for comparison
    const periodLength = current.end.getTime() - current.start.getTime()
    const previousEnd = new Date(current.start.getTime() - 1) // Day before current start
    const previousStart = new Date(previousEnd.getTime() - periodLength)

    return {
      current,
      previous: { start: previousStart, end: previousEnd },
    }
  }, [
    filters?.timeRange || 'this_week',
    isUniversalFilterState(filters) ? filters.dateFrom : undefined,
    isUniversalFilterState(filters) ? filters.dateTo : undefined,
  ])

  // Fetch opportunities with date filtering
  const {
    data: currentOpportunities = [],
    isLoading: oppLoading,
    error: oppError,
  } = useOpportunities({
    principal_organization_id: filters?.principal !== 'all' ? filters?.principal : undefined,
  })

  // Fetch interactions with date filtering
  const {
    data: currentInteractions = [],
    isLoading: intLoading,
    error: intError,
  } = useInteractions({
    interaction_date_from: dateRanges.current.start.toISOString().split('T')[0],
    interaction_date_to: dateRanges.current.end.toISOString().split('T')[0],
    organization_id: filters?.principal !== 'all' ? filters?.principal : undefined,
  })

  // Fetch follow-up interactions for action items and overdue tracking
  const {
    data: followUpInteractions = [],
    isLoading: followUpLoading,
    error: followUpError,
  } = useFollowUpInteractions()

  // Query for previous period interactions (for trend calculation)
  const { data: previousInteractions = [] } = useQuery({
    queryKey: ['interactions', 'previous-period', dateRanges.previous],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .gte('interaction_date', dateRanges.previous.start.toISOString().split('T')[0])
        .lte('interaction_date', dateRanges.previous.end.toISOString().split('T')[0])
        .is('deleted_at', null)

      if (error) throw error
      return data as InteractionWithRelations[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Query for stage changes (opportunities modified in date range)
  const { data: stageChanges = [] } = useQuery({
    queryKey: ['opportunities', 'stage-changes', dateRanges.current],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, stage, updated_at, estimated_value')
        .gte('updated_at', dateRanges.current.start.toISOString())
        .lte('updated_at', dateRanges.current.end.toISOString())
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Calculate KPIs
  const kpiData = useMemo((): Omit<WeeklyKPIData, 'isLoading' | 'error'> => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    // 1. Opportunities Moved KPI
    const opportunitiesMovedCount = stageChanges.length
    const previousOpportunitiesMovedCount = 0 // Would need similar query for previous period
    const opportunitiesMovedTrend =
      previousOpportunitiesMovedCount > 0
        ? ((opportunitiesMovedCount - previousOpportunitiesMovedCount) /
            previousOpportunitiesMovedCount) *
          100
        : 0

    // 2. Interactions Logged KPI
    const interactionsLoggedCount = currentInteractions.length
    const thisWeekInteractions = currentInteractions.filter((interaction) => {
      const interactionDate = new Date(interaction.interaction_date)
      return interactionDate >= startOfWeek && interactionDate <= endOfWeek
    }).length

    const interactionsLoggedTrend =
      previousInteractions.length > 0
        ? ((interactionsLoggedCount - previousInteractions.length) / previousInteractions.length) *
          100
        : 0

    // 3. Action Items Due KPI
    const actionItemsDueList = followUpInteractions.filter((interaction) => {
      if (!interaction.follow_up_date) return false
      const followUpDate = new Date(interaction.follow_up_date)
      return followUpDate <= endOfWeek && followUpDate >= startOfWeek
    })

    const dueToday = actionItemsDueList.filter((interaction) => {
      if (!interaction.follow_up_date) return false
      const followUpDate = new Date(interaction.follow_up_date)
      const todayStr = today.toDateString()
      return followUpDate.toDateString() === todayStr
    }).length

    // 4. Pipeline Value KPI
    const activeOpportunities = currentOpportunities.filter(
      (opp) => opp.stage !== 'Closed - Won' && opp.stage !== 'Closed - Lost'
    )
    const totalPipelineValue = activeOpportunities.reduce(
      (sum, opp) => sum + (opp.estimated_value || 0),
      0
    )

    // Simple trend calculation (would be more sophisticated in production)
    const pipelineValueTrend = 5.2 // Mock positive trend

    // 5. Overdue Items KPI
    const overdueItemsList = followUpInteractions.filter((interaction) => {
      if (!interaction.follow_up_date) return false
      const followUpDate = new Date(interaction.follow_up_date)
      return followUpDate < today
    })

    const oldestOverdue = overdueItemsList.reduce((oldest, interaction) => {
      if (!interaction.follow_up_date) return oldest
      const followUpDate = new Date(interaction.follow_up_date)
      const daysDiff = Math.floor(
        (today.getTime() - followUpDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      return Math.max(oldest, daysDiff)
    }, 0)

    // 6. Completed Tasks KPI
    // This would track interactions where follow_up_required changed from true to false
    // For now, we'll use a simple calculation based on current data
    const totalFollowUps = followUpInteractions.length + overdueItemsList.length + 10 // Mock completed
    const completedTasksCount = 10 // Mock completed tasks
    const completionRate = totalFollowUps > 0 ? (completedTasksCount / totalFollowUps) * 100 : 0
    const completedTasksTrend = 8.5 // Mock positive trend

    return {
      opportunitiesMoved: {
        count: opportunitiesMovedCount,
        stageChanges: opportunitiesMovedCount,
        trend: {
          value: opportunitiesMovedTrend,
          label: 'vs last period',
        },
      },
      interactionsLogged: {
        count: interactionsLoggedCount,
        thisWeek: thisWeekInteractions,
        trend: {
          value: interactionsLoggedTrend,
          label: 'vs last period',
        },
      },
      actionItemsDue: {
        count: actionItemsDueList.length,
        dueToday,
      },
      pipelineValue: {
        total: totalPipelineValue,
        opportunityCount: activeOpportunities.length,
        trend: {
          value: pipelineValueTrend,
          label: 'vs last period',
        },
      },
      overdueItems: {
        count: overdueItemsList.length,
        oldestDays: oldestOverdue,
      },
      completedTasks: {
        count: completedTasksCount,
        completionRate,
        trend: {
          value: completedTasksTrend,
          label: 'vs last period',
        },
      },
    }
  }, [
    currentOpportunities,
    currentInteractions,
    followUpInteractions,
    previousInteractions,
    stageChanges,
    dateRanges,
  ])

  const isLoading = oppLoading || intLoading || followUpLoading
  const error = oppError || intError || followUpError

  return {
    ...kpiData,
    isLoading,
    error,
  }
}
