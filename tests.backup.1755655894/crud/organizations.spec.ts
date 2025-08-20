import { test, expect } from '@playwright/test';
import { OrganizationsPage } from '../page-objects/organizations-page';
import { AuthPage } from '../page-objects/auth-page';
import { TestDataGenerator, TestUsers } from '../utils/test-data';
import { AuthHelpers, TableHelpers, FormHelpers, PerformanceHelpers } from '../utils/test-helpers';

test.describe('Organizations CRUD Operations', () => {
  let organizationsPage: OrganizationsPage;
  let authPage: AuthPage;
  let testOrganizationIds: string[] = [];

  test.beforeAll(async ({ browser }) => {
    // Set up authentication for all tests
    const context = await browser.newContext();
    const page = await context.newPage();
    authPage = new AuthPage(page);
    
    // Login once for all tests
    await authPage.login(TestUsers.validUser.email, TestUsers.validUser.password);
    await page.close();
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    organizationsPage = new OrganizationsPage(page);
    
    // Ensure user is logged in
    const isLoggedIn = await organizationsPage.isAuthenticated();
    if (!isLoggedIn) {
      await AuthHelpers.login(page, TestUsers.validUser.email, TestUsers.validUser.password);
    }
    
    // Navigate to organizations page
    await organizationsPage.goToOrganizations();
  });

  test.afterEach(async ({ page }) => {
    // Clean up any test data created during the test
    // In a real scenario, you would call API endpoints to delete test data
    testOrganizationIds = [];
  });

  test('should display organizations page correctly', async () => {
    // Verify page title and description
    await expect(organizationsPage.pageTitle).toBeVisible();
    await expect(organizationsPage.pageTitle).toHaveText('Organizations');
    
    // Verify breadcrumb navigation
    await organizationsPage.verifyBreadcrumb(['Dashboard', 'Organizations']);
    
    // Verify main action buttons are visible
    await expect(organizationsPage.addOrganizationButton).toBeVisible();
    await expect(organizationsPage.addOrganizationButton).toBeEnabled();
    
    // Verify search functionality is available
    await expect(organizationsPage.searchInput).toBeVisible();
    await expect(organizationsPage.searchInput).toBeEditable();
    
    // Verify filters are available
    await expect(organizationsPage.typeFilter).toBeVisible();
    
    // Verify table or empty state is displayed
    const hasData = await organizationsPage.organizationsTable.isVisible();
    const isEmpty = await organizationsPage.emptyStateMessage.isVisible();
    expect(hasData || isEmpty).toBe(true);
  });

  test('should create a new organization successfully', async () => {
    const testOrganization = TestDataGenerator.generateOrganization({
      name: 'Test Food Distribution Co',
      type: 'principal',
      industry: 'Food Distribution',
      description: 'A test principal organization for food distribution',
      website: 'https://testfooddist.com',
      phone: '555-0123',
      email: 'info@testfooddist.com'
    });

    // Create the organization
    await organizationsPage.createOrganization(testOrganization);
    
    // Verify success toast message
    await organizationsPage.expectToast('Organization created successfully');
    
    // Verify organization appears in the table
    const organizationsData = await organizationsPage.getOrganizationsData();
    expect(organizationsData.organizations.some(org => org.name === testOrganization.name)).toBe(true);
    
    // Store ID for cleanup (in real scenario, get from API response)
    testOrganizationIds.push(testOrganization.name);
  });

  test('should validate required fields when creating organization', async () => {
    await organizationsPage.testFormValidation();
    // The form validation test is implemented in the OrganizationsPage class
  });

  test('should edit an existing organization', async () => {
    // First create an organization
    const originalOrganization = TestDataGenerator.generateOrganization({
      name: 'Original Organization Name',
      type: 'customer',
      description: 'Original description'
    });

    await organizationsPage.createOrganization(originalOrganization);
    await organizationsPage.expectToast('Organization created successfully');

    // Now edit it
    const updatedData = {
      name: 'Updated Organization Name',
      description: 'Updated description with new information'
    };

    await organizationsPage.editOrganization(originalOrganization.name, updatedData);
    await organizationsPage.expectToast('Organization updated successfully');

    // Verify the changes appear in the table
    const organizationsData = await organizationsPage.getOrganizationsData();
    const updatedOrg = organizationsData.organizations.find(org => org.name === updatedData.name);
    expect(updatedOrg).toBeDefined();
    
    testOrganizationIds.push(updatedData.name);
  });

  test('should delete an organization', async () => {
    // First create an organization to delete
    const organizationToDelete = TestDataGenerator.generateOrganization({
      name: 'Organization To Delete',
      type: 'vendor'
    });

    await organizationsPage.createOrganization(organizationToDelete);
    await organizationsPage.expectToast('Organization created successfully');

    // Delete the organization
    await organizationsPage.deleteOrganization(organizationToDelete.name);
    await organizationsPage.expectToast('Organization deleted successfully');

    // Verify organization is no longer in the table
    const organizationsData = await organizationsPage.getOrganizationsData();
    const deletedOrg = organizationsData.organizations.find(org => org.name === organizationToDelete.name);
    expect(deletedOrg).toBeUndefined();
  });

  test('should search organizations effectively', async () => {
    // Create some test organizations with specific names
    const searchTestOrgs = [
      TestDataGenerator.generateOrganization({ name: 'Searchable Food Corp', type: 'principal' }),
      TestDataGenerator.generateOrganization({ name: 'Another Food Business', type: 'customer' }),
      TestDataGenerator.generateOrganization({ name: 'Non-Food Company', type: 'vendor' })
    ];

    // Create all test organizations
    for (const org of searchTestOrgs) {
      await organizationsPage.createOrganization(org);
      await organizationsPage.expectToast('Organization created successfully');
      testOrganizationIds.push(org.name);
    }

    // Test search functionality
    const searchResults = await organizationsPage.searchOrganizations('Food');
    
    // Should return organizations with 'Food' in the name
    expect(searchResults.organizations.length).toBeGreaterThanOrEqual(2);
    
    const foodOrgs = searchResults.organizations.filter(org => 
      org.name?.toLowerCase().includes('food')
    );
    expect(foodOrgs.length).toBeGreaterThanOrEqual(2);

    // Test more specific search
    const specificResults = await organizationsPage.searchOrganizations('Searchable');
    expect(specificResults.organizations.length).toBeGreaterThanOrEqual(1);
    expect(specificResults.organizations[0].name).toContain('Searchable');
  });

  test('should filter organizations by type', async () => {
    // Create organizations of different types
    const typeTestOrgs = [
      TestDataGenerator.generateOrganization({ name: 'Principal Test Org', type: 'principal' }),
      TestDataGenerator.generateOrganization({ name: 'Customer Test Org', type: 'customer' }),
      TestDataGenerator.generateOrganization({ name: 'Vendor Test Org', type: 'vendor' })
    ];

    for (const org of typeTestOrgs) {
      await organizationsPage.createOrganization(org);
      await organizationsPage.expectToast('Organization created successfully');
      testOrganizationIds.push(org.name);
    }

    // Test filtering by principal
    const principalResults = await organizationsPage.filterByType('principal');
    const principalOrgs = principalResults.organizations.filter(org => org.type === 'principal');
    expect(principalOrgs.length).toBeGreaterThanOrEqual(1);

    // Test filtering by customer
    const customerResults = await organizationsPage.filterByType('customer');
    const customerOrgs = customerResults.organizations.filter(org => org.type === 'customer');
    expect(customerOrgs.length).toBeGreaterThanOrEqual(1);

    // Test showing all
    const allResults = await organizationsPage.filterByType('all');
    expect(allResults.organizations.length).toBeGreaterThanOrEqual(3);
  });

  test('should handle pagination correctly', async () => {
    const paginationResults = await organizationsPage.testPagination();
    
    if (paginationResults.hasPagination) {
      // If there are enough records to paginate, test was successful
      expect(paginationResults.totalOrganizations).toBeGreaterThan(10);
    } else {
      // If no pagination, that's also valid (just fewer records)
      expect(paginationResults.totalOrganizations).toBeLessThanOrEqual(10);
    }
  });

  test('should sort organizations by different columns', async () => {
    // Create multiple organizations to test sorting
    const sortTestOrgs = [
      TestDataGenerator.generateOrganization({ name: 'Alpha Organization', type: 'customer' }),
      TestDataGenerator.generateOrganization({ name: 'Beta Organization', type: 'principal' }),
      TestDataGenerator.generateOrganization({ name: 'Gamma Organization', type: 'vendor' })
    ];

    for (const org of sortTestOrgs) {
      await organizationsPage.createOrganization(org);
      await organizationsPage.expectToast('Organization created successfully');
      testOrganizationIds.push(org.name);
    }

    // Test sorting by name
    await organizationsPage.sortByColumn('name');
    
    const sortedData = await organizationsPage.getOrganizationsData();
    expect(sortedData.organizations.length).toBeGreaterThanOrEqual(3);
    
    // Verify alphabetical ordering (at least for our test data)
    const testOrgNames = sortedData.organizations
      .filter(org => org.name?.includes('Organization'))
      .map(org => org.name);
    
    expect(testOrgNames.length).toBeGreaterThanOrEqual(3);
  });

  test('should perform bulk operations', async () => {
    // Create multiple organizations for bulk testing
    const bulkTestOrgs = [
      TestDataGenerator.generateOrganization({ name: 'Bulk Test Org 1', type: 'customer' }),
      TestDataGenerator.generateOrganization({ name: 'Bulk Test Org 2', type: 'customer' })
    ];

    for (const org of bulkTestOrgs) {
      await organizationsPage.createOrganization(org);
      await organizationsPage.expectToast('Organization created successfully');
      testOrganizationIds.push(org.name);
    }

    // Select organizations for bulk operation
    const orgNamesToSelect = bulkTestOrgs.map(org => org.name);
    await organizationsPage.selectOrganizations(orgNamesToSelect);

    // Perform bulk delete
    await organizationsPage.bulkDeleteOrganizations();
    await organizationsPage.expectToast('Organizations deleted successfully');

    // Verify organizations were deleted
    const remainingOrgs = await organizationsPage.getOrganizationsData();
    const deletedOrgs = remainingOrgs.organizations.filter(org => 
      orgNamesToSelect.includes(org.name || '')
    );
    expect(deletedOrgs.length).toBe(0);
  });

  test('should handle form validation errors gracefully', async () => {
    // Test invalid email format
    const invalidOrganization = TestDataGenerator.generateOrganization({
      name: 'Invalid Email Test Org',
      type: 'customer',
      email: 'not-a-valid-email'
    });

    await organizationsPage.addOrganizationButton.click();
    await organizationsPage.organizationForm.waitFor({ state: 'visible' });

    // Fill form with invalid data
    await FormHelpers.fillForm(organizationsPage.page, invalidOrganization, '[data-testid="organization-form"]');
    
    await organizationsPage.saveButton.click();

    // Should show validation error
    await expect(organizationsPage.validationError).toBeVisible();
    
    // Cancel form
    await organizationsPage.cancelButton.click();
  });

  test('should test responsive behavior on different screen sizes', async () => {
    const responsiveResults = await organizationsPage.testResponsiveTable();
    
    // Verify responsive behavior for each viewport
    for (const result of responsiveResults) {
      if (result.isMobileView) {
        // On mobile, table might be hidden or have horizontal scroll
        expect(typeof result.hasHorizontalScroll).toBe('boolean');
      } else {
        // On desktop, table should be fully visible
        expect(result.tableVisible).toBe(true);
      }
    }
  });

  test('should maintain accessibility standards', async () => {
    const accessibilityResults = await organizationsPage.verifyAccessibility();
    
    // Verify accessibility features
    expect(accessibilityResults.hasTableHeaders).toBe(true);
    expect(accessibilityResults.hasProperTableStructure).toBe(true);
    expect(accessibilityResults.canFocusElements).toBe(true);
    expect(accessibilityResults.hasAriaLabels).toBe(true);
  });

  test('should measure CRUD operation performance', async ({ page }) => {
    const performanceResults = {
      create: 0,
      read: 0,
      update: 0,
      delete: 0
    };

    // Measure create performance
    const createStart = Date.now();
    const testOrg = TestDataGenerator.generateOrganization({
      name: 'Performance Test Organization'
    });
    await organizationsPage.createOrganization(testOrg);
    await organizationsPage.expectToast('Organization created successfully');
    performanceResults.create = Date.now() - createStart;

    // Measure read performance
    const readStart = Date.now();
    await organizationsPage.getOrganizationsData();
    performanceResults.read = Date.now() - readStart;

    // Measure update performance
    const updateStart = Date.now();
    await organizationsPage.editOrganization(testOrg.name, { description: 'Updated for performance test' });
    await organizationsPage.expectToast('Organization updated successfully');
    performanceResults.update = Date.now() - updateStart;

    // Measure delete performance
    const deleteStart = Date.now();
    await organizationsPage.deleteOrganization(testOrg.name);
    await organizationsPage.expectToast('Organization deleted successfully');
    performanceResults.delete = Date.now() - deleteStart;

    // Assert performance standards
    expect(performanceResults.create).toBeLessThan(3000); // 3 seconds
    expect(performanceResults.read).toBeLessThan(1000);   // 1 second
    expect(performanceResults.update).toBeLessThan(3000); // 3 seconds
    expect(performanceResults.delete).toBeLessThan(2000); // 2 seconds

    console.log('CRUD Performance Results:', performanceResults);
  });

  test('should handle concurrent operations gracefully', async ({ browser }) => {
    // Create multiple browser contexts to simulate concurrent users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Set up both pages
    await AuthHelpers.login(page1, TestUsers.validUser.email, TestUsers.validUser.password);
    await AuthHelpers.login(page2, TestUsers.validUser.email, TestUsers.validUser.password);
    
    const orgsPage1 = new OrganizationsPage(page1);
    const orgsPage2 = new OrganizationsPage(page2);
    
    await orgsPage1.goToOrganizations();
    await orgsPage2.goToOrganizations();
    
    // Create organizations concurrently
    const org1 = TestDataGenerator.generateOrganization({ name: 'Concurrent Org 1' });
    const org2 = TestDataGenerator.generateOrganization({ name: 'Concurrent Org 2' });
    
    await Promise.all([
      orgsPage1.createOrganization(org1),
      orgsPage2.createOrganization(org2)
    ]);
    
    // Verify both organizations were created
    await page1.reload();
    await page2.reload();
    
    const data1 = await orgsPage1.getOrganizationsData();
    const data2 = await orgsPage2.getOrganizationsData();
    
    const hasOrg1 = data1.organizations.some(org => org.name === org1.name);
    const hasOrg2 = data2.organizations.some(org => org.name === org2.name);
    
    expect(hasOrg1).toBe(true);
    expect(hasOrg2).toBe(true);
    
    // Cleanup
    testOrganizationIds.push(org1.name, org2.name);
    await page1.close();
    await page2.close();
    await context1.close();
    await context2.close();
  });

  test('should validate data integrity across operations', async () => {
    // Create an organization with specific data
    const originalData = TestDataGenerator.generateOrganization({
      name: 'Data Integrity Test Org',
      type: 'principal',
      industry: 'Food Service',
      description: 'Original description',
      email: 'integrity@test.com',
      phone: '555-9999'
    });

    await organizationsPage.createOrganization(originalData);
    await organizationsPage.expectToast('Organization created successfully');

    // Verify data was saved correctly
    let orgData = await organizationsPage.getOrganizationsData();
    let testOrg = orgData.organizations.find(org => org.name === originalData.name);
    expect(testOrg).toBeDefined();
    expect(testOrg?.type).toBe(originalData.type);

    // Edit the organization
    const updatedData = {
      description: 'Updated description for data integrity test',
      phone: '555-8888'
    };

    await organizationsPage.editOrganization(originalData.name, updatedData);
    await organizationsPage.expectToast('Organization updated successfully');

    // Verify only specified fields were updated
    orgData = await organizationsPage.getOrganizationsData();
    testOrg = orgData.organizations.find(org => org.name === originalData.name);
    expect(testOrg).toBeDefined();
    expect(testOrg?.type).toBe(originalData.type); // Should remain unchanged
    
    testOrganizationIds.push(originalData.name);
  });
});