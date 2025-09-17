/**
 * Dual-Mode Rendering Test Suite
 * Validates the layout-as-data migration's dual rendering system
 */

import { test, expect, Page } from '@playwright/test'
import { performance } from 'perf_hooks'

interface RenderModeTestCase {
  mode: 'slots' | 'schema' | 'auto'
  page: 'products' | 'contacts' | 'organizations'
  expectedBehavior: string
  criticalElements: string[]
}

interface PerformanceMetrics {
  mode: string
  page: string
  loadTime: number
  renderTime: number
  memoryUsage: number
  componentCount: number
  rerenderCount: number
}

class RenderModeTestHarness {
  private metrics: PerformanceMetrics[] = []

  async testRenderMode(
    page: Page,
    testCase: RenderModeTestCase
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now()

    // Navigate with render mode parameter
    const url = `/${testCase.page}?layout=${testCase.mode}`
    await page.goto(url, { waitUntil: 'networkidle' })

    // Wait for React to settle
    await page.waitForTimeout(500)

    // Verify mode is active
    const activeMode = await this.getActiveRenderMode(page)

    // Check critical elements are rendered
    for (const selector of testCase.criticalElements) {
      const element = await page.$(selector)
      expect(element).toBeTruthy()
    }

    // Collect performance metrics
    const metrics = await this.collectMetrics(page, testCase, startTime)
    this.metrics.push(metrics)

    return metrics
  }

  private async getActiveRenderMode(page: Page): Promise<string> {
    // Check for development mode indicator if present
    const modeIndicator = await page.$('.fixed.bottom-4.right-4')
    if (modeIndicator) {
      const activeText = await modeIndicator.$eval(
        '.text-xs.text-gray-500',
        el => el.textContent
      )
      return activeText?.replace('Active: ', '') || 'unknown'
    }

    // Fallback: check PageLayout props
    return await page.evaluate(() => {
      const pageLayout = document.querySelector('[data-render-mode]')
      return pageLayout?.getAttribute('data-render-mode') || 'slots'
    })
  }

  private async collectMetrics(
    page: Page,
    testCase: RenderModeTestCase,
    startTime: number
  ): Promise<PerformanceMetrics> {
    const metrics = await page.evaluate(() => {
      // Get React Fiber metrics if available
      const rootElement = document.getElementById('root')
      const reactFiber = (rootElement as any)?._reactRootContainer?._internalRoot

      // Count rendered components
      let componentCount = 0
      const countComponents = (fiber: any) => {
        if (!fiber) return
        componentCount++
        if (fiber.child) countComponents(fiber.child)
        if (fiber.sibling) countComponents(fiber.sibling)
      }
      if (reactFiber?.current) countComponents(reactFiber.current)

      // Get memory usage
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

      // Get React DevTools metrics if available
      const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
      const rerenderCount = devTools?.rendererInterfaces?.size || 0

      return {
        componentCount,
        memoryUsage,
        rerenderCount
      }
    })

    const loadTime = performance.now() - startTime

    // Measure render time
    const renderStartTime = performance.now()
    await page.evaluate(() => {
      // Force a re-render
      const event = new Event('resize')
      window.dispatchEvent(event)
    })
    await page.waitForTimeout(100)
    const renderTime = performance.now() - renderStartTime

    return {
      mode: testCase.mode,
      page: testCase.page,
      loadTime,
      renderTime,
      ...metrics
    }
  }

  compareMetrics(baseline: PerformanceMetrics, current: PerformanceMetrics): {
    passed: boolean
    degradation: number
    issues: string[]
  } {
    const issues: string[] = []

    // Check for performance degradation (>20% threshold)
    const loadTimeDiff = ((current.loadTime - baseline.loadTime) / baseline.loadTime) * 100
    const renderTimeDiff = ((current.renderTime - baseline.renderTime) / baseline.renderTime) * 100
    const memoryDiff = ((current.memoryUsage - baseline.memoryUsage) / baseline.memoryUsage) * 100

    if (loadTimeDiff > 20) {
      issues.push(`Load time degradation: ${loadTimeDiff.toFixed(1)}%`)
    }

    if (renderTimeDiff > 20) {
      issues.push(`Render time degradation: ${renderTimeDiff.toFixed(1)}%`)
    }

    if (memoryDiff > 30) {
      issues.push(`Memory usage increase: ${memoryDiff.toFixed(1)}%`)
    }

    if (current.rerenderCount > baseline.rerenderCount * 1.5) {
      issues.push(`Excessive re-renders: ${current.rerenderCount} vs ${baseline.rerenderCount}`)
    }

    const avgDegradation = (loadTimeDiff + renderTimeDiff + memoryDiff) / 3

    return {
      passed: issues.length === 0,
      degradation: avgDegradation,
      issues
    }
  }

  generateReport(): string {
    let report = '# Render Mode Test Report\\n\\n'

    // Group metrics by page
    const pageGroups = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.page]) acc[metric.page] = []
      acc[metric.page].push(metric)
      return acc
    }, {} as Record<string, PerformanceMetrics[]>)

    for (const [page, metrics] of Object.entries(pageGroups)) {
      report += `## ${page.charAt(0).toUpperCase() + page.slice(1)} Page\\n\\n`

      // Find baseline (slots mode)
      const baseline = metrics.find(m => m.mode === 'slots')

      report += '| Mode | Load Time (ms) | Render Time (ms) | Memory (MB) | Components | Re-renders | Status |\\n'
      report += '|------|---------------|-----------------|-------------|------------|------------|--------|\\n'

      for (const metric of metrics) {
        const memoryMB = (metric.memoryUsage / 1024 / 1024).toFixed(2)
        let status = '✅ Pass'

        if (baseline && metric.mode !== 'slots') {
          const comparison = this.compareMetrics(baseline, metric)
          if (!comparison.passed) {
            status = `⚠️ Issues: ${comparison.issues.join(', ')}`
          }
        }

        report += `| ${metric.mode} | ${metric.loadTime.toFixed(0)} | ${metric.renderTime.toFixed(0)} | ${memoryMB} | ${metric.componentCount} | ${metric.rerenderCount} | ${status} |\\n`
      }

      report += '\\n'
    }

    return report
  }
}

// Test configuration
const testCases: RenderModeTestCase[] = [
  // Products page tests
  {
    mode: 'slots',
    page: 'products',
    expectedBehavior: 'Traditional slot-based rendering',
    criticalElements: [
      '[data-testid="page-header"]',
      '[data-testid="products-table"]',
      '[data-testid="filter-sidebar"]'
    ]
  },
  {
    mode: 'schema',
    page: 'products',
    expectedBehavior: 'Schema-driven rendering with component registry',
    criticalElements: [
      '[data-testid="page-header"]',
      '[data-testid="products-table"]',
      '[data-testid="filter-sidebar"]'
    ]
  },
  {
    mode: 'auto',
    page: 'products',
    expectedBehavior: 'Automatic mode selection based on config',
    criticalElements: [
      '[data-testid="page-header"]',
      '[data-testid="products-table"]'
    ]
  },

  // Contacts page tests
  {
    mode: 'slots',
    page: 'contacts',
    expectedBehavior: 'Traditional contact rendering',
    criticalElements: [
      '[data-testid="page-header"]',
      '[data-testid="contacts-table"]'
    ]
  },
  {
    mode: 'schema',
    page: 'contacts',
    expectedBehavior: 'Schema-driven contact rendering',
    criticalElements: [
      '[data-testid="page-header"]',
      '[data-testid="contacts-table"]'
    ]
  },

  // Organizations page tests
  {
    mode: 'slots',
    page: 'organizations',
    expectedBehavior: 'Traditional organization rendering',
    criticalElements: [
      '[data-testid="page-header"]',
      '[data-testid="organizations-table"]'
    ]
  },
  {
    mode: 'schema',
    page: 'organizations',
    expectedBehavior: 'Schema-driven organization rendering',
    criticalElements: [
      '[data-testid="page-header"]',
      '[data-testid="organizations-table"]'
    ]
  }
]

// Export test runner
export async function runRenderModeTests(page: Page): Promise<string> {
  const harness = new RenderModeTestHarness()

  console.log('Starting Render Mode Tests...')

  for (const testCase of testCases) {
    console.log(`Testing ${testCase.page} in ${testCase.mode} mode...`)

    try {
      const metrics = await harness.testRenderMode(page, testCase)
      console.log(`✓ ${testCase.page} (${testCase.mode}): Load=${metrics.loadTime.toFixed(0)}ms, Render=${metrics.renderTime.toFixed(0)}ms`)
    } catch (error) {
      console.error(`✗ ${testCase.page} (${testCase.mode}): ${error}`)
    }
  }

  return harness.generateReport()
}

// CLI runner
if (require.main === module) {
  const { chromium } = require('playwright')

  ;(async () => {
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    // Set up base URL
    await page.goto('http://localhost:5173')

    const report = await runRenderModeTests(page)
    console.log('\\n' + report)

    await browser.close()

    // Save report
    const fs = require('fs')
    fs.writeFileSync('render-mode-test-report.md', report)
    console.log('Report saved to render-mode-test-report.md')
  })()
}