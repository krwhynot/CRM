import { defineConfig, devices } from '@playwright/test';

/**
 * Modern Playwright Configuration 2024
 * Uses project dependencies instead of globalSetup for better integration
 * Implements latest best practices for CRM testing
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Modern project structure with dependencies
  projects: [
    // Global Setup Project
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      teardown: 'cleanup',
    },
    
    // Global Cleanup Project
    {
      name: 'cleanup', 
      testMatch: /global\.teardown\.ts/,
    },

    // Desktop browsers (depend on setup)
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        // Use auth state from setup
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /.*mobile.*\.(spec|test)\.(ts|js)/,
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /.*mobile.*\.(spec|test)\.(ts|js)/,
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /.*mobile.*\.(spec|test)\.(ts|js)/,
    },

    // Mobile and tablet devices (CRM is optimized for iPad)
    {
      name: 'ipad',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 },
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*mobile.*\.(spec|test)\.(ts|js)/,
    },
    {
      name: 'iphone',
      use: { 
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 667 },
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*mobile.*\.(spec|test)\.(ts|js)/,
    },
    {
      name: 'android-tablet',
      use: { 
        ...devices['Galaxy Tab S4'],
        viewport: { width: 768, height: 1024 },
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*mobile.*\.(spec|test)\.(ts|js)/,
    },

    // Custom viewport sizes for specific testing
    {
      name: 'large-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*desktop.*\.(spec|test)\.(ts|js)/,
    },
  ],

  /* Test execution settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],
  
  /* Global test options */
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    /* Debugging and tracing */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* Timeouts */
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    /* Additional options for CRM testing */
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
  },

  /* Web server for local development */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
    },
  },

  /* Test timeouts */
  timeout: 60000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 10,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.1,
    },
  },

  /* Output directories */
  outputDir: 'test-results/test-artifacts',
  
  /* Test metadata */
  metadata: {
    project: 'KitchenPantry CRM',
    description: 'Comprehensive E2E test suite for food service CRM',
    version: '1.0.0',
    frameworks: 'Playwright only - Vitest isolated',
    lastUpdated: new Date().toISOString(),
  },
});