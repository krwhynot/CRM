import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page Object Model for Organizations page
 * Handles organization CRUD operations, search, filtering, and table interactions
 */
export class OrganizationsPage extends BasePage {
  // Page header elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly breadcrumb: Locator;
  
  // Action buttons
  readonly addOrganizationButton: Locator;
  readonly importButton: Locator;
  readonly exportButton: Locator;
  readonly bulkActionsButton: Locator;
  
  // Search and filters
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly clearSearchButton: Locator;
  readonly typeFilter: Locator;
  readonly industryFilter: Locator;
  readonly statusFilter: Locator;
  
  // Data table elements
  readonly organizationsTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly tableRowCheckbox: Locator;
  readonly selectAllCheckbox: Locator;
  readonly emptyStateMessage: Locator;
  
  // Table columns
  readonly nameColumn: Locator;
  readonly typeColumn: Locator;
  readonly industryColumn: Locator;
  readonly contactsColumn: Locator;
  readonly actionsColumn: Locator;
  
  // Row actions
  readonly viewButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly moreActionsButton: Locator;
  
  // Pagination
  readonly paginationContainer: Locator;
  readonly paginationInfo: Locator;
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly pageNumbers: Locator;
  readonly itemsPerPageSelect: Locator;
  
  // Organization form modal/page elements
  readonly organizationModal: Locator;
  readonly organizationForm: Locator;
  readonly nameInput: Locator;
  readonly typeSelect: Locator;
  readonly industrySelect: Locator;
  readonly descriptionTextarea: Locator;
  readonly websiteInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipInput: Locator;
  readonly countrySelect: Locator;
  readonly managerNameInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeModalButton: Locator;
  
  // Validation messages
  readonly validationError: Locator;
  readonly formError: Locator;
  
  // Delete confirmation
  readonly deleteConfirmationModal: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Page header
    this.pageTitle = page.locator('h1').filter({ hasText: 'Organizations' });
    this.pageDescription = page.locator('text=Manage your business relationships');
    this.breadcrumb = page.locator('[data-testid="breadcrumb"]');
    
    // Action buttons
    this.addOrganizationButton = page.locator('[data-testid="add-organization-button"]');
    this.importButton = page.locator('[data-testid="import-button"]');
    this.exportButton = page.locator('[data-testid="export-button"]');
    this.bulkActionsButton = page.locator('[data-testid="bulk-actions-button"]');
    
    // Search and filters
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-button"]');
    this.clearSearchButton = page.locator('[data-testid="clear-search-button"]');
    this.typeFilter = page.locator('[data-testid="type-filter"]');
    this.industryFilter = page.locator('[data-testid="industry-filter"]');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
    
    // Data table
    this.organizationsTable = page.locator('[data-testid="organizations-table"]');
    this.tableHeaders = this.organizationsTable.locator('thead th');
    this.tableRows = this.organizationsTable.locator('tbody tr');
    this.tableRowCheckbox = page.locator('[data-testid="row-checkbox"]');
    this.selectAllCheckbox = page.locator('[data-testid="select-all-checkbox"]');
    this.emptyStateMessage = page.locator('[data-testid="empty-state"]');
    
    // Table columns
    this.nameColumn = page.locator('[data-testid="name-column"]');
    this.typeColumn = page.locator('[data-testid="type-column"]');
    this.industryColumn = page.locator('[data-testid="industry-column"]');
    this.contactsColumn = page.locator('[data-testid="contacts-column"]');
    this.actionsColumn = page.locator('[data-testid="actions-column"]');
    
    // Row actions
    this.viewButton = page.locator('[data-testid="view-button"]');
    this.editButton = page.locator('[data-testid="edit-button"]');
    this.deleteButton = page.locator('[data-testid="delete-button"]');
    this.moreActionsButton = page.locator('[data-testid="more-actions-button"]');
    
    // Pagination
    this.paginationContainer = page.locator('[data-testid="pagination"]');
    this.paginationInfo = page.locator('[data-testid="pagination-info"]');
    this.prevPageButton = page.locator('[data-testid="prev-page-button"]');
    this.nextPageButton = page.locator('[data-testid="next-page-button"]');
    this.pageNumbers = page.locator('[data-testid="page-number"]');
    this.itemsPerPageSelect = page.locator('[data-testid="items-per-page-select"]');
    
    // Organization form
    this.organizationModal = page.locator('[data-testid="organization-modal"]');
    this.organizationForm = page.locator('[data-testid="organization-form"]');
    this.nameInput = page.locator('[data-testid="name-input"]');
    this.typeSelect = page.locator('[data-testid="type-select"]');
    this.industrySelect = page.locator('[data-testid="industry-select"]');
    this.descriptionTextarea = page.locator('[data-testid="description-textarea"]');
    this.websiteInput = page.locator('[data-testid="website-input"]');
    this.phoneInput = page.locator('[data-testid="phone-input"]');
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.addressInput = page.locator('[data-testid="address-input"]');
    this.cityInput = page.locator('[data-testid="city-input"]');
    this.stateInput = page.locator('[data-testid="state-input"]');
    this.zipInput = page.locator('[data-testid="zip-input"]');
    this.countrySelect = page.locator('[data-testid="country-select"]');
    this.managerNameInput = page.locator('[data-testid="manager-name-input"]');
    this.saveButton = page.locator('[data-testid="save-button"]');
    this.cancelButton = page.locator('[data-testid="cancel-button"]');
    this.closeModalButton = page.locator('[data-testid="close-modal-button"]');
    
    // Validation
    this.validationError = page.locator('[data-testid="validation-error"]');
    this.formError = page.locator('[data-testid="form-error"]');
    
    // Delete confirmation
    this.deleteConfirmationModal = page.locator('[data-testid="delete-confirmation-modal"]');
    this.confirmDeleteButton = page.locator('[data-testid="confirm-delete-button"]');
    this.cancelDeleteButton = page.locator('[data-testid="cancel-delete-button"]');
  }

  /**
   * Navigate to organizations page
   */
  async goToOrganizations() {
    await this.goto('/organizations');
    await this.waitForOrganizationsLoad();
  }

  /**
   * Wait for organizations page to fully load
   */
  async waitForOrganizationsLoad() {
    await this.waitForPageLoad();
    await this.pageTitle.waitFor({ state: 'visible' });
    
    // Wait for either table or empty state
    await Promise.race([
      this.organizationsTable.waitFor({ state: 'visible' }),
      this.emptyStateMessage.waitFor({ state: 'visible' })
    ]);
  }

  /**
   * Create a new organization
   */
  async createOrganization(organizationData: {
    name: string;
    type: 'principal' | 'customer' | 'vendor';
    industry?: string;
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    managerName?: string;
  }) {
    await this.addOrganizationButton.click();
    await this.organizationForm.waitFor({ state: 'visible' });
    
    // Fill required fields
    await this.nameInput.fill(organizationData.name);
    await this.selectDropdownOption('[data-testid="type-select"]', organizationData.type);
    
    // Fill optional fields
    if (organizationData.industry) {
      await this.selectDropdownOption('[data-testid="industry-select"]', organizationData.industry);
    }
    
    if (organizationData.description) {
      await this.descriptionTextarea.fill(organizationData.description);
    }
    
    if (organizationData.website) {
      await this.websiteInput.fill(organizationData.website);
    }
    
    if (organizationData.phone) {
      await this.phoneInput.fill(organizationData.phone);
    }
    
    if (organizationData.email) {
      await this.emailInput.fill(organizationData.email);
    }
    
    if (organizationData.address) {
      await this.addressInput.fill(organizationData.address);
    }
    
    if (organizationData.city) {
      await this.cityInput.fill(organizationData.city);
    }
    
    if (organizationData.state) {
      await this.stateInput.fill(organizationData.state);
    }
    
    if (organizationData.zip) {
      await this.zipInput.fill(organizationData.zip);
    }
    
    if (organizationData.country) {
      await this.selectDropdownOption('[data-testid="country-select"]', organizationData.country);
    }
    
    if (organizationData.managerName) {
      await this.managerNameInput.fill(organizationData.managerName);
    }
    
    // Save the organization
    await this.saveButton.click();
    
    // Wait for success or validation errors
    await Promise.race([
      this.expectToast('Organization created successfully'),
      this.validationError.waitFor({ state: 'visible' }),
      this.formError.waitFor({ state: 'visible' })
    ]);
  }

  /**
   * Edit an existing organization
   */
  async editOrganization(organizationName: string, updatedData: any) {
    const row = await this.findOrganizationRow(organizationName);
    const editButton = row.locator('[data-testid="edit-button"]');
    await editButton.click();
    
    await this.organizationForm.waitFor({ state: 'visible' });
    
    // Update fields as needed
    if (updatedData.name) {
      await this.nameInput.clear();
      await this.nameInput.fill(updatedData.name);
    }
    
    if (updatedData.description) {
      await this.descriptionTextarea.clear();
      await this.descriptionTextarea.fill(updatedData.description);
    }
    
    // Add more field updates as needed
    
    await this.saveButton.click();
    
    await Promise.race([
      this.expectToast('Organization updated successfully'),
      this.validationError.waitFor({ state: 'visible' })
    ]);
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(organizationName: string) {
    const row = await this.findOrganizationRow(organizationName);
    const deleteButton = row.locator('[data-testid="delete-button"]');
    await deleteButton.click();
    
    // Confirm deletion
    await this.deleteConfirmationModal.waitFor({ state: 'visible' });
    await this.confirmDeleteButton.click();
    
    await this.expectToast('Organization deleted successfully');
  }

  /**
   * Search for organizations
   */
  async searchOrganizations(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
    
    // Wait for search results to load
    await this.waitForPageLoad();
    
    return await this.getOrganizationsData();
  }

  /**
   * Filter organizations by type
   */
  async filterByType(type: 'all' | 'principal' | 'customer' | 'vendor') {
    await this.selectDropdownOption('[data-testid="type-filter"]', type);
    await this.waitForPageLoad();
    
    return await this.getOrganizationsData();
  }

  /**
   * Filter organizations by industry
   */
  async filterByIndustry(industry: string) {
    await this.selectDropdownOption('[data-testid="industry-filter"]', industry);
    await this.waitForPageLoad();
    
    return await this.getOrganizationsData();
  }

  /**
   * Get organizations data from the table
   */
  async getOrganizationsData() {
    const hasData = await this.organizationsTable.isVisible();
    
    if (!hasData || await this.emptyStateMessage.isVisible()) {
      return { isEmpty: true, organizations: [], totalCount: 0 };
    }
    
    const organizations = [];
    const rowCount = await this.tableRows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = this.tableRows.nth(i);
      const name = await row.locator('[data-testid="name-cell"]').textContent();
      const type = await row.locator('[data-testid="type-cell"]').textContent();
      const industry = await row.locator('[data-testid="industry-cell"]').textContent();
      const contactsCount = await row.locator('[data-testid="contacts-cell"]').textContent();
      
      organizations.push({
        name: name?.trim(),
        type: type?.trim(),
        industry: industry?.trim(),
        contactsCount: parseInt(contactsCount?.trim() || '0', 10)
      });
    }
    
    return { isEmpty: false, organizations, totalCount: rowCount };
  }

  /**
   * Find organization row by name
   */
  async findOrganizationRow(organizationName: string): Promise<Locator> {
    const row = this.tableRows.filter({ hasText: organizationName });
    await row.waitFor({ state: 'visible' });
    return row;
  }

  /**
   * Sort table by column
   */
  async sortByColumn(columnName: 'name' | 'type' | 'industry' | 'contacts') {
    const sortButton = this.page.locator(`[data-testid="sort-${columnName}"]`);
    await sortButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to specific page
   */
  async goToPage(pageNumber: number) {
    const pageButton = this.pageNumbers.filter({ hasText: pageNumber.toString() });
    await pageButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Change items per page
   */
  async changeItemsPerPage(itemsPerPage: number) {
    await this.selectDropdownOption('[data-testid="items-per-page-select"]', itemsPerPage.toString());
    await this.waitForPageLoad();
  }

  /**
   * Select multiple organizations for bulk actions
   */
  async selectOrganizations(organizationNames: string[]) {
    for (const name of organizationNames) {
      const row = await this.findOrganizationRow(name);
      const checkbox = row.locator('[data-testid="row-checkbox"]');
      await checkbox.check();
    }
  }

  /**
   * Perform bulk delete
   */
  async bulkDeleteOrganizations() {
    await this.bulkActionsButton.click();
    
    const deleteOption = this.page.locator('[data-testid="bulk-delete-option"]');
    await deleteOption.click();
    
    await this.deleteConfirmationModal.waitFor({ state: 'visible' });
    await this.confirmDeleteButton.click();
    
    await this.expectToast('Organizations deleted successfully');
  }

  /**
   * Test form validation
   */
  async testFormValidation() {
    await this.addOrganizationButton.click();
    await this.organizationForm.waitFor({ state: 'visible' });
    
    // Try to save without required fields
    await this.saveButton.click();
    
    // Should show validation errors
    await this.validationError.waitFor({ state: 'visible' });
    
    // Test invalid email format
    await this.nameInput.fill('Test Organization');
    await this.selectDropdownOption('[data-testid="type-select"]', 'customer');
    await this.emailInput.fill('invalid-email');
    
    await this.saveButton.click();
    
    // Should show email validation error
    const emailError = this.page.locator('[data-testid="email-error"]');
    await expect(emailError).toBeVisible();
    
    // Test invalid website URL
    await this.websiteInput.fill('not-a-url');
    await this.saveButton.click();
    
    const websiteError = this.page.locator('[data-testid="website-error"]');
    await expect(websiteError).toBeVisible();
    
    // Cancel form
    await this.cancelButton.click();
  }

  /**
   * Test pagination functionality
   */
  async testPagination() {
    const totalOrganizations = await this.getTotalOrganizationsCount();
    
    if (totalOrganizations > 10) {
      // Test next page
      await this.nextPageButton.click();
      await this.waitForPageLoad();
      
      // Verify URL or page indicator changed
      const currentPage = await this.getCurrentPageNumber();
      expect(currentPage).toBe(2);
      
      // Test previous page
      await this.prevPageButton.click();
      await this.waitForPageLoad();
      
      const backToFirstPage = await this.getCurrentPageNumber();
      expect(backToFirstPage).toBe(1);
    }
    
    return { totalOrganizations, hasPagination: totalOrganizations > 10 };
  }

  /**
   * Get total organizations count from pagination info
   */
  private async getTotalOrganizationsCount(): Promise<number> {
    const paginationText = await this.paginationInfo.textContent();
    const match = paginationText?.match(/of (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get current page number
   */
  private async getCurrentPageNumber(): Promise<number> {
    const activePage = this.page.locator('[data-testid="page-number"][aria-current="page"]');
    const pageText = await activePage.textContent();
    return parseInt(pageText?.trim() || '1', 10);
  }

  /**
   * Test responsive table behavior
   */
  async testResponsiveTable() {
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
      
      // Check if table transforms to cards on mobile
      const tableVisible = await this.organizationsTable.isVisible();
      const hasHorizontalScroll = await this.page.evaluate(() => {
        const table = document.querySelector('[data-testid="organizations-table"]');
        return table ? table.scrollWidth > table.clientWidth : false;
      });
      
      results.push({
        viewport,
        isMobileView,
        tableVisible,
        hasHorizontalScroll
      });
    }
    
    return results;
  }

  /**
   * Verify organizations page accessibility
   */
  async verifyAccessibility() {
    // Check table structure
    const hasTableHeaders = await this.tableHeaders.count() > 0;
    const hasProperTableStructure = await this.organizationsTable.locator('thead').isVisible();
    
    // Check keyboard navigation
    await this.page.keyboard.press('Tab');
    const firstFocusable = await this.page.locator(':focus').first();
    
    // Check ARIA labels
    const hasAriaLabels = await this.page.locator('[aria-label]').count() > 0;
    
    return {
      hasTableHeaders,
      hasProperTableStructure,
      canFocusElements: await firstFocusable.isVisible(),
      hasAriaLabels
    };
  }
}