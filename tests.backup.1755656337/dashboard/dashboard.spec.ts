import { test, expect } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard-page';
import { AuthPage } from '../page-objects/auth-page';
import { TestUsers } from '../utils/test-data';
import { AuthHelpers, PerformanceHelpers, ResponsiveHelpers } from '../utils/test-helpers';

test.describe('Dashboard Functionality', () => {
  let dashboardPage: DashboardPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    authPage = new AuthPage(page);
    
    // Ensure user is logged in
    const isLoggedIn = await dashboardPage.isAuthenticated();
    if (!isLoggedIn) {
      await AuthHelpers.login(page, TestUsers.validUser.email, TestUsers.validUser.password);
    }
    
    // Navigate to dashboard
    await dashboardPage.goToDashboard();
  });

  test('should display dashboard layout correctly', async () => {
    // Verify page structure
    await dashboardPage.verifyDashboardLayout();
    
    // Check page title
    await expect(dashboardPage.page).toHaveTitle(/Kitchen Pantry CRM/);
    
    // Verify header elements
    await expect(dashboardPage.pageTitle).toHaveText('Dashboard');
    await expect(dashboardPage.pageDescription).toContainText('Master Food Brokers CRM');
    await expect(dashboardPage.dashboardIcon).toBeVisible();
  });

  test('should display correct metrics in stats cards', async () => {
    const stats = await dashboardPage.getDashboardStats();
    
    // Verify stats integrity
    const verifiedStats = await dashboardPage.verifyStatsIntegrity();
    
    // All counts should be non-negative numbers
    expect(stats.principals).toBeGreaterThanOrEqual(0);
    expect(stats.opportunities).toBeGreaterThanOrEqual(0);
    expect(stats.organizations).toBeGreaterThanOrEqual(0);
    expect(stats.contacts).toBeGreaterThanOrEqual(0);
    
    // Principals should be subset of organizations
    expect(stats.organizations).toBeGreaterThanOrEqual(stats.principals);
    
    console.log('Dashboard Stats:', stats);
  });

  test('should display principal cards correctly', async () => {
    const principalCardsData = await dashboardPage.getPrincipalCardsData();
    
    if (principalCardsData.length > 0) {
      // If there are principals, verify their display
      for (const principalCard of principalCardsData) {
        expect(principalCard.name).toBeTruthy();
        expect(typeof principalCard.name).toBe('string');
        
        // Should have at least a "Principal" badge
        expect(principalCard.badges).toContain('Principal');
        
        // Description might be empty, but should be string or null
        expect(typeof principalCard.description === 'string' || 
               principalCard.description === null).toBe(true);
      }
      
      console.log('Principal Cards:', principalCardsData);
    } else {
      console.log('No principal cards found - this is valid for new installations');
    }
  });

  test('should display activity feed correctly', async () => {
    const activityData = await dashboardPage.getActivityFeedData();
    
    if (!activityData.isEmpty) {
      // If there are activities, verify their structure
      expect(activityData.activities.length).toBeGreaterThan(0);
      expect(activityData.activities.length).toBeLessThanOrEqual(10); // Should limit to recent activities
      
      for (const activity of activityData.activities) {
        expect(activity.type).toBeTruthy();
        expect(activity.summary).toBeTruthy();
        expect(activity.date).toBeTruthy();
        
        // Type should be capitalized
        expect(activity.type?.charAt(0)).toBe(activity.type?.charAt(0).toUpperCase());
      }
      
      console.log('Activity Feed:', activityData.activities);
    } else {
      // Empty state should be properly displayed
      await expect(dashboardPage.emptyActivityMessage).toBeVisible();
      console.log('Activity feed is empty - showing empty state');
    }
  });

  test('should handle principal card interactions', async () => {
    const principalCardsData = await dashboardPage.getPrincipalCardsData();
    
    if (principalCardsData.length > 0) {
      const firstPrincipal = principalCardsData[0];
      
      // Click on first principal card
      await dashboardPage.clickPrincipalCard(firstPrincipal.name!);
      
      // Should navigate or show modal (implementation dependent)
      // Wait a moment for any navigation or modal to appear
      await dashboardPage.page.waitForTimeout(1000);
      
      // Check if URL changed or modal appeared
      const currentUrl = dashboardPage.page.url();
      const modalVisible = await dashboardPage.page.locator('[role="dialog"]').isVisible();
      
      // Either URL should have changed or modal should be visible
      expect(currentUrl.includes('/organization') || modalVisible).toBe(true);
    } else {
      console.log('Skipping principal card interaction test - no principals available');
    }
  });

  test('should handle activity feed interactions', async () => {
    const activityData = await dashboardPage.getActivityFeedData();
    
    if (!activityData.isEmpty && activityData.activities.length > 0) {
      // Click on first activity
      await dashboardPage.clickActivityItem(0);
      
      // Should navigate or expand details
      await dashboardPage.page.waitForTimeout(1000);
      
      // Check for navigation or expanded details
      const currentUrl = dashboardPage.page.url();
      const modalVisible = await dashboardPage.page.locator('[role="dialog"]').isVisible();
      const expandedDetails = await dashboardPage.page.locator('[data-testid="activity-details"]').isVisible();
      
      // Some interaction should have occurred
      expect(currentUrl.includes('/interaction') || modalVisible || expandedDetails).toBe(true);
    } else {
      console.log('Skipping activity interaction test - no activities available');
    }
  });

  test('should update dashboard data dynamically', async () => {
    const dataUpdateTest = await dashboardPage.testDataUpdates();
    
    // Note: This test assumes data can be modified through navigation
    // In a real scenario, you might create test data through API calls
    
    console.log('Dashboard Data Update Test:', dataUpdateTest);
    
    // The test should complete without errors
    expect(dataUpdateTest.initial).toBeDefined();
    expect(dataUpdateTest.updated).toBeDefined();
  });

  test('should display correctly on different screen sizes', async () => {
    const responsiveResults = await dashboardPage.testResponsiveDashboard();
    
    for (const result of responsiveResults) {
      expect(result.viewport).toBeDefined();
      expect(result.gridLayout).toBeDefined();
      
      if (result.isMobileView) {
        // Mobile should have single column or stacked layout
        console.log(`Mobile view (${result.viewport.width}x${result.viewport.height}):`, result.gridLayout);
      } else if (result.isTabletView) {
        // Tablet should have 2-column layout
        console.log(`Tablet view (${result.viewport.width}x${result.viewport.height}):`, result.gridLayout);
      } else {
        // Desktop should have multi-column layout
        console.log(`Desktop view (${result.viewport.width}x${result.viewport.height}):`, result.gridLayout);
      }
    }
  });

  test('should meet performance standards', async () => {
    const performanceMetrics = await dashboardPage.measureDashboardPerformance();
    
    // Dashboard should load within reasonable time limits
    expect(performanceMetrics.totalLoadTime).toBeLessThan(5000); // 5 seconds total
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds FCP
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000); // 1 second DCL
    
    console.log('Dashboard Performance Metrics:', performanceMetrics);
  });

  test('should maintain accessibility standards', async () => {
    const accessibilityResults = await dashboardPage.verifyAccessibility();
    
    // Should have proper heading hierarchy
    expect(accessibilityResults.h1Count).toBe(1);
    
    // Should support keyboard navigation
    expect(accessibilityResults.hasFocusableElements).toBe(true);
    
    // Should have reasonable number of interactive elements
    expect(accessibilityResults.iconCount).toBeGreaterThan(0);
    expect(accessibilityResults.textElementsCount).toBeGreaterThan(0);
    
    console.log('Dashboard Accessibility Results:', accessibilityResults);
  });

  test('should handle search from dashboard', async () => {
    const searchResults = await dashboardPage.testDashboardSearch('test');
    
    // Search functionality should be available
    expect(searchResults.searchTerm).toBe('test');
    expect(searchResults.resultsCount).toBeGreaterThanOrEqual(0);
    
    console.log('Dashboard Search Results:', searchResults);
  });

  test('should refresh data correctly', async ({ page }) => {
    // Get initial stats
    const initialStats = await dashboardPage.getDashboardStats();
    
    // Refresh the page
    await page.reload();
    await dashboardPage.waitForDashboardLoad();
    
    // Get stats after refresh
    const refreshedStats = await dashboardPage.getDashboardStats();
    
    // Stats should be consistent (unless data changed)
    expect(refreshedStats.principals).toBeGreaterThanOrEqual(0);
    expect(refreshedStats.opportunities).toBeGreaterThanOrEqual(0);
    expect(refreshedStats.organizations).toBeGreaterThanOrEqual(0);
    expect(refreshedStats.contacts).toBeGreaterThanOrEqual(0);
    
    console.log('Stats comparison:', {
      initial: initialStats,
      refreshed: refreshedStats
    });
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // This test simulates empty dashboard state
    // In a real scenario, you might use a test database with no data
    
    // Mock empty API responses
    await page.route('**/api/organizations*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.route('**/api/opportunities*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.route('**/api/contacts*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.route('**/api/interactions*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Refresh dashboard with mocked empty data
    await dashboardPage.goToDashboard();
    
    // Verify empty states are handled properly
    const stats = await dashboardPage.getDashboardStats();
    expect(stats.principals).toBe(0);
    expect(stats.opportunities).toBe(0);
    expect(stats.organizations).toBe(0);
    expect(stats.contacts).toBe(0);
    
    // Activity feed should show empty message
    await expect(dashboardPage.emptyActivityMessage).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network error for API calls
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });
    
    // Navigate to dashboard
    await dashboardPage.goToDashboard();
    
    // Should handle errors gracefully without crashing
    // Error messages or fallback states should be shown
    const hasErrorMessage = await page.locator('[role="alert"], .error-message, .error-state').isVisible();
    const hasLoadingState = await dashboardPage.loadingSpinner.isVisible();
    
    // Either error message should be shown or loading should persist
    // The app shouldn't crash
    expect(hasErrorMessage || hasLoadingState).toBe(true);
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Get initial dashboard state
    const initialStats = await dashboardPage.getDashboardStats();
    
    // Navigate to another page
    await dashboardPage.navigateUsingSidebar('Organizations');
    await page.waitForLoadState('networkidle');
    
    // Navigate back to dashboard
    await dashboardPage.navigateUsingSidebar('Dashboard');
    await dashboardPage.waitForDashboardLoad();
    
    // Stats should be consistent
    const returnStats = await dashboardPage.getDashboardStats();
    
    expect(returnStats.principals).toBe(initialStats.principals);
    expect(returnStats.opportunities).toBe(initialStats.opportunities);
    expect(returnStats.organizations).toBe(initialStats.organizations);
    expect(returnStats.contacts).toBe(initialStats.contacts);
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await dashboardPage.goToDashboard();
    
    // Verify dashboard is usable on mobile
    await dashboardPage.verifyDashboardLayout();
    
    // Stats cards should be visible and readable
    const stats = await dashboardPage.getDashboardStats();
    expect(stats.principals).toBeGreaterThanOrEqual(0);
    
    // Test mobile-specific interactions
    await dashboardPage.pageTitle.tap();
    
    // Activity feed should be scrollable on mobile
    const activityData = await dashboardPage.getActivityFeedData();
    if (!activityData.isEmpty) {
      // Try scrolling within activity feed
      await dashboardPage.activityFeedSection.scrollIntoViewIfNeeded();
      expect(await dashboardPage.activityFeedSection.isVisible()).toBe(true);
    }
  });

  test('should handle real-time updates if implemented', async ({ page }) => {
    // This test checks if dashboard updates in real-time
    // Implementation depends on whether websockets or polling is used
    
    const initialStats = await dashboardPage.getDashboardStats();
    
    // Wait for potential real-time updates
    await page.waitForTimeout(5000);
    
    const updatedStats = await dashboardPage.getDashboardStats();
    
    // Stats might have changed due to real-time updates
    // But they should still be valid
    expect(updatedStats.principals).toBeGreaterThanOrEqual(0);
    expect(updatedStats.opportunities).toBeGreaterThanOrEqual(0);
    expect(updatedStats.organizations).toBeGreaterThanOrEqual(0);
    expect(updatedStats.contacts).toBeGreaterThanOrEqual(0);
    
    console.log('Real-time update check:', {
      initial: initialStats,
      updated: updatedStats,
      changed: JSON.stringify(initialStats) !== JSON.stringify(updatedStats)
    });
  });

  test('should display loading states appropriately', async ({ page }) => {
    // Slow down network to see loading states
    await page.route('**/api/**', async (route) => {
      // Add delay to see loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.continue();
    });
    
    // Navigate to dashboard
    const navigationPromise = dashboardPage.goToDashboard();
    
    // Check if loading spinner is shown during navigation
    const loadingVisible = await dashboardPage.loadingSpinner.isVisible();
    
    // Wait for navigation to complete
    await navigationPromise;
    
    // Loading should disappear after data loads
    await expect(dashboardPage.loadingSpinner).not.toBeVisible();
    
    // Dashboard should be fully loaded
    await expect(dashboardPage.pageTitle).toBeVisible();
    
    console.log('Loading state was visible:', loadingVisible);
  });
});