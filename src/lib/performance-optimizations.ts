/**
 * Performance Optimization Utilities
 * Provides optimized patterns for CRM component rendering and data fetching
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'

// Development environment check
const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

// Debounce utility for search inputs and API calls
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

// Optimized virtual scrolling for large data sets
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  buffer: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
    )

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    }
  }, [items, itemHeight, containerHeight, scrollTop, buffer])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    handleScroll,
    setScrollTop,
  }
}

// Optimized intersection observer for lazy loading
export function useIntersectionObserver(
  options: {
    root?: Element | Document | null
    rootMargin?: string
    threshold?: number | number[]
  } = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    const currentTarget = targetRef.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [options])

  return [targetRef, isIntersecting] as const
}

// Optimized table row memoization
export function createOptimizedTableRow<T extends { id: string }>(
  RowComponent: React.ComponentType<{ item: T; onAction?: (id: string, action: string) => void }>
) {
  return React.memo(RowComponent, (prevProps, nextProps) => {
    // Only re-render if the item data or actions have changed
    return (
      prevProps.item.id === nextProps.item.id &&
      JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item) &&
      prevProps.onAction === nextProps.onAction
    )
  })
}

// Query result memoization for TanStack Query
export function useMemoizedQueryResult<T>(
  queryResult: { data?: T; isLoading: boolean; error: unknown },
  dependencies: unknown[] = []
) {
  // Create a stable string representation of dependencies for memoization
  const dependenciesString = useMemo(() => JSON.stringify(dependencies), [dependencies])

  return useMemo(
    () => ({
      data: queryResult.data,
      isLoading: queryResult.isLoading,
      error: queryResult.error,
    }),
    [queryResult.data, queryResult.isLoading, queryResult.error, dependenciesString] // eslint-disable-line react-hooks/exhaustive-deps
  )
}

// Optimized form submission with loading state
export function useOptimizedFormSubmit<T>(
  submitFn: (data: T) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: unknown) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const handleSubmit = useCallback(
    async (data: T) => {
      if (isSubmitting) return // Prevent double submission

      setIsSubmitting(true)
      setError(null)

      try {
        await submitFn(data)
        onSuccess?.()
      } catch (err) {
        setError(err)
        onError?.(err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [submitFn, onSuccess, onError, isSubmitting]
  )

  return {
    handleSubmit,
    isSubmitting,
    error,
    reset: useCallback(() => {
      setError(null)
      setIsSubmitting(false)
    }, []),
  }
}

// Bundle splitting utilities for feature modules
export const createFeatureLoader = <T extends React.ComponentType<Record<string, unknown>>>(
  loader: () => Promise<{ default: T }>
) => {
  return React.lazy(() =>
    loader().catch(() => ({
      default: (() => React.createElement('div', {}, 'Error loading component')) as unknown as T,
    }))
  )
}

// Performance monitoring hook
export function usePerformanceMonitoring(componentName: string) {
  const renderStartTime = useRef<number>(performance.now())
  const renderCount = useRef<number>(0)

  useEffect(() => {
    renderCount.current++
    const renderTime = performance.now() - renderStartTime.current

    if (isDevelopment) {
      console.debug(
        `${componentName} rendered in ${renderTime.toFixed(2)}ms (render #${renderCount.current})`
      )

      // Warn about excessive renders
      if (renderCount.current > 10 && renderTime > 16) {
        console.warn(
          `⚠️ ${componentName} may have performance issues: ${renderCount.current} renders, ${renderTime.toFixed(2)}ms last render`
        )
      }
    }

    renderStartTime.current = performance.now()
  })

  // Reset on unmount
  useEffect(() => {
    return () => {
      renderCount.current = 0
    }
  }, [])

  return {
    renderCount: renderCount.current,
    markRenderStart: () => {
      renderStartTime.current = performance.now()
    },
  }
}

// Optimized search with caching
const searchCache = new Map<string, unknown>()

export function useCachedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  query: string,
  cacheTime = 5 * 60 * 1000 // 5 minutes
) {
  const [results, setResults] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(null)
      return
    }

    const cacheKey = `search:${debouncedQuery}`
    const cached = searchCache.get(cacheKey) as { data: T; timestamp: number } | undefined

    // Check if cached result is still valid
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setResults(cached.data)
      return
    }

    setIsLoading(true)
    searchFn(debouncedQuery)
      .then((data) => {
        setResults(data)
        searchCache.set(cacheKey, { data, timestamp: Date.now() })
      })
      .catch((error) => {
        console.error('Search error:', error)
        setResults(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [debouncedQuery, searchFn, cacheTime])

  return { results, isLoading }
}

// Responsive filter performance utilities
export const ResponsiveFilterPerformance = {
  /**
   * Optimized filter state comparison for React.memo
   */
  compareFilterState: (prevFilters: Record<string, unknown>, nextFilters: Record<string, unknown>) => {
    // Fast path for identical objects
    if (prevFilters === nextFilters) return true

    // Deep comparison for filter values
    const prevKeys = Object.keys(prevFilters)
    const nextKeys = Object.keys(nextFilters)

    if (prevKeys.length !== nextKeys.length) return false

    return prevKeys.every(key => {
      const prevValue = prevFilters[key]
      const nextValue = nextFilters[key]

      // Handle arrays and objects
      if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
        return JSON.stringify(prevValue) === JSON.stringify(nextValue)
      }

      if (typeof prevValue === 'object' && typeof nextValue === 'object') {
        return JSON.stringify(prevValue) === JSON.stringify(nextValue)
      }

      return prevValue === nextValue
    })
  },

  /**
   * Calculate active filter count efficiently
   */
  getActiveFilterCount: (filters: Record<string, unknown>) => {
    return Object.keys(filters).filter(key => {
      const value = filters[key]
      return value && value !== '' && value !== 'all' && value !== 'none'
    }).length
  },

  /**
   * Media query performance metrics
   */
  getMediaQueryMetrics: () => {
    const queries = [
      '(max-width: 767px)',      // mobile
      '(min-width: 768px) and (max-width: 1023px)', // tablet
      '(min-width: 1024px)',     // desktop
      '(orientation: portrait)', // orientation
      '(orientation: landscape)'
    ]

    return queries.map(query => {
      const media = window.matchMedia(query)
      return {
        query,
        matches: media.matches,
        listeners: 0 // Note: listeners count not always exposed in all browsers
      }
    })
  },

  /**
   * Bundle size impact analysis
   */
  getBundleMetrics: () => {
    if (typeof window === 'undefined') return null

    const performance = window.performance
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (!navigation) return null

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      transferSize: navigation.transferSize || 0,
      encodedBodySize: navigation.encodedBodySize || 0,
      decodedBodySize: navigation.decodedBodySize || 0,
      compressionRatio: navigation.encodedBodySize > 0
        ? Math.round((1 - navigation.encodedBodySize / navigation.decodedBodySize) * 100)
        : 0
    }
  },

  /**
   * Filter rendering performance benchmarks
   */
  benchmarkFilterRendering: (
    renderFn: () => void,
    iterations: number = 100
  ) => {
    const times: number[] = []

    // Warmup
    for (let i = 0; i < 10; i++) {
      renderFn()
    }

    // Actual benchmarking
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      renderFn()
      const end = performance.now()
      times.push(end - start)
    }

    return {
      min: Math.min(...times),
      max: Math.max(...times),
      average: times.reduce((a, b) => a + b, 0) / times.length,
      median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
      p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)],
      iterations
    }
  },

  /**
   * Measure state transition performance
   */
  measureStateTransition: (
    beforeState: Record<string, unknown>,
    afterState: Record<string, unknown>,
    transitionFn: () => void
  ) => {
    const start = performance.now()
    const memoryBefore = typeof process !== 'undefined' ? process.memoryUsage?.()?.heapUsed || 0 : 0

    transitionFn()

    const end = performance.now()
    const memoryAfter = typeof process !== 'undefined' ? process.memoryUsage?.()?.heapUsed || 0 : 0

    const stateComplexityBefore = Object.keys(beforeState).length
    const stateComplexityAfter = Object.keys(afterState).length

    return {
      duration: end - start,
      memoryDelta: memoryAfter - memoryBefore,
      stateComplexityDelta: stateComplexityAfter - stateComplexityBefore,
      complexity: stateComplexityAfter > 10 ? 'high' : stateComplexityAfter > 5 ? 'medium' : 'low'
    }
  },

  /**
   * Touch responsiveness monitoring
   */
  monitorTouchResponse: (element: HTMLElement) => {
    const touchMetrics = {
      touchStartTime: 0,
      touchEndTime: 0,
      responses: [] as number[]
    }

    const touchStart = () => {
      touchMetrics.touchStartTime = performance.now()
    }

    const touchEnd = () => {
      touchMetrics.touchEndTime = performance.now()
      const responseTime = touchMetrics.touchEndTime - touchMetrics.touchStartTime
      touchMetrics.responses.push(responseTime)
    }

    element.addEventListener('touchstart', touchStart, { passive: true })
    element.addEventListener('touchend', touchEnd, { passive: true })

    return {
      getMetrics: () => ({
        averageResponse: touchMetrics.responses.length > 0
          ? touchMetrics.responses.reduce((a, b) => a + b, 0) / touchMetrics.responses.length
          : 0,
        maxResponse: Math.max(...touchMetrics.responses, 0),
        minResponse: Math.min(...touchMetrics.responses, 0),
        totalTouches: touchMetrics.responses.length
      }),
      cleanup: () => {
        element.removeEventListener('touchstart', touchStart)
        element.removeEventListener('touchend', touchEnd)
      }
    }
  },

  /**
   * Layout mode performance validation
   */
  validateLayoutPerformance: (
    mode: 'inline' | 'sheet' | 'drawer',
    deviceContext: string,
    renderTime: number
  ) => {
    const thresholds = {
      inline: 16, // 60fps
      sheet: 50,  // Acceptable for overlay
      drawer: 50  // Acceptable for overlay
    }

    const deviceMultipliers = {
      mobile: 1.5,     // Allow more time on mobile
      tablet: 1.2,     // Slightly more time on tablet
      desktop: 1.0     // Base performance on desktop
    }

    const threshold = thresholds[mode] * (deviceMultipliers[deviceContext as keyof typeof deviceMultipliers] || 1.0)

    return {
      passed: renderTime < threshold,
      renderTime,
      threshold,
      mode,
      deviceContext,
      performanceGrade: renderTime < threshold * 0.5 ? 'excellent' :
                       renderTime < threshold * 0.8 ? 'good' :
                       renderTime < threshold ? 'acceptable' : 'poor'
    }
  },

  /**
   * Memory leak detection for filter operations
   */
  detectMemoryLeaks: (operation: () => void, iterations: number = 100) => {
    const initialMemory = typeof process !== 'undefined' ? process.memoryUsage?.()?.heapUsed || 0 : 0
    const samples: number[] = []

    for (let i = 0; i < iterations; i++) {
      operation()

      if (i % 10 === 0) {
        const currentMemory = typeof process !== 'undefined' ? process.memoryUsage?.()?.heapUsed || 0 : 0
        samples.push(currentMemory - initialMemory)
      }
    }

    const trend = samples.length > 1 ?
      (samples[samples.length - 1] - samples[0]) / samples.length : 0

    return {
      initialMemory,
      finalMemory: typeof process !== 'undefined' ? process.memoryUsage?.()?.heapUsed || 0 : 0,
      memoryGrowth: samples[samples.length - 1] || 0,
      growthTrend: trend,
      suspicious: trend > 1024 * 10, // Flag if growing more than 10KB per iteration
      samples
    }
  }
}
