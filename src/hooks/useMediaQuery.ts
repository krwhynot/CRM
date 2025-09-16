import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

/**
 * Optimized hook to track media query changes with proper cleanup
 * @param query - Media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const mediaQueryRef = useRef<MediaQueryList | null>(null)
  const listenerRef = useRef<((event: MediaQueryListEvent) => void) | null>(null)

  // Memoize the query to prevent unnecessary re-renders
  const memoizedQuery = useMemo(() => query, [query])

  // Stable listener function
  const listener = useCallback((event: MediaQueryListEvent) => {
    setMatches(event.matches)
  }, [])

  useEffect(() => {
    // Clean up previous listener if query changed
    if (mediaQueryRef.current && listenerRef.current) {
      if (mediaQueryRef.current.removeEventListener) {
        mediaQueryRef.current.removeEventListener('change', listenerRef.current)
      } else {
        // Fallback for older browsers
        mediaQueryRef.current.removeListener(listenerRef.current)
      }
    }

    const media = window.matchMedia(memoizedQuery)
    mediaQueryRef.current = media
    listenerRef.current = listener

    // Set initial value
    setMatches(media.matches)

    // Add listener with fallback for older browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }

    // Cleanup function
    return () => {
      if (mediaQueryRef.current && listenerRef.current) {
        if (mediaQueryRef.current.removeEventListener) {
          mediaQueryRef.current.removeEventListener('change', listenerRef.current)
        } else {
          // Fallback for older browsers
          mediaQueryRef.current.removeListener(listenerRef.current)
        }
      }
      mediaQueryRef.current = null
      listenerRef.current = null
    }
  }, [memoizedQuery, listener])

  return matches
}

/**
 * Common breakpoint hooks for convenience
 */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsMobileOrTablet = () => useMediaQuery('(max-width: 1023px)')

/**
 * Enhanced iPad detection with iPadOS 13+ quirks handling and performance optimization
 * iPad Pro 11": 834px x 1194px
 * iPad Pro 12.9": 1024px x 1366px
 * iPad Air: 820px x 1180px
 * iPad Mini: 744px x 1133px
 */
export const useIsIPad = () => {
  const isTabletSize = useMediaQuery('(min-width: 744px) and (max-width: 1366px)') // Include iPad Mini
  const [isIPad, setIsIPad] = useState(false)
  const detectionRef = useRef<boolean | null>(null)

  // Memoize the detection logic to prevent unnecessary re-runs
  const detectIPad = useCallback(() => {
    // Return cached result if available
    if (detectionRef.current !== null) {
      return detectionRef.current
    }

    const userAgent = navigator.userAgent.toLowerCase()
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Direct iPad detection (works pre-iPadOS 13)
    if (userAgent.includes('ipad')) {
      detectionRef.current = true
      return true
    }

    // iPadOS 13+ detection (reports as macOS)
    if (userAgent.includes('macintosh') && hasTouch) {
      // Additional checks for iPadOS masquerading as macOS
      const hasSafariMobile = userAgent.includes('mobile')
      const hasIOSPattern = userAgent.includes('version/') && userAgent.includes('safari/')

      // Screen resolution checks for common iPad sizes
      const { screen } = window
      const isIPadResolution = (
        // iPad Pro 12.9" (2048x2732)
        (screen.width === 1024 && screen.height === 1366) ||
        (screen.width === 1366 && screen.height === 1024) ||
        // iPad Pro 11" (1668x2388)
        (screen.width === 834 && screen.height === 1194) ||
        (screen.width === 1194 && screen.height === 834) ||
        // iPad Air (1640x2360)
        (screen.width === 820 && screen.height === 1180) ||
        (screen.width === 1180 && screen.height === 820) ||
        // iPad Mini (1488x2266)
        (screen.width === 744 && screen.height === 1133) ||
        (screen.width === 1133 && screen.height === 744) ||
        // Standard iPad (1620x2160)
        (screen.width === 810 && screen.height === 1080) ||
        (screen.width === 1080 && screen.height === 810)
      )

      const result = hasSafariMobile || hasIOSPattern || isIPadResolution
      detectionRef.current = result
      return result
    }

    // Additional tablet size check with touch capability
    const result = isTabletSize && hasTouch
    detectionRef.current = result
    return result
  }, [isTabletSize])

  useEffect(() => {
    setIsIPad(detectIPad())
  }, [detectIPad])

  return isIPad
}

/**
 * iPad-specific model detection utility with memoization
 */
export const useIPadModel = () => {
  const [model, setModel] = useState<'mini' | 'standard' | 'air' | 'pro-11' | 'pro-12' | 'unknown'>('unknown')
  const modelRef = useRef<'mini' | 'standard' | 'air' | 'pro-11' | 'pro-12' | 'unknown' | null>(null)

  // Memoize model detection to avoid repeated calculations
  const detectModel = useCallback(() => {
    if (modelRef.current !== null) {
      return modelRef.current
    }

    const { screen } = window
    const width = Math.min(screen.width, screen.height) // Always use portrait width for consistency
    const height = Math.max(screen.width, screen.height)

    let detectedModel: 'mini' | 'standard' | 'air' | 'pro-11' | 'pro-12' | 'unknown' = 'unknown'

    if (width === 744 && height === 1133) {
      detectedModel = 'mini'
    } else if (width === 810 && height === 1080) {
      detectedModel = 'standard'
    } else if (width === 820 && height === 1180) {
      detectedModel = 'air'
    } else if (width === 834 && height === 1194) {
      detectedModel = 'pro-11'
    } else if (width === 1024 && height === 1366) {
      detectedModel = 'pro-12'
    }

    modelRef.current = detectedModel
    return detectedModel
  }, [])

  useEffect(() => {
    setModel(detectModel())
  }, [detectModel])

  return model
}

/**
 * Additional viewport and device detection hooks
 */
export const useLargeDesktop = () => useMediaQuery('(min-width: 1440px)')
export const useOrientation = () => {
  const isPortrait = useMediaQuery('(orientation: portrait)')
  return isPortrait ? 'portrait' : 'landscape'
}

/**
 * Enterprise iPad optimization hook
 */
export const useIPadEnterpriseFeatures = () => {
  const isIPad = useIsIPad()
  const orientation = useOrientation()
  const model = useIPadModel()

  return {
    isIPad,
    orientation,
    model,
    // Optimal filter layout for enterprise usage
    shouldUseDrawer: isIPad && orientation === 'portrait',
    shouldUseInline: isIPad && orientation === 'landscape',
    // Screen real estate considerations
    hasLimitedSpace: model === 'mini' || (orientation === 'portrait' && model !== 'pro-12'),
    // Touch optimization recommendations
    needsLargerTouchTargets: model === 'mini',
    supportsAdvancedGestures: model.includes('pro'),
  }
}

/**
 * Comprehensive device type detection
 */
export const useDeviceType = () => {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const isLargeDesktop = useLargeDesktop()
  
  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  if (isLargeDesktop) return 'large-desktop'
  if (isDesktop) return 'desktop'
  return 'desktop' // fallback
}