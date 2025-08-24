/**
 * Performance Patterns Architecture Tests
 * Validates that performance optimization patterns are properly implemented
 */

import { describe, test, expect, beforeAll } from 'vitest'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { glob } from 'glob'

const projectRoot = join(process.cwd())

describe('Performance Optimization Patterns', () => {
  let componentFiles: string[] = []
  let hookFiles: string[] = []
  let performanceLibraries: string[] = []

  beforeAll(async () => {
    componentFiles = await glob('src/**/*.{ts,tsx}', {
      cwd: projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
    })
    
    hookFiles = await glob('src/features/**/hooks/**/*.{ts,tsx}', { cwd: projectRoot })
    
    performanceLibraries = await glob('src/lib/*performance*.{ts,tsx}', { cwd: projectRoot })
  })

  describe('Performance Library Implementation', () => {
    test('should have performance optimization utilities', async () => {
      expect(performanceLibraries.length).toBeGreaterThan(0)
      
      // Check for key performance utilities
      const performanceLibPath = join(projectRoot, 'src/lib/performance-optimizations.ts')
      const content = await readFile(performanceLibPath, 'utf8')
      
      const expectedUtilities = [
        'useDebounce',
        'useVirtualScrolling', 
        'useOptimizedFormSubmit',
        'useCachedSearch',
        'usePerformanceMonitoring'
      ]
      
      for (const utility of expectedUtilities) {
        expect(content).toContain(utility)
      }
    })

    test('should have query optimization utilities', async () => {
      const queryLibPath = join(projectRoot, 'src/lib/query-optimizations.ts')
      const content = await readFile(queryLibPath, 'utf8')
      
      const expectedOptimizations = [
        'createOptimizedQueryClient',
        'useOptimizedInfiniteQuery',
        'useBatchOptimizedQueries',
        'useOptimisticMutation',
        'usePrefetchRelatedData'
      ]
      
      for (const optimization of expectedOptimizations) {
        expect(content).toContain(optimization)
      }
    })
  })

  describe('Component Performance Patterns', () => {
    test('large components should use React.memo', async () => {
      const largeMemoizedComponents: string[] = []
      const largUnmemoizedComponents: string[] = []

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Skip non-component files
        if (!content.includes('export function') && !content.includes('export const')) continue
        
        // Consider large components (>10KB or >200 lines)
        const isLargeComponent = content.length > 10000 || content.split('\n').length > 200
        
        if (isLargeComponent) {
          const hasMemo = content.includes('React.memo') || content.includes('memo(')
          
          if (hasMemo) {
            largeMemoizedComponents.push(file)
          } else {
            largUnmemoizedComponents.push(file)
          }
        }
      }

      // Allow some flexibility - not all large components need memo
      const memoizationRatio = largeMemoizedComponents.length / (largeMemoizedComponents.length + largUnmemoizedComponents.length)
      expect(memoizationRatio).toBeGreaterThanOrEqual(0.3) // At least 30% memoized
    })

    test('should use useMemo for expensive calculations', async () => {
      let hasExpensiveCalculations = false
      let hasMemoizedCalculations = false

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Look for expensive operations
        const expensiveOperations = [
          /\.map\(/g,
          /\.filter\(/g,
          /\.reduce\(/g,
          /\.sort\(/g,
          /\.find\(/g,
        ]
        
        const expensiveMatches = expensiveOperations.reduce((total, pattern) => {
          const matches = content.match(pattern)
          return total + (matches ? matches.length : 0)
        }, 0)
        
        if (expensiveMatches >= 3) {
          hasExpensiveCalculations = true
          
          if (content.includes('useMemo') || content.includes('useCallback')) {
            hasMemoizedCalculations = true
          }
        }
      }

      // If we have expensive calculations, we should have some memoization
      if (hasExpensiveCalculations) {
        expect(hasMemoizedCalculations).toBe(true)
      }
    })

    test('should use useCallback for event handlers in performance-critical components', async () => {
      let hasEventHandlers = false
      let hasCallbackOptimization = false

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Look for event handlers
        const eventHandlerPatterns = [
          /onClick=/g,
          /onChange=/g,
          /onSubmit=/g,
          /onFocus=/g,
          /onBlur=/g,
        ]
        
        const handlerCount = eventHandlerPatterns.reduce((total, pattern) => {
          const matches = content.match(pattern)
          return total + (matches ? matches.length : 0)
        }, 0)
        
        if (handlerCount >= 3) {
          hasEventHandlers = true
          
          if (content.includes('useCallback')) {
            hasCallbackOptimization = true
          }
        }
      }

      // If we have many event handlers, we should optimize some with useCallback
      if (hasEventHandlers) {
        expect(hasCallbackOptimization).toBe(true)
      }
    })
  })

  describe('List and Table Optimizations', () => {
    test('large lists should use virtualization', async () => {
      let hasLargeListComponents = false
      let hasVirtualization = false

      const tableComponents = componentFiles.filter(file => 
        file.includes('Table') || file.includes('List') || file.includes('Grid')
      )

      for (const file of tableComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Check for large list patterns
        if (content.includes('.map(') && content.includes('key=')) {
          hasLargeListComponents = true
          
          if (content.includes('useVirtualScrolling') || content.includes('virtual') || content.includes('Virtual')) {
            hasVirtualization = true
          }
        }
      }

      // Not all lists need virtualization, but we should have some implementation
      if (hasLargeListComponents && tableComponents.length > 0) {
        // At least one table/list component should use virtualization
        expect(hasVirtualization).toBe(true)
      }
    })

    test('should implement efficient key props for lists', async () => {
      const violations: Array<{ file: string; line: string }> = []

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        const lines = content.split('\n')
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          
          // Look for array.map with potential key issues
          if (line.includes('.map(') && line.includes('key=')) {
            // Check for anti-patterns like key={index}
            if (line.includes('key={index}') || line.includes("key='index'")) {
              violations.push({ file, line: line.trim() })
            }
          }
        }
      }

      // Allow some violations but prefer proper key usage
      expect(violations.length).toBeLessThanOrEqual(3)
    })
  })

  describe('Search and Filter Optimizations', () => {
    test('search inputs should use debouncing', async () => {
      let hasSearchComponents = false
      let hasDebouncing = false

      const searchComponents = componentFiles.filter(file => 
        file.includes('Search') || file.includes('Filter') || file.includes('search')
      )

      for (const file of searchComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Check for search input patterns
        if (content.includes('onChange') && (content.includes('search') || content.includes('filter'))) {
          hasSearchComponents = true
          
          if (content.includes('useDebounce') || content.includes('debounce')) {
            hasDebouncing = true
          }
        }
      }

      // All search components should use debouncing
      if (hasSearchComponents) {
        expect(hasDebouncing).toBe(true)
      }
    })
  })

  describe('Form Optimizations', () => {
    test('forms should use optimized submission patterns', async () => {
      let hasFormComponents = false
      let hasOptimizedSubmission = false

      const formComponents = componentFiles.filter(file => 
        file.includes('Form') || file.includes('form')
      )

      for (const file of formComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Check for form submission patterns
        if (content.includes('onSubmit') || content.includes('handleSubmit')) {
          hasFormComponents = true
          
          if (content.includes('useOptimizedFormSubmit') || content.includes('isSubmitting')) {
            hasOptimizedSubmission = true
          }
        }
      }

      // Forms should use optimized submission patterns
      if (hasFormComponents) {
        expect(hasOptimizedSubmission).toBe(true)
      }
    })
  })

  describe('Query Performance Optimizations', () => {
    test('hooks should use query optimizations', async () => {
      let hasQueryOptimizations = false

      for (const file of hookFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        const optimizationPatterns = [
          'staleTime',
          'cacheTime',
          'gcTime',
          'refetchOnWindowFocus: false',
          'prefetchQuery',
          'invalidateQueries',
        ]
        
        if (optimizationPatterns.some(pattern => content.includes(pattern))) {
          hasQueryOptimizations = true
          break
        }
      }

      expect(hasQueryOptimizations).toBe(true)
    })

    test('should implement batch queries where appropriate', async () => {
      let hasBatchQueries = false

      for (const file of hookFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (content.includes('useBatchOptimizedQueries') || content.includes('Promise.all')) {
          hasBatchQueries = true
          break
        }
      }

      expect(hasBatchQueries).toBe(true)
    })
  })

  describe('Bundle Optimization', () => {
    test('should use lazy loading for feature modules', async () => {
      let hasLazyLoading = false

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        const lazyPatterns = [
          'React.lazy',
          'lazy(',
          'import(',
          'createFeatureLoader',
        ]
        
        if (lazyPatterns.some(pattern => content.includes(pattern))) {
          hasLazyLoading = true
          break
        }
      }

      expect(hasLazyLoading).toBe(true)
    })
  })

  describe('Performance Monitoring', () => {
    test('should include performance monitoring in development', async () => {
      let hasPerformanceMonitoring = false

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (content.includes('usePerformanceMonitoring') || content.includes('performance.now()')) {
          hasPerformanceMonitoring = true
          break
        }
      }

      expect(hasPerformanceMonitoring).toBe(true)
    })

    test('should have performance measurement utilities', async () => {
      const performanceLibPath = join(projectRoot, 'src/lib/performance-optimizations.ts')
      const content = await readFile(performanceLibPath, 'utf8')
      
      expect(content).toContain('usePerformanceMonitoring')
      expect(content).toContain('performance.now()')
    })
  })

  describe('Memory Management', () => {
    test('should clean up event listeners and subscriptions', async () => {
      let hasProperCleanup = false

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Look for useEffect cleanup patterns
        if (content.includes('useEffect') && content.includes('return () => {')) {
          hasProperCleanup = true
          break
        }
      }

      expect(hasProperCleanup).toBe(true)
    })
  })

  describe('Cache Management', () => {
    test('should implement search result caching', async () => {
      let hasSearchCaching = false

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (content.includes('useCachedSearch') || content.includes('searchCache')) {
          hasSearchCaching = true
          break
        }
      }

      expect(hasSearchCaching).toBe(true)
    })
  })
})