/**
 * Error Scenario Reproduction Tests
 * Systematically reproduces and identifies "random errors" reported in production
 */

import { test, expect, Page, ConsoleMessage } from '@playwright/test'

interface ErrorScenario {
  name: string
  description: string
  category: 'schema' | 'registry' | 'data-binding' | 'lazy-loading' | 'race-condition' | 'memory'
  steps: ((page: Page) => Promise<void>)[]
  expectedErrors?: string[]
}

interface ErrorReport {
  scenario: string
  category: string
  errors: ErrorDetails[]
  reproduced: boolean
  frequency: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  rootCause?: string
}

interface ErrorDetails {
  type: 'console' | 'network' | 'exception' | 'render'
  message: string
  stack?: string
  timestamp: number
  context?: any
}

class ErrorScenarioTester {
  private reports: ErrorReport[] = []
  private consoleErrors: ErrorDetails[] = []
  private networkErrors: ErrorDetails[] = []
  private exceptionErrors: ErrorDetails[] = []
  private renderErrors: ErrorDetails[] = []

  /**
   * Set up error monitoring
   */
  async setupErrorMonitoring(page: Page) {
    // Monitor console errors
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        this.consoleErrors.push({
          type: 'console',
          message: msg.text(),
          timestamp: Date.now(),
          stack: msg.location()
            ? `${msg.location().url}:${msg.location().lineNumber}:${msg.location().columnNumber}`
            : undefined
        })
      }
    })

    // Monitor page errors
    page.on('pageerror', (error) => {
      this.exceptionErrors.push({
        type: 'exception',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      })
    })

    // Monitor network failures
    page.on('requestfailed', (request) => {
      this.networkErrors.push({
        type: 'network',
        message: `Network request failed: ${request.url()}`,
        context: {
          url: request.url(),
          method: request.method(),
          failure: request.failure()
        },
        timestamp: Date.now()
      })
    })

    // Inject render error detector
    await page.addInitScript(() => {
      // Override React error boundary
      const originalError = console.error
      console.error = (...args) => {
        const errorString = args.join(' ')

        // Detect React render errors
        if (errorString.includes('ReactDOM') ||
            errorString.includes('React will try to recreate') ||
            errorString.includes('Cannot update a component') ||
            errorString.includes('Maximum update depth exceeded')) {
          window.postMessage({
            type: 'RENDER_ERROR',
            message: errorString,
            timestamp: Date.now()
          }, '*')
        }

        originalError.apply(console, args)
      }

      // Detect unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        window.postMessage({
          type: 'UNHANDLED_REJECTION',
          message: event.reason?.toString() || 'Unknown rejection',
          timestamp: Date.now()
        }, '*')
      })
    })

    // Listen for custom error messages
    page.on('console', async (msg) => {
      if (msg.type() === 'log') {
        try {
          const text = msg.text()
          if (text.includes('RENDER_ERROR') || text.includes('UNHANDLED_REJECTION')) {
            this.renderErrors.push({
              type: 'render',
              message: text,
              timestamp: Date.now()
            })
          }
        } catch {}
      }
    })
  }

  /**
   * Clear error buffers
   */
  clearErrors() {
    this.consoleErrors = []
    this.networkErrors = []
    this.exceptionErrors = []
    this.renderErrors = []
  }

  /**
   * Test an error scenario
   */
  async testScenario(page: Page, scenario: ErrorScenario, iterations: number = 5): Promise<ErrorReport> {
    let reproducedCount = 0
    const allErrors: ErrorDetails[] = []

    console.log(`Testing scenario: ${scenario.name}`)

    for (let i = 0; i < iterations; i++) {
      this.clearErrors()

      try {
        // Execute scenario steps
        for (const step of scenario.steps) {
          await step(page)
        }

        // Wait for any async errors
        await page.waitForTimeout(1000)

        // Collect all errors from this iteration
        const iterationErrors = [
          ...this.consoleErrors,
          ...this.networkErrors,
          ...this.exceptionErrors,
          ...this.renderErrors
        ]

        if (iterationErrors.length > 0) {
          reproducedCount++
          allErrors.push(...iterationErrors)
        }

      } catch (error) {
        // Test execution error
        allErrors.push({
          type: 'exception',
          message: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        })
        reproducedCount++
      }
    }

    // Analyze errors and determine root cause
    const rootCause = this.analyzeRootCause(scenario, allErrors)

    // Determine severity
    const severity = this.determineSeverity(scenario, reproducedCount, iterations)

    const report: ErrorReport = {
      scenario: scenario.name,
      category: scenario.category,
      errors: allErrors,
      reproduced: reproducedCount > 0,
      frequency: (reproducedCount / iterations) * 100,
      severity,
      rootCause
    }

    this.reports.push(report)
    return report
  }

  /**
   * Analyze root cause of errors
   */
  private analyzeRootCause(scenario: ErrorScenario, errors: ErrorDetails[]): string | undefined {
    if (errors.length === 0) return undefined

    // Common error patterns and their root causes
    const patterns = [
      {
        pattern: /Cannot read prop.*of undefined/i,
        cause: 'Schema validation failure - missing required properties'
      },
      {
        pattern: /Maximum update depth exceeded/i,
        cause: 'Infinite re-render loop in schema-driven components'
      },
      {
        pattern: /Failed to fetch dynamically imported module/i,
        cause: 'Lazy loading failure - component chunk not available'
      },
      {
        pattern: /Network request failed.*layout/i,
        cause: 'Layout persistence service network failure'
      },
      {
        pattern: /Invalid schema version/i,
        cause: 'Schema versioning mismatch during migration'
      },
      {
        pattern: /Component.*not found in registry/i,
        cause: 'Component registry resolution failure'
      },
      {
        pattern: /Hydration mismatch/i,
        cause: 'SSR/CSR mismatch in schema rendering'
      },
      {
        pattern: /out of memory/i,
        cause: 'Memory leak in component lifecycle or data binding'
      }
    ]

    // Check error messages against patterns
    for (const error of errors) {
      for (const { pattern, cause } of patterns) {
        if (pattern.test(error.message)) {
          return cause
        }
      }
    }

    // Category-specific analysis
    switch (scenario.category) {
      case 'schema':
        return 'Schema processing or validation error'
      case 'registry':
        return 'Component registry lookup or resolution failure'
      case 'data-binding':
        return 'Data binding or state synchronization issue'
      case 'lazy-loading':
        return 'Dynamic import or code splitting failure'
      case 'race-condition':
        return 'Async operation race condition'
      case 'memory':
        return 'Memory leak or excessive memory usage'
      default:
        return 'Unknown error - requires deeper investigation'
    }
  }

  /**
   * Determine error severity
   */
  private determineSeverity(
    scenario: ErrorScenario,
    reproducedCount: number,
    iterations: number
  ): 'critical' | 'high' | 'medium' | 'low' {
    const frequency = (reproducedCount / iterations) * 100

    if (frequency >= 80) return 'critical'
    if (frequency >= 50) return 'high'
    if (frequency >= 20) return 'medium'
    return 'low'
  }

  /**
   * Generate error report
   */
  generateReport(): string {
    let report = '# Error Scenario Test Report\\n\\n'

    // Summary
    const totalScenarios = this.reports.length
    const reproducedScenarios = this.reports.filter(r => r.reproduced).length
    const criticalErrors = this.reports.filter(r => r.severity === 'critical').length
    const highErrors = this.reports.filter(r => r.severity === 'high').length

    report += '## Summary\\n\\n'
    report += `- Total Scenarios Tested: ${totalScenarios}\\n`
    report += `- Errors Reproduced: ${reproducedScenarios} (${((reproducedScenarios / totalScenarios) * 100).toFixed(1)}%)\\n`
    report += `- Critical Errors: ${criticalErrors}\\n`
    report += `- High Severity Errors: ${highErrors}\\n\\n`

    // Error categories
    report += '## Error Categories\\n\\n'

    const categories = ['schema', 'registry', 'data-binding', 'lazy-loading', 'race-condition', 'memory']

    for (const category of categories) {
      const categoryReports = this.reports.filter(r => r.category === category)
      if (categoryReports.length === 0) continue

      const reproducedInCategory = categoryReports.filter(r => r.reproduced).length

      report += `### ${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}\\n`
      report += `- Scenarios: ${categoryReports.length}\\n`
      report += `- Reproduced: ${reproducedInCategory}\\n\\n`

      for (const scenarioReport of categoryReports) {
        const status = scenarioReport.reproduced ? '❌' : '✅'
        report += `#### ${status} ${scenarioReport.scenario}\\n`

        if (scenarioReport.reproduced) {
          report += `- **Frequency**: ${scenarioReport.frequency.toFixed(1)}%\\n`
          report += `- **Severity**: ${scenarioReport.severity}\\n`
          if (scenarioReport.rootCause) {
            report += `- **Root Cause**: ${scenarioReport.rootCause}\\n`
          }
          report += `- **Error Count**: ${scenarioReport.errors.length}\\n`

          // Sample errors
          const sampleErrors = scenarioReport.errors.slice(0, 3)
          if (sampleErrors.length > 0) {
            report += `- **Sample Errors**:\\n`
            sampleErrors.forEach(err => {
              report += `  - ${err.type}: ${err.message.substring(0, 100)}...\\n`
            })
          }
        }

        report += '\\n'
      }
    }

    // Critical issues requiring immediate attention
    const criticalIssues = this.reports.filter(r => r.severity === 'critical' || r.severity === 'high')
    if (criticalIssues.length > 0) {
      report += '## ⚠️ Critical Issues Requiring Immediate Attention\\n\\n'

      for (const issue of criticalIssues) {
        report += `### ${issue.scenario}\\n`
        report += `- **Severity**: ${issue.severity}\\n`
        report += `- **Frequency**: ${issue.frequency.toFixed(1)}%\\n`
        report += `- **Root Cause**: ${issue.rootCause || 'Unknown'}\\n`
        report += `- **Recommended Fix**: ${this.getRecommendedFix(issue)}\\n\\n`
      }
    }

    return report
  }

  /**
   * Get recommended fix for an issue
   */
  private getRecommendedFix(report: ErrorReport): string {
    if (!report.rootCause) return 'Requires deeper investigation'

    const fixes: Record<string, string> = {
      'Schema validation failure - missing required properties':
        'Add default values or optional chaining in schema processing',

      'Infinite re-render loop in schema-driven components':
        'Add proper memoization and dependency arrays to schema effects',

      'Lazy loading failure - component chunk not available':
        'Implement fallback loading and retry logic for dynamic imports',

      'Layout persistence service network failure':
        'Add offline support and retry mechanisms for layout API calls',

      'Schema versioning mismatch during migration':
        'Implement schema migration tools and version compatibility checks',

      'Component registry resolution failure':
        'Add fallback components and better error boundaries',

      'Memory leak in component lifecycle or data binding':
        'Review cleanup in useEffect hooks and event listeners',

      'Data binding or state synchronization issue':
        'Implement proper state isolation and update batching'
    }

    return fixes[report.rootCause] || 'Review error logs and implement targeted fixes'
  }
}

// Define error scenarios to test
const errorScenarios: ErrorScenario[] = [
  // Schema validation errors
  {
    name: 'Invalid Schema Structure',
    description: 'Test with malformed schema data',
    category: 'schema',
    steps: [
      async (page) => {
        await page.goto('/products?layout=schema')
        await page.evaluate(() => {
          // Inject invalid schema
          (window as any).__MOCK_SCHEMA__ = { invalid: 'structure' }
          window.dispatchEvent(new Event('schema-update'))
        })
      }
    ]
  },

  // Component registry errors
  {
    name: 'Missing Component in Registry',
    description: 'Reference non-existent component',
    category: 'registry',
    steps: [
      async (page) => {
        await page.goto('/products?layout=schema')
        await page.evaluate(() => {
          // Try to render non-existent component
          const event = new CustomEvent('render-component', {
            detail: { component: 'NonExistentComponent' }
          })
          window.dispatchEvent(event)
        })
      }
    ]
  },

  // Lazy loading failures
  {
    name: 'Dynamic Import Failure',
    description: 'Simulate chunk loading failure',
    category: 'lazy-loading',
    steps: [
      async (page) => {
        // Block lazy-loaded chunks
        await page.route('**/*.chunk.js', route => route.abort())
        await page.goto('/products?layout=schema')
        await page.waitForTimeout(2000)
      }
    ]
  },

  // Data binding errors
  {
    name: 'Data Binding Race Condition',
    description: 'Rapid data updates causing race conditions',
    category: 'race-condition',
    steps: [
      async (page) => {
        await page.goto('/products')
        await page.evaluate(() => {
          // Trigger rapid state updates
          for (let i = 0; i < 100; i++) {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('data-update', {
                detail: { data: Array(100).fill({ id: i }) }
              }))
            }, i * 10)
          }
        })
        await page.waitForTimeout(2000)
      }
    ]
  },

  // Memory leak scenario
  {
    name: 'Memory Leak in Schema Rendering',
    description: 'Continuous schema updates without cleanup',
    category: 'memory',
    steps: [
      async (page) => {
        await page.goto('/products?layout=schema')
        await page.evaluate(() => {
          // Create memory leak by not cleaning up
          const intervals: number[] = []
          for (let i = 0; i < 50; i++) {
            intervals.push(window.setInterval(() => {
              const largeData = new Array(10000).fill({ data: 'leak' })
              window.dispatchEvent(new CustomEvent('schema-update', {
                detail: largeData
              }))
            }, 100))
          }
          // Don't clear intervals - intentional leak
        })
        await page.waitForTimeout(5000)
      }
    ]
  },

  // Render mode switching errors
  {
    name: 'Rapid Mode Switching',
    description: 'Quick switches between slots and schema modes',
    category: 'race-condition',
    steps: [
      async (page) => {
        for (let i = 0; i < 10; i++) {
          await page.goto(`/products?layout=${i % 2 === 0 ? 'slots' : 'schema'}`)
          await page.waitForTimeout(200)
        }
      }
    ]
  },

  // Schema migration errors
  {
    name: 'Schema Version Mismatch',
    description: 'Load incompatible schema version',
    category: 'schema',
    steps: [
      async (page) => {
        await page.goto('/products?layout=schema')
        await page.evaluate(() => {
          // Inject schema with wrong version
          (window as any).__MOCK_SCHEMA__ = {
            version: '99.0.0',
            layout: {}
          }
          window.dispatchEvent(new Event('schema-load'))
        })
      }
    ]
  },

  // TanStack Query integration errors
  {
    name: 'Query Cache Corruption',
    description: 'Corrupt TanStack Query cache',
    category: 'data-binding',
    steps: [
      async (page) => {
        await page.goto('/products')
        await page.evaluate(() => {
          // Try to corrupt query cache
          const queryClient = (window as any).__REACT_QUERY_CLIENT__
          if (queryClient) {
            queryClient.setQueryData(['products'], null)
            queryClient.setQueryData(['products'], undefined)
            queryClient.setQueryData(['products'], { invalid: true })
          }
        })
        await page.waitForTimeout(1000)
      }
    ]
  }
]

// Export test runner
export async function runErrorScenarioTests(page: Page): Promise<string> {
  const tester = new ErrorScenarioTester()

  console.log('Starting Error Scenario Tests...')
  console.log(`Testing ${errorScenarios.length} error scenarios\\n`)

  // Set up error monitoring
  await tester.setupErrorMonitoring(page)

  for (const scenario of errorScenarios) {
    try {
      const report = await tester.testScenario(page, scenario)

      const status = report.reproduced ? '❌ Reproduced' : '✅ Not reproduced'
      console.log(`${status}: ${scenario.name} (${report.frequency.toFixed(1)}% frequency)`)

      if (report.rootCause) {
        console.log(`  Root cause: ${report.rootCause}`)
      }
    } catch (error) {
      console.error(`Failed to test scenario ${scenario.name}:`, error)
    }
  }

  return tester.generateReport()
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

    const report = await runErrorScenarioTests(page)
    console.log('\\n' + report)

    await browser.close()

    // Save report
    const fs = require('fs')
    fs.writeFileSync('error-scenario-test-report.md', report)
    console.log('Report saved to error-scenario-test-report.md')
  })()
}