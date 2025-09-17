/**
 * Comprehensive Migration Validation Test Runner
 * Executes all test suites and generates a unified report
 */

import { chromium, Browser, Page } from 'playwright'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// Import test runners
import { runRenderModeTests } from './test-render-modes'
import { runPerformanceScaleTests } from './test-performance-scale'
import { runErrorScenarioTests } from './test-error-scenarios'

interface TestSuiteResult {
  name: string
  duration: number
  passed: boolean
  score: number
  issues: string[]
  report: string
}

interface MigrationValidationReport {
  timestamp: string
  overallStatus: 'PASSED' | 'FAILED' | 'WARNING'
  overallScore: number
  testSuites: TestSuiteResult[]
  criticalIssues: string[]
  recommendations: string[]
  summary: {
    totalTests: number
    passedTests: number
    failedTests: number
    totalDuration: number
  }
}

class MigrationTestRunner {
  private browser: Browser | null = null
  private page: Page | null = null
  private results: TestSuiteResult[] = []

  /**
   * Initialize test environment
   */
  async setup(): Promise<void> {
    console.log('🚀 Setting up test environment...')

    try {
      // Start development server if not running
      try {
        const response = await fetch('http://localhost:5173')
        if (!response.ok) throw new Error('Server not ready')
      } catch {
        console.log('Starting development server...')
        execSync('npm run dev &', { stdio: 'inherit', timeout: 10000 })
        // Wait for server to start
        await this.waitForServer()
      }

      // Launch browser
      this.browser = await chromium.launch({
        headless: process.env.CI === 'true',
        devtools: process.env.CI !== 'true'
      })

      const context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
          dir: 'test-results/videos/'
        }
      })

      this.page = await context.newPage()
      await this.page.goto('http://localhost:5173')

      console.log('✅ Test environment ready')
    } catch (error) {
      console.error('❌ Failed to setup test environment:', error)
      throw error
    }
  }

  /**
   * Wait for development server to be ready
   */
  private async waitForServer(maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch('http://localhost:5173')
        if (response.ok) return
      } catch {}

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    throw new Error('Development server failed to start')
  }

  /**
   * Run smoke tests using Vitest
   */
  private async runSmokeTests(): Promise<TestSuiteResult> {
    console.log('🧪 Running smoke tests...')
    const startTime = Date.now()

    try {
      const result = execSync('npm run test:backend -- tests/migration-validation/smoke-tests.test.ts', {
        encoding: 'utf8',
        timeout: 60000
      })

      const duration = Date.now() - startTime
      const passed = !result.includes('failed') && !result.includes('error')

      return {
        name: 'Smoke Tests',
        duration,
        passed,
        score: passed ? 100 : 0,
        issues: passed ? [] : ['Some smoke tests failed - check detailed logs'],
        report: result
      }
    } catch (error) {
      return {
        name: 'Smoke Tests',
        duration: Date.now() - startTime,
        passed: false,
        score: 0,
        issues: ['Smoke tests execution failed'],
        report: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Run component registry tests using Vitest
   */
  private async runRegistryTests(): Promise<TestSuiteResult> {
    console.log('🔧 Running component registry tests...')
    const startTime = Date.now()

    try {
      const result = execSync('npm run test:backend -- tests/migration-validation/component-registry.test.ts', {
        encoding: 'utf8',
        timeout: 60000
      })

      const duration = Date.now() - startTime
      const passed = !result.includes('failed') && !result.includes('error')

      return {
        name: 'Component Registry Tests',
        duration,
        passed,
        score: passed ? 100 : 0,
        issues: passed ? [] : ['Registry tests failed'],
        report: result
      }
    } catch (error) {
      return {
        name: 'Component Registry Tests',
        duration: Date.now() - startTime,
        passed: false,
        score: 0,
        issues: ['Registry tests execution failed'],
        report: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Run backward compatibility tests using Vitest
   */
  private async runCompatibilityTests(): Promise<TestSuiteResult> {
    console.log('🔄 Running backward compatibility tests...')
    const startTime = Date.now()

    try {
      const result = execSync('npm run test:backend -- tests/migration-validation/backward-compatibility.test.ts', {
        encoding: 'utf8',
        timeout: 90000
      })

      const duration = Date.now() - startTime
      const passed = !result.includes('failed') && !result.includes('error')

      return {
        name: 'Backward Compatibility Tests',
        duration,
        passed,
        score: passed ? 100 : 0,
        issues: passed ? [] : ['Backward compatibility issues detected'],
        report: result
      }
    } catch (error) {
      return {
        name: 'Backward Compatibility Tests',
        duration: Date.now() - startTime,
        passed: false,
        score: 0,
        issues: ['Compatibility tests execution failed'],
        report: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Run data binding tests using Vitest
   */
  private async runDataBindingTests(): Promise<TestSuiteResult> {
    console.log('🔗 Running data binding tests...')
    const startTime = Date.now()

    try {
      const result = execSync('npm run test:backend -- tests/migration-validation/data-binding-integration.test.ts', {
        encoding: 'utf8',
        timeout: 90000
      })

      const duration = Date.now() - startTime
      const passed = !result.includes('failed') && !result.includes('error')

      return {
        name: 'Data Binding Integration Tests',
        duration,
        passed,
        score: passed ? 100 : 0,
        issues: passed ? [] : ['Data binding issues detected'],
        report: result
      }
    } catch (error) {
      return {
        name: 'Data Binding Integration Tests',
        duration: Date.now() - startTime,
        passed: false,
        score: 0,
        issues: ['Data binding tests execution failed'],
        report: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Run all test suites
   */
  async runAllTests(): Promise<void> {
    if (!this.page) throw new Error('Test environment not initialized')

    console.log('📊 Running comprehensive migration validation tests...')

    try {
      // 1. Unit tests via Vitest
      this.results.push(await this.runSmokeTests())
      this.results.push(await this.runRegistryTests())
      this.results.push(await this.runCompatibilityTests())
      this.results.push(await this.runDataBindingTests())

      // 2. Browser-based integration tests
      console.log('🌐 Running browser-based tests...')

      // Render mode tests
      const renderModeStartTime = Date.now()
      try {
        const renderReport = await runRenderModeTests(this.page)
        this.results.push({
          name: 'Render Mode Tests',
          duration: Date.now() - renderModeStartTime,
          passed: !renderReport.includes('⚠️') && !renderReport.includes('❌'),
          score: this.calculateScoreFromReport(renderReport),
          issues: this.extractIssuesFromReport(renderReport),
          report: renderReport
        })
      } catch (error) {
        this.results.push({
          name: 'Render Mode Tests',
          duration: Date.now() - renderModeStartTime,
          passed: false,
          score: 0,
          issues: ['Render mode tests failed to execute'],
          report: error instanceof Error ? error.message : String(error)
        })
      }

      // Performance scale tests
      const perfStartTime = Date.now()
      try {
        const perfReport = await runPerformanceScaleTests(this.page)
        this.results.push({
          name: 'Performance Scale Tests',
          duration: Date.now() - perfStartTime,
          passed: !perfReport.includes('⚠️') && !perfReport.includes('❌'),
          score: this.calculateScoreFromReport(perfReport),
          issues: this.extractIssuesFromReport(perfReport),
          report: perfReport
        })
      } catch (error) {
        this.results.push({
          name: 'Performance Scale Tests',
          duration: Date.now() - perfStartTime,
          passed: false,
          score: 0,
          issues: ['Performance tests failed to execute'],
          report: error instanceof Error ? error.message : String(error)
        })
      }

      // Error scenario tests
      const errorStartTime = Date.now()
      try {
        const errorReport = await runErrorScenarioTests(this.page)
        this.results.push({
          name: 'Error Scenario Tests',
          duration: Date.now() - errorStartTime,
          passed: !errorReport.includes('critical') && !errorReport.includes('high'),
          score: this.calculateScoreFromReport(errorReport),
          issues: this.extractIssuesFromReport(errorReport),
          report: errorReport
        })
      } catch (error) {
        this.results.push({
          name: 'Error Scenario Tests',
          duration: Date.now() - errorStartTime,
          passed: false,
          score: 0,
          issues: ['Error scenario tests failed to execute'],
          report: error instanceof Error ? error.message : String(error)
        })
      }

    } catch (error) {
      console.error('❌ Test execution failed:', error)
      throw error
    }
  }

  /**
   * Calculate score from report content
   */
  private calculateScoreFromReport(report: string): number {
    const issues = (report.match(/⚠️|❌|critical|high/gi) || []).length
    const passes = (report.match(/✅|pass/gi) || []).length

    if (passes === 0 && issues === 0) return 50 // Unknown status
    if (issues === 0) return 100 // All good
    if (passes === 0) return 0 // All bad

    // Score based on pass/issue ratio
    return Math.max(0, Math.min(100, (passes / (passes + issues)) * 100))
  }

  /**
   * Extract issues from report
   */
  private extractIssuesFromReport(report: string): string[] {
    const issues: string[] = []

    const lines = report.split('\\n')
    for (const line of lines) {
      if (line.includes('⚠️') || line.includes('❌') || line.includes('critical') || line.includes('high')) {
        issues.push(line.trim())
      }
    }

    return issues
  }

  /**
   * Generate comprehensive migration validation report
   */
  generateReport(): MigrationValidationReport {
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    // Calculate overall score
    const overallScore = this.results.length > 0
      ? this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length
      : 0

    // Determine overall status
    let overallStatus: 'PASSED' | 'FAILED' | 'WARNING'
    if (overallScore >= 90) {
      overallStatus = 'PASSED'
    } else if (overallScore >= 70) {
      overallStatus = 'WARNING'
    } else {
      overallStatus = 'FAILED'
    }

    // Collect critical issues
    const criticalIssues = this.results
      .flatMap(r => r.issues)
      .filter(issue =>
        issue.includes('critical') ||
        issue.includes('failed') ||
        issue.includes('compatibility')
      )

    // Generate recommendations
    const recommendations = this.generateRecommendations()

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      overallScore: Math.round(overallScore),
      testSuites: this.results,
      criticalIssues,
      recommendations,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        totalDuration
      }
    }
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    const failedSuites = this.results.filter(r => !r.passed)

    if (failedSuites.some(s => s.name.includes('Smoke'))) {
      recommendations.push('Critical: Fix basic functionality issues before proceeding')
    }

    if (failedSuites.some(s => s.name.includes('Compatibility'))) {
      recommendations.push('High: Address backward compatibility issues to maintain user trust')
    }

    if (failedSuites.some(s => s.name.includes('Performance'))) {
      recommendations.push('High: Optimize performance, especially virtualization at 500+ rows')
    }

    if (failedSuites.some(s => s.name.includes('Error'))) {
      recommendations.push('Medium: Improve error handling and edge case management')
    }

    if (failedSuites.some(s => s.name.includes('Registry'))) {
      recommendations.push('Medium: Fix component registry issues for schema-driven features')
    }

    if (this.results.every(r => r.passed)) {
      recommendations.push('Excellent: Migration appears successful. Consider gradual rollout.')
    }

    return recommendations
  }

  /**
   * Save reports to files
   */
  async saveReports(report: MigrationValidationReport): Promise<void> {
    const reportsDir = 'test-results/migration-validation'
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Save comprehensive JSON report
    fs.writeFileSync(
      path.join(reportsDir, 'migration-validation-report.json'),
      JSON.stringify(report, null, 2)
    )

    // Save markdown summary
    const markdownReport = this.generateMarkdownReport(report)
    fs.writeFileSync(
      path.join(reportsDir, 'migration-validation-summary.md'),
      markdownReport
    )

    // Save individual test reports
    for (const suite of this.results) {
      const filename = suite.name.toLowerCase().replace(/\\s+/g, '-') + '-report.md'
      fs.writeFileSync(
        path.join(reportsDir, filename),
        suite.report
      )
    }

    console.log(`📋 Reports saved to ${reportsDir}`)
  }

  /**
   * Generate markdown summary report
   */
  private generateMarkdownReport(report: MigrationValidationReport): string {
    let md = '# Layout-as-Data Migration Validation Report\\n\\n'

    // Executive Summary
    md += `## Executive Summary\\n\\n`
    md += `**Overall Status:** ${report.overallStatus} (${report.overallScore}%)\\n`
    md += `**Test Date:** ${new Date(report.timestamp).toLocaleString()}\\n`
    md += `**Total Test Duration:** ${Math.round(report.summary.totalDuration / 1000)}s\\n\\n`

    // Status indicator
    const statusEmoji = report.overallStatus === 'PASSED' ? '✅' :
                       report.overallStatus === 'WARNING' ? '⚠️' : '❌'

    md += `${statusEmoji} **Migration Status: ${report.overallStatus}**\\n\\n`

    // Quick Stats
    md += `## Quick Stats\\n\\n`
    md += `- **Tests Passed:** ${report.summary.passedTests}/${report.summary.totalTests} (${Math.round((report.summary.passedTests / report.summary.totalTests) * 100)}%)\\n`
    md += `- **Tests Failed:** ${report.summary.failedTests}\\n`
    md += `- **Overall Score:** ${report.overallScore}%\\n\\n`

    // Test Results Summary
    md += `## Test Results Summary\\n\\n`
    md += `| Test Suite | Status | Score | Duration | Issues |\\n`
    md += `|------------|--------|-------|----------|--------|\\n`

    for (const suite of report.testSuites) {
      const status = suite.passed ? '✅' : '❌'
      const duration = Math.round(suite.duration / 1000)
      const issueCount = suite.issues.length

      md += `| ${suite.name} | ${status} | ${suite.score}% | ${duration}s | ${issueCount} |\\n`
    }

    md += '\\n'

    // Critical Issues
    if (report.criticalIssues.length > 0) {
      md += `## ⚠️ Critical Issues\\n\\n`
      for (const issue of report.criticalIssues) {
        md += `- ${issue}\\n`
      }
      md += '\\n'
    }

    // Recommendations
    md += `## Recommendations\\n\\n`
    for (const rec of report.recommendations) {
      md += `- ${rec}\\n`
    }
    md += '\\n'

    // Migration Decision
    md += `## Migration Decision Recommendation\\n\\n`

    if (report.overallScore >= 90) {
      md += `🟢 **PROCEED WITH MIGRATION**\\n\\n`
      md += `The migration validation shows excellent results. The system is ready for production deployment.\\n\\n`
    } else if (report.overallScore >= 70) {
      md += `🟡 **PROCEED WITH CAUTION**\\n\\n`
      md += `The migration shows acceptable results but has some issues. Consider addressing high-priority issues before full deployment.\\n\\n`
    } else {
      md += `🔴 **DO NOT PROCEED**\\n\\n`
      md += `The migration has significant issues that must be resolved before deployment. Review failed tests and address critical issues.\\n\\n`
    }

    return md
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close()
    }
    if (this.browser) {
      await this.browser.close()
    }
  }
}

/**
 * Main execution function
 */
export async function runMigrationValidation(): Promise<MigrationValidationReport> {
  const runner = new MigrationTestRunner()

  try {
    await runner.setup()
    await runner.runAllTests()

    const report = runner.generateReport()
    await runner.saveReports(report)

    return report
  } finally {
    await runner.cleanup()
  }
}

// CLI execution
if (require.main === module) {
  runMigrationValidation()
    .then((report) => {
      console.log('\\n' + '='.repeat(60))
      console.log('📊 MIGRATION VALIDATION COMPLETE')
      console.log('='.repeat(60))
      console.log(`Status: ${report.overallStatus} (${report.overallScore}%)`)
      console.log(`Passed: ${report.summary.passedTests}/${report.summary.totalTests}`)
      console.log(`Duration: ${Math.round(report.summary.totalDuration / 1000)}s`)

      if (report.criticalIssues.length > 0) {
        console.log(`\\n⚠️  Critical Issues: ${report.criticalIssues.length}`)
        report.criticalIssues.slice(0, 3).forEach(issue => {
          console.log(`   - ${issue}`)
        })
      }

      console.log('\\n📋 Detailed reports saved to test-results/migration-validation/')
      console.log('='.repeat(60) + '\\n')

      // Exit with appropriate code
      process.exit(report.overallStatus === 'FAILED' ? 1 : 0)
    })
    .catch((error) => {
      console.error('❌ Migration validation failed:', error)
      process.exit(1)
    })
}