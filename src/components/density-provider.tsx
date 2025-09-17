'use client'

import * as React from 'react'
import { DensityProviderContext, type DensityMode, getDensityClass } from '@/hooks/use-density'

// Re-export types for external use
export type { DensityMode } from '@/hooks/use-density'

type DensityProviderProps = {
  children: React.ReactNode
  defaultDensity?: DensityMode
  storageKey?: string
  enableSystem?: boolean
}

export function DensityProvider({
  children,
  defaultDensity = 'comfortable',
  storageKey = 'vite-ui-density',
  enableSystem = true,
  ...props
}: DensityProviderProps) {
  const [density, setDensityState] = React.useState<DensityMode>(() => {
    if (typeof window === 'undefined') return defaultDensity
    return (localStorage.getItem(storageKey) as DensityMode) || defaultDensity
  })

  React.useEffect(() => {
    const root = window.document.documentElement

    // Remove all density classes
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious')

    // Handle system density if enabled
    if (density === 'comfortable' && enableSystem) {
      // Check for system preferences
      const prefersCompact = window.matchMedia('(max-width: 768px)').matches
      const prefersSpacious = window.matchMedia('(min-width: 1280px) and (prefers-contrast: high)').matches

      if (prefersCompact) {
        root.classList.add('density-compact')
        return
      }

      if (prefersSpacious) {
        root.classList.add('density-spacious')
        return
      }
    }

    // Apply the selected density mode
    root.classList.add(getDensityClass(density))
  }, [density, enableSystem])

  const setDensity = React.useCallback((newDensity: DensityMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newDensity)
    }
    setDensityState(newDensity)
  }, [storageKey])

  const value = React.useMemo(() => ({
    density,
    setDensity,
  }), [density, setDensity])

  return (
    <DensityProviderContext.Provider {...props} value={value}>
      {children}
    </DensityProviderContext.Provider>
  )
}