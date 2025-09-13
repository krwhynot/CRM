import { create } from 'zustand'

export interface DashboardFilters {
  timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'
  principal: string | null
  segment: string | null
  priority: string | null
}

interface DashboardFiltersState {
  filters: DashboardFilters
  setFilters: (filters: Partial<DashboardFilters>) => void
  resetFilters: () => void
}

const defaultFilters: DashboardFilters = {
  timeRange: 'month',
  principal: null,
  segment: null,
  priority: null,
}

export const useDashboardFilters = create<DashboardFiltersState>((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}))
