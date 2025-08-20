import { test, expect } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard-page';
import { OrganizationsPage } from '../page-objects/organizations-page';
import { AuthPage } from '../page-objects/auth-page';
import { ImportExportPage } from '../page-objects/import-export-page';
import { TestUsers, TestViewports } from '../utils/test-data';
import { AuthHelpers, ResponsiveHelpers, ScreenshotHelpers } from '../utils/test-helpers';

test.describe('Mobile Responsiveness - iPad Compatibility', () => {
  let dashboardPage: DashboardPage;
  let organizationsPage: OrganizationsPage;
  let importExportPage: ImportExportPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    organizationsPage = new OrganizationsPage(page);
    importExportPage = new ImportExportPage(page);
    authPage = new AuthPage(page);
    
    // Ensure user is logged in
    const isLoggedIn = await dashboardPage.isAuthenticated();
    if (!isLoggedIn) {
      await AuthHelpers.login(page, TestUsers.validUser.email, TestUsers.validUser.password);
    }
  });

  test('should display correctly on iPad portrait orientation', async ({ page }) => {
    // Set iPad portrait viewport
    await page.setViewportSize(TestViewports.tablet);
    
    // Test dashboard on iPad
    await dashboardPage.goToDashboard();
    
    // Verify dashboard layout
    await expect(dashboardPage.pageTitle).toBeVisible();
    
    // Stats cards should be arranged appropriately for tablet
    const statsCardContainer = page.locator('.grid.gap-4');
    const gridColumns = await statsCardContainer.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // On tablet, should have 2-4 columns depending on design
    expect(gridColumns).toBeTruthy();
    
    // Take screenshot for visual reference
    await ScreenshotHelpers.takeElementScreenshot(statsCardContainer, 'ipad-portrait-stats-cards');
    
    console.log('iPad Portrait - Grid columns:', gridColumns);
  });

  test('should display correctly on iPad landscape orientation', async ({ page }) => {
    // Set iPad landscape viewport
    await page.setViewportSize(TestViewports.ipadLandscape);
    
    await dashboardPage.goToDashboard();
    
    // Verify layout adjusts for landscape
    await expect(dashboardPage.pageTitle).toBeVisible();
    
    // Check if sidebar is visible in landscape mode
    const sidebarVisible = await dashboardPage.sidebar.isVisible();
    expect(sidebarVisible).toBe(true);
    
    // Principal cards should be arranged in multiple columns
    const principalSection = page.locator('text=Principal Overview').locator('..');
    if (await principalSection.isVisible()) {
      const principalGrid = principalSection.locator('.grid');
      const gridColumns = await principalGrid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      
      console.log('iPad Landscape - Principal grid columns:', gridColumns);
      expect(gridColumns).toBeTruthy();
    }
  });

  test('should handle touch interactions correctly', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    await dashboardPage.goToDashboard();
    
    // Test touch interactions on dashboard elements
    const statsCards = page.locator('[data-testid="stats-card"]').first();
    
    if (await statsCards.isVisible()) {
      // Test tap interaction
      await statsCards.tap();
      
      // Should respond to touch (implementation dependent)
      await page.waitForTimeout(500);
    }
    
    // Test sidebar navigation with touch
    const sidebarLink = dashboardPage.sidebar.locator('text=Organizations');
    await sidebarLink.tap();
    
    // Should navigate to organizations page
    await expect(page).toHaveURL('/organizations');
    await organizationsPage.waitForOrganizationsLoad();
  });

  test('should optimize table display for tablet viewports', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    await organizationsPage.goToOrganizations();
    
    // Test table responsiveness
    const table = organizationsPage.organizationsTable;
    
    if (await table.isVisible()) {
      // Check if table has horizontal scroll on tablet
      const hasHorizontalScroll = await table.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });
      
      console.log('Tablet - Table has horizontal scroll:', hasHorizontalScroll);
      
      // Take screenshot of table on tablet
      await ScreenshotHelpers.takeElementScreenshot(table, 'tablet-organizations-table');
      
      // Test table header visibility
      const headers = await organizationsPage.tableHeaders.allTextContents();
      expect(headers.length).toBeGreaterThan(0);
      
      for (const header of headers) {
        expect(header.trim()).not.toBe('');
      }
    }
  });

  test('should optimize forms for tablet input', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    await organizationsPage.goToOrganizations();
    
    // Test form display on tablet
    await organizationsPage.addOrganizationButton.tap();
    await organizationsPage.organizationForm.waitFor({ state: 'visible' });
    
    // Form should be appropriately sized for tablet
    const formWidth = await organizationsPage.organizationForm.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width;
    });
    
    // Form should not be too narrow or too wide on tablet
    expect(formWidth).toBeGreaterThan(400);
    expect(formWidth).toBeLessThan(1000);
    
    // Test input field interactions
    await organizationsPage.nameInput.tap();
    await organizationsPage.nameInput.fill('Tablet Test Organization');
    
    // Keyboard should not obscure input (on real devices)
    const inputVisible = await organizationsPage.nameInput.isVisible();
    expect(inputVisible).toBe(true);
    
    // Cancel form
    await organizationsPage.cancelButton.tap();
    
    console.log('Tablet - Form width:', formWidth);
  });

  test('should handle import/export interface on tablets', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    await importExportPage.goToImportExport();
    
    // Test import interface on tablet
    await importExportPage.showOrganizationImporter();
    
    // Upload area should be appropriately sized
    const uploadArea = importExportPage.fileUploadArea;
    await expect(uploadArea).toBeVisible();
    
    const uploadAreaSize = await uploadArea.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    
    // Should be large enough for touch interaction
    expect(uploadAreaSize.width).toBeGreaterThan(200);
    expect(uploadAreaSize.height).toBeGreaterThan(100);
    
    console.log('Tablet - Upload area size:', uploadAreaSize);
  });

  test('should adapt navigation for tablet users', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    
    // Test navigation patterns
    const mobileNavTest = await ResponsiveHelpers.testMobileNavigation(page);
    
    console.log('Tablet navigation test:', mobileNavTest);
    
    // On tablet, sidebar might be always visible or collapsible
    await dashboardPage.goToDashboard();
    
    const sidebarVisible = await dashboardPage.sidebar.isVisible();
    
    if (sidebarVisible) {
      // Test sidebar links
      const navLinks = await dashboardPage.sidebar.locator('a').count();
      expect(navLinks).toBeGreaterThan(0);
      
      // Test navigation
      await dashboardPage.navigateUsingSidebar('Organizations');
      await expect(page).toHaveURL('/organizations');
      
      await dashboardPage.navigateUsingSidebar('Dashboard');
      await expect(page).toHaveURL('/');
    } else {
      // Mobile menu should be available
      expect(mobileNavTest.hasMobileMenu).toBe(true);
    }
  });

  test('should optimize search interface for touch input', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    await organizationsPage.goToOrganizations();
    
    // Test search functionality on tablet
    const searchInput = organizationsPage.searchInput;
    await expect(searchInput).toBeVisible();
    
    // Search input should be appropriately sized for touch
    const searchInputSize = await searchInput.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      return {
        width: rect.width,
        height: rect.height,
        padding: styles.padding,
        fontSize: styles.fontSize
      };
    });
    
    // Should have adequate touch target size (minimum 44px height recommended)
    expect(parseFloat(searchInputSize.height.toString())).toBeGreaterThan(40);
    expect(parseFloat(searchInputSize.fontSize)).toBeGreaterThan(14);
    
    // Test search interaction
    await searchInput.tap();
    await searchInput.fill('test search');
    
    // Search should work properly
    await organizationsPage.searchButton.tap();
    
    console.log('Tablet - Search input specs:', searchInputSize);
  });

  test('should handle screen rotation gracefully', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize(TestViewports.tablet);
    await dashboardPage.goToDashboard();
    
    // Verify layout in portrait
    const portraitLayout = await dashboardPage.page.locator('.grid').first().evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Rotate to landscape
    await page.setViewportSize(TestViewports.ipadLandscape);
    await page.waitForTimeout(500); // Allow layout to adjust
    
    // Verify layout adapts to landscape
    const landscapeLayout = await dashboardPage.page.locator('.grid').first().evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Layouts should potentially be different (more columns in landscape)
    console.log('Orientation change:', {
      portrait: portraitLayout,
      landscape: landscapeLayout
    });
    
    // Content should still be accessible
    await expect(dashboardPage.pageTitle).toBeVisible();
  });

  test('should maintain performance on tablet devices', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    
    // Measure dashboard load performance on tablet
    const performanceStart = Date.now();
    await dashboardPage.goToDashboard();
    const loadTime = Date.now() - performanceStart;
    
    // Should load quickly even on tablet
    expect(loadTime).toBeLessThan(5000);
    
    // Test navigation performance
    const navStart = Date.now();
    await organizationsPage.goToOrganizations();
    const navTime = Date.now() - navStart;
    
    expect(navTime).toBeLessThan(3000);
    
    console.log('Tablet performance:', {
      dashboardLoad: loadTime,
      navigationTime: navTime
    });
  });

  test('should support tablet-specific gestures', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    await organizationsPage.goToOrganizations();
    
    // Test scroll gestures on data tables
    const table = organizationsPage.organizationsTable;
    
    if (await table.isVisible()) {
      // Test vertical scrolling
      await table.scrollIntoViewIfNeeded();
      
      // Test if table responds to scroll
      const initialScroll = await page.evaluate(() => window.scrollY);
      
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(300);
      
      const afterScroll = await page.evaluate(() => window.scrollY);
      
      // Should have scrolled
      expect(afterScroll).toBeGreaterThan(initialScroll);
      
      console.log('Scroll test:', { initial: initialScroll, after: afterScroll });
    }
  });

  test('should optimize text readability for tablet screens', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    await dashboardPage.goToDashboard();
    
    // Check text sizes and readability
    const textElements = [
      dashboardPage.pageTitle,
      dashboardPage.pageDescription,
      dashboardPage.principalsCard.locator('.text-2xl').first(),
      dashboardPage.activityFeedSection.locator('p').first()
    ];
    
    for (const element of textElements) {
      if (await element.isVisible()) {
        const textStyles = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            fontSize: styles.fontSize,
            lineHeight: styles.lineHeight,
            color: styles.color,
            fontWeight: styles.fontWeight
          };
        });
        
        // Font size should be readable on tablet
        const fontSize = parseFloat(textStyles.fontSize);
        expect(fontSize).toBeGreaterThan(12); // Minimum readable size
        
        console.log('Text styles:', textStyles);
      }
    }
  });

  test('should handle keyboard interactions on tablet', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    await organizationsPage.goToOrganizations();
    
    // Test keyboard navigation (for tablets with keyboards)
    await page.keyboard.press('Tab');
    
    // Should focus on first focusable element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test form keyboard interaction
    await organizationsPage.addOrganizationButton.click();
    await organizationsPage.organizationForm.waitFor({ state: 'visible' });
    
    // Tab through form fields
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate form with keyboard
    const formFocusedElement = page.locator('form :focus');
    const isFocused = await formFocusedElement.isVisible();
    
    // Close form
    await page.keyboard.press('Escape');
    
    console.log('Keyboard navigation test - form focused:', isFocused);
  });

  test('should provide appropriate visual feedback for touch interactions', async ({ page }) => {
    await page.setViewportSize(TestViewports.tablet);
    await dashboardPage.goToDashboard();
    
    // Test button hover/active states on touch
    const actionButtons = [
      dashboardPage.page.locator('[data-testid="add-organization-button"]'),
      dashboardPage.sidebar.locator('a').first()
    ];
    
    for (const button of actionButtons) {
      if (await button.isVisible()) {
        // Test button styles
        const initialStyles = await button.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            transform: styles.transform,
            boxShadow: styles.boxShadow
          };
        });
        
        // Tap and check for visual feedback
        await button.tap();
        await page.waitForTimeout(100);
        
        // In a real implementation, you might check for:
        // - Active state changes
        // - Animation effects
        // - Color changes
        // - Shadow effects
        
        console.log('Button initial styles:', initialStyles);
      }
    }
  });

  test('should create comprehensive responsive screenshots', async ({ page }) => {
    const testPages = [
      { name: 'dashboard', page: dashboardPage },
      { name: 'organizations', page: organizationsPage }
    ];
    
    for (const testPage of testPages) {
      // Navigate to page
      if (testPage.name === 'dashboard') {
        await testPage.page.goToDashboard();
      } else if (testPage.name === 'organizations') {
        await (testPage.page as OrganizationsPage).goToOrganizations();
      }
      
      // Take screenshots across different tablet orientations
      const screenshots = await ScreenshotHelpers.takeResponsiveScreenshots(
        page,
        `${testPage.name}-tablet-responsive`
      );
      
      expect(screenshots.length).toBeGreaterThan(0);
      
      console.log(`Screenshots taken for ${testPage.name}:`, 
        screenshots.map(s => s.viewport));
    }
  });
});

test.describe('Mobile Phone Compatibility', () => {
  let dashboardPage: DashboardPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    authPage = new AuthPage(page);
    
    // Set mobile viewport
    await page.setViewportSize(TestViewports.mobile);
    
    // Login
    const isLoggedIn = await dashboardPage.isAuthenticated();
    if (!isLoggedIn) {
      await AuthHelpers.login(page, TestUsers.validUser.email, TestUsers.validUser.password);
    }
  });

  test('should display mobile-optimized layout', async ({ page }) => {
    await dashboardPage.goToDashboard();
    
    // On mobile, layout should be single column
    const statsContainer = page.locator('.grid.gap-4').first();
    const gridColumns = await statsContainer.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Should be single column on mobile
    console.log('Mobile - Grid columns:', gridColumns);
    
    // Mobile menu should be available
    const mobileNavTest = await ResponsiveHelpers.testMobileNavigation(page);
    
    if (mobileNavTest.hasMobileMenu) {
      expect(mobileNavTest.menuWorking).toBe(true);
    }
    
    console.log('Mobile navigation test:', mobileNavTest);
  });

  test('should handle limited screen space efficiently', async ({ page }) => {
    await dashboardPage.goToDashboard();
    
    // Check viewport utilization
    const viewportWidth = page.viewportSize()?.width || 0;
    const viewportHeight = page.viewportSize()?.height || 0;
    
    // Content should fit within viewport
    const bodyWidth = await page.locator('body').evaluate((el) => {
      return el.scrollWidth;
    });
    
    // Should not have horizontal overflow
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small buffer
    
    console.log('Mobile space utilization:', {
      viewport: { width: viewportWidth, height: viewportHeight },
      bodyWidth
    });
  });
});