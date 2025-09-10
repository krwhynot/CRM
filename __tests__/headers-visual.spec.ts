import { test, expect } from '@playwright/test'
import { viewportSizes } from '../tests/config/test-constants'

/**
 * Visual regression tests for PageHeader consistency
 * These tests capture screenshots and ensure consistent appearance across themes
 */

test.describe('PageHeader Visual Regression', () => {
  // Test each major page with headers
  const pagesToTest = [
    { name: 'Organizations', url: '/organizations', selector: '[data-page-header]' },
    { name: 'Contacts', url: '/contacts', selector: '[data-page-header]' },  
    { name: 'Products', url: '/products', selector: '[data-page-header]' },
    { name: 'Opportunities', url: '/opportunities', selector: '[data-page-header]' },
    { name: 'ImportExport', url: '/import-export', selector: '[data-page-header]' },
    { name: 'MultiPrincipal', url: '/opportunities/new-multi-principal', selector: '[data-page-header]' }
  ]

  for (const pageInfo of pagesToTest) {
    test(`${pageInfo.name} header - light theme`, async ({ page }) => {
      // Set light theme
      await page.emulateMedia({ colorScheme: 'light' })
      
      await page.goto(pageInfo.url)
      
      // Wait for header to be visible and stable
      await page.waitForSelector(pageInfo.selector, { state: 'visible' })
      await page.waitForTimeout(500) // Allow for any animations
      
      // Take screenshot of header only
      const header = page.locator(pageInfo.selector)
      await expect(header).toHaveScreenshot(`${pageInfo.name}-header-light.png`)
    })

    test(`${pageInfo.name} header - dark theme`, async ({ page }) => {
      // Set dark theme  
      await page.emulateMedia({ colorScheme: 'dark' })
      
      await page.goto(pageInfo.url)
      
      // Wait for header to be visible and stable
      await page.waitForSelector(pageInfo.selector, { state: 'visible' })
      await page.waitForTimeout(500) // Allow for any animations
      
      // Take screenshot of header only
      const header = page.locator(pageInfo.selector)
      await expect(header).toHaveScreenshot(`${pageInfo.name}-header-dark.png`)
    })

    test(`${pageInfo.name} header - mobile layout`, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize(viewportSizes.mobileMedium)
      await page.emulateMedia({ colorScheme: 'light' })
      
      await page.goto(pageInfo.url)
      
      // Wait for header to be visible and responsive layout to settle
      await page.waitForSelector(pageInfo.selector, { state: 'visible' })
      await page.waitForTimeout(1000) // Allow for responsive layout changes
      
      // Take screenshot of header only
      const header = page.locator(pageInfo.selector)
      await expect(header).toHaveScreenshot(`${pageInfo.name}-header-mobile.png`)
    })
  }

  test('header focus states', async ({ page }) => {
    await page.goto('/opportunities')
    await page.waitForSelector('[data-page-header]', { state: 'visible' })
    
    // Test button focus states
    const actionButtons = page.locator('[data-page-header] button')
    const buttonCount = await actionButtons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = actionButtons.nth(i)
      await button.focus()
      await page.waitForTimeout(100) // Allow focus styles to apply
      
      await expect(button).toHaveScreenshot(`button-${i}-focus-state.png`)
    }
  })

  test('header action button hover states', async ({ page }) => {
    await page.goto('/organizations')
    await page.waitForSelector('[data-page-header]', { state: 'visible' })
    
    // Test hover state on primary action button
    const addButton = page.locator('[data-page-header] button:has-text("Add Organization")')
    await addButton.hover()
    await page.waitForTimeout(200) // Allow hover styles to apply
    
    await expect(addButton).toHaveScreenshot('add-button-hover-state.png')
  })

  test('header responsive breakpoint transitions', async ({ page }) => {
    await page.goto('/opportunities')
    
    const viewports = [
      viewportSizes.mobileSmall,
      viewportSizes.tablet,
      viewportSizes.desktopSmall,
      viewportSizes.desktopLarge
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500) // Allow layout to settle
      
      const header = page.locator('[data-page-header]')
      await expect(header).toHaveScreenshot(`opportunities-header-${viewport.name}.png`)
    }
  })

  test('header with back button styling', async ({ page }) => {
    await page.goto('/opportunities/new-multi-principal')
    await page.waitForSelector('[data-page-header]', { state: 'visible' })
    
    const header = page.locator('[data-page-header]')
    await expect(header).toHaveScreenshot('header-with-back-button.png')
    
    // Test back button focus
    const backButton = page.locator('[data-page-header] button:has-text("Back")')
    await backButton.focus()
    await page.waitForTimeout(100)
    
    await expect(backButton).toHaveScreenshot('back-button-focus.png')
  })

  test('header consistency across entity pages', async ({ page }) => {
    // Take screenshots of all entity management headers for comparison
    const entityPages = ['organizations', 'contacts', 'products']
    
    for (const entity of entityPages) {
      await page.goto(`/${entity}`)
      await page.waitForSelector('[data-page-header]', { state: 'visible' })
      await page.waitForTimeout(500)
      
      const header = page.locator('[data-page-header]')
      await expect(header).toHaveScreenshot(`${entity}-entity-header-consistency.png`)
    }
  })
})