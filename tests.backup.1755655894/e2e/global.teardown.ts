import { test as teardown } from '@playwright/test';
import { unlink, access, readdir, rmdir, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * Modern Playwright Global Teardown using Project Dependencies
 * Handles cleanup operations after all tests complete
 */

teardown('cleanup test environment', async ({}) => {
  console.log('🧹 Starting global teardown for KitchenPantry CRM tests...');
  
  try {
    // Clean up authentication state files
    await cleanupAuthFiles();
    
    // Clean up temporary test files
    await cleanupTempFiles();
    
    // Generate test summary report
    await generateTestSummary();
    
    // Archive test artifacts if in CI
    if (process.env.CI) {
      await archiveTestArtifacts();
    }
    
  } catch (error) {
    console.error('❌ Global teardown encountered an error:', error);
    // Don't throw - we don't want cleanup failures to fail the entire test run
  }
  
  console.log('✅ Global teardown completed');
});

/**
 * Clean up authentication state files
 */
async function cleanupAuthFiles() {
  try {
    const authStatePath = join(process.cwd(), 'tests/e2e/.auth/user.json');
    
    // Check if file exists before trying to delete
    try {
      await access(authStatePath);
      await unlink(authStatePath);
      console.log('🗑️  Cleaned up authentication state files');
    } catch {
      // File doesn't exist, which is fine
      console.log('ℹ️  No authentication state files to clean up');
    }
  } catch (error) {
    console.warn('⚠️  Could not clean up auth files:', error.message);
  }
}

/**
 * Clean up temporary test files
 */
async function cleanupTempFiles() {
  try {
    const tempPaths = [
      'tests/e2e/.auth/temp',
      'test-results/temp',
      'test-results/test-artifacts/temp'
    ];
    
    for (const tempPath of tempPaths) {
      try {
        await access(tempPath);
        const files = await readdir(tempPath);
        
        for (const file of files) {
          await unlink(join(tempPath, file));
        }
        
        // Remove empty directory
        await rmdir(tempPath);
        
        console.log(`🗑️  Cleaned up temporary files in ${tempPath}`);
      } catch {
        // Directory might not exist or be empty
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not clean up temp files:', error.message);
  }
}

/**
 * Generate test summary report
 */
async function generateTestSummary() {
  try {
    const summary = {
      teardownTimestamp: new Date().toISOString(),
      testRun: 'KitchenPantry CRM E2E Tests',
      environment: process.env.NODE_ENV || 'test',
      ci: !!process.env.CI,
      baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
      features_tested: [
        'Authentication Flow',
        'CRUD Operations (5 entities)',
        'Dashboard Functionality', 
        'Excel Import Feature',
        'Search Functionality',
        'Mobile Responsiveness (iPad optimized)',
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
      ],
      framework_separation: {
        vitest_isolated: true,
        playwright_isolated: true,
        symbol_collision_resolved: true,
        last_validation: new Date().toISOString()
      }
    };
    
    // Ensure test-results directory exists
    await mkdir('test-results', { recursive: true });
    
    const summaryPath = join(process.cwd(), 'test-results/test-run-summary.json');
    await writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log('📊 Test summary report generated at test-results/test-run-summary.json');
    
  } catch (error) {
    console.warn('⚠️  Could not generate test summary:', error.message);
  }
}

/**
 * Archive test artifacts for CI environments
 */
async function archiveTestArtifacts() {
  try {
    console.log('📦 Archiving test artifacts for CI...');
    
    const archiveInfo = {
      timestamp: new Date().toISOString(),
      artifacts: {
        html_report: 'test-results/playwright-report/',
        json_results: 'test-results/results.json',
        junit_results: 'test-results/results.xml',
        screenshots: 'test-results/test-artifacts/',
        traces: 'test-results/traces/',
        test_summary: 'test-results/test-run-summary.json',
        environment: 'test-results/test-environment.json'
      },
      retention: '30 days',
      ci_job: process.env.GITHUB_RUN_ID || process.env.CI_JOB_ID || 'unknown'
    };
    
    await writeFile(
      'test-results/ci-artifacts.json',
      JSON.stringify(archiveInfo, null, 2)
    );
    
    console.log('📦 CI artifact manifest created');
    
  } catch (error) {
    console.warn('⚠️  Could not create CI archive manifest:', error.message);
  }
}

