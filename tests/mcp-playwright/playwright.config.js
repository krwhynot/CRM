/**
 * MCP Playwright Configuration
 * Production-Safe Testing Configuration with Environment Isolation
 */

import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Environment Safety Checks
const MCP_TARGET = process.env.MCP_TARGET
if (!MCP_TARGET) {
  throw new Error('MCP_TARGET environment variable is required. Set to "stg" for staging tests.')
}

if (MCP_TARGET === 'prod') {
  throw new Error('Write tests are not allowed on production. Use MCP_TARGET=stg for staging.')
}

// Configuration based on target environment
const getConfig = (target) => {
  switch (target) {
    case 'stg':
      return {
        baseURL: process.env.STAGING_URL || 'https://crm.kjrcloud.com',
        timeout: 30000,
        retries: 2,
        workers: 2, // Limited concurrency for staging
        headless: true
      }
    case 'local':
      return {
        baseURL: process.env.LOCAL_URL || 'http://localhost:3000',
        timeout: 10000,
        retries: 1,
        workers: 1,
        headless: false
      }
    default:
      throw new Error(`Unknown MCP_TARGET: ${target}. Use "stg" or "local".`)
  }
}

const config = getConfig(MCP_TARGET)

export default defineConfig({
  testDir: '.',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: config.retries,
  
  /* Opt out of parallel tests on CI. */
  workers: config.workers,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'test-results/mcp-playwright-report' }],
    ['json', { outputFile: 'test-results/mcp-results.json' }],
    ['line']
  ],
  
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: config.baseURL,

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global timeout for actions */
    actionTimeout: config.timeout,
    
    /* Navigation timeout */
    navigationTimeout: config.timeout,
    
    /* Expect timeout */
    expect: {
      timeout: 5000
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: config.headless
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: config.headless
      },
    },

    // Mobile testing for CRM iPad optimization
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPad Pro'],
        headless: config.headless
      },
    },
    
    // Only run extensive browser testing on staging
    ...(MCP_TARGET === 'stg' ? [
      {
        name: 'webkit',
        use: { 
          ...devices['Desktop Safari'],
          headless: config.headless
        },
      },
      {
        name: 'Mobile Chrome',
        use: { 
          ...devices['Pixel 5'],
          headless: config.headless
        },
      }
    ] : [])
  ],

  /* Run your local dev server before starting the tests */
  ...(MCP_TARGET === 'local' && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000, // 2 minutes
    }
  }),

  /* Global setup and teardown */
  globalSetup: join(__dirname, 'global-setup.js'),
  globalTeardown: join(__dirname, 'global-teardown.js'),
})