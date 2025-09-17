import { useState, useEffect } from 'react'
import { useDeviceType, useOrientation, useIsIPad } from './useMediaQuery'

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop'
export type Orientation = 'portrait' | 'landscape'
export type DeviceContext =
  | 'mobile'
  | 'tablet-portrait'
  | 'tablet-landscape'
  | 'desktop'
  | 'large-desktop'

export interface DeviceDetectionState {
  deviceType: DeviceType
  orientation: Orientation
  deviceContext: DeviceContext
  isIPad: boolean
  isTouch: boolean
  hasChanged: boolean
}

/**
 * Enhanced device detection hook with orientation and context awareness
 * Provides comprehensive device state for responsive design and auto-switching
 */
export function useDeviceDetection(): DeviceDetectionState {
  const deviceType = useDeviceType()
  const orientation = useOrientation()
  const isIPad = useIsIPad()

  const [isTouch, setIsTouch] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const [previousContext, setPreviousContext] = useState<DeviceContext>()

  // Determine device context (combination of type + orientation where relevant)
  const getDeviceContext = (type: DeviceType, orient: Orientation): DeviceContext => {
    switch (type) {
      case 'mobile':
        return 'mobile'
      case 'tablet':
        return orient === 'portrait' ? 'tablet-portrait' : 'tablet-landscape'
      case 'desktop':
        return 'desktop'
      case 'large-desktop':
        return 'large-desktop'
      default:
        return 'desktop'
    }
  }

  const deviceContext = getDeviceContext(deviceType, orientation)

  // Detect touch capability
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouch(hasTouch)
  }, [])

  // Track device context changes
  useEffect(() => {
    if (previousContext && previousContext !== deviceContext) {
      setHasChanged(true)
      // Reset the change flag after a short delay
      const timeout = setTimeout(() => setHasChanged(false), 500)
      return () => clearTimeout(timeout)
    } else {
      setHasChanged(false)
    }
    setPreviousContext(deviceContext)
  }, [deviceContext, previousContext])

  return {
    deviceType,
    orientation,
    deviceContext,
    isIPad,
    isTouch,
    hasChanged,
  }
}

/**
 * Device context utilities for responsive logic
 */
export const DeviceUtils = {
  /**
   * Check if device context requires compact mode by default
   */
  requiresCompactMode: (context: DeviceContext): boolean => {
    return context === 'mobile' || context === 'tablet-portrait'
  },

  /**
   * Check if device context supports spacious mode
   */
  supportsSpacious: (context: DeviceContext): boolean => {
    return context === 'large-desktop' || context === 'desktop'
  },

  /**
   * Get recommended default density for device context
   */
  getRecommendedDensity: (context: DeviceContext): 'compact' | 'comfortable' | 'spacious' => {
    switch (context) {
      case 'mobile':
      case 'tablet-portrait':
        return 'compact'
      case 'tablet-landscape':
      case 'desktop':
        return 'comfortable'
      case 'large-desktop':
        return 'spacious'
      default:
        return 'comfortable'
    }
  },

  /**
   * Get storage key for device-specific preferences
   */
  getStorageKey: (context: DeviceContext, key: string): string => {
    return `${key}-${context}`
  },
}

export default useDeviceDetection
