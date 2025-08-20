import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * Handles environment preparation, test data setup, and authentication state
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for KitchenPantry CRM tests...');
  
  const baseURL = config.use?.baseURL || 'http://localhost:5173';
  
  // Launch browser for setup operations
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto(baseURL);
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
    
    // Create authentication state for authenticated tests
    // This will be used by tests that need to be logged in
    await setupAuthenticationState(page, baseURL);
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log('🎯 Global setup completed successfully');
}

/**
 * Setup authentication state for tests that require login
 */
async function setupAuthenticationState(page: any, baseURL: string) {
  try {
    console.log('🔐 Setting up authentication state...');
    
    // Navigate to login page
    await page.goto(`${baseURL}/login`);
    
    // Wait for login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 10000 });
    
    // Check if we have test credentials in environment variables
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';
    
    console.log('📝 Using test credentials for authentication setup');
    console.log('⚠️  Note: Ensure test user exists in your development database');
    
    // Store auth state for use in tests
    await page.context().storageState({ path: 'tests/fixtures/auth-state.json' });
    
    console.log('✅ Authentication state saved');
    
  } catch (error) {
    console.warn('⚠️  Authentication setup skipped - tests will handle login individually');
    console.warn('This is expected if no test user is configured');
  }
}

export default globalSetup;