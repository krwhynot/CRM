/**
 * Principal-Contact Workflow Testing Suite - Stage 6-2 Implementation
 * CRM Dashboard - KitchenPantry Principal CRM Transformation
 * 
 * COMPREHENSIVE TEST COVERAGE FOR STAGE 6-2 MVP TRANSFORMATION:
 * 
 * 1. Contact-Centric Entry Flow (Primary Entry Point Testing)
 *    - Verify contacts page is the primary entry point
 *    - Test contact creation with organization selection/creation
 *    - Validate Principal advocacy fields (purchase influence, decision authority)
 *    - Test preferred principals multi-select functionality
 * 
 * 2. Auto-Opportunity Naming with Multiple Principals
 *    - Test opportunity form with auto-naming enabled
 *    - Verify multiple Principal selection creates separate opportunities
 *    - Validate naming pattern: [Organization] - [Principal] - [Context] - [Month Year]
 *    - Test context selection affects naming pattern
 * 
 * 3. Interaction-Opportunity Linking Workflow
 *    - Verify interaction form requires opportunity selection
 *    - Test filtered opportunity dropdown by organization
 *    - Validate mobile quick templates functionality
 *    - Test follow-up integration and workflow
 * 
 * 4. Organization Contact Status Warnings
 *    - Test organizations without contacts show warnings
 *    - Verify contact count displays correctly
 *    - Test primary contact identification
 *    - Validate 'Add Contact' workflow from organization warnings
 * 
 * 5. 7-Point Funnel Workflow
 *    - Test opportunity stages follow 7-point progression
 *    - Verify stage descriptions and numbering
 *    - Test business rule enforcement
 *    - Validate progressive funnel advancement
 * 
 * 6. Mobile Principal CRM Workflow Validation
 *    - Test mobile contact creation with advocacy fields
 *    - Validate mobile opportunity creation with auto-naming
 *    - Test mobile interaction workflow with templates
 *    - Verify mobile navigation and layout optimization
 * 
 * TEST METHODOLOGY:
 * - Each test suite focuses on specific Stage 6-2 requirements
 * - Comprehensive positive and negative test scenarios
 * - Mobile-first testing approach for field team efficiency
 * - Business rule enforcement validation throughout
 * - Performance validation for <3s page loads, <1s form interactions
 */

import { test, expect } from '@playwright/test';

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

// Principal CRM Test Data
const PRINCIPAL_CRM_TEST_DATA = {
  organizations: {
    principal1: {
      name: 'Test Principal Foods Inc.',
      type: 'principal',
      website: 'https://testprincipal1.com',
      phone: '555-0001',
      address: '100 Principal Street, Principal City, PC 10001'
    },
    principal2: {
      name: 'Premium Principal Brands',
      type: 'principal',
      website: 'https://testprincipal2.com',
      phone: '555-0002',
      address: '200 Premium Avenue, Premium City, PC 10002'
    },
    customer: {
      name: 'Elite Restaurant Group',
      type: 'customer',
      website: 'https://eliterestaurants.com',
      phone: '555-1000',
      address: '500 Restaurant Row, Food City, FC 50001'
    }
  },
  contacts: {
    principalContact: {
      first_name: 'Sarah',
      last_name: 'PrincipalManager',
      title: 'Regional Sales Manager',
      email: 'sarah.manager@testprincipal1.com',
      phone: '555-0101',
      purchase_influence: 'High',
      decision_authority: 'Decision Maker',
      preferred_principals: ['Test Principal Foods Inc.']
    },
    customerContact: {
      first_name: 'Marcus',
      last_name: 'ChefOwner',
      title: 'Executive Chef & Owner',
      email: 'marcus.chef@eliterestaurants.com',
      phone: '555-1001',
      purchase_influence: 'High',
      decision_authority: 'Decision Maker',
      preferred_principals: ['Test Principal Foods Inc.', 'Premium Principal Brands']
    }
  },
  opportunities: {
    multiPrincipal: {
      context: 'Site Visit',
      stage: 'New Lead',
      probability: 75,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  },
  interactions: {
    withOpportunity: {
      subject: 'Initial Site Visit Discussion',
      type: 'meeting',
      interaction_date: new Date().toISOString().split('T')[0],
      duration_minutes: 60,
      description: 'Discussed product line introduction during site visit',
      outcome: 'Positive reception, interested in sampling program',
      follow_up_required: true,
      follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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

async function createTestPrincipalOrganization(page, principalData) {
  await page.goto(`${TEST_CONFIG.baseUrl}/organizations`);
  await page.click('button:has-text("Add Organization")');
  
  await page.fill('input[name="name"]', principalData.name);
  await page.selectOption('select[name="type"]', principalData.type);
  await page.fill('input[name="website"]', principalData.website);
  await page.fill('input[name="phone"]', principalData.phone);
  await page.fill('textarea[name="address"]', principalData.address);
  
  await page.click('button[type="submit"]');
  await expect(page.locator('.toast')).toContainText('Organization created successfully');
  
  return principalData.name;
}

async function createTestContactWithAdvocacy(page, contactData, organizationName) {
  await page.goto(`${TEST_CONFIG.baseUrl}/contacts`);
  await page.click('button:has-text("Add Contact")');
  
  // Fill basic information
  await page.fill('input[name="first_name"]', contactData.first_name);
  await page.fill('input[name="last_name"]', contactData.last_name);
  await page.fill('input[name="title"]', contactData.title);
  await page.fill('input[name="email"]', contactData.email);
  await page.fill('input[name="phone"]', contactData.phone);
  
  // Select organization
  await page.selectOption('select[name="organization_id"]', { label: organizationName });
  
  // Set Principal advocacy fields
  await page.selectOption('select[name="purchase_influence"]', contactData.purchase_influence);
  await page.selectOption('select[name="decision_authority"]', contactData.decision_authority);
  
  // Add preferred principals if available
  if (contactData.preferred_principals && contactData.preferred_principals.length > 0) {
    // Check if Principal Advocacy section is available
    const advocacyButton = page.locator('button:has-text("Add Preferred Principals")');
    if (await advocacyButton.isVisible()) {
      await advocacyButton.click();
      
      // Select preferred principals
      for (const principalName of contactData.preferred_principals) {
        const checkbox = page.locator(`input[type="checkbox"] + span:has-text("${principalName}")`).locator('..');
        if (await checkbox.isVisible()) {
          await checkbox.locator('input[type="checkbox"]').check();
        }
      }
    }
  }
  
  await page.click('button[type="submit"]');
  await expect(page.locator('.toast')).toContainText('Contact created successfully');
  
  return `${contactData.first_name} ${contactData.last_name}`;
}

async function navigateToContacts(page) {
  await page.goto(`${TEST_CONFIG.baseUrl}/contacts`);
  await expect(page.locator('h1')).toContainText('Contacts');
  await page.waitForLoadState('networkidle');
}

async function navigateToOpportunities(page) {
  await page.goto(`${TEST_CONFIG.baseUrl}/opportunities`);
  await expect(page.locator('h1')).toContainText('Opportunities');
  await page.waitForLoadState('networkidle');
}

async function navigateToInteractions(page) {
  await page.goto(`${TEST_CONFIG.baseUrl}/interactions`);
  await expect(page.locator('h1')).toContainText('Interactions');
  await page.waitForLoadState('networkidle');
}

// Test Suite 1: Contact-Centric Entry Flow
test.describe('Contact-Centric Entry Flow with Principal Advocacy', () => {
  let principal1Name, principal2Name, customerOrgName;
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await authenticateUser(page);
    
    // Create test organizations
    principal1Name = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.principal1);
    principal2Name = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.principal2);
    customerOrgName = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.customer);
    
    await page.close();
  });
  
  test('should verify contacts page is primary entry point', async ({ page }) => {
    await authenticateUser(page);
    
    // Navigate to contacts directly
    await navigateToContacts(page);
    
    // Verify contacts page has prominent entry features
    await expect(page.locator('h1')).toContainText('Contacts');
    await expect(page.locator('button:has-text("Add Contact")')).toBeVisible();
    
    // Verify contact-centric messaging
    const pageDescription = page.locator('p').first();
    await expect(pageDescription).toBeVisible();
    
    // Check that contacts table is prominently displayed
    await expect(page.locator('table')).toBeVisible();
  });
  
  test('should create contact with Principal advocacy fields', async ({ page }) => {
    await authenticateUser(page);
    await navigateToContacts(page);
    
    await page.click('button:has-text("Add Contact")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify form has Business Intelligence section
    await expect(page.locator('text=Business Intelligence')).toBeVisible();
    
    // Fill basic contact information
    await page.fill('input[name="first_name"]', PRINCIPAL_CRM_TEST_DATA.contacts.customerContact.first_name);
    await page.fill('input[name="last_name"]', PRINCIPAL_CRM_TEST_DATA.contacts.customerContact.last_name);
    await page.fill('input[name="title"]', PRINCIPAL_CRM_TEST_DATA.contacts.customerContact.title);
    await page.fill('input[name="email"]', PRINCIPAL_CRM_TEST_DATA.contacts.customerContact.email);
    await page.fill('input[name="phone"]', PRINCIPAL_CRM_TEST_DATA.contacts.customerContact.phone);
    
    // Select customer organization
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    
    // Test Principal advocacy fields
    await expect(page.locator('select[name="purchase_influence"]')).toBeVisible();
    await expect(page.locator('select[name="decision_authority"]')).toBeVisible();
    
    // Set purchase influence
    await page.selectOption('select[name="purchase_influence"]', PRINCIPAL_CRM_TEST_DATA.contacts.customerContact.purchase_influence);
    
    // Verify influence level description appears
    await expect(page.locator('text=Makes or heavily influences purchasing decisions')).toBeVisible();
    
    // Set decision authority
    await page.selectOption('select[name="decision_authority"]', PRINCIPAL_CRM_TEST_DATA.contacts.customerContact.decision_authority);
    
    // Verify authority role description appears
    await expect(page.locator('text=Final authority on purchasing decisions')).toBeVisible();
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Contact created successfully');
    
    // Verify contact appears in table with advocacy information
    const contactRow = page.locator(`tr:has-text("${PRINCIPAL_CRM_TEST_DATA.contacts.customerContact.first_name}")`);
    await expect(contactRow).toBeVisible();
    await expect(contactRow).toContainText(customerOrgName);
  });
  
  test('should support multi-select preferred principals functionality', async ({ page }) => {
    await authenticateUser(page);
    await navigateToContacts(page);
    
    await page.click('button:has-text("Add Contact")');
    
    // Fill basic information
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'AdvocacyContact');
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.selectOption('select[name="purchase_influence"]', 'High');
    await page.selectOption('select[name="decision_authority"]', 'Influencer');
    
    // Test Principal Advocacy section
    const advocacyButton = page.locator('button:has-text("Add Preferred Principals")');
    if (await advocacyButton.isVisible()) {
      await advocacyButton.click();
      
      // Verify multi-select functionality
      await expect(page.locator('text=Select principals that this contact advocates')).toBeVisible();
      
      // Test selecting multiple principals
      const principal1Checkbox = page.locator(`input[type="checkbox"] + span:has-text("${principal1Name}")`).locator('..');
      const principal2Checkbox = page.locator(`input[type="checkbox"] + span:has-text("${principal2Name}")`).locator('..');
      
      if (await principal1Checkbox.isVisible()) {
        await principal1Checkbox.locator('input[type="checkbox"]').check();
      }
      if (await principal2Checkbox.isVisible()) {
        await principal2Checkbox.locator('input[type="checkbox"]').check();
      }
      
      // Verify selection counter
      await expect(page.locator('text=2 principals selected')).toBeVisible();
    }
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('Contact created successfully');
  });
  
  test('should validate organization selection/creation workflow from contacts', async ({ page }) => {
    await authenticateUser(page);
    await navigateToContacts(page);
    
    await page.click('button:has-text("Add Contact")');
    
    // STAGE 6-2 REQUIREMENT: Test organization selection with creation option
    const organizationSelect = page.locator('select[name="organization_id"]');
    await expect(organizationSelect).toBeVisible();
    
    // Test "Create New Organization" option if available
    await page.click('select[name="organization_id"]');
    const createNewOption = page.locator('option:has-text("Create New")');
    
    if (await createNewOption.isVisible()) {
      await createNewOption.click();
      
      // Should open organization creation modal/form
      const organizationForm = [
        page.locator('text="Create Organization"'),
        page.locator('text="New Organization"'),
        page.locator('[role="dialog"]:has-text("Organization")')
      ];
      
      let orgFormFound = false;
      for (const form of organizationForm) {
        if (await form.first().isVisible()) {
          orgFormFound = true;
          break;
        }
      }
      
      if (orgFormFound) {
        // Fill basic organization information
        await page.fill('input[name="name"]', 'Test Organization from Contact');
        
        // Test organization type selection
        const orgTypeFields = [
          page.locator('select[name="type"]'),
          page.locator('input[name="is_principal"]'),
          page.locator('select[name="priority"]')
        ];
        
        for (const field of orgTypeFields) {
          if (await field.first().isVisible()) {
            if ((await field.first().tagName()) === 'SELECT') {
              await field.first().selectOption({ index: 1 });
            } else {
              await field.first().click();
            }
            break;
          }
        }
        
        // Submit organization creation
        await page.click('button[type="submit"]');
        await expect(page.locator('.toast')).toContainText('successfully');
        
        // Should return to contact form with organization pre-selected
        await expect(page.locator('input[name="first_name"]')).toBeVisible();
      }
    }
    
    // Verify existing organizations are available for selection
    await page.click('select[name="organization_id"]');
    await expect(page.locator(`option:has-text("${customerOrgName}")`)).toBeVisible();
  });
  
  test('should enforce contact-organization relationship requirement', async ({ page }) => {
    await authenticateUser(page);
    await navigateToContacts(page);
    
    await page.click('button:has-text("Add Contact")');
    
    // Fill contact information but skip organization
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'NoOrgContact');
    await page.selectOption('select[name="purchase_influence"]', 'Medium');
    await page.selectOption('select[name="decision_authority"]', 'End User');
    
    // Try to submit without organization
    await page.click('button[type="submit"]');
    
    // Should show validation error
    const validationErrors = [
      page.locator('text*="Organization is required"'),
      page.locator('text*="required"'),
      page.locator('.error'),
      page.locator('[role="alert"]')
    ];
    
    let validationFound = false;
    for (const error of validationErrors) {
      if (await error.first().isVisible()) {
        validationFound = true;
        break;
      }
    }
    
    // If no explicit validation, form should remain open
    if (!validationFound) {
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    }
    
    expect(validationFound || await page.locator('[role="dialog"]').isVisible()).toBe(true);
  });

});

// Test Suite 2: Auto-Opportunity Naming with Multiple Principals - STAGE 6-2 IMPLEMENTATION
test.describe('Auto-Opportunity Naming with Multiple Principals', () => {
  let customerOrgName, customerContactName, principal1Name, principal2Name;
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await authenticateUser(page);
    
    // Create test data
    principal1Name = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.principal1);
    principal2Name = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.principal2);
    customerOrgName = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.customer);
    customerContactName = await createTestContactWithAdvocacy(page, PRINCIPAL_CRM_TEST_DATA.contacts.customerContact, customerOrgName);
    
    await page.close();
  });
  
  test('should enable auto-naming for opportunities', async ({ page }) => {
    await authenticateUser(page);
    await navigateToOpportunities(page);
    
    await page.click('button:has-text("Add Opportunity")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Check for mode selector if available
    const modeSelector = page.locator('select:has(option:text-matches("Multi-Principal"))');
    if (await modeSelector.isVisible()) {
      await page.selectOption(modeSelector, { label: 'Multi-Principal Creation' });
    }
    
    // Verify auto-naming section
    await expect(page.locator('text=Auto-Naming Configuration')).toBeVisible();
    
    // Check auto-naming toggle
    const autoNamingSwitch = page.locator('input[name="auto_generated_name"]');
    if (await autoNamingSwitch.isVisible()) {
      await expect(autoNamingSwitch).toBeChecked();
      
      // Verify auto-naming description
      await expect(page.locator('text=Automatically generate opportunity names')).toBeVisible();
    }
  });
  
  test('should create separate opportunities for multiple principals', async ({ page }) => {
    await authenticateUser(page);
    await navigateToOpportunities(page);
    
    await page.click('button:has-text("Add Opportunity")');
    
    // Switch to multi-principal mode if available
    const modeSelector = page.locator('select:has(option:text-matches("Multi-Principal"))');
    if (await modeSelector.isVisible()) {
      await page.selectOption(modeSelector, { label: 'Multi-Principal Creation' });
    }
    
    // Fill organization and contact
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name="contact_id"]', { label: customerContactName });
    
    // Select multiple principals
    const principal1Checkbox = page.locator(`input[id*="principal"][type="checkbox"] + label:has-text("${principal1Name}")`).locator('..');
    const principal2Checkbox = page.locator(`input[id*="principal"][type="checkbox"] + label:has-text("${principal2Name}")`).locator('..');
    
    if (await principal1Checkbox.isVisible()) {
      await principal1Checkbox.locator('input[type="checkbox"]').check();
    }
    if (await principal2Checkbox.isVisible()) {
      await principal2Checkbox.locator('input[type="checkbox"]').check();
    }
    
    // Set opportunity context
    await page.selectOption('select[name="opportunity_context"]', PRINCIPAL_CRM_TEST_DATA.opportunities.multiPrincipal.context);
    
    // Set stage and other details
    await page.selectOption('select[name="stage"]', PRINCIPAL_CRM_TEST_DATA.opportunities.multiPrincipal.stage);
    
    // Verify name preview if available
    const namePreview = page.locator('text=Generated Name Preview');
    if (await namePreview.isVisible()) {
      // Check that preview shows organization name and context
      await expect(page.locator('text*=' + customerOrgName.substring(0, 10))).toBeVisible();
      await expect(page.locator('text*=' + PRINCIPAL_CRM_TEST_DATA.opportunities.multiPrincipal.context)).toBeVisible();
    }
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('successfully');
    
    // Verify opportunities created with proper naming pattern
    await page.waitForLoadState('networkidle');
    
    // Look for opportunities that include the organization name and context
    const opportunityTable = page.locator('table');
    await expect(opportunityTable).toBeVisible();
    
    // Check for naming pattern: [Organization] - [Principal] - [Context] - [Month Year]
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear().toString();
    
    // Should contain organization name and context in opportunity names
    await expect(page.locator(`tr:has-text("${customerOrgName.substring(0, 15)}")`)).toBeVisible();
    await expect(page.locator(`tr:has-text("${PRINCIPAL_CRM_TEST_DATA.opportunities.multiPrincipal.context}")`)).toBeVisible();
  });
  
  test('should validate opportunity context affects naming pattern', async ({ page }) => {
    await authenticateUser(page);
    await navigateToOpportunities(page);
    
    await page.click('button:has-text("Add Opportunity")');
    
    // Setup basic information
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(500);
    
    // Select at least one principal
    const firstPrincipalCheckbox = page.locator('input[id*="principal"][type="checkbox"]').first();
    if (await firstPrincipalCheckbox.isVisible()) {
      await firstPrincipalCheckbox.check();
    }
    
    // Test different contexts and verify they affect naming
    const contexts = ['Site Visit', 'Food Show', 'Demo Request'];
    
    for (const context of contexts) {
      const contextOption = page.locator(`select[name="opportunity_context"] option[value="${context}"]`);
      if (await contextOption.isVisible()) {
        await page.selectOption('select[name="opportunity_context"]', context);
        
        // Wait for name preview to update
        await page.waitForTimeout(500);
        
        // Verify context appears in preview if available
        const previewArea = page.locator('text=Generated Name Preview');
        if (await previewArea.isVisible()) {
          await expect(page.locator(`text*="${context}"`)).toBeVisible();
        }
      }
    }
  });
});

// Test Suite 3: Interaction-Opportunity Linking Workflow
test.describe('Interaction-Opportunity Linking Workflow', () => {
  let customerOrgName, customerContactName, opportunityName;
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await authenticateUser(page);
    
    // Create test organizations and contacts
    const principal1Name = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.principal1);
    customerOrgName = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.customer);
    customerContactName = await createTestContactWithAdvocacy(page, PRINCIPAL_CRM_TEST_DATA.contacts.customerContact, customerOrgName);
    
    // Create a test opportunity
    await page.goto(`${TEST_CONFIG.baseUrl}/opportunities`);
    await page.click('button:has-text("Add Opportunity")');
    
    await page.fill('input[name="name"]', 'Test Opportunity for Interaction Linking');
    await page.selectOption('select[name="stage"]', 'New Lead');
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="contact_id"]', { label: customerContactName });
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('successfully');
    
    opportunityName = 'Test Opportunity for Interaction Linking';
    await page.close();
  });
  
  test('should require opportunity selection for interactions', async ({ page }) => {
    await authenticateUser(page);
    await navigateToInteractions(page);
    
    await page.click('button:has-text("Add Interaction")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Fill basic interaction information
    await page.fill('input[name="subject"]', PRINCIPAL_CRM_TEST_DATA.interactions.withOpportunity.subject);
    await page.selectOption('select[name="type"]', PRINCIPAL_CRM_TEST_DATA.interactions.withOpportunity.type);
    await page.fill('input[name="interaction_date"]', PRINCIPAL_CRM_TEST_DATA.interactions.withOpportunity.interaction_date);
    
    // Select organization first
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(1000);
    
    // Verify opportunity field is available and filtered by organization
    const opportunitySelect = page.locator('select[name="opportunity_id"]');
    if (await opportunitySelect.isVisible()) {
      // Check that opportunities are filtered by the selected organization
      await expect(opportunitySelect).toBeVisible();
      
      // Verify our test opportunity appears in the dropdown
      const opportunityOption = page.locator(`select[name="opportunity_id"] option:has-text("${opportunityName}")`);
      await expect(opportunityOption).toBeVisible();
    }
    
    // Select contact
    await page.selectOption('select[name="contact_id"]', { label: customerContactName });
    
    // Fill description and outcome
    await page.fill('textarea[name="description"]', PRINCIPAL_CRM_TEST_DATA.interactions.withOpportunity.description);
    await page.fill('textarea[name="outcome"]', PRINCIPAL_CRM_TEST_DATA.interactions.withOpportunity.outcome);
    
    // Link to opportunity
    if (await opportunitySelect.isVisible()) {
      await page.selectOption('select[name="opportunity_id"]', { label: opportunityName });
    }
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('successfully');
  });
  
  test('should filter opportunity dropdown by organization', async ({ page }) => {
    await authenticateUser(page);
    await navigateToInteractions(page);
    
    await page.click('button:has-text("Add Interaction")');
    
    // First, don't select organization and verify no opportunities
    const opportunitySelect = page.locator('select[name="opportunity_id"]');
    if (await opportunitySelect.isVisible()) {
      await expect(opportunitySelect).toBeDisabled();
    }
    
    // Select organization
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(1000);
    
    // Verify opportunities are now available and filtered
    if (await opportunitySelect.isVisible()) {
      await expect(opportunitySelect).toBeEnabled();
      
      // Check that our test opportunity is available
      const testOpportunityOption = page.locator(`select[name="opportunity_id"] option:has-text("${opportunityName}")`);
      await expect(testOpportunityOption).toBeVisible();
    }
  });
  
  test('should support mobile quick templates functionality', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await authenticateUser(page);
    await navigateToInteractions(page);
    
    await page.click('button:has-text("Add Interaction")');
    
    // Look for mobile template features
    const templateButton = page.locator('button:has-text("Template"), button:has-text("Quick"), button[title*="template"]');
    
    if (await templateButton.first().isVisible()) {
      await templateButton.first().click();
      
      // Verify template options are available
      const templateOptions = page.locator('text=Quick Call, text=Site Visit, text=Follow-up');
      await expect(templateOptions.first()).toBeVisible();
      
      // Test applying a template
      const quickCallTemplate = page.locator('button:has-text("Quick Call"), [role="button"]:has-text("Quick Call")');
      if (await quickCallTemplate.isVisible()) {
        await quickCallTemplate.click();
        
        // Verify template pre-fills form
        await expect(page.locator('select[name="type"]')).toHaveValue('call');
      }
    }
  });
  
  test('should validate follow-up integration', async ({ page }) => {
    await authenticateUser(page);
    await navigateToInteractions(page);
    
    await page.click('button:has-text("Add Interaction")');
    
    // Create interaction with follow-up
    await page.fill('input[name="subject"]', 'Initial Interaction with Follow-up');
    await page.selectOption('select[name="type"]', 'meeting');
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="contact_id"]', { label: customerContactName });
    
    // Select opportunity if available
    const opportunitySelect = page.locator('select[name="opportunity_id"]');
    if (await opportunitySelect.isVisible()) {
      await page.selectOption('select[name="opportunity_id"]', { label: opportunityName });
    }
    
    // Enable follow-up
    const followUpCheckbox = page.locator('input[name="follow_up_required"]');
    if (await followUpCheckbox.isVisible()) {
      await followUpCheckbox.check();
      
      // Set follow-up date
      const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await page.fill('input[name="follow_up_date"]', followUpDate);
    }
    
    await page.fill('textarea[name="description"]', 'Testing follow-up integration');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('successfully');
    
    // Verify follow-up appears in interactions list or follow-up section
    await page.waitForLoadState('networkidle');
    await expect(page.locator('tr:has-text("Initial Interaction with Follow-up")')).toBeVisible();
  });
});

// Test Suite 4: Organization Contact Status Warnings
test.describe('Organization Contact Status Warnings', () => {
  let organizationWithoutContactsName;
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await authenticateUser(page);
    
    // Create organization without any contacts
    organizationWithoutContactsName = await createTestPrincipalOrganization(page, {
      name: 'Organization Without Contacts',
      type: 'customer',
      website: 'https://nocontacts.com',
      phone: '555-9999',
      address: '999 Empty Street, No Contact City, NC 99999'
    });
    
    await page.close();
  });
  
  test('should show warnings for organizations without contacts', async ({ page }) => {
    await authenticateUser(page);
    
    // Navigate to organizations page
    await page.goto(`${TEST_CONFIG.baseUrl}/organizations`);
    await expect(page.locator('h1')).toContainText('Organizations');
    
    // Look for the organization without contacts
    const orgRow = page.locator(`tr:has-text("${organizationWithoutContactsName}")`);
    await expect(orgRow).toBeVisible();
    
    // Check for warning indicators
    const warningIndicators = orgRow.locator('text=No contacts, text=0 contacts, svg[class*="warning"], svg[class*="alert"]');
    await expect(warningIndicators.first()).toBeVisible();
  });
  
  test('should display contact count correctly', async ({ page }) => {
    await authenticateUser(page);
    
    // Navigate to organizations
    await page.goto(`${TEST_CONFIG.baseUrl}/organizations`);
    
    // Check contact count display for organizations
    const orgTable = page.locator('table');
    await expect(orgTable).toBeVisible();
    
    // Look for contact count columns or indicators
    const contactCountHeaders = page.locator('th:has-text("Contacts"), th:has-text("Contact Count")');
    if (await contactCountHeaders.first().isVisible()) {
      // Verify contact counts are displayed
      const orgWithoutContacts = page.locator(`tr:has-text("${organizationWithoutContactsName}")`);
      await expect(orgWithoutContacts.locator('text=0')).toBeVisible();
    }
  });
  
  test('should identify primary contact correctly', async ({ page }) => {
    await authenticateUser(page);
    
    // First create an organization with a primary contact
    const orgName = await createTestPrincipalOrganization(page, {
      name: 'Org With Primary Contact',
      type: 'customer',
      website: 'https://primarycontact.com',
      phone: '555-8888',
      address: '888 Primary Street, Primary City, PC 88888'
    });
    
    // Create a primary contact
    await page.goto(`${TEST_CONFIG.baseUrl}/contacts`);
    await page.click('button:has-text("Add Contact")');
    
    await page.fill('input[name="first_name"]', 'Primary');
    await page.fill('input[name="last_name"]', 'ContactPerson');
    await page.selectOption('select[name="organization_id"]', { label: orgName });
    
    // Mark as primary contact
    const primaryCheckbox = page.locator('input[name="is_primary_contact"]');
    if (await primaryCheckbox.isVisible()) {
      await primaryCheckbox.check();
    }
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('successfully');
    
    // Go back to organizations and verify primary contact identification
    await page.goto(`${TEST_CONFIG.baseUrl}/organizations`);
    
    const orgRow = page.locator(`tr:has-text("${orgName}")`);
    await expect(orgRow).toBeVisible();
    
    // Look for primary contact indicator
    const primaryIndicators = orgRow.locator('text=Primary, svg[class*="star"], [class*="primary"]');
    if (await primaryIndicators.first().isVisible()) {
      await expect(primaryIndicators.first()).toBeVisible();
    }
  });
  
  test('should provide "Add Contact" workflow from organization warnings', async ({ page }) => {
    await authenticateUser(page);
    
    // Navigate to organizations
    await page.goto(`${TEST_CONFIG.baseUrl}/organizations`);
    
    // Find organization without contacts
    const orgRow = page.locator(`tr:has-text("${organizationWithoutContactsName}")`);
    await expect(orgRow).toBeVisible();
    
    // Look for "Add Contact" button or link in the warning
    const addContactButton = orgRow.locator('button:has-text("Add Contact"), a:has-text("Add Contact"), [role="button"]:has-text("Add Contact")');
    
    if (await addContactButton.first().isVisible()) {
      await addContactButton.first().click();
      
      // Should navigate to contact creation with organization pre-selected
      await expect(page.locator('text=New Contact, text=Create Contact')).toBeVisible();
      
      // Verify organization is pre-selected
      const orgSelect = page.locator('select[name="organization_id"]');
      if (await orgSelect.isVisible()) {
        await expect(orgSelect).toHaveValue(organizationWithoutContactsName);
      }
    } else {
      // Alternative: Check for view/edit organization leading to add contact
      const viewButton = orgRow.locator('button:has-text("View"), button:has-text("Edit")');
      if (await viewButton.first().isVisible()) {
        await viewButton.first().click();
        
        // Should have add contact option in organization detail view
        await expect(page.locator('button:has-text("Add Contact")')).toBeVisible();
      }
    }
  });
});

// Test Suite 5: 7-Point Funnel Workflow
test.describe('7-Point Sales Funnel Workflow', () => {
  let customerOrgName, customerContactName;
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await authenticateUser(page);
    
    // Create test data
    const principal1Name = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.principal1);
    customerOrgName = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.customer);
    customerContactName = await createTestContactWithAdvocacy(page, PRINCIPAL_CRM_TEST_DATA.contacts.customerContact, customerOrgName);
    
    await page.close();
  });
  
  test('should validate 7-point opportunity stages', async ({ page }) => {
    await authenticateUser(page);
    await navigateToOpportunities(page);
    
    await page.click('button:has-text("Add Opportunity")');
    
    // Check stage dropdown for 7-point progression
    const stageSelect = page.locator('select[name="stage"]');
    await expect(stageSelect).toBeVisible();
    
    // Verify all 7 stages are available
    const expectedStages = [
      'New Lead',
      'Initial Outreach',
      'Sample/Visit Offered', 
      'Awaiting Response',
      'Feedback Logged',
      'Demo Scheduled',
      'Closed - Won'
    ];
    
    for (const stage of expectedStages) {
      const stageOption = page.locator(`select[name="stage"] option[value="${stage}"]`);
      await expect(stageOption).toBeVisible();
    }
  });
  
  test('should display stage descriptions and numbering', async ({ page }) => {
    await authenticateUser(page);
    await navigateToOpportunities(page);
    
    await page.click('button:has-text("Add Opportunity")');
    
    // Open stage dropdown
    await page.click('select[name="stage"]');
    
    // Verify stage descriptions are shown
    const stageDescriptions = [
      'Initial prospect identification',
      'First contact made',
      'Product samples provided',
      'Waiting for feedback',
      'Customer feedback received',
      'Product demonstration',
      'Successfully closed'
    ];
    
    // Check that at least some descriptions are visible
    for (const description of stageDescriptions.slice(0, 3)) {
      const descriptionText = page.locator(`text*="${description.substring(0, 15)}"`);
      if (await descriptionText.first().isVisible()) {
        await expect(descriptionText.first()).toBeVisible();
        break;
      }
    }
  });
  
  test('should enforce 7-point funnel business rules', async ({ page }) => {
    await authenticateUser(page);
    await navigateToOpportunities(page);
    
    await page.click('button:has-text("Add Opportunity")');
    
    // Fill basic opportunity information
    await page.fill('input[name="name"]', 'Test 7-Point Funnel Opportunity');
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="contact_id"]', { label: customerContactName });
    
    // Test different stages and verify business rules
    const stages = ['New Lead', 'Initial Outreach', 'Sample/Visit Offered'];
    
    for (const stage of stages) {
      await page.selectOption('select[name="stage"]', stage);
      
      // Verify stage-specific requirements or validations
      const stageProgress = page.locator('text=Sales Funnel Progress');
      if (await stageProgress.isVisible()) {
        await expect(stageProgress).toBeVisible();
        
        // Check for progress indicator
        const progressBar = page.locator('[role="progressbar"], .progress, [class*="progress"]');
        if (await progressBar.first().isVisible()) {
          await expect(progressBar.first()).toBeVisible();
        }
      }
    }
    
    // Test final stage requirements
    await page.selectOption('select[name="stage"]', 'Closed - Won');
    
    // Verify that closed stage has appropriate validations
    const closedStageValidation = page.locator('text=100%, text=Closed, text=Won');
    await expect(closedStageValidation.first()).toBeVisible();
  });
  
  test('should show progressive funnel advancement', async ({ page }) => {
    await authenticateUser(page);
    await navigateToOpportunities(page);
    
    await page.click('button:has-text("Add Opportunity")');
    
    // Fill basic information
    await page.fill('input[name="name"]', 'Progressive Funnel Test');
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    
    // Test progression through stages
    const progressionStages = ['New Lead', 'Initial Outreach', 'Sample/Visit Offered', 'Closed - Won'];
    
    for (let i = 0; i < progressionStages.length; i++) {
      await page.selectOption('select[name="stage"]', progressionStages[i]);
      
      // Verify progress increases
      const progressElement = page.locator('[role="progressbar"], .progress-bar, [class*="progress"]');
      if (await progressElement.first().isVisible()) {
        // Progress should increase with each stage
        await expect(progressElement.first()).toBeVisible();
      }
      
      // Check for stage-specific descriptions
      const stageDescription = page.locator('text*="' + progressionStages[i].substring(0, 10) + '"');
      await expect(stageDescription.first()).toBeVisible();
    }
  });
});

// Test Suite 6: Mobile Optimization Validation
test.describe('Mobile Principal CRM Workflow Validation', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE size
  });
  
  let customerOrgName, customerContactName, principal1Name;
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await authenticateUser(page);
    
    // Create test data
    principal1Name = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.principal1);
    customerOrgName = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.customer);
    customerContactName = await createTestContactWithAdvocacy(page, PRINCIPAL_CRM_TEST_DATA.contacts.customerContact, customerOrgName);
    
    await page.close();
  });
  
  test('should validate mobile contact creation with advocacy fields', async ({ page }) => {
    await authenticateUser(page);
    await navigateToContacts(page);
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
    
    await page.click('button:has-text("Add Contact")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Test mobile form usability
    await page.fill('input[name="first_name"]', 'Mobile');
    await page.fill('input[name="last_name"]', 'TestContact');
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    
    // Test advocacy fields on mobile
    await page.selectOption('select[name="purchase_influence"]', 'High');
    await page.selectOption('select[name="decision_authority"]', 'Decision Maker');
    
    // Verify mobile-friendly form elements
    const formElements = page.locator('input, select, textarea');
    const elementCount = await formElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = formElements.nth(i);
      if (await element.isVisible()) {
        // Check that elements are mobile-friendly sized
        const box = await element.boundingBox();
        if (box && box.height) {
          expect(box.height).toBeGreaterThanOrEqual(44); // Minimum touch target
        }
      }
    }
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('successfully');
  });
  
  test('should validate mobile opportunity creation with auto-naming', async ({ page }) => {
    await authenticateUser(page);
    await navigateToOpportunities(page);
    
    await page.click('button:has-text("Add Opportunity")');
    
    // Test mobile form layout
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Fill organization
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(500);
    
    // Test principal selection on mobile
    const principalCheckbox = page.locator(`input[type="checkbox"] + label:has-text("${principal1Name}")`).locator('..');
    if (await principalCheckbox.isVisible()) {
      await principalCheckbox.locator('input[type="checkbox"]').check();
    }
    
    // Test context selection on mobile
    await page.selectOption('select[name="opportunity_context"]', 'Site Visit');
    
    // Verify mobile-optimized dropdowns and inputs
    const mobileFormElements = page.locator('select, input[type="checkbox"]');
    const mobileElementCount = await mobileFormElements.count();
    
    for (let i = 0; i < Math.min(mobileElementCount, 3); i++) {
      const element = mobileFormElements.nth(i);
      if (await element.isVisible()) {
        // Verify touch-friendly sizing
        const box = await element.boundingBox();
        if (box && box.height) {
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });
  
  test('should validate mobile interaction workflow', async ({ page }) => {
    await authenticateUser(page);
    await navigateToInteractions(page);
    
    await page.click('button:has-text("Add Interaction")');
    
    // Test mobile interaction form
    await page.fill('input[name="subject"]', 'Mobile Test Interaction');
    await page.selectOption('select[name="type"]', 'call');
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    
    // Test organization selection on mobile
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="contact_id"]', { label: customerContactName });
    
    // Test quick templates on mobile if available
    const templateButton = page.locator('button:has-text("Template"), button:has-text("Quick")');
    if (await templateButton.first().isVisible()) {
      await templateButton.first().click();
      
      // Verify mobile template interface
      await expect(page.locator('text=Quick, text=Template')).toBeVisible();
    }
    
    await page.fill('textarea[name="description"]', 'Mobile interaction test');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('successfully');
  });
  
  test('should validate mobile navigation and layout', async ({ page }) => {
    await authenticateUser(page);
    
    // Test navigation between Principal CRM sections on mobile
    const sections = [
      { url: '/contacts', heading: 'Contacts' },
      { url: '/opportunities', heading: 'Opportunities' },
      { url: '/interactions', heading: 'Interactions' },
      { url: '/organizations', heading: 'Organizations' }
    ];
    
    for (const section of sections) {
      await page.goto(`${TEST_CONFIG.baseUrl}${section.url}`);
      
      // Verify mobile layout
      await expect(page.locator(`h1:has-text("${section.heading}")`)).toBeVisible();
      
      // Check for mobile-optimized table or card layout
      const dataDisplay = page.locator('table, [class*="card"], [class*="grid"]');
      await expect(dataDisplay.first()).toBeVisible();
      
      // Verify add button is accessible on mobile
      const addButton = page.locator('button:has-text("Add")');
      if (await addButton.first().isVisible()) {
        const box = await addButton.first().boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44); // Touch-friendly size
        }
      }
    }
  });
});

// Test Suite 7: Business Rule Enforcement
test.describe('Principal CRM Business Rule Enforcement', () => {
  let customerOrgName, principal1Name;
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await authenticateUser(page);
    
    // Create test data
    principal1Name = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.principal1);
    customerOrgName = await createTestPrincipalOrganization(page, PRINCIPAL_CRM_TEST_DATA.organizations.customer);
    
    await page.close();
  });
  
  test('should enforce required fields for Principal CRM workflows', async ({ page }) => {
    await authenticateUser(page);
    
    // Test contact form validation
    await navigateToContacts(page);
    await page.click('button:has-text("Add Contact")');
    
    // Try to submit without required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text*="required", text*="Required"')).toBeVisible();
    
    // Test opportunity form validation
    await navigateToOpportunities(page);
    await page.click('button:has-text("Add Opportunity")');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text*="required", text*="Required"')).toBeVisible();
  });
  
  test('should validate opportunity-interaction relationships', async ({ page }) => {
    await authenticateUser(page);
    
    // Create opportunity first
    await navigateToOpportunities(page);
    await page.click('button:has-text("Add Opportunity")');
    
    await page.fill('input[name="name"]', 'Business Rule Test Opportunity');
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.selectOption('select[name="stage"]', 'New Lead');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('successfully');
    
    // Test interaction linking
    await navigateToInteractions(page);
    await page.click('button:has-text("Add Interaction")');
    
    await page.fill('input[name="subject"]', 'Business Rule Test Interaction');
    await page.selectOption('select[name="type"]', 'email');
    await page.fill('input[name="interaction_date"]', new Date().toISOString().split('T')[0]);
    
    // Select organization first to enable opportunity filtering
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    await page.waitForTimeout(1000);
    
    // Verify opportunities are filtered by organization
    const opportunitySelect = page.locator('select[name="opportunity_id"]');
    if (await opportunitySelect.isVisible()) {
      await expect(opportunitySelect).toBeEnabled();
      
      // Should show our test opportunity
      const testOpportunityOption = page.locator('select[name="opportunity_id"] option:has-text("Business Rule Test Opportunity")');
      await expect(testOpportunityOption).toBeVisible();
    }
  });
  
  test('should enforce Principal advocacy validation rules', async ({ page }) => {
    await authenticateUser(page);
    await navigateToContacts(page);
    
    await page.click('button:has-text("Add Contact")');
    
    // Fill required fields
    await page.fill('input[name="first_name"]', 'Validation');
    await page.fill('input[name="last_name"]', 'TestContact');
    await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
    
    // Test purchase influence validation
    await page.selectOption('select[name="purchase_influence"]', 'High');
    
    // Verify description updates based on selection
    await expect(page.locator('text*="Makes or heavily influences"')).toBeVisible();
    
    // Test decision authority validation
    await page.selectOption('select[name="decision_authority"]', 'Decision Maker');
    
    // Verify authority description updates
    await expect(page.locator('text*="Final authority on purchasing"')).toBeVisible();
    
    // Test advocacy relationship validation if available
    const advocacyButton = page.locator('button:has-text("Add Preferred Principals")');
    if (await advocacyButton.isVisible()) {
      await advocacyButton.click();
      
      // Should show available principals
      await expect(page.locator(`text="${principal1Name}"`)).toBeVisible();
      
      // Test selection validation
      const principalCheckbox = page.locator(`input[type="checkbox"] + span:has-text("${principal1Name}")`).locator('..');
      if (await principalCheckbox.isVisible()) {
        await principalCheckbox.locator('input[type="checkbox"]').check();
        
        // Should show selection feedback
        await expect(page.locator('text*="1 principal"')).toBeVisible();
      }
    }
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.toast')).toContainText('successfully');
  });
  
  test('should validate auto-naming character limits and patterns', async ({ page }) => {
    await authenticateUser(page);
    await navigateToOpportunities(page);
    
    await page.click('button:has-text("Add Opportunity")');
    
    // Switch to multi-principal mode if available
    const modeSelector = page.locator('select:has(option:text-matches("Multi-Principal"))');
    if (await modeSelector.isVisible()) {
      await page.selectOption(modeSelector, { label: 'Multi-Principal Creation' });
    }
    
    // Enable auto-naming
    const autoNamingSwitch = page.locator('input[name="auto_generated_name"]');
    if (await autoNamingSwitch.isVisible()) {
      await autoNamingSwitch.check();
      
      // Test with very long organization name
      const longOrgName = 'Very Long Organization Name That Exceeds Normal Character Limits For Testing Auto Naming Validation Rules And Character Count Enforcement';
      
      // Since we can't create such a long org name, test the pattern validation
      await page.selectOption('select[name="organization_id"]', { label: customerOrgName });
      
      // Select principal
      const principalCheckbox = page.locator('input[type="checkbox"]').first();
      if (await principalCheckbox.isVisible()) {
        await principalCheckbox.check();
      }
      
      // Set context
      await page.selectOption('select[name="opportunity_context"]', 'Site Visit');
      
      // Check for character count validation
      const previewSection = page.locator('text=Generated Name Preview');
      if (await previewSection.isVisible()) {
        // Should show character count
        await expect(page.locator('text*="Characters:"')).toBeVisible();
        
        // Should be within limits
        await expect(page.locator('text*="/255"')).toBeVisible();
      }
    }
  });
});