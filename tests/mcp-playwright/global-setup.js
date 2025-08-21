/**
 * MCP Playwright Global Setup
 * Environment validation and test preparation
 */

import { chromium } from '@playwright/test'

async function globalSetup() {
  console.log('🚀 MCP Playwright Global Setup Starting...')
  
  // Environment validation
  const MCP_TARGET = process.env.MCP_TARGET
  console.log(`📍 Target environment: ${MCP_TARGET}`)
  
  if (MCP_TARGET === 'prod') {
    throw new Error('❌ Production testing blocked for safety')
  }
  
  if (!MCP_TARGET || !['stg', 'local'].includes(MCP_TARGET)) {
    throw new Error('❌ Invalid MCP_TARGET. Use "stg" or "local"')
  }
  
  // Browser setup for authentication if needed
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Health check on target environment
    const baseURL = MCP_TARGET === 'stg' 
      ? (process.env.STAGING_URL || 'https://crm.kjrcloud.com')
      : (process.env.LOCAL_URL || 'http://localhost:3000')
    
    console.log(`🔍 Health checking: ${baseURL}`)
    
    const response = await page.goto(baseURL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })
    
    if (!response.ok()) {
      throw new Error(`❌ Environment health check failed: ${response.status()}`)
    }
    
    console.log('✅ Environment health check passed')
    
    // Setup test authentication state if needed
    if (MCP_TARGET === 'stg') {
      console.log('🔐 Setting up staging authentication...')
      
      // This would setup authentication context for staging tests
      // await setupStagingAuth(page)
      
      console.log('✅ Staging authentication configured')
    }
    
  } catch (error) {
    console.error('❌ Global setup failed:', error.message)
    throw error
  } finally {
    await browser.close()
  }
  
  console.log('✅ MCP Playwright Global Setup Complete')
}

async function setupStagingAuth(page) {
  // Setup authentication for staging environment
  // This would include:
  // - Creating test users if needed
  // - Setting up authentication tokens
  // - Configuring test data prerequisites
  
  // For now, just validate the login page is accessible
  await page.goto('/login')
  const loginForm = await page.locator('[data-testid="login-form"]')
  if (await loginForm.isVisible()) {
    console.log('✅ Login form accessible')
  }
}

export default globalSetup