#!/usr/bin/env node

/**
 * Interactions E2E Test Execution Script
 * CRM Dashboard - KitchenPantry
 * 
 * This script executes comprehensive end-to-end tests for the Interactions page
 * once authentication credentials are properly configured.
 * 
 * Usage:
 *   node tests/run-interactions-e2e-tests.js [--headless] [--email=test@example.com] [--password=password]
 * 
 * Prerequisites:
 *   1. Development server running on localhost:5173
 *   2. Valid test user credentials
 *   3. Test data in database (organizations, contacts, opportunities)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:5173',
  timeouts: {
    navigation: 10000,
    element: 5000,
    api: 3000
  },
  viewports: {
    desktop: { width: 1200, height: 800 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  },
  screenshots: true,
  headless: process.argv.includes('--headless')
};

// Parse command line arguments
const args = process.argv.slice(2);
const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'test@foodbroker.com';
const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'test123';

// Test Results Structure
let testResults = {
  timestamp: new Date().toISOString(),
  environment: 'Development',
  browser: 'Chromium',
  testSuites: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// Utility Functions
async function takeScreenshot(page, name, description = '') {
  if (!CONFIG.screenshots) return;
  
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}_${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);
  
  await page.screenshot({ 
    path: filepath,
    fullPage: true 
  });
  
  console.log(`📸 Screenshot: ${filename} - ${description}`);
  return filename;
}

async function logTestResult(suiteName, testName, status, details = {}) {
  if (!testResults.testSuites[suiteName]) {
    testResults.testSuites[suiteName] = {
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }
  
  const test = {
    name: testName,
    status,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  testResults.testSuites[suiteName].tests.push(test);
  testResults.testSuites[suiteName][status]++;
  testResults.summary[status]++;
  testResults.summary.total++;
  
  const statusEmoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
  console.log(`${statusEmoji} ${suiteName}: ${testName}`);
  
  if (status === 'failed' && details.error) {
    console.error(`   Error: ${details.error}`);
  }
}

// Authentication Helper
async function authenticateUser(page) {
  console.log('🔐 Authenticating user...');
  
  try {
    await page.goto(`${CONFIG.baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    // Submit and wait for redirect
    await page.click('button[type="submit"]');
    
    // Check for successful authentication
    try {
      await page.waitForURL(`${CONFIG.baseUrl}/dashboard`, { timeout: CONFIG.timeouts.navigation });
      console.log('✅ Authentication successful');
      return true;
    } catch (error) {
      // Check for error message
      const errorMessage = await page.locator('text="Invalid login credentials"').textContent().catch(() => null);
      if (errorMessage) {
        throw new Error('Invalid login credentials');
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return false;
  }
}

// Navigation Helper
async function navigateToInteractions(page) {
  await page.goto(`${CONFIG.baseUrl}/interactions`);
  await page.waitForSelector('h1:has-text("Interactions")', { timeout: CONFIG.timeouts.element });
  await page.waitForLoadState('networkidle');
}

// Test Suite 1: Page Load and Navigation
async function testPageLoadAndNavigation(page) {
  const suiteName = 'Page Load and Navigation';
  console.log(`\n🧪 Testing ${suiteName}...`);
  
  try {
    await navigateToInteractions(page);
    await takeScreenshot(page, 'interactions_page_loaded', 'Main interactions page');
    
    // Test 1: Page Header
    try {
      const header = await page.locator('h1:has-text("Interactions")');
      await header.waitFor({ state: 'visible' });
      await logTestResult(suiteName, 'Page header displays correctly', 'passed');
    } catch (error) {
      await logTestResult(suiteName, 'Page header displays correctly', 'failed', { error: error.message });
    }
    
    // Test 2: Add Interaction Button
    try {
      const addButton = await page.locator('button:has-text("Add Interaction")');
      await addButton.waitFor({ state: 'visible' });
      await logTestResult(suiteName, 'Add Interaction button is visible', 'passed');
    } catch (error) {
      await logTestResult(suiteName, 'Add Interaction button is visible', 'failed', { error: error.message });
    }
    
    // Test 3: Stats Cards
    try {
      await page.waitForSelector('text="Total Interactions"', { timeout: CONFIG.timeouts.element });
      await page.waitForSelector('text="Follow-ups Needed"', { timeout: CONFIG.timeouts.element });
      await page.waitForSelector('text="Recent Activity"', { timeout: CONFIG.timeouts.element });
      await page.waitForSelector('text="By Type"', { timeout: CONFIG.timeouts.element });
      await logTestResult(suiteName, 'All stats cards are visible', 'passed');
    } catch (error) {
      await logTestResult(suiteName, 'All stats cards are visible', 'failed', { error: error.message });
    }
    
    // Test 4: Search Input
    try {
      const searchInput = await page.locator('input[placeholder*="Search interactions"]');
      await searchInput.waitFor({ state: 'visible' });
      await logTestResult(suiteName, 'Search input is visible', 'passed');
    } catch (error) {
      await logTestResult(suiteName, 'Search input is visible', 'failed', { error: error.message });
    }
    
    // Test 5: Interactions Table
    try {
      const table = await page.locator('table');
      await table.waitFor({ state: 'visible' });
      await logTestResult(suiteName, 'Interactions table is visible', 'passed');
    } catch (error) {
      await logTestResult(suiteName, 'Interactions table is visible', 'failed', { error: error.message });
    }
    
  } catch (error) {
    await logTestResult(suiteName, 'Suite execution', 'failed', { error: error.message });
  }
}

// Test Suite 2: Stats Dashboard Validation
async function testStatsDashboard(page) {
  const suiteName = 'Stats Dashboard';
  console.log(`\n🧪 Testing ${suiteName}...`);
  
  try {
    await navigateToInteractions(page);
    
    // Test 1: Total Interactions Count
    try {
      const totalElement = await page.locator('text="Total Interactions"').locator('..').locator('.text-2xl');
      const totalValue = await totalElement.textContent();
      const numValue = parseInt(totalValue);
      
      if (!isNaN(numValue) && numValue >= 0) {
        await logTestResult(suiteName, 'Total Interactions shows valid number', 'passed', { value: numValue });
      } else {
        await logTestResult(suiteName, 'Total Interactions shows valid number', 'failed', { error: `Invalid value: ${totalValue}` });
      }
    } catch (error) {
      await logTestResult(suiteName, 'Total Interactions shows valid number', 'failed', { error: error.message });
    }
    
    // Test 2: Follow-ups Needed Count
    try {
      const followUpsElement = await page.locator('text="Follow-ups Needed"').locator('..').locator('.text-2xl');
      const followUpsValue = await followUpsElement.textContent();
      const numValue = parseInt(followUpsValue);
      
      if (!isNaN(numValue) && numValue >= 0) {
        await logTestResult(suiteName, 'Follow-ups Needed shows valid number', 'passed', { value: numValue });
      } else {
        await logTestResult(suiteName, 'Follow-ups Needed shows valid number', 'failed', { error: `Invalid value: ${followUpsValue}` });
      }
    } catch (error) {
      await logTestResult(suiteName, 'Follow-ups Needed shows valid number', 'failed', { error: error.message });
    }
    
    // Test 3: Recent Activity Count
    try {
      const recentElement = await page.locator('text="Recent Activity"').locator('..').locator('.text-2xl');
      const recentValue = await recentElement.textContent();
      const numValue = parseInt(recentValue);
      
      if (!isNaN(numValue) && numValue >= 0) {
        await logTestResult(suiteName, 'Recent Activity shows valid number', 'passed', { value: numValue });
      } else {
        await logTestResult(suiteName, 'Recent Activity shows valid number', 'failed', { error: `Invalid value: ${recentValue}` });
      }
    } catch (error) {
      await logTestResult(suiteName, 'Recent Activity shows valid number', 'failed', { error: error.message });
    }
    
  } catch (error) {
    await logTestResult(suiteName, 'Suite execution', 'failed', { error: error.message });
  }
}

// Test Suite 3: Search and Filtering
async function testSearchAndFiltering(page) {
  const suiteName = 'Search and Filtering';
  console.log(`\n🧪 Testing ${suiteName}...`);
  
  try {
    await navigateToInteractions(page);
    
    // Test 1: Search Input Functionality
    try {
      const searchInput = await page.locator('input[placeholder*="Search interactions"]');
      
      // Get initial row count
      const initialRows = await page.locator('table tbody tr').count().catch(() => 0);
      
      // Perform search
      await searchInput.fill('meeting');
      await page.waitForTimeout(1000); // Allow for search debounce
      
      // Check results
      const filteredRows = await page.locator('table tbody tr').count().catch(() => 0);
      
      if (filteredRows <= initialRows) {
        await logTestResult(suiteName, 'Search filters results correctly', 'passed', { 
          initial: initialRows, 
          filtered: filteredRows 
        });
      } else {
        await logTestResult(suiteName, 'Search filters results correctly', 'failed', { 
          error: `Filtered count (${filteredRows}) > initial count (${initialRows})` 
        });
      }
      
      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(1000);
      
    } catch (error) {
      await logTestResult(suiteName, 'Search filters results correctly', 'failed', { error: error.message });
    }
    
  } catch (error) {
    await logTestResult(suiteName, 'Suite execution', 'failed', { error: error.message });
  }
}

// Test Suite 4: Form Validation
async function testFormValidation(page) {
  const suiteName = 'Form Validation';
  console.log(`\n🧪 Testing ${suiteName}...`);
  
  try {
    await navigateToInteractions(page);
    
    // Test 1: Open Add Interaction Dialog
    try {
      await page.click('button:has-text("Add Interaction")');
      await page.waitForSelector('[role="dialog"]', { timeout: CONFIG.timeouts.element });
      await takeScreenshot(page, 'interaction_form_dialog', 'Add interaction dialog opened');
      await logTestResult(suiteName, 'Add Interaction dialog opens', 'passed');
    } catch (error) {
      await logTestResult(suiteName, 'Add Interaction dialog opens', 'failed', { error: error.message });
      return; // Can't continue without dialog
    }
    
    // Test 2: Required Field Validation
    try {
      // Try to submit empty form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000); // Allow validation to show
      
      // Check if dialog is still open (form should not submit)
      const dialogVisible = await page.locator('[role="dialog"]').isVisible();
      
      if (dialogVisible) {
        await logTestResult(suiteName, 'Required field validation prevents submission', 'passed');
      } else {
        await logTestResult(suiteName, 'Required field validation prevents submission', 'failed', { 
          error: 'Form submitted without required fields' 
        });
      }
    } catch (error) {
      await logTestResult(suiteName, 'Required field validation prevents submission', 'failed', { error: error.message });
    }
    
    // Test 3: Valid Form Submission (if organizations exist)
    try {
      // Fill required fields
      await page.fill('input[name="subject"]', 'E2E Test Interaction');
      await page.selectOption('select[name="type"]', 'email');
      await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
      
      // Try to select an organization (if any exist)
      const orgOptions = await page.locator('select[name="organization_id"] option').count();
      if (orgOptions > 1) { // More than just placeholder
        await page.selectOption('select[name="organization_id"]', { index: 1 });
        
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000); // Allow submission
        
        // Check if dialog closed (successful submission)
        const dialogVisible = await page.locator('[role="dialog"]').isVisible();
        
        if (!dialogVisible) {
          await logTestResult(suiteName, 'Valid form submits successfully', 'passed');
        } else {
          await logTestResult(suiteName, 'Valid form submits successfully', 'failed', { 
            error: 'Form did not submit despite valid data' 
          });
        }
      } else {
        await logTestResult(suiteName, 'Valid form submits successfully', 'skipped', { 
          reason: 'No organizations available for testing' 
        });
      }
    } catch (error) {
      await logTestResult(suiteName, 'Valid form submits successfully', 'failed', { error: error.message });
    }
    
  } catch (error) {
    await logTestResult(suiteName, 'Suite execution', 'failed', { error: error.message });
  }
}

// Test Suite 5: Mobile Responsiveness
async function testMobileResponsiveness(page) {
  const suiteName = 'Mobile Responsiveness';
  console.log(`\n🧪 Testing ${suiteName}...`);
  
  for (const [viewportName, dimensions] of Object.entries(CONFIG.viewports)) {
    try {
      console.log(`📱 Testing ${viewportName} viewport (${dimensions.width}x${dimensions.height})`);
      
      await page.setViewportSize(dimensions);
      await navigateToInteractions(page);
      await page.waitForTimeout(500); // Allow layout adjustment
      
      await takeScreenshot(page, `interactions_${viewportName}`, `Interactions page on ${viewportName}`);
      
      // Test button accessibility (minimum 44px for touch)
      const addButton = await page.locator('button:has-text("Add Interaction")');
      const buttonBox = await addButton.boundingBox();
      
      if (buttonBox && (buttonBox.height >= 44 || buttonBox.width >= 44)) {
        await logTestResult(suiteName, `${viewportName} - Button accessibility`, 'passed', { 
          size: `${buttonBox.width}x${buttonBox.height}` 
        });
      } else {
        await logTestResult(suiteName, `${viewportName} - Button accessibility`, 'failed', { 
          error: `Button too small: ${buttonBox?.width}x${buttonBox?.height}` 
        });
      }
      
      // Test table responsiveness
      const table = await page.locator('table');
      const tableVisible = await table.isVisible();
      
      if (tableVisible) {
        await logTestResult(suiteName, `${viewportName} - Table visibility`, 'passed');
      } else {
        await logTestResult(suiteName, `${viewportName} - Table visibility`, 'failed', { 
          error: 'Table not visible on this viewport' 
        });
      }
      
    } catch (error) {
      await logTestResult(suiteName, `${viewportName} - Viewport test`, 'failed', { error: error.message });
    }
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Interactions E2E Tests...\n');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${'*'.repeat(password.length)}`);
  console.log(`🌐 Base URL: ${CONFIG.baseUrl}`);
  console.log(`🖥️  Headless: ${CONFIG.headless}\n`);
  
  let browser, page;
  
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: CONFIG.headless,
      slowMo: CONFIG.headless ? 0 : 100 // Slow down for visual debugging
    });
    page = await browser.newPage();
    
    // Set default timeout
    page.setDefaultTimeout(CONFIG.timeouts.element);
    
    // Authenticate
    const authSuccess = await authenticateUser(page);
    if (!authSuccess) {
      console.error('💥 Authentication failed. Cannot proceed with tests.');
      console.error('Please check credentials or create a test user.');
      process.exit(1);
    }
    
    // Run test suites
    await testPageLoadAndNavigation(page);
    await testStatsDashboard(page);
    await testSearchAndFiltering(page);
    await testFormValidation(page);
    await testMobileResponsiveness(page);
    
    // Generate report
    await generateTestReport();
    
  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
    testResults.executionError = error.message;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Generate Test Report
async function generateTestReport() {
  console.log('\n📊 Test Execution Summary:');
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`⏭️  Skipped: ${testResults.summary.skipped}`);
  console.log(`📋 Total: ${testResults.summary.total}`);
  
  const passRate = testResults.summary.total > 0 
    ? (testResults.summary.passed / testResults.summary.total * 100).toFixed(1)
    : 0;
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  // Save detailed results
  const reportPath = path.join(__dirname, 'interactions-e2e-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`📄 Detailed results saved to: ${reportPath}`);
  
  // Create markdown report
  await generateMarkdownReport();
}

async function generateMarkdownReport() {
  const reportPath = path.join(__dirname, 'interactions-e2e-test-results.md');
  const passRate = testResults.summary.total > 0 
    ? (testResults.summary.passed / testResults.summary.total * 100).toFixed(1)
    : 0;
  
  let markdown = `# Interactions E2E Test Results\n\n`;
  markdown += `**Test Date**: ${testResults.timestamp}\n`;
  markdown += `**Environment**: ${testResults.environment}\n`;
  markdown += `**Browser**: ${testResults.browser}\n`;
  markdown += `**Pass Rate**: ${passRate}% (${testResults.summary.passed}/${testResults.summary.total})\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- ✅ Passed: ${testResults.summary.passed}\n`;
  markdown += `- ❌ Failed: ${testResults.summary.failed}\n`;
  markdown += `- ⏭️ Skipped: ${testResults.summary.skipped}\n`;
  markdown += `- 📋 Total: ${testResults.summary.total}\n\n`;
  
  for (const [suiteName, suite] of Object.entries(testResults.testSuites)) {
    markdown += `## ${suiteName}\n\n`;
    
    for (const test of suite.tests) {
      const statusEmoji = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
      markdown += `${statusEmoji} **${test.name}**\n`;
      
      if (test.error) {
        markdown += `   - Error: ${test.error}\n`;
      }
      if (test.value !== undefined) {
        markdown += `   - Value: ${test.value}\n`;
      }
      if (test.reason) {
        markdown += `   - Reason: ${test.reason}\n`;
      }
      markdown += `\n`;
    }
  }
  
  fs.writeFileSync(reportPath, markdown);
  console.log(`📄 Markdown report saved to: ${reportPath}`);
}

// Handle process exit
process.on('SIGINT', async () => {
  console.log('\n🛑 Test execution interrupted');
  await generateTestReport();
  process.exit(0);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      const success = testResults.summary.failed === 0 && testResults.summary.total > 0;
      console.log(`\n🎯 Test execution ${success ? 'completed successfully' : 'completed with issues'}!`);
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  authenticateUser,
  testPageLoadAndNavigation,
  testStatsDashboard,
  testSearchAndFiltering,
  testFormValidation,
  testMobileResponsiveness
};