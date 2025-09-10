/**
 * Memoization Utilities
 * 
 * Performance optimization utilities for React components including
 * custom memoization hooks and component optimizers.
 */

import React from 'react'

// =============================================================================
// SHALLOW COMPARISON UTILITIES
// =============================================================================

/**
 * Shallow compare two objects
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}

/**
 * Deep compare arrays (one level deep)
 */
export function shallowEqualArray<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1 === arr2) return true
  if (arr1.length !== arr2.length) return false
  
  return arr1.every((item, index) => item === arr2[index])
}

/**
 * Compare functions by reference and toString
 */
export function equalFunctions(fn1: Function, fn2: Function): boolean {
  return fn1 === fn2 || fn1.toString() === fn2.toString()
}

// =============================================================================
// CUSTOM MEMO HOOKS
// =============================================================================

/**
 * Memoize a value with custom equality function
 */
export function useMemoCustom<T>(
  factory: () => T,
  deps: React.DependencyList,
  equalityFn: (a: React.DependencyList, b: React.DependencyList) => boolean = shallowEqualArray
): T {
  const ref = React.useRef<{ deps: React.DependencyList; value: T }>()

  if (!ref.current || !equalityFn(deps, ref.current.deps)) {
    ref.current = { deps, value: factory() }
  }

  return ref.current.value
}

/**
 * Memoize expensive computations with shallow comparison
 */
export function useMemoShallow<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemoCustom(factory, deps, shallowEqualArray)
}

/**
 * Stable callback with shallow dependency comparison
 */
export function useCallbackShallow<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useMemoCustom(() => callback, deps, shallowEqualArray)
}

/**
 * Memoize object references to prevent unnecessary re-renders
 */
export function useStableObject<T extends Record<string, any>>(obj: T): T {
  return useMemoCustom(() => obj, Object.values(obj), shallowEqualArray)
}

// =============================================================================
// COMPONENT MEMOIZATION HELPERS
// =============================================================================

/**
 * Higher-order component for memoizing with custom comparison
 */
export function memoWithComparison<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  const defaultComparison = (prevProps: P, nextProps: P) => shallowEqual(prevProps, nextProps)
  
  return React.memo(Component, areEqual || defaultComparison)
}

/**
 * Memoize a component that receives array props
 */
export function memoWithArrayProps<P extends object>(
  Component: React.ComponentType<P>,
  arrayPropKeys: (keyof P)[] = []
) {
  return React.memo(Component, (prevProps, nextProps) => {
    // Check non-array props with shallow equality
    for (const key in prevProps) {
      if (arrayPropKeys.includes(key)) continue
      if (prevProps[key] !== nextProps[key]) return false
    }

    // Check array props with deep equality
    for (const key of arrayPropKeys) {
      const prevArray = prevProps[key] as any[]
      const nextArray = nextProps[key] as any[]
      if (!shallowEqualArray(prevArray, nextArray)) return false
    }

    return true
  })
}

// =============================================================================
// PERFORMANCE HOOKS
// =============================================================================

/**
 * Track component re-renders for debugging
 */
export function useRenderCount(componentName: string) {
  const renderCount = React.useRef(0)
  
  React.useEffect(() => {
    renderCount.current++
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times`)
    }
  })

  return renderCount.current
}

/**
 * Track prop changes for debugging
 */
export function useWhyDidYouUpdate<T extends Record<string, any>>(
  componentName: string,
  props: T
) {
  const previousProps = React.useRef<T>()

  React.useEffect(() => {
    if (previousProps.current && process.env.NODE_ENV === 'development') {
      const allKeys = Object.keys({ ...previousProps.current, ...props })
      const changedProps: Record<string, { from: any; to: any }> = {}

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          }
        }
      })

      if (Object.keys(changedProps).length) {
        console.log(`[${componentName}] Props changed:`, changedProps)
      }
    }

    previousProps.current = props
  })
}

/**
 * Debounce a value to reduce re-renders
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle a value to limit update frequency
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value)
  const lastRan = React.useRef(Date.now())

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

// =============================================================================
// LIST OPTIMIZATION HOOKS
// =============================================================================

/**
 * Optimize list rendering by memoizing list items
 */
export function useOptimizedList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string,
  renderItem: (item: T, index: number) => React.ReactNode
) {
  const memoizedItems = React.useMemo(() => {
    return items.map((item, index) => {
      const key = keyExtractor(item, index)
      const MemoizedItem = React.memo(() => renderItem(item, index))
      return <MemoizedItem key={key} />
    })
  }, [items, keyExtractor, renderItem])

  return memoizedItems
}

/**
 * Virtual list optimization for large datasets
 */
export function useVirtualizedList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleRange = React.useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    )
    
    return {
      start: Math.max(0, start - overscan),
      end,
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const visibleItems = React.useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  }
}

// =============================================================================
// CONTEXT OPTIMIZATION
// =============================================================================

/**
 * Split context to prevent unnecessary re-renders
 */
export function createSplitContext<T extends Record<string, any>>() {
  type ContextType = {
    [K in keyof T]: React.Context<T[K]>
  }

  const contexts = {} as ContextType

  function createProvider<K extends keyof T>(key: K) {
    if (!contexts[key]) {
      contexts[key] = React.createContext<T[K]>(undefined as any)
    }
    return contexts[key]
  }

  function useContextValue<K extends keyof T>(key: K): T[K] {
    const context = contexts[key]
    if (!context) {
      throw new Error(`Context for key "${String(key)}" not found`)
    }
    return React.useContext(context)
  }

  return {
    createProvider,
    useContextValue,
    contexts,
  }
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Measure component render performance
 */
export function usePerformanceMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const renderStart = React.useRef<number>()

  React.useLayoutEffect(() => {
    if (enabled) {
      renderStart.current = performance.now()
    }
  })

  React.useEffect(() => {
    if (enabled && renderStart.current) {
      const renderTime = performance.now() - renderStart.current
      if (renderTime > 16) { // More than one frame
        console.warn(`[${componentName}] Slow render: ${renderTime.toFixed(2)}ms`)
      }
    }
  })
}

/**
 * Track expensive computation time
 */
export function useComputationTime<T>(
  computation: () => T,
  deps: React.DependencyList,
  name?: string
): T {
  return React.useMemo(() => {
    const start = performance.now()
    const result = computation()
    const end = performance.now()
    
    if (process.env.NODE_ENV === 'development' && name) {
      console.log(`[${name}] Computation time: ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }, deps)
}

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

export const performanceUtils = {
  // Comparison
  shallowEqual,
  shallowEqualArray,
  equalFunctions,
  
  // Memoization
  useMemoCustom,
  useMemoShallow,
  useCallbackShallow,
  useStableObject,
  
  // Component optimization
  memoWithComparison,
  memoWithArrayProps,
  
  // Performance hooks
  useRenderCount,
  useWhyDidYouUpdate,
  useDebounce,
  useThrottle,
  
  // List optimization
  useOptimizedList,
  useVirtualizedList,
  
  // Context optimization
  createSplitContext,
  
  // Monitoring
  usePerformanceMonitor,
  useComputationTime,
} as const

export default performanceUtils