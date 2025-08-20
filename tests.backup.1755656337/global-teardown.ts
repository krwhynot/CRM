import { FullConfig } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

/**
 * Global teardown for Playwright tests
 * Handles cleanup operations after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for KitchenPantry CRM tests...');
  
  try {
    // Clean up authentication state files
    await cleanupAuthFiles();
    
    // Clean up temporary test files
    await cleanupTempFiles();
    
    // Generate test summary report
    await generateTestSummary();
    
  } catch (error) {
    console.error('❌ Global teardown encountered an error:', error);
    // Don't throw - we don't want cleanup failures to fail the entire test run
  }
  
  console.log('✅ Global teardown completed');
}

/**
 * Clean up authentication state files
 */
async function cleanupAuthFiles() {
  try {
    const authStatePath = path.join(process.cwd(), 'tests/fixtures/auth-state.json');
    await fs.access(authStatePath);
    await fs.unlink(authStatePath);
    console.log('🗑️  Cleaned up authentication state files');
  } catch {
    // File might not exist, which is fine
  }
}

/**
 * Clean up temporary test files
 */
async function cleanupTempFiles() {
  try {
    const tempDir = path.join(process.cwd(), 'tests/fixtures/temp');
    try {
      await fs.access(tempDir);
      const files = await fs.readdir(tempDir);
      for (const file of files) {
        await fs.unlink(path.join(tempDir, file));
      }
      console.log('🗑️  Cleaned up temporary test files');
    } catch {
      // Directory might not exist
    }
  } catch (error) {
    console.warn('⚠️  Could not clean up temp files:', error);
  }
}

/**
 * Generate test summary report
 */
async function generateTestSummary() {
  try {
    const summary = {
      timestamp: new Date().toISOString(),
      testRun: 'KitchenPantry CRM E2E Tests',
      environment: process.env.NODE_ENV || 'test',
      baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
      features_tested: [
        'Authentication Flow',
        'CRUD Operations (5 entities)',
        'Dashboard Functionality',
        'Excel Import Feature',
        'Search Functionality',
        'Mobile Responsiveness',
        'Form Validations',
        'Navigation & Routing',
        'Error States',
        'Performance Metrics'
      ],
      browsers_tested: [
        'Chromium Desktop',
        'Firefox Desktop', 
        'Safari Desktop',
        'iPad Pro',
        'iPhone 13',
        'Android Tablet'
      ]
    };
    
    const summaryPath = path.join(process.cwd(), 'test-results/test-run-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log('📊 Test summary report generated');
    
  } catch (error) {
    console.warn('⚠️  Could not generate test summary:', error);
  }
}

export default globalTeardown;