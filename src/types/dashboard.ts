export interface Principal {
  id: string
  name: string
  company: string
}

export interface Product {
  id: string
  name: string
  category: string
  principalId: string
}

export interface Interaction {
  id: string
  type: string
  date: Date
  description: string
  opportunityId: string
}

export interface Opportunity {
  id: string
  principalId: string
  productId: string
  date: Date
  title: string
  value: number
  status: 'open' | 'closed' | 'pending'
  interactions: Interaction[]
}

export interface DashboardProps {
  opportunities: Opportunity[]
  principals: Principal[]
  products: Product[]
}

export interface FilterState {
  principal: string
  product: string
  weeks: string
  // Phase 5: Weekly-specific enhancements
  focus?: 'all_activity' | 'my_tasks' | 'team_overview' | 'high_priority' | 'overdue'
  quickView?: 'action_items_due' | 'pipeline_movers' | 'recent_wins' | 'needs_attention' | 'none'
}

export interface DashboardChartDataPoint {
  week: string
  count: number
  weekStart: Date
}

export interface ActivityItem {
  id: string
  type: 'opportunity' | 'interaction'
  title: string
  date: Date
  principalName: string
  productName?: string
}

// Hook return types for better TypeScript support
export interface UseDashboardFiltersReturn {
  filters: FilterState
  debouncedFilters: FilterState
  isLoading: boolean
  handleFiltersChange: (newFilters: FilterState) => void
  // Phase 5: Weekly-specific enhancements
  applyQuickView: (preset: FilterState['quickView']) => void
  computed: {
    hasActiveFilters: boolean
    hasActiveFocus: boolean
    hasActiveQuickView: boolean
    isMyTasksView: boolean
    isTeamView: boolean
    filterSummary: string
  }
}

export interface UseDashboardDataReturn {
  // Source data
  opportunities: Opportunity[]
  principals: Principal[]
  products: Product[]

  // Processed data
  filteredOpportunities: Opportunity[]
  opportunityChartData: DashboardChartDataPoint[]
  interactionChartData: DashboardChartDataPoint[]
  activityItems: ActivityItem[]

  // Phase 5: New chart data
  weeklyActivityData: DashboardChartDataPoint[]
  principalPerformanceData: Array<{
    name: string
    interactions: number
    performance: 'high' | 'medium' | 'low'
  }>
  teamPerformanceData: Array<{
    name: string
    interactions: number
    opportunities: number
    movements: number
    rank: number
    isCurrentUser?: boolean
  }>
  
  // Pipeline chart data
  pipelineFlowData?: PipelineFlowData
  pipelineValueFunnelData?: PipelineValueFunnelData
}

// Pipeline-specific types
export interface PipelineStageFlow {
  from: string
  to: string
  count: number
  value: number
  percentage: number
}

export interface PipelineFlowData {
  stages: string[]
  flows: PipelineStageFlow[]
  totalMovements: number
  timeRange: string
}

export interface FunnelStage {
  name: string
  count: number
  value: number
  conversionRate: number
  dropOffRate: number
  color: string
}

export interface PipelineValueFunnelData {
  stages: FunnelStage[]
  totalValue: number
  totalOpportunities: number
  overallConversion: number
}

export interface UseDashboardLoadingReturn {
  isInitialLoad: boolean
  showEmptyState: boolean
}
