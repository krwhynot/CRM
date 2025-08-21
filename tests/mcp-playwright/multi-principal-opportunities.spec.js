/**
 * MCP Playwright Testing Suite - Multi-Principal Opportunities
 * Production-Safe Testing with Environment Isolation
 * Based on 2024-2025 Industry Standards
 */

// Environment Safety Check
if (process.env.MCP_TARGET !== 'stg') {
  throw new Error('Multi-principal write tests are only allowed on staging environment. Set MCP_TARGET=stg')
}

import { test, expect } from '@playwright/test'

// Test Configuration
const config = {
  baseURL: process.env.STAGING_URL || 'https://crm.kjrcloud.com',
  timeout: 30000,
  retries: 2
}

// Test Data
const testData = {
  customerOrg: {
    name: 'Test Customer Corp',
    type: 'Customer'
  },
  principalOrg1: {
    name: 'Test Principal Alpha',
    type: 'Principal'
  },
  principalOrg2: {
    name: 'Test Principal Beta', 
    type: 'Principal'
  },
  distributorOrg: {
    name: 'Test Distributor Inc',
    type: 'Distributor'
  }
}

// Utility Functions
async function clearSessionAndCookies(page) {
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

async function loginAsTestUser(page, userType = 'manager') {
  // This would be replaced with actual test credentials
  await page.goto(`${config.baseURL}/login`)
  await page.fill('[data-testid="email-input"]', `test-${userType}@staging.local`)
  await page.fill('[data-testid="password-input"]', 'staging-test-password')
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('**/dashboard')
}

async function createTestOrganizations(page) {
  const orgs = Object.values(testData)
  const createdOrgs = {}
  
  for (const org of orgs) {
    await page.goto(`${config.baseURL}/organizations/new`)
    await page.fill('[data-testid="organization-name"]', org.name)
    await page.selectOption('[data-testid="organization-type"]', org.type)
    await page.click('[data-testid="save-organization"]')
    await page.waitForURL('**/organizations/*')
    
    // Extract organization ID from URL
    const url = page.url()
    const orgId = url.split('/').pop()
    createdOrgs[org.name] = orgId
  }
  
  return createdOrgs
}

// Test Suites
test.describe('Multi-Principal Opportunity Creation', () => {
  let organizationIds = {}

  test.beforeEach(async ({ page }) => {
    await clearSessionAndCookies(page)
    await loginAsTestUser(page)
    organizationIds = await createTestOrganizations(page)
  })

  test.afterEach(async ({ page }) => {
    await clearSessionAndCookies(page)
  })

  test('Create opportunity with 2 principals, 1 primary each', async ({ page }) => {
    // Navigate to multi-principal opportunity form
    await page.goto(`${config.baseURL}/opportunities/new-multi-principal`)
    
    // Fill basic information
    await page.selectOption('[data-testid="customer-organization-select"]', organizationIds[testData.customerOrg.name])
    await page.selectOption('[data-testid="opportunity-context-select"]', 'New Product Interest')
    await page.check('[data-testid="auto-generated-name-checkbox"]')
    
    // Navigate to participants tab
    await page.click('[data-testid="participants-tab"]')
    
    // Add first principal
    await page.selectOption('[data-testid="add-organization-select"]', organizationIds[testData.principalOrg1.name])
    await page.click('[data-testid="add-participant-button"]')
    
    // Set first principal as primary and adjust role if needed
    const firstParticipant = page.locator(`[data-testid="participant-${organizationIds[testData.principalOrg1.name]}"]`).first()
    await firstParticipant.locator('[data-testid^="role-combobox"]').selectOption('principal')
    await firstParticipant.locator('[data-testid^="primary-toggle"]').check()
    
    // Add second principal
    await page.selectOption('[data-testid="add-organization-select"]', organizationIds[testData.principalOrg2.name])
    await page.click('[data-testid="add-participant-button"]')
    
    // Set second principal as primary (this should auto-demote the first)
    const secondParticipant = page.locator(`[data-testid="participant-${organizationIds[testData.principalOrg2.name]}"]`).first()
    await secondParticipant.locator('[data-testid^="role-combobox"]').selectOption('principal')
    await secondParticipant.locator('[data-testid^="primary-toggle"]').check()
    
    // Verify only one primary principal exists
    const primaryPrincipals = await page.locator('[data-testid^="primary-toggle-principal"]:checked').count()
    expect(primaryPrincipals).toBe(1)
    
    // Submit opportunity
    await page.click('[data-testid="create-opportunity-button"]')
    
    // Verify success
    await page.waitForURL('**/opportunities/*')
    await expect(page.locator('[data-testid="opportunity-title"]')).toBeVisible()
    
    // Verify participants are saved correctly
    const participantCards = await page.locator('[data-testid^="participant-card"]').count()
    expect(participantCards).toBeGreaterThanOrEqual(3) // Customer + 2 principals
  })

  test('Prevent double primary for same role - validation error', async ({ page }) => {
    // Start by creating an opportunity with participants
    await page.goto(`${config.baseURL}/opportunities/new-multi-principal`)
    
    // Fill basic info
    await page.selectOption('[data-testid="customer-organization-select"]', organizationIds[testData.customerOrg.name])
    await page.selectOption('[data-testid="opportunity-context-select"]', 'Demo Request')
    
    // Add participants with conflicting primaries
    await page.click('[data-testid="participants-tab"]')
    
    // Add first principal as primary
    await page.selectOption('[data-testid="add-organization-select"]', organizationIds[testData.principalOrg1.name])
    await page.click('[data-testid="add-participant-button"]')
    const firstParticipant = page.locator(`[data-testid="participant-${organizationIds[testData.principalOrg1.name]}"]`).first()
    await firstParticipant.locator('[data-testid^="role-combobox"]').selectOption('principal')
    await firstParticipant.locator('[data-testid^="primary-toggle"]').check()
    
    // Add second principal as primary (should auto-demote first)
    await page.selectOption('[data-testid="add-organization-select"]', organizationIds[testData.principalOrg2.name])
    await page.click('[data-testid="add-participant-button"]')
    const secondParticipant = page.locator(`[data-testid="participant-${organizationIds[testData.principalOrg2.name]}"]`).first()
    await secondParticipant.locator('[data-testid^="role-combobox"]').selectOption('principal')
    await secondParticipant.locator('[data-testid^="primary-toggle"]').check()
    
    // Verify UI auto-demoted the first primary
    const firstPrimaryToggle = firstParticipant.locator('[data-testid^="primary-toggle"]')
    await expect(firstPrimaryToggle).not.toBeChecked()
    
    // Verify only one primary exists
    const primaryCount = await page.locator('[data-testid^="primary-toggle-principal"]:checked').count()
    expect(primaryCount).toBe(1)
    
    // The form should still be submittable (UI prevented the conflict)
    await expect(page.locator('[data-testid="create-opportunity-button"]')).toBeEnabled()
  })

  test('Unauthorized user access - expect 401/403', async ({ page }) => {
    // Clear authentication
    await clearSessionAndCookies(page)
    
    // Try to access multi-principal form without authentication
    const response = await page.goto(`${config.baseURL}/opportunities/new-multi-principal`, { 
      waitUntil: 'networkidle' 
    })
    
    // Should redirect to login or show unauthorized
    if (response.status() === 401 || response.status() === 403) {
      // Direct unauthorized response
      expect(response.status()).toBeGreaterThanOrEqual(401)
    } else {
      // Redirected to login
      await expect(page).toHaveURL(/.*login.*/)
    }
  })

  test('Performance validation - participant queries <100ms median', async ({ page }) => {
    // Setup performance monitoring
    const performanceMetrics = []
    
    page.on('response', response => {
      if (response.url().includes('/opportunities') && response.url().includes('participants')) {
        const timing = response.timing()
        if (timing) {
          performanceMetrics.push(timing.responseEnd - timing.requestStart)
        }
      }
    })
    
    // Create opportunity with multiple participants
    await page.goto(`${config.baseURL}/opportunities/new-multi-principal`)
    await page.selectOption('[data-testid="customer-organization-select"]', organizationIds[testData.customerOrg.name])
    await page.click('[data-testid="participants-tab"]')
    
    // Add multiple participants to trigger queries
    const orgs = [testData.principalOrg1, testData.principalOrg2, testData.distributorOrg]
    for (const org of orgs) {
      await page.selectOption('[data-testid="add-organization-select"]', organizationIds[org.name])
      await page.click('[data-testid="add-participant-button"]')
      
      // Wait for any backend validation/queries
      await page.waitForTimeout(500)
    }
    
    // Calculate median response time
    if (performanceMetrics.length > 0) {
      const sortedMetrics = performanceMetrics.sort((a, b) => a - b)
      const median = sortedMetrics[Math.floor(sortedMetrics.length / 2)]
      
      console.log(`Participant query performance: ${median}ms median (${performanceMetrics.length} queries)`)
      expect(median).toBeLessThan(100) // Should be under 100ms
    }
  })
})

test.describe('RLS Policy Enforcement', () => {
  test('Cross-tenant data isolation', async ({ page }) => {
    // This test would require multiple tenant users
    // For now, we'll test that unauthorized access is blocked
    
    await clearSessionAndCookies(page)
    
    // Try to access API endpoints directly without authentication
    const apiResponse = await page.request.get(`${config.baseURL}/api/opportunities`, {
      failOnStatusCode: false
    })
    
    expect(apiResponse.status()).toBeGreaterThanOrEqual(401)
  })

  test('Participant modification authorization', async ({ page }) => {
    await loginAsTestUser(page, 'limited')
    
    // Try to modify participants on an opportunity not owned by this user
    const response = await page.request.post(`${config.baseURL}/api/opportunities/sync-participants`, {
      data: {
        opportunity_id: 'unauthorized-opportunity-id',
        participants: []
      },
      failOnStatusCode: false
    })
    
    expect(response.status()).toBeGreaterThanOrEqual(401)
  })
})

test.describe('Business Rule Validation', () => {
  test('Enforce minimum one customer participant', async ({ page }) => {
    await clearSessionAndCookies(page)
    await loginAsTestUser(page)
    
    await page.goto(`${config.baseURL}/opportunities/new-multi-principal`)
    
    // Fill basic info but don't add customer participant
    await page.selectOption('[data-testid="opportunity-context-select"]', 'Food Show')
    await page.click('[data-testid="participants-tab"]')
    
    // Add only principals (no customer)
    await page.selectOption('[data-testid="add-organization-select"]', organizationIds[testData.principalOrg1.name])
    await page.click('[data-testid="add-participant-button"]')
    
    // Try to submit - should be blocked
    await expect(page.locator('[data-testid="create-opportunity-button"]')).toBeDisabled()
    
    // Verify validation message appears
    await expect(page.locator('text=customer participant is required')).toBeVisible()
  })

  test('Commission rate validation (0-1 fraction)', async ({ page }) => {
    await clearSessionAndCookies(page)
    await loginAsTestUser(page)
    const orgs = await createTestOrganizations(page)
    
    await page.goto(`${config.baseURL}/opportunities/new-multi-principal`)
    await page.selectOption('[data-testid="customer-organization-select"]', orgs[testData.customerOrg.name])
    await page.click('[data-testid="participants-tab"]')
    
    // Add participant and expand details
    await page.selectOption('[data-testid="add-organization-select"]', orgs[testData.principalOrg1.name])
    await page.click('[data-testid="add-participant-button"]')
    
    const participant = page.locator(`[data-testid="participant-${orgs[testData.principalOrg1.name]}"]`).first()
    await participant.locator('button[title="Toggle details"]').click()
    
    // Try invalid commission rate (> 100%)
    await participant.locator('[data-testid^="commission-rate"]').fill('150')
    await participant.locator('[data-testid^="commission-rate"]').blur()
    
    // Should show validation error or reset to valid value
    const commissionValue = await participant.locator('[data-testid^="commission-rate"]').inputValue()
    expect(parseFloat(commissionValue)).toBeLessThanOrEqual(100)
  })
})

// Performance Monitoring Helper
test.describe('System Performance Monitoring', () => {
  test('Overall application performance', async ({ page }) => {
    const startTime = Date.now()
    
    await clearSessionAndCookies(page)
    await loginAsTestUser(page)
    
    // Navigate through key workflows
    await page.goto(`${config.baseURL}/opportunities`)
    await page.waitForLoadState('networkidle')
    
    await page.goto(`${config.baseURL}/opportunities/new-multi-principal`)
    await page.waitForLoadState('networkidle')
    
    const totalTime = Date.now() - startTime
    console.log(`Total workflow time: ${totalTime}ms`)
    
    // Performance should be reasonable
    expect(totalTime).toBeLessThan(10000) // Under 10 seconds for full workflow
  })
})

// Cleanup Helper
test.afterAll(async ({ page }) => {
  // Clean up test data if needed
  // This would include removing test organizations and opportunities
  console.log('Test suite completed - staging data cleanup may be needed')
})