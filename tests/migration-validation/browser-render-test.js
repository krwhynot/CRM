/**
 * Browser-based Render Mode Test
 * Tests the dual-mode rendering system in actual browser
 */

const { chromium } = require('playwright')

async function testRenderModes() {
  console.log('🚀 Starting Browser Render Mode Tests...')

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  // Track console errors
  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  // Track network failures
  const networkErrors = []
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()
    })
  })

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }

  try {
    // Test 1: Basic page load
    console.log('📋 Test 1: Basic page load')
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const title = await page.title()
    const test1 = {
      name: 'Basic page load',
      passed: title !== undefined && consoleErrors.length === 0,
      errors: [...consoleErrors]
    }
    results.tests.push(test1)
    if (test1.passed) results.passed++; else results.failed++
    console.log(test1.passed ? '✅ Passed' : '❌ Failed')

    // Test 2: Products page with slots mode
    console.log('📋 Test 2: Products page - slots mode')
    consoleErrors.length = 0
    await page.goto('http://localhost:5173/products?layout=slots', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Check for page content
    const slotsContent = await page.content()
    const test2 = {
      name: 'Products page - slots mode',
      passed: slotsContent.includes('Products') || slotsContent.includes('products'),
      hasErrors: consoleErrors.length > 0,
      errors: [...consoleErrors]
    }
    results.tests.push(test2)
    if (test2.passed && !test2.hasErrors) results.passed++; else results.failed++
    console.log(test2.passed && !test2.hasErrors ? '✅ Passed' : '❌ Failed')

    // Test 3: Products page with schema mode
    console.log('📋 Test 3: Products page - schema mode')
    consoleErrors.length = 0
    await page.goto('http://localhost:5173/products?layout=schema', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const schemaContent = await page.content()
    const test3 = {
      name: 'Products page - schema mode',
      passed: schemaContent.includes('Products') || schemaContent.includes('products'),
      hasErrors: consoleErrors.length > 0,
      errors: [...consoleErrors]
    }
    results.tests.push(test3)
    if (test3.passed && !test3.hasErrors) results.passed++; else results.failed++
    console.log(test3.passed && !test3.hasErrors ? '✅ Passed' : '❌ Failed')

    // Test 4: Check for render mode toggle (dev mode)
    console.log('📋 Test 4: Render mode toggle visibility')
    const modeToggle = await page.$('.fixed.bottom-4.right-4')
    const test4 = {
      name: 'Render mode toggle (dev)',
      passed: modeToggle !== null,
      note: 'Toggle only visible in development mode'
    }
    results.tests.push(test4)
    if (test4.passed) results.passed++; else results.failed++
    console.log(test4.passed ? '✅ Passed' : '❌ Failed')

    // Test 5: Auto mode fallback
    console.log('📋 Test 5: Auto mode fallback')
    consoleErrors.length = 0
    await page.goto('http://localhost:5173/products?layout=auto', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const autoContent = await page.content()
    const test5 = {
      name: 'Products page - auto mode',
      passed: autoContent.includes('Products') || autoContent.includes('products'),
      hasErrors: consoleErrors.length > 0,
      errors: [...consoleErrors]
    }
    results.tests.push(test5)
    if (test5.passed && !test5.hasErrors) results.passed++; else results.failed++
    console.log(test5.passed && !test5.hasErrors ? '✅ Passed' : '❌ Failed')

    // Test 6: Performance - measure load times
    console.log('📋 Test 6: Performance measurement')
    const perfStart = Date.now()
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - perfStart

    const test6 = {
      name: 'Page load performance',
      passed: loadTime < 3000, // Should load within 3 seconds
      loadTime: loadTime,
      threshold: 3000
    }
    results.tests.push(test6)
    if (test6.passed) results.passed++; else results.failed++
    console.log(test6.passed ? `✅ Passed (${loadTime}ms)` : `❌ Failed (${loadTime}ms)`)

    // Test 7: Check for critical errors
    console.log('📋 Test 7: Critical error check')
    const test7 = {
      name: 'No critical errors',
      passed: networkErrors.length === 0,
      networkErrors: networkErrors
    }
    results.tests.push(test7)
    if (test7.passed) results.passed++; else results.failed++
    console.log(test7.passed ? '✅ Passed' : '❌ Failed')

  } catch (error) {
    console.error('Test execution error:', error)
    results.error = error.message
  } finally {
    await browser.close()
  }

  // Generate report
  console.log('\n' + '='.repeat(50))
  console.log('📊 RENDER MODE TEST RESULTS')
  console.log('='.repeat(50))
  console.log(`Total Tests: ${results.tests.length}`)
  console.log(`Passed: ${results.passed} (${Math.round((results.passed / results.tests.length) * 100)}%)`)
  console.log(`Failed: ${results.failed}`)

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.tests.filter(t => !t.passed || t.hasErrors).forEach(test => {
      console.log(`  - ${test.name}`)
      if (test.errors && test.errors.length > 0) {
        console.log(`    Errors: ${test.errors.join(', ')}`)
      }
    })
  }

  console.log('='.repeat(50) + '\n')

  return results
}

// Run the test
testRenderModes()
  .then(results => {
    process.exit(results.failed > 0 ? 1 : 0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })