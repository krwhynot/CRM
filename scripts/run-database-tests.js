#!/usr/bin/env node

/**
 * Database Integration Test Runner
 * 
 * This script orchestrates the execution of database integration tests
 * and provides comprehensive reporting on database health and schema compliance.
 */

import { execSync } from 'child_process'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const TEST_RESULTS_DIR = 'test-results'
const REPORTS_DIR = 'reports'

// Ensure directories exist
if (!existsSync(TEST_RESULTS_DIR)) {
  mkdirSync(TEST_RESULTS_DIR, { recursive: true })
}
if (!existsSync(REPORTS_DIR)) {
  mkdirSync(REPORTS_DIR, { recursive: true })
}

const testSuites = [
  {
    name: 'Schema Validation',
    command: 'npm run test:database -- src/test/database/schema-validation.test.ts --reporter=json',
    output: 'schema-validation-results.json',
    critical: true
  },
  {
    name: 'Organizations CRUD',
    command: 'npm run test:database -- src/test/database/organizations-crud.test.ts --reporter=json',
    output: 'organizations-crud-results.json',
    critical: true
  },
  {
    name: 'Contacts CRUD',
    command: 'npm run test:database -- src/test/database/contacts-crud.test.ts --reporter=json',
    output: 'contacts-crud-results.json',
    critical: true
  },
  {
    name: 'Constraint Validation',
    command: 'npm run test:database -- src/test/database/constraint-validation.test.ts --reporter=json',
    output: 'constraint-validation-results.json',
    critical: true
  },
  {
    name: 'Form Integration',
    command: 'npm run test:integration -- --reporter=json',
    output: 'form-integration-results.json',
    critical: false
  }
]

async function runTest(testSuite) {
  console.log(`\n🧪 Running ${testSuite.name}...`)
  
  try {
    const result = execSync(testSuite.command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    const outputPath = join(TEST_RESULTS_DIR, testSuite.output)
    writeFileSync(outputPath, result)
    
    console.log(`✅ ${testSuite.name} completed successfully`)
    return { success: true, output: result, error: null }
  } catch (error) {
    console.log(`❌ ${testSuite.name} failed`)
    console.log(`Error: ${error.message}`)
    
    const outputPath = join(TEST_RESULTS_DIR, testSuite.output.replace('.json', '-error.json'))
    writeFileSync(outputPath, JSON.stringify({
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    }, null, 2))
    
    return { success: false, output: null, error: error.message }
  }
}

function generateReport(results) {
  const timestamp = new Date().toISOString()
  const totalTests = results.length
  const passedTests = results.filter(r => r.success).length
  const failedTests = totalTests - passedTests
  const criticalFailures = results.filter(r => !r.success && testSuites.find(t => t.name === r.name)?.critical).length
  
  const report = {
    timestamp,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      criticalFailures,
      status: criticalFailures > 0 ? 'CRITICAL' : failedTests > 0 ? 'WARNING' : 'HEALTHY'
    },
    results: results.map(r => ({
      name: r.name,
      status: r.success ? 'PASS' : 'FAIL',
      critical: testSuites.find(t => t.name === r.name)?.critical || false,
      error: r.error
    })),
    recommendations: generateRecommendations(results)
  }
  
  // Write JSON report
  const jsonReportPath = join(REPORTS_DIR, `database-integration-report-${Date.now()}.json`)
  writeFileSync(jsonReportPath, JSON.stringify(report, null, 2))
  
  // Write markdown report
  const markdownReport = generateMarkdownReport(report)
  const mdReportPath = join(REPORTS_DIR, `database-integration-report-${Date.now()}.md`)
  writeFileSync(mdReportPath, markdownReport)
  
  console.log(`\n📊 Reports generated:`)
  console.log(`  - JSON: ${jsonReportPath}`)
  console.log(`  - Markdown: ${mdReportPath}`)
  
  return report
}

function generateRecommendations(results) {
  const recommendations = []
  
  const failedTests = results.filter(r => !r.success)
  
  if (failedTests.some(t => t.name === 'Schema Validation')) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Database schema validation failed',
      action: 'Check for schema drift between database and TypeScript types. Run database migrations and regenerate types.'
    })
  }
  
  if (failedTests.some(t => t.name.includes('CRUD'))) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'CRUD operations failing',
      action: 'Review database constraints and permissions. Check for foreign key violations or missing required fields.'
    })
  }
  
  if (failedTests.some(t => t.name === 'Constraint Validation')) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Database constraint validation failed',
      action: 'Review database constraints and ensure they match application validation rules.'
    })
  }
  
  if (failedTests.some(t => t.name === 'Form Integration')) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Form integration tests failed',
      action: 'Check form validation schemas against database constraints. Ensure enum values are synchronized.'
    })
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'INFO',
      issue: 'All tests passed',
      action: 'Database integration is healthy. Continue regular monitoring.'
    })
  }
  
  return recommendations
}

function generateMarkdownReport(report) {
  const statusEmoji = {
    'HEALTHY': '✅',
    'WARNING': '⚠️',
    'CRITICAL': '🚨'
  }
  
  return `# Database Integration Test Report

${statusEmoji[report.summary.status]} **Status: ${report.summary.status}**

**Generated:** ${report.timestamp}

## Summary

- **Total Tests:** ${report.summary.total}
- **Passed:** ${report.summary.passed}
- **Failed:** ${report.summary.failed}
- **Critical Failures:** ${report.summary.criticalFailures}

## Test Results

${report.results.map(r => {
  const status = r.status === 'PASS' ? '✅' : '❌'
  const critical = r.critical ? ' (Critical)' : ''
  return `- ${status} **${r.name}**${critical}${r.error ? `\n  Error: ${r.error}` : ''}`
}).join('\n')}

## Recommendations

${report.recommendations.map(r => 
  `### ${r.priority} Priority: ${r.issue}\n${r.action}\n`
).join('\n')}

## Next Steps

${report.summary.status === 'CRITICAL' ? 
  '🚨 **Immediate action required!** Critical database integration failures detected. Do not deploy until issues are resolved.' :
  report.summary.status === 'WARNING' ?
  '⚠️ **Review recommended.** Some tests failed but no critical issues detected. Review failures before next deployment.' :
  '✅ **All systems healthy.** Database integration is working correctly.'
}

---
*Generated by Database Integration Test Suite*`
}

async function main() {
  console.log('🚀 Starting Database Integration Test Suite...')
  console.log(`Testing ${testSuites.length} test suites`)
  
  const results = []
  
  for (const testSuite of testSuites) {
    const result = await runTest(testSuite)
    results.push({
      name: testSuite.name,
      success: result.success,
      error: result.error
    })
  }
  
  console.log('\n📊 Generating reports...')
  const report = generateReport(results)
  
  console.log('\n🎯 Test Summary:')
  console.log(`Status: ${report.summary.status}`)
  console.log(`Passed: ${report.summary.passed}/${report.summary.total}`)
  
  if (report.summary.criticalFailures > 0) {
    console.log('\n🚨 Critical failures detected!')
    process.exit(1)
  } else if (report.summary.failed > 0) {
    console.log('\n⚠️ Some tests failed (non-critical)')
    process.exit(0)
  } else {
    console.log('\n✅ All tests passed!')
    process.exit(0)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error)
    process.exit(1)
  })
}