import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshots on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global test timeout */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers and device viewports */
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.(spec|test)\.(ts|js)/,
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.(spec|test)\.(ts|js)/,
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.(spec|test)\.(ts|js)/,
    },

    // Mobile and tablet devices (CRM is optimized for iPad)
    {
      name: 'ipad',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 },
      },
      testMatch: /.*mobile.*\.(spec|test)\.(ts|js)/,
    },
    {
      name: 'iphone',
      use: { 
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 667 },
      },
      testMatch: /.*mobile.*\.(spec|test)\.(ts|js)/,
    },
    {
      name: 'android-tablet',
      use: { 
        ...devices['Galaxy Tab S4'],
        viewport: { width: 768, height: 1024 },
      },
      testMatch: /.*mobile.*\.(spec|test)\.(ts|js)/,
    },

    // Custom viewport sizes for specific testing
    {
      name: 'large-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: /.*desktop.*\.(spec|test)\.(ts|js)/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),

  /* Test timeout */
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  /* Output directories */
  outputDir: 'test-results/',
  
  /* Test metadata */
  metadata: {
    project: 'KitchenPantry CRM',
    description: 'Comprehensive E2E test suite for food service CRM',
    version: '1.0.0',
  },
});