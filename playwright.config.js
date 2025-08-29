import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual-regression',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Desktop Chrome
    {
      name: 'chromium-light',
      use: { 
        ...devices['Desktop Chrome'],
        colorScheme: 'light',
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'chromium-dark', 
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        viewport: { width: 1280, height: 720 }
      },
    },
    // Mobile
    {
      name: 'mobile-chrome-light',
      use: { 
        ...devices['Pixel 5'],
        colorScheme: 'light'
      },
    },
    {
      name: 'mobile-chrome-dark',
      use: { 
        ...devices['Pixel 5'], 
        colorScheme: 'dark'
      },
    },
    // Tablet (iPad focus)
    {
      name: 'tablet-light',
      use: {
        ...devices['iPad Pro'],
        colorScheme: 'light'
      },
    },
    {
      name: 'tablet-dark',
      use: {
        ...devices['iPad Pro'],
        colorScheme: 'dark' 
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})