/**
 * Performance Optimization Utilities
 * Provides optimized patterns for CRM component rendering and data fetching
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { isDevelopment } from '@/config/environment'

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
