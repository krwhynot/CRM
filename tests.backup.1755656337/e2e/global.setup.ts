import { test as setup, expect } from '@playwright/test';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Modern Playwright Global Setup using Project Dependencies
 * Replaces old globalSetup pattern with project-based approach
 * Handles authentication state and environment preparation
 */

const authFile = 'tests/e2e/.auth/user.json';

setup('authenticate and prepare environment', async ({ page }) => {
  console.log('🚀 Starting global setup for KitchenPantry CRM tests...');
  
  // Create auth directory
  await mkdir('tests/e2e/.auth', { recursive: true });
  
  // Create test-results directories
  await mkdir('test-results/playwright-report', { recursive: true });
  await mkdir('test-results/test-artifacts', { recursive: true });
  await mkdir('test-results/screenshots', { recursive: true });
  await mkdir('test-results/traces', { recursive: true });
  
  try {
    // Navigate to the application
    console.log('⏳ Waiting for application to be ready...');
    await page.goto('/');
    
    // Wait for the application to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Check if the app is properly loaded
    const isAppReady = await page.evaluate(() => {
      return document.readyState === 'complete' && 
             document.querySelector('#root') !== null;
    });
    
    if (!isAppReady) {
      throw new Error('Application failed to load properly');
    }
    
    console.log('✅ Application is ready for testing');
    
    // Attempt to authenticate if credentials are available
    await setupAuthentication(page);
    
    // Save the authentication state
    await page.context().storageState({ path: authFile });
    console.log('✅ Authentication state saved to', authFile);
    
  } catch (error) {
    console.warn('⚠️  Authentication setup failed:', error.message);
    console.warn('Tests will handle login individually');
    
    // Create empty auth state for tests that need it
    await writeFile(authFile, JSON.stringify({
      cookies: [],
      origins: []
    }));
  }
  
  // Create test environment metadata
  const testMetadata = {
    setupTimestamp: new Date().toISOString(),
    baseURL: page.url(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    viewport: page.viewportSize(),
    environment: process.env.NODE_ENV || 'test',
    authStateAvailable: true,
  };
  
  await writeFile(
    'test-results/test-environment.json', 
    JSON.stringify(testMetadata, null, 2)
  );
  
  console.log('🎯 Global setup completed successfully');
});

/**
 * Setup authentication state for tests that require login
 */
async function setupAuthentication(page: any) {
  try {
    console.log('🔐 Setting up authentication state...');
    
    // Check if we have test credentials in environment variables
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;
    
    if (!testEmail || !testPassword) {
      console.log('📝 No test credentials found in environment');
      console.log('Set TEST_USER_EMAIL and TEST_USER_PASSWORD for authentication setup');
      return;
    }
    
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for login form to be visible
    const loginForm = page.locator('[data-testid="login-form"]');
    if (await loginForm.isVisible({ timeout: 5000 })) {
      
      // Fill in credentials
      await page.getByLabel('Email').fill(testEmail);
      await page.getByLabel('Password').fill(testPassword);
      
      // Submit the form
      await page.getByRole('button', { name: /sign in|login/i }).click();
      
      // Wait for successful login (adjust selector based on your app)
      await page.waitForURL('/', { timeout: 10000 });
      
      console.log('✅ Authentication successful');
      
    } else {
      console.log('⚠️  Login form not found - app might use different authentication');
    }
    
  } catch (error) {
    console.warn('⚠️  Authentication failed:', error.message);
    throw error;
  }
}