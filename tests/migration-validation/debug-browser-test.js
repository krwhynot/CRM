/**
 * Debug Browser Test - Check what's actually being rendered
 */

const { chromium } = require('playwright')

async function debugBrowserTest() {
  console.log('🔍 Debug Browser Test...')

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  // Track console logs and errors
  page.on('console', msg => {
    console.log(`[Console ${msg.type()}]:`, msg.text())
  })

  try {
    // Test basic page
    console.log('\n📋 Loading home page...')
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const title = await page.title()
    console.log('Page title:', title)

    // Check what's visible
    const bodyText = await page.evaluate(() => document.body.innerText)
    console.log('Page content preview:', bodyText.substring(0, 200))

    // Check for authentication elements
    const hasAuth = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase()
      return text.includes('sign in') || text.includes('login') || text.includes('auth')
    })
    console.log('Has authentication UI:', hasAuth)

    // Try to navigate to products page
    console.log('\n📋 Attempting to load Products page...')
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const productsText = await page.evaluate(() => document.body.innerText)
    console.log('Products page content preview:', productsText.substring(0, 200))

    // Check for specific elements
    const hasProducts = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase()
      return text.includes('product')
    })
    console.log('Has products content:', hasProducts)

    // Check URL
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)

    // Check for render mode toggle
    const hasToggle = await page.evaluate(() => {
      return document.querySelector('.fixed.bottom-4.right-4') !== null
    })
    console.log('Has render mode toggle:', hasToggle)

    // Check for any error messages
    const errorElements = await page.$$eval('[class*="error"], [class*="Error"]', els =>
      els.map(el => el.textContent)
    )
    if (errorElements.length > 0) {
      console.log('Error messages found:', errorElements)
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png' })
    console.log('Screenshot saved to debug-screenshot.png')

  } catch (error) {
    console.error('Debug test error:', error)
  } finally {
    await browser.close()
  }
}

// Run the debug test
debugBrowserTest()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })