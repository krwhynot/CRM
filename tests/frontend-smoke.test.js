// Simple frontend smoke test
import { test, expect } from '@playwright/test'

test.describe('Frontend Smoke Tests', () => {
  test('should load the main application', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    // Check if we can see some content (login page or dashboard)
    const pageContent = await page.textContent('body')
    expect(pageContent).toBeTruthy()
    
    // Log success
    console.log('✅ Frontend application loaded successfully')
  })

  test('should have proper page title', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('domcontentloaded')
    
    const title = await page.title()
    expect(title).toContain('Kitchen') // Should contain "Kitchen" from KitchenPantry CRM
    
    console.log(`📋 Page title: ${title}`)
  })

  test('should be responsive (mobile viewport)', async ({ page }) => {
    // Set mobile viewport (iPad dimensions)
    await page.setViewportSize({ width: 768, height: 1024 })
    
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Check if page renders without horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 50) // Allow small tolerance
    
    console.log('📱 Mobile responsiveness validated')
  })
})