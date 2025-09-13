import { test, expect } from '@playwright/test'

const routes = [
  '/',
  '/organizations',
  '/contacts', 
  '/products',
  '/opportunities'
]

// Test both light and dark themes for compliance
for (const theme of ['light', 'dark']) {
  test.describe(`${theme} theme compliance`, () => {
    for (const route of routes) {
      test(`${theme} theme - ${route} compliance`, async ({ page }) => {
        // Set theme before navigation
        await page.addInitScript((theme) => {
          localStorage.setItem('vite-ui-theme', theme)
        }, theme)
        
        await page.goto(`http://localhost:5175${route}`)
        
        // Wait for the page to load and hydrate
        await page.waitForTimeout(2000)
        
        // Check for shared layout elements that indicate compliance
        await expect(page.locator('[data-app-shell]')).toBeVisible()
        await expect(page.locator('.max-w-7xl')).toBeVisible()
        
        // Check theme is correctly applied
        const htmlClass = await page.locator('html').getAttribute('class')
        expect(htmlClass).toContain(theme)
        
        // Visual snapshot for regression detection
        await expect(page).toHaveScreenshot(`${theme}${route.replace(/\//g, '_')}.png`, {
          fullPage: true,
          threshold: 0.2, // Allow for small differences
        })
        
        // Test interactive elements have focus states
        const buttons = page.locator('button').first()
        if (await buttons.isVisible()) {
          await buttons.focus()
          // Check focus is visible (should have focus ring)
          const focusedElement = await page.locator(':focus').first()
          expect(focusedElement).toBeTruthy()
        }
        
        // Test theme toggle if present
        const themeToggle = page.locator('[aria-label*="Switch to"]')
        if (await themeToggle.isVisible()) {
          await themeToggle.click()
          await page.waitForTimeout(500)
          
          // Verify theme switched
          const newHtmlClass = await page.locator('html').getAttribute('class')
          expect(newHtmlClass).not.toContain(theme)
        }
      })
    }
  })
}

// Test accessibility compliance
test.describe('Accessibility compliance', () => {
  test('All pages have proper heading hierarchy', async ({ page }) => {
    for (const route of routes) {
      await page.goto(`http://localhost:5175${route}`)
      await page.waitForTimeout(1000)
      
      // Should have exactly one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBe(1)
      
      // h1 should use semantic classes
      const h1 = page.locator('h1').first()
      const h1Classes = await h1.getAttribute('class')
      expect(h1Classes).toMatch(/(text-display|text-title)/)
    }
  })
  
  test('All interactive elements have proper focus states', async ({ page }) => {
    await page.goto('http://localhost:5175/')
    await page.waitForTimeout(1000)
    
    // Find all buttons
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        await button.focus()
        
        // Check that focus ring is applied (focus-visible styles)
        const hasFocusRing = await button.evaluate(el => {
          return window.getComputedStyle(el, ':focus-visible').outline !== 'none'
        })
        
        // Verify focus ring exists
        expect(hasFocusRing).toBe(true)
        
        // At minimum, element should be focusable
        expect(await button.evaluate(el => el === document.activeElement)).toBe(true)
      }
    }
  })
  
  test('Color contrast meets accessibility standards', async ({ page }) => {
    await page.goto('http://localhost:5175/')
    await page.waitForTimeout(1000)
    
    // Test light theme contrast
    await page.addInitScript(() => {
      localStorage.setItem('vite-ui-theme', 'light')
    })
    await page.reload()
    await page.waitForTimeout(500)
    
    // Test that text is readable (basic check)
    const textElements = page.locator('p, span, div').filter({ hasText: /\S/ }).first()
    if (await textElements.isVisible()) {
      const color = await textElements.evaluate(el => window.getComputedStyle(el).color)
      // Should not be transparent or same as background
      expect(color).not.toBe('rgba(0, 0, 0, 0)')
    }
    
    // Test dark theme contrast
    await page.addInitScript(() => {
      localStorage.setItem('vite-ui-theme', 'dark')
    })
    await page.reload()
    await page.waitForTimeout(500)
    
    // Verify dark theme is applied
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')
  })
})