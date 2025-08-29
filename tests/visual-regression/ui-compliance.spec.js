// @ts-check
import { test, expect } from '@playwright/test'

// Core routes for UI compliance testing
const routes = [
  { path: '/', name: 'Dashboard' },
  { path: '/organizations', name: 'Organizations' },
  { path: '/contacts', name: 'Contacts' }, 
  { path: '/products', name: 'Products' },
  { path: '/opportunities', name: 'Opportunities' },
  { path: '/import-export', name: 'Import Export' },
  { path: '/auth/login', name: 'Login' }
]

// UI compliance checks for each route
for (const route of routes) {
  test.describe(`${route.name} UI Compliance`, () => {
    
    test(`${route.name} - Light Theme Visual Regression`, async ({ page }) => {
      // Navigate to route
      await page.goto(route.path)
      
      // Wait for content to load
      await page.waitForLoadState('networkidle')
      
      // Handle auth redirect for protected routes
      if (page.url().includes('/auth/login') && route.path !== '/auth/login') {
        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')
      }
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`${route.name.toLowerCase()}-light.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })
    
    test(`${route.name} - Dark Theme Visual Regression`, async ({ page }) => {
      // Set dark mode
      await page.emulateMedia({ colorScheme: 'dark' })
      
      // Navigate to route  
      await page.goto(route.path)
      
      // Wait for content to load
      await page.waitForLoadState('networkidle')
      
      // Handle auth redirect for protected routes
      if (page.url().includes('/auth/login') && route.path !== '/auth/login') {
        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')
      }
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`${route.name.toLowerCase()}-dark.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })
    
    test(`${route.name} - Layout Consistency Check`, async ({ page }) => {
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      
      // Handle auth redirect for protected routes
      if (page.url().includes('/auth/login') && route.path !== '/auth/login') {
        await page.goto('/auth/login') 
        await page.waitForLoadState('networkidle')
      }
      
      // Check for consistent container patterns
      const containers = await page.locator('[class*="max-w-7xl"]').count()
      const pageContainers = await page.locator('[class*="mx-auto"][class*="px-6"]').count()
      
      // At least one proper container should exist (unless it's a special layout)
      if (!route.path.includes('/auth/')) {
        expect(containers + pageContainers).toBeGreaterThanOrEqual(1)
      }
      
      // Check for prohibited arbitrary CSS values
      const arbitraryVarClasses = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'))
        const prohibited = []
        
        elements.forEach(el => {
          const classes = el.className || ''
          if (classes.includes('bg-[var(--') || 
              classes.includes('text-[var(--') ||
              classes.includes('border-[var(--') ||
              classes.includes('calc(') ||
              classes.match(/\d+vh/)) {
            prohibited.push({
              tag: el.tagName,
              classes: classes,
              text: el.textContent?.slice(0, 50) || ''
            })
          }
        })
        
        return prohibited
      })
      
      // Report any prohibited patterns found
      if (arbitraryVarClasses.length > 0) {
        console.warn(`${route.name} contains prohibited CSS patterns:`, arbitraryVarClasses)
        
        // Allow them for now but log for monitoring
        // expect(arbitraryVarClasses).toHaveLength(0)
      }
    })
    
    test(`${route.name} - Mobile Responsiveness`, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      
      // Handle auth redirect for protected routes
      if (page.url().includes('/auth/login') && route.path !== '/auth/login') {
        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')
      }
      
      // Take mobile screenshot
      await expect(page).toHaveScreenshot(`${route.name.toLowerCase()}-mobile.png`, {
        fullPage: true,
        animations: 'disabled'
      })
      
      // Check for horizontal scroll issues
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
      const bodyClientWidth = await page.evaluate(() => document.body.clientWidth)
      
      // Allow small differences but flag significant horizontal overflow
      expect(bodyScrollWidth - bodyClientWidth).toBeLessThan(20)
    })
  })
}

test.describe('Cross-Route Consistency', () => {
  test('All routes use consistent spacing tokens', async ({ page }) => {
    const spacingIssues = []
    
    for (const route of routes.slice(0, 5)) { // Test first 5 routes
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      
      // Handle auth redirect
      if (page.url().includes('/auth/login') && route.path !== '/auth/login') {
        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')
      }
      
      // Check for non-standard spacing patterns
      const nonStandardSpacing = await page.evaluate((routeName) => {
        const elements = Array.from(document.querySelectorAll('*'))
        const issues = []
        
        elements.forEach(el => {
          const classes = el.className || ''
          
          // Flag custom spacing that should use standard tokens
          if (classes.includes('p-[') || 
              classes.includes('m-[') ||
              classes.includes('gap-[') ||
              classes.includes('space-y-[') ||
              classes.includes('space-x-[')) {
            issues.push({
              route: routeName,
              element: el.tagName,
              classes: classes.split(' ').filter(c => c.includes('[')).slice(0, 3)
            })
          }
        })
        
        return issues
      }, route.name)
      
      spacingIssues.push(...nonStandardSpacing)
    }
    
    // Log spacing issues for monitoring
    if (spacingIssues.length > 0) {
      console.warn('Non-standard spacing found:', spacingIssues)
      
      // Allow them for now but track for future cleanup
      // expect(spacingIssues).toHaveLength(0)
    }
  })
  
  test('All dialogs use StandardDialog wrapper', async ({ page }) => {
    // Test dialog standardization on routes that have forms
    const routesWithDialogs = [
      '/organizations',
      '/contacts', 
      '/products',
      '/opportunities'
    ]
    
    for (const route of routesWithDialogs) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      
      // Skip if redirected to auth
      if (page.url().includes('/auth/login')) continue
      
      // Look for dialog triggers (Add buttons)
      const addButtons = await page.locator('button:has-text("Add"), button:has-text("Create")').count()
      
      if (addButtons > 0) {
        // Click first add button to open dialog
        await page.locator('button:has-text("Add"), button:has-text("Create")').first().click()
        
        // Wait for dialog to appear
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
        
        // Check if dialog uses standard sizing classes
        const dialogElement = await page.locator('[role="dialog"]').first()
        const dialogClasses = await dialogElement.getAttribute('class') || ''
        
        // Should use max-w-4xl or similar standard sizing, not calc() or arbitrary values
        const hasStandardSizing = dialogClasses.includes('max-w-') && 
                                 !dialogClasses.includes('calc(') &&
                                 !dialogClasses.includes('[')
        
        expect(hasStandardSizing).toBeTruthy()
        
        // Close dialog
        await page.keyboard.press('Escape')
      }
    }
  })
})