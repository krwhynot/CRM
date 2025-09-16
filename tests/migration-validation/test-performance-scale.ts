/**
 * Performance Scale Testing Suite
 * Tests system performance with varying data sizes (100-5000 rows)
 * Validates auto-virtualization at 500+ rows
 */

import { test, expect, Page } from '@playwright/test'
import { performance } from 'perf_hooks'

interface DataScaleTest {
  rowCount: number
  renderMode: 'slots' | 'schema'
  page: 'products' | 'contacts' | 'organizations'
  expectedVirtualization: boolean
}

interface ScaleTestMetrics {
  rowCount: number
  renderMode: string
  page: string
  initialLoadTime: number
  scrollPerformance: number
  memoryUsage: number
  virtualizationActive: boolean
  visibleRows: number
  totalRows: number
  rerenderCount: number
  frameDrops: number
}

class PerformanceScaleTester {
  private metrics: ScaleTestMetrics[] = []
  private baselineMetrics: Map<string, ScaleTestMetrics> = new Map()

  /**
   * Generate mock data for testing
   */
  private generateMockData(type: string, count: number): any[] {
    const data = []

    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'products':
          data.push({
            id: `prod-${i}`,
            name: `Product ${i}`,
            category: `Category ${i % 10}`,
            price: Math.random() * 1000,
            stock: Math.floor(Math.random() * 100),
            principal: `Principal ${i % 5}`,
            created_at: new Date().toISOString()
          })
          break

        case 'contacts':
          data.push({
            id: `contact-${i}`,
            first_name: `First${i}`,
            last_name: `Last${i}`,
            email: `contact${i}@example.com`,
            phone: `555-${String(i).padStart(4, '0')}`,
            organization: `Org ${i % 20}`,
            role: `Role ${i % 5}`,
            created_at: new Date().toISOString()
          })
          break

        case 'organizations':
          data.push({
            id: `org-${i}`,
            name: `Organization ${i}`,
            type: ['Customer', 'Distributor', 'Principal'][i % 3],
            segment: `Segment ${i % 8}`,
            priority_rating: ['A+', 'A', 'B', 'C', 'D'][i % 5],
            annual_revenue: Math.random() * 10000000,
            created_at: new Date().toISOString()
          })
          break
      }
    }

    return data
  }

  /**
   * Inject mock data into the page
   */
  private async injectMockData(page: Page, type: string, count: number) {
    const mockData = this.generateMockData(type, count)

    await page.evaluate((data) => {
      // Override fetch or inject directly into React Query cache
      (window as any).__MOCK_DATA__ = data
      (window as any).__USE_MOCK_DATA__ = true

      // Trigger re-render with mock data
      const event = new CustomEvent('mock-data-loaded', { detail: data })
      window.dispatchEvent(event)
    }, mockData)
  }

  /**
   * Test performance at specific scale
   */
  async testScale(page: Page, test: DataScaleTest): Promise<ScaleTestMetrics> {
    const startTime = performance.now()

    // Navigate to page with render mode
    const url = `/${test.page}?layout=${test.renderMode}&mockRows=${test.rowCount}`
    await page.goto(url, { waitUntil: 'networkidle' })

    // Inject mock data
    await this.injectMockData(page, test.page, test.rowCount)

    // Wait for render to complete
    await page.waitForTimeout(1000)

    // Measure initial load time
    const initialLoadTime = performance.now() - startTime

    // Check if virtualization is active
    const virtualizationActive = await this.checkVirtualization(page)

    // Test scroll performance
    const scrollPerformance = await this.measureScrollPerformance(page)

    // Collect memory and render metrics
    const metrics = await page.evaluate(() => {
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

      // Count visible rows vs total rows
      const tableRows = document.querySelectorAll('[data-testid*="table-row"]')
      const visibleRows = Array.from(tableRows).filter(row => {
        const rect = row.getBoundingClientRect()
        return rect.top >= 0 && rect.bottom <= window.innerHeight
      }).length

      // Get React metrics
      const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
      const rerenderCount = devTools?.rendererInterfaces?.size || 0

      return {
        memoryUsage,
        visibleRows,
        totalRows: tableRows.length,
        rerenderCount
      }
    })

    // Measure frame drops during interaction
    const frameDrops = await this.measureFrameDrops(page)

    const scaleMetrics: ScaleTestMetrics = {
      rowCount: test.rowCount,
      renderMode: test.renderMode,
      page: test.page,
      initialLoadTime,
      scrollPerformance,
      virtualizationActive,
      frameDrops,
      ...metrics
    }

    this.metrics.push(scaleMetrics)
    return scaleMetrics
  }

  /**
   * Check if virtualization is active
   */
  private async checkVirtualization(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
      // Check for react-window indicators
      const virtualList = document.querySelector('[data-react-window]')
      if (virtualList) return true

      // Check for custom virtualization indicators
      const virtualIndicator = document.querySelector('[data-virtualized="true"]')
      if (virtualIndicator) return true

      // Check if DOM row count is less than data count
      const tableRows = document.querySelectorAll('[data-testid*="table-row"]')
      const dataCount = (window as any).__MOCK_DATA__?.length || 0

      // If we have significantly fewer DOM nodes than data items, virtualization is likely active
      return dataCount > 100 && tableRows.length < dataCount * 0.5
    })
  }

  /**
   * Measure scroll performance
   */
  private async measureScrollPerformance(page: Page): Promise<number> {
    const startTime = performance.now()

    // Perform scroll test
    await page.evaluate(async () => {
      const scrollContainer = document.querySelector('[data-testid*="table"]')?.parentElement || window

      // Scroll to bottom
      scrollContainer.scrollTo({ top: 999999, behavior: 'smooth' })
      await new Promise(resolve => setTimeout(resolve, 500))

      // Scroll to middle
      scrollContainer.scrollTo({ top: 500, behavior: 'smooth' })
      await new Promise(resolve => setTimeout(resolve, 500))

      // Scroll to top
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
      await new Promise(resolve => setTimeout(resolve, 500))
    })

    return performance.now() - startTime
  }

  /**
   * Measure frame drops during interaction
   */
  private async measureFrameDrops(page: Page): Promise<number> {
    return await page.evaluate(async () => {
      let frameDrops = 0
      let lastFrameTime = performance.now()
      const targetFrameTime = 1000 / 60 // 60fps target

      const measureFrames = () => {
        const currentTime = performance.now()
        const deltaTime = currentTime - lastFrameTime

        // If frame took more than 1.5x target time, it's a drop
        if (deltaTime > targetFrameTime * 1.5) {
          frameDrops++
        }

        lastFrameTime = currentTime
      }

      // Measure for 1 second during scroll
      const scrollContainer = document.querySelector('[data-testid*="table"]')?.parentElement || window
      const rafId = setInterval(measureFrames, 16)

      // Trigger scroll
      scrollContainer.scrollTo({ top: 500, behavior: 'smooth' })

      await new Promise(resolve => setTimeout(resolve, 1000))
      clearInterval(rafId)

      return frameDrops
    })
  }

  /**
   * Analyze virtualization effectiveness
   */
  analyzeVirtualization(): {
    threshold: number
    effectiveness: string
    issues: string[]
  } {
    const issues: string[] = []

    // Find where virtualization kicks in
    const sortedMetrics = [...this.metrics].sort((a, b) => a.rowCount - b.rowCount)

    let threshold = 0
    for (let i = 0; i < sortedMetrics.length - 1; i++) {
      const current = sortedMetrics[i]
      const next = sortedMetrics[i + 1]

      if (!current.virtualizationActive && next.virtualizationActive) {
        threshold = next.rowCount
        break
      }
    }

    // Check if threshold is at expected 500 rows
    if (threshold > 0 && threshold !== 500) {
      issues.push(`Virtualization threshold at ${threshold} rows instead of expected 500`)
    }

    // Check virtualization effectiveness
    const largeDatasetMetrics = this.metrics.filter(m => m.rowCount >= 1000)
    const withVirtualization = largeDatasetMetrics.filter(m => m.virtualizationActive)
    const withoutVirtualization = largeDatasetMetrics.filter(m => !m.virtualizationActive)

    if (withoutVirtualization.length > 0) {
      issues.push(`${withoutVirtualization.length} tests with 1000+ rows did not activate virtualization`)
    }

    // Compare performance with and without virtualization
    if (withVirtualization.length > 0 && withoutVirtualization.length > 0) {
      const avgWithVirt = withVirtualization.reduce((sum, m) => sum + m.scrollPerformance, 0) / withVirtualization.length
      const avgWithoutVirt = withoutVirtualization.reduce((sum, m) => sum + m.scrollPerformance, 0) / withoutVirtualization.length

      if (avgWithVirt > avgWithoutVirt) {
        issues.push('Virtualization not improving scroll performance')
      }
    }

    const effectiveness = issues.length === 0 ? 'Optimal' :
                         issues.length <= 2 ? 'Acceptable' : 'Poor'

    return { threshold, effectiveness, issues }
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    let report = '# Performance Scale Test Report\\n\\n'

    // Summary section
    report += '## Summary\\n\\n'

    const virtualizationAnalysis = this.analyzeVirtualization()
    report += `- Virtualization Threshold: ${virtualizationAnalysis.threshold} rows\\n`
    report += `- Virtualization Effectiveness: ${virtualizationAnalysis.effectiveness}\\n`
    report += `- Tests Run: ${this.metrics.length}\\n\\n`

    // Performance by scale
    report += '## Performance by Data Scale\\n\\n'

    const scaleGroups = [100, 500, 1000, 2500, 5000]

    for (const scale of scaleGroups) {
      const scaleMetrics = this.metrics.filter(m => m.rowCount === scale)
      if (scaleMetrics.length === 0) continue

      report += `### ${scale} Rows\\n\\n`
      report += '| Page | Mode | Load Time (ms) | Scroll (ms) | Memory (MB) | Virtualized | Frame Drops | Status |\\n'
      report += '|------|------|---------------|-------------|-------------|-------------|-------------|--------|\\n'

      for (const metric of scaleMetrics) {
        const memoryMB = (metric.memoryUsage / 1024 / 1024).toFixed(2)
        const virtStatus = metric.virtualizationActive ? '✅' : '❌'

        // Determine status based on performance
        let status = '✅ Pass'

        if (metric.rowCount >= 500 && !metric.virtualizationActive) {
          status = '⚠️ No virtualization'
        } else if (metric.initialLoadTime > 3000) {
          status = '⚠️ Slow load'
        } else if (metric.frameDrops > 10) {
          status = '⚠️ Frame drops'
        } else if (metric.scrollPerformance > 2000) {
          status = '⚠️ Slow scroll'
        }

        report += `| ${metric.page} | ${metric.renderMode} | ${metric.initialLoadTime.toFixed(0)} | ${metric.scrollPerformance.toFixed(0)} | ${memoryMB} | ${virtStatus} | ${metric.frameDrops} | ${status} |\\n`
      }

      report += '\\n'
    }

    // Mode comparison
    report += '## Render Mode Comparison\\n\\n'

    const slotMetrics = this.metrics.filter(m => m.renderMode === 'slots')
    const schemaMetrics = this.metrics.filter(m => m.renderMode === 'schema')

    if (slotMetrics.length > 0 && schemaMetrics.length > 0) {
      const avgSlotLoad = slotMetrics.reduce((sum, m) => sum + m.initialLoadTime, 0) / slotMetrics.length
      const avgSchemaLoad = schemaMetrics.reduce((sum, m) => sum + m.initialLoadTime, 0) / schemaMetrics.length

      const avgSlotScroll = slotMetrics.reduce((sum, m) => sum + m.scrollPerformance, 0) / slotMetrics.length
      const avgSchemaScroll = schemaMetrics.reduce((sum, m) => sum + m.scrollPerformance, 0) / schemaMetrics.length

      report += '| Metric | Slots Mode | Schema Mode | Difference |\\n'
      report += '|--------|------------|-------------|------------|\\n'
      report += `| Avg Load Time | ${avgSlotLoad.toFixed(0)}ms | ${avgSchemaLoad.toFixed(0)}ms | ${((avgSchemaLoad - avgSlotLoad) / avgSlotLoad * 100).toFixed(1)}% |\\n`
      report += `| Avg Scroll Time | ${avgSlotScroll.toFixed(0)}ms | ${avgSchemaScroll.toFixed(0)}ms | ${((avgSchemaScroll - avgSlotScroll) / avgSlotScroll * 100).toFixed(1)}% |\\n`
      report += '\\n'
    }

    // Issues section
    if (virtualizationAnalysis.issues.length > 0) {
      report += '## ⚠️ Issues Found\\n\\n'
      virtualizationAnalysis.issues.forEach(issue => {
        report += `- ${issue}\\n`
      })
      report += '\\n'
    }

    // Recommendations
    report += '## Recommendations\\n\\n'

    if (virtualizationAnalysis.threshold !== 500) {
      report += `- Adjust virtualization threshold to trigger at 500 rows as specified\\n`
    }

    const slowTests = this.metrics.filter(m => m.initialLoadTime > 3000)
    if (slowTests.length > 0) {
      report += `- Optimize initial load performance for ${slowTests.length} slow-loading scenarios\\n`
    }

    const highMemoryTests = this.metrics.filter(m => m.memoryUsage > 100 * 1024 * 1024)
    if (highMemoryTests.length > 0) {
      report += `- Investigate memory usage in ${highMemoryTests.length} high-memory scenarios\\n`
    }

    return report
  }
}

// Test configuration
const scaleTests: DataScaleTest[] = [
  // 100 rows - Should not virtualize
  { rowCount: 100, renderMode: 'slots', page: 'products', expectedVirtualization: false },
  { rowCount: 100, renderMode: 'schema', page: 'products', expectedVirtualization: false },

  // 500 rows - Should trigger virtualization
  { rowCount: 500, renderMode: 'slots', page: 'products', expectedVirtualization: true },
  { rowCount: 500, renderMode: 'schema', page: 'products', expectedVirtualization: true },
  { rowCount: 500, renderMode: 'slots', page: 'contacts', expectedVirtualization: true },
  { rowCount: 500, renderMode: 'schema', page: 'contacts', expectedVirtualization: true },

  // 1000 rows - Must virtualize
  { rowCount: 1000, renderMode: 'slots', page: 'products', expectedVirtualization: true },
  { rowCount: 1000, renderMode: 'schema', page: 'products', expectedVirtualization: true },
  { rowCount: 1000, renderMode: 'slots', page: 'organizations', expectedVirtualization: true },
  { rowCount: 1000, renderMode: 'schema', page: 'organizations', expectedVirtualization: true },

  // 2500 rows - Performance test
  { rowCount: 2500, renderMode: 'slots', page: 'products', expectedVirtualization: true },
  { rowCount: 2500, renderMode: 'schema', page: 'products', expectedVirtualization: true },

  // 5000 rows - Stress test
  { rowCount: 5000, renderMode: 'slots', page: 'products', expectedVirtualization: true },
  { rowCount: 5000, renderMode: 'schema', page: 'products', expectedVirtualization: true }
]

// Export test runner
export async function runPerformanceScaleTests(page: Page): Promise<string> {
  const tester = new PerformanceScaleTester()

  console.log('Starting Performance Scale Tests...')
  console.log('Testing data scales: 100, 500, 1000, 2500, 5000 rows')

  for (const test of scaleTests) {
    console.log(`Testing ${test.page} with ${test.rowCount} rows in ${test.renderMode} mode...`)

    try {
      const metrics = await tester.testScale(page, test)

      const virtStatus = metrics.virtualizationActive ? '✓' : '✗'
      const expectedVirt = test.expectedVirtualization ? 'expected' : 'not expected'

      console.log(`  Load: ${metrics.initialLoadTime.toFixed(0)}ms`)
      console.log(`  Virtualization: ${virtStatus} (${expectedVirt})`)
      console.log(`  Memory: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`)

      if (metrics.virtualizationActive !== test.expectedVirtualization) {
        console.warn(`  ⚠️ Virtualization mismatch!`)
      }
    } catch (error) {
      console.error(`  ✗ Test failed: ${error}`)
    }
  }

  return tester.generateReport()
}

// CLI runner
if (require.main === module) {
  const { chromium } = require('playwright')

  ;(async () => {
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    })
    const page = await context.newPage()

    // Set up base URL
    await page.goto('http://localhost:5173')

    const report = await runPerformanceScaleTests(page)
    console.log('\\n' + report)

    await browser.close()

    // Save report
    const fs = require('fs')
    fs.writeFileSync('performance-scale-test-report.md', report)
    console.log('Report saved to performance-scale-test-report.md')
  })()
}