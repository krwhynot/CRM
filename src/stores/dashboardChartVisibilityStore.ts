/**
 * Dashboard Chart Visibility Store - Client-Side UI State Management
 *
 * Manages client-side UI state for dashboard chart visibility toggles.
 * Controls which charts are shown/hidden on the dashboard home page.
 *
 * ✅ ARCHITECTURE: Pure client-side state only
 * - Chart visibility toggle states
 * - User preferences for chart display
 * - localStorage persistence for user settings
 *
 * ❌ DOES NOT STORE: Chart data, server state, or computed chart values
 */

import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import type { BaseClientState } from '@/lib/state-type-safety'
import { validateClientState } from '@/lib/state-type-safety'

// Chart identifiers that match ChartsGrid component
export type ChartId = 
  | 'weekly-activity'
  | 'principal-performance'
  | 'team-performance'
  | 'opportunities'
  | 'activities'
  | 'pipeline-flow'
  | 'pipeline-funnel'

// Chart visibility state - maps chart ID to visible boolean
export type ChartVisibilityState = Record<ChartId, boolean>

// Chart metadata for display purposes
export interface ChartMetadata {
  id: ChartId
  title: string
  description: string
  category: 'activity' | 'performance' | 'pipeline'
}

export interface DashboardChartVisibilityUIState extends BaseClientState {
  // Chart visibility state
  visibleCharts: ChartVisibilityState
  
  // UI preferences
  preferences: BaseClientState['preferences'] & {
    showChartControls: boolean
    compactToggleMode: boolean
    defaultAllVisible: boolean
  }

  // Client-side actions
  actions: BaseClientState['actions'] & {
    // Chart visibility management
    setChartVisibility: (chartId: ChartId, visible: boolean) => void
    toggleChartVisibility: (chartId: ChartId) => void
    showAllCharts: () => void
    hideAllCharts: () => void
    resetToDefaults: () => void
    
    // Bulk operations
    setMultipleChartVisibility: (updates: Partial<ChartVisibilityState>) => void
    toggleChartsByCategory: (category: ChartMetadata['category'], visible: boolean) => void
    
    // Preferences
    updatePreferences: (preferences: Partial<DashboardChartVisibilityUIState['preferences']>) => void
    
    // Utility
    getVisibleChartIds: () => ChartId[]
    getHiddenChartIds: () => ChartId[]
    getVisibilityCount: () => { visible: number; total: number }
    
    // Base client state action
    reset: () => void
  }
}

// Chart metadata definitions
export const CHART_METADATA: Record<ChartId, ChartMetadata> = {
  'weekly-activity': {
    id: 'weekly-activity',
    title: 'Weekly Activity',
    description: 'Track weekly activity trends and patterns',
    category: 'activity'
  },
  'principal-performance': {
    id: 'principal-performance', 
    title: 'Principal Performance',
    description: 'Monitor performance metrics by principal',
    category: 'performance'
  },
  'team-performance': {
    id: 'team-performance',
    title: 'Team Performance', 
    description: 'Compare team member performance and rankings',
    category: 'performance'
  },
  'opportunities': {
    id: 'opportunities',
    title: 'Opportunities',
    description: 'Sales opportunities pipeline overview',
    category: 'pipeline'
  },
  'activities': {
    id: 'activities',
    title: 'Activities',
    description: 'Customer interaction and activity tracking',
    category: 'activity'
  },
  'pipeline-flow': {
    id: 'pipeline-flow',
    title: 'Pipeline Flow',
    description: 'Visualize opportunity flow through pipeline stages',
    category: 'pipeline'
  },
  'pipeline-funnel': {
    id: 'pipeline-funnel',
    title: 'Pipeline Funnel',
    description: 'Pipeline conversion rates and value funnel analysis',
    category: 'pipeline'
  }
}

// Default visibility - all charts visible by default
const defaultVisibility: ChartVisibilityState = {
  'weekly-activity': true,
  'principal-performance': true,
  'team-performance': true,
  'opportunities': true,
  'activities': true,
  'pipeline-flow': true,
  'pipeline-funnel': true
}

// Initial client-side state
const initialUIState: Omit<DashboardChartVisibilityUIState, 'actions'> = {
  visibleCharts: defaultVisibility,
  preferences: {
    showChartControls: true,
    compactToggleMode: false,
    defaultAllVisible: true,
    autoRefresh: true,
  },
}

export const useDashboardChartVisibilityStore = create<DashboardChartVisibilityUIState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        ...initialUIState,

        actions: {
          // Single chart visibility management
          setChartVisibility: (chartId: ChartId, visible: boolean) => {
            set((state) => ({
              visibleCharts: {
                ...state.visibleCharts,
                [chartId]: visible
              }
            }))
          },

          toggleChartVisibility: (chartId: ChartId) => {
            set((state) => ({
              visibleCharts: {
                ...state.visibleCharts,
                [chartId]: !state.visibleCharts[chartId]
              }
            }))
          },

          // Bulk visibility operations
          showAllCharts: () => {
            set({ visibleCharts: defaultVisibility })
          },

          hideAllCharts: () => {
            const allHidden = Object.keys(defaultVisibility).reduce((acc, key) => {
              acc[key as ChartId] = false
              return acc
            }, {} as ChartVisibilityState)
            set({ visibleCharts: allHidden })
          },

          resetToDefaults: () => {
            set({ visibleCharts: defaultVisibility })
          },

          setMultipleChartVisibility: (updates: Partial<ChartVisibilityState>) => {
            set((state) => ({
              visibleCharts: {
                ...state.visibleCharts,
                ...updates
              }
            }))
          },

          toggleChartsByCategory: (category: ChartMetadata['category'], visible: boolean) => {
            const categoryChartIds = Object.values(CHART_METADATA)
              .filter(chart => chart.category === category)
              .map(chart => chart.id)
            
            const updates = categoryChartIds.reduce((acc, chartId) => {
              acc[chartId] = visible
              return acc
            }, {} as Partial<ChartVisibilityState>)

            get().actions.setMultipleChartVisibility(updates)
          },

          // Preferences (with type safety validation)
          updatePreferences: (preferences: Partial<DashboardChartVisibilityUIState['preferences']>) => {
            if (process.env.NODE_ENV === 'development') {
              validateClientState(preferences)
            }
            set((state) => ({
              preferences: { ...state.preferences, ...preferences },
            }))
          },

          // Utility functions
          getVisibleChartIds: (): ChartId[] => {
            const state = get()
            return Object.entries(state.visibleCharts)
              .filter(([_, visible]) => visible)
              .map(([chartId, _]) => chartId as ChartId)
          },

          getHiddenChartIds: (): ChartId[] => {
            const state = get()
            return Object.entries(state.visibleCharts)
              .filter(([_, visible]) => !visible)
              .map(([chartId, _]) => chartId as ChartId)
          },

          getVisibilityCount: () => {
            const state = get()
            const visible = Object.values(state.visibleCharts).filter(Boolean).length
            const total = Object.keys(state.visibleCharts).length
            return { visible, total }
          },

          // Base client state action
          reset: () => {
            set(initialUIState)
            if (process.env.NODE_ENV === 'development') {
              validateClientState(initialUIState)
            }
          },
        },
      })),
      {
        name: 'dashboard-chart-visibility-ui-store',
        partialize: (state) => ({
          // Persist chart visibility settings and preferences
          visibleCharts: state.visibleCharts,
          preferences: state.preferences,
        }),
      }
    ),
    {
      name: 'dashboard-chart-visibility-ui-store',
    }
  )
)

// Export convenience hooks for different aspects of the store
export const useChartVisibility = () => {
  const store = useDashboardChartVisibilityStore()
  return {
    visibleCharts: store.visibleCharts,
    setChartVisibility: store.actions.setChartVisibility,
    toggleChartVisibility: store.actions.toggleChartVisibility,
    showAllCharts: store.actions.showAllCharts,
    hideAllCharts: store.actions.hideAllCharts,
    resetToDefaults: store.actions.resetToDefaults,
  }
}

export const useChartVisibilityBulk = () => {
  const store = useDashboardChartVisibilityStore()
  return {
    visibleCharts: store.visibleCharts,
    setMultipleChartVisibility: store.actions.setMultipleChartVisibility,
    toggleChartsByCategory: store.actions.toggleChartsByCategory,
    getVisibleChartIds: store.actions.getVisibleChartIds,
    getHiddenChartIds: store.actions.getHiddenChartIds,
    getVisibilityCount: store.actions.getVisibilityCount,
  }
}

export const useChartVisibilityPreferences = () => {
  const store = useDashboardChartVisibilityStore()
  return {
    preferences: store.preferences,
    updatePreferences: store.actions.updatePreferences,
  }
}

// Helper function to filter charts based on visibility
export const getVisibleCharts = <T extends { id: ChartId }>(
  charts: T[], 
  visibilityState: ChartVisibilityState
): T[] => {
  return charts.filter(chart => visibilityState[chart.id])
}