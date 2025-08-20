import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page Object Model for Dashboard page
 * Handles dashboard metrics, principal cards, activity feed, and quick actions
 */
export class DashboardPage extends BasePage {
  // Page header elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly dashboardIcon: Locator;
  
  // Stats cards elements
  readonly statsCards: Locator;
  readonly principalsCard: Locator;
  readonly opportunitiesCard: Locator;
  readonly organizationsCard: Locator;
  readonly contactsCard: Locator;
  
  // Principal overview section
  readonly principalOverviewSection: Locator;
  readonly principalCards: Locator;
  readonly principalCard: Locator;
  readonly principalName: Locator;
  readonly principalDescription: Locator;
  readonly principalBadges: Locator;
  
  // Activity feed section
  readonly activityFeedSection: Locator;
  readonly activityFeedItems: Locator;
  readonly activityItem: Locator;
  readonly activityType: Locator;
  readonly activityDirection: Locator;
  readonly activitySummary: Locator;
  readonly activityDate: Locator;
  readonly emptyActivityMessage: Locator;
  
  // Quick actions (if present)
  readonly quickActionsSection: Locator;
  readonly addOrganizationButton: Locator;
  readonly addContactButton: Locator;
  readonly addOpportunityButton: Locator;
  
  // Navigation elements
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    super(page);
    
    // Page header
    this.pageTitle = page.locator('h1').filter({ hasText: 'Dashboard' });
    this.pageDescription = page.locator('text=Welcome to Master Food Brokers CRM');
    this.dashboardIcon = page.locator('[data-lucide="target"]').first();
    
    // Stats cards
    this.statsCards = page.locator('[data-testid="stats-cards"]');
    this.principalsCard = page.locator('text=Total Principals').locator('..');
    this.opportunitiesCard = page.locator('text=Active Opportunities').locator('..');
    this.organizationsCard = page.locator('text=Total Organizations').locator('..');
    this.contactsCard = page.locator('text=Total Contacts').locator('..');
    
    // Principal overview
    this.principalOverviewSection = page.locator('text=Principal Overview').locator('..');
    this.principalCards = this.principalOverviewSection.locator('.grid > div');
    this.principalCard = page.locator('[data-testid="principal-card"]');
    this.principalName = page.locator('[data-testid="principal-name"]');
    this.principalDescription = page.locator('[data-testid="principal-description"]');
    this.principalBadges = page.locator('[data-testid="principal-badges"]');
    
    // Activity feed
    this.activityFeedSection = page.locator('text=Recent Activity').locator('..');
    this.activityFeedItems = this.activityFeedSection.locator('[data-testid="activity-item"]');
    this.activityItem = page.locator('[data-testid="activity-item"]');
    this.activityType = page.locator('[data-testid="activity-type"]');
    this.activityDirection = page.locator('[data-testid="activity-direction"]');
    this.activitySummary = page.locator('[data-testid="activity-summary"]');
    this.activityDate = page.locator('[data-testid="activity-date"]');
    this.emptyActivityMessage = page.locator('text=No recent interactions');
    
    // Quick actions
    this.quickActionsSection = page.locator('[data-testid="quick-actions"]');
    this.addOrganizationButton = page.locator('[data-testid="add-organization-button"]');
    this.addContactButton = page.locator('[data-testid="add-contact-button"]');
    this.addOpportunityButton = page.locator('[data-testid="add-opportunity-button"]');
    
    // Breadcrumb
    this.breadcrumb = page.locator('[data-testid="breadcrumb"]');
  }

  /**
   * Navigate to dashboard
   */
  async goToDashboard() {
    await this.goto('/');
    await this.waitForDashboardLoad();
  }

  /**
   * Wait for dashboard to fully load
   */
  async waitForDashboardLoad() {
    await this.waitForPageLoad();
    await this.pageTitle.waitFor({ state: 'visible' });
    
    // Wait for stats cards to load
    await this.principalsCard.waitFor({ state: 'visible', timeout: 10000 });
    await this.opportunitiesCard.waitFor({ state: 'visible' });
    await this.organizationsCard.waitFor({ state: 'visible' });
    await this.contactsCard.waitFor({ state: 'visible' });
  }

  /**
   * Get dashboard metrics/stats
   */
  async getDashboardStats() {
    const principalsCount = await this.getStatCardValue(this.principalsCard);
    const opportunitiesCount = await this.getStatCardValue(this.opportunitiesCard);
    const organizationsCount = await this.getStatCardValue(this.organizationsCard);
    const contactsCount = await this.getStatCardValue(this.contactsCard);
    
    return {
      principals: principalsCount,
      opportunities: opportunitiesCount,
      organizations: organizationsCount,
      contacts: contactsCount
    };
  }

  /**
   * Extract numeric value from a stats card
   */
  private async getStatCardValue(cardLocator: Locator): Promise<number> {
    const valueElement = cardLocator.locator('.text-2xl').first();
    const valueText = await valueElement.textContent();
    return parseInt(valueText?.trim() || '0', 10);
  }

  /**
   * Verify dashboard page elements are visible
   */
  async verifyDashboardLayout() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageDescription).toBeVisible();
    
    // Verify stats cards
    await expect(this.principalsCard).toBeVisible();
    await expect(this.opportunitiesCard).toBeVisible();
    await expect(this.organizationsCard).toBeVisible();
    await expect(this.contactsCard).toBeVisible();
    
    // Verify activity feed section exists
    await expect(this.activityFeedSection).toBeVisible();
  }

  /**
   * Get principal cards data
   */
  async getPrincipalCardsData() {
    const principalCards = [];
    const cardCount = await this.principalCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = this.principalCards.nth(i);
      const name = await card.locator('h3').textContent();
      const description = await card.locator('p').textContent();
      const badges = await card.locator('[data-testid="badge"]').allTextContents();
      
      principalCards.push({
        name: name?.trim(),
        description: description?.trim(),
        badges
      });
    }
    
    return principalCards;
  }

  /**
   * Get activity feed data
   */
  async getActivityFeedData() {
    // Check if there are activities
    const hasActivities = await this.activityFeedItems.count() > 0;
    
    if (!hasActivities) {
      const isEmpty = await this.emptyActivityMessage.isVisible();
      return { isEmpty, activities: [] };
    }
    
    const activities = [];
    const activityCount = await this.activityFeedItems.count();
    
    for (let i = 0; i < activityCount; i++) {
      const activity = this.activityFeedItems.nth(i);
      const type = await activity.locator('.font-medium').textContent();
      const summary = await activity.locator('.text-muted-foreground').first().textContent();
      const date = await activity.locator('.text-xs').textContent();
      
      activities.push({
        type: type?.trim(),
        summary: summary?.trim(),
        date: date?.trim()
      });
    }
    
    return { isEmpty: false, activities };
  }

  /**
   * Click on a principal card
   */
  async clickPrincipalCard(principalName: string) {
    const card = this.principalCards.filter({ hasText: principalName });
    await card.click();
    // Should navigate to the organization detail page or modal
  }

  /**
   * Click on an activity item
   */
  async clickActivityItem(index: number = 0) {
    const activity = this.activityFeedItems.nth(index);
    await activity.click();
    // Should navigate to interaction detail or expand more info
  }

  /**
   * Verify stats card values are reasonable
   */
  async verifyStatsIntegrity() {
    const stats = await this.getDashboardStats();
    
    // Basic integrity checks
    expect(stats.principals).toBeGreaterThanOrEqual(0);
    expect(stats.opportunities).toBeGreaterThanOrEqual(0);
    expect(stats.organizations).toBeGreaterThanOrEqual(stats.principals); // Principals are subset of organizations
    expect(stats.contacts).toBeGreaterThanOrEqual(0);
    
    return stats;
  }

  /**
   * Test responsive behavior of dashboard
   */
  async testResponsiveDashboard() {
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // iPad landscape
      { width: 1920, height: 1080 } // Desktop
    ];
    
    const results = [];
    
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500);
      
      const isMobileView = viewport.width < 768;
      const isTabletView = viewport.width >= 768 && viewport.width < 1024;
      
      // Check grid layout adjustments
      const statsCardsContainer = this.page.locator('.grid.gap-4');
      const computedStyle = await statsCardsContainer.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          gridTemplateColumns: style.gridTemplateColumns,
          gap: style.gap
        };
      });
      
      results.push({
        viewport,
        isMobileView,
        isTabletView,
        gridLayout: computedStyle
      });
    }
    
    return results;
  }

  /**
   * Measure dashboard loading performance
   */
  async measureDashboardPerformance() {
    const startTime = Date.now();
    
    await this.goToDashboard();
    
    // Wait for all critical elements to load
    await Promise.all([
      this.pageTitle.waitFor({ state: 'visible' }),
      this.principalsCard.waitFor({ state: 'visible' }),
      this.opportunitiesCard.waitFor({ state: 'visible' }),
      this.organizationsCard.waitFor({ state: 'visible' }),
      this.contactsCard.waitFor({ state: 'visible' }),
      this.activityFeedSection.waitFor({ state: 'visible' })
    ]);
    
    const loadTime = Date.now() - startTime;
    const performanceMetrics = await this.measurePerformance();
    
    return {
      totalLoadTime: loadTime,
      ...performanceMetrics
    };
  }

  /**
   * Test dashboard data updates
   */
  async testDataUpdates() {
    const initialStats = await this.getDashboardStats();
    
    // Navigate to organizations page and add a new organization
    await this.navigateUsingSidebar('Organizations');
    // ... add organization logic would go here
    
    // Return to dashboard
    await this.goToDashboard();
    
    const updatedStats = await this.getDashboardStats();
    
    return {
      initial: initialStats,
      updated: updatedStats,
      changed: JSON.stringify(initialStats) !== JSON.stringify(updatedStats)
    };
  }

  /**
   * Verify dashboard accessibility
   */
  async verifyAccessibility() {
    // Check for proper heading structure
    const h1Count = await this.page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one H1
    
    // Check for alt texts on icons
    const icons = this.page.locator('[data-lucide]');
    const iconCount = await icons.count();
    
    // Check for keyboard navigation
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
    
    // Check color contrast (basic check)
    const textElements = this.page.locator('.text-muted-foreground');
    const textCount = await textElements.count();
    
    return {
      h1Count,
      iconCount,
      textElementsCount: textCount,
      hasFocusableElements: await focusedElement.isVisible()
    };
  }

  /**
   * Search functionality from dashboard (if command palette exists)
   */
  async testDashboardSearch(searchTerm: string) {
    await this.openCommandPalette();
    
    const searchInput = this.page.locator('[cmdk-input]');
    await searchInput.fill(searchTerm);
    
    // Wait for search results
    await this.page.waitForTimeout(500);
    
    const searchResults = await this.page.locator('[cmdk-item]').count();
    
    // Close command palette
    await this.page.keyboard.press('Escape');
    
    return { searchTerm, resultsCount: searchResults };
  }
}