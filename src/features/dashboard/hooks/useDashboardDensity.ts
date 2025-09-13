import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DensityLevel = 'comfortable' | 'compact' | 'spacious'

interface DashboardDensityState {
  density: DensityLevel
  setDensity: (density: DensityLevel) => void
  getDensityClass: (base: string) => string
}

export const useDashboardDensity = create<DashboardDensityState>()(
  persist(
    (set, get) => ({
      density: 'comfortable',
      setDensity: (density) => set({ density }),
      getDensityClass: (base) => {
        const { density } = get()
        const densityMap = {
          comfortable: base,
          compact: `${base}-compact`,
          spacious: `${base}-spacious`,
        }
        return densityMap[density] || base
      },
    }),
    {
      name: 'dashboard-density',
    }
  )
)
