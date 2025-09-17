import * as React from 'react'

export type DensityMode = 'compact' | 'comfortable' | 'spacious'

type DensityProviderState = {
  density: DensityMode
  setDensity: (density: DensityMode) => void
}

const initialState: DensityProviderState = {
  density: 'comfortable',
  setDensity: () => null,
}

export const DensityProviderContext = React.createContext<DensityProviderState>(initialState)

export const useDensity = () => {
  const context = React.useContext(DensityProviderContext)

  if (context === undefined) {
    throw new Error('useDensity must be used within a DensityProvider')
  }

  return context
}

/**
 * Utility function to get density class name
 */
export function getDensityClass(density: DensityMode): string {
  return `density-${density}`
}

/**
 * Utility function to get density-aware token reference
 */
export function getDensityToken(tokenName: string): string {
  return `var(--density-${tokenName})`
}

/**
 * Utility function to get density scale value
 */
export function getDensityScale(density: DensityMode): number {
  switch (density) {
    case 'compact':
      return 0.85
    case 'comfortable':
      return 1
    case 'spacious':
      return 1.15
    default:
      return 1
  }
}

/**
 * Utility function to get density multiplier for effects
 */
export function getDensityMultiplier(density: DensityMode): number {
  switch (density) {
    case 'compact':
      return 0.8
    case 'comfortable':
      return 1
    case 'spacious':
      return 1.2
    default:
      return 1
  }
}