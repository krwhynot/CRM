import { create } from 'zustand'

interface DashboardLoadingState {
  isLoading: boolean
  loadingMessage: string | null
  setLoading: (isLoading: boolean, message?: string) => void
}

export const useDashboardLoading = create<DashboardLoadingState>((set) => ({
  isLoading: false,
  loadingMessage: null,
  setLoading: (isLoading, message = null) => set({ isLoading, loadingMessage: message }),
}))
