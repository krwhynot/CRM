import { useMemo } from "react"
import { DYNAMIC_SELECT_TOKENS } from "../types"

export interface UseConditionalVirtualizationProps {
  itemCount: number
  enabled?: boolean
  estimateSize?: () => number
  getScrollElement?: () => HTMLElement | null
}

export function useConditionalVirtualization({
  itemCount,
  enabled = true,
  estimateSize,
  getScrollElement,
}: UseConditionalVirtualizationProps) {
  // Only enable virtualization if we have enough items to justify the overhead
  const shouldVirtualize = useMemo(() => {
    return enabled && itemCount >= DYNAMIC_SELECT_TOKENS.VIRTUALIZATION_THRESHOLD
  }, [enabled, itemCount])

  // Default estimateSize function using CSS custom property
  const defaultEstimateSize = useMemo(() => {
    if (estimateSize) return estimateSize
    
    return () => {
      // Try to get the CSS custom property value
      if (typeof window !== 'undefined') {
        const root = document.documentElement
        const cssValue = getComputedStyle(root).getPropertyValue('--dynamic-select-option-height')
        if (cssValue) {
          const numericValue = parseInt(cssValue.replace('px', ''), 10)
          if (!isNaN(numericValue)) return numericValue
        }
      }
      // Fallback to 40px if CSS custom property is not available
      return 40
    }
  }, [estimateSize])

  // Create virtualization config only when needed
  const virtualizationConfig = useMemo(() => {
    if (!shouldVirtualize) return null
    
    return {
      count: itemCount,
      estimateSize: defaultEstimateSize,
      getScrollElement,
      overscan: 5, // Render 5 items outside visible area for smooth scrolling
    }
  }, [shouldVirtualize, itemCount, defaultEstimateSize, getScrollElement])

  // Dynamic import function for virtualization
  const getVirtualizer = useMemo(() => {
    if (!shouldVirtualize) return null
    
    return async () => {
      const { useVirtualizer } = await import("@tanstack/react-virtual")
      return useVirtualizer
    }
  }, [shouldVirtualize])

  return {
    shouldVirtualize,
    virtualizationConfig,
    getVirtualizer,
  }
}

// Helper to get CSS custom property value with fallback
export function getCSSPropertyValue(property: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback
  
  const root = document.documentElement
  const cssValue = getComputedStyle(root).getPropertyValue(property)
  
  if (cssValue) {
    const numericValue = parseInt(cssValue.replace('px', ''), 10)
    if (!isNaN(numericValue)) return numericValue
  }
  
  return fallback
}

// Bundle size monitoring utilities
export const bundleMonitoring = {
  // Track when virtualization components are loaded
  trackVirtualizationLoad: () => {
    if (process.env.NODE_ENV === 'development') {
      console.info('[DynamicSelect] TanStack Virtual loaded conditionally')
    }
  },
  
  // Estimate bundle impact
  getBundleImpact: () => {
    // This would be used in build-time analysis
    return {
      virtualComponentSize: '~15KB', // Estimated TanStack Virtual size
      conditionalLoading: true,
      treeshaking: true,
    }
  }
}