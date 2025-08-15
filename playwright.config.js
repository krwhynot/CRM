import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Stage 6-2 Principal CRM Testing
 * Optimized for comprehensive Principal-Contact workflow validation
 */
export default defineConfig({
  // Test directory and pattern matching
  testDir: './tests',
  testMatch: '**/*.spec.js',
  
  // Global test timeout (10 minutes for comprehensive tests)
  timeout: 10 * 60 * 1000,
  expect: {
    // Default timeout for expect() assertions
    timeout: 10000
  },
  
  // Test execution configuration
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'tests/test-results/test-results.json' }],
    ['line']
  ],
  
  // Global test setup
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:5173',
    
    // Browser configuration
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Navigation timeout
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  // Browser configurations for Principal CRM testing
  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'Mobile Chrome',  
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 }
      },
    },
    {
      name: 'iPad Landscape',
      use: {
        ...devices['iPad Pro landscape'],
        viewport: { width: 1024, height: 768 }
      },
    },
    {
      name: 'iPad Portrait',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12 Pro'],
        viewport: { width: 393, height: 852 }
      },
    },
    // Mobile optimization testing project
    {
      name: 'Mobile Optimization Tests',
      testMatch: '**/mobile-optimization-tests.spec.js',
      use: {
        ...devices['iPad Pro landscape'],
        viewport: { width: 1024, height: 768 }
      },
    }
  ],

  // Development server configuration  
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  
  // Output directory
  outputDir: 'tests/test-results/'
});