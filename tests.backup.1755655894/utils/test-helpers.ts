import { Page, expect, Locator } from '@playwright/test';
import { TestDataGenerator, TestViewports } from './test-data';

/**
 * Common test helper utilities
 * Provides reusable functions for test operations across different test suites
 */

/**
 * Database helpers for test data management
 */
export class DatabaseHelpers {
  /**
   * Clean up test data after test execution
   * This should be called in test teardown to ensure test isolation
   */
  static async cleanupTestData(testDataIds: { [entity: string]: string[] }) {
    // In a real implementation, this would make API calls to clean up test data
    // For now, we'll just log what would be cleaned up
    console.log('🧹 Cleaning up test data:', testDataIds);
    
    // Example cleanup operations:
    // - Delete test organizations
    // - Delete test contacts
    // - Delete test opportunities
    // - Delete test products
    // - Delete test interactions
    // - Reset any modified system settings
  }

  /**
   * Create seed data for testing
   */
  static async createSeedData() {
    // This would create necessary seed data for tests
    const seedData = TestDataGenerator.generateRelatedTestData();
    console.log('🌱 Creating seed data:', seedData);
    return seedData;
  }

  /**
   * Reset database to initial state
   */
  static async resetDatabase() {
    console.log('🔄 Resetting database to initial state');
    // This would reset the test database to a known state
  }
}

/**
 * Performance testing helpers
 */
export class PerformanceHelpers {
  /**
   * Measure page load performance
   */
  static async measurePageLoad(page: Page): Promise<{
    totalLoadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
  }> {
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    return performanceMetrics;
  }

  /**
   * Measure API response times
   */
  static async measureApiResponse(page: Page, urlPattern: string | RegExp): Promise<number> {
    const startTime = Date.now();
    
    const response = await page.waitForResponse(response => {
      const url = response.url();
      return typeof urlPattern === 'string' 
        ? url.includes(urlPattern)
        : urlPattern.test(url);
    });
    
    const endTime = Date.now();
    return endTime - startTime;
  }

  /**
   * Check memory usage
   */
  static async checkMemoryUsage(page: Page) {
    const memoryInfo = await page.evaluate(() => {
      // @ts-ignore
      if (performance.memory) {
        // @ts-ignore
        return {
          // @ts-ignore
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          // @ts-ignore
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          // @ts-ignore
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });
    
    return memoryInfo;
  }
}

/**
 * Responsive design testing helpers
 */
export class ResponsiveHelpers {
  /**
   * Test component responsiveness across different viewports
   */
  static async testResponsiveComponent(
    page: Page, 
    component: Locator, 
    viewports: { width: number; height: number }[]
  ) {
    const results = [];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to stabilize
      
      const boundingBox = await component.boundingBox();
      const isVisible = await component.isVisible();
      
      results.push({
        viewport,
        boundingBox,
        isVisible,
        isMobileView: viewport.width < 768,
        isTabletView: viewport.width >= 768 && viewport.width < 1024
      });
    }
    
    return results;
  }

  /**
   * Test mobile navigation patterns
   */
  static async testMobileNavigation(page: Page) {
    await page.setViewportSize(TestViewports.mobile);
    
    // Check if mobile menu toggle exists
    const mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
    const hasMobileMenu = await mobileMenuToggle.isVisible();
    
    if (hasMobileMenu) {
      // Test mobile menu functionality
      await mobileMenuToggle.click();
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      const menuVisible = await mobileMenu.isVisible();
      
      return { hasMobileMenu: true, menuWorking: menuVisible };
    }
    
    return { hasMobileMenu: false, menuWorking: false };
  }

  /**
   * Test touch interactions for mobile
   */
  static async testTouchInteractions(page: Page, element: Locator) {
    await page.setViewportSize(TestViewports.mobile);
    
    // Test tap
    await element.tap();
    
    // Test long press (if needed)
    const boundingBox = await element.boundingBox();
    if (boundingBox) {
      await page.touchscreen.tap(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
      );
    }
  }
}

/**
 * Form testing helpers
 */
export class FormHelpers {
  /**
   * Fill form with test data
   */
  static async fillForm(page: Page, formData: Record<string, any>, formSelector?: string) {
    const form = formSelector ? page.locator(formSelector) : page;
    
    for (const [fieldName, value] of Object.entries(formData)) {
      if (value !== undefined && value !== null) {
        const field = form.locator(`[name="${fieldName}"], [data-testid="${fieldName}"], [data-testid="${fieldName}-input"]`);
        
        if (await field.isVisible()) {
          const fieldType = await field.getAttribute('type') || await field.evaluate(el => el.tagName.toLowerCase());
          
          switch (fieldType) {
            case 'checkbox':
              if (value) await field.check();
              break;
            case 'select':
              await field.selectOption(value.toString());
              break;
            case 'textarea':
              await field.fill(value.toString());
              break;
            default:
              await field.fill(value.toString());
          }
        }
      }
    }
  }

  /**
   * Validate form errors
   */
  static async validateFormErrors(page: Page, expectedErrors: string[]) {
    const errorMessages = [];
    
    for (const expectedError of expectedErrors) {
      const errorElement = page.locator(`text="${expectedError}"`);
      const isVisible = await errorElement.isVisible();
      
      errorMessages.push({
        error: expectedError,
        visible: isVisible
      });
    }
    
    return errorMessages;
  }

  /**
   * Test form field validation
   */
  static async testFieldValidation(page: Page, fieldSelector: string, testCases: Array<{
    value: string;
    shouldBeValid: boolean;
    expectedError?: string;
  }>) {
    const results = [];
    
    for (const testCase of testCases) {
      const field = page.locator(fieldSelector);
      await field.fill(testCase.value);
      await field.blur(); // Trigger validation
      
      await page.waitForTimeout(300); // Allow validation to complete
      
      const hasError = await page.locator('.error, .text-red-500, [role="alert"]').isVisible();
      
      results.push({
        value: testCase.value,
        expectedValid: testCase.shouldBeValid,
        actuallyValid: !hasError,
        passed: testCase.shouldBeValid === !hasError
      });
    }
    
    return results;
  }
}

/**
 * Table testing helpers
 */
export class TableHelpers {
  /**
   * Get table data as array of objects
   */
  static async getTableData(table: Locator): Promise<any[]> {
    const headers = await table.locator('thead th').allTextContents();
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    
    const data = [];
    
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cells = await row.locator('td').allTextContents();
      
      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header.toLowerCase().replace(/\s+/g, '_')] = cells[index]?.trim();
      });
      
      data.push(rowData);
    }
    
    return data;
  }

  /**
   * Search table for specific values
   */
  static async searchInTable(table: Locator, searchTerm: string): Promise<boolean> {
    const tableText = await table.textContent();
    return tableText?.includes(searchTerm) || false;
  }

  /**
   * Sort table and verify sorting
   */
  static async testTableSorting(page: Page, columnHeader: Locator, dataSelector: string) {
    // Get initial data
    const initialData = await page.locator(dataSelector).allTextContents();
    
    // Click to sort
    await columnHeader.click();
    await page.waitForTimeout(500);
    
    // Get sorted data
    const sortedData = await page.locator(dataSelector).allTextContents();
    
    // Check if data order changed
    const orderChanged = JSON.stringify(initialData) !== JSON.stringify(sortedData);
    
    return { orderChanged, initialData, sortedData };
  }

  /**
   * Test table pagination
   */
  static async testPagination(page: Page, nextButton: Locator, prevButton: Locator, dataSelector: string) {
    // Get page 1 data
    const page1Data = await page.locator(dataSelector).allTextContents();
    
    // Go to next page
    await nextButton.click();
    await page.waitForTimeout(500);
    
    // Get page 2 data
    const page2Data = await page.locator(dataSelector).allTextContents();
    
    // Go back to previous page
    await prevButton.click();
    await page.waitForTimeout(500);
    
    // Get data again
    const backToPage1Data = await page.locator(dataSelector).allTextContents();
    
    return {
      paginationWorks: JSON.stringify(page1Data) !== JSON.stringify(page2Data),
      returnedToPreviousPage: JSON.stringify(page1Data) === JSON.stringify(backToPage1Data)
    };
  }
}

/**
 * Authentication helpers
 */
export class AuthHelpers {
  /**
   * Login with credentials
   */
  static async login(page: Page, email: string, password: string) {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for either success or error
    await Promise.race([
      page.waitForURL('/dashboard'),
      page.waitForSelector('[data-testid="error-message"]')
    ]);
  }

  /**
   * Logout from application
   */
  static async logout(page: Page) {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('/login');
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(page: Page): Promise<boolean> {
    try {
      await page.locator('[data-testid="user-menu"]').waitFor({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * File helpers for import/export testing
 */
export class FileHelpers {
  /**
   * Create temporary CSV file for testing
   */
  static async createTempCSV(fileName: string, content: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
    
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, content);
    
    return filePath;
  }

  /**
   * Clean up temporary files
   */
  static async cleanupTempFiles() {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    
    try {
      const files = await fs.readdir(tempDir);
      
      for (const file of files) {
        await fs.unlink(path.join(tempDir, file));
      }
    } catch {
      // Directory might not exist
    }
  }
}

/**
 * Wait helpers for better test reliability
 */
export class WaitHelpers {
  /**
   * Wait for element to be stable (not moving)
   */
  static async waitForElementToBeStable(element: Locator, timeout: number = 1000) {
    let previousBox = await element.boundingBox();
    let stableCount = 0;
    const requiredStableChecks = 3;
    const checkInterval = 100;
    
    while (stableCount < requiredStableChecks) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      
      const currentBox = await element.boundingBox();
      
      if (JSON.stringify(previousBox) === JSON.stringify(currentBox)) {
        stableCount++;
      } else {
        stableCount = 0;
        previousBox = currentBox;
      }
    }
  }

  /**
   * Wait for network to be idle
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 5000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for API call with specific response
   */
  static async waitForApiCall(page: Page, url: string | RegExp, expectedStatus: number = 200) {
    const response = await page.waitForResponse(response => {
      const responseUrl = response.url();
      const matchesUrl = typeof url === 'string' ? responseUrl.includes(url) : url.test(responseUrl);
      return matchesUrl && response.status() === expectedStatus;
    });
    
    return response;
  }
}

/**
 * Screenshot helpers for visual testing
 */
export class ScreenshotHelpers {
  /**
   * Take comparison screenshots across viewports
   */
  static async takeResponsiveScreenshots(page: Page, name: string) {
    const screenshots = [];
    
    for (const [viewportName, viewport] of Object.entries(TestViewports)) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      const screenshotPath = `test-results/screenshots/${name}-${viewportName}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      screenshots.push({ viewport: viewportName, path: screenshotPath });
    }
    
    return screenshots;
  }

  /**
   * Take element screenshot
   */
  static async takeElementScreenshot(element: Locator, name: string) {
    const screenshotPath = `test-results/screenshots/element-${name}-${Date.now()}.png`;
    await element.screenshot({ path: screenshotPath });
    return screenshotPath;
  }
}