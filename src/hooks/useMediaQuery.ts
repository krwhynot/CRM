import { useState, useEffect } from 'react'

/**
 * Hook to track media query changes
 * @param query - Media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)
    
    // Create listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // Add listener with fallback for older browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }
    
    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        // Fallback for older browsers
        media.removeListener(listener)
      }
    }
  }, [query])

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
 * iPad specific detection
 * iPad Pro 11": 834px x 1194px
 * iPad Pro 12.9": 1024px x 1366px
 */
export const useIsIPad = () => {
  const isTabletSize = useMediaQuery('(min-width: 768px) and (max-width: 1366px)')
  const [isIPad, setIsIPad] = useState(false)
  
  useEffect(() => {
    // Check for touch capability and tablet size
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const userAgent = navigator.userAgent.toLowerCase()
    const isIPadUserAgent = userAgent.includes('ipad') || 
      (userAgent.includes('macintosh') && hasTouch) // iPadOS 13+ reports as Mac
    
    setIsIPad(isTabletSize && (hasTouch || isIPadUserAgent))
  }, [isTabletSize])
  
  return isIPad
}