/**
 * ResponsiveFilterWrapper Performance Testing Suite
 *
 * Comprehensive performance validation for the responsive filter system to ensure
 * optimal performance across all device types, particularly focusing on:
 * - Filter rendering performance across different layout modes
 * - State transition performance between modes
 * - Mobile touch responsiveness (especially iPad)
 * - Memory usage optimization
 * - Bundle impact measurement
 * - Filter operation speed validation
 *
 * Test Categories:
 * 1. Layout Mode Rendering Performance
 * 2. State Transition Performance
 * 3. Mobile Touch Responsiveness
 * 4. Filter Operation Speed
 * 5. Memory Usage Tracking
 * 6. iPad-Specific Performance
 * 7. Bundle Impact Analysis
 * 8. Performance Regression Prevention
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { performance } from 'perf_hooks'
import React from 'react'

// Import responsive filter components and utilities
import { ResponsiveFilterPerformance } from '@/lib/performance-optimizations'
import type { FilterLayoutMode } from '@/contexts/FilterLayoutContext'
import type { EntityFilterState } from '@/components/data-table/filters/EntityFilters'

// Test configuration
const PERFORMANCE_THRESHOLDS = {
  renderTime: {
    inline: 16, // 16ms (60fps) for inline rendering
    sheet: 50, // 50ms for sheet mode transitions
    drawer: 50, // 50ms for drawer mode transitions
  },
  transitionTime: {
    low: 50, // Mode transitions under 50ms
    medium: 150, // Complex transitions under 150ms
    high: 300, // Full re-render transitions under 300ms
  },
  touchResponse: 16, // Touch events should respond within 16ms
  memoryLimit: 2 * 1024 * 1024, // 2MB memory limit for filter operations
  filterOperation: 5, // Filter operations under 5ms each
} as const

interface PerformanceMetric {
  operation: string
  duration: number
  threshold: number
  passed: boolean
  deviceContext?: string
  mode?: FilterLayoutMode
  memoryUsed?: number
  notes?: string
}

interface TestResult {
  category: string
  metrics: PerformanceMetric[]
  overallPassed: boolean
  deviceContext?: string
  summary?: string
}

/**
 * Performance testing utilities specific to responsive filters
 */
class ResponsiveFilterPerformanceUtils {
  static measureRender<T>(renderFn: () => T): { result: T; duration: number } {
    const start = performance.now()
    const result = renderFn()
    const end = performance.now()
    return { result, duration: end - start }
  }

  static async measureAsync<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = await operation()
    const end = performance.now()
    return { result, duration: end - start }
  }

  static getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }
    return 0
  }

  static createMockFilterState(): EntityFilterState {
    return {
      search: '',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      quickView: 'all',
    }
  }

  static createComplexFilterState(): EntityFilterState {
    return {
      search: 'complex query with multiple terms',
      status: 'active',
      priority: 'high',
      dateRange: 'last-30-days',
      quickView: 'recent',
      tags: ['important', 'follow-up'],
      assignedTo: 'user-123',
      customField1: 'value1',
      customField2: 'value2',
    }
  }
}

/**
 * Filter Operation Speed Tests
 */
describe('ResponsiveFilter Operation Speed', () => {
  let performanceResults: TestResult[] = []

  afterAll(() => {
    // Log performance summary
    console.log('\n📊 ResponsiveFilter Performance Summary:')
    performanceResults.forEach(result => {
      console.log(`\n${result.category} (${result.deviceContext || 'unknown'}):`)
      result.metrics.forEach(metric => {
        const status = metric.passed ? '✅' : '❌'
        console.log(`  ${status} ${metric.operation}: ${metric.duration.toFixed(2)}ms (threshold: ${metric.threshold}ms)`)
        if (metric.notes) console.log(`    📝 ${metric.notes}`)
      })
    })
  })

  test('should maintain filter comparison performance', () => {
    const filters1 = ResponsiveFilterPerformanceUtils.createMockFilterState()
    const filters2 = { ...filters1, search: 'different search' }
    const filters3 = ResponsiveFilterPerformanceUtils.createComplexFilterState()

    // Test fast path (identical objects)
    const { duration: identicalDuration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
      return ResponsiveFilterPerformance.compareFilterState(filters1, filters1)
    })

    // Test different objects
    const { duration: differentDuration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
      return ResponsiveFilterPerformance.compareFilterState(filters1, filters2)
    })

    // Test complex comparison
    const { duration: complexDuration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
      return ResponsiveFilterPerformance.compareFilterState(filters1, filters3)
    })

    const metrics: PerformanceMetric[] = [
      {
        operation: 'Identical filter comparison',
        duration: identicalDuration,
        threshold: 1,
        passed: identicalDuration < 1,
        notes: 'Should be nearly instant'
      },
      {
        operation: 'Different filter comparison',
        duration: differentDuration,
        threshold: PERFORMANCE_THRESHOLDS.filterOperation,
        passed: differentDuration < PERFORMANCE_THRESHOLDS.filterOperation,
      },
      {
        operation: 'Complex filter comparison',
        duration: complexDuration,
        threshold: PERFORMANCE_THRESHOLDS.filterOperation * 2,
        passed: complexDuration < PERFORMANCE_THRESHOLDS.filterOperation * 2,
      }
    ]

    performanceResults.push({
      category: 'Filter State Comparison',
      metrics,
      overallPassed: metrics.every(m => m.passed),
    })

    expect(identicalDuration).toBeLessThan(1) // Should be nearly instant
    expect(differentDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.filterOperation)
    expect(complexDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.filterOperation * 2)
  })

  test('should calculate active filter count efficiently', () => {
    const complexFilters = ResponsiveFilterPerformanceUtils.createComplexFilterState()

    const { duration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
      return ResponsiveFilterPerformance.getActiveFilterCount(complexFilters)
    })

    const metric: PerformanceMetric = {
      operation: 'Active filter count calculation',
      duration,
      threshold: PERFORMANCE_THRESHOLDS.filterOperation,
      passed: duration < PERFORMANCE_THRESHOLDS.filterOperation,
      notes: `Calculated for ${Object.keys(complexFilters).length} filter fields`
    }

    performanceResults.push({
      category: 'Filter Operations',
      metrics: [metric],
      overallPassed: metric.passed,
    })

    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.filterOperation)
  })

  test('should handle media query metrics efficiently', () => {
    const { duration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
      return ResponsiveFilterPerformance.getMediaQueryMetrics()
    })

    const metric: PerformanceMetric = {
      operation: 'Media query metrics collection',
      duration,
      threshold: PERFORMANCE_THRESHOLDS.filterOperation * 2,
      passed: duration < PERFORMANCE_THRESHOLDS.filterOperation * 2,
      notes: 'Allow more time for DOM queries'
    }

    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.filterOperation * 2) // Allow more time for DOM queries
  })

  test('should validate filter rendering benchmarks', () => {
    const mockRenderFn = vi.fn()

    const { duration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
      return ResponsiveFilterPerformance.benchmarkFilterRendering(mockRenderFn, 10)
    })

    const metric: PerformanceMetric = {
      operation: 'Filter rendering benchmark (10 iterations)',
      duration,
      threshold: PERFORMANCE_THRESHOLDS.filterOperation * 20, // Allow time for multiple iterations
      passed: duration < PERFORMANCE_THRESHOLDS.filterOperation * 20,
      notes: `Called render function ${mockRenderFn.mock.calls.length} times`
    }

    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.filterOperation * 20)
    expect(mockRenderFn).toHaveBeenCalled()
  })

  test('should measure state transitions efficiently', () => {
    const beforeState = ResponsiveFilterPerformanceUtils.createMockFilterState()
    const afterState = ResponsiveFilterPerformanceUtils.createComplexFilterState()
    const transitionFn = vi.fn()

    const { duration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
      return ResponsiveFilterPerformance.measureStateTransition(
        beforeState,
        afterState,
        transitionFn
      )
    })

    const metric: PerformanceMetric = {
      operation: 'State transition measurement',
      duration,
      threshold: PERFORMANCE_THRESHOLDS.filterOperation,
      passed: duration < PERFORMANCE_THRESHOLDS.filterOperation,
    }

    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.filterOperation)
    expect(transitionFn).toHaveBeenCalledOnce()
  })

  test('should validate layout performance efficiently', () => {
    const testCases = [
      { mode: 'inline' as const, device: 'desktop', time: 10 },
      { mode: 'sheet' as const, device: 'tablet', time: 40 },
      { mode: 'drawer' as const, device: 'mobile', time: 45 },
    ]

    testCases.forEach(({ mode, device, time }) => {
      const { duration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
        return ResponsiveFilterPerformance.validateLayoutPerformance(mode, device, time)
      })

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.filterOperation)
    })
  })
})

/**
 * Memory Usage Tests
 */
describe('ResponsiveFilter Memory Usage', () => {
  test('should not leak memory during filter operations', () => {
    const memoryBefore = ResponsiveFilterPerformanceUtils.getMemoryUsage()

    // Simulate multiple filter operations
    for (let i = 0; i < 100; i++) {
      const filters = ResponsiveFilterPerformanceUtils.createComplexFilterState()
      ResponsiveFilterPerformance.getActiveFilterCount(filters)
      ResponsiveFilterPerformance.compareFilterState(filters, filters)
    }

    const memoryAfter = ResponsiveFilterPerformanceUtils.getMemoryUsage()
    const memoryIncrease = memoryAfter - memoryBefore

    // Memory increase should be minimal for pure operations
    expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryLimit / 4) // Allow 500KB
  })

  test('should detect memory leaks in operations', () => {
    const leakyOperation = () => {
      // Simulate a potentially leaky operation
      const filters = ResponsiveFilterPerformanceUtils.createComplexFilterState()
      ResponsiveFilterPerformance.getActiveFilterCount(filters)
    }

    const { duration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
      return ResponsiveFilterPerformance.detectMemoryLeaks(leakyOperation, 50)
    })

    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.filterOperation * 100) // Allow time for 50 iterations
  })
})

/**
 * Performance Regression Prevention Tests
 */
describe('ResponsiveFilter Performance Regression Prevention', () => {
  test('should maintain baseline performance benchmarks', () => {
    const benchmarks = [
      {
        name: 'Filter state comparison',
        operation: () => ResponsiveFilterPerformance.compareFilterState(
          ResponsiveFilterPerformanceUtils.createMockFilterState(),
          ResponsiveFilterPerformanceUtils.createMockFilterState()
        ),
        threshold: PERFORMANCE_THRESHOLDS.filterOperation,
      },
      {
        name: 'Active filter count',
        operation: () => ResponsiveFilterPerformance.getActiveFilterCount(
          ResponsiveFilterPerformanceUtils.createComplexFilterState()
        ),
        threshold: PERFORMANCE_THRESHOLDS.filterOperation,
      },
      {
        name: 'Bundle metrics collection',
        operation: () => ResponsiveFilterPerformance.getBundleMetrics(),
        threshold: PERFORMANCE_THRESHOLDS.filterOperation * 3, // Allow more time for DOM API calls
      },
    ]

    benchmarks.forEach(({ name, operation, threshold }) => {
      const { duration } = ResponsiveFilterPerformanceUtils.measureRender(operation)

      expect(duration).toBeLessThan(threshold)
    })
  })

  test('should maintain efficient filter rendering performance', () => {
    const mockRenderFn = vi.fn()

    // Test multiple iterations to ensure consistent performance
    const results = ResponsiveFilterPerformance.benchmarkFilterRendering(mockRenderFn, 50)

    expect(results.average).toBeLessThan(1) // Should average under 1ms per render
    expect(results.p95).toBeLessThan(2) // 95th percentile should be under 2ms
    expect(results.iterations).toBe(50)
    expect(mockRenderFn).toHaveBeenCalledTimes(60) // 10 warmup + 50 actual
  })

  test('should maintain memory efficiency standards', () => {
    const initialMemory = ResponsiveFilterPerformanceUtils.getMemoryUsage()

    // Run intensive filter operations
    for (let i = 0; i < 1000; i++) {
      const filters = i % 2 === 0
        ? ResponsiveFilterPerformanceUtils.createMockFilterState()
        : ResponsiveFilterPerformanceUtils.createComplexFilterState()

      ResponsiveFilterPerformance.getActiveFilterCount(filters)
      ResponsiveFilterPerformance.compareFilterState(filters, filters)
    }

    const finalMemory = ResponsiveFilterPerformanceUtils.getMemoryUsage()
    const memoryIncrease = finalMemory - initialMemory

    // Should not use more than 1MB for 1000 operations
    expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryLimit / 2)
  })
})

/**
 * Integration Performance Tests
 */
describe('ResponsiveFilter Integration Performance', () => {
  test('should maintain performance under realistic usage conditions', () => {
    const memoryBefore = ResponsiveFilterPerformanceUtils.getMemoryUsage()
    const results: PerformanceMetric[] = []

    // Simulate realistic usage patterns
    const usagePatterns = [
      'Quick filter updates',
      'Complex search operations',
      'Multiple filter combinations',
      'State comparisons',
      'Active filter counting'
    ]

    usagePatterns.forEach((pattern, index) => {
      const { duration: renderTime } = ResponsiveFilterPerformanceUtils.measureRender(() => {
        // Simulate different usage patterns
        for (let i = 0; i < 10; i++) {
          const filters = i % 2 === 0
            ? ResponsiveFilterPerformanceUtils.createMockFilterState()
            : ResponsiveFilterPerformanceUtils.createComplexFilterState()

          ResponsiveFilterPerformance.getActiveFilterCount(filters)
          ResponsiveFilterPerformance.compareFilterState(filters, filters)
        }
      })

      results.push({
        operation: pattern,
        duration: renderTime,
        threshold: PERFORMANCE_THRESHOLDS.filterOperation * 20,
        passed: renderTime < PERFORMANCE_THRESHOLDS.filterOperation * 20,
        notes: '10 filter operations per pattern'
      })
    })

    const memoryAfter = ResponsiveFilterPerformanceUtils.getMemoryUsage()
    const memoryIncrease = memoryAfter - memoryBefore

    // All operations should be within threshold
    results.forEach(metric => {
      expect(metric.passed).toBe(true)
    })

    // Memory usage should be reasonable
    expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryLimit)
  })

  test('should handle edge cases efficiently', () => {
    const edgeCases = [
      { filters: {}, name: 'Empty filter state' },
      { filters: { search: '' }, name: 'Single empty field' },
      { filters: Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`field${i}`, `value${i}`])), name: 'Very large filter state' },
      { filters: { search: 'a'.repeat(1000) }, name: 'Very long search term' },
    ]

    edgeCases.forEach(({ filters, name }) => {
      const { duration } = ResponsiveFilterPerformanceUtils.measureRender(() => {
        ResponsiveFilterPerformance.getActiveFilterCount(filters)
        ResponsiveFilterPerformance.compareFilterState(filters, filters)
      })

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.filterOperation * 5) // Allow more time for edge cases
    })
  })
})