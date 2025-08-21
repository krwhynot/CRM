/**
 * Production-Safe MCP Playwright Validation
 * Read-only tests for multi-principal opportunity system validation
 */

import { test, expect } from '@playwright/test'

// Production-safe configuration
const config = {
  baseURL: 'https://crm.kjrcloud.com',
  timeout: 15000
}

test.describe('Production-Safe CRM System Validation', () => {
  test('Application loads and shows login form', async ({ page }) => {
    await page.goto(config.baseURL)
    
    // Should show login or be authenticated
    const hasLogin = await page.locator('[data-testid="login-form"]').isVisible()
    const hasDashboard = await page.locator('[data-testid="dashboard"]').isVisible()
    
    expect(hasLogin || hasDashboard).toBe(true)
  })

  test('Navigation structure includes opportunities section', async ({ page }) => {
    await page.goto(config.baseURL)
    
    // Check if opportunities navigation exists
    const opportunitiesNav = page.locator('nav').locator('text=Opportunities')
    await expect(opportunitiesNav.or(page.locator('[href*="opportunities"]'))).toBeVisible()
  })

  test('Multi-principal opportunity form route accessibility', async ({ page }) => {
    const response = await page.goto(`${config.baseURL}/opportunities/new-multi-principal`, {
      waitUntil: 'networkidle'
    })
    
    // Should either show form (authenticated) or redirect to login
    expect(response.status()).toBeLessThan(500) // No server errors
    
    const hasForm = await page.locator('[data-testid="multi-principal-form"]').isVisible()
    const hasLogin = await page.locator('[data-testid="login-form"]').isVisible()
    const hasAuth = await page.locator('text=sign in').isVisible()
    
    expect(hasForm || hasLogin || hasAuth).toBe(true)
  })

  test('Database schema validation endpoints respond', async ({ page }) => {
    // Test that our new multi-principal endpoints exist
    const endpoints = [
      '/api/opportunities',
      '/api/organizations',
      '/api/opportunity-participants'
    ]
    
    for (const endpoint of endpoints) {
      const response = await page.request.get(`${config.baseURL}${endpoint}`, {
        failOnStatusCode: false
      })
      
      // Should either be authorized (200) or require auth (401/403)
      expect([200, 401, 403]).toContain(response.status())
    }
  })

  test('Performance baseline - page load under 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(config.baseURL, { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    console.log(`Page load time: ${loadTime}ms`)
    
    expect(loadTime).toBeLessThan(3000)
  })

  test('Mobile responsiveness - iPad viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto(config.baseURL)
    
    // Check that layout adapts to mobile
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Should not have horizontal scroll on iPad
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10) // Allow 10px tolerance
  })

  test('Security headers validation', async ({ page }) => {
    const response = await page.goto(config.baseURL)
    const headers = response.headers()
    
    // Check for basic security headers
    expect(headers['content-security-policy'] || headers['x-frame-options']).toBeDefined()
  })
})

test.describe('Schema Migration Validation', () => {
  test('New database tables accessible via API', async ({ page }) => {
    // Test that opportunity_participants table is accessible
    const response = await page.request.get(`${config.baseURL}/api/opportunity-participants?limit=1`, {
      failOnStatusCode: false
    })
    
    // Should exist (even if auth required)
    expect(response.status()).not.toBe(404)
  })

  test('Multi-principal form components load without errors', async ({ page }) => {
    await page.goto(`${config.baseURL}/opportunities/new-multi-principal`)
    
    // Check console for JavaScript errors
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.waitForTimeout(2000) // Allow time for any async loading
    
    // Filter out known third-party errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('google') &&
      !error.includes('analytics')
    )
    
    expect(criticalErrors.length).toBe(0)
  })
})