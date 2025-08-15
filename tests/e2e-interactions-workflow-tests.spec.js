/**
 * End-to-End Workflow Testing for Interactions Page
 * CRM Dashboard - KitchenPantry
 * 
 * This comprehensive test suite validates the complete interactions workflow including:
 * 1. Complete interaction creation workflow from start to finish
 * 2. Opportunity creation from interaction workflow
 * 3. Data consistency across related entities (organizations, contacts, opportunities)
 * 4. Founding interaction business logic end-to-end
 * 5. Form submissions and data persistence validation
 * 6. Complete user journey from navigation to data creation
 * 
 * Test Coverage:
 * - Navigation and page load validation
 * - Stats dashboard accuracy
 * - Search and filtering functionality
 * - CRUD operations with data integrity
 * - Founding interaction relationships
 * - Mobile workflow validation
 * - Business logic validation
 */

const { test, expect } = require('@playwright/test');

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  testCredentials: {
    email: 'testuser@example.com',
    password: 'TestPassword123'
  },
  timeouts: {
    navigation: 10000,
    element: 5000,
    api: 3000
  }
};

// Test Data for End-to-End Workflows
const E2E_TEST_DATA = {
  organizations: {
    new: {
      name: 'E2E Test Restaurant Group',
      type: 'restaurant',
      website: 'https://e2etest.com',
      phone: '555-0123',
      address: '123 Test Street, Test City, TC 12345'
    }
  },
  contacts: {
    new: {
      first_name: 'John',
      last_name: 'E2E-Tester',
      title: 'General Manager',
      email: 'john.e2e@testrestaurant.com',
      phone: '555-0124'
    }
  },
  opportunities: {
    new: {
      name: 'E2E Test Product Line Introduction',
      stage: 'qualification',
      probability: 75,
      estimated_value: 25000,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    }
  },
  interactions: {
    founding: {
      subject: 'Initial Contact - Product Introduction',
      type: 'meeting',
      interaction_date: new Date().toISOString().split('T')[0],
      duration_minutes: 45,
      description: 'Initial meeting to introduce our product line and assess restaurant needs',
      outcome: 'Positive reception, expressed interest in premium product line',
      follow_up_required: true,
      follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    },
    followup: {
      subject: 'Product Sample Review Follow-up',
      type: 'phone_call',
      interaction_date: new Date().toISOString().split('T')[0],
      duration_minutes: 20,
      description: 'Follow-up call to discuss product samples and pricing',
      outcome: 'Requested formal proposal and pricing for bulk orders'
    }
  }
};

// Helper Functions
async function authenticateUser(page) {
  await page.goto(`${TEST_CONFIG.baseUrl}/login`);
  
  await page.fill('input[type="email"]', TEST_CONFIG.testCredentials.email);
  await page.fill('input[type="password"]', TEST_CONFIG.testCredentials.password);
  
  await page.click('button[type="submit"]');
  await page.waitForURL(`${TEST_CONFIG.baseUrl}/dashboard`, { timeout: TEST_CONFIG.timeouts.navigation });
}

async function navigateToInteractions(page) {
  await page.goto(`${TEST_CONFIG.baseUrl}/interactions`);
  await expect(page.locator('h1')).toContainText('Interactions');
  await page.waitForLoadState('networkidle');
}

async function createTestOrganization(page) {
  await page.goto(`${TEST_CONFIG.baseUrl}/organizations`);
  await page.click('button:has-text("Add Organization")');
  
  await page.fill('input[name="name"]', E2E_TEST_DATA.organizations.new.name);
  await page.selectOption('select[name="type"]', E2E_TEST_DATA.organizations.new.type);
  await page.fill('input[name="website"]', E2E_TEST_DATA.organizations.new.website);
  await page.fill('input[name="phone"]', E2E_TEST_DATA.organizations.new.phone);
  await page.fill('textarea[name="address"]', E2E_TEST_DATA.organizations.new.address);
  
  await page.click('button[type="submit"]');
  await expect(page.locator('.toast')).toContainText('Organization created successfully');
  
  // Get the created organization ID from the URL or table
  await page.waitForLoadState('networkidle');
  const organizationRow = page.locator(`tr:has-text("${E2E_TEST_DATA.organizations.new.name}")`);
  await expect(organizationRow).toBeVisible();
  
  return E2E_TEST_DATA.organizations.new.name;
}

async function createTestContact(page, organizationName) {
  await page.goto(`${TEST_CONFIG.baseUrl}/contacts`);
  await page.click('button:has-text("Add Contact")');
  
  // Select the organization first
  await page.selectOption('select[name="organization_id"]', { label: organizationName });
  
  await page.fill('input[name="first_name"]', E2E_TEST_DATA.contacts.new.first_name);
  await page.fill('input[name="last_name"]', E2E_TEST_DATA.contacts.new.last_name);
  await page.fill('input[name="title"]', E2E_TEST_DATA.contacts.new.title);
  await page.fill('input[name="email"]', E2E_TEST_DATA.contacts.new.email);
  await page.fill('input[name="phone"]', E2E_TEST_DATA.contacts.new.phone);
  
  await page.click('button[type="submit"]');
  await expect(page.locator('.toast')).toContainText('Contact created successfully');
  
  return `${E2E_TEST_DATA.contacts.new.first_name} ${E2E_TEST_DATA.contacts.new.last_name}`;
}

// Test Suite 1: Complete Navigation and Page Load Validation
test.describe('Navigation and Page Load Validation', () => {
  test('should navigate to interactions page and display all components', async ({ page }) => {
    await authenticateUser(page);
    await navigateToInteractions(page);
    
    // Verify page header
    await expect(page.locator('h1')).toContainText('Interactions');
    await expect(page.locator('p')).toContainText('Track all customer touchpoints');
    
    // Verify Add Interaction button
    await expect(page.locator('button:has-text("Add Interaction")')).toBeVisible();
    
    // Verify stats cards are present
    await expect(page.locator('text=Total Interactions')).toBeVisible();
    await expect(page.locator('text=Follow-ups Needed')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    await expect(page.locator('text=By Type')).toBeVisible();
    
    // Verify search functionality
    await expect(page.locator('input[placeholder*="Search interactions"]')).toBeVisible();
    
    // Verify interactions table
    await expect(page.locator('table')).toBeVisible();
  });
  
  test('should display correct stats dashboard data', async ({ page }) => {
    await authenticateUser(page);
    await navigateToInteractions(page);
    
    // Wait for stats to load
    await page.waitForLoadState('networkidle');
    
    // Verify stats are numeric values
    const totalInteractions = await page.locator('text=Total Interactions').locator('..').locator('.text-2xl').textContent();
    expect(parseInt(totalInteractions)).toBeGreaterThanOrEqual(0);
    
    const followUpsNeeded = await page.locator('text=Follow-ups Needed').locator('..').locator('.text-2xl').textContent();
    expect(parseInt(followUpsNeeded)).toBeGreaterThanOrEqual(0);
    
    const recentActivity = await page.locator('text=Recent Activity').locator('..').locator('.text-2xl').textContent();
    expect(parseInt(recentActivity)).toBeGreaterThanOrEqual(0);
  });
});

// Test Suite 2: Search and Filtering Functionality
test.describe('Search and Filtering Functionality', () => {
  test('should filter interactions by search term', async ({ page }) => {
    await authenticateUser(page);
    await navigateToInteractions(page);
    
    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: TEST_CONFIG.timeouts.element });
    
    // Get initial row count
    const initialRows = await page.locator('table tbody tr').count();
    
    // Search for a specific term
    await page.fill('input[placeholder*="Search interactions"]', 'meeting');
    await page.waitForTimeout(500); // Allow for debounce
    
    // Verify results are filtered
    const filteredRows = await page.locator('table tbody tr').count();
    
    // Should either have fewer rows or show "No interactions found"
    if (filteredRows > 0) {
      expect(filteredRows).toBeLessThanOrEqual(initialRows);
      
      // Verify search results contain the search term
      const firstRowText = await page.locator('table tbody tr:first-child').textContent();
      expect(firstRowText.toLowerCase()).toContain('meeting');
    }
    
    // Clear search and verify all results return
    await page.fill('input[placeholder*="Search interactions"]', '');
    await page.waitForTimeout(500);
    
    const clearedRows = await page.locator('table tbody tr').count();
    expect(clearedRows).toBe(initialRows);
  });
});

// Test Suite 3: Complete Interaction Creation Workflow
test.describe('Complete Interaction Creation Workflow', () => {
  let organizationName, contactName;
  
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
    // Create test data
    organizationName = await createTestOrganization(page);
    contactName = await createTestContact(page, organizationName);
  });
  
  test('should create a new interaction with complete workflow', async ({ page }) => {
    await navigateToInteractions(page);
    
    // Open create interaction dialog
    await page.click('button:has-text("Add Interaction")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Create New Interaction')).toBeVisible();
    
    // Fill in interaction details
    await page.fill('input[name="subject"]', E2E_TEST_DATA.interactions.founding.subject);
    await page.selectOption('select[name="type"]', E2E_TEST_DATA.interactions.founding.type);
    await page.fill('input[name="interaction_date"]', E2E_TEST_DATA.interactions.founding.interaction_date);
    await page.fill('input[name="duration_minutes"]', E2E_TEST_DATA.interactions.founding.duration_minutes.toString());
    
    // Select organization
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    
    // Wait for contacts to load and select contact
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: contactName });
    
    // Fill description and outcome
    await page.fill('textarea[name="description"]', E2E_TEST_DATA.interactions.founding.description);
    await page.fill('textarea[name="outcome"]', E2E_TEST_DATA.interactions.founding.outcome);
    
    // Set follow-up
    await page.check('input[name="follow_up_required"]');
    await page.fill('input[name="follow_up_date"]', E2E_TEST_DATA.interactions.founding.follow_up_date);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Verify interaction appears in table
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`tr:has-text("${E2E_TEST_DATA.interactions.founding.subject}")`)).toBeVisible();
  });
  
  test('should edit an existing interaction', async ({ page }) => {
    // First create an interaction
    await navigateToInteractions(page);
    await page.click('button:has-text("Add Interaction")');
    
    await page.fill('input[name="subject"]', 'Test Interaction for Editing');
    await page.selectOption('select[name="type"]', 'email');
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    
    // Now edit the interaction
    const interactionRow = page.locator('tr:has-text("Test Interaction for Editing")');
    await interactionRow.locator('button:has-text("Edit")').click();
    
    await expect(page.locator('text=Edit Interaction')).toBeVisible();
    
    // Modify the subject
    await page.fill('input[name="subject"]', 'Updated Test Interaction');
    await page.fill('textarea[name="outcome"]', 'Updated outcome after editing');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Interaction updated successfully');
    
    // Verify changes
    await expect(page.locator('tr:has-text("Updated Test Interaction")')).toBeVisible();
  });
  
  test('should delete an interaction', async ({ page }) => {
    // First create an interaction
    await navigateToInteractions(page);
    await page.click('button:has-text("Add Interaction")');
    
    await page.fill('input[name="subject"]', 'Test Interaction for Deletion');
    await page.selectOption('select[name="type"]', 'email');
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    
    // Delete the interaction
    const interactionRow = page.locator('tr:has-text("Test Interaction for Deletion")');
    
    // Handle the confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    await interactionRow.locator('button:has-text("Delete")').click();
    
    await expect(page.locator('.toast')).toContainText('Interaction deleted successfully');
    
    // Verify interaction is removed
    await expect(page.locator('tr:has-text("Test Interaction for Deletion")')).not.toBeVisible();
  });
});

// Test Suite 4: Opportunity Creation from Interaction Workflow
test.describe('Opportunity Creation from Interaction Workflow', () => {
  let organizationName, contactName;
  
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
    organizationName = await createTestOrganization(page);
    contactName = await createTestContact(page, organizationName);
  });
  
  test('should create opportunity from interaction workflow', async ({ page }) => {
    // First create an interaction
    await navigateToInteractions(page);
    await page.click('button:has-text("Add Interaction")');
    
    await page.fill('input[name="subject"]', E2E_TEST_DATA.interactions.founding.subject);
    await page.selectOption('select[name="type"]', E2E_TEST_DATA.interactions.founding.type);
    await page.fill('input[name="interaction_date"]', E2E_TEST_DATA.interactions.founding.interaction_date);
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: contactName });
    
    await page.fill('textarea[name="description"]', E2E_TEST_DATA.interactions.founding.description);
    await page.fill('textarea[name="outcome"]', 'Positive response - ready to create opportunity');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    
    // Now create an opportunity from this interaction
    await page.goto(`${TEST_CONFIG.baseUrl}/opportunities`);
    await page.click('button:has-text("Add Opportunity")');
    
    await page.fill('input[name="name"]', E2E_TEST_DATA.opportunities.new.name);
    await page.selectOption('select[name="stage"]', E2E_TEST_DATA.opportunities.new.stage);
    await page.fill('input[name="probability"]', E2E_TEST_DATA.opportunities.new.probability.toString());
    await page.fill('input[name="estimated_value"]', E2E_TEST_DATA.opportunities.new.estimated_value.toString());
    await page.fill('input[name="expected_close_date"]', E2E_TEST_DATA.opportunities.new.expected_close_date);
    
    // Link to organization and contact
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: contactName });
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Opportunity created successfully');
    
    // Verify opportunity appears in table
    await expect(page.locator(`tr:has-text("${E2E_TEST_DATA.opportunities.new.name}")`)).toBeVisible();
    
    // Now create a follow-up interaction linked to this opportunity
    await navigateToInteractions(page);
    await page.click('button:has-text("Add Interaction")');
    
    await page.fill('input[name="subject"]', E2E_TEST_DATA.interactions.followup.subject);
    await page.selectOption('select[name="type"]', E2E_TEST_DATA.interactions.followup.type);
    await page.fill('input[name="interaction_date"]', E2E_TEST_DATA.interactions.followup.interaction_date);
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: contactName });
    
    // Link to the opportunity
    await page.selectOption('select[name="opportunity_id"]', { label: E2E_TEST_DATA.opportunities.new.name });
    
    await page.fill('textarea[name="description"]', E2E_TEST_DATA.interactions.followup.description);
    await page.fill('textarea[name="outcome"]', E2E_TEST_DATA.interactions.followup.outcome);
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    
    // Verify both interactions are linked to the same entities
    await expect(page.locator(`tr:has-text("${E2E_TEST_DATA.interactions.founding.subject}")`)).toBeVisible();
    await expect(page.locator(`tr:has-text("${E2E_TEST_DATA.interactions.followup.subject}")`)).toBeVisible();
  });
});

// Test Suite 5: Data Consistency Across Related Entities
test.describe('Data Consistency Validation', () => {
  let organizationName, contactName;
  
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
    organizationName = await createTestOrganization(page);
    contactName = await createTestContact(page, organizationName);
  });
  
  test('should maintain data consistency across related entities', async ({ page }) => {
    // Create interaction
    await navigateToInteractions(page);
    await page.click('button:has-text("Add Interaction")');
    
    await page.fill('input[name="subject"]', 'Data Consistency Test Interaction');
    await page.selectOption('select[name="type"]', 'meeting');
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: contactName });
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    
    // Verify data appears correctly in interactions table
    const interactionRow = page.locator('tr:has-text("Data Consistency Test Interaction")');
    await expect(interactionRow).toBeVisible();
    await expect(interactionRow).toContainText(organizationName);
    await expect(interactionRow).toContainText(contactName.split(' ')[0]); // First name
    
    // Check organization page shows the interaction
    await page.goto(`${TEST_CONFIG.baseUrl}/organizations`);
    const orgRow = page.locator(`tr:has-text("${organizationName}")`);
    await orgRow.locator('button:has-text("View")').click();
    
    // Should see the interaction in the organization detail view
    await expect(page.locator('text=Data Consistency Test Interaction')).toBeVisible();
    
    // Check contact page shows the interaction
    await page.goto(`${TEST_CONFIG.baseUrl}/contacts`);
    const contactRow = page.locator(`tr:has-text("${contactName}")`);
    await contactRow.locator('button:has-text("View")').click();
    
    // Should see the interaction in the contact detail view
    await expect(page.locator('text=Data Consistency Test Interaction')).toBeVisible();
  });
});

// Test Suite 6: Founding Interaction Business Logic
test.describe('Founding Interaction Business Logic', () => {
  let organizationName, contactName;
  
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
    organizationName = await createTestOrganization(page);
    contactName = await createTestContact(page, organizationName);
  });
  
  test('should handle founding interaction creation and relationship tracking', async ({ page }) => {
    // Create the first interaction (founding interaction)
    await navigateToInteractions(page);
    await page.click('button:has-text("Add Interaction")');
    
    await page.fill('input[name="subject"]', 'First Contact - Founding Interaction');
    await page.selectOption('select[name="type"]', 'meeting');
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: contactName });
    
    await page.fill('textarea[name="description"]', 'This is the founding interaction that started our relationship');
    await page.fill('textarea[name="outcome"]', 'Established initial contact and interest');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    
    // Create an opportunity from this founding interaction
    await page.goto(`${TEST_CONFIG.baseUrl}/opportunities`);
    await page.click('button:has-text("Add Opportunity")');
    
    await page.fill('input[name="name"]', 'Founding Interaction Opportunity');
    await page.selectOption('select[name="stage"]', 'qualification');
    await page.fill('input[name="probability"]', '50');
    await page.fill('input[name="estimated_value"]', '15000');
    await page.fill('input[name="expected_close_date"]', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: contactName });
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Opportunity created successfully');
    
    // Create subsequent interactions linked to this opportunity
    await navigateToInteractions(page);
    await page.click('button:has-text("Add Interaction")');
    
    await page.fill('input[name="subject"]', 'Follow-up to Founding Interaction');
    await page.selectOption('select[name="type"]', 'phone_call');
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: contactName });
    await page.selectOption('select[name="opportunity_id"]', { label: 'Founding Interaction Opportunity' });
    
    await page.fill('textarea[name="description"]', 'Follow-up call based on founding interaction');
    await page.fill('textarea[name="outcome"]', 'Progress made, moving to next stage');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    
    // Verify both interactions show the correct relationships
    await expect(page.locator('tr:has-text("First Contact - Founding Interaction")')).toBeVisible();
    await expect(page.locator('tr:has-text("Follow-up to Founding Interaction")')).toBeVisible();
    
    // Both should be linked to the same organization and contact
    const foundingRow = page.locator('tr:has-text("First Contact - Founding Interaction")');
    const followupRow = page.locator('tr:has-text("Follow-up to Founding Interaction")');
    
    await expect(foundingRow).toContainText(organizationName);
    await expect(followupRow).toContainText(organizationName);
    await expect(foundingRow).toContainText(contactName.split(' ')[0]);
    await expect(followupRow).toContainText(contactName.split(' ')[0]);
  });
});

// Test Suite 7: Mobile Workflow Validation
test.describe('Mobile Workflow Validation', () => {
  test.use({ 
    viewport: { width: 768, height: 1024 } // iPad size
  });
  
  let organizationName, contactName;
  
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
    organizationName = await createTestOrganization(page);
    contactName = await createTestContact(page, organizationName);
  });
  
  test('should complete full workflow on mobile/tablet device', async ({ page }) => {
    await navigateToInteractions(page);
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Test stats cards are responsive
    const statsCards = page.locator('[class*="grid"]:has(div:has-text("Total Interactions"))');
    await expect(statsCards).toBeVisible();
    
    // Test mobile interaction creation
    await page.click('button:has-text("Add Interaction")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify form is usable on mobile
    await page.fill('input[name="subject"]', 'Mobile Test Interaction');
    await page.selectOption('select[name="type"]', 'email');
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    
    // Test organization selection on mobile
    await page.selectOption('select[name="organization_id"]', { label: organizationName });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: contactName });
    
    await page.fill('textarea[name="description"]', 'Testing mobile interaction creation workflow');
    
    // Submit on mobile
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    
    // Test table responsiveness
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tr:has-text("Mobile Test Interaction")')).toBeVisible();
    
    // Test search on mobile
    await page.fill('input[placeholder*="Search interactions"]', 'Mobile Test');
    await page.waitForTimeout(500);
    await expect(page.locator('tr:has-text("Mobile Test Interaction")')).toBeVisible();
  });
});

// Test Suite 8: Form Validation and Error Handling
test.describe('Form Validation and Error Handling', () => {
  test('should validate required fields and show appropriate errors', async ({ page }) => {
    await authenticateUser(page);
    await navigateToInteractions(page);
    
    // Open create dialog
    await page.click('button:has-text("Add Interaction")');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors for required fields
    await expect(page.locator('text=required')).toBeVisible();
    
    // Test invalid date format
    await page.fill('input[name="subject"]', 'Test Subject');
    await page.fill('input[name="interaction_date"]', 'invalid-date');
    await page.click('button[type="submit"]');
    
    // Should prevent submission with invalid data
    await expect(page.locator('[role="dialog"]')).toBeVisible(); // Form should still be open
    
    // Test valid submission
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    await page.selectOption('select[name="type"]', 'email');
    
    // Need to select organization for required field
    const firstOrg = await page.locator('select[name="organization_id"] option').nth(1).textContent();
    if (firstOrg && firstOrg.trim()) {
      await page.selectOption('select[name="organization_id"]', { index: 1 });
      
      await page.click('button[type="submit"]');
      await expect(page.locator('.toast')).toContainText('Interaction created successfully');
    }
  });
});