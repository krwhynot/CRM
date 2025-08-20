import { defineConfig, devices } from '@playwright/test';

/**
 * Temporary Playwright Configuration for Testing
 * Points to the correct test directory structure
 */
export default defineConfig({
  testDir: './tests',
  
  // Global test options
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    /* Debugging and tracing */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* Timeouts */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Simple project setup for immediate testing */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Test execution settings */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['list'],
  ],
  
  /* Test timeouts */
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  /* Output directories */
  outputDir: 'test-results/test-artifacts',
  
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
});