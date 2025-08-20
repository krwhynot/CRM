import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object Model class
 * Contains common functionality shared across all pages in the CRM application
 */
export class BasePage {
  readonly page: Page;
  
  // Common selectors used across multiple pages
  readonly loadingSpinner: Locator;
  readonly toast: Locator;
  readonly errorAlert: Locator;
  readonly sidebar: Locator;
  readonly userMenu: Locator;
  readonly commandPalette: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Common UI elements
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.toast = page.locator('[data-sonner-toast]');
    this.errorAlert = page.locator('[role="alert"]');
    this.sidebar = page.locator('[data-testid="sidebar"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.commandPalette = page.locator('[cmdk-root]');
  }

  /**
   * Navigate to a specific path in the application
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    
    // Wait for loading spinner to disappear if present
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
      // Loading spinner might not be present, which is fine
    }
  }

  /**
   * Wait for and verify toast message
   */
  async expectToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const toastLocator = this.toast.filter({ hasText: message });
    await toastLocator.waitFor({ state: 'visible', timeout: 5000 });
    return toastLocator;
  }

  /**
   * Handle modal dialogs (alerts, confirmations)
   */
  async handleDialog(action: 'accept' | 'dismiss' = 'accept', text?: string) {
    this.page.on('dialog', async dialog => {
      if (text && dialog.message().includes(text)) {
        if (action === 'accept') {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
      }
    });
  }

  /**
   * Open command palette with keyboard shortcut
   */
  async openCommandPalette() {
    await this.page.keyboard.press('Meta+K'); // Mac
    await this.page.keyboard.press('Control+K'); // PC
    await this.commandPalette.waitFor({ state: 'visible' });
  }

  /**
   * Check if user is authenticated by looking for user menu
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.userMenu.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for API response by URL pattern
   */
  async waitForApiResponse(urlPattern: string | RegExp, status: number = 200) {
    const response = await this.page.waitForResponse(response => {
      const url = response.url();
      const matchesPattern = typeof urlPattern === 'string' 
        ? url.includes(urlPattern)
        : urlPattern.test(url);
      return matchesPattern && response.status() === status;
    });
    return response;
  }

  /**
   * Fill form field with proper validation
   */
  async fillField(selector: string, value: string, options: { clear?: boolean } = {}) {
    const field = this.page.locator(selector);
    await field.waitFor({ state: 'visible' });
    
    if (options.clear) {
      await field.clear();
    }
    
    await field.fill(value);
    
    // Trigger validation by blurring the field
    await field.blur();
  }

  /**
   * Select option from dropdown
   */
  async selectDropdownOption(selector: string, optionText: string) {
    const dropdown = this.page.locator(selector);
    await dropdown.click();
    
    // Wait for dropdown options to appear
    const option = this.page.locator(`[role="option"]`).filter({ hasText: optionText });
    await option.waitFor({ state: 'visible' });
    await option.click();
  }

  /**
   * Navigate using sidebar menu
   */
  async navigateUsingSidebar(menuItem: string) {
    const sidebarLink = this.sidebar.locator(`text="${menuItem}"`);
    await sidebarLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Verify breadcrumb navigation
   */
  async verifyBreadcrumb(expectedPath: string[]) {
    const breadcrumb = this.page.locator('[data-testid="breadcrumb"]');
    await breadcrumb.waitFor({ state: 'visible' });
    
    for (const item of expectedPath) {
      await breadcrumb.locator(`text="${item}"`).waitFor({ state: 'visible' });
    }
  }

  /**
   * Check responsive layout at different viewport sizes
   */
  async checkResponsiveLayout(viewports: { width: number; height: number }[]) {
    const results = [];
    
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500); // Allow layout to stabilize
      
      // Check if mobile menu is visible on small screens
      const isMobileView = viewport.width < 768;
      const mobileMenu = this.page.locator('[data-testid="mobile-menu-trigger"]');
      
      results.push({
        viewport,
        isMobileView,
        hasMobileMenu: await mobileMenu.isVisible(),
      });
    }
    
    return results;
  }

  /**
   * Measure page performance metrics
   */
  async measurePerformance() {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    return performanceMetrics;
  }

  /**
   * Clean up any test data or state
   */
  async cleanup() {
    // Override in specific page classes as needed
  }
}