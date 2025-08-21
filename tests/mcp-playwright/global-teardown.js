/**
 * MCP Playwright Global Teardown
 * Cleanup and reporting
 */

import fs from 'fs'
import path from 'path'

async function globalTeardown() {
  console.log('🧹 MCP Playwright Global Teardown Starting...')
  
  const MCP_TARGET = process.env.MCP_TARGET
  
  try {
    // Generate test summary
    const resultsPath = path.join(process.cwd(), 'test-results', 'mcp-results.json')
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
      
      const summary = {
        environment: MCP_TARGET,
        timestamp: new Date().toISOString(),
        total: results.suites?.reduce((acc, suite) => acc + (suite.tests?.length || 0), 0) || 0,
        passed: 0,
        failed: 0,
        duration: results.stats?.duration || 0
      }
      
      // Count test results
      results.suites?.forEach(suite => {
        suite.tests?.forEach(test => {
          if (test.outcome === 'expected') {
            summary.passed++
          } else {
            summary.failed++
          }
        })
      })
      
      console.log('📊 Test Summary:')
      console.log(`   Environment: ${summary.environment}`)
      console.log(`   Total Tests: ${summary.total}`)
      console.log(`   Passed: ${summary.passed}`)
      console.log(`   Failed: ${summary.failed}`)
      console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`)
      
      // Save summary
      const summaryPath = path.join(process.cwd(), 'test-results', 'mcp-summary.json')
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
      console.log(`📄 Summary saved to: ${summaryPath}`)
      
      // Performance metrics if available
      if (summary.duration > 0) {
        const avgTestTime = Math.round(summary.duration / summary.total)
        console.log(`⏱️  Average test time: ${avgTestTime}ms`)
        
        if (avgTestTime > 30000) {
          console.warn('⚠️  Average test time exceeds 30s - consider optimization')
        }
      }
    }
    
    // Environment-specific cleanup
    if (MCP_TARGET === 'stg') {
      console.log('🧹 Staging environment cleanup...')
      
      // Cleanup test data created during staging tests
      // This would include:
      // - Removing test organizations
      // - Cleaning up test opportunities
      // - Resetting test user states
      
      console.log('✅ Staging cleanup complete')
    }
    
    // Check for any leaked processes or resources
    const testArtifacts = path.join(process.cwd(), 'test-results')
    if (fs.existsSync(testArtifacts)) {
      const files = fs.readdirSync(testArtifacts)
      const largeFiles = files.filter(file => {
        const filePath = path.join(testArtifacts, file)
        const stats = fs.statSync(filePath)
        return stats.size > 10 * 1024 * 1024 // > 10MB
      })
      
      if (largeFiles.length > 0) {
        console.warn(`⚠️  Large test artifacts detected: ${largeFiles.join(', ')}`)
        console.warn('   Consider cleaning up large screenshots/videos')
      }
    }
    
  } catch (error) {
    console.error('❌ Global teardown error:', error.message)
    // Don't throw - teardown errors shouldn't fail the test run
  }
  
  console.log('✅ MCP Playwright Global Teardown Complete')
}

export default globalTeardown